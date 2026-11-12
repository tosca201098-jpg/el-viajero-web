// PR 4B · tarjetas y ventanas de las páginas de temporada (primavera, verano, otoño e invierno) con el diseño de
// la ficha de Roma: ventana blanca, foto panorámica arriba, tarjetas claras. Solo cambian COLORES; se conserva
// todo el contenido (nombres, países, fotos, descripciones, lugares, estancias, enlaces y botones) y las funciones.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const helpers = require('./helpers/ficha-snapshots.cjs');
const seasons = require('./helpers/season-pages.cjs');
const { flatten, serialize } = helpers;
const { SEASONS, renderSeasonPage, cardName, seasonSnapshots, restoreSeasonColors } = seasons;

const root = path.resolve(__dirname, '..');
const style = helpers.loader(root)('app/components/destination-window-style.ts').destinationWindowStyle;
const baseline = require('./fixtures/season-windows-baseline-before-light.json');
const originalCards = require('./fixtures/original-season-cards.json');

const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);
const classes = n => String(n?.props?.className ?? '').split(/\s+/).filter(Boolean);
const className = n => String(n?.props?.className ?? '');

const DARK_BACKGROUNDS = /(^|\s)(bg-white\/5|bg-white\/10|bg-white\/\[0\.0\d+\]|bg-slate-950(\/\d+)?|bg-slate-900(\/\d+)?|bg-slate-800|bg-black(\/\d+)?|bg-cyan-300\/10|bg-cyan-300\/20)(\s|$)/;
const DARK_TEXT = /(^|\s)(text-white|text-slate-(100|200|300|400)|text-cyan-(100|200)|text-rose-(100|200))(\s|$)/;

// Las ventanas se dibujan una sola vez por temporada y se reutilizan en las pruebas.
const rendered = Object.fromEntries(SEASONS.map(season => [season, renderSeasonPage(root, season)]));

const dialogOf = tree => flatten(tree).find(n => n.props?.role === 'dialog');
const overlayOf = tree => flatten(tree).find(n => n.children?.includes?.(dialogOf(tree)));
// Cabecera de la ventana: la foto con el título encima (único sitio donde el texto es blanco).
const headerOf = dialog => dialog.children.find(n => n.type === 'div' && flatten(n).some(x => x.type === 'img'));

test('the four season pages keep the 16 cards each, in their original order, and every card opens its window', () => {
  for (const season of SEASONS) {
    const { cards, windows } = rendered[season];
    assert.equal(cards.length, 16, season);
    assert.deepEqual(Array.from(cards, cardName), originalCards[season], season);
    assert.equal(windows.length, 16, season);
    windows.forEach((tree, index) => {
      const dialog = dialogOf(tree);
      assert.ok(dialog, `${season} ${cardName(cards[index])}: window`);
      assert.equal(text(flatten(dialog).find(n => n.type === 'h2')).trim(), cardName(cards[index]), season);
    });
  }
});

test('only colors changed: giving the previous colors back, every page, card and window is identical to before, character by character', () => {
  const restored = seasonSnapshots(root, restoreSeasonColors);
  assert.deepEqual(Object.keys(restored), Object.keys(baseline));
  let compared = 0;
  for (const season of SEASONS) {
    assert.equal(restored[season].page, baseline[season].page, `${season} page`);
    assert.deepEqual(Object.keys(restored[season].windows), Object.keys(baseline[season].windows), season);
    for (const [name, digest] of Object.entries(restored[season].windows)) {
      assert.equal(digest, baseline[season].windows[name], `${season} ${name}`);
      compared++;
    }
  }
  assert.equal(compared, 64);
  // Y el diseño sí ha cambiado: sin devolver los colores, ninguna huella coincide con la anterior.
  const current = seasonSnapshots(root);
  for (const season of SEASONS) {
    assert.notEqual(current[season].page, baseline[season].page, season);
    for (const [name, digest] of Object.entries(current[season].windows)) assert.notEqual(digest, baseline[season].windows[name], `${season} ${name}`);
  }
});

