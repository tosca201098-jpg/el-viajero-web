const { test } = require('node:test');
const assert = require('node:assert/strict');
const {expectedCatalogTotal,expectedCountryCount}=require('./helpers/catalog-totals.cjs');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
const compilerOptions = {module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React};
function loader(mocks={},globals={}) {
  const cache=new Map();
  function load(file) {
    file=file.replaceAll('\\','/');if(cache.has(file))return cache.get(file);
    const exports={};cache.set(file,exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions}).outputText,{
      exports,Intl,URL,URLSearchParams,AbortController,Date,...globals,require:id=>{
        if(Object.hasOwn(mocks,id))return mocks[id];
        const base=id.startsWith('@/')?id.slice(2):path.join(path.dirname(file),id);
        const p=[base+'.ts',base+'.tsx',path.join(base,'index.ts')].find(p=>fs.existsSync(path.join(root,p)));
        if(!p)throw Error('Unexpected dependency '+id);return load(p);
      },
    });return exports;
  }return load;
}
const data=loader(),catalog=data('lib/destinations/index.ts');
const presentation={...data('lib/destinations/presentation.ts'),...data('lib/destinations/selection.ts')};
const dictionaries=data('lib/i18n/translations.ts'),localization=data('lib/destinations/localization.ts');
const monthly=data('lib/destinations/monthly.ts');
const locales=['es','en','fr','de','it','pt','ca'];
const react={createElement:(type,props,...children)=>({type,props:props??{},children:children.flat(Infinity)}),
  useState:initial=>[initial,()=>{}],useRef:initial=>({current:initial}),useEffect:()=>{}};
function nodes(n){if(!n||typeof n!=='object')return[];if(Array.isArray(n))return n.flatMap(nodes);return[n,...(n.children??[]).flatMap(nodes)];}
function text(n){if(n==null||n===false)return'';if(Array.isArray(n))return n.map(text).join(' ');return typeof n==='object'?text(n.children):String(n);}
function renderLoader(locale='es',extra={}) {
  const language={useLanguage:()=>({language:locale,t:(k,v)=>dictionaries.translate(locale,k,v),text:v=>dictionaries.translateText(locale,v)})};
  const blank={default:()=>null};
  // «Viajes por mes» ahora envuelve la lista de destinos recomendados en MonthlyOffers; se simula como un contenedor
  // para seguir comprobando que esa lista (el respaldo sin precios) conserva cada tarjeta y su orden.
  return loader({react,'./MonthlyOffers':{__esModule:true,default:'monthly-offers'},'next/link':{default:'a'},'next/script':{default:'script'},'next/image':{default:'img'},
    './voice-panel.module.css':{default:{}},'./components/LanguageProvider':language,'./LanguageProvider':language,
    '@/app/components/LanguageProvider':language,'./components/AuthDialog':blank,'./components/ItineraryPlanner':blank,
    './components/FlightLocationAutocomplete':blank,'./components/HeaderAuth':blank,'./components/LanguageSelector':blank,
    '@/app/components/LanguageSelector':blank,'@/lib/supabase/client':{getSupabaseClient:()=>null},
    '@/lib/supabase/saved-trips':{saveTrip:()=>{throw Error('Unexpected save');}},...extra},{React:extra.react??react});
}

test('automatic catalog recommendations hide added France profiles; all profiles remain available',()=>{
  assert.equal(catalog.destinationProfiles.length,expectedCatalogTotal(catalog));
  for(const d of catalog.destinationProfiles)assert.equal(presentation.canShowDestinationAutomatically(d),!['FR','IT','GB','DE','NL','BE','CH','AT','CZ','PL','HU','SK','GR','SI','HR','AL','TR','RS','BA','ME','MK','XK','MT','CY','RO','BG','MD','DK','IS','FI','SE','NO','IE','EE','LV','LT','LU','GI','JE','GG','IM','FO','AX'].includes(d.countryCode));
  assert.equal(presentation.canShowDestinationAutomatically({country:' Francia '}),false);
  assert.equal(presentation.canShowDestinationAutomatically({country:'España'}),true);
  assert.equal(presentation.canShowDestinationAutomatically({country:'Portugal'}),true);
  assert.equal(data('lib/destinations/featured.ts').destinations[0],catalog.getDestinationById('fr-paris'));
  assert.ok(catalog.getDestinationsForSeason('spring','FR').length>0);
  assert.ok(catalog.getDestinationsForMonth(5).some(d=>d.countryCode==='FR'));
});

