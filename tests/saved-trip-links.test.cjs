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
      exports, Intl, URL, URLSearchParams, ...globals, require: id => {
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
const links = (globals = {}) => loader({}, globals)('lib/supabase/saved-trip-links.ts');
const flightsLib = (globals = {}) => loader({}, globals)('lib/supabase/saved-flights.ts');

// Days are relative to «now» so these tests never expire.
const day = offset => { const d = new Date(); d.setDate(d.getDate() + offset); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const trip = (over = {}) => ({
  id: 'trip-1', user_id: 'u', origin: 'Madrid', destination: 'Londres', departure_date: day(40), return_date: day(44),
  travelers: 2, service_type: 'vuelo', created_at: '2026-11-18T00:00:00Z', ...over,
});

test('a saved flight repeats exactly the saved search: same origin, destination, days and travelers', () => {
  const { savedTripFlightRequest } = links();
  const { request } = savedTripFlightRequest(trip());
  assert.deepEqual({ ...request }, { origin: 'Madrid', destination: 'Londres', departureDate: day(40), returnDate: day(44), travelers: 2 });
  assert.equal(Object.keys(request).some(key => /price|precio|amount|offer|budget/i.test(key)), false, 'no price is ever sent or kept');
  assert.equal(savedTripFlightRequest(trip({ origin: ' MAD ', destination: ' Roma ' })).request.origin, 'MAD', 'an airport code is a valid origin');
  assert.equal(savedTripFlightRequest(trip({ departure_date: day(0), return_date: day(3) })).request.departureDate, day(0), 'today is still allowed');
});

test('an old day is never searched; missing or impossible data says so instead of guessing', () => {
  const { savedTripFlightRequest } = links();
  assert.deepEqual({ ...savedTripFlightRequest(trip({ departure_date: day(-1), return_date: day(3) })) }, { problem: 'pastDate' });
  for (const [name, over] of Object.entries({
    'no origin': { origin: null }, 'blank origin': { origin: '  ' }, 'no return day (one way)': { return_date: null },
    'return the same day': { return_date: day(40) }, 'return before departure': { return_date: day(39) },
    'zero travelers': { travelers: 0 }, 'ten travelers': { travelers: 10 }, 'fractional travelers': { travelers: 1.5 },
    'blank destination': { destination: '   ' },
  })) assert.deepEqual({ ...savedTripFlightRequest(trip(over)) }, { problem: 'incomplete' }, name);
});

test('a saved hotel opens the hotels page with the same days and guests, or says why it cannot', () => {
  const { savedTripHotelHref } = links();
  const { href } = savedTripHotelHref(trip({ service_type: 'hotel', origin: null, destination: 'Barcelona', travelers: 3 }));
  assert.match(href, /^\/hoteles\?/, 'a local address only');
  const params = new URL(href, 'https://destinauta.com').searchParams;
  assert.equal(params.get('destination'), 'Barcelona');
  assert.equal(params.get('checkin'), day(40));
  assert.equal(params.get('checkout'), day(44));
  assert.equal(params.get('adults'), '3');
  assert.deepEqual({ ...savedTripHotelHref(trip({ departure_date: day(-2), return_date: day(2) })) }, { problem: 'pastDate' });
  for (const over of [{ return_date: null }, { return_date: day(40) }, { travelers: 11 }, { travelers: 0 }, { destination: ' ' }, { departure_date: day(40), return_date: day(900) }]) {
    assert.deepEqual({ ...savedTripHotelHref(trip(over)) }, { problem: 'incomplete' }, JSON.stringify(over));
  }
});

test('flights are offered for «vuelo» and «ambos», hotels for «hotel» and «ambos»', () => {
  const { canSearchFlights, canSearchHotels } = links();
  assert.deepEqual(['vuelo', 'hotel', 'ambos'].map(service_type => canSearchFlights({ service_type })), [true, false, true]);
  assert.deepEqual(['vuelo', 'hotel', 'ambos'].map(service_type => canSearchHotels({ service_type })), [false, true, true]);
});

function harness(reply) {
  const calls = [], navigations = [];
  const sessionStorage = memoryStorage();
  const lib = links({ sessionStorage });
  const deps = {
    fetchJson: async (url, init) => {
      calls.push({ url, init });
      if (reply instanceof Error) throw reply;
      return { ok: reply.status >= 200 && reply.status < 300, json: async () => { if (reply.broken) throw Error('not json'); return reply.body; } };
    },
    navigate: url => navigations.push(url),
  };
  return { lib, deps, calls, navigations, sessionStorage };
}

test('«Ver vuelos» asks the same endpoint as the home form and goes to the address it returns', async () => {
  const url = `/?flightSearch=MAD${day(40).slice(8)}${day(40).slice(5, 7)}LON${day(44).slice(8)}${day(44).slice(5, 7)}2&featured=londres&departureDate=${day(40)}&returnDate=${day(44)}`;
  const { lib, deps, calls, navigations, sessionStorage } = harness({ status: 200, body: { success: true, url } });
  assert.equal(await lib.openSavedFlight(trip(), deps), null);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/travelpayouts/flight-link');
  assert.equal(calls[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(calls[0].init.body), { origin: 'Madrid', destination: 'Londres', departureDate: day(40), returnDate: day(44), travelers: 2 });
  assert.deepEqual(navigations, [url]);
  // The typed origin travels with the search so «Guardar vuelo» on the results keeps «Madrid» instead of «MAD».
  const code = new URL(url, 'https://destinauta.com').searchParams.get('flightSearch');
  assert.equal(flightsLib({ sessionStorage }).typedOriginFor(code), 'Madrid');
  // The other destination page of the same endpoint works the same way.
  const other = harness({ status: 200, body: { success: true, url: '/vuelos?flightSearch=MAD2511ROM27112&destinationId=it-rome&departureDate=2026-11-25&returnDate=2026-11-27' } });
  assert.equal(await other.lib.openSavedFlight(trip({ destination: 'Roma' }), other.deps), null);
  assert.match(other.navigations[0], /^\/vuelos\?flightSearch=/);
});

test('every refusal gives a clear reason, stays on the page and never navigates', async () => {
  const cases = [
    ['unknown origin', { status: 422, body: { success: false, error: 'unknown_origin' } }, 'unknownPlace'],
    ['unknown destination', { status: 422, body: { success: false, error: 'unknown_destination' } }, 'unknownPlace'],
    ['invalid search', { status: 400, body: { success: false, error: 'invalid_search' } }, 'incomplete'],
    ['provider down', { status: 502, body: { success: false, error: 'provider_unavailable' } }, 'unavailable'],
    ['reply is not JSON', { status: 500, broken: true }, 'unavailable'],
    ['network failure', new Error('offline'), 'unavailable'],
    ['success without an address', { status: 200, body: { success: true } }, 'unavailable'],
    ['success with another website', { status: 200, body: { success: true, url: 'https://evil.example/?flightSearch=MAD' } }, 'unavailable'],
    ['success with a protocol-relative address', { status: 200, body: { success: true, url: '//evil.example/x' } }, 'unavailable'],
    ['success with a script address', { status: 200, body: { success: true, url: 'javascript:alert(1)' } }, 'unavailable'],
  ];
  for (const [name, reply, expected] of cases) {
    const { lib, deps, navigations, sessionStorage } = harness(reply);
    assert.equal(await lib.openSavedFlight(trip(), deps), expected, name);
    assert.deepEqual(navigations, [], name);
    assert.equal(sessionStorage.getItem('destinauta.featured-flight-origin'), null, `${name}: nothing remembered`);
  }
});

test('an old or incomplete trip never even calls the server', async () => {
  for (const [over, expected] of [[{ departure_date: day(-5), return_date: day(-1) }, 'pastDate'], [{ return_date: null }, 'incomplete'], [{ origin: null }, 'incomplete']]) {
    const { lib, deps, calls, navigations } = harness({ status: 200, body: { success: true, url: '/x' } });
    assert.equal(await lib.openSavedFlight(trip(over), deps), expected);
    assert.deepEqual([calls, navigations], [[], []]);
  }
});

test('only local addresses are followed', () => {
  const { isLocalPath } = links();
  for (const ok of ['/', '/vuelos?flightSearch=MAD', '/?flightSearch=MAD&featured=x']) assert.equal(isLocalPath(ok), true, ok);
  for (const bad of ['//evil.example', 'https://evil.example', 'javascript:alert(1)', 'vuelos', '', null, undefined, 3]) assert.equal(isLocalPath(bad), false, String(bad));
});

const locales = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
const dictionaries = loader()('lib/i18n/translations.ts');

test('the new texts exist in the seven languages, keep their placeholders and never repeat Spanish elsewhere', () => {
  const keys = ['trips.viewFlights', 'trips.viewFlightsLabel', 'trips.viewHotels', 'trips.viewHotelsLabel', 'trips.opening',
    'trips.openPastDate', 'trips.openIncomplete', 'trips.openUnknownPlace', 'trips.openUnavailable'];
  for (const key of keys) {
    const spanish = dictionaries.translate('es', key);
    assert.ok(spanish && spanish !== key, key);
    for (const locale of locales) {
      const value = dictionaries.translate(locale, key);
      assert.ok(value && value !== key, `${locale}: ${key}`);
      if (locale !== 'es') assert.notEqual(value, spanish, `${locale}: ${key} is translated`);
      assert.equal(value.includes('{destination}'), spanish.includes('{destination}'), `${locale}: ${key} placeholder`);
    }
  }
  const { openProblemKeys } = links();
  assert.deepEqual(Object.keys(openProblemKeys).sort(), ['incomplete', 'pastDate', 'unavailable', 'unknownPlace']);
  for (const key of Object.values(openProblemKeys)) assert.ok(keys.includes(key), key);
  assert.equal(dictionaries.translate('en', 'trips.viewFlightsLabel', { destination: 'Rome <b>' }), 'View flights to Rome <b>');
});

function renderList(locale, trips, extra = []) {
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) }),
    useState: (() => { let i = 0; const values = [trips, false, '', '', null, 0, ...extra]; return () => [values[i++], () => {}]; })(),
    useRef: initial => ({ current: initial }), useEffect: () => {},
  };
  const load = loader({
    react,
    './LanguageProvider': { useLanguage: () => ({ language: locale, t: (key, values) => dictionaries.translate(locale, key, values), text: value => dictionaries.translateText(locale, value) }) },
    '@/lib/supabase/saved-trips': { listSavedTrips: () => { throw Error('No data fetch on render'); }, deleteSavedTrip: () => { throw Error('No delete on render'); } },
  }, { React: react });
  return load('app/components/SavedTrips.tsx').default();
}
const nodes = n => !n || typeof n !== 'object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n, ...(n.children ?? []).flatMap(nodes)];
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join(' ') : typeof n === 'object' ? text(n.children) : String(n);
const word = (locale, key) => dictionaries.translate(locale, key);

