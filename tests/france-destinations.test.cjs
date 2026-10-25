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
const load = loader();
const library = load('lib/destinations/index.ts');
const { franceDestinations: france } = load('lib/destinations/france.ts');
const localization = load('lib/destinations/localization.ts');
const translations = load('lib/i18n/translations.ts');
const monthly = load('lib/destinations/monthly.ts');
const itinerary = load('lib/itinerary/server.ts');
const codes = ['es','en','fr','de','it','pt','ca'];
const plain = value => JSON.parse(JSON.stringify(value));
const byId = id => library.getDestinationById('fr-'+id);

test('France adds exactly twelve canonical identities after the 65 unchanged legacy destinations', () => {
  assert.equal(france.length,12); assert.equal(library.destinationProfiles.length,197);
  assert.deepEqual(Array.from(france,d=>d.id), ['paris','nice','lyon','marseille','bordeaux','strasbourg','toulouse','annecy','chamonix','mont-saint-michel','nantes','lille'].map(s=>'fr-'+s));
  assert.equal(library.getDestinationsByCountry(' fr '),france);
  assert.equal(new Set(library.destinationProfiles.map(d=>d.id)).size,197);
  assert.equal(new Set(library.destinationProfiles.map(d=>d.slug)).size,197);
  for(const d of france) {
    assert.equal(d.countryCode,'FR'); assert.equal(d.country,'Francia');
    assert.equal(library.getDestinationById(d.id),d); assert.equal(library.getDestinationBySlug(d.slug),d);
    assert.equal(library.findDestinationProfile({name:d.name}),d);
    assert.match(d.id,/^fr-[a-z]+(?:-[a-z]+)*$/); assert.equal(d.publication.status,'draft');
  }
  assert.equal(library.getPublishedDestinationPages().length,0,'placeholder destination routes are not added to the sitemap');
});

test('physical airports, the Paris metropolitan code and shared ground-transfer airports remain distinct', () => {
  const paris=byId('paris');
  assert.deepEqual(Array.from(paris.airports,a=>a.iataCode),['CDG','ORY','BVA']);
  assert.deepEqual(Array.from(paris.metropolitanCodes),['PAR']);
  assert.ok(!paris.airports.some(a=>a.iataCode==='PAR'));
  for(const code of ['PAR','CDG','ORY','BVA']) assert.equal(library.findDestinationProfile({iataCode:code}),paris);
  for(const id of ['annecy','chamonix','mont-saint-michel']) {
    const d=byId(id); assert.equal(d.airports.length,0); assert.equal(d.iataCodes.length,0); assert.equal(d.metropolitanCodes.length,0);
    for(const a of d.accessAirports) { assert.match(a.iataCode,/^[A-Z]{3}$/); assert.match(a.countryCode,/^[A-Z]{2}$/); }
  }
  assert.equal(byId('annecy').accessAirports[0],byId('chamonix').accessAirports[0]);
  assert.equal(byId('annecy').accessAirports[0].countryCode,'CH');
  assert.equal(library.findDestinationProfile({iataCode:'GVA'})?.id,'ch-geneva');
  assert.equal(library.findDestinationProfile({iataCode:'LYS'}),byId('lyon'));
  assert.equal(library.findDestinationProfile({iataCode:'RNS'}),undefined);
  assert.deepEqual(Array.from(library.getDestinationById('es-tenerife').airports,a=>a.iataCode),['TFN','TFS']);
});

test('French seasonality supports both Alpine seasons and Christmas without inventing current availability', () => {
  for(const d of france) {
    for(const field of ['bestMonths','lowSeasonMonths','highSeasonMonths']) {
      assert.ok(d[field].length); assert.ok(d[field].every(m=>Number.isInteger(m)&&m>=1&&m<=12));
      assert.equal(new Set(d[field]).size,d[field].length);
    }
    assert.ok(d.lowSeasonMonths.every(m=>!d.highSeasonMonths.includes(m)));
    assert.ok(Array.from({length:12},(_,i)=>i+1).some(m=>monthly.getMonthlyRecommendations(m).some(r=>r.destination===d)));
  }
  assert.ok(library.getDestinationsForSeason('winter','FR').includes(byId('chamonix')));
  assert.ok(library.getDestinationsForSeason('summer','FR').includes(byId('chamonix')));
  assert.ok(library.getDestinationsForSeason('winter','FR').includes(byId('strasbourg')));
  assert.ok(library.getDestinationsForSeason('spring','FR').includes(byId('paris')));
});

test('Paris remains canonical in stored editorial data while its automatic cards are hidden', () => {
  const featured=load('lib/destinations/featured.ts');
  assert.equal(featured.destinations[0],byId('paris'));
  assert.equal(featured.destinations.filter(d=>d.name==='París').length,1);
  const source=fs.readFileSync(path.join(root,'app/temporadas/primavera/page.tsx'),'utf8');
  const compiled=ts.transpileModule(source+'\nexports.selection=destinosPrimavera; exports.details=detallesPrimavera;', {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React}}).outputText;
  const exports={};
  vm.runInNewContext(compiled,{exports,require:id=>id==='@/lib/destinations/france'?{franceDestinations:france}:{default:()=>null}});
  const card=exports.selection.find(d=>d.destinationId==='fr-paris');
  assert.equal(card.nombre,byId('paris').name); assert.equal(card.imagen,byId('paris').image);
  assert.equal(exports.details['París'].lugares,byId('paris').recommendations);
  assert.match(card.descripcion,/Jardines florecidos/); assert.match(byId('paris').description,/Notre-Dame/);
});

