const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React };
function loader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions }).outputText, {
      exports, Intl, URL, Date, JSON, ...globals, require: id => {
        if (Object.hasOwn(mocks, id)) return mocks[id];
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const p = [base + '.ts', base + '.tsx'].find(p => fs.existsSync(path.join(root, p)));
        if (!p) throw Error('Unexpected dependency ' + id);
        return load(p);
      },
    });
    return exports;
  }
  return load;
}
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const memoryStorage = () => {
  const data = new Map();
  return { getItem: k => data.has(k) ? data.get(k) : null, setItem: (k, v) => void data.set(k, String(v)), removeItem: k => void data.delete(k) };
};
const flights = (globals = {}) => loader({}, globals)('lib/supabase/saved-flights.ts');

test('flights of the provider widget become a «vuelo» trip with the searched days and travelers, never a price', () => {
  const { savedFlightFromSearch } = flights();
  const trip = savedFlightFromSearch('MAD2511LON27112', 'Londres', { departureDate: '2026-11-25', returnDate: '2026-11-27', travelers: 2 });
  assert.deepEqual({ ...trip }, {
    origin: 'MAD', destination: 'Londres', departure_date: '2026-11-25', return_date: '2026-11-27', travelers: 2, service_type: 'vuelo',
  });
  assert.equal(Object.keys(trip).some(key => /price|precio|amount|offer/i.test(key)), false);
});

test('nothing is offered to save without a real destination, a code, the exact days or valid travelers', () => {
  const { savedFlightFromSearch, savedFlight } = flights();
  const ok = { departureDate: '2026-11-25', returnDate: '2026-11-27', travelers: 1 };
  assert.equal(savedFlightFromSearch('MAD2511LON27111', 'Londres', {}), null, 'without days');
  assert.equal(savedFlightFromSearch('MAD2511LON27111', 'Londres', { travelers: 1, departureDate: '2026-11-25' }), null, 'return day missing');
  assert.equal(savedFlightFromSearch('MAD2511LON2711', 'Londres', ok), null, 'no travelers digit');
  assert.equal(savedFlightFromSearch('mad2511lon27111', 'Londres', ok), null, 'lowercase code');
  assert.equal(savedFlightFromSearch('MAD2511LON27111', '   ', ok), null, 'blank destination');
  assert.equal(savedFlightFromSearch('MAD2511LON27111', 'Londres', { ...ok, returnDate: '2026-11-24' }), null, 'return before departure');
  assert.equal(savedFlightFromSearch('MAD2511LON27111', 'Londres', { ...ok, departureDate: '2026-02-30' }), null, 'impossible day');
  for (const travelers of [0, 10, 1.5, NaN, '2', undefined, null]) {
    assert.equal(savedFlight({ origin: 'Madrid', destination: 'Londres', departureDate: '2026-11-25', returnDate: '2026-11-27', travelers }), null, String(travelers));
  }
  // A one-way day (no return) is a valid trip; a broken return day is not.
  assert.equal(savedFlight({ origin: 'Madrid', destination: 'Londres', departureDate: '2026-11-25', travelers: 1 }).return_date, null);
  assert.equal(savedFlight({ origin: 'Madrid', destination: 'Londres', departureDate: '2026-11-25', returnDate: 'mañana', travelers: 1 }), null);
});

test('each flight of our own list saves its own days, or the searched days when the offer has none', () => {
  const { savedFlightFromOffer } = flights();
  const query = { origin: 'Madrid', destination: 'Londres', departureDate: '2026-11-24', returnDate: '2026-11-28', travelers: 3 };
  const own = savedFlightFromOffer({ departureAt: '2026-11-25T16:10:00+01:00', returnAt: '2026-11-27T06:00:00Z' }, query);
  assert.deepEqual({ ...own }, {
    origin: 'Madrid', destination: 'Londres', departure_date: '2026-11-25', return_date: '2026-11-27', travelers: 3, service_type: 'vuelo',
  });
  const searched = savedFlightFromOffer({ departureAt: null, returnAt: null }, query);
  assert.equal(searched.departure_date, '2026-11-24');
  assert.equal(searched.return_date, '2026-11-28');
});

