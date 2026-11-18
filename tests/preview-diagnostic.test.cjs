const {test}=require('node:test'),assert=require('node:assert/strict');
const {loader}=require('./sofia-harness.cjs');
const env={VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'codex/sofia-elevenlabs',AI_ENABLED:'true',AI_VOICE_ENABLED:'true',VERCEL:'1',AI_REDIS_REST_URL:'https://private-canary.upstash.io',AI_REDIS_REST_TOKEN:'redis-canary',AI_RATE_LIMIT_SECRET:'secret-canary'.repeat(4)};
const verifiedVoiceAuth={verifyVoiceUser:async()=>({userId:'11111111-2222-4333-8444-555555555555'})};
const request=()=>new Request('https://private-host.test/api/voice',{method:'POST',headers:{'x-vercel-forwarded-for':'192.0.2.123'},body:'{}'});
function harness(change={},fetcher=async()=>{throw Error('secret-canary redis-canary private-canary 192.0.2.123')}){const logs=[];const load=loader({process:{env:{...env,...change}},console:{warn:(...x)=>logs.push(x)},fetch:fetcher},{'@/lib/supabase/voice-auth':verifiedVoiceAuth});return{load,logs};}
test('logging is restricted to exact preview branch and rejects arbitrary runtime values',()=>{
 for(const change of [{VERCEL_ENV:'production'},{VERCEL_ENV:'development'},{VERCEL_GIT_COMMIT_REF:'main'},{VERCEL_GIT_COMMIT_REF:undefined}]){const h=harness(change);h.load('lib/ai/preview-diagnostic.ts').previewDiagnostic('VOICE_FLAGS');assert.deepEqual(h.logs,[])}
 const h=harness(),log=h.load('lib/ai/preview-diagnostic.ts').previewDiagnostic;log('secret-canary');log({token:'secret-canary'});assert.deepEqual(h.logs,[]);log('VOICE_FLAGS');assert.deepEqual(h.logs,[['SOFIA_DIAGNOSTIC','VOICE_FLAGS']]);
});
test('production logs only constant codes, and only for the real main deployment of this repository',()=>{
 const production={VERCEL:'1',VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'main',VERCEL_GIT_REPO_OWNER:'tosca201098-jpg',VERCEL_GIT_REPO_SLUG:'el-viajero-web'};
 // The exact production scope logs the constant code and nothing else.
 const h=harness(production),log=h.load('lib/ai/preview-diagnostic.ts').previewDiagnostic;
 log('VOICE_VERSION');log('secret-canary');log({token:'secret-canary'});
 assert.deepEqual(h.logs,[['SOFIA_DIAGNOSTIC','VOICE_VERSION']]);
 // Any other production-like scope stays silent.
 for(const change of [{VERCEL:undefined},{VERCEL_GIT_COMMIT_REF:'otra-rama'},{VERCEL_GIT_REPO_OWNER:'otro-propietario'},{VERCEL_GIT_REPO_SLUG:'otro-repositorio'},{VERCEL_GIT_COMMIT_REF:undefined},{VERCEL_ENV:'development'}]){
  const quiet=harness({...production,...change});quiet.load('lib/ai/preview-diagnostic.ts').previewDiagnostic('VOICE_FLAGS');assert.deepEqual(quiet.logs,[],JSON.stringify(change));
 }
});
test('a refused agent configuration names the failed checks, with parity to the route decision and without any value',()=>{
 const source=require('fs').readFileSync(require('path').join(__dirname,'voice-route.test.cjs'),'utf8');
 const valid=new Function(source.slice(source.indexOf('function valid('),source.indexOf('function route('))+';return valid;')();
 const h=harness();const {sofiaConfigurationFailures:failures}=h.load('lib/voice/config-failures.ts');
 const {safeSofiaConfiguration:safe}=h.load('lib/voice/provider-config.ts');
 // The accepted agent has no failed check, in Production and in Preview.
 for(const preview of [false,true]){assert.deepEqual(Array.from(failures(valid(preview?360:300),preview)),[]);assert.equal(safe(valid(preview?360:300),preview),true)}
 const mutations=[
  ['enable_auth',c=>{c.platform_settings.auth.enable_auth=false}],['queueing',c=>{c.platform_settings.queueing_config.enabled=true}],
  ['voice_id',c=>{c.conversation_config.tts.voice_id='otra'}],['language',c=>{c.conversation_config.agent.language='en'}],
  ['max_duration_seconds',c=>{c.conversation_config.conversation.max_duration_seconds=600}],
  ['silence_end_call_timeout',c=>{c.conversation_config.turn.silence_end_call_timeout=30}],
  ['background_voice_detection',c=>{c.conversation_config.vad.background_voice_detection=false}],
  ['max_tokens',c=>{c.conversation_config.agent.prompt.max_tokens=5000}],
  ['override_language',c=>{c.platform_settings.overrides.conversation_config_override.agent.language=false}],
  ['override_first_message',c=>{c.platform_settings.overrides.conversation_config_override.agent.first_message=false}],
  ['override_prompt',c=>{c.platform_settings.overrides.conversation_config_override.agent.prompt={prompt:true}}],
  ['override_llm',c=>{c.platform_settings.overrides.conversation_config_override.agent.prompt={llm:true}}],
  ['override_voice',c=>{c.platform_settings.overrides.conversation_config_override.tts={voice_id:true}}],
  ['override_max_duration',c=>{c.platform_settings.overrides.conversation_config_override.conversation={max_duration_seconds:true}}],
  ['override_tool_ids',c=>{c.platform_settings.overrides.conversation_config_override.agent.prompt={tool_ids:true}}],
  ['agent_concurrency_limit',c=>{c.platform_settings.call_limits.agent_concurrency_limit=-1}],
  ['daily_limit',c=>{c.platform_settings.call_limits.daily_limit=100000}],['bursting',c=>{c.platform_settings.call_limits.bursting_enabled=true}],
  ['tool_buscar_viaje',c=>{c.conversation_config.agent.prompt.tools=c.conversation_config.agent.prompt.tools.filter(t=>t.name!=='buscar_viaje')}],
  ['tool_crear_itinerario',c=>{c.conversation_config.agent.prompt.tools.find(t=>t.name==='crear_itinerario').expects_response=false}],
  ['tool_consultar_catalogo',c=>{c.conversation_config.agent.prompt.tools.find(t=>t.name==='consultar_catalogo').type='webhook'}],
  ['tool_mostrar_destino',c=>{c.conversation_config.agent.prompt.tools=[]}],
 ];
 for(const [name,mutate] of mutations){
  const config=JSON.parse(JSON.stringify(valid(300)));mutate(config);
  const failed=failures(config,false);
  assert.equal(failed.includes(name),true,name);assert.equal(safe(config,false),false,name);
 }
 // Anything unreadable yields a list of constant names or nothing; it never throws.
 for(const weird of [null,undefined,{},[],'x',{conversation_config:null,platform_settings:5}]){const out=failures(weird,false);assert(Array.isArray(out));for(const n of out)assert.match(n,/^[a-z_]+$/)}
});

