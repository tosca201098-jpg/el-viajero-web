// Cabecera de la portada en el móvil: menú de las 3 rayas (☰) con «Crear cuenta» (o «Mi cuenta») y el cambio de idioma.
// «Iniciar sesión» (o «Cerrar sesión») se queda fuera, en la cabecera, como estaba. Desde 640 px (tableta y escritorio) la
// cabecera no cambia: el menú no se ve y los botones y el selector de idioma siguen donde estaban.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loader, flatten } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const translations = loader(root)('lib/i18n/translations.ts');
// Los datos del módulo cargado vienen de otro «mundo» de vm: se copian a matrices normales para poder compararlos.
const LOCALES = Array.from(translations.locales, l => l.code);
const LABELS = Array.from(translations.locales, l => l.label);

// React ligero de pruebas, con useId además de useState/useRef/useEffect.
function createMenu(locale, props) {
  const state = [], counter = { index: 0 };
  const react = {
    createElement: (type, p, ...children) => ({ type, props: p ?? {}, children: children.flat(Infinity) }),
    useState(initial) {
      const slot = counter.index++;
      if (!(slot in state)) state[slot] = typeof initial === 'function' ? initial() : initial;
      return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }];
    },
    useRef: initial => ({ current: initial }),
    useEffect: () => {},
    useId: () => ':r0:',
  };
  const calls = { setLanguage: [], signUp: 0, account: 0 };
  const language = { value: locale };
  const languageModule = {
    useLanguage: () => ({
      language: language.value,
      setLanguage: next => { calls.setLanguage.push(next); language.value = next; },
      t: (key, variables) => translations.translate(language.value, key, variables),
    }),
  };
  const FlagIcon = function FlagIcon() {};
  const load = loader(root, { react, './LanguageProvider': languageModule, './LanguageSelector': { FlagIcon } }, { React: react });
  const Menu = load('app/components/MobileHeaderMenu.tsx').default;
  const merged = { ready: true, signedIn: false, onSignUp: () => { calls.signUp++; }, onAccount: () => { calls.account++; }, ...props };
  const render = () => { counter.index = 0; return Menu(merged); };
  return { render, calls, state, language, FlagIcon };
}
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);
const trigger = tree => flatten(tree).find(n => n.type === 'button' && n.props['aria-expanded'] !== undefined);
const panel = tree => flatten(tree).find(n => n.props?.role === 'group' && n.props['aria-label']);
const buttons = tree => flatten(panel(tree)).filter(n => n.type === 'button');
const languageButtons = tree => buttons(tree).filter(n => n.props.lang);
const primary = tree => buttons(tree).find(n => !n.props.lang);

test('the menu text exists in the seven languages', () => {
  const expected = { es: 'Menú', en: 'Menu', fr: 'Menu', de: 'Menü', it: 'Menu', pt: 'Menu', ca: 'Menú' };
  assert.deepEqual(LOCALES, Object.keys(expected));
  for (const code of LOCALES) assert.equal(translations.translate(code, 'header.menu'), expected[code], code);
});

for (const locale of LOCALES) {
  test(`${locale}: the ☰ button starts closed, opens the list and the list has account and language`, () => {
    const menu = createMenu(locale);
    let tree = menu.render();
    const closed = trigger(tree);
    assert.equal(closed.props['aria-label'], translations.translate(locale, 'header.menu'));
    assert.equal(closed.props.title, translations.translate(locale, 'header.menu'));
    assert.equal(closed.props['aria-expanded'], false);
    assert.equal(closed.props['aria-controls'], undefined);
    assert.equal(panel(tree), undefined, 'closed: no list');
    // Tres rayas cuando está cerrado.
    assert.equal(flatten(closed).find(n => n.type === 'path').props.d, 'M4 7h16M4 12h16M4 17h16');

    closed.props.onClick();
    tree = menu.render();
    assert.equal(trigger(tree).props['aria-expanded'], true);
    assert.equal(trigger(tree).props['aria-controls'], panel(tree).props.id);
    assert.equal(flatten(trigger(tree)).find(n => n.type === 'path').props.d, 'M6 6l12 12M18 6L6 18', 'a cross when open');
    // Primer elemento: «Crear cuenta». Y el selector de idioma con los 7 idiomas.
    assert.equal(text(primary(tree)), translations.translate(locale, 'auth.signup'));
    const items = languageButtons(tree);
    assert.deepEqual(items.map(b => b.props.lang), LOCALES);
    assert.deepEqual(items.map(b => text(b)), LABELS);
    assert.deepEqual(items.map(b => b.props['aria-pressed']), LOCALES.map(code => code === locale), 'only the current language is pressed');
    assert.ok(text(tree).includes(translations.translate(locale, 'language.choose')));
    // Cada botón del menú es de al menos 44 px de alto.
    for (const button of buttons(tree)) assert.ok(String(button.props.className).includes('min-h-[44px]'), text(button));
    // «Iniciar sesión» NO está en el menú: se queda fuera, en la cabecera.
    assert.ok(!text(panel(tree)).includes(translations.translate(locale, 'auth.signin')));
    assert.ok(!text(panel(tree)).includes(translations.translate(locale, 'auth.signout')));
  });
}

