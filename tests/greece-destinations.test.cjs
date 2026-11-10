const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),before=require('./fixtures/pre-greece-catalog.json');
const locales=['es','en','fr','de','it','pt','ca'];
const digest=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
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
const load=loader(),catalog=load('lib/destinations/index.ts'),greek=catalog.getDestinationsByCountry('GR');
const selection=load('lib/destinations/selection.ts'),presentation=load('lib/destinations/presentation.ts');
const localization=load('lib/destinations/localization.ts'),airports=load('lib/travelpayouts/greece-airports.ts');
const codes=['ATH','SKG','HER','CHQ','RHO','CFU','KGS','JTR','JMK','ZTH','EFL','JSI','PVK','SMI','KLX','KVA','MJT','PAS','JNX','MLO','JKH','AOK','AXD','GPA','LXS','IOA','JIK','LRS','VOL','JSH','JSY','JTY','JKL','KSJ','KZS','KSO','KZI','KIT','SKU'];

test('the airport expansion preserves all 221 existing profiles and the approved Athens photograph',()=>{
  const previous=require('./fixtures/pre-greece-airports-catalog.json');
  assert.equal(previous.base,'af627894fc545d5f469a69ed126c3712756e1a8b');
  assert.equal(previous.profiles.length,221);
  for(const p of previous.profiles)assert.equal(digest(catalog.getDestinationById(p.id)),p.sha256,p.id);
  const athens=catalog.getDestinationById('gr-athens');
  for(const[key,value]of Object.entries(previous.athensImage))assert.equal(athens[key],value,key);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),previous.featuredSha256);
});
test('Greece adds thirty-nine unique profiles and preserves all 209 profiles, original cards and editorial pages',()=>{
  assert.equal(greek.length,39);assert.equal(catalog.destinationProfiles.length,474);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,474);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,474);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.countryCode)).size,45);
  assert.equal(before.profiles.length,209);
  for(const p of before.profiles)assert.equal(digest(catalog.getDestinationById(p.id)),p.sha256,p.id);
  const featured=load('lib/destinations/featured.ts').destinations;
  assert.equal(featured.length,16);assert.equal(digest(featured),before.featuredSha256);
  assert.equal(featured.filter(p=>p.name==='Santorini').length,1);
  for(const[season,hash]of Object.entries(before.seasons))assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas',season,'page.tsx'),'utf8').replace(/\r\n/g,'\n')),hash);
  for(const[file,hash]of Object.entries(before.monthPages))assert.equal(digest(fs.readFileSync(path.join(root,'app/viajes-baratos/[mes]',file),'utf8').replace(/\r\n/g,'\n')),hash);
});
for(const locale of locales)test(locale+': all Greek profiles have local text, four recommendations, seasons and stable lookup',()=>{
  for(const p of greek){
    const copy=localization.getDestinationText(p,locale);
    assert.equal(copy.name,p.translations[locale].name);
    for(const key of ['description','recommendedStay','seasonalityNote'])assert.ok(copy[key],p.id+':'+key);
    assert.equal(copy.recommendations.length,4);assert.equal(new Set(copy.recommendations).size,4);
    assert.ok(copy.recommendations.every(r=>!r.includes(' / ')),p.id);
    assert.equal(catalog.findDestinationProfile({name:copy.name}),p);
    assert.equal(catalog.getDestinationBySlug(p.slug),p);
    for(const key of ['bestMonths','lowSeasonMonths','highSeasonMonths'])assert.ok(p[key].length&&p[key].every(m=>Number.isInteger(m)&&m>=1&&m<=12));
  }
});
test('thirty-nine distinct physical airport codes resolve to the expected Greek identity',()=>{
  assert.deepEqual(Array.from(airports.greeceAirports,a=>a.code),codes);
  for(let i=0;i<codes.length;i++){
    const p=greek[i],a=airports.greeceAirports[i];
    assert.equal(catalog.findDestinationProfile({iataCode:codes[i]}),p);
    assert.deepEqual(Array.from(p.airports,x=>x.iataCode),[codes[i]]);
    assert.equal(p.metropolitanCodes.length,0);
    const s={type:'airport',name:a.name,code:a.code,country:'Grecia',cityName:a.city_name,cityCode:a.city_code};
    assert.equal(selection.destinationFromPlaceSelection(s),p);
    assert.equal(selection.destinationFromPlaceSelection({...s,country:'Estados Unidos'}),undefined);
  }
});
test('Greek names and aliases do not collide with any other profile',()=>{
  for(const p of greek)for(const alias of [p.name,...p.aliases]){
    const normalized=catalog.normalizeDestinationName(alias);
    // Non-Latin aliases are handled by the airport autocomplete, whose normalizer retains Greek letters.
    if(!normalized)continue;
    const matches=catalog.destinationProfiles.filter(other=>[other.name,...(other.aliases??[])].some(n=>catalog.normalizeDestinationName(n)===normalized));
    assert.deepEqual(Array.from(matches,x=>x.id),[p.id],alias);
  }
});
test('airport codes, city names, prefixes and translated aliases are selectable with an empty remote response',async()=>{
  const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
  for(const p of greek)for(const term of [p.iataCodes[0],...locales.map(l=>p.translations[l].name),p.translations.en.name.slice(0,4)]){
    const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));
    assert.equal(response.status,200);
    const suggestions=(await response.json()).suggestions;
    assert.ok(suggestions.some(s=>selection.destinationFromPlaceSelection(s)?.id===p.id),p.id+':'+term);
  }
});
test('adding Greece does not suggest all its destinations for a country or unrelated query; service failures stay safe',async()=>{
  const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
  for(const term of ['Grecia','Greece','Madrid','ZZZ']){
    const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+term));
    assert.equal((await response.json()).suggestions.length,0,term);
  }
  const failed=loader({fetch:async()=>{throw Error('Simulated outage');}})('app/api/travelpayouts/places/route.ts');
  const response=await failed.GET(new Request('https://example.test/api/travelpayouts/places?term=ATH'));
  assert.equal((await response.json()).suggestions.length,0);
});
test('Greek profiles remain selection-only drafts and publish no destination pages or sitemap entries',()=>{
  const published=catalog.getPublishedDestinationPages();
  for(const p of greek){assert.equal(p.publication.status,'draft');assert.equal(presentation.canShowDestinationAutomatically(p),false);assert.ok(!published.some(entry=>entry.destinationId===p.id));}
  assert.equal(presentation.canShowDestinationAutomatically({country:' Grecia '}),false);
});
test('all thirty-nine photographs preserve Commons source, creator and reuse statement',()=>{
  const photos=new Set();
  for(const p of greek){
    if(p.id==='gr-kalymnos')assert.match(p.image,/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/.*Calymnos_harbour\.jpg$/);else assert.match(p.image,/^https:\/\/thumb\.wikimedia\.org\/.*\/960px-/);photos.add(p.image);
    assert.match(p.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(p.imageCredit);assert.match(p.imageLicense,/^(?:CC(?: BY|0)|Public domain)/);
    assert.match(p.imageLicenseUrl,/^https:\/\/creativecommons\.org\//);
  }assert.equal(photos.size,39);
});
