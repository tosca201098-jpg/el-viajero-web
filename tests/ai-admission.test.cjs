const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const repoRoot = process.env.SOFIA_AUTH_REPO_ROOT || process.env.SOFIA_INTEGRATION_REPO_ROOT || path.resolve(__dirname, '..');
const sourceRoot = process.env.SOFIA_AUTH_SOURCE_ROOT || process.env.SOFIA_INTEGRATION_SOURCE_ROOT || repoRoot;
const ts = require(path.join(repoRoot, 'node_modules/typescript'));
const fixedNow = Date.parse('2026-11-01T20:00:00.000Z');
class Clock extends Date { static now() { return fixedNow; } }
function load(file, globals = {}, deps = {}) {
  const locate = name => [path.join(sourceRoot, name), path.join(repoRoot, name)].find(file => fs.existsSync(file));
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(locate(file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, require: id => {
    if (id in deps) return deps[id];
    if (id === '@/lib/supabase/voice-auth') return { verifyVoiceUser: async () => ({ userId: '11111111-2222-4333-8444-555555555555' }) };
    if (id.startsWith('node:')) return require(id);
    const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
    const found = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(locate);
    if (!found) throw Error('Unexpected dependency ' + id);
    return load(found, globals, deps);
  }, Response, Request, URL, AbortSignal, AbortController, setTimeout, clearTimeout, Date: Clock,
  console: { warn() {}, error() {} }, ...globals });
  return exports;
}
const configuration = () => ({ AI_ENABLED: 'true', AI_VOICE_ENABLED: 'true', AI_ITINERARY_ENABLED: 'true',
  VERCEL: '1', VERCEL_ENV: 'preview', AI_REDIS_REST_URL: 'https://unit-test.upstash.io',
  AI_REDIS_REST_TOKEN: 'fake-test-token', AI_RATE_LIMIT_SECRET: 'fake-unit-test-hmac-value-not-a-secret' });
function request(ip = '192.0.2.1', extra = {}, signal) {
  return new Request('https://preview.example/api/voice', { method: 'POST',
    headers: { authorization: 'Bearer fake.header.signature', 'x-vercel-forwarded-for': ip, ...extra },
    body: JSON.stringify({ locale: 'es' }), ...(signal ? { signal } : {}) });
}
function admission(env = configuration(), fetcher = async () => Response.json({ result: [1, 0] }), deps = {}) {
  return load('lib/ai/admission.ts', { process: { env }, fetch: fetcher }, deps);
}
const limiter = (env, fetcher, deps) => admission(env, fetcher, deps).admitAiRequest;
const itineraryRequest = (ip = '192.0.2.1', extra = {}) => new Request('https://preview.example/api/itinerary', { method: 'POST',
  headers: { authorization: 'Bearer fake.header.signature', 'x-vercel-forwarded-for': ip, ...extra }, body: '{}' });
const userA = { '@/lib/supabase/voice-auth': { verifyVoiceUser: async () => ({ userId: '11111111-2222-4333-8444-555555555555' }) } };
const userB = { '@/lib/supabase/voice-auth': { verifyVoiceUser: async () => ({ userId: '99999999-2222-4333-8444-555555555555' }) } };
const recorder = (calls, result = [1, 0]) => async (_, options) => { calls.push(JSON.parse(options.body)); return Response.json({ result }); };


test('disabled, missing configuration and unsupported hosts fail closed without Redis calls', async () => {
  for (const change of [{ AI_ENABLED: undefined }, { AI_VOICE_ENABLED: 'false' }, { AI_REDIS_REST_TOKEN: '' },
    { AI_RATE_LIMIT_SECRET: 'short' }, { AI_VOICE_IP_DAY_ATTEMPTS: 'NaN' }, { AI_VOICE_IP_DAY_ATTEMPTS: '0' },
    { AI_REDIS_REST_URL: 'https://attacker.example' }, { VERCEL: '', NODE_ENV: 'production' }]) {
    let calls = 0;
    const result = await limiter({ ...configuration(), ...change }, async () => { calls++; throw Error(); })(request(), 'voice');
    assert.equal(result.status, 503); assert.equal(result.headers.get('cache-control'), 'no-store'); assert.equal(calls, 0);
  }
});

