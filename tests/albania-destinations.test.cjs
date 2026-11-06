const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-albania-catalog.json');
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
const albanian = load('lib/destinations/albania.ts').albaniaDestinations;
const airports = load('lib/travelpayouts/albania-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ['tirana'];

test('Albania adds one draft profile to 209 unchanged profiles; original cards and editorial pages stay intact', () => {
  assert.equal(before.profiles.length,209);
  assert.deepEqual(Array.from(albanian,p=>p.slug),slugs);
  assert.equal(catalog.destinationProfiles.length,366);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,366);
  assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,366);
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
  assert.equal(catalog.getDestinationsByCountry('AL').length,1);
  for (const profile of albanian) {
    assert.equal(profile.publication.status,'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile),false);
  }
});
for (const locale of locales) test(locale+': complete Albanian tourism content and lookup', () => {
  for (const profile of albanian) {
    const copy=profile.translations[locale];
    assert.ok(copy.name && copy.description && copy.recommendedStay && copy.seasonalityNote);
    assert.equal(copy.recommendations.length,4);
    assert.equal(new Set(copy.recommendations).size,4);
    assert.equal(catalog.findDestinationProfile({name:copy.name}),profile);
    assert.equal(profile.countryCode,'AL');
    for (const key of ['bestMonths','lowSeasonMonths','highSeasonMonths'])
      assert.ok(profile[key].length && profile[key].every(m=>Number.isInteger(m)&&m>=1&&m<=12));
  }
});
test('TIA is the only airport; Tirana has a licensed photo with documented origin', () => {
  assert.deepEqual(Array.from(airports.albaniaAirports,a=>a.code),['TIA']);
  assert.equal(catalog.findDestinationProfile({iataCode:'TIA'}).id,'al-tirana');
  assert.equal(airports.albaniaAirportsForTerm('Rinas').length,1);
  assert.equal(airports.albaniaAirportsForTerm('Tiranë')[0].code,'TIA');
  assert.equal(airports.albaniaTouristPlacesForTerm('tir')[0].code,'TIA');
  assert.equal(airports.albaniaAirportsForTerm('KFZ').length,0);
  assert.equal(airports.albaniaAirportsForTerm('VLO').length,0);
  const p=albanian[0];
  assert.match(p.image,/^https:\/\/thumb\.wikimedia\.org\//);
  for (const key of ['imageSource','imageCredit','imageLicense','imageLicenseUrl']) assert.ok(p[key],key);
});
