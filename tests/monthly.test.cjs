const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(file, dependencies = {}) {
  const exports = {};
  const output = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(output, { exports, require: (id) => dependencies[id] ?? require(id), Set }, { filename: file });
  return exports;
}

const spain = load('lib/destinations/spain.ts');
const portugal = load('lib/destinations/portugal.ts');
const france = load('lib/destinations/france.ts');
const italy = load('lib/destinations/italy.ts', { './italy-images': load('lib/destinations/italy-images.ts') });
const uk = load('lib/destinations/uk.ts', { './uk-images': load('lib/destinations/uk-images.ts') });
const germany = load('lib/destinations/germany.ts', { './germany-images': load('lib/destinations/germany-images.ts') });
const netherlands = load('lib/destinations/netherlands.ts', { './netherlands-images': load('lib/destinations/netherlands-images.ts') });
const belgium = load('lib/destinations/belgium.ts', { './belgium-images': load('lib/destinations/belgium-images.ts') });
const library = load('lib/destinations/index.ts', { './spain': spain, './portugal': portugal, './france': france, './italy': italy, './uk': uk, './germany': germany, './netherlands': netherlands, './belgium': belgium });
const months = load('lib/destinations/months.ts');
const monthly = load('lib/destinations/monthly.ts', { './index': library });

test('twelve stable Spanish routes map exactly to months 1–12', () => {
  assert.equal(months.spanishMonthSlugs.length, 12);
  months.spanishMonthSlugs.forEach((slug, index) => {
    assert.equal(months.monthFromSlug(slug), index + 1);
    assert.equal(months.slugFromMonth(index + 1), slug);
  });
  assert.equal(months.monthFromSlug('foobar'), null);
  assert.equal(months.slugFromMonth(13), null);
});

test('January, April, August and November lead with quieter season, then best season', () => {
  for (const month of [1, 4, 8, 11]) {
    const recommendations = monthly.getMonthlyRecommendations(month);
    const quiet = library.getDestinationsForMonth(month, 'quiet');
    const best = library.getDestinationsForMonth(month, 'best');
    assert.ok(recommendations.length > 0);
    assert.deepEqual(Array.from(recommendations.slice(0, quiet.length), ({ destination }) => destination.name), Array.from(quiet, ({ name }) => name));
    assert.ok(recommendations.slice(0, quiet.length).every(({ reason }) => reason === 'quiet'));
    assert.ok(recommendations.slice(quiet.length).every(({ reason }) => reason === 'best'));
    const expected = [...quiet, ...best.filter((destination) => !quiet.includes(destination))];
    assert.deepEqual(Array.from(recommendations, ({ destination }) => destination.name), Array.from(expected, ({ name }) => name));
    assert.equal(new Set(recommendations.map(({ destination }) => destination)).size, recommendations.length);
    assert.ok(recommendations.every(({ destination }) => destination.image && destination.recommendedStay));
  }
});
