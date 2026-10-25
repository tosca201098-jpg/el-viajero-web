// Run explicitly; see docs/voice-protected-turns.md. Every provider call is mocked.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.VOICE_PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs'), path = require('node:path'), ts = require('typescript'), vm = require('node:vm');
const translations = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../../lib/i18n/translations.ts'),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:translations});
const base = process.env.VOICE_TEST_URL || 'http://127.0.0.1:3100';
const sample = { itinerary: { title:'Resultado de prueba Madrid', summary:'Resumen de prueba', days:[1,2].map(dayNumber=>({dayNumber,title:'Día de prueba',
  morning:[{name:'Museo',description:'Visita',area:'Centro'}],afternoon:[{name:'Parque',description:'Paseo',area:'Centro'}],evening:[{name:'Plaza',description:'Paseo',area:'Centro'}]})),tips:['Consejo uno','Consejo dos'] } };
const profiles = [{name:'desktop',viewport:{width:1440,height:1000}},{name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}];
async function setup(t,profile,locale='es') {
  const browser=await chromium.launch({headless:true,...(process.env.VOICE_BROWSER_EXECUTABLE?{executablePath:process.env.VOICE_BROWSER_EXECUTABLE}:{})});
  t.after(()=>browser.close());
  const {name,...device}=profile;
  const context=await browser.newContext(device),page=await context.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  await page.addInitScript(({locale})=>{
    localStorage.setItem('el-viajero.language',locale);
    const v=window.__voice={sent:[],channels:[],track:null,denied:false};
    Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:async()=>{
      if(v.denied) throw new DOMException('Denied','NotAllowedError');
      const track=v.track={enabled:true,stopped:false,stop(){this.stopped=true;}};
      return {getTracks:()=>[track],getAudioTracks:()=>[track]};
    }}});
    window.Audio=class {play(){return Promise.resolve();}pause(){} };
    window.RTCPeerConnection=class {
      constructor(){this.connectionState='new';this.senders=[];}
      addTrack(track){this.senders.push({track});}getSenders(){return this.senders;}
      createDataChannel(){const c={readyState:'connecting',send:x=>v.sent.push(JSON.parse(x)),close(){this.readyState='closed';}};this.channel=c;v.channels.push(c);return c;}
      async createOffer(){return {sdp:'v=0\nmock-offer'};}async setLocalDescription(){}
      async setRemoteDescription(){this.channel.readyState='open';setTimeout(()=>this.channel.onopen?.(),0);}
      close(){this.connectionState='closed';}
    };
  },{locale});
  // Block all third parties, including affiliates/analytics. No real voice, flights,
  // hotel, booking, authentication or generation request leaves this browser.
  await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.href==='https://api.openai.com/v1/realtime/calls') return route.fulfill({status:200,contentType:'application/sdp',body:'v=0\nmock-answer'});
    if(url.origin!==new URL(base).origin)return route.abort();
    if(url.pathname==='/api/voice')return route.fulfill({json:{value:'simulated-token'}});
    if(url.pathname.startsWith('/api/'))return route.fulfill({status:503,json:{error:'blocked-by-test'}});
    return route.continue();
  });
  await page.goto(base);await page.waitForFunction(code=>document.documentElement.lang===code,locale);
  const tr=k=>translations.translate(locale,k);
  const mic=()=>page.getByRole('button',{name:tr('voice.stop'),exact:true});
  const emit=event=>page.evaluate(event=>window.__voice.channels.at(-1).onmessage?.({data:JSON.stringify(event)}),event);
  const created=id=>emit({type:'response.created',response:{id}});
  const done=id=>emit({type:'response.done',response:{id,status:'completed',output:[]}});
  const audio=(id,state)=>emit({type:'output_audio_buffer.'+state,response_id:id});
  const commit=id=>emit({type:'input_audio_buffer.committed',item_id:id});
  const tool=(id,call,data={destino:'Madrid',dias:2},name='crear_itinerario')=>emit({type:'response.function_call_arguments.done',response_id:id,call_id:call,name,arguments:JSON.stringify(data)});
  const track=()=>page.evaluate(()=>window.__voice.track?.enabled);
  const status=async state=>{await page.getByRole('status').filter({hasText:tr('voice.turn.'+state)}).waitFor();};
  const start=async()=>{
    if(await page.getByRole('dialog').count()) await page.getByRole('button',{name:tr('common.close'),exact:true}).click();
    await page.getByRole('button',{name:tr('voice.title'),exact:true}).click();await mic().waitFor();await created('greeting');await audio('greeting','started');await done('greeting');await audio('greeting','stopped');await status('listening');
  };
  return {browser,page,pageErrors,tr,mic,emit,created,done,audio,commit,tool,track,status,start};
}
for(const profile of profiles) test(`${profile.name}: real page keeps itinerary alive under background audio, TTS, stop and new requests`,async t=>{
  const h=await setup(t,profile),{page}=h;let release,requests=0;
  const pending=new Promise(resolve=>release=resolve);
  await page.route('**/api/itinerary',async route=>{requests++;await pending;await route.fulfill({json:sample}).catch(()=>{});});
  await h.start();assert.equal(await h.track(),true);
  if(process.env.VOICE_SCREENSHOT_DIR){fs.mkdirSync(process.env.VOICE_SCREENSHOT_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.VOICE_SCREENSHOT_DIR,`earth-${profile.name}.png`),fullPage:false});}
  await h.commit('user');await h.created('request');await h.tool('request','one');await h.done('request');
  await h.status('searching');await page.waitForFunction(()=>!window.__voice.track.enabled);
  for(let i=0;i<3;i++){await h.emit({type:'input_audio_buffer.speech_started'});await h.commit('tv'+i);await h.emit({type:'conversation.item.input_audio_transcription.completed',transcript:'otra persona dice parar'});}
  await h.tool('request','other',{destino:'Lisboa',dias:3});await h.tool('request','one');
  await page.waitForTimeout(100);assert.equal(requests,1);assert.equal(await h.track(),false);
  release();await page.getByText('Resultado de prueba Madrid',{exact:true}).waitFor();
  await page.waitForFunction(()=>window.__voice.sent.filter(e=>e.type==='response.create').length===3);
  await h.created('ack');await h.audio('ack','started');await h.done('ack');await h.status('speaking');
  await h.commit('echo');await h.tool('ack','echo-tool');assert.equal(await h.track(),false);
  await page.waitForTimeout(400);assert.equal(await h.track(),false,'must wait for playback, not generation completion');
  if(process.env.VOICE_SCREENSHOT_DIR){fs.mkdirSync(process.env.VOICE_SCREENSHOT_DIR,{recursive:true});await h.mic().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.VOICE_SCREENSHOT_DIR,`voice-${profile.name}.png`),fullPage:false});}
  await h.audio('ack','stopped');await h.status('listening');assert.equal(await h.track(),true);
  await h.commit('second');await h.created('second-response');await h.tool('second-response','two');await h.done('second-response');
  await page.waitForFunction(()=>window.__voice.sent.filter(e=>e.type==='conversation.item.create'&&e.item.call_id==='two').length===1);
  assert.equal(requests,2);
  await h.created('second-ack');await h.audio('second-ack','started');await h.done('second-ack');
  await h.mic().click();assert.equal(await h.track(),false);assert.equal(await page.evaluate(()=>window.__voice.track.stopped),true);
  await h.start();await h.commit('third');await h.created('third-response');await h.done('third-response');await h.status('listening');
  await h.mic().click();assert.deepEqual(h.pageErrors,[]);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'page must fit viewport');
});
for(const profile of profiles) test(`${profile.name}: permission failure, cancellation during generation and retry`,async t=>{
  const h=await setup(t,profile),{page}=h;let requests=0,release;
  const pending=new Promise(resolve=>release=resolve);
  await page.route('**/api/itinerary',async route=>{requests++;await pending;await route.fulfill({json:sample}).catch(()=>{});});
  await page.evaluate(()=>window.__voice.denied=true);
  await page.getByRole('button',{name:h.tr('voice.title'),exact:true}).click();await page.getByRole('alert').filter({hasText:h.tr('voice.error.permission')}).waitFor();
  await page.evaluate(()=>window.__voice.denied=false);await h.start();
  await h.commit('cancel');await h.created('request');await h.tool('request','cancel-call');await h.done('request');await h.status('searching');
  await page.waitForTimeout(100);assert.equal(requests,1);await h.mic().click();release();await page.waitForTimeout(100);
  assert.equal(await page.getByText('Resultado de prueba Madrid',{exact:true}).count(),0);
  assert.equal(await page.evaluate(()=>window.__voice.sent.some(e=>e.type==='conversation.item.create'&&e.item.call_id==='cancel-call')),false);
  await h.start();await h.mic().click();assert.deepEqual(h.pageErrors,[]);
});
for(const profile of profiles) for(const {code} of translations.locales) test(`${profile.name}/${code}: localized state and accessible stop control`,async t=>{
  const h=await setup(t,profile,code);await h.start();await h.commit('user');await h.created('response');await h.status('processing');
  await h.mic().focus();assert.equal(await h.mic().evaluate(el=>el===document.activeElement),true);
  await h.mic().press('Enter');assert.equal(await h.track(),false);assert.deepEqual(h.pageErrors,[]);
});

