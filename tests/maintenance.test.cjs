const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { pages, probe, checkSite, safeBase } = require('../scripts/maintenance/check-site.cjs');
const { parseAudit } = require('../scripts/maintenance/audit.cjs');
const { syncIncident, reportData, marker } = require('../scripts/maintenance/report-issue.cjs');
const { normalizeChecks } = require('../scripts/maintenance/summary.cjs');

const healthyChecks = Object.fromEntries(['install','tests','typescript','lint','build','smoke','audit'].map(name => [name,'success']));
const healthy = { quality: { result: 'success', outputs: { checks: JSON.stringify(healthyChecks), audit_total: '0', audit_production: '0' } }, 'public-pages': { result: 'success' } };
const failed = { ...healthy, 'public-pages': { result: 'failure' } };
const runUrl = 'https://github.com/tosca201098-jpg/el-viajero-web/actions/runs/123';
const htmlResponse = page => new Response(page.markers.join(' '), { status: 200, headers: { 'Content-Type': page.type } });

test('HTTP maintenance covers all main pages without requesting APIs, images, scripts or submitting forms', async () => {
  const calls = [];
  const results = await checkSite({ fetcher: async (url, options) => {
    calls.push({ url, options });
    return htmlResponse(pages.find(page => page.path === url.pathname));
  }});
  assert.equal(results.length, 21);
  assert.ok(results.every(row => row.ok));
  assert.equal(new Set(calls.map(call => call.url.pathname)).size, 21);
  assert.equal(calls.filter(call => call.url.pathname.startsWith('/temporadas/')).length, 4);
  assert.equal(calls.filter(call => call.url.pathname.startsWith('/viajes-baratos/')).length, 12);
  for (const { url, options } of calls) {
    assert.equal(url.origin, 'https://destinauta.com');
    assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'manual');
    assert.ok(!url.pathname.startsWith('/api/'));
    assert.equal(url.search, '');
  }
});

test('HTTP 200 with an error page or wrong content type is a failure', async () => {
  for (const response of [new Response('Error interno', {headers:{'content-type':'text/html'}}), new Response('buscador', {headers:{'content-type':'text/plain'}})]) {
    const result = await probe(pages[0], {fetcher:async()=>response});
    assert.equal(result.ok, false);
    assert.ok(['content','content-type'].includes(result.reason));
  }
});

test('temporary failures retry once, while a genuine 404 remains a failure', async () => {
  let calls = 0;
  const recovered = await probe(pages[0], {fetcher:async()=>++calls === 1 ? new Response('',{status:503}) : htmlResponse(pages[0])});
  assert.equal(recovered.ok,true); assert.equal(calls,2);
  calls = 0;
  const missing = await probe(pages[0], {fetcher:async()=>{calls++;return new Response('',{status:404});}});
  assert.equal(missing.ok,false);assert.equal(missing.reason,'http-404');assert.equal(calls,1);
});

test('timeouts are recorded without printing exception text or assuming the site is healthy', async () => {
  let calls=0;
  const result=await probe(pages[0],{fetcher:async()=>{calls++;throw new DOMException('sensitive-provider-message','TimeoutError');}});
  assert.equal(calls,2);assert.equal(result.ok,false);assert.equal(result.reason,'timeout');
  assert.ok(!JSON.stringify(result).includes('sensitive'));
});

test('redirects to providers or API routes are never followed', async () => {
  for(const location of ['https://api.openai.com/v1/responses','https://api.travelpayouts.com/','/api/voice','/?key=private']){
    let calls=0;
    const result=await probe(pages[0],{fetcher:async()=>{calls++;return new Response(null,{status:302,headers:{location}});}});
    assert.equal(result.reason,'unsafe-redirect');assert.equal(calls,1);
  }
  assert.throws(()=>safeBase('https://example.com'));
  assert.throws(()=>safeBase('https://destinauta.com/?token=secret'));
  assert.throws(()=>safeBase('http://destinauta.com'));
  await assert.rejects(probe({path:'/api/voice',markers:[],type:'text/html'}),/Ruta no permitida/);
});

