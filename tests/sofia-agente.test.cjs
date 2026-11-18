// Sofía como agente de viajes: catálogo por mes y tema, resumen real de vuelos y descubrir destinos por presupuesto.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { loader, harness, deferred, tick, trip } = require('./sofia-harness.cjs');

const load = loader();
const catalogModule = load('lib/voice/catalog.ts');
const summaries = load('lib/voice/trip-summary.ts');
const destinationsModule = load('lib/destinations/index.ts');
const seasonality = load('lib/destinations/seasonality.ts');
const presentation = load('lib/destinations/presentation.ts');
const plain = (value) => JSON.parse(JSON.stringify(value));
const query = (...args) => plain(catalogModule.queryVoiceCatalog(...args));

/* ------------------------------------------------------------ catálogo */

test('catalogue: a month keeps only destinations whose best months include it, in any language', () => {
  for (const [month, locale] of [[10, 'es'], ['octubre', 'es'], ['October', 'en'], ['octobre', 'fr'], ['Oktober', 'de'], ['ottobre', 'it'], ['outubro', 'pt'], ['octubre', 'ca']]) {
    const result = query(undefined, locale, { month });
    assert.equal(result.status, 'success', String(month));
    assert.ok(result.total > 10, String(month));
    assert.equal(result.filters.month.length > 0, true);
    for (const item of result.destinations) {
      const profile = destinationsModule.getDestinationById(item.id);
      if (profile) assert.ok(profile.bestMonths.includes(10), `${item.id} lists October among its best months`);
      assert.equal(typeof item.busyInRequestedMonth, 'boolean');
    }
  }
});

test('catalogue: month and season texts are exactly the catalogue data, never estimated', () => {
  const [paris] = query('Paris', 'es').destinations.filter(d => d.id === 'fr-paris');
  const profile = destinationsModule.getDestinationById('fr-paris');
  assert.equal(paris.bestMonths, seasonality.formatMonthRanges(profile.bestMonths, 'es'));
  assert.equal(paris.quietMonths, seasonality.formatMonthRanges(profile.lowSeasonMonths, 'es'));
  assert.equal(paris.busyMonths, seasonality.formatMonthRanges(profile.highSeasonMonths, 'es'));
  assert.equal(paris.recommendedStay, profile.recommendedStay);
  assert.equal(paris.recommendations.length, 4);
  const text = JSON.stringify(query(undefined, 'es', { month: 10, topic: 'playa' }));
  assert.equal(/€|\bEUR\b|"price|"precio/i.test(text), false, 'the catalogue never carries prices');
});

test('catalogue: topic words are matched against the catalogue texts only', () => {
  const beach = query('', 'es', { topic: 'playa' });
  assert.equal(beach.status, 'success');
  assert.ok(beach.total > 0);
  assert.deepEqual(beach.filters.topic, ['playa']);
  assert.equal(query('', 'es', { topic: 'zzzzqqqq' }).total, 0);
  // Month + topic narrow each other.
  const both = query('', 'es', { month: 8, topic: 'playa' });
  assert.ok(both.total > 0 && both.total <= beach.total);
  // Only words of 3+ letters count; a lone short word means "no topic".
  assert.equal(query('', 'es', { topic: 'de' }).filters, undefined);
});

test('catalogue: an open recommendation search is spread over countries; a named search is not', () => {
  const open = query(undefined, 'es', { month: 10 });
  assert.equal(open.destinations.length, 12);
  const perCountry = {};
  for (const d of open.destinations) perCountry[d.country] = (perCountry[d.country] ?? 0) + 1;
  assert.ok(Object.keys(perCountry).length >= 6, JSON.stringify(perCountry));
  assert.ok(Object.values(perCountry).every(count => count <= 2));
  assert.equal(open.truncated, true);
  const named = query('Paris', 'fr');
  assert.ok(named.destinations.find(d => d.canonicalName === 'París'));
});

