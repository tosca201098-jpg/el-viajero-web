const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader, harness, deferred, tick } = require('./sofia-harness.cjs');
const { VoiceSession } = loader()('lib/voice/session.ts');

function openai(extra = {}) {
  const calls = [], phases = [], errors = []; let sdk = 0, microphones = 0;
  const track = { stopped: 0, stop() { this.stopped++; } };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  const channel = { readyState: 'connecting', send() {}, close() {} };
  const peer = { closed: false, getSenders: () => [{ track }], addTrack() {}, createDataChannel: () => channel,
    createOffer: async () => ({ type: 'offer', sdp: 'v=0\noffer' }), setLocalDescription: async () => {},
    setRemoteDescription: async answer => { peer.answer = answer; }, close() { this.closed = true; } };
  const session = new VoiceSession({ onPhase: p => phases.push(p), onError: e => errors.push(e), onSearch() {},
    createPeerConnection: () => peer, createAudio: () => ({ pause() {} }),
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
