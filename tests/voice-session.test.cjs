const {test}=require('node:test'),assert=require('node:assert/strict');
const {harness,deferred,tick,voice,trip}=require('./sofia-harness.cjs');
test('paused/limited admission never starts SDK or microphone and permits retry',async()=>{
 for(const [status,error]of[[503,'unavailable'],[429,'limited']]){
 let opened=0;const h=harness({fetcher:async()=>({ok:false,status}),startConversation:async()=>{opened++}});
 await h.session.start();await h.session.start();assert.equal(opened,0);assert.deepEqual(h.errors,[error,error]);assert.equal(h.session.status,'idle');
 }});
test('one SDK session replaces OpenAI; stop releases it and invalidates callbacks',async()=>{
 const h=harness();await Promise.all([h.session.start(),h.session.start()]);
 assert.equal(h.session.status,'active');assert.equal(h.sdk.connectionType,'webrtc');assert.equal(h.sdk.agentId,undefined);
 assert.equal(h.sdk.overrides.agent.language,'es');assert.equal((await h.call('buscar_viaje',trip)).status,'success');
 h.session.stop();await tick();assert.equal(h.connection.ended,1);h.sdk.onModeChange({mode:'speaking'});assert.equal(h.session.turnStatus,'cancelled');
 assert.equal((await h.call('buscar_viaje',trip)).status,'cancelled');assert.equal(h.searches.length,1);
});
test('stop during token request prevents opening SDK',async()=>{
 const pending=deferred();let opens=0;const h=harness({fetcher:()=>pending.promise,startConversation:async()=>{opens++}});
 const start=h.session.start();await tick();h.session.stop();pending.resolve({ok:true,json:async()=>({token:'fake'})});
 await start;assert.equal(opens,0);assert.equal(h.session.status,'idle');
});
test('late SDK connection after cancellation closes and cannot overlap a new one',async()=>{
 const pending=deferred();let opens=0;const connection={endSession:async()=>{connection.ended++},ended:0,setMicMuted(){},setVolume(){}};
 const h=harness({startConversation:()=>{opens++;return pending.promise}});
 const start=h.session.start();await tick();h.session.stop();await h.session.start();assert.equal(opens,1);
 pending.resolve(connection);await start;await tick();assert.equal(connection.ended,1);assert.equal(h.session.status,'idle');
});
test('microphone failures are sanitized and recover to idle',async()=>{
 for(const [name,error]of[['NotAllowedError','permission'],['NotFoundError','microphone'],['Error','connection']]){
 const h=harness({startConversation:async()=>{const e=new Error('private detail');e.name=name;throw e}});
 await h.session.start();assert.deepEqual(h.errors,[error]);assert.equal(h.session.status,'idle');
 }});
test('server malformed token does not reach the SDK',async()=>{
 const h=harness({fetcher:async()=>({ok:true,json:async()=>({token:''})})});await h.session.start();assert.deepEqual(h.errors,['connection']);assert.equal(h.sdk,undefined);
});
test('maximum duration and startup timeout shut down safely',async()=>{
 const h=harness({sessionTimeoutMs:5});await h.session.start();await new Promise(r=>setTimeout(r,20));assert.equal(h.session.status,'idle');assert.equal(h.connection.ended,1);
 const p=deferred(),t=harness({startupTimeoutMs:5,fetcher:()=>p.promise});const run=t.session.start();
 await new Promise(r=>setTimeout(r,20));assert.deepEqual(t.errors,['timeout']);p.resolve({ok:false,status:503});await run;
});
test('dispose suppresses late callbacks and all future starts',async()=>{
 const h=harness();await h.session.start();h.session.dispose();const count=h.phases.length;
 h.sdk.onError('secret');await h.session.start();assert.equal(h.phases.length,count);assert.deepEqual(h.errors,[]);
});
test('travel arguments reject impossible dates, oversized parties and invalid budgets',()=>{
 for(const change of [{fecha_ida:'2027-02-30'},{fecha_vuelta:'2026-01-01'},{viajeros:10},{presupuesto:-1},{presupuesto:200,tipo_presupuesto:'unknown'},{destino:'x'.repeat(101)}])
 assert.equal(voice.parseVoiceSearchArguments({...trip,...change}),null);
 assert.equal(voice.parseVoiceSearchArguments('{'),null);
 assert.equal(voice.parseVoiceSearchArguments({...trip,presupuesto:500,tipo_presupuesto:'total'}).presupuesto,500);
});

test('error disconnection reports a generic error once and permits retry', async () => {
  const h = harness(); await h.session.start(); const previous = h.sdk;
  previous.onDisconnect({ reason: 'error', message: 'private provider detail' });
  previous.onError('private provider detail'); await tick();
  assert.equal(h.session.status, 'idle'); assert.equal(h.connection.ended, 1);
  assert.deepEqual(h.errors, ['connection']);
  await h.session.start(); previous.onDisconnect({ reason: 'error' });
  assert.equal(h.session.status, 'active'); assert.deepEqual(h.errors, ['connection']);
  h.session.stop(); await tick();
});
test('normal disconnection and callbacks after Stop remain silent', async () => {
  for (const reason of ['agent', 'user']) {
    const h = harness(); await h.session.start(); h.sdk.onDisconnect({ reason }); await tick();
    assert.equal(h.session.status, 'idle'); assert.equal(h.connection.ended, 1); assert.deepEqual(h.errors, []);
  }
  const h = harness(); await h.session.start(); h.session.stop();
  h.sdk.onDisconnect({ reason: 'error', message: 'late private detail' }); await tick();
  assert.equal(h.connection.ended, 1); assert.deepEqual(h.errors, []);
});
test('startup error disconnection prevents activation and closes late connection', async () => {
  const pending = deferred(); let sdk;
  const connection = { ended: 0, endSession: async () => { connection.ended++; }, setMicMuted() {}, setVolume() {} };
  const h = harness({ startConversation: options => { sdk = options; return pending.promise; } });
  const start = h.session.start(); await tick();
  sdk.onDisconnect({ reason: 'error', message: 'private startup detail' });
  assert.equal(h.session.status, 'idle'); assert.deepEqual(h.errors, ['connection']);
  pending.resolve(connection); await start; await tick();
  assert.equal(connection.ended, 1); assert(!h.phases.includes('active'));
});
