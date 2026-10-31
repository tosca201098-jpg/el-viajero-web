const fs=require('fs'),path=require('path'),vm=require('vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(globals={},mocks={}) {
 const cache=new Map();
 function load(file){
  if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
  const output=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(output,{exports,AbortController,AbortSignal,URL,URLSearchParams,Request,Response,setTimeout,clearTimeout,console,JSON,Date,...globals,require:id=>{
   if(id in mocks)return mocks[id];if(id.startsWith('node:'))return require(id);
   const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);
   const found=[base+'.ts',base+'.tsx',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));
   if(!found)throw Error('Unexpected dependency '+id);return load(found);
  }});return exports;
 }return load;
}
const voice=loader()('lib/voice/session.ts');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b});return{promise,resolve,reject}};
const tick=()=>new Promise(setImmediate);
function harness(extra={}) {
 let sdk;const phases=[],errors=[],turns=[],searches=[],mutes=[];
 const connection={ended:0,endSession:async()=>{connection.ended++},setMicMuted:v=>mutes.push(v),setVolume:()=>{}};
 const session=new voice.VoiceSession({onPhase:p=>phases.push(p),onError:e=>errors.push(e),onTurn:t=>turns.push(t),
  onSearch:async args=>{searches.push(args);return{status:'success'}},
  fetcher:async()=>({ok:true,json:async()=>({token:'fake-session-token'})}),
  startConversation:async options=>{sdk=options;return connection},...extra});
 return{session,phases,errors,turns,searches,mutes,connection,get sdk(){return sdk},
 call:(name,args,id='call-'+Math.random())=>{
  sdk.onIncomingEvent({type:'client_tool_call',client_tool_call:{tool_call_id:id,parameters:args}});
  return sdk.clientTools[name](args).then(JSON.parse);
 }};
}
const trip={origen:'Madrid',destino:'París',fecha_ida:'2027-03-10',fecha_vuelta:'2027-03-15',viajeros:2,servicio:'vuelo'};
module.exports={loader,voice,deferred,tick,harness,trip};
