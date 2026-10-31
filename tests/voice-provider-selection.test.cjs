const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {loader}=require('./sofia-harness.cjs');
const agent='agent_2201m677yj19e6499g2649n774f6',version='agtvrsn_2501m679we79ekz985446fbyygkb';
const scope={VERCEL:'1',VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'main',VERCEL_GIT_REPO_OWNER:'tosca201098-jpg',VERCEL_GIT_REPO_SLUG:'el-viajero-web'};
const source=fs.readFileSync(path.join(__dirname,'voice-route.test.cjs'),'utf8');
const valid=new Function(source.slice(source.indexOf('function valid()'),source.indexOf('function route('))+';return valid;')();
const request=(body={locale:'es'})=>new Request('https://destinauta.com/api/voice',{method:'POST',headers:{'x-vercel-forwarded-for':'192.0.2.123'},body:typeof body==='string'?body:JSON.stringify(body)});
function harness(change={},options={}){
 const requests=[],logs=[];let admissions=0;
 const env={...scope,AI_ENABLED:'true',AI_VOICE_ENABLED:'true',OPENAI_API_KEY:'fake-openai-private',ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'fake-elevenlabs-private',ELEVENLABS_AGENT_VERSION_ID:version,...change};
 const fetcher=async(url,init)=>{
  const address=String(url);requests.push({url:address,init});
  if(options.fetcher)return options.fetcher(address,init);
  if(address.startsWith('https://api.openai.com/'))return Response.json({value:'temporary-openai',private:'must-not-leak'});
  if(address.includes('/convai/agents/'))return Response.json(options.config??{...valid(),agent_id:agent,version_id:version});
  return Response.json({token:'temporary-elevenlabs',private:'must-not-leak'});
 };
 const api=loader({process:{env},console:{warn:(...args)=>logs.push(args)},fetch:fetcher},
  {'@/lib/ai/admission':{admitAiRequest:async(req,service)=>{admissions++;assert.equal(service,'voice');return options.denied??null;}}})('app/api/voice/route.ts');
 return{...api,env,requests,logs,get admissions(){return admissions;}};
}

test('production defaults to the protected OpenAI voice and explicit rollback selects only that provider',async()=>{
 for(const selected of [undefined,'openai']){
  const h=harness({AI_VOICE_PROVIDER:selected,ELEVENLABS_PRODUCTION_APPROVED:'false',ELEVENLABS_ENABLED:'false',ELEVENLABS_API_KEY:'',ELEVENLABS_AGENT_VERSION_ID:''});
  const res=await h.POST(request({locale:'es',provider:'elevenlabs'}));
  assert.equal(res.status,200);assert.deepEqual(await res.json(),{value:'temporary-openai'});
  assert.equal(res.headers.get('cache-control'),'no-store');assert.equal(h.admissions,1);assert.equal(h.requests.length,1);
  const call=h.requests[0];assert.equal(call.url,'https://api.openai.com/v1/realtime/client_secrets');
  assert.equal(call.init.method,'POST');assert.equal(call.init.headers.Authorization,'Bearer fake-openai-private');
  assert.equal(call.init.cache,'no-store');
  const body=JSON.parse(call.init.body);
  assert.deepEqual(body.expires_after,{anchor:'created_at',seconds:60});
  assert.equal(body.session.model,'gpt-realtime-2.1');assert.equal(body.session.audio.output.voice,'marin');
  assert.equal(body.session.max_output_tokens,1024);
  assert.deepEqual(body.session.audio.input.turn_detection,{type:'server_vad',create_response:false,interrupt_response:false});
  assert.deepEqual(body.session.tools.map(t=>t.name),['buscar_viaje','crear_itinerario']);
  assert.match(body.session.instructions,/Responde siempre en español/);
  assert(!JSON.stringify(body).includes('fake-openai-private'));assert.deepEqual(h.logs,[]);
 }
});

