const {test}=require('node:test');
const assert=require('node:assert/strict');
const {expectedCatalogTotal,expectedCountryCount}=require('./helpers/catalog-totals.cjs');
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

const load=loader(),catalog=load('lib/destinations/index.ts'),all=catalog.getDestinationsByCountry('HR');
const profiles=all.filter(p=>['OSI','BWK','LSZ'].includes(p.iataCodes[0]));
const airports=load('lib/travelpayouts/croatia-airports.ts'),selection=load('lib/destinations/selection.ts');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
test('all 221 prior profiles, twelve approved Croatian photos and sixteen home cards remain byte-equivalent',()=>{
  const before=require('./fixtures/pre-croatia-airport-coverage.json');assert.equal(before.profiles.length,221);
  for(const p of before.profiles)assert.equal(digest(catalog.getDestinationById(p.id)),p.sha256,p.id);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
  assert.equal(all.length,15);assert.equal(profiles.length,3);assert.equal(catalog.destinationProfiles.length,expectedCatalogTotal(catalog));
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,catalog.destinationProfiles.length);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,catalog.destinationProfiles.length);
});
test('nine physical public-transport airports resolve once each, without confusing transfers or tourist towns',()=>{
  const codes=['ZAG','DBV','SPU','ZAD','PUY','RJK','OSI','BWK','LSZ'];
  assert.deepEqual(Array.from(airports.croatiaAirports,a=>a.code),codes);
  assert.equal(new Set(all.flatMap(p=>p.airports.map(a=>a.iataCode))).size,9);
  for(const p of profiles){
    assert.equal(p.airports.length,1);assert.equal(p.metropolitanCodes.length,0);
    assert.equal(catalog.findDestinationProfile({iataCode:p.iataCodes[0]}),p);
    for(const alias of p.aliases)assert.equal(catalog.findDestinationProfile({name:alias}),p,alias);
    assert.equal(load('lib/destinations/presentation.ts').canShowDestinationAutomatically(p),false);
    assert.equal(p.publication.status,'draft');
    assert.ok(!catalog.getPublishedDestinationPages().some(d=>d.destinationId===p.id));
    const a=airports.croatiaAirports.find(a=>a.code===p.iataCodes[0]);
    assert.equal(selection.destinationFromPlaceSelection({type:'airport',name:a.name,code:a.code,country:'Croacia',cityName:a.city_name,cityCode:a.city_code}),p);
    assert.equal(selection.destinationFromPlaceSelection({type:'airport',name:a.name,code:a.code,country:'Italia',cityName:a.city_name,cityCode:a.city_code}),undefined);
  }
});
for(const locale of locales)test(locale+': complete new tourism copy, four recommendations and honest airport access information',()=>{
 for(const p of profiles){const copy=p.translations[locale];
  for(const k of ['name','description','recommendedStay','seasonalityNote'])assert.ok(copy[k],p.id+':'+k);
  assert.equal(copy.recommendations.length,4);assert.equal(new Set(copy.recommendations).size,4);
  assert.ok(copy.seasonalityNote.includes(p.iataCodes[0]));
  assert.equal(airports.croatiaAirportTown(p.iataCodes[0],locale),copy.name);
  assert.equal(catalog.findDestinationProfile({name:copy.name}),p);
  if(p.id==='hr-osijek')assert.ok(copy.seasonalityNote.includes('Klisa'));
  if(p.id==='hr-bol')assert.ok(copy.seasonalityNote.includes('Gornji Humac'));
 }
});
test('all new codes, airport names, multilingual aliases and prefixes produce selectable suggestions with empty remote results',async()=>{
 const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
 for(const p of profiles){const a=airports.croatiaAirports.find(a=>a.code===p.iataCodes[0]);
 for(const term of [a.code,a.name,...p.aliases,p.translations.en.name.slice(0,3)]){
  const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));
  assert.equal(response.status,200);const {suggestions}=await response.json();
  assert.ok(suggestions.some(s=>selection.destinationFromPlaceSelection(s)?.id===p.id),p.id+':'+term);
 }}
});
test('new photos preserve three distinct Commons files with named authors and verified reuse statements',()=>{
 assert.equal(new Set(profiles.map(p=>p.image)).size,3);
 for(const p of profiles){assert.match(p.image,/^https:\/\/thumb\.wikimedia\.org\//);assert.ok(p.imageCredit);assert.match(p.imageLicense,/^CC BY-SA \d\.\d(?: de)?$/);assert.match(p.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);}
});