test('each saved trip offers the way back that fits it, in every language, next to the existing delete button', () => {
  for (const locale of locales) {
    const tree = renderList(locale, [
      trip({ id: 'f', destination: 'Londres', service_type: 'vuelo' }),
      trip({ id: 'h', destination: 'Barcelona', origin: null, service_type: 'hotel' }),
      trip({ id: 'b', destination: 'Roma', service_type: 'ambos' }),
    ]);
    const items = nodes(tree).filter(n => n.type === 'li');
    assert.equal(items.length, 3, locale);
    const [flight, hotel, both] = items.map(li => nodes(li));
    const buttons = list => list.filter(n => n.type === 'button');
    const labelled = (list, label) => list.filter(n => text(n) === label);

    assert.equal(labelled(buttons(flight), word(locale, 'trips.viewFlights')).length, 1, `${locale}: flight trip has «Ver vuelos»`);
    assert.equal(flight.some(n => n.type === 'a'), false, `${locale}: no hotel link on a flight trip`);
    const viewFlights = labelled(buttons(flight), word(locale, 'trips.viewFlights'))[0];
    assert.equal(viewFlights.props.type, 'button');
    assert.equal(viewFlights.props['aria-label'], dictionaries.translate(locale, 'trips.viewFlightsLabel', { destination: 'Londres' }));

    assert.equal(labelled(buttons(hotel), word(locale, 'trips.viewFlights')).length, 0, `${locale}: hotel trip has no flights button`);
    const link = hotel.find(n => n.type === 'a');
    assert.ok(link, `${locale}: hotel trip has a link`);
    assert.match(link.props.href, /^\/hoteles\?.*destination=Barcelona/);
    assert.equal(text(link), word(locale, 'trips.viewHotels'));
    assert.equal(link.props['aria-label'], dictionaries.translate(locale, 'trips.viewHotelsLabel', { destination: 'Barcelona' }));

    assert.equal(labelled(buttons(both), word(locale, 'trips.viewFlights')).length, 1, `${locale}: both → flights`);
    assert.ok(both.some(n => n.type === 'a'), `${locale}: both → hotels`);

    for (const list of [flight, hotel, both]) {
      assert.equal(labelled(buttons(list), word(locale, 'trips.delete')).length, 1, `${locale}: delete button is still there`);
    }
  }
});

