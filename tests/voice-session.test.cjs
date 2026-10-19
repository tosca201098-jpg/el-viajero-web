const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../lib/voice/session.ts'), 'utf8');
const output = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const voice = {};
vm.runInNewContext(output, { exports: voice, AbortController, setTimeout, clearTimeout, Date, JSON, Error },
  { filename: 'lib/voice/session.ts' });

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function harness(overrides = {}) {
  const phases = [], errors = [], searches = [], calls = [];
  const localTrack = { stopped: 0, stop() { this.stopped++; } };
  const remoteTrack = { stopped: 0, stop() { this.stopped++; } };
  const stream = { getTracks: () => [localTrack], getAudioTracks: () => [localTrack] };
  const remoteStream = { getTracks: () => [remoteTrack] };
  const channel = {
    readyState: 'connecting', sent: [], closed: false,
    send(value) { this.sent.push(JSON.parse(value)); },
    close() { this.closed = true; },
  };
  const peer = {
    connectionState: 'new', closed: false, senders: [],
    getSenders() { return this.senders; },
    addTrack(track) { this.senders.push({ track }); },
    createDataChannel() { return channel; },
    createOffer: async () => ({ type: 'offer', sdp: 'v=0\noffer' }),
    setLocalDescription: async () => {},
    setRemoteDescription: async (answer) => { peer.answer = answer; },
    close() { this.closed = true; },
  };
  const audio = { paused: false, srcObject: null, pause() { this.paused = true; } };
  const fetcher = overrides.fetcher ?? (async (url, options) => {
    calls.push({ url, options });
    return url === '/api/voice'
      ? { ok: true, json: async () => ({ value: 'ephemeral-test-token' }) }
      : { ok: true, text: async () => 'v=0\nanswer' };
  });
  const session = new voice.VoiceSession({
    onPhase: (phase) => phases.push(phase),
    onError: (error) => errors.push(error),
    onSearch: (args) => searches.push(args),
    fetcher, createPeerConnection: () => peer, createAudio: () => audio,
    getUserMedia: overrides.getUserMedia ?? (async () => stream),
    startupTimeoutMs: overrides.startupTimeoutMs ?? 200,
  });
  return { session, peer, channel, audio, stream, localTrack, remoteTrack, remoteStream, calls, phases, errors, searches };
}

test('a connected session handles a valid search and releases all media on stop', async () => {
  const h = harness();
  await h.session.start();
  assert.equal(h.session.status, 'connecting');
  h.peer.ontrack({ streams: [h.remoteStream] });
  h.channel.onopen();
  assert.equal(h.session.status, 'active');
  assert.equal(h.channel.sent.length, 1);
  assert.equal(h.calls.length, 2);
  const tool = { type: 'response.function_call_arguments.done', name: 'buscar_viaje',
    arguments: JSON.stringify({ origen: 'Barcelona', destino: 'Lisboa', fecha_ida: '2026-11-20',
      fecha_vuelta: '2026-11-22', viajeros: 2, servicio: 'vuelo', presupuesto: 150, tipo_presupuesto: 'por_persona' }) };
  h.channel.onmessage({ data: JSON.stringify(tool) });
  assert.equal(h.searches.length, 1);
  assert.equal(h.searches[0].presupuesto, 150);
  h.session.stop();
  assert.equal(h.session.status, 'idle');
  assert.equal(h.localTrack.stopped > 0, true);
  assert.equal(h.remoteTrack.stopped, 1);
  assert.equal(h.channel.closed, true);
  assert.equal(h.peer.closed, true);
  assert.equal(h.audio.paused, true);
  assert.equal(h.audio.srcObject, null);
  assert.equal(h.errors.length, 0);
});

test('repeated start does not create a second session; pending request can be cancelled', async () => {
  const pending = deferred();
  let count = 0, signal;
  const h = harness({ fetcher: async (_url, options) => { count++; signal = options.signal; return pending.promise; } });
  const starting = h.session.start();
  await h.session.start();
  assert.equal(count, 1);
  h.session.stop();
  assert.equal(signal.aborted, true);
  pending.resolve({ ok: true, json: async () => ({ value: 'late-token' }) });
  await starting;
  assert.equal(h.session.status, 'idle');
  assert.equal(h.peer.closed, false); // No peer was created after cancellation.
  assert.equal(h.phases.join(','), 'connecting,idle');
});

test('a cancelled response cannot replace a newer active session', async () => {
  const oldToken = deferred();
  let count = 0;
  const h = harness({ fetcher: async () => {
    count++;
    if (count === 1) return oldToken.promise;
    return count === 2
      ? { ok: true, json: async () => ({ value: 'new-token' }) }
      : { ok: true, text: async () => 'v=0\nanswer' };
  } });
  const oldStart = h.session.start();
  h.session.stop();
  await h.session.start();
  h.channel.onopen();
  oldToken.resolve({ ok: true, json: async () => ({ value: 'old-token' }) });
  await oldStart;
  assert.equal(count, 3);
  assert.equal(h.session.status, 'active');
  assert.equal(h.channel.sent.length, 1);
  h.session.stop();
});

