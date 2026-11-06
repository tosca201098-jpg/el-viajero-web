const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function loader(globals={}){const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const next=[base+'.ts',path.join(base,'index.ts')].find(f=>fs.existsSync(path.join(root,f)));if(!next)throw Error(id);return load(next);}});return exports;}return load;}
const load=loader(),catalog=load('lib/destinations/index.ts'),coverage=load('lib/destinations/france-airport-coverage.ts'),airports=load('lib/travelpayouts/france-airports.ts');
const select=load('lib/destinations/selection.ts').destinationFromPlaceSelection;
const baseline=require('./fixtures/pre-france-airport-coverage.json');
const codes={MPL:'montpellier',AJA:'ajaccio',BIA:'bastia',BIQ:'biarritz',FSC:'figari',BES:'brest',LDE:'lourdes',RNS:'rennes',PGF:'perpignan',CLY:'calvi',CFR:'caen',CCF:'carcassonne',LRH:'la-rochelle',BZR:'beziers',LIG:'limoges',CFE:'clermont-ferrand',GNB:'grenoble',FNI:'nimes',EGC:'bergerac',TLN:'toulon',PUF:'pau',TUF:'tours',CMF:'chambery',RDZ:'rodez',ETZ:'metz',BVE:'brive-la-gaillarde',DLE:'dole',PIS:'poitiers',XCR:'chalons-en-champagne',DOL:'deauville',DCM:'castres',AUR:'aurillac',EBU:'saint-etienne',LRT:'lorient',LPY:'le-puy-en-velay',OUI:'ouessant'};
const locales=['es','en','fr','de','it','pt','ca'];
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const plain=value=>JSON.parse(JSON.stringify(value));

