const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-hungary-catalog.json');
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
const hungarian = load('lib/destinations/hungary.ts').hungaryDestinations;
const airports = load('lib/travelpayouts/hungary-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ['budapest','debrecen','szeged','pecs','eger','gyor','sopron','tihany','heviz','tokaj','szentendre','hortobagy'];

test('Hungary adds twelve draft profiles to 185 unchanged profiles; editorial pages stay intact', () => {
  assert.equal(before.profiles.length,185);
  assert.deepEqual(Array.from(hungarian,p=>p.slug),slugs);
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
  assert.equal(catalog.getDestinationsByCountry('HU').length,12);
  for (const profile of hungarian) {
    assert.equal(profile.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile),false);
  }
});
for (const locale of locales) test(locale+': complete Hungarian tourism content', () => {
  for (const profile of hungarian) {
    const copy=profile.translations[locale];
    assert.ok(copy.name && copy.description && copy.recommendedStay && copy.seasonalityNote);
    assert.equal(copy.recommendations.length,4);
    assert.equal(new Set(copy.recommendations).size,4);
    assert.equal(catalog.findDestinationProfile({name:copy.name}),profile);
    assert.equal(profile.countryCode,'HU');
    assert.equal(profile.federalStates.length,1);
    for (const key of ['bestMonths','lowSeasonMonths','highSeasonMonths'])
      assert.ok(profile[key].length && profile[key].every(m=>Number.isInteger(m)&&m>=1&&m<=12));
  }
});
test('BUD and DEB are priced airport codes; regional destinations require separate ground access', () => {
  assert.deepEqual(Array.from(airports.hungaryAirports,a=>a.code),['BUD','DEB']);
  assert.equal(catalog.findDestinationProfile({iataCode:'BUD'}).id,'hu-budapest');
  assert.equal(catalog.findDestinationProfile({iataCode:'DEB'}).id,'hu-debrecen');
  assert.equal(selection.accessAirportSearchInput(catalog.getDestinationById('hu-hortobagy'),'DEB'),'Debrecen');
  for (const profile of hungarian.filter(p=>!p.iataCodes.length)) {
    assert.ok(profile.accessAirports.length && !profile.airports.length);
    assert.ok(profile.accessAirports.every(a=>['BUD','DEB'].includes(a.iataCode)));
  }
  const heviz=catalog.getDestinationById('hu-heviz');
  assert.deepEqual(Array.from(heviz.auxiliaryCodes),['SOB']);
  assert.equal(heviz.iataCodes.length,0);
});
test('Hungarian autocomplete supports airport and tourist selections without fabricated pricing codes', async () => {
  const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
  for (const [term,slug] of Object.entries({BUD:'budapest',DEB:'debrecen',Szeged:'szeged',Pécs:'pecs',Eger:'eger',Hévíz:'heviz',Tokaj:'tokaj',Hortobágy:'hortobagy'})) {
    const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));
    assert.equal(response.status,200);
    const suggestions=(await response.json()).suggestions;
    assert.ok(suggestions.length,term);
    assert.equal(selection.destinationFromPlaceSelection(suggestions[0])?.id,'hu-'+slug,term);
  }
  assert.equal(airports.hungaryAirportsForTerm('SOB').length,0);
});
test('twelve direct Commons images carry correct author and reusable CC license', () => {
  for (const profile of hungarian) {
    assert.match(profile.image,/^https:\/\/thumb\.wikimedia\.org\/.*\/960px-/);
    assert.match(profile.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(profile.imageCredit);
    assert.match(profile.imageLicense,/^CC BY(?:-SA)?/);
    assert.match(profile.imageLicenseUrl,/^https:\/\/creativecommons\.org\//);
  }
});
test('Hortobágy visit restrictions are explained in every language', () => {
  for (const locale of locales) assert.match(catalog.getDestinationById('hu-hortobagy').translations[locale].seasonalityNote,/normas|rules|règles|Regeln|regole|regras|normes/);
});
