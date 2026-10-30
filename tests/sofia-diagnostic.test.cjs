const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {loader}=require('./sofia-harness.cjs');
const token='ab'.repeat(32),tokenHash=crypto.createHash('sha256').update(token).digest('hex');
const host='el-viajero-web-git-codex-sofia-elevenlabs-el-viajero.vercel.app';
const version='agtvrsn_2501m679we79ekz985446fbyygkb';
const agent='agent_2201m677yj19e6499g2649n774f6';
function config(){return{agent_id:agent,version_id:version,conversation_config:{agent:{language:'es',prompt:{max_tokens:1024,tools:['buscar_viaje','crear_itinerario','consultar_catalogo','mostrar_destino'].map(name=>({name,type:'client',expects_response:true}))}},tts:{voice_id:'eZxqQzb5CuYo3Kl6EXfZ'},turn:{silence_end_call_timeout:90},vad:{background_voice_detection:true},conversation:{max_duration_seconds:300}},platform_settings:{auth:{enable_auth:true},queueing_config:{enabled:false},call_limits:{agent_concurrency_limit:1,daily_limit:15,bursting_enabled:false},overrides:{conversation_config_override:{agent:{language:true,first_message:true,prompt:{prompt:false,llm:false}},tts:{voice_id:false}}}}}}
function harness(overrides={},options={}){
 const requests=[],counts=new Map(),logs=[];let lock=false;
 const env={VERCEL:'1',VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'codex/sofia-elevenlabs',VERCEL_GIT_REPO_OWNER:'tosca201098-jpg',VERCEL_GIT_REPO_SLUG:'el-viajero-web',SOFIA_DIAGNOSTIC_ENABLED:'true',SOFIA_DIAGNOSTIC_TOKEN_SHA256:tokenHash,SOFIA_DIAGNOSTIC_WINDOW_START:new Date(Date.now()-1000).toISOString(),AI_REDIS_REST_URL:'https://fake.upstash.io',AI_REDIS_REST_TOKEN:'private-redis',AI_RATE_LIMIT_SECRET:'r'.repeat(32),ELEVENLABS_API_KEY:'private-elevenlabs',ELEVENLABS_AGENT_VERSION_ID:version,...overrides};
 const ClockDate=class extends Date{static now(){return options.now??super.now()}};
 const api=loader({Buffer,Date:ClockDate,process:{env},console:Object.fromEntries(['log','info','debug','warn','error'].map(level=>[level,(...args)=>logs.push({level,args})])),fetch:async(url,init)=>{
  const address=String(url);requests.push({url:address,...init});
  assert.equal(init.redirect,'error');assert.equal(init.cache,'no-store');
  if(address.startsWith('https://api.elevenlabs.io/')){
   assert.equal(new URL(address).pathname,'/v1/convai/agents/'+agent);
   assert.equal(new URL(address).searchParams.get('version_id'),version);assert.equal(init.method,'GET');
   return Response.json(options.agentConfig||config(),{status:options.agentStatus||200});
  }
  assert.equal(address,'https://fake.upstash.io/');
  if(options.redisError)throw Error('private-redis private-elevenlabs DO NOT LEAK');
  if(options.redisMalformed)return Response.json({error:'private details'});
  const cmd=JSON.parse(init.body);assert.equal(cmd[0],'EVAL');const keys=cmd.slice(3,3+cmd[2]);
  assert(keys.every(key=>key.startsWith('destinauta:diagnostic:sofia:')&&!key.startsWith('destinauta:ai:')));
  if(cmd[1].includes("redis.call('SET'")){
   assert.equal(cmd[2],1);assert(cmd[1].includes("'EX', 900"));
   const result=lock?0:1;lock=true;return Response.json({result});
  }
  if(cmd[1].includes("redis.call('INCR'")){
   assert.deepEqual(cmd.slice(7),[1,120,1,120,1,120,1,120]);
   if(options.nonAtomic)return Response.json({result:[1,0]});
   if(keys.some(key=>counts.has(key)))return Response.json({result:[0,120]});
   keys.forEach(key=>counts.set(key,1));return Response.json({result:[1,0]});
  }
  assert(cmd[1].includes("redis.call('TTL'"));
  return Response.json({result:keys.flatMap(key=>[counts.get(key)||-1,options.badTTL?-1:120])});
 }})('app/api/sofia-diagnostic/route.ts');
 return{...api,requests,env,logs};
}
function request({headers={},url='https://'+host+'/api/sofia-diagnostic'}={}){return new Request(url,{method:'POST',headers:{authorization:'Bearer '+token,...headers}})}