test('network guard blocks actual fetch/http/https/tls/socket connections to providers before opening sockets', () => {
  const guard=path.resolve(__dirname,'../scripts/maintenance/network-guard.cjs');
  const code=`const assert=require('node:assert/strict');require(${JSON.stringify(guard)});(async()=>{
    await assert.rejects(fetch('https://api.openai.com/v1/responses'),e=>e.code==='MAINTENANCE_NETWORK_BLOCKED');
    for(const op of [()=>require('node:https').get('https://api.travelpayouts.com/'),()=>require('node:http').get('http://example.com/'),()=>require('node:tls').connect({host:'api.openai.com',port:443}),()=>new(require('node:net').Socket)().connect({host:'api.openai.com',port:443})])assert.throws(op,e=>e.code==='MAINTENANCE_NETWORK_BLOCKED');
  })().catch(()=>process.exitCode=1);`;
  const result=spawnSync(process.execPath,['-e',code],{encoding:'utf8',timeout:10000,env:{...process.env,MAINTENANCE_ALLOW_FONTS:'0'}});
  assert.equal(result.status,0,result.stderr);
});

test('build guard permits only the free Google font hosts, with a mocked fetch for this test', () => {
  const guard=path.resolve(__dirname,'../scripts/maintenance/network-guard.cjs');
  const code=`globalThis.fetch=async()=>({ok:true});require(${JSON.stringify(guard)});(async()=>{
    const assert=require('node:assert/strict');assert.equal((await fetch('https://fonts.googleapis.com/css')).ok,true);
    assert.equal((await fetch('https://fonts.gstatic.com/example.woff2')).ok,true);
    await assert.rejects(fetch('https://api.openai.com'),e=>e.code==='MAINTENANCE_NETWORK_BLOCKED');
  })().catch(()=>process.exitCode=1);`;
  const result=spawnSync(process.execPath,['-e',code],{encoding:'utf8',timeout:10000,env:{...process.env,MAINTENANCE_ALLOW_FONTS:'1'}});
  assert.equal(result.status,0,result.stderr);
});

test('npm audit distinguishes a known vulnerability, a clean result and an unavailable registry', () => {
  const counts={low:1,moderate:0,high:0,critical:0,total:1};
  const report=parseAudit(JSON.stringify({metadata:{vulnerabilities:counts},vulnerabilities:{example:{name:'example',severity:'low',isDirect:false,fixAvailable:true,via:[{url:'https://github.com/advisories/GHSA-abcd-1234-5678'}]}}}),1);
  assert.equal(report.available,true);assert.equal(report.counts.low,1);assert.equal(report.packages[0].fixAvailable,true);
  assert.equal(parseAudit(JSON.stringify({metadata:{vulnerabilities:{low:0,moderate:0,high:0,critical:0,total:0}}}),0).counts.total,0);
  for(const [data,code] of [['not JSON',1],[JSON.stringify({error:{code:'ENETUNREACH'}}),1],[JSON.stringify({metadata:{vulnerabilities:counts}}),null]]){
    assert.equal(parseAudit(data,code).available,false);
  }
});

