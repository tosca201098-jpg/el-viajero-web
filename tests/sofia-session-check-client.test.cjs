const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const repoRoot = process.env.SOFIA_CHECK_REPO_ROOT || path.resolve(__dirname, '..');
const sourceRoot = process.env.SOFIA_CHECK_SOURCE_ROOT || repoRoot;
const ts = require(path.join(repoRoot, 'node_modules/typescript'));
const sourceFile = 'app/sofia-session-check/SessionCheck.tsx';
const source = fs.readFileSync(path.join(sourceRoot, sourceFile), 'utf8');
const tick = () => new Promise(setImmediate);
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const session = (id = 'test-user-a', access_token = 'fake-private-test-session') => ({
  user: { id, is_anonymous: false }, access_token,
});
const sessionResponse = value => ({ data: { session: value }, error: null });
const success = extra => ({ authenticated: true, identity_verified: true, quota_owner: 'authenticated_user',
  quotas: [{ window: 'minute', limit: 1, used: 0, remaining: 1 }, { window: 'day', limit: 2, used: 1, remaining: 1 },
    { window: '31days', limit: 3, used: 1, remaining: 2 }], voice_started: false, quota_reserved: false, ...extra });
const rejection = () => Response.json({ error: 'voice_auth_required' }, { status: 401 });
const labels = { session: 'Comprobar mi sesión y mis cuotas', anonymous: 'Comprobar rechazo sin sesión', invalid: 'Comprobar rechazo de sesión inválida' };
function nodes(node) {
  if (node == null || node === false || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  return [node, ...(node.children || []).flatMap(nodes)];
}
function text(node) {
  if (node == null || node === false) return '';
  if (Array.isArray(node)) return node.map(text).join('');
  return typeof node === 'object' ? text(node.children) : String(node);
}

function harness(options = {}) {
  const slots = [], pendingEffects = [], calls = [], logs = [], timers = new Map();
  let cursor = 0, currentSession = options.session === undefined ? session() : options.session;
  let listener, reads = 0, nextRead = null, unsubscribed = 0, timerId = 0, inAuthCallback = false;
  const react = {
    Fragment: Symbol('Fragment'),
    createElement: (type, props, ...children) => ({ type, props: props || {}, children: children.flat(Infinity) }),
    useState(initial) {
      const i = cursor++;
      if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
      return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }];
    },
    useRef(initial) { const i = cursor++; return slots[i] ??= { current: initial }; },
    useEffect(callback, deps) {
      const i = cursor++, previous = slots[i];
      if (!previous || !deps || !previous.deps || deps.some((value, index) => value !== previous.deps[index])) {
        slots[i] = { deps, cleanup: previous?.cleanup };
        pendingEffects.push({ i, callback });
      }
    },
  };
  const auth = {
    onAuthStateChange(callback) {
      listener = callback;
      return { data: { subscription: { unsubscribe() { unsubscribed++; } } } };
    },
    getSession() {
      assert.equal(inAuthCallback, false, 'An auth callback must not await another Supabase operation');
      reads++;
      if (reads === 1 && options.pendingInitial) return options.pendingInitial.promise;
      if (nextRead) { const next = nextRead; nextRead = null; options.onNextRead?.(listener); return next; }
      return Promise.resolve(sessionResponse(currentSession));
    },
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React,
  } }).outputText, {
    exports, React: react, AbortController, Promise,
    setTimeout(callback, milliseconds) { assert.equal(milliseconds, 10000); const id = ++timerId; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); },
    console: Object.fromEntries(['log', 'warn', 'error', 'info', 'debug'].map(method => [method, (...args) => logs.push(args)])),
    fetch: async (url, init) => {
      assert.equal(url, '/api/sofia-session-check', 'No other endpoint may be contacted');
      assert.equal(init.method, 'GET'); assert.equal(init.credentials, 'same-origin'); assert.equal(init.cache, 'no-store');
      assert(init.signal instanceof AbortSignal);
      calls.push({ url, init });
      return options.fetcher ? options.fetcher(url, init) : Response.json(success());
    },
    require: id => {
      if (id === 'react') return react;
      if (id === 'next/link') return { default: 'a' };
      if (id === '@/lib/supabase/client') return { getSupabaseClient() {
        if (options.clientError) throw Error('PRIVATE_CLIENT_CONFIGURATION');
        return { auth };
      } };
      throw Error('Unexpected dependency ' + id);
    },
  }, { filename: sourceFile });
  const Component = exports.default;
  const render = () => {
    cursor = 0;
    const tree = Component();
    for (const effect of pendingEffects.splice(0)) {
      slots[effect.i].cleanup?.();
      slots[effect.i].cleanup = effect.callback();
    }
    return tree;
  };
  const button = kind => nodes(render()).find(node => node.type === 'button' && text(node) === labels[kind]);
  const press = async kind => {
    const target = button(kind);
    if (!target.props.disabled) target.props.onClick();
    await tick();
    return render();
  };
  return {
    calls, logs, render, button, press,
    get reads() { return reads; }, get unsubscribed() { return unsubscribed; },
    setSession(value) { currentSession = value; },
    blockNextRead(value) { nextRead = value.promise; },
    emit(value, event = 'SIGNED_IN') {
      currentSession = value; inAuthCallback = true;
      try { listener(event, value); } finally { inAuthCallback = false; }
    },
    expire() { for (const callback of [...timers.values()]) callback(); },
    dispose() { for (const slot of slots) { slot?.cleanup?.(); if (slot?.cleanup) slot.cleanup = null; } },
  };
}

