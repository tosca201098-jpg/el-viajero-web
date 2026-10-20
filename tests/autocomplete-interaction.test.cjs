const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname,'../app/components/FlightLocationAutocomplete.tsx'),'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 },
}).outputText;

// Exercise the unchanged component's real handlers/position effect with a small React/DOM mock.
function mount(width, rect) {
  const choices = [
    {type:'city',name:'Lyon',country:'Francia',code:'LYS',cityName:null,cityCode:null},
    {type:'airport',name:'Ch. De Gaulle',country:'Francia',code:'CDG',cityName:'París',cityCode:'PAR'},
  ];
  const states = [0, choices, true, -1, null], changes = [], effects = [];
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
  vm.runInNewContext(compiled,{exports,React:react,window,document,require:id=>id==='react'?react:{createPortal:node=>node}});
  function render() {
    stateIndex=0;refIndex=0;effects.length=0;
    return exports.default({label:'Destino',value:'lyon',onChange:value=>changes.push(value),placeholder:'Ciudad',variant:'main'});
  }
  function nodes(tree,type) {
    if(!tree||typeof tree!=='object')return[];
    if(Array.isArray(tree))return tree.flatMap(n=>nodes(n,type));
    return [...(tree.type===type?[tree]:[]),...tree.children.flatMap(n=>nodes(n,type))];
  }
  render(); effects[1](); // Only the popup positioning effect; no network in this UI test.
  const input=()=>nodes(render(),'input')[0];
  function key(value) {let prevented=false;input().props.onKeyDown({key:value,preventDefault:()=>{prevented=true;}});return prevented;}
  return {render,nodes,input,key,states,choices,changes,events,focuses:()=>focuses};
}

test('keyboard selection uses the first ranked suggestion, wraps arrows and closes on Escape',()=>{
  const ui=mount(1280,{left:200,width:400,top:100,bottom:144});
  assert.equal(ui.input().props.role,'combobox');
  assert.equal(ui.key('ArrowDown'),true);assert.equal(ui.states[3],0);
  assert.equal(ui.input().props['aria-activedescendant'],'autocomplete-test-option-0');
  assert.equal(ui.key('Enter'),true);
  assert.deepEqual(ui.changes,['Lyon']);assert.equal(ui.states[2],false);assert.equal(ui.focuses(),1);
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
  assert.equal(ui.states[2],false);assert.equal(ui.focuses(),1);
  assert.ok(ui.events.includes('resize'));assert.ok(ui.events.includes('pointerdown'));
});
