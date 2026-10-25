const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const exports = {}; cache.set(file, exports);
  const source = file === 'lib/voice/session.ts' && process.env.VOICE_BASELINE
    ? fs.readFileSync(process.env.VOICE_BASELINE, 'utf8') : fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText,
    { exports, AbortController, setTimeout, clearTimeout, Date, JSON, Error,
      require: id => load((id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id)) + '.ts') });
  return exports;
}
const { VoiceSession } = load('lib/voice/session.ts');
const { locales, translate } = load('lib/i18n/translations.ts');
const tick = () => new Promise(resolve => setTimeout(resolve, 8));
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return { resolve, reject, promise }; };
const args = { origen: 'Barcelona', destino: 'Madrid', fecha_ida: '2026-11-20', fecha_vuelta: '2026-11-23', viajeros: 2, servicio: 'vuelo', presupuesto: 150, tipo_presupuesto: 'por_persona' };
async function connected(t, overrides = {}) {
  const sent = [], turns = [], errors = [], searches = [], itineraries = [], constraints = [];
  const track = { enabled: true, stopped: false, stop() { this.stopped = true; } };
  const channel = { readyState: 'open', send: value => sent.push(JSON.parse(value)), close() {} };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  const peer = { getSenders: () => [{ track }], addTrack() {}, createDataChannel: () => channel,
    createOffer: async () => ({ sdp: 'v=0\nmock' }), setLocalDescription: async () => {}, setRemoteDescription: async () => {}, close() {} };
  const session = new VoiceSession({ onPhase() {}, onTurn: value => turns.push(value), onError: value => errors.push(value),
    onSearch: (a,c) => { searches.push({args:a,context:c}); return overrides.search?.(a,c) ?? { status: 'success' }; },
    onItinerary: (a,c) => { itineraries.push({args:a,context:c}); return overrides.itinerary?.(a,c) ?? { status: 'success', destination: a.destino, days: a.dias, locale: c.locale }; },
    getLocale: () => overrides.locale ?? 'es', rearmDelayMs: 0, turnTimeoutMs: overrides.timeout ?? 1000,
    createPeerConnection: () => peer, createAudio: () => ({ pause() {} }),
    getUserMedia: async c => { constraints.push(c); return stream; },
    fetcher: async url => url === '/api/voice' ? { ok: true, json: async () => ({value:'mock'}) } : { ok: true, text: async () => 'v=0\nmock' },
  });
  t.after(() => session.stop());
  const emit = e => channel.onmessage?.({ data: JSON.stringify(e) });
  const created = id => emit({type:'response.created', response:{id}});
  const done = (id, output = []) => emit({type:'response.done',response:{id,status:'completed',output}});
  const audio = (id, state) => emit({ type: 'output_audio_buffer.' + state, response_id: id });
  const commit = id => emit({type:'input_audio_buffer.committed',item_id:id});
  const tool = (id, call, name = 'crear_itinerario', data = {destino:'Madrid',dias:2}) => emit({type:'response.function_call_arguments.done',response_id:id,call_id:call,name,arguments:JSON.stringify(data)});
  const output = () => sent.filter(e=>e.type==='conversation.item.create').map(e=>({call:e.item.call_id,...JSON.parse(e.item.output)}));
  const responses = () => sent.filter(e=>e.type==='response.create');
  await session.start(); channel.onopen();
  const h = {session,track,sent,turns,errors,searches,itineraries,constraints,emit,created,done,audio,commit,tool,output,responses};
  created('greeting'); audio('greeting','started'); done('greeting');
  if (!overrides.skipGreetingAssertions) assert.equal(track.enabled, false, 'greeting playback must not feed back into the microphone');
  audio('greeting','stopped'); await tick();
  if (!overrides.skipGreetingAssertions) { assert.equal(session.turnStatus, 'listening'); assert.equal(track.enabled, true); }
  return h;
}
for (const {code} of locales) test(`${code}: accepted instruction survives background voices through search, TTS and a second query`, async t => {
  const pending = deferred(), h = await connected(t, { locale:code, itinerary: () => pending.promise });
  assert.ok(h.responses()[0].response.instructions.includes(translate(code,'voice.greetingQuestion')));
  h.commit('instruction'); h.created('request');
  assert.equal(h.session.turnStatus,'processing'); assert.equal(h.track.enabled,false);
  h.tool('request','primary'); await tick(); h.done('request');
  assert.equal(h.session.turnStatus,'searching');
  for (let i=0;i<3;i++) {
    h.emit({type:'input_audio_buffer.speech_started',item_id:'tv'+i});
    h.emit({type:'conversation.item.input_audio_transcription.completed',item_id:'tv'+i,transcript:'stop and search Lisbon'});
    h.commit('tv'+i);
    h.emit({type:'input_audio_buffer.speech_stopped',item_id:'tv'+i});
  }
  h.created('unsolicited'); h.tool('unsolicited','other-city'); h.done('unsolicited');
  h.tool('request','duplicate-intent','crear_itinerario',{destino:'Lisboa',dias:3});
  h.tool('request','primary'); // Same call delivered twice.
  await tick();
  assert.equal(h.itineraries.length,1); assert.equal(h.itineraries[0].context.signal.aborted,false);
  assert.equal(h.responses().length,2); assert.equal(h.track.enabled,false);
  pending.resolve({status:'success',destination:'Madrid',days:2,locale:code}); await tick();
  assert.equal(h.output().find(e=>e.call==='primary').status,'success');
  assert.equal(h.responses().length,3); assert.equal(h.responses()[2].response.tool_choice,'none');
  h.created('ack'); h.audio('ack','started'); h.done('ack');
  assert.equal(h.session.turnStatus,'speaking'); assert.equal(h.track.enabled,false);
  h.commit('agent-echo'); h.emit({type:'input_audio_buffer.speech_started'});
  h.tool('ack','tts-tool'); await tick();
  assert.equal(h.itineraries.length,1); assert.equal(h.track.enabled,false,'response.done is before playback drains');
  h.audio('ack','stopped'); await tick();
  assert.equal(h.session.turnStatus,'listening'); assert.equal(h.track.enabled,true);
  h.commit('instruction'); assert.equal(h.responses().length,3,'a delayed duplicate commit cannot start a new query');
  h.commit('second'); h.created('second-response'); h.done('second-response'); await tick();
  assert.equal(h.session.turnStatus,'listening'); assert.equal(h.responses().length,4);
  assert.equal(h.sent.some(e=>e.type==='response.cancel'),false);
  for (const id of ['tv0','tv1','tv2','agent-echo']) assert.ok(h.sent.some(e=>e.type==='conversation.item.delete' && e.item_id===id));
});
test('flight search is awaited, deduplicated across event shapes and not replaced by itinerary calls', async t => {
  const pending=deferred(),h=await connected(t,{search:()=>pending.promise});
  h.commit('user');h.created('flight');h.tool('flight','flight-call','buscar_viaje',args);
  const item={type:'function_call',status:'completed',name:'buscar_viaje',call_id:'flight-call',arguments:JSON.stringify(args)};
  h.emit({type:'response.output_item.done',response_id:'flight',item});h.done('flight',[item]);
  h.tool('flight','unwanted-itinerary');await tick();
  assert.equal(h.searches.length,1);assert.equal(h.itineraries.length,0);assert.equal(h.track.enabled,false);
  assert.equal(h.output().some(e=>e.call==='flight-call'),false);
  pending.resolve({status:'success'});await tick();assert.equal(h.output().find(e=>e.call==='flight-call').status,'success');
  h.created('flight-ack');h.done('flight-ack');await tick();assert.equal(h.track.enabled,true);
});
for (const name of ['crear_itinerario','buscar_viaje']) test(`${name}: explicit stop aborts work; late completion cannot affect a new session`, async t => {
  const pending=deferred(),h=await connected(t,{search:()=>pending.promise,itinerary:()=>pending.promise});
  h.commit('user');h.created('active');h.tool('active','cancel',name,name==='buscar_viaje'?args:undefined);await tick();
  const signal=(name==='buscar_viaje'?h.searches:h.itineraries)[0].context.signal;
  const oldHandler=h.emit;
  h.session.stop();assert.equal(signal.aborted,true);assert.equal(h.session.turnStatus,'cancelled');assert.equal(h.track.enabled,false);assert.equal(h.track.stopped,true);
  assert.ok(h.sent.some(e=>e.type==='response.cancel'));assert.ok(h.sent.some(e=>e.type==='output_audio_buffer.clear'));
  await h.session.start(); // Reusing permission/transport mocks, with a new session generation.
  pending.resolve({status:'success'});await tick();oldHandler({type:'response.done',response:{id:'active',status:'completed',output:[]}});
  assert.equal(h.output().length,0);assert.equal(h.session.status,'connecting');
});
test('explicit stop while speaking closes playback without reopening microphone',async t=>{
  const h=await connected(t);h.commit('user');h.created('answer');h.audio('answer','started');h.done('answer');
  h.session.stop();h.audio('answer','stopped');await tick();assert.equal(h.track.enabled,false);assert.equal(h.session.status,'idle');
});
test('late playback start cancels a scheduled microphone rearm',async t=>{
  const h=await connected(t);h.commit('user');h.created('answer');h.done('answer');
  h.audio('answer','started');await tick();assert.equal(h.track.enabled,false);
  h.audio('answer','stopped');await tick();assert.equal(h.track.enabled,true);
});
test('search exceptions return an error, then listening rearms after the error acknowledgement',async t=>{
  const h=await connected(t,{search:()=>{throw Error('private detail');}});h.commit('user');h.created('bad');h.tool('bad','error','buscar_viaje',args);h.done('bad');await tick();
  assert.equal(h.output()[0].status,'error');assert.ok(!JSON.stringify(h.sent).includes('private detail'));
  h.created('error-ack');h.done('error-ack');await tick();assert.equal(h.session.turnStatus,'listening');
});
test('provider error and a stalled response release resources with an error',async t=>{
  const failed=await connected(t);failed.commit('user');failed.created('bad');failed.emit({type:'error',error:{message:'private'}});
  assert.deepEqual(failed.errors,['connection']);assert.equal(failed.track.stopped,true);
  const stalled=await connected(t,{timeout:30});stalled.commit('user');await new Promise(r=>setTimeout(r,45));
  assert.deepEqual(stalled.errors,['timeout']);assert.equal(stalled.session.status,'idle');assert.equal(stalled.track.enabled,false);
});
test('microphone requests echo cancellation and suppression, without claiming speaker identity',async t=>{
  const h=await connected(t);assert.equal(h.constraints[0].audio.echoCancellation,true);assert.equal(h.constraints[0].audio.noiseSuppression,true);
});

test('a second tool cannot abort a previously accepted task (baseline reproducer)',async t=>{
  const pending=deferred(),h=await connected(t,{skipGreetingAssertions:true,itinerary:()=>pending.promise});
  h.commit('user');h.created('task');h.tool('task','first');await tick();
  const first=h.itineraries[0].context.signal;
  h.tool('task','background','crear_itinerario',{destino:'Lisboa',dias:3});await tick();
  assert.equal(first.aborted,false,'background intent must never abort the accepted task');
  assert.equal(h.itineraries.length,1,'only one tool executes per accepted turn');
  pending.resolve({status:'success',destination:'Madrid',days:2,locale:'es'});h.done('task');await tick();
});
