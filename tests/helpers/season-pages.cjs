// Dibuja las cuatro páginas de temporada (primavera, verano, otoño e invierno) con el mismo React de pruebas
// ligero que usan las demás, y también la ventana de cada ficha (se pulsa la tarjeta y se vuelve a dibujar).
// Lo usan tests/season-windows-common-design.test.cjs y, con otra raíz, el script que guardó las huellas
// del estado anterior al cambio de diseño.
const { loader, makeReact, flatten, serialize, digest } = require('./ficha-snapshots.cjs');

const SEASONS = ['primavera', 'verano', 'otono', 'invierno'];

// Colores de las páginas de temporada: antes tarjetas translúcidas y ventana azul oscura, ahora tarjetas y
// ventana claras como la ficha de Roma. Cada par es [clases nuevas, clases que tenía antes el mismo elemento]
// (son trozos de la lista de clases: el resto de cada lista, es decir tamaños y posiciones, no cambia).
// Con ellos se demuestra que el cambio de color NO toca nada más: al devolver estas clases a su valor
// anterior, cada tarjeta y cada ventana vuelve a ser idéntica, carácter por carácter, a la de antes.
const LIGHT_SEASON_CLASSES = [
  // tarjeta de la lista
  ["group min-w-0 cursor-pointer overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-md transition duration-300 hover:-translate-y-2 hover:border-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 max-sm:snap-start max-sm:hover:translate-y-0",
   "group min-w-0 cursor-pointer overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] shadow-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-300/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 max-sm:snap-start max-sm:hover:translate-y-0"],
  // país en la tarjeta
  ["text-sm font-semibold text-cyan-200 max-sm:text-xs max-sm:leading-4",
   "text-sm font-semibold text-cyan-300 max-sm:text-xs max-sm:leading-4"],
  // telón de la ventana
  ["fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-3 backdrop-blur-md max-sm:flex max-sm:items-center max-sm:overflow-hidden max-sm:p-2 sm:p-6",
   "fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-3 text-white backdrop-blur-sm max-sm:flex max-sm:items-center max-sm:overflow-hidden max-sm:p-2 sm:p-6"],
  // ventana
  ["mx-auto my-3 max-w-3xl overflow-hidden rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-2xl max-sm:my-0",
   "mx-auto my-3 max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-2xl max-sm:my-0"],
  // botón de cerrar
  ["flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-xl font-bold text-white backdrop-blur transition hover:bg-black/80 sm:right-5 sm:top-5",
   "flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-xl font-bold backdrop-blur transition hover:bg-black/80 sm:right-5 sm:top-5"],
  // título sobre la foto
  ["absolute bottom-4 left-5 text-white max-sm:bottom-3 max-sm:left-4 sm:bottom-6 sm:left-7",
   "absolute bottom-4 left-5 max-sm:bottom-3 max-sm:left-4 sm:bottom-6 sm:left-7"],
  // etiqueta de categoría
  ["inline-flex rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 sm:text-sm",
   "inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100 sm:text-sm"],
  // descripción
  ["mt-3 text-base leading-6 text-slate-700 max-sm:text-sm max-sm:leading-5 sm:text-lg sm:leading-7",
   "mt-3 text-base leading-6 text-slate-300 max-sm:text-sm max-sm:leading-5 sm:text-lg sm:leading-7"],
  // título «4 lugares recomendados»
  ["mt-6 text-lg font-bold text-slate-900 max-sm:mt-4 max-sm:text-base max-sm:leading-5 sm:text-xl",
   "mt-6 text-lg font-bold max-sm:mt-4 max-sm:text-base max-sm:leading-5 sm:text-xl"],
  // tarjetas de lugares
  ["rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800 max-sm:px-2.5",
   "rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 max-sm:px-2.5"],
  // estancia recomendada
  ["mt-5 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 font-semibold text-slate-900 max-sm:mt-3",
   "mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 font-semibold text-cyan-100 max-sm:mt-3"],
  // botones secundarios
  ["border border-sky-300 bg-sky-50 px-3 py-3 text-center text-sm font-bold text-sky-900 transition hover:bg-sky-100 max-sm:px-1",
   "border border-cyan-300/40 bg-cyan-300/10 px-3 py-3 text-center text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/20 max-sm:px-1"],
];
// El degradado de la foto es el mismo (el de la ficha de Roma) en la tarjeta de la lista y en la ventana,
// pero antes eran distintos; por eso se restaura según dónde esté.
const GRADIENT_NEW = 'absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20';
const GRADIENT_OLD_CARD = 'absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent';
const GRADIENT_OLD_WINDOW = 'absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20';

function restoreNode(node, insideCard) {
  if (Array.isArray(node)) return node.map(child => restoreNode(child, insideCard));
  if (!node || typeof node !== 'object') return node;
  const inside = insideCard || node.type === 'article';
  const props = { ...node.props };
  if (typeof props.className === 'string') {
    props.className = props.className === GRADIENT_NEW ? (inside ? GRADIENT_OLD_CARD : GRADIENT_OLD_WINDOW)
      : LIGHT_SEASON_CLASSES.reduce((value, [light, dark]) => value.replaceAll(light, dark), props.className);
  }
  return { ...node, props, children: (node.children ?? []).map(child => restoreNode(child, inside)) };
}

// Devuelve una tarjeta o ventana de temporada a sus colores anteriores (texto listo para calcular la huella).
const restoreSeasonColors = tree => serialize(restoreNode(JSON.parse(serialize(tree)), false));

function renderSeasonPage(root, season) {
  const state = [], counter = { index: 0, sets: [] };
  const react = makeReact(state, counter);
  const Page = loader(root, { react, 'next/link': { default: 'a' } }, { React: react })(`app/temporadas/${season}/page.tsx`).default;
  const render = () => { counter.index = 0; return Page(); };
  const list = render();
  const cards = flatten(list).filter(n => n.type === 'article');
  // Cada tarjeta guarda su ventana: se pulsa (como haría la persona) y se dibuja la página con esa selección.
  const windows = cards.map(card => {
    counter.sets.length = 0;
    card.props.onClick({ currentTarget: {} });
    const tree = render();
    const [slot] = counter.sets[counter.sets.length - 1];
    state[slot] = null;
    return tree;
  });
  render();
  return { list, cards, windows };
}

const cardName = card => flatten(card).find(n => n.type === 'h3').children.join('');

// Huellas de todas las tarjetas y ventanas de las cuatro páginas. `restore` (p. ej. restoreSeasonColors)
// devuelve los colores al estado anterior antes de calcular cada huella.
function seasonSnapshots(root, restore = serialize) {
  const result = {};
  for (const season of SEASONS) {
    const { list, cards, windows } = renderSeasonPage(root, season);
    result[season] = { page: digest(restore(list)), windows: {} };
    cards.forEach((card, index) => { result[season].windows[cardName(card)] = digest(restore(windows[index])); });
  }
  return result;
}

module.exports = { SEASONS, LIGHT_SEASON_CLASSES, restoreSeasonColors, renderSeasonPage, cardName, seasonSnapshots };
