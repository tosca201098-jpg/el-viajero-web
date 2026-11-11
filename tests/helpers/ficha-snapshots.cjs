// Renders the home page and the shared destination detail window with the same
// lightweight React mock used by the other tests, and turns the result into
// short digests. Used by tests/destination-photo-frame.test.cjs and, with another
// project root, to record the baseline before the photo-frame change.
const crypto = require('node:crypto');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), ts = require('typescript');

const LOCALES = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React };

function loader(root, mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    file = file.replaceAll('\\', '/');
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions }).outputText, {
      exports, Intl, URL, URLSearchParams, AbortController, Date, ...globals, require: id => {
        if (Object.hasOwn(mocks, id)) return mocks[id];
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const p = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(p => fs.existsSync(path.join(root, p)));
        if (!p) throw Error('Unexpected dependency ' + id);
        return load(p);
      },
    });
    return exports;
  }
  return load;
}

function makeReact(state, counter) {
  return {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) }),
    useState(initial) {
      const slot = counter.index++;
      if (!(slot in state)) state[slot] = typeof initial === 'function' ? initial() : initial;
      return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; counter.sets.push([slot, state[slot]]); }];
    },
    useRef: initial => ({ current: initial }),
    useEffect: () => {},
  };
}

function createRenderer(root, locale) {
  const dictionaries = loader(root)('lib/i18n/translations.ts');
  const state = [], counter = { index: 0, sets: [] };
  const react = makeReact(state, counter);
  const language = { useLanguage: () => ({ language: locale, t: (k, v) => dictionaries.translate(locale, k, v), text: v => dictionaries.translateText(locale, v) }) };
  const blank = { default: () => null };
  const load = loader(root, {
    react, 'next/link': { default: 'a' }, 'next/script': { default: 'script' }, 'next/image': { default: 'img' },
    './voice-panel.module.css': { default: {} }, './components/LanguageProvider': language, './LanguageProvider': language,
    '@/app/components/LanguageProvider': language, './components/AuthDialog': blank, './components/ItineraryPlanner': blank,
    './components/FlightLocationAutocomplete': blank, './components/HeaderAuth': blank, './components/LanguageSelector': blank,
    '@/app/components/LanguageSelector': blank, '@/lib/supabase/client': { getSupabaseClient: () => null },
    '@/lib/supabase/saved-trips': { saveTrip: () => { throw Error('Unexpected save'); } },
  }, { React: react });
  const Home = load('app/page.tsx').default;
  const featured = load('lib/destinations/featured.ts').destinations;
  const catalog = load('lib/destinations/index.ts');
  const render = () => { counter.index = 0; return Home(); };
  // The slot that holds the selected destination is the one the first card sets.
  render();
  const card = flatten(render()).find(n => n.type === 'article');
  const button = flatten(card).find(n => n.type === 'button');
  counter.sets.length = 0;
  button.props.onClick();
  const hit = counter.sets.find(([, value]) => value === featured[0]);
  if (!hit) throw Error('Selected destination state slot not found');
  const slot = hit[0];
  state[slot] = null;
  return {
    t: key => dictionaries.translate(locale, key),
    featured, profiles: catalog.destinationProfiles,
    home: () => { state[slot] = null; return render(); },
    detail: destination => { state[slot] = destination; const tree = render(); state[slot] = null; return tree; },
  };
}

function flatten(n) {
  if (!n || typeof n !== 'object') return [];
  if (Array.isArray(n)) return n.flatMap(flatten);
  return [n, ...(n.children ?? []).flatMap(flatten)];
}

function serialize(tree) {
  return JSON.stringify(tree, (key, value) => typeof value === 'function' ? '[fn]' : value);
}

function digest(string) {
  return crypto.createHash('sha256').update(string).digest('hex').slice(0, 16);
}

// The only strings the photo-frame change is allowed to alter inside the detail window.
const FRAME_NEW = '"className":"relative h-52 max-sm:h-[140px] sm:h-72","data-destination-photo-frame":"panoramic"';
const FRAME_OLD = '"className":"relative h-72 md:h-96"';
const TITLE_BOX_NEW = '"className":"absolute bottom-6 left-6 right-20 max-sm:bottom-3 max-sm:right-[4.75rem]"';
const TITLE_BOX_OLD = '"className":"absolute bottom-6 left-6"';
const TITLE_NEW = /"className":"break-words font-black md:text-5xl [^"]*text-4xl"/g;
const TITLE_OLD = '"className":"text-4xl font-black md:text-5xl"';

function withOriginalFrame(serialized) {
  return serialized.replace(FRAME_NEW, FRAME_OLD).replace(TITLE_BOX_NEW, TITLE_BOX_OLD).replace(TITLE_NEW, TITLE_OLD);
}

// Phase 2 changes only which part of the photo is shown (object-position), so the digests
// ignore that single style value; tests/destination-photo-framing.test.cjs checks it separately.
const OBJECT_POSITION = /,?"style":\{"objectPosition":"[^"]*"\}/g;

