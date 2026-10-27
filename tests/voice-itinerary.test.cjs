const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React };
function loader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions }).outputText, {
      exports, AbortController, AbortSignal, Request, Response, URL, URLSearchParams, Date, Error, JSON,
      setTimeout, clearTimeout, queueMicrotask, ...globals,
      require: id => {
        if (Object.hasOwn(mocks, id)) return mocks[id];
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const resolved = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(p => fs.existsSync(path.join(root, p)));
        if (!resolved) throw Error('Forbidden dependency: ' + id);
        return load(resolved);
      },
    }, { filename: file });
    return exports;
  }
  return load;
}
const shared = loader();
const translations = shared('lib/i18n/translations.ts');
const catalog = shared('lib/destinations/index.ts');
const featured = shared('lib/destinations/featured.ts');
const voice = shared('lib/voice/session.ts');
const requests = shared('lib/voice/itinerary.ts');
const madrid = catalog.findDestinationProfile({ name: 'Madrid' });
const lisboa = catalog.findDestinationProfile({ name: 'Lisboa' });
const turn = () => new Promise(setImmediate);
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { resolve, promise }; };
const sample = (days, title = 'Itinerario simulado visible') => ({ title, summary: 'Resumen de prueba',
  days: Array.from({ length: days }, (_, i) => ({ dayNumber: i + 1, title: 'Día de prueba',
    morning: [{ name: 'Actividad real del resultado', description: 'Descripción', area: 'Centro' }],
    afternoon: [{ name: 'Actividad', description: 'Descripción', area: 'Centro' }],
    evening: [{ name: 'Actividad', description: 'Descripción', area: 'Centro' }] })), tips: ['Consejo uno', 'Consejo dos'] });
const response = (days, title) => new Response(JSON.stringify({ itinerary: sample(days, title) }), { status: 200 });

// A small hook scheduler runs the real planner and content components. Network, React lifecycle
// scheduling and media are simulated; no test reads credentials or contacts a provider.
function plannerHarness(initialProps, language, fetcher) {
  let props = initialProps, tree, dirty = true, si = 0, ri = 0, ei = 0;
  const states = [], refs = [], effects = [], pending = [], calls = [], scrolls = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: initial => { const i = si++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial;
      return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; dirty = true; }]; },
    useRef: initial => { const i = ri++; if (!(i in refs)) refs[i] = { current: initial }; return refs[i]; },
    useEffect: (run, deps) => { const i = ei++; if (!effects[i] || deps.some((value, j) => !Object.is(value, effects[i].deps[j]))) pending.push({ i, run, deps }); },
  };
  const load = loader({ react,
    './LanguageProvider': { useLanguage: () => ({ language, t: (key, vars) => translations.translate(language, key, vars) }) },
    '@/lib/supabase/client': { getSupabaseClient: () => { throw Error('Supabase calls forbidden'); } },
    '@/lib/supabase/saved-itineraries': { saveItinerary: () => { throw Error('Writes forbidden'); } },
  }, { React: react, fetch: async (url, options) => {
    assert.equal(url, '/api/itinerary'); const payload = JSON.parse(options.body); calls.push({ payload, signal: options.signal });
    return fetcher ? fetcher(payload, options.signal) : response(payload.days);
  } });
  const Component = load('app/components/ItineraryPlanner.tsx').default;
  function render() {
    si = ri = ei = 0; dirty = false; tree = Component(props);
    if (tree.props.ref) tree.props.ref.current = { scrollIntoView: () => scrolls.push('scroll'), focus: () => scrolls.push('focus') };
    return tree;
  }
  function flushEffects() {
    for (const { i, run, deps } of pending.splice(0)) { effects[i]?.cleanup?.(); effects[i] = { run, deps, cleanup: run() }; }
  }
  function nodes(node = tree) {
    if (Array.isArray(node)) return node.flatMap(n => nodes(n));
    if (!node || typeof node !== 'object') return [node];
    if (typeof node.type === 'function') return nodes(node.type({ ...node.props, children: node.children }));
    return [node, ...node.children.flatMap(n => nodes(n))];
  }
  return { calls, scrolls, render, flushEffects,
    text: () => nodes().filter(n => typeof n === 'string' || typeof n === 'number').join(' '),
    find: predicate => nodes().find(n => n && typeof n === 'object' && predicate(n)),
    update: next => { props = next; dirty = true; },
    replay: () => { for (const e of effects) e.cleanup?.(); for (const e of effects) e.cleanup = e.run(); },
    unmount: () => { for (const e of effects) e.cleanup?.(); },
    drain: async () => { for (let i = 0; i < 8; i++) { if (dirty) render(); flushEffects(); await turn(); } },
  };
}

