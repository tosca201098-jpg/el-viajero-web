const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, globals = {}, deps = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, require: id => deps[id] ?? require(id),
    Response, Request, URL, AbortSignal, AbortController, setTimeout, clearTimeout,
    console: { warn() {}, error() {} }, ...globals });
  return exports;
}
const configuration = () => ({ AI_ENABLED: 'true', AI_VOICE_ENABLED: 'true', AI_ITINERARY_ENABLED: 'true',
  VERCEL: '1', VERCEL_ENV: 'preview', AI_REDIS_REST_URL: 'https://unit-test.upstash.io',
  AI_REDIS_REST_TOKEN: 'fake-test-token', AI_RATE_LIMIT_SECRET: 'fake-unit-test-hmac-value-not-a-secret' });
function request(ip = '192.0.2.1', extra = {}) {
  return new Request('https://preview.example/api/voice', { method: 'POST',
    headers: { 'x-vercel-forwarded-for': ip, ...extra }, body: JSON.stringify({ locale: 'es' }) });
}
function limiter(env = configuration(), fetcher = async () => Response.json({ result: [1, 0] })) {
  return load('lib/ai/admission.ts', { process: { env }, fetch: fetcher }).admitAiRequest;
}

test('disabled, missing configuration and unsupported hosts fail closed without network calls', async () => {
  for (const change of [{ AI_ENABLED: undefined }, { AI_VOICE_ENABLED: 'false' }, { AI_REDIS_REST_TOKEN: '' },
    { AI_RATE_LIMIT_SECRET: 'short' }, { AI_VOICE_DAY_LIMIT: 'NaN' }, { AI_VOICE_DAY_LIMIT: '0' },
    { AI_REDIS_REST_URL: 'https://attacker.example' }, { VERCEL: '', NODE_ENV: 'production' }]) {
    let calls = 0;
    const result = await limiter({ ...configuration(), ...change }, async () => { calls++; throw Error(); })(request(), 'voice');
    assert.equal(result.status, 503);
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal(calls, 0);
  }
});

test('cross-site requests and spoofable/missing IP headers cannot reserve quota', async () => {
  for (const req of [request('', { 'x-forwarded-for': '192.0.2.5' }), request('bad'), request('192.0.2.1, 192.0.2.2'),
    request('192.0.2.1', { origin: 'https://evil.example' }), request('192.0.2.1', { 'sec-fetch-site': 'cross-site' })]) {
    let calls = 0;
    const result = await limiter(configuration(), async () => { calls++; throw Error(); })(req, 'voice');
    assert.ok([403, 503].includes(result.status));
    assert.equal(calls, 0);
  }
});

test('one atomic EVAL reserves private IP and shared global quotas with bounded expiry', async () => {
  let command;
  const allow = limiter(configuration(), async (url, options) => {
    assert.equal(url.hostname, 'unit-test.upstash.io');
    assert.equal(options.cache, 'no-store');
    command = JSON.parse(options.body);
    return Response.json({ result: [1, 0] });
  });
  assert.equal(await allow(request(), 'voice'), null);
  assert.equal(command[0], 'EVAL');
  assert.equal(command[2], 4);
  assert.deepEqual(command.slice(7), [2, 60, 5, 86400, 20, 86400, 3, 2678400]);
  assert.ok(!JSON.stringify(command).includes('192.0.2.1'));
  assert.ok(!JSON.stringify(command).includes('fake-unit-test'));
  assert.ok(command[5].endsWith(':voice:global:day'));
});

test('IPv6 alternate spellings and rotating addresses within /64 use the same quota', async () => {
  const keys = [];
  const allow = limiter(configuration(), async (_, options) => {
    keys.push(JSON.parse(options.body)[3]); return Response.json({ result: [1, 0] });
  });
  for (const ip of ['2001:db8:abcd:1::1', '2001:0db8:abcd:0001:0000:0000:0000:0002']) await allow(request(ip), 'voice');
  assert.equal(keys[0], keys[1]);
});

test('quota denials expose only retry delay; backend failures never become allow', async () => {
  const result = await limiter(configuration(), async () => Response.json({ result: [0, 3600] }))(request(), 'itinerary');
  assert.equal(result.status, 429);
  assert.equal(result.headers.get('retry-after'), '3600');
  assert.deepEqual(await result.json(), { error: 'ai_rate_limited' });
  for (const body of [{ error: 'secret-store-detail' }, { result: null }, { result: [1, 10] }, { result: [0, -1] }, { result: [0, 2678401] }]) {
    const failed = await limiter(configuration(), async () => Response.json(body))(request(), 'voice');
    assert.equal(failed.status, 503);
    assert.ok(!(await failed.text()).includes('secret-store-detail'));
  }
  assert.equal((await limiter(configuration(), async () => { throw Error('timeout'); })(request(), 'voice')).status, 503);
});

// This simulates the Redis transaction contract. Actual Lua/backend execution is a separate Preview acceptance step.
test('separate workers and rotating IPs still encounter the shared global admission ceiling', async () => {
  const counts = new Map();
  const store = async (_, options) => {
    const command = JSON.parse(options.body), keys = command.slice(3, 3 + command[2]), args = command.slice(3 + command[2]);
    if (keys.some((key, i) => (counts.get(key) || 0) >= args[i * 2])) return Response.json({ result: [0, 60] });
    for (const key of keys) counts.set(key, (counts.get(key) || 0) + 1);
    return Response.json({ result: [1, 0] });
  };
  const workers = [limiter(configuration(), store), limiter(configuration(), store)];
  const results = await Promise.all(Array.from({ length: 40 }, (_, i) => workers[i % 2](request('192.0.2.' + (i + 1)), 'voice')));
  assert.equal(results.filter(x => x === null).length, 3);
  assert.equal(results.filter(x => x?.status === 429).length, 37);
});

test('both real route handlers block before OpenAI when disabled, exceeded or store unavailable', async () => {
  for (const service of ['voice', 'itinerary']) for (const mode of ['disabled', 'limited', 'unavailable']) {
    let providerCalls = 0;
    const env = { ...configuration(), OPENAI_API_KEY: 'fake-server-test-key', ...(mode === 'disabled' ? { AI_ENABLED: 'false' } : {}) };
    const admission = limiter(env, async () => {
      if (mode === 'unavailable') throw Error('offline');
      return Response.json({ result: [0, 60] });
    });
    const route = load('app/api/' + service + '/route.ts', { process: { env },
      fetch: async () => { providerCalls++; throw Error('OpenAI must not be called'); } }, {
      '@/lib/ai/admission': { admitAiRequest: admission },
      '@/lib/i18n/translations': { isLocale: value => value === 'es' },
      '@/lib/itinerary/server': { validateItineraryRequest: () => ({ request: { days: 1 } }) },
    });
    const result = await route.POST(request());
    assert.equal(result.status, mode === 'limited' ? 429 : 503);
    assert.equal(providerCalls, 0);
  }
});
