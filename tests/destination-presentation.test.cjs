const { test } = require('node:test');
const assert = require('node:assert/strict');
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
  return loader({react,'next/link':{default:'a'},'./components/LanguageProvider':language,'./LanguageProvider':language,
    '@/app/components/LanguageProvider':language,'./components/AuthDialog':blank,'./components/ItineraryPlanner':blank,
    './components/FlightLocationAutocomplete':blank,'./components/HeaderAuth':blank,'./components/LanguageSelector':blank,
    '@/app/components/LanguageSelector':blank,'@/lib/supabase/client':{getSupabaseClient:()=>null},
    '@/lib/supabase/saved-trips':{saveTrip:()=>{throw Error('Unexpected save');}},...extra},{React:extra.react??react});
}

test('automatic catalog recommendations hide added France profiles; all 185 profiles remain available',()=>{
  assert.equal(catalog.destinationProfiles.length,185);
  for(const d of catalog.destinationProfiles)assert.equal(presentation.canShowDestinationAutomatically(d),!['FR','IT','GB','DE','NL','BE','CH','AT','CZ','PL'].includes(d.countryCode));
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
      const expected=recommendations.filter(r=>!['FR','IT','GB','DE','NL','BE','CH','AT','CZ','PL'].includes(r.destination.countryCode)).map(r=>localization.getDestinationText(r.destination,locale).name);
      assert.deepEqual(actual,Array.from(expected),`${locale}:${month}`);
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
const bridgeCode=ts.transpileModule(`${methods.changeFlightDestination}\n${methods.confirmFlightDestination}\n${methods.openDestinationProfile}\nthis.change=changeFlightDestination;this.confirm=confirmFlightDestination;this.button=()=>{const confirmedFlightProfile=${confirmedExpression};${methods.renderConfirmedDestination};return renderConfirmedDestination();};`,{compilerOptions}).outputText;
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
    const button=scope.button();assert.equal(button.type,'button');assert.ok(text(button).includes(localization.getDestinationText(catalog.getDestinationById('fr-'+id),language).name));
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
    const button=scope.button();assert.equal(button.type,'button');assert.ok(text(button).includes(localization.getDestinationText(catalog.getDestinationById(id),language).name));
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
    const button=scope.button();assert.equal(button.type,'button');assert.ok(text(button).includes(localization.getDestinationText(catalog.getDestinationById(id),language).name));
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
    const button=scope.button();assert.equal(button.type,'button');assert.ok(text(button).includes(localization.getDestinationText(catalog.getDestinationById(id),language).name));
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
    const button=scope.button();assert.equal(button.type,'button');assert.ok(text(button).includes(localization.getDestinationText(catalog.getDestinationById(id),language).name));
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
    const button=scope.button();assert.equal(button.type,'button');assert.ok(text(button).includes(localization.getDestinationText(catalog.getDestinationById(id),language).name));
    button.props.onClick();assert.equal(opened.length,1);assert.equal(opened[0],catalog.getDestinationById(id));
    scope.change(name+'x');assert.equal(scope.button(),null);assert.equal(opened.length,1);
  }
});

test('Swiss and Austrian profiles open only through the contextual button in each language',()=>{
  for(const language of locales) for(const destination of [...catalog.getDestinationsByCountry('CH'), ...catalog.getDestinationsByCountry('AT')]) {
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
