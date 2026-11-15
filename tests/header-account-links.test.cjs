// Cabecera de la portada en tableta y ordenador: con la sesión iniciada, «Mis viajes» e «Itinerarios» salen en la barra entre
// «Mi cuenta» y «Cerrar sesión» desde 768 px (en los 7 idiomas caben desde 760 px). Cada uno abre la ventana de la cuenta en su
// pestaña. Sin sesión, la barra no cambia.
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

// HeaderAuth con el React ligero de pruebas. Los huecos de useState van por orden: sesión, lista, cerrando, error, ventana, sección.
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

test('«Mis viajes» opens the account window on trips and «Itinerarios» on itineraries, in the seven languages', () => {
  for (const locale of LOCALES) {
    for (const [index, section, Component] of [[1, 'trips', SavedTrips], [2, 'itineraries', SavedItineraries]]) {
      const { render, state } = createHeader(locale, { signedIn: true });
      assert.equal(dialog(render()), undefined, 'closed at the start');
      // Aunque la ventana se hubiera usado antes en la otra pestaña, el botón lleva a la suya.
      state[5] = section === 'trips' ? 'itineraries' : 'trips';
      barButtons(render())[index].props.onClick();
      assert.equal(state[4], true, `${locale} ${section}: window open`);
      assert.equal(state[5], section, `${locale} ${section}: section`);
      const tree = render();
      const win = dialog(tree);
      assert.ok(win, 'the window is drawn');
      const tabs = flatten(win).filter(n => n.props?.role === 'tab');
      assert.deepEqual(tabs.map(tab => [tab.props.id, tab.props['aria-selected']]), [['account-trips-tab', section === 'trips'], ['account-itineraries-tab', section === 'itineraries']], `${locale} ${section}`);
      assert.equal(flatten(win).filter(n => n.type === Component).length, 1, `${locale} ${section}: its list is drawn`);
      assert.equal(flatten(win).filter(n => n.type === (section === 'trips' ? SavedItineraries : SavedTrips)).length, 0, 'and not the other one');
      // La barra sigue ahí tras abrir la ventana.
      assert.equal(barButtons(tree).filter(b => !flatten(win).includes(b)).length, 4);
    }
  }
});

test('«Mi cuenta» still opens the window as before, on the section left selected', () => {
  const { render, state } = createHeader('es', { signedIn: true });
  barButtons(render())[0].props.onClick();
  assert.deepEqual([state[4], state[5]], [true, 'trips']);
});

test('signed out and while checking the session: the bar has no «Mis viajes» or «Itinerarios»', () => {
  for (const locale of LOCALES) {
    const out = createHeader(locale);
    assert.deepEqual(barButtons(out.render()).map(b => text(b)), ['auth.signup', 'auth.signin'].map(key => translations.translate(locale, key)), locale);
    const checking = createHeader(locale, { ready: false });
    assert.deepEqual(barButtons(checking.render()), [], locale);
  }
});

test('the bar keeps «Cerrar sesión» signing out, and the window keeps its tabs', () => {
  const source = read('app/components/HeaderAuth.tsx');
  assert.ok(source.includes('<button type="button" onClick={signOut} disabled={signingOut} className={`${secondaryButton} disabled:opacity-60 max-sm:hidden`}>'));
  assert.ok(source.includes('onClick={() => setAccountSection("trips")}') && source.includes('onClick={() => setAccountSection("itineraries")}'));
  assert.ok(source.includes('function openAccountSection(section: "trips" | "itineraries") {\n    setAccountSection(section);\n    setAccountOpen(true);\n  }'));
});

test('the text of the two buttons is the one of the window tabs, already translated into the seven languages', () => {
  const expected = {
    trips: ['Mis viajes', 'My trips', 'Mes voyages', 'Meine Reisen', 'I miei viaggi', 'As minhas viagens', 'Els meus viatges'],
    itineraries: ['Itinerarios', 'Itineraries', 'Itinéraires', 'Reisepläne', 'Itinerari', 'Roteiros', 'Itineraris'],
  };
  LOCALES.forEach((locale, i) => {
    assert.equal(translations.translate(locale, 'trips.title'), expected.trips[i], locale);
    assert.equal(translations.translate(locale, 'savedItineraries.title'), expected.itineraries[i], locale);
  });
  const source = read('app/components/HeaderAuth.tsx');
  assert.equal(source.split('{t("trips.title")}').length - 1, 2, 'bar + window tab');
  assert.equal(source.split('{t("savedItineraries.title")}').length - 1, 2, 'bar + window tab');
});