// Execute the actual Home voice handler and the actual JSX prop expressions, including
// the context override that keeps old flight dates out of a spoken two-day itinerary.
const page = ts.createSourceFile('page.tsx', fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
let handler, voiceProp, plannerTag;
(function walk(node) {
  if (ts.isBinaryExpression(node) && node.left.getText(page) === 'voiceItineraryHandlerRef.current') handler = node.right.getText(page);
  if (ts.isVariableDeclaration(node) && node.name.getText(page) === 'itineraryVoiceRequest') voiceProp = node.initializer.getText(page);
  if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(page) === 'ItineraryPlanner') plannerTag = node;
  ts.forEachChild(node, walk);
})(page);
const attribute = name => plannerTag.attributes.properties.find(a => a.name?.text === name).initializer.expression.getText(page);
const pageBridgeCode = ts.transpileModule(`this.handle = ${handler}; this.propsForPlanner = () => { const itineraryVoiceRequest = ${voiceProp}; return {destination:${attribute('destination')},context:${attribute('context')},voiceRequest:${attribute('voiceRequest')}}; };`, { compilerOptions }).outputText;

function bridge(language = 'es', fetcher) {
  let ui, request;
  const scope = { language, voiceItineraryRef: { current: null }, createVoiceItineraryRequest: requests.createVoiceItineraryRequest,
    findDestinationProfile: catalog.findDestinationProfile,
    findDestinationCard: name => featured.destinations.find(d => d.name === name),
    itineraryContext: { departureDate: '2026-11-17', returnDate: '2026-11-22', travelers: 4, budget: { amount: 400, type: 'total' } },
    setVoiceItineraryUnknown: value => { scope.unknown = value; },
    setVoiceItineraryRequest: value => { request = value; scope.voiceItineraryRequest = value; },
    setModal: value => { scope.modal = value; },
    setDestinoSeleccionado: value => {
      scope.destinoSeleccionado = value;
      const props = scope.propsForPlanner();
      if (!ui || ui.destination !== value) { ui?.unmount(); ui = plannerHarness(props, scope.language, fetcher); ui.destination = value; }
      else ui.update(props);
      ui.render(); ui.flushEffects();
    },
  };
  vm.runInNewContext(pageBridgeCode, scope);
  return { scope, handle: (...args) => scope.handle(...args), get ui() { return ui; }, get request() { return request; } };
}

async function connected(onItinerary, getLocale = () => 'es') {
  const sent = [], calls = [], phases = [], errors = [];
  const channel = { readyState: 'open', send: message => sent.push(JSON.parse(message)), close() {} };
  const track = { stop() {} };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  const peer = { connectionState: 'connected', getSenders: () => [], addTrack() {}, createDataChannel: () => channel,
    createOffer: async () => ({ sdp: 'v=0\nmock-offer' }), setLocalDescription: async () => {}, setRemoteDescription: async () => {}, close() {} };
  const session = new voice.VoiceSession({ onPhase: p => phases.push(p), onError: e => errors.push(e), onSearch() {}, onItinerary, getLocale,
    rearmDelayMs: 0, createPeerConnection: () => peer, createAudio: () => ({ pause() {}, srcObject: null }), getUserMedia: async () => stream,
    fetcher: async (url, options) => { calls.push({ url, options }); return url === '/api/voice'
      ? { ok: true, json: async () => ({ value: 'simulated-ephemeral-token' }) } : { ok: true, text: async () => 'v=0\nmock-answer' }; },
  });
  await session.start(); channel.onopen();
  let currentResponse, serial = 0;
  const delay = () => new Promise(resolve => setTimeout(resolve, 5));
  const emit = event => { if (event.type === 'response.created') currentResponse = event.response.id; channel.onmessage?.({ data: JSON.stringify(event) }); };
  const finish = async () => {
    if (session.turnStatus === 'processing') {
      const id = 'ack-' + ++serial;
      emit({ type: 'response.created', response: { id } });
      emit({ type: 'response.done', response: { id, status: 'completed', output: [] } });
      await delay();
    }
  };
  const begin = async id => {
    await delay(); await finish();
    if (session.turnStatus === 'listening') {
      emit({ type: 'input_audio_buffer.committed', item_id: 'input-' + ++serial });
      emit({ type: 'response.created', response: { id } });
    }
  };
  await finish();
  return { session, sent, calls, phases, errors, channel, emit, begin, finish,
    tool: async (callId, args = { destino: 'Madrid', dias: 2 }, responseId = 'response-' + callId) => {
      await begin(responseId);
      emit({ type: 'response.function_call_arguments.done', name: 'crear_itinerario', call_id: callId, response_id: currentResponse, arguments: JSON.stringify(args) });
      emit({ type: 'response.done', response: { id: currentResponse, status: 'completed', output: [] } });
    }, outputs: () => sent.filter(e => e.type === 'conversation.item.create').map(e => ({ callId: e.item.call_id, ...JSON.parse(e.item.output) })),
  };
}

