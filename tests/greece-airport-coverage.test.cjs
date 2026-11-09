const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(globals={}){const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const next=[base+'.ts',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));if(!next)throw Error(id);return load(next);}});return exports;}return load;}
const load=loader(),catalog=load('lib/destinations/index.ts'),airports=load('lib/travelpayouts/greece-airports.ts');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
test('all 224 prior profiles, approved Athens photo and sixteen original homepage cards remain identical',()=>{
 const before=require('./fixtures/pre-greece-airport-coverage.json');assert.equal(before.profiles.length,224);
 for(const p of before.profiles)assert.equal(digest(catalog.getDestinationById(p.id)),p.sha256,p.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
 assert.equal(catalog.getDestinationsByCountry('GR').length,39);assert.equal(catalog.destinationProfiles.length,251);
});
test('all fourteen Fraport airport identities are covered once within the thirty-nine-profile Greek batch',()=>{
 const official=['KVA','SKG','CFU','MJT','JSI','PVK','EFL','ZTH','SMI','JMK','KGS','JTR','RHO','CHQ'];
 for(const code of official){const found=catalog.getDestinationsByCountry('GR').filter(p=>p.airports.some(a=>a.iataCode===code));assert.equal(found.length,1,code);assert.equal(catalog.findDestinationProfile({iataCode:code}),found[0]);}
 for(const code of ['KVA','MJT'])assert.ok(airports.greeceAirports.find(a=>a.code===code)?.name);
});
test('new full airport names and common island names yield the correct selectable profile without remote matches',async()=>{
 const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
 const select=load('lib/destinations/selection.ts').destinationFromPlaceSelection;
 for(const [term,id]of [['Kavala — Alexander the Great','gr-kavala'],['Mytilene — Odysseas Elytis','gr-mytilene'],['Lesbos','gr-mytilene'],['Lesvos','gr-mytilene']]){
  const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));
  assert.equal(response.status,200);assert.ok((await response.json()).suggestions.some(s=>select(s)?.id===id),term);
 }
});
test('the Mytilene author release is represented as public domain, never invented as CC0 or a CC BY licence',()=>{
 const p=catalog.getDestinationById('gr-mytilene');assert.equal(p.imageCredit,'Koutrolm');assert.equal(p.imageLicense,'Public domain');
 assert.equal(p.imageLicenseUrl,'https://creativecommons.org/publicdomain/mark/1.0/');
 assert.ok(p.imageSource.endsWith('Mytilene_2010-04-03.jpg'));
});