test('homepage preserves all 16 original featured cards, including Paris, in all seven languages',()=>{
  for (const locale of locales) {
  const load=renderLoader(locale),Home=load('app/page.tsx').default,tree=Home();
  const cards=nodes(tree).filter(n=>n.type==='article');
  assert.equal(cards.length,16);
  const expected=load('lib/destinations/featured.ts').destinations.map(d=>localization.getDestinationText(d,locale).name);
  const actual=cards.map(card=>text(nodes(card).find(n=>n.type==='h3')));
  assert.deepEqual(actual,Array.from(expected));
  assert.equal(actual.filter(name=>name===localization.getDestinationText(catalog.getDestinationById('fr-paris'),locale).name).length,1);
  const flightDestination=nodes(tree).find(n=>n.props.variant==='main'&&n.props.label===dictionaries.translate(locale,'search.destination'));
  assert.equal(typeof flightDestination.props.onSelect,'function');
  }
});

test('the photograph and Explore button of every original card open the same destination profile',()=>{
  for(const locale of locales){
    const opened=[];
    const reactWithState={...react,useState:initial=>[initial,value=>opened.push(value)]};
    const load=renderLoader(locale,{react:reactWithState});
    const cards=nodes(load('app/page.tsx').default()).filter(n=>n.type==='article');
    const featured=load('lib/destinations/featured.ts').destinations;
    assert.equal(cards.length,featured.length);
    cards.forEach((card,index)=>{
      const buttons=nodes(card).filter(n=>n.type==='button');
      const image=nodes(card).find(n=>n.type==='img');
      assert.equal(image.props.src,featured[index].image);
      assert.equal(buttons.length,2);
      assert.equal(buttons[0].props['aria-haspopup'],'dialog');
      assert.equal(buttons[0].props['aria-label'],`${dictionaries.translate(locale,'monthly.viewDestination')}: ${localization.getDestinationText(featured[index],locale).name}`);
      buttons[0].props.onClick();
      buttons[1].props.onClick();
      assert.equal(opened.at(-2),featured[index]);
      assert.equal(opened.at(-1),featured[index]);
    });
  }
});

test('each language keeps the original card flight action and the existing itinerary planner',()=>{
  for(const locale of locales){
    const state=[];let index=0;
    const hooks={...react,useState(initial){const slot=index++;if(!(slot in state))state[slot]=initial;
      return[state[slot],value=>{state[slot]=typeof value==='function'?value(state[slot]):value;}];}};
    const load=renderLoader(locale,{react:hooks}),Home=load('app/page.tsx').default;
    const render=()=>{index=0;return Home();};
    const featured=load('lib/destinations/featured.ts').destinations;
    const card=nodes(render()).filter(node=>node.type==='article')[1];
    nodes(card).find(node=>node.type==='button').props.onClick();
    const detail=nodes(render());
    assert.ok(detail.some(node=>node.props.id==='destination-detail-title'&&text(node)===localization.getDestinationText(featured[1],locale).name),locale);
    assert.ok(detail.some(node=>node.type==='button'&&text(node).includes(dictionaries.translate(locale,'search.findFlights'))),locale);
    assert.ok(detail.some(node=>node.props.destination===featured[1]&&node.props.context),locale);
    assert.ok(!detail.some(node=>node.props.id==='tpwl-search'),locale);
  }
});

test('four seasons preserve every original card in its original order, without new country sections',()=>{
  const original=require('./fixtures/original-season-cards.json');
  for(const season of ['primavera','verano','otono','invierno']) {
    const tree=renderLoader()(`app/temporadas/${season}/page.tsx`).default();
    const cards=nodes(tree).filter(n=>n.type==='article');
    assert.deepEqual(cards.map(card=>text(nodes(card).find(n=>n.type==='h3'))),original[season],season);
    assert.ok(!nodes(tree).some(n=>typeof n.type==='function'&&n.type.name==='CountryDestinations'));
    assert.ok(!fs.readFileSync(path.join(root,`app/temporadas/${season}/page.tsx`),'utf8').includes('CountryDestinations'));
  }
});