for (const { code } of translations.locales) test(`${code}: real voice handler → canonical profile → shared generate → visible content → success output`, async () => {
  const b = bridge(code), h = await connected(b.handle, () => code);
  try {
    await h.tool('flow-' + code); await turn();
    assert.equal(b.scope.destinoSeleccionado, madrid);
    assert.equal(h.outputs().length, 0, 'no success before generation and render');
    await b.ui.drain();
    assert.equal(b.ui.calls.length, 1);
    const payload = b.ui.calls[0].payload;
    assert.equal(payload.destination.name, 'Madrid'); assert.equal(payload.days, 2); assert.equal(payload.locale, code);
    assert.equal(payload.departureDate, undefined); assert.equal(payload.returnDate, undefined); assert.equal(payload.travelers, undefined); assert.equal(payload.budget, undefined);
    assert.match(b.ui.text(), /Itinerario simulado visible/); assert.match(b.ui.text(), /Actividad real del resultado/);
    assert.deepEqual(Array.from(b.ui.scrolls), ['scroll', 'focus']);
    assert.equal(h.outputs().length, 1); assert.equal(h.outputs()[0].status, 'success'); assert.equal(h.outputs()[0].days, 2); assert.equal(h.outputs()[0].locale, code);
    assert.equal(JSON.parse(h.calls[0].options.body).locale, code);
    assert.ok(h.sent.find(e => e.response?.instructions).response.instructions.includes(translations.translate(code, 'voice.greetingQuestion')));
  } finally { h.session.stop(); b.ui?.unmount(); }
});

test('duplicate argument/item/response events execute once; another call for the same city generates a new variation', async () => {
  const b = bridge(), h = await connected(b.handle);
  try {
    await h.tool('once');
    const item = { type: 'function_call', status: 'completed', name: 'crear_itinerario', call_id: 'once', arguments: '{"destino":"Madrid","dias":2}' };
    h.emit({ type: 'response.output_item.done', item });
    h.emit({ type: 'response.done', response: { id: 'response-once', status: 'completed', output: [item] } });
    await turn(); await b.ui.drain(); await h.tool('once'); await b.ui.drain();
    assert.equal(b.ui.calls.length, 1); assert.equal(h.outputs().length, 1);
    await h.tool('again'); await turn(); await b.ui.drain();
    assert.equal(b.ui.calls.length, 2); assert.equal(b.ui.calls[1].payload.variation, 1); assert.equal(h.outputs().length, 2);
  } finally { h.session.stop(); b.ui?.unmount(); }
});

test('the acknowledgement waits for the original Realtime response to finish', async () => {
  const b = bridge(), h = await connected(b.handle);
  try {
    await h.begin('pending-response');
    h.emit({ type: 'response.function_call_arguments.done', name: 'crear_itinerario', call_id: 'wait', response_id: 'pending-response', arguments: '{"destino":"Madrid","dias":2}' });
    await turn(); await b.ui.drain();
    assert.equal(h.outputs()[0].status, 'success'); assert.equal(h.sent.filter(e => e.type === 'response.create').length, 2);
    h.emit({ type: 'response.done', response: { id: 'pending-response', status: 'completed', output: [] } });
    assert.equal(h.sent.filter(e => e.type === 'response.create').length, 3);
  } finally { h.session.stop(); b.ui?.unmount(); }
});

