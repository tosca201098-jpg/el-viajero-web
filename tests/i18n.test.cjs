const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  const output = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  vm.runInNewContext(output, { exports, require: (id) => dependencies[id] ?? require(id), ...globals }, { filename: file });
  return exports;
}
const translations = load('lib/i18n/translations.ts');

test('seven dictionaries, fallback, interpolation and user text', () => {
  const { locales, dictionaries, translate, translateText, isLocale } = translations;
  assert.equal(locales.length, 7);
  for (const { code } of locales) {
    assert.ok(isLocale(code));
    assert.equal(translate(code, 'brand.name'), 'Destinauta');
    assert.ok(translate(code, 'search.widgetNoFlightsHint').length > 40);
    for (const key of Object.keys(dictionaries.es)) assert.ok(dictionaries[code][key], `${code}: ${key}`);
    assert.ok(translate(code, 'trips.deleteLabel', { destination: 'París <Madrid>' }).includes('París <Madrid>'));
    assert.equal(translateText(code, 'User-written text: Mi viaje'), 'User-written text: Mi viaje');
  }
  assert.equal(isLocale('xx'), false);
  assert.equal(isLocale(null), false);
  const original = dictionaries.en['trips.empty'];
  delete dictionaries.en['trips.empty'];
  assert.equal(translate('en', 'trips.empty'), dictionaries.es['trips.empty']);
  dictionaries.en['trips.empty'] = original;
});

test('provider reads storage after hydration and persists each language change', () => {
  for (const stored of ['fr', 'invalid', null, 'blocked']) {
    const states = [], oldDeps = [], pending = [];
    let stateIndex = 0, effectIndex = 0, reads = 0;
    const writes = [], document = { documentElement: { lang: 'es' } };
    const react = {
      createContext: () => ({ Provider: 'provider' }), useContext: () => null,
      createElement: (_type, props) => ({ props }), useCallback: (fn) => fn,
      useState(initial) { const index = stateIndex++; if (!(index in states)) states[index] = initial; return [states[index], (value) => { states[index] = value; }]; },
      useEffect(effect, deps) { const index = effectIndex++; if (!oldDeps[index] || deps.some((value, i) => value !== oldDeps[index][i])) { oldDeps[index] = deps; pending.push(effect); } },
    };
    const localStorage = {
      getItem() { reads++; if (stored === 'blocked') throw Error('blocked'); return stored; },
      setItem(key, value) { if (stored === 'blocked') throw Error('blocked'); writes.push([key, value]); },
    };
    const Provider = load('app/components/LanguageProvider.tsx', { react, '@/lib/i18n/translations': translations }, { React: react, document, localStorage }).default;
    const render = () => { stateIndex = 0; effectIndex = 0; return Provider({ children: null }).props.value; };
    assert.equal(render().language, 'es');
    assert.equal(reads, 0);
    assert.equal(writes.length, 0);
    pending.splice(0).forEach((effect) => effect());
    const restored = render();
    pending.splice(0).forEach((effect) => effect());
    assert.equal(restored.language, stored === 'fr' ? 'fr' : 'es');
    assert.equal(document.documentElement.lang, restored.language);
    restored.setLanguage('de'); render(); pending.splice(0).forEach((effect) => effect());
    assert.equal(document.documentElement.lang, 'de');
    if (stored !== 'blocked') assert.deepEqual(writes.at(-1), ['el-viajero.language', 'de']);
  }
});

test('SavedTrips translates every display state while preserving stored trip text', () => {
  const trip = { id: 'real-id', destination: 'Mi cuenta', origin: 'Origen', departure_date: '2030-06-01', return_date: null, travelers: 2, service_type: 'ambos' };
  const flatten = (node) => {
    if (node == null || node === false) return '';
    if (Array.isArray(node)) return node.map(flatten).join('');
    if (typeof node === 'object') return flatten(node.children);
    return String(node);
  };
  for (const { code } of translations.locales) {
    const render = (values) => {
      let index = 0;
      const react = {
        createElement: (type, props, ...children) => ({ type, props, children }),
        useState: () => [values[index++], () => {}],
        useRef: () => ({ current: false }), useEffect: () => {},
      };
      const component = load('app/components/SavedTrips.tsx', {
        react,
        './LanguageProvider': { useLanguage: () => ({ t: (key, vars) => translations.translate(code, key, vars), text: (value) => translations.translateText(code, value) }) },
        '@/lib/supabase/saved-trips': { listSavedTrips: () => { throw Error('Data fetch during render'); } },
      }, { React: react }).default;
      return flatten(component());
    };
    const translated = (key) => translations.translate(code, key);
    assert.ok(render([[], true, '', '', null, 0]).includes(translated('trips.loading')));
    assert.ok(render([[], false, '', '', null, 0]).includes(translated('trips.empty')));
    assert.ok(render([[], false, translations.dictionaries.es['trips.loadError'], '', null, 0]).includes(translated('trips.loadError')));
    const list = render([[trip], false, '', translations.dictionaries.es['trips.deleteError'], 'real-id', 0]);
    for (const key of ['trips.deleteError', 'trips.deleting', 'search.travelers', 'trips.service', 'trips.noDate', 'trips.package']) {
      assert.ok(list.includes(translated(key)), `${code}: ${key}`);
    }
    assert.ok(list.includes('Mi cuenta'));
    assert.ok(list.includes('Origen'));
    assert.ok(list.includes('01/06/2030'));
  }
});