test('mount does not call the check endpoint and all three deliberate controls are initially enabled', async () => {
  const pendingInitial = deferred(), h = harness({ pendingInitial });
  const tree = h.render();
  assert.equal(nodes(tree).filter(node => node.type === 'button').length, 3);
  for (const kind of Object.keys(labels)) assert.equal(h.button(kind).props.disabled, false);
  assert.equal(h.calls.length, 0); assert.equal(h.reads, 1);
  assert(!text(tree).includes('fake-private-test-session'));
  pendingInitial.resolve(sessionResponse(session())); await tick();
  assert.equal(h.calls.length, 0); h.dispose();
});

test('a deliberate account check sends a fresh bearer only to the fixed same-origin GET and displays safe own quotas', async () => {
  const h = harness({ fetcher: async () => Response.json(success({
    private_user_id: 'NEVER_RENDER_USER', private_email: 'NEVER_RENDER_EMAIL', private_token: 'NEVER_RENDER_TOKEN',
  })) });
  h.render(); await tick(); h.setSession(session('test-user-a', 'fake-refreshed-test-session'));
  const tree = await h.press('session');
  assert.equal(h.calls.length, 1); assert.equal(h.reads, 2);
  assert.equal(h.calls[0].init.headers.Authorization, 'Bearer fake-refreshed-test-session');
  assert.equal(Object.keys(h.calls[0].init.headers).length, 1); assert.equal(h.calls[0].init.body, undefined);
  assert.match(text(tree), /Sesión reconocida por el servidor/);
  assert.match(text(tree), /Cuotas de tu cuenta/);
  assert.match(text(tree), /límites generales y por red/);
  for (const privateValue of ['test-user-a', 'fake-refreshed-test-session', 'NEVER_RENDER_USER', 'NEVER_RENDER_EMAIL', 'NEVER_RENDER_TOKEN']) assert(!text(tree).includes(privateValue));
  assert.deepEqual(h.logs, []); h.dispose();
});

test('guest and deliberately invalid checks independently prove 401 without using the real session', async () => {
  const h = harness({ fetcher: async () => rejection() }); h.render(); await tick();
  const baseline = h.reads;
  let tree = await h.press('anonymous');
  assert.match(text(tree), /rechaza la consulta sin sesión \(401\)/);
  assert.equal(h.calls[0].init.headers.Authorization, undefined);
  tree = await h.press('invalid');
  assert.match(text(tree), /rechaza la sesión inválida \(401\)/);
  assert.equal(h.calls[1].init.headers.Authorization, 'Bearer fake.header.signature');
  assert.equal(h.reads, baseline); assert.deepEqual(h.logs, []); h.dispose();
});

test('a registered check without a usable session lets the server reject it without exposing credentials', async () => {
  for (const value of [null, { ...session(), access_token: '' }, { ...session(), user: { id: 'anonymous', is_anonymous: true } }]) {
    const h = harness({ session: value, fetcher: async () => rejection() }); h.render(); await tick();
    const tree = await h.press('session');
    assert.equal(h.calls.length, 1); assert.equal(h.calls[0].init.headers.Authorization, undefined);
    assert.match(text(tree), /servidor exige una sesión válida/); h.dispose();
  }
});