test('provider failures and invalid itinerary JSON show an error and never report success', async () => {
  for (const fetcher of [() => new Response('{}', { status: 502 }), () => new Response('{"itinerary":{}}'), () => { throw Error('private diagnostics'); }]) {
    const b = bridge('es', fetcher), h = await connected(b.handle);
    try { await h.tool('failure'); await turn(); await b.ui.drain();
      assert.equal(h.outputs()[0].status, 'error'); assert.equal(h.outputs()[0].error, 'generation_failed');
      assert.ok(b.ui.find(n => n.props.role === 'alert')); assert.ok(!b.ui.text().includes('private diagnostics'));
    } finally { h.session.stop(); b.ui?.unmount(); }
  }
});

test('a channel failure while resuming the spoken acknowledgement closes the session safely', async () => {
  const b = bridge(), h = await connected(b.handle);
  try {
    await h.begin('pending');
    h.emit({ type: 'response.function_call_arguments.done', name: 'crear_itinerario', call_id: 'channel-failure', response_id: 'pending', arguments: '{"destino":"Madrid","dias":2}' });
    await turn(); await b.ui.drain(); assert.equal(h.outputs()[0].status, 'success');
    h.channel.send = () => { throw Error('Channel has closed'); };
    assert.doesNotThrow(() => h.emit({ type: 'response.done', response: { id: 'pending', status: 'completed', output: [] } }));
    assert.equal(h.session.status, 'idle'); assert.deepEqual(h.errors, ['connection']);
  } finally { h.session.stop(); b.ui?.unmount(); }
});

test('bad duration, malformed arguments and unknown destinations never call generation', async () => {
  const b = bridge(), h = await connected(b.handle);
  try {
    for (const [i, dias] of [0, 8, 2.5, '2', null].entries()) { await h.tool('bad-' + i, { destino: 'Madrid', dias }); await turn(); await turn(); }
    await turn(); await turn(); assert.equal(b.ui, undefined); assert.equal(h.outputs().length, 5);
    assert.ok(h.outputs().every(e => e.error === 'invalid_arguments'));
    await h.tool('unknown', { destino: 'No existe esta ficha', dias: 2 }); await turn(); await turn();
    assert.equal(b.scope.unknown, true); assert.equal(h.outputs().at(-1).error, 'unknown_destination');
    await h.tool('broken', null);
    await turn(); await turn(); assert.equal(h.outputs().at(-1).error, 'invalid_arguments');
  } finally { h.session.stop(); }
});

test('stopping voice aborts generation; an abort-ignoring late response stays invisible and unacknowledged', async () => {
  const pending = deferred(), b = bridge('es', () => pending.promise), h = await connected(b.handle);
  await h.tool('cancel'); await turn(); await b.ui.drain(); h.session.stop();
  assert.equal(b.ui.calls[0].signal.aborted, true);
  pending.resolve(response(2, 'Respuesta tardía')); await b.ui.drain();
  assert.ok(!b.ui.text().includes('Respuesta tardía')); assert.equal(h.outputs().length, 0); b.ui.unmount();
});

test('explicitly cancelling the old request permits changing destination; only the new destination can appear or succeed', async () => {
  const pending = deferred(), b = bridge('es', payload => payload.destination.name === 'Madrid' ? pending.promise : response(3, 'Lisboa visible'));
  const h = await connected(b.handle);
  try {
    await h.tool('old'); await turn(); await b.ui.drain(); const oldUI = b.ui;
    b.request.cancel(); await turn(); await h.finish();
    await h.tool('new', { destino: 'Lisboa', dias: 3 }); await turn(); await b.ui.drain();
    assert.equal(b.scope.destinoSeleccionado, lisboa); assert.equal(oldUI.calls[0].signal.aborted, true);
    pending.resolve(response(2, 'Madrid tardío')); await b.ui.drain();
    assert.match(b.ui.text(), /Lisboa visible/); assert.ok(!b.ui.text().includes('Madrid tardío'));
    assert.equal(h.outputs().find(e => e.callId === 'old').status, 'cancelled');
    assert.equal(h.outputs().find(e => e.callId === 'new').status, 'success');
  } finally { h.session.stop(); b.ui?.unmount(); }
});

