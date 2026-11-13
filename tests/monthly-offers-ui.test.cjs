// Pantalla de «Viajes por mes»: selector de aeropuerto, carga de precios, tarjetas y respaldo a la lista de siempre.
// Se dibuja el componente real con un React simulado y un `fetch` falso: no se llama a ningún servicio externo.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loader, flatten } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const plain = (value) => JSON.parse(JSON.stringify(value));
const baseLoad = loader(root, {}, { AbortSignal });
const translations = baseLoad('lib/i18n/translations.ts');
const monthly = baseLoad('lib/travelpayouts/monthly.ts');
const shared = baseLoad('lib/travelpayouts/monthly-shared.ts');
const YEAR = monthly.targetYear(1);

function makeReact() {
  const state = [], previous = [];
  const effects = [];
  let index = 0;
  const react = {
    Fragment: (props) => props.children,
    createElement(type, props, ...children) {
      const kids = children.flat(Infinity);
      if (typeof type === 'function') return type({ ...(props ?? {}), children: kids.length <= 1 ? kids[0] : kids });
      return { type, props: props ?? {}, children: kids };
    },
    useState(initial) {
      const slot = index++;
      if (!(slot in state)) state[slot] = typeof initial === 'function' ? initial() : initial;
      return [state[slot], (value) => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }];
    },
    useEffect(fn, deps) { effects.push({ fn, deps, slot: effects.length }); },
  };
  return {
    react, state,
    render(Component, props) { index = 0; effects.length = 0; return Component(props); },
    // Como React: un efecto solo se repite si cambian sus dependencias.
    run() {
      const cleanups = [];
      for (const { fn, deps, slot } of effects) {
        const before = previous[slot];
        if (before && deps && deps.every((value, i) => Object.is(value, before[i]))) continue;
        previous[slot] = deps;
        const cleanup = fn();
        if (typeof cleanup === 'function') cleanups.push(cleanup);
      }
      return cleanups;
    },
  };
}

function setup({ language = 'es', storage, fetchImpl } = {}) {
  const harness = makeReact();
  const writes = [];
  const localStorage = storage === 'blocked'
    ? { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } }
    : { getItem: () => storage ?? null, setItem: (key, value) => { writes.push([key, value]); } };
  const requests = [];
  const fetch = (url, init) => { requests.push({ url, init }); return fetchImpl(url, init); };
  const lang = { useLanguage: () => ({ language, t: (key, vars) => translations.translate(language, key, vars) }) };
  const load = loader(root, { react: harness.react, 'next/link': { __esModule: true, default: 'a' }, '@/app/components/LanguageProvider': lang },
    { React: harness.react, localStorage, fetch, AbortController, AbortSignal });
  const MonthlyOffers = load('app/viajes-baratos/[mes]/MonthlyOffers.tsx').default;
  const FALLBACK = { type: 'div', props: { 'data-fallback': 'lista-de-siempre' }, children: [] };
  const props = { month: 1, monthName: 'enero', children: FALLBACK };
  const view = () => harness.render(MonthlyOffers, props);
  const text = (tree) => flatten(tree).flatMap((node) => typeof node === 'string' ? [node] : node.children ?? []).filter((x) => typeof x === 'string').join(' ');
  const settle = () => new Promise((resolve) => setTimeout(resolve, 5));
  return { harness, view, requests, writes, FALLBACK, text, settle };
}

const rec = (destination, price, departure, back, extra = {}) => ({
  origin: 'MAD', destination, price, transfers: 0,
  departure_at: `${YEAR}-${departure}T08:10:00+01:00`, return_at: `${YEAR}-${back}T21:30:00+01:00`,
  link: `/search/MAD${departure.slice(3)}${departure.slice(0, 2)}${destination}1?marker=test`, ...extra,
});
function response(records, origin = 'MAD') {
  const { offers } = monthly.pickOffers(records, origin, 1, YEAR);
  const blocks = monthly.buildBlocks(offers);
  return plain({
    success: true, month: 1, year: YEAR, origin: { code: origin, label: origin }, generatedAt: new Date().toISOString(),
    spain: blocks.spain, international: blocks.international,
  });
}
const sampleRecords = [
  rec('PMI', 36, '01-01', '01-06'), rec('TCI', 52, '01-08', '01-13'), rec('ACE', 86, '01-12', '01-17', { transfers: 1 }),
  rec('MIL', 35, '01-26', '01-29'), rec('LIS', 46, '01-22', '01-24'), rec('PAR', 73, '01-14', '01-17'), rec('GVA', 75, '01-29', '02-01'),
];
const ok = (body) => async () => ({ ok: true, json: async () => body });