test('catalogue: previous behaviour is kept and bad arguments are rejected', () => {
  assert.equal(query('zzzz-nonexistent', 'es').total, 0);
  assert.ok(query('', 'es').destinations.length <= 12);
  assert.equal(query('', 'es').filters, undefined);
  for (const bad of [[5, 'es'], ['x'.repeat(101), 'es'], ['', 'es', { month: 13 }], ['', 'es', { month: 0 }],
    ['', 'es', { month: 'smarch' }], ['', 'es', { month: {} }], ['', 'es', { topic: 'x'.repeat(101) }], ['', 'es', { topic: 7 }]]) {
    assert.deepEqual(query(...bad), { status: 'error', error: 'invalid_arguments' }, JSON.stringify(bad));
  }
  // Detailed texts only for short answers, to keep what Sofía reads small.
  const few = query('Paris', 'es').destinations;
  assert.ok(few.length <= 5 && few.every(d => Array.isArray(d.recommendations)));
  assert.ok(query(undefined, 'es', { month: 10 }).destinations.every(d => d.recommendations === undefined));
});

test('catalogue tool: Sofía can pass month and topic; a profile is described with the real text of the selected language', async () => {
  const h = harness({ getLocale: () => 'en' });
  await h.session.start();
  const result = await h.call('consultar_catalogo', { mes: 'October', tema: 'beach' });
  assert.equal(result.status, 'success');
  assert.equal(result.filters.month, 'October');
  assert.deepEqual(result.filters.topic, ['beach']);
  assert.ok(result.total > 0);
  const only = await h.call('consultar_catalogo', { consulta: 'Paris' });
  assert.equal(only.status, 'success');
  assert.equal((await h.call('consultar_catalogo', { mes: 99 })).error, 'invalid_arguments');
  h.session.stop();
});

/* ---------------------------------------------------- resumen de vuelos */

const offer = (price, extra = {}) => ({ price, departureAt: '2027-03-10T07:00:00+01:00', returnAt: '2027-03-15T20:00:00+01:00',
  airline: 'IB', transfers: 0, offerUrl: 'https://secret.example/affiliate?marker=123', ...extra });
const base = { origin: 'Madrid', destination: 'París', departureDate: '2027-03-10', returnDate: '2027-03-15', travellers: 2 };

test('flight summary: sorted real offers, three at most, per person and in total, without links', () => {
  const s = plain(summaries.buildVoiceTripSummary({ ...base, offers: [offer(150.5), offer(99.99), offer(120), offer(300), offer(-1), offer(Number.NaN)] }));
  assert.equal(s.kind, 'flights');
  assert.equal(s.offersFound, 4);
  assert.deepEqual(s.offers.map(o => o.pricePerPerson), [99.99, 120, 150.5]);
  assert.deepEqual(s.offers.map(o => o.totalForAllTravellers), [199.98, 240, 301]);
  assert.equal(s.nights, 5);
  assert.equal(s.currency, 'EUR');
  assert.deepEqual([s.offers[0].airline, s.offers[0].stops, s.offers[0].departureDate, s.offers[0].returnDate], ['IB', 0, '2027-03-10', '2027-03-15']);
  const text = JSON.stringify(s);
  assert.equal(text.includes('secret.example'), false);
  assert.equal(text.includes('offerUrl'), false);
  assert.match(s.note, /Hotel prices and availability are NOT known/);
});

test('flight summary: the flight-only budget reports how many real offers fit', () => {
  const total = plain(summaries.buildVoiceTripSummary({ ...base, offers: [offer(90), offer(140)], flightBudget: { amount: 200, type: 'total' } }));
  assert.deepEqual(total.flightBudget, { amount: 200, type: 'total', offersWithinBudget: 1 });
  const each = plain(summaries.buildVoiceTripSummary({ ...base, offers: [offer(90), offer(140)], flightBudget: { amount: 200, type: 'por_persona' } }));
  assert.equal(each.flightBudget.offersWithinBudget, 2);
  const none = plain(summaries.buildVoiceTripSummary({ ...base, offers: [], flightBudget: { amount: 50, type: 'por_persona' } }));
  assert.deepEqual([none.offersFound, none.offers.length, none.flightBudget.offersWithinBudget], [0, 0, 0]);
});