test('cross-site requests and spoofable or missing IP headers cannot reserve quota', async () => {
  for (const req of [request('', { 'x-forwarded-for': '192.0.2.5' }), request('bad'), request('192.0.2.1, 192.0.2.2'),
    request('192.0.2.1', { origin: 'https://evil.example' }), request('192.0.2.1', { 'sec-fetch-site': 'cross-site' })]) {
    let calls = 0;
    const result = await limiter(configuration(), async () => { calls++; throw Error(); })(req, 'voice');
    assert.ok([403, 503].includes(result.status)); assert.equal(calls, 0);
  }
});


test('voice makes one flood-protection reservation (IP minute, IP day, the person’s minute) and no daily or per-person conversation count', async () => {
  const commands = [];
  const h = admission(configuration(), async (url, options) => {
    assert.equal(url.hostname, 'unit-test.upstash.io'); assert.equal(options.cache, 'no-store');
    commands.push(JSON.parse(options.body)); return Response.json({ result: [1, 0] });
  });
  const req = request(); assert.equal(await h.admitAiRequest(req, 'voice'), null);
  assert.equal(commands.length, 1, 'one Redis call: the three-slot Madrid-day ledger is retired');
  const [attempt] = commands;
  assert.equal(attempt[0], 'EVAL'); assert.equal(attempt[2], 3);
  assert.deepEqual(attempt.slice(6), [6, 60, 60, 86400, 3, 60]);
  assert.match(attempt[3], /^destinauta:ai:v1:preview:voice:ip:[a-f0-9]{64}:minute$/);
  assert.match(attempt[4], /^destinauta:ai:v1:preview:voice:ip:[a-f0-9]{64}:day$/);
  assert.match(attempt[5], /^destinauta:ai:v1:preview:voice:user:[a-f0-9]{64}:minute$/);
  assert.equal(attempt.some(value => typeof value === 'string' && /global|:day:20/.test(value)), false, 'no whole-site attempt count: the weekly minutes cover the site');
  for (const value of ['192.0.2.1', 'fake-unit-test', '11111111-2222-4333-8444-555555555555']) {
    assert.equal(JSON.stringify(commands).includes(value), false);
  }
});

test('an admitted voice request exposes an anonymous, stable account reference only for that exact Request', async () => {
  const h = admission(configuration());
  const first = request(), second = request();
  assert.equal(h.voiceUserReference(first), undefined);
  assert.equal(await h.admitAiRequest(first, 'voice'), null); assert.equal(await h.admitAiRequest(second, 'voice'), null);
  assert.match(h.voiceUserReference(first), /^u_[a-f0-9]{32}$/);
  assert.equal(h.voiceUserReference(first), h.voiceUserReference(second), 'the same account always gets the same reference');
  assert.equal(h.voiceUserReference(request()), undefined);
  const other = admission(configuration(), undefined, userB), third = request();
  assert.equal(await other.admitAiRequest(third, 'voice'), null);
  assert.notEqual(other.voiceUserReference(third), h.voiceUserReference(first));
  const differentSecret = admission({ ...configuration(), AI_RATE_LIMIT_SECRET: 'another-fake-unit-test-hmac-value-0000' });
  const fourth = request(); await differentSecret.admitAiRequest(fourth, 'voice');
  assert.notEqual(differentSecret.voiceUserReference(fourth), h.voiceUserReference(first));
  assert.equal(h.voiceUserReference(first).includes('11111111'), false);
});

test('IPv6 alternate spellings and rotating addresses within a /64 retain the same attempt identity', async () => {
  const keys = [];
  const allow = limiter(configuration(), async (_, options) => {
    const command = JSON.parse(options.body); if (command[2] === 3) keys.push(command[3]);
    return Response.json({ result: [1, 0] });
  });
  for (const ip of ['2001:db8:abcd:1::1', '2001:0db8:abcd:0001:0000:0000:0000:0002']) await allow(request(ip), 'voice');
  assert.equal(keys[0], keys[1]);
});


