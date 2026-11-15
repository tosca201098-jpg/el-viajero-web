// Cabecera de la portada en el móvil: botón con una persona dibujada que abre una lista con «Crear cuenta» e «Iniciar sesión»
// (o «Mi cuenta» y «Cerrar sesión» si ya se ha entrado) y el cambio de idioma. Desde 640 px (tableta y escritorio) la cabecera
// no cambia: el botón no se ve y los botones y el selector de idioma siguen donde estaban.
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
  const calls = { setLanguage: [], signUp: 0, signIn: 0, account: 0, signOut: 0 };
  const language = { value: locale };
  const languageModule = {
    useLanguage: () => ({
      language: language.value,
      setLanguage: next => { calls.setLanguage.push(next); language.value = next; },
      t: (key, variables) => translations.translate(language.value, key, variables),
      text: value => value,
    }),
  };
  const FlagIcon = function FlagIcon() {};
  const load = loader(root, { react, './LanguageProvider': languageModule, './LanguageSelector': { FlagIcon } }, { React: react });
  const Menu = load('app/components/MobileHeaderMenu.tsx').default;
  const merged = {
    ready: true, signedIn: false, signingOut: false, error: '',
    onSignUp: () => { calls.signUp++; }, onSignIn: () => { calls.signIn++; }, onAccount: () => { calls.account++; }, onSignOut: () => { calls.signOut++; },
    ...props,
  };
  const render = () => { counter.index = 0; return Menu(merged); };
  return { render, calls, state, language, FlagIcon };
}
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);
const trigger = tree => flatten(tree).find(n => n.type === 'button' && n.props['aria-expanded'] !== undefined);
const panel = tree => flatten(tree).find(n => n.props?.role === 'group' && n.props['aria-label']);
const buttons = tree => flatten(panel(tree)).filter(n => n.type === 'button');
const languageButtons = tree => buttons(tree).filter(n => n.props.lang);
const actions = tree => buttons(tree).filter(n => !n.props.lang);
const primary = tree => actions(tree)[0];
const secondary = tree => actions(tree)[1];

test('the button text exists in the seven languages', () => {
  const expected = { es: 'Cuenta e idioma', en: 'Account and language', fr: 'Compte et langue', de: 'Konto und Sprache', it: 'Account e lingua', pt: 'Conta e idioma', ca: 'Compte i idioma' };
  assert.deepEqual(LOCALES, Object.keys(expected));
  for (const code of LOCALES) assert.equal(translations.translate(code, 'header.menu'), expected[code], code);
});

