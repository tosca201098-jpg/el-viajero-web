const {test}=require('node:test'),assert=require('node:assert/strict');
const {harness,deferred,tick,trip,loader}=require('./sofia-harness.cjs');
test('tools wait for completion, suppress background interruptions and deduplicate SDK call IDs',async()=>{
 const pending=deferred();let calls=0,signal;const h=harness({onSearch:async(_,c)=>{calls++;signal=c.signal;return pending.promise}});
 await h.session.start();const a=h.call('buscar_viaje',trip,'same'),b=h.call('buscar_viaje',{...trip},'same');
 h.sdk.onModeChange({mode:'listening'});assert.equal(h.session.turnStatus,'searching');assert.equal(h.mutes.at(-1),true);
 assert.equal((await h.call('crear_itinerario',{destino:'Madrid',dias:2},'other')).error,'busy');
 assert.equal(signal.aborted,false);pending.resolve({status:'success'});
 assert.equal((await a).status,'success');assert.equal((await b).status,'success');assert.equal(calls,1);
 h.sdk.onModeChange({mode:'speaking'});assert.equal(h.mutes.at(-1),true);
 h.sdk.onModeChange({mode:'listening'});assert.equal(h.mutes.at(-1),false);h.session.stop();
});
test('Stop cancels active tools; late results never report success',async()=>{
 const p=deferred();let signal;const h=harness({onItinerary:async(_,c)=>{signal=c.signal;return p.promise}});
 await h.session.start();const result=h.call('crear_itinerario',{destino:'Madrid',dias:2});
 h.session.stop();assert.equal(signal.aborted,true);p.resolve({status:'success'});assert.equal((await result).status,'cancelled');
});
test('tool failures are sanitized, then the next turn can run',async()=>{
 const h=harness({onSearch:()=>{throw Error('private detail')}});await h.session.start();
 const result=await h.call('buscar_viaje',trip);assert.equal(result.error,'unavailable');assert.equal(JSON.stringify(result).includes('private'),false);
 h.sdk.onModeChange({mode:'listening'});assert.equal(h.session.turnStatus,'listening');h.session.stop();
});
test('provider error while speaking closes the only connection',async()=>{
 const h=harness();await h.session.start();h.sdk.onModeChange({mode:'speaking'});h.sdk.onError('private provider text');
 await tick();assert.equal(h.connection.ended,1);assert.equal(h.session.status,'idle');assert.deepEqual(h.errors,['connection']);
});
test('catalogue uses real profiles, bounds results and never invents a missing destination',async()=>{
 const query=loader()('lib/voice/catalog.ts').queryVoiceCatalog;
 assert.equal(query('zzzz-nonexistent','es').total,0);assert.ok(query('','es').destinations.length<=12);
 const paris=query('Paris','fr').destinations.find(p=>p.canonicalName==='París');assert.ok(paris);
 for(const locale of ['es','en','fr','de','it','pt','ca']){
  const h=harness({getLocale:()=>locale,onShowDestination:()=>({status:'success'})});await h.session.start();
  assert.equal(h.sdk.overrides.agent.language,locale);
  assert.equal((await h.call('consultar_catalogo',{consulta:'Paris'})).status,'success');
  assert.equal((await h.call('mostrar_destino',{destino:paris.id})).status,'success');h.session.stop();
 }
});
