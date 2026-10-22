const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../app/components/FlightLocationAutocomplete.tsx'),'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 },
}).outputText;

// Exercise the component's actual handlers/position effect with a small React/DOM mock.
const dictionary={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(__dirname,'../lib/i18n/translations.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports:dictionary});
function mount(width, rect, suppliedChoices, locale='es') {
  const choices = suppliedChoices ?? [
    {type:'city',name:'Lyon',country:'Francia',code:'LYS',cityName:null,cityCode:null},
    {type:'airport',name:'Ch. De Gaulle',country:'Francia',code:'CDG',cityName:'París',cityCode:'PAR'},
  ];
  const states = [0, choices, true, -1, null], changes = [], selections = [], effects = [];
  let stateIndex = 0, refIndex = 0, focuses = 0;
  const refs = [{current:{contains:()=>false}}, {current:{getBoundingClientRect:()=>rect,focus:()=>focuses++}}, {current:null}, {current:false}];
  const react = {
    createElement: (type,props,...children)=>({type,props:props??{},children}),
    useId: ()=>'autocomplete-test',
    useRef: ()=>refs[refIndex++],
    useState: ()=>{const index=stateIndex++;return[states[index],value=>{states[index]=typeof value==='function'?value(states[index]):value;}];},
    useEffect: fn=>effects.push(fn),
  };
  const events=[];
  const window={innerWidth:width,innerHeight:720,addEventListener:name=>events.push(name),removeEventListener:()=>{}};
  const document={body:{},addEventListener:name=>events.push(name),removeEventListener:()=>{}};
  const exports={};
  vm.runInNewContext(compiled,{exports,React:react,window,document,require:id=>id==='react'?react:id==='./LanguageProvider'?{useLanguage:()=>({t:key=>dictionary.translate(locale,key)})}:{createPortal:node=>node}});
  function render() {
    stateIndex=0;refIndex=0;effects.length=0;
    return exports.default({label:'Destino',value:'lyon',onChange:value=>changes.push(value),onSelect:(place,value)=>selections.push({place,value}),placeholder:'Ciudad',variant:'main'});
  }
  function nodes(tree,type) {
    if(!tree||typeof tree!=='object')return[];
    if(Array.isArray(tree))return tree.flatMap(n=>nodes(n,type));
    return [...(tree.type===type?[tree]:[]),...tree.children.flatMap(n=>nodes(n,type))];
  }
  render(); effects[1](); // Only the popup positioning effect; no network in this UI test.
  const input=()=>nodes(render(),'input')[0];
  function key(value) {let prevented=false;input().props.onKeyDown({key:value,preventDefault:()=>{prevented=true;}});return prevented;}
  return {render,nodes,input,key,states,choices,changes,selections,events,focuses:()=>focuses};
}

test('keyboard selection uses the first ranked suggestion, wraps arrows and closes on Escape',()=>{
  const ui=mount(1280,{left:200,width:400,top:100,bottom:144});
  assert.equal(ui.input().props.role,'combobox');
  assert.equal(ui.key('ArrowDown'),true);assert.equal(ui.states[3],0);
  assert.equal(ui.selections.length,0);
  assert.equal(ui.input().props['aria-activedescendant'],'autocomplete-test-option-0');
  assert.equal(ui.key('Enter'),true);
  assert.deepEqual(ui.changes,['Lyon']);assert.equal(ui.states[2],false);assert.equal(ui.focuses(),1);
  assert.equal(ui.selections[0].place,ui.choices[0]);assert.equal(ui.selections[0].value,'Lyon');
  assert.equal(ui.input().props['aria-expanded'],false);
  ui.states[2]=true;
  ui.key('ArrowUp');assert.equal(ui.states[3],1);
  ui.key('ArrowDown');assert.equal(ui.states[3],0);
  ui.key('Escape');assert.equal(ui.states[2],false);
});

test('mobile popup stays inside the viewport, opens above a low field and preserves touch/click airport selection',()=>{
  const ui=mount(375,{left:20,width:335,top:620,bottom:664});
  const list=ui.nodes(ui.render(),'ul')[0];
  assert.equal(list.props.role,'listbox');
  assert.ok(list.props.style.left>=8);
  assert.ok(list.props.style.left+list.props.style.width<=367);
  assert.ok(list.props.style.maxHeight>0);
  assert.equal(list.props.style.top,undefined);assert.equal(list.props.style.bottom,104);
  const buttons=ui.nodes(list,'button');
  assert.equal(buttons.length,2);
  buttons[1].props.onClick();
  assert.deepEqual(ui.changes,['París']); // Existing city-based flight-search semantics retained.
  assert.equal(ui.selections[0].place,ui.choices[1]);assert.equal(ui.selections[0].value,'París');
  assert.equal(ui.states[2],false);assert.equal(ui.focuses(),1);
  assert.ok(ui.events.includes('resize'));assert.ok(ui.events.includes('pointerdown'));
});

test('typing free text never emits a committed destination selection',()=>{
  const ui=mount(375,{left:20,width:335,top:100,bottom:144});
  ui.input().props.onChange({target:{value:'Lyon'}});
  assert.deepEqual(ui.changes,['Lyon']);assert.equal(ui.selections.length,0);assert.equal(ui.states[2],false);
});

test('informational LGG entries cannot be selected by click or Enter; arrows skip them without changing other selections',()=>{
  const choices=[{type:'airport',name:'Liege Airport',country:'Bélgica',code:'LGG',cityName:'Lieja',cityCode:'LGG',scheduledPassengerService:false,serviceNotice:'noScheduledFlights'},
    {type:'city',name:'Lieja',country:'Bélgica',code:'LGG',cityName:null,cityCode:null,scheduledPassengerService:false,serviceNotice:'noScheduledFlights'},
    {type:'airport',name:'Brussels Airport — Zaventem',country:'Bélgica',code:'BRU',cityName:'Bruselas',cityCode:'BRU'}];
  const ui=mount(375,{left:20,width:335,top:100,bottom:144},choices);
  const buttons=ui.nodes(ui.render(),'button');assert.equal(buttons[0].props.disabled,true);assert.equal(buttons[1].props.disabled,true);
  buttons[0].props.onClick();assert.equal(ui.changes.length,0);assert.equal(ui.selections.length,0);
  ui.key('ArrowDown');assert.equal(ui.states[3],2);ui.key('Enter');assert.deepEqual(ui.changes,['Bruselas']);assert.equal(ui.selections[0].place,choices[2]);
  const only=mount(375,{left:20,width:335,top:100,bottom:144},choices.slice(0,2));
  assert.equal(only.key('ArrowDown'),true);assert.equal(only.states[3],-1);assert.equal(only.key('Enter'),true);assert.equal(only.selections.length,0);
});

for(const locale of ['es','en','fr','de','it','pt','ca'])test(locale+': service and transfer notices are translated; physical city labels do not change provider pricing inputs',()=>{
  const choices=[{type:'airport',name:'Charleroi / Brussels South Airport',country:'Bélgica',code:'CRL',cityName:'Bruselas',cityCode:'BRU',physicalCityName:'Charleroi',serviceNotice:'charleroiTransfer'},
    {type:'airport',name:'Antwerp International Airport',country:'Bélgica',code:'ANR',cityName:'Amberes',cityCode:'ANR',serviceNotice:'antwerpTuiEnds'},
    {type:'airport',name:'Liege Airport',country:'Bélgica',code:'LGG',cityName:'Lieja',cityCode:'LGG',scheduledPassengerService:false,serviceNotice:'noScheduledFlights'}];
  const ui=mount(375,{left:20,width:335,top:100,bottom:144},choices,locale);
  const stringify=n=>n==null?'':typeof n==='object'?(Array.isArray(n)?n.map(stringify).join(''):stringify(n.children)):String(n);
  const tree=ui.render(),text=stringify(tree);
  for(const notice of ['charleroiTransfer','antwerpTuiEnds','noScheduledFlights']){
    const expected=dictionary.translate(locale,'search.airportNotice.'+notice);assert.notEqual(expected,'search.airportNotice.'+notice);assert.ok(text.includes(expected));
  }
  assert.ok(text.includes('Charleroi'));assert.ok(text.includes('2027'));
  ui.nodes(tree,'button')[0].props.onClick();assert.deepEqual(ui.changes,['Bruselas']);assert.equal(ui.selections[0].place.cityCode,'BRU');
});
