const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function loader(globals={}){
 const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
 exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const resolved=[base+'.ts',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));if(!resolved)throw Error(id);return load(resolved);}});
 return exports;}return load;
}
const load=loader(),catalog=load('lib/destinations/index.ts'),uk=load('lib/destinations/uk.ts').ukDestinations;
const airports=load('lib/travelpayouts/uk-airports.ts').ukPassengerAirports;
const baseline=require('./fixtures/pre-uk-catalog.json'),provider=require('./fixtures/uk-airports.json'),samples=require('./fixtures/uk-places.json');
const digest=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const locales=['es','en','fr','de','it','pt','ca'];

test('UK identities remain intact in the 185-profile catalog; every previous profile and original editorial card is identical',()=>{
 assert.equal(baseline.profiles.length,89);assert.equal(uk.length,12);assert.equal(catalog.destinationProfiles.length,185);
 assert.equal(new Set(catalog.destinationProfiles.map(d=>d.id)).size,185);assert.equal(new Set(catalog.destinationProfiles.map(d=>d.slug)).size,185);
 for(const d of baseline.profiles)assert.equal(digest(catalog.getDestinationById(d.id)),d.sha256,d.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),baseline.featuredSha256);
 for(const[season,sha]of Object.entries(baseline.seasonFiles))assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas/'+season+'/page.tsx'),'utf8').replace(/\r\n/g,'\n')),sha);
 assert.deepEqual(Array.from(uk,d=>d.regionCode),['GB-ENG','GB-SCT','GB-ENG','GB-ENG','GB-ENG','GB-ENG','GB-ENG','GB-ENG','GB-SCT','GB-SCT','GB-WLS','GB-NIR']);
});