test('thirty-six French airport cities preserve every prior profile, photo and original homepage card',()=>{
 assert.equal(baseline.profiles.length,224);assert.equal(catalog.destinationProfiles.length,260);assert.equal(catalog.getDestinationsByCountry('FR').length,48);
 for(const old of baseline.profiles)assert.equal(digest(catalog.getDestinationById(old.id)),old.sha256,old.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),baseline.featuredSha256);
 assert.equal(new Set(catalog.destinationProfiles.map(p=>p.id)).size,260);assert.equal(new Set(catalog.destinationProfiles.map(p=>p.slug)).size,260);
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

test('all thirty-six physical airports and city codes match the actual public provider snapshot',()=>{
 const snapshot=require('./fixtures/france-airport-provider.json');assert.equal(snapshot.airports.length,36);assert.equal(snapshot.cities.length,36);
 for(const code of Object.keys(codes)){
  const physical=snapshot.airports.find(a=>a.code===code);assert.equal(physical.country_code,'FR');assert.equal(physical.iata_type,'airport');assert.equal(physical.flightable,true);
  assert.equal(physical.city_code,code==='GNB'?'LYS':code);assert.equal(snapshot.cities.find(c=>c.code===physical.city_code).country_code,'FR');
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
 const photos=require('./fixtures/france-airport-photos.json');assert.equal(Object.keys(photos).length,36);
 for(const[slug,photo]of Object.entries(photos)){
  const p=catalog.getDestinationById('fr-'+slug);assert.equal(p.image,photo.url);assert.equal(p.imageSource,photo.source);assert.equal(p.imageCredit,photo.artist);assert.equal(p.imageLicense,photo.license);assert.equal(p.imageLicenseUrl,photo.licenseUrl);assert.equal(p.imagePosition,photo.position);
  assert.match(p.image,/^https:\/\/thumb.wikimedia.org\//);assert.match(p.imageLicense,/^CC BY/);assert.ok(photo.width>=960);assert.ok(!/<[^>]+>/.test(p.imageCredit));
  for(const key of ['price','hotelId','flightPrice','available','apiKey','token'])assert.equal(p[key],undefined);
 }
});

test('Lourdes does not recommend closed Pic du Jer paths and Figari labels its excursions outside the village',()=>{
 const lourdes=catalog.getDestinationById('fr-lourdes'),figari=catalog.getDestinationById('fr-figari');
 for(const locale of locales){assert.ok(!/Pic du Jer/i.test(lourdes.translations[locale].recommendations.join(' ')));assert.ok(lourdes.translations[locale].seasonalityNote.includes('Tarbes'));}
 assert.match(figari.seasonalityNote,/excursiones fuera del pueblo/);assert.match(figari.seasonalityNote,/protegidos/);
});

test('second French lot preserves all 232 earlier profiles and documents the temporary CCF closure',()=>{
 const previous=require('./fixtures/pre-france-second-batch.json');assert.equal(previous.profiles.length,232);
 for(const old of previous.profiles)assert.equal(digest(catalog.getDestinationById(old.id)),old.sha256,old.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),previous.featuredSha256);
 const carcassonne=catalog.getDestinationById('fr-carcassonne');
 for(const locale of locales){const note=carcassonne.translations[locale].seasonalityNote;const dates=locale==='en'?['5 November 2026','2 November 2026','13 December 2026','14 December 2026']:locale==='de'?['05.11.2026','02.11.2026','13.12.2026','14.12.2026']:['05/11/2026','02/11/2026','13/12/2026','14/12/2026'];for(const date of dates)assert.ok(note.includes(date),locale+':'+date);}
 assert.match(catalog.getDestinationById('fr-la-rochelle').seasonalityNote,/continente/);
 assert.match(catalog.getDestinationById('fr-beziers').seasonalityNote,/Portiragnes/);
 assert.match(catalog.getDestinationById('fr-clermont-ferrand').seasonalityNote,/Aulnat/);
 assert.equal(catalog.getDestinationById('fr-aulnat'),undefined);
 assert.equal(catalog.getDestinationById('fr-montferrand'),undefined);
});

test('third French lot preserves all 240 previous profiles including their image focal points',()=>{
 const previous=require('./fixtures/pre-france-third-batch.json');assert.equal(previous.profiles.length,240);
 for(const old of previous.profiles)assert.equal(digest(catalog.getDestinationById(old.id)),old.sha256,old.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),previous.featuredSha256);
 const grenoble=catalog.getDestinationById('fr-grenoble');
 for(const locale of locales)assert.ok(!grenoble.translations[locale].recommendations.some(r=>/Bastille|Bastilla/i.test(r)),'regulated Bastille access is not promoted as an open walk');
 assert.match(catalog.getDestinationById('fr-toulon').seasonalityNote,/Hyères/);
 assert.match(catalog.getDestinationById('fr-chambery').seasonalityNote,/invernal/);
});

test('Grenoble physical airport remains distinct from Lyon despite the upstream LYS city group',async()=>{
 const raw=require('./fixtures/france-airport-provider.json').airports.find(a=>a.code==='GNB');assert.equal(raw.city_code,'LYS');
 const route=loader({fetch:async()=>({ok:true,json:async()=>[{...raw,type:'airport',city_name:'Lyon'}]})})('app/api/travelpayouts/places/route.ts');
 const response=await route.GET(new Request('https://example.test/api/travelpayouts/places?term=GNB'));assert.equal(response.status,200);const data=await response.json();
 const suggestion=data.suggestions.find(s=>s.type==='airport'&&s.code==='GNB');assert.ok(suggestion);assert.equal(suggestion.cityName,'Grenoble');assert.equal(suggestion.cityCode,'GNB');
 assert.equal(select(suggestion),catalog.getDestinationById('fr-grenoble'));
 assert.equal(catalog.findDestinationProfile({iataCode:'LYS'}),catalog.getDestinationById('fr-lyon'));
 assert.equal(select({...suggestion,cityName:'Lyon',cityCode:'LYS'}),catalog.getDestinationById('fr-grenoble'));
});

test('fourth French lot preserves all 248 previous profiles and adds twelve served-city drafts',()=>{
 const previous=require('./fixtures/pre-france-fourth-batch.json');assert.equal(previous.profiles.length,248);
 for(const old of previous.profiles)assert.equal(digest(catalog.getDestinationById(old.id)),old.sha256,old.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),previous.featuredSha256);
 const fresh=['metz','brive-la-gaillarde','dole','poitiers','chalons-en-champagne','deauville','castres','aurillac','saint-etienne','lorient','le-puy-en-velay','ouessant'];
 for(const slug of fresh){const p=catalog.getDestinationById('fr-'+slug);assert.ok(p,slug);assert.equal(p.publication.status,'draft');}
 // One card per served city: shared airports do not create extra cards for Nancy, Mazamet, Trouville or Souillac.
 for(const absent of ['nancy','mazamet','trouville','souillac','goin','vatry','paris-vatry','tavaux','biard'])assert.equal(catalog.getDestinationById('fr-'+absent),undefined,absent);
 assert.equal(catalog.findDestinationProfile({iataCode:'ETZ'}).id,'fr-metz');
 assert.equal(catalog.findDestinationProfile({iataCode:'XCR'}).id,'fr-chalons-en-champagne');
 assert.equal(catalog.findDestinationProfile({iataCode:'PAR'}).id,'fr-paris');
 for(const locale of locales)assert.match(catalog.getDestinationById('fr-ouessant').translations[locale].seasonalityNote,/Brest/);
});
