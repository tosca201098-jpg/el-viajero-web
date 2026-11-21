const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Lote 3 de Asia: Cáucaso y Asia Central (Armenia, Azerbaiyán, Georgia, Kazajistán, Kirguistán, Tayikistán, Turkmenistán y Uzbekistán).
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
const lot = { AM: 2, AZ: 3, GE: 3, KZ: 4, KG: 2, TJ: 2, TM: 2, UZ: 4 };
const cards = Array.from(catalog.destinationProfiles).filter(profile => profile.countryCode in lot);
const airportLabel = { es: 'Aeropuerto:', en: 'Airport:', fr: 'Aéroport :', de: 'Flughafen:', it: 'Aeroporto:', pt: 'Aeroporto:', ca: 'Aeroport:' };
const airportsLabel = { es: 'Aeropuertos:', en: 'Airports:', fr: 'Aéroports :', de: 'Flughäfen:', it: 'Aeroporti:', pt: 'Aeroportos:', ca: 'Aeroports:' };

test('lot 3 adds 22 draft cards in eight countries, with unique ids and slugs across the whole catalog', () => {
  for (const [country, count] of Object.entries(lot)) assert.equal(catalog.getDestinationsByCountry(country).length, count, country);
  assert.equal(cards.length, 22);
  assert.deepEqual(cards.map(profile => profile.id).sort(), ['am-gyumri', 'am-yerevan', 'az-baku', 'az-ganja', 'az-nakhchivan'].concat(['ge-batumi', 'ge-kutaisi', 'ge-tbilisi', 'kg-bishkek', 'kg-osh', 'kz-aktau', 'kz-almaty', 'kz-astana', 'kz-shymkent', 'tj-dushanbe', 'tj-khujand', 'tm-ashgabat', 'tm-turkmenbashi', 'uz-bukhara', 'uz-samarkand', 'uz-tashkent', 'uz-urgench-khiva']).sort());
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

test('every lot 3 card has ONE name in the seven languages and complete, translated texts (including the season sentence)', () => {
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
  const registan = catalog.getDestinationById('uz-samarkand').translations;
  assert.equal(registan.es.recommendations[2], 'Necrópolis Shah-i-Zinda'); assert.equal(registan.fr.recommendations[2], 'Nécropole Shah-i-Zinda'); assert.equal(registan.ca.recommendations[2], 'Necròpolis Shah-i-Zinda');
  assert.equal(catalog.getDestinationById('kz-astana').translations.de.recommendations[1], 'Hazrat-Sultan-Moschee');
  assert.equal(catalog.getDestinationById('uz-urgench-khiva').name, 'Urgench');
});

test('the names that used to change by language, and the provider names, still find the lot 3 card', () => {
  const byName = name => catalog.findDestinationProfile({ name })?.id;
  for (const [typed, id] of [['Ereván', 'am-yerevan'], ['Yerevan', 'am-yerevan'], ['Gyumri', 'am-gyumri'],
    ['Bakú', 'az-baku'], ['Baku', 'az-baku'], ['Ganja', 'az-ganja'], ['Gyandzha', 'az-ganja'], ['Nakhchivan', 'az-nakhchivan'], ['Najicheván', 'az-nakhchivan'],
    ['Tiflis', 'ge-tbilisi'], ['Tbilisi', 'ge-tbilisi'], ['Batumi', 'ge-batumi'], ['Kutaisi', 'ge-kutaisi'],
    ['Almaty', 'kz-almaty'], ['Astaná', 'kz-astana'], ['Astana', 'kz-astana'], ['Nur-Sultan', 'kz-astana'], ['Shymkent', 'kz-shymkent'], ['Shimkent', 'kz-shymkent'], ['Aktau', 'kz-aktau'],
    ['Biskek', 'kg-bishkek'], ['Bishkek', 'kg-bishkek'], ['Osh', 'kg-osh'],
    ['Dusambé', 'tj-dushanbe'], ['Dushanbe', 'tj-dushanbe'], ['Juyand', 'tj-khujand'], ['Khodjent', 'tj-khujand'], ['Khujand', 'tj-khujand'],
    ['Asjabad', 'tm-ashgabat'], ['Aşgabat', 'tm-ashgabat'], ['Ashgabat', 'tm-ashgabat'], ['Turkmenbashi', 'tm-turkmenbashi'],
    ['Taskent', 'uz-tashkent'], ['Tashkent', 'uz-tashkent'], ['Samarcanda', 'uz-samarkand'], ['Samarkand', 'uz-samarkand'], ['Bujará', 'uz-bukhara'], ['Bujara', 'uz-bukhara'], ['Bukhara', 'uz-bukhara'],
    ['Urgench', 'uz-urgench-khiva'], ['Jiva', 'uz-urgench-khiva'], ['Khiva', 'uz-urgench-khiva']]) assert.equal(byName(typed), id, typed);
  for (const [code, id] of [['EVN', 'am-yerevan'], ['LWN', 'am-gyumri'], ['GYD', 'az-baku'], ['GNJ', 'az-ganja'], ['NAJ', 'az-nakhchivan'], ['TBS', 'ge-tbilisi'], ['BUS', 'ge-batumi'], ['KUT', 'ge-kutaisi'],
    ['ALA', 'kz-almaty'], ['NQZ', 'kz-astana'], ['CIT', 'kz-shymkent'], ['SCO', 'kz-aktau'], ['BSZ', 'kg-bishkek'], ['OSS', 'kg-osh'], ['DYU', 'tj-dushanbe'], ['LBD', 'tj-khujand'],
    ['ASB', 'tm-ashgabat'], ['KRW', 'tm-turkmenbashi'], ['TAS', 'uz-tashkent'], ['SKD', 'uz-samarkand'], ['BHK', 'uz-bukhara'], ['UGC', 'uz-urgench-khiva']]) {
    assert.equal(catalog.findDestinationProfile({ iataCode: code })?.id, id, code);
  }
});

test('Ganja uses GNJ and Bishkek uses BSZ (the old KVD and FRU codes are not used), and Baku keeps its provider city code BAK', () => {
  assert.deepEqual(Array.from(catalog.getDestinationById('az-ganja').iataCodes), ['GNJ']);
  assert.deepEqual(Array.from(catalog.getDestinationById('kg-bishkek').iataCodes), ['BSZ']);
  assert.deepEqual(Array.from(catalog.getDestinationById('az-baku').iataCodes), ['GYD']);
  assert.deepEqual(Array.from(catalog.getDestinationById('az-baku').metropolitanCodes), ['BAK']);
  for (const old of ['KVD', 'FRU']) assert.equal(catalog.findDestinationProfile({ iataCode: old }), undefined, old);
});

test('every airport of a lot 3 card has a public name that matches the airport table; names never promise routes, fares or schedules', () => {
  const codes = cards.flatMap(profile => Array.from(profile.iataCodes));
  assert.equal(codes.length, 22); assert.equal(new Set(codes).size, 22);
  for (const code of codes) {
    assert.ok(asiaAirportNames[code] && /Airport$/.test(asiaAirportNames[code]), code);
    const airport = asia.asiaAirports.find(item => item.code === code);
    assert.equal(airport.name, asiaAirportNames[code], code);
    assert.equal(airport.type, 'airport');
    assert.ok(lot[airport.country_code], code);
  }
  assert.equal(asia.asiaAirports.find(item => item.code === 'NQZ').name, 'Nursultan Nazarbayev International Airport');
  assert.equal(asia.asiaAirports.find(item => item.code === 'BSZ').name, 'Manas International Airport');
  assert.equal(asia.asiaAirports.find(item => item.code === 'GYD').name, 'Heydar Aliyev International Airport');
  for (const [code, town] of [['EVN', 'Ereván'], ['GYD', 'Bakú'], ['TBS', 'Tiflis'], ['NQZ', 'Astaná'], ['BSZ', 'Biskek'], ['UGC', 'Urgench']]) assert.equal(asia.asiaAirportTown(code, 'es'), town, code);
  assert.deepEqual(Array.from(asia.asiaAirportsForTerm('Heydar Aliyev International Airport'), item => item.code), ['GYD']);
});

test('lot 3 photos are 22 different photos: 17 from Unsplash (free licence) and 5 from Wikimedia Commons with their real author and licence', () => {
  const others = new Set(Array.from(catalog.destinationProfiles).filter(profile => !(profile.countryCode in lot) && ['BH', 'KW', 'QA', 'OM', 'SA', 'AE', 'LB', 'JO', 'IL', 'JP', 'KR'].includes(profile.countryCode)).map(profile => profile.image));
  let unsplash = 0; const commons = [];
  for (const profile of cards) {
    assert.ok(profile.imageCredit && profile.imageLicense && profile.imageLicenseUrl, profile.id);
    assert.ok(!others.has(profile.image), `${profile.id}: not a photo already used by another card`);
    if (profile.image.startsWith('https://images.unsplash.com/')) {
      unsplash++;
      assert.match(profile.image, /^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?auto=format&fit=crop&w=1600&q=80$/, profile.id);
      assert.match(profile.imageSource, /^https:\/\/unsplash\.com\/photos\/[\w-]{11}$/, profile.id);
      assert.equal(profile.imageLicense, 'Unsplash License', profile.id);
      assert.equal(profile.imageLicenseUrl, 'https://unsplash.com/license', profile.id);
    } else {
      commons.push(profile.id);
      assert.match(profile.image, /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//, profile.id);
      assert.match(profile.imageSource, /^https:\/\/commons\.wikimedia\.org\/wiki\/File:/, profile.id);
      assert.ok(!/Autor indicado|Unknown/i.test(profile.imageCredit), `${profile.id}: real author`);
    }
  }
  assert.equal(unsplash, 17);
  assert.deepEqual(commons.sort(), ['az-ganja', 'kz-shymkent', 'tj-dushanbe', 'tj-khujand', 'tm-turkmenbashi']);
  assert.equal(new Set(cards.map(profile => profile.image)).size, 22);
  assert.equal(catalog.getDestinationById('az-ganja').imageCredit, 'İlkin Mete');
});

test('the places endpoint puts the lot 3 airport names and aliases on the provider results', async () => {
  const placesRoute = load('app/api/travelpayouts/places/route.ts');
  providerAnswers['baku'] = [{ type: 'city', code: 'BAK', name: 'Baku', country_code: 'AZ', country_name: 'Azerbaijan', weight: 100 }];
  const answer = await placesRoute.GET(new Request('https://destinauta.test/api/travelpayouts/places?term=Baku'));
  const json = await answer.json();
  const places = json.suggestions ?? json.places ?? json;
  assert.ok(places.some(place => place.code === 'BAK' || place.code === 'GYD'), JSON.stringify(places).slice(0, 300));
  const airports = places.filter(place => place.type === 'airport');
  assert.ok(airports.every(place => place.code !== 'GYD' || place.name === 'Heydar Aliyev International Airport'), 'Heydar Aliyev name');
});