test('choosing a language changes it and closes the list; every language can be chosen', () => {
  for (const from of LOCALES) for (const to of LOCALES) {
    const menu = createMenu(from);
    trigger(menu.render()).props.onClick();
    const item = languageButtons(menu.render()).find(b => b.props.lang === to);
    item.props.onClick();
    assert.deepEqual(menu.calls.setLanguage, [to], `${from} → ${to}`);
    assert.equal(panel(menu.render()), undefined, 'closes after choosing');
    assert.equal(trigger(menu.render()).props['aria-label'], translations.translate(to, 'header.menu'), 'the button already speaks the new language');
  }
});

test('«Crear cuenta» opens the sign-up window and closes the list; nothing else is called', () => {
  const menu = createMenu('es');
  trigger(menu.render()).props.onClick();
  primary(menu.render()).props.onClick();
  assert.deepEqual({ signUp: menu.calls.signUp, account: menu.calls.account, languages: menu.calls.setLanguage.length }, { signUp: 1, account: 0, languages: 0 });
  assert.equal(panel(menu.render()), undefined);
});

test('signed in: the first button is «Mi cuenta» and opens the account window', () => {
  for (const locale of LOCALES) {
    const menu = createMenu(locale, { signedIn: true });
    trigger(menu.render()).props.onClick();
    const tree = menu.render();
    assert.equal(text(primary(tree)), translations.translate(locale, 'account.title'), locale);
    primary(tree).props.onClick();
    assert.deepEqual({ signUp: menu.calls.signUp, account: menu.calls.account }, { signUp: 0, account: 1 }, locale);
    assert.equal(panel(menu.render()), undefined);
  }
});

test('while the session is being checked the list only offers the language', () => {
  const menu = createMenu('es', { ready: false });
  trigger(menu.render()).props.onClick();
  const tree = menu.render();
  assert.equal(primary(tree), undefined);
  assert.equal(languageButtons(tree).length, 7);
});

test('Escape and leaving the menu close it; moving inside it does not', () => {
  const menu = createMenu('es');
  const container = () => menu.render();
  trigger(container()).props.onClick();
  const root = container();
  let prevented = 0;
  root.props.onBlur({ currentTarget: { contains: () => true }, relatedTarget: {} });
  assert.ok(panel(container()), 'focus moves inside: stays open');
  root.props.onKeyDown({ key: 'Enter', preventDefault() { prevented++; } });
  assert.ok(panel(container()), 'other keys do nothing');
  root.props.onKeyDown({ key: 'Escape', preventDefault() { prevented++; } });
  assert.equal(panel(container()), undefined, 'Escape closes');
  assert.equal(prevented, 1);
  trigger(container()).props.onClick();
  container().props.onBlur({ currentTarget: { contains: () => false }, relatedTarget: null });
  assert.equal(panel(container()), undefined, 'focus leaves: closes');
  // Con el menú cerrado, Escape no hace nada (no se traga la tecla).
  prevented = 0;
  container().props.onKeyDown({ key: 'Escape', preventDefault() { prevented++; } });
  assert.equal(prevented, 0);
});

test('the ☰ button is only for mobile: hidden from 640 px, with a 44 px touch area', () => {
  const tree = createMenu('es').render();
  assert.ok(tree.props.className.split(/\s+/).includes('sm:hidden'));
  const classes = trigger(tree).props.className.split(/\s+/);
  for (const token of ['h-11', 'w-11']) assert.ok(classes.includes(token), token);
});

