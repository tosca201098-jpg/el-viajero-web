// PR 3A: marco común de la ventana de ficha (modelo Oslo) y botón "Vuelo + hotel".
//
// 1. La ventana de las 16 tarjetas originales y de los 486 perfiles del catálogo, en los siete idiomas,
//    sale EXACTAMENTE igual que antes de mover el marco a los archivos compartidos
//    (huellas generadas con la rama de la PR #64, antes de tocar nada de la PR 3A).
// 2. Lo único nuevo es el botón "Vuelo + hotel", que reutiliza abrirPaquete() sin cambiarla.
// 3. La bandera nunca se pone "por defecto".
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

const current = commonFrameSnapshots(root, { ignorePackageButton: true });

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

test('the window of the 16 original destinations is identical in the seven languages (apart from the new button)', () => {
  assert.deepEqual(current.featuredDetail, baseline.featuredDetail);
});

test('the window of every catalog destination is identical in the seven languages (apart from the new button)', () => {
  for (const locale of LOCALES) {
    assert.deepEqual(Object.keys(current.profileDetail[locale]), Object.keys(baseline.profileDetail[locale]), locale);
    const different = Object.keys(baseline.profileDetail[locale]).filter(id => current.profileDetail[locale][id] !== baseline.profileDetail[locale][id]);
    assert.deepEqual(different, [], `${locale}: ${different.slice(0, 5).join(', ')}`);
  }
});

const findFlights = (renderer, tree) => flatten(tree).filter(n => n.type === 'button' && text(n) === `✈️ ${renderer.t('search.findFlights')}`);
const findHotels = (renderer, tree) => flatten(tree).filter(n => n.type === 'button' && text(n) === `🏨 ${renderer.t('search.findHotels')}`);
const findPackage = tree => flatten(tree).filter(n => n.props['data-destination-action'] === 'package');

test('every window that offers flights also offers one "Vuelo + hotel" button, after the hotels button, in its own language', () => {
  let withPackage = 0, withoutPackage = 0;
  for (const locale of LOCALES) {
    const renderer = createRenderer(root, locale);
    const label = renderer.t('search.findPackage');
    for (const destination of [...renderer.featured, ...renderer.profiles]) {
      const tree = renderer.detail(destination);
      const hotels = findHotels(renderer, tree), pack = findPackage(tree), flightButtons = findFlights(renderer, tree);
      assert.equal(hotels.length, 1, `${locale} ${destination.name}: hotels button kept`);
      assert.equal(pack.length, flightButtons.length, `${locale} ${destination.name}: package button appears together with the flights button`);
      if (pack.length) {
        withPackage++;
        const [button] = pack;
        assert.equal(button.type, 'button');
        assert.equal(button.props.type, 'button');
        assert.equal(typeof button.props.onClick, 'function');
        assert.equal(text(button), `✈️🏨 ${label}`, `${locale} ${destination.name}`);
        assert.ok(button.props.className.includes('sm:col-span-2'));
        const grid = flatten(tree).find(n => n.children?.includes(button));
        const order = grid.children.filter(c => c?.type === 'button');
        assert.equal(order[order.length - 1], button, 'it goes after flights and hotels');
      } else withoutPackage++;
    }
  }
  assert.ok(withPackage > 2500, 'most windows get the button: ' + withPackage);
  assert.ok(withoutPackage > 0, 'windows without airports for flights get neither flights nor package: ' + withoutPackage);
});

test('the three buttons are present together on the 16 original windows', () => {
  for (const locale of LOCALES) {
    const renderer = createRenderer(root, locale);
    for (const destination of renderer.featured) {
      const tree = renderer.detail(destination);
      assert.equal(findPackage(tree).length, 1, `${locale} ${destination.name}`);
      assert.equal(findHotels(renderer, tree).length, 1);
      assert.equal(findFlights(renderer, tree).length, 1);
    }
  }
});

test('the labels exist in the seven languages and are the same ones the site already used for "Vuelo + Hotel"', () => {
  const labels = LOCALES.map(locale => createRenderer(root, locale).t('search.findPackage'));
  assert.deepEqual(labels, ['Buscar Vuelo + Hotel', 'Find Flight + Hotel', 'Rechercher Vol + Hôtel', 'Flug + Hotel suchen', 'Cerca Volo + Hotel', 'Pesquisar Voo + Hotel', 'Busca Vol + Hotel']);
});

test('clicking "Vuelo + hotel" runs the existing abrirPaquete(): it opens the Vuelo + Hotel form with the destination filled in', () => {
  for (const name of ['Oslo', 'Nueva York']) {
    const renderer = createRenderer(root, 'es');
    const destination = [...renderer.featured, ...renderer.profiles].find(item => item.name === name);
    assert.ok(destination, name);
    const button = findPackage(renderer.detail(destination))[0];
    button.props.onClick();
    const home = flatten(renderer.home());
    assert.ok(!home.some(n => n.props.id === 'destination-detail-title'), 'the window closes, as with the flights button');
    assert.ok(home.some(n => n.type === 'h2' && text(n).includes('✈️🏨 Vuelo + Hotel')), 'the existing Vuelo + Hotel window opens');
    const inputs = home.filter(n => n.type === 'input' && n.props.placeholder === 'Roma');
    assert.ok(inputs.some(n => n.props.value === destination.name), 'destination filled in: ' + destination.name);
  }
});

test('the existing "Vuelo + hotel" function and its messages are untouched', () => {
  const page = source('app/page.tsx');
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
  assert.equal(page.split('abrirPaquete(').length - 1, 3, 'definition + voice flow + the new button');
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
  for (const klass of ['relative h-52 max-sm:h-[140px] sm:h-72', 'absolute bottom-6 left-6 right-20 max-sm:bottom-3 max-sm:right-[4.75rem]', 'max-w-3xl overflow-y-auto overscroll-contain rounded-[30px]']) {
    assert.ok(style.includes(klass), klass);
  }
});

test('the flag is shown only when there is a reliable country code, and the French flag is never the default', () => {
  const flags = require('typescript');
  const mod = {};
  new Function('exports', flags.transpileModule(source('lib/destinations/country-flags.ts'), { compilerOptions: { module: flags.ModuleKind.CommonJS, target: flags.ScriptTarget.ES2020 } }).outputText)(mod);
  assert.equal(mod.flagForCountryCode('FR'), '🇫🇷');
  assert.equal(mod.flagForCountryCode('NO'), '🇳🇴');
  for (const unknown of ['ZZ', 'XX', '', 'constructor', 'toString', undefined, null]) assert.equal(mod.flagForCountryCode(unknown), undefined, String(unknown));
  // Solo la ventana de ficha: las tarjetas del buscador tienen su propio código y son de la Fase 4.
  const page = source('app/page.tsx');
  const modal = page.slice(page.indexOf('{/* MODAL DESTINO */}'), page.indexOf('{/* MODAL VUELOS */}'));
  assert.ok(modal.length > 1000 && !modal.includes('🇫🇷'), 'the window no longer has a French fallback');
  assert.match(modal, /flagForCountryCode\(selectedCatalogProfile\?\.countryCode\) \?\? ""/);
});
