const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const baseline = require('./fixtures/pre-switzerland-catalog.json');
const places = require('./fixtures/switzerland-places.json');
const locales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
const digest = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');

function loader(globals = {}) {
  const cache = new Map();
  function load(file) {
    file = file.replaceAll('\\', '/');
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const compiled = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(compiled, { exports, Intl, URL, URLSearchParams, Request, Response, AbortSignal, ...globals,
      require: id => {
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const resolved = [base + '.ts', path.join(base, 'index.ts')].find(candidate => fs.existsSync(path.join(root, candidate)));
        if (!resolved) throw Error(id);
        return load(resolved);
      },
    }, { filename: file });
    return exports;
  }
  return load;
}

const load = loader();
const catalog = load('lib/destinations/index.ts');
const swiss = load('lib/destinations/switzerland.ts').switzerlandDestinations;
const airports = load('lib/travelpayouts/switzerland-airports.ts');
const selection = load('lib/destinations/selection.ts');
const localization = load('lib/destinations/localization.ts');

function endpoint() {
  const calls = [];
  const route = loader({ fetch: async input => {
    const url = new URL(input);
    calls.push(url);
    return { ok: true, json: async () => places[url.searchParams.get('term')] ?? [] };
  } })('app/api/travelpayouts/places/route.ts');
  return { calls, async search(term) {
    const response = await route.GET(new Request('https://example.test/api/travelpayouts/places?term=' + encodeURIComponent(term)));
    assert.equal(response.status, 200);
    return (await response.json()).suggestions;
  } };
}

test('Switzerland adds 12 unique canonical profiles while all 137 previous identities and editorial cards remain byte-for-byte equivalent', () => {
  assert.equal(baseline.profiles.length, 137);
  assert.equal(swiss.length, 12);
  assert.equal(catalog.destinationProfiles.length, 185);
  assert.equal(new Set(catalog.destinationProfiles.map(item => item.id)).size, 185);
  assert.equal(new Set(catalog.destinationProfiles.map(item => item.slug)).size, 185);
  assert.deepEqual(Array.from(catalog.destinationProfiles.slice(0, 137), item => item.id), baseline.profiles.map(item => item.id));
  for (const item of baseline.profiles) assert.equal(digest(catalog.getDestinationById(item.id)), item.sha256, item.id);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations), baseline.featuredSha256);
  for (const [season, hash] of Object.entries(baseline.seasonFiles)) {
    const source = fs.readFileSync(path.join(root, 'app/temporadas', season, 'page.tsx'), 'utf8').replace(/\r\n/g, '\n');
    assert.equal(digest(source), hash, season);
  }
  assert.equal(catalog.getDestinationsByCountry('CH').length, 12);
});

for (const locale of locales) test(locale + ': all Swiss profiles have translated names, tourism content, transport guidance and four recommendations', () => {
  for (const profile of swiss) {
    assert.equal(profile.countryCode, 'CH');
    assert.equal(profile.country, 'Suiza');
    assert.ok(profile.cantons.length > 0);
    assert.deepEqual(Object.keys(profile.translations).sort(), locales.slice().sort());
    const text = profile.translations[locale];
    for (const key of ['name', 'description', 'recommendedStay', 'seasonalityNote']) assert.ok(text[key]?.trim(), profile.id + ':' + locale + ':' + key);
    assert.equal(text.recommendations.length, 4);
    assert.equal(new Set(text.recommendations).size, 4);
    assert.equal(catalog.findDestinationProfile({ name: text.name }), profile);
    assert.equal(localization.getDestinationCountryName(profile, locale), new Intl.DisplayNames([locale], { type: 'region' }).of('CH'));
    for (const key of ['bestMonths', 'lowSeasonMonths', 'highSeasonMonths']) assert.ok(profile[key].length && profile[key].every(month => month >= 1 && month <= 12));
    assert.match(text.seasonalityNote, /CHF/);
  }
});

test('Swiss names and aliases resolve without accents; Alpine destinations have ground access, not invented airports', () => {
  for (const [name, id] of Object.entries({ Zurich: 'ch-zurich', Zürich: 'ch-zurich', Geneve: 'ch-geneva', Geneva: 'ch-geneva', Luzern: 'ch-lucerne', Bern: 'ch-bern', Basel: 'ch-basel', Lausanne: 'ch-lausanne-lavaux', Montreux: 'ch-montreux-chillon', Interlaken: 'ch-interlaken-jungfrau', Zermatt: 'ch-zermatt-matterhorn', Matterhorn: 'ch-zermatt-matterhorn', 'San Moritz': 'ch-st-moritz-engadin', Lugano: 'ch-lugano', Schaffhausen: 'ch-schaffhausen-rhine-falls' })) {
    assert.equal(catalog.findDestinationProfile({ name })?.id, id, name);
  }
  for (const id of ['ch-lucerne', 'ch-lausanne-lavaux', 'ch-montreux-chillon', 'ch-interlaken-jungfrau', 'ch-zermatt-matterhorn', 'ch-st-moritz-engadin', 'ch-lugano', 'ch-schaffhausen-rhine-falls']) {
    const profile = catalog.getDestinationById(id);
    assert.equal(profile.airports.length, 0, id);
    assert.equal(profile.iataCodes.length, 0, id);
    assert.ok(profile.accessAirports.length, id);
  }
  assert.equal(catalog.getDestinationById('ch-zermatt-matterhorn').cantons[0], 'VS');
  assert.match(catalog.getDestinationById('ch-zermatt-matterhorn').seasonalityNote, /Täsch/);
  assert.match(catalog.getDestinationById('ch-interlaken-jungfrau').seasonalityNote, /no tiene un aeropuerto internacional propio/);
  assert.deepEqual(Array.from(catalog.getDestinationById('ch-lugano').auxiliaryCodes), ['LUG']);
});

