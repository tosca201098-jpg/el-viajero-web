const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Lote 2 de Asia: Emiratos Árabes Unidos, Líbano, Jordania e Israel.
// Se carga el código real (catálogo, plantilla, buscador y ruta de lugares); solo se simula la respuesta del proveedor.
const root = path.resolve(__dirname, '..');
function loader(globals = {}) {
  const cache = new Map();
  function load(file) {
    file = file.replaceAll('\\', '/');
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(code, { exports, Intl, URL, URLSearchParams, Request, Response, AbortSignal, ...globals,
      require: id => {
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const next = [base + '.ts', path.join(base, 'index.ts')].find(item => fs.existsSync(path.join(root, item)));
        if (!next) throw Error(id);
        return load(next);
      },
    }, { filename: file });
    return exports;
  }
  return load;
}
const providerAnswers = {};
const load = loader({ fetch: async input => ({ ok: true, json: async () => providerAnswers[new URL(input).searchParams.get('term').toLowerCase()] ?? [] }) });
const catalog = load('lib/destinations/index.ts');
const asia = load('lib/travelpayouts/asia-airports.ts');
const { asiaAirportNames } = load('lib/travelpayouts/asia-airport-names.ts');
const locales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
const lot = { AE: 5, LB: 1, JO: 2, IL: 2 };
const cards = Array.from(catalog.destinationProfiles).filter(profile => profile.countryCode in lot);
const airportLabel = { es: 'Aeropuerto:', en: 'Airport:', fr: 'Aéroport :', de: 'Flughafen:', it: 'Aeroporto:', pt: 'Aeroporto:', ca: 'Aeroport:' };
const airportsLabel = { es: 'Aeropuertos:', en: 'Airports:', fr: 'Aéroports :', de: 'Flughäfen:', it: 'Aeroporti:', pt: 'Aeroportos:', ca: 'Aeroports:' };

test('lot 2 adds 10 draft cards in four countries, with unique ids and slugs across the whole catalog', () => {
  for (const [country, count] of Object.entries(lot)) assert.equal(catalog.getDestinationsByCountry(country).length, count, country);
  assert.equal(cards.length, 10);
  assert.deepEqual(cards.map(profile => profile.id).sort(), ['ae-abu-dhabi', 'ae-al-ain', 'ae-dubai', 'ae-ras-al-khaimah', 'ae-sharjah', 'il-eilat', 'il-tel-aviv', 'jo-amman', 'jo-aqaba', 'lb-beirut']);
  const all = Array.from(catalog.destinationProfiles);
  assert.equal(new Set(all.map(profile => profile.id)).size, all.length, 'ids are unique');
  assert.equal(new Set(all.map(profile => profile.slug)).size, all.length, 'slugs are unique');
  for (const profile of cards) {
    assert.equal(profile.id, `${profile.countryCode.toLowerCase()}-${profile.slug}`);
    assert.deepEqual({ ...profile.publication }, { status: 'draft' }, profile.id);
    assert.ok(profile.iataCodes.length > 0 && profile.airports.length === profile.iataCodes.length, profile.id);
  }
  for (const country of Object.keys(lot)) assert.ok(asia.asiaCountryCodes.includes(country), country);
});

test('every lot 2 card has ONE name in the seven languages and complete, translated texts (including the season sentence)', () => {
  for (const profile of cards) {
    const english = profile.translations.en;
    for (const locale of locales) {
      const text = profile.translations[locale];
      assert.equal(text.name, profile.name, `${profile.id}:${locale}: same name in every language`);
      assert.ok(!text.name.includes('/'), `${profile.id}:${locale}: no composite names`);
      assert.ok(text.description.length > 30 && text.recommendations.length === 4 && text.recommendations.every(item => item.length > 1), `${profile.id}:${locale}`);
      assert.match(text.recommendedStay, /^\d+–\d+ \S+/, `${profile.id}:${locale}`);
      const label = profile.iataCodes.length > 1 ? airportsLabel : airportLabel;
      assert.ok(text.seasonalityNote.endsWith(` ${label[locale]} ${profile.iataCodes.join(', ')}.`), `${profile.id}:${locale}: ${text.seasonalityNote}`);
      if (locale !== 'es' && locale !== 'en') {
        assert.notEqual(text.description, english.description, `${profile.id}:${locale}: description translated`);
        const sentence = card => card.seasonalityNote.slice(0, card.seasonalityNote.lastIndexOf(' ' + label[card === english ? 'en' : locale]));
        assert.ok(sentence(text).length > 10 && sentence(text) !== sentence(english), `${profile.id}:${locale}: season sentence translated, not just the airport label`);
      }
    }
    for (const locale of ['en', 'fr', 'de', 'it', 'pt', 'ca']) {
      assert.ok(profile.translations[locale].recommendations.some((item, index) => item !== profile.translations.es.recommendations[index]), `${profile.id}:${locale}: recommendations are localized, not copied from Spanish`);
    }
  }
  const dubai = catalog.getDestinationById('ae-dubai').translations;
  assert.equal(dubai.es.recommendations[2], 'Zoco del Oro'); assert.equal(dubai.en.recommendations[2], 'Gold Souk'); assert.equal(dubai.ca.recommendations[2], 'Mercat de l’Or');
  assert.equal(catalog.getDestinationById('ae-abu-dhabi').translations.de.recommendations[0], 'Scheich-Zayid-Moschee');
});

