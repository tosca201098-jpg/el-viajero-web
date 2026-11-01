const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createHmac } = require('node:crypto');
const repoRoot = process.env.SOFIA_CHECK_REPO_ROOT || path.resolve(__dirname, '..');
const sourceRoot = process.env.SOFIA_CHECK_SOURCE_ROOT || repoRoot;
const ts = require(path.join(repoRoot, 'node_modules/typescript'));
const host = 'el-viajero-web-git-codex-sofia-elevenlabs-el-viajero.vercel.app';
const endpoint = 'https://' + host + '/api/sofia-session-check';
const uid = '11111111-2222-4333-8444-555555555555';
const otherUid = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const jwt = 'fake.header.signature';
const hmacSecret = 'fake-private-hmac-for-readonly-unit-tests';
const environment = () => ({
  VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'codex/sofia-elevenlabs',
  VERCEL_GIT_REPO_OWNER: 'tosca201098-jpg', VERCEL_GIT_REPO_SLUG: 'el-viajero-web',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'fake-public-publishable',
  AI_REDIS_REST_URL: 'https://unit-test.upstash.io', AI_REDIS_REST_TOKEN: 'fake-private-redis',
  AI_RATE_LIMIT_SECRET: hmacSecret,
  // An unrelated provider key must never be read or sent by this check.
  ELEVENLABS_API_KEY: 'fake-private-elevenlabs', OPENAI_API_KEY: 'fake-private-openai',
});
const user = id => ({ id: id || uid, is_anonymous: false, aud: 'authenticated', role: 'authenticated',
  email: 'private-account@example.test', created_at: '2026-01-01T00:00:00Z' });