test('flight summary: a flight + hotel budget only subtracts the real cheapest flight; it never invents a hotel price', () => {
  const s = plain(summaries.buildVoiceTripSummary({ ...base, offers: [offer(120), offer(99)], combinedBudget: { amount: 1000, type: 'total' } }));
  assert.equal(s.combinedBudget.total, 1000);
  assert.equal(s.combinedBudget.leftForHotelAfterCheapestFlight, 802);
  assert.equal(s.combinedBudget.leftForHotelPerNight, 160.4);
  assert.equal(s.combinedBudget.flightAloneExceedsBudget, false);
  assert.equal(s.flightBudget, undefined);
  const each = plain(summaries.buildVoiceTripSummary({ ...base, offers: [offer(100)], combinedBudget: { amount: 600, type: 'por_persona' } }));
  assert.equal(each.combinedBudget.total, 1200);
  assert.equal(each.combinedBudget.leftForHotelAfterCheapestFlight, 1000);
  const over = plain(summaries.buildVoiceTripSummary({ ...base, offers: [offer(400)], combinedBudget: { amount: 500, type: 'total' } }));
  assert.deepEqual([over.combinedBudget.leftForHotelAfterCheapestFlight, over.combinedBudget.leftForHotelPerNight, over.combinedBudget.flightAloneExceedsBudget], [0, null, true]);
  const unknown = plain(summaries.buildVoiceTripSummary({ ...base, offers: [], combinedBudget: { amount: 500, type: 'total' } }));
  assert.deepEqual([unknown.combinedBudget.leftForHotelAfterCheapestFlight, unknown.combinedBudget.flightAloneExceedsBudget], [null, false]);
  assert.equal(/hotelPrice|hotel_price|pricePerNight/.test(JSON.stringify([s, each, over, unknown])), false);
});

const discovered = (name, price, country = 'España', code = 'XXX') => ({
  destination: { code, name, country, image: 'x.jpg', recommendedStay: '3 días' }, offer: offer(price) });

test('discover summary: cheapest first, six at most, real prices per person and in total', () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((name, i) => discovered(name, 200 - i * 10));
  const s = plain(summaries.buildVoiceDiscoverSummary({ origin: 'Madrid', departureDate: '2027-03-10', returnDate: '2027-03-15',
    travellers: 2, budget: { amount: 500, type: 'total' }, results: rows }));
  assert.equal(s.kind, 'discover');
  assert.equal(s.destinationsFound, 8);
  assert.deepEqual(s.destinations.map(d => d.name), ['H', 'G', 'F', 'E', 'D', 'C']);
  assert.deepEqual([s.destinations[0].pricePerPerson, s.destinations[0].totalForAllTravellers, s.destinations[0].recommendedStay], [130, 260, '3 días']);
  assert.equal(JSON.stringify(s).includes('secret.example'), false);
  assert.match(s.note, /Hotel prices and availability are NOT known/);
  assert.equal(plain(summaries.buildVoiceDiscoverSummary({ origin: 'Madrid', departureDate: '2027-03-10', returnDate: '2027-03-15',
    travellers: 1, budget: { amount: 5, type: 'total' }, results: [] })).destinationsFound, 0);
});

/* ----------------------------------------------------- herramientas de voz */

const discover = { origen: 'Madrid', fecha_ida: '2027-03-10', fecha_vuelta: '2027-03-15', viajeros: 2, presupuesto: 600, tipo_presupuesto: 'total' };
const voice = load('lib/voice/session.ts');

test('discover arguments: only complete, plausible requests are accepted', () => {
  assert.deepEqual(plain(voice.parseVoiceDiscoverArguments(discover)), discover);
  assert.deepEqual(plain(voice.parseVoiceDiscoverArguments(JSON.stringify({ ...discover, origen: '  Madrid ' }))), discover);
  for (const change of [{ origen: '' }, { origen: 'x'.repeat(101) }, { fecha_ida: '2027-02-30' }, { fecha_vuelta: '2027-03-01' },
    { viajeros: 0 }, { viajeros: 10 }, { viajeros: 1.5 }, { presupuesto: 0 }, { presupuesto: -3 }, { presupuesto: '600' },
    { presupuesto: Number.NaN }, { presupuesto: 10_000_001 }, { tipo_presupuesto: 'cada uno' }, { tipo_presupuesto: undefined }]) {
    assert.equal(voice.parseVoiceDiscoverArguments({ ...discover, ...change }), null, JSON.stringify(change));
  }
  assert.equal(voice.parseVoiceDiscoverArguments(null), null);
  assert.equal(voice.parseVoiceDiscoverArguments('{'), null);
});