for (const locale of LOCALES) {
  test(`${locale}: the person button starts closed, opens the list and the list has account and language`, () => {
    const menu = createMenu(locale);
    let tree = menu.render();
    const closed = trigger(tree);
    assert.equal(closed.props['aria-label'], translations.translate(locale, 'header.menu'));
    assert.equal(closed.props.title, translations.translate(locale, 'header.menu'));
    assert.equal(closed.props['aria-expanded'], false);
    assert.equal(closed.props['aria-controls'], undefined);
    assert.equal(panel(tree), undefined, 'closed: no list');
    // Una persona dibujada (cabeza y hombros), no tres rayas.
    const icon = flatten(closed).filter(n => ['circle', 'path'].includes(n.type));
    assert.deepEqual(icon.map(n => n.type), ['circle', 'path']);
    assert.ok(!flatten(closed).some(n => n.type === 'path' && /M4 7h16/.test(n.props.d)), 'no three-lines icon');

    closed.props.onClick();
    tree = menu.render();
    assert.equal(trigger(tree).props['aria-expanded'], true);
    assert.equal(trigger(tree).props['aria-controls'], panel(tree).props.id);
    assert.deepEqual(flatten(trigger(tree)).filter(n => ['circle', 'path'].includes(n.type)).map(n => n.props.d ?? n.props.r), icon.map(n => n.props.d ?? n.props.r), 'the same person icon when open');
    // Primero «Crear cuenta» e «Iniciar sesión». Y el selector de idioma con los 7 idiomas.
    assert.deepEqual(actions(tree).map(b => text(b)), [translations.translate(locale, 'auth.signup'), translations.translate(locale, 'auth.signin')]);
    const items = languageButtons(tree);
    assert.deepEqual(items.map(b => b.props.lang), LOCALES);
    assert.deepEqual(items.map(b => text(b)), LABELS);
    assert.deepEqual(items.map(b => b.props['aria-pressed']), LOCALES.map(code => code === locale), 'only the current language is pressed');
    assert.ok(text(tree).includes(translations.translate(locale, 'language.choose')));
    // Cada botón del menú es de al menos 44 px de alto.
    for (const button of buttons(tree)) assert.ok(String(button.props.className).includes('min-h-[44px]'), text(button));
    assert.ok(!text(panel(tree)).includes(translations.translate(locale, 'auth.signout')), 'signed out: no «Cerrar sesión»');
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

const countCalls = menu => ({ signUp: menu.calls.signUp, signIn: menu.calls.signIn, account: menu.calls.account, signOut: menu.calls.signOut, languages: menu.calls.setLanguage.length });

test('«Crear cuenta» opens the sign-up window and closes the list; nothing else is called', () => {
  const menu = createMenu('es');
  trigger(menu.render()).props.onClick();
  primary(menu.render()).props.onClick();
  assert.deepEqual(countCalls(menu), { signUp: 1, signIn: 0, account: 0, signOut: 0, languages: 0 });
  assert.equal(panel(menu.render()), undefined);
});

test('«Iniciar sesión» is inside the list, opens the sign-in window and closes the list; nothing else is called', () => {
  for (const locale of LOCALES) {
    const menu = createMenu(locale);
    trigger(menu.render()).props.onClick();
    const tree = menu.render();
    assert.equal(text(secondary(tree)), translations.translate(locale, 'auth.signin'), locale);
    secondary(tree).props.onClick();
    assert.deepEqual(countCalls(menu), { signUp: 0, signIn: 1, account: 0, signOut: 0, languages: 0 }, locale);
    assert.equal(panel(menu.render()), undefined, 'closes');
  }
});

test('signed in: «Mi cuenta» opens the account window and «Cerrar sesión» signs out, both from the list', () => {
  for (const locale of LOCALES) {
    const menu = createMenu(locale, { signedIn: true });
    trigger(menu.render()).props.onClick();
    const tree = menu.render();
    assert.deepEqual(actions(tree).map(b => text(b)), [translations.translate(locale, 'account.title'), translations.translate(locale, 'auth.signout')], locale);
    assert.ok(!text(panel(tree)).includes(translations.translate(locale, 'auth.signin')), 'no «Iniciar sesión» when signed in');
    assert.ok(!text(panel(tree)).includes(translations.translate(locale, 'auth.signup')), 'no «Crear cuenta» when signed in');
    for (const button of actions(tree)) assert.ok(String(button.props.className).includes('min-h-[44px]'), text(button));
    primary(tree).props.onClick();
    assert.deepEqual(countCalls(menu), { signUp: 0, signIn: 0, account: 1, signOut: 0, languages: 0 }, locale);
    assert.equal(panel(menu.render()), undefined);
  }
});

test('«Cerrar sesión» signs out without closing the list; it shows «Cerrando sesión…» while it works and the error if it fails', () => {
  for (const locale of LOCALES) {
    const menu = createMenu(locale, { signedIn: true });
    trigger(menu.render()).props.onClick();
    secondary(menu.render()).props.onClick();
    assert.deepEqual(countCalls(menu), { signUp: 0, signIn: 0, account: 0, signOut: 1, languages: 0 }, locale);
    assert.ok(panel(menu.render()), 'stays open until the session changes');
    assert.equal(secondary(menu.render()).props.disabled, false);
    // Mientras se cierra la sesión: texto de «cerrando» y botón desactivado.
    const working = createMenu(locale, { signedIn: true, signingOut: true });
    trigger(working.render()).props.onClick();
    assert.equal(text(secondary(working.render())), translations.translate(locale, 'auth.signingOut'), locale);
    assert.equal(secondary(working.render()).props.disabled, true);
    // Si falla: el aviso se ve dentro de la lista.
    const failed = createMenu(locale, { signedIn: true, error: 'No se ha podido cerrar sesión. Inténtalo de nuevo.' });
    trigger(failed.render()).props.onClick();
    const alert = flatten(panel(failed.render())).find(n => n.props?.role === 'alert');
    assert.equal(text(alert), 'No se ha podido cerrar sesión. Inténtalo de nuevo.');
    // Sin error no hay aviso.
    const fine = createMenu(locale, { signedIn: true });
    trigger(fine.render()).props.onClick();
    assert.equal(flatten(panel(fine.render())).find(n => n.props?.role === 'alert'), undefined);
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

test('the list closes by itself when the session changes (just signed in or out)', () => {
  const source = read('app/components/MobileHeaderMenu.tsx');
  assert.ok(source.includes('useEffect(() => {\n    setOpen(false);\n  }, [signedIn]);'));
});

test('the person button is only for mobile: hidden from 640 px, with a 44 px touch area', () => {
  const tree = createMenu('es').render();
  assert.ok(tree.props.className.split(/\s+/).includes('sm:hidden'));
  const classes = trigger(tree).props.className.split(/\s+/);
  for (const token of ['h-11', 'w-11']) assert.ok(classes.includes(token), token);
});

test('HeaderAuth: on mobile the four account buttons of the bar move into the list; from 640 px they stay as they were', () => {
  const source = read('app/components/HeaderAuth.tsx');
  assert.ok(source.includes('import MobileHeaderMenu from "./MobileHeaderMenu";'));
  assert.equal(source.split('<MobileHeaderMenu\n').length - 1, 1);
  for (const wiring of ['ready={ready}', 'signedIn={!!session}', 'signingOut={signingOut}', 'error={error}', 'onSignUp={() => onOpenAuth("signup")}', 'onSignIn={() => onOpenAuth("signin")}', 'onAccount={() => setAccountOpen(true)}', 'onSignOut={signOut}']) {
    assert.ok(source.includes(`        ${wiring}\n`), wiring);
  }
  // Los dos botones azules (Mi cuenta y Crear cuenta) y los dos de texto (Cerrar sesión e Iniciar sesión) se esconden en el móvil…
  assert.equal(source.split('className={`${primaryButton} max-sm:hidden`}').length - 1, 2);
  assert.equal(source.split('className={primaryButton}').length - 1, 0, 'no blue header button is left visible on mobile');
  assert.equal(source.split('className={`${secondaryButton} max-sm:hidden`}').length - 1, 1, 'Iniciar sesión is hidden on mobile');
  assert.equal(source.split('className={`${secondaryButton} disabled:opacity-60 max-sm:hidden`}').length - 1, 1, 'Cerrar sesión is hidden on mobile');
  assert.ok(source.includes('className="max-w-48 text-right text-xs text-red-700 max-sm:hidden"'), 'the sign-out error of the bar is shown inside the list on mobile');
  // …pero siguen donde estaban desde 640 px: ningún botón se esconde por encima del móvil y la ventana de la cuenta no cambia.
  assert.ok(!/(?:^|[\s"`])(?:sm|md|lg|xl):hidden/.test(source), 'nothing is hidden from 640 px');
  assert.ok(source.includes('className={`${secondaryButton} w-full border border-stone-300 disabled:opacity-60`}'), 'the sign-out button inside the account window is untouched');
  // Las constantes de estilo no cambian.
  assert.ok(source.includes('const primaryButton = "whitespace-nowrap max-sm:whitespace-normal max-sm:leading-[14px] max-sm:max-w-[92px] rounded-xl bg-blue-600'));
  assert.ok(source.includes('const secondaryButton = "whitespace-nowrap max-sm:whitespace-normal max-sm:leading-[14px] max-sm:max-w-[92px] rounded-lg px-2 py-1'));
  // El hueco que se reserva mientras se comprueba la sesión solo existe desde 640 px: en el móvil la persona está siempre.
  assert.ok(source.includes('className="h-16 w-28 sm:h-9 sm:w-56 max-sm:hidden"'));
  // Las funciones de la cuenta (ventana, viajes e itinerarios guardados, cerrar sesión) siguen ahí.
  for (const kept of ['<SavedTrips', '<SavedItineraries', 'onClick={signOut}', 'aria-labelledby="account-dialog-title"', 'dialog?.showModal()', 'async function signOut()']) assert.ok(source.includes(kept), kept);
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
