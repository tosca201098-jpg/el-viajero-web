const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-croatia-catalog.json');
const locales = ['es','en','fr','de','it','pt','ca'];
const digest = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
function loader(globals = {}) {
  const cache = new Map();
  function load(file) {
    file = file.replaceAll('\\','/');
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(code, { exports, Intl, URL, URLSearchParams, Request, Response, AbortSignal, ...globals,
      require: id => {
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file),id);
        const next = [base+'.ts',path.join(base,'index.ts')].find(p => fs.existsSync(path.join(root,p)));
        if (!next) throw Error(id);
        return load(next);
      } }, { filename: file });
    return exports;
  }
  return load;
}
const load = loader();
const catalog = load('lib/destinations/index.ts');
const croatian = load('lib/destinations/croatia.ts').croatiaDestinations;
const airports = load('lib/travelpayouts/croatia-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ['zagreb','dubrovnik','split','zadar','pula','rijeka','rovinj','hvar','korcula','sibenik','plitvice-lakes','krka-national-park'];

test('Croatia adds twelve draft profiles to 209 unchanged profiles; original cards and editorial pages stay intact', () => {
  assert.equal(before.profiles.length,209);
  assert.deepEqual(Array.from(croatian,p=>p.slug),slugs);
  assert.equal(catalog.destinationProfiles.length,221);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,221);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,221);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.countryCode)).size,15);
  for (const previous of before.profiles) {
    const profile = catalog.getDestinationById(previous.id);
    assert.equal(profile.slug,previous.slug);
    assert.equal(digest(profile),previous.sha256,previous.id);
  }
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
  assert.equal(load('lib/destinations/featured.ts').destinations.length,16);
  for (const [season,hash] of Object.entries(before.seasons))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas',season,'page.tsx'),'utf8').replace(/\r\n/g,'\n')),hash);
  for (const [file,hash] of Object.entries(before.monthPages))
    assert.equal(digest(fs.readFileSync(path.join(root,'app/viajes-baratos/[mes]',file),'utf8').replace(/\r\n/g,'\n')),hash);
  assert.equal(catalog.getDestinationsByCountry('HR').length,12);
  for (const profile of croatian) {
    assert.equal(profile.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile),false);
  }
});
for (const locale of locales) test(locale+': complete Croatian tourism content and lookup', () => {
  for (const profile of croatian) {
    const copy=profile.translations[locale];
    assert.ok(copy.name && copy.description && copy.recommendedStay && copy.seasonalityNote);
    assert.equal(copy.recommendations.length,4);
    assert.equal(new Set(copy.recommendations).size,4);
    assert.equal(catalog.findDestinationProfile({name:copy.name}),profile);
    assert.equal(profile.countryCode,'HR');
    for (const key of ['bestMonths','lowSeasonMonths','highSeasonMonths'])
      assert.ok(profile[key].length && profile[key].every(m=>Number.isInteger(m)&&m>=1&&m<=12));
  }
});