test('each season window is the Roma window: white, light text, light cards, panoramic photo with the title over it', () => {
  for (const season of SEASONS) {
    rendered[season].windows.forEach((tree, index) => {
      const where = `${season} ${cardName(rendered[season].cards[index])}`;
      const dialog = dialogOf(tree);
      const overlay = overlayOf(tree);
      // Misma ventana que la de la ficha: blanca, bordeada, texto oscuro, esquinas de 30 px; telón claro y borroso.
      for (const token of ['rounded-[30px]', 'border-slate-200', 'bg-white', 'text-slate-900', 'shadow-2xl']) assert.ok(classes(dialog).includes(token), `${where}: ${token}`);
      for (const token of ['bg-slate-900/60', 'backdrop-blur-md']) assert.ok(classes(overlay).includes(token), `${where}: ${token}`);
      assert.ok(style.dialog.includes('rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-2xl'));
      assert.ok(style.overlay.includes('bg-slate-900/60') && style.overlay.includes('backdrop-blur-md'));
      assert.ok(!DARK_BACKGROUNDS.test(className(dialog)) && !DARK_TEXT.test(className(dialog)), where);
      assert.ok(!DARK_BACKGROUNDS.test(className(overlay).replace('bg-slate-900/60', '')) && !classes(overlay).includes('text-white'), where);

      // Cabecera: foto, degradado de la ficha, título y país encima en blanco (solo ahí), botón de cerrar visible.
      const header = headerOf(dialog);
      assert.ok(header, where + ': header');
      const gradient = flatten(header).find(n => className(n) === style.photoGradient);
      assert.ok(gradient, where + ': same photo gradient as the Roma window');
      assert.ok(classes(flatten(header).find(n => n.props['aria-label'] === 'Cerrar detalle')).includes('text-white'), where);
      assert.ok(classes(flatten(header).find(n => className(n).startsWith('absolute bottom-4 left-5'))).includes('text-white'), where + ': title over the photo');

      // Fuera de la cabecera no queda ningún fondo oscuro ni texto claro; las tarjetas usan los colores de la ficha.
      const inside = new Set(flatten(header));
      const body = dialog.children.find(n => n !== header);
      for (const node of flatten(body)) {
        if (inside.has(node) || node === body) continue;
        const names = className(node);
        assert.ok(!DARK_BACKGROUNDS.test(names) && !DARK_TEXT.test(names), `${where}: ${names}`);
      }
      const places = flatten(body).filter(n => className(n).startsWith('rounded-xl border border-slate-300 bg-slate-100'));
      assert.equal(places.length, 4, where + ': four recommended places in light cards');
      for (const node of places) assert.ok(className(node).includes('border-slate-300 bg-slate-100 ') && style.recommendationCard.includes('border-slate-300 bg-slate-100'), where);
      assert.ok(flatten(body).some(n => className(n).startsWith('mt-5 rounded-xl border border-slate-300 bg-slate-100') && text(n).includes('Estancia recomendada')), where + ': stay card');
      assert.ok(style.stayCard.includes('border-slate-300 bg-slate-100'));
      const links = flatten(body).filter(n => n.type === 'a');
      assert.equal(links.length, 3, where + ': three buttons');
      assert.ok(className(links[0]).includes('bg-cyan-300') && className(links[0]).includes('text-slate-950') && style.primaryAction.includes('bg-cyan-300 px-6 py-4 font-bold text-slate-950'), where);
      for (const link of links.slice(1)) assert.ok(['border-sky-300', 'bg-sky-50', 'text-sky-900'].every(token => classes(link).includes(token)) && style.secondaryAction.includes('border border-sky-300 bg-sky-50'), where);
    });
  }
});

test('the cards of the season list are light: white body, light category chip, photo with the title over it', () => {
  for (const season of SEASONS) {
    for (const card of rendered[season].cards) {
      const where = `${season} ${cardName(card)}`;
      for (const token of ['bg-white', 'border-slate-200', 'text-slate-900']) assert.ok(classes(card).includes(token), `${where}: ${token}`);
      assert.ok(!DARK_BACKGROUNDS.test(className(card)) && !DARK_TEXT.test(className(card)), where);
      const photo = card.children.find(n => n.type === 'div' && flatten(n).some(x => x.type === 'img'));
      assert.ok(flatten(photo).some(n => className(n) === style.photoGradient), where + ': same gradient as the Roma window');
      const rest = card.children.filter(n => n !== photo);
      for (const node of flatten(rest)) assert.ok(!DARK_BACKGROUNDS.test(className(node)) && !DARK_TEXT.test(className(node)), `${where}: ${className(node)}`);
      const chip = flatten(rest).find(n => n.type === 'span');
      assert.ok(classes(chip).includes('bg-cyan-50') && classes(chip).includes('text-cyan-900'), where);
    }
  }
});

test('the four season pages use exactly the same design: same classes in every card and window', () => {
  const classesOf = tree => new Set(flatten(tree).map(n => className(n)).filter(Boolean));
  const reference = rendered.verano;
  const referenceWindow = [...classesOf(dialogOf(reference.windows[0]))].sort();
  // invierno tiene además su propia altura de la franja de categoría, que esta PR no cambia.
  const referenceCard = [...classesOf(reference.cards[0])].filter(name => !name.startsWith('flex h-[60px]'));
  for (const season of ['primavera', 'otono', 'invierno']) {
    assert.deepEqual([...classesOf(dialogOf(rendered[season].windows[0]))].sort(), referenceWindow, season + ' window');
    const cardClasses = classesOf(rendered[season].cards[0]);
    for (const name of referenceCard) assert.ok(cardClasses.has(name), `${season}: ${name}`);
  }
});

test('the existing buttons and functions stay: the three flight and hotel links, closing and keyboard, search by destination', () => {
  const source = season => fs.readFileSync(path.join(root, 'app/temporadas', season, 'page.tsx'), 'utf8');
  for (const season of SEASONS) {
    const code = source(season);
    // Funciones de la página: escape y clic fuera cierran; el foco vuelve a la tarjeta; el carrusel sigue siendo accesible.
    for (const piece of ['event.key === "Escape"', 'aria-modal="true"', 'aria-label="Cerrar detalle"', 'if (event.target === event.currentTarget) cerrarDetalle();', 'role="region"', 'requestAnimationFrame(() => activeCardRef.current?.focus());']) assert.ok(code.includes(piece), `${season}: ${piece}`);
    for (const service of ['vuelo', 'hotel', 'ambos']) assert.ok(code.includes(`/?primaveraServicio=${service}&destino=\${encodeURIComponent(destinoSeleccionado.nombre)}#buscador`), `${season}: ${service}`);
    assert.ok(code.includes('✈️🏨 Vuelo + Hotel'), season + ': the existing button is kept exactly as it was (decision pending)');
    // Nada nuevo: sin importaciones nuevas (salvo la de Francia en primavera, que ya existía) ni código de temporadas distinto.
    const imports = code.split('\n').filter(line => /^import /.test(line));
    assert.deepEqual(imports, season === 'primavera'
      ? ['import { useEffect, useRef, useState } from "react";', 'import Link from "next/link";', "import { franceDestinations } from '@/lib/destinations/france';"]
      : ['import { useEffect, useRef, useState } from "react";', 'import Link from "next/link";'], season);
  }
});
