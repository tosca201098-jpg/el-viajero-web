const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(globals={}){const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const next=[base+'.ts',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));if(!next)throw Error(id);return load(next);}});return exports;}return load;}
const load=loader(),catalog=load('lib/destinations/index.ts'),airports=load('lib/travelpayouts/greece-airports.ts');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const additions={GPA:'patras',LXS:'limnos',IOA:'ioannina',JIK:'ikaria',LRS:'leros',VOL:'volos',JSH:'sitia',JSY:'syros',JTY:'astypalaia',JKL:'kalymnos',KSJ:'kasos',KZS:'kastellorizo',KSO:'kastoria',KZI:'kozani',KIT:'kythira',SKU:'skyros'};

test('final Greece expansion preserves all 232 previous profiles, approved photographs and sixteen original homepage cards',()=>{
 const before=require('./fixtures/pre-greece-final.json');assert.equal(before.base,'b74020902464625a699ee95cde8b6849354f1a62');assert.equal(before.profiles.length,232);
 for(const p of before.profiles)assert.equal(digest(catalog.getDestinationById(p.id)),p.sha256,p.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),before.featuredSha256);
 assert.equal(catalog.destinationProfiles.length,251);assert.equal(catalog.getDestinationsByCountry('GR').length,39);
});
test('all 39 physical airports in the HCAA network and all 22 Growthfund regional airports have exactly one Greek card',()=>{
 const regional=['PAS','AXD','JKH','AOK','JNX','GPA','LXS','IOA','MLO','JIK','JSH','KIT','VOL','JTY','LRS','JSY','SKU','JKL','KZS','KZI','KSJ','KSO'];
 const expected=[...regional,'ATH','HER','KLX','PVK','CHQ','CFU','KVA','EFL','KGS','MJT','JMK','RHO','SMI','JTR','JSI','SKG','ZTH'];
 assert.equal(new Set(expected).size,39);assert.equal(airports.greeceAirports.length,39);
 assert.deepEqual(Array.from(airports.greeceAirports,a=>a.code).sort(),expected.sort());
 for(const code of expected){const matches=catalog.getDestinationsByCountry('GR').filter(p=>p.airports.some(a=>a.iataCode===code));assert.equal(matches.length,1,code);assert.equal(catalog.findDestinationProfile({iataCode:code}),matches[0]);}
});
test('new full airport names and all translated reference towns resolve without introducing an ambiguous bare Chora alias',async()=>{
 const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
 const select=load('lib/destinations/selection.ts').destinationFromPlaceSelection;
 for(const[code,slug]of Object.entries(additions)){
  const a=airports.greeceAirports.find(a=>a.code===code);assert.ok(a?.name,code);
  const terms=[a.name,...['es','en','fr','de','it','pt','ca'].map(locale=>airports.greeceAirportTown(code,locale))];
  for(const term of new Set(terms)){const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));assert.equal(response.status,200);assert.ok((await response.json()).suggestions.some(s=>select(s)?.id==='gr-'+slug),term);}
 }
 assert.equal(airports.greeceAirportsForTerm('Chora').length,0);
 assert.equal(catalog.findDestinationProfile({name:'Chora'}),undefined);
 for(const[term,id]of [['Chora of Astypalaia','gr-astypalaia'],['Chora of Kythira','gr-kythira'],['Chora of Skyros','gr-skyros']])assert.equal(catalog.findDestinationProfile({name:term})?.id,id);
});
test('final photo releases retain the real attribution, distinguish public domain from CC0 and use the unscaled 960px Kalymnos original',()=>{
 const skyros=catalog.getDestinationById('gr-skyros'),kasos=catalog.getDestinationById('gr-kasos'),kalymnos=catalog.getDestinationById('gr-kalymnos');
 assert.equal(skyros.imageCredit,'Han borg');assert.equal(skyros.imageLicense,'Public domain');assert.equal(skyros.imageLicenseUrl,'https://creativecommons.org/publicdomain/mark/1.0/');
 assert.equal(kasos.imageCredit,'Luca Aless');assert.equal(kasos.imageLicense,'CC0 1.0');assert.equal(kasos.imageLicenseUrl,'https://creativecommons.org/publicdomain/zero/1.0/');
 assert.match(kalymnos.image,/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/.*Calymnos_harbour\.jpg$/);assert.ok(kalymnos.imageCredit.includes('Kalogeropoulos'));
 for(const slug of Object.values(additions)){const p=catalog.getDestinationById('gr-'+slug);assert.ok(p.imageCredit.trim());assert.ok(!/<[^>]+>/.test(p.imageCredit));assert.match(p.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);assert.match(p.imageLicenseUrl,/^https:\/\/creativecommons\.org\//);}
});

test('all sixteen new photo URLs match the canonical URLs actually returned by Commons, including underscores and Unicode filenames',()=>{
 const urls=require('./fixtures/greece-final-photo-urls.json');assert.equal(Object.keys(urls).length,16);
 for(const[id,url]of Object.entries(urls))assert.equal(decodeURIComponent(catalog.getDestinationById(id).image),decodeURIComponent(url),id);
});
