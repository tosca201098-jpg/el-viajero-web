const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { expectedCatalogTotal, expectedCountryCount } = require('./helpers/catalog-totals.cjs');

const root = path.resolve(__dirname, '..');
const locales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
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
        const next = [base + '.ts', path.join(base, 'index.ts')].find(candidate => fs.existsSync(path.join(root, candidate)));
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
const japan = load('lib/destinations/japan.ts').japanDestinations;
const airports = load('lib/travelpayouts/japan-airports.ts');
const selection = load('lib/destinations/selection.ts');
const presentation = load('lib/destinations/presentation.ts');
const expectedCodes = 'AKJ AOJ ASJ AXT CTS FKS FSZ FUJ FUK GAJ HAC HIJ HKD HNA HND HSG IBR IKI ISG ITM IWJ IWK IZO KCZ KIJ KIX KKJ KKX KMI KMJ KMQ KOJ KTD KUH KUM MBE MMB MMD MMJ MMY MSJ MYJ NGO NGS NKM NRT NTQ OBO OGN OIR OIT OKA OKD OKE OKI OKJ ONJ RIS RNJ SDJ SHB SHI SHM SYO TAK TJH TKN TKS TNE TOY TSJ TTJ UBJ UEO UKB WKJ YGJ'.split(' ');

test('Japan has 72 draft cards that cover each of the 77 currently flightable provider airports exactly once', () => {
  assert.equal(japan.length, 72);
  assert.equal(catalog.getDestinationsByCountry('JP').length, 72);
  assert.equal(catalog.destinationProfiles.length, expectedCatalogTotal(catalog));
  assert.equal(new Set(catalog.destinationProfiles.map(profile => profile.id)).size, catalog.destinationProfiles.length);
  assert.equal(new Set(catalog.destinationProfiles.map(profile => profile.slug)).size, catalog.destinationProfiles.length);
  assert.equal(new Set(catalog.destinationProfiles.map(profile => profile.countryCode)).size, expectedCountryCount(catalog));
  assert.deepEqual(Array.from(japan.flatMap(profile => profile.iataCodes)).sort(), expectedCodes.sort());
  assert.deepEqual(Array.from(new Set(japan.flatMap(profile => profile.iataCodes))).sort(), expectedCodes.sort());
  for (const profile of japan) {
    assert.equal(profile.publication.status, 'draft');
    assert.equal(presentation.canShowDestinationAutomatically(profile), false);
  }
});

test('the four metropolitan cards group only their physical airports, while Kobe stays distinct from Osaka', () => {
  assert.deepEqual(Array.from(catalog.getDestinationById('jp-tokyo').iataCodes), ['HND', 'NRT']);
  assert.deepEqual(Array.from(catalog.getDestinationById('jp-osaka').iataCodes), ['ITM', 'KIX']);
  assert.deepEqual(Array.from(catalog.getDestinationById('jp-sapporo').iataCodes), ['CTS', 'OKD']);
  assert.deepEqual(Array.from(catalog.getDestinationById('jp-nagoya').iataCodes), ['NGO', 'NKM']);
  assert.equal(catalog.findDestinationProfile({ iataCode: 'UKB' }).id, 'jp-kobe');
  assert.notEqual(catalog.findDestinationProfile({ iataCode: 'UKB' }).id, 'jp-osaka');
});

test('Miyakojima is one card with both of its airports, no invented metropolitan code, and Shimojishima is found through it', () => {
  const profile = catalog.getDestinationById('jp-miyakojima');
  assert.deepEqual(Array.from(profile.iataCodes), ['MMY', 'SHI']);
  assert.deepEqual(Array.from(profile.airports, airport => airport.iataCode), ['MMY', 'SHI']);
  assert.deepEqual(Array.from(profile.metropolitanCodes), []);
  assert.ok(!catalog.getDestinationById('jp-shimojishima'));
  assert.equal(catalog.findDestinationProfile({ iataCode: 'MMY' }).id, 'jp-miyakojima');
  assert.equal(catalog.findDestinationProfile({ iataCode: 'SHI' }).id, 'jp-miyakojima');
  assert.equal(japan.filter(card => card.iataCodes.includes('SHI')).length, 1);
  for (const alias of ['Shimojishima', 'Shimoji-shima', 'Shimojishima Airport', 'Miyako', 'Miyako Airport'])
    assert.ok(profile.aliases.includes(alias), alias);
  assert.equal(profile.recommendations.length, 4);
  for (const locale of locales) assert.ok(profile.translations[locale].seasonalityNote.includes('MMY, SHI'), locale);
});

