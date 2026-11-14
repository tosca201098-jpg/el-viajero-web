// Portada: «Dónde viajar según la temporada» como cuatro tarjetas con foto de fondo (PR #74).
// - Cada tarjeta es un enlace normal a la misma página de temporada de siempre.
// - Nombre, frase y «Ver destinos» existen en los siete idiomas (ninguno cae en otro idioma ni en la clave).
// - La foto de cada tarjeta es la misma que ya usa su página de temporada.
// - La portada usa el componente nuevo y ya no tiene los cuatro botones con emoji.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const helpers = require('./helpers/ficha-snapshots.cjs');
const { LOCALES, flatten, loader, makeReact } = helpers;

const root = path.resolve(__dirname, '..');
const SEASONS = ['primavera', 'verano', 'otono', 'invierno'];
const KEYS = ['season.spring', 'season.summer', 'season.autumn', 'season.winter'];
const TAGLINES = ['season.springTagline', 'season.summerTagline', 'season.autumnTagline', 'season.winterTagline'];
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join(' ') : typeof n === 'object' ? text(n.children) : String(n);

function render(locale) {
  const dictionaries = loader(root)('lib/i18n/translations.ts');
  const react = makeReact([], { index: 0, sets: [] });
  const language = { useLanguage: () => ({ language: locale, t: (key, values) => dictionaries.translate(locale, key, values) }) };
  const SeasonCards = loader(root, { react, '@/app/components/LanguageProvider': language }, { React: react })('app/components/SeasonCards.tsx').default;
  return { tree: SeasonCards(), dictionaries };
}

test('each season card is a plain link to its season page, with a background photo, name, tagline and call to action', () => {
  const { tree } = render('es');
  const links = flatten(tree).filter(n => n.type === 'a');
  assert.deepEqual(links.map(n => n.props.href), SEASONS.map(season => `/temporadas/${season}`));
  for (const link of links) {
    const images = flatten(link).filter(n => n.type === 'img');
    assert.equal(images.length, 1, link.props.href);
    assert.match(images[0].props.src, /^https:\/\/images\.unsplash\.com\/photo-[0-9a-f-]+\?/, link.props.href);
    assert.equal(images[0].props.alt, '', 'the photo is decorative: the link already has a visible name');
    assert.ok(text(link).includes('Ver destinos'), link.props.href);
  }
});

test('names, taglines and the call to action exist in the seven languages and are never the raw key', () => {
  for (const locale of LOCALES) {
    const { tree, dictionaries } = render(locale);
    const links = flatten(tree).filter(n => n.type === 'a');
    assert.equal(links.length, 4, locale);
    links.forEach((link, index) => {
      const content = text(link);
      for (const key of [KEYS[index], TAGLINES[index], 'season.explore']) {
        const value = dictionaries.translate(locale, key);
        assert.ok(value && value !== key, `${locale} ${key}`);
        assert.ok(content.includes(value), `${locale} ${key} appears in the card`);
      }
    });
  }
  const es = loader(root)('lib/i18n/translations.ts');
  for (const key of [...TAGLINES, 'season.explore']) {
    const values = LOCALES.map(locale => es.translate(locale, key));
    assert.ok(new Set(values).size >= 5, `${key}: the seven languages are not just copies of Spanish`);
  }
});

test('the photo of each card is the same one its season page already uses', () => {
  const { tree } = render('es');
  const images = flatten(tree).filter(n => n.type === 'img').map(n => n.props.src);
  SEASONS.forEach((season, index) => {
    const photoId = images[index].match(/photo-[0-9a-f-]+/)[0];
    const page = fs.readFileSync(path.join(root, `app/temporadas/${season}/page.tsx`), 'utf8');
    assert.ok(page.includes(photoId), `${season}: ${photoId}`);
  });
});

test('the home page uses the season cards and no longer has the four emoji buttons', () => {
  const source = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
  assert.ok(source.includes('<SeasonCards />'));
  for (const season of SEASONS) assert.ok(!source.includes(`window.location.href = "/temporadas/${season}"`), season);
});
