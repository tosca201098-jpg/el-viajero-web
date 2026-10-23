const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function loader(globals={}){
 const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
 exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const resolved=[base+'.ts',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));if(!resolved)throw Error(id);return load(resolved);}});return exports;}return load;
}
const load=loader(),catalog=load('lib/destinations/index.ts'),netherlands=load('lib/destinations/netherlands.ts').netherlandsDestinations;
const airports=load('lib/travelpayouts/netherlands-airports.ts').netherlandsPassengerAirports;
const baseline=require('./fixtures/pre-netherlands-catalog.json'),provider=require('./fixtures/netherlands-airports.json'),samples=require('./fixtures/netherlands-places.json');
const digest=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const locales=['es','en','fr','de','it','pt','ca'];

test('Netherlands adds twelve profiles to 173 unique identities; all previous 113 and original cards stay identical',()=>{
 assert.equal(baseline.profiles.length,113);assert.equal(netherlands.length,12);assert.equal(catalog.destinationProfiles.length,173);
 assert.equal(new Set(catalog.destinationProfiles.map(d=>d.id)).size,173);assert.equal(new Set(catalog.destinationProfiles.map(d=>d.slug)).size,173);
 for(const [name,id] of [['Roterdão','nl-rotterdam-kinderdijk'],['La Haye','nl-the-hague-scheveningen'],["L'Aia",'nl-the-hague-scheveningen'],['Haia','nl-the-hague-scheveningen'],['La Haia','nl-the-hague-scheveningen']])assert.equal(catalog.findDestinationProfile({name})?.id,id,name);
 for(const d of baseline.profiles)assert.equal(digest(catalog.getDestinationById(d.id)),d.sha256,d.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),baseline.featuredSha256);
 for(const[season,sha]of Object.entries(baseline.seasonFiles))assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas/'+season+'/page.tsx'),'utf8').replace(/\r\n/g,'\n')),sha);
});

for(const locale of locales)test(locale+': twelve Dutch profiles provide regions, four recommendations, practical notes and the existing itinerary contract',()=>{
 const localization=load('lib/destinations/localization.ts'),server=load('lib/itinerary/server.ts');
 for(const d of netherlands){
  const t=d.translations[locale];assert.deepEqual(Object.keys(d.translations).sort(),locales.slice().sort());
  assert.equal(d.countryCode,'NL');assert.equal(d.country,'Países Bajos');assert.match(d.regionCode,/^NL-[A-Z]{2}$/);assert.ok(t.description.startsWith(d.regionNames[locale]+'.'));
  for(const field of ['name','description','recommendedStay','seasonalityNote'])assert.ok(t[field]?.trim(),d.id+':'+field);
  assert.equal(t.recommendations.length,4);assert.equal(new Set(t.recommendations).size,4);
  assert.equal(catalog.findDestinationProfile({name:t.name}),d);
  assert.equal(localization.getDestinationCountryName(d,locale),new Intl.DisplayNames([locale],{type:'region'}).of('NL'));
  assert.equal(localization.getDestinationText(d,locale).description,t.description);
  const validated=server.validateItineraryRequest({destination:{name:d.name,country:d.country,recommendations:[...d.recommendations],recommendedStay:d.recommendedStay,bestMonths:d.bestMonths,lowSeasonMonths:d.lowSeasonMonths,highSeasonMonths:d.highSeasonMonths,seasonalityNote:d.seasonalityNote},days:2,locale});
  assert.equal(validated?.destination,d);
  for(const field of ['bestMonths','lowSeasonMonths','highSeasonMonths'])assert.ok(d[field].length&&d[field].every(m=>m>=1&&m<=12));
 }
 assert.match(catalog.getDestinationById('nl-leiden-keukenhof').translations[locale].seasonalityNote,/Lisse/);
 assert.match(catalog.getDestinationById('nl-texel-wadden-sea').translations[locale].seasonalityNote,/Den Helder.*TESO/);
 assert.match(catalog.getDestinationById('nl-eindhoven').translations[locale].seasonalityNote,/2027/);
});
function endpoint(payloads=samples){const calls=[];const handler=loader({fetch:async input=>{const u=new URL(input);calls.push(u);return{ok:true,json:async()=>payloads[u.searchParams.get('term')]??[]};}})('app/api/travelpayouts/places/route.ts');return{calls,search:async term=>(await(await handler.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)))).json()).suggestions};}