function mockApi(issues) {
  const mutations=[];
  const api=async(method,route,body)=>{
    if(method==='GET')return issues;
    mutations.push({method,route,body});return{number:12};
  };
  return{api,mutations};
}
test('first failure creates one issue and a repeated failure updates the same issue',async()=>{
  const first=mockApi([]);
  assert.equal(await syncIncident({...first,needs:failed,runUrl}),'created');
  assert.equal(first.mutations.length,1);assert.equal(first.mutations[0].method,'POST');
  const repeated=mockApi([{number:12,state:'open',body:marker}]);
  assert.equal(await syncIncident({...repeated,needs:failed,runUrl}),'updated');
  assert.equal(repeated.mutations.length,1);assert.equal(repeated.mutations[0].route,'/issues/12');
  assert.equal(repeated.mutations[0].method,'PATCH');
});
test('recovery closes the same issue and recurrence reopens it, without duplicating it',async()=>{
  const recovery=mockApi([{number:12,state:'open',body:marker}]);
  assert.equal(await syncIncident({...recovery,needs:healthy,runUrl}),'closed');
  assert.equal(recovery.mutations[0].body.state,'closed');
  const recurrence=mockApi([{number:12,state:'closed',body:marker}]);
  assert.equal(await syncIncident({...recurrence,needs:failed,runUrl}),'reopened');
  assert.equal(recurrence.mutations[0].method,'PATCH');assert.equal(recurrence.mutations[0].body.state,'open');
});
test('healthy runs do not create issues; skipped or missing checks cannot close an incident',async()=>{
  const empty=mockApi([]);
  assert.equal(await syncIncident({...empty,needs:healthy,runUrl}),'healthy');assert.equal(empty.mutations.length,0);
  for(const needs of [{},{...healthy,quality:{result:'success',outputs:{}}},{...healthy,quality:{result:'cancelled'}},{...healthy,'public-pages':{result:'skipped'}}])assert.equal(reportData(needs,runUrl).healthy,false);
  assert.equal(normalizeChecks({tests:'success'}).build,'skipped');
});
test('issue lookup paginates and ignores pull requests with a matching marker',async()=>{
  let gets=0;const writes=[];
  const api=async(method,route,body)=>{
    if(method==='GET')return ++gets===1 ? Array.from({length:100},()=>({pull_request:{},body:marker})) : [{number:45,state:'open',body:marker}];
    writes.push({method,route,body});return{};
  };
  assert.equal(await syncIncident({api,needs:failed,runUrl}),'updated');assert.equal(gets,2);assert.equal(writes[0].route,'/issues/45');
});
test('GitHub API failures are visible instead of being reported as a successful notification',async()=>{
  await assert.rejects(syncIncident({api:async()=>{throw Error('HTTP 403');},needs:failed,runUrl}),/403/);
});
test('workflow uses only public standard runners, pinned official actions, no paid secrets/storage and isolated issue permission',()=>{
  const yaml=require('js-yaml');
  const workflow=yaml.load(fs.readFileSync(path.join(__dirname,'../.github/workflows/daily-maintenance.yml'),'utf8'));
  assert.equal(workflow.on.schedule[0].cron,'37 5 * * *');assert.ok(Object.hasOwn(workflow.on,'workflow_dispatch'));
  assert.equal(workflow.concurrency['cancel-in-progress'],false);
  assert.equal(workflow.permissions.contents,'read');assert.equal(workflow.permissions.issues,undefined);
  for(const [name,job]of Object.entries(workflow.jobs)){
    assert.equal(job['runs-on'],'ubuntu-24.04');assert.ok(job['timeout-minutes']<=20);
    assert.match(job.if,/visibility == 'public'/);
    for(const step of job.steps){
      if(step.uses)assert.match(step.uses,/^actions\/(checkout|setup-node)@[a-f0-9]{40}$/);
      if(step.with)assert.ok(!step.with.cache);
    }
    if(name!=='incident')assert.ok(!job.permissions?.issues);
  }
  assert.equal(workflow.jobs.incident.permissions.issues,'write');
  assert.match(workflow.jobs.incident.if,/event_name != 'pull_request'/);
  assert.match(workflow.jobs['public-pages'].if,/event_name != 'pull_request'/);
  for(const name of ['OPENAI_API_KEY','TRAVELPAYOUTS_API_TOKEN','RESEND_API_KEY'])assert.equal(workflow.env[name],'');
  const source=fs.readFileSync(path.join(__dirname,'../.github/workflows/daily-maintenance.yml'),'utf8');
  assert.ok(!/pull_request_target|audit fix|upload-artifact|secrets\.|VERCEL_TOKEN/.test(source));
});