function request(token = jwt, options = {}) {
  const headers = { 'sec-fetch-site': 'same-origin', origin: 'https://' + host,
    ...(token === null ? {} : { authorization: 'Bearer ' + token }), ...options.headers };
  for (const [key, value] of Object.entries(headers)) if (value === undefined) delete headers[key];
  return new Request(options.url || endpoint, { method: options.method || 'GET', headers,
    ...(options.signal ? { signal: options.signal } : {}) });
}
function harness(options = {}) {
  const env = { ...environment(), ...options.env }, calls = [], logs = [], clients = [], tokens = [];
  const now = Date.parse(options.now || '2026-11-01T20:00:00.000Z');
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const cache = new Map();
  const locate = file => [path.join(sourceRoot, file), path.join(repoRoot, file)].find(p => fs.existsSync(p));
  const mocks = {
    '@supabase/supabase-js': { createClient: (url, key, config) => {
      clients.push({ url, key, config });
      return { auth: { getUser: async token => {
        tokens.push(token);
        if (options.getUser) return options.getUser(token, config, url, key);
        const response = await config.global.fetch(url + '/auth/v1/user', {
          method: 'GET', headers: { Authorization: 'Bearer ' + token, apikey: key },
        });
        return response.ok ? { data: { user: await response.json() }, error: null }
          : { data: { user: null }, error: { status: response.status } };
      } } };
    } },
  };
  if (options.realSdk) mocks['@supabase/supabase-js'] = require(path.join(repoRoot, 'node_modules/@supabase/supabase-js'));
  const fetcher = async (input, init = {}) => {
    const url = new URL(String(input)); calls.push({ url: url.href, init });
    if (options.fetcher) return options.fetcher(url, init);
    if (url.origin === 'https://test-project.supabase.co' && url.pathname === '/auth/v1/user') {
      assert.equal(init.method, 'GET');
      return Response.json(options.authUser || user(), { status: options.authStatus || 200 });
    }
    assert.equal(url.href, 'https://unit-test.upstash.io/');
    assert.equal(init.method, 'POST');
    const command = JSON.parse(init.body);
    assert.equal(command[0], 'MGET'); assert.equal(command.length, 4);
    return Response.json(options.redisBody || { result: [null, null, null] }, { status: options.redisStatus || 200 });
  };
  function load(file) {
    file = file.replaceAll('\\', '/');
    if (cache.has(file)) return cache.get(file);
    const location = locate(file);
    if (!location) throw Error('Missing source ' + file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(location, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const requireDependency = id => {
      if (id in mocks) return mocks[id];
      if (id.startsWith('node:')) return require(id);
      // Admission and provider handlers must not be dependencies of a read-only check.
      if (/admission|elevenlabs-route|openai-route|voice\/session/.test(id)) throw Error('Forbidden voice dependency');
      const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
      const target = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(locate);
      if (!target) throw Error('Unexpected dependency ' + id);
      return load(target);
    };
    vm.runInNewContext(code, { exports, require: requireDependency, process: { env }, fetch: fetcher,
      Request, Response, Headers, URL, URLSearchParams, Buffer, AbortController,
      AbortSignal: options.AbortSignal || AbortSignal, Date: Clock, setTimeout, clearTimeout,
      console: Object.fromEntries(['log', 'warn', 'error', 'info', 'debug'].map(key => [key, (...args) => logs.push(args)])) });
    return exports;
  }
  return { env, calls, logs, clients, tokens, load, route: load('app/api/sofia-session-check/route.ts') };
}
const redisCalls = h => h.calls.filter(call => call.url.includes('.upstash.io'));
const authCalls = h => h.calls.filter(call => call.url.includes('.supabase.co'));
const expectedKeys = (id = uid) => {
  const hash = createHmac('sha256', hmacSecret).update('user:' + id).digest('hex');
  return ['minute', 'day', '31days'].map(window => 'destinauta:ai:v1:preview:voice:user:' + hash + ':' + window);
};

test('only the exact Preview branch and repository can perform external checks', async () => {
  for (const change of [{ VERCEL: undefined }, { VERCEL: '0' }, { VERCEL_ENV: 'production' },
    { VERCEL_ENV: 'development' }, { VERCEL_GIT_COMMIT_REF: 'main' },
    { VERCEL_GIT_COMMIT_REF: 'codex/other' }, { VERCEL_GIT_REPO_OWNER: 'other' },
    { VERCEL_GIT_REPO_SLUG: 'other' }, { VERCEL_GIT_REPO_SLUG: undefined }]) {
    const h = harness({ env: change }), response = await h.route.GET(request());
    assert.equal(response.status, 404); assert.equal(h.calls.length, 0); assert.equal(h.clients.length, 0);
    assert.deepEqual(h.logs, []);
  }
});

test('expired, future and boundary windows are hidden before authenticating', async () => {
  for (const now of ['2026-11-01T19:29:59.999Z', '2026-11-02T19:30:00.000Z', '2026-11-03T00:00:00.000Z']) {
    const h = harness({ now }); assert.equal((await h.route.GET(request())).status, 404);
    assert.equal(h.calls.length, 0); assert.equal(h.clients.length, 0);
  }
  const h = harness({ now: '2026-11-01T19:30:00.000Z' });
  assert.equal((await h.route.GET(request())).status, 200);
});

test('wrong host, HTTP, queries and cross-site requests cannot reach Auth or Redis', async () => {
  const cases = [
    { url: 'https://destinauta.com/api/sofia-session-check' },
    { url: 'https://other-preview.vercel.app/api/sofia-session-check' },
    { url: endpoint.replace('https:', 'http:') },
    { url: endpoint + '?userId=' + otherUid },
    { headers: { origin: 'https://evil.example' } },
    { headers: { 'sec-fetch-site': 'cross-site' } },
    { headers: { 'sec-fetch-site': 'same-site' } },
    { headers: { 'sec-fetch-site': undefined } },
  ];
  for (const change of cases) {
    const h = harness(); assert.equal((await h.route.GET(request(jwt, change))).status, 404);
    assert.equal(h.calls.length, 0); assert.equal(h.clients.length, 0);
  }
});

test('unsupported HTTP methods are hidden without any operation', async () => {
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD']) {
    const h = harness(); assert.equal(typeof h.route[method], 'function');
    assert.equal((await h.route[method](request(jwt, { method }))).status, 404);
    assert.equal(h.calls.length, 0); assert.equal(h.clients.length, 0);
  }
});

test('missing and structurally invalid sessions are rejected without Auth or Redis calls', async () => {
  for (const token of [null, '', 'invalid', 'one.two', 'a..b', 'x'.repeat(8193)]) {
    const h = harness(), response = await h.route.GET(request(token));
    assert.equal(response.status, 401); assert.deepEqual(await response.json(), { error: 'voice_auth_required' });
    assert.equal(h.calls.length, 0); assert.equal(h.clients.length, 0); assert.deepEqual(h.logs, []);
  }
});

test('sessions refused by Supabase and anonymous identities can never read Redis', async () => {
  for (const options of [{ authStatus: 401 }, { authStatus: 403 },
    { authUser: { ...user(), is_anonymous: true } }, { authUser: { ...user(), role: 'service_role' } },
    { authUser: { ...user(), aud: 'anon' } }, { authUser: { ...user(), id: 'malformed-id' } }]) {
    const h = harness(options), response = await h.route.GET(request());
    assert.equal(response.status, 401); assert.deepEqual(await response.json(), { error: 'voice_auth_required' });
    assert.equal(authCalls(h).length, 1); assert.equal(redisCalls(h).length, 0); assert.deepEqual(h.logs, []);
  }
});

test('valid session is verified remotely then reads exactly its own three quota keys with MGET', async () => {
  const h = harness(), response = await h.route.GET(request());
  assert.equal(response.status, 200); assert.equal(authCalls(h).length, 1); assert.equal(redisCalls(h).length, 1);
  assert.equal(h.calls[0].url, 'https://test-project.supabase.co/auth/v1/user');
  assert.equal(h.calls[0].init.cache, 'no-store'); assert.equal(h.calls[0].init.redirect, 'error');
  const read = redisCalls(h)[0]; assert.equal(read.init.headers.Authorization, 'Bearer fake-private-redis');
  assert.equal(read.init.cache, 'no-store'); assert.equal(read.init.redirect, 'error');
  assert.deepEqual(JSON.parse(read.init.body), ['MGET', ...expectedKeys()]);
  const result = await response.json();
  assert.deepEqual(result, { authenticated: true, identity_verified: true, quota_owner: 'authenticated_user',
    quotas: [{ window: 'minute', limit: 1, used: 0, remaining: 1 },
      { window: 'day', limit: 2, used: 0, remaining: 2 },
      { window: '31days', limit: 3, used: 0, remaining: 3 }], voice_started: false, quota_reserved: false });
  assert.match(response.headers.get('cache-control'), /no-store/);
  assert.match(response.headers.get('vary'), /Authorization/i);
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  const serialized = JSON.stringify(result);
  for (const value of [uid, 'private-account@example.test', jwt, hmacSecret, 'fake-private-redis',
    'fake-private-elevenlabs', 'fake-private-openai', ...expectedKeys()]) assert.equal(serialized.includes(value), false);
  assert.deepEqual(h.logs, []);
});

test('client identity headers cannot select another account and independently authenticated users use separate keys', async () => {
  const a = harness(), b = harness({ authUser: user(otherUid) });
  assert.equal((await a.route.GET(request(jwt, { headers: { 'x-user-id': otherUid } }))).status, 200);
  assert.equal((await b.route.GET(request())).status, 200);
  assert.deepEqual(JSON.parse(redisCalls(a)[0].init.body), ['MGET', ...expectedKeys(uid)]);
  assert.deepEqual(JSON.parse(redisCalls(b)[0].init.body), ['MGET', ...expectedKeys(otherUid)]);
});

test('quota reads report configured limits and clamp exhausted windows without reserving attempts', async () => {
  const initial = new Map(expectedKeys().map((key, i) => [key, ['2', '4', '7'][i]]));
  let writes = 0;
  const h = harness({ env: { AI_VOICE_USER_MINUTE_LIMIT: '2', AI_VOICE_USER_DAY_LIMIT: '3', AI_VOICE_USER_31DAY_LIMIT: '6' },
    fetcher: async (url, init) => {
      if (url.pathname === '/auth/v1/user') return Response.json(user());
      const command = JSON.parse(init.body); if (command[0] !== 'MGET') writes++;
      assert.equal(command[0], 'MGET'); return Response.json({ result: command.slice(1).map(key => initial.get(key) ?? null) });
    } });
  const before = [...initial];
  for (let i = 0; i < 2; i++) {
    const response = await h.route.GET(request()); assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).quotas, [
      { window: 'minute', limit: 2, used: 2, remaining: 0 },
      { window: 'day', limit: 3, used: 4, remaining: 0 },
      { window: '31days', limit: 6, used: 7, remaining: 0 },
    ]);
  }
  assert.deepEqual([...initial], before); assert.equal(writes, 0);
  assert.equal(h.calls.some(call => /elevenlabs|openai|\/api\/voice/.test(call.url)), false);
});