const titles = (tree) => flatten(tree).filter((node) => node.type === 'h2' || node.type === 'h3').map((node) => node.children.join(''));

test('primer pintado: Madrid por defecto, los diez aeropuertos, «cargando» y la lista de siempre solo en <noscript>', () => {
  const { view, text, FALLBACK } = setup({ fetchImpl: ok(response(sampleRecords)) });
  const tree = view();
  const select = flatten(tree).find((node) => node.type === 'select');
  assert.equal(select.props.value, 'MAD');
  assert.deepEqual(flatten(select).filter((node) => node.type === 'option').map((node) => node.props.value),
    ['MAD', 'BCN', 'VLC', 'SVQ', 'AGP', 'BIO', 'PMI', 'ALC', 'TCI', 'LPA']);
  assert.match(text(tree), /Salir desde/);
  assert.match(text(tree), /Buscando los vuelos más baratos/);
  assert.equal(tree.props['aria-busy'], true);
  assert.equal(flatten(tree).filter((node) => node.type === 'article').length, 0);
  const noscript = flatten(tree).find((node) => node.type === 'noscript');
  assert.equal(noscript.children[0], FALLBACK);
  assert.equal(flatten(tree).filter((node) => node === FALLBACK).length, 1, 'fuera de <noscript> no se ve nada de la lista antigua mientras carga');
});

test('lee el aeropuerto recordado, lo consulta y dibuja los dos bloques con precios reales', async () => {
  const body = response(sampleRecords);
  const { harness, view, requests, settle, text } = setup({ storage: 'BCN', fetchImpl: ok(body) });
  view();
  harness.run(); // recupera el aeropuerto guardado
  view();
  harness.run(); // consulta
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, '/api/travelpayouts/monthly?month=1&origin=BCN');
  await settle();
  const tree = view();
  assert.equal(tree.props['aria-busy'], false);
  assert.equal(flatten(tree).find((node) => node.type === 'select').props.value, 'BCN');
  const headings = titles(tree);
  assert.deepEqual(headings.slice(0, 1), ['En España']);
  assert.ok(headings.includes('Internacional'));
  const cards = flatten(tree).filter((node) => node.type === 'article');
  assert.equal(cards.length, 7, 'solo hay tarjetas de los 7 destinos con precio real');
  const pricedLinks = flatten(tree).filter((node) => node.type === 'a' && typeof node.props.href === 'string' && node.props.href.startsWith('https://www.aviasales.com/'));
  assert.equal(pricedLinks.length, 7);
  for (const link of pricedLinks) {
    assert.equal(link.props.target, '_blank');
    assert.match(link.props.rel, /sponsored/);
    assert.match(link.props.rel, /noopener/);
  }
  const first = cards[0];
  assert.match(text(first), /Palma de Mallorca/);
  assert.match(text(first), /36\s?€/);
  assert.match(text(first), /1–6 ene/);
  assert.match(text(first), /5 noches/);
  assert.match(text(first), /directo/);
  assert.match(text(first), /Precio visto hace unos días/);
  assert.match(text(cards[2]), /1 escala/, 'Lanzarote tiene una escala');
  assert.equal(cards.filter((card) => /Sin precio reciente/.test(text(card))).length, 0, 'nunca tarjetas sin precio');
  assert.ok(cards.every((card) => /\d\s?€/.test(text(card))));
  const hrefs = flatten(first).filter((node) => node.type === 'a').map((node) => node.props.href);
  assert.ok(hrefs.includes('/?ficha=Palma%20de%20Mallorca'));
  assert.equal(hrefs.some((href) => href.includes('primaveraServicio')), false, 'fuera de la ficha no hay botón «Buscar vuelos»');
  assert.doesNotMatch(text(tree), /Buscar vuelos/);
  assert.equal(flatten(first).filter((node) => node.type === 'a' && node.props.href === '/?ficha=Palma%20de%20Mallorca').length, 1, 'el botón Ver destino sigue');
  assert.match(text(tree), /Para enero hay pocos precios guardados/);
  assert.match(text(tree), /solo mostramos los destinos que tienen un precio real/);
  assert.match(text(tree), /escapadas de 2 a 5 noches/);
  const badges = flatten(tree).filter((node) => node.type === 'span' && /^(España|Internacional)$/.test(node.children.join('')));
  assert.equal(badges.filter((badge) => badge.children.join('') === 'España').length, 3);
  assert.equal(flatten(tree).find((node) => node.type === 'noscript').children[0].props['data-fallback'], 'lista-de-siempre');
});

