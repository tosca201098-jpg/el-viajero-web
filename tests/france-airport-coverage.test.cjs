const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(globals={}){const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const next=[base+'.ts',path.join(base,'index.ts')].find(f=>fs.existsSync(path.join(root,f)));if(!next)throw Error(id);return load(next);}});return exports;}return load;}
const load=loader(),catalog=load('lib/destinations/index.ts'),coverage=load('lib/destinations/france-airport-coverage.ts'),airports=load('lib/travelpayouts/france-airports.ts');
const select=load('lib/destinations/selection.ts').destinationFromPlaceSelection;
const baseline=require('./fixtures/pre-france-airport-coverage.json');
const codes={MPL:'montpellier',AJA:'ajaccio',BIA:'bastia',BIQ:'biarritz',FSC:'figari',BES:'brest',LDE:'lourdes',RNS:'rennes'};
const locales=['es','en','fr','de','it','pt','ca'];
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const plain=value=>JSON.parse(JSON.stringify(value));

test('eight French airport cities preserve every prior profile, photo and original homepage card',()=>{
 assert.equal(baseline.profiles.length,224);assert.equal(catalog.destinationProfiles.length,232);assert.equal(catalog.getDestinationsByCountry('FR').length,20);
 for(const old of baseline.profiles)assert.equal(digest(catalog.getDestinationById(old.id)),old.sha256,old.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),baseline.featuredSha256);
 assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,232);assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,232);
 assert.deepEqual(Array.from(coverage.franceAirportCoverage,p=>p.id),Object.values(codes).map(slug=>'fr-'+slug));
});

test('airport codes open a single served-city card and retain existing multi-airport city groups',()=>{
 for(const[code,slug]of Object.entries(codes)){
  const p=catalog.getDestinationById('fr-'+slug);assert.deepEqual(Array.from(p.airports,a=>a.iataCode),[code]);assert.equal(catalog.findDestinationProfile({iataCode:code}),p);
  for(const type of ['airport','city'])assert.equal(select({type,name:p.name,code,country:'Francia',cityName:p.name,cityCode:code}),p);
  assert.equal(select({type:'airport',name:p.name,code,country:'Bielorrusia',cityName:p.name,cityCode:code}),undefined);
 }
 for(const[city,allCodes]of [['fr-paris',['CDG','ORY','BVA','PAR']],['it-rome',['FCO','CIA','ROM']]]){
  const p=catalog.getDestinationById(city);assert.ok(p,city);for(const code of allCodes)assert.equal(catalog.findDestinationProfile({iataCode:code}),p,code);
 }
 assert.equal(catalog.findDestinationProfile({iataCode:'GVA'})?.id,'ch-geneva');
 assert.equal(catalog.findDestinationProfile({iataCode:'BSL'})?.id,'ch-basel');
 assert.equal(catalog.findDestinationProfile({iataCode:'MLH'})?.id,'ch-basel');
});

test('all eight physical airports and city codes match the actual public provider snapshot',()=>{
 const snapshot=require('./fixtures/france-airport-provider.json');assert.equal(snapshot.airports.length,8);assert.equal(snapshot.cities.length,8);
 for(const code of Object.keys(codes)){
  const physical=snapshot.airports.find(a=>a.code===code);assert.equal(physical.country_code,'FR');assert.equal(physical.iata_type,'airport');assert.equal(physical.flightable,true);
  assert.equal(physical.city_code,code);assert.equal(snapshot.cities.find(c=>c.code===code).country_code,'FR');
 }
 assert.deepEqual(Array.from(airports.franceAirports,a=>a.code),Object.keys(codes));
});

test('physical airport names, provider aliases and translated city names remain selectable with an empty external result',async()=>{
 const route=loader({fetch:async()=>({ok:true,json:async()=>[]})})('app/api/travelpayouts/places/route.ts');
 const localization=load('lib/destinations/localization.ts');
 for(const[code,slug]of Object.entries(codes)){
  const p=catalog.getDestinationById('fr-'+slug),a=airports.franceAirports.find(a=>a.code===code);
  const terms=new Set([code,a.name,...p.aliases,...locales.map(locale=>localization.getDestinationText(p,locale).name)]);
  for(const term of terms){const r=await route.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)));assert.equal(r.status,200);const data=await r.json();assert.ok(data.suggestions.some(s=>select(s)?.id===p.id),term);assert.equal(new Set(data.suggestions.map(s=>[s.country,s.type,s.code].join(':'))).size,data.suggestions.length,term);}
 }
});

test('seven-language city text, itinerary input and airport selection remain canonical and immutable',()=>{
 const localization=load('lib/destinations/localization.ts'),itinerary=load('lib/itinerary/server.ts');
 for(const p of coverage.franceAirportCoverage)for(const locale of locales){
  const before=JSON.stringify(p),d=localization.getDestinationText(p,locale);
  for(const field of ['name','description','recommendedStay','seasonalityNote'])assert.ok(d[field]?.trim(),p.id+':'+locale+':'+field);
  assert.equal(d.recommendations.length,4);assert.equal(catalog.findDestinationProfile({name:d.name}),p);
  assert.ok(d.seasonalityNote.includes(p.iataCodes[0]));assert.equal(airports.franceAirportTown(p.iataCodes[0],locale),d.name);
  const validated=itinerary.validateItineraryRequest({destination:plain(p),days:2,locale});assert.ok(validated,p.id);assert.equal(validated.destination,p);
  assert.equal(JSON.stringify(p),before);
 }
});

test('new city cards remain draft and excluded from automatic recommendations and sitemap',()=>{
 const presentation=load('lib/destinations/presentation.ts');
 for(const p of coverage.franceAirportCoverage){assert.equal(p.publication.status,'draft');assert.equal(presentation.canShowDestinationAutomatically(p),false);assert.ok(p.bestMonths.length);assert.ok(p.lowSeasonMonths.every(m=>!p.highSeasonMonths.includes(m)));}
 assert.deepEqual(plain(catalog.getPublishedDestinationPages()),[]);
});

test('real photo URLs and individual attribution match the Commons metadata without adding private or price data',()=>{
 const photos=require('./fixtures/france-airport-photos.json');assert.equal(Object.keys(photos).length,8);
 for(const[slug,photo]of Object.entries(photos)){
  const p=catalog.getDestinationById('fr-'+slug);assert.equal(p.image,photo.url);assert.equal(p.imageSource,photo.source);assert.equal(p.imageCredit,photo.artist);assert.equal(p.imageLicense,photo.license);assert.equal(p.imageLicenseUrl,photo.licenseUrl);
  assert.match(p.image,/^https:\/\/thumb.wikimedia.org\//);assert.match(p.imageLicense,/^CC BY/);assert.ok(photo.width>=960);assert.ok(!/<[^>]+>/.test(p.imageCredit));
  for(const key of ['price','hotelId','flightPrice','available','apiKey','token'])assert.equal(p[key],undefined);
 }
});

test('Lourdes does not recommend closed Pic du Jer paths and Figari labels its excursions outside the village',()=>{
 const lourdes=catalog.getDestinationById('fr-lourdes'),figari=catalog.getDestinationById('fr-figari');
 for(const locale of locales){assert.ok(!/Pic du Jer/i.test(lourdes.translations[locale].recommendations.join(' ')));assert.ok(lourdes.translations[locale].seasonalityNote.includes('Tarbes'));}
 assert.match(figari.seasonalityNote,/excursiones fuera del pueblo/);assert.match(figari.seasonalityNote,/protegidos/);
});
