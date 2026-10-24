const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, deps = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(code, { exports, require: id => deps[id] ?? require(id), URLSearchParams, Date, React: require('react') });
  return exports;
}
const hotels = load('lib/stay22/hotels.ts');
const today = new Date('2026-10-24T12:00:00Z');
const search = { ...hotels.hotelDefaults, destination: 'Barcelona, España', checkin: '2026-11-20', checkout: '2026-11-23' };

test('official dynamic Maps endpoint carries city, stay, occupancy, total price, language and affiliate attribution', () => {
  const url = new URL(hotels.stay22MapSrc({ ...search, adults: '4', children: '1', infants: '1', rooms: '2' }, 'fr', today));
  assert.equal(url.origin + url.pathname, 'https://www.stay22.com/embed/gm');
  for (const [key, value] of Object.entries({ aid: 'destinauta', address: 'Barcelona, España', checkin: search.checkin,
    checkout: search.checkout, adults: '4', children: '1', infants: '1', rooms: '2', currency: 'EUR', ljs: 'fr', priceper: 'total' })) {
    assert.equal(url.searchParams.get(key), value, key);
  }
  const paris = new URL(hotels.stay22MapSrc({ ...search, destination: 'París, Francia' }, 'en', today));
  assert.equal(paris.searchParams.get('address'), 'París, Francia');
  assert.equal(new URL(hotels.stay22MapSrc(search, 'ca', today)).searchParams.get('ljs'), 'es');
});

test('invalid dates, incomplete stays, impossible occupancy and unknown currencies never load a priced map', () => {
  for (const invalid of [
    { checkin: '' }, { checkout: '' }, { checkin: '2026-11-31' }, { checkin: '2026-10-23' },
    { checkout: '2026-11-20' }, { checkout: '2026-11-19' }, { checkout: '2029-01-01' },
    { adults: '0' }, { adults: '2.5' }, { adults: '11' }, { children: '-1' }, { infants: 'NaN' },
    { rooms: '0' }, { rooms: '3' }, { currency: 'INVALID' }, { destination: '   ' }, { destination: 'Paris\nFrance' },
  ]) assert.equal(hotels.stay22MapSrc({ ...search, ...invalid }, 'es', today), null, JSON.stringify(invalid));
  assert.ok(hotels.validHotelSearch({ ...search, checkin: '2028-02-29', checkout: '2028-03-01' }, today));
  assert.equal(hotels.validHotelSearch({ ...search, checkin: '2027-02-29' }, today), false);
});

test('home/card URL round trip preserves special city names and all editable values without accepting another URL origin', () => {
  const form = { ...search, destination: 'Aix-en-Provence, France & Côte', rooms: '2', adults: '3' };
  const url = new URL(hotels.hotelsHref(form), 'https://destinauta.example');
  assert.equal(url.pathname, '/hoteles');
  assert.equal(url.origin, 'https://destinauta.example');
  for (const [key, value] of Object.entries(form)) assert.equal(url.searchParams.get(key), value);
  assert.equal(new URL(hotels.hotelsHref({ destination: 'https://example.org' }), url).pathname, '/hoteles');
});

test('flight defaults require exact calendar dates and valid adult counts, remain editable and discard incomplete trips', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(hotels.hotelFlightDefaults({ departureDate: search.checkin, returnDate: search.checkout, travelers: 3 }, today))),
    { checkin: search.checkin, checkout: search.checkout, adults: '3' });
  for (const context of [
    { departureDate: '2026-10-23', returnDate: search.checkout, travelers: 2 },
    { departureDate: search.checkin, travelers: 2 },
    { departureDate: search.checkin, returnDate: search.checkin, travelers: 2 },
    { departureDate: search.checkin, returnDate: search.checkout, travelers: 0 },
  ]) assert.equal(Object.keys(hotels.hotelFlightDefaults(context, today)).length, 0);
});

test('hotel page resolves catalog city names and refuses to silently normalize malformed occupancy to a priced map', async () => {
  const page = load('app/hoteles/page.tsx', {
    './HotelsSearch': { default: 'HotelsSearch' }, '@/lib/stay22/hotels': hotels,
    '@/lib/destinations': { findDestinationProfile: ({ name }) => name === 'Barcelona' ? { name: 'Barcelona', country: 'España' } : undefined },
  }).default;
  const element = await page({ searchParams: Promise.resolve({ destination: 'Barcelona', adults: '-1' }) });
  assert.equal(element.props.initial.destination, 'Barcelona, España');
  assert.equal(element.props.initial.adults, '-1');
  assert.equal(hotels.stay22MapSrc(element.props.initial, 'es', today), null);
  const duplicate = await page({ searchParams: Promise.resolve({ ...search, adults: ['1', '4'] }) });
  assert.equal(duplicate.props.initial.adults, '');
  assert.equal(hotels.stay22MapSrc(duplicate.props.initial, 'es', today), null);
});