test('a late microphone permission result is stopped after cancellation', async () => {
  const pendingMicrophone = deferred();
  const microphoneRequested = deferred();
  const h = harness({ getUserMedia: () => { microphoneRequested.resolve(); return pendingMicrophone.promise; } });
  const starting = h.session.start();
  await microphoneRequested.promise;
  h.session.stop();
  pendingMicrophone.resolve(h.stream);
  await starting;
  assert.equal(h.localTrack.stopped, 1);
  assert.equal(h.channel.closed, false); // It was never opened.
  assert.equal(h.session.status, 'idle');
});

test('a late WebRTC answer cannot reopen a cancelled session', async () => {
  const pendingAnswer = deferred();
  const answerRequested = deferred();
  let sdpSignal;
  const h = harness({ fetcher: async (url, options) => {
    if (url === '/api/voice') return { ok: true, json: async () => ({ value: 'test-token' }) };
    sdpSignal = options.signal;
    answerRequested.resolve();
    return pendingAnswer.promise;
  } });
  const starting = h.session.start();
  await answerRequested.promise;
  h.session.stop();
  assert.equal(sdpSignal.aborted, true);
  pendingAnswer.resolve({ ok: true, text: async () => 'v=0\nlate-answer' });
  await starting;
  assert.equal(h.peer.answer, undefined);
  assert.equal(h.localTrack.stopped > 0, true);
  assert.equal(h.session.status, 'idle');
});

test('invalid JSON, unrelated events and malformed arguments are ignored', () => {
  assert.equal(voice.parseVoiceEvent('{'), null);
  assert.equal(voice.parseVoiceEvent(JSON.stringify({ type: 'other', arguments: '{}' })), null);
  assert.equal(voice.parseVoiceEvent(JSON.stringify({ type: 'response.function_call_arguments.done', name: 'buscar_viaje', arguments: '{' })), null);
  assert.equal(voice.parseVoiceSearchArguments(JSON.stringify({ destino: 'Madrid' })), null);
});

test('permission and missing microphone errors are understandable and release the peer', async () => {
  for (const [name, expected] of [['NotAllowedError', 'permission'], ['NotFoundError', 'microphone']]) {
    const h = harness({ getUserMedia: async () => { const error = new Error(name); error.name = name; throw error; } });
    await h.session.start();
    assert.equal(h.errors[0], expected);
    assert.equal(h.peer.closed, true);
    assert.equal(h.session.status, 'idle');
  }
});

test('bad server response and invalid SDP fail without disclosing the token', async () => {
  const badToken = harness({ fetcher: async () => ({ ok: true, json: async () => ({ error: 'sensitive-detail' }) }) });
  await badToken.session.start();
  assert.equal(badToken.errors[0], 'connection');
  const badSdp = harness({ fetcher: async (url) => url === '/api/voice'
    ? { ok: true, json: async () => ({ value: 'test-token' }) }
    : { ok: false, text: async () => 'sensitive-detail' } });
  await badSdp.session.start();
  assert.equal(badSdp.errors[0], 'connection');
  assert.equal(badSdp.localTrack.stopped > 0, true);
  assert.equal(badSdp.peer.closed, true);
});

test('startup timeout and connection failure close resources', async () => {
  const pending = deferred();
  const slow = harness({ fetcher: () => pending.promise, startupTimeoutMs: 10 });
  const starting = slow.session.start();
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(slow.errors[0], 'timeout');
  pending.resolve({ ok: true, json: async () => ({ value: 'late' }) });
  await starting;
  assert.equal(slow.session.status, 'idle');

  const unopened = harness({ startupTimeoutMs: 10 });
  await unopened.session.start();
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(unopened.errors[0], 'timeout');
  assert.equal(unopened.localTrack.stopped > 0, true);
  assert.equal(unopened.channel.closed, true);

  const failed = harness();
  await failed.session.start();
  failed.channel.onopen();
  failed.peer.connectionState = 'failed';
  failed.peer.onconnectionstatechange();
  assert.equal(failed.errors[0], 'connection');
  assert.equal(failed.localTrack.stopped > 0, true);
  assert.equal(failed.channel.closed, true);
});

test('dispose prevents later callbacks and stops an active microphone', async () => {
  const h = harness();
  await h.session.start();
  h.channel.onopen();
  h.session.dispose();
  assert.equal(h.localTrack.stopped > 0, true);
  assert.equal(h.peer.closed, true);
  assert.equal(h.channel.closed, true);
  assert.deepEqual(h.errors, []);
});