test('voice attempt settings may tighten but cannot exceed the flood-protection ceilings', async () => {
  for (const [field, value] of [['AI_VOICE_IP_MINUTE_ATTEMPTS', '7'], ['AI_VOICE_IP_DAY_ATTEMPTS', '61'], ['AI_VOICE_USER_MINUTE_ATTEMPTS', '4']]) {
    let calls = 0;
    assert.equal((await limiter({ ...configuration(), [field]: value }, async () => { calls++; })(request(), 'voice')).status, 503);
    assert.equal(calls, 0);
  }
  const commands = [];
  assert.equal(await limiter({ ...configuration(), AI_VOICE_IP_MINUTE_ATTEMPTS: '2', AI_VOICE_IP_DAY_ATTEMPTS: '10', AI_VOICE_USER_MINUTE_ATTEMPTS: '1' },
    async (_, options) => { commands.push(JSON.parse(options.body)); return Response.json({ result: [1, 0] }); })(request(), 'voice'), null);
  assert.deepEqual(commands[0].slice(6), [2, 60, 10, 86400, 1, 60]);
});


test('the retired per-day, per-site and monthly voice settings are ignored: they can neither bind nor break voice', async () => {
  const commands = [];
  assert.equal(await limiter({ ...configuration(), AI_VOICE_MINUTE_LIMIT: '1', AI_VOICE_DAY_LIMIT: '1', AI_VOICE_GLOBAL_DAY_LIMIT: 'NaN',
    AI_VOICE_USER_MINUTE_LIMIT: '0', AI_VOICE_USER_DAY_LIMIT: 'NaN', AI_VOICE_USER_31DAY_LIMIT: '0', AI_VOICE_GLOBAL_31DAY_LIMIT: '0' },
  async (_, options) => { commands.push(JSON.parse(options.body)); return Response.json({ result: [1, 0] }); })(request(), 'voice'), null);
  assert.equal(commands.length, 1); assert.deepEqual(commands[0].slice(6), [6, 60, 60, 86400, 3, 60]);
  assert.equal(commands.flatMap(command => command.slice(3, 3 + command[2])).some(key => key.includes('31days')), false);
});

test('quota denials expose only retry delay; backend failures never become allow', async () => {
  const result = await limiter(configuration(), async () => Response.json({ result: [0, 3600] }))(request(), 'itinerary');
  assert.equal(result.status, 429); assert.equal(result.headers.get('retry-after'), '3600');
  assert.deepEqual(await result.json(), { error: 'ai_rate_limited' });
  for (const body of [{ error: 'secret-store-detail' }, { result: null }, { result: [1, 10] }, { result: [0, -1] }, { result: [0, 2678401] }]) {
    const failed = await limiter(configuration(), async () => Response.json(body))(request(), 'voice');
    assert.equal(failed.status, 503); assert.equal((await failed.text()).includes('secret-store-detail'), false);
  }
  assert.equal((await limiter(configuration(), async () => { throw Error('timeout'); })(request(), 'voice')).status, 503);
});

// Contract simulation only: the separate isolated Redis suite executes the actual Lua.

test('independent workers and rotating accounts behind one address share the same per-minute attempt ceiling', async () => {
  const counts = new Map();
  const store = async (_, options) => {
    const command = JSON.parse(options.body);
    const keys = command.slice(3, 6), args = command.slice(6);
    if (keys.some((key, i) => (counts.get(key) || 0) >= args[i * 2])) return Response.json({ result: [0, 60] });
    for (const key of keys) counts.set(key, (counts.get(key) || 0) + 1);
    return Response.json({ result: [1, 0] });
  };
  const deps = { '@/lib/supabase/voice-auth': { verifyVoiceUser: async req => ({ userId: req.headers.get('x-test-verified-user') }) } };
  const workers = [limiter(configuration(), store, deps), limiter(configuration(), store, deps)];
  const results = await Promise.all(Array.from({ length: 10 }, (_, i) => workers[i % 2](request('192.0.2.1',
    { 'x-test-verified-user': '11111111-2222-4333-8444-' + String(i).padStart(12, '0') }), 'voice')));
  assert.equal(results.filter(x => x === null).length, 6);
  assert.equal(results.filter(x => x?.status === 429).length, 4);
  // A different address is not affected by that flood.
  assert.equal(await workers[0](request('192.0.2.99', { 'x-test-verified-user': '11111111-2222-4333-8444-999999999999' }), 'voice'), null);
});

