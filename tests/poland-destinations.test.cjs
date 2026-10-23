const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const before = require('./fixtures/pre-poland-catalog.json');
const locales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
const digest = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
function loader(globals = {}) {
  const cache = new Map();
  function load(file) {
    file = file.replaceAll('\\', '/');
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    vm.runInNewContext(code, { exports, Intl, URL, URLSearchParams, Request, Response, AbortSignal, ...globals, require: id => {
      const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
      const next = [base + '.ts', path.join(base, 'index.ts')].find(candidate => fs.existsSync(path.join(root, candidate)));
      if (!next) throw Error(id);
      return load(next);
    } }, { filename: file });
    return exports;
  }
  return load;
}
const load = loader();
const catalog = load('lib/destinations/index.ts');
const polish = load('lib/destinations/poland.ts').polandDestinations;
const airports = load('lib/travelpayouts/poland-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const slugs = ['warsaw','krakow','gdansk-tricity','wroclaw','poznan','torun','lublin','lodz','zakopane-tatras','masurian-lakes','szczecin','bialowieza'];

test('Poland adds twelve profiles to 173 unchanged profiles, leaving the original editorial pages intact', () => {
  assert.equal(before.profiles.length, 173);
  assert.deepEqual(Array.from(polish, profile => profile.slug), slugs);
  assert.equal(catalog.destinationProfiles.length, 185);
  assert.equal(new Set(catalog.destinationProfiles.map(profile => profile.id)).size, 185);
  assert.equal(new Set(catalog.destinationProfiles.map(profile => profile.slug)).size, 185);
  assert.equal(new Set(catalog.destinationProfiles.map(profile => profile.countryCode)).size, 12);
  for (const previous of before.profiles) {
    const profile = catalog.getDestinationById(previous.id);
    assert.equal(profile.slug, previous.slug);
    assert.equal(digest(profile), previous.sha256, previous.id);
  }
  assert.equal(digest(load('lib/destinations/featured.ts').destinations), before.featuredSha256);
  assert.equal(load('lib/destinations/featured.ts').destinations.length, 16);
  for (const [season, hash] of Object.entries(before.seasons)) assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas',season,'page.tsx'),'utf8').replace(/\r\n/g,'\n')), hash);
  for (const [file, hash] of Object.entries(before.monthPages)) assert.equal(digest(fs.readFileSync(path.join(root,'app/viajes-baratos/[mes]',file),'utf8').replace(/\r\n/g,'\n')), hash);
  assert.equal(catalog.getDestinationsByCountry('PL').length, 12);
  for (const profile of polish) {
    assert.equal(profile.publication.status, 'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile), false);
  }
});

for (const locale of locales) test(`${locale}: complete Polish content`, () => {
  for (const profile of polish) {
    const copy = profile.translations[locale];
    assert.ok(copy.name && copy.description && copy.recommendedStay && copy.seasonalityNote);
    assert.equal(copy.recommendations.length, 4);
    assert.equal(new Set(copy.recommendations).size, 4);
    assert.equal(catalog.findDestinationProfile({ name: copy.name }), profile);
    for (const key of ['bestMonths','lowSeasonMonths','highSeasonMonths']) assert.ok(profile[key].length && profile[key].every(month => month >= 1 && month <= 12));
    assert.equal(profile.countryCode, 'PL');
    assert.equal(profile.federalStates.length, 1);
  }
});

test('provider-confirmed airport codes and overland access remain distinct', () => {
  assert.deepEqual(Array.from(airports.polandAirports, airport => airport.code), ['WAW','WMI','KRK','GDN','WRO','POZ','LCJ','SZZ','LUZ','KTW','SZY','BZG']);
  for (const [slug, code] of Object.entries({warsaw:'WAW', krakow:'KRK','gdansk-tricity':'GDN',wroclaw:'WRO',poznan:'POZ',lublin:'LUZ',lodz:'LCJ',szczecin:'SZZ'})) {
    const profile = catalog.getDestinationById('pl-' + slug);
    assert.ok(profile.iataCodes.includes(code), slug);
    assert.equal(catalog.findDestinationProfile({ iataCode: code }), profile);
  }
  assert.equal(catalog.findDestinationProfile({ iataCode:'WMI' }).id, 'pl-warsaw');
  for (const profile of polish.filter(profile => !profile.iataCodes.length)) assert.ok(profile.accessAirports.length && !profile.airports.length);
  assert.equal(selection.accessAirportSearchInput(catalog.getDestinationById('pl-bialowieza'), 'WAW'), 'Varsovia');
  assert.equal(selection.accessAirportSearchInput(catalog.getDestinationById('pl-torun'), 'BZG'), 'Bydgoszcz');
});

test('autocomplete identifies Polish airports and tourist destinations without fabricating airport codes', async () => {
  const route = loader({ fetch: async () => ({ ok:true, json:async () => [] }) })('app/api/travelpayouts/places/route.ts');
  for (const [term, slug] of Object.entries({WAW:'warsaw', WMI:'warsaw', KRK:'krakow', GDN:'gdansk-tricity', WRO:'wroclaw', POZ:'poznan', LCJ:'lodz', SZZ:'szczecin', LUZ:'lublin', Toruń:'torun', Zakopane:'zakopane-tatras', Masuria:'masurian-lakes', Białowieża:'bialowieza'})) {
    const response = await route.GET(new Request('https://example.test/api/travelpayouts/places?term=' + encodeURIComponent(term)));
    assert.equal(response.status, 200);
    const results = (await response.json()).suggestions;
    assert.ok(results.length, term);
    assert.equal(selection.destinationFromPlaceSelection(results[0])?.id, 'pl-' + slug, term);
  }
});

test('all twelve Commons images include direct 960px URLs and attribution', () => {
  for (const profile of polish) {
    assert.match(profile.image, /^https:\/\/thumb\.wikimedia\.org\/.*\/960px-/);
    assert.match(profile.imageSource, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(profile.imageCredit);
    assert.match(profile.imageLicense, /^CC BY(?:-SA)?/);
    assert.match(profile.imageLicenseUrl, /^https:\/\/creativecommons\.org\//);
  }
});

test('protected areas carry official visit constraints in all seven languages', () => {
  for (const locale of locales) {
    assert.match(catalog.getDestinationById('pl-bialowieza').translations[locale].seasonalityNote, /gu[ií]a|guide|Führer|guida|guia/);
    assert.match(catalog.getDestinationById('pl-zakopane-tatras').translations[locale].seasonalityNote, /sender|trail|sentier|Wege|trilh/);
  }
});
