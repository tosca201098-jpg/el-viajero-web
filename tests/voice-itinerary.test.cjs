const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = process.env.SOFIA_FINAL_REPO_ROOT || process.env.SOFIA_POLICY_REPO_ROOT || path.resolve(__dirname, '..');
const sourceRoot = process.env.SOFIA_FINAL_SOURCE_ROOT || process.env.SOFIA_POLICY_SOURCE_ROOT || root;
const ts = require(path.join(root, 'node_modules/typescript'));
const locate = file => [path.join(sourceRoot, file), path.join(root, file)].find(p => fs.existsSync(p));
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React };
function loader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(locate(file), 'utf8'), { compilerOptions }).outputText, {
      exports, AbortController, AbortSignal, Request, Response, URL, URLSearchParams, Date, Error, JSON,
      setTimeout, clearTimeout, queueMicrotask, ...globals,
      require: id => {
        if (Object.hasOwn(mocks, id)) return mocks[id];
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const resolved = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(locate);
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
// What Sofía's `crear_itinerario` tool sends: the destination, the days and the itinerary as a JSON string.
const written = (days, title) => JSON.stringify(sample(days, title));
const spoken = (destino, dias, title) => ({ destino, dias, itinerario: written(dias, title) });

// A small hook scheduler runs the real planner and content components. React lifecycle
// scheduling and media are simulated; the planner only reaches the network through the fetch the test passes in.
function plannerHarness(initialProps, language, fetchImpl = async () => { throw Error('No request expected'); }, downloadOk = true, sessionToken) {
  let props = initialProps, tree, dirty = true, si = 0, ri = 0, ei = 0;
  const states = [], refs = [], effects = [], pending = [], scrolls = [], navigations = [], downloads = [];
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState: initial => { const i = si++; if (!(i in states)) states[i] = typeof initial === 'function' ? initial() : initial;
      return [states[i], value => { states[i] = typeof value === 'function' ? value(states[i]) : value; dirty = true; }]; },
    useRef: initial => { const i = ri++; if (!(i in refs)) refs[i] = { current: initial }; return refs[i]; },
    useEffect: (run, deps) => { const i = ei++; if (!effects[i] || deps.some((value, j) => !Object.is(value, effects[i].deps[j]))) pending.push({ i, run, deps }); },
  };
  const load = loader({ react,
    './LanguageProvider': { useLanguage: () => ({ language, t: (key, vars) => translations.translate(language, key, vars) }) },
    '@/lib/supabase/client': { getSupabaseClient: () => {
      // Only the session read is allowed, and only when a test says there is (or is not) a signed-in visitor.
      if (sessionToken === undefined) throw Error('Supabase calls forbidden');
      return { auth: { getSession: async () => ({ data: { session: sessionToken ? { access_token: sessionToken } : null } }) } };
    } },
    '@/lib/supabase/saved-itineraries': { saveItinerary: () => { throw Error('Writes forbidden'); } },
    '@/lib/itinerary/download': { downloadPdf: (bytes, name) => { downloads.push({ bytes, name }); return downloadOk; } },
  }, { React: react, window: { location: { assign: value => navigations.push(value) } },
    fetch: (...args) => fetchImpl(...args) });
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
  return { scrolls, navigations, downloads, render, flushEffects,
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

function bridge(language = 'es') {
  let ui, request;
  const scope = { language, voiceItineraryRef: { current: null }, createVoiceItineraryRequest: requests.createVoiceItineraryRequest,
    parseVoiceItinerary: requests.parseVoiceItinerary,
    findDestinationProfile: catalog.findDestinationProfile,
    findDestinationCard: name => featured.destinations.find(d => d.name === name),
    itineraryContext: { departureDate: '2026-11-17', returnDate: '2026-11-22', travelers: 4, budget: { amount: 400, type: 'total' } },
    setVoiceItineraryUnknown: value => { scope.unknown = value; },
    setVoiceItineraryRequest: value => { request = value; scope.voiceItineraryRequest = value; },
    setModal: value => { scope.modal = value; },
    setDestinoSeleccionado: value => {
      scope.destinoSeleccionado = value;
      const props = scope.propsForPlanner();
      if (!ui || ui.destination !== value) { ui?.unmount(); ui = plannerHarness(props, scope.language); ui.destination = value; }
      else ui.update(props);
      ui.render(); ui.flushEffects();
    },
  };
  vm.runInNewContext(pageBridgeCode, scope);
  return { scope, handle: (...args) => scope.handle(...args), get ui() { return ui; }, get request() { return request; } };
}

async function connected(onItinerary, getLocale = () => 'es') {
  const sent = [], calls = [], phases = [], errors = [];
  let sdk;
  const session = new voice.VoiceSession({
    preflight: async () => {},
    onPhase: p => phases.push(p), onError: e => errors.push(e), onSearch() {}, onItinerary, getLocale,
    fetcher: async (url, options) => { calls.push({url,options}); return {ok:true,json:async()=>({token:'simulated-token'})}; },
    startConversation: async options => { sdk = options; return {endSession:async()=>{},setMicMuted(){},setVolume(){}}; },
  });
  await session.start();
  return {session,sent,calls,phases,errors,sdk,finish:async()=>{},
    tool: async (callId,args=spoken('Madrid',2)) => {
      sdk.onIncomingEvent({type:'client_tool_call',client_tool_call:{tool_call_id:callId,parameters:args}});
      void sdk.clientTools.crear_itinerario(args).then(value=>{
        if(session.status === 'active' && !sent.some(e=>e.callId===callId)) sent.push({callId,...JSON.parse(value)});
      });
    },outputs:()=>sent,
  };
}

for (const { code } of translations.locales) test(`${code}: real voice handler → canonical profile → validated itinerary written by Sofía → visible content → success output`, async () => {
  const b = bridge(code), h = await connected(b.handle, () => code);
  try {
    await h.tool('flow-' + code); await turn();
    assert.equal(b.scope.destinoSeleccionado, madrid);
    assert.equal(h.outputs().length, 0, 'no success before the itinerary is rendered');
    await b.ui.drain();
    assert.match(b.ui.text(), /Itinerario simulado visible/); assert.match(b.ui.text(), /Actividad real del resultado/);
    assert.deepEqual(Array.from(b.ui.scrolls), ['scroll', 'focus']);
    assert.equal(h.outputs().length, 1); assert.equal(h.outputs()[0].status, 'success'); assert.equal(h.outputs()[0].days, 2); assert.equal(h.outputs()[0].locale, code);
    assert.equal(JSON.parse(h.calls[0].options.body).locale, code);
    assert.equal(h.calls.length, 1, 'only the single admission request exists; nothing else is contacted');
  } finally { h.session.stop(); b.ui?.unmount(); }
});

test('a missing, malformed or mismatched itinerary reports an error and never shows or reports success', async () => {
  const cases = [
    [{ destino: 'Madrid', dias: 2 }, 'unavailable'],
    [{ destino: 'Madrid', dias: 2, itinerario: '' }, 'generation_failed'],
    [{ destino: 'Madrid', dias: 2, itinerario: 'not json' }, 'generation_failed'],
    [{ destino: 'Madrid', dias: 2, itinerario: JSON.stringify({ title: 'x' }) }, 'generation_failed'],
    [{ destino: 'Madrid', dias: 2, itinerario: written(3) }, 'generation_failed'],
    [{ destino: 'Madrid', dias: 3, itinerario: written(2) }, 'generation_failed'],
    [{ destino: 'Madrid', dias: 2, itinerario: 'x'.repeat(16001) }, 'generation_failed'],
  ];
  for (const [args, error] of cases) {
    const b = bridge('es'), h = await connected(b.handle);
    try { await h.tool('failure', args); await turn(); await turn();
      assert.equal(h.outputs()[0].status, 'error'); assert.equal(h.outputs()[0].error, error);
      assert.equal(b.ui, undefined, 'nothing is shown'); assert.equal(b.scope.destinoSeleccionado, undefined);
    } finally { h.session.stop(); }
  }
});

test('parseVoiceItinerary accepts only the strict itinerary shape for the requested days', () => {
  assert.ok(requests.parseVoiceItinerary(written(2), 2));
  assert.equal(requests.parseVoiceItinerary(written(2), 3), null);
  assert.equal(requests.parseVoiceItinerary(undefined, 2), null);
  assert.equal(requests.parseVoiceItinerary(42, 2), null);
  assert.equal(requests.parseVoiceItinerary('{"title":"x"}', 2), null);
  assert.equal(requests.parseVoiceItinerary('[', 2), null);
  assert.equal(requests.parseVoiceItinerary(JSON.stringify({ ...sample(2), extra: true }), 2), null);
  assert.equal(requests.parseVoiceItinerary(' '.repeat(10) , 2), null);
  assert.equal(requests.parseVoiceItinerary(written(2) + ' '.repeat(16000), 2), null);
});

test('bad duration, malformed arguments and unknown destinations never reach the planner', async () => {
  const b = bridge(), h = await connected(b.handle);
  try {
    for (const [i, dias] of [0, 8, 2.5, '2', null].entries()) { await h.tool('bad-' + i, { destino: 'Madrid', dias, itinerario: written(2) }); await turn(); await turn(); }
    await turn(); await turn(); assert.equal(b.ui, undefined); assert.equal(h.outputs().length, 5);
    assert.ok(h.outputs().every(e => e.error === 'invalid_arguments'));
    await h.tool('unknown', spoken('No existe esta ficha', 2)); await turn(); await turn();
    assert.equal(b.scope.unknown, true); assert.equal(h.outputs().at(-1).error, 'unknown_destination');
    await h.tool('broken', null);
    await turn(); await turn(); assert.equal(h.outputs().at(-1).error, 'invalid_arguments');
  } finally { h.session.stop(); }
});

test('stopping voice before the itinerary is acknowledged never reports a spoken success', async () => {
  const b = bridge('es'), h = await connected(b.handle);
  await h.tool('cancel'); await turn(); h.session.stop();
  await b.ui.drain();
  assert.equal(h.outputs().length, 0); assert.equal(b.request.signal.aborted, true); b.ui.unmount();
});

test('explicitly cancelling the old request permits changing destination; only the new destination can succeed', async () => {
  const b = bridge('es'), h = await connected(b.handle);
  try {
    await h.tool('old', spoken('Madrid', 2, 'Madrid anterior')); await turn();
    b.request.cancel(); await turn();
    await h.tool('new', spoken('Lisboa', 3, 'Lisboa visible')); await turn(); await b.ui.drain();
    assert.equal(b.scope.destinoSeleccionado, lisboa);
    assert.match(b.ui.text(), /Lisboa visible/); assert.ok(!b.ui.text().includes('Madrid anterior'));
    assert.equal(h.outputs().find(e => e.callId === 'old').status, 'cancelled');
    assert.equal(h.outputs().find(e => e.callId === 'new').status, 'success');
  } finally { h.session.stop(); b.ui?.unmount(); }
});

test('closing the planner settles cancellation without a spoken success', async () => {
  const b = bridge('es'), h = await connected(b.handle);
  try {
    await h.tool('close'); await turn(); b.ui.unmount(); await turn(); await turn();
    assert.equal(h.outputs()[0].status, 'cancelled'); assert.equal(b.request.signal.aborted, true);
  } finally { h.session.stop(); }
});

test('effect replay shows the itinerary once and settled requests never reappear on remount', async () => {
  const parent = new AbortController(), request = requests.createVoiceItineraryRequest(madrid, 2, sample(2, 'Una sola vez'), { callId: 'strict', locale: 'es', signal: parent.signal });
  const ui = plannerHarness({ destination: madrid, context: {}, voiceRequest: request }, 'es');
  ui.render(); ui.flushEffects(); ui.replay(); await ui.drain();
  assert.match(ui.text(), /Una sola vez/); assert.equal((await request.promise).status, 'success'); ui.unmount();
  const remount = plannerHarness({ destination: madrid, context: {}, voiceRequest: request }, 'es'); await remount.drain();
  assert.ok(!remount.text().includes('Una sola vez')); remount.unmount();
});

const basicGuides = shared('lib/itinerary/basic.ts');
const createLabel = translations.translate('es', 'itinerary.createPlan');
const createButton = ui => ui.find(n => n.type === 'button' && String(n.children).includes(createLabel));

test('the planner never generates by itself: nothing is requested until the visitor presses «Crear itinerario»', async () => {
  const calls = [];
  const ui = plannerHarness({ destination: madrid, context: { departureDate: '2026-11-17', returnDate: '2026-11-19' } }, 'es', async (url, init) => {
    const body = JSON.parse(init.body); calls.push({ url, body });
    return { ok: true, json: async () => ({ guide: basicGuides.buildBasicGuide(madrid, body.days, body.locale) }) };
  });
  await ui.drain(); await ui.drain();
  assert.equal(calls.length, 0, 'opening the window or the page requests nothing');
  assert.ok(!/Guía básica/.test(ui.text()), 'no guide before the button');
  assert.ok(!ui.find(n => n.type === 'button' && String(n.children).includes('Sofía')), 'the manual button is not a voice button');
  const button = createButton(ui); assert.ok(button);
  button.props.onClick(); await ui.drain();
  assert.equal(calls.length, 1); assert.equal(calls[0].url, '/api/itinerary');
  assert.equal(calls[0].body.days, 3); assert.equal(calls[0].body.locale, 'es');
  assert.equal(calls[0].body.destination.name, 'Madrid');
  assert.match(ui.text(), /Guía básica de Madrid/); assert.match(ui.text(), /Día 1/);
  assert.match(ui.text(), /No incluye horarios, precios ni reservas/);
  ui.unmount();
});

test('the free guide is shorter than the trip when the page has fewer recommendations, and says so', async () => {
  const ui = plannerHarness({ destination: madrid, context: {} }, 'es', async (url, init) => {
    const body = JSON.parse(init.body);
    return { ok: true, json: async () => ({ guide: basicGuides.buildBasicGuide(madrid, body.days, body.locale) }) };
  });
  await ui.drain();
  ui.find(n => n.type === 'button' && n.props['aria-label'] === '7 días').props.onClick(); await ui.drain();
  createButton(ui).props.onClick(); await ui.drain();
  assert.match(ui.text(), /la guía llega a 4 días/);
  assert.ok(!/Día 5/.test(ui.text()), 'no empty or invented days');
  ui.find(n => n.type === 'button' && n.props['aria-label'] === '2 días').props.onClick(); await ui.drain();
  assert.ok(!/Guía básica/.test(ui.text()), 'changing the duration clears the old guide');
  ui.unmount();
});

test('a failed request shows the error message and no guide', async () => {
  const ui = plannerHarness({ destination: madrid, context: {} }, 'es', async () => ({ ok: false, json: async () => ({ error: 'invalid_request' }) }));
  await ui.drain();
  createButton(ui).props.onClick(); await ui.drain();
  assert.match(ui.text(), /No hemos podido crear el itinerario/); assert.ok(!/Guía básica/.test(ui.text()));
  ui.unmount();
});

const downloadLabel = translations.translate('es', 'itinerary.download');
const downloadButton = ui => ui.find(n => n.type === 'button' && String(n.children).includes(downloadLabel));
const saveButton = ui => ui.find(n => n.type === 'button' && String(n.children).includes(translations.translate('es', 'itinerary.save')));

test('the free guide can be downloaded as a PDF once it exists, and it has no «save in my account» button', async () => {
  const ui = plannerHarness({ destination: madrid, context: {} }, 'es', async (_url, init) => {
    const body = JSON.parse(init.body);
    return { ok: true, json: async () => ({ guide: basicGuides.buildBasicGuide(madrid, body.days, body.locale) }) };
  });
  await ui.drain();
  assert.ok(!downloadButton(ui), 'nothing to download before pressing «Crear itinerario»');
  createButton(ui).props.onClick(); await ui.drain();
  assert.ok(downloadButton(ui)); assert.ok(!saveButton(ui));
  downloadButton(ui).props.onClick(); await ui.drain();
  assert.equal(ui.downloads.length, 1); assert.equal(ui.downloads[0].name, 'destinauta-madrid.pdf');
  assert.equal(Buffer.from(ui.downloads[0].bytes).subarray(0, 5).toString('latin1'), '%PDF-');
  assert.ok(!ui.text().includes(translations.translate('es', 'itinerary.downloadError')));
  ui.unmount();
});

test('the itinerary delivered by Sofía (or the AI) has both «save in my account» and «download PDF»', async () => {
  const parent = new AbortController();
  const request = requests.createVoiceItineraryRequest(madrid, 2, sample(2, 'Con descarga'), { callId: 'pdf', locale: 'es', signal: parent.signal });
  const ui = plannerHarness({ destination: madrid, context: {}, voiceRequest: request }, 'es');
  ui.render(); ui.flushEffects(); await ui.drain();
  assert.match(ui.text(), /Con descarga/); assert.ok(saveButton(ui)); assert.ok(downloadButton(ui));
  downloadButton(ui).props.onClick(); await ui.drain();
  assert.equal(ui.downloads.length, 1); assert.equal(ui.downloads[0].name, 'destinauta-madrid.pdf');
  const pdfText = Buffer.from(ui.downloads[0].bytes).toString('latin1');
  assert.match(pdfText, /\/Type \/Page /); assert.ok(pdfText.includes(Buffer.from('Con descarga', 'latin1').toString('hex')));
  ui.unmount();
});

test('if the browser cannot save the file the visitor is told and nothing else changes', async () => {
  const ui = plannerHarness({ destination: madrid, context: {} }, 'es', async (_url, init) => {
    const body = JSON.parse(init.body);
    return { ok: true, json: async () => ({ guide: basicGuides.buildBasicGuide(madrid, body.days, body.locale) }) };
  }, false);
  await ui.drain();
  createButton(ui).props.onClick(); await ui.drain();
  downloadButton(ui).props.onClick(); await ui.drain();
  assert.match(ui.text(), /No hemos podido preparar el PDF/); assert.match(ui.text(), /Guía básica de Madrid/);
  ui.unmount();
});

test('the page listens for the planner request and the request reports whether the microphone owner took it', () => {
  const askModule = shared('lib/voice/ask-sofia.ts');
  const listeners = [];
  const events = { addEventListener: (_n, f) => listeners.push(f), removeEventListener: (_n, f) => listeners.splice(listeners.indexOf(f), 1),
    dispatchEvent: event => { for (const f of [...listeners]) f(event); return true; } };
  const sandbox = loader({}, { window: events, CustomEvent: class { constructor(name, init) { this.type = name; this.detail = init.detail; } } })('lib/voice/ask-sofia.ts');
  assert.equal(sandbox.askSofia(), false, 'nobody is listening');
  let started = 0;
  const stop = sandbox.listenAskSofia(() => { started++; });
  assert.equal(sandbox.askSofia(), true); assert.equal(started, 1);
  stop(); assert.equal(sandbox.askSofia(), false); assert.equal(started, 1);
  assert.equal(typeof askModule.askSofia, 'function');
});

test('changing language cancels the pending voice session and a new session uses the new locale', async () => {
  let locale = 'es';
  const b = bridge('es'), h = await connected(b.handle, () => locale);
  await h.tool('language-old', spoken('Madrid', 2, 'Idioma anterior')); await turn();
  // Home stops the session on language change; exercise that same public operation.
  locale = 'fr'; h.session.stop(); b.ui.unmount();
  await turn(); assert.equal(h.outputs().length, 0);
  const next = bridge(locale), newer = await connected(next.handle, () => locale);
  try { await newer.tool('language-new'); await turn(); await next.ui.drain();
    assert.equal(newer.outputs()[0].locale, 'fr'); assert.equal(JSON.parse(newer.calls[0].options.body).locale, 'fr');
  } finally { newer.session.stop(); next.ui?.unmount(); }
});

test('invalid calls do not cancel an itinerary being shown and are answered as busy', async () => {
  const b = bridge('es'), h = await connected(b.handle);
  try {
    await h.tool('valid'); await turn();
    await h.tool('invalid-during-valid', { destino: 'Madrid', dias: 99 }); await turn(); await turn();
    assert.equal(b.request.signal.aborted, false);
    await b.ui.drain();
    assert.equal(h.outputs().find(e => e.callId === 'valid').status, 'success');
    assert.equal(h.outputs().find(e => e.callId === 'invalid-during-valid').error, 'busy');
  } finally { h.session.stop(); b.ui?.unmount(); }
});

test('the manual duration selector only changes what the planner will request: it asks for nothing by itself', async () => {
  const requested = [];
  const ui = plannerHarness({ destination: madrid, context: {} }, 'es', async (_url, init) => {
    const body = JSON.parse(init.body); requested.push(body.days);
    return { ok: true, json: async () => ({ guide: basicGuides.buildBasicGuide(madrid, body.days, body.locale) }) };
  });
  await ui.drain();
  ui.find(n => n.type === 'button' && n.props['aria-label'] === '4 días').props.onClick(); await ui.drain();
  assert.equal(ui.find(n => n.type === 'button' && n.props['aria-label'] === '4 días').props['aria-pressed'], true);
  assert.ok(!ui.text().includes('Itinerario simulado visible')); assert.deepEqual(requested, []);
  createButton(ui).props.onClick(); await ui.drain();
  assert.deepEqual(requested, [4]); ui.unmount();
});

for (const [country, label] of [['IT', 'Italian'], ['GB', 'British'], ['DE', 'German'], ['NL', 'Dutch'], ['BE', 'Belgian']])
  for (const { code } of translations.locales) test(`${code}: every ${label} identity shows the itinerary written by Sofía`, async () => {
    for (const destination of catalog.getDestinationsByCountry(country)) {
      const b = bridge(code), h = await connected(b.handle, () => code);
      try {
        await h.tool(country + '-' + destination.id, spoken(destination.translations[code].name, 2)); await turn();
        assert.equal(b.scope.destinoSeleccionado, destination); assert.equal(h.outputs().length, 0);
        await b.ui.drain();
        assert.match(b.ui.text(), /Itinerario simulado visible/); assert.equal(h.outputs()[0].status, 'success');
      } finally { h.session.stop(); b.ui?.unmount(); }
    }
  });

// ---- Registered visitors: the AI itinerary and the notices that go with the free guide -------------------------------------
const aiItinerary = days => sample(days, 'Escrito por la IA');
const guideFor = body => basicGuides.buildBasicGuide(madrid, body.days, body.locale);
const aiLabel = translations.translate('es', 'itinerary.aiLabel');
const aiCount = 10;
const aiText = key => translations.translate('es', key, { count: aiCount });

test('a signed-in visitor sends their own session with the request and gets the itinerary the AI wrote, labelled as AI, saveable and downloadable', async () => {
  const seen = [];
  const ui = plannerHarness({ destination: madrid, context: {} }, 'es', async (url, init) => {
    const body = JSON.parse(init.body); seen.push({ url, headers: init.headers });
    return { ok: true, json: async () => ({ itinerary: aiItinerary(body.days) }) };
  }, true, 'token-de-prueba');
  await ui.drain();
  createButton(ui).props.onClick(); await ui.drain();
  assert.equal(seen.length, 1); assert.equal(seen[0].url, '/api/itinerary');
  assert.equal(seen[0].headers.Authorization, 'Bearer token-de-prueba');
  assert.match(ui.text(), /Escrito por la IA/); assert.ok(ui.text().includes(aiLabel));
  assert.ok(!/Guía básica/.test(ui.text()));
  assert.ok(saveButton(ui)); assert.ok(downloadButton(ui));
  downloadButton(ui).props.onClick(); await ui.drain();
  assert.equal(ui.downloads.length, 1);
  assert.ok(Buffer.from(ui.downloads[0].bytes).toString('latin1').includes(Buffer.from('Escrito por la IA', 'latin1').toString('hex')));
  ui.unmount();
});

test('a visitor without a session sends no credentials; if reading the session fails the free guide is still requested', async () => {
  for (const sessionToken of [null, undefined]) {
    const seen = [];
    const ui = plannerHarness({ destination: madrid, context: {} }, 'es', async (_url, init) => {
      seen.push(init.headers); return { ok: true, json: async () => ({ guide: guideFor(JSON.parse(init.body)), aiOffer: true }) };
    }, true, sessionToken);
    await ui.drain();
    createButton(ui).props.onClick(); await ui.drain();
    assert.equal(seen.length, 1); assert.ok(!('Authorization' in seen[0]));
    assert.match(ui.text(), /Guía básica de Madrid/); ui.unmount();
  }
});

test('the guide shows the right short notice: offer for guests, daily allowance used up, or AI unavailable, and none otherwise', async () => {
  const cases = [[{ aiOffer: true }, 'itinerary.aiOffer'], [{ aiNotice: 'limit' }, 'itinerary.aiLimit'],
    [{ aiNotice: 'unavailable' }, 'itinerary.aiUnavailable'], [{}, null], [{ aiNotice: 'otra-cosa' }, null], [{ aiOffer: 'true' }, null]];
  for (const [extra, key] of cases) {
    const ui = plannerHarness({ destination: madrid, context: {} }, 'es', async (_url, init) =>
      ({ ok: true, json: async () => ({ guide: guideFor(JSON.parse(init.body)), ...extra }) }));
    await ui.drain();
    createButton(ui).props.onClick(); await ui.drain();
    assert.match(ui.text(), /Guía básica de Madrid/); assert.ok(downloadButton(ui));
    for (const other of ['itinerary.aiOffer', 'itinerary.aiLimit', 'itinerary.aiUnavailable']) {
      assert.equal(ui.text().includes(aiText(other)), other === key, `${JSON.stringify(extra)} / ${other}`);
    }
    assert.ok(!ui.text().includes(aiLabel), 'a basic guide is never labelled as AI');
    if (key) assert.ok(ui.find(n => n.type === 'p' && n.props.role === 'note'));
    ui.unmount();
  }
});

test('the notice disappears when the duration changes, and is replaced by the new answer when the visitor asks again', async () => {
  let notice = { aiNotice: 'limit' };
  const ui = plannerHarness({ destination: madrid, context: {} }, 'es', async (_url, init) =>
    ({ ok: true, json: async () => ({ guide: guideFor(JSON.parse(init.body)), ...notice }) }));
  await ui.drain();
  createButton(ui).props.onClick(); await ui.drain();
  assert.ok(ui.text().includes(aiText('itinerary.aiLimit')));
  ui.find(n => n.type === 'button' && n.props['aria-label'] === '2 días').props.onClick(); await ui.drain();
  assert.ok(!ui.text().includes(aiText('itinerary.aiLimit')));
  notice = { aiOffer: true };
  createButton(ui).props.onClick(); await ui.drain();
  assert.ok(ui.text().includes(aiText('itinerary.aiOffer'))); assert.ok(!ui.text().includes(aiText('itinerary.aiLimit')));
  ui.unmount();
});

test('an answer with neither a valid itinerary nor a valid guide for the days asked is an error, never shown', async () => {
  for (const answer of [{ itinerary: aiItinerary(1) }, { itinerary: { title: 'x' } }, { guide: { name: 'x' } }, {}, []]) {
    const ui = plannerHarness({ destination: madrid, context: {} }, 'es', async () => ({ ok: true, json: async () => answer }), true, 'token');
    await ui.drain();
    createButton(ui).props.onClick(); await ui.drain();
    assert.match(ui.text(), /No hemos podido crear el itinerario/); assert.ok(!ui.text().includes('Escrito por la IA'));
    ui.unmount();
  }
});

test('the text of the AI notices exists in all seven languages and always carries the number of daily itineraries', () => {
  const english = translations.translate('en', 'itinerary.aiOffer', { count: 10 });
  for (const { code } of translations.locales) for (const key of ['itinerary.aiOffer', 'itinerary.aiLimit']) {
    const value = translations.translate(code, key, { count: 10 });
    assert.ok(value.includes('10'), `${code} ${key}`); assert.ok(!value.includes('{count}'), `${code} ${key}`);
    if (code !== 'en') assert.notEqual(value, translations.translate('en', key, { count: 10 }));
  }
  for (const { code } of translations.locales) for (const key of ['itinerary.aiUnavailable', 'itinerary.aiLabel']) {
    assert.ok(translations.translate(code, key).length > 20, `${code} ${key}`);
  }
  assert.ok(english.includes('free'));
});