test('invalid user limit settings and unsafe Redis configuration fail without Redis requests', async () => {
  const cases = [{ AI_REDIS_REST_URL: 'http://unit-test.upstash.io' },
    { AI_REDIS_REST_URL: 'https://attacker.example' }, { AI_REDIS_REST_URL: 'https://unit-test.upstash.io/path' },
    { AI_REDIS_REST_URL: 'https://user:password@unit-test.upstash.io' },
    { AI_REDIS_REST_URL: 'https://unit-test.upstash.io/?x=1' }, { AI_REDIS_REST_TOKEN: '' },
    { AI_RATE_LIMIT_SECRET: 'short' }];
  for (const name of ['AI_VOICE_USER_MINUTE_LIMIT', 'AI_VOICE_USER_DAY_LIMIT', 'AI_VOICE_USER_31DAY_LIMIT']) {
    for (const value of ['0', '-1', '1.5', 'NaN', '1000000']) cases.push({ [name]: value });
  }
  for (const env of cases) {
    const h = harness({ env }), response = await h.route.GET(request());
    assert.equal(response.status, 503); assert.deepEqual(await response.json(), { error: 'sofia_check_unavailable' });
    assert.equal(redisCalls(h).length, 0); assert.deepEqual(h.logs, []);
  }
});

