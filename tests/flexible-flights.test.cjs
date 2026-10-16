const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../app/api/travelpayouts/flights/route.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const token = 'server-only-test-token';
const ticket = (departure, back, price, suffix = '') => ({
  origin: 'BCN', destination: 'MAD', price,
  departure_at: `${departure}T09:00:00+02:00`, return_at: `${back}T18:00:00+02:00`,
  airline: 'IB', transfers: 0,
  link: `/search/BCN2010MAD2210?marker=affiliate${suffix}`,
});
const offers = [
  ticket('2026-10-20', '2026-10-22', 110),
  ticket('2026-10-19', '2026-10-22', 96),
  ticket('2026-10-19', '2026-10-22', 105, 'duplicate'),
  ticket('2026-10-21', '2026-10-24', 89),
  ticket('2026-10-13', '2026-10-15', 70),
  ticket('2026-10-12', '2026-10-15', 50),
];

function setup(provider) {
  const calls = [];
  const fetch = async (input, options) => {
    const url = new URL(String(input));
    if (url.hostname === 'autocomplete.travelpayouts.com') {
      const name = url.searchParams.get('term');
      const code = name === 'Barcelona' ? 'BCN' : 'MAD';
      return { ok: true, json: async () => [{ type: 'city', name, code, country_code: 'ES' }] };
    }
    assert.equal(options.headers['X-Access-Token'], token);
    calls.push(url);
    return { ok: true, json: async () => ({ success: true, currency: 'eur', data: provider(url) }) };
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports, require: (id) => id === '@/lib/destinations'
      ? { findDestinationProfile: () => undefined } : require(id),
    fetch, URL, Request, Response, AbortSignal, process: { env: { TRAVELPAYOUTS_API_TOKEN: token } },
  }, { filename: 'flights/route.ts' });
  const search = async (parameters) => {
    const query = new URLSearchParams({
      origin: 'Barcelona', destination: 'Madrid',
      departureDate: '2026-10-20', returnDate: '2026-10-22', travelers: '2',
      ...parameters,
    });
    const response = await exports.GET(new Request(`https://example.test/api/travelpayouts/flights?${query}`));
    return { status: response.status, body: await response.json() };
  };
  return { calls, search };
}

test('exact search keeps its single day-specific request and affiliate link', async () => {
  const { calls, search } = setup(() => [offers[0]]);
  const { body } = await search();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].pathname, '/aviasales/v3/prices_for_dates');
  assert.equal(calls[0].searchParams.get('departure_at'), '2026-10-20');
  assert.equal(calls[0].searchParams.get('return_at'), '2026-10-22');
  assert.equal(calls[0].searchParams.get('currency'), 'EUR');
  assert.equal(body.results.length, 1);
  assert.match(body.results[0].offerUrl, /^https:\/\/www\.aviasales\.com\/search\/.+marker=affiliate/);
  assert.ok(!JSON.stringify(body).includes(token));
});

for (const [days, prices] of [[1, [96, 110]], [3, [89, 96, 110]], [7, [70, 89, 96, 110]]]) {
  test(`flexible ±${days} filters dates, sorts prices, and deduplicates date pairs`, async () => {
    const { calls, search } = setup(() => offers);
    const { body } = await search({ flexDays: String(days) });
    assert.equal(calls.length, 1);
    assert.equal(calls[0].searchParams.get('departure_at'), '2026-10');
    assert.equal(calls[0].searchParams.get('return_at'), '2026-10');
    assert.equal(calls[0].searchParams.get('limit'), '1000');
    assert.deepEqual(Array.from(body.results, (flight) => flight.price), prices);
    assert.ok(body.results.every((flight) => flight.returnAt && flight.offerUrl?.includes('marker=affiliate')));
  });
}

test('a window crossing month boundaries uses at most four month-pair requests', async () => {
  const { calls, search } = setup(() => []);
  const { body } = await search({ departureDate: '2026-10-30', returnDate: '2026-11-02', flexDays: '7' });
  assert.equal(body.results.length, 0);
  assert.equal(calls.length, 4);
  assert.deepEqual(new Set(calls.map((url) => url.searchParams.get('departure_at'))), new Set(['2026-10', '2026-11']));
  assert.deepEqual(new Set(calls.map((url) => url.searchParams.get('return_at'))), new Set(['2026-10', '2026-11']));
});

test('a no-results search returns a safe empty list', async () => {
  const { search } = setup(() => []);
  const { status, body } = await search({ flexDays: '3' });
  assert.equal(status, 200);
  assert.equal(body.success, true);
  assert.equal(body.results.length, 0);
  assert.ok(!JSON.stringify(body).includes(token));
});

test('the existing voice budget path still uses search_by_price_range', async () => {
  const { calls, search } = setup(() => []);
  await search({ budget: '300', budgetType: 'total' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].pathname, '/aviasales/v3/search_by_price_range');
  assert.equal(calls[0].searchParams.get('value_max'), '150');
  assert.equal(calls[0].searchParams.get('flexDays'), null);
});
