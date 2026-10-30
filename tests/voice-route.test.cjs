const {test}=require('node:test'),assert=require('node:assert/strict');
const {loader}=require('./sofia-harness.cjs');
function valid(){return{conversation_config:{agent:{language:'es',prompt:{max_tokens:1024,tools:['buscar_viaje','crear_itinerario','consultar_catalogo','mostrar_destino'].map(name=>({name,type:'client',expects_response:true}))}},tts:{voice_id:'eZxqQzb5CuYo3Kl6EXfZ'},turn:{silence_end_call_timeout:90},vad:{background_voice_detection:true},conversation:{max_duration_seconds:300}},platform_settings:{auth:{enable_auth:true},queueing_config:{enabled:false},call_limits:{agent_concurrency_limit:1,daily_limit:15,bursting_enabled:false},overrides:{conversation_config_override:{agent:{language:true,first_message:true,prompt:{prompt:false,llm:false}},tts:{voice_id:false}}}}}}
function route(config=valid(),env={},deny=null){
 const requests=[];
 const api=loader({process:{env:{ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'fake-key',ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_test',...env}},fetch:async(url,options)=>{
 requests.push({url:String(url),options});return Response.json(requests.length===1?config:{token:'temporary-token',private:'must-not-leak'});
 }},{'@/lib/ai/admission':{admitAiRequest:async()=>deny}})('app/api/voice/route.ts');
 return{...api,requests};
}
const req=(body)=>new Request('https://preview.test/api/voice',{method:'POST',body:typeof body==='string'?body:JSON.stringify(body)});
test('all seven locales get only a temporary token from the pinned private Sofía version',async()=>{
 for(const locale of ['es','en','fr','de','it','pt','ca']){
 const r=route(),response=await r.POST(req({locale}));assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{token:'temporary-token'});assert.equal(response.headers.get('cache-control'),'no-store');
 assert.equal(r.requests.length,2);assert.ok(r.requests.every(r=>r.url.includes('version_id=agtvrsn_test')));
 assert.ok(r.requests.every(r=>r.url.startsWith('https://api.elevenlabs.io/')));assert.equal(r.requests[1].options.headers['xi-api-key'],'fake-key');
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
 c=>c.platform_settings.call_limits.daily_limit=16,
 c=>c.platform_settings.call_limits.daily_limit=0,
 c=>c.platform_settings.call_limits.daily_limit=1.5,
 c=>c.platform_settings.call_limits.daily_limit='15',
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
