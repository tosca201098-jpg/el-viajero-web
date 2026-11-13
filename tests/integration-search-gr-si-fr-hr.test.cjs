// Comprueba que el buscador de lugares conserva a la vez Grecia, Eslovenia, Francia y Croacia tras integrar las ramas de Codex.
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(globals={}){const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{
 if(id.startsWith('@/'))return load(id.slice(2)+'.ts');if(id.startsWith('./')&&!id.includes('/api/'))return load(path.posix.join(path.posix.dirname(file),id.slice(2))+'.ts');if(id.startsWith('../'))return load(path.posix.normalize(path.posix.join(path.posix.dirname(file),id))+'.ts');return require(id);}});return exports;}
return load;}
const load=loader({fetch:async()=>({ok:true,json:async()=>[]})});
const select=load('lib/destinations/selection.ts').destinationFromPlaceSelection;
const route=load('app/api/travelpayouts/places/route.ts');
const ask=async term=>(await (await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)))).json()).suggestions;
test('el buscador devuelve a la vez resultados de Grecia, Eslovenia, Francia y Croacia sin perder ninguno',async()=>{
  for(const [term,id]of [['Kavala — Alexander the Great','gr-kavala'],['Ljubljana','si-ljubljana'],['Montpellier','fr-montpellier'],['Dubrovnik','hr-dubrovnik']]){
    const suggestions=await ask(term);
    assert.ok(Array.isArray(suggestions)&&suggestions.length>0,term);
    assert.ok(suggestions.some(s=>select(s)?.id===id),`${term} debe resolver a ${id}`);
  }
});