test('only an explicitly selected and approved production target uses reviewed Sofia and immutable version',async()=>{
 const h=harness({AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true'});
 const res=await h.POST(request());assert.equal(res.status,200);assert.deepEqual(await res.json(),{token:'temporary-elevenlabs'});
 assert.equal(h.admissions,1);assert.equal(h.requests.length,2);
 const [check,token]=h.requests.map(r=>new URL(r.url));
 assert.equal(check.pathname,'/v1/convai/agents/'+agent);assert.equal(token.searchParams.get('agent_id'),agent);
 for(const call of h.requests){assert.equal(new URL(call.url).searchParams.get('version_id'),version);assert.equal(call.init.headers['xi-api-key'],'fake-elevenlabs-private');}
});

test('unknown providers, missing production metadata, flags and unapproved activation cannot consume quota or contact providers',async()=>{
 const cases=[{AI_VOICE_PROVIDER:''},{AI_VOICE_PROVIDER:'unknown'},{AI_VOICE_PROVIDER:'OpenAI'},
  {AI_VOICE_PROVIDER:'elevenlabs'},{AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'false'},
  {AI_ENABLED:undefined},{AI_ENABLED:'false'},{AI_VOICE_ENABLED:undefined},{AI_VOICE_ENABLED:'false'},
  {OPENAI_API_KEY:''},{VERCEL_ENV:undefined},{VERCEL_ENV:'other'}];
 for(const key of ['VERCEL','VERCEL_GIT_COMMIT_REF','VERCEL_GIT_REPO_OWNER','VERCEL_GIT_REPO_SLUG'])cases.push({[key]:undefined},{[key]:'other'});
 for(const change of cases){
  const h=harness(change),res=await h.POST(request());assert.equal(res.status,503);
  assert.deepEqual(await res.json(),{error:'ai_unavailable'});assert.equal(h.admissions,0);assert.equal(h.requests.length,0);
 }
 for(const change of [{ELEVENLABS_API_KEY:''},{ELEVENLABS_ENABLED:'false'},{ELEVENLABS_AGENT_VERSION_ID:''},{ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_other'},{ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_3801m618j78bey69jjc08tdm4ppc'}]){
  const h=harness({AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true',...change});
  assert.equal((await h.POST(request())).status,503);assert.equal(h.admissions,0);assert.equal(h.requests.length,0);
 }
});

test('production Sofia identity and security mismatches never issue tokens',async()=>{
 const mutations=[c=>c.agent_id='agent_other',c=>c.version_id='agtvrsn_other',c=>delete c.agent_id,c=>delete c.version_id,
  c=>c.platform_settings.queueing_config.enabled=true,c=>delete c.platform_settings.queueing_config,
  c=>c.platform_settings.auth.enable_auth=false,c=>c.platform_settings.call_limits.bursting_enabled=true,
  c=>c.platform_settings.call_limits.agent_concurrency_limit=2,c=>c.platform_settings.call_limits.daily_limit=16];
 for(const mutate of mutations){
  const config={...valid(),agent_id:agent,version_id:version};mutate(config);
  const h=harness({AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true'},{config});
  const res=await h.POST(request());assert.equal(res.status,503);assert.equal(h.admissions,1);assert.equal(h.requests.length,1);
  assert.equal(new URL(h.requests[0].url).pathname,'/v1/convai/agents/'+agent);
 }
});

test('a denied admission never contacts either provider and provider failure never starts an automatic fallback',async()=>{
 for(const provider of ['openai','elevenlabs']){
  const env={AI_VOICE_PROVIDER:provider,ELEVENLABS_PRODUCTION_APPROVED:'true'};
  const denied=harness(env,{denied:Response.json({error:'ai_rate_limited'},{status:429})});
  assert.equal((await denied.POST(request())).status,429);assert.equal(denied.admissions,1);assert.equal(denied.requests.length,0);
  for(const mode of ['http','network','malformed']){
   const h=harness(env,{fetcher:async()=>{
    if(mode==='network')throw Error('private-key provider-details');
    return mode==='http'?Response.json({error:'private-key provider-details'},{status:503}):Response.json({private:'private-key provider-details'});
   }});
   const res=await h.POST(request());assert.equal(res.status,503);assert.deepEqual(await res.json(),{error:'ai_unavailable'});
   assert.equal(h.admissions,1);assert.equal(h.requests.length,1);
   assert(h.requests.every(r=>new URL(r.url).hostname===(provider==='openai'?'api.openai.com':'api.elevenlabs.io')));assert.deepEqual(h.logs,[]);
  }
 }
});

test('OpenAI invalid requests fail before admission and its server secret never reaches the response',async()=>{
 for(const body of ['{','x'.repeat(513),{locale:'xx'},[],null]){
  const h=harness(),res=await h.POST(request(body));assert.equal(res.status,400);assert.equal(h.admissions,0);assert.equal(h.requests.length,0);
 }
 for(const locale of ['es','en','fr','de','it','pt','ca']){
  const h=harness(),res=await h.POST(request({locale}));assert.equal(res.status,200);
  const text=await res.text();assert(!text.includes('fake-openai-private'));assert(!text.includes('must-not-leak'));
 }
});

test('both selected production providers retain the same single atomic voice admission with the 31-day allowance',async()=>{
 for(const provider of ['openai','elevenlabs']){
  const calls=[];const env={...scope,AI_ENABLED:'true',AI_VOICE_ENABLED:'true',AI_VOICE_PROVIDER:provider,ELEVENLABS_PRODUCTION_APPROVED:'true',
   OPENAI_API_KEY:'fake-openai',ELEVENLABS_API_KEY:'fake-elevenlabs',ELEVENLABS_ENABLED:'true',ELEVENLABS_AGENT_VERSION_ID:version,
   AI_REDIS_REST_URL:'https://unit-test.upstash.io',AI_REDIS_REST_TOKEN:'fake-redis',AI_RATE_LIMIT_SECRET:'fake-hmac-value-for-unit-tests-only'};
  const api=loader({process:{env},fetch:async(url,init)=>{
   const address=String(url);calls.push(address);
   if(address.includes('upstash.io')){
    const command=JSON.parse(init.body);assert.equal(command[0],'EVAL');assert.equal(command[2],4);
    assert(command[6].endsWith(':production:voice:elevenlabs:global:31days'));
    assert.deepEqual(command.slice(-2),[3,2678400]);return Response.json({result:[1,0]});
   }
   if(address.includes('/convai/agents/'))return Response.json({...valid(),agent_id:agent,version_id:version});
   return Response.json(provider==='openai'?{value:'temporary-openai'}:{token:'temporary-elevenlabs'});
  }})('app/api/voice/route.ts');
  assert.equal((await api.POST(request())).status,200);
  assert.equal(calls.filter(url=>url.includes('upstash.io')).length,1);assert(calls[0].includes('upstash.io'));
 }
});
