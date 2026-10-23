const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.resolve(__dirname, '..');
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React };
const profile = { id: 'es-madrid', name: 'Madrid', iataCodes: ['MAD'], publication: { status: 'draft' } };
const paris = { id: 'fr-paris', name: 'París', iataCodes: ['PAR', 'CDG'] };
const rome = { id: 'it-rome', name: 'Roma', iataCodes: ['ROM', 'FCO'] };
const profiles = [profile, paris, rome];
const validSearch = value => typeof value === 'string' && /^[A-Z]{3}\d{4}[A-Z]{3}\d{4}[1-9]$/.test(value);

function load(file, dependencies, globals = {}) {
  const exports = {};
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions }).outputText;
  vm.runInNewContext(code, {
    exports, Response, URLSearchParams, React: globals.React,
    require: id => {
      if (!Object.hasOwn(dependencies, id)) throw Error(`Unexpected dependency: ${id}`);
      return dependencies[id];
    },
  });
  return exports;
}

test('exact search links carry only a matching catalog identity for Madrid, Paris and Rome', async () => {
  const route = load('app/api/travelpayouts/flight-link/route.ts', {
    '@/lib/travelpayouts/places': {
      matchingDestinationProfile: name => profiles.find(p => p.name === name),
      resolveCity: async input => ({ name: input, code: ({ Barcelona: 'BCN', Madrid: 'MAD', París: 'PAR', Roma: 'ROM', Oslo: 'OSL' })[input] }),
    },
    '@/lib/travelpayouts/white-label': { whiteLabelFlightSearch: ({ origin, destination }) => `${origin}2011${destination}24112` },
    '@/lib/destinations': { findDestinationProfile: ({ iataCode }) => profiles.find(p => p.iataCodes.includes(iataCode)) },
  });
  for (const [name,code,id] of [['Madrid','MAD','es-madrid'],['París','PAR','fr-paris'],['Roma','ROM','it-rome']]) {
    const response = await route.POST({ json: async () => ({ origin:'Barcelona', destination:name,
      departureDate:'2026-11-20', returnDate:'2026-11-24', travelers:2 }) });
    assert.equal(response.status,200);
    const result = await response.json();
    assert.equal(result.url,`/vuelos?flightSearch=BCN2011${code}24112&destinationId=${id}`);
  }
  const unknown = await route.POST({ json: async () => ({ origin:'Barcelona', destination:'Oslo',
    departureDate:'2026-11-20', returnDate:'2026-11-24', travelers:2 }) });
  assert.equal((await unknown.json()).url,'/vuelos?flightSearch=BCN2011OSL24112');
});

test('results accept a draft profile only for a validated, matching search identity', () => {
  const { flightProfileForSearch } = load('lib/travelpayouts/flight-profile.ts', {
    '@/lib/destinations': { getDestinationById: id => profiles.find(p => p.id === id) },
    './white-label': { isWhiteLabelFlightSearch: validSearch },
  });
  assert.equal(flightProfileForSearch('BCN2011MAD24112','es-madrid'),profile);
  assert.equal(flightProfileForSearch('BCN2011PAR24112','fr-paris'),paris);
  assert.equal(flightProfileForSearch('BCN2011ROM24112','it-rome'),rome);
  assert.equal(flightProfileForSearch('BCN2011MAD24112',undefined),undefined);
  assert.equal(flightProfileForSearch('BCN2011MAD24112','fr-paris'),undefined);
  assert.equal(flightProfileForSearch('invalid','es-madrid'),undefined);
  assert.equal(flightProfileForSearch('BCN2011MAD24112','../../es-madrid'),undefined);
});

test('flight results page renders the resolved tourism card and provider results together without another form', async () => {
  const React = { createElement: (type,props,...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) }) };
  const page = load('app/vuelos/page.tsx', {
    'next/script': { default:'script' }, 'next/link': { default:'a' },
    '@/lib/travelpayouts/white-label': { isWhiteLabelFlightSearch: validSearch },
    '@/lib/travelpayouts/flight-profile': { flightProfileForSearch: (search,id) => validSearch(search) && id === profile.id ? profile : undefined },
    '@/app/components/DestinationProfileSummary': { default:'summary' },
  }, { React });
  const nodes = node => !node || typeof node !== 'object' ? [] : Array.isArray(node)
    ? node.flatMap(nodes) : [node, ...(node.children ?? []).flatMap(nodes)];
  const tree = await page.default({ searchParams: Promise.resolve({ flightSearch:'BCN2011MAD24112', destinationId:'es-madrid' }) });
  assert.equal(nodes(tree).filter(n => n.type === 'summary')[0].props.destination,profile);
  assert.ok(nodes(tree).some(n => n.props.id === 'tpwl-tickets'));
  assert.ok(nodes(tree).some(n => n.props.id === 'tpwl-search' && n.props.hidden));
  assert.equal(page.metadata.robots.index,false);
  const withoutIdentity = await page.default({ searchParams: Promise.resolve({ flightSearch:'BCN2011MAD24112' }) });
  assert.equal(nodes(withoutIdentity).some(n => n.type === 'summary'),false);
});