test('descubrir_destinos reaches the page, returns the real summary and is registered with the provider', async () => {
  let received;
  const summary = { kind: 'discover', destinationsFound: 1, destinations: [{ name: 'Lisboa', pricePerPerson: 90 }] };
  const h = harness({ onDiscover: async (args, context) => { received = [args, context]; return { status: 'success', summary }; } });
  await h.session.start();
  assert.deepEqual(Object.keys(h.sdk.clientTools).sort(),
    ['buscar_viaje', 'consultar_catalogo', 'crear_itinerario', 'descubrir_destinos', 'mostrar_destino']);
  const result = await h.call('descubrir_destinos', discover);
  assert.deepEqual(plain(result), { status: 'success', summary });
  assert.deepEqual(plain(received[0]), discover);
  assert.match(received[1].callId, /^sofia-/);
  assert.equal((await h.call('descubrir_destinos', { ...discover, presupuesto: -1 })).error, 'invalid_arguments');
  h.session.stop();
});

test('descubrir_destinos without a page handler, with a failing handler, or while busy never claims success', async () => {
  const none = harness();
  await none.session.start();
  assert.equal((await none.call('descubrir_destinos', discover)).error, 'unavailable');
  none.session.stop();

  const failing = harness({ onDiscover: () => { throw Error('private detail'); } });
  await failing.session.start();
  const failed = await failing.call('descubrir_destinos', discover);
  assert.equal(failed.error, 'unavailable');
  assert.equal(JSON.stringify(failed).includes('private'), false);
  failing.session.stop();

  const pending = deferred();
  const busy = harness({ onDiscover: () => pending.promise });
  await busy.session.start();
  const first = busy.call('descubrir_destinos', discover, 'one');
  assert.equal((await busy.call('buscar_viaje', trip, 'two')).error, 'busy');
  pending.resolve({ status: 'success', summary: {} });
  assert.equal((await first).status, 'success');
  busy.session.stop();
});

test('stopping the conversation cancels a discover in progress; its late answer is never a success', async () => {
  const pending = deferred();
  let signal;
  const h = harness({ onDiscover: async (_, context) => { signal = context.signal; return pending.promise; } });
  await h.session.start();
  const result = h.call('descubrir_destinos', discover);
  h.session.stop();
  assert.equal(signal.aborted, true);
  pending.resolve({ status: 'success', summary: {} });
  assert.equal((await result).status, 'cancelled');
});

test('a flight search hands Sofía the real summary; a plain success keeps working', async () => {
  const summary = { kind: 'flights', offersFound: 2, offers: [{ pricePerPerson: 99 }] };
  const withSummary = harness({ onSearch: async () => ({ status: 'success', summary }) });
  await withSummary.session.start();
  assert.deepEqual(plain(await withSummary.call('buscar_viaje', trip)), { status: 'success', summary });
  withSummary.session.stop();
  const plainSuccess = harness();
  await plainSuccess.session.start();
  assert.deepEqual(plain(await plainSuccess.call('buscar_viaje', trip)), { status: 'success' });
  plainSuccess.session.stop();
  const opened = harness({ onShowDestination: () => ({ status: 'success', shown: { name: 'París', country: 'Francia' } }) });
  await opened.session.start();
  assert.deepEqual(plain(await opened.call('mostrar_destino', { destino: 'fr-paris' })),
    { status: 'success', shown: { name: 'París', country: 'Francia' } });
  opened.session.stop();
});

test('past dates: Sofía is told today\'s date and nothing is searched; today and tomorrow still work', async () => {
  let searched = 0, discovered = 0;
  const h = harness({ onSearch: async () => { searched++; return { status: 'success' }; },
    onDiscover: async () => { discovered++; return { status: 'success', summary: {} }; } });
  await h.session.start();
  const past = await h.call('buscar_viaje', { ...trip, fecha_ida: '2026-03-10', fecha_vuelta: '2026-03-15' });
  assert.deepEqual([past.status, past.error, past.reason, past.today], ['error', 'invalid_arguments', 'date_in_past', '2026-11-16']);
  assert.match(past.note, /2026-03-10/);
  assert.match(past.note, /Today is 2026-11-16/);
  const pastDiscover = await h.call('descubrir_destinos', { ...discover, fecha_ida: '2026-03-10', fecha_vuelta: '2026-03-15' });
  assert.deepEqual([pastDiscover.error, pastDiscover.reason, pastDiscover.today], ['invalid_arguments', 'date_in_past', '2026-11-16']);
  assert.equal(searched + discovered, 0, 'a past departure never reaches the search');
  // Yesterday in Madrid can still be "today" for a traveller elsewhere, so only older days are refused.
  for (const day of ['2026-11-15', '2026-11-16', '2026-11-17', '2027-03-10']) {
    assert.equal((await h.call('buscar_viaje', { ...trip, fecha_ida: day, fecha_vuelta: '2027-03-15' })).status, 'success', day);
    assert.equal((await h.call('descubrir_destinos', { ...discover, fecha_ida: day, fecha_vuelta: '2027-03-15' })).status, 'success', day);
  }
  assert.equal((await h.call('buscar_viaje', { ...trip, fecha_ida: '2026-11-14', fecha_vuelta: '2027-03-15' })).reason, 'date_in_past');
  assert.equal(searched, 4);
  assert.equal(discovered, 4);
  h.session.stop();
});

