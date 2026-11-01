const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');
const root = path.resolve(__dirname, '..');
const tick = () => new Promise(setImmediate);
const deferred = () => { let resolve; const promise = new Promise(value => { resolve = value; }); return { promise, resolve }; };
const registered = (id = 'registered-a') => ({ user: { id, is_anonymous: false }, access_token: 'fake-account-' + id, expires_at: 4000000000 });
function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  return [node, ...(node.children ?? []).flatMap(nodes)];
}
function text(node) {
  if (node == null || node === false) return '';
  if (Array.isArray(node)) return node.map(text).join('');
  return typeof node === 'object' ? text(node.children) : String(node);
}

function pageHarness(initialSession = null, pendingInitial = null, locale = 'es') {
  const slots = [], pendingEffects = [], instances = [], cache = new Map();
  let cursor = 0, listener, currentSession = initialSession, nextRead = null, authReads = 0;
  const auth = {
    onAuthStateChange(callback) { listener = callback; return { data: { subscription: { unsubscribe() {} } } }; },
    getSession() {
      authReads++;
      if (authReads === 1 && pendingInitial) return pendingInitial.promise;
      if (nextRead) { const read = nextRead; nextRead = null; return read.promise; }
      return Promise.resolve({ data: { session: currentSession }, error: null });
    },
  };
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) }),
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = typeof initial === 'function' ? initial() : initial;
      return [slots[index], value => { slots[index] = typeof value === 'function' ? value(slots[index]) : value; }];
    },
    useRef(initial) { const index = cursor++; return slots[index] ??= { current: initial }; },
    useEffect(callback, deps) {
      const index = cursor++, previous = slots[index];
      if (!previous || !deps || !previous.deps || deps.some((value, i) => value !== previous.deps[i])) {
        slots[index] = { deps, cleanup: previous?.cleanup };
        pendingEffects.push({ index, callback });
      }
    },
  };
  class FakeVoiceSession {
    constructor(options) { this.options = options; this.starts = 0; this.opens = 0; this.stops = 0; this.generation = 0; instances.push(this); }
    async start() {
      this.starts++; const id = ++this.generation; this.options.onPhase('connecting');
      const token = await this.options.getAccessToken();
      if (id !== this.generation) return;
      if (!token) { this.stop(); this.options.onAuthRequired(); return; }
      this.opens++; this.options.onPhase('active');
    }
    stop() { this.generation++; this.stops++; this.options.onPhase('idle'); }
    dispose() { this.stop(); }
  }
  const blank = { default: () => null };
  const window = { location: { search: '', origin: 'https://preview.example' }, addEventListener() {}, removeEventListener() {} };
  const document = { body: { style: {} }, addEventListener() {}, removeEventListener() {}, getElementById: () => null, querySelector: () => null };
  const load = file => {
    file = file.replaceAll('\\', '/');
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const language = { useLanguage: () => ({ language: locale,
      t: (key, values) => load('lib/i18n/translations.ts').translate(locale, key, values),
      text: value => load('lib/i18n/translations.ts').translateText(locale, value) }) };
    const mocks = {
      react, 'next/link': { default: 'a' }, 'next/script': { default: 'script' }, 'next/image': { default: 'img' },
      './voice-panel.module.css': { default: {} }, './components/LanguageProvider': language,
      './LanguageProvider': language, '@/app/components/LanguageProvider': language,
      './components/AuthDialog': { default: 'AuthDialog' }, './components/ItineraryPlanner': blank,
      './components/FlightLocationAutocomplete': blank, './components/HeaderAuth': blank,
      './components/LanguageSelector': blank, '@/app/components/LanguageSelector': blank,
      '@/lib/supabase/client': { getSupabaseClient: () => ({ auth }) },
      '@/lib/supabase/saved-trips': { saveTrip: () => { throw Error('No account operation expected'); } },
      '@/lib/voice/session': { VoiceSession: FakeVoiceSession },
    };
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInNewContext(ts.transpileModule(source, { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.React,
    } }).outputText, {
      exports, React: react, window, document, URL, URLSearchParams, Intl, AbortController, Date,
      setInterval: () => 1, clearInterval() {}, setTimeout, clearTimeout,
      fetch: () => { throw Error('UI tests must not contact services'); },
      require: id => {
        if (Object.hasOwn(mocks, id)) return mocks[id];
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const found = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(candidate => fs.existsSync(path.join(root, candidate)));
        if (!found) throw Error('Unexpected dependency ' + id);
        return load(found);
      },
    }, { filename: file });
    return exports;
  };
  const Home = load('app/page.tsx').default;
  const render = () => {
    cursor = 0; const tree = Home();
    for (const effect of pendingEffects.splice(0)) {
      slots[effect.index].cleanup?.();
      slots[effect.index].cleanup = effect.callback();
    }
    return tree;
  };
  return { render, instances, load,
    emit(session, event = 'SIGNED_IN') { currentSession = session; listener(event, session); },
    blockNextRead(pending) { nextRead = pending; },
    dispose() { for (const slot of slots) slot?.cleanup?.(); },
  };
}

