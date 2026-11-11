// PR 3A · tarjetas interiores de la ventana de ficha: claras y legibles, nunca negras.
//
// Antes, recomendaciones, estancia, mejor época, aeropuertos, presupuesto e itinerario usaban fondos casi
// negros (blanco al 5 % o azul muy oscuro sobre la ventana oscura). Ahora son gris azulado / azul cielo muy
// claros con texto oscuro. Solo cambian clases de color: que el resto de la ventana sea idéntico lo comprueba
// tests/destination-window-common-frame.test.cjs.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const helpers = require('./helpers/ficha-snapshots.cjs');
const { LOCALES, createRenderer, flatten, serialize, loader, makeReact } = helpers;

const root = path.resolve(__dirname, '..');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);
const classes = n => String(n?.props?.className ?? '').split(/\s+/).filter(Boolean);

// Colores usados como fondo oscuro / texto pensado para fondo oscuro.
const DARK_BACKGROUNDS = /(^|\s)(bg-white\/5|bg-white\/10|bg-slate-950(\/\d+)?|bg-slate-900(\/\d+)?|bg-slate-800|bg-black(\/\d+)?|bg-cyan-300\/\[0\.06\]|bg-cyan-300\/10|bg-rose-400\/10)(\s|$)/;
const DARK_TEXT = /(^|\s)(text-white|text-slate-(100|200|300|400)|text-cyan-(100|200)|text-rose-(100|200))(\s|$)/;
const LIGHT_BACKGROUND = /(^|\s)(bg-slate-100|bg-sky-50|bg-sky-100|bg-rose-50|bg-white)(\s|$)/;

test('in all 502 windows × 7 languages no inner card has a dark background', () => {
  let cards = 0;
  for (const locale of LOCALES) {
    const renderer = createRenderer(root, locale);
    for (const destination of [...renderer.featured, ...renderer.profiles]) {
      const dialog = flatten(renderer.detail(destination)).find(n => n.props.role === 'dialog');
      assert.ok(dialog, `${locale} ${destination.name}`);
      for (const node of flatten(dialog)) {
        if (node === dialog) continue;
        const className = classes(node).join(' ');
        // Permitidos: botón de cerrar (sobre la foto), degradado de la foto y botones cian rellenos.
        const closeButton = className.includes('absolute right-5 top-5');
        const gradient = className.includes('bg-gradient-to-t');
        assert.ok(closeButton || gradient || !DARK_BACKGROUNDS.test(className), `${locale} ${destination.name}: dark card -> ${className}`);
        if (LIGHT_BACKGROUND.test(className)) {
          cards++;
          assert.ok(!DARK_TEXT.test(className), `${locale} ${destination.name}: light text on a light card -> ${className}`);
          for (const inner of flatten(node)) assert.ok(!DARK_TEXT.test(classes(inner).join(' ')), `${locale} ${destination.name}: light text inside a light card -> ${classes(inner).join(' ')}`);
        }
      }
    }
  }
  assert.ok(cards > 20000, 'many light cards were checked: ' + cards);
});

test('recommendations, stay, best time, airports and budget share the light card colors', () => {
  const renderer = createRenderer(root, 'es');
  const find = name => [...renderer.featured, ...renderer.profiles].find(item => item.name === name);
  for (const name of ['Londres', 'Oslo', 'Santorini', 'Nueva York']) {
    const dialog = flatten(renderer.detail(find(name))).find(n => n.props.role === 'dialog');
    const nodes = flatten(dialog);
    const recommendation = nodes.filter(n => n.type === 'div' && typeof n.children?.[0] === 'string' && n.children[0].startsWith('📍'));
    assert.ok(recommendation.length >= 4, name);
    for (const card of recommendation) assert.equal(card.props.className, 'rounded-2xl border border-slate-300 bg-slate-100 p-4 text-slate-800');
    const stay = nodes.find(n => n.type === 'p' && text(n).startsWith('Estancia recomendada'));
    if (stay) assert.match(stay.props.className, /bg-slate-100/);
    const bestTime = nodes.find(n => n.type === 'section' && text(n).includes('Mejor época'));
    if (bestTime) assert.match(bestTime.props.className, /bg-sky-50.*text-slate-700/);
  }
});