test('closing the planner settles cancellation without a spoken success', async () => {
  const pending = deferred(), b = bridge('es', () => pending.promise), h = await connected(b.handle);
  try {
    await h.tool('close'); await turn(); await b.ui.drain(); b.ui.unmount(); await turn(); await turn();
    assert.equal(h.outputs()[0].status, 'cancelled'); assert.equal(b.ui.calls[0].signal.aborted, true);
    pending.resolve(response(2)); await turn(); assert.equal(h.outputs().length, 1);
  } finally { h.session.stop(); }
});

test('effect replay starts one generation and settled requests never regenerate on remount', async () => {
  const parent = new AbortController(), request = requests.createVoiceItineraryRequest(madrid, 2, { callId: 'strict', locale: 'es', signal: parent.signal });
  const ui = plannerHarness({ destination: madrid, context: {}, voiceRequest: request }, 'es');
  ui.render(); ui.flushEffects(); ui.replay(); await ui.drain();
  assert.equal(ui.calls.length, 1); assert.equal((await request.promise).status, 'success'); ui.unmount();
  const remount = plannerHarness({ destination: madrid, context: {}, voiceRequest: request }, 'es'); await remount.drain();
  assert.equal(remount.calls.length, 0); remount.unmount();
});

test('manual generation keeps its dates/budget and voice cannot duplicate an in-progress manual request', async () => {
  const pending = deferred();
  const ui = plannerHarness({ destination: madrid, context: { departureDate: '2026-11-17', returnDate: '2026-11-19', travelers: 2, budget: { amount: 200, type: 'total' } } }, 'es', () => pending.promise);
  await ui.drain(); assert.equal(ui.calls.length, 0);
  const button = ui.find(n => n.type === 'button' && String(n.children).includes(translations.translate('es', 'itinerary.create')));
  const manual = button.props.onClick(); await ui.drain();
  assert.equal(ui.calls[0].payload.days, 3); assert.equal(ui.calls[0].payload.budget.amount, 200);
  const request = requests.createVoiceItineraryRequest(madrid, 2, { callId: 'busy', locale: 'es', signal: new AbortController().signal });
  ui.update({ destination: madrid, context: {}, voiceRequest: request }); await ui.drain();
  assert.equal(ui.calls.length, 1); assert.equal((await request.promise).error, 'busy');
  pending.resolve(response(3, 'Itinerario manual')); await manual; await ui.drain();
  assert.match(ui.text(), /Itinerario manual/); ui.unmount();
});

test('changing language cancels the pending voice session and a new session uses the new locale', async () => {
  const pending = deferred(); let locale = 'es';
  const b = bridge('es', () => pending.promise), h = await connected(b.handle, () => locale);
  await h.tool('language-old'); await turn(); await b.ui.drain();
  // Home stops the session on language change; exercise that same public operation.
  locale = 'fr'; h.session.stop(); b.ui.unmount(); pending.resolve(response(2, 'Idioma anterior'));
  await turn(); assert.equal(h.outputs().length, 0);
  const next = bridge(locale), newer = await connected(next.handle, () => locale);
  try { await newer.tool('language-new'); await turn(); await next.ui.drain();
    assert.equal(next.ui.calls[0].payload.locale, 'fr'); assert.equal(newer.outputs()[0].locale, 'fr');
  } finally { newer.session.stop(); next.ui?.unmount(); }
});

