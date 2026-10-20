const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
  }).outputText;
  vm.runInNewContext(output, {
    exports, require: id => {
      if (Object.prototype.hasOwnProperty.call(dependencies, id)) return dependencies[id];
      throw new Error('Unexpected runtime dependency: ' + id);
    }, Intl, ...globals,
  }, { filename: file });
  return exports;
}
const spain = load('lib/destinations/spain.ts');
const portugal = load('lib/destinations/portugal.ts');
const france = load('lib/destinations/france.ts');
const library = load('lib/destinations/index.ts', { './spain': spain, './portugal': portugal, './france': france });
const localization = load('lib/destinations/localization.ts');
const manifest = require('./fixtures/destination-legacy-digests.json');
const legacyProfiles = library.destinationProfiles.filter(profile => ['ES', 'PT'].includes(profile.countryCode));
const locales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];

function sorted(value) {
  if (Array.isArray(value)) return Array.from(value, sorted);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])]));
  return value;
}

test('all 65 legacy destinations keep stable, unique IDs and slugs', () => {
  assert.equal(legacyProfiles.length, 65);
  assert.equal(spain.spainDestinations.length, 43);
  assert.equal(portugal.portugalDestinations.length, 22);
  assert.equal(new Set(library.destinationProfiles.map(d => d.id)).size, 77);
  assert.equal(new Set(library.destinationProfiles.map(d => d.slug)).size, 77);
  assert.deepEqual(Array.from(legacyProfiles, d => ({ id: d.id, slug: d.slug })),
    manifest.map(({ id, slug }) => ({ id, slug })));
  for (const destination of legacyProfiles) {
    assert.match(destination.id, /^(es|pt)-[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.match(destination.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(destination.id.startsWith(destination.countryCode.toLowerCase() + '-'));
  }
});

test('names, aliases, airports, tourism content, months and image licenses are unchanged', () => {
  for (const destination of legacyProfiles) {
    const { id, slug, countryCode, airports, metropolitanCodes, ...legacy } = destination;
    const digest = crypto.createHash('sha256').update(JSON.stringify(sorted(legacy))).digest('hex');
    assert.equal(digest, manifest.find(item => item.id === id)?.legacySha256, id);
  }
});

test('country groups and references return the same canonical objects with France registered', () => {
  assert.equal(library.getDestinationsByCountry(' es '), spain.spainDestinations);
  assert.equal(library.getDestinationsByCountry('PT'), portugal.portugalDestinations);
  assert.equal(library.getDestinationsByCountry('FR'), france.franceDestinations);
  assert.equal(library.getDestinationsByCountry('__proto__').length, 0);
  for (const profile of library.destinationProfiles) {
    assert.equal(library.getDestinationById(profile.id), profile);
    assert.equal(library.getDestinationBySlug(profile.slug), profile);
    assert.equal(library.findDestinationProfile({ name: profile.name }), profile);
    for (const code of profile.iataCodes) assert.equal(library.findDestinationProfile({ iataCode: code }), profile);
  }
  assert.equal(library.getDestinationById('missing'), undefined);
  assert.equal(library.getDestinationBySlug('missing'), undefined);
});

test('Tenerife remains one tourist destination with two physical airports and unchanged pricing codes', () => {
  const tenerife = library.getDestinationById('es-tenerife');
  assert.deepEqual(Array.from(tenerife.airports, a => a.iataCode), ['TFN', 'TFS']);
  assert.deepEqual(Array.from(tenerife.iataCodes), ['TFN', 'TFS']);
  assert.equal(library.findDestinationProfile({ iataCode: 'TFN' }), tenerife);
  assert.equal(library.findDestinationProfile({ iataCode: 'TFS' }), tenerife);
  assert.equal(tenerife.metropolitanCodes.length, 0);
  for (const destination of legacyProfiles) {
    assert.deepEqual(Array.from(destination.airports, a => a.iataCode), Array.from(destination.iataCodes));
    for (const code of destination.auxiliaryCodes ?? []) {
      assert.ok(!destination.airports.some(airport => airport.iataCode === code));
      assert.ok(!destination.iataCodes.includes(code));
    }
  }
});

test('countries are localized from ISO codes in all seven languages, never guessed as Portugal', () => {
  const countries = [{ countryCode: 'ES', country: 'España' }, { countryCode: 'PT', country: 'Portugal' },
    { countryCode: 'FR', country: 'Francia' }, { countryCode: 'IT', country: 'Italia' },
    { countryCode: 'GB', country: 'Reino Unido' }, { countryCode: 'DE', country: 'Alemania' }];
  for (const locale of locales) {
    const names = new Intl.DisplayNames([locale], { type: 'region' });
    for (const country of countries) assert.equal(localization.getDestinationCountryName(country, locale), names.of(country.countryCode));
    assert.equal(localization.getDestinationCountryName({ countryCode: '', country: 'País sin código' }, locale), 'País sin código');
  }
  assert.equal(localization.getDestinationCountryName({ countryCode: 'FR', country: 'Francia' }, 'es'), 'Francia');
});

test('monthly rendering uses the country helper for a future country without adding it to the catalog', () => {
  const translations = load('lib/i18n/translations.ts');
  const createElement = (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) });
  const textNodes = node => node == null || node === false ? ''
    : typeof node === 'object' ? (node.children ?? []).map(textNodes).join(' ') : String(node);
  for (const language of locales) {
    const component = load('app/viajes-baratos/[mes]/MonthlyDestinations.tsx', {
      'next/link': { default: () => null },
      '@/app/components/LanguageSelector': { default: () => null },
      '@/app/components/LanguageProvider': { useLanguage: () => ({ language, t: (key, vars) => translations.translate(language, key, vars) }) },
      '@/lib/destinations/seasonality': { formatMonthName: () => 'Mes' },
      '@/lib/destinations/localization': localization,
      '@/lib/destinations/presentation': load('lib/destinations/presentation.ts', { './index': library }),
    }, { React: { createElement } }).default;
    const fixture = { ...library.destinationProfiles[0], countryCode: 'IT', country: 'Italia' };
    const tree = component({ month: 4, recommendations: [{ destination: fixture, reason: 'best' }] });
    const text = textNodes(tree);
    assert.ok(text.includes(new Intl.DisplayNames([language], { type: 'region' }).of('IT')), language);
    assert.ok(!text.includes(new Intl.DisplayNames([language], { type: 'region' }).of('PT')), language);
  }
});

test('localized presentation falls back per field and never changes stable identity or flight data', () => {
  const original = library.getDestinationById('es-madrid');
  const fixture = { ...original, translations: { es: { description: 'Descripción base' }, fr: { name: 'Madrid en français' } } };
  const before = JSON.stringify(fixture);
  assert.equal(localization.getDestinationText(fixture, 'fr').name, 'Madrid en français');
  assert.equal(localization.getDestinationText(fixture, 'fr').description, 'Descripción base');
  for (const locale of locales) {
    const text = localization.getDestinationText(original, locale);
    assert.equal(text.name, original.name);
    assert.equal(text.description, original.description);
    assert.equal(text.recommendations, original.recommendations);
  }
  assert.equal(JSON.stringify(fixture), before);
});

test('publication remains opt-in and does not publish existing placeholder routes', () => {
  assert.equal(library.getPublishedDestinationPages().length, 0);
  const madrid = library.getDestinationById('es-madrid');
  const pages = library.getPublishedDestinationPages([
    madrid, { ...madrid, publication: { status: 'draft' } }, { ...madrid, publication: { status: 'published' } },
  ]);
  assert.deepEqual(Array.from(pages, p => ({ ...p })), [{ destinationId: 'es-madrid', path: '/destinos/madrid' }]);
});