// ---------- itinerario: planificador y contenido ----------
const dictionaries = loader(root)('lib/i18n/translations.ts');
const language = { useLanguage: () => ({ language: 'es', t: (k, v) => dictionaries.translate('es', k, v), text: v => dictionaries.translateText('es', v) }) };
function loadItinerary(state = []) {
  const react = makeReact(state, { index: 0, sets: [] });
  const load = loader(root, {
    react, './LanguageProvider': language,
    '@/lib/supabase/client': { getSupabaseClient: () => null },
    '@/lib/supabase/saved-itineraries': { saveItinerary: () => { throw Error('Unexpected save'); } },
  }, { React: react });
  return { Planner: load('app/components/ItineraryPlanner.tsx').default, Content: load('app/components/ItineraryContent.tsx').default };
}
const activity = (name, area) => ({ name, area, description: 'Descripción de ' + name });
const sampleItinerary = {
  title: 'Tres días en Londres', summary: 'Un resumen del viaje.', tips: ['Lleva paraguas', 'Compra la tarjeta de transporte'],
  days: [1, 2].map(dayNumber => ({ dayNumber, title: 'Día ' + dayNumber, morning: [activity('Big Ben', 'Westminster')], afternoon: [activity('Museo', 'Bloomsbury')], evening: [activity('Cena', 'Soho')] })),
};
const londres = { name: 'Londres', country: 'Reino Unido', recommendations: ['Big Ben'], recommendedStay: '4–5 días', description: 'x', image: 'x' };
const stripClasses = tree => serialize(tree).replace(/"className":"[^"]*",?/g, '');

test('the itinerary content keeps its dark look by default and has a light look for the window', () => {
  const { Content } = loadItinerary();
  const byDefault = Content({ itinerary: sampleItinerary });
  const dark = Content({ itinerary: sampleItinerary, surface: 'dark' });
  const light = Content({ itinerary: sampleItinerary, surface: 'light' });
  assert.equal(serialize(byDefault), serialize(dark), 'no prop = the look it always had');
  const darkClasses = new Set(flatten(dark).flatMap(classes).map(String));
  for (const original of ['text-white', 'text-slate-300', 'bg-slate-950/50', 'bg-white/5', 'text-cyan-100', 'text-cyan-200', 'border-white/10']) assert.ok(darkClasses.has(original) || serialize(dark).includes(original), original);
  assert.equal(stripClasses(dark), stripClasses(light), 'same elements and same texts, only classes change');
  for (const node of flatten(light)) {
    const className = classes(node).join(' ');
    assert.ok(!DARK_BACKGROUNDS.test(className) && !DARK_TEXT.test(className), className);
  }
});