test('past dates: "today" is the Madrid calendar day, and an unusable clock never blocks a search', async () => {
  // 23:30 UTC on the 15th is already the 16th in Madrid.
  const lateNight = harness({ now: () => new Date('2026-11-15T23:30:00Z') });
  await lateNight.session.start();
  const refused = await lateNight.call('buscar_viaje', { ...trip, fecha_ida: '2026-11-14', fecha_vuelta: '2027-03-15' });
  assert.equal(refused.today, '2026-11-16');
  assert.equal((await lateNight.call('buscar_viaje', { ...trip, fecha_ida: '2026-11-15', fecha_vuelta: '2027-03-15' })).status, 'success');
  lateNight.session.stop();

  const broken = harness({ now: () => new Date('invalid') });
  await broken.session.start();
  assert.equal((await broken.call('buscar_viaje', { ...trip, fecha_ida: '2026-03-10', fecha_vuelta: '2026-03-15' })).status, 'success');
  broken.session.stop();
});

/* ------------------------------------------------------------- la página */

const source = fs.readFileSync('app/page.tsx', 'utf8');
const compile = (code) => ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

test('page: Sofía discover handler fills the visible form, then queues the search for after the inputs settle', async () => {
  const start = source.indexOf('voiceDiscoverRef.current = (args, context) => {');
  const end = source.indexOf('async function runVoiceDiscover(');
  assert.ok(start > 0 && end > start);
  const code = compile(source.slice(start, end).replace('voiceDiscoverRef.current =', 'handle ='));
  const state = {};
  const calls = [];
  const scope = { handle: null, findDestinationProfile: destinationsModule.findDestinationProfile,
    document: { getElementById: (id) => ({ click() { calls.push('click:' + id); } }) } };
  for (const name of ['setOrigen', 'setFechaIda', 'setFechaVuelta', 'setPasajeros', 'setDiscoverBudget', 'setDiscoverBudgetType',
    'setDiscoverMode', 'setFlightResultsOpen', 'setModal', 'setDestinoSeleccionado', 'setPendingVoiceDiscover', 'setDiscoverState']) {
    scope[name] = (value) => { calls.push(name); state[name] = value; };
  }
  vm.runInNewContext(code, scope);
  const controller = new AbortController();
  const result = scope.handle(discover, { signal: controller.signal });
  assert.equal(state.setOrigen, 'Madrid');
  assert.equal(state.setDiscoverBudget, '600');
  assert.equal(state.setDiscoverBudgetType, 'total');
  assert.equal(state.setPasajeros, 2);
  assert.equal(state.setDiscoverMode, true);
  assert.equal(state.setDestinoSeleccionado, null);
  assert.ok(calls.includes('click:buscador-vuelos'));
  assert.equal(calls.includes('setDiscoverState'), false, 'results are only written by the queued search, after the reset effect');
  assert.equal(state.setPendingVoiceDiscover.started, false);
  assert.equal(state.setPendingVoiceDiscover.args.fecha_ida, discover.fecha_ida);
  state.setPendingVoiceDiscover.complete({ status: 'success', summary: { kind: 'discover' } });
  assert.equal((await result).status, 'success');

  const aborted = new AbortController();
  aborted.abort();
  assert.equal((await scope.handle(discover, { signal: aborted.signal })).status, 'cancelled');
  const stopped = new AbortController();
  const waiting = scope.handle(discover, { signal: stopped.signal });
  stopped.abort();
  assert.equal((await waiting).status, 'cancelled');
});

