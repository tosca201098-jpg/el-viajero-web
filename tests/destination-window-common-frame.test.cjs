// PR 3A: marco común de la ventana de ficha (modelo Oslo).
//
// 1. La ventana de las 16 tarjetas originales y de los 486 perfiles del catálogo, en los siete idiomas,
//    sale EXACTAMENTE igual que antes de mover el marco a los archivos compartidos
//    (huellas generadas con la rama de la PR #64, antes de tocar nada de la PR 3A). La única diferencia
//    permitida son los colores de la ventana (ahora clara: fondo blanco y tarjetas claras): para compararlos,
//    esas clases se devuelven a su valor anterior; ver tests/destination-window-light-cards.test.cjs.
// 2. "Vuelo + hotel" NO se ofrece en la ficha: la función está aplazada y no debe presentarse como operativa.
// 3. La bandera nunca se pone "por defecto".
// PR #74: las huellas se recalcularon solo porque «Dónde viajar según la temporada» pasó de cuatro botones a
// <SeasonCards />; sustituyendo ese bloque en la página de main, las 3.521 páginas quedan idénticas carácter por carácter.
// PR de Sofía (#38): las huellas se recalcularon solo porque el botón del micrófono de la página ahora espera a conocer la sesión,
// pide registrarse a los visitantes (aria-label, aria-describedby, disabled, dos clases y dos líneas nuevas bajo el botón) y el
// cuadro de acceso recibe onChangeMode. Devolviendo ese bloque al de main (y quitando esa propiedad), las 3.521 páginas
// (portada y ventana de cada ficha, en los siete idiomas) quedan idénticas carácter por carácter a las huellas anteriores.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const helpers = require('./helpers/ficha-snapshots.cjs');
const { LOCALES, createRenderer, flatten, commonFrameSnapshots } = helpers;

const root = path.resolve(__dirname, '..');
const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'ficha-baseline-before-common-frame.json'), 'utf8'));
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);

// La ventana ahora es clara; se devuelven sus colores a los anteriores para comparar todo lo demás.
const current = commonFrameSnapshots(root, { originalColors: true });

test('the baseline covers the home page, the 16 original windows and every catalog window in seven languages', () => {
  assert.deepEqual(Object.keys(baseline.home), LOCALES);
  for (const locale of LOCALES) {
    assert.equal(Object.keys(baseline.featuredDetail[locale]).length, 16, locale);
    assert.ok(Object.keys(baseline.profileDetail[locale]).length >= 486, locale);
  }
});

test('the home page and its 16 original cards are identical to the version before PR 3A', () => {
  assert.deepEqual(current.home, baseline.home);
});

test('the window of the 16 original destinations is identical in the seven languages', () => {
  assert.deepEqual(current.featuredDetail, baseline.featuredDetail);
});

test('the window of every catalog destination is identical in the seven languages', () => {
  for (const locale of LOCALES) {
    // Las fichas de países añadidos después de la huella (p. ej. Japón, en borrador) no están en ella: todas las de la huella
    // deben seguir estando, en el mismo orden, e idénticas.
    const baselineIds = Object.keys(baseline.profileDetail[locale]);
    assert.deepEqual(Object.keys(current.profileDetail[locale]).filter(id => baselineIds.includes(id)), baselineIds, locale);
    const different = Object.keys(baseline.profileDetail[locale]).filter(id => current.profileDetail[locale][id] !== baseline.profileDetail[locale][id]);
    assert.deepEqual(different, [], `${locale}: ${different.slice(0, 5).join(', ')}`);
  }
});

test('the window keeps its flights and hotels buttons and offers no "Vuelo + hotel" button', () => {
  for (const locale of LOCALES) {
    const renderer = createRenderer(root, locale);
    const flights = `✈️ ${renderer.t('search.findFlights')}`, hotels = `🏨 ${renderer.t('search.findHotels')}`;
    const labels = [renderer.t('trips.package'), renderer.t('search.findPackage')];
    for (const destination of [...renderer.featured, ...renderer.profiles]) {
      const buttons = flatten(renderer.detail(destination)).filter(n => n.type === 'button').map(text);
      assert.equal(buttons.filter(label => label === hotels).length, 1, `${locale} ${destination.name}: hotels button kept`);
      assert.ok(buttons.filter(label => label === flights).length <= 1, `${locale} ${destination.name}`);
      assert.ok(!buttons.some(label => labels.some(name => label.includes(name))), `${locale} ${destination.name}: no Vuelo + hotel button`);
    }
    for (const destination of renderer.featured) {
      assert.equal(flatten(renderer.detail(destination)).filter(n => n.type === 'button' && text(n) === flights).length, 1, `${locale} ${destination.name}: flights button kept`);
    }
  }
});