test('the detail line only accepts names from the closed list, and only in the diagnostic scope',()=>{
 const production={VERCEL:'1',VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'main',VERCEL_GIT_REPO_OWNER:'tosca201098-jpg',VERCEL_GIT_REPO_SLUG:'el-viajero-web'};
 const h=harness(production),detail=h.load('lib/ai/preview-diagnostic.ts').previewDiagnosticDetail;
 detail(['daily_limit','secret-canary','tool_buscar_viaje']);detail(['secret-canary']);detail([]);
 assert.deepEqual(h.logs,[['SOFIA_DIAGNOSTIC_DETAIL','daily_limit,tool_buscar_viaje']]);
 const quiet=harness({...production,VERCEL_GIT_COMMIT_REF:'otra-rama'});quiet.load('lib/ai/preview-diagnostic.ts').previewDiagnosticDetail(['daily_limit']);assert.deepEqual(quiet.logs,[]);
});
test('admission failures are discriminated without leaking private request or backend data',async()=>{
 const cases=[[{AI_ENABLED:'false'},null,'ADMISSION_FLAGS'],[{AI_REDIS_REST_TOKEN:''},null,'ADMISSION_REDIS_CONFIG'],[{},async()=>Response.json({private:'redis-canary'},{status:403}),'ADMISSION_REDIS_HTTP'],[{},async()=>Response.json({error:'redis-canary'}),'ADMISSION_REDIS_MALFORMED'],[{},async()=>new Response('secret-canary'),'ADMISSION_REDIS_MALFORMED'],[{},undefined,'ADMISSION_REDIS_NETWORK']];
 for(const [change,fetcher,code] of cases){const h=harness(change,fetcher);const res=await h.load('lib/ai/admission.ts').admitAiRequest(request(),'voice');assert.equal(res.status,503);assert.deepEqual(await res.json(),{error:'ai_unavailable'});assert.deepEqual(h.logs,[['SOFIA_DIAGNOSTIC',code]])}
 const h=harness();await h.load('lib/ai/admission.ts').admitAiRequest(new Request('https://private-host.test',{headers:{origin:'https://private-origin.test'}}),'voice');assert.deepEqual(h.logs,[['SOFIA_DIAGNOSTIC','ADMISSION_ORIGIN']]);
});
test('provider check and token failures keep public response generic and log constant codes only',async()=>{
 // A safe fixture is taken from the existing route suite to keep the same security contract.
 const source=require('fs').readFileSync(require('path').join(__dirname,'voice-route.test.cjs'),'utf8');
 const valid=new Function(source.slice(source.indexOf('function valid('),source.indexOf('function route('))+';return valid;')();
 const cases=[['VOICE_CREDENTIALS',{ELEVENLABS_API_KEY:''},[]],['VOICE_VERSION',{ELEVENLABS_AGENT_VERSION_ID:''},[]],['VOICE_CHECK_CREDENTIALS',{},[Response.json({secret:'canary'},{status:401})]],['VOICE_CHECK_HTTP',{},[new Response('canary',{status:503})]],['VOICE_CHECK_MALFORMED',{},[new Response('canary')]],['VOICE_CHECK_CONFIG',{},[Response.json({})]],['VOICE_TOKEN_CREDENTIALS',{},[Response.json(valid(300)),new Response('canary',{status:403})]],['VOICE_TOKEN_HTTP',{},[Response.json(valid(300)),new Response('canary',{status:500})]],['VOICE_TOKEN_MALFORMED',{},[Response.json(valid(300)),Response.json({private:'canary'})]],['VOICE_TOKEN_NETWORK',{},[Response.json(valid(300))]],['VOICE_CHECK_NETWORK',{},[]]];
 for(const [code,change,responses] of cases){const logs=[];let calls=0;const load=loader({process:{env:{...env,ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'key-canary',ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_canary',...change}},console:{warn:(...x)=>logs.push(x)},fetch:async()=>{calls++;if(!responses.length)throw Error('key-canary private-session private-provider');return responses.shift()}},{'@/lib/supabase/voice-auth':verifiedVoiceAuth,'@/lib/ai/admission':{admitAiRequest:async()=>null,voiceUserReference:()=>'u_'+'a'.repeat(32)},'@/lib/voice/voice-minutes':{BudgetError:class extends Error{},checkVoiceBudget:async()=>({ok:true,sessionSeconds:600,remainingSeconds:600,limitSeconds:600,period:'month',resetsAt:1795000000})}});const res=await load('app/api/voice/route.ts').POST(request());assert.equal(res.status,503);assert.deepEqual(await res.json(),{error:'ai_unavailable'});assert.deepEqual(logs[0],['SOFIA_DIAGNOSTIC',code]);if(code==='VOICE_CHECK_CONFIG'){assert.equal(logs.length,2);assert.equal(logs[1][0],'SOFIA_DIAGNOSTIC_DETAIL');assert.match(logs[1][1],/^[a-z_]+(,[a-z_]+)*$/);assert.equal(JSON.stringify(logs).includes('canary'),false)}else assert.equal(logs.length,1);assert(calls<=2)}
});

test('timeouts are attributed by active stage without logging thrown objects',async()=>{
 const signal={aborted:true};const AbortSignal={timeout:()=>signal};
 for(const mode of ['redis','check','token']){
  const logs=[];let calls=0;
  const source=require('fs').readFileSync(require('path').join(__dirname,'voice-route.test.cjs'),'utf8');
  const valid=new Function(source.slice(source.indexOf('function valid('),source.indexOf('function route('))+';return valid;')();
  const load=loader({AbortSignal,process:{env:{...env,ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'canary',ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_canary'}},console:{warn:(...x)=>logs.push(x)},fetch:async()=>{if(mode==='token'&&++calls===1)return Response.json(valid(300));throw {secret:'canary',stack:'private-stack'};}},{'@/lib/supabase/voice-auth':verifiedVoiceAuth,'@/lib/ai/admission':{admitAiRequest:async()=>null,voiceUserReference:()=>'u_'+'a'.repeat(32)},'@/lib/voice/voice-minutes':{BudgetError:class extends Error{},checkVoiceBudget:async()=>({ok:true,sessionSeconds:600,remainingSeconds:600,limitSeconds:600,period:'month',resetsAt:1795000000})}});
  const res=mode==='redis'?await load('lib/ai/admission.ts').admitAiRequest(request(),'voice'):await load('app/api/voice/route.ts').POST(request());
  assert.equal(res.status,503);assert.deepEqual(logs,[['SOFIA_DIAGNOSTIC',mode==='redis'?'ADMISSION_REDIS_TIMEOUT':mode==='check'?'VOICE_CHECK_TIMEOUT':'VOICE_TOKEN_TIMEOUT']]);
 }
});

test('voice-minutes failures and denials log only constant codes and never leak provider data',async()=>{
 const now=Math.floor(Date.now()/1000);
 const source=require('fs').readFileSync(require('path').join(__dirname,'voice-route.test.cjs'),'utf8');
 const valid=new Function(source.slice(source.indexOf('function valid('),source.indexOf('function route('))+';return valid;')();
 // The agent is verified first (its maximum length is what running conversations reserve); only the minutes lists fail or deny.
 const agentOk=(url,answer)=>url.pathname.includes('/convai/agents/')?Response.json({...valid(300),agent_id:url.pathname.split('/').pop(),version_id:url.searchParams.get('version_id')}):answer(url);
 const spent=seconds=>Response.json({conversations:[{conversation_id:'c',start_time_unix_secs:now-60,call_duration_secs:seconds,status:'done'}],has_more:false});
 const cases=[
  ['VOICE_BUDGET_CREDENTIALS',503,()=>new Response('private-provider',{status:401})],
  ['VOICE_BUDGET_HTTP',503,()=>new Response('private-provider',{status:500})],
  ['VOICE_BUDGET_MALFORMED',503,()=>Response.json({private:'canary'})],
  ['VOICE_BUDGET_NETWORK',503,()=>{throw Error('private-network canary')}],
  ['VOICE_BUDGET_USER',429,url=>spent(url.searchParams.has('user_id')?1200:600)],
  ['VOICE_BUDGET_SITE',429,url=>spent(url.searchParams.has('user_id')?0:900)],
 ];
 for(const [code,status,answer] of cases){
  const logs=[];let calls=0;
  const load=loader({process:{env:{...env,ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'key-canary',ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_canary'}},console:{warn:(...x)=>logs.push(x)},
   fetch:async url=>{calls++;return agentOk(new URL(String(url)),answer);}},
   {'@/lib/supabase/voice-auth':verifiedVoiceAuth,'@/lib/ai/admission':{admitAiRequest:async()=>null,voiceUserReference:()=>'u_'+'a'.repeat(32)}});
  const res=await load('app/api/voice/route.ts').POST(request());
  assert.equal(res.status,status,code);const text=await res.text();
  for(const secret of ['private','canary','key-canary'])assert.equal(text.includes(secret),false,code);
  assert.deepEqual(logs,[['SOFIA_DIAGNOSTIC',code]]);assert.equal(calls<=3,true);
 }
});
