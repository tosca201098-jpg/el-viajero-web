const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Lote 1 de Asia: Golfo (Baréin, Kuwait, Catar, Omán y Arabia Saudí) y la base común de todos los países asiáticos.
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
const presentation = load('lib/destinations/presentation.ts');
const flags = load('lib/destinations/country-flags.ts');
const asia = load('lib/travelpayouts/asia-airports.ts');
const { asiaAirportNames } = load('lib/travelpayouts/asia-airport-names.ts');
const placesRoute = load('app/api/travelpayouts/places/route.ts');
const locales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
const gulf = { BH: 1, KW: 1, QA: 1, OM: 4, SA: 6 };
const gulfCards = Array.from(catalog.destinationProfiles).filter(profile => profile.countryCode in gulf);
const airportLabel = { es: 'Aeropuerto:', en: 'Airport:', fr: 'Aéroport :', de: 'Flughafen:', it: 'Aeroporto:', pt: 'Aeroporto:', ca: 'Aeroport:' };

test('the Gulf lot adds 13 draft cards in five countries, with unique ids and slugs across the whole catalog', () => {
  for (const [country, count] of Object.entries(gulf)) assert.equal(catalog.getDestinationsByCountry(country).length, count, country);
  assert.equal(gulfCards.length, 13);
  const all = Array.from(catalog.destinationProfiles);
  assert.equal(new Set(all.map(profile => profile.id)).size, all.length, 'ids are unique');
  assert.equal(new Set(all.map(profile => profile.slug)).size, all.length, 'slugs are unique');
  for (const profile of gulfCards) {
    assert.equal(profile.id, `${profile.countryCode.toLowerCase()}-${profile.slug}`);
    assert.deepEqual({ ...profile.publication }, { status: 'draft' }, profile.id);
    assert.ok(profile.iataCodes.length > 0 && profile.airports.length === profile.iataCodes.length, profile.id);
    assert.ok(/^https:\/\/(commons\.wikimedia\.org\/|images\.unsplash\.com\/photo-)/.test(profile.image) && profile.imageCredit && profile.imageLicense && profile.imageLicenseUrl, profile.id);
  }
  assert.deepEqual(Array.from(catalog.getDestinationsByCountry('OM'), profile => profile.id), ['om-muscat', 'om-salalah', 'om-duqm', 'om-sohar']);
});

test('every Gulf card has ONE name in the seven languages and complete, translated texts (no English left in the other languages)', () => {
  for (const profile of gulfCards) {
    const english = profile.translations.en;
    for (const locale of locales) {
      const text = profile.translations[locale];
      assert.equal(text.name, profile.name, `${profile.id}:${locale}: same name in every language`);
      assert.ok(!text.name.includes('/'), `${profile.id}:${locale}: no composite names`);
      assert.ok(text.description.length > 30 && text.recommendations.length === 4 && text.recommendations.every(item => item.length > 1), `${profile.id}:${locale}`);
      assert.match(text.recommendedStay, /^\d+–\d+ \S+/, `${profile.id}:${locale}`);
      if (locale !== 'es' && locale !== 'en') {
        assert.notEqual(text.description, english.description, `${profile.id}:${locale}: description translated`);
        const sentence = card => card.seasonalityNote.slice(0, card.seasonalityNote.lastIndexOf(' ' + airportLabel[locale === 'en' ? 'en' : locale]));
        const englishSentence = english.seasonalityNote.slice(0, english.seasonalityNote.lastIndexOf(' ' + airportLabel.en));
        assert.ok(sentence(text).length > 10 && sentence(text) !== englishSentence, `${profile.id}:${locale}: season sentence translated, not just the airport label`);
      }
    }
    assert.equal(new Set(locales.map(locale => profile.translations[locale].recommendedStay)).size, locales.length, `${profile.id}: stay unit per language`);
  }
});

test('the season note ends with the translated airport label and the IATA codes (same labels as Japan and South Korea)', () => {
  for (const profile of gulfCards) for (const locale of locales) {
    assert.ok(profile.translations[locale].seasonalityNote.endsWith(` ${airportLabel[locale]} ${profile.iataCodes.join(', ')}.`), `${profile.id}:${locale}: ${profile.translations[locale].seasonalityNote}`);
  }
});