test('one account may retry quickly three times a minute and is then asked to wait; this is never a conversation count', async () => {
  const counts = new Map();
  const store = async (_, options) => {
    const command = JSON.parse(options.body), keys = command.slice(3, 6), args = command.slice(6);
    if (keys.some((key, i) => (counts.get(key) || 0) >= args[i * 2])) return Response.json({ result: [0, 41] });
    for (const key of keys) counts.set(key, (counts.get(key) || 0) + 1);
    return Response.json({ result: [1, 0] });
  };
  const allow = limiter(configuration(), store);
  const results = []; for (let i = 0; i < 4; i++) results.push(await allow(request('192.0.2.7'), 'voice'));
  assert.deepEqual(results.map(x => x === null ? 'ok' : x.status), ['ok', 'ok', 'ok', 429]);
  assert.equal(results[3].headers.get('retry-after'), '41'); assert.deepEqual(await results[3].json(), { error: 'ai_rate_limited' });
});


test('a duplicate admission on the same Request is refused without another Redis call; a browser abort never admits', async () => {
  let calls = 0;
  const h = admission(configuration(), async () => { calls++; return Response.json({ result: [1, 0] }); });
  const req = request(); assert.equal(await h.admitAiRequest(req, 'voice'), null);
  assert.equal((await h.admitAiRequest(req, 'voice')).status, 503); assert.equal(calls, 1);
  for (const abortAt of ['before', 'during']) {
    const controller = new AbortController(), commands = [];
    if (abortAt === 'before') controller.abort();
    const g = admission(configuration(), async (_, options) => {
      commands.push(JSON.parse(options.body)); if (abortAt === 'during') controller.abort(); return Response.json({ result: [1, 0] });
    });
    const aborted = request('192.0.2.1', {}, controller.signal);
    assert.equal((await g.admitAiRequest(aborted, 'voice')).status, 503);
    assert.equal(g.voiceUserReference(aborted), undefined, 'an aborted request is never admitted');
    assert.equal(commands.length, abortAt === 'before' ? 0 : 1);
  }
});

test('the minutes bar has its own small read allowance: IP 30 a minute and the person 6 a minute, under its own keys', async () => {
  const commands = [];
  const h = admission(configuration(), recorder(commands));
  const req = new Request('https://preview.example/api/voice/minutes', { method: 'GET', headers: { authorization: 'Bearer fake.header.signature', 'x-vercel-forwarded-for': '192.0.2.1' } });
  assert.equal(await h.admitAiRequest(req, 'voice_budget'), null);
  assert.equal(commands.length, 1); assert.equal(commands[0][2], 2); assert.deepEqual(commands[0].slice(5), [30, 60, 6, 60]);
  assert.match(commands[0][3], /^destinauta:ai:v1:preview:voice:budget:ip:[a-f0-9]{64}:minute$/);
  assert.match(commands[0][4], /^destinauta:ai:v1:preview:voice:budget:user:[a-f0-9]{64}:minute$/);
  assert.match(h.voiceUserReference(req), /^u_[a-f0-9]{32}$/);
  for (const change of [{ AI_ENABLED: 'false' }, { AI_VOICE_ENABLED: 'false' }]) {
    const none = [];
    assert.equal((await admission({ ...configuration(), ...change }, recorder(none)).admitAiRequest(new Request('https://preview.example/api/voice/minutes', { headers: { authorization: 'Bearer fake.header.signature', 'x-vercel-forwarded-for': '192.0.2.1' } }), 'voice_budget')).status, 503);
    assert.equal(none.length, 0);
  }
  const denied = await limiter(configuration(), async () => Response.json({ result: [0, 30] }))(new Request('https://preview.example/api/voice/minutes', { headers: { authorization: 'Bearer fake.header.signature', 'x-vercel-forwarded-for': '192.0.2.1' } }), 'voice_budget');
  assert.equal(denied.status, 429);
});

