const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const repoRoot = process.env.SOFIA_AUTH_REPO_ROOT || path.resolve(__dirname, '..');
const sourceRoot = process.env.SOFIA_AUTH_SOURCE_ROOT || repoRoot;
const ts = require(path.join(repoRoot, 'node_modules/typescript'));
const uid = '11111111-2222-4333-8444-555555555555';
const otherUid = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';
const jwt = 'fake.header.signature';
const user = () => ({ id: uid, is_anonymous: false, aud: 'authenticated', role: 'authenticated', email: 'private@example.test' });
const environment = () => ({
  NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'fake-public-publishable-key',
  AI_ENABLED: 'true', AI_VOICE_ENABLED: 'true', AI_ITINERARY_ENABLED: 'true', VERCEL: '1', VERCEL_ENV: 'production',
  VERCEL_GIT_COMMIT_REF: 'main', VERCEL_GIT_REPO_OWNER: 'tosca201098-jpg', VERCEL_GIT_REPO_SLUG: 'el-viajero-web',
  AI_REDIS_REST_URL: 'https://unit-test.upstash.io', AI_REDIS_REST_TOKEN: 'fake-private-redis',
  AI_RATE_LIMIT_SECRET: 'fake-private-hmac-for-unit-tests-only', OPENAI_API_KEY: 'fake-private-openai',
  ELEVENLABS_ENABLED: 'true', ELEVENLABS_PRODUCTION_APPROVED: 'true', ELEVENLABS_API_KEY: 'fake-private-elevenlabs',
  ELEVENLABS_AGENT_VERSION_ID: 'agtvrsn_2501m679we79ekz985446fbyygkb',
});
function request(token = jwt, ip = '192.0.2.1', body = { locale: 'es' }, extra = {}) {
  return new Request('https://destinauta.com/api/voice', { method: 'POST',
    headers: { 'x-vercel-forwarded-for': ip, ...(token === null ? {} : { authorization: 'Bearer ' + token }), ...extra },
    body: JSON.stringify(body) });
}
function loader(globals, mocks) {
  const cache = new Map();
  function locate(file) { return [path.join(sourceRoot, file), path.join(repoRoot, file)].find(p => fs.existsSync(p)); }
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(locate(file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(code, { exports, Request, Response, Headers, URL, URLSearchParams, AbortController, AbortSignal,
      setTimeout, clearTimeout, console, ...globals, require: id => {
        if (id in mocks) return mocks[id];
        if (id.startsWith('node:')) return require(id);
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const found = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(locate);
        if (!found) throw Error('Unexpected dependency ' + id);
        return load(found);
      } });
    return exports;
  }
  return load;
}
function harness(options = {}) {
  const calls = [], clients = [], tokens = [], logs = [];
  const env = { ...environment(), ...options.env };
  const mocks = { '@supabase/supabase-js': { createClient: (url, key, config) => {
    clients.push({ url, key, config });
    return { auth: { getUser: async token => {
      tokens.push(token);
      if (options.authThrow) throw Error('PRIVATE_AUTH_ERROR ' + token);
      if (options.getUser) return options.getUser(token, config, url, key);
      return options.authResult ?? { data: { user: user() }, error: null };
    } } };
  } } };
  if (options.realSdk) mocks['@supabase/supabase-js'] = require(path.join(repoRoot, 'node_modules/@supabase/supabase-js'));
  const load = loader({ process: { env }, console: Object.fromEntries(['warn', 'error', 'log', 'info', 'debug'].map(k => [k, (...a) => logs.push(a)])),
    ...(options.globals || {}), fetch: async (url, init) => {
      calls.push({ url: String(url), init });
      return options.fetcher ? options.fetcher(url, init) : Response.json({ result: [1, 0] });
    } }, mocks);
  return { env, clients, tokens, calls, logs, load, verify: load('lib/supabase/voice-auth.ts').verifyVoiceUser,
    admit: load('lib/ai/admission.ts').admitAiRequest };
}

test('missing or structurally invalid bearer never reaches Supabase, Redis or an AI provider', async () => {
  for (const token of [null, '', 'invalid', 'one.two', 'a..b', 'x'.repeat(8193)]) {
    const h = harness(), result = await h.admit(request(token), 'voice');
    assert.equal(result.status, 401); assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await result.json(), { error: 'voice_auth_required' });
    assert.equal(h.clients.length, 0); assert.equal(h.calls.length, 0); assert.deepEqual(h.logs, []);
  }
  const h = harness();
  assert.equal((await h.admit(request(null, '192.0.2.1', { userId: uid }, { 'x-user-id': uid }), 'voice')).status, 401);
  assert.equal(h.clients.length, 0); assert.equal(h.calls.length, 0);
});

