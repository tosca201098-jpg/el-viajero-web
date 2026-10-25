const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function loader(globals={}){
 const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
 exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const resolved=[base+'.ts',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));if(!resolved)throw Error(id);return load(resolved);}});
 return exports;}return load;
}
const load=loader(),catalog=load('lib/destinations/index.ts'),germany=load('lib/destinations/germany.ts').germanyDestinations;
const airports=load('lib/travelpayouts/germany-airports.ts').germanyPassengerAirports;
const baseline=require('./fixtures/pre-germany-catalog.json'),provider=require('./fixtures/germany-airports.json'),samples=require('./fixtures/germany-places.json');
const digest=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const locales=['es','en','fr','de','it','pt','ca'];

test('Germany adds twelve unique profiles; all 101 existing profiles and original editorial cards remain identical',()=>{
 assert.equal(baseline.profiles.length,101);assert.equal(germany.length,12);assert.equal(catalog.destinationProfiles.length,209);
 assert.equal(new Set(catalog.destinationProfiles.map(d=>d.id)).size,209);assert.equal(new Set(catalog.destinationProfiles.map(d=>d.slug)).size,209);
 for(const d of baseline.profiles)assert.equal(digest(catalog.getDestinationById(d.id)),d.sha256,d.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),baseline.featuredSha256);
 for(const[season,sha]of Object.entries(baseline.seasonFiles))assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas/'+season+'/page.tsx'),'utf8').replace(/\r\n/g,'\n')),sha);
});

for(const locale of locales)test(locale+': all German profiles provide tourist content and the existing itinerary contract',()=>{
 const localization=load('lib/destinations/localization.ts'),server=load('lib/itinerary/server.ts');
 for(const d of germany){
  const t=d.translations[locale];assert.deepEqual(Object.keys(d.translations).sort(),locales.slice().sort());
  assert.equal(d.countryCode,'DE');assert.equal(d.country,'Alemania');
  for(const field of ['name','description','recommendedStay','seasonalityNote'])assert.ok(t[field]?.trim(),d.id+':'+field);
  assert.equal(t.recommendations.length,4);assert.equal(new Set(t.recommendations).size,4);
  assert.equal(catalog.findDestinationProfile({name:t.name}),d);
  assert.equal(localization.getDestinationCountryName(d,locale),new Intl.DisplayNames([locale],{type:'region'}).of('DE'));
  assert.equal(localization.getDestinationText(d,locale).description,t.description);
  const validated=server.validateItineraryRequest({destination:{name:d.name,country:d.country,recommendations:[...d.recommendations],recommendedStay:d.recommendedStay,bestMonths:d.bestMonths,lowSeasonMonths:d.lowSeasonMonths,highSeasonMonths:d.highSeasonMonths,seasonalityNote:d.seasonalityNote},days:2,locale});
  assert.equal(validated?.destination,d);
  for(const field of ['bestMonths','lowSeasonMonths','highSeasonMonths'])assert.ok(d[field].length&&d[field].every(m=>m>=1&&m<=12));
 }
});

function endpoint(payloads=samples){
 const calls=[];const handler=loader({fetch:async input=>{const u=new URL(input);calls.push(u);return{ok:true,json:async()=>payloads[u.searchParams.get('term')]??[]};}})('app/api/travelpayouts/places/route.ts');
 return{calls,search:async term=>(await(await handler.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)))).json()).suggestions};
}

test('all 27 physical German airport codes rank first with verified countries and provider city groups',async()=>{
 assert.equal(airports.length,27);assert.equal(provider.airports.length,27);
 for(const p of provider.airports){
  const a=airports.find(a=>a.code===p.iataCode);assert.ok(a);assert.equal(a.city_code,p.cityCode);assert.equal(p.countryCode,'DE');assert.equal(p.iataType,'airport');assert.equal(p.flightable,true);
  const api=endpoint(),results=await api.search(p.iataCode);assert.equal(results[0].type,'airport',p.iataCode);assert.equal(results[0].code,p.iataCode);assert.equal(results[0].country,'Alemania');assert.equal(results[0].cityCode,p.cityCode);
  assert.equal(api.calls.length,1);assert.equal(api.calls[0].host,'autocomplete.travelpayouts.com');
 }
});

test('required Spanish and German city names lead the recorded provider suggestions, ahead of popularity',async()=>{
 for(const[name,code]of [['Berlín','BER'],['Múnich','MUC'],['Hamburgo','HAM'],['Fráncfort','FRA'],['Colonia','CGN'],['Düsseldorf','DUS'],['Stuttgart','STR'],['Dresde','DRS'],['Berlin','BER'],['München','MUC'],['Munich','MUC'],['Hamburg','HAM'],['Frankfurt','FRA'],['Köln','CGN'],['Koeln','CGN'],['Dusseldorf','DUS'],['Dresden','DRS']]){
  assert.ok(samples[name],name+' needs a recorded response');
  const results=await endpoint().search(name);
  // The provider names physical FRA "Frankfurt": its exact name correctly outranks a city alias.
  assert.equal(results[0].type,name==='Frankfurt'?'airport':'city',name);assert.equal(results[0].code,code,name);assert.equal(results[0].country,'Alemania');
 }
 const berlin=await endpoint().search('Berlín');assert.ok(berlin.some(p=>p.type==='airport'&&p.code==='BER'));
 assert.equal(new Set(berlin.map(p=>p.country+':'+p.type+':'+p.code)).size,berlin.length);
 const dusseldorf=await endpoint({'Düsseldorf':[{type:'city',code:'DUS',name:'Düsseldorf',country_code:'DE'},{type:'airport',code:'DUS',name:'Düsseldorf',city_name:'Düsseldorf',city_code:'DUS',country_code:'DE'}]}).search('Düsseldorf');
 assert.equal(dusseldorf[0].type,'city');assert.equal(dusseldorf[1].type,'airport');assert.notEqual(dusseldorf[0].name,dusseldorf[1].name);
});