test('the window does not call the Vuelo + Hotel function, which stays untouched and postponed', () => {
  const page = source('app/page.tsx');
  const modal = page.slice(page.indexOf('{/* MODAL DESTINO */}'), page.indexOf('{/* MODAL VUELOS */}'));
  assert.ok(modal.length > 1000);
  assert.ok(!/abrirPaquete|findPackage|trips\.package|data-destination-action/.test(modal));
  assert.ok(!source('app/components/destination-window-style.ts').includes('sm:col-span-2'));
  const fn = page.slice(page.indexOf('function abrirPaquete('), page.indexOf('function abrirHoteles('));
  assert.equal(fn.trim(), `function abrirPaquete(destino = "") {
  if (destino) {
    setDestinoVuelo(destino);
    setDestinoHotel(destino);
  }
  setModal("paquete");
  setDestinoSeleccionado(null);
}`);
  assert.equal(page.split('El buscador de Vuelo + Hotel está preparado. Conectaremos las ofertas reales mediante la API.').length - 1, 2, 'the two existing forms keep their message');
  assert.match(page, /const tab = service === "ambos" \? "paquete" : "vuelos";/);
  // PR de Sofía (#38): la voz ya no abre el formulario «Vuelo + hotel» (aplazado): «ambos» busca vuelos y «hotel» abre los hoteles.
  // Solo queda la definición de la función, que sigue intacta.
  assert.equal(page.split('abrirPaquete(').length - 1, 1, 'only the definition remains: the voice flow no longer opens the postponed package form');
});

test('the common window style lives under /app, where Tailwind looks for classes', () => {
  assert.ok(fs.existsSync(path.join(root, 'app/components/destination-window-style.ts')));
  assert.ok(fs.existsSync(path.join(root, 'app/components/destination-window-header.tsx')));
  assert.match(source('tailwind.config.ts'), /'\.\/app\/\*\*\/\*\.\{js,ts,jsx,tsx,mdx\}'/);
  assert.ok(!fs.existsSync(path.join(root, 'lib/destinations/destination-window-style.ts')));
});

test('the window uses the common style: no copy of the Oslo classes stays inside page.tsx', () => {
  const page = source('app/page.tsx');
  for (const klass of ['relative h-52 max-sm:h-[140px] sm:h-72', 'absolute bottom-6 left-6 right-20', 'max-w-3xl overflow-y-auto overscroll-contain rounded-[30px]', 'text-lg leading-8 text-slate-300', 'rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300']) {
    assert.ok(!page.includes(klass), klass);
  }
  const style = source('app/components/destination-window-style.ts');
  for (const klass of ['relative h-52 max-sm:h-[140px] sm:h-72', 'absolute bottom-6 left-6 right-20 text-white max-sm:bottom-3 max-sm:right-[4.75rem]', 'max-w-3xl overflow-y-auto overscroll-contain rounded-[30px]']) {
    assert.ok(style.includes(klass), klass);
  }
});

test('the flag is shown only when there is a reliable country code, and the French flag is never the default', () => {
  const ts = require('typescript');
  const mod = {};
  new Function('exports', ts.transpileModule(source('lib/destinations/country-flags.ts'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText)(mod);
  assert.equal(mod.flagForCountryCode('FR'), '🇫🇷');
  assert.equal(mod.flagForCountryCode('NO'), '🇳🇴');
  assert.equal(mod.flagForCountryCode('JP'), '🇯🇵');
  assert.equal(mod.flagForCountryCode('KR'), '🇰🇷');
  for (const unknown of ['ZZ', 'XX', '', 'constructor', 'toString', undefined, null]) assert.equal(mod.flagForCountryCode(unknown), undefined, String(unknown));
  // Solo la ventana de ficha: las tarjetas del buscador tienen su propio código y son de la Fase 4.
  const page = source('app/page.tsx');
  const modal = page.slice(page.indexOf('{/* MODAL DESTINO */}'), page.indexOf('{/* MODAL VUELOS */}'));
  assert.ok(modal.length > 1000 && !modal.includes('🇫🇷'), 'the window no longer has a French fallback');
  assert.match(modal, /flagForCountryCode\(selectedCatalogProfile\?\.countryCode\) \?\? ""/);
});