test('the names that used to change by language, and the provider names, still find the lot 2 card', () => {
  const byName = name => catalog.findDestinationProfile({ name })?.id;
  for (const [typed, id] of [['Dubái', 'ae-dubai'], ['Dubai', 'ae-dubai'], ['Dubaï', 'ae-dubai'], ['Abu Dabi', 'ae-abu-dhabi'], ['Abu Dhabi', 'ae-abu-dhabi'], ['Abou Dabi', 'ae-abu-dhabi'],
    ['Sharjah', 'ae-sharjah'], ['Sarja', 'ae-sharjah'], ['Schardscha', 'ae-sharjah'], ['Ras al-Jaima', 'ae-ras-al-khaimah'], ['Ras Al Khaimah', 'ae-ras-al-khaimah'], ['Al Ain', 'ae-al-ain'],
    ['Beirut', 'lb-beirut'], ['Ammán', 'jo-amman'], ['Amman', 'jo-amman'], ['Aqaba', 'jo-aqaba'], ['Áqaba', 'jo-aqaba'],
    ['Tel Aviv', 'il-tel-aviv'], ['Tel Aviv-Yafo', 'il-tel-aviv'], ['Jaffa', 'il-tel-aviv'], ['Eilat', 'il-eilat'], ['Ramon Airport', 'il-eilat'], ['Ben Gurion Airport', 'il-tel-aviv']]) assert.equal(byName(typed), id, typed);
  for (const [code, id] of [['DXB', 'ae-dubai'], ['DWC', 'ae-dubai'], ['AUH', 'ae-abu-dhabi'], ['SHJ', 'ae-sharjah'], ['RKT', 'ae-ras-al-khaimah'], ['AAN', 'ae-al-ain'], ['BEY', 'lb-beirut'], ['AMM', 'jo-amman'], ['AQJ', 'jo-aqaba'], ['TLV', 'il-tel-aviv'], ['ETM', 'il-eilat']]) {
    assert.equal(catalog.findDestinationProfile({ iataCode: code })?.id, id, code);
  }
});

test('Dubai is served by two airports (DXB and DWC) and keeps its provider city code DXB', () => {
  const dubai = catalog.getDestinationById('ae-dubai');
  assert.deepEqual(Array.from(dubai.iataCodes), ['DXB', 'DWC']);
  assert.deepEqual(Array.from(dubai.metropolitanCodes), ['DXB']);
  assert.equal(dubai.translations.es.seasonalityNote.includes('Aeropuertos: DXB, DWC.'), true);
});

test('every airport of a lot 2 card has a public name that matches the airport table; names never promise routes, fares or schedules', () => {
  const codes = cards.flatMap(profile => Array.from(profile.iataCodes));
  assert.equal(codes.length, 11); assert.equal(new Set(codes).size, 11);
  for (const code of codes) {
    assert.ok(asiaAirportNames[code] && /Airport$/.test(asiaAirportNames[code]), code);
    const airport = asia.asiaAirports.find(item => item.code === code);
    assert.equal(airport.name, asiaAirportNames[code], code);
    assert.equal(airport.type, 'airport');
    assert.ok(lot[airport.country_code], code);
  }
  assert.equal(asia.asiaAirports.find(item => item.code === 'DWC').city_code, 'DXB');
  assert.equal(asia.asiaAirports.find(item => item.code === 'AUH').name, 'Zayed International Airport');
  assert.equal(asia.asiaAirports.find(item => item.code === 'ETM').name, 'Ramon Airport');
  for (const [code, town] of [['DXB', 'Dubái'], ['AUH', 'Abu Dabi'], ['BEY', 'Beirut'], ['TLV', 'Tel Aviv'], ['ETM', 'Eilat']]) assert.equal(asia.asiaAirportTown(code, 'es'), town, code);
  assert.deepEqual(Array.from(asia.asiaAirportsForTerm('Dubai'), item => item.code).sort(), ['DWC', 'DXB']);
  assert.deepEqual(Array.from(asia.asiaAirportsForTerm('Ben Gurion Airport'), item => item.code), ['TLV']);
});

test('lot 2 photos are 10 different Unsplash photos with the free licence', () => {
  const lotOnePhotos = new Set(Array.from(catalog.destinationProfiles).filter(profile => ['BH', 'KW', 'QA', 'OM', 'SA', 'JP', 'KR'].includes(profile.countryCode)).map(profile => profile.image));
  for (const profile of cards) {
    assert.match(profile.image, /^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?auto=format&fit=crop&w=1600&q=80$/, profile.id);
    assert.match(profile.imageSource, /^https:\/\/unsplash\.com\/photos\/[\w-]{11}$/, profile.id);
    assert.equal(profile.imageLicense, 'Unsplash License', profile.id);
    assert.equal(profile.imageLicenseUrl, 'https://unsplash.com/license', profile.id);
    assert.ok(profile.imageCredit, profile.id);
    assert.ok(!lotOnePhotos.has(profile.image), `${profile.id}: not a photo already used by another card`);
  }
  assert.equal(new Set(cards.map(profile => profile.image)).size, 10);
});

test('the places endpoint puts the lot 2 airport names and aliases on the provider results', async () => {
  const placesRoute = load('app/api/travelpayouts/places/route.ts');
  providerAnswers['tel aviv'] = [{ type: 'city', code: 'TLV', name: 'Tel Aviv', country_code: 'IL', country_name: 'Israel', weight: 100 }];
  const answer = await placesRoute.GET(new Request('https://destinauta.test/api/travelpayouts/places?term=Tel%20Aviv'));
  const json = await answer.json();
  const places = json.suggestions ?? json.places ?? json;
  assert.ok(places.some(place => place.code === 'TLV'), JSON.stringify(places).slice(0, 300));
  const airports = places.filter(place => place.type === 'airport');
  assert.ok(airports.every(place => place.code !== 'TLV' || place.name === 'Ben Gurion Airport'), 'Ben Gurion name');
});
