const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const before=require('./fixtures/pre-czechia-catalog.json');
const locales=['es','en','fr','de','it','pt','ca'];
const digest=x=>crypto.createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
function loader(globals={}){const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);const source=fs.readFileSync(path.join(root,file),'utf8');const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(code,{exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const next=[base+'.ts',path.join(base,'index.ts')].find(x=>fs.existsSync(path.join(root,x)));if(!next)throw Error(id);return load(next)}},{filename:file});return exports}return load}
const load=loader();
const catalog=load('lib/destinations/index.ts');
const czech=load('lib/destinations/czechia.ts').czechiaDestinations;
const airports=load('lib/travelpayouts/czechia-airports.ts');
const selection=load('lib/destinations/selection.ts');
const presentation=load('lib/destinations/presentation.ts');
const slugs=['prague','brno','cesky-krumlov','karlovy-vary','kutna-hora','olomouc','plzen','ceske-budejovice','telc','mikulov-lednice','bohemian-switzerland','ostrava'];

test('twelve Czech profiles remain intact in the 197-profile catalog, without editorial changes',()=>{
  assert.equal(before.profiles.length,161);assert.deepEqual(Array.from(czech,p=>p.slug),slugs);
  assert.equal(catalog.destinationProfiles.length,197);assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,197);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,197);
  for(const x of before.profiles){const p=catalog.getDestinationById(x.id);assert.equal(p.slug,x.slug);assert.equal(digest(p),x.sha256,x.id)}
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
  assert.equal(load('lib/destinations/featured.ts').destinations.length,16);
  for(const [season,hash] of Object.entries(before.seasons))assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas',season,'page.tsx'),'utf8').replace(/\r\n/g,'\n')),hash);
  for(const [file,hash] of Object.entries(before.monthPages))assert.equal(digest(fs.readFileSync(path.join(root,'app/viajes-baratos/[mes]',file),'utf8').replace(/\r\n/g,'\n')),hash);
  assert.equal(catalog.getDestinationsByCountry('CZ').length,12);
  for(const p of czech){assert.equal(p.publication.status,'draft');assert.equal(presentation.canShowDestinationAutomatically(p),false)}
});
for(const locale of locales)test(locale+': complete Czech content',()=>{
  for(const p of czech){const x=p.translations[locale];assert.ok(x.name&&x.description&&x.recommendedStay&&x.seasonalityNote);assert.equal(x.recommendations.length,4);
    assert.equal(new Set(x.recommendations).size,4);assert.equal(catalog.findDestinationProfile({name:x.name}),p);
    for(const key of ['bestMonths','lowSeasonMonths','highSeasonMonths'])assert.ok(p[key].length&&p[key].every(n=>n>=1&&n<=12));
    assert.equal(p.countryCode,'CZ');assert.equal(p.federalStates.length,1);
  }
});
test('commercial-airport codes are provider-confirmed and auxiliary JCL never becomes a flight code',()=>{
  assert.deepEqual(Array.from(airports.czechiaAirports,a=>a.code),['PRG','BRQ','OSR','PED','KLV']);
  for(const [slug,code] of Object.entries({prague:'PRG',brno:'BRQ',ostrava:'OSR','karlovy-vary':'KLV'})){
    const p=catalog.getDestinationById('cz-'+slug);assert.deepEqual(Array.from(p.iataCodes),[code]);assert.equal(catalog.findDestinationProfile({iataCode:code}),p);
  }
  for(const p of czech.filter(p=>!p.iataCodes.length))assert.ok(p.accessAirports.length);
  const budejovice=catalog.getDestinationById('cz-ceske-budejovice');assert.deepEqual(Array.from(budejovice.auxiliaryCodes),['JCL']);assert.equal(catalog.findDestinationProfile({iataCode:'JCL'}),undefined);
  assert.equal(selection.accessAirportSearchInput(catalog.getDestinationById('cz-bohemian-switzerland'),'PRG'),'Praga');
});
test('provider-backed autocomplete resolves real codes and all twelve Czech tourist towns',async()=>{
  const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
  for(const [term,slug] of Object.entries({PRG:'prague',BRQ:'brno',OSR:'ostrava',KLV:'karlovy-vary','Český Krumlov':'cesky-krumlov','Kutná Hora':'kutna-hora',Olomouc:'olomouc',Plzeň:'plzen','České Budějovice':'ceske-budejovice',Telč:'telc',Mikulov:'mikulov-lednice','Suiza Bohemia':'bohemian-switzerland'})){
    const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));
    assert.equal(response.status,200);const results=(await response.json()).suggestions;assert.ok(results.length,term);
    assert.equal(selection.destinationFromPlaceSelection(results[0])?.id,'cz-'+slug,term);
  }
  const jcl=await route.GET(new Request('https://example.test/api/travelpayouts/places?term=JCL'));
  assert.equal((await jcl.json()).suggestions.length,0);
});
test('all twelve Commons images carry direct 960px URLs and CC BY/SA attribution',()=>{
  for(const p of czech){assert.match(p.image,/^https:\/\/thumb\.wikimedia\.org\/.*\/960px-/);assert.match(p.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(p.imageCredit);assert.match(p.imageLicense,/^CC BY(?:-SA)?/);assert.match(p.imageLicenseUrl,/^https:\/\/creativecommons\.org\//)}
});
