const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 };
function loader() {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions }).outputText, {
      exports, require: id => {
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
const load = loader();
const { buildVoiceTripSummary } = load('lib/voice/trip-summary.ts');
const { searchWithNearbyDays, NEARBY_DAYS } = load('lib/voice/nearby-days.ts');
const plain = value => JSON.parse(JSON.stringify(value));
const source = file => fs.readFileSync(path.join(root, file), 'utf8');

const base = { origin: 'Madrid', destination: 'Roma', departureDate: '2027-03-12', returnDate: '2027-03-16', travellers: 2 };
const offer = (price, extra = {}) => ({ price, departureAt: '2027-03-12T07:00:00+01:00', returnAt: '2027-03-16T20:00:00+01:00', airline: 'IB', transfers: 0, ...extra });

test('no recent price is never presented to Sofía as «no flights»', () => {
  const s = plain(buildVoiceTripSummary({ ...base, offers: [] }));
  assert.deepEqual([s.offersFound, s.offers.length, s.noRecentPrices, s.offersFromNearbyDays], [0, 0, true, undefined]);
  assert.match(s.note, /No recent price is saved for these dates/);
  assert.match(s.note, /NOT the same as having no flights/);
  assert.match(s.note, /Never say that there are no flights, that none are available, that they are sold out/);
  assert.match(s.note, /offer to try other dates or another departure city/);
  assert.match(s.note, /Hotel prices and availability are NOT known/, 'the old rules stay');
  // A budget search that finds nothing says it in terms of the budget, not of the dates.
  const budget = plain(buildVoiceTripSummary({ ...base, offers: [], flightBudget: { amount: 50, type: 'por_persona' } }));
  assert.equal(budget.noRecentPrices, true);
  assert.match(budget.note, /within the traveller's budget/);
  assert.match(budget.note, /NOT the same as having no flights/);
  assert.match(budget.note, /higher budget or other dates/);
  assert.equal(budget.flightBudget.offersWithinBudget, 0);
});

test('prices found for the days around the asked ones come with their own real dates and say so', () => {
  const nearby = plain(buildVoiceTripSummary({ ...base, nearbyDays: 7, offers: [
    offer(87, { departureAt: '2027-03-14T07:00:00+01:00', returnAt: '2027-03-18T20:00:00+01:00' }),
    offer(120, { departureAt: '2027-03-10T07:00:00+01:00', returnAt: '2027-03-15T20:00:00+01:00' }),
  ] }));
  assert.equal(nearby.offersFromNearbyDays, 7);
  assert.equal(nearby.noRecentPrices, undefined);
  assert.deepEqual(nearby.offers.map(o => [o.pricePerPerson, o.departureDate, o.returnDate]), [[87, '2027-03-14', '2027-03-18'], [120, '2027-03-10', '2027-03-15']]);
  assert.deepEqual([nearby.departureDate, nearby.returnDate], ['2027-03-12', '2027-03-16'], 'the asked days stay as asked');
  assert.match(nearby.note, /No recent price is saved for the exact dates the person asked for/);
  assert.match(nearby.note, /up to 7 days around them/);
  assert.match(nearby.note, /own departureDate and returnDate/);
  assert.match(nearby.note, /never present them as the dates the person asked for/);
  assert.match(nearby.note, /Never say that there are no flights/);
  assert.equal(/hotelPrice|hotel_price|pricePerNight/.test(JSON.stringify(nearby)), false);
  // Nothing found around them either: still «no recent price», never «no flights», and it says the nearby days were checked.
  const none = plain(buildVoiceTripSummary({ ...base, nearbyDays: 7, offers: [] }));
  assert.equal(none.noRecentPrices, true);
  assert.equal(none.offersFromNearbyDays, undefined);
  assert.match(none.note, /or for the days around them \(7 days each side\)/);
  assert.match(none.note, /NOT the same as having no flights/);
});

test('an ordinary summary (prices for the asked days) is exactly as before', () => {
  const s = plain(buildVoiceTripSummary({ ...base, offers: [offer(99), offer(120)] }));
  assert.deepEqual([s.noRecentPrices, s.offersFromNearbyDays], [undefined, undefined]);
  assert.equal(/Never say that there are no flights|NOT the same as having no flights|nearby/.test(s.note), false);
  assert.match(s.note, /Hotel prices and availability are NOT known/);
  assert.equal(s.offersFound, 2);
  // A zero or invalid nearbyDays is ignored.
  for (const nearbyDays of [0, -3, Number.NaN, undefined]) {
    const t = plain(buildVoiceTripSummary({ ...base, nearbyDays, offers: [offer(99)] }));
    assert.equal(t.offersFromNearbyDays, undefined, String(nearbyDays));
  }
});

function runner(...replies) {
  const calls = [];
  return { calls, run: async query => { calls.push(plain(query)); return replies[calls.length - 1] ?? { status: 'error', error: 'unexpected' }; } };
}
const query = { origin: 'Madrid', destination: 'Roma', departureDate: '2027-03-12', returnDate: '2027-03-16', travelers: 2 };

test('exact days with prices are searched once and nothing else happens', async () => {
  const { run, calls } = runner({ status: 'success', offers: [{ price: 99 }] });
  const out = await searchWithNearbyDays(run, query);
  assert.equal(calls.length, 1);
  assert.deepEqual(plain(calls[0]), query);
  assert.equal(out.nearbyDays, undefined);
  assert.equal(out.result.offers.length, 1);
});

test('exact days without any price trigger one more search of ±7 days with the same trip', async () => {
  const frozen = Object.freeze({ ...query });
  const { run, calls } = runner({ status: 'success', offers: [] }, { status: 'success', offers: [{ price: 55 }] });
  const out = await searchWithNearbyDays(run, frozen);
  assert.equal(NEARBY_DAYS, 7);
  assert.deepEqual(calls, [query, { ...query, flexDays: 7 }]);
  assert.equal(out.nearbyDays, 7);
  assert.equal(out.result.offers[0].price, 55);
  assert.equal('flexDays' in frozen, false, 'the asked search is never modified');
  // Nothing around either: the second (empty) result is what the screen shows and Sofía hears.
  const empty = runner({ status: 'success', offers: [] }, { status: 'success', offers: [] });
  const emptyOut = await searchWithNearbyDays(empty.run, query);
  assert.equal(empty.calls.length, 2);
  assert.deepEqual([emptyOut.result.offers.length, emptyOut.nearbyDays], [0, 7]);
});

test('it is never widened for a budget search, an already flexible search, a failure or a cancellation', async () => {
  const empty = { status: 'success', offers: [] };
  for (const [name, replies, asked] of [
    ['budget', [empty], { ...query, budget: { amount: 300, type: 'total' } }],
    ['flexible', [empty], { ...query, flexDays: 3 }],
    ['error', [{ status: 'error', error: 'search_failed' }], query],
    ['cancelled', [{ status: 'cancelled' }], query],
    ['show-card result', [{ status: 'success', shown: { name: 'Roma', country: 'Italia' } }], query],
  ]) {
    const { run, calls } = runner(...replies);
    const out = await searchWithNearbyDays(run, asked);
    assert.equal(calls.length, 1, name);
    assert.equal(out.nearbyDays, undefined, name);
    assert.deepEqual(plain(out.result), replies[0], name);
  }
  // A combined (flight + hotel) budget does not filter flights, so it does not stop the nearby search.
  const combined = runner({ status: 'success', offers: [] }, { status: 'success', offers: [{ price: 70 }] });
  const out = await searchWithNearbyDays(combined.run, { ...query, combinedBudget: { amount: 900, type: 'total' } });
  assert.equal(combined.calls.length, 2);
  assert.equal(out.nearbyDays, 7);
});

test('if the nearby search fails or is cancelled, that outcome is reported, not the empty first one', async () => {
  for (const second of [{ status: 'error', error: 'search_failed' }, { status: 'cancelled' }]) {
    const { run } = runner({ status: 'success', offers: [] }, second);
    const out = await searchWithNearbyDays(run, query);
    assert.deepEqual(plain(out.result), second);
    assert.equal(out.nearbyDays, undefined);
  }
});

test('Rome-like case end to end: no price for the asked days, real prices around them, said with their dates', async () => {
  const { run } = runner({ status: 'success', offers: [] }, { status: 'success', offers: [
    { price: 55, departureAt: '2027-03-15T06:10:00+01:00', returnAt: '2027-03-19T21:00:00+01:00', airline: 'FR', transfers: 0, offerUrl: 'https://secret.example/?marker=1' },
  ] });
  const { result, nearbyDays } = await searchWithNearbyDays(run, query);
  const summary = plain(buildVoiceTripSummary({ ...base, offers: result.offers, ...(nearbyDays ? { nearbyDays } : {}) }));
  assert.equal(summary.offersFound, 1);
  assert.deepEqual([summary.offers[0].pricePerPerson, summary.offers[0].totalForAllTravellers, summary.offers[0].departureDate, summary.offers[0].returnDate], [55, 110, '2027-03-15', '2027-03-19']);
  assert.equal(summary.offersFromNearbyDays, 7);
  assert.equal(JSON.stringify(summary).includes('secret.example'), false, 'no affiliate link reaches Sofía');
});

test('page: the voice search uses the nearby-days helper and nothing else about it changes', () => {
  const page = source('app/page.tsx');
  assert.match(page, /import \{ searchWithNearbyDays \} from "@\/lib\/voice\/nearby-days";/);
  const start = page.indexOf('if (!pendingVoiceFlightSearch || pendingVoiceFlightSearch.started) return;');
  const effect = page.slice(start, page.indexOf('}, [pendingVoiceFlightSearch]);', start));
  assert.match(effect, /const \{ query, complete, context \} = pendingVoiceFlightSearch;/);
  assert.match(effect, /searchWithNearbyDays\(\(search\) => runFlightSearch\(search, context\.signal\), query\)/);
  assert.match(effect, /\.\.\.\(nearbyDays \? \{ nearbyDays \} : \{\}\)/);
  assert.equal((effect.match(/runFlightSearch\(/g) ?? []).length, 1, 'one call site; the helper decides about the second');
  assert.equal(/\bawait\b/.test(effect), false);
  // The visitor's own form search is untouched: it never goes through the helper.
  const submit = page.slice(page.indexOf('async function launchExactFlightSearch('), page.indexOf('async function discoverDestinations('));
  assert.equal(submit.includes('searchWithNearbyDays'), false);
  assert.equal((page.match(/searchWithNearbyDays\(/g) ?? []).length, 1);
  // The summary builder and the helper never reach for the network or for prices of hotels.
  assert.equal(/fetch\(|hotelPrice|XMLHttpRequest/.test(source('lib/voice/nearby-days.ts') + source('lib/voice/trip-summary.ts')), false);
});
