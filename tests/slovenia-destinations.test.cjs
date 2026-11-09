const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
const locales=['es','en','fr','de','it','pt','ca'];
function loader(globals={}) {
  const cache=new Map();
  function load(file){
    file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);
    const exports={};cache.set(file,exports);
    const compiled=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
    vm.runInNewContext(compiled,{exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{
      const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);
      const next=[base+'.ts',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));
      if(!next)throw Error(id);return load(next);
    }},{filename:file});return exports;
  }return load;
}
const load=loader(),catalog=load('lib/destinations/index.ts'),profiles=catalog.getDestinationsByCountry('SI');
const airports=load('lib/travelpayouts/slovenia-airports.ts'),selection=load('lib/destinations/selection.ts');
const presentation=load('lib/destinations/presentation.ts'),localization=load('lib/destinations/localization.ts');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

test('Slovenia preserves every one of the 224 earlier profiles and all 16 original homepage cards',()=>{
  const baseline=require('./fixtures/pre-slovenia-catalog.json');
  assert.equal(baseline.profiles.length,224);
  for(const p of baseline.profiles)assert.equal(digest(catalog.getDestinationById(p.id)),p.sha256,p.id);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),baseline.featuredSha256);
  assert.equal(catalog.destinationProfiles.length,251);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,251);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,251);
});
test('the complete official international-airport set is associated with three distinct served destinations',()=>{
  assert.equal(profiles.length,3);
  assert.deepEqual(Array.from(profiles,p=>p.airports[0].iataCode),['LJU','MBX','POW']);
  for(const p of profiles){
    assert.equal(catalog.findDestinationProfile({iataCode:p.iataCodes[0]}),p);
    assert.equal(p.airports.length,1);assert.equal(p.metropolitanCodes.length,0);
    assert.deepEqual(Array.from(p.iataCodes),[p.airports[0].iataCode]);
    assert.equal(catalog.getDestinationBySlug(p.slug),p);
    for(const alias of p.aliases)assert.equal(catalog.findDestinationProfile({name:alias}),p,alias);
    const a=airports.sloveniaAirports.find(a=>a.code===p.iataCodes[0]);
    for(const type of ['city','airport']){
      const selected={type,name:type==='city'?p.name:a.name,code:a.code,country:'Eslovenia',cityName:a.city_name,cityCode:a.city_code};
      assert.equal(selection.destinationFromPlaceSelection(selected),p);
      assert.equal(selection.destinationFromPlaceSelection({...selected,country:'Italia'}),undefined);
    }
  }
});
for(const locale of locales)test(locale+': complete localized copy, four recommendations and airport-specific access caveats',()=>{
  for(const p of profiles){
    const copy=localization.getDestinationText(p,locale);
    for(const field of ['name','description','recommendedStay','seasonalityNote'])assert.ok(copy[field],p.id+':'+field);
    assert.equal(copy.recommendations.length,4);assert.equal(new Set(copy.recommendations).size,4);
    assert.equal(catalog.findDestinationProfile({name:copy.name}),p);
    assert.equal(airports.sloveniaAirportTown(p.iataCodes[0],locale),copy.name);
    assert.ok(copy.seasonalityNote.includes(p.iataCodes[0]));
    if(p.id==='si-maribor')assert.ok(copy.seasonalityNote.includes('Orehova vas'));
    if(p.id==='si-portoroz')assert.ok(copy.seasonalityNote.includes('Sečovlje')&&copy.seasonalityNote.includes('TRS'));
    for(const field of ['bestMonths','lowSeasonMonths','highSeasonMonths'])assert.ok(p[field].length&&p[field].every(m=>Number.isInteger(m)&&m>=1&&m<=12));
  }
});
test('Slovenian profiles cannot enter automatic recommendations, publication routes or sitemap',()=>{
  for(const p of profiles){
    assert.equal(p.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(p),false);
    assert.ok(!catalog.getPublishedDestinationPages().some(d=>d.destinationId===p.id));
  }
  assert.equal(presentation.canShowDestinationAutomatically({country:' Eslovenia '}),false);
  for(const term of ['Eslovenia','Slovenia','Madrid','ZZZ']){
    assert.equal(airports.sloveniaTouristPlacesForTerm(term).length,0);
    assert.equal(airports.sloveniaAirportsForTerm(term).length,0);
  }
});
test('every code, translated name, airport locality and prefix yields a selectable card without remote results',async()=>{
  const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
  for(const p of profiles)for(const term of [p.iataCodes[0],...p.aliases,p.translations.en.name.slice(0,3)]){
    const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));
    assert.equal(response.status,200);
    const {suggestions}=await response.json();
    assert.ok(suggestions.some(s=>selection.destinationFromPlaceSelection(s)?.id===p.id),p.id+':'+term);
  }
});
test('the provider airport response keeps the verified airport name and Slovenian association',async()=>{
  const route=loader({fetch:async()=>({ok:true,json:async()=>[{type:'airport',code:'MBX',name:'Maribor',country_code:'SI',city_name:'Maribor',city_code:'MBX'}]})})('app/api/travelpayouts/places/route.ts');
  const {suggestions}=await (await route.GET(new Request('https://example.test/api/travelpayouts/places?term=MBX'))).json();
  const a=suggestions.find(s=>s.type==='airport'&&s.code==='MBX');
  assert.ok(a.name.includes('Edvard Rusjan'));assert.ok(a.name.includes('Orehova vas'));
  assert.equal(selection.destinationFromPlaceSelection(a)?.id,'si-maribor');
});
test('provider failure remains safe and makes no secondary requests or reservations',async()=>{
  let calls=0;
  const route=loader({fetch:async()=>{calls++;throw Error('Simulated outage');}})('app/api/travelpayouts/places/route.ts');
  const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term=Ljubljana'));
  assert.equal((await response.json()).suggestions.length,0);assert.equal(calls,1);
});
test('each photograph retains a distinct source, author and Creative Commons reuse statement',()=>{
  assert.equal(new Set(profiles.map(p=>p.image)).size,3);
  for(const p of profiles){
    assert.match(p.image,/^https:\/\/(?:thumb|upload)\.wikimedia\.org\//);
    assert.match(p.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(p.imageCredit);assert.match(p.imageLicense,/^CC BY /);
    assert.match(p.imageLicenseUrl,/^https:\/\/creativecommons\.org\/licenses\/by\//);
  }
});
