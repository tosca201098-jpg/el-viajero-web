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

test('exact search links carry the catalog identity and verified full dates for Madrid, Paris and Rome', async () => {
  const route = load('app/api/travelpayouts/flight-link/route.ts', {
    '@/lib/travelpayouts/places': {
      matchingDestinationProfile: name => profiles.find(p => p.name === name),
      resolveCity: async input => ({ name: input, code: ({ Barcelona: 'BCN', Madrid: 'MAD', París: 'PAR', Roma: 'ROM', Oslo: 'OSL', 'Nueva York': 'NYC' })[input] }),
    },
    '@/lib/travelpayouts/white-label': { whiteLabelFlightSearch: ({ origin, destination }) => `${origin}2011${destination}24112` },
    '@/lib/destinations': { findDestinationProfile: ({ iataCode }) => profiles.find(p => p.iataCodes.includes(iataCode)) },
    '@/lib/travelpayouts/featured-flight': {
      findFeaturedDestination: name => name === 'Nueva York' ? { name: 'Nueva York', country: 'Estados Unidos' } : undefined,
      featuredDestinationSlug: () => 'nueva-york',
    },
  });
  for (const [name,code,id] of [['Madrid','MAD','es-madrid'],['París','PAR','fr-paris'],['Roma','ROM','it-rome']]) {
    const response = await route.POST({ json: async () => ({ origin:'Barcelona', destination:name,
      departureDate:'2026-11-20', returnDate:'2026-11-24', travelers:2 }) });
    assert.equal(response.status,200);
    const result = await response.json();
    assert.equal(result.url,`/vuelos?flightSearch=BCN2011${code}24112&destinationId=${id}&departureDate=2026-11-20&returnDate=2026-11-24`);
  }
  const unknown = await route.POST({ json: async () => ({ origin:'Barcelona', destination:'Oslo',
    departureDate:'2026-11-20', returnDate:'2026-11-24', travelers:2 }) });
  assert.equal((await unknown.json()).url,'/vuelos?flightSearch=BCN2011OSL24112');
  const newYork = await route.POST({ json: async () => ({ origin:'Barcelona', destination:'Nueva York',
    departureDate:'2026-11-20', returnDate:'2026-11-24', travelers:2 }) });
  assert.equal((await newYork.json()).url,
    '/?flightSearch=BCN2011NYC24112&featured=nueva-york&departureDate=2026-11-20&returnDate=2026-11-24');
});

test('results keep a uniquely identified catalog profile when the provider removes its URL parameter', () => {
  const { flightProfileForSearch } = load('lib/travelpayouts/flight-profile.ts', {
    '@/lib/destinations': { getDestinationById: id => profiles.find(p => p.id === id), destinationProfiles: profiles },
    '@/lib/itinerary/dates': load('lib/itinerary/dates.ts', {}),
    './white-label': load('lib/travelpayouts/white-label.ts', {}),
  });
  assert.equal(flightProfileForSearch('BCN2011MAD24112','es-madrid'),profile);
  assert.equal(flightProfileForSearch('BCN2011PAR24112','fr-paris'),paris);
  assert.equal(flightProfileForSearch('BCN2011ROM24112','it-rome'),rome);
  assert.equal(flightProfileForSearch('BCN2011MAD24112',undefined),profile);
  assert.equal(flightProfileForSearch('BCN2011PAR24112',undefined),paris);
  assert.equal(flightProfileForSearch('BCN2011MAD24112','fr-paris'),undefined);
  assert.equal(flightProfileForSearch('invalid','es-madrid'),undefined);
  assert.equal(flightProfileForSearch('BCN2011MAD24112','../../es-madrid'),undefined);
  profiles.push({ id:'es-madrid-alternative', iataCodes:['MAD'] });
  assert.equal(flightProfileForSearch('BCN2011MAD24112',undefined),undefined);
  assert.equal(flightProfileForSearch('BCN2011MAD24112','es-madrid'),profile);
  profiles.pop();
});

test('itinerary context uses real full dates only when they match the White Label search', () => {
  const { itineraryContextForFlightSearch } = load('lib/travelpayouts/flight-profile.ts', {
    '@/lib/destinations': { getDestinationById: () => undefined, destinationProfiles: [] },
    '@/lib/itinerary/dates': load('lib/itinerary/dates.ts', {}),
    './white-label': load('lib/travelpayouts/white-label.ts', {}),
  });
  const search = 'BCN2011MAD24112';
  const context = (departure, returning) => itineraryContextForFlightSearch(search, departure, returning, new Date('2026-10-23'));
  assert.equal(JSON.stringify(context('2026-11-20', '2026-11-24')),
    JSON.stringify({ travelers:2, departureDate:'2026-11-20', returnDate:'2026-11-24' }));
  for (const [departure, returning] of [
    [undefined, undefined], ['2027-11-20', undefined], ['2026-11-21', '2026-11-24'],
    ['2026-11-20', '2026-11-25'], ['2026-02-30', '2026-11-24'], ['2026-11-24', '2026-11-20'],
  ]) assert.equal(JSON.stringify(context(departure, returning)),
    JSON.stringify({ travelers:2 }));
  assert.equal(JSON.stringify(itineraryContextForFlightSearch('invalid', '2026-11-20', '2026-11-24', new Date('2026-10-23'))), '{}');
});

