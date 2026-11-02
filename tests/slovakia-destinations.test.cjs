const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-slovakia-catalog.json');
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
const slovak = load('lib/destinations/slovakia.ts').slovakiaDestinations;
const airports = load('lib/travelpayouts/slovakia-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ['bratislava','kosice','poprad','high-tatras','levoca','spis-castle','banska-stiavnica','banska-bystrica','nitra','trencin','zilina','slovak-paradise'];

test('Slovakia adds twelve draft profiles to 197 unchanged profiles; original cards and editorial pages stay intact', () => {
  assert.equal(before.profiles.length,197);
  assert.deepEqual(Array.from(slovak,p=>p.slug),slugs);
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
  assert.equal(catalog.getDestinationsByCountry('SK').length,12);
  for (const profile of slovak) {
    assert.equal(profile.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile),false);
  }
});
for (const locale of locales) test(locale+': complete Slovak tourism content and lookup', () => {
  for (const profile of slovak) {
    const copy=profile.translations[locale];
    assert.ok(copy.name && copy.description && copy.recommendedStay && copy.seasonalityNote);
    assert.equal(copy.recommendations.length,4);
    assert.equal(new Set(copy.recommendations).size,4);
    assert.equal(catalog.findDestinationProfile({name:copy.name}),profile);
    assert.equal(profile.countryCode,'SK');
    assert.equal(profile.federalStates.length,1);
    for (const key of ['bestMonths','lowSeasonMonths','highSeasonMonths'])
      assert.ok(profile[key].length && profile[key].every(m=>Number.isInteger(m)&&m>=1&&m<=12));
  }
});
test('BTS, KSC and TAT are physical airport codes; regional destinations require separate ground access', () => {
  assert.deepEqual(Array.from(airports.slovakiaAirports,a=>a.code),['BTS','KSC','TAT']);
  for (const [code,id] of [['BTS','sk-bratislava'],['KSC','sk-kosice'],['TAT','sk-poprad']])
    assert.equal(catalog.findDestinationProfile({iataCode:code}).id,id);
  assert.equal(selection.accessAirportSearchInput(catalog.getDestinationById('sk-high-tatras'),'TAT'),'Poprad');
  for (const profile of slovak.filter(p=>!p.iataCodes.length)) {
    assert.ok(profile.accessAirports.length && !profile.airports.length);
    assert.ok(profile.accessAirports.every(a=>['BTS','KSC','TAT'].includes(a.iataCode)));
  }
});
test('autocomplete resolves Slovak airport and tourist selections', async () => {
  const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
  for (const [term,slug] of Object.entries({BTS:'bratislava',KSC:'kosice',TAT:'poprad',Levoča:'levoca',Trenčín:'trencin',Žilina:'zilina',Slovenský:'slovak-paradise'})) {
    const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));
    assert.equal(response.status,200);
    const suggestions=(await response.json()).suggestions;
    assert.ok(suggestions.length,term);
    assert.equal(selection.destinationFromPlaceSelection(suggestions[0])?.id,'sk-'+slug,term);
  }
});
test('twelve direct Commons images carry author and reusable license', () => {
  for (const profile of slovak) {
    assert.match(profile.image,/^https:\/\/thumb\.wikimedia\.org\/.*\/960px-/);
    assert.match(profile.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(profile.imageCredit);
    assert.match(profile.imageLicense,/^CC(?: BY|0)/);
    assert.match(profile.imageLicenseUrl,/^https:\/\/creativecommons\.org\//);
  }
});
test('mountain and gorge restrictions are explained in every language', () => {
  for (const locale of locales) {
    assert.match(catalog.getDestinationById('sk-high-tatras').translations[locale].seasonalityNote,/senderos|trail|sentiers|Wegzustand|sentieri|trilhos|senders/);
    assert.match(catalog.getDestinationById('sk-slovak-paradise').translations[locale].seasonalityNote,/gargantas|gorges|Schluchten|gole|congostos/);
  }
});