const microphone = tree => nodes(tree).find(node => node.type === 'button' && Object.hasOwn(node.props, 'aria-pressed'));

test('loading and guest views preserve browsing and offer registration/login instead of starting voice', async () => {
  const h = pageHarness();
  let tree = h.render();
  assert.equal(microphone(tree).props.disabled, true);
  microphone(tree).props.onClick();
  assert.equal(h.instances[0].starts, 0);
  await tick(); tree = h.render();
  assert.equal(nodes(tree).filter(node => node.type === 'article').length, 16);
  assert.equal(microphone(tree).props['aria-label'], 'Regístrate o inicia sesión para hablar con Sofía');
  const prompt = nodes(tree).find(node => node.props.id === 'voice-auth-required');
  assert.equal(text(prompt), 'Regístrate o inicia sesión para hablar con Sofía');
  prompt.props.onClick(); tree = h.render();
  let dialog = nodes(tree).find(node => node.type === 'AuthDialog');
  assert.equal(dialog.props.mode, 'signin'); assert.equal(h.instances[0].starts, 0);
  dialog.props.onChangeMode('signup'); tree = h.render();
  dialog = nodes(tree).find(node => node.type === 'AuthDialog');
  assert.equal(dialog.props.mode, 'signup');
  h.dispose();
});

test('sign-in never auto-starts voice; the next deliberate microphone press uses the existing session', async () => {
  const h = pageHarness(); h.render(); await tick();
  microphone(h.render()).props.onClick(); h.render();
  h.emit(registered()); await tick();
  let tree = h.render();
  assert.equal(h.instances[0].starts, 0);
  nodes(tree).find(node => node.type === 'AuthDialog').props.onClose(); tree = h.render();
  assert.equal(nodes(tree).some(node => node.props.id === 'voice-auth-required'), false);
  microphone(tree).props.onClick(); await tick(); tree = h.render();
  assert.equal(h.instances[0].starts, 1); assert.equal(h.instances[0].opens, 1);
  assert.equal(microphone(tree).props['aria-pressed'], true);
  h.dispose();
});

test('logout and account replacement immediately stop active voice without restricting the catalog', async () => {
  for (const next of [null, registered('registered-b')]) {
    const h = pageHarness(registered()); h.render(); await tick();
    microphone(h.render()).props.onClick(); await tick(); h.render();
    const session = h.instances[0], previousStops = session.stops;
    h.emit(next, next ? 'SIGNED_IN' : 'SIGNED_OUT');
    assert.equal(session.stops, previousStops + 1);
    const tree = h.render();
    assert.equal(microphone(tree).props['aria-pressed'], false);
    assert.equal(nodes(tree).filter(node => node.type === 'article').length, 16);
    assert.equal(session.starts, 1, 'an account change must not restart voice');
    h.dispose();
  }
});

test('logout while the account token is refreshing prevents a late microphone connection', async () => {
  const h = pageHarness(registered()); h.render(); await tick();
  const pending = deferred(); h.blockNextRead(pending);
  microphone(h.render()).props.onClick(); await tick();
  h.emit(null, 'SIGNED_OUT');
  pending.resolve({ data: { session: registered() }, error: null }); await tick();
  assert.equal(h.instances[0].opens, 0);
  assert.equal(microphone(h.render()).props['aria-pressed'], false);
  h.dispose();
});

test('all supported languages provide the microphone account requirement', () => {
  const h = pageHarness();
  const translations = h.load('lib/i18n/translations.ts');
  for (const { code } of translations.locales) {
    assert.ok(translations.translate(code, 'voice.authRequired').includes('Sofía'));
  }
});
