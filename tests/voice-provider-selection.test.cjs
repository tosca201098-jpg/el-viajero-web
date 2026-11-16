const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {loader}=require('./sofia-harness.cjs');
const agent='agent_2201m677yj19e6499g2649n774f6',version='agtvrsn_0601m7jz66wvf83ambtr3s819vfv',previousVersion='agtvrsn_2501m679we79ekz985446fbyygkb';
const scope={VERCEL:'1',VERCEL_ENV:'production',VERCEL_GIT_COMMIT_REF:'main',VERCEL_GIT_REPO_OWNER:'tosca201098-jpg',VERCEL_GIT_REPO_SLUG:'el-viajero-web'};
const source=fs.readFileSync(path.join(__dirname,'voice-route.test.cjs'),'utf8');
const valid=new Function(source.slice(source.indexOf('function valid('),source.indexOf('function route('))+';return valid;')();
const request=(body={locale:'es'})=>new Request('https://destinauta.com/api/voice',{method:'POST',headers:{'x-vercel-forwarded-for':'192.0.2.123'},body:typeof body==='string'?body:JSON.stringify(body)});
const USER_REF='u_'+'a'.repeat(32);
class BudgetError extends Error{constructor(code){super('voice_budget');this.code=code}}
function harness(change={},options={}){
 const requests=[],logs=[],budgets=[];let admissions=0;
 const env={...scope,AI_ENABLED:'true',AI_VOICE_ENABLED:'true',ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'fake-elevenlabs-private',ELEVENLABS_AGENT_VERSION_ID:version,...change};
 const fetcher=async(url,init)=>{
  const address=String(url);requests.push({url:address,init});
  if(options.fetcher)return options.fetcher(address,init);
  if(address.includes('/convai/agents/'))return Response.json(options.config??{...valid(300),agent_id:agent,version_id:version});
  return Response.json({token:'temporary-elevenlabs',private:'must-not-leak'});
 };
 const api=loader({process:{env},console:{warn:(...args)=>logs.push(args)},fetch:fetcher},
  {'@/lib/ai/admission':{admitAiRequest:async(req,service)=>{admissions++;assert.equal(service,'voice');return options.denied??null;},voiceUserReference:()=>USER_REF},
   '@/lib/voice/voice-minutes':{BudgetError,checkVoiceBudget:async input=>{budgets.push(input);if(options.budgetError)throw options.budgetError;
    return options.budget??{ok:true,sessionSeconds:600,remainingSeconds:600,limitSeconds:600,period:'month',resetsAt:1795000000};}}})('app/api/voice/route.ts');
 return{...api,env,requests,logs,budgets,get admissions(){return admissions;}};
}

test('OpenAI no longer exists: production without an explicit ElevenLabs selection is unavailable and contacts nobody',async()=>{
 for(const selected of [undefined,'openai','OpenAI','']){
  const h=harness({AI_VOICE_PROVIDER:selected,ELEVENLABS_PRODUCTION_APPROVED:'true'});
  const res=await h.POST(request());
  assert.equal(res.status,503);assert.deepEqual(await res.json(),{error:'ai_unavailable'});
  assert.equal(h.admissions,0);assert.equal(h.requests.length,0);
  assert(!h.requests.some(r=>r.url.includes('openai')));
 }
});