test('retired Berlin airports and the industrial Finkenwerder airport are never public scheduled alternatives',async()=>{
 for(const code of ['TXL','SXF','XFW']){
  assert.ok(!airports.some(a=>a.code===code));
  const results=await endpoint({[code]:[{type:'city',code,name:'stale',country_code:'DE'},{type:'airport',code,name:'stale airport',country_code:'DE'}]}).search(code);
  assert.equal(results.length,0);
 }
 assert.ok(!(await endpoint().search('Hamburgo')).some(p=>p.code==='XFW'));
});

test('remote access airports keep their actual identity and provider pricing groups',()=>{
 const code=c=>airports.find(a=>a.code===c),input=load('lib/destinations/selection.ts').accessAirportSearchInput;
 assert.equal(code('FMM').city_code,'FMM');assert.equal(code('HHN').city_code,'FRA');assert.equal(code('NRN').city_code,'DUS');assert.equal(code('LBC').city_code,'HAM');
 assert.equal(catalog.findDestinationProfile({iataCode:'FMM'}),undefined);
 const munich=catalog.getDestinationById('de-munich'),frankfurt=catalog.getDestinationById('de-frankfurt'),dusseldorf=catalog.getDestinationById('de-dusseldorf');
 assert.deepEqual(Array.from(munich.iataCodes),['MUC']);assert.deepEqual(Array.from(frankfurt.iataCodes),['FRA']);assert.deepEqual(Array.from(dusseldorf.iataCodes),['DUS']);
 assert.equal(input(munich,'FMM'),'Memmingen');assert.equal(input(frankfurt,'HHN'),'Fráncfort');assert.equal(input(dusseldorf,'NRN'),'Düsseldorf');
 for(const locale of locales){assert.match(munich.translations[locale].seasonalityNote,/Memmingen/);assert.match(frankfurt.translations[locale].seasonalityNote,/Hahn/);assert.match(dusseldorf.translations[locale].seasonalityNote,/Weeze/);}
});

test('Heidelberg and Freiburg use explicit access airports without claiming a local airport or reclassifying EuroAirport',async()=>{
 const heidelberg=catalog.getDestinationById('de-heidelberg-neckar'),freiburg=catalog.getDestinationById('de-freiburg-black-forest');
 for(const d of [heidelberg,freiburg]){assert.equal(d.airports.length,0);assert.equal(d.metropolitanCodes.length,0);assert.equal(d.iataCodes.length,0);assert.ok(d.accessAirports.length);}
 assert.equal(catalog.findDestinationProfile({iataCode:'FRA'}).id,'de-frankfurt');
 assert.equal(freiburg.accessAirports.find(a=>a.iataCode==='BSL').countryCode,'FR');
 const input=load('lib/destinations/selection.ts').accessAirportSearchInput;
 assert.equal(input(freiburg,'BSL'),'Basilea');assert.equal(input(heidelberg,'STR'),'Stuttgart');
 for(const p of provider.crossBorder){
  assert.equal(p.physicalCountryCode,'FR');assert.equal(p.providerCountryCode,'CH');assert.ok(!airports.some(a=>a.code===p.iataCode));
  const results=await endpoint().search(p.iataCode);assert.equal(results[0].country,'Francia');assert.notEqual(results[0].country,'Alemania');
 }
});

test('confirmed physical airport selection opens its own German profile and respects the country',()=>{
 const selection=load('lib/destinations/selection.ts').destinationFromPlaceSelection;
 for(const d of germany.filter(d=>d.airports.length)){
  const a=airports.find(a=>a.code===d.airports[0].iataCode),choice={type:'airport',name:a.name,code:a.code,country:'Alemania',cityName:a.city_name,cityCode:a.city_code};
  assert.equal(selection(choice),d);assert.equal(selection({...choice,country:'Austria'}),undefined);
 }
});

test('German profiles stay available on request, with licensed images and no automatic cards or invented prices',()=>{
 const policy=load('lib/destinations/presentation.ts').canShowDestinationAutomatically;
 assert.ok(catalog.getDestinationsForMonth(5).some(d=>d.countryCode==='DE'));
 for(const d of germany){
  assert.equal(policy(d),false);assert.equal(d.publication.status,'draft');
  assert.match(d.image,/^https:\/\/thumb.wikimedia.org\//);assert.match(d.imageSource,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
  assert.ok(d.imageCredit);assert.match(d.imageLicense,/^CC BY/);assert.match(d.imageLicenseUrl,/creativecommons.org/);
  for(const field of ['price','flightPrice','available','hotelId'])assert.equal(d[field],undefined);
 }
 assert.equal(catalog.getPublishedDestinationPages().length,0);
});
