const {test}=require('node:test'),assert=require('node:assert/strict');
const {loader}=require('./sofia-harness.cjs');
function valid(duration=360){return{agent_id:'agent_2201m677yj19e6499g2649n774f6',version_id:'agtvrsn_0601m7jz66wvf83ambtr3s819vfv',conversation_config:{agent:{language:'es',prompt:{max_tokens:1024,tools:['buscar_viaje','crear_itinerario','consultar_catalogo','mostrar_destino'].map(name=>({name,type:'client',expects_response:true}))}},tts:{voice_id:'eZxqQzb5CuYo3Kl6EXfZ'},turn:{silence_end_call_timeout:90},vad:{background_voice_detection:true},conversation:{max_duration_seconds:duration}},platform_settings:{auth:{enable_auth:true},queueing_config:{enabled:false},call_limits:{agent_concurrency_limit:1,daily_limit:duration===360?100000:15,bursting_enabled:false},overrides:{conversation_config_override:{agent:{language:true,first_message:true,prompt:{prompt:false,llm:false}},tts:{voice_id:false}}}}}}
const USER_REF='u_'+'a'.repeat(32),RESETS=1795000000;
class BudgetError extends Error{constructor(code){super('voice_budget');this.code=code}}
function route(config=valid(),env={},deny=null,options={}){
 const requests=[],budgets=[],events=[];
 const api=loader({process:{env:{VERCEL:'1',VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'codex/sofia-elevenlabs',VERCEL_GIT_REPO_OWNER:'tosca201098-jpg',VERCEL_GIT_REPO_SLUG:'el-viajero-web',AI_ENABLED:'true',AI_VOICE_ENABLED:'true',ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'fake-key',ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_0601m7jz66wvf83ambtr3s819vfv',...env}},fetch:async(url,init)=>{
 requests.push({url:String(url),options:init});events.push(requests.length===1?'configuration':'provider-token');
 if(options.fetcher)return options.fetcher(url,init,requests.length);
 return Response.json(requests.length===1?config:{token:'temporary-token',private:'must-not-leak'});
 }},{'@/lib/ai/admission':{admitAiRequest:async()=>{events.push('reserve');return deny;},voiceUserReference:()=>'userRef' in options?options.userRef:USER_REF},
 '@/lib/voice/weekly-minutes':{BudgetError,checkWeeklyBudget:async input=>{events.push('budget');budgets.push(input);
  if(options.budgetError)throw options.budgetError;
  return options.budget??{ok:true,sessionSeconds:600,weekSeconds:600,limitSeconds:600,resetsAt:RESETS};}}})('app/api/voice/route.ts');
 return{...api,requests,budgets,events};
}
const req=(body)=>new Request('https://preview.test/api/voice',{method:'POST',body:typeof body==='string'?body:JSON.stringify(body)});
test('all seven locales get only a temporary token from the pinned private Sofía version',async()=>{
 for(const locale of ['es','en','fr','de','it','pt','ca']){
 const r=route(),response=await r.POST(req({locale}));assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{token:'temporary-token',userRef:USER_REF,sessionSeconds:600,weekSeconds:600,limitSeconds:600,resetsAt:RESETS});assert.equal(response.headers.get('cache-control'),'no-store');
 assert.equal(r.requests.length,2);assert.ok(r.requests.every(r=>r.url.includes('version_id=agtvrsn_0601m7jz66wvf83ambtr3s819vfv')));
 assert.ok(r.requests.every(r=>r.url.startsWith('https://api.elevenlabs.io/')));assert.equal(r.requests[1].options.headers['xi-api-key'],'fake-key');
 assert.deepEqual(r.events,['reserve','budget','configuration','provider-token']);
 }});
test('invalid input is rejected before any provider call',async()=>{
 for(const body of ['{','x'.repeat(513),{locale:'xx'},[]]){const r=route(),res=await r.POST(req(body));assert.equal(res.status,400);assert.equal(r.requests.length,0)}
});
test('missing credentials/version, disabled voice and unapproved production remain unavailable',async()=>{
 for(const env of [{ELEVENLABS_API_KEY:''},{ELEVENLABS_AGENT_VERSION_ID:''},{ELEVENLABS_ENABLED:'false'},{VERCEL_ENV:'production'}]){
 const r=route(valid(),env),res=await r.POST(req({locale:'es'}));assert.equal(res.status,503);assert.equal(r.requests.length,0)
 }});
test('quota denial never reaches ElevenLabs',async()=>{
 const r=route(valid(),{},Response.json({error:'limited'},{status:429}));assert.equal((await r.POST(req({}))).status,429);assert.equal(r.requests.length,0);
});
test('unsafe provider settings block token issuance including wrong voice and weak timeouts',async()=>{
 const changes=[
 c=>c.platform_settings.auth.enable_auth=false,c=>c.conversation_config.tts.voice_id='other',
 c=>c.conversation_config.conversation.max_duration_seconds=600,c=>c.conversation_config.turn.silence_end_call_timeout=-1,
 c=>c.conversation_config.vad.background_voice_detection=false,c=>c.conversation_config.agent.prompt.max_tokens=-1,
 c=>c.platform_settings.overrides.conversation_config_override.agent.prompt.prompt=true,
 c=>c.conversation_config.agent.prompt.tools.pop(),
 c=>c.platform_settings.overrides.conversation_config_override.conversation={max_duration_seconds:true},
 c=>c.platform_settings.call_limits.bursting_enabled=true,
 c=>c.platform_settings.call_limits.daily_limit=100001,
 c=>c.platform_settings.call_limits.daily_limit=0,
 c=>c.platform_settings.call_limits.daily_limit=1.5,
 c=>c.platform_settings.call_limits.daily_limit='100000',
 ];
 for(const change of changes){const c=valid();change(c);const r=route(c);assert.equal((await r.POST(req({}))).status,503);assert.equal(r.requests.length,1)}
});