for(const locale of codes) test(`${locale}: all French text is localized while IDs, flight inputs and itinerary validation remain canonical`, () => {
  for(const d of france) {
    const before=JSON.stringify(d), display=localization.getDestinationText(d,locale);
    for(const f of ['name','description','recommendedStay','seasonalityNote']) assert.ok(display[f]?.trim(),d.id+':'+f);
    assert.equal(display.recommendations.length,4);
    assert.equal(library.findDestinationProfile({name:display.name}),d);
    assert.equal(localization.getDestinationCountryName(d,locale),new Intl.DisplayNames([locale],{type:'region'}).of('FR'));
    const validated=itinerary.validateItineraryRequest({ destination:{ name:d.name,country:d.country,recommendations:[...d.recommendations],
      recommendedStay:d.recommendedStay,bestMonths:d.bestMonths,lowSeasonMonths:d.lowSeasonMonths,highSeasonMonths:d.highSeasonMonths,seasonalityNote:d.seasonalityNote },days:2,locale });
    assert.ok(validated,d.id); assert.equal(validated.destination,d); assert.equal(itinerary.buildItineraryResponseRequest(validated).model,'gpt-5-mini');
    assert.equal(JSON.stringify(d),before);
  }
});

function renderHarness(locale) {
  const react={createElement:(type,props,...children)=>({type,props:props||{},children:children.flat(Infinity)})};
  const renderLoad=loader({
    'next/link':{default:'a'}, './LanguageProvider':{useLanguage:()=>({language:locale,t:(k,v)=>translations.translate(locale,k,v)})},
    '@/app/components/LanguageProvider':{useLanguage:()=>({language:locale,t:(k,v)=>translations.translate(locale,k,v)})},
    '@/app/components/LanguageSelector':{default:()=>null},
  },{React:react});
  function nodes(n) { if(!n||typeof n!=='object')return[n]; if(typeof n.type==='function')return nodes(n.type(n.props));return[n,...n.children.flatMap(nodes)]; }
  return {renderLoad,nodes,text:tree=>nodes(tree).filter(n=>typeof n==='string').join(' ')};
}

test('French country and monthly cards stay hidden by default in all seven languages', () => {
  for(const locale of codes) {
    const h=renderHarness(locale), Country=h.renderLoad('app/components/CountryDestinations.tsx').default;
    let selected;
    const tree=Country({countryCode:'FR',onSelect:d=>{selected=d;}});
    assert.equal(tree,null); assert.equal(selected,undefined);
    const Monthly=h.renderLoad('app/viajes-baratos/[mes]/MonthlyDestinations.tsx').default;
    const monthlyTree=Monthly({month:5,recommendations:france.map(destination=>({destination,reason:'best'}))});
    const links=h.nodes(monthlyTree).filter(n=>n?.type==='a');
    for(const d of france) {
      assert.ok(!links.some(n=>n.props.href===`/?ficha=${encodeURIComponent(d.name)}`));
      assert.ok(!links.some(n=>n.props.href===`/?primaveraServicio=vuelo&destino=${encodeURIComponent(d.name)}`));
      assert.ok(!h.text(monthlyTree).includes(localization.getDestinationText(d,locale).name));
    }
  }
});

test('country-aware city resolution preserves ES/PT and selects verified French codes for translated aliases', async () => {
  const expected=[['Madrid','ES','MAD','Ciudad de Madrid'],['Lisboa','PT','LIS','Lisboa'],['Porto','PT','OPO','Porto'],
    ['Parigi','FR','PAR','París'],['Nice','FR','NCE','Niza'],['Lione','FR','LYS','Lyon'],['Marselha','FR','MRS','Marsella'],
    ['Bordéus','FR','BOD','Burdeos'],['Straßburg','FR','SXB','Estrasburgo'],['Tolosa','FR','TLS','Toulouse'],['Nantes','FR','NTE','Nantes'],['Lilla','FR','LIL','Lille']];
  const records=expected.map(([,country_code,code,name])=>({type:'city',country_code,code,name}));
  const calls=[];
  const places=loader({}, {fetch:async input=>{ const u=new URL(input);calls.push(u);return{ok:true,json:async()=>[...records,{type:'city',country_code:'TH',code:'NNT',name:'Nantes',weight:99999}]}; }})('lib/travelpayouts/places.ts');
  for(const [alias,country,code]of expected) {
    assert.equal(places.matchingDestinationProfile(alias,country)?.countryCode,country);
    assert.equal((await places.resolveCity(alias+', '+country))?.code,code,alias);
  }
  assert.ok(calls.every(u=>u.searchParams.get('types[]')==='city'&&u.searchParams.get('locale')==='es'));
  assert.equal(places.matchingDestinationProfile('Nice','PT'),undefined);
  const emptyCalls=[];
  const empty=loader({}, {fetch:async input=>{emptyCalls.push(new URL(input).searchParams.get('term'));return{ok:true,json:async()=>[]};}})('lib/travelpayouts/places.ts');
  for(const d of [byId('annecy'),byId('chamonix'),byId('mont-saint-michel')]) assert.equal(await empty.resolveCity(d.name),null);
  assert.ok(!emptyCalls.some(term=>['GVA','LYS','RNS'].includes(term)),'no silent substitution of a nearby airport');
});

test('French photographs carry source and license metadata; no invented price or hotel identifiers are stored', () => {
  for(const d of france) {
    assert.ok(d.image.startsWith('https://'));
    if(d.id!=='fr-paris') {assert.ok(d.imageSource.startsWith('https://commons.wikimedia.org/wiki/File:'));assert.ok(d.imageCredit);assert.match(d.imageLicense,/^CC/);assert.ok(d.imageLicenseUrl);}
    for(const key of ['price','hotelPrice','flightPrice','available','hotelId']) assert.equal(d[key],undefined);
  }
});