test('the names that used to change by language, and the provider names, still find the Gulf card', () => {
  const byName = name => catalog.findDestinationProfile({ name })?.id;
  for (const [typed, id] of [['Muscat', 'om-muscat'], ['Maskat', 'om-muscat'], ['Mascate', 'om-muscat'], ['Riyadh', 'sa-riyadh'], ['Riad', 'sa-riyadh'],
    ['Jeddah', 'sa-jeddah'], ['Dschidda', 'sa-jeddah'], ['Yeda', 'sa-jeddah'], ['Madinah', 'sa-medina'], ['Medina', 'sa-medina'], ['Al-Ula', 'sa-alula'], ['AlUla', 'sa-alula'],
    ['Kuwait City', 'kw-kuwait-city'], ['Kuwait', 'kw-kuwait-city'], ['Ciudad de Kuwait', 'kw-kuwait-city'], ['Bahrain', 'bh-manama'], ['Manama', 'bh-manama'], ['Doha', 'qa-doha'],
    ['Sohar', 'om-sohar'], ['Salalah', 'om-salalah'], ['Duqm', 'om-duqm']]) assert.equal(byName(typed), id, typed);
  for (const [code, id] of [['BAH', 'bh-manama'], ['KWI', 'kw-kuwait-city'], ['DOH', 'qa-doha'], ['MCT', 'om-muscat'], ['DQM', 'om-duqm'], ['RUH', 'sa-riyadh'], ['MED', 'sa-medina'], ['ULH', 'sa-alula']]) {
    assert.equal(catalog.findDestinationProfile({ iataCode: code })?.id, id, code);
  }
});

test('Duqm keeps its provider city code JNJ so its card is not lost after pressing Search', () => {
  const duqm = catalog.getDestinationById('om-duqm');
  assert.deepEqual(Array.from(duqm.iataCodes), ['DQM']);
  assert.deepEqual(Array.from(duqm.metropolitanCodes), ['JNJ']);
  assert.equal(Array.from(catalog.destinationProfiles).filter(profile => profile.metropolitanCodes.includes('JNJ')).length, 1);
});

test('every airport of a Gulf card has a public name; names never promise routes, fares or schedules', () => {
  const codes = gulfCards.flatMap(profile => Array.from(profile.iataCodes));
  assert.equal(new Set(codes).size, 13);
  for (const code of codes) {
    assert.ok(asiaAirportNames[code] && /Airport$/.test(asiaAirportNames[code]), code);
    const airport = asia.asiaAirports.find(item => item.code === code);
    assert.equal(airport.name, asiaAirportNames[code], code);
    assert.equal(airport.type, 'airport');
    assert.ok(gulf[airport.country_code], code);
  }
  assert.equal(asia.asiaAirports.find(item => item.code === 'DQM').city_code, 'JNJ');
  assert.equal(asia.asiaAirports.find(item => item.code === 'MCT').city_code, 'MCT');
  for (const locale of locales) assert.equal(asia.asiaAirportTown('MCT', locale), 'Mascate', locale);
  assert.equal(asia.asiaAirportTown('ZZZ', 'es'), 'ZZZ');
  assert.deepEqual(Array.from(asia.asiaCountryCodes).sort(), Object.keys(gulf).sort());
});

test('Gulf photos: 12 cards use Unsplash photos (free licence), Duqm keeps its Commons photo with credit (checked 21-11-2026)', () => {
  const unsplashIds = {
    'bh-manama': 'wOlMEpBzwHs', 'kw-kuwait-city': 'ICJkwztWGcI', 'qa-doha': '1UF8ddEalwk', 'om-muscat': 'plMrhMCk4bQ',
    'om-salalah': 'ci3C0TxhP24', 'om-sohar': 'TXonbLwHHJU', 'sa-riyadh': '_UxsPARhtOg', 'sa-jeddah': '_ABfNIGGsZk',
    'sa-dammam': 'KW-qmD8hOx4', 'sa-medina': 'rzzS0_pMsD0', 'sa-alula': 'R1gC_gJaJ14', 'sa-abha': 'ImO6__H9wnE',
  };
  for (const [id, pageId] of Object.entries(unsplashIds)) {
    const profile = catalog.getDestinationById(id);
    assert.match(profile.image, /^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?auto=format&fit=crop&w=1600&q=80$/, id);
    assert.equal(profile.imageSource, `https://unsplash.com/photos/${pageId}`, id);
    assert.equal(profile.imageLicense, 'Unsplash License', id);
    assert.equal(profile.imageLicenseUrl, 'https://unsplash.com/license', id);
    assert.ok(profile.imageCredit, id);
  }
  assert.equal(new Set(Object.keys(unsplashIds).map(id => catalog.getDestinationById(id).image)).size, 12, 'no photo is repeated');
  const duqm = catalog.getDestinationById('om-duqm');
  assert.ok(duqm.image.startsWith('https://commons.wikimedia.org/'));
  assert.equal(duqm.imageCredit, 'Talladac'); assert.equal(duqm.imageLicense, 'CC BY-SA 4.0');
  assert.equal(catalog.getDestinationById('sa-alula').translations.es.name, 'AlUla');
});