test('un bloque sin precios se avisa y el otro se muestra; con los dos bloques completos no hay aviso', async () => {
  const onlyAbroad = setup({ fetchImpl: ok(response([rec('LIS', 46, '01-22', '01-24'), rec('PAR', 73, '01-14', '01-17')])) });
  onlyAbroad.view(); onlyAbroad.harness.run(); onlyAbroad.view(); onlyAbroad.harness.run();
  await onlyAbroad.settle();
  const tree = onlyAbroad.view();
  assert.deepEqual(titles(tree).slice(0, 2), ['En España', 'Internacional']);
  assert.match(onlyAbroad.text(tree), /no hay precios recientes de escapada a destinos de España desde este aeropuerto en enero/);
  assert.equal(flatten(tree).filter((node) => node.type === 'article').length, 2);
  assert.equal(flatten(tree).filter((node) => node === onlyAbroad.FALLBACK).length, 1, 'con algún precio la lista antigua solo queda en <noscript>');
  const spainCodes = ['PMI', 'TCI', 'LPA', 'IBZ', 'ACE', 'BCN', 'SVQ', 'AGP', 'ALC', 'FUE', 'SPC', 'LEI'];
  const abroadCodes = ['MIL', 'LON', 'BLQ', 'LIS', 'ROM', 'KRK', 'NAP', 'OPO', 'PAR', 'BRU', 'GVA', 'GDN'];
  const full = setup({ fetchImpl: ok(response([...spainCodes, ...abroadCodes].map((code, index) => rec(code, 30 + index, '01-10', '01-13')))) });
  full.view(); full.harness.run(); full.view(); full.harness.run();
  await full.settle();
  const fullTree = full.view();
  assert.equal(flatten(fullTree).filter((node) => node.type === 'article').length, 24);
  assert.doesNotMatch(full.text(fullTree), /pocos precios guardados|no hay precios recientes/);
});

test('los textos de las tarjetas cambian con el idioma sin volver a pedir los precios', async () => {
  const body = response(sampleRecords);
  const { harness, view, requests, settle, text } = setup({ language: 'en', fetchImpl: ok(body) });
  view(); harness.run(); view(); harness.run();
  await settle();
  const tree = view();
  const cards = flatten(tree).filter((node) => node.type === 'article');
  assert.match(text(cards[0]), /Round trip from/);
  assert.match(text(cards[0]), /5 nights/);
  assert.match(text(cards[0]), /Jan/);
  assert.match(text(cards[0]), /direct/);
  assert.deepEqual(titles(tree).slice(0, 1), ['In Spain']);
  assert.equal(requests.length, 1);
});