for(const locale of locales)test(locale+': twelve UK profiles localize names, regions, descriptions, four recommendations and the existing itinerary contract',()=>{
 const localization=load('lib/destinations/localization.ts'),server=load('lib/itinerary/server.ts');
 for(const d of uk){
  const t=d.translations[locale];assert.deepEqual(Object.keys(d.translations).sort(),locales.slice().sort());
  assert.equal(d.countryCode,'GB');assert.equal(d.country,'Reino Unido');assert.ok(t.description.startsWith(d.regionNames[locale]+'. '));
  for(const field of ['name','description','recommendedStay','seasonalityNote'])assert.ok(t[field]?.trim(),d.id+':'+field);
  assert.equal(t.recommendations.length,4);assert.equal(new Set(t.recommendations).size,4);
  assert.equal(catalog.findDestinationProfile({name:t.name}),d);
  assert.equal(localization.getDestinationCountryName(d,locale),new Intl.DisplayNames([locale],{type:'region'}).of('GB'));
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
test('all 38 verified UK airports prioritize their physical IATA while keeping one free provider call and city associations',async()=>{
 assert.equal(airports.length,38);assert.equal(provider.airports.length,38);
 for(const p of provider.airports){
  const a=airports.find(a=>a.code===p.iataCode);assert.ok(a);assert.equal(a.city_code,p.cityCode);assert.equal(p.countryCode,'GB');assert.equal(p.iataType,'airport');assert.equal(p.flightable,true);
  const api=endpoint(),results=await api.search(p.iataCode);assert.equal(results[0].type,'airport',p.iataCode);assert.equal(results[0].code,p.iataCode);assert.equal(results[0].country,'Reino Unido');assert.equal(results[0].cityCode,p.cityCode);
  assert.equal(api.calls.length,1);assert.equal(api.calls[0].host,'autocomplete.travelpayouts.com');
 }
});
test('London retains its city and all six airports; six required cities lead their recorded provider responses',async()=>{
 for(const[name,code]of [['Londres','LON'],['Manchester','MAN'],['Edimburgo','EDI'],['Glasgow','GLA'],['Cardiff','CWL'],['Belfast','BFS']]){
  const results=await endpoint().search(name);assert.equal(results[0].type,'city');assert.equal(results[0].code,code);assert.equal(results[0].country,'Reino Unido');
 }
 const london=await endpoint().search('Londres');assert.equal(london.length,7);
 assert.deepEqual(london.filter(p=>p.type==='airport').map(p=>p.code).sort(),['LCY','LGW','LHR','LTN','SEN','STN']);
 for(const[name,codes]of [['Glasgow',['GLA','PIK']],['Belfast',['BFS','BHD']]]){const p=await endpoint().search(name);for(const code of codes)assert.ok(p.some(p=>p.type==='airport'&&p.code===code));}
});
test('stale flightable flags do not expose closed Anglesey or unconfirmed Doncaster passenger service',async()=>{
 for(const code of ['VLY','DSA']){
  assert.ok(!airports.some(a=>a.code===code));
  const api=endpoint({[code]:[{type:'city',code,name:'stale',country_code:'GB'},{type:'airport',code,name:'stale airport',country_code:'GB'}]});
  assert.equal((await api.search(code)).length,0);
 }
});
test('Ireland, the Isle of Man and Channel Islands retain their actual countries and are never added to the UK airport list',async()=>{
 for(const p of provider.nonUK){
  assert.ok(!airports.some(a=>a.code===p.code));
  const results=await endpoint({[p.code]:[{type:'airport',code:p.code,country_code:p.countryCode,name:p.code,city_code:p.code}]}).search(p.code);
  assert.equal(results[0].country,new Intl.DisplayNames(['es'],{type:'region'}).of(p.countryCode));
  assert.notEqual(results[0].country,'Reino Unido');
 }
});
test('York and Oxford have access airports only; city groups do not assign neighbouring airports to tourist identities',()=>{
 const york=catalog.getDestinationById('gb-york'),oxford=catalog.getDestinationById('gb-oxford-cotswolds'),london=catalog.getDestinationById('gb-london');
 for(const d of [york,oxford]){assert.equal(d.airports.length,0);assert.equal(d.metropolitanCodes.length,0);assert.equal(d.iataCodes.length,0);assert.ok(d.accessAirports.length);}
 assert.equal(catalog.findDestinationProfile({iataCode:'LBA'}),undefined);
 assert.equal(catalog.findDestinationProfile({iataCode:'MAN'}).id,'gb-manchester');
 assert.equal(catalog.findDestinationProfile({iataCode:'LHR'}),london);
 assert.deepEqual(Array.from(london.metropolitanCodes),['LON']);
 assert.equal(catalog.findDestinationProfile({iataCode:'PIK'}),undefined);
 const input=load('lib/destinations/selection.ts').accessAirportSearchInput;
 assert.equal(input(york,'LBA'),'Leeds');assert.equal(input(oxford,'LHR'),'Londres');
 assert.equal(input(catalog.getDestinationById('gb-glasgow'),'PIK'),'Glasgow');
 assert.equal(input(catalog.getDestinationById('it-milan'),'BGY'),'Milán');
});
test('committed UK physical airport choices resolve only the correct canonical profile and enforce the country',()=>{
 const selection=load('lib/destinations/selection.ts').destinationFromPlaceSelection;
 for(const[code,id]of [['LHR','london'],['LGW','london'],['SEN','london'],['MAN','manchester'],['EDI','edinburgh'],['PIK','glasgow'],['BRS','bristol-bath'],['BHD','belfast-causeway-coast'],['CWL','cardiff-south-wales']]){
  const a=airports.find(a=>a.code===code),choice={type:'airport',name:a.name,code:a.code,country:'Reino Unido',cityName:a.city_name,cityCode:a.city_code};
  assert.equal(selection(choice),catalog.getDestinationById('gb-'+id));assert.equal(selection({...choice,country:'Irlanda'}),undefined);
 }
});
test('UK data stays reusable without automatic monthly/budget cards, new public routes or invented availability',()=>{
 const policy=load('lib/destinations/presentation.ts').canShowDestinationAutomatically;
 assert.ok(catalog.getDestinationsForMonth(5).some(d=>d.countryCode==='GB'));
 for(const d of uk){
  assert.equal(policy(d),false);assert.equal(d.publication.status,'draft');
  assert.match(d.image,/^https:\/\/thumb.wikimedia.org\//);assert.match(d.imageSource,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);
  assert.ok(d.imageCredit);assert.match(d.imageLicense,/^CC BY/);assert.match(d.imageLicenseUrl,/creativecommons.org/);
  for(const field of ['price','flightPrice','available','hotelId'])assert.equal(d[field],undefined);
 }
 assert.equal(catalog.getPublishedDestinationPages().length,0);
});
