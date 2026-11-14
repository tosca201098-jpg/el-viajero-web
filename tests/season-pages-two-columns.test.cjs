// Páginas de temporada (primavera, verano, otoño, invierno): en el móvil las tarjetas van en 2 columnas hacia abajo,
// no en una fila que se desplaza hacia el lado. Desde 640 px (tableta y escritorio) la disposición no cambia:
// 2 columnas hasta 1023 px y 4 columnas desde 1024 px.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const SEASONS = ['primavera', 'verano', 'otono', 'invierno'];
const source = season => fs.readFileSync(path.join(root, 'app/temporadas', season, 'page.tsx'), 'utf8');
const GRID = 'grid max-w-full grid-cols-2 gap-3 max-sm:gap-2 lg:mx-auto lg:max-w-5xl lg:grid-cols-4';

for (const season of SEASONS) {
  test(`${season}: the destination cards are a two-column grid on mobile, not a sideways-scrolling row`, () => {
    const text = source(season);
    assert.equal(text.split(`className="${GRID}"`).length - 1, 1, 'one grid with the expected classes');
    for (const old of ['grid-flow-col', 'auto-cols', 'overflow-x-auto', 'snap-x', 'snap-mandatory', 'snap-start', 'carousel', 'carouselRef']) {
      assert.ok(!text.includes(old), `${season}: «${old}» no longer appears`);
    }
    assert.ok(!text.includes('Ver más destinos de'), `${season}: the arrow that scrolled the row is gone`);
  });

  test(`${season}: the list keeps its region label, its cards and the detail window`, () => {
    const text = source(season);
    assert.match(text, /role="region"\n\s+aria-label="Destinos recomendados para [^"]+"\n\s+className="grid max-w-full grid-cols-2/);
    assert.ok(text.includes('<article'), 'cards');
    assert.ok(text.includes('role="dialog"'), 'detail window');
    assert.ok(text.includes('activeCardRef'), 'focus returns to the card that opened the window');
    assert.ok(text.includes('max-sm:h-[104px]'), 'mobile photo height is unchanged');
  });
}