test('the real voice route handler blocks before provider calls when disabled, exceeded or store unavailable', async () => {
  for (const service of ['voice']) for (const mode of ['disabled', 'limited', 'unavailable']) {
    let providerCalls = 0;
    const env = { ...configuration(), AI_VOICE_PROVIDER: 'elevenlabs', ELEVENLABS_ENABLED: 'true',
      ELEVENLABS_API_KEY: 'fake-key', ELEVENLABS_AGENT_VERSION_ID: 'agtvrsn_test', ...(mode === 'disabled' ? { AI_ENABLED: 'false' } : {}) };
    const h = admission(env, async () => { if (mode === 'unavailable') throw Error('offline'); return Response.json({ result: [0, 60] }); });
    const globals = { process: { env }, fetch: async () => { providerCalls++; throw Error('provider must not be called'); } };
    const deps = { '@/lib/ai/admission': h, '@/lib/i18n/translations': { isLocale: value => value === 'es' } };
    const result = await load('app/api/' + service + '/route.ts', globals, deps).POST(request());
    assert.equal(result.status, mode === 'limited' ? 429 : 503); assert.equal(providerCalls, 0);
  }
});

// ---- AI itineraries (Claude Haiku) for registered visitors -------------------------------------------------------------------
test('an AI itinerary needs a verified account, then makes one reservation: IP minute, IP day, whole site and the person’s own day', async () => {
  const commands = [];
  assert.equal(await limiter(configuration(), recorder(commands), userA)(itineraryRequest(), 'itinerary'), null);
  assert.equal(commands.length, 1, 'one Redis call only: no second ledger for itineraries');
  const [command] = commands;
  assert.equal(command[0], 'EVAL'); assert.equal(command[2], 4);
  assert.deepEqual(command.slice(7), [3, 60, 10, 86400, 200, 86400, 10, 90000]);
  const keys = command.slice(3, 7);
  assert.match(keys[0], /^destinauta:ai:v1:preview:itinerary:ip:[a-f0-9]{64}:minute$/);
  assert.match(keys[1], /^destinauta:ai:v1:preview:itinerary:ip:[a-f0-9]{64}:day$/);
  assert.equal(keys[2], 'destinauta:ai:v1:preview:itinerary:global:day');
  assert.match(keys[3], /^destinauta:ai:v1:preview:itinerary:user:[a-f0-9]{64}:day:2026-11-01$/);
  for (const value of ['192.0.2.1', 'fake-unit-test', '11111111-2222-4333-8444-555555555555']) assert.equal(JSON.stringify(commands).includes(value), false);
});

test('guests and invalid sessions never reach the store: the account check answers first', async () => {
  for (const status of [401, 403, 503]) {
    const commands = [];
    const guest = { '@/lib/supabase/voice-auth': { verifyVoiceUser: async () => Response.json({ error: 'x' }, { status }) } };
    const result = await limiter(configuration(), recorder(commands), guest)(itineraryRequest(), 'itinerary');
    assert.equal(result.status, status); assert.equal(commands.length, 0);
  }
  const anonymous = { '@/lib/supabase/voice-auth': { verifyVoiceUser: async () => null } };
  const result = await limiter(configuration(), recorder([]), anonymous)(itineraryRequest(), 'itinerary');
  assert.equal(result.status, 503, 'no verified user means no AI, never an unlimited one');
});

test('the person’s allowance is per Madrid day: it changes at midnight in Madrid and each person has their own', async () => {
  const keyFor = async (now, deps) => {
    const commands = [];
    class Later extends Date { static now() { return now; } }
    const h = load('lib/ai/admission.ts', { process: { env: configuration() }, fetch: recorder(commands), Date: Later }, deps);
    assert.equal(await h.admitAiRequest(itineraryRequest(), 'itinerary'), null);
    return commands[0][6];
  };
  const evening = await keyFor(Date.parse('2026-11-01T22:59:00Z'), userA);   // 23:59 in Madrid
  const midnight = await keyFor(Date.parse('2026-11-01T23:00:00Z'), userA);  // 00:00 next day in Madrid
  assert.ok(evening.endsWith(':day:2026-11-01')); assert.ok(midnight.endsWith(':day:2026-11-02'));
  const other = await keyFor(Date.parse('2026-11-01T22:59:00Z'), userB);
  assert.notEqual(other, evening); assert.ok(other.endsWith(':day:2026-11-01'));
});

