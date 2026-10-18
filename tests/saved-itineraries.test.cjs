const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
function load(file, dependencies = {}) {
  const exports = {};
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(output, {
    exports, require: (id) => dependencies[id] ?? require(id),
    Date, JSON, Number, Object, Array, String, Set, RegExp,
  }, { filename: file });
  return exports;
}

const translations = load('lib/i18n/translations.ts');
const schema = load('lib/itinerary/schema.ts');
const sample = {
  title: 'Madrid en dos días', summary: 'Un recorrido cultural',
  days: [1, 2].map((dayNumber) => ({
    dayNumber, title: 'Centro',
    morning: [{ name: 'Museo', description: 'Visita cultural', area: 'Centro' }],
    afternoon: [{ name: 'Parque', description: 'Paseo', area: 'Centro' }],
    evening: [{ name: 'Cena', description: 'Comida local', area: 'Centro' }],
  })),
  tips: ['Consulta horarios oficiales', 'Reserva si es necesario'],
};

function setup(session = { user: { id: 'user-a' } }) {
  const calls = [];
  const row = {
    id: 'itinerary-1', user_id: 'user-a', destination_name: 'Madrid', country: 'España',
    locale: 'es', days_count: 2, itinerary: sample, created_at: '2026-10-18T10:00:00Z',
  };
  const query = {
    select(columns) { calls.push(['select', columns]); return this; },
    eq(column, value) { calls.push(['eq', column, value]); return this; },
    order(column, direction) { calls.push(['order', column, direction]); return this; },
    returns() { return Promise.resolve({ data: [row], error: null }); },
    insert(value) { calls.push(['insert', value]); return this; },
    single() { return Promise.resolve({ data: row, error: null }); },
    delete() { calls.push(['delete']); return this; },
    maybeSingle() { return Promise.resolve({ data: { id: 'itinerary-1' }, error: null }); },
  };
  const client = {
    auth: { getSession: async () => ({ data: { session }, error: null }) },
    from(table) { calls.push(['from', table]); return query; },
  };
  const saved = load('lib/supabase/saved-itineraries.ts', {
    '@/lib/itinerary/schema': schema,
    '@/lib/i18n/translations': translations,
    './client': { getSupabaseClient: () => client },
  });
  return { saved, calls };
}

test('save, list and delete use current session ownership and persist validated plan', async () => {
  const { saved, calls } = setup();
  const created = await saved.saveItinerary({
    destination_name: ' Madrid ', country: ' España ', locale: 'es', itinerary: sample,
  });
  assert.equal(created.itinerary.title, sample.title);
  const inserted = calls.find(([operation]) => operation === 'insert')[1];
  assert.equal(inserted.user_id, 'user-a');
  assert.equal(inserted.destination_name, 'Madrid');
  assert.equal(inserted.days_count, 2);
  assert.deepEqual(inserted.itinerary, sample);
  assert.equal((await saved.listSavedItineraries()).length, 1);
  await saved.deleteSavedItinerary('itinerary-1');
  assert.ok(calls.some(([operation, column, value]) => operation === 'eq' && column === 'user_id' && value === 'user-a'));
  assert.ok(calls.some(([operation, column, value]) => operation === 'eq' && column === 'id' && value === 'itinerary-1'));
});

test('anonymous session cannot access or save itineraries', async () => {
  const { saved, calls } = setup(null);
  await assert.rejects(saved.listSavedItineraries());
  await assert.rejects(saved.saveItinerary({ destination_name: 'Madrid', country: 'España', locale: 'es', itinerary: sample }));
  await assert.rejects(saved.deleteSavedItinerary('itinerary-1'));
  assert.equal(calls.length, 0);
});

test('all seven languages have save and account controls', () => {
  for (const { code } of translations.locales) {
    for (const key of ['account.sections', 'itinerary.save', 'itinerary.saved',
      'itinerary.signinRequired', 'savedItineraries.title', 'savedItineraries.open',
      'savedItineraries.delete', 'savedItineraries.empty']) {
      assert.ok(translations.translate(code, key), `${code} ${key}`);
    }
  }
});