test('ZRH, GVA, BRN, BSL, MLH and EAP keep real airport or area identities and country ownership', async () => {
  assert.equal(airports.switzerlandAirports.length, 8);
  const api = endpoint();
  for (const [term, expected] of Object.entries({ ZRH: 'ZRH', GVA: 'GVA', BRN: 'BRN', BSL: 'BSL', MLH: 'MLH', EAP: 'EAP' })) {
    const results = await api.search(term);
    assert.equal(results[0].code, expected, term);
    if (term === 'BSL' || term === 'MLH') {
      assert.equal(results[0].type, 'airport');
      assert.equal(results[0].country, 'Francia');
      assert.equal(results[0].cityCode, 'EAP');
      assert.equal(results[0].physicalCityName, 'Saint-Louis (Francia)');
      assert.equal(selection.destinationFromPlaceSelection(results[0])?.id, 'ch-basel');
    }
    if (term === 'EAP') {
      assert.equal(results[0].type, 'city');
      assert.equal(selection.destinationFromPlaceSelection(results[0])?.id, 'ch-basel');
    }
  }
  assert.equal(api.calls.length, 6);
  assert.ok(api.calls.every(call => call.host === 'autocomplete.travelpayouts.com'));
  const basel = catalog.getDestinationById('ch-basel');
  assert.deepEqual(Array.from(basel.airports, item => item.iataCode), ['BSL']);
  assert.deepEqual(Array.from(basel.metropolitanCodes), ['EAP']);
  assert.deepEqual(Array.from(basel.iataCodes), ['BSL', 'MLH', 'EAP']);
  assert.equal(new Set(airports.switzerlandAirports.filter(item => item.physicalAirportId === 'EAP').map(item => item.physicalAirportId)).size, 1);
});

test('real city spellings rank correctly, Lugano is informational, and Alpine tourist cities have no fabricated IATA', async () => {
  const api = endpoint();
  for (const [term, id] of Object.entries({ 'Zúrich': 'ch-zurich', 'Zürich': 'ch-zurich', Zurich: 'ch-zurich', Ginebra: 'ch-geneva', Genève: 'ch-geneva', Geneva: 'ch-geneva', Berna: 'ch-bern', Bern: 'ch-bern', Basilea: 'ch-basel', Basel: 'ch-basel', Interlaken: 'ch-interlaken-jungfrau', Zermatt: 'ch-zermatt-matterhorn', 'San Moritz': 'ch-st-moritz-engadin' })) {
    const results = await api.search(term);
    assert.equal(selection.destinationFromPlaceSelection(results[0])?.id, id, term);
    assert.equal(new Set(results.map(item => item.country + ':' + item.type + ':' + item.code)).size, results.length, term);
  }
  for (const term of ['Interlaken', 'Zermatt', 'San Moritz']) {
    const item = (await api.search(term))[0];
    assert.equal(item.type, 'city');
    assert.equal(item.code, null);
    assert.equal(item.country, 'Suiza');
  }
  for (const term of ['Lugano', 'LUG']) {
    const results = await api.search(term);
    assert.ok(results.some(item => item.type === 'city' && item.code === null && selection.destinationFromPlaceSelection(item)?.id === 'ch-lugano'));
    assert.ok(results.some(item => item.type === 'airport' && item.code === 'LUG' && item.scheduledPassengerService === false));
  }
  for (const term of ['BRN', 'ACH', 'SIR']) assert.ok((await api.search(term)).some(item => item.type === 'airport' && item.code === term && item.serviceNotice === 'limitedSeasonalFlights'));
});

test('licensed 960px photographs are attributed and Swiss profiles remain opt-in', () => {
  const policy = load('lib/destinations/presentation.ts').canShowDestinationAutomatically;
  for (const profile of swiss) {
    assert.equal(policy(profile), false);
    assert.equal(profile.publication.status, 'draft');
    assert.match(profile.image, /^https:\/\/thumb\.wikimedia\.org\//);
    assert.match(profile.imageSource, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(profile.imageCredit);
    assert.match(profile.imageLicense, /^CC BY/);
    assert.match(profile.imageLicenseUrl, /^https:\/\/creativecommons\.org\//);
  }
  assert.equal(catalog.getPublishedDestinationPages().length, 0);
});
