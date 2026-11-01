const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
const output = ts.transpileModule(fs.readFileSync(path.join(root, 'lib/voice/auth-client.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exportsObject = {};
vm.runInNewContext(output, { exports: exportsObject, Date: { now: () => 1000000 },
  require: () => { throw Error('The type-only SDK import must not load anything'); } });
const { observeVoiceAuth } = exportsObject;
const tick = () => new Promise(setImmediate);
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const user = (id = 'user-a', token = 'fake-account-access-token') => ({ user: { id, is_anonymous: false }, access_token: token, expires_at: 2000 });
const response = session => ({ data: { session }, error: null });

function setup(getSession) {
  let listener, unsubscribed = 0, stopped = 0, reads = 0;
  const states = [], order = [];
  const auth = {
    onAuthStateChange(callback) { order.push('subscribe'); listener = callback; return { data: { subscription: { unsubscribe() { unsubscribed++; } } } }; },
    getSession() { order.push('read'); reads++; return getSession(); },
  };
  const controller = observeVoiceAuth(auth, value => states.push({ ...value }), () => { stopped++; });
  return { controller, states, order, emit: (session, event = 'SIGNED_IN') => listener(event, session),
    get stopped() { return stopped; }, get reads() { return reads; }, get unsubscribed() { return unsubscribed; } };
}

test('subscribes before the initial read and stays closed while the session is loading', async () => {
  const initial = deferred();
  const h = setup(() => initial.promise);
  assert.deepEqual(h.order, ['subscribe', 'read']);
  assert.equal(await h.controller.getAccessToken(), null);
  assert.equal(h.reads, 1);
  assert.equal(h.states.length, 0);
  initial.resolve(response(null)); await tick();
  assert.deepEqual(h.states.at(-1), { ready: true, userId: null });
  assert.equal(await h.controller.getAccessToken(), null);
  assert.equal(h.reads, 1);
  h.controller.dispose();
});

test('a late initial result cannot restore a signed-out user or undo a newer login', async () => {
  for (const [eventSession, lateSession] of [[null, user()], [user('user-b'), null]]) {
    const initial = deferred(), h = setup(() => initial.promise);
    h.emit(eventSession);
    initial.resolve(response(lateSession)); await tick();
    assert.equal(h.states.at(-1).userId, eventSession?.user.id ?? null);
    h.controller.dispose();
  }
});

test('anonymous, missing-token and expired sessions are ineligible for voice', async () => {
  for (const session of [null, { ...user(), user: { id: 'anonymous', is_anonymous: true } },
    { ...user(), access_token: '' }, { ...user(), expires_at: 999 }, { ...user(), user: null }]) {
    const h = setup(async () => response(session)); await tick();
    assert.deepEqual(h.states.at(-1), { ready: true, userId: null });
    assert.equal(await h.controller.getAccessToken(), null);
    h.controller.dispose();
  }
});

test('reads a current token per attempt without storing or emitting account credentials', async () => {
  let session = user();
  const h = setup(async () => response(session)); await tick();
  assert.equal(await h.controller.getAccessToken(), 'fake-account-access-token');
  session = user('user-a', 'fake-refreshed-account-token');
  h.emit(session, 'TOKEN_REFRESHED');
  assert.equal(await h.controller.getAccessToken(), 'fake-refreshed-account-token');
  assert.equal(h.reads, 3);
  assert.equal(JSON.stringify(h.states).includes('token'), false);
  assert.equal(h.stopped, 1, 'same-account refresh does not interrupt the conversation');
  h.controller.dispose();
});

test('logout or account replacement stops immediately and invalidates a pending token read', async () => {
  for (const next of [null, user('user-b')]) {
    const pending = deferred(); let reads = 0;
    const h = setup(() => ++reads === 1 ? Promise.resolve(response(user())) : pending.promise);
    await tick(); const baseline = h.stopped;
    const token = h.controller.getAccessToken();
    h.emit(next, next ? 'SIGNED_IN' : 'SIGNED_OUT');
    assert.equal(h.stopped, baseline + 1);
    pending.resolve(response(user()));
    assert.equal(await token, null);
    assert.equal(h.states.at(-1).userId, next?.user.id ?? null);
    h.controller.dispose();
  }
});

test('an identity change found by the fresh read requires another deliberate attempt', async () => {
  let session = user();
  const h = setup(async () => response(session)); await tick();
  session = user('user-b');
  assert.equal(await h.controller.getAccessToken(), null);
  assert.equal(h.states.at(-1).userId, 'user-b');
  assert.equal(h.stopped, 2);
  assert.equal(await h.controller.getAccessToken(), session.access_token);
  h.controller.dispose();
});

test('session errors remain closed without surfacing provider data', async () => {
  for (const getSession of [() => { throw Error('private-auth-detail'); },
    async () => { throw Error('private-auth-detail'); }, async () => ({ data: { session: user() }, error: Error('private') })]) {
    const h = setup(getSession); await tick();
    assert.deepEqual(h.states.at(-1), { ready: true, userId: null });
    assert.equal(JSON.stringify(h.states).includes('private'), false);
    h.controller.dispose();
  }
});

test('cleanup unsubscribes once and ignores late reads and subscription events', async () => {
  const initial = deferred(), h = setup(() => initial.promise);
  h.controller.dispose(); h.controller.dispose();
  initial.resolve(response(user())); h.emit(user()); await tick();
  assert.equal(h.unsubscribed, 1);
  assert.equal(h.states.length, 0);
  assert.equal(await h.controller.getAccessToken(), null);
});