test('diagnostic security validation matches the existing voice route without changing its queue protection',async()=>{
 const guard=loader()('lib/voice/provider-config.ts').safeSofiaConfiguration;
 const mutations=[()=>{},c=>c.platform_settings.auth.enable_auth=false,
  c=>c.platform_settings.queueing_config.enabled=true,c=>delete c.platform_settings.queueing_config,
  c=>c.platform_settings.call_limits.daily_limit=16,c=>c.platform_settings.call_limits.agent_concurrency_limit=2,
  c=>c.platform_settings.call_limits.daily_limit=0,c=>c.platform_settings.call_limits.daily_limit=1.5,
  c=>c.platform_settings.call_limits.daily_limit='15',
  c=>c.platform_settings.call_limits.bursting_enabled=true,c=>c.conversation_config.tts.voice_id='other',
  c=>c.conversation_config.agent.language='en',c=>c.conversation_config.conversation.max_duration_seconds=600,
  c=>c.conversation_config.turn.silence_end_call_timeout=-1,c=>c.conversation_config.vad.background_voice_detection=false,
  c=>c.conversation_config.agent.prompt.max_tokens=-1,c=>c.conversation_config.agent.prompt.tools.pop(),
  c=>c.platform_settings.overrides.conversation_config_override.agent.prompt.prompt=true];
 for(const mutate of mutations){
  const c=config();mutate(c);let calls=0;
  const api=loader({process:{env:{ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'fake-key',ELEVENLABS_AGENT_VERSION_ID:version}},
   fetch:async()=>Response.json(++calls===1?c:{token:'fake-token'})},
   {'@/lib/ai/admission':{admitAiRequest:async()=>null}})('app/api/voice/route.ts');
  const res=await api.POST(new Request('https://preview.test/api/voice',{method:'POST',body:'{}'}));
  assert.equal(guard(c),res.status===200);assert.equal(calls,guard(c)?2:1);
 }
});

test('production, other branches, hosts, repositories and disabled diagnostics are 404 with zero external operations',async()=>{
 for(const env of [{VERCEL_ENV:'production'},{VERCEL_ENV:'development'},{VERCEL:''},{VERCEL_GIT_COMMIT_REF:'main'},{VERCEL_GIT_REPO_OWNER:'other'},{VERCEL_GIT_REPO_SLUG:'other'},{SOFIA_DIAGNOSTIC_ENABLED:'false'}, {SOFIA_DIAGNOSTIC_ENABLED:undefined}]){
  const h=harness(env);assert.equal((await h.POST(request())).status,404);assert.equal(h.requests.length,0);
 }
 for(const url of ['https://destinauta.com/api/sofia-diagnostic','https://other.vercel.app/api/sofia-diagnostic','http://'+host+'/api/sofia-diagnostic','https://'+host+'/api/sofia-diagnostic?token=anything']){
  const h=harness();assert.equal((await h.POST(request({url}))).status,404);assert.equal(h.requests.length,0);
 }
 const h=harness({VERCEL_ENV:'production'});
 for(const method of ['GET','HEAD','PUT','PATCH','DELETE','OPTIONS'])assert.equal(h[method]().status,404);
 assert.equal(h.requests.length,0);
});

test('authorization and fixed 15-minute window fail closed before any provider call',async()=>{
 for(const headers of [{authorization:''},{authorization:'Bearer '+ 'ff'.repeat(32)},{authorization:'Bearer short'},{'sec-fetch-site':'cross-site'},{origin:'https://attacker.test'}]){
  const h=harness();assert.equal((await h.POST(request({headers}))).status,404);assert.equal(h.requests.length,0);
 }
 for(const env of [{SOFIA_DIAGNOSTIC_TOKEN_SHA256:''},{SOFIA_DIAGNOSTIC_WINDOW_START:''},{SOFIA_DIAGNOSTIC_WINDOW_START:'invalid'},{SOFIA_DIAGNOSTIC_WINDOW_START:new Date(Date.now()-901000).toISOString()},{SOFIA_DIAGNOSTIC_WINDOW_START:new Date(Date.now()+60000).toISOString()}]){
  const h=harness(env);assert.equal((await h.POST(request())).status,404);assert.equal(h.requests.length,0);
 }
});

test('malformed calendar dates and timestamp formats cannot authorize external operations',async()=>{
 for(const start of ['2026-02-31T12:00:00.000Z','2026-10-30T12:00:00Z','2026-10-30T12:00:00.000+00:00','9999-99-99T00:00:00.000Z']){
  const h=harness({SOFIA_DIAGNOSTIC_WINDOW_START:start});
  assert.equal((await h.POST(request())).status,404);assert.equal(h.requests.length,0);assert.equal(h.logs.length,0);
 }
});

