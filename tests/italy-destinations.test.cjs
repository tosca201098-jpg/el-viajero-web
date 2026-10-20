const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
function loader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    file = file.replaceAll('\\','/');
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const compiled = ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React },
    }).outputText;
    vm.runInNewContext(compiled, { exports, Intl, URL, URLSearchParams, AbortSignal, Request, Response, ...globals,
      require: name => {
        if (Object.hasOwn(mocks,name)) return mocks[name];
        const base = name.startsWith('@/') ? name.slice(2) : path.join(path.dirname(file),name);
        const relative = [base+'.ts',base+'.tsx',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));
        if (!relative) throw Error('Unexpected dependency: '+name);
        return load(relative);
      },
    }, { filename:file });
    return exports;
  }
  return load;
}
const load=loader();
const catalog=load('lib/destinations/index.ts');
const italy=load('lib/destinations/italy.ts').italyDestinations;
const localization=load('lib/destinations/localization.ts');
const locales=['es','en','fr','de','it','pt','ca'];

const digest=value=>require('node:crypto').createHash('sha256').update(typeof value==='string'?value:JSON.stringify(value)).digest('hex');
const baseline=require('./fixtures/pre-italy-catalog.json');
const samples=require('./fixtures/italy-places.json');
const airports=require('./fixtures/italy-airports.json').airports;

test('Italy adds twelve unique canonical profiles without changing any of the previous 77 or the original cards',()=>{
  assert.equal(catalog.destinationProfiles.length,89);assert.equal(italy.length,12);
  assert.equal(new Set(catalog.destinationProfiles.map(d=>d.id)).size,89);
  assert.equal(new Set(catalog.destinationProfiles.map(d=>d.slug)).size,89);
  for(const previous of baseline.profiles)assert.equal(digest(catalog.getDestinationById(previous.id)),previous.sha256,previous.id);
  assert.equal(digest(load('lib/destinations/featured.ts').destinations),baseline.featuredSha256);
  for(const [season,sha]of Object.entries(baseline.seasonFiles))assert.equal(digest(fs.readFileSync(path.join(root,`app/temporadas/${season}/page.tsx`),'utf8').replace(/\r\n/g,'\n')),sha,season);
  assert.ok(!/DestinationProfilePicker|destinations\.choose/.test(fs.readFileSync(path.join(root,'app/page.tsx'),'utf8')));
  for(const d of italy){assert.equal(d.countryCode,'IT');assert.equal(catalog.getDestinationById(d.id),d);assert.equal(catalog.getDestinationBySlug(d.slug),d);assert.equal(catalog.findDestinationProfile({name:d.name}),d);}
});

for(const locale of locales)test(`${locale}: all twelve Italian profiles have complete translations and use the existing itinerary contract`,()=>{
  const itinerary=load('lib/itinerary/server.ts');
  for(const d of italy){
    assert.deepEqual(Object.keys(d.translations).sort(),locales.slice().sort());
    const text=d.translations[locale];
    for(const field of ['name','description','recommendedStay','seasonalityNote'])assert.ok(text[field]?.trim(),d.id+':'+field);
    assert.equal(text.recommendations.length,4);assert.ok(text.recommendations.every(v=>v.trim()));
    assert.equal(catalog.findDestinationProfile({name:text.name}),d);
    assert.equal(localization.getDestinationCountryName(d,locale),new Intl.DisplayNames([locale],{type:'region'}).of('IT'));
    assert.equal(localization.getDestinationText(d,locale).description,text.description);
    const validated=itinerary.validateItineraryRequest({destination:{name:d.name,country:d.country,recommendations:[...d.recommendations],recommendedStay:d.recommendedStay,bestMonths:d.bestMonths,lowSeasonMonths:d.lowSeasonMonths,highSeasonMonths:d.highSeasonMonths,seasonalityNote:d.seasonalityNote},days:2,locale});
    assert.ok(validated,d.id);assert.equal(validated.destination,d);
  }
});

test('physical airports, city codes and access airports stay distinct and match verified provider resources',()=>{
  const rome=catalog.getDestinationById('it-rome'),milan=catalog.getDestinationById('it-milan'),venice=catalog.getDestinationById('it-venice');
  assert.deepEqual(Array.from(rome.metropolitanCodes),['ROM']);assert.deepEqual(Array.from(rome.airports,a=>a.iataCode),['FCO','CIA']);
  assert.deepEqual(Array.from(milan.metropolitanCodes),['MIL']);assert.deepEqual(Array.from(milan.airports,a=>a.iataCode),['MXP','LIN']);
  assert.equal(milan.accessAirports[0].iataCode,'BGY');assert.equal(venice.accessAirports[0].iataCode,'TSF');
  assert.equal(venice.airports[0].iataCode,'VCE');assert.equal(venice.metropolitanCodes.length,0);
  for(const d of italy)for(const a of [...d.airports,...(d.accessAirports??[])])assert.ok(airports.some(p=>p.iataCode===a.iataCode&&p.iataType==='airport'),a.iataCode);
  for(const code of ['GOA','TRS','PEG','AOI','RMI','PSR','BRI','BDS','SUF','REG','CIY','TPS','LMP','PNL','OLB','AHO'])assert.equal(catalog.findDestinationProfile({iataCode:code}),undefined,code+' is not an invented tourist profile');
});