test('rendered hotel page has editable fields and no map for missing or invalid dates', () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  const React = require('react');
  const Search = load('app/hoteles/HotelsSearch.tsx', {
    '@/lib/stay22/hotels': hotels,
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    '@/app/components/LanguageSelector': { default: () => null },
    '@/app/components/LanguageProvider': { useLanguage: () => ({ language: 'es', t: key => key }) },
  }).default;
  for (const initial of [hotels.hotelDefaults, { ...search, checkin: '2026-11-31' }]) {
    const html = renderToStaticMarkup(React.createElement(Search, { initial }));
    assert.doesNotMatch(html, /<iframe/);
    for (const name of Object.keys(hotels.hotelDefaults)) assert.ok(html.includes(`name="${name}"`), name);
  }
  const future = new Date(); future.setDate(future.getDate() + 2);
  const checkin = hotels.localCalendarDate(future); future.setDate(future.getDate() + 3);
  const html = renderToStaticMarkup(React.createElement(Search, { initial: { ...search, checkin, checkout: hotels.localCalendarDate(future) } }));
  assert.match(html, /id="stay22-widget"/);
  assert.match(html, /priceper=total/);
  assert.match(html, /aid=destinauta/);
});

test('a valid mobile search renders a compact summary before its map while retaining editable values', () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  const React = require('react');
  const Search = load('app/hoteles/HotelsSearch.tsx', {
    '@/lib/stay22/hotels': hotels,
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    '@/app/components/LanguageSelector': { default: () => null },
    '@/app/components/LanguageProvider': { useLanguage: () => ({ language: 'es', t: key => key }) },
  }).default;
  const future = new Date(); future.setDate(future.getDate() + 2);
  const checkin = hotels.localCalendarDate(future); future.setDate(future.getDate() + 3);
  const html = renderToStaticMarkup(React.createElement(Search, { initial: { ...search, checkin, checkout: hotels.localCalendarDate(future), adults: '3', rooms: '2' } }));
  assert.ok(html.indexOf('aria-expanded="false"') < html.indexOf('id="stay22-widget"'));
  assert.match(html, /aria-controls="hotels-search-form"/);
  assert.match(html, /hotels.modifySearch/);
  assert.match(html, /hotels.moreOptions/);
  assert.match(html, /hotels\.adults: 3/);
  assert.match(html, /search\.rooms: 2/);
  assert.match(html, /hidden sm:block/);
  assert.match(html, /h-\[70dvh\]/);
  assert.match(html, /aid=destinauta/);
  assert.match(html, /hotelscolor=1D4ED8/);
  assert.match(html, /hotelsfontcolor=FFFFFF/);
  assert.doesNotMatch(html, /[?&amp;]zoom=/);
  assert.doesNotMatch(html, /dotlistings=true/);
});

test('all seven interface languages include the compact controls and three notices', () => {
  const source = fs.readFileSync(path.join(root, 'lib/i18n/translations.ts'), 'utf8');
  for (const key of ['hotels.modifySearch', 'hotels.moreOptions', 'hotels.affiliatePreMap', 'hotels.affiliate', 'hotels.prices']) {
    const line = source.split('\n').find(value => value.includes('["' + key + '"'));
    assert.ok(line, key);
    const matches = line.match(/"/g) || [];
    assert.ok(matches.length >= 16, key + ' must include a key and seven translations');
  }
});

test('each language renders a short affiliate notice above the map and both details below it', () => {
  const { renderToStaticMarkup } = require('react-dom/server');
  const React = require('react');
  const { locales, translate } = load('lib/i18n/translations.ts');
  assert.equal(translate('es', 'hotels.affiliate'), 'Afiliación: DESTINAUTA puede recibir una comisión si reservas a través de estos enlaces.');
  assert.equal(translate('es', 'hotels.prices'), 'Precios por estancia sujetos a cambios. Comprueba impuestos y condiciones antes de reservar.');
  const future = new Date(); future.setDate(future.getDate() + 2);
  const checkin = hotels.localCalendarDate(future); future.setDate(future.getDate() + 3);
  for (const { code: language } of locales) {
    const Search = load('app/hoteles/HotelsSearch.tsx', {
      '@/lib/stay22/hotels': hotels,
      'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
      '@/app/components/LanguageSelector': { default: () => null },
      '@/app/components/LanguageProvider': { useLanguage: () => ({ language, t: key => translate(language, key) }) },
    }).default;
    const html = renderToStaticMarkup(React.createElement(Search, { initial: { ...search, checkin, checkout: hotels.localCalendarDate(future) } }));
    const map = html.indexOf('<iframe');
    const shortNotice = translate(language, 'hotels.affiliatePreMap');
    assert.ok(html.indexOf(shortNotice) >= 0 && html.indexOf(shortNotice) < map);
    assert.equal(html.split(shortNotice).length - 1, 1);
    for (const key of ['affiliate', 'prices']) {
      const notice = renderToStaticMarkup(React.createElement('p', { id: `hotels-${key}-notice` }, translate(language, `hotels.${key}`)));
      assert.ok(html.indexOf(notice) >= 0 && html.indexOf(notice) > map, `${language}: ${key} follows map`);
      assert.equal(html.split(notice).length - 1, 1, `${language}: no duplicate ${key}`);
    }
    assert.match(html, /aria-describedby="hotels-affiliate-notice hotels-prices-notice"/);
    assert.doesNotMatch(html.slice(0, map), /id="hotels-(?:affiliate|prices)-notice"/);
    assert.match(html, /aid=destinauta/);
    assert.match(html, /priceper=total/);
  }
});
