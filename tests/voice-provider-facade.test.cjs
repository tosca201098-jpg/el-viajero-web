const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const repoRoot = process.env.SOFIA_FINAL_REPO_ROOT || process.env.SOFIA_POLICY_REPO_ROOT || path.resolve(__dirname, '..');
const sourceRoot = process.env.SOFIA_FINAL_SOURCE_ROOT || process.env.SOFIA_POLICY_SOURCE_ROOT || repoRoot;
const ts = require(path.join(repoRoot, 'node_modules/typescript'));
function loader(globals = {}, mocks = {}) {
  const cache = new Map();
  const locate = file => [path.join(sourceRoot, file), path.join(repoRoot, file)].find(p => fs.existsSync(p));
  function load(file) {
    file = file.replaceAll('\\', '/');
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(locate(file), 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    } }).outputText;
    vm.runInNewContext(code, { exports, AbortController, AbortSignal, URL, URLSearchParams, Request, Response,
      setTimeout, clearTimeout, console, JSON, Date, ...globals, require: id => {
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
const facadeLoad = loader();
const { VoiceSession } = facadeLoad('lib/voice/session.ts');
const { VoicePreflightError } = facadeLoad('lib/voice/preflight.ts');
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
const tick = () => new Promise(setImmediate);
function harness(extra = {}) {
  let sdk; const phases = [], errors = [], turns = [], searches = [], mutes = [];
  const connection = { ended: 0, endSession: async () => { connection.ended++; }, setMicMuted: value => mutes.push(value), setVolume() {} };
  const session = new VoiceSession({ onPhase: phase => phases.push(phase), onError: error => errors.push(error), onTurn: turn => turns.push(turn),
    onSearch: async args => { searches.push(args); return { status: 'success' }; },
    preflight: async () => {},
    fetcher: async () => ({ ok: true, json: async () => ({ token: 'fake-session-token' }) }),
    startConversation: async options => { sdk = options; return connection; }, ...extra });
  return { session, phases, errors, turns, searches, mutes, connection, get sdk() { return sdk; } };
}

function openai(extra = {}) {
  const calls = [], phases = [], errors = []; let sdk = 0, microphones = 0;
  const track = { stopped: 0, stop() { this.stopped++; } };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  const channel = { readyState: 'connecting', send() {}, close() {} };
  const peer = { closed: false, getSenders: () => [{ track }], addTrack() {}, createDataChannel: () => channel,
    createOffer: async () => ({ type: 'offer', sdp: 'v=0\noffer' }), setLocalDescription: async () => {},
    setRemoteDescription: async answer => { peer.answer = answer; }, close() { this.closed = true; } };
  const session = new VoiceSession({ onPhase: p => phases.push(p), onError: e => errors.push(e), onSearch() {},
    createPeerConnection: () => peer, createAudio: () => ({ pause() {} }), preflight: async () => {},
    getUserMedia: async () => { microphones++; return stream; },
    startConversation: async () => { sdk++; throw Error('Must never open ElevenLabs'); },
    fetcher: async (url, options) => {
      calls.push({ url, options });
      return url === '/api/voice' ? Response.json({ value: 'fake-openai-session' }) : new Response('v=0\nanswer');
    }, ...extra });
  return { session, calls, phases, errors, track, peer, channel, get sdk() { return sdk; }, get microphones() { return microphones; } };
}

test('facade selects ElevenLabs with exactly one admission POST and no OpenAI peer', async () => {
  const calls = []; let peers = 0;
  const h = harness({ fetcher: async (url, init) => { calls.push({ url, init }); return Response.json({ token: 'fake-elevenlabs-session' }); },
    createPeerConnection: () => { peers++; throw Error('Wrong provider'); } });
  try {
    await Promise.all([h.session.start(), h.session.start()]);
    assert.equal(h.session.status, 'active'); assert.equal(peers, 0); assert.equal(calls.length, 1);
    assert.equal(calls[0].url, '/api/voice'); assert.equal(calls[0].init.method, 'POST');
    assert.deepEqual(JSON.parse(calls[0].init.body), { locale: 'es' });
    assert.equal(h.sdk.conversationToken, 'fake-elevenlabs-session');
  } finally { h.session.stop(); await tick(); }
});

test('facade selects preserved OpenAI with one admission POST and one SDP exchange', async () => {
  const h = openai();
  try {
    await Promise.all([h.session.start(), h.session.start()]);
    assert.equal(h.sdk, 0); assert.equal(h.microphones, 1);
    assert.equal(h.calls.filter(c => c.url === '/api/voice').length, 1);
    assert.equal(h.calls.length, 2); assert.equal(h.calls[1].url, 'https://api.openai.com/v1/realtime/calls');
    assert.equal(h.calls[1].options.headers.Authorization, 'Bearer fake-openai-session');
    assert.equal(h.calls[1].options.headers['Content-Type'], 'application/sdp');
    assert.equal(h.peer.answer.type, 'answer'); assert.equal(h.session.status, 'connecting');
    h.channel.readyState = 'open'; h.channel.onopen(); assert.equal(h.session.status, 'active');
  } finally { h.session.stop(); }
  assert.equal(h.peer.closed, true); assert.equal(h.track.stopped, 1);
});

test('ambiguous or malformed session responses fail closed without opening either provider', async () => {
  for (const data of [{ token: 'fake', value: 'fake' }, { token: '', value: 'fake' }, {}, null, [], { token: 1 }, { value: ' ' }]) {
    let calls = 0, opens = 0;
    const h = harness({ fetcher: async () => { calls++; return Response.json(data); },
      startConversation: async () => { opens++; throw Error('Unexpected provider'); },
      createPeerConnection: () => { opens++; throw Error('Unexpected provider'); } });
    await h.session.start(); assert.equal(calls, 1); assert.equal(opens, 0);
    assert.deepEqual(h.errors, ['connection']); assert.equal(h.session.status, 'idle');
  }
});

test('ElevenLabs startup failure never retries admission or falls back to OpenAI', async () => {
  let calls = 0, peers = 0;
  const h = harness({ fetcher: async () => { calls++; return Response.json({ token: 'fake' }); },
    startConversation: async () => { throw Error('private-provider-detail'); },
    createPeerConnection: () => { peers++; throw Error('Must not fall back'); } });
  await h.session.start(); assert.equal(calls, 1); assert.equal(peers, 0);
  assert.equal(h.session.status, 'idle'); assert.deepEqual(h.errors, ['connection']);
});

test('OpenAI SDP failure never falls back to ElevenLabs or requests a second token', async () => {
  let posts = 0;
  const h = openai({ fetcher: async url => {
    if (url === '/api/voice') { posts++; return Response.json({ value: 'fake' }); }
    return new Response('private-provider-detail', { status: 401 });
  } });
  await h.session.start(); assert.equal(posts, 1); assert.equal(h.sdk, 0);
  assert.equal(h.session.status, 'idle'); assert.deepEqual(h.errors, ['connection']); assert.equal(h.peer.closed, true);
});

test('Stop during admission JSON parsing prevents a late provider connection', async () => {
  const pending = deferred(); let opened = 0;
  const h = harness({ fetcher: async () => ({ ok: true, json: () => pending.promise }),
    startConversation: async () => { opened++; throw Error('late provider'); } });
  const run = h.session.start(); await tick(); h.session.stop(); pending.resolve({ token: 'fake' });
  await run; assert.equal(opened, 0); assert.equal(h.session.status, 'idle'); assert.deepEqual(h.errors, []);
});

test('a retry waits for asynchronous provider cleanup before consuming another admission', async () => {
  const closing = deferred(); let calls = 0, ended = 0, opened = 0;
  const h = harness({ fetcher: async () => { calls++; return Response.json({ token: 'fake' }); },
    startConversation: async () => { opened++; return { setMicMuted() {}, setVolume() {},
      endSession: () => ++ended === 1 ? closing.promise : Promise.resolve() }; } });
  await h.session.start(); h.session.stop(); const retry = h.session.start(); await tick();
  assert.equal(calls, 1); assert.equal(opened, 1);
  closing.resolve(); await retry; assert.equal(calls, 2); assert.equal(opened, 2); assert.equal(h.session.status, 'active');
  h.session.stop(); await tick();
});

test('OpenAI errors reported after the provider enters idle are retained once', async () => {
  const h = openai(); await h.session.start(); h.channel.readyState = 'open'; h.channel.onopen();
  h.channel.onmessage({ data: JSON.stringify({ type: 'error', message: 'private-detail' }) });
  assert.equal(h.session.status, 'idle'); assert.deepEqual(h.errors, ['connection']);
  assert.equal(h.peer.closed, true);
});

test('the facade bounds the preserved OpenAI session and releases its microphone', async () => {
  const h = openai({ sessionTimeoutMs: 5 }); await h.session.start();
  h.channel.readyState = 'open'; h.channel.onopen(); assert.equal(h.session.status, 'active');
  await new Promise(resolve => setTimeout(resolve, 25));
  assert.equal(h.session.status, 'idle'); assert.equal(h.peer.closed, true); assert.equal(h.track.stopped, 1);
  assert.deepEqual(h.errors, []);
});

test('guest and failed account-token reads open login without any admission or microphone request', async () => {
  for (const getAccessToken of [async () => null, async () => '', async () => { throw Error('private-session-detail'); }]) {
    let calls = 0, providers = 0, authRequired = 0;
    const h = harness({ getAccessToken, onAuthRequired: () => authRequired++,
      fetcher: async () => { calls++; throw Error('No admission for guests'); },
      startConversation: async () => { providers++; throw Error('No provider for guests'); } });
    await h.session.start();
    assert.equal(calls, 0); assert.equal(providers, 0); assert.equal(authRequired, 1);
    assert.equal(h.session.status, 'idle'); assert.deepEqual(h.errors, []);
  }
});

test('the account bearer goes only to the single local admission, never to the SDK', async () => {
  const calls = [];
  const h = harness({ getAccessToken: async () => 'fake-account-token', onAuthRequired() {},
    fetcher: async (url, options) => { calls.push({ url, options }); return Response.json({ token: 'fake-session-token' }); } });
  try {
    await h.session.start();
    assert.equal(calls.length, 1); assert.equal(calls[0].url, '/api/voice');
    assert.equal(calls[0].options.headers.Authorization, 'Bearer fake-account-token');
    assert.equal(calls[0].options.body.includes('fake-account-token'), false);
    assert.equal(h.sdk.conversationToken, 'fake-session-token');
    assert.equal('getAccessToken' in h.sdk, false); assert.equal('onAuthRequired' in h.sdk, false);
    assert.equal(JSON.stringify(h.sdk).includes('fake-account-token'), false);
  } finally { h.session.stop(); await tick(); }
});

test('each new deliberate conversation reads the refreshed account token', async () => {
  let reads = 0; const headers = [];
  const h = harness({ getAccessToken: async () => 'fake-account-token-' + ++reads,
    fetcher: async (_, options) => { headers.push(options.headers.Authorization); return Response.json({ token: 'fake-session-token' }); } });
  await h.session.start(); h.session.stop(); await tick();
  await h.session.start(); h.session.stop(); await tick();
  assert.deepEqual(headers, ['Bearer fake-account-token-1', 'Bearer fake-account-token-2']);
});

test('cancel or sign-out during account-token refresh prevents a late admission', async () => {
  const pending = deferred(); let posts = 0, authRequired = 0;
  const h = harness({ getAccessToken: () => pending.promise, onAuthRequired: () => authRequired++,
    fetcher: async () => { posts++; throw Error('Late account read must not admit'); } });
  const run = h.session.start(); await tick(); h.session.stop();
  pending.resolve('fake-late-account-token'); await run;
  assert.equal(posts, 0); assert.equal(authRequired, 0); assert.equal(h.session.status, 'idle');
});

test('a hung account-token read is cancelled and cannot block another deliberate attempt', async () => {
  const pending = deferred(); let reads = 0, posts = 0, authRequired = 0;
  const h = harness({ getAccessToken: () => ++reads === 1 ? pending.promise : Promise.resolve('fake-current-account-token'),
    onAuthRequired: () => authRequired++,
    fetcher: async () => { posts++; return Response.json({ token: 'fake-session-token' }); } });
  const first = h.session.start(); await tick(); h.session.stop();
  await first;
  assert.equal(posts, 0); assert.equal(authRequired, 0);
  await h.session.start(); assert.equal(posts, 1); assert.equal(h.session.status, 'active');
  pending.reject(Error('private-late-account-error')); await tick();
  assert.equal(posts, 1); assert.equal(authRequired, 0); assert.deepEqual(h.errors, []);
  h.session.stop(); await tick();
});

test('the startup timeout releases a hung token read so a later login attempt can succeed', async () => {
  let reads = 0, posts = 0;
  const h = harness({ startupTimeoutMs: 5,
    getAccessToken: () => ++reads === 1 ? new Promise(() => {}) : Promise.resolve('fake-current-account-token'),
    fetcher: async () => { posts++; return Response.json({ token: 'fake-session-token' }); } });
  const first = h.session.start();
  await new Promise(resolve => setTimeout(resolve, 15)); await first;
  assert.equal(posts, 0); assert.deepEqual(h.errors, ['timeout']);
  await h.session.start(); assert.equal(posts, 1); assert.equal(h.session.status, 'active');
  h.session.stop(); await tick();
});

test('a server rejection of the account identity returns to login without opening either provider', async () => {
  let authRequired = 0, opens = 0;
  const h = harness({ getAccessToken: async () => 'fake-invalid-account-token', onAuthRequired: () => authRequired++,
    fetcher: async () => new Response('private-auth-error', { status: 401 }),
    startConversation: async () => { opens++; throw Error('Rejected user must not connect'); } });
  await h.session.start();
  assert.equal(authRequired, 1); assert.equal(opens, 0); assert.deepEqual(h.errors, []);
});

test('the OpenAI rollback keeps its own ephemeral bearer and never receives the account bearer', async () => {
  const h = openai({ getAccessToken: async () => 'fake-account-token' });
  try {
    await h.session.start();
    assert.equal(h.calls[0].options.headers.Authorization, 'Bearer fake-account-token');
    assert.equal(h.calls[1].options.headers.Authorization, 'Bearer fake-openai-session');
    assert.equal(JSON.stringify(h.calls[1]).includes('fake-account-token'), false);
  } finally { h.session.stop(); }
});

test('authentication precedes local preflight and preflight precedes the single quota request', async () => {
  const events = [];
  const h = harness({ getAccessToken: async () => { events.push('auth'); return 'fake-account'; },
    preflight: async signal => { assert.equal(signal.aborted, false); events.push('preflight'); },
    fetcher: async () => { events.push('admission'); return Response.json({ token: 'fake-token' }); } });
  await Promise.all([h.session.start(), h.session.start()]);
  assert.deepEqual(events, ['auth', 'preflight', 'admission']); assert.equal(h.session.status, 'active');
  assert.equal('preflight' in h.sdk, false); h.session.stop(); await tick();
});

test('a guest never requests microphone preflight or consumes quota', async () => {
  let probes = 0, posts = 0, required = 0;
  const h = harness({ getAccessToken: async () => null, onAuthRequired: () => required++,
    preflight: async () => { probes++; }, fetcher: async () => { posts++; throw Error('Must not admit'); } });
  await h.session.start(); assert.equal(probes, 0); assert.equal(posts, 0); assert.equal(required, 1);
});

test('permission, microphone and WebRTC preflight failures preserve public codes without admission or provider calls', async () => {
  for (const code of ['permission', 'microphone', 'connection']) {
    let posts = 0, opens = 0;
    const h = harness({ preflight: async () => { throw new VoicePreflightError(code); },
      fetcher: async () => { posts++; throw Error('No token on failed preflight'); },
      startConversation: async () => { opens++; throw Error('No provider'); } });
    await h.session.start(); assert.equal(posts, 0); assert.equal(opens, 0);
    assert.deepEqual(h.errors, [code]); assert.equal(h.session.status, 'idle');
  }
});

test('Stop during the real local preflight settles startup, stops a late stream and cannot submit a quota request', async () => {
  const pending = deferred(); let posts = 0;
  const track = { enabled: true, readyState: 'live', stopped: 0, stop() { this.stopped++; this.readyState = 'ended'; } };
  const { preflightVoice } = facadeLoad('lib/voice/preflight.ts');
  const h = harness({ preflight: signal => preflightVoice(signal, { secureContext: true,
    createPeerConnection: () => ({ close() {} }), getUserMedia: () => pending.promise }),
    fetcher: async () => { posts++; throw Error('Cancelled preflight cannot admit'); } });
  const run = h.session.start(); await tick(); h.session.stop(); await run;
  pending.resolve({ getTracks: () => [track], getAudioTracks: () => [track] }); await tick();
  assert.equal(posts, 0); assert.equal(track.stopped, 1); assert.deepEqual(h.errors, []);
});

test('startup timeout during the real preflight does not consume quota and late browser errors are handled', async () => {
  const pending = deferred(); let posts = 0;
  const { preflightVoice } = facadeLoad('lib/voice/preflight.ts');
  const h = harness({ startupTimeoutMs: 5, preflight: signal => preflightVoice(signal, { secureContext: true,
    createPeerConnection: () => ({ close() {} }), getUserMedia: () => pending.promise }),
    fetcher: async () => { posts++; throw Error('Timed out preflight cannot admit'); } });
  const run = h.session.start(); await new Promise(resolve => setTimeout(resolve, 15)); await run;
  pending.reject(Error('PRIVATE_LATE_MIC_FAILURE')); await tick();
  assert.equal(posts, 0); assert.deepEqual(h.errors, ['timeout']); assert.equal(h.session.status, 'idle');
});

test('the facade clamps active duration to 360 seconds without permitting a caller to increase it', async () => {
  for (const sessionTimeoutMs of [undefined, 1000, 720000]) {
    const timers = [];
    class Provider {
      constructor(options) { this.options = options; }
      async start() { this.options.onPhase('active'); }
      dispose() {}
      waitForCleanup() { return Promise.resolve(); }
    }
    const candidate = loader({ setTimeout: (_callback, milliseconds) => { timers.push(milliseconds); return 1; }, clearTimeout() {} }, {
      './elevenlabs-session': { VoiceSession: Provider }, './openai-session': { VoiceSession: Provider },
    })('lib/voice/session.ts');
    const session = new candidate.VoiceSession({ sessionTimeoutMs, preflight: async () => {}, onPhase() {}, onError() {}, onSearch() {},
      fetcher: async () => Response.json({ token: 'fake-token' }) });
    await session.start(); assert.equal(timers[timers.length - 1], Math.min(sessionTimeoutMs ?? 360000, 360000)); session.stop();
  }
});
