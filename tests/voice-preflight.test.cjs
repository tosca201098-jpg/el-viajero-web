const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const repoRoot = process.env.SOFIA_FINAL_REPO_ROOT || process.env.SOFIA_POLICY_REPO_ROOT || path.resolve(__dirname, '..');
const sourceRoot = process.env.SOFIA_FINAL_SOURCE_ROOT || process.env.SOFIA_POLICY_SOURCE_ROOT || repoRoot;
const ts = require(path.join(repoRoot, 'node_modules/typescript'));
function load(globals = {}) {
  const file = path.join(sourceRoot, 'lib/voice/preflight.ts');
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
  } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, AbortController, AbortSignal, Promise, Set, ...globals });
  return exports;
}
const { preflightVoice, VoicePreflightError } = load();
const tick = () => new Promise(setImmediate);
const deferred = () => { let resolve, reject; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
function track(extra = {}) { return { readyState: 'live', enabled: true, stopped: 0, stop() { this.stopped++; this.readyState = 'ended'; }, ...extra }; }
function harness(extra = {}) {
  const audio = track(), video = track(), events = [];
  const stream = { getTracks: () => [audio, video], getAudioTracks: () => [audio] };
  const dependencies = { secureContext: true,
    createPeerConnection: () => { events.push('peer'); return { close() { events.push('close'); } }; },
    getUserMedia: async constraints => { events.push(['microphone', constraints]); return stream; }, ...extra };
  return { audio, video, stream, events, dependencies };
}
async function rejectsCode(operation, code) {
  await assert.rejects(operation, error => {
    assert.equal(error.name, 'VoicePreflightError'); assert.equal(error.code, code);
    assert.equal(error.message, code); assert.equal(String(error).includes('PRIVATE'), false); return true;
  });
}

test('preflight checks only a local peer and microphone, then stops every probe track', async () => {
  const h = harness(); await preflightVoice(new AbortController().signal, h.dependencies);
  assert.deepEqual(JSON.parse(JSON.stringify(h.events)), ['peer', 'close', ['microphone', { audio: true }]]);
  assert.equal(h.audio.stopped, 1); assert.equal(h.video.stopped, 1);
});

test('an insecure context never requests microphone or creates a peer', async () => {
  const h = harness({ secureContext: false });
  await rejectsCode(preflightVoice(new AbortController().signal, h.dependencies), 'permission');
  assert.deepEqual(h.events, []);
});

test('missing or failed WebRTC support never reaches the microphone', async () => {
  for (const createPeerConnection of [() => { throw Error('PRIVATE_CTOR'); }, () => null,
    () => ({ close() { throw Error('PRIVATE_CLOSE'); } })]) {
    const h = harness({ createPeerConnection });
    await rejectsCode(preflightVoice(new AbortController().signal, h.dependencies), 'connection');
    assert.deepEqual(h.events, []);
  }
  const api = load({ window: { isSecureContext: true }, navigator: { mediaDevices: { getUserMedia() { throw Error('Unexpected microphone'); } } } });
  await rejectsCode(api.preflightVoice(new AbortController().signal), 'connection');
});

test('default browser dependencies use secure context, no ICE servers and audio-only permission', async () => {
  const t = track(), events = [];
  const api = load({ window: { isSecureContext: true }, RTCPeerConnection: function (options) {
    events.push(['peer', options]); this.close = () => events.push('close');
  }, navigator: { mediaDevices: { getUserMedia: async options => {
    events.push(['microphone', options]); return { getTracks: () => [t], getAudioTracks: () => [t] };
  } } } });
  await api.preflightVoice(new AbortController().signal);
  assert.deepEqual(JSON.parse(JSON.stringify(events)), [['peer', { iceServers: [] }], 'close', ['microphone', { audio: true }]]);
  assert.equal(t.stopped, 1);
});

test('missing microphone API is a sanitized microphone failure after closing the peer', async () => {
  let closed = 0;
  const api = load({ window: { isSecureContext: true }, RTCPeerConnection: function () { this.close = () => closed++; } });
  await rejectsCode(api.preflightVoice(new AbortController().signal), 'microphone'); assert.equal(closed, 1);
});

test('browser permission and device errors contain only reviewed public codes', async () => {
  for (const [name, code] of [['NotAllowedError', 'permission'], ['SecurityError', 'permission'],
    ['NotFoundError', 'microphone'], ['DevicesNotFoundError', 'microphone'], ['NotReadableError', 'microphone'],
    ['OverconstrainedError', 'microphone'], ['AbortError', 'microphone'], ['OtherError', 'connection']]) {
    const h = harness({ getUserMedia: async () => { const error = Error('PRIVATE_DEVICE_DETAILS'); error.name = name; throw error; } });
    await rejectsCode(preflightVoice(new AbortController().signal, h.dependencies), code);
    assert.deepEqual(h.events, ['peer', 'close']);
  }
});

test('synchronously thrown microphone errors are sanitized', async () => {
  const h = harness({ getUserMedia: () => { const error = Error('PRIVATE'); error.name = 'NotAllowedError'; throw error; } });
  await rejectsCode(preflightVoice(new AbortController().signal, h.dependencies), 'permission');
});

test('no live enabled audio track can ever pass preflight and all returned tracks are stopped', async () => {
  for (const extra of [{ readyState: 'ended' }, { enabled: false }]) {
    const t = track(extra), h = harness({ getUserMedia: async () => ({ getTracks: () => [t], getAudioTracks: () => [t] }) });
    await rejectsCode(preflightVoice(new AbortController().signal, h.dependencies), 'microphone'); assert.equal(t.stopped, 1);
  }
  for (const stream of [null, { getTracks: () => [], getAudioTracks: () => [] }]) {
    const h = harness({ getUserMedia: async () => stream });
    await rejectsCode(preflightVoice(new AbortController().signal, h.dependencies), 'microphone');
  }
});

test('malformed track collections fail closed while independently available audio tracks are still stopped', async () => {
  const t = track(), h = harness({ getUserMedia: async () => ({ getTracks: () => null, getAudioTracks: () => [t] }) });
  await rejectsCode(preflightVoice(new AbortController().signal, h.dependencies), 'microphone'); assert.equal(t.stopped, 1);
});

test('track cleanup failure never skips cleanup of the other tracks or reports success', async () => {
  const a = track({ stop() { this.stopped++; throw Error('PRIVATE_STOP'); } }), b = track();
  const h = harness({ getUserMedia: async () => ({ getTracks: () => [a, b], getAudioTracks: () => [a] }) });
  await rejectsCode(preflightVoice(new AbortController().signal, h.dependencies), 'connection');
  assert.equal(a.stopped, 1); assert.equal(b.stopped, 1);
});

test('an already cancelled preflight does not create any browser resource', async () => {
  const controller = new AbortController(); controller.abort(); const h = harness();
  await rejectsCode(preflightVoice(controller.signal, h.dependencies), 'connection'); assert.deepEqual(h.events, []);
});

test('cancelling a hung permission read settles promptly and stops a late stream', async () => {
  const p = deferred(), controller = new AbortController(), h = harness({ getUserMedia: () => p.promise });
  const run = preflightVoice(controller.signal, h.dependencies); controller.abort();
  await rejectsCode(run, 'connection'); p.resolve(h.stream); await tick();
  assert.equal(h.audio.stopped, 1); assert.equal(h.video.stopped, 1); assert.deepEqual(h.events, ['peer', 'close']);
});

test('a late rejection after cancellation is handled without logging private error details', async () => {
  const p = deferred(), controller = new AbortController(), h = harness({ getUserMedia: () => p.promise });
  const run = preflightVoice(controller.signal, h.dependencies); controller.abort(); await rejectsCode(run, 'connection');
  p.reject(Error('PRIVATE_LATE_PERMISSION')); await tick();
});

test('synchronous cancellation during getUserMedia still consumes its late rejected promise', async () => {
  const controller = new AbortController(), p = deferred();
  const h = harness({ getUserMedia: () => { controller.abort(); return p.promise; } });
  await rejectsCode(preflightVoice(controller.signal, h.dependencies), 'connection');
  p.reject(Error('PRIVATE_LATE_FAILURE')); await tick();
});

test('preflight is free of providers, network signalling, persistence and console logging', () => {
  const source = fs.readFileSync(path.join(sourceRoot, 'lib/voice/preflight.ts'), 'utf8');
  for (const forbidden of ['fetch(', 'XMLHttpRequest', 'WebSocket(', '.createOffer(', '.setLocalDescription(',
    'console.', 'localStorage', 'sessionStorage', '/api/voice', '@elevenlabs', 'openai.com']) assert.equal(source.includes(forbidden), false);
  assert.equal(new VoicePreflightError('permission').message, 'permission');
});