test('itinerary limits may be lowered by settings but never raised above 3 a minute, 10 a day per IP and person, 200 for the site', async () => {
  for (const change of [{ AI_ITINERARY_MINUTE_LIMIT: '4' }, { AI_ITINERARY_DAY_LIMIT: '11' }, { AI_ITINERARY_GLOBAL_DAY_LIMIT: '201' },
    { AI_ITINERARY_USER_DAY_LIMIT: '11' }, { AI_ITINERARY_USER_DAY_LIMIT: '0' }, { AI_ITINERARY_USER_DAY_LIMIT: 'abc' }, { AI_ITINERARY_GLOBAL_DAY_LIMIT: '-1' }]) {
    const commands = [];
    const result = await limiter({ ...configuration(), ...change }, recorder(commands), userA)(itineraryRequest(), 'itinerary');
    assert.equal(result.status, 503, JSON.stringify(change)); assert.equal(commands.length, 0);
  }
  const commands = [];
  assert.equal(await limiter({ ...configuration(), AI_ITINERARY_MINUTE_LIMIT: '1', AI_ITINERARY_DAY_LIMIT: '5',
    AI_ITINERARY_GLOBAL_DAY_LIMIT: '50', AI_ITINERARY_USER_DAY_LIMIT: '3' }, recorder(commands), userA)(itineraryRequest(), 'itinerary'), null);
  assert.deepEqual(commands[0].slice(7), [1, 60, 5, 86400, 50, 86400, 3, 90000]);
  // The voice settings do not leak into itineraries and vice versa.
  const voiceOnly = [];
  assert.equal(await limiter({ ...configuration(), AI_VOICE_DAY_LIMIT: '1' }, recorder(voiceOnly), userA)(itineraryRequest(), 'itinerary'), null);
  assert.deepEqual(voiceOnly[0].slice(7), [3, 60, 10, 86400, 200, 86400, 10, 90000]);
});

test('over the itinerary allowance the visitor gets 429 with only a retry delay; a store failure or the flags off never allow', async () => {
  const denied = await limiter(configuration(), recorder([], [0, 7200]), userA)(itineraryRequest(), 'itinerary');
  assert.equal(denied.status, 429); assert.equal(denied.headers.get('retry-after'), '7200');
  assert.deepEqual(await denied.json(), { error: 'ai_rate_limited' });
  for (const body of [{ error: 'secret-store-detail' }, { result: null }, { result: [1, 5] }, { result: [2, 0] }]) {
    const failed = await limiter(configuration(), async () => Response.json(body), userA)(itineraryRequest(), 'itinerary');
    assert.equal(failed.status, 503); assert.equal((await failed.text()).includes('secret-store-detail'), false);
  }
  assert.equal((await limiter(configuration(), async () => { throw Error('timeout'); }, userA)(itineraryRequest(), 'itinerary')).status, 503);
  for (const change of [{ AI_ENABLED: 'false' }, { AI_ITINERARY_ENABLED: 'false' }, { AI_ITINERARY_ENABLED: undefined }]) {
    const commands = [];
    const result = await limiter({ ...configuration(), ...change }, recorder(commands), userA)(itineraryRequest(), 'itinerary');
    assert.equal(result.status, 503); assert.equal(commands.length, 0);
  }
  const crossSite = [];
  assert.equal((await limiter(configuration(), recorder(crossSite), userA)(itineraryRequest('192.0.2.1', { origin: 'https://evil.example' }), 'itinerary')).status, 403);
  assert.equal(crossSite.length, 0);
});


test('itineraries are unchanged by the voice-minutes work: four attempt keys with the Madrid-day person allowance', async () => {
  const commands = [];
  assert.equal(await limiter(configuration(), recorder(commands), userA)(itineraryRequest(), 'itinerary'), null);
  assert.equal(commands.length, 1); assert.deepEqual(commands[0].slice(7), [3, 60, 10, 86400, 200, 86400, 10, 90000]);
});
