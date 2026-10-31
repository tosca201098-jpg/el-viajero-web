const {test}=require('node:test'),assert=require('node:assert/strict');
const {loader}=require('./sofia-harness.cjs');
const env={VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'codex/sofia-elevenlabs',AI_ENABLED:'true',AI_VOICE_ENABLED:'true',VERCEL:'1',AI_REDIS_REST_URL:'https://private-canary.upstash.io',AI_REDIS_REST_TOKEN:'redis-canary',AI_RATE_LIMIT_SECRET:'secret-canary'.repeat(4)};
const request=()=>new Request('https://private-host.test/api/voice',{method:'POST',headers:{'x-vercel-forwarded-for':'192.0.2.123'},body:'{}'});
function harness(change={},fetcher=async()=>{throw Error('secret-canary redis-canary private-canary 192.0.2.123')}){const logs=[];const load=loader({process:{env:{...env,...change}},console:{warn:(...x)=>logs.push(x)},fetch:fetcher});return{load,logs};}
test('logging is restricted to exact preview branch and rejects arbitrary runtime values',()=>{
 for(const change of [{VERCEL_ENV:'production'},{VERCEL_ENV:'development'},{VERCEL_GIT_COMMIT_REF:'main'},{VERCEL_GIT_COMMIT_REF:undefined}]){const h=harness(change);h.load('lib/ai/preview-diagnostic.ts').previewDiagnostic('VOICE_FLAGS');assert.deepEqual(h.logs,[])}
 const h=harness(),log=h.load('lib/ai/preview-diagnostic.ts').previewDiagnostic;log('secret-canary');log({token:'secret-canary'});assert.deepEqual(h.logs,[]);log('VOICE_FLAGS');assert.deepEqual(h.logs,[['SOFIA_DIAGNOSTIC','VOICE_FLAGS']]);
});
test('admission failures are discriminated without leaking private request or backend data',async()=>{
 const cases=[[{AI_ENABLED:'false'},null,'ADMISSION_FLAGS'],[{AI_REDIS_REST_TOKEN:''},null,'ADMISSION_REDIS_CONFIG'],[{},async()=>Response.json({private:'redis-canary'},{status:403}),'ADMISSION_REDIS_HTTP'],[{},async()=>Response.json({error:'redis-canary'}),'ADMISSION_REDIS_MALFORMED'],[{},async()=>new Response('secret-canary'),'ADMISSION_REDIS_MALFORMED'],[{},undefined,'ADMISSION_REDIS_NETWORK']];
 for(const [change,fetcher,code] of cases){const h=harness(change,fetcher);const res=await h.load('lib/ai/admission.ts').admitAiRequest(request(),'voice');assert.equal(res.status,503);assert.deepEqual(await res.json(),{error:'ai_unavailable'});assert.deepEqual(h.logs,[['SOFIA_DIAGNOSTIC',code]])}
 const h=harness();await h.load('lib/ai/admission.ts').admitAiRequest(new Request('https://private-host.test',{headers:{origin:'https://private-origin.test'}}),'voice');assert.deepEqual(h.logs,[['SOFIA_DIAGNOSTIC','ADMISSION_ORIGIN']]);
});
test('provider check and token failures keep public response generic and log constant codes only',async()=>{
 // A safe fixture is taken from the existing route suite to keep the same security contract.
 const source=require('fs').readFileSync(require('path').join(__dirname,'voice-route.test.cjs'),'utf8');
 const valid=new Function(source.slice(source.indexOf('function valid()'),source.indexOf('function route('))+';return valid;')();
 const cases=[['VOICE_CREDENTIALS',{ELEVENLABS_API_KEY:''},[]],['VOICE_VERSION',{ELEVENLABS_AGENT_VERSION_ID:''},[]],['VOICE_CHECK_CREDENTIALS',{},[Response.json({secret:'canary'},{status:401})]],['VOICE_CHECK_HTTP',{},[new Response('canary',{status:503})]],['VOICE_CHECK_MALFORMED',{},[new Response('canary')]],['VOICE_CHECK_CONFIG',{},[Response.json({})]],['VOICE_TOKEN_CREDENTIALS',{},[Response.json(valid()),new Response('canary',{status:403})]],['VOICE_TOKEN_HTTP',{},[Response.json(valid()),new Response('canary',{status:500})]],['VOICE_TOKEN_MALFORMED',{},[Response.json(valid()),Response.json({private:'canary'})]],['VOICE_TOKEN_NETWORK',{},[Response.json(valid())]],['VOICE_CHECK_NETWORK',{},[]]];
 for(const [code,change,responses] of cases){const logs=[];let calls=0;const load=loader({process:{env:{...env,ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'key-canary',ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_canary',...change}},console:{warn:(...x)=>logs.push(x)},fetch:async()=>{calls++;if(!responses.length)throw Error('key-canary private-session private-provider');return responses.shift()}},{'@/lib/ai/admission':{admitAiRequest:async()=>null}});const res=await load('app/api/voice/route.ts').POST(request());assert.equal(res.status,503);assert.deepEqual(await res.json(),{error:'ai_unavailable'});assert.deepEqual(logs,[['SOFIA_DIAGNOSTIC',code]]);assert(calls<=2)}
});

test('timeouts are attributed by active stage without logging thrown objects',async()=>{
 const signal={aborted:true};const AbortSignal={timeout:()=>signal};
 for(const mode of ['redis','check','token']){
  const logs=[];let calls=0;
  const source=require('fs').readFileSync(require('path').join(__dirname,'voice-route.test.cjs'),'utf8');
  const valid=new Function(source.slice(source.indexOf('function valid()'),source.indexOf('function route('))+';return valid;')();
  const load=loader({AbortSignal,process:{env:{...env,ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'canary',ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_canary'}},console:{warn:(...x)=>logs.push(x)},fetch:async()=>{if(mode==='token'&&++calls===1)return Response.json(valid());throw {secret:'canary',stack:'private-stack'};}},{'@/lib/ai/admission':{admitAiRequest:async()=>null}});
  const res=mode==='redis'?await load('lib/ai/admission.ts').admitAiRequest(request(),'voice'):await load('app/api/voice/route.ts').POST(request());
  assert.equal(res.status,503);assert.deepEqual(logs,[['SOFIA_DIAGNOSTIC',mode==='redis'?'ADMISSION_REDIS_TIMEOUT':mode==='check'?'VOICE_CHECK_TIMEOUT':'VOICE_TOKEN_TIMEOUT']]);
 }
});
