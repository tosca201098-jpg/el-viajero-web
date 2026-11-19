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
      exports, URL, URLSearchParams, Promise, ...globals, require: id => {
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
const plain = value => JSON.parse(JSON.stringify(value));
const load = loader();
const { liveFlightCode, liveFlightsSrc, liveFlightKey } = load('lib/voice/live-flights.ts');
const { searchVoiceFlights } = load('lib/voice/voice-flight-search.ts');
const { buildVoiceTripSummary } = load('lib/voice/trip-summary.ts');

const CODE = 'MAD1203ROM16031';
const query = { origin: 'MAD', destination: 'ROM', departureDate: '2027-03-12', returnDate: '2027-03-16', travelers: 1 };
const answer = (body, ok = true) => ({ ok, json: async () => body });

// ── The search code of the live list ────────────────────────────────────────────────────────────────────────────────
test('the live list code is asked from the same endpoint as the home form, with the same trip and nothing else', async () => {
  const calls = [];
  const controller = new AbortController();
  const code = await liveFlightCode({ ...query, extra: 'ignored' }, controller.signal, async (url, init) => {
    calls.push({ url, init });
    return answer({ success: true, url: `/?flightSearch=${CODE}&featured=roma&departureDate=2027-03-12&returnDate=2027-03-16` });
  });
  assert.equal(code, CODE);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/travelpayouts/flight-link');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.signal, controller.signal);
  assert.deepEqual(JSON.parse(calls[0].init.body), query, 'only the five trip fields are sent');
  // A card of the 16 has «/?flightSearch=…&featured=…»; any other place has «/vuelos?flightSearch=…».
  assert.equal(await liveFlightCode(query, undefined, async () => answer({ success: true, url: `/vuelos?flightSearch=${CODE}&destinationId=bari` })), CODE);
});

test('anything that is not a clean answer gives no live list, never an error', async () => {
  const good = `/?flightSearch=${CODE}&featured=roma`;
  const cases = [
    ['server error', async () => answer({ success: true, url: good }, false)],
    ['success false', async () => answer({ success: false, error: 'unknown_destination' })],
    ['no url', async () => answer({ success: true })],
    ['address of another website', async () => answer({ success: true, url: `https://evil.example/?flightSearch=${CODE}` })],
    ['protocol-relative address', async () => answer({ success: true, url: `//evil.example/?flightSearch=${CODE}` })],
    ['no search code', async () => answer({ success: true, url: '/vuelos?destinationId=bari' })],
    ['invalid search code', async () => answer({ success: true, url: '/vuelos?flightSearch=%22%3E%3Cscript%3E' })],
    ['same origin and destination', async () => answer({ success: true, url: '/vuelos?flightSearch=MAD1203MAD16031' })],
    ['answer is not JSON', async () => ({ ok: true, json: async () => { throw new SyntaxError('bad'); } })],
    ['answer is null', async () => answer(null)],
    ['network failure', async () => { throw new TypeError('network'); }],
    ['cancelled', async () => { throw new DOMException('aborted', 'AbortError'); }],
  ];
  for (const [name, post] of cases) assert.equal(await liveFlightCode(query, undefined, post), null, name);
});

test('the frame address is built only for a valid search code', () => {
  assert.equal(liveFlightsSrc(CODE), `/vuelos-en-vivo?flightSearch=${CODE}`);
  for (const bad of [null, undefined, 42, '', 'x', 'MAD1203MAD16031', `${CODE}&x=1`, `${CODE}"><script>`, 'mad1203rom16031', 'MAD1203ROM16030', 'https://evil.example'])
    assert.equal(liveFlightsSrc(bad), null, String(bad));
});

test('the live list belongs to one exact trip: same trip same key, any difference another key', () => {
  const key = liveFlightKey(query);
  assert.equal(liveFlightKey({ ...query, origin: ' mad ', destination: 'rom' }), key);
  for (const change of [{ origin: 'BCN' }, { destination: 'PAR' }, { departureDate: '2027-03-13' }, { returnDate: '2027-03-17' }, { travelers: 2 }])
    assert.notEqual(liveFlightKey({ ...query, ...change }), key, JSON.stringify(change));
});

// ── What Sofía's search does with it ────────────────────────────────────────────────────────────────────────────────
function harness({ replies = [], live = CODE } = {}) {
  const runs = [], lives = [];
  return {
    runs, lives,
    run: async search => { runs.push(plain(search)); return replies[runs.length - 1] ?? { status: 'error', error: 'unexpected' }; },
    findLive: async (search, signal) => { lives.push({ search: plain(search), signal }); if (live instanceof Error) throw live; return live; },
  };
}
const empty = { status: 'success', offers: [] };
const withPrice = { status: 'success', offers: [{ price: 99 }] };

test('with a live list, the saved prices of the exact days are searched once and the live code comes back with them', async () => {
  for (const exact of [withPrice, empty]) {
    const h = harness({ replies: [exact] });
    const controller = new AbortController();
    const out = await searchVoiceFlights(h.run, query, controller.signal, h.findLive);
    assert.equal(h.runs.length, 1, 'no widening of the days when the live list shows them');
    assert.deepEqual(h.runs[0], query);
    assert.equal(h.lives.length, 1);
    assert.equal(h.lives[0].signal, controller.signal);
    assert.equal(out.liveCode, CODE);
    assert.equal(out.nearbyDays, undefined);
    assert.deepEqual(plain(out.result), exact);
  }
});

test('both searches start together, not one after the other', async () => {
  const order = [];
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const pending = searchVoiceFlights(
    async () => { order.push('saved prices'); await gate; return empty; }, query, undefined,
    async () => { order.push('live code'); await gate; return CODE; });
  assert.deepEqual(order, ['live code', 'saved prices']);
  release();
  assert.equal((await pending).liveCode, CODE);
});

test('without a live list the old rule applies: the days around the asked ones, reusing the exact search already made', async () => {
  const h = harness({ replies: [empty, withPrice], live: null });
  const out = await searchVoiceFlights(h.run, query, undefined, h.findLive);
  assert.deepEqual(h.runs, [query, { ...query, flexDays: 7 }]);
  assert.equal(out.liveCode, undefined);
  assert.equal(out.nearbyDays, 7);
  assert.deepEqual(plain(out.result), withPrice);
  // Prices for the exact days and no live list: nothing more is searched.
  const priced = harness({ replies: [withPrice], live: null });
  const pricedOut = await searchVoiceFlights(priced.run, query, undefined, priced.findLive);
  assert.equal(priced.runs.length, 1);
  assert.deepEqual([pricedOut.liveCode, pricedOut.nearbyDays], [undefined, undefined]);
});

test('a live list is never looked for in budget or flexible searches', async () => {
  for (const asked of [{ ...query, budget: { amount: 300, type: 'total' } }, { ...query, flexDays: 3 }]) {
    const h = harness({ replies: [empty] });
    const out = await searchVoiceFlights(h.run, asked, undefined, h.findLive);
    assert.equal(h.lives.length, 0);
    assert.equal(h.runs.length, 1, 'and they are not widened either');
    assert.equal(out.liveCode, undefined);
    assert.deepEqual(plain(out.result), empty);
  }
});

test('a failed or cancelled search never carries a live code, and an error finding the live list changes nothing', async () => {
  for (const outcome of [{ status: 'error', error: 'search_failed' }, { status: 'cancelled' }]) {
    const h = harness({ replies: [outcome] });
    const out = await searchVoiceFlights(h.run, query, undefined, h.findLive);
    assert.equal(out.liveCode, undefined);
    assert.deepEqual(plain(out.result), outcome);
    assert.equal(h.runs.length, 1);
  }
  const broken = harness({ replies: [withPrice], live: new Error('boom') });
  const out = await searchVoiceFlights(broken.run, query, undefined, broken.findLive);
  assert.deepEqual([out.liveCode, plain(out.result)], [undefined, withPrice]);
  const syncThrow = await searchVoiceFlights(async () => withPrice, query, undefined, () => { throw new Error('sync'); });
  assert.equal(syncThrow.liveCode, undefined);
});

test('the real helpers work together: the endpoint code drives the frame address', async () => {
  const code = await liveFlightCode(query, undefined, async () => answer({ success: true, url: `/?flightSearch=${CODE}&featured=roma` }));
  const out = await searchVoiceFlights(async () => empty, query, undefined, async () => code);
  assert.equal(liveFlightsSrc(out.liveCode), `/vuelos-en-vivo?flightSearch=${CODE}`);
});

// ── What Sofía is told ──────────────────────────────────────────────────────────────────────────────────────────────
const base = { origin: 'Madrid', destination: 'Roma', departureDate: '2027-03-12', returnDate: '2027-03-16', travellers: 1 };
const offer = (price, extra = {}) => ({ price, departureAt: '2027-03-12T07:00:00+01:00', returnAt: '2027-03-16T20:00:00+01:00', airline: 'IB', transfers: 0, offerUrl: 'https://secret.example/?marker=1', ...extra });

test('with the live list open and no saved price, Sofía points at the screen and invents nothing', () => {
  const s = plain(buildVoiceTripSummary({ ...base, offers: [], liveFlightsOnScreen: true }));
  assert.deepEqual([s.liveFlightsOnScreen, s.noRecentPrices, s.offersFound, s.offers.length], [true, true, 0, 0]);
  assert.match(s.note, /live list of flights for these exact dates is now open on the person's screen/);
  assert.match(s.note, /ask them to look at the screen/);
  assert.match(s.note, /You have no saved price of your own for these dates: do not guess any/);
  assert.match(s.note, /Never say that there are no flights/);
  assert.equal(/NOT the same as having no flights|offer to try other dates/.test(s.note), false, 'the «no recent price» script is not used');
  assert.match(s.note, /Hotel prices and availability are NOT known/, 'the old rules stay');
});

test('with the live list open and saved prices, the saved ones are only «recent» and the screen has the current ones', () => {
  const s = plain(buildVoiceTripSummary({ ...base, offers: [offer(99)], liveFlightsOnScreen: true }));
  assert.equal(s.liveFlightsOnScreen, true);
  assert.equal(s.noRecentPrices, undefined);
  assert.equal(s.offers.length, 1);
  assert.match(s.note, /only recent prices saved earlier and may differ/);
  assert.match(s.note, /call it a recent price and say that the screen has the current ones/);
  assert.match(s.note, /Never say that there are no flights/);
  assert.equal(JSON.stringify(s).includes('secret.example'), false, 'no affiliate link reaches Sofía');
});

test('a summary without the live list is exactly as before', () => {
  for (const offers of [[], [offer(99)]]) {
    const s = plain(buildVoiceTripSummary({ ...base, offers }));
    assert.equal(s.liveFlightsOnScreen, undefined);
    assert.equal(/live list|screen/.test(s.note), false);
  }
  assert.equal(plain(buildVoiceTripSummary({ ...base, offers: [] })).noRecentPrices, true);
});

// ── The frame, the page it shows and the screen ────────────────────────────────────────────────────────────────────
const React = { createElement: (type, props, ...children) => ({ type, props: props ?? {}, children }) };
const text = node => node == null || typeof node === 'boolean' ? '' : typeof node === 'string' ? node : Array.isArray(node) ? node.map(text).join('') : text(node.children) + text(node.props?.children);
const find = (node, predicate) => {
  if (node == null || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(child => find(child, predicate));
  return [...(predicate(node) ? [node] : []), ...find(node.children, predicate), ...find(node.props?.children, predicate)];
};

test('the card frame shows only the live page of a valid search code, one frame per search', () => {
  const Frame = loader({}, { React })('app/components/LiveFlightsFrame.tsx').default;
  assert.match(source('app/components/LiveFlightsFrame.tsx'), /^"use client";/);
  const frame = Frame({ code: CODE, title: 'Vuelos en vivo', className: 'mt-3' });
  assert.equal(frame.type, 'iframe');
  assert.equal(frame.props.src, `/vuelos-en-vivo?flightSearch=${CODE}`);
  assert.equal(frame.props.title, 'Vuelos en vivo');
  // New dates mean a new search code, so the card swaps the frame by itself (no need to close and reopen the card).
  const other = Frame({ code: 'MAD2003ROM23031', title: 'Vuelos en vivo' });
  assert.equal(frame.props.key, CODE);
  assert.equal(other.props.key, 'MAD2003ROM23031');
  assert.equal(other.props.src, '/vuelos-en-vivo?flightSearch=MAD2003ROM23031');
  assert.match(frame.props.className, /\bmt-3\b/);
  assert.match(frame.props.className, /\bw-full\b/);
  assert.match(frame.props.className, /\bmin-w-0\b/);
  assert.equal(Frame({ code: 'nope', title: 't' }), null);
  assert.equal(Frame({ code: `${CODE}&x=1`, title: 't' }), null);
  // The frame is keyed by its code, so a different search is a different document and the provider's widget starts again.
  assert.match(source('app/components/LiveFlightsFrame.tsx'), /<iframe key=\{code\}/);
});

test('the live page draws only the provider list for a valid search and nothing for any other address', async () => {
  const Script = function Script() {};
  const mod = loader({ 'next/script': { __esModule: true, default: Script } }, { React })('app/vuelos-en-vivo/page.tsx');
  assert.deepEqual(plain(mod.metadata.robots), { index: false, follow: false });
  const page = await mod.default({ searchParams: Promise.resolve({ flightSearch: CODE }) });
  assert.equal(find(page, n => n.props.id === 'tpwl-tickets').length, 1);
  const scripts = find(page, n => n.type === Script);
  assert.equal(scripts.length, 1);
  assert.match(text(scripts[0]), /https:\/\/tpemd\.com\/wl_web\/main\.js\?wl_id=23773/);
  assert.equal(scripts[0].props.strategy, 'afterInteractive');
  assert.match(text(find(page, n => n.type === 'style')), /footer\{display:none\}/);
  for (const flightSearch of [undefined, '', 'nope', `${CODE}"><script>`, 'MAD1203MAD16031']) {
    const other = await mod.default({ searchParams: Promise.resolve({ flightSearch }) });
    assert.equal(find(other, n => n.type === Script).length, 0, String(flightSearch));
    assert.equal(find(other, n => n.props.id === 'tpwl-tickets').length, 0, String(flightSearch));
  }
});

test('the live page and the card frame are the only new ways in: nothing else of the site changes', () => {
  // Same provider script and account as the home page widget, loaded from the same place.
  const home = source('app/vuelos/page.tsx') + source('app/page.tsx');
  assert.match(home, /tpemd\.com\/wl_web\/main\.js\?wl_id=23773/);
  const live = source('app/vuelos-en-vivo/page.tsx');
  assert.equal((live.match(/tpemd\.com\/wl_web\/main\.js\?wl_id=23773/g) ?? []).length, 1);
  assert.equal(/fetch\(|process\.env|dangerouslySetInnerHTML/.test(live), false);
  // The helpers only talk to the endpoint the home form already uses.
  const helpers = source('lib/voice/live-flights.ts') + source('lib/voice/voice-flight-search.ts');
  assert.deepEqual([...new Set(helpers.match(/\/api\/[a-z/-]+/g))], ['/api/travelpayouts/flight-link']);
  assert.equal(/hotelPrice|XMLHttpRequest|localStorage/.test(helpers), false);
});

test('page: Sofía\'s search opens the live list in the card and the manual search is untouched', () => {
  const page = source('app/page.tsx');
  assert.match(page, /import \{ searchVoiceFlights \} from "@\/lib\/voice\/voice-flight-search";/);
  assert.match(page, /import \{ liveFlightKey \} from "@\/lib\/voice\/live-flights";/);
  assert.match(page, /import LiveFlightsFrame from "\.\/components\/LiveFlightsFrame";/);
  assert.match(page, /useState<\{ key: string; code: string \} \| null>\(null\)/);
  const start = page.indexOf('if (!pendingVoiceFlightSearch || pendingVoiceFlightSearch.started) return;');
  const effect = page.slice(start, page.indexOf('}, [pendingVoiceFlightSearch]);', start));
  assert.match(effect, /searchVoiceFlights\(\(search\) => runFlightSearch\(search, context\.signal\), query, context\.signal\)/);
  assert.match(effect, /if \(liveCode && !context\.signal\.aborted\) setLiveFlights\(\{ key: liveFlightKey\(query\), code: liveCode \}\);/);
  assert.match(effect, /\.\.\.\(liveCode \? \{ liveFlightsOnScreen: true \} : \{\}\)/);
  assert.match(effect, /\.\.\.\(nearbyDays \? \{ nearbyDays \} : \{\}\)/);
  assert.equal(/\bawait\b/.test(effect), false);
  assert.equal((effect.match(/runFlightSearch\(/g) ?? []).length, 1);
  // The frame is drawn only for an exact search (no budget, no flexible window) of the very trip that was searched.
  const render = page.slice(page.indexOf('function renderFlightOffers('), page.indexOf('function renderFlightOffers(') + 2600);
  assert.match(render, /if \(liveFlights && !flightSearch\.query\.budget && !flexible && liveFlights\.key === liveFlightKey\(flightSearch\.query\)\)/);
  assert.match(render, /<LiveFlightsFrame code=\{liveFlights\.code\} title=\{t\("search\.liveFlights"\)\}/);
  assert.match(render, /t\("search\.liveFlightsNote"\)/);
  // The visitor's own form search and the featured-card widget never go through any of it.
  const submit = page.slice(page.indexOf('async function launchExactFlightSearch('), page.indexOf('async function discoverDestinations('));
  assert.equal(/searchVoiceFlights|liveFlight|LiveFlightsFrame/.test(submit), false);
  assert.equal((page.match(/searchVoiceFlights\(/g) ?? []).length, 1);
  assert.equal((page.match(/<LiveFlightsFrame/g) ?? []).length, 1);
});

test('the two new texts exist in the seven languages and say it is the search result for the exact dates', () => {
  const { dictionaries, locales } = loader()('lib/i18n/translations.ts');
  assert.equal(locales.length, 7);
  const seen = new Set();
  for (const { code } of locales) {
    for (const key of ['search.liveFlights', 'search.liveFlightsNote']) {
      assert.ok(dictionaries[code][key] && dictionaries[code][key].length > 8, `${code}: ${key}`);
      if (code !== 'es') assert.notEqual(dictionaries[code][key], dictionaries.es[key], `${code}: ${key} is translated`);
    }
    seen.add(dictionaries[code]['search.liveFlights']);
  }
  assert.equal(seen.size, 7);
  assert.match(dictionaries.es['search.liveFlightsNote'], /pueden cambiar/);
});
