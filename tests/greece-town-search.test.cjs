const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(globals={}) {
  const cache=new Map();
  function load(file) {
    file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);
    const exports={};cache.set(file,exports);
    const output=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{
      compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020},
    }).outputText;
    vm.runInNewContext(output,{exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{
      const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);
      const next=[base+'.ts',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));
      if(!next)throw Error(id);return load(next);
    }},{filename:file});return exports;
  }
  return load;
}
const load=loader(),catalog=load('lib/destinations/index.ts');
const airports=load('lib/travelpayouts/greece-airports.ts');
const selection=load('lib/destinations/selection.ts');
const towns=load('lib/destinations/greece-airport-towns.ts');
const locales=['es','en','fr','de','it','pt','ca'];

test('every translated reference-town label and its bare town resolve to the existing Greek profile',()=>{
  for(const profile of catalog.getDestinationsByCountry('GR')) {
    const code=profile.iataCodes[0];
    for(const locale of locales) {
      const label=towns.greeceAirportTown(code,locale);
      const bare=label.replace(/\s*\([^)]*\)/g,'').trim();
      for(const name of [label,bare]) {
        assert.equal(catalog.findDestinationProfile({name}),profile,code+':'+name);
        assert.ok(airports.greeceAirportsForTerm(name).some(a=>a.code===code),name);
        assert.ok(airports.greeceTouristPlacesForTerm(name.slice(0,4)).some(a=>a.code===code),name);
      }
    }
  }
});

test('town searches remain specific and cannot select an unrelated country',()=>{
  assert.equal(catalog.findDestinationProfile({name:'Chora'}),undefined);
  assert.equal(airports.greeceAirportsForTerm('Chora').length,0);
  for(const [name,code] of [['Fira','JTR'],['Argostoli','EFL'],['Pitagorio','SMI'],['Chora de Miconos','JMK']]) {
    const profile=catalog.findDestinationProfile({iataCode:code});
    assert.equal(selection.destinationFromPlaceSelection({type:'city',name,country:'Grecia',code:null,cityName:null,cityCode:null}),profile);
    assert.equal(selection.destinationFromPlaceSelection({type:'city',name,country:'Italia',code:null,cityName:null,cityCode:null}),undefined);
  }
});

test('city names and prefixes offer selectable existing cards with an empty valid provider response',async()=>{
  const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
  for(const [name,code] of [['Fira','JTR'],['Argostoli','EFL'],['Pitagorio','SMI'],['Chora de Miconos','JMK']]) {
    const expected=catalog.findDestinationProfile({iataCode:code});
    for(const term of [name,name.slice(0,3)]) {
      const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));
      const {suggestions}=await response.json();
      assert.ok(suggestions.some(s=>selection.destinationFromPlaceSelection(s)?.id===expected.id),term);
    }
  }
});

test('town aliases keep provider failures safe and do not add country-wide suggestions',async()=>{
  const failed=loader({fetch:async()=>{throw Error('Simulated outage');}})('app/api/travelpayouts/places/route.ts');
  const response=await failed.GET(new Request('https://example.test/api/travelpayouts/places?term=Argostoli'));
  assert.equal((await response.json()).suggestions.length,0);
  assert.equal(airports.greeceTouristPlacesForTerm('Grecia').length,0);
});