test('al cambiar de aeropuerto se guarda la elección y se vuelve a consultar; un valor inválido se ignora', async () => {
  const { harness, view, requests, writes, settle } = setup({ fetchImpl: async (url) => ({ ok: true, json: async () => response(sampleRecords, new URL(url, 'https://x.test').searchParams.get('origin')) }) });
  view(); harness.run(); view(); harness.run();
  await settle();
  let tree = view();
  const select = flatten(tree).find((node) => node.type === 'select');
  select.props.onChange({ target: { value: 'NOPE' } });
  select.props.onChange({ target: { value: 'TCI' } });
  assert.deepEqual(plain(writes), [[shared.ORIGIN_STORAGE_KEY, 'TCI']]);
  tree = view();
  assert.equal(flatten(tree).find((node) => node.type === 'select').props.value, 'TCI');
  const cleanups = harness.run();
  assert.equal(requests.length, 2);
  assert.equal(requests[1].url, '/api/travelpayouts/monthly?month=1&origin=TCI');
  cleanups.forEach((cleanup) => cleanup());
});

test('si el navegador bloquea el almacenamiento, el selector sigue funcionando', async () => {
  const { harness, view, requests } = setup({ storage: 'blocked', fetchImpl: ok(response(sampleRecords)) });
  view(); harness.run(); view(); harness.run();
  assert.equal(requests[0].url, '/api/travelpayouts/monthly?month=1&origin=MAD');
  const select = flatten(view()).find((node) => node.type === 'select');
  assert.doesNotThrow(() => select.props.onChange({ target: { value: 'LPA' } }));
});

test('un aeropuerto guardado que ya no existe se descarta y se usa Madrid', () => {
  const { harness, view, requests } = setup({ storage: 'XXX', fetchImpl: ok(response(sampleRecords)) });
  view(); harness.run(); view(); harness.run();
  assert.equal(requests[0].url, '/api/travelpayouts/monthly?month=1&origin=MAD');
});

test('si falla la consulta se muestra la lista de destinos recomendados de siempre, con un aviso', async () => {
  for (const fetchImpl of [
    async () => { throw new Error('sin red'); },
    async () => ({ ok: false, json: async () => ({ success: false, error: 'provider_unavailable' }) }),
    async () => ({ ok: true, json: async () => ({ success: false }) }),
    async () => ({ ok: true, json: async () => ({ success: true, spain: 'x' }) }),
  ]) {
    const { harness, view, settle, text, FALLBACK } = setup({ fetchImpl });
    view(); harness.run(); view(); harness.run();
    await settle();
    const tree = view();
    assert.match(text(tree), /No hemos podido cargar los precios ahora mismo/);
    assert.match(text(tree), /destinos recomendados para enero/);
    assert.ok(flatten(tree).includes(FALLBACK));
    assert.equal(flatten(tree).filter((node) => node.type === 'article').length, 0);
  }
});

test('si no hay ni un precio se avisa y se muestra la lista de siempre en vez de 24 tarjetas vacías', async () => {
  const { harness, view, settle, text, FALLBACK } = setup({ fetchImpl: ok(response([])) });
  view(); harness.run(); view(); harness.run();
  await settle();
  const tree = view();
  assert.match(text(tree), /no hay precios recientes para enero desde este aeropuerto/);
  assert.ok(flatten(tree).includes(FALLBACK));
  assert.equal(flatten(tree).filter((node) => node.type === 'article').length, 0);
});

test('una respuesta que llega tarde, tras cambiar de aeropuerto, no pisa el resultado nuevo', async () => {
  const slow = response(sampleRecords, 'MAD');
  const fast = response([rec('LIS', 46, '01-22', '01-24', { origin: 'BCN' })], 'BCN');
  const resolvers = [];
  const { harness, view, settle, text } = setup({
    fetchImpl: (url) => new Promise((resolve) => resolvers.push(() => resolve({ ok: true, json: async () => (url.includes('origin=MAD') ? slow : fast) }))),
  });
  view(); harness.run(); view();
  const firstCleanups = harness.run();
  flatten(view()).find((node) => node.type === 'select').props.onChange({ target: { value: 'BCN' } });
  view();
  firstCleanups.forEach((cleanup) => cleanup()); // React limpia el efecto anterior antes de repetirlo
  harness.run();
  resolvers[1]();
  await settle();
  resolvers[0]();
  await settle();
  const tree = view();
  assert.match(text(tree), /Lisboa/);
  assert.doesNotMatch(text(tree), /Palma de Mallorca/);
});