test('an auth rejection after a bearer is sent asks for login and never renders arbitrary error details', async () => {
  const h = harness({ fetcher: async () => Response.json({ error: 'voice_auth_required', detail: 'PRIVATE_AUTH_DETAIL' }, { status: 401 }) });
  h.render(); await tick(); const tree = await h.press('session');
  assert.match(text(tree), /Inicia sesión en DESTINAUTA/); assert(!text(tree).includes('PRIVATE_AUTH_DETAIL')); h.dispose();
});

test('malformed policy, unsafe flags and unexpected status results are never displayed as successful checks', async () => {
  const invalidBodies = [null, {}, success({ voice_started: true }), success({ quota_reserved: true }),
    success({ quota_owner: 'another_user' }), success({ identity_verified: false }),
    success({ quotas: [] }), success({ quotas: success().quotas.map((q, i) => i ? q : { ...q, remaining: 999 }) }),
    success({ quotas: success().quotas.map((q, i) => i ? q : { ...q, used: -1 }) }),
    success({ quotas: success().quotas.map((q, i) => i ? q : { ...q, limit: 1.5 }) })];
  for (const body of invalidBodies) {
    const h = harness({ fetcher: async () => Response.json(body) }); h.render(); await tick();
    const tree = await h.press('session');
    assert.match(text(tree), /No se ha podido completar/); assert(!text(tree).includes('Sesión reconocida')); h.dispose();
  }
  for (const status of [403, 404, 429, 500, 503]) {
    const h = harness({ fetcher: async () => Response.json({ error: 'PRIVATE_ERROR' }, { status }) }); h.render(); await tick();
    const tree = await h.press('session'); assert(!text(tree).includes('PRIVATE_ERROR')); assert.match(text(tree), /No se ha podido completar/); h.dispose();
  }
});

test('an expected rejection returning 200 instead is reported as an error and never reveals quotas', async () => {
  for (const kind of ['anonymous', 'invalid']) {
    const h = harness(); h.render(); await tick(); const tree = await h.press(kind);
    assert.match(text(tree), /No se ha podido completar/); assert(!text(tree).includes('Cuotas de tu cuenta')); h.dispose();
  }
});

test('logout or account replacement aborts pending session reads and ignores late credentials', async () => {
  for (const next of [null, session('test-user-b'), { ...session(), user: { id: 'test-user-a', is_anonymous: true } }]) {
    const pending = deferred(), h = harness(); h.render(); await tick(); h.blockNextRead(pending);
    h.button('session').props.onClick(); await tick();
    h.emit(next, next ? 'SIGNED_IN' : 'SIGNED_OUT');
    pending.resolve(sessionResponse(session())); await tick();
    const tree = h.render();
    assert.equal(h.calls.length, 0); assert(!text(tree).includes('Sesión reconocida'));
    assert.equal(h.button('session').props.disabled, false); h.dispose();
  }
});

test('logout and account replacement clear existing results and abort pending network results', async () => {
  for (const next of [null, session('test-user-b')]) {
    const pending = deferred(); let calls = 0;
    const h = harness({ fetcher: async () => ++calls === 1 ? Response.json(success()) : pending.promise });
    h.render(); await tick(); assert.match(text(await h.press('session')), /Sesión reconocida/);
    h.button('session').props.onClick(); await tick(); const signal = h.calls[1].init.signal;
    h.emit(next, next ? 'SIGNED_IN' : 'SIGNED_OUT'); assert.equal(signal.aborted, true);
    pending.resolve(Response.json(success())); await tick();
    assert(!text(h.render()).includes('Cuotas de tu cuenta')); assert.equal(h.button('session').props.disabled, false); h.dispose();
  }
});

test('a late initial session cannot restore identity after a sign-out event', async () => {
  const pendingInitial = deferred(), h = harness({ pendingInitial, fetcher: async () => rejection() });
  h.render(); h.emit(null, 'SIGNED_OUT');
  pendingInitial.resolve(sessionResponse(session())); await tick();
  const tree = await h.press('session');
  assert.equal(h.calls[0].init.headers.Authorization, undefined);
  assert.match(text(tree), /servidor exige una sesión válida/); h.dispose();
});