test('six verified airports resolve to cities; other profiles have transfer airports only', () => {
  const expected={ZAG:'zagreb',DBV:'dubrovnik',SPU:'split',ZAD:'zadar',PUY:'pula',RJK:'rijeka'};
  assert.deepEqual(Array.from(airports.croatiaAirports,a=>a.code),Object.keys(expected));
  for(const [code,slug] of Object.entries(expected)) {
    assert.equal(catalog.findDestinationProfile({iataCode:code}).id,'hr-'+slug);
    assert.equal(selection.accessAirportSearchInput({countryCode:'HR'},code),catalog.getDestinationById('hr-'+slug).name);
  }
  for(const profile of croatian.filter(p=>!p.iataCodes.length)) {
    assert.equal(profile.airports.length,0); assert.equal(profile.metropolitanCodes.length,0);
    assert.ok(profile.accessAirports.length);
    assert.ok(profile.accessAirports.every(a=>Object.hasOwn(expected,a.iataCode)));
    for(const a of profile.accessAirports) assert.notEqual(catalog.findDestinationProfile({iataCode:a.iataCode}),profile);
  }
});
test('autocomplete opens all twelve Croatian profiles with empty remote results', async () => {
  const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
  const cases={ZAG:'zagreb',DBV:'dubrovnik',SPU:'split',ZAD:'zadar',PUY:'pula',RJK:'rijeka',Rovinj:'rovinj',Hvar:'hvar',Korcula:'korcula',Sibenik:'sibenik',Plitvice:'plitvice-lakes',Krka:'krka-national-park'};
  for(const [term,slug] of Object.entries(cases)){
    const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));
    assert.equal(response.status,200);
    const suggestions=(await response.json()).suggestions;
    assert.ok(suggestions.length,term);
    assert.equal(selection.destinationFromPlaceSelection(suggestions[0])?.id,'hr-'+slug,term);
    if(!catalog.getDestinationById('hr-'+slug).iataCodes.length) assert.equal(suggestions[0].code,null,term);
  }
});
test('real free provider fixtures retain Croatian identity and cannot substitute foreign cities', async () => {
  const samples=require('./fixtures/croatia-places.json');
  for(const sample of samples){
    const route=loader({fetch:async()=>({ok:true,json:async()=>sample.places})})('app/api/travelpayouts/places/route.ts');
    const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(sample.term)));
    const suggestions=(await response.json()).suggestions;
    const chosen=suggestions.find(s=>selection.destinationFromPlaceSelection(s)?.id===sample.destinationId);
    assert.ok(chosen,sample.term);
    assert.equal(chosen.country,'Croacia');
  }
  assert.equal(selection.destinationFromPlaceSelection({type:'city',name:'Split',country:'Estados Unidos',code:null,cityName:null,cityCode:null}),undefined);
});
test('Croatian names and aliases are unambiguous against all 209 previous profiles', () => {
  for(const p of croatian) for(const name of [p.name,...p.aliases]){
    const matches=catalog.destinationProfiles.filter(candidate=>[candidate.name,...(candidate.aliases??[])].some(n=>catalog.normalizeDestinationName(n)===catalog.normalizeDestinationName(name)));
    assert.deepEqual(Array.from(matches,c=>c.id),[p.id],name);
  }
});
test('twelve landscape Commons photos have verified author, source and reuse statement', () => {
  const evidence=require('./fixtures/croatia-images.json');
  assert.equal(evidence.length,12);assert.equal(new Set(croatian.map(p=>p.image)).size,12);
  for(const p of croatian){
    const photo=evidence.find(e=>e.image===p.image);
    assert.ok(photo);assert.equal(photo.status,200);assert.equal(photo.contentType,'image/jpeg');
    assert.ok(photo.width>photo.height && photo.width>=960);
    assert.match(p.image,/^https:\/\/(?:upload|thumb)\.wikimedia\.org\//);
    assert.match(p.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(p.imageCredit);assert.match(p.imageLicense,/^(CC BY|Public domain)/);
    assert.match(p.imageLicenseUrl,/^https:\/\/creativecommons\.org\//);
  }
});
test('ferries and park restrictions are explained in all seven languages', () => {
  for(const locale of locales){
    const note=id=>catalog.getDestinationById('hr-'+id).translations[locale].seasonalityNote;
    assert.match(note('hvar'),/SPU/);assert.match(note('hvar'),/Stari Grad/);
    assert.match(note('korcula'),/DBV/);assert.match(note('korcula'),/Orebić/);assert.match(note('korcula'),/Dominče/);
    assert.match(note('plitvice-lakes'),/bañarse|Swimming is prohibited|baignade est interdite|Baden ist verboten|vietato nuotare|proibido nadar|permet el bany/);
    assert.match(note('krka-national-park'),/Skradin.*Lozovac/);
    assert.match(note('krka-national-park'),/Visovac/);
  }
});
