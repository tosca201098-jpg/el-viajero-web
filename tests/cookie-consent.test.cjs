// Aviso de cookies: los servicios de terceros (Travelpayouts «drive») solo se cargan si la persona los acepta.
// Antes estaban fijos en app/layout.tsx y se cargaban en todas las páginas sin preguntar.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');
const LinkMock = { __esModule: true, default: ({ href, children, ...rest }) => React.createElement('a', { href, ...rest }, children) };
function makeLoader(extra = {}) {
  const overrides = { 'next/link': LinkMock, ...extra };
  const cache = new Map();
  function resolve(from, id) {
    const base = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(from), id);
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`]) if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    throw new Error(`No se encuentra ${id} desde ${from}`);
  }
  function load(file) {
    const full = path.isAbsolute(file) ? file : path.join(root, file);
    if (cache.has(full)) return cache.get(full).exports;
    const output = ts.transpileModule(fs.readFileSync(full, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const module = { exports: {} };
    cache.set(full, module);
    const localRequire = id => (id in overrides ? overrides[id] : id.startsWith('.') || id.startsWith('@/') ? load(resolve(full, id)) : require(id));
    new Function('exports', 'require', 'module', output)(module.exports, localRequire, module);
    return module.exports;
  }
  return load;
}

const load = makeLoader({ './LanguageProvider': { useLanguage: () => ({ language: 'es' }) } });
const translations = load('lib/i18n/translations.ts');
const LOCALES = Array.from(translations.locales, l => l.code);
const texts = load('lib/consent/texts.ts');
const consent = load('lib/consent/cookies.ts');
const scripts = load('lib/consent/scripts.ts');
const { CookieBanner } = load('app/components/CookieConsent.tsx');
const escape = value => value.replace(/&/g, '&amp;').replace(/'/g, '&#x27;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const memory = (initial = {}) => {
  const data = { ...initial };
  return { getItem: key => (key in data ? data[key] : null), setItem: (key, value) => { data[key] = String(value); }, removeItem: key => { delete data[key]; },
    get length() { return Object.keys(data).length; }, key: index => Object.keys(data)[index] ?? null, data };
};

test('the cookie texts exist in the seven languages with no gaps, and each language says what it is', () => {
  assert.deepEqual(Array.from(texts.COOKIE_TEXT_ROWS, row => row[0]), ['title', 'body', 'accept', 'reject', 'more', 'footer']);
  for (const row of texts.COOKIE_TEXT_ROWS) {
    assert.equal(row.length, 1 + LOCALES.length, row[0]);
    for (let i = 1; i < row.length; i++) assert.ok(row[i].trim(), `${row[0]} vacío en ${LOCALES[i - 1]}`);
  }
  for (const locale of LOCALES) {
    assert.match(texts.cookieText(locale, 'body'), /Travelpayouts/, locale);
    if (locale !== 'es') assert.notEqual(texts.cookieText(locale, 'body'), texts.cookieText('es', 'body'), `${locale}: traducido`);
    assert.notEqual(texts.cookieText(locale, 'accept'), texts.cookieText(locale, 'reject'), locale);
  }
  assert.equal(texts.cookieText('xx', 'accept'), 'Aceptar', 'sin idioma conocido se usa el español');
});

test('the banner shows the text, an equal Accept and Reject, and a link to the cookie section, in every language', () => {
  for (const locale of LOCALES) {
    const html = renderToStaticMarkup(React.createElement(CookieBanner, { language: locale }));
    assert.ok(html.includes(escape(texts.cookieText(locale, 'title'))), `${locale}: título`);
    assert.ok(html.includes(escape(texts.cookieText(locale, 'body'))), `${locale}: texto`);
    const buttons = Array.from(html.matchAll(/<button\b([^>]*)>([^<]*)<\/button>/g));
    assert.equal(buttons.length, 2, `${locale}: dos botones`);
    const [reject, accept] = buttons;
    assert.match(reject[1], /data-cookie-reject/); assert.match(accept[1], /data-cookie-accept/);
    assert.equal(reject[2], escape(texts.cookieText(locale, 'reject'))); assert.equal(accept[2], escape(texts.cookieText(locale, 'accept')));
    const classOf = attrs => (attrs.match(/class="([^"]*)"/) || [])[1];
    assert.equal(classOf(reject[1]), classOf(accept[1]), `${locale}: Rechazar y Aceptar con el mismo aspecto y tamaño`);
    assert.match(classOf(accept[1]), /min-h-\[44px\]/, `${locale}: zona de toque cómoda`);
    assert.match(html, /<a [^>]*href="\/privacidad#cookies"/, `${locale}: enlace a la política`);
    assert.match(html, /role="region"/);
  }
});

test('nothing is decided until the person decides: no stored choice means no third-party service', () => {
  assert.equal(consent.readConsent(memory()), null);
  assert.equal(consent.readConsent(undefined), null);
  for (const bad of ['', 'no es json', 'null', '{}', '{"v":99,"thirdParty":true,"at":"x"}', '{"v":1,"thirdParty":"si","at":"x"}', '{"v":1,"thirdParty":true}']) {
    assert.equal(consent.readConsent(memory({ [consent.CONSENT_KEY]: bad })), null, bad);
  }
});

test('accepting and rejecting are stored with the date and the text version, and read back', () => {
  const store = memory();
  const accepted = consent.writeConsent(store, true, new Date('2026-11-21T12:00:00Z'));
  assert.deepEqual({ ...accepted }, { v: consent.CONSENT_VERSION, thirdParty: true, at: '2026-11-21T12:00:00.000Z' });
  assert.deepEqual({ ...consent.readConsent(store) }, { ...accepted });
  consent.writeConsent(store, false, new Date('2026-11-22T08:00:00Z'));
  assert.equal(consent.readConsent(store).thirdParty, false);
  assert.deepEqual(Object.keys(store.data), [consent.CONSENT_KEY], 'solo se guarda la decisión');
  assert.doesNotThrow(() => consent.writeConsent({ setItem() { throw new Error('bloqueado'); } }, true));
});

test('the third-party scripts are added only by loadThirdPartyScripts, once each, and never by the layout', () => {
  const makeDoc = () => {
    const nodes = [];
    return { nodes, getElementById: id => nodes.find(node => node.id === id) ?? null,
      createElement: () => { const attrs = {}; return { id: '', src: '', async: false, attrs, setAttribute(name, value) { attrs[name] = value; } }; },
      head: { appendChild: node => nodes.push(node) } };
  };
  const doc = makeDoc();
  assert.equal(doc.nodes.length, 0, 'antes de aceptar no hay ningún script');
  assert.deepEqual(Array.from(scripts.loadThirdPartyScripts(doc)), ['travelpayouts-drive']);
  assert.deepEqual(Array.from(scripts.loadThirdPartyScripts(doc)), [], 'no se duplican');
  assert.equal(doc.nodes.length, 1);
  assert.equal(doc.nodes[0].src, 'https://emrldco.com/NTg2MDI1.js?t=586025'); assert.equal(doc.nodes[0].attrs['data-cmp-ab'], '2');
  assert.ok(doc.nodes.every(node => node.async === true));
  const layout = read('app/layout.tsx');
  for (const piece of ['emrldco.com', 'unpkg.com', 'next/script', '<Script']) assert.ok(!layout.includes(piece), `${piece}: no fijo en el layout`);
  assert.equal((layout.match(/<CookieConsent \/>/g) || []).length, 1);
});

test('the component loads the scripts only after a stored acceptance or a click on Accept', () => {
  const source = read('app/components/CookieConsent.tsx');
  const calls = Array.from(source.matchAll(/loadThirdPartyScripts\(/g)).length;
  assert.equal(calls, 2, 'solo en dos sitios: consentimiento ya guardado y botón Aceptar');
  assert.match(source, /else if \(consent\.thirdParty\) loadThirdPartyScripts/);
  assert.match(source, /if \(thirdParty\) \{ loadThirdPartyScripts\(document as never\); return; \}/);
  assert.match(source, /if \(!open\) return null;/, 'nada en el servidor ni sin aviso abierto: la hidratación no se descuadra');
});

test('rejecting wipes the known traces of those services on this site and nothing else', () => {
  const jar = { cookie: 'tpwl_locale=es; _sp_id.4a2a=x; bb-session-2=1; am_user_session=2; sb-access-token=keep; other=1', location: { hostname: 'destinauta.com' } };
  const writes = [];
  const doc = { get cookie() { return jar.cookie; }, set cookie(value) { writes.push(value); const name = value.split('=')[0]; jar.cookie = jar.cookie.split('; ').filter(c => c.split('=')[0] !== name).join('; '); }, location: jar.location };
  const local = memory({ 'el-viajero.language': 'es', __wlcc: '1', __wlsh: '2', snowplowOutQueue_sp: '[]', [consent.CONSENT_KEY]: '{}' });
  const session = memory({ __wlrt: '1', __wlft: '2', prevLang: 'es' });
  const removed = consent.clearThirdPartyTraces(doc, local, session);
  assert.deepEqual(removed.sort(), ['__wlcc', '__wlft', '__wlrt', '__wlsh', '_sp_id.4a2a', 'am_user_session', 'bb-session-2', 'snowplowOutQueue_sp', 'tpwl_locale']);
  assert.equal(doc.cookie, 'sb-access-token=keep; other=1', 'las demás cookies siguen');
  assert.deepEqual(Object.keys(local.data).sort(), [consent.CONSENT_KEY, 'el-viajero.language'].sort(), 'el idioma y la decisión se conservan');
  assert.deepEqual(Object.keys(session.data), ['prevLang']);
  assert.ok(writes.every(entry => /expires=Thu, 01 Jan 1970/.test(entry)));
  assert.ok(writes.some(entry => /domain=\.destinauta\.com/.test(entry)), 'también en el dominio con punto');
  assert.deepEqual(consent.clearThirdPartyTraces(undefined, undefined, undefined), []);
});

test('the footer reopens the banner, and the privacy page explains the cookies at #cookies', () => {
  const footer = read('app/components/SiteFooter.tsx');
  assert.match(footer, /OPEN_CONSENT_EVENT/); assert.match(footer, /data-cookie-settings/);
  assert.match(read('app/components/CookieConsent.tsx'), /addEventListener\(OPEN_CONSENT_EVENT/);
  const privacy = read('app/privacidad/page.tsx');
  assert.match(privacy, /<section id="cookies">/);
  for (const piece of ['Imprescindibles', 'Travelpayouts', 'Stay22', 'Cookies']) assert.ok(privacy.includes(piece), piece);
  assert.doesNotMatch(read('app/page.tsx'), /CookieConsent|cookie-consent/, 'la portada y sus 16 tarjetas no se tocan');
});