test('an identity change discovered by a fresh read requires another deliberate check', async () => {
  const h = harness(); h.render(); await tick(); h.setSession(session('test-user-b', 'fake-b-session'));
  assert.match(text(await h.press('session')), /servidor exige una sesión válida/); assert.equal(h.calls.length, 0);
  assert.match(text(await h.press('session')), /Sesión reconocida/); assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].init.headers.Authorization, 'Bearer fake-b-session'); h.dispose();
});

test('a hung SDK read suppresses duplicate attempts, times out and permits another deliberate check', async () => {
  const pending = deferred(), h = harness(); h.render(); await tick(); h.blockNextRead(pending);
  const click = h.button('session').props.onClick; click(); click(); await tick();
  assert.equal(h.reads, 2); assert.equal(h.calls.length, 0);
  for (const kind of Object.keys(labels)) assert.equal(h.button(kind).props.disabled, true);
  h.expire(); await tick(); assert.match(text(h.render()), /No se ha podido completar/);
  assert.equal(h.button('session').props.disabled, false);
  assert.match(text(await h.press('session')), /Sesión reconocida/);
  pending.resolve(sessionResponse(session())); await tick(); assert.equal(h.calls.length, 1); h.dispose();
});

test('network timeout and unmount abort checks and ignore late results without logging provider details', async () => {
  for (const unmount of [false, true]) {
    const pending = deferred(), h = harness({ fetcher: async () => pending.promise }); h.render(); await tick();
    h.button('session').props.onClick(); await tick(); const signal = h.calls[0].init.signal;
    if (unmount) h.dispose(); else h.expire();
    await tick(); assert.equal(signal.aborted, true);
    pending.resolve(Response.json(success())); await tick();
    assert(!text(h.render()).includes('Sesión reconocida')); assert.deepEqual(h.logs, []);
    h.dispose(); assert.equal(h.unsubscribed, 1);
  }
});

test('same-user token refresh keeps results and the next check uses the new token without nested auth reads', async () => {
  const h = harness(); h.render(); await tick(); await h.press('session'); const reads = h.reads;
  h.emit(session('test-user-a', 'fake-current-token'), 'TOKEN_REFRESHED');
  assert.equal(h.reads, reads); assert.match(text(h.render()), /Sesión reconocida/);
  await h.press('session'); assert.equal(h.calls[1].init.headers.Authorization, 'Bearer fake-current-token'); h.dispose();
});

test('SDK, fetch and JSON failures show only a generic message without logging private content', async () => {
  for (const options of [{ clientError: true }, { fetcher: async () => { throw Error('PRIVATE_NETWORK_DETAIL'); } },
    { fetcher: async () => ({ status: 200, json: async () => { throw Error('PRIVATE_JSON_DETAIL'); } }) }]) {
    const h = harness(options); h.render(); await tick(); const tree = await h.press('session');
    assert.match(text(tree), /No se ha podido completar/);
    assert(!text(tree).includes('PRIVATE_')); assert.deepEqual(h.logs, []); h.dispose();
  }
});

test('a synchronous logout during an SDK read consumes its late rejection without an unhandled promise', async () => {
  const pending = deferred(), unhandled = [];
  const onUnhandled = reason => unhandled.push(reason);
  process.on('unhandledRejection', onUnhandled);
  const h = harness({ onNextRead: listener => listener('SIGNED_OUT', null) });
  try {
    h.render(); await tick(); h.blockNextRead(pending);
    h.button('session').props.onClick(); await tick();
    pending.reject(Error('PRIVATE_DELAYED_AUTH_ERROR')); await tick(); await tick();
    assert.equal(h.calls.length, 0); assert.equal(h.button('session').props.disabled, false);
    assert(!text(h.render()).includes('PRIVATE_DELAYED_AUTH_ERROR')); assert.deepEqual(unhandled, []); assert.deepEqual(h.logs, []);
  } finally { h.dispose(); process.removeListener('unhandledRejection', onUnhandled); }
});

test('the temporary client never imports voice providers or invokes audio, quota reservation, or private storage', () => {
  for (const forbidden of ['/api/voice', '@elevenlabs', 'api.elevenlabs', 'openai', 'getUserMedia', 'MediaRecorder', 'AudioContext',
    'localStorage', 'sessionStorage', 'console.', 'RESERVE_QUOTA', 'admitAiRequest']) {
    assert.equal(source.toLowerCase().includes(forbidden.toLowerCase()), false, forbidden);
  }
});
