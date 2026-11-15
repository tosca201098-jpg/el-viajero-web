// Cabecera de la portada con la sesión iniciada: «Mis viajes» e «Itinerarios» salen en la barra entre «Mi cuenta» y «Cerrar sesión»
// desde 768 px (en los 7 idiomas caben desde 760 px) y, en el móvil, en la lista de la persona. Cada uno abre su propia ventana,
// solo con su lista (viajes guardados o itinerarios guardados); «Mi cuenta» abre su ventana con el correo y «Cerrar sesión» (ya no
// lleva las pestañas de viajes e itinerarios, que tienen su propio acceso). Sin sesión, la barra no cambia.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loader, flatten } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const translations = loader(root)('lib/i18n/translations.ts');
const LOCALES = Array.from(translations.locales, l => l.code);

const SavedTrips = function SavedTrips() {};
const SavedItineraries = function SavedItineraries() {};
const MobileHeaderMenu = function MobileHeaderMenu() {};

// HeaderAuth con el React ligero de pruebas. Los huecos de useState van por orden: sesión (0), lista (1), cerrando (2), error (3),
// ventana abierta (4) y lista única de «Mis viajes» / «Itinerarios» (5; null = ventana de «Mi cuenta»).
function createHeader(locale, { signedIn = false, ready = true } = {}) {
  const state = [], counter = { index: 0 };
  const react = {
    Fragment: 'Fragment',
    createElement: (type, p, ...children) => ({ type, props: p ?? {}, children: children.flat(Infinity) }),
    useState(initial) {
      const slot = counter.index++;
      if (!(slot in state)) state[slot] = typeof initial === 'function' ? initial() : initial;
      return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }];
    },
    useRef: initial => ({ current: initial }),
    useEffect: () => {},
  };
  if (signedIn) state[0] = { user: { id: 'user-1', email: 'viajero@example.com' } };
  state[1] = ready;
  const language = { useLanguage: () => ({ language: locale, t: (key, variables) => translations.translate(locale, key, variables), text: value => value }) };
  const load = loader(root, {
    react, './LanguageProvider': language, '@/lib/supabase/client': { getSupabaseClient: () => { throw new Error('no Supabase in tests'); } },
    // Con __esModule el «import X from» recibe la función tal cual (si no, TypeScript la envuelve).
    './SavedTrips': { __esModule: true, default: SavedTrips }, './SavedItineraries': { __esModule: true, default: SavedItineraries },
    './MobileHeaderMenu': { __esModule: true, default: MobileHeaderMenu },
  }, { React: react });
  const Header = load('app/components/HeaderAuth.tsx').default;
  const render = () => { counter.index = 0; return Header({ onOpenAuth: () => {} }); };
  return { render, state };
}
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);
const classes = button => String(button.props.className).split(/\s+/);
const barButtons = tree => flatten(tree).filter(n => n.type === 'button');
const dialog = tree => flatten(tree).find(n => n.type === 'dialog');
const nodes = (tree, test) => flatten(tree).filter(n => n && typeof n === 'object' && test(n));
const buttonsIn = tree => nodes(tree, n => n.type === 'button');

test('signed in: «Mi cuenta», «Mis viajes», «Itinerarios» and «Cerrar sesión», in that order, in the seven languages', () => {
  for (const locale of LOCALES) {
    const { render } = createHeader(locale, { signedIn: true });
    const labels = barButtons(render()).map(b => text(b));
    assert.deepEqual(labels, ['account.title', 'trips.title', 'savedItineraries.title', 'auth.signout'].map(key => translations.translate(locale, key)), locale);
  }
});

test('the two new buttons appear from 768 px; «Mi cuenta» and «Cerrar sesión» keep their 640 px rule', () => {
  const { render } = createHeader('es', { signedIn: true });
  const [account, trips, itineraries, signOut] = barButtons(render());
  for (const button of [trips, itineraries]) {
    assert.ok(classes(button).includes('max-md:hidden'), 'hidden below 768 px');
    assert.ok(!classes(button).includes('max-sm:hidden') && !classes(button).includes('md:hidden') && !classes(button).includes('sm:hidden'), 'nothing else hides it');
    assert.ok(classes(button).includes('sm:text-sm') && classes(button).includes('text-stone-700'), 'same look as «Cerrar sesión»');
  }
  assert.ok(classes(account).includes('max-sm:hidden'));
  assert.ok(classes(signOut).includes('max-sm:hidden'));
  assert.ok(!classes(account).includes('max-md:hidden') && !classes(signOut).includes('max-md:hidden'));
});