test('HeaderAuth: only the blue account button moves to the menu on mobile; «Iniciar sesión» / «Cerrar sesión» stay in the header', () => {
  const source = read('app/components/HeaderAuth.tsx');
  assert.ok(source.includes('import MobileHeaderMenu from "./MobileHeaderMenu";'));
  assert.equal(source.split('<MobileHeaderMenu ').length - 1, 1);
  assert.ok(source.includes('<MobileHeaderMenu ready={ready} signedIn={!!session} onSignUp={() => onOpenAuth("signup")} onAccount={() => setAccountOpen(true)} />'));
  // Los dos botones azules de la cabecera (Mi cuenta y Crear cuenta) se esconden en el móvil…
  assert.equal(source.split('className={`${primaryButton} max-sm:hidden`}').length - 1, 2);
  assert.equal(source.split('className={primaryButton}').length - 1, 0, 'no blue header button is left visible on mobile');
  // …y los de «Cerrar sesión» e «Iniciar sesión» no: ni la cabecera ni la ventana de la cuenta los esconden.
  assert.equal(source.split('className={`${secondaryButton} max-sm:min-h-[44px] max-sm:py-2`}').length - 1, 1, 'Iniciar sesión keeps its mobile classes');
  assert.equal(source.split('className={`${secondaryButton} disabled:opacity-60 max-sm:min-h-[44px] max-sm:py-2`}').length - 1, 1, 'Cerrar sesión keeps its mobile classes');
  assert.ok(source.includes('className={`${secondaryButton} w-full border border-stone-300 disabled:opacity-60`}'), 'the sign-out button inside the account window is untouched');
  assert.ok(!/secondaryButton[^`]*max-sm:hidden/.test(source), 'no secondary button is hidden');
  // Las constantes de estilo no cambian.
  assert.ok(source.includes('const primaryButton = "whitespace-nowrap max-sm:whitespace-normal max-sm:leading-[14px] max-sm:max-w-[92px] rounded-xl bg-blue-600'));
  // El hueco que se reserva mientras se comprueba la sesión ya no es el de dos botones.
  assert.ok(source.includes('className="h-16 w-28 sm:h-9 sm:w-56 max-sm:h-11 max-sm:w-24"'));
  // Las funciones de la cuenta (ventana, viajes e itinerarios guardados, cerrar sesión) siguen ahí.
  for (const kept of ['<SavedTrips', '<SavedItineraries', 'onClick={signOut}', 'aria-labelledby="account-dialog-title"', 'dialog?.showModal()']) assert.ok(source.includes(kept), kept);
});

test('home header: the loose language selector is hidden on mobile only; the rest of the bar is untouched', () => {
  const page = read('app/page.tsx');
  const nav = page.slice(page.indexOf('{/* NAVEGACIÓN */}'), page.indexOf('{/* PORTADA */}'));
  assert.ok(nav.includes('<div className="relative z-10 shrink-0 rounded-full bg-white/80 ring-1 ring-blue-600/50 shadow-sm max-sm:hidden">\n              <LanguageSelector />'));
  assert.equal(nav.split('max-sm:hidden').length - 1, 1);
  assert.ok(nav.includes('<HeaderAuth onOpenAuth={setAuthMode} />'));
  assert.ok(nav.includes('max-sm:min-h-[44px] max-sm:text-sm'), 'the 44 px logo from the previous PR');
  assert.ok(nav.includes('max-sm:px-3 max-sm:py-1.5'));
  // Las demás páginas siguen usando el selector de idioma tal cual.
  assert.ok(read('app/hoteles/HotelsSearch.tsx').includes('<LanguageSelector />'));
  assert.ok(read('app/viajes-baratos/[mes]/MonthlyDestinations.tsx').includes('<LanguageSelector />'));
});

test('the language selector keeps working as before and now also exports its flags', () => {
  const source = read('app/components/LanguageSelector.tsx');
  assert.ok(source.includes('export function FlagIcon({ locale }: { locale: Locale }) {'));
  assert.ok(source.includes('export default function LanguageSelector() {'));
  assert.ok(source.includes('role="menuitemradio"'));
});