test('queue disabled explicitly permits a token for a safe agent',async()=>{
 const r=route(),res=await r.POST(req({locale:'es'}));assert.equal(res.status,200);assert.equal(r.requests.length,2);
});
test('queue enabled denies token issuance after the agent check',async()=>{
 const c=valid();c.platform_settings.queueing_config.enabled=true;
 const r=route(c),res=await r.POST(req({locale:'es'}));assert.equal(res.status,503);assert.equal(r.requests.length,1);
});
test('missing queue configuration denies token issuance after the agent check',async()=>{
 const c=valid();delete c.platform_settings.queueing_config;
 const r=route(c),res=await r.POST(req({locale:'es'}));assert.equal(res.status,503);assert.equal(r.requests.length,1);
});

test('known provider and security failures return a generic error and never a token',async()=>{
 const unsafe=valid();unsafe.platform_settings.queueing_config.enabled=true;
 const cases=[route(unsafe),route(valid(),{},null,{fetcher:async()=>new Response('private-provider-details',{status:503})}),
  route(valid(),{},null,{fetcher:async(_url,_init,n)=>n===1?Response.json(valid()):Response.json({private:'malformed-token'})})];
 for(const h of cases){const response=await h.POST(req({locale:'es'}));assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'ai_unavailable'});}
});

test('the weekly budget is asked with the verified account reference, the pinned agent and the current instant, before any provider call',async()=>{
 const r=route(),before=Date.now();await r.POST(req({locale:'es'}));
 assert.equal(r.budgets.length,1);const [input]=r.budgets;
 assert.equal(input.apiKey,'fake-key');assert.equal(input.agentId,'agent_2201m677yj19e6499g2649n774f6');assert.equal(input.userRef,USER_REF);
 assert.ok(input.now>=before&&input.now<=Date.now());assert.equal(input.env.AI_ENABLED,'true');
 assert.equal(r.events.indexOf('budget')<r.events.indexOf('configuration'),true);
});

test('a spent account or a spent site gets a 429 with the reason and the renewal instant, and the provider is never called again',async()=>{
 for(const [reason,error] of [['user','ai_weekly_limit'],['site','ai_site_weekly_limit']]){
  const r=route(valid(),{},null,{budget:{ok:false,reason,resetsAt:Math.floor(Date.now()/1000)+3600}});
  const response=await r.POST(req({locale:'es'}));assert.equal(response.status,429);
  const body=await response.json();assert.deepEqual(Object.keys(body).sort(),['error','resetsAt']);assert.equal(body.error,error);
  assert.equal(response.headers.get('cache-control'),'no-store');assert.ok(Number(response.headers.get('retry-after'))>=3599&&Number(response.headers.get('retry-after'))<=3600);
  assert.equal(r.requests.length,0);assert.deepEqual(r.events,['reserve','budget']);
 }
 const far=route(valid(),{},null,{budget:{ok:false,reason:'user',resetsAt:Math.floor(Date.now()/1000)+10**8}});
 assert.equal((await (await far.POST(req({}))).headers.get('retry-after')),'691200');
 const past=route(valid(),{},null,{budget:{ok:false,reason:'user',resetsAt:1}});
 assert.equal(await (await past.POST(req({}))).headers.get('retry-after'),'1');
});

test('a budget that cannot be read fails closed with a generic 503: no token, no provider detail',async()=>{
 for(const error of [new BudgetError('VOICE_BUDGET_HTTP'),new BudgetError('VOICE_BUDGET_CONFIG'),Error('private-store-detail')]){
  const r=route(valid(),{},null,{budgetError:error}),response=await r.POST(req({locale:'es'}));
  assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'ai_unavailable'});assert.equal(r.requests.length,0);
 }
 const noUser=route(valid(),{},null,{userRef:undefined});assert.equal((await noUser.POST(req({}))).status,503);
 assert.equal(noUser.budgets.length,0);assert.equal(noUser.requests.length,0);
});

test('the conversation length comes from the budget: what is left of the week, never more than the agent maximum',async()=>{
 const r=route(valid(),{},null,{budget:{ok:true,sessionSeconds:180,weekSeconds:180,limitSeconds:600,resetsAt:RESETS}});
 const body=await (await r.POST(req({locale:'es'}))).json();assert.equal(body.sessionSeconds,180);assert.equal(body.weekSeconds,180);assert.equal(body.limitSeconds,600);
 assert.equal(JSON.stringify(body).includes('must-not-leak'),false);
});

test('15-minute and 6-minute versions are accepted in Preview, and 5-minute ones only in Production; anything else is rejected',async()=>{
 for(const duration of [900,360]){const c=valid(duration);const r=route(c);assert.equal((await r.POST(req({}))).status,200,String(duration))}
 for(const duration of [300,420,899,901,1800]){const c=valid(360);c.conversation_config.conversation.max_duration_seconds=duration;const r=route(c);assert.equal((await r.POST(req({}))).status,503,String(duration))}
});
