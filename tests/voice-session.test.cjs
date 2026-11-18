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

test('uses the configured agent greeting without a first-message override in every locale',async()=>{
 for(const locale of ['es','en','fr','de','it','pt','ca']){
  const h=harness({getLocale:()=>locale});
  try {
   await h.session.start();
   assert.equal(h.session.status,'active');
   assert.equal(Object.hasOwn(h.sdk.overrides.agent,'firstMessage'),false);
   assert.equal(h.sdk.overrides.agent.language,locale);
  } finally { h.session.stop(); }
 }
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

// ---- Weekly voice minutes: what the browser does with the server's answer ----------------------------------------------------
const {loader}=require('./sofia-harness.cjs');
const ref='u_'+'0123456789abcdef'.repeat(2);
const grant=(extra={})=>({ok:true,json:async()=>({token:'fake-session-token',userRef:ref,sessionSeconds:600,remainingSeconds:600,limitSeconds:600,period:'month',resetsAt:1795000000,...extra})});

test('429 tells apart the weekly minutes of the account, of the whole site and too many attempts in a row',async()=>{
 for(const [body,error] of [[{error:'ai_minutes_limit',resetsAt:1795000000},'minutesLimit'],[{error:'ai_site_weekly_limit',resetsAt:1795000000},'siteWeeklyLimit'],
  [{error:'ai_rate_limited'},'limited'],[{error:'something-else'},'limited'],[null,'limited'],['junk','limited'],[{error:{nested:true}},'limited']]){
  let opened=0;
  const h=harness({fetcher:async()=>({ok:false,status:429,json:async()=>{if(body===null)throw Error('no body');return body}}),startConversation:async()=>{opened++}});
  await h.session.start();assert.equal(opened,0,JSON.stringify(body));assert.deepEqual(h.errors,[error],JSON.stringify(body));assert.equal(h.session.status,'idle');
  await h.session.start();assert.deepEqual(h.errors,[error,error],'the visitor can try again');
 }
 for(const [status,error] of [[503,'unavailable'],[500,'connection'],[401,'connection']]){
  const h=harness({fetcher:async()=>({ok:false,status,json:async()=>({error:'ai_minutes_limit'})})});
  await h.session.start();assert.deepEqual(h.errors,[error],String(status));
 }
});

test('the SDK receives the anonymous account reference so ElevenLabs can add up the minutes, and only in the exact format',async()=>{
 const h=harness({fetcher:async()=>grant()});
 try{await h.session.start();assert.equal(h.sdk.userId,ref);assert.equal(h.sdk.conversationToken,'fake-session-token');}finally{h.session.stop();await tick();}
 for(const userRef of [undefined,null,'',123,'u_short','U_'+'0'.repeat(32),'u_'+'g'.repeat(32),ref+'x','11111111-2222-4333-8444-555555555555',{ref}]){
  const g=harness({fetcher:async()=>grant({userRef})});
  try{await g.session.start();assert.equal(Object.hasOwn(g.sdk,'userId'),false,String(userRef));assert.equal(g.session.status,'active');}finally{g.session.stop();await tick();}
 }
});

test('the conversation lasts what the server granted: what is left of the week, never over 15 minutes, 6 minutes if the server says nothing',async()=>{
 const timers=[];
 const api=loader({setTimeout:(fn,ms)=>{timers.push(ms);return timers.length},clearTimeout(){}})('lib/voice/session.ts');
 const run=async(answer)=>{
  timers.length=0;let sdk;
  const connection={endSession:async()=>{},setMicMuted(){},setVolume(){}};
  const session=new api.VoiceSession({preflight:async()=>{},onPhase(){},onError(){},onSearch:async()=>({status:'success'}),fetcher:async()=>answer,
   now:()=>new Date('2026-11-16T12:00:00Z'),startConversation:async options=>{sdk=options;return connection}});
  await session.start();session.stop();
  // The wrapper and the provider session each arm the same cut-off; the start-up guard (20 s) is not one of them.
  return [...new Set(timers.filter(ms=>ms!==20000))];
 };
 assert.deepEqual(await run(grant({sessionSeconds:180})),[180000],'3 minutes left: 3 minutes');
 assert.deepEqual(await run(grant({sessionSeconds:30})),[30000]);
 assert.deepEqual(await run(grant({sessionSeconds:900})),[900000]);
 assert.deepEqual(await run(grant({sessionSeconds:5000})),[900000],'never more than the 15-minute maximum');
 for(const sessionSeconds of [undefined,0,-5,1.5,'600',null,NaN])assert.deepEqual(await run(grant({sessionSeconds})),[360000],String(sessionSeconds));
});

test('the cut-off ends the real conversation: microphone muted and the provider session closed',async()=>{
 const h=harness({sessionTimeoutMs:5,fetcher:async()=>grant({sessionSeconds:600})});
 await h.session.start();assert.equal(h.session.status,'active');
 await new Promise(r=>setTimeout(r,25));assert.equal(h.session.status,'idle');assert.equal(h.connection.ended,1);assert.ok(h.mutes.includes(true));
});