test('the origin typed in the form replaces the airport code only for that exact search', () => {
  const sessionStorage = memoryStorage();
  const lib = flights({ sessionStorage });
  assert.equal(lib.typedOriginFor('MAD2511LON27112'), null, 'nothing typed yet: the airport code stays');
  lib.rememberTypedOrigin('/?flightSearch=MAD2511LON27112&featured=londres&departureDate=2026-11-25&returnDate=2026-11-27', ' Madrid ');
  assert.equal(lib.typedOriginFor('MAD2511LON27112'), 'Madrid');
  assert.equal(lib.typedOriginFor('BCN2511LON27112'), null, 'another search never borrows it');
  lib.rememberTypedOrigin('/vuelos?flightSearch=BCN2511ROM27112&destinationId=it-roma', 'Barcelona');
  assert.equal(lib.typedOriginFor('BCN2511ROM27112'), 'Barcelona');
  assert.equal(lib.typedOriginFor('MAD2511LON27112'), null, 'a new search replaces the stored one');
  lib.rememberTypedOrigin('/?featured=londres', 'Sevilla');
  assert.equal(lib.typedOriginFor('BCN2511ROM27112'), 'Barcelona', 'an address without a search code changes nothing');
});

test('unavailable or corrupt session storage never breaks searching or saving', () => {
  const broken = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); }, removeItem() { throw Error('blocked'); } };
  const lib = flights({ sessionStorage: broken });
  assert.doesNotThrow(() => lib.rememberTypedOrigin('/?flightSearch=MAD2511LON27112', 'Madrid'));
  assert.equal(lib.typedOriginFor('MAD2511LON27112'), null);
  const corrupt = memoryStorage();
  corrupt.setItem('destinauta.featured-flight-origin', '{not json');
  assert.equal(flights({ sessionStorage: corrupt }).typedOriginFor('MAD2511LON27112'), null);
  corrupt.setItem('destinauta.featured-flight-origin', JSON.stringify({ search: 'MAD2511LON27112', origin: 42 }));
  assert.equal(flights({ sessionStorage: corrupt }).typedOriginFor('MAD2511LON27112'), null);
  assert.equal(flights().typedOriginFor('MAD2511LON27112'), null, 'no sessionStorage at all (server)');
});

test('the heart texts exist in the seven languages and name «Mis viajes», where trips are listed', () => {
  const dictionaries = loader()('lib/i18n/translations.ts');
  for (const locale of ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca']) {
    const save = dictionaries.translate(locale, 'search.saveFlight'), saved = dictionaries.translate(locale, 'search.flightSaved');
    assert.ok(save && save !== 'search.saveFlight', locale);
    assert.ok(saved && saved !== 'search.flightSaved', locale);
    assert.ok(saved.includes(dictionaries.translate(locale, 'trips.title')), `${locale}: «${saved}» names the trips list`);
  }
});

function render(locale, state = 'idle') {
  const dictionaries = loader()('lib/i18n/translations.ts');
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) }),
    useState: () => [state, () => {}], useRef: initial => ({ current: initial }),
  };
  const language = { useLanguage: () => ({ language: locale, t: (key, values) => dictionaries.translate(locale, key, values) }) };
  const saved = [];
  const load = loader({
    react, './LanguageProvider': language,
    '@/lib/supabase/client': { getSupabaseClient: () => { throw Error('Unexpected Supabase client on render'); } },
    '@/lib/supabase/saved-trips': { saveTrip: trip => { saved.push(trip); } },
  }, { React: react });
  const trip = { origin: 'MAD', destination: 'Londres', departure_date: '2026-11-25', return_date: '2026-11-27', travelers: 2, service_type: 'vuelo' };
  return { tree: load('app/components/SaveFlightHeart.tsx').default({ trip, search: 'MAD2511LON27112' }), saved };
}
const nodes = n => !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...(n.children ?? []).flatMap(nodes)];
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join(' ') : typeof n === 'object' ? text(n.children) : String(n);

