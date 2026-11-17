// Pie de página legal: una línea discreta «Aviso legal · Política de privacidad» al final de todas las páginas (desde app/layout.tsx),
// con el texto de los enlaces en los siete idiomas. No cambia la portada, sus 16 tarjetas ni el diseño de ninguna página.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');

// next/link no está en las herramientas de prueba: se sustituye por un <a href> con los mismos atributos.
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

const translations = makeLoader()('lib/i18n/translations.ts');
const LOCALES = Array.from(translations.locales, l => l.code);
const texts = makeLoader()('lib/legal/footer-texts.ts');
const render = language => {
  const { default: Footer } = makeLoader({ './LanguageProvider': { useLanguage: () => ({ language }) } })('app/components/SiteFooter.tsx');
  return renderToStaticMarkup(React.createElement(Footer));
};
const escape = value => value.replace(/&/g, '&amp;').replace(/'/g, '&#x27;');

test('the footer texts exist in the seven languages with no gaps', () => {
  assert.deepEqual(Array.from(texts.FOOTER_TEXT_ROWS, row => row[0]), ['nav', 'legal', 'privacy']);
  for (const row of texts.FOOTER_TEXT_ROWS) {
    assert.equal(row.length, 1 + LOCALES.length, row[0]);
    for (let i = 1; i < row.length; i++) assert.ok(row[i].trim(), `${row[0]} vacío en ${LOCALES[i - 1]}`);
  }
  assert.equal(texts.footerText('es', 'privacy'), 'Política de privacidad');
  assert.equal(texts.footerText('en', 'legal'), 'Legal notice');
  assert.equal(texts.footerText('de', 'privacy'), 'Datenschutzerklärung');
  assert.equal(texts.footerText('xx', 'legal'), 'Aviso legal', 'sin idioma conocido se usa el español');
});

test('the footer is one discreet line with the two legal links, in the language of the web', () => {
  for (const locale of LOCALES) {
    const html = render(locale);
    assert.equal((html.match(/<footer\b/g) || []).length, 1, locale);
    assert.equal((html.match(/<nav\b/g) || []).length, 1, locale);
    assert.ok(html.includes(`aria-label="${escape(texts.footerText(locale, 'nav'))}"`), `${locale}: nombre accesible de la navegación`);
    const links = Array.from(html.matchAll(/<a\b[^>]*>[^<]*<\/a>/g), m => m[0]);
    assert.equal(links.length, 2, `${locale}: solo dos enlaces`);
    assert.match(links[0], /href="\/aviso-legal"/);
    assert.match(links[1], /href="\/privacidad"/);
    assert.ok(links[0].includes(`>${escape(texts.footerText(locale, 'legal'))}<`), `${locale}: «${texts.footerText(locale, 'legal')}»`);
    assert.ok(links[1].includes(`>${escape(texts.footerText(locale, 'privacy'))}<`), `${locale}: «${texts.footerText(locale, 'privacy')}»`);
    for (const link of links) assert.match(link, /hrefLang="es"/, 'los textos legales están en español');
    assert.match(html, /min-h-\[44px\]/, 'zona de toque cómoda en el móvil');
    assert.doesNotMatch(html, /<button|<img|<input|<script/, 'solo texto y enlaces');
  }
});

test('the footer stays at the end of the page: not fixed, not sticky, no state', () => {
  const source = read('app/components/SiteFooter.tsx');
  assert.doesNotMatch(source, /\bfixed\b|\bsticky\b|\babsolute\b|useState|useEffect|fetch\(/);
  assert.match(source, /text-xs text-stone-600/);
});

test('the layout adds it once, after the content and inside the language provider, and nothing else changes in it', () => {
  const layout = read('app/layout.tsx');
  assert.equal((layout.match(/<SiteFooter \/>/g) || []).length, 1);
  assert.match(layout, /import SiteFooter from '\.\/components\/SiteFooter';/);
  assert.match(layout, /<LanguageProvider>\{children\}<SiteFooter \/><\/LanguageProvider>/);
  assert.doesNotMatch(layout, /privacidad|aviso-legal/, 'el layout solo conoce el componente, no las rutas');
  // Lo demás del layout sigue como estaba (scripts de Travelpayouts y Tavus, metadatos, idioma).
  for (const piece of ['travelpayouts-drive', '@tavus/embed@latest', "html lang=\"es\"", 'siteUrl', 'LanguageProvider']) assert.ok(layout.includes(piece), piece);
});

test('the links point to pages that exist, and the home page and its cards are untouched', () => {
  assert.ok(fs.existsSync(path.join(root, 'app/aviso-legal/page.tsx')));
  assert.ok(fs.existsSync(path.join(root, 'app/privacidad/page.tsx')));
  assert.doesNotMatch(read('app/page.tsx'), /SiteFooter|privacidad|aviso-legal/, 'la portada no se toca');
  assert.doesNotMatch(read('app/sitemap.ts'), /privacidad|aviso-legal/);
});
