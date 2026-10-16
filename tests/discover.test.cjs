const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../app/api/travelpayouts/discover/route.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const token = 'server-only-test-token';
const profiles = {
  MAD: { name: 'Madrid', country: 'España', image: 'https://example.test/madrid.jpg', recommendedStay: '3–4 días' },
  LIS: { name: 'Lisboa', country: 'Portugal', image: 'https://example.test/lisboa.jpg', recommendedStay: '3 días' },
  OPO: { name: 'Porto', country: 'Portugal', image: 'https://example.test/porto.jpg', recommendedStay: '2 días' },
};
const ticket = (destination, price, extra = {}) => ({
  origin: 'BCN', destination, price, departure_at: '2026-11-20T08:00:00+01:00',
  return_at: '2026-11-24T18:00:00+01:00', airline: 'IB', transfers: 0,
  link: `/search/BCN2011${destination}2411?marker=affiliate`, ...extra,
});
const data = [ticket('LIS', 72), ticket('MAD', 95), ticket('OPO', 210),
  ticket('LIS', 80), ticket('XXX', 60), ticket('MAD', 50, { link: 'https://evil.test/offer' }),
  ticket('MAD', 40, { return_at: '2026-11-25T18:00:00+01:00' })];

function setup(records = data) {
  const calls = [];
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require: (id) => id === '@/lib/destinations'
      ? { findDestinationProfile: ({ iataCode }) => profiles[iataCode] }
      : { isRecord: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
          resolveCity: async (name) => ({ name, code: name === 'Madrid' ? 'MAD' : 'BCN' }),
          offerUrl: (value) => typeof value === 'string' && value.startsWith('/search/')
            ? `https://www.aviasales.com${value}` : null },
    fetch: async (url, options) => {
      calls.push({ url: new URL(url), options });
      return { ok: true, json: async () => ({ success: true, currency: 'eur', data: records }) };
    },
    URL, Request, Response, AbortSignal, process: { env: { TRAVELPAYOUTS_API_TOKEN: token } },
  });
  const search = async (params = {}) => {
    const query = new URLSearchParams({ origin: 'Barcelona', departureDate: '2026-11-20',
      returnDate: '2026-11-24', travelers: '1', budget: '250', budgetType: 'por_persona', ...params });
    const response = await exports.GET(new Request(`https://example.test/api/travelpayouts/discover?${query}`));
    return { status: response.status, body: await response.json() };
  };
  return { calls, search };
}

test('single official request, no destination parameter, and token only in header', async () => {
  const { calls, search } = setup();
  const { body } = await search();
  assert.equal(calls.length, 1);
  const { url, options } = calls[0];
  assert.equal(url.pathname, '/aviasales/v3/prices_for_dates');
  assert.equal(url.searchParams.get('origin'), 'BCN');
  assert.equal(url.searchParams.has('destination'), false);
  for (const [key, value] of Object.entries({ departure_at: '2026-11-20', return_at: '2026-11-24',
    one_way: 'false', unique: 'true', sorting: 'price', currency: 'EUR', limit: '1000' })) {
    assert.equal(url.searchParams.get(key), value);
  }
  assert.equal(options.headers['X-Access-Token'], token);
  assert.ok(!url.toString().includes(token));
  assert.ok(!JSON.stringify(body).includes(token));
});

test('Barcelona at 100 and 250 per person: budget, library, date, affiliate, dedup and order', async () => {
  const { search } = setup();
  const under100 = (await search({ budget: '100' })).body;
  assert.deepEqual(Array.from(under100.results, (item) => item.destination.code), ['LIS', 'MAD']);
  assert.deepEqual(Array.from(under100.results, (item) => item.offer.price), [72, 95]);
  const under250 = (await search()).body;
  assert.deepEqual(Array.from(under250.results, (item) => item.destination.code), ['LIS', 'MAD', 'OPO']);
  assert.equal(under250.counts.providerResults, 7);
  assert.equal(under250.counts.profileMatches, 3);
  assert.ok(under250.results.every((item) => item.destination.image && item.offer.offerUrl.includes('marker=affiliate')));
});

test('Madrid origin, total budget split between two travelers, and very low budget', async () => {
  const { search } = setup();
  const madrid = (await search({ origin: 'Madrid', budget: '200' })).body;
  assert.equal(madrid.origin.code, 'MAD');
  const total = (await search({ budget: '200', budgetType: 'total', travelers: '2' })).body;
  assert.deepEqual(Array.from(total.results, (item) => item.offer.price), [72, 95]);
  const low = (await search({ budget: '1' })).body;
  assert.equal(low.results.length, 0);
});
