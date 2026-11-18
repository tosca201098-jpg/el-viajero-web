const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {loader,trip}=require('./sofia-harness.cjs');
const load=loader(),catalog=load('lib/destinations/index.ts'),hotels=load('lib/stay22/hotels.ts');
const source=fs.readFileSync('app/page.tsx','utf8');
const a=source.indexOf('voiceSearchRef.current = (datos, context) => {'),b=source.indexOf('};  const [mensaje',a);
const code=ts.transpileModule(source.slice(a,b+2).replace('voiceSearchRef.current =','handle ='),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
function bridge(){
 const state={},scope={handle:null,findDestinationProfile:catalog.findDestinationProfile,findDestinationCard:()=>null,
 hotelDefaults:hotels.hotelDefaults,hotelsHref:hotels.hotelsHref,window:{location:{assign:url=>state.url=url}},
 document:{getElementById:()=>({click(){}})}};
 for(const name of ['setOrigen','setDestinoVuelo','setDestinoHotel','setFechaIda','setFechaVuelta','setEntrada','setSalida','setPasajeros','setHuespedes','setFlightResultsOpen','setNonFlightVoiceBudget','setModal','setDestinoSeleccionado','setPendingVoiceFlightSearch'])
 scope[name]=v=>state[name]=v;
 vm.runInNewContext(code,scope);return{state,handle:scope.handle};
}
test('voice launches real flight handler without requiring a budget',async()=>{
 const h=bridge(),result=h.handle(trip,{signal:new AbortController().signal});
 assert.equal(h.state.setPendingVoiceFlightSearch.query.destination,'París');
 assert.equal(h.state.setPendingVoiceFlightSearch.query.budget,undefined);
 h.state.setPendingVoiceFlightSearch.complete({status:'success'});assert.equal((await result).status,'success');
});
test('hotel action preserves dates and party in the existing local Stay22 route',()=>{
 const h=bridge();h.handle({...trip,servicio:'hotel'},{signal:new AbortController().signal});
 const u=new URL(h.state.url,'https://preview.test');assert.equal(u.pathname,'/hoteles');assert.equal(u.searchParams.get('adults'),'2');
 assert.equal(u.searchParams.get('checkin'),trip.fecha_ida);assert.equal(u.searchParams.get('checkout'),trip.fecha_vuelta);
});
test('combined budget is not falsely applied as a flight-only budget',async()=>{
 const h=bridge(),result=h.handle({...trip,servicio:'ambos',presupuesto:500,tipo_presupuesto:'total'},{signal:new AbortController().signal});
 assert.equal(h.state.setPendingVoiceFlightSearch.query.budget,undefined);assert.equal(h.state.setNonFlightVoiceBudget.budget.amount,500);
 h.state.setPendingVoiceFlightSearch.complete({status:'success'});await result;
});
test('stopping cancels a queued flight action without success',async()=>{
 const h=bridge(),controller=new AbortController(),result=h.handle(trip,{signal:controller.signal});
 controller.abort();assert.equal((await result).status,'cancelled');
});
