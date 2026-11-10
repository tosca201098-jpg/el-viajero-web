const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(globals={}){const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const next=[base+'.ts',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));if(!next)throw Error(id);return load(next);}});return exports;}return load;}
const load=loader(),catalog=load('lib/destinations/index.ts'),airports=load('lib/travelpayouts/greece-airports.ts');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const expected=[['PAS','paros','Parikia'],['JNX','naxos','Naxos Town (Chora)'],['MLO','milos','Adamas (Milos)'],['JKH','chios','Chios Town'],['AOK','karpathos','Pigadia (Karpathos)'],['AXD','alexandroupoli','Alexandroupoli']];

test('six regional additions preserve every one of the 226 previous profiles, photographs and original homepage cards',()=>{
 const before=require('./fixtures/pre-greece-regional-b.json');assert.equal(before.profiles.length,226);
 for(const p of before.profiles)assert.equal(digest(catalog.getDestinationById(p.id)),p.sha256,p.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
 assert.equal(catalog.destinationProfiles.length,486);assert.equal(catalog.getDestinationsByCountry('GR').length,39);
});
test('six physical regional airport identities stay unique, associated with the served town, and selection-only',()=>{
 const presentation=load('lib/destinations/presentation.ts'),featured=load('lib/destinations/featured.ts').destinations;
 for(const[code,slug,town]of expected){
  const profile=catalog.getDestinationById('gr-'+slug),a=airports.greeceAirports.find(a=>a.code===code);
  assert.equal(catalog.findDestinationProfile({iataCode:code}),profile);assert.ok(a.name,code);
  assert.equal(catalog.getDestinationsByCountry('GR').filter(p=>p.iataCodes.includes(code)).length,1,code);
  assert.equal(airports.greeceAirportTown(code,'en'),town);
  assert.equal(presentation.canShowDestinationAutomatically(profile),false);assert.equal(profile.publication.status,'draft');
  assert.ok(!featured.some(p=>p.id===profile.id));assert.ok(!catalog.getPublishedDestinationPages().some(p=>p.destinationId===profile.id));
 }
});
test('airport names and scoped local aliases select the correct regional card with no external provider matches',async()=>{
 const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
 const select=load('lib/destinations/selection.ts').destinationFromPlaceSelection;
 for(const[code,slug,term]of [...expected,...[['PAS','paros','Paroikia'],['MLO','milos','Adamantas'],['AOK','karpathos','Scarpanto'],['JKH','chios','Hios'],['AXD','alexandroupoli','Dimokritos']]]){
  const airport=airports.greeceAirports.find(a=>a.code===code);
  for(const query of [term,airport.name]){
   const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(query)));
   assert.equal(response.status,200);assert.ok((await response.json()).suggestions.some(s=>select(s)?.id==='gr-'+slug),query);
  }
 }
});
test('photo licences use their actual author release rather than treating every public-domain image as CC0',()=>{
 const p=catalog.getDestinationById('gr-paros'),k=catalog.getDestinationById('gr-karpathos');
 assert.equal(p.imageCredit,'Holger Pfiffi');assert.equal(p.imageLicense,'Public domain');assert.equal(p.imageLicenseUrl,'https://creativecommons.org/publicdomain/mark/1.0/');
 assert.equal(k.imageCredit,'Luca Aless');assert.equal(k.imageLicense,'CC0 1.0');assert.equal(k.imageLicenseUrl,'https://creativecommons.org/publicdomain/zero/1.0/');
 assert.equal(catalog.getDestinationById('gr-naxos').imageLicense,'CC BY-SA 3.0');
 assert.equal(catalog.getDestinationById('gr-naxos').imageCredit,'User: Bgabel at wikivoyage shared');
 assert.ok(catalog.getDestinationById('gr-naxos').imageSource.endsWith('GR-naxos-chora-portara.jpg'));
 assert.equal(catalog.getDestinationById('gr-alexandroupoli').imageLicense,'CC BY-SA 4.0');
 assert.ok(catalog.getDestinationById('gr-alexandroupoli').imageSource.endsWith('Alexandroupolis_lighthouse_(November_2018).jpg'));
 assert.equal(catalog.getDestinationById('gr-chios').imageCredit,'Güldem Üstün');
});
