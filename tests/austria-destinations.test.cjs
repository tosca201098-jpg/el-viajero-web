const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const baseline = require('./fixtures/pre-austria-catalog.json');
const places = require('./fixtures/austria-places.json');
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
const austrian = load('lib/destinations/austria.ts').austriaDestinations;
const airports = load('lib/travelpayouts/austria-airports.ts');
const selection = load('lib/destinations/selection.ts');
const localization = load('lib/destinations/localization.ts');
const expected = ['vienna','salzburg','innsbruck','graz','linz','klagenfurt','hallstatt','wachau-valley','zell-am-see','kitzbuehel','bregenz','bad-gastein'];

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

test('Austria remains intact in the 221-profile catalog without changing any earlier profile or editorial page', () => {
  assert.equal(baseline.profiles.length, 149);
  assert.deepEqual(Array.from(austrian, p => p.slug), expected);
  assert.equal(catalog.destinationProfiles.length, 221);
  assert.equal(new Set(catalog.destinationProfiles.map(p => p.id)).size, 221);
  assert.equal(new Set(catalog.destinationProfiles.map(p => p.slug)).size, 221);
  assert.deepEqual(Array.from(catalog.destinationProfiles.slice(0, 149), p => p.id), baseline.profiles.map(p => p.id));
  for (const item of baseline.profiles) assert.equal(digest(catalog.getDestinationById(item.id)), item.sha256, item.id);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations), baseline.featuredSha256);
  assert.equal(load('lib/destinations/featured.ts').destinations.length, 16);
  for (const [season, hash] of Object.entries(baseline.seasons))
    assert.equal(digest(fs.readFileSync(path.join(root, 'app/temporadas', season, 'page.tsx'), 'utf8').replace(/\r\n/g, '\n')), hash, season);
  for (const [file, hash] of Object.entries(baseline.monthPages))
    assert.equal(digest(fs.readFileSync(path.join(root, 'app/viajes-baratos/[mes]', file), 'utf8').replace(/\r\n/g, '\n')), hash, file);
  assert.equal(catalog.getDestinationsByCountry('AT').length, 12);
  assert.equal(catalog.getPublishedDestinationPages().length, 0);
});

for (const locale of locales) test(locale + ': complete translated Austrian tourism content and transport advice', () => {
  for (const profile of austrian) {
    assert.equal(profile.countryCode, 'AT');
    assert.ok(profile.federalStates.length);
    assert.deepEqual(Object.keys(profile.translations).sort(), locales.slice().sort());
    const text = profile.translations[locale];
    for (const key of ['name','description','recommendedStay','seasonalityNote'])
      assert.ok(text[key]?.trim(), profile.id + ':' + locale + ':' + key);
    assert.equal(text.recommendations.length, 4);
    assert.equal(new Set(text.recommendations).size, 4);
    assert.equal(catalog.findDestinationProfile({ name: text.name }), profile);
    assert.equal(localization.getDestinationCountryName(profile, locale), new Intl.DisplayNames([locale], { type: 'region' }).of('AT'));
    for (const key of ['bestMonths','lowSeasonMonths','highSeasonMonths'])
      assert.ok(profile[key].length && profile[key].every(month => Number.isInteger(month) && month >= 1 && month <= 12));
    assert.match(text.seasonalityNote, /EUR|euro|Euro|euros|l’euro/);
  }
});

test('airports are real Austrian physical airports; tourist towns require separate ground access', () => {
  const own = { vienna:'VIE', salzburg:'SZG', innsbruck:'INN', graz:'GRZ', linz:'LNZ', klagenfurt:'KLU' };
  assert.equal(airports.austriaAirports.length, 6);
  for (const [slug, code] of Object.entries(own)) {
    const profile = catalog.getDestinationById('at-' + slug);
    assert.deepEqual(Array.from(profile.airports, a => a.iataCode), [code]);
    assert.deepEqual(Array.from(profile.iataCodes), [code]);
    assert.equal(catalog.findDestinationProfile({ iataCode: code }), profile);
  }
  for (const slug of expected.slice(6)) {
    const profile = catalog.getDestinationById('at-' + slug);
    assert.equal(profile.airports.length, 0);
    assert.equal(profile.iataCodes.length, 0);
    assert.ok(profile.accessAirports.length);
    assert.ok(profile.seasonalityNote.includes(profile.accessAirports[0].iataCode));
    for (const airport of profile.accessAirports) assert.match(airport.iataCode, /^[A-Z]{3}$/);
  }
  assert.deepEqual(Array.from(catalog.getDestinationById('at-bregenz').accessAirports, a => a.countryCode), ['DE','CH','CH']);
  assert.equal(selection.accessAirportSearchInput(catalog.getDestinationById('at-bregenz'), 'FDH'), 'Friedrichshafen');
  assert.equal(selection.accessAirportSearchInput(catalog.getDestinationById('at-hallstatt'), 'SZG'), 'Salzburgo');
});

test('provider-backed city codes, tourist suggestions, accents and aliases resolve to Austrian cards', async () => {
  const api = endpoint();
  for (const [term, slug] of Object.entries({ VIE:'vienna', SZG:'salzburg', INN:'innsbruck', GRZ:'graz', LNZ:'linz', KLU:'klagenfurt',
    Viena:'vienna', Salzburgo:'salzburg', Innsbruck:'innsbruck', Graz:'graz', Linz:'linz', Klagenfurt:'klagenfurt',
    Hallstatt:'hallstatt', 'Zell am See':'zell-am-see', Kitzbühel:'kitzbuehel', Bregenz:'bregenz', Wachau:'wachau-valley', 'Bad Gastein':'bad-gastein' })) {
    const first = (await api.search(term))[0];
    assert.ok(first, term);
    assert.equal(selection.destinationFromPlaceSelection(first)?.id, 'at-' + slug, term);
    assert.ok(!first.code || /^[A-Z]{3}$/.test(first.code));
    assert.equal(new Set((await api.search(term)).map(item => item.country + ':' + item.type + ':' + item.code)).size,
      (await api.search(term)).length, term);
  }
  for (const term of ['Hallstatt','Zell am See','Kitzbühel','Bregenz','Wachau','Bad Gastein']) {
    const first = (await api.search(term))[0];
    assert.equal(first.type, 'city');
    assert.equal(first.code, null);
    assert.equal(first.country, 'Austria');
  }
  assert.ok(api.calls.every(call => call.hostname === 'autocomplete.travelpayouts.com'));
  assert.equal(catalog.findDestinationProfile({ name: 'KITZBUHEL' })?.id, 'at-kitzbuehel');
});

test('all Austrian images have licensed Wikimedia attribution and remain editorially hidden', () => {
  const policy = load('lib/destinations/presentation.ts').canShowDestinationAutomatically;
  for (const profile of austrian) {
    assert.equal(policy(profile), false);
    assert.equal(profile.publication.status, 'draft');
    assert.match(profile.image, /^https:\/\/thumb\.wikimedia\.org\/.*\/960px-/);
    assert.match(profile.imageSource, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(profile.imageCredit);
    assert.match(profile.imageLicense, /^CC BY(?:-SA)?/);
    assert.match(profile.imageLicenseUrl, /^https:\/\/creativecommons\.org\//);
  }
});