function withoutObjectPosition(serialized) {
  return serialized.replace(OBJECT_POSITION, '');
}

// lib/destinations/image-framing.ts has no imports, so it can be loaded on its own.
function loadFraming(root) {
  return loader(root)('lib/destinations/image-framing.ts');
}

function snapshots(root, options = {}) {
  const frame = options.normalizeFrame ? withOriginalFrame : value => value;
  // Con originalCardColors las tarjetas interiores (ahora claras) vuelven a su color anterior antes de comparar.
  const cards = options.originalCardColors ? withOriginalCardColors : value => value;
  const normalize = value => withoutObjectPosition(frame(value));
  const result = { home: {}, featuredDetail: {}, profileDetail: {} };
  for (const locale of LOCALES) {
    const renderer = createRenderer(root, locale);
    result.home[locale] = digest(withoutObjectPosition(serialize(renderer.home())));
    result.featuredDetail[locale] = {};
    renderer.featured.forEach((destination, index) => {
      result.featuredDetail[locale][index] = digest(normalize(serialize(cards(renderer.detail(destination)))));
    });
    if (locale === 'es' || locale === 'en') {
      result.profileDetail[locale] = {};
      for (const profile of renderer.profiles) result.profileDetail[locale][profile.id] = digest(normalize(serialize(cards(renderer.detail(profile)))));
    }
  }
  return result;
}

// Tarjetas interiores de la ventana de ficha: antes casi negras, ahora claras (diseño de tarjetas claras).
// Cada par es [clases nuevas, clases que tenía antes el mismo elemento]. Con ellas se demuestra que el
// cambio de color NO toca nada más: al devolver estas clases a su valor anterior, la ventana de cada
// ficha vuelve a ser idéntica, carácter por carácter, a la de la rama de la PR #64.
const LIGHT_CARD_CLASSES = [
  ['rounded-2xl border border-slate-300 bg-slate-100 p-4 text-slate-800', 'rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300'],
  ['mt-5 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-700', 'mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300'],
  ['font-semibold text-slate-900', 'font-semibold text-white'],
  ['mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700', 'mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] px-4 py-3 text-sm text-slate-200'],
  ['mt-1 text-slate-600', 'mt-1 text-slate-300'],
  ['mt-1 text-xs text-slate-600', 'mt-1 text-xs text-slate-400'],
  ['mt-2 text-xs text-slate-600', 'mt-2 text-xs text-slate-400'],
  ['mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900', 'mt-4 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-semibold text-cyan-100'],
  ['mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4', 'mt-4 rounded-2xl border border-cyan-300/20 p-4'],
  ['mt-2 text-sm text-slate-700', 'mt-2 text-sm text-slate-300'],
  ['min-h-[44px] rounded-xl border border-sky-300 bg-white px-3 py-2 text-sm text-sky-900', 'min-h-[44px] rounded-xl border border-cyan-300/40 px-3 py-2 text-sm text-cyan-100'],
  ['rounded-2xl border border-sky-300 bg-sky-50 px-6 py-4 font-bold text-sky-900', 'rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-6 py-4 font-bold text-cyan-200'],
];

// Devuelve la ventana (solo ella) a los colores anteriores; el planificador recibe además surface="light".
function withOriginalCardColors(node) {
  if (Array.isArray(node)) return node.map(withOriginalCardColors);
  if (!node || typeof node !== 'object') return node;
  if (node.props?.role === 'dialog') {
    let json = serialize(node);
    for (const [light, dark] of LIGHT_CARD_CLASSES) json = json.replaceAll(`"className":"${light}"`, `"className":"${dark}"`);
    return JSON.parse(json.replaceAll(',"surface":"light"', ''));
  }
  return { ...node, children: (node.children ?? []).map(withOriginalCardColors) };
}

// Huellas de la portada y de TODAS las ventanas de ficha (las 16 originales y los 486 perfiles del
// catálogo) en los siete idiomas. Con originalCardColors se devuelven las tarjetas a su color anterior.
function commonFrameSnapshots(root, options = {}) {
  const prepare = options.originalCardColors ? withOriginalCardColors : value => value;
  const result = { home: {}, featuredDetail: {}, profileDetail: {} };
  for (const locale of LOCALES) {
    const renderer = createRenderer(root, locale);
    result.home[locale] = digest(serialize(renderer.home()));
    result.featuredDetail[locale] = {};
    renderer.featured.forEach((destination, index) => {
      result.featuredDetail[locale][index] = digest(serialize(prepare(renderer.detail(destination))));
    });
    result.profileDetail[locale] = {};
    for (const profile of renderer.profiles) result.profileDetail[locale][profile.id] = digest(serialize(prepare(renderer.detail(profile))));
  }
  return result;
}

module.exports = { LOCALES, createRenderer, flatten, serialize, digest, withOriginalFrame, withoutObjectPosition, loadFraming, snapshots, commonFrameSnapshots, withOriginalCardColors, LIGHT_CARD_CLASSES, loader, makeReact };