function pageFunction(name) {
  const file = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found;
  (function visit(node) { if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = node.getText(file); ts.forEachChild(node, visit); })(file);
  assert.ok(found, name);
  return compile(found);
}

function discoverScope(fetch, overrides = {}) {
  const writes = [];
  const scope = { URLSearchParams, fetch, discoverRequestIdRef: { current: 0 }, flightSearchErrorKey: (error) => 'key:' + error,
    canShowDestinationAutomatically: presentation.canShowDestinationAutomatically,
    buildVoiceDiscoverSummary: (input) => summaries.buildVoiceDiscoverSummary(input),
    window: { setTimeout: () => 0 }, document: { getElementById: () => null },
    setDiscoverState: (value) => writes.push(value), ...overrides };
  vm.runInNewContext(pageFunction('runVoiceDiscover'), scope);
  return { scope, writes };
}
const respond = (status, body) => async () => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

test('page: the voice discover search returns only what the cards on screen show', async () => {
  const results = [discovered('Lisboa', 80, 'Portugal', 'LIS'), discovered('Roma', 60, 'Italia', 'ROM'), discovered('Madeira', 95, 'Portugal', 'FNC')]
    .map(r => ({ ...r, destination: { ...r.destination, countryCode: r.destination.country === 'Italia' ? 'IT' : 'PT' } }));
  const urls = [];
  const { scope, writes } = discoverScope(async (url, options) => { urls.push([url, options]); return respond(200, { success: true, origin: { name: 'Madrid', code: 'MAD' }, results })(); });
  const result = plain(await scope.runVoiceDiscover(discover, new AbortController().signal));
  assert.equal(result.status, 'success');
  assert.deepEqual(result.summary.destinations.map(d => d.name), ['Lisboa', 'Madeira'], 'Italy is hidden on screen, so Sofía does not mention it');
  assert.equal(result.summary.destinations[0].totalForAllTravellers, 160);
  assert.deepEqual(writes.map(w => w.status), ['loading', 'success']);
  assert.equal(writes[1].results.length, 3, 'the page keeps the full response; filtering happens at render');
  const url = new URL(urls[0][0], 'https://x.test');
  assert.equal(url.pathname, '/api/travelpayouts/discover');
  assert.deepEqual([url.searchParams.get('origin'), url.searchParams.get('budget'), url.searchParams.get('budgetType'), url.searchParams.get('travelers')],
    ['Madrid', '600', 'total', '2']);
  assert.equal(urls[0][1].cache, 'no-store');
});

test('page: voice discover failures are reported honestly and a stop is a cancellation', async () => {
  const failure = async (status, body) => plain(await discoverScope(respond(status, body)).scope.runVoiceDiscover(discover, new AbortController().signal));
  assert.deepEqual(await failure(422, { success: false, error: 'unknown_origin' }), { status: 'error', error: 'unknown_origin' });
  assert.deepEqual(await failure(400, { success: false, error: 'invalid_search' }), { status: 'error', error: 'invalid_arguments' });
  assert.deepEqual(await failure(503, { success: false, error: 'not_configured' }), { status: 'error', error: 'search_failed' });
  assert.deepEqual(await failure(200, { success: true, results: 'nope' }), { status: 'error', error: 'search_failed' });
  const down = discoverScope(async () => { throw Error('offline'); });
  assert.deepEqual(plain(await down.scope.runVoiceDiscover(discover, new AbortController().signal)), { status: 'error', error: 'search_failed' });
  assert.equal(down.writes.at(-1).status, 'error');

  const aborted = new AbortController();
  aborted.abort();
  const idle = discoverScope(respond(200, {}));
  assert.equal((await idle.scope.runVoiceDiscover(discover, aborted.signal)).status, 'cancelled');
  assert.deepEqual(idle.writes, []);

  const pending = deferred();
  const stopping = discoverScope(() => pending.promise);
  const controller = new AbortController();
  const run = stopping.scope.runVoiceDiscover(discover, controller.signal);
  controller.abort();
  assert.deepEqual(stopping.writes.map(w => w.status), ['loading', 'idle']);
  pending.resolve(await respond(200, { success: true, origin: { name: 'Madrid', code: 'MAD' }, results: [] })());
  assert.equal((await run).status, 'cancelled');
  assert.equal(stopping.writes.at(-1).status, 'idle', 'a late response never reopens the results');
});