test('«Mis viajes» opens a window with only the saved trips and «Itinerarios» one with only the saved itineraries, in the seven languages', () => {
  for (const locale of LOCALES) {
    for (const [index, section, Component, Other, title] of [[1, 'trips', SavedTrips, SavedItineraries, 'trips.title'], [2, 'itineraries', SavedItineraries, SavedTrips, 'savedItineraries.title']]) {
      const { render, state } = createHeader(locale, { signedIn: true });
      assert.equal(dialog(render()), undefined, 'closed at the start');
      barButtons(render())[index].props.onClick();
      assert.equal(state[4], true, `${locale} ${section}: window open`);
      assert.equal(state[5], section, `${locale} ${section}: its own window`);
      const tree = render();
      const win = dialog(tree);
      assert.ok(win, 'the window is drawn');
      // Título propio, no el de «Mi cuenta», y enlazado con la ventana.
      const heading = nodes(win, n => n.type === 'h2');
      assert.equal(heading.length, 1);
      assert.equal(text(heading[0]), translations.translate(locale, title), `${locale} ${section}: title`);
      assert.equal(win.props['aria-labelledby'], heading[0].props.id);
      // Solo su lista: sin pestañas, sin correo, sin cerrar sesión y sin la otra lista.
      assert.equal(nodes(win, n => n.props?.role === 'tab' || n.props?.role === 'tablist' || n.props?.role === 'tabpanel').length, 0, 'no tabs');
      assert.equal(nodes(win, n => n.type === Component).length, 1, `${locale} ${section}: its list is drawn`);
      assert.equal(nodes(win, n => n.type === Other).length, 0, 'and not the other one');
      assert.ok(!text(win).includes('viajero@example.com'), 'no e-mail box');
      assert.ok(!text(win).includes(translations.translate(locale, 'auth.signout')), 'no sign-out button');
      assert.ok(!text(win).includes(translations.translate(locale, 'account.title')), 'not the «Mi cuenta» window');
      // Solo queda un botón: cerrar.
      const buttons = buttonsIn(win);
      assert.equal(buttons.length, 1);
      assert.equal(buttons[0].props['aria-label'], translations.translate(locale, 'common.close'));
      // La barra sigue ahí tras abrir la ventana.
      assert.equal(barButtons(tree).filter(b => !flatten(win).includes(b)).length, 4);
      // Cerrar cierra la ventana.
      buttons[0].props.onClick();
      assert.equal(state[4], false);
      assert.equal(dialog(render()), undefined);
    }
  }
});

test('the window of «Itinerarios» is wide and the one of «Mis viajes» narrow, as the lists were inside «Mi cuenta»', () => {
  for (const [index, wide] of [[1, false], [2, true]]) {
    const { render } = createHeader('es', { signedIn: true });
    barButtons(render())[index].props.onClick();
    const names = classes(dialog(render()));
    assert.equal(names.includes('max-w-3xl'), wide);
    assert.equal(names.includes('max-w-md'), !wide);
  }
});

test('«Mi cuenta» opens its window with the e-mail and «Cerrar sesión» only: no tabs and no lists', () => {
  for (const locale of LOCALES) {
    const { render, state } = createHeader(locale, { signedIn: true });
    barButtons(render())[0].props.onClick();
    assert.deepEqual([state[4], state[5]], [true, null]);
    const win = dialog(render());
    const heading = nodes(win, n => n.type === 'h2');
    assert.equal(heading.length, 1);
    assert.equal(text(heading[0]), translations.translate(locale, 'account.title'));
    assert.equal(win.props['aria-labelledby'], heading[0].props.id);
    assert.ok(text(win).includes(translations.translate(locale, 'auth.email')) && text(win).includes('viajero@example.com'), 'shows the e-mail');
    assert.equal(nodes(win, n => n.props?.role === 'tab' || n.props?.role === 'tablist' || n.props?.role === 'tabpanel').length, 0, 'no tabs');
    assert.equal(nodes(win, n => n.type === SavedTrips || n.type === SavedItineraries).length, 0, 'no lists inside «Mi cuenta»');
    // Dos botones: cerrar (×) y cerrar sesión.
    const buttons = buttonsIn(win);
    assert.deepEqual(buttons.map(b => b.props['aria-label'] ?? text(b)), [translations.translate(locale, 'common.close'), translations.translate(locale, 'auth.signout')]);
    assert.equal(typeof buttons[1].props.onClick, 'function');
    assert.ok(classes(dialog(render())).includes('max-w-md'));
  }
});

