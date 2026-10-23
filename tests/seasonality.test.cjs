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
  vm.runInNewContext(output, { exports, require: (id) => dependencies[id] ?? require(id), Intl, Date, Set }, { filename: file });
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
const switzerland = load('lib/destinations/switzerland.ts', { './switzerland-images': load('lib/destinations/switzerland-images.ts') });
const austria = load('lib/destinations/austria.ts', { './austria-images': load('lib/destinations/austria-images.ts') });
const czechia = load('lib/destinations/czechia.ts', { './czechia-images': load('lib/destinations/czechia-images.ts') });
const poland = load('lib/destinations/poland.ts', { './poland-images': load('lib/destinations/poland-images.ts') });
const library = load('lib/destinations/index.ts', { './spain': spain, './portugal': portugal, './france': france, './italy': italy, './uk': uk, './germany': germany, './netherlands': netherlands, './belgium': belgium, './switzerland': switzerland, './austria': austria, './czechia': czechia, './poland': poland });
const formatting = load('lib/destinations/seasonality.ts');
const { locales } = load('lib/i18n/translations.ts');

test('all 65 Spanish and Portuguese profiles have valid tourist-season months', () => {
  assert.equal(spain.spainDestinations.length, 43);
  assert.equal(portugal.portugalDestinations.length, 22);
  assert.equal(library.destinationProfiles.filter(profile => ['ES', 'PT'].includes(profile.countryCode)).length, 65);
  for (const profile of library.destinationProfiles) {
    for (const field of ['bestMonths', 'lowSeasonMonths', 'highSeasonMonths']) {
      const months = profile[field];
      assert.ok(Array.isArray(months) && months.length > 0, `${profile.name}: ${field}`);
      assert.ok(months.every((month) => Number.isInteger(month) && month >= 1 && month <= 12), `${profile.name}: ${field} range`);
      assert.equal(new Set(months).size, months.length, `${profile.name}: ${field} duplicates`);
    }
    assert.ok(profile.lowSeasonMonths.every((month) => !profile.highSeasonMonths.includes(month)), `${profile.name}: quiet/high conflict`);
  }
});

test('key destinations resolve to seasonality and month lookup remains reusable', () => {
  for (const name of ['Madrid', 'Menorca', 'Tenerife', 'Lisboa', 'Madeira', 'Porto']) {
    const profile = library.findDestinationProfile({ name });
    assert.ok(profile?.bestMonths?.length, name);
    assert.ok(profile?.lowSeasonMonths?.length, name);
  }
  const september = library.getDestinationsForMonth(9, 'best');
  assert.ok(september.some((profile) => profile.name === 'Madrid'));
  assert.ok(september.some((profile) => profile.name === 'Menorca'));
  assert.ok(library.getDestinationsForMonth(11, 'quiet').some((profile) => profile.name === 'Lisboa'));
  assert.equal(library.getDestinationsForMonth(0).length, 0);
  assert.equal(library.getDestinationsForMonth(13).length, 0);
});

test('month ranges and quiet-month lists use all seven locale conventions', () => {
  assert.equal(formatting.formatMonthRanges([10, 5, 4, 6, 9, 9], 'es'), 'Abril – junio · septiembre – octubre');
  assert.equal(formatting.formatMonthList([11, 1, 2], 'es'), 'Enero, febrero y noviembre');
  for (const { code } of locales) {
    const best = formatting.formatMonthRanges([4, 5, 6, 9, 10], code);
    const quiet = formatting.formatMonthList([1, 2, 11], code);
    assert.ok(best.includes(' – ') && best.includes(' · '), code);
    assert.ok(quiet.length > 10 && !/\b(?:0|1|2|11)\b/.test(quiet), code);
  }
});