function endpoint(){
  const calls=[];
  const handler=loader({}, {fetch:async input=>{const url=new URL(input);calls.push(url);return{ok:true,json:async()=>samples[url.searchParams.get('term')]??[]};}})('app/api/travelpayouts/places/route.ts');
  return{calls,search:async term=>(await(await handler.GET(new Request('https://example.test/api/travelpayouts/places?term='+encodeURIComponent(term)))).json()).suggestions};
}
test('all 40 verified passenger airports are first for an explicit IATA code, without calls to pricing services',async()=>{
  assert.equal(airports.length,40);
  for(const airport of airports){
    const api=endpoint(),results=await api.search(airport.iataCode);
    assert.equal(results[0].type,'airport',airport.iataCode);assert.equal(results[0].code,airport.iataCode);assert.equal(results[0].country,'Italia');assert.equal(results[0].cityCode,airport.cityCode);
    assert.equal(api.calls.length,1);assert.equal(api.calls[0].host,'autocomplete.travelpayouts.com');
    assert.equal(new Set(results.map(p=>`${p.country}:${p.type}:${p.code}`)).size,results.length);
  }
});
test('Rome, Milan and Venice rank exact cities first and retain their distinct airport options',async()=>{
  for(const [name,cityCode,codes]of [['Roma','ROM',['FCO','CIA']],['Milán','MIL',['MXP','LIN','BGY']],['Venecia','VCE',['VCE','TSF']]]){
    const results=await endpoint().search(name);assert.equal(results[0].type,'city');assert.equal(results[0].code,cityCode);
    for(const code of codes)assert.ok(results.some(p=>p.type==='airport'&&p.code===code),name+':'+code);
  }
});
test('shared and access airport selections open only the relevant tourist identity; other Italian airports remain flights-only',()=>{
  const selection=load('lib/destinations/selection.ts').destinationFromPlaceSelection;
  for(const [code,id]of [['FCO','rome'],['CIA','rome'],['MXP','milan'],['LIN','milan'],['BGY','milan'],['VCE','venice'],['TSF','venice'],['VRN','verona-garda'],['PSA','pisa-tuscany'],['CTA','catania-etna'],['CAG','cagliari-south-sardinia']]){
    const a=load('lib/travelpayouts/italy-airports.ts').italyPassengerAirports.find(a=>a.code===code);
    const choice={type:'airport',code,name:a.name,country:'Italia',cityName:a.city_name,cityCode:a.city_code};
    assert.equal(selection(choice),catalog.getDestinationById('it-'+id));assert.equal(selection({...choice,country:'Estados Unidos'}),undefined);
  }
  assert.equal(selection({type:'city',name:'Bari',code:'BRI',country:'Italia',cityName:null,cityCode:null}),undefined);
});
test('Italian seasonality remains reusable data without automatic cards, publication, invented prices or availability',()=>{
  const policy=load('lib/destinations/presentation.ts').canShowDestinationAutomatically;
  assert.ok(catalog.getDestinationsForMonth(5).some(d=>d.countryCode==='IT'));
  assert.equal(catalog.getPublishedDestinationPages().length,0);
  for(const d of italy){
    assert.equal(policy(d),false);assert.equal(d.publication.status,'draft');
    for(const field of ['bestMonths','lowSeasonMonths','highSeasonMonths'])assert.ok(d[field].length&&d[field].every(m=>m>=1&&m<=12));
    assert.match(d.image,/^https:\/\/thumb\.wikimedia\.org\//);assert.match(d.imageSource,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
    assert.ok(d.imageCredit);assert.match(d.imageLicense,/^CC BY/);assert.match(d.imageLicenseUrl,/creativecommons\.org/);
    for(const field of ['price','hotelPrice','flightPrice','available','hotelId'])assert.equal(d[field],undefined);
  }
});

test('Italian access buttons pass the canonical city to the unchanged resolver; French access and all seven explanatory translations remain valid',()=>{
  const input=load('lib/destinations/selection.ts').accessAirportSearchInput;
  for(const [id,code]of [['it-milan','BGY'],['it-venice','TSF']])assert.equal(input(catalog.getDestinationById(id),code),catalog.getDestinationById(id).name);
  assert.equal(input(catalog.getDestinationById('fr-annecy'),'GVA'),'GVA');
  const translations=load('lib/i18n/translations.ts');
  for(const locale of locales){const message=translations.translate(locale,'destinations.cityAirportSearch',{destination:'Milano'});assert.ok(message.includes('Milano'));assert.ok(!message.includes('{destination}'));assert.ok(!message.includes('destinations.cityAirportSearch'));}
});