test('registered identity comes only from SDK getUser(jwt), with a fresh non-persisting client', async () => {
  const h = harness({ env: { NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co/rest/v1/' } });
  const identity = await h.verify(request(jwt, '192.0.2.1', { userId: otherUid }));
  assert.equal(identity.userId, uid); assert.deepEqual(h.tokens, [jwt]);
  assert.equal(h.clients.length, 1); assert.equal(h.clients[0].url, 'https://test-project.supabase.co');
  assert.equal(h.clients[0].key, 'fake-public-publishable-key');
  assert.deepEqual(JSON.parse(JSON.stringify(h.clients[0].config.auth)), { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false });
  assert.equal(JSON.stringify(identity).includes('private@example.test'), false);
  await h.verify(request()); assert.equal(h.clients.length, 2);
});

test('anonymous, wrong-audience, privileged-role and malformed user identities are denied', async () => {
  for (const value of [null, { ...user(), is_anonymous: true }, { ...user(), id: otherUid.replaceAll('-', '') },
    { ...user(), aud: 'other-project' }, { ...user(), role: 'service_role' }, { ...user(), id: '' }]) {
    const h = harness({ authResult: { data: { user: value }, error: null } });
    assert.equal((await h.admit(request(), 'voice')).status, 401);
    assert.equal(h.calls.length, 0); assert.deepEqual(h.logs, []);
  }
});

test('expired, forged and foreign tokens rejected by Supabase cannot reserve quota', async () => {
  for (const error of [{ status: 401 }, { status: 403 }, { status: 400, name: 'AuthSessionMissingError' },
    ...['bad_jwt', 'session_not_found', 'session_expired', 'user_not_found', 'user_banned'].map(code => ({ status: 400, code }))]) {
    const h = harness({ authResult: { data: { user: null }, error: { ...error, message: 'PRIVATE_AUTH_ERROR ' + jwt } } });
    const result = await h.admit(request(), 'voice');
    assert.equal(result.status, 401); assert.deepEqual(await result.json(), { error: 'voice_auth_required' });
    assert.equal(h.calls.length, 0); assert.deepEqual(h.logs, []);
  }
});

test('Supabase failure and missing server configuration fail closed without reservations or private errors', async () => {
  for (const options of [{ authThrow: true }, ...[400, 429, 500, undefined].map(status => ({ authResult: { data: { user: null }, error: { status, message: jwt } } })),
    ...[{ NEXT_PUBLIC_SUPABASE_URL: '' }, { NEXT_PUBLIC_SUPABASE_URL: 'http://external.example' },
      { NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co/not-root' }, { NEXT_PUBLIC_SUPABASE_URL: 'https://user:password@test.supabase.co' },
      { NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: '' }].map(env => ({ env }))]) {
    const h = harness(options), result = await h.admit(request(), 'voice');
    assert.equal(result.status, 503); assert.deepEqual(await result.json(), { error: 'ai_unavailable' });
    assert.equal(h.calls.length, 0); assert.deepEqual(h.logs, []);
  }
});

test('the SDK verification fetch is restricted to the existing Auth GET without caching or redirects', async () => {
  const h = harness({ getUser: async (token, config, url, key) => {
    await config.global.fetch(url + '/auth/v1/user', { method: 'GET', headers: { Authorization: 'Bearer ' + token, apikey: key } });
    return { data: { user: user() }, error: null };
  }, fetcher: async (url, init) => {
    assert.equal(String(url), 'https://test-project.supabase.co/auth/v1/user'); assert.equal(init.method, 'GET');
    assert.equal(init.cache, 'no-store'); assert.equal(init.redirect, 'error'); assert.ok(init.signal instanceof AbortSignal);
    assert.equal(init.headers.Authorization, 'Bearer ' + jwt); return Response.json(user());
  } });
  assert.equal((await h.verify(request())).userId, uid); assert.equal(h.calls.length, 1);
});

test('the installed Supabase SDK really verifies through the constrained Auth GET without network access', async () => {
  const h = harness({ realSdk: true, fetcher: async (url, init) => {
    assert.equal(String(url), 'https://test-project.supabase.co/auth/v1/user');
    assert.equal(init.method, 'GET'); assert.equal(init.cache, 'no-store'); assert.equal(init.redirect, 'error');
    const headers = new Headers(init.headers);
    assert.equal(headers.get('authorization'), 'Bearer ' + jwt);
    assert.equal(headers.get('apikey'), 'fake-public-publishable-key');
    return Response.json(user());
  } });
  assert.equal((await h.verify(request())).userId, uid);
  assert.equal(h.calls.length, 1); assert.deepEqual(h.logs, []);
});

test('unexpected SDK destinations or methods cannot forward the session token', async () => {
  for (const [destination, method] of [['https://attacker.example/auth/v1/user', 'GET'], ['https://test-project.supabase.co/auth/v1/user?token=private', 'GET'],
    ['https://test-project.supabase.co/rest/v1/users', 'GET'], ['https://test-project.supabase.co/auth/v1/user', 'POST']]) {
    const h = harness({ getUser: async (token, config) => {
      await config.global.fetch(destination, { method, headers: { Authorization: 'Bearer ' + token } });
      return { data: { user: user() }, error: null };
    } });
    assert.equal((await h.verify(request())).status, 503); assert.equal(h.calls.length, 0);
  }
});

test('authentication timeout uses a bounded signal and cannot fall through into Redis', async () => {
  let timeoutMs;
  const h = harness({ globals: { AbortSignal: { timeout: milliseconds => {
    timeoutMs = milliseconds; const controller = new AbortController(); setTimeout(() => controller.abort(), 1); return controller.signal;
  } } }, getUser: async (token, config, url) => {
    await config.global.fetch(url + '/auth/v1/user', { method: 'GET' }); return { data: { user: user() }, error: null };
  }, fetcher: async (url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener('abort', () => reject(Error('PRIVATE_TIMEOUT ' + jwt)), { once: true });
  }) });
  const result = await h.admit(request(), 'voice');
  assert.equal(timeoutMs, 2500); assert.equal(result.status, 503); assert.equal(h.calls.length, 1);
  assert.deepEqual(await result.json(), { error: 'ai_unavailable' }); assert.deepEqual(h.logs, []);
});

test('already cancelled voice requests never authenticate or reserve quota', async () => {
  const controller = new AbortController(); controller.abort();
  const h = harness(), req = new Request(request(), { signal: controller.signal });
  assert.equal((await h.admit(req, 'voice')).status, 503);
  assert.equal(h.clients.length, 0); assert.equal(h.calls.length, 0);
});

test('cancelling pending authentication ignores a late valid user and consumes no quota', async () => {
  let resolveUser;
  const pendingUser = new Promise(resolve => { resolveUser = resolve; });
  const controller = new AbortController();
  const h = harness({ getUser: async () => pendingUser });
  const pending = h.admit(new Request(request(), { signal: controller.signal }), 'voice');
  assert.equal(h.tokens.length, 1); controller.abort();
  resolveUser({ data: { user: user() }, error: null });
  const result = await pending;
  assert.equal(result.status, 503); assert.equal(h.calls.length, 0);
  assert.deepEqual(await result.json(), { error: 'ai_unavailable' });
});

test('request cancellation aborts the Supabase verification GET as well as suppressing Redis', async () => {
  const controller = new AbortController(); let authSignal;
  const h = harness({ getUser: async (token, config, url) => {
    await config.global.fetch(url + '/auth/v1/user', { method: 'GET' });
    return { data: { user: user() }, error: null };
  }, fetcher: async (url, init) => {
    authSignal = init.signal;
    return new Promise((resolve, reject) => init.signal.addEventListener('abort', () => reject(Error('cancelled')), { once: true }));
  } });
  const pending = h.admit(new Request(request(), { signal: controller.signal }), 'voice');
  controller.abort();
  assert.equal((await pending).status, 503); assert.equal(authSignal.aborted, true);
  assert.equal(h.calls.length, 1); assert.match(h.calls[0].url, /\/auth\/v1\/user$/);
});

test('verified user owns four attempt windows and a separate day hold without exposing UUID, JWT or raw IP', async () => {
  const h = harness(); assert.equal(await h.admit(request(), 'voice'), null);
  assert.equal(h.tokens.length, 1); assert.equal(h.calls.length, 2);
  const command = JSON.parse(h.calls[0].init.body);
  assert.equal(command[0], 'EVAL'); assert.equal(command[2], 4);
  assert.deepEqual(command.slice(7), [2, 60, 5, 86400, 20, 86400, 1, 60]);
  assert.match(command[6], /:production:voice:user:[a-f0-9]{64}:minute$/);
  const hold = JSON.parse(h.calls[1].init.body);
  assert.equal(hold[2], 1); assert.equal(hold[4], 'reserve');
  assert.match(hold[3], /^destinauta:ai:v2:production:voice:user:[a-f0-9]{64}:day:\d{4}-\d{2}-\d{2}$/);
  assert.match(hold[5], /^[a-f0-9]{32}$/);
  const userHash = require('node:crypto').createHmac('sha256', h.env.AI_RATE_LIMIT_SECRET).update('user:' + uid).digest('hex');
  assert(hold[3].includes(':user:' + userHash + ':day:'));
  for (const value of [uid, jwt, '192.0.2.1', 'private@example.test', '31days']) assert.equal(JSON.stringify([command, hold]).includes(value), false);
  assert.equal(JSON.stringify(h.calls).includes(jwt), false); assert.deepEqual(h.logs, []);
});

test('same verified user keeps the same quota after IP changes or client identity spoofing', async () => {
  const counts = new Map(), commands = [];
  const h = harness({ fetcher: async (url, init) => {
    const command = JSON.parse(init.body); commands.push(command);
    if (command[2] === 1) return Response.json({ result: [1, 0] });
    const keys = command.slice(3, 3 + command[2]), args = command.slice(3 + command[2]);
    if (keys.some((key, i) => (counts.get(key) || 0) >= args[i * 2])) return Response.json({ result: [0, 60] });
    keys.forEach(key => counts.set(key, (counts.get(key) || 0) + 1)); return Response.json({ result: [1, 0] });
  } });
  assert.equal(await h.admit(request(), 'voice'), null);
  const before = [...counts];
  const denied = await h.admit(request(jwt, '192.0.2.2', { userId: otherUid }), 'voice');
  assert.equal(denied.status, 429); assert.deepEqual([...counts], before);
  assert.equal(commands[0][6], commands[2][6]);
});

test('independent users have separate attempt and day keys; invalid minute limits fail before EVAL', async () => {
  const h = harness({ getUser: async token => ({ data: { user: { ...user(), id: token === jwt ? uid : otherUid } }, error: null }) });
  await h.admit(request(), 'voice'); await h.admit(request('other.header.signature'), 'voice');
  assert.notEqual(JSON.parse(h.calls[0].init.body)[6], JSON.parse(h.calls[2].init.body)[6]);
  assert.notEqual(JSON.parse(h.calls[1].init.body)[3], JSON.parse(h.calls[3].init.body)[3]);
    for (const value of ['0', '-1', 'NaN', '1.5', '2', '1000000']) {
      const invalid = harness({ env: { AI_VOICE_USER_MINUTE_LIMIT: value } });
      assert.equal((await invalid.admit(request(), 'voice')).status, 503); assert.equal(invalid.calls.length, 0);
    }
});

test('written itinerary admission remains public with only its previous three buckets', async () => {
  const h = harness({ authThrow: true }); assert.equal(await h.admit(request(null), 'itinerary'), null);
  assert.equal(h.clients.length, 0); assert.equal(h.tokens.length, 0); assert.equal(h.calls.length, 1);
  const command = JSON.parse(h.calls[0].init.body); assert.equal(command[2], 3);
  assert.deepEqual(command.slice(6), [3, 60, 10, 86400, 50, 86400]);
});

test('neither preserved OpenAI nor ElevenLabs handlers can bypass missing or rejected login', async () => {
  for (const provider of ['openai', 'elevenlabs']) for (const file of ['app/api/voice/route.ts', 'lib/voice/' + provider + '-route.ts']) {
    for (const token of [null, jwt]) {
      const h = harness({ env: { AI_VOICE_PROVIDER: provider }, authResult: { data: { user: null }, error: { status: 401 } } });
      const result = await h.load(file).POST(request(token));
      assert.equal(result.status, 401); assert.equal(h.calls.length, 0); assert.deepEqual(h.logs, []);
    }
  }
});

test('the installed SDK sanitizes network failures without logging session or private provider details', async () => {
  const captured = [];
  const originalConsole = Object.fromEntries(['error', 'warn', 'log', 'info', 'debug'].map(method => [method, console[method]]));
  try {
    for (const method of Object.keys(originalConsole)) console[method] = (...args) => captured.push(args.map(String).join(' '));
    const h = harness({ realSdk: true, fetcher: async () => {
      const error = Error('PRIVATE_NETWORK ' + jwt + ' 198.51.100.25 PRIVATE_BODY');
      error.privateHeaders = { Authorization: 'Bearer ' + jwt };
      throw error;
    } });
    const result = await h.verify(request());
    assert.equal(result.status, 503);
    assert.deepEqual(await result.json(), { error: 'ai_unavailable' });
    assert.equal(h.calls.length, 1);
    assert.deepEqual(h.logs, []);
    assert.deepEqual(captured, []);
  } finally {
    Object.assign(console, originalConsole);
  }
});