test('the planner keeps its dark look by default and has a light look for the window, in every state', () => {
  const states = [
    { name: 'initial', state: [] },
    { name: 'loading', state: [3, null, true] },
    { name: 'error', state: [3, null, false, true] },
    { name: 'result', state: [3, sampleItinerary, false, false, false, 'idle'] },
    { name: 'sign-in required', state: [3, sampleItinerary, false, false, false, 'signin'] },
    { name: 'save error', state: [3, sampleItinerary, false, false, false, 'error'] },
  ];
  for (const { name, state } of states) {
    const render = surface => {
      const { Planner } = loadItinerary([...state]);
      return Planner({ destination: londres, context: {}, ...(surface ? { surface } : {}) });
    };
    const byDefault = render(), dark = render('dark'), light = render('light');
    assert.equal(serialize(byDefault), serialize(dark), name + ': no prop = the look it always had');
    assert.equal(stripClasses(dark).replace(/"surface":"dark",?/g, ''), stripClasses(light).replace(/"surface":"light",?/g, ''), name + ': only classes change');
    assert.ok(/border-cyan-300\/25 bg-cyan-300\/\[0\.06\]/.test(serialize(dark)), name + ': original dark section');
    const content = flatten(light).find(n => typeof n.type === 'function' && n.props.itinerary);
    if (name === 'result' || name.startsWith('sign') || name.startsWith('save')) assert.equal(content.props.surface, 'light', name + ': the content follows the planner');
    for (const node of flatten(light)) {
      if (typeof node.type === 'function') continue;
      const className = classes(node).join(' ');
      assert.ok(!DARK_BACKGROUNDS.test(className), `${name}: ${className}`);
      if (LIGHT_BACKGROUND.test(className)) assert.ok(!DARK_TEXT.test(className), `${name}: ${className}`);
    }
    // texto en el planificador claro: nunca texto claro sobre fondo claro
    for (const node of flatten(light)) if (typeof node.type !== 'function') assert.ok(!DARK_TEXT.test(classes(node).join(' ')) || /bg-cyan-300\b/.test(classes(node).join(' ')) , `${name}: ${classes(node).join(' ')}`);
  }
});

// El texto sin color propio hereda el blanco de la ventana: en el planificador claro todo texto debe llevar un color
// oscuro propio o estar dentro de un elemento que lo lleve.
function textWithoutOwnColor(node, inherited, found, trail = []) {
  if (Array.isArray(node)) { node.forEach(child => textWithoutOwnColor(child, inherited, found, trail)); return found; }
  if (!node || typeof node !== 'object') return found;
  if (typeof node.type === 'function') { (node.children ?? []).forEach(child => textWithoutOwnColor(child, inherited, found, trail)); return found; }
  const own = classes(node).some(c => /^text-(slate|sky|rose)-\d+$/.test(c));
  const hasColor = inherited || own;
  const directText = (node.children ?? []).some(child => typeof child === 'string' && child.trim());
  if (directText && !hasColor) found.push(`${node.type}: ${text(node).slice(0, 40)}`);
  (node.children ?? []).forEach(child => textWithoutOwnColor(child, hasColor, found, trail));
  return found;
}

test('in the light planner and itinerary every text has its own dark color (nothing falls back to the window white)', () => {
  const { Planner, Content } = loadItinerary();
  assert.deepEqual(textWithoutOwnColor(Content({ itinerary: sampleItinerary, surface: 'light' }), false, []), []);
  const states = [[], [3, null, true], [3, null, false, true], [3, sampleItinerary, false, false, false, 'idle'], [3, sampleItinerary, false, false, false, 'signin'], [3, sampleItinerary, false, false, false, 'error']];
  // Sin fechas se ve el selector de duración; con fechas, la línea "Duración del itinerario: N días" (más de 7 días añade un aviso).
  const contexts = [{}, { departureDate: '2026-12-01', returnDate: '2026-12-05' }, { departureDate: '2026-12-01', returnDate: '2026-12-20' }];
  let paragraphs = 0;
  for (const context of contexts) for (const state of states) {
    const { Planner: P } = loadItinerary([...state]);
    const tree = P({ destination: londres, context, surface: 'light' });
    const found = textWithoutOwnColor(tree, false, []);
    if (flatten(tree).some(n => n.type === 'p' && text(n).startsWith('Duración'))) paragraphs++;
    // El contenido del itinerario se revisa aparte (arriba).
    assert.deepEqual(found, [], JSON.stringify({ context, state }));
  }
  assert.ok(paragraphs > 0, 'the duration line with dates was rendered');
});

test('the window asks for the light look and the other screens keep the dark one', () => {
  const page = source('app/page.tsx');
  assert.equal(page.split('surface="light"').length - 1, 1, 'only the window planner');
  for (const file of ['app/vuelos/page.tsx', 'app/components/SavedItineraries.tsx', 'app/components/HeaderAuth.tsx']) assert.ok(!source(file).includes('surface='), file);
  // El planificador de la ventana recibe la superficie clara en las 502 fichas.
  const renderer = createRenderer(root, 'es');
  for (const destination of [...renderer.featured, ...renderer.profiles]) {
    const planner = flatten(renderer.detail(destination)).find(n => n.props.surface);
    assert.ok(planner, destination.name);
    assert.equal(planner.props.surface, 'light');
  }
});