test('while the search opens only the pressed trip says so, and a refusal is read out under that trip only', () => {
  const trips = [trip({ id: 'a', destination: 'Londres' }), trip({ id: 'b', destination: 'Roma' })];
  for (const locale of locales) {
    const opening = nodes(renderList(locale, trips, ['a', null])).filter(n => n.type === 'li').map(li => nodes(li));
    assert.ok(opening[0].some(n => n.type === 'button' && text(n) === word(locale, 'trips.opening')), locale);
    assert.equal(opening[1].some(n => text(n) === word(locale, 'trips.opening')), false, locale);
    // while one search opens, the buttons that open another are disabled
    for (const li of opening) for (const b of li.filter(n => n.type === 'button' && [word(locale, 'trips.viewFlights'), word(locale, 'trips.opening')].includes(text(n)))) assert.equal(b.props.disabled, true, locale);

    for (const [problem, key] of [['pastDate', 'trips.openPastDate'], ['incomplete', 'trips.openIncomplete'], ['unknownPlace', 'trips.openUnknownPlace'], ['unavailable', 'trips.openUnavailable']]) {
      const shown = nodes(renderList(locale, trips, [null, { id: 'b', problem }])).filter(n => n.type === 'li').map(li => nodes(li));
      assert.equal(shown[0].some(n => n.props?.role === 'alert'), false, `${locale}: first trip stays quiet`);
      const alert = shown[1].find(n => n.props?.role === 'alert');
      assert.ok(alert, `${locale}: ${problem}`);
      assert.equal(text(alert), word(locale, key));
    }
  }
});