for(const profile of profiles) test(`${profile.name}: actual flight handler waits for results, handles errors and permits a retry`,async t=>{
  const h=await setup(t,profile),{page}=h;let requests=0,release;
  const pending=new Promise(resolve=>release=resolve);
  await page.route('**/api/travelpayouts/flights?*',async route=>{
    requests++;await pending;
    if(requests===1) return route.fulfill({status:502,json:{success:false,error:'provider_error'}});
    return route.fulfill({json:{success:true,origin:{name:'Barcelona',code:'BCN'},destination:{name:'Madrid',code:'MAD'},results:[]}});
  });
  await h.start();
  const search={origen:'Barcelona',destino:'Madrid',fecha_ida:'2026-11-20',fecha_vuelta:'2026-11-23',viajeros:2,servicio:'vuelo',presupuesto:150,tipo_presupuesto:'por_persona'};
  await h.commit('flight');await h.created('flight-response');await h.tool('flight-response','flight-call',search,'buscar_viaje');await h.done('flight-response');
  await h.status('searching');await page.waitForTimeout(150);assert.equal(requests,1);assert.equal(await h.track(),false);
  await h.commit('tv');await h.tool('flight-response','duplicate',search,'buscar_viaje');
  assert.equal(await page.evaluate(()=>window.__voice.sent.some(e=>e.type==='conversation.item.create'&&e.item.call_id==='flight-call')),false);
  release();await page.waitForFunction(()=>window.__voice.sent.some(e=>e.type==='conversation.item.create'&&e.item.call_id==='flight-call'));
  assert.equal(await page.evaluate(()=>JSON.parse(window.__voice.sent.find(e=>e.item?.call_id==='flight-call').item.output).status),'error');
  await h.created('error-ack');await h.done('error-ack');await h.status('listening');
  await h.commit('retry');await h.created('retry-response');await h.tool('retry-response','retry-call',search,'buscar_viaje');await h.done('retry-response');
  await page.waitForFunction(()=>window.__voice.sent.some(e=>e.item?.call_id==='retry-call'));
  assert.equal(requests,2);assert.equal(await page.evaluate(()=>JSON.parse(window.__voice.sent.find(e=>e.item?.call_id==='retry-call').item.output).status),'success');
  await h.mic().click();assert.deepEqual(h.pageErrors,[]);
});