test('after a list window, «Mi cuenta» goes back to its own window', () => {
  const { render, state } = createHeader('es', { signedIn: true });
  barButtons(render())[2].props.onClick();
  assert.equal(state[5], 'itineraries');
  buttonsIn(dialog(render()))[0].props.onClick();
  barButtons(render())[0].props.onClick();
  assert.deepEqual([state[4], state[5]], [true, null]);
  const win = dialog(render());
  assert.equal(text(nodes(win, n => n.type === 'h2')[0]), translations.translate('es', 'account.title'));
  assert.equal(nodes(win, n => n.type === SavedItineraries).length, 0);
});

test('on mobile, the person list opens the same three windows: «Mi cuenta» with the e-mail, «Mis viajes» and «Itinerarios» each with its list', () => {
  const { render, state } = createHeader('es', { signedIn: true });
  const menu = () => nodes(render(), n => n.type === MobileHeaderMenu)[0];
  assert.equal(menu().props.signedIn, true);
  menu().props.onAccountSection('trips');
  assert.deepEqual([state[4], state[5]], [true, 'trips']);
  assert.equal(nodes(dialog(render()), n => n.type === SavedTrips).length, 1);
  assert.equal(nodes(dialog(render()), n => n.props?.role === 'tablist').length, 0);
  state[4] = false;
  menu().props.onAccountSection('itineraries');
  assert.deepEqual([state[4], state[5]], [true, 'itineraries']);
  assert.equal(nodes(dialog(render()), n => n.type === SavedItineraries).length, 1);
  assert.equal(nodes(dialog(render()), n => n.type === SavedTrips).length, 0);
  state[4] = false;
  menu().props.onAccount();
  assert.deepEqual([state[4], state[5]], [true, null]);
  assert.equal(text(nodes(dialog(render()), n => n.type === 'h2')[0]), translations.translate('es', 'account.title'));
  assert.equal(nodes(dialog(render()), n => n.type === SavedTrips || n.type === SavedItineraries).length, 0);
});

test('signed out and while checking the session: the bar has no «Mis viajes» or «Itinerarios»', () => {
  for (const locale of LOCALES) {
    const out = createHeader(locale);
    assert.deepEqual(barButtons(out.render()).map(b => text(b)), ['auth.signup', 'auth.signin'].map(key => translations.translate(locale, key)), locale);
    const checking = createHeader(locale, { ready: false });
    assert.deepEqual(barButtons(checking.render()), [], locale);
  }
});

test('the bar keeps «Cerrar sesión» signing out, and «Mi cuenta» keeps its sign-out button', () => {
  const source = read('app/components/HeaderAuth.tsx');
  assert.ok(source.includes('<button type="button" onClick={signOut} disabled={signingOut} className={`${secondaryButton} disabled:opacity-60 max-sm:hidden`}>'));
  assert.ok(!source.includes('role="tab') && !source.includes('accountSection'), '«Mi cuenta» has no tabs any more');
  assert.ok(source.includes('function openAccountSection(section: "trips" | "itineraries") {\n    setOnlySection(section);\n    setAccountOpen(true);\n  }'));
  assert.ok(source.includes('function openAccount() {\n    setOnlySection(null);\n    setAccountOpen(true);\n  }'));
  assert.ok(source.includes('<button type="button" onClick={openAccount} className={`${primaryButton} max-sm:hidden`}>'));
  assert.ok(source.includes('        onAccount={openAccount}\n        onAccountSection={openAccountSection}\n'));
  // El nuevo estado va después de los que ya había: los huecos de useState no se mueven.
  const hooks = Array.from(source.matchAll(/const \[(\w+), \w+\] = useState/g), m => m[1]);
  assert.deepEqual(hooks, ['session', 'ready', 'signingOut', 'error', 'accountOpen', 'onlySection']);
});

test('the text of the two buttons is the one of their windows, already translated into the seven languages', () => {
  const expected = {
    trips: ['Mis viajes', 'My trips', 'Mes voyages', 'Meine Reisen', 'I miei viaggi', 'As minhas viagens', 'Els meus viatges'],
    itineraries: ['Itinerarios', 'Itineraries', 'Itinéraires', 'Reisepläne', 'Itinerari', 'Roteiros', 'Itineraris'],
  };
  LOCALES.forEach((locale, i) => {
    assert.equal(translations.translate(locale, 'trips.title'), expected.trips[i], locale);
    assert.equal(translations.translate(locale, 'savedItineraries.title'), expected.itineraries[i], locale);
  });
  const source = read('app/components/HeaderAuth.tsx');
  // Barra + título de su propia ventana.
  assert.equal(source.split('t("trips.title")').length - 1, 2, 'bar + its own window title');
  assert.equal(source.split('t("savedItineraries.title")').length - 1, 2, 'bar + its own window title');
});
