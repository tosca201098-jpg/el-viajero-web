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

test('disabled, missing configuration and unsupported hosts fail closed without Redis calls', async () => {
  for (const change of [{ AI_ENABLED: undefined }, { AI_VOICE_ENABLED: 'false' }, { AI_REDIS_REST_TOKEN: '' },
    { AI_RATE_LIMIT_SECRET: 'short' }, { AI_VOICE_DAY_LIMIT: 'NaN' }, { AI_VOICE_DAY_LIMIT: '0' },
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

test('voice first reserves four bounded attempt windows then one private natural-Madrid-day hold', async () => {
  const commands = [];
  const h = admission(configuration(), async (url, options) => {
    assert.equal(url.hostname, 'unit-test.upstash.io'); assert.equal(options.cache, 'no-store');
    commands.push(JSON.parse(options.body)); return Response.json({ result: [1, 0] });
  });
  const req = request(); assert.equal(await h.admitAiRequest(req, 'voice'), null);
  assert.equal(commands.length, 2);
  const [attempt, hold] = commands;
  assert.equal(attempt[0], 'EVAL'); assert.equal(attempt[2], 4);
  assert.deepEqual(attempt.slice(7), [2, 60, 5, 86400, 20, 86400, 1, 60]);
  assert(attempt[5].endsWith(':voice:global:day')); assert.match(attempt[6], /:user:[a-f0-9]{64}:minute$/);
  assert.equal(hold[0], 'EVAL'); assert.equal(hold[2], 1); assert.equal(hold[4], 'reserve');
  assert.match(hold[3], /^destinauta:ai:v2:preview:voice:user:[a-f0-9]{64}:day:2026-11-01$/);
  assert.match(hold[5], /^[a-f0-9]{32}$/); assert.deepEqual(hold.slice(6), [1793487600, 1793574000, 30]);
  for (const value of ['192.0.2.1', 'fake-unit-test', '11111111-2222-4333-8444-555555555555', '31days']) {
    assert.equal(JSON.stringify(commands).includes(value), false);
  }
});

test('IPv6 alternate spellings and rotating addresses within a /64 retain the same attempt identity', async () => {
  const keys = [];
  const allow = limiter(configuration(), async (_, options) => {
    const command = JSON.parse(options.body); if (command[2] === 4) keys.push(command[3]);
    return Response.json({ result: [1, 0] });
  });
  for (const ip of ['2001:db8:abcd:1::1', '2001:0db8:abcd:0001:0000:0000:0000:0002']) await allow(request(ip), 'voice');
  assert.equal(keys[0], keys[1]);
});

test('voice attempt settings may tighten but cannot exceed the anti-abuse ceilings', async () => {
  for (const [field, value] of [['AI_VOICE_MINUTE_LIMIT', '3'], ['AI_VOICE_DAY_LIMIT', '6'],
    ['AI_VOICE_GLOBAL_DAY_LIMIT', '21'], ['AI_VOICE_USER_MINUTE_LIMIT', '2']]) {
    let calls = 0;
    assert.equal((await limiter({ ...configuration(), [field]: value }, async () => { calls++; })(request(), 'voice')).status, 503);
    assert.equal(calls, 0);
  }
  const commands = [];
  assert.equal(await limiter({ ...configuration(), AI_VOICE_MINUTE_LIMIT: '1', AI_VOICE_DAY_LIMIT: '3', AI_VOICE_GLOBAL_DAY_LIMIT: '10' },
    async (_, options) => { commands.push(JSON.parse(options.body)); return Response.json({ result: [1, 0] }); })(request(), 'voice'), null);
  assert.deepEqual(commands[0].slice(7), [1, 60, 3, 86400, 10, 86400, 1, 60]);
});

test('obsolete monthly and per-user rolling-day settings cannot change the definitive three-slot ledger', async () => {
  const commands = [];
  assert.equal(await limiter({ ...configuration(), AI_VOICE_USER_DAY_LIMIT: 'NaN',
    AI_VOICE_USER_31DAY_LIMIT: '0', AI_VOICE_GLOBAL_31DAY_LIMIT: '0' }, async (_, options) => {
    commands.push(JSON.parse(options.body)); return Response.json({ result: [1, 0] });
  })(request(), 'voice'), null);
  assert(commands[1][1].includes('committed + pending >= 3'));
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
test('independent workers and rotating accounts cannot bypass the shared global attempt ceiling', async () => {
  const counts = new Map();
  const store = async (_, options) => {
    const command = JSON.parse(options.body);
    if (command[2] === 1) return Response.json({ result: [1, 0] });
    const keys = command.slice(3, 7), args = command.slice(7);
    if (keys.some((key, i) => (counts.get(key) || 0) >= args[i * 2])) return Response.json({ result: [0, 60] });
    for (const key of keys) counts.set(key, (counts.get(key) || 0) + 1);
    return Response.json({ result: [1, 0] });
  };
  const deps = { '@/lib/supabase/voice-auth': { verifyVoiceUser: async req => ({ userId: req.headers.get('x-test-verified-user') }) } };
  const workers = [limiter(configuration(), store, deps), limiter(configuration(), store, deps)];
  const results = await Promise.all(Array.from({ length: 40 }, (_, i) => workers[i % 2](request('192.0.2.' + (i + 1),
    { 'x-test-verified-user': '11111111-2222-4333-8444-' + String(i).padStart(12, '0') }), 'voice')));
  assert.equal(results.filter(x => x === null).length, 20);
  assert.equal(results.filter(x => x?.status === 429).length, 20);
});

test('private holds finalize only once and require the exact server Request object', async () => {
  const commands = [], h = admission(configuration(), async (_, options) => {
    commands.push(JSON.parse(options.body)); return Response.json({ result: [1, 0] });
  });
  const req = request(); assert.equal(await h.admitAiRequest(req, 'voice'), null);
  assert.equal(await h.finalizeVoiceAdmission(request(), true), false); assert.equal(commands.length, 2);
  assert.equal(await h.finalizeVoiceAdmission(req, true), true);
  assert.equal(commands[2][4], 'commit'); assert.deepEqual(commands[2].slice(3), [commands[1][3], 'commit', ...commands[1].slice(5)]);
  assert.equal(await h.finalizeVoiceAdmission(req, true), false); assert.equal(commands.length, 3);
  assert.equal(await h.finalizeVoiceAdmission(req, false), true); assert.equal(commands.length, 3);
});

test('failed pre-token work can cancel a hold without refunding any attempt counter', async () => {
  const commands = [], h = admission(configuration(), async (_, options) => {
    commands.push(JSON.parse(options.body)); return Response.json({ result: [1, 0] });
  });
  const req = request(); assert.equal(await h.admitAiRequest(req, 'voice'), null);
  assert.equal(await h.finalizeVoiceAdmission(req, false), true);
  assert.equal(commands.length, 3); assert.equal(commands[2][4], 'cancel');
  assert.equal(commands.filter(command => command[2] === 4).length, 1);
  assert.equal(await h.finalizeVoiceAdmission(req, false), true); assert.equal(commands.length, 3);
});

test('an expired or already-cancelled hold may finish cancellation, but a committed hold cannot', async () => {
  for (const [cancelResult, expected] of [[[0, 0], true], [[1, 0], true], [[2, 0], false], [[0, 1], false], [[-1, 0], false]]) {
    const h = admission(configuration(), async (_, options) => {
      const command = JSON.parse(options.body);
      return Response.json({ result: command[4] === 'cancel' ? cancelResult : [1, 0] });
    });
    const req = request(); assert.equal(await h.admitAiRequest(req, 'voice'), null);
    assert.equal(await h.finalizeVoiceAdmission(req, false), expected);
  }
});

test('a browser abort cannot prevent releasing a known pending hold or authorize a commit', async () => {
  for (const commit of [false, true]) {
    const commands = [], controller = new AbortController();
    const h = admission(configuration(), async (_, options) => {
      commands.push(JSON.parse(options.body));
      return Response.json({ result: [1, 0] });
    });
    const req = request('192.0.2.1', {}, controller.signal);
    assert.equal(await h.admitAiRequest(req, 'voice'), null); controller.abort();
    assert.equal(await h.finalizeVoiceAdmission(req, commit), !commit);
    assert.equal(commands.length, commit ? 2 : 3);
    if (!commit) assert.equal(commands[2][4], 'cancel');
  }
});

test('commit replay, malformed results and ambiguous failures never grant or trigger a cancellation', async () => {
  for (const result of [[2, 0], [0, 0], [-1, 0], [1, 10], null, 'network']) {
    const commands = [], h = admission(configuration(), async (_, options) => {
      const command = JSON.parse(options.body); commands.push(command);
      if (command[4] === 'commit') { if (result === 'network') throw Error('PRIVATE_TOKEN'); return Response.json({ result }); }
      return Response.json({ result: [1, 0] });
    });
    const req = request(); assert.equal(await h.admitAiRequest(req, 'voice'), null);
    assert.equal(await h.finalizeVoiceAdmission(req, true), false);
    assert.equal(await h.finalizeVoiceAdmission(req, false), true);
    assert.equal(commands.length, 3); assert.equal(commands.some(command => command[4] === 'cancel'), false);
  }
});

test('daily-slot denial creates no finalization capability and returns its bounded wait', async () => {
  const commands = [], h = admission(configuration(), async (_, options) => {
    const command = JSON.parse(options.body); commands.push(command);
    return Response.json({ result: command[2] === 4 ? [1, 0] : [0, 120] });
  });
  const req = request(), denied = await h.admitAiRequest(req, 'voice');
  assert.equal(denied.status, 429); assert.equal(denied.headers.get('retry-after'), '120');
  assert.equal(await h.finalizeVoiceAdmission(req, true), false); assert.equal(commands.length, 2);
});

test('aborted admission does not reserve after attempts, while a known late hold is safely cancelled', async () => {
  for (const abortAt of ['attempt', 'reserve']) {
    const controller = new AbortController(), commands = [];
    const h = admission(configuration(), async (_, options) => {
      const command = JSON.parse(options.body); commands.push(command);
      if ((abortAt === 'attempt' && command[2] === 4) || (abortAt === 'reserve' && command[4] === 'reserve')) controller.abort();
      if (command[4] === 'cancel') assert.notEqual(options.signal, controller.signal);
      return Response.json({ result: [1, 0] });
    });
    const req = request('192.0.2.1', {}, controller.signal);
    assert.equal((await h.admitAiRequest(req, 'voice')).status, 503);
    assert.equal(commands.length, abortAt === 'attempt' ? 1 : 3);
    assert.equal(await h.finalizeVoiceAdmission(req, true), false);
  }
});

test('a duplicate admission on the same pending Request cannot create another hold', async () => {
  let calls = 0;
  const h = admission(configuration(), async () => { calls++; return Response.json({ result: [1, 0] }); });
  const req = request(); assert.equal(await h.admitAiRequest(req, 'voice'), null);
  assert.equal((await h.admitAiRequest(req, 'voice')).status, 503); assert.equal(calls, 2);
});

test('both real route handlers block before provider calls when disabled, exceeded or store unavailable', async () => {
  for (const service of ['voice', 'itinerary']) for (const mode of ['disabled', 'limited', 'unavailable']) {
    let providerCalls = 0;
    const env = { ...configuration(), OPENAI_API_KEY: 'fake-server-test-key', ELEVENLABS_ENABLED: 'true',
      ELEVENLABS_API_KEY: 'fake-key', ELEVENLABS_AGENT_VERSION_ID: 'agtvrsn_test', ...(mode === 'disabled' ? { AI_ENABLED: 'false' } : {}) };
    const h = admission(env, async () => { if (mode === 'unavailable') throw Error('offline'); return Response.json({ result: [0, 60] }); });
    const globals = { process: { env }, fetch: async () => { providerCalls++; throw Error('provider must not be called'); } };
    const deps = { '@/lib/ai/admission': h, '@/lib/i18n/translations': { isLocale: value => value === 'es' },
      '@/lib/itinerary/server': { validateItineraryRequest: () => ({ request: { days: 1 } }) } };
    const result = await load('app/api/' + service + '/route.ts', globals, deps).POST(request());
    assert.equal(result.status, mode === 'limited' ? 429 : 503); assert.equal(providerCalls, 0);
  }
});