test('page: the voice discover search starts from an effect declared after the effect that resets the results', () => {
  const reset = source.indexOf('setDiscoverState({ status: "idle" });\n  }, [origen, fechaIda, fechaVuelta, pasajeros, discoverBudget, discoverBudgetType, discoverMode]);');
  const start = source.indexOf('if (!pendingVoiceDiscover || pendingVoiceDiscover.started) return;');
  assert.ok(reset > 0 && start > reset);
  assert.match(source, /void runVoiceDiscover\(args, context\.signal\)\.then\(complete\);\s+setPendingVoiceDiscover\(null\);/);
  assert.match(source, /onDiscover: \(args, context\) => voiceDiscoverRef\.current\(args, context\),/);
});

test('page: a flight + hotel budget travels with the search but never filters the flights', async () => {
  const a = source.indexOf('voiceSearchRef.current = (datos, context) => {');
  const b = source.indexOf('};  const [mensaje', a);
  const code = compile(source.slice(a, b + 2).replace('voiceSearchRef.current =', 'handle ='));
  const state = {};
  const scope = { handle: null, findDestinationProfile: destinationsModule.findDestinationProfile, findDestinationCard: () => null,
    hotelDefaults: {}, hotelsHref: () => '/hoteles', window: { location: { assign() {} } }, document: { getElementById: () => ({ click() {} }) } };
  for (const name of ['setOrigen', 'setDestinoVuelo', 'setDestinoHotel', 'setFechaIda', 'setFechaVuelta', 'setEntrada', 'setSalida', 'setPasajeros',
    'setHuespedes', 'setFlightResultsOpen', 'setNonFlightVoiceBudget', 'setModal', 'setDestinoSeleccionado', 'setPendingVoiceFlightSearch']) scope[name] = (v) => { state[name] = v; };
  vm.runInNewContext(code, scope);
  const signal = new AbortController().signal;
  const both = scope.handle({ ...trip, servicio: 'ambos', presupuesto: 900, tipo_presupuesto: 'total' }, { signal });
  assert.deepEqual(plain(state.setPendingVoiceFlightSearch.query.combinedBudget), { amount: 900, type: 'total' });
  assert.equal(state.setPendingVoiceFlightSearch.query.budget, undefined);
  state.setPendingVoiceFlightSearch.complete({ status: 'success' });
  await both;
  const flightsOnly = scope.handle({ ...trip, servicio: 'vuelo', presupuesto: 300, tipo_presupuesto: 'por_persona' }, { signal });
  assert.deepEqual(plain(state.setPendingVoiceFlightSearch.query.budget), { amount: 300, type: 'por_persona' });
  assert.equal(state.setPendingVoiceFlightSearch.query.combinedBudget, undefined);
  state.setPendingVoiceFlightSearch.complete({ status: 'success' });
  await flightsOnly;
  scope.handle(trip, { signal });
  assert.equal(state.setPendingVoiceFlightSearch.query.combinedBudget, undefined);
});

test('page: the effect that runs the voice flight search gives Sofía the summary of the offers on screen', () => {
  const start = source.indexOf('if (!pendingVoiceFlightSearch || pendingVoiceFlightSearch.started) return;');
  const effect = source.slice(start, source.indexOf('}, [pendingVoiceFlightSearch]);', start));
  assert.match(effect, /runFlightSearch\(pendingVoiceFlightSearch\.query, pendingVoiceFlightSearch\.context\.signal\)/);
  assert.match(effect, /"offers" in result/);
  assert.match(effect, /buildVoiceTripSummary\(\{/);
  assert.match(effect, /flightBudget: query\.budget/);
  assert.match(effect, /combinedBudget: query\.combinedBudget/);
  assert.match(source, /return \{ status: 'success', offers: data\.results \};/);
  assert.equal(await_free(effect), true);
});
function await_free(text) { return !/\bawait\b/.test(text); }

test('page: showing a card tells Sofía which card opened', () => {
  assert.match(source, /return \{ status: 'success', shown: \{ name: destinationDisplay\(destination, voiceLocaleRef\.current\)\.name,/);
});
