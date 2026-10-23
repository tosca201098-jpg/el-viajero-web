const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
function loader(globals={}){
 const cache=new Map();function load(file){file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{
 exports,Intl,URL,URLSearchParams,Request,Response,AbortSignal,...globals,require:id=>{const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);const resolved=[base+'.ts',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));if(!resolved)throw Error(id);return load(resolved);}});return exports;}return load;
}
const load=loader(),catalog=load('lib/destinations/index.ts'),belgium=load('lib/destinations/belgium.ts').belgiumDestinations;
const airportModule=load('lib/travelpayouts/belgium-airports.ts'),airports=airportModule.belgiumAirports;
const baseline=require('./fixtures/pre-belgium-catalog.json'),provider=require('./fixtures/belgium-airports.json'),samples=require('./fixtures/belgium-places.json');
const digest=v=>crypto.createHash('sha256').update(typeof v==='string'?v:JSON.stringify(v)).digest('hex');
const locales=['es','en','fr','de','it','pt','ca'];

test('Belgium adds twelve profiles to 173 unique identities; all previous 125 and original editorial cards remain identical',()=>{
 assert.equal(baseline.profiles.length,125);assert.equal(belgium.length,12);assert.equal(catalog.destinationProfiles.length,173);
 assert.equal(new Set(catalog.destinationProfiles.map(d=>d.id)).size,173);assert.equal(new Set(catalog.destinationProfiles.map(d=>d.slug)).size,173);
 for(const d of baseline.profiles)assert.equal(digest(catalog.getDestinationById(d.id)),d.sha256,d.id);
 assert.equal(digest(load('lib/destinations/featured.ts').destinations),baseline.featuredSha256);
 for(const[season,sha]of Object.entries(baseline.seasonFiles))assert.equal(digest(fs.readFileSync(path.join(root,'app/temporadas/'+season+'/page.tsx'),'utf8').replace(/\r\n/g,'\n')),sha);
 assert.equal(belgium.filter(d=>d.regionCode==='BE-BRU').length,1);assert.equal(belgium.filter(d=>d.regionCode==='BE-VLG').length,6);assert.equal(belgium.filter(d=>d.regionCode==='BE-WAL').length,5);
});
for(const locale of locales)test(locale+': all Belgian profiles provide complete content, regions, four recommendations and the existing itinerary contract',()=>{
 const localization=load('lib/destinations/localization.ts'),server=load('lib/itinerary/server.ts');
 for(const d of belgium){const t=d.translations[locale];assert.deepEqual(Object.keys(d.translations).sort(),locales.slice().sort());assert.equal(d.countryCode,'BE');assert.equal(d.country,'Bélgica');assert.ok(t.description.startsWith(d.regionNames[locale]+'.'));
  for(const field of ['name','description','recommendedStay','seasonalityNote'])assert.ok(t[field]?.trim(),d.id+':'+field);
  assert.equal(t.recommendations.length,4);assert.equal(new Set(t.recommendations).size,4);assert.equal(catalog.findDestinationProfile({name:t.name}),d);
  assert.equal(localization.getDestinationCountryName(d,locale),new Intl.DisplayNames([locale],{type:'region'}).of('BE'));
  const validated=server.validateItineraryRequest({destination:{name:d.name,country:d.country,recommendations:[...d.recommendations],recommendedStay:d.recommendedStay,bestMonths:d.bestMonths,lowSeasonMonths:d.lowSeasonMonths,highSeasonMonths:d.highSeasonMonths,seasonalityNote:d.seasonalityNote},days:2,locale});assert.equal(validated?.destination,d);
  for(const f of ['bestMonths','lowSeasonMonths','highSeasonMonths'])assert.ok(d[f].length&&d[f].every(m=>m>=1&&m<=12));
 }
 assert.match(catalog.getDestinationById('be-antwerp').translations[locale].seasonalityNote,/TUI.*2027/);
 assert.match(catalog.getDestinationById('be-liege').translations[locale].seasonalityNote,/LGG.*2026/);
 assert.match(catalog.getDestinationById('be-leuven').translations[locale].seasonalityNote,/2029/);
 assert.match(catalog.getDestinationById('be-belgian-ardennes-durbuy-la-roche').translations[locale].seasonalityNote,/Durbuy.*La Roche-en-Ardenne/);
});
function endpoint(payloads=samples){const calls=[];const handler=loader({fetch:async input=>{const u=new URL(input);calls.push(u);return{ok:true,json:async()=>payloads[u.searchParams.get('term')]??[]};}})('app/api/travelpayouts/places/route.ts');return{calls,search:async term=>(await(await handler.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)))).json()).suggestions};}
test('BRU CRL ANR OST LGG identify physical airports first with verified countries and original pricing city groups',async()=>{
 assert.equal(airports.length,5);assert.equal(airportModule.belgiumPassengerAirports.length,4);
 for(const a of airports){const p=provider.airports.find(p=>p.code===a.code);assert.equal(p.countryCode,'BE');assert.equal(p.iataType,'airport');assert.equal(a.city_code,p.cityCode);
  const api=endpoint(),results=await api.search(a.code);assert.equal(results[0].type,'airport',a.code);assert.equal(results[0].code,a.code);assert.equal(results[0].country,'Bélgica');assert.equal(results[0].cityCode,p.cityCode);assert.equal(api.calls.length,1);assert.equal(api.calls[0].host,'autocomplete.travelpayouts.com');
 }
});
test('Brussels aliases include distinct BRU and CRL airports; Charleroi retains the BRU pricing group while displaying its physical city',async()=>{
 for(const name of ['Bruselas','Bruxelles','Brussel','Brussels']){const results=await endpoint().search(name);assert.equal(results[0].type,'city',name);assert.equal(results[0].code,'BRU');assert.ok(results.some(p=>p.type==='airport'&&p.code==='BRU'));assert.ok(results.some(p=>p.type==='airport'&&p.code==='CRL'));assert.equal(new Set(results.map(p=>p.country+':'+p.type+':'+p.code)).size,results.length);}
 const charleroi=(await endpoint().search('Charleroi'))[0];assert.equal(charleroi.code,'CRL');assert.equal(charleroi.type,'airport');assert.equal(charleroi.physicalCityName,'Charleroi');assert.equal(charleroi.cityName,'Bruselas');assert.equal(charleroi.cityCode,'BRU');assert.equal(charleroi.serviceNotice,'charleroiTransfer');
});
test('Antwerp aliases retain ANR with a dated continuity notice; Ostend aliases identify physical OST rather than a fictitious Bruges airport',async()=>{
 for(const name of ['Amberes','Antwerpen','Anvers','Antwerp']){const results=await endpoint().search(name);assert.equal(results[0].code,'ANR',name);assert.equal(results[0].serviceNotice,'antwerpTuiEnds');assert.ok(results.some(p=>p.code==='ANR'&&p.type==='airport'));}
 for(const name of ['Ostende','Oostende','Ostend']){const results=await endpoint().search(name);assert.equal(results[0].type,'airport',name);assert.equal(results[0].code,'OST');assert.equal(results[0].physicalCityName,'Ostende');assert.equal(results[0].cityName,'Brujas');assert.equal(results[0].cityCode,'OST');}
});
test('LGG flightable:true is not treated as a current scheduled service; city and airport remain informational while real access options are distinct',async()=>{
 assert.equal(provider.airports.find(p=>p.code==='LGG').flightable,true);assert.ok(!airportModule.belgiumPassengerAirports.some(p=>p.code==='LGG'));
 for(const name of ['Lieja','Liège','Luik','LGG']){const results=await endpoint().search(name),liege=results.filter(p=>p.code==='LGG');assert.ok(liege.some(p=>p.type==='airport'),name);for(const r of liege){assert.equal(r.scheduledPassengerService,false);assert.equal(r.serviceNotice,'noScheduledFlights');}}
 const access=(await endpoint().search('Lieja')).filter(p=>p.code!=='LGG'&&p.country==='Bélgica');assert.ok(access.some(p=>p.code==='BRU'));assert.ok(access.some(p=>p.code==='CRL'));
 const d=catalog.getDestinationById('be-liege');assert.equal(d.iataCodes.length,0);assert.ok(d.accessAirports.every(a=>a.iataCode!=='LGG'));
});
test('confirmed Belgian tourist cities resolve by name without confusing Bruges with the physical airport in Ostend or Mons with Norwegian Bergen',async()=>{
 const select=load('lib/destinations/selection.ts').destinationFromPlaceSelection;
 const bruges=(await endpoint().search('Brujas')).find(p=>p.type==='city'&&p.code==='OST');assert.equal(select(bruges).id,'be-bruges');
 const ost=(await endpoint().search('OST'))[0];assert.equal(select(ost).id,'be-ostend-belgian-coast');
 const crl=(await endpoint().search('CRL'))[0];assert.equal(select(crl).id,'be-brussels');
 const bergen=(await endpoint().search('Bergen'))[0];assert.equal(bergen.country,'Noruega');assert.equal(bergen.code,'BGO');assert.equal(select(bergen),undefined);
 assert.equal(select({type:'city',name:'Bergen',country:'Bélgica',code:null,cityName:null,cityCode:null}).id,'be-mons');
});
test('all local names and aliases resolve the intended canonical profile; eight ground destinations and Liege never claim their own commercial airport',()=>{
 for(const[id,names]of Object.entries({brussels:['Bruselas','Bruxelles','Brussel','Brussels'],bruges:['Brujas','Brugge','Bruges'],ghent:['Gante','Gent','Gand','Ghent'],antwerp:['Amberes','Antwerpen','Anvers','Antwerp'],leuven:['Lovaina','Leuven','Louvain'],ypres:['Ypres','Ieper'], 'ostend-belgian-coast':['Ostende','Oostende','Ostend'],liege:['Lieja','Liège','Luik'],mons:['Mons','Bergen'],namur:['Namur','Namen']}))for(const name of names)assert.equal(catalog.findDestinationProfile({name})?.id,'be-'+id,name);
 const ground=belgium.filter(d=>!d.airports.length);assert.equal(ground.length,9);
 for(const d of ground){assert.equal(d.iataCodes.length,0);assert.equal(d.metropolitanCodes.length,0);assert.ok(d.accessAirports.length);assert.ok(d.accessAirports.every(a=>a.countryCode==='BE'&&airportModule.belgiumPassengerAirports.some(p=>p.code===a.iataCode)));}
 assert.equal(load('lib/destinations/selection.ts').accessAirportSearchInput(catalog.getDestinationById('be-bruges'),'OST'),'Brujas');
 assert.equal(load('lib/destinations/selection.ts').accessAirportSearchInput(catalog.getDestinationById('be-namur'),'CRL'),'Bruselas');
});
test('new Belgian profiles have commercial-use image licenses and remain opt-in, without automatic cards, new sitemap routes or invented prices',()=>{
 const policy=load('lib/destinations/presentation.ts').canShowDestinationAutomatically;
 assert.ok(catalog.getDestinationsForMonth(5).some(d=>d.countryCode==='BE'));
 for(const d of belgium){assert.equal(policy(d),false);assert.equal(d.publication.status,'draft');assert.match(d.image,/^https:\/\/thumb.wikimedia.org\//);assert.match(d.imageSource,/^https:\/\/commons.wikimedia.org\/wiki\/File:/);assert.ok(d.imageCredit);assert.match(d.imageLicense,/^CC BY/);assert.match(d.imageLicenseUrl,/creativecommons.org/);for(const field of ['price','flightPrice','available','hotelId'])assert.equal(d[field],undefined);}
 assert.equal(catalog.getPublishedDestinationPages().length,0);
});
