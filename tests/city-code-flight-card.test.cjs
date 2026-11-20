const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Seoul (SEL), Osaka (OSA) and Sapporo (SPK) reach the flight search with the provider's CITY code, which is not one of the
// airports of their card (ICN/GMP, ITM/KIX, CTS/OKD). The card must still be found, with the real catalog, route and resolver.
const root = path.resolve(__dirname, '..');

function loader(globals = {}) {
  const cache = new Map();
  function load(file) {
    file = file.replaceAll('\\', '/');
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(code, { exports, Intl, URL, URLSearchParams, Request, Response, AbortSignal, ...globals,
      require: id => {
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const next = [base + '.ts', path.join(base, 'index.ts')].find(item => fs.existsSync(path.join(root, item)));
        if (!next) throw Error(id);
        return load(next);
      },
    }, { filename: file });
    return exports;
  }
  return load;
}

const city = (code, name, country_code, extra = {}) => ({ type: 'city', code, name, country_code, country_name: country_code, ...extra });
// What the provider answers for each search term. "Seoul" has no direct hit: it is only found through its airport codes.
const answers = {
  madrid: [city('MAD', 'Ciudad de Madrid', 'ES')],
  'seúl': [city('SEL', 'Seúl', 'KR')], seul: [city('SEL', 'Seúl', 'KR')], icn: [city('SEL', 'Seúl', 'KR')], gmp: [city('SEL', 'Seúl', 'KR')],
  osaka: [city('OSA', 'Osaka', 'JP')], itm: [city('OSA', 'Osaka', 'JP')], kix: [city('OSA', 'Osaka', 'JP')],
  sapporo: [city('SPK', 'Sapporo', 'JP')], cts: [city('SPK', 'Sapporo', 'JP')],
  jeju: [city('CJU', 'Jeju', 'KR')], cju: [city('CJU', 'Jeju', 'KR')],
};
const calls = [];
const load = loader({ fetch: async input => {
  const term = new URL(input).searchParams.get('term');
  calls.push(term);
  return { ok: true, json: async () => answers[term.toLowerCase()] ?? [] };
} });
const catalog = load('lib/destinations/index.ts');
const route = load('app/api/travelpayouts/flight-link/route.ts');
const places = load('lib/travelpayouts/places.ts');
const { flightProfileForSearch } = load('lib/travelpayouts/flight-profile.ts');

const day = offset => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);
const [departureDate, returnDate] = [day(30), day(40)];
const short = date => date.slice(8, 10) + date.slice(5, 7);
const post = destination => route.POST({ json: async () => ({ origin: 'Madrid', destination, departureDate, returnDate, travelers: 1 }) });

test('the only cards with a city code of their own are Tokyo, Osaka, Sapporo and Seoul', () => {
  const withCityCode = Array.from(catalog.destinationProfiles)
    .filter(profile => profile.metropolitanCodes.some(code => !profile.iataCodes.includes(code))).map(profile => profile.id).sort();
  assert.deepEqual(withCityCode, ['jp-osaka', 'jp-sapporo', 'jp-tokyo', 'kr-seoul']);
});

test('exact search links keep the card of Seoul, Osaka and Sapporo, however the visitor typed them', async () => {
  const cases = [['Seúl', 'SEL', 'kr-seoul'], ['Seul', 'SEL', 'kr-seoul'], ['Seoul', 'SEL', 'kr-seoul'], ['Incheon', 'SEL', 'kr-seoul'],
    ['Osaka', 'OSA', 'jp-osaka'], ['Sapporo', 'SPK', 'jp-sapporo'], ['Jeju', 'CJU', 'kr-jeju']];
  for (const [typed, code, id] of cases) {
    const response = await post(typed);
    assert.equal(response.status, 200, typed);
    const { url } = await response.json();
    assert.equal(url, `/vuelos?flightSearch=MAD${short(departureDate)}${code}${short(returnDate)}1&destinationId=${id}&departureDate=${departureDate}&returnDate=${returnDate}`, typed);
  }
});

test('the city resolver accepts the provider city code of a card, but only for its own country', async () => {
  assert.deepEqual({ ...await places.resolveCity('Seoul') }, { name: 'Seúl', code: 'SEL' });
  assert.deepEqual({ ...await places.resolveCity('ICN') ?? {} }, {});
  const foreign = loader({ fetch: async () => ({ ok: true, json: async () => [city('SEL', 'Seúl', 'XX')] }) })('lib/travelpayouts/places.ts');
  assert.equal(await foreign.resolveCity('Seoul'), null);
});

test('the flights page finds the card from the city code, with or without the destination identifier', () => {
  const search = (code, from = 'MAD') => `${from}1003${code}20031`;
  for (const [code, id] of [['SEL', 'kr-seoul'], ['ICN', 'kr-seoul'], ['GMP', 'kr-seoul'], ['OSA', 'jp-osaka'], ['KIX', 'jp-osaka'], ['SPK', 'jp-sapporo'], ['CJU', 'kr-jeju']]) {
    assert.equal(flightProfileForSearch(search(code), id)?.id, id, `${code} with identifier`);
    assert.equal(flightProfileForSearch(search(code), undefined)?.id, id, `${code} without identifier`);
  }
  // A card never answers to a code that is not its own, and a malformed identifier is still refused.
  assert.equal(flightProfileForSearch(search('SEL'), 'jp-osaka'), undefined);
  assert.equal(flightProfileForSearch(search('OSA'), 'kr-seoul'), undefined);
  assert.equal(flightProfileForSearch(search('SEL'), '../kr-seoul'), undefined);
  assert.equal(flightProfileForSearch('invalid', 'kr-seoul'), undefined);
  assert.equal(flightProfileForSearch(search('XXX'), undefined), undefined);
});