test('the window closes at exactly 15 minutes and does not open before its start',async()=>{
 const startText='2026-10-30T12:00:00.000Z',start=Date.parse(startText);
 for(const now of [start-1,start+900000,start+900001]){
  const h=harness({SOFIA_DIAGNOSTIC_WINDOW_START:startText},{now});
  assert.equal((await h.POST(request())).status,404);assert.equal(h.requests.length,0);
 }
 const h=harness({SOFIA_DIAGNOSTIC_WINDOW_START:startText},{now:start});
 assert.equal((await h.POST(request())).status,200);
});

test('invalid private configuration never contacts Redis or ElevenLabs',async()=>{
 for(const env of [{AI_REDIS_REST_URL:'http://fake.upstash.io'},{AI_REDIS_REST_URL:'https://attacker.test'},{AI_REDIS_REST_URL:'https://user:pass@fake.upstash.io'},{AI_REDIS_REST_URL:'https://fake.upstash.io/path'},{AI_REDIS_REST_TOKEN:''},{AI_RATE_LIMIT_SECRET:'short'},{ELEVENLABS_API_KEY:''},{ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_other'},{ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_3801m618j78bey69jjc08tdm4ppc'}]){
  const h=harness(env);assert.equal((await h.POST(request())).status,503);assert.equal(h.requests.length,0);
 }
});

test('successful diagnostic exercises real quota script, isolated expiring keys, and only GET agent; no token or conversation',async()=>{
 const h=harness(),res=await h.POST(request());assert.equal(res.status,200);
 assert.deepEqual(await res.json(),{redis:'passed',elevenlabs:'passed'});assert.equal(res.headers.get('cache-control'),'no-store');
 assert.equal(h.requests.length,5);assert.equal(h.requests.filter(r=>r.url.includes('elevenlabs.io')).length,1);
 assert(h.requests.every(r=>!r.url.includes('/conversation')&&!r.url.includes('/simulate')));
 assert(h.requests.every(r=>!r.url.includes('private-')&&!r.url.includes(token)));
});

test('shared lock permits exactly one concurrent run and rejects replay before provider checks',async()=>{
 const h=harness(),responses=await Promise.all([h.POST(request()),h.POST(request())]);
 assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
 assert.equal(h.requests.filter(r=>r.url.includes('elevenlabs.io')).length,1);
 assert.equal((await h.POST(request())).status,409);
});

test('provider failure still consumes the attempt and response exposes no private data',async()=>{
 const h=harness({}, {agentStatus:403});const res=await h.POST(request());
 assert.equal(res.status,503);const text=await res.text();
 for(const secret of ['private-redis','private-elevenlabs',token,tokenHash,'upstash.io',agent,version])assert(!text.includes(secret));
 const calls=h.requests.length;assert.equal((await h.POST(request())).status,409);assert.equal(h.requests.length,calls+1);
});

test('successful, denied and failing checks never log credentials or provider configuration',async()=>{
 for(const options of [{},{agentStatus:403},{redisError:true},{agentConfig:{private:'secret-provider-canary'}}]){
  const h=harness({},options);await h.POST(request());assert.deepEqual(h.logs,[]);
 }
 const h=harness();await h.POST(request({headers:{authorization:'invalid'}}));assert.deepEqual(h.logs,[]);
});

test('Redis errors are sanitized, do not fall back and do not call ElevenLabs',async()=>{
 for(const options of [{redisError:true},{redisMalformed:true}]){
  const h=harness({},options),res=await h.POST(request());assert.equal(res.status,503);
  assert.deepEqual(await res.json(),{error:'diagnostic_unavailable'});assert.equal(h.requests.length,1);
 }
});

test('non-atomic results and missing expiry never report Redis success',async()=>{
 for(const options of [{nonAtomic:true},{badTTL:true}]){
  const h=harness({},options),res=await h.POST(request());assert.equal(res.status,503);
  assert.deepEqual(await res.json(),{redis:'failed',elevenlabs:'passed'});
 }
});

test('wrong agent/version, insufficient permissions and unsafe queue never report ElevenLabs success',async()=>{
 const unsafe=config();unsafe.platform_settings.queueing_config.enabled=true;
 const absent=config();delete absent.platform_settings.queueing_config;
 const queueValues=[null,'false',0,{}].map(enabled=>{const c=config();c.platform_settings.queueing_config={enabled};return{agentConfig:c}});
 for(const options of [{agentStatus:401},{agentStatus:403},{agentConfig:{...config(),agent_id:'other'}},{agentConfig:{...config(),version_id:'other'}},{agentConfig:unsafe},{agentConfig:absent},...queueValues]){
  const h=harness({},options),res=await h.POST(request());assert.equal(res.status,503);
  assert.deepEqual(await res.json(),{redis:'passed',elevenlabs:'failed'});
 }
});