test('the Asian airport and place helpers find Gulf airports by code, official name or alias, and cities by name', () => {
  assert.deepEqual(Array.from(asia.asiaAirportsForTerm('DOH'), item => item.code), ['DOH']);
  assert.deepEqual(Array.from(asia.asiaAirportsForTerm('Hamad International Airport'), item => item.code), ['DOH']);
  assert.deepEqual(Array.from(asia.asiaAirportsForTerm('king khalid international airport'), item => item.code), ['RUH']);
  assert.deepEqual(Array.from(asia.asiaAirportsForTerm('xyz'), item => item.code), []);
  const muscat = Array.from(asia.asiaTouristPlacesForTerm('mas'));
  assert.ok(muscat.some(place => place.name === 'Mascate' && place.code === 'MCT' && place.country_code === 'OM' && place.type === 'city'));
  const duqm = Array.from(asia.asiaTouristPlacesForTerm('Duqm'));
  assert.deepEqual(duqm.map(place => [place.code, place.city_code]), [['JNJ', 'JNJ']]);
  assert.deepEqual(Array.from(asia.asiaTouristPlacesForTerm('m')), [], 'one letter is not enough');
});

test('the places endpoint puts the Gulf airport name and aliases on the provider results', async () => {
  providerAnswers.mascate = [{ type: 'city', code: 'MCT', name: 'Mascate', country_code: 'OM', country_name: 'Omán', weight: 100 }];
  const search = async term => {
    const url = new URL('https://example.test/api/travelpayouts/places'); url.searchParams.set('term', term);
    const response = await placesRoute.GET(new Request(url));
    assert.equal(response.status, 200);
    return (await response.json()).suggestions;
  };
  const results = await search('Mascate');
  assert.ok(results.some(place => place.type === 'city' && place.code === 'MCT' && place.name === 'Mascate'), JSON.stringify(results));
  const hamad = await search('Hamad International Airport');
  assert.ok(hamad.some(place => place.type === 'airport' && place.code === 'DOH' && place.name === 'Hamad International Airport' && place.country === 'Catar'), JSON.stringify(hamad));
  const duqm = await search('DQM');
  assert.ok(duqm.some(place => place.type === 'airport' && place.code === 'DQM' && place.cityCode === 'JNJ'), JSON.stringify(duqm));
});

test('Gulf cards are not shown automatically on the home page and carry their flag', () => {
  for (const profile of gulfCards) {
    assert.equal(presentation.canShowDestinationAutomatically(profile), false, profile.id);
    assert.equal(presentation.canShowDestinationAutomatically({ country: profile.country }), false, profile.country);
  }
  assert.equal(presentation.canShowDestinationAutomatically({ country: 'España' }), true);
  for (const [country, flag] of [['BH', '🇧🇭'], ['KW', '🇰🇼'], ['QA', '🇶🇦'], ['OM', '🇴🇲'], ['SA', '🇸🇦']]) assert.equal(flags.flagForCountryCode(country), flag, country);
});

test('every Asian country code that later lots will add already has its flag and is hidden from automatic recommendations', () => {
  const asian = ['AF', 'AM', 'AZ', 'BH', 'BD', 'BT', 'BN', 'KH', 'CN', 'GE', 'IN', 'ID', 'IR', 'IQ', 'IL', 'JO', 'KZ', 'KW', 'KG', 'LA', 'LB', 'MY', 'MV', 'MN', 'MM', 'NP', 'KP', 'OM', 'PK', 'PH', 'QA', 'SA', 'SG', 'LK', 'SY', 'TW', 'TJ', 'TH', 'TL', 'TM', 'AE', 'UZ', 'VN', 'YE'];
  assert.equal(asian.length, 44);
  for (const code of asian) {
    assert.match(flags.flagForCountryCode(code) ?? '', /^[\u{1F1E6}-\u{1F1FF}]{2}$/u, code);
    assert.equal(presentation.canShowDestinationAutomatically({ countryCode: code }), false, code);
  }
  assert.equal(new Set(asian.map(code => flags.flagForCountryCode(code))).size, 44, 'no flag is shared');
});

test('the home page source wires the Asian airports, flag fallback and localized texts (no French default flag)', () => {
  const page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
  assert.ok(page.includes("from '@/lib/travelpayouts/asia-airports'"));
  assert.ok(page.includes("'JP', 'KR'].includes(profile.countryCode) || asiaCountryCodes.includes(profile.countryCode)) ? profile : undefined"), 'localized texts for Asian cards, safe when there is no profile');
  assert.ok(page.includes('asiaCountryCodes.includes(selectedCatalogProfile.countryCode) ? asiaAirports'), 'arrival airport names');
  assert.ok(page.includes('asiaCountryCodes.includes(selectedCatalogProfile.countryCode) ? asiaAirportTown'), 'arrival airport town');
  assert.ok(page.includes("flagForCountryCode(localizedCatalogProfile(destino)?.countryCode) ?? '🇫🇷'"), 'flag from the common table before any default');
});