test('malformed or failed Redis results return a generic error without private response data', async () => {
  for (const redisBody of [{ error: 'PRIVATE_REDIS_ERROR' }, {}, { result: null }, { result: [null, null] },
    { result: [null, null, null, null] }, { result: ['-1', '0', '0'] }, { result: ['1.5', '0', '0'] },
    { result: ['NaN', '0', '0'] }, { result: ['9007199254740992', '0', '0'] }, { result: [{ secret: 'PRIVATE' }, null, null] }]) {
    const h = harness({ redisBody }), response = await h.route.GET(request());
    assert.equal(response.status, 503); assert.deepEqual(await response.json(), { error: 'sofia_check_unavailable' });
    assert.deepEqual(h.logs, []);
  }
  for (const redisStatus of [401, 403, 429, 503]) {
    const h = harness({ redisStatus }), response = await h.route.GET(request());
    assert.equal(response.status, 503); assert.deepEqual(await response.json(), { error: 'sofia_check_unavailable' });
  }
});

test('network errors, invalid JSON and timeouts never log secrets or reach a voice provider', async () => {
  for (const behavior of ['network', 'json', 'timeout']) {
    const timeoutController = new AbortController();
    const h = harness({ ...(behavior === 'timeout' ? { AbortSignal: { timeout: milliseconds => {
      assert.equal(milliseconds, 2500); setTimeout(() => timeoutController.abort(), 1); return timeoutController.signal;
    } } } : {}), fetcher: async (url, init) => {
      if (url.pathname === '/auth/v1/user') return Response.json(user());
      if (behavior === 'json') return new Response('PRIVATE_INVALID_JSON');
      if (behavior === 'timeout') return new Promise((resolve, reject) => {
        if (init.signal.aborted) return reject(Error('PRIVATE_TIMEOUT'));
        init.signal.addEventListener('abort', () => reject(Error('PRIVATE_TIMEOUT')), { once: true });
      });
      throw Error('PRIVATE_NETWORK ' + jwt + ' ' + hmacSecret);
    } });
    const response = await h.route.GET(request());
    assert.equal(response.status, 503); assert.deepEqual(await response.json(), { error: 'sofia_check_unavailable' });
    assert.deepEqual(h.logs, []);
    assert.equal(h.calls.some(call => /elevenlabs|openai/.test(call.url)), false);
  }
});

test('already aborted requests perform no external operation', async () => {
  const controller = new AbortController(); controller.abort();
  const h = harness(), response = await h.route.GET(request(jwt, { signal: controller.signal }));
  assert.equal(response.status, 503); assert.equal(h.calls.length, 0); assert.equal(h.clients.length, 0);
});

test('installed Supabase SDK checks the real verification path with a mocked transport and no external network', async () => {
  const h = harness({ realSdk: true }), response = await h.route.GET(request());
  assert.equal(response.status, 200); assert.equal(authCalls(h).length, 1); assert.equal(redisCalls(h).length, 1);
  assert.deepEqual(JSON.parse(redisCalls(h)[0].init.body), ['MGET', ...expectedKeys()]);
  assert.deepEqual(h.logs, []);
});