test('session configuration preserves buscar_viaje and validates all seven locale inputs before provider calls', async () => {
  const source = fs.readFileSync(path.join(root, 'app/api/voice/route.ts'), 'utf8');
  const originalSearchTool = require('./fixtures/voice-search-tool.json');
  async function configure(code, locale) {
    const exports = {}, payloads = [];
    vm.runInNewContext(ts.transpileModule(code, { compilerOptions }).outputText, { exports, Response, AbortController, setTimeout, clearTimeout,
      require: id => id === '@/lib/ai/admission' ? { admitAiRequest: async () => null } : translations, process: { env: { OPENAI_API_KEY: 'simulated-server-key' } },
      fetch: async (_url, options) => { payloads.push(JSON.parse(options.body)); return { ok: true, json: async () => ({ value: 'simulated-secret' }) }; },
    });
    const response = await exports.POST(new Request('https://example.test/api/voice', { method: 'POST', body: JSON.stringify({ locale }) }));
    return { response, payloads };
  }
  for (const { code } of translations.locales) {
    const { response, payloads } = await configure(source, code); assert.equal(response.status, 200);
    const session = payloads[0].session;
    assert.equal(JSON.stringify(session.tools[0]), JSON.stringify(originalSearchTool));
    assert.equal(session.model, 'gpt-realtime-2.1'); assert.equal(session.audio.output.voice, 'marin');
    const tool = session.tools.find(t => t.name === 'crear_itinerario'); assert.deepEqual(Array.from(tool.parameters.required), ['destino', 'dias']);
    assert.equal(tool.parameters.properties.dias.maximum, 7); assert.ok(!session.instructions.includes('Habla siempre en español'));
  }
  const bad = await configure(source, 'invalid-locale'); assert.equal(bad.response.status, 400); assert.equal(bad.payloads.length, 0);
});

test('invalid calls do not cancel an already valid generation and incomplete tool items are ignored', async () => {
  const pending = deferred(), b = bridge('es', () => pending.promise), h = await connected(b.handle);
  try {
    await h.tool('valid'); await turn(); await b.ui.drain();
    await h.tool('invalid-during-valid', { destino: 'Madrid', dias: 99 }); await turn(); await turn();
    assert.equal(b.ui.calls[0].signal.aborted, false);
    h.emit({ type: 'response.output_item.done', item: { type: 'function_call', status: 'incomplete', name: 'crear_itinerario', call_id: 'partial', arguments: '{"destino":"Lisboa","dias":3}' } });
    await turn(); assert.equal(b.ui.calls.length, 1);
    pending.resolve(response(2)); await b.ui.drain();
    assert.equal(h.outputs().find(e => e.callId === 'valid').status, 'success');
    assert.equal(h.outputs().find(e => e.callId === 'invalid-during-valid').error, 'busy');
  } finally { h.session.stop(); b.ui?.unmount(); }
});

test('a completed response event alone can dispatch its itinerary tool', async () => {
  const b = bridge(), h = await connected(b.handle);
  try {
    await h.begin('fallback');
    h.emit({ type: 'response.done', response: { id: 'fallback', status: 'completed', output: [{ type: 'function_call', status: 'completed', name: 'crear_itinerario', call_id: 'fallback-call', arguments: '{"destino":"Madrid","dias":2}' }] } });
    await turn(); await b.ui.drain(); assert.equal(b.ui.calls.length, 1); assert.equal(h.outputs()[0].status, 'success');
  } finally { h.session.stop(); b.ui?.unmount(); }
});

test('manual duration selection still generates on demand without voice or fixed dates', async () => {
  const ui = plannerHarness({ destination: madrid, context: {} }, 'es'); await ui.drain();
  assert.equal(ui.calls.length, 0);
  ui.find(n => n.type === 'button' && n.props['aria-label'] === '4 días').props.onClick(); await ui.drain();
  ui.find(n => n.type === 'button' && String(n.children).includes(translations.translate('es', 'itinerary.create'))).props.onClick(); await ui.drain();
  assert.equal(ui.calls.length, 1); assert.equal(ui.calls[0].payload.days, 4); assert.match(ui.text(), /Itinerario simulado visible/); ui.unmount();
});

for (const {code} of translations.locales) test(`${code}: every Italian identity reuses the voice-to-planner generation flow`,async()=>{
  for(const destination of catalog.getDestinationsByCountry('IT')){
    const b=bridge(code),h=await connected(b.handle,()=>code);
    try{
      await h.tool('italy-'+destination.id,{destino:destination.translations[code].name,dias:2});await turn();
      assert.equal(b.scope.destinoSeleccionado,destination);assert.equal(h.outputs().length,0);
      await b.ui.drain();assert.equal(b.ui.calls.length,1);assert.equal(b.ui.calls[0].payload.destination.name,destination.name);
      assert.equal(b.ui.calls[0].payload.locale,code);assert.equal(b.ui.calls[0].payload.days,2);
      assert.match(b.ui.text(),/Itinerario simulado visible/);assert.equal(h.outputs()[0].status,'success');
    }finally{h.session.stop();b.ui?.unmount();}
  }
});

