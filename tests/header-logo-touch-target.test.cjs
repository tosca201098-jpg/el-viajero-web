// Cabecera de la portada en el móvil: el logotipo «DESTINAUTA» es un botón (lleva arriba del todo) y medía solo 20 px de alto.
// Ahora tiene 44 px de zona de toque (lo recomendado), sin cambiar el aspecto: el texto sigue centrado y la barra sigue
// midiendo lo que miden los botones de «Crear cuenta», «Iniciar sesión» y de idioma (44 px) más sus márgenes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const page = read('app/page.tsx');
const NAV_START = page.indexOf('{/* NAVEGACIÓN */}');
const NAV_END = page.indexOf('{/* PORTADA */}');
const nav = page.slice(NAV_START, NAV_END);
const logo = nav.slice(nav.indexOf('<button'), nav.indexOf('</button>') + '</button>'.length);
const tokens = element => element.match(/className="([^"]*)"/)[1].split(/\s+/);

test('the home header exists once and contains the logo button', () => {
  assert.ok(NAV_START > 0 && NAV_END > NAV_START, 'the navigation block is found');
  assert.equal((nav.match(/<nav /g) || []).length, 1);
  assert.equal((nav.match(/<button/g) || []).length, 1, 'the only <button> written in the header is the logo (the account and language buttons are their own components)');
});

test('the logo button has a 44 px touch area on mobile and keeps everything else', () => {
  const classes = tokens(logo);
  assert.ok(classes.includes('max-sm:min-h-[44px]'), 'mobile touch height');
  for (const kept of ['shrink-0', 'whitespace-nowrap', 'text-xl', 'font-black', 'tracking-tight', 'text-black', 'max-sm:text-sm']) assert.ok(classes.includes(kept), kept);
  // Solo se añadió una clase: no cambia el ancho (no hay clases de ancho ni de relleno nuevas) ni el texto.
  assert.equal(classes.length, 8);
  assert.ok(!classes.some(c => /^(max-sm:)?(p[xlrtb]?-|w-|min-w-|gap-|m[xlrtb]?-)/.test(c)), 'no width, padding or margin classes');
  assert.ok(logo.includes('aria-label="DESTINAUTA"'));
  assert.ok(logo.includes('window.scrollTo({ top: 0, behavior: "smooth" })'), 'still scrolls to the top');
  assert.ok(logo.includes('DEST<span className="text-blue-500">I<span className="text-black">N</span>A</span>UTA'), 'same wordmark');
});

test('the header keeps its mobile height: the bar is still set by the 44 px buttons, not by the logo', () => {
  assert.ok(nav.includes('max-sm:px-3 max-sm:py-1.5'), 'same padding of the bar on mobile');
  assert.ok(nav.includes('items-center'), 'the logo stays vertically centered');
  const auth = read('app/components/HeaderAuth.tsx');
  assert.ok(auth.includes('max-sm:min-h-[44px]'), 'the account buttons are 44 px tall on mobile');
  const language = read('app/components/LanguageSelector.tsx');
  assert.ok(language.includes('h-11 w-11'), 'the language button is 44 px');
});

test('the touch area did not change on tablet and desktop', () => {
  const classes = tokens(logo);
  assert.ok(!classes.some(c => /^(sm|md|lg|xl):.*min-h/.test(c)));
});
