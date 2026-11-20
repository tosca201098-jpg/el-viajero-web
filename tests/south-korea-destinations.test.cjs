const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
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

const load = loader();
const catalog = load('lib/destinations/index.ts');
const korea = load('lib/destinations/south-korea.ts').southKoreaDestinations;
const airports = load('lib/travelpayouts/south-korea-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const codes = ['CJJ', 'CJU', 'GMP', 'HIN', 'ICN', 'KPO', 'KUV', 'KWJ', 'MWX', 'PUS', 'RSU', 'TAE', 'USN', 'WJU', 'YNY'];

test('South Korea has fourteen draft cards covering the fifteen verified codes without changing editorial cards', () => {
  assert.equal(korea.length, 14);
  assert.deepEqual(Array.from(new Set(korea.flatMap(profile => profile.iataCodes))).sort(), codes);
  assert.equal(korea.find(profile => profile.slug === 'seoul').iataCodes.join(','), 'ICN,GMP');
  assert.equal(korea.filter(profile => profile.metropolitanCodes.includes('SEL')).length, 1);
  assert.equal(load('lib/destinations/featured.ts').destinations.length, 16);
  for (const profile of korea) {
    assert.equal(profile.countryCode, 'KR');
    assert.equal(profile.publication.status, 'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile), false);
  }
});

test('each card has seven localized texts, useful months and a credited landscape image', () => {
  for (const profile of korea) {
    for (const locale of ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca']) {
      const text = profile.translations[locale];
      assert.ok(text.name && text.description && text.recommendedStay && text.seasonalityNote, `${profile.id}:${locale}`);
      assert.equal(text.recommendations.length, 4);
    }
    for (const period of ['bestMonths', 'lowSeasonMonths', 'highSeasonMonths'])
      assert.ok(profile[period].every(month => Number.isInteger(month) && month >= 1 && month <= 12));
    assert.match(profile.image, /^https:\/\/images\.unsplash\.com\/|^https:\/\/commons\.wikimedia\.org\//);
    assert.ok(profile.imageSource && profile.imageCredit && profile.imageLicense && profile.imageLicenseUrl);
  }
});

test('airport lookup keeps all physical codes linked to the correct South Korean card', () => {
  assert.deepEqual(Array.from(airports.southKoreaAirports, airport => airport.code).sort(), codes);
  for (const code of codes) {
    const profile = catalog.findDestinationProfile({ iataCode: code });
    assert.ok(profile, code);
    assert.equal(profile.countryCode, 'KR');
    assert.equal(selection.accessAirportSearchInput({ countryCode: 'KR' }, code), profile.name);
  }
  assert.equal(airports.southKoreaAirports.find(airport => airport.code === 'ICN').city_code, 'SEL');
  assert.equal(airports.southKoreaAirports.find(airport => airport.code === 'GMP').city_code, 'SEL');
});

test('autocomplete can open every card when the remote provider is empty', async () => {
  const route = loader({ fetch: async () => ({ ok: true, json: async () => [] }) })('app/api/travelpayouts/places/route.ts');
  const cases = { Seoul: 'seoul', Busan: 'busan', Jeju: 'jeju', Daegu: 'daegu', Cheongju: 'cheongju', Sacheon: 'sacheon', Pohang: 'pohang-gyeongju', Gunsan: 'gunsan', Gwangju: 'gwangju', Muan: 'muan-mokpo', Yeosu: 'yeosu', Ulsan: 'ulsan', Wonju: 'wonju-hoengseong', Yangyang: 'yangyang-seoraksan' };
  for (const [term, slug] of Object.entries(cases)) {
    const response = await route.GET(new Request(`https://example.test/api/travelpayouts/places?term=${encodeURIComponent(term)}`));
    const suggestions = (await response.json()).suggestions;
    assert.ok(suggestions.length, term);
    assert.equal(selection.destinationFromPlaceSelection(suggestions[0])?.id, `kr-${slug}`, term);
  }
});

test('South Korean names and aliases do not collide inside the catalog', () => {
  for (const profile of korea) for (const name of [profile.name, ...profile.aliases]) {
    const matches = catalog.destinationProfiles.filter(candidate => [candidate.name, ...(candidate.aliases ?? [])]
      .some(value => catalog.normalizeDestinationName(value) === catalog.normalizeDestinationName(name)));
    assert.deepEqual(Array.from(matches, candidate => candidate.id), [profile.id], name);
  }
});

test('the 8 cards with their own Unsplash photo never share it and keep the Unsplash licence data', () => {
  const slugs = ['jeju', 'daegu', 'sacheon', 'pohang-gyeongju', 'gunsan', 'gwangju', 'yeosu', 'ulsan'];
  const own = korea.filter(profile => slugs.includes(profile.slug));
  assert.equal(own.length, 8);
  assert.ok(own.every(profile => profile.image.startsWith('https://images.unsplash.com/')));
  assert.equal(new Set(korea.filter(profile => !slugs.includes(profile.slug)).map(profile => profile.image).filter(image => own.some(item => item.image === image))).size, 0);
  assert.equal(new Set(own.map(profile => profile.image)).size, own.length);
  for (const profile of own) {
    assert.match(profile.imageSource, /^https:\/\/unsplash\.com\/photos\/[\w-]{11}$/, profile.id);
    assert.equal(profile.imageLicense, 'Unsplash License', profile.id);
    assert.equal(profile.imageLicenseUrl, 'https://unsplash.com/license', profile.id);
    assert.ok(profile.imageCredit, profile.id);
  }
});

const spanishWords = {
  // Palabras españolas que no existen (con esa forma) en cada idioma: si salen, la recomendación quedó sin traducir.
  en: 'Castillo|Santuario|Templo|Playa|Puente|Isla|Bahía|Puerto|Cueva|Calle|Barrio|Río|Aguas|Cascada|Fortaleza|Jardín|Telef[ée]rico|Monte|Cabo|Parque|Museo|Mercado|Costa|Lago|Palacio|Aldea|Pueblo|Plaza|Ermita',
  fr: 'Castillo|Santuario|Templo|Playa|Puente|Isla|Bahía|Puerto|Cueva|Calle|Barrio|Río|Aguas|Cascada|Fortaleza|Jardín|Telef[ée]rico|Monte|Cabo|Parque|Museo|Mercado|Costa|Lago|Palacio|Aldea|Pueblo|Plaza|Ermita',
  de: 'Castillo|Santuario|Templo|Playa|Puente|Isla|Bahía|Puerto|Cueva|Calle|Barrio|Río|Aguas|Cascada|Fortaleza|Jardín|Telef[ée]rico|Monte|Cabo|Parque|Museo|Mercado|Costa|Lago|Palacio|Aldea|Pueblo|Plaza|Ermita',
  it: 'Castillo|Templo|Playa|Puente|Isla|Bahía|Puerto|Cueva|Calle|Barrio|Río|Aguas|Cascada|Fortaleza|Jardín|Telef[ée]rico|Cabo|Parque|Mercado|Palacio|Aldea|Pueblo|Plaza|Ermita',
  pt: 'Castillo|Santuario|Playa|Puente|Isla|Bahía|Puerto|Cueva|Calle|Barrio|Río|Aguas|Cascada|Jardín|Museo|Palacio|Aldea|Pueblo|Plaza|Ermita',
  ca: 'Castillo|Santuario|Templo|Playa|Puente|Isla|Bahía|Puerto|Cueva|Calle|Barrio|Río|Aguas|Fortaleza|Jardín|Telef[ée]rico|Monte|Cabo|Parque|Museo|Mercado|Lago|Palacio|Aldea|Pueblo|Plaza',
};
const untranslated = locale => new RegExp(`(?<![\\p{L}])(?:${spanishWords[locale]})(?![\\p{L}])`, 'u');

test('every South Korean card has its four recommendations translated into the six other languages, with the Spanish list untouched', () => {
  assert.equal(korea.length, 14);
  const locales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
  for (const profile of korea) {
    const spanish = Array.from(profile.translations.es.recommendations);
    assert.deepEqual(Array.from(profile.recommendations), spanish, profile.id + ': top-level list stays Spanish');
    for (const locale of locales.filter(locale => locale !== 'es')) {
      const list = Array.from(profile.translations[locale].recommendations);
      assert.equal(list.length, 4, `${profile.id}:${locale}`);
      assert.ok(list.every(place => typeof place === 'string' && place.trim().length > 1), `${profile.id}:${locale}`);
      assert.equal(new Set(list).size, 4, `${profile.id}:${locale}: four different places`);
      for (const place of list) assert.ok(!untranslated(locale).test(place), `${profile.id}:${locale}: still Spanish → ${place}`);
    }
  }
  const text = (slug, locale) => Array.from(korea.find(profile => profile.slug === slug).translations[locale].recommendations);
  assert.deepEqual(text('seoul', 'en'), ['Gyeongbokgung Palace', 'Bukchon Hanok Village', 'N Seoul Tower', 'Cheonggyecheon Stream']);
  assert.equal(text('busan', 'fr')[0], 'Plage de Haeundae');
  assert.equal(text('jeju', 'de')[1], 'Jeongbang-Wasserfall');
});

test('the airport line of every seasonality note uses the word of its own language, with the codes and the Spanish text untouched', () => {
  const locales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
  const one = { es: 'Aeropuerto:', en: 'Airport:', fr: 'Aéroport :', de: 'Flughafen:', it: 'Aeroporto:', pt: 'Aeroporto:', ca: 'Aeroport:' };
  const many = { es: 'Aeropuertos:', en: 'Airports:', fr: 'Aéroports :', de: 'Flughäfen:', it: 'Aeroporti:', pt: 'Aeroportos:', ca: 'Aeroports:' };
  for (const profile of korea) {
    const codes = Array.from(profile.iataCodes).join(', ');
    for (const locale of locales) {
      const note = profile.translations[locale].seasonalityNote;
      const label = (profile.iataCodes.length > 1 ? many : one)[locale];
      assert.ok(note.endsWith(` ${label} ${codes}.`), `${profile.id}:${locale}: ${note}`);
      if (locale !== 'es') assert.ok(!/Aeropuerto/.test(note), `${profile.id}:${locale}: still Spanish`);
    }
  }
  assert.ok(korea.find(card => card.id === 'kr-seoul').translations.en.seasonalityNote.endsWith(' Airports: ICN, GMP.'));
  assert.ok(korea.find(card => card.id === 'kr-jeju').translations.ca.seasonalityNote.endsWith(' Aeroport: CJU.'));
  assert.ok(korea.find(card => card.id === 'kr-seoul').translations.es.seasonalityNote.endsWith(' Aeropuertos: ICN, GMP.'));
});