test('five verified physical airports rank first on exact IATA; no city or metropolitan identity is invented',async()=>{
 assert.equal(airports.length,5);
 for(const a of airports){
  const verified=provider.airports.find(p=>p.code===a.code);assert.equal(verified.countryCode,'NL');assert.equal(verified.iataType,'airport');assert.equal(verified.flightable,true);assert.equal(a.city_code,verified.cityCode);
  const api=endpoint(),results=await api.search(a.code);assert.equal(results[0].type,'airport');assert.equal(results[0].code,a.code);assert.equal(results[0].country,'Países Bajos');assert.equal(results[0].cityCode,verified.cityCode);
  assert.equal(api.calls.length,1);assert.equal(api.calls[0].host,'autocomplete.travelpayouts.com');
 }
});
test('recorded Dutch city variants rank the right city and include its physical airport, without duplicate identities',async()=>{
 for(const[name,code]of [['Ámsterdam','AMS'],['Amsterdam','AMS'],['Róterdam','RTM'],['Rotterdam','RTM'],['Eindhoven','EIN'],['Maastricht','MST'],['Groningen','GRQ'],['Schiphol','AMS']]){
  assert.ok(samples[name]);const results=await endpoint().search(name);assert.equal(results[0].code,code,name);assert.equal(results[0].country,'Países Bajos',name);
  assert.ok(results.some(p=>p.type==='airport'&&p.code===code),name);assert.ok(results.some(p=>p.type==='city'&&p.code===code),name);
  assert.equal(new Set(results.map(p=>p.country+':'+p.type+':'+p.code)).size,results.length);
 }
});
test('The Hague aliases return real arrival gateways RTM and AMS, retaining their actual airport and city names',async()=>{
 for(const name of ['La Haya','Den Haag','The Hague','La Haye',"L'Aia",'L’Aia','Haia','La Haia']){
  const results=await endpoint().search(name),nl=results.filter(r=>r.country==='Países Bajos');
  assert.deepEqual(nl.map(p=>p.code),['RTM','AMS']);assert.ok(nl.every(p=>p.type==='airport'));assert.equal(nl[0].cityCode,'RTM');assert.equal(nl[1].cityCode,'AMS');assert.notEqual(nl[0].cityName,'La Haya');
 }
});
test('European country aliases return only five real passenger airports; Caribbean identities are never added or reclassified',async()=>{
 for(const term of ['Países Bajos','Holanda','Netherlands','Pays-Bas','Niederlande','Paesi Bassi','Països Baixos']){
  const results=await endpoint().search(term);assert.equal(results.length,5);assert.ok(results.every(p=>p.type==='airport'&&['AMS','RTM','EIN','MST','GRQ'].includes(p.code)));
 }
 for(const code of ['AUA','CUR','SXM','BON','SAB','EUX']){
  assert.ok(!airports.some(a=>a.code===code));assert.equal(catalog.findDestinationProfile({iataCode:code}),undefined);
  const p=provider.airports.find(p=>p.code===code),result=await endpoint({[code]:[{type:'airport',code,name:p.name,country_code:p.countryCode,city_code:p.cityCode}]}).search(code);
  assert.equal(result[0].country,new Intl.DisplayNames(['es'],{type:'region'}).of(p.countryCode));
 }
 // Known source limitation: EUX is reported as NL by Travelpayouts; its actual location is Caribbean BQ.
 assert.equal(provider.airports.find(p=>p.code==='EUX').countryCode,'NL');
});
test('general aviation airports remain unavailable and TEX remains Telluride in the US, never Texel',async()=>{
 for(const code of ['LEY','DHR','ENS']){
  assert.equal(provider.airports.find(p=>p.code===code).flightable,false);
  assert.equal((await endpoint({[code]:[{type:'city',code,name:'stale',country_code:'NL'},{type:'airport',code,name:'stale airport',country_code:'NL'}]}).search(code)).length,0);
 }
 const tex=await endpoint().search('TEX');assert.equal(tex[0].code,'TEX');assert.equal(tex[0].country,'Estados Unidos');assert.equal(catalog.findDestinationProfile({iataCode:'TEX'}),undefined);
});
test('seven destinations use access airports, never claim local ones; confirmed selections resolve only actual arrival profiles',()=>{
 const selection=load('lib/destinations/selection.ts'),without=netherlands.filter(d=>!d.airports.length);assert.equal(without.length,7);
 for(const d of without){assert.equal(d.iataCodes.length,0);assert.equal(d.metropolitanCodes.length,0);assert.ok(d.accessAirports.length);for(const a of d.accessAirports){assert.ok(airports.some(p=>p.code===a.iataCode));assert.notEqual(selection.accessAirportSearchInput(d,a.iataCode),d.name);}}
 for(const a of airports){const choice={type:'airport',name:a.name,code:a.code,country:'Países Bajos',cityName:a.city_name,cityCode:a.city_code};assert.equal(selection.destinationFromPlaceSelection(choice),catalog.findDestinationProfile({iataCode:a.code}));assert.equal(selection.destinationFromPlaceSelection({...choice,country:'Estados Unidos'}),undefined);}
 assert.equal(selection.accessAirportSearchInput(catalog.getDestinationById('nl-utrecht'),'AMS'),'Ámsterdam');
});
test('new Dutch profiles have licensed images and remain available only on explicit request, without new sitemap routes or invented prices',()=>{
 const policy=load('lib/destinations/presentation.ts').canShowDestinationAutomatically;
 assert.ok(catalog.getDestinationsForMonth(5).some(d=>d.countryCode==='NL'));
 for(const d of netherlands){assert.equal(policy(d),false);assert.equal(d.publication.status,'draft');assert.match(d.image,/^https:\/\/thumb.wikimedia.org\//);assert.match(d.imageSource,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);assert.ok(d.imageCredit);assert.match(d.imageLicense,/^CC BY/);assert.match(d.imageLicenseUrl,/creativecommons.org/);for(const field of ['price','flightPrice','available','hotelId'])assert.equal(d[field],undefined);}
 assert.equal(catalog.getPublishedDestinationPages().length,0);
});
