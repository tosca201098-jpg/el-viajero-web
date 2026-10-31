const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {loader}=require('./sofia-harness.cjs');
const agent='agent_2201m677yj19e6499g2649n774f6';
const version='agtvrsn_2501m679we79ekz985446fbyygkb';
const legacy='agent_9701m5zn3h9bf57ata0q3qzn1ag6';
const legacyVersion='agtvrsn_3801m618j78bey69jjc08tdm4ppc';
const scope={VERCEL:'1',VERCEL_ENV:'preview',VERCEL_GIT_COMMIT_REF:'codex/sofia-elevenlabs',VERCEL_GIT_REPO_OWNER:'tosca201098-jpg',VERCEL_GIT_REPO_SLUG:'el-viajero-web'};
const source=fs.readFileSync(path.join(__dirname,'voice-route.test.cjs'),'utf8');
const valid=new Function(source.slice(source.indexOf('function valid()'),source.indexOf('function route('))+';return valid;')();
function harness(change={},options={}){
 const requests=[],logs=[];
 const config=options.config??{...valid(),agent_id:agent,version_id:version};
 const api=loader({process:{env:{...scope,AI_ENABLED:'true',AI_VOICE_ENABLED:'true',ELEVENLABS_ENABLED:'true',ELEVENLABS_API_KEY:'fake-key',ELEVENLABS_AGENT_VERSION_ID:version,...change}},console:{warn:(...args)=>logs.push(args)},fetch:async(url,init)=>{
  requests.push({url:String(url),init});
  return Response.json(requests.length===1?config:{token:'temporary-token',private:'must-not-leak'});
 }},{'@/lib/ai/admission':{admitAiRequest:async()=>options.denied??null}})('app/api/voice/route.ts');
 return {...api,requests,logs};
}
const request=locale=>new Request('https://el-viajero-web-git-codex-sofia-elevenlabs-el-viajero.vercel.app/api/voice',{method:'POST',body:JSON.stringify({locale})});

test('only the exact Preview scope uses the reviewed new agent and immutable version in both requests',async()=>{
 for(const locale of ['es','en','fr','de','it','pt','ca']){
  const h=harness(),response=await h.POST(request(locale));
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{token:'temporary-token'});
  assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(h.requests.length,2);
  const [check,token]=h.requests.map(r=>new URL(r.url));
  assert.equal(check.pathname,'/v1/convai/agents/'+agent);
  assert.equal(token.pathname,'/v1/convai/conversation/token');assert.equal(token.searchParams.get('agent_id'),agent);
  for(const url of [check,token])assert.equal(url.searchParams.get('version_id'),version);
 }
});

test('legacy non-production targets remain compatible while unknown Vercel environments fail closed',async()=>{
 const changes=[{VERCEL_ENV:'development'}];
 for(const key of Object.keys(scope))changes.push({[key]:undefined},{[key]:'other'});
 for(const change of changes){
  const h=harness({...change,ELEVENLABS_AGENT_VERSION_ID:legacyVersion}),response=await h.POST(request('es'));
  if (change.VERCEL_ENV === 'other' || Object.hasOwn(change,'VERCEL_ENV') && change.VERCEL_ENV === undefined) {
   assert.equal(response.status,503);assert.equal(h.requests.length,0);continue;
  }
  assert.equal(response.status,200);assert.equal(h.requests.length,2);
  assert.equal(new URL(h.requests[0].url).pathname,'/v1/convai/agents/'+legacy);
  assert.equal(new URL(h.requests[1].url).searchParams.get('agent_id'),legacy);
  assert(h.requests.every(r=>new URL(r.url).searchParams.get('version_id')===legacyVersion));
 }
});

test('Preview with absent, old or unreviewed version fails closed before ElevenLabs',async()=>{
 for(const pinned of [undefined,'','agtvrsn_3801m618j78bey69jjc08tdm4ppc','agtvrsn_other']){
  const h=harness({ELEVENLABS_AGENT_VERSION_ID:pinned}),response=await h.POST(request('es'));
  assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'ai_unavailable'});
  assert.equal(h.requests.length,0);assert.deepEqual(h.logs,[['SOFIA_DIAGNOSTIC','VOICE_VERSION']]);
 }
});

test('a mismatched or absent returned agent/version cannot reach the token endpoint',async()=>{
 for(const identity of [{agent_id:legacy},{version_id:'agtvrsn_other'},{agent_id:undefined},{version_id:undefined}]){
  const h=harness({}, {config:{...valid(),agent_id:agent,version_id:version,...identity}});
  const response=await h.POST(request('es'));assert.equal(response.status,503);
  assert.equal(h.requests.length,1);assert.deepEqual(h.logs,[['SOFIA_DIAGNOSTIC','VOICE_CHECK_CONFIG']]);
 }
});

test('the new target preserves quota denial and production approval guards',async()=>{
 const denied=harness({}, {denied:Response.json({error:'ai_limited'},{status:429})});
 assert.equal((await denied.POST(request('es'))).status,429);assert.equal(denied.requests.length,0);
 const production=harness({VERCEL_ENV:'production'});
 assert.equal((await production.POST(request('es'))).status,503);assert.equal(production.requests.length,0);
});

test('the new target still rejects unsafe configuration before issuing a token',async()=>{
 const config={...valid(),agent_id:agent,version_id:version};config.platform_settings.auth.enable_auth=false;
 const h=harness({}, {config});assert.equal((await h.POST(request('es'))).status,503);assert.equal(h.requests.length,1);
});