test('only an explicitly selected and approved production target uses reviewed Sofia and immutable version',async()=>{
 const h=harness({AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true'});
 const res=await h.POST(request());assert.equal(res.status,200);assert.equal((await res.json()).token,'temporary-elevenlabs');
 assert.equal(h.admissions,1);assert.equal(h.requests.length,2);
 const [check,token]=h.requests.map(r=>new URL(r.url));
 assert.equal(check.pathname,'/v1/convai/agents/'+agent);assert.equal(token.searchParams.get('agent_id'),agent);
 for(const call of h.requests){assert.equal(new URL(call.url).searchParams.get('version_id'),version);assert.equal(call.init.headers['xi-api-key'],'fake-elevenlabs-private');}
});

test('unknown providers, missing production metadata, flags and unapproved activation cannot consume quota or contact providers',async()=>{
 const cases=[{AI_VOICE_PROVIDER:''},{AI_VOICE_PROVIDER:'unknown'},{AI_VOICE_PROVIDER:'OpenAI'},{AI_VOICE_PROVIDER:'openai'},{},
  {AI_VOICE_PROVIDER:'elevenlabs'},{AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'false'},
  {AI_ENABLED:undefined},{AI_ENABLED:'false'},{AI_VOICE_ENABLED:undefined},{AI_VOICE_ENABLED:'false'},
  {VERCEL_ENV:undefined},{VERCEL_ENV:'other'}];
 for(const key of ['VERCEL','VERCEL_GIT_COMMIT_REF','VERCEL_GIT_REPO_OWNER','VERCEL_GIT_REPO_SLUG'])cases.push({[key]:undefined},{[key]:'other'});
 for(const change of cases){
  const h=harness(change),res=await h.POST(request());assert.equal(res.status,503);
  assert.deepEqual(await res.json(),{error:'ai_unavailable'});assert.equal(h.admissions,0);assert.equal(h.requests.length,0);
 }
 for(const change of [{ELEVENLABS_API_KEY:''},{ELEVENLABS_ENABLED:'false'},{ELEVENLABS_AGENT_VERSION_ID:''},{ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_other'},{ELEVENLABS_AGENT_VERSION_ID:'agtvrsn_3801m618j78bey69jjc08tdm4ppc'},{ELEVENLABS_AGENT_VERSION_ID:previousVersion}]){
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
  const config={...valid(300),agent_id:agent,version_id:version};mutate(config);
  const h=harness({AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true'},{config});
  const res=await h.POST(request());assert.equal(res.status,503);assert.equal(h.admissions,1);assert.equal(h.requests.length,1);
  assert.equal(new URL(h.requests[0].url).pathname,'/v1/convai/agents/'+agent);
 }
});

test('a denied admission never contacts ElevenLabs and provider failure never starts another provider',async()=>{
 for(const provider of ['elevenlabs']){
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
   assert(h.requests.every(r=>new URL(r.url).hostname==='api.elevenlabs.io'));assert.deepEqual(h.logs,[]);
  }
 }
});

test('invalid requests fail before admission and server secrets never reach the response',async()=>{
 for(const body of ['{','x'.repeat(513),{locale:'xx'},[],null]){
  const h=harness({AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true'}),res=await h.POST(request(body));assert.equal(res.status,400);assert.equal(h.admissions,0);assert.equal(h.requests.length,0);
 }
 for(const locale of ['es','en','fr','de','it','pt','ca']){
  const h=harness({AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true'}),res=await h.POST(request({locale}));assert.equal(res.status,200);
  const text=await res.text();assert(!text.includes('fake-elevenlabs-private'));assert(!text.includes('must-not-leak'));
 }
});

test('ElevenLabs uses flood-protection attempts and the real voice minutes, with no daily ledger and no monthly quota keys',async()=>{
 const calls=[],commands=[],lists=[];const env={...scope,AI_ENABLED:'true',AI_VOICE_ENABLED:'true',AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true',
  ELEVENLABS_API_KEY:'fake-elevenlabs',ELEVENLABS_ENABLED:'true',ELEVENLABS_AGENT_VERSION_ID:version,
  AI_REDIS_REST_URL:'https://unit-test.upstash.io',AI_REDIS_REST_TOKEN:'fake-redis',AI_RATE_LIMIT_SECRET:'fake-hmac-value-for-unit-tests-only'};
 const api=loader({process:{env},fetch:async(url,init)=>{
  const address=String(url);calls.push(address);
  if(address.includes('upstash.io')){
   const command=JSON.parse(init.body);commands.push(command);assert.equal(command[0],'EVAL');
   assert(!JSON.stringify(command.slice(3)).includes('31days'));
   assert.equal(command[2],3);assert.deepEqual(command.slice(6),[6,60,60,86400,3,60]);
   assert.match(command[5],/^destinauta:ai:v1:production:voice:user:[a-f0-9]{64}:minute$/);
   return Response.json({result:[1,0]});
  }
  if(address.includes('/convai/conversations')){lists.push(new URL(address));return Response.json({conversations:[{conversation_id:'c',start_time_unix_secs:Math.floor(Date.now()/1000)-60,call_duration_secs:60,status:'done'}],has_more:false});}
  if(address.includes('/convai/agents/'))return Response.json({...valid(300),agent_id:agent,version_id:version});
  return Response.json({token:'temporary-elevenlabs'});
 }},{'@/lib/supabase/voice-auth':{verifyVoiceUser:async()=>({userId:'11111111-2222-4333-8444-555555555555'})}})('app/api/voice/route.ts');
 const res=await api.POST(request());assert.equal(res.status,200);
 const body=await res.json();assert.equal(body.token,'temporary-elevenlabs');assert.match(body.userRef,/^u_[a-f0-9]{32}$/);
 assert.equal(body.remainingSeconds,300);assert.equal(body.sessionSeconds,300,'the account has 5 of its 6 minutes left and the site has 14 of its 15');assert.equal(body.limitSeconds,360);assert.equal(body.period,'month');
 assert.equal(commands.length,1,'one Redis call: no Madrid-day ledger');
 assert.equal(lists.length,2);assert(lists.every(u=>u.searchParams.get('agent_id')===agent));
 assert.deepEqual(lists.map(u=>u.searchParams.get('user_id')).sort(),[body.userRef,null].sort());
 // The account is counted from the 1st of the Madrid month; the whole site only from this Madrid week.
 const madrid=seconds=>Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Madrid',day:'numeric',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(seconds*1000).filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]));
 const since=u=>Number(u.searchParams.get('call_start_after_unix'));
 const accountList=lists.find(u=>u.searchParams.has('user_id')),siteList=lists.find(u=>!u.searchParams.has('user_id'));
 assert.deepEqual(madrid(since(accountList)),{day:1,hour:0,minute:0});assert.equal(madrid(since(siteList)).hour,0);assert.ok(since(accountList)<=since(siteList));
 // Order: flood protection, then the weekly minutes, then the pinned agent check and finally the token.
 assert(calls[0].includes('upstash.io'));assert(calls[1].includes('/convai/conversations')&&calls[2].includes('/convai/conversations'));
 assert(calls[3].includes('/convai/agents/')&&calls[4].includes('/conversation/token'));
 assert.equal(JSON.stringify(body).includes('fake-elevenlabs'),false);
});

test('a weekly budget that cannot be read never reaches the token endpoint, and ambiguous failures never grant one',async()=>{
 const scope={AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true'};
 const failed=harness(scope,{fetcher:async()=>new Response('private-error',{status:503})});
 assert.equal((await failed.POST(request())).status,503);
 const unreadable=harness(scope,{budgetError:new BudgetError('VOICE_BUDGET_HTTP')});
 const response=await unreadable.POST(request());assert.equal(response.status,503);
 assert.deepEqual(await response.json(),{error:'ai_unavailable'});assert.equal(unreadable.requests.length,0);
 const spent=harness(scope,{budget:{ok:false,reason:'user',resetsAt:Math.floor(Date.now()/1000)+86400}});
 const limited=await spent.POST(request());assert.equal(limited.status,429);assert.equal((await limited.json()).error,'ai_minutes_limit');assert.equal(spent.requests.length,0);
});

test('production accepts the reviewed 300-second agent, the 360-second one and the 15-minute one, and nothing else',async()=>{
 const withDuration=seconds=>{const config={...valid(300),agent_id:agent,version_id:version};config.conversation_config.conversation.max_duration_seconds=seconds;return config;};
 for(const [seconds,status] of [[300,200],[360,200],[900,200],[330,503],[299,503],[361,503],[600,503],[899,503],[901,503],[-1,503],[0,503]]){
  const h=harness({AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true'},{config:withDuration(seconds)});
  const res=await h.POST(request());
  assert.equal(res.status,status,String(seconds));
  if(status===200)assert.equal((await res.json()).token,'temporary-elevenlabs');
  else assert.deepEqual(await res.json(),{error:'ai_unavailable'});
 }
 // The 360-second and 15-minute agents still have to keep every other production safeguard (daily limit up to 15, no burst, one at a time…).
 for(const seconds of [360,900]){
  const loose=withDuration(seconds);loose.platform_settings.call_limits.daily_limit=100000;
  const refused=harness({AI_VOICE_PROVIDER:'elevenlabs',ELEVENLABS_PRODUCTION_APPROVED:'true'},{config:loose});
  assert.equal((await refused.POST(request())).status,503,String(seconds));
 }
});

test('the diagnostic snapshot applies the same rule as the route: 900 or 360 everywhere and 300 only in production',()=>{
 const source=fs.readFileSync(path.join(__dirname,'..','lib/voice/provider-config.ts'),'utf8');
 const rule=/max_duration_seconds === 900 \|\| c\.conversation\?\.max_duration_seconds === 360 \|\|\s+\(!preview && c\.conversation\?\.max_duration_seconds === 300\)/;
 assert.match(source,rule);
 const route=fs.readFileSync(path.join(__dirname,'..','lib/voice/elevenlabs-route.ts'),'utf8');
 assert.match(route,rule);
});