test('all twelve monthly pages keep every ES/PT card in its original order in all seven languages',()=>{
  for(const locale of locales) {
    const Monthly=renderLoader(locale)('app/viajes-baratos/[mes]/MonthlyDestinations.tsx').default;
    for(let month=1;month<=12;month++) {
      const recommendations=monthly.getMonthlyRecommendations(month);
      const tree=Monthly({month,recommendations});
      const cards=nodes(tree).filter(n=>n.type==='article');
      const actual=cards.map(card=>nodes(card).find(n=>n.type==='h2').children.join(''));
      const expected=recommendations.filter(r=>!['FR', 'IT', 'GB', 'DE', 'NL', 'BE', 'CH', 'AT', 'CZ', 'PL', 'HU', 'SK', 'GR', 'SI', 'HR', 'AL', 'TR', 'RS', 'BA', 'ME', 'MK', 'XK', 'MT', 'CY', 'RO', 'BG', 'MD', 'DK', 'IS', 'FI', 'SE', 'NO', 'IE', 'EE', 'LV', 'LT', 'LU', 'GI', 'JE', 'GG', 'IM', 'FO', 'AX'].includes(r.destination.countryCode)).map(r=>localization.getDestinationText(r.destination,locale).name);
      assert.deepEqual(actual,Array.from(expected),`${locale}:${month}`);
      // Fuera de la ficha ya no hay botón «Buscar vuelos»: está dentro de cada destino. «Ver destino» se mantiene.
      assert.ok(!nodes(tree).some(n=>String(n.props?.href??'').includes('primaveraServicio')),`${locale}:${month}`);
      assert.ok(!text(tree).includes(dictionaries.translate(locale,'search.findFlights')),`${locale}:${month}`);
      assert.equal(nodes(tree).filter(n=>String(n.props?.href??'').startsWith('/?ficha=')).length,cards.length,`${locale}:${month}`);
    }
  }
});

test('committed city/airport choices resolve one canonical destination, without confusing countries or airport ownership',()=>{
  for(const [name,code,id]of [['París','PAR','paris'],['Lyon','LYS','lyon'],['Niza','NCE','nice'],['Marsella','MRS','marseille']]) {
    const selection={type:'city',name,code,country:'Francia',cityName:null,cityCode:null};
    assert.equal(presentation.destinationFromPlaceSelection(selection),catalog.getDestinationById('fr-'+id));
    assert.equal(presentation.destinationFromPlaceSelection({...selection,country:'Estados Unidos'}),undefined);
  }
  assert.equal(presentation.destinationFromPlaceSelection({type:'airport',name:'Ch. De Gaulle',code:'CDG',country:'Francia',cityName:'París',cityCode:'PAR'}),catalog.getDestinationById('fr-paris'));
  assert.equal(presentation.destinationFromPlaceSelection({type:'airport',name:'Ginebra',code:'GVA',country:'Suiza',cityName:'Ginebra',cityCode:'GVA'}),catalog.getDestinationById('ch-geneva'));
});

