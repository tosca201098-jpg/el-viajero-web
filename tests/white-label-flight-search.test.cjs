const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../lib/travelpayouts/white-label.ts'), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const moduleExports = {};
vm.runInNewContext(code, { exports: moduleExports, Date });
const { whiteLabelFlightSearch, isWhiteLabelFlightSearch } = moduleExports;
const today = new Date('2026-10-23T00:00:00Z');
const search = { origin:'BCN', destination:'MAD', departureDate:'2026-11-20', returnDate:'2026-11-24', travelers:2 };

test('official White Label syntax includes exact dates and required adult count', () => {
  assert.equal(whiteLabelFlightSearch(search, today), 'BCN2011MAD24112');
  assert.equal(isWhiteLabelFlightSearch('BCN2011MAD24112'), true);
  assert.equal(whiteLabelFlightSearch({ ...search, destination:'LIS', travelers:1 }, today), 'BCN2011LIS24111');
});

test('rejects bad IATA, past/impossible dates, same route and unsupported traveler counts', () => {
  for (const invalid of [
    { origin:'Barcelona' }, { origin:'bcn' }, { destination:'BCN' },
    { departureDate:'2026-11-31' }, { departureDate:'2026-10-20' },
    { returnDate:'2026-11-20' }, { returnDate:'2027-12-01' },
    { travelers:0 }, { travelers:10 }, { travelers:1.5 },
  ]) assert.equal(whiteLabelFlightSearch({ ...search, ...invalid }, today), null);
  assert.equal(isWhiteLabelFlightSearch('BCN2011BCN24112'), false);
});

test('original form uses White Label only for exact manual searches', () => {
  const page = fs.readFileSync(path.join(__dirname, '../app/page.tsx'), 'utf8');
  const submit = page.slice(page.indexOf('async function launchExactFlightSearch('), page.indexOf('async function discoverDestinations('));
  assert.match(submit, /if \(!flexibleDates\)/);
  assert.match(submit, /\/api\/travelpayouts\/flight-link/);
  assert.match(submit, /window\.location\.assign\(data\.url\)/);
  assert.match(submit, /runFlightSearch\(/);
  assert.match(page, /if \(!pendingVoiceFlightSearch \|\| pendingVoiceFlightSearch.started\) return;/);
  assert.match(page, /runFlightSearch\(pendingVoiceFlightSearch.query, pendingVoiceFlightSearch.context.signal\)/);
});