test('every one of the 77 Japanese airports has a real, unique English airport name instead of the provisional card label', () => {
  const names = expectedCodes.map(code => [code, airports.japanAirports.find(airport => airport.code === code)?.name]);
  for (const [code, name] of names) {
    assert.ok(name, code);
    assert.ok(!name.includes(' — '), `${code}: ${name}`);
    assert.match(name, /Airport|Airfield/, code);
  }
  assert.equal(new Set(names.map(([, name]) => name)).size, 77);
  assert.equal(airports.japanAirports.find(airport => airport.code === 'KCZ').name, 'Kochi Ryoma Airport');
  assert.equal(airports.japanAirports.find(airport => airport.code === 'IWK').name, 'Iwakuni Kintaikyo Airport');
  assert.equal(airports.japanAirports.find(airport => airport.code === 'SHI').name, 'Shimojishima Airport');
});

test('all cards carry seven complete presentation translations, valid months and credited landscape imagery', () => {
  for (const profile of japan) {
    assert.match(profile.image, /^https:\/\/(commons\.wikimedia\.org\/wiki\/Special:FilePath\/|images\.unsplash\.com\/photo-)/, profile.id);
    assert.match(profile.imageSource, /^https:\/\/(commons\.wikimedia\.org\/wiki\/File:|unsplash\.com\/photos\/)/, profile.id);
    assert.ok(profile.imageCredit && profile.imageLicense && profile.imageLicenseUrl, profile.id);
    assert.equal(profile.recommendations.length, 4, profile.id);
    assert.equal(new Set(profile.recommendations).size, 4, profile.id);
    for (const key of ['bestMonths', 'lowSeasonMonths', 'highSeasonMonths'])
      assert.ok(profile[key].length && profile[key].every(month => Number.isInteger(month) && month >= 1 && month <= 12), `${profile.id} ${key}`);
    for (const locale of locales) {
      const copy = profile.translations[locale];
      assert.ok(copy.name && copy.description && copy.recommendedStay && copy.seasonalityNote, `${profile.id} ${locale}`);
      assert.equal(copy.recommendations.length, 4, `${profile.id} ${locale}`);
    }
  }
});

test('the local autocomplete preserves city identity with an empty remote result', async () => {
  const route = loader({ fetch: async () => ({ ok: true, json: async () => [] }) })('app/api/travelpayouts/places/route.ts');
  const cases = { HND: 'tokyo', NRT: 'tokyo', ITM: 'osaka', KIX: 'osaka', UKB: 'kobe', CTS: 'sapporo', NKM: 'nagoya', ISG: 'ishigaki', OGN: 'yonaguni', TJH: 'tajima',
    MMY: 'miyakojima', SHI: 'miyakojima', Shimojishima: 'miyakojima' };
  for (const [term, slug] of Object.entries(cases)) {
    const response = await route.GET(new Request(`https://example.test/api/travelpayouts/places?term=${term}`));
    assert.equal(response.status, 200, term);
    const suggestions = (await response.json()).suggestions;
    assert.ok(suggestions.length, term);
    const chosen = suggestions.find(item => selection.destinationFromPlaceSelection(item)?.id === `jp-${slug}`);
    assert.ok(chosen, term);
  }
});

test('the 46 cards with their own Unsplash photo never share it and keep the Unsplash licence data', () => {
  const own = japan.filter(profile => profile.image.startsWith('https://images.unsplash.com/'));
  assert.equal(own.length, 46);
  assert.equal(new Set(own.map(profile => profile.image)).size, own.length);
  assert.equal(new Set(own.map(profile => profile.imageSource)).size, own.length);
  for (const profile of own) {
    assert.match(profile.image, /^https:\/\/images\.unsplash\.com\/photo-[\w-]+\?auto=format&fit=crop&w=1600&q=80$/, profile.id);
    assert.match(profile.imageSource, /^https:\/\/unsplash\.com\/photos\/[\w-]{11}$/, profile.id);
    assert.equal(profile.imageLicense, 'Unsplash License', profile.id);
    assert.equal(profile.imageLicenseUrl, 'https://unsplash.com/license', profile.id);
    assert.ok(profile.imageCredit, profile.id);
  }
});