test('the home results accept only original editorial identities and validated search syntax', () => {
  const featured = [{ name:'Nueva York', country:'Estados Unidos' }, { name:'Sídney', country:'Australia' }];
  const { featuredDestinationSlug, findFeaturedDestination, featuredDestinationForSearch } =
    load('lib/travelpayouts/featured-flight.ts', {
      '@/lib/destinations/featured': { destinations: featured },
      '@/lib/destinations': { normalizeDestinationName: value => value.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g,' ') },
      './white-label': { isWhiteLabelFlightSearch: validSearch },
    });
  assert.equal(featuredDestinationSlug(featured[0]), 'nueva-york');
  assert.equal(findFeaturedDestination('NUEVA YÓRK'), featured[0]);
  assert.equal(featuredDestinationForSearch('BCN2011NYC24112','nueva-york'), featured[0]);
  assert.equal(featuredDestinationForSearch('BCN2011NYC24112','madrid'), undefined);
  assert.equal(featuredDestinationForSearch('invalid','nueva-york'), undefined);
});

test('flight results page renders the existing planner, tourism card and provider results without auto-generation or another form', async () => {
  const React = { createElement: (type,props,...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) }) };
  const { itineraryContextForFlightSearch } = load('lib/travelpayouts/flight-profile.ts', {
    '@/lib/destinations': { getDestinationById: () => undefined, destinationProfiles: [] },
    '@/lib/itinerary/dates': load('lib/itinerary/dates.ts', {}),
    './white-label': load('lib/travelpayouts/white-label.ts', {}),
  });
  const page = load('app/vuelos/page.tsx', {
    'next/script': { default:'script' }, 'next/link': { default:'a' },
    '@/lib/travelpayouts/white-label': { isWhiteLabelFlightSearch: validSearch },
    '@/lib/travelpayouts/flight-profile': { flightProfileForSearch: (search,id) => validSearch(search)
      ? profiles.find(p => (id === undefined || id === p.id) && p.iataCodes.includes(search.slice(7,10)))
      : undefined, itineraryContextForFlightSearch: (search, departure, returning) =>
        itineraryContextForFlightSearch(search, departure, returning, new Date('2026-10-23')) },
    '@/app/components/DestinationProfileSummary': { default:'summary' },
    '@/app/components/ItineraryPlanner': { default:'planner' },
  }, { React });
  const nodes = node => !node || typeof node !== 'object' ? [] : Array.isArray(node)
    ? node.flatMap(nodes) : [node, ...(node.children ?? []).flatMap(nodes)];
  const tree = await page.default({ searchParams: Promise.resolve({ flightSearch:'BCN2011MAD24112', destinationId:'es-madrid',
    departureDate:'2026-11-20', returnDate:'2026-11-24' }) });
  assert.equal(nodes(tree).filter(n => n.type === 'summary')[0].props.destination,profile);
  const planner = nodes(tree).find(n => n.type === 'planner');
  assert.equal(planner.props.destination, profile);
  assert.equal(JSON.stringify(planner.props.context), JSON.stringify({ travelers:2,
    departureDate:'2026-11-20', returnDate:'2026-11-24' }));
  assert.equal(planner.props.voiceRequest, undefined);
  assert.ok(nodes(tree).some(n => n.props.id === 'tpwl-tickets'));
  assert.ok(nodes(tree).some(n => n.props.id === 'tpwl-search' && n.props.hidden));
  assert.equal(page.metadata.robots.index,false);
  for (const [code,id,destination] of [['PAR','fr-paris',paris],['ROM','it-rome',rome]]) {
    const other = await page.default({ searchParams: Promise.resolve({ flightSearch:`BCN2011${code}24112`, destinationId:id }) });
    assert.equal(nodes(other).find(n => n.type === 'summary').props.destination,destination);
    assert.equal(nodes(other).find(n => n.type === 'planner').props.destination,destination);
    assert.ok(nodes(other).some(n => n.props.id === 'tpwl-tickets'));
  }
  const withoutIdentity = await page.default({ searchParams: Promise.resolve({ flightSearch:'BCN2011MAD24112' }) });
  assert.equal(nodes(withoutIdentity).some(n => n.type === 'summary'),true);
  assert.equal(JSON.stringify(nodes(withoutIdentity).find(n => n.type === 'planner').props.context),
    JSON.stringify({ travelers:2 }));
  const wrongIdentity = await page.default({ searchParams: Promise.resolve({ flightSearch:'BCN2011MAD24112', destinationId:'fr-paris' }) });
  assert.equal(nodes(wrongIdentity).some(n => n.type === 'summary'),false);
  assert.equal(nodes(wrongIdentity).some(n => n.type === 'planner'),false);
});