test('the heart shows when flights are shown, saves nothing on its own and works in every language', () => {
  for (const locale of ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca']) {
    const { tree, saved } = render(locale);
    const button = nodes(tree).find(n => n.type === 'button');
    assert.ok(button, locale);
    assert.equal(button.props.type, 'button');
    assert.equal(button.props.disabled, false);
    assert.equal(button.props['aria-pressed'], false);
    assert.match(text(button), /♡/);
    assert.equal(nodes(tree).filter(n => n.type === 'button').length, 1);
    assert.deepEqual(saved, [], 'rendering never saves');
    assert.equal(nodes(tree).some(n => n.props?.role === 'alert'), false);
  }
  assert.match(text(nodes(render('es').tree).find(n => n.type === 'button')), /Guardar vuelo/);
  assert.match(text(nodes(render('en').tree).find(n => n.type === 'button')), /Save flight/);
});

test('once saved the heart is full, disabled and says where it went; a refusal explains itself', () => {
  const done = nodes(render('es', 'saved').tree).find(n => n.type === 'button');
  assert.match(text(done), /♥/);
  assert.match(text(done), /Mis viajes/);
  assert.equal(done.props.disabled, true);
  assert.equal(done.props['aria-pressed'], true);
  const login = nodes(render('es', 'login').tree).find(n => n.props?.role === 'alert');
  assert.match(text(login), /iniciar sesión/);
  const failure = nodes(render('en', 'error').tree).find(n => n.props?.role === 'alert');
  assert.match(text(failure), /could not be saved/);
  assert.equal(nodes(render('es', 'saving').tree).find(n => n.type === 'button').props.disabled, true);
});

test('the heart is wired where flights appear, and only saves from a press with a signed-in account', () => {
  const component = source('app/components/SaveFlightHeart.tsx');
  assert.equal((component.match(/saveTrip\(/g) ?? []).length, 1, 'one call to save');
  assert.ok(component.indexOf('getSession()') < component.indexOf('saveTrip('), 'the session is checked first');
  assert.match(component, /if \(!session\) \{ setState\("login"\); return; \}/);
  assert.match(component, /onClick=\{\(\) => void save\(\)\}/);
  assert.doesNotMatch(component, /useEffect/, 'never saves by itself');
  const page = source('app/page.tsx');
  assert.match(page, /<SaveFlightHeart[^>]*trip=\{featuredTrip\}[^>]*search=\{featuredFlightSearch\.search\}/, 'widget block of the card');
  assert.match(page, /<SaveFlightHeart[^>]*trip=\{offerTrip\}/, 'each flight of the list');
  const widgetBlock = page.indexOf('id="tpwl-tickets"');
  assert.ok(page.lastIndexOf('<SaveFlightHeart', widgetBlock) > page.lastIndexOf('aria-label={t("search.recentFlights")}', widgetBlock), 'heart sits in the flights block');
  assert.match(page, /rememberTypedOrigin\(data\.url, query\.origin\);\s*window\.location\.assign\(data\.url\)/);
  const vuelos = source('app/vuelos/page.tsx');
  assert.match(vuelos, /<SaveFlightHeart[^>]*trip=\{savedTrip\}[^>]*search=\{flightSearch\}/);
  assert.match(vuelos, /savedFlightFromSearch\(flightSearch, destination\.name, itineraryContext\)/);
});

test('the existing «Guardar viaje» buttons of the search forms are untouched', () => {
  const page = source('app/page.tsx');
  for (const call of ['renderSaveTripAction("vuelo")', 'renderSaveTripAction("hotel")', 'renderSaveTripAction("ambos")',
    'renderSaveTripAction("vuelo", true)', 'renderSaveTripAction("ambos", true)']) {
    assert.equal(page.split(call).length - 1, 1, call);
  }
  assert.equal(page.split('saveTrip(trip)').length - 1, 1);
});