// Run the actual Home handlers/JSX, as in the voice integration tests; no duplicated UI logic.
const page=ts.createSourceFile('page.tsx',fs.readFileSync(path.join(root,'app/page.tsx'),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
const methods={},names=['changeFlightDestination','confirmFlightDestination','openDestinationProfile','renderConfirmedDestination'];let confirmedExpression;
(function walk(node){
  if(ts.isFunctionDeclaration(node)&&names.includes(node.name?.text))methods[node.name.text]=node.getText(page);
  if(ts.isVariableDeclaration(node)&&node.name.getText(page)==='confirmedFlightProfile')confirmedExpression=node.initializer.getText(page);
  ts.forEachChild(node,walk);
})(page);
const bridgeCode=ts.transpileModule(`const DestinationProfileSummary='summary';\n${methods.changeFlightDestination}\n${methods.confirmFlightDestination}\n${methods.openDestinationProfile}\nthis.change=changeFlightDestination;this.confirm=confirmFlightDestination;this.button=()=>{const confirmedFlightProfile=${confirmedExpression};${methods.renderConfirmedDestination};return renderConfirmedDestination();};`,{compilerOptions}).outputText;

const allDetailProfiles=[...catalog.getDestinationsByCountry('GR'),...catalog.getDestinationsByCountry('SI'),...data('lib/destinations/france-airport-coverage.ts').franceAirportCoverage];
const requestedDetailIds=process.env.DESTINAUTA_CARD_TEST_IDS?.split(',').filter(Boolean);
const detailProfiles=requestedDetailIds?requestedDetailIds.map(id=>{const profile=allDetailProfiles.find(p=>p.id===id);assert.ok(profile,'Unknown requested detail profile: '+id);return profile;}):allDetailProfiles;
test('Greek, Slovenian and new French city cards open only after explicit selection and keep the shared detail in every language',()=>{
  for(const locale of locales)for(const profile of detailProfiles){
    const state=[];let index=0;
    const hooks={...react,useState(initial){const slot=index++;if(!(slot in state))state[slot]=typeof initial==='function'?initial():initial;
      return[state[slot],value=>{state[slot]=typeof value==='function'?value(state[slot]):value;}];}};
    const load=renderLoader(locale,{react:hooks}),Home=load('app/page.tsx').default;
    const render=()=>{index=0;return nodes(Home());};
    let tree=render();
    assert.equal(tree.filter(n=>n.type==='article').length,16);
    assert.ok(!tree.some(n=>n.props.id==='destination-detail-title'));
    const input=tree.find(n=>n.props.variant==='main'&&n.props.label===dictionaries.translate(locale,'search.destination'));
    const display=localization.getDestinationText(profile,locale);
    input.props.onChange(display.name);
    assert.ok(!render().some(n=>n.props.id==='destination-detail-title'));
    input.props.onSelect({type:'city',name:display.name,code:profile.iataCodes[0],country:profile.country,cityName:null,cityCode:null},display.name);
    tree=render();
    assert.ok(!tree.some(n=>n.props.id==='destination-detail-title'));
    const button=tree.find(n=>n.type==='button'&&n.props['aria-haspopup']==='dialog'&&n.props['aria-label']===`${dictionaries.translate(locale,'monthly.viewDestination')}: ${display.name}`&&nodes(n).some(child=>child.props.destination?.id===profile.id));
    assert.ok(button,profile.id+':'+locale);button.props.onClick();tree=render();
    assert.ok(tree.some(n=>n.props.id==='destination-detail-title'&&text(n)===display.name),profile.id+':'+locale);
    assert.ok(tree.some(n=>n.type==='img'&&n.props.src===profile.image));
    assert.ok(tree.some(n=>n.props.role==='dialog'&&n.props.className.includes('bg-white')));
    for(const recommendation of display.recommendations)assert.ok(tree.some(n=>text(n)===dictionaries.translateText(locale,recommendation)||text(n).includes(recommendation)),recommendation);
    assert.ok(tree.some(n=>n.props.destination?.id===profile.id&&n.props.context));
    const arrival=tree.find(n=>n.props['aria-label']===dictionaries.translate(locale,'destinations.arrivalAirport'));
    assert.ok(arrival,profile.id+':'+locale);
    assert.ok(text(arrival).includes(profile.iataCodes[0]));
    assert.ok(text(arrival).includes((profile.countryCode==='SI'?data('lib/travelpayouts/slovenia-airports.ts').sloveniaAirportTown:profile.countryCode==='FR'?data('lib/travelpayouts/france-airports.ts').franceAirportTown:data('lib/travelpayouts/greece-airports.ts').greeceAirportTown)(profile.iataCodes[0],locale)));
    assert.ok(tree.some(n=>n.type==='button'&&text(n).includes(dictionaries.translate(locale,'search.findHotels'))));
    assert.ok(tree.some(n=>n.type==='button'&&text(n).includes(dictionaries.translate(locale,'search.findFlights'))));
    assert.equal(tree.filter(n=>n.type==='article').length,16);
  }
});
test('Limoges focal point reaches the existing detail image without replacing the original photograph',()=>{
  const state=[];let index=0;const hooks={...react,useState(initial){const slot=index++;if(!(slot in state))state[slot]=typeof initial==='function'?initial():initial;return[state[slot],value=>{state[slot]=typeof value==='function'?value(state[slot]):value;}];}};
  const Home=renderLoader('es',{react:hooks})('app/page.tsx').default;
  const render=()=>{index=0;return nodes(Home());};
  const input=render().find(n=>n.props.variant==='main'&&n.props.label==='Destino');
  input.props.onChange('Limoges');render();
  input.props.onSelect({type:'airport',name:'Limoges Bellegarde',code:'LIG',country:'Francia',cityName:'Limoges',cityCode:'LIG'},'Limoges');
  const button=render().find(n=>n.type==='button'&&n.props['aria-label']==='Ver destino: Limoges');assert.ok(button);button.props.onClick();
  const image=render().find(n=>n.type==='img'&&n.props.alt==='Limoges');assert.ok(image);
  assert.equal(image.props.src,catalog.getDestinationById('fr-limoges').image);assert.equal(image.props.style.objectPosition,'center top');
});

test('budget discovery UI hides French cards while retaining the same ES/PT result objects and prices',()=>{
  let expression;
  (function walk(node){if(ts.isVariableDeclaration(node)&&node.name.getText(page)==='automaticDiscoverResults')expression=node.initializer.getText(page);ts.forEachChild(node,walk);})(page);
  const results=[{destination:{name:'Roma',country:'Italia',code:'ROM'},offer:{price:80}},
    {destination:{name:'Lyon',country:'Francia',code:'LYS'},offer:{price:90}},
    {destination:{name:'Madrid',country:'España',code:'MAD'},offer:{price:100}},
    {destination:{name:'Lisboa',country:'Portugal',code:'LIS'},offer:{price:110}}];
  const scope={discoverState:{status:'success',results},canShowDestinationAutomatically:presentation.canShowDestinationAutomatically};
  vm.runInNewContext(`this.visible=${expression};`,scope);
  assert.equal(scope.visible.length,2);assert.equal(scope.visible[0],results[2]);assert.equal(scope.visible[1],results[3]);
});
test('typing and confirming do not open a modal; View destination opens only the selected French profile in every language',()=>{
  for(const language of locales) for(const [name,code,id]of [['París','PAR','paris'],['Lyon','LYS','lyon'],['Niza','NCE','nice'],['Marsella','MRS','marseille']]) {
    const opened=[],scope={React:react,language,destinoVuelo:'',confirmedFlightDestination:null,
      destinationFromPlaceSelection:presentation.destinationFromPlaceSelection,getDestinationById:catalog.getDestinationById,
      getDestinationText:localization.getDestinationText,t:(k,v)=>dictionaries.translate(language,k,v),
      setDestinoVuelo:v=>{scope.destinoVuelo=v;},setConfirmedFlightDestination:v=>{scope.confirmedFlightDestination=v;},
      setFlightResultsOpen:()=>{},setModal:()=>{},setDestinoSeleccionado:d=>opened.push(d)};
    vm.runInNewContext(bridgeCode,scope);
    scope.change(name);assert.equal(opened.length,0);assert.equal(scope.button(),null);
    scope.confirm({type:'city',name,code,country:'Francia',cityName:null,cityCode:null},name);
    assert.equal(opened.length,0);
    const button=scope.button();assert.equal(button.type,'button');assert.ok(button.props['aria-label'].includes(localization.getDestinationText(catalog.getDestinationById('fr-'+id),language).name));
    button.props.onClick();assert.equal(opened.length,1);assert.equal(opened[0],catalog.getDestinationById('fr-'+id));
    scope.change(name+'x');assert.equal(scope.button(),null);assert.equal(opened.length,1);
  }
});

test('typing and confirming do not open a modal; View destination opens only the selected Italian profile in every language',()=>{
  for(const language of locales) for(const destination of catalog.getDestinationsByCountry('IT')) {
    const name=localization.getDestinationText(destination,language).name,code=destination.iataCodes[0],id=destination.id;
    const opened=[],scope={React:react,language,destinoVuelo:'',confirmedFlightDestination:null,
      destinationFromPlaceSelection:presentation.destinationFromPlaceSelection,getDestinationById:catalog.getDestinationById,
      getDestinationText:localization.getDestinationText,t:(k,v)=>dictionaries.translate(language,k,v),
      setDestinoVuelo:v=>{scope.destinoVuelo=v;},setConfirmedFlightDestination:v=>{scope.confirmedFlightDestination=v;},
      setFlightResultsOpen:()=>{},setModal:()=>{},setDestinoSeleccionado:d=>opened.push(d)};
    vm.runInNewContext(bridgeCode,scope);
    scope.change(name);assert.equal(opened.length,0);assert.equal(scope.button(),null);
    scope.confirm({type:'city',name,code,country:'Italia',cityName:null,cityCode:null},name);
    assert.equal(opened.length,0);
    const button=scope.button();assert.equal(button.type,'button');assert.ok(button.props['aria-label'].includes(localization.getDestinationText(catalog.getDestinationById(id),language).name));
    button.props.onClick();assert.equal(opened.length,1);assert.equal(opened[0],catalog.getDestinationById(id));
    scope.change(name+'x');assert.equal(scope.button(),null);assert.equal(opened.length,1);
  }
});

test('typing and confirming do not open a modal; View destination opens only the selected British profile in every language',()=>{
  for(const language of locales) for(const destination of catalog.getDestinationsByCountry('GB')) {
    const name=localization.getDestinationText(destination,language).name,code=destination.iataCodes[0]??null,id=destination.id;
    const opened=[],scope={React:react,language,destinoVuelo:'',confirmedFlightDestination:null,
      destinationFromPlaceSelection:presentation.destinationFromPlaceSelection,getDestinationById:catalog.getDestinationById,
      getDestinationText:localization.getDestinationText,t:(k,v)=>dictionaries.translate(language,k,v),
      setDestinoVuelo:v=>{scope.destinoVuelo=v;},setConfirmedFlightDestination:v=>{scope.confirmedFlightDestination=v;},
      setFlightResultsOpen:()=>{},setModal:()=>{},setDestinoSeleccionado:d=>opened.push(d)};
    vm.runInNewContext(bridgeCode,scope);
    scope.change(name);assert.equal(opened.length,0);assert.equal(scope.button(),null);
    scope.confirm({type:'city',name,code,country:'Reino Unido',cityName:null,cityCode:null},name);
    assert.equal(opened.length,0);
    const button=scope.button();assert.equal(button.type,'button');assert.ok(button.props['aria-label'].includes(localization.getDestinationText(catalog.getDestinationById(id),language).name));
    button.props.onClick();assert.equal(opened.length,1);assert.equal(opened[0],catalog.getDestinationById(id));
    scope.change(name+'x');assert.equal(scope.button(),null);assert.equal(opened.length,1);
  }
});

test('typing and confirming do not open a modal; View destination opens only the selected German profile in every language',()=>{
  for(const language of locales) for(const destination of catalog.getDestinationsByCountry('DE')) {
    const name=localization.getDestinationText(destination,language).name,code=destination.iataCodes[0]??null,id=destination.id;
    const opened=[],scope={React:react,language,destinoVuelo:'',confirmedFlightDestination:null,
      destinationFromPlaceSelection:presentation.destinationFromPlaceSelection,getDestinationById:catalog.getDestinationById,
      getDestinationText:localization.getDestinationText,t:(k,v)=>dictionaries.translate(language,k,v),
      setDestinoVuelo:v=>{scope.destinoVuelo=v;},setConfirmedFlightDestination:v=>{scope.confirmedFlightDestination=v;},
      setFlightResultsOpen:()=>{},setModal:()=>{},setDestinoSeleccionado:d=>opened.push(d)};
    vm.runInNewContext(bridgeCode,scope);
    scope.change(name);assert.equal(opened.length,0);assert.equal(scope.button(),null);
    scope.confirm({type:'city',name,code,country:'Alemania',cityName:null,cityCode:null},name);
    assert.equal(opened.length,0);
    const button=scope.button();assert.equal(button.type,'button');assert.ok(button.props['aria-label'].includes(localization.getDestinationText(catalog.getDestinationById(id),language).name));
    button.props.onClick();assert.equal(opened.length,1);assert.equal(opened[0],catalog.getDestinationById(id));
    scope.change(name+'x');assert.equal(scope.button(),null);assert.equal(opened.length,1);
  }
});

test('typing and confirming do not open a modal; View destination opens only the selected Dutch profile in every language',()=>{
  for(const language of locales) for(const destination of catalog.getDestinationsByCountry('NL')) {
    const name=localization.getDestinationText(destination,language).name,code=destination.iataCodes[0]??null,id=destination.id;
    const opened=[],scope={React:react,language,destinoVuelo:'',confirmedFlightDestination:null,
      destinationFromPlaceSelection:presentation.destinationFromPlaceSelection,getDestinationById:catalog.getDestinationById,
      getDestinationText:localization.getDestinationText,t:(k,v)=>dictionaries.translate(language,k,v),
      setDestinoVuelo:v=>{scope.destinoVuelo=v;},setConfirmedFlightDestination:v=>{scope.confirmedFlightDestination=v;},
      setFlightResultsOpen:()=>{},setModal:()=>{},setDestinoSeleccionado:d=>opened.push(d)};
    vm.runInNewContext(bridgeCode,scope);
    scope.change(name);assert.equal(opened.length,0);assert.equal(scope.button(),null);
    scope.confirm({type:'city',name,code,country:'Países Bajos',cityName:null,cityCode:null},name);
    assert.equal(opened.length,0);
    const button=scope.button();assert.equal(button.type,'button');assert.ok(button.props['aria-label'].includes(localization.getDestinationText(catalog.getDestinationById(id),language).name));
    button.props.onClick();assert.equal(opened.length,1);assert.equal(opened[0],catalog.getDestinationById(id));
    scope.change(name+'x');assert.equal(scope.button(),null);assert.equal(opened.length,1);
  }
});

test('typing and confirming do not open a modal; View destination opens only the selected Belgian profile in every language',()=>{
  for(const language of locales) for(const destination of catalog.getDestinationsByCountry('BE')) {
    const name=localization.getDestinationText(destination,language).name,code=destination.iataCodes[0]??null,id=destination.id;
    const opened=[],scope={React:react,language,destinoVuelo:'',confirmedFlightDestination:null,
      destinationFromPlaceSelection:presentation.destinationFromPlaceSelection,getDestinationById:catalog.getDestinationById,
      getDestinationText:localization.getDestinationText,t:(k,v)=>dictionaries.translate(language,k,v),
      setDestinoVuelo:v=>{scope.destinoVuelo=v;},setConfirmedFlightDestination:v=>{scope.confirmedFlightDestination=v;},
      setFlightResultsOpen:()=>{},setModal:()=>{},setDestinoSeleccionado:d=>opened.push(d)};
    vm.runInNewContext(bridgeCode,scope);
    scope.change(name);assert.equal(opened.length,0);assert.equal(scope.button(),null);
    scope.confirm({type:'city',name,code,country:'Bélgica',cityName:null,cityCode:null},name);
    assert.equal(opened.length,0);
    const button=scope.button();assert.equal(button.type,'button');assert.ok(button.props['aria-label'].includes(localization.getDestinationText(catalog.getDestinationById(id),language).name));
    button.props.onClick();assert.equal(opened.length,1);assert.equal(opened[0],catalog.getDestinationById(id));
    scope.change(name+'x');assert.equal(scope.button(),null);assert.equal(opened.length,1);
  }
});

test('Swiss, Austrian and Croatian profiles open only through the contextual button in each language',()=>{
  for(const language of locales) for(const destination of [...catalog.getDestinationsByCountry('CH'), ...catalog.getDestinationsByCountry('AT'), ...catalog.getDestinationsByCountry('HR')]) {
    const name=localization.getDestinationText(destination,language).name;
    const opened=[],scope={React:react,language,destinoVuelo:'',confirmedFlightDestination:null,
      destinationFromPlaceSelection:presentation.destinationFromPlaceSelection,getDestinationById:catalog.getDestinationById,
      getDestinationText:localization.getDestinationText,t:(key,values)=>dictionaries.translate(language,key,values),
      setDestinoVuelo:value=>{scope.destinoVuelo=value;},setConfirmedFlightDestination:value=>{scope.confirmedFlightDestination=value;},
      setFlightResultsOpen:()=>{},setModal:()=>{},setDestinoSeleccionado:value=>opened.push(value)};
    vm.runInNewContext(bridgeCode,scope);
    scope.change(name);
    assert.equal(opened.length,0);
    assert.equal(scope.button(),null);
    scope.confirm({type:'city',name,code:destination.iataCodes[0]??null,country:destination.country,cityName:null,cityCode:null},name);
    assert.equal(opened.length,0);
    const button=scope.button();
    assert.equal(button.type,'button',destination.id+':'+language);
    button.props.onClick();
    assert.equal(opened.length,1);
    assert.equal(opened[0],destination);
    scope.change(name+'x');
    assert.equal(scope.button(),null);
  }
});

test('Madrid and Lisboa selections show their real image-backed profile access in every language',()=>{
  for(const language of locales) for(const [name,code,country,id] of [
    ['Madrid','MAD','España','es-madrid'], ['Lisboa','LIS','Portugal','pt-lisboa'],
  ]) {
    const opened=[],scope={React:react,language,destinoVuelo:'',confirmedFlightDestination:null,
      destinationFromPlaceSelection:presentation.destinationFromPlaceSelection,getDestinationById:catalog.getDestinationById,
      getDestinationText:localization.getDestinationText,t:(key,values)=>dictionaries.translate(language,key,values),
      setDestinoVuelo:value=>{scope.destinoVuelo=value;},setConfirmedFlightDestination:value=>{scope.confirmedFlightDestination=value;},
      setFlightResultsOpen:()=>{},setModal:()=>{},setDestinoSeleccionado:value=>opened.push(value)};
    vm.runInNewContext(bridgeCode,scope);
    scope.change(name);
    assert.equal(scope.button(),null);
    scope.confirm({type:'city',name,code,country,cityName:null,cityCode:null},name);
    const button=scope.button(),profile=catalog.getDestinationById(id);
    assert.equal(button.type,'button');
    assert.equal(button.props['aria-haspopup'],'dialog');
    assert.equal(button.children[0].props.destination,profile);
    assert.ok(button.props['aria-label'].includes(localization.getDestinationText(profile,language).name));
    button.props.onClick();
    assert.equal(opened[0],profile);
  }
});

test('the shared destination summary uses catalog images and translated tourism content',()=>{
  for(const locale of locales) for(const id of ['es-madrid','pt-lisboa','fr-paris','it-rome']) {
    const destination=catalog.getDestinationById(id);
    const Summary=renderLoader(locale)('app/components/DestinationProfileSummary.tsx').default;
    const tree=Summary({destination,detailed:true});
    const display=localization.getDestinationText(destination,locale);
    const image=nodes(tree).find(n=>n.type==='img');
    assert.equal(image.props.src,destination.image);
    assert.ok(image.props.alt.includes(display.name));
    assert.ok(text(tree).includes(display.description));
    assert.ok(text(tree).includes(display.recommendedStay));
    for(const place of display.recommendations)assert.ok(text(tree).includes(place));
  }
});

test('all fifteen Croatian cards open only after explicit selection and keep the shared detail in every language',()=>{
  for(const locale of locales)for(const profile of catalog.getDestinationsByCountry('HR')){
    const state=[];let index=0;
    const hooks={...react,useState(initial){const slot=index++;if(!(slot in state))state[slot]=typeof initial==='function'?initial():initial;
      return[state[slot],value=>{state[slot]=typeof value==='function'?value(state[slot]):value;}];}};
    const load=renderLoader(locale,{react:hooks}),Home=load('app/page.tsx').default;
    const render=()=>{index=0;return nodes(Home());};
    let tree=render();
    assert.equal(tree.filter(n=>n.type==='article').length,16);
    assert.ok(!tree.some(n=>n.props.id==='destination-detail-title'));
    const input=tree.find(n=>n.props.variant==='main'&&n.props.label===dictionaries.translate(locale,'search.destination'));
    const display=localization.getDestinationText(profile,locale);
    input.props.onChange(display.name);
    assert.ok(!render().some(n=>n.props.id==='destination-detail-title'));
    input.props.onSelect({type:'city',name:display.name,code:profile.iataCodes[0],country:profile.country,cityName:null,cityCode:null},display.name);
    tree=render();
    assert.ok(!tree.some(n=>n.props.id==='destination-detail-title'));
    const button=tree.find(n=>n.type==='button'&&n.props['aria-haspopup']==='dialog'&&n.props['aria-label']===`${dictionaries.translate(locale,'monthly.viewDestination')}: ${display.name}`&&nodes(n).some(child=>child.props.destination?.id===profile.id));
    assert.ok(button,profile.id+':'+locale);button.props.onClick();tree=render();
    assert.ok(tree.some(n=>n.props.id==='destination-detail-title'&&text(n)===display.name),profile.id+':'+locale);
    assert.ok(tree.some(n=>n.type==='img'&&n.props.src===profile.image));
    assert.ok(tree.some(n=>n.props.role==='dialog'&&n.props.className.includes('bg-white')));
    for(const recommendation of display.recommendations)assert.ok(tree.some(n=>text(n)===dictionaries.translateText(locale,recommendation)||text(n).includes(recommendation)),recommendation);
    assert.ok(tree.some(n=>n.props.destination?.id===profile.id&&n.props.context));
    const arrival=tree.find(n=>n.props['aria-label']===dictionaries.translate(locale,'destinations.arrivalAirport'));
    if(profile.airports.length){
      assert.ok(arrival,profile.id+':'+locale);
      assert.ok(text(arrival).includes(profile.iataCodes[0]));
      assert.ok(text(arrival).includes(data('lib/travelpayouts/croatia-airports.ts').croatiaAirportTown(profile.iataCodes[0],locale)));
    } else assert.equal(arrival,undefined,profile.id+':'+locale);
    assert.ok(tree.some(n=>n.type==='button'&&text(n).includes(dictionaries.translate(locale,'search.findHotels'))));
    if(profile.iataCodes.length)assert.ok(tree.some(n=>n.type==='button'&&text(n).includes(dictionaries.translate(locale,'search.findFlights'))),profile.id+':'+locale);
    else for(const airport of profile.accessAirports)assert.ok(tree.some(n=>n.type==='button'&&text(n).includes(airport.iataCode)),profile.id+':'+locale+':'+airport.iataCode);
    assert.equal(tree.filter(n=>n.type==='article').length,16);
  }
});