for (const {code} of translations.locales) test(`${code}: every British identity reuses the voice-to-planner generation flow`,async()=>{
  for(const destination of catalog.getDestinationsByCountry('GB')){
    const b=bridge(code),h=await connected(b.handle,()=>code);
    try{
      await h.tool('uk-'+destination.id,{destino:destination.translations[code].name,dias:2});await turn();
      assert.equal(b.scope.destinoSeleccionado,destination);assert.equal(h.outputs().length,0);
      await b.ui.drain();assert.equal(b.ui.calls.length,1);assert.equal(b.ui.calls[0].payload.destination.name,destination.name);
      assert.equal(b.ui.calls[0].payload.locale,code);assert.equal(b.ui.calls[0].payload.days,2);
      assert.match(b.ui.text(),/Itinerario simulado visible/);assert.equal(h.outputs()[0].status,'success');
    }finally{h.session.stop();b.ui?.unmount();}
  }
});

for (const {code} of translations.locales) test(`${code}: every German identity reuses the voice-to-planner generation flow`,async()=>{
  for(const destination of catalog.getDestinationsByCountry('DE')){
    const b=bridge(code),h=await connected(b.handle,()=>code);
    try{
      await h.tool('germany-'+destination.id,{destino:destination.translations[code].name,dias:2});await turn();
      assert.equal(b.scope.destinoSeleccionado,destination);assert.equal(h.outputs().length,0);
      await b.ui.drain();assert.equal(b.ui.calls.length,1);assert.equal(b.ui.calls[0].payload.destination.name,destination.name);
      assert.equal(b.ui.calls[0].payload.locale,code);assert.equal(b.ui.calls[0].payload.days,2);
      assert.match(b.ui.text(),/Itinerario simulado visible/);assert.equal(h.outputs()[0].status,'success');
    }finally{h.session.stop();b.ui?.unmount();}
  }
});

for (const {code} of translations.locales) test(`${code}: every Dutch identity reuses the voice-to-planner generation flow`,async()=>{
  for(const destination of catalog.getDestinationsByCountry('NL')){
    const b=bridge(code),h=await connected(b.handle,()=>code);
    try{
      await h.tool('netherlands-'+destination.id,{destino:destination.translations[code].name,dias:2});await turn();
      assert.equal(b.scope.destinoSeleccionado,destination);assert.equal(h.outputs().length,0);
      await b.ui.drain();assert.equal(b.ui.calls.length,1);assert.equal(b.ui.calls[0].payload.destination.name,destination.name);
      assert.equal(b.ui.calls[0].payload.locale,code);assert.equal(b.ui.calls[0].payload.days,2);
      assert.match(b.ui.text(),/Itinerario simulado visible/);assert.equal(h.outputs()[0].status,'success');
    }finally{h.session.stop();b.ui?.unmount();}
  }
});

for (const {code} of translations.locales) test(`${code}: every Belgian identity reuses the voice-to-planner generation flow`,async()=>{
  for(const destination of catalog.getDestinationsByCountry('BE')){
    const b=bridge(code),h=await connected(b.handle,()=>code);
    try{
      await h.tool('belgium-'+destination.id,{destino:destination.translations[code].name,dias:2});await turn();
      assert.equal(b.scope.destinoSeleccionado,destination);assert.equal(h.outputs().length,0);
      await b.ui.drain();assert.equal(b.ui.calls.length,1);assert.equal(b.ui.calls[0].payload.destination.name,destination.name);
      assert.equal(b.ui.calls[0].payload.locale,code);assert.equal(b.ui.calls[0].payload.days,2);
      assert.match(b.ui.text(),/Itinerario simulado visible/);assert.equal(h.outputs()[0].status,'success');
    }finally{h.session.stop();b.ui?.unmount();}
  }
});