// ---------- resultados de vuelos dentro de la ficha ----------
test('the flight results shown inside the window use light cards, and the other screens keep their own colors', () => {
  const page = source('app/page.tsx');
  const style = source('app/components/destination-window-style.ts');
  const tokens = ['flightOfferEmpty', 'flightOfferCard', 'flightOfferPrice', 'flightOfferDetails', 'flightOfferLink'];
  for (const token of tokens) {
    const line = style.split('\n').find(l => l.trim().startsWith(token + ':'));
    assert.ok(line, token);
    assert.ok(!DARK_BACKGROUNDS.test(line.split('"')[1]) && !DARK_TEXT.test(line.split('"')[1]), line);
    assert.ok(page.includes('windowStyle.' + token), token + ' is used by the window');
  }
  // La variante que no es de la ventana (buscador de la portada) conserva exactamente sus clases.
  for (const original of ['"mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-blue-950"', '"rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"',
    '"text-lg font-black text-blue-700"', '"mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 sm:text-sm"']) assert.ok(page.includes(original), original);
  // Dentro del bloque de la ventana no queda ninguna tarjeta con fondo oscuro.
  const start = page.indexOf('role="dialog" aria-modal="true" aria-labelledby="destination-detail-title"');
  const end = page.indexOf('{/* MODAL VUELOS */}');
  assert.ok(start > 0 && end > start);
  const block = page.slice(start, end);
  for (const klass of block.match(/(?:bg-white\/5|bg-white\/10|bg-cyan-300\/(?:10|\[0\.06\])|bg-slate-950\/\d+|bg-black\/\d+)/g) ?? []) assert.fail('dark card in the window block: ' + klass);
});

// ---------- legibilidad ----------
const PALETTE = { 'slate-100': '#f1f5f9', 'slate-300': '#cbd5e1', 'slate-600': '#475569', 'slate-700': '#334155', 'slate-800': '#1e293b', 'slate-900': '#0f172a', 'slate-950': '#020617',
  'sky-50': '#f0f9ff', 'sky-100': '#e0f2fe', 'sky-800': '#075985', 'sky-900': '#0c4a6e', 'white': '#ffffff', 'cyan-300': '#67e8f9', 'rose-50': '#fff1f2', 'rose-800': '#9f1239', 'rose-900': '#881337' };
const luminance = hex => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => { const [x, y] = [luminance(PALETTE[a]), luminance(PALETTE[b])].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('every text/background pair of the light cards reaches WCAG AA (4.5:1)', () => {
  const pairs = [
    ['slate-800', 'slate-100'], ['slate-700', 'slate-100'], ['slate-900', 'slate-100'],
    ['slate-600', 'slate-100'], ['sky-800', 'slate-100'],
    ['slate-700', 'sky-50'], ['slate-600', 'sky-50'], ['slate-900', 'sky-50'], ['sky-900', 'sky-50'], ['sky-800', 'sky-50'],
    ['sky-900', 'white'], ['slate-700', 'white'], ['slate-900', 'white'], ['sky-800', 'white'],
    ['sky-900', 'sky-100'], ['slate-950', 'cyan-300'], ['rose-900', 'rose-50'], ['rose-800', 'sky-50'],
  ];
  for (const [fg, bg] of pairs) assert.ok(contrast(fg, bg) >= 4.5, `${fg} on ${bg}: ${contrast(fg, bg).toFixed(2)}`);
  // La ventana sigue siendo oscura: el texto claro de la descripción lee bien sobre ella.
  assert.ok(contrast('slate-300', 'slate-950') >= 7);
});
