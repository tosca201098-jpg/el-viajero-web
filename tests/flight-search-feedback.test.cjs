const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function compile(source, jsx = ts.JsxEmit.React) {
  return ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx },
  }).outputText;
}

function load(relativePath) {
  const exports = {};
  vm.runInNewContext(compile(fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')), { exports });
  return exports;
}

const translations = load('lib/i18n/translations.ts');
const { flightSearchErrorKey } = load('lib/travelpayouts/search-feedback.ts');
// Execute the actual page handlers with mocked fetch/state; no provider credentials or live requests.
const page = ts.createSourceFile('page.tsx', fs.readFileSync(path.join(__dirname, '../app/page.tsx'), 'utf8'),
  ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const names = new Set(['runFlightSearch', 'discoverDestinations', 'renderFlightSearchFeedback', 'noFlightResultsMessage']);
const functions = [];
function collect(node) {
  if (ts.isFunctionDeclaration(node) && names.has(node.name?.text)) functions.push(node.getText(page));
  ts.forEachChild(node, collect);
}
collect(page);
assert.equal(functions.length, names.size);
const handlers = compile(functions.join('\n'));
const query = { origin: 'Ciudad de Madrid', destination: 'París', departureDate: '2026-11-17',
  returnDate: '2026-11-20', travelers: 1 };
const empty = { success: true, origin: { name: query.origin, code: 'MAD' },
  destination: { name: query.destination, code: 'PAR' }, results: [] };
const reply = (status, body) => async () => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json' },
});

function setup(fetch, locale = 'es') {
  const calls = [];
  const scope = {
    URLSearchParams, flightSearchErrorKey,
    React: { createElement: (type, props, ...children) => ({ type, props, children }) },
    t: (key, variables) => translations.translate(locale, key, variables),
    flightSearch: { status: 'idle' }, flightResultsOpen: false,
    flightRequestIdRef: { current: 0 }, discoverRequestIdRef: { current: 0 },
    discoverState: { status: 'idle' }, discoverBudget: '300', discoverBudgetType: 'total',
    origen: query.origin, fechaIda: query.departureDate, fechaVuelta: query.returnDate, pasajeros: 1,
    findFlightDestination: () => undefined, findDestinationProfile: () => undefined,
    setDestinoSeleccionado: () => {}, setModal: () => {},
    formatBudgetAmount: (amount) => `${amount} EUR`,
  };
  scope.setFlightSearch = (value) => { scope.flightSearch = value; };
  scope.setFlightResultsOpen = (value) => { scope.flightResultsOpen = value; };
  scope.setDiscoverState = (value) => { scope.discoverState = value; };
  scope.fetch = async (...args) => { calls.push(args); return fetch(...args); };
  vm.runInNewContext(handlers, scope, { filename: 'page-flight-handlers.tsx' });
  return { scope, calls };
}

test('known validation errors retain their messages; unrecognized values use safe generic text', () => {
  for (const [error, key] of [
    ['invalid_search', 'search.flightInvalidSearch'], ['invalid_dates', 'search.flightInvalidDates'],
    ['unknown_origin', 'search.flightUnknownOrigin'], ['unknown_destination', 'search.flightUnknownDestination'],
  ]) assert.equal(flightSearchErrorKey(error), key);
  assert.equal(flightSearchErrorKey('invalid_search', 'discover'), 'search.discoverInvalid');
  for (const error of [undefined, null, {}, [], 'constructor', '__proto__', '<script>provider details</script>']) {
    assert.equal(flightSearchErrorKey(error), 'search.flightSearchError');
    assert.equal(flightSearchErrorKey(error, 'discover'), 'search.discoverError');
  }
});

for (const { code: locale } of translations.locales) {
  test(`${locale}: configuration, provider failure and empty results have distinct translated UI messages`, async () => {
    const messages = [];
    for (const [status, body, key, role] of [
      [503, { success: false, error: 'not_configured' }, 'search.flightSearchNotConfigured', 'alert'],
      [502, { success: false, error: 'provider_unavailable' }, 'search.flightSearchTemporaryError', 'alert'],
      [200, empty, 'search.noRecentPrices', 'status'],
    ]) {
      assert.ok(Object.hasOwn(translations.dictionaries[locale], key));
      const text = translations.dictionaries[locale][key];
      assert.ok(typeof text === 'string' && text.trim().length > 0);
      if (locale !== 'es') assert.notEqual(text, translations.dictionaries.es[key]);
      const { scope } = setup(reply(status, body), locale);
      await scope.runFlightSearch(query);
      assert.equal(scope.flightSearch.status, status === 200 ? 'success' : 'error');
      const feedback = scope.renderFlightSearchFeedback();
      assert.equal(feedback.props.role, role);
      assert.equal(feedback.children[0], text);
      messages.push(text);
    }
    assert.equal(new Set(messages).size, 3);
  });
}

test('network failures use the service message; invalid success payloads keep the generic fallback', async () => {
  for (const [fetch, key] of [
    [async () => { throw Error('private network diagnostics'); }, 'search.flightSearchTemporaryError'],
    [reply(200, { success: true }), 'search.flightSearchError'],
    [reply(502, { success: false, error: 'unrecognized-provider-text' }), 'search.flightSearchError'],
  ]) {
    const { scope } = setup(fetch);
    await scope.runFlightSearch(query);
    assert.equal(scope.flightSearch.key, key);
    assert.ok(!scope.renderFlightSearchFeedback().children[0].includes('private'));
  }
});

test('flight request retains dates, travelers, flexible days, budget and no-store caching', async () => {
  const { scope, calls } = setup(reply(200, { ...empty, results: [{ price: 220 }, { price: 140 }] }));
  const requested = { ...query, travelers: 2, flexDays: 3, budget: { amount: 500, type: 'total' } };
  await scope.runFlightSearch(requested);
  const params = new URL(calls[0][0], 'https://example.test').searchParams;
  for (const key of ['origin', 'destination', 'departureDate', 'returnDate', 'travelers', 'flexDays']) {
    assert.equal(params.get(key), String(requested[key]));
  }
  assert.equal(params.get('budget'), '500');
  assert.equal(params.get('budgetType'), 'total');
  assert.equal(calls[0][1].cache, 'no-store');
  assert.equal(scope.flightSearch.query, requested);
  assert.deepEqual(Array.from(scope.flightSearch.results, (offer) => offer.price), [140, 220]);
});

test('budget discovery uses the same configuration and service messages and preserves valid empty searches', async () => {
  for (const [fetch, expected] of [
    [reply(503, { success: false, error: 'not_configured' }), 'search.flightSearchNotConfigured'],
    [reply(502, { success: false, error: 'provider_unavailable' }), 'search.flightSearchTemporaryError'],
    [async () => { throw Error('offline'); }, 'search.flightSearchTemporaryError'],
    [reply(400, { success: false, error: 'invalid_search' }), 'search.discoverInvalid'],
    [reply(200, empty), undefined],
  ]) {
    const { scope, calls } = setup(fetch);
    await scope.discoverDestinations({ preventDefault() {} });
    assert.equal(scope.discoverState.status, expected ? 'error' : 'success');
    assert.equal(scope.discoverState.key, expected);
    const url = new URL(calls[0][0], 'https://example.test');
    assert.equal(url.pathname, '/api/travelpayouts/discover');
    assert.equal(url.searchParams.get('budget'), '300');
    assert.equal(url.searchParams.get('origin'), query.origin);
  }
});

test('late flight responses cannot overwrite a newer search result', async () => {
  let finishFirst;
  let count = 0;
  const { scope } = setup(() => ++count === 1
    ? new Promise((resolve) => { finishFirst = resolve; })
    : reply(200, empty)());
  const first = scope.runFlightSearch(query);
  await scope.runFlightSearch(query);
  finishFirst(await reply(503, { success: false, error: 'not_configured' })());
  await first;
  assert.equal(scope.flightSearch.status, 'success');
});