test('a hotel trip whose days already passed shows the reason instead of a dead link', () => {
  const old = trip({ id: 'h', service_type: 'hotel', origin: null, departure_date: day(-10), return_date: day(-6) });
  const li = nodes(renderList('es', [old])).find(n => n.type === 'li');
  assert.equal(nodes(li).some(n => n.type === 'a'), false);
  const button = nodes(li).find(n => n.type === 'button' && text(n) === 'Ver hoteles');
  assert.ok(button);
  assert.equal(button.props.type, 'button');
});

test('«Mis viajes» keeps loading, listing and deleting exactly as before; the new hooks come last', () => {
  const component = source('app/components/SavedTrips.tsx');
  assert.match(component, /listSavedTrips\(\)\.then/);
  assert.match(component, /await deleteSavedTrip\(id\)/);
  assert.match(component, /setTrips\(\(current\) => current\.filter\(\(trip\) => trip\.id !== id\)\)/);
  const hooks = [...component.matchAll(/const \[(\w+), \w+\] = useState/g)].map(m => m[1]);
  assert.deepEqual(hooks, ['trips', 'loading', 'loadError', 'deleteError', 'removingId', 'retry', 'openingId', 'openProblem']);
  assert.match(component, /onClick=\{\(\) => void openFlights\(trip\)\}/);
  assert.match(component, /if \(openingRef\.current\) return;/, 'a second press while opening does nothing');
  const helper = source('lib/supabase/saved-trip-links.ts');
  assert.equal((helper.match(/fetch\(/g) ?? []).length, 1, 'one request, to our own endpoint');
  assert.match(helper, /"\/api\/travelpayouts\/flight-link"/);
  assert.doesNotMatch(helper + component, /saveTrip\(|deleteSavedTrip\([^i]|supabase\.from|\.insert\(|\.update\(/, 'opening a trip never changes saved data');
});
