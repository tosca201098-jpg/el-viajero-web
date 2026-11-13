// «Viajes por mes» con precios reales: elección de destinos y precios, bloques España/Internacional y ruta de la API.
// Todo con datos simulados del proveedor: ninguna prueba llama a Travelpayouts ni inventa precios.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loader } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const plain = (value) => JSON.parse(JSON.stringify(value));
const load = loader(root, {}, { AbortSignal });
const shared = load('lib/travelpayouts/monthly-shared.ts');
const monthly = load('lib/travelpayouts/monthly.ts');
const { destinationProfiles, getDestinationById } = load('lib/destinations/index.ts');

const YEAR = monthly.targetYear(1);
const rec = (destination, price, departure, back, extra = {}) => ({
  origin: 'MAD', destination, price, transfers: 0,
  departure_at: `${YEAR}-${departure}T08:10:00+01:00`, return_at: `${YEAR}-${back}T21:30:00+01:00`,
  link: `/search/MAD${departure.slice(3)}${departure.slice(0, 2)}${destination}1?marker=test`, ...extra,
});
const ids = (cards) => Array.from(cards, (card) => card.id);
const prices = (cards) => Array.from(cards, (card) => card.price);

test('el año del mes pedido y las ventanas de salida y vuelta', () => {
  assert.equal(monthly.targetYear(1, new Date('2026-11-13T10:00:00Z')), 2027);
  assert.equal(monthly.targetYear(11, new Date('2026-11-13T10:00:00Z')), 2026);
  assert.equal(monthly.targetYear(12, new Date('2026-11-13T10:00:00Z')), 2026);
  assert.deepEqual(plain(monthly.monthWindows(1, 2027)),
    { departure: '2027-01', returns: ['2027-01', '2027-02'] });
  assert.deepEqual(plain(monthly.monthWindows(12, 2026).returns), ['2026-12', '2027-01']);
  assert.equal(monthly.isValidMonth(1) && monthly.isValidMonth(12), true);
  for (const bad of [0, 13, 1.5, NaN, '1', null]) assert.equal(monthly.isValidMonth(bad), false);
});

test('los diez aeropuertos aprobados, con Madrid por defecto', () => {
  assert.deepEqual(Array.from(shared.MONTHLY_ORIGINS, (origin) => origin.code),
    ['MAD', 'BCN', 'VLC', 'SVQ', 'AGP', 'BIO', 'PMI', 'ALC', 'TCI', 'LPA']);
  assert.equal(shared.DEFAULT_ORIGIN_CODE, 'MAD');
  assert.equal(shared.findMonthlyOrigin('mad').code, 'MAD');
  assert.equal(shared.findMonthlyOrigin('XXX'), undefined);
  assert.equal(shared.findMonthlyOrigin(null), undefined);
});

test('solo fichas con aeropuerto, foto y el mes marcado como válido; Madeira queda fuera de enero', () => {
  const january = monthly.candidatesForMonth(1);
  const all = new Set(ids(january));
  assert.ok(january.length > 100);
  for (const destination of january) {
    assert.ok(destination.iataCodes.length > 0 && destination.image);
    assert.ok(monthly.isValidForMonth(destination, 1));
  }
  for (const id of ['es-tenerife', 'es-palma-de-mallorca', 'fr-paris', 'it-milan', 'pt-lisboa']) assert.ok(all.has(id), id);
  assert.equal(all.has('pt-madeira'), false);
  assert.ok(new Set(ids(monthly.candidatesForMonth(3))).has('pt-madeira'));
  assert.ok(destinationProfiles.some((destination) => destination.iataCodes.length === 0), 'hay fichas sin aeropuerto');
  assert.equal(january.some((destination) => destination.iataCodes.length === 0), false);
});

test('por destino se queda el vuelo más barato de 2 a 5 noches que sale del aeropuerto pedido', () => {
  const { offers, counts } = monthly.pickOffers([
    rec('LIS', 60, '01-10', '01-12'), // 2 noches
    rec('LIS', 46, '01-22', '01-24'), // 2 noches, el más barato
    rec('LIS', 30, '01-10', '01-11'), // 1 noche: no es escapada
    rec('LIS', 20, '01-10', '01-17'), // 7 noches: no es escapada
    rec('LIS', 15, '01-10', '01-12', { origin: 'BCN' }), // otro aeropuerto de salida
    rec('PAR', 73, '01-14', '01-17'),
    rec('PAR', 90, '01-10', '01-15'), // 5 noches, más caro
    rec('ROM', 48, '01-31', '02-02'), // cruza de mes: sale en enero, vale
    rec('MIL', 35, '01-26', '01-29', { price: 'gratis' }), // precio no válido
    rec('LIS', 10, '02-10', '02-12'), // sale en otro mes
  ], 'MAD', 1, YEAR);
  assert.equal(offers.get('pt-lisboa').price, 46);
  assert.equal(offers.get('pt-lisboa').nights, 2);
  assert.equal(offers.get('pt-lisboa').departureAt, `${YEAR}-01-22`);
  assert.equal(offers.get('fr-paris').price, 73);
  assert.equal(offers.get('it-rome').returnAt, `${YEAR}-02-02`);
  assert.equal(offers.has('it-milan'), false);
  assert.equal(offers.size, 3);
  assert.equal(counts.providerRecords, 10);
  assert.equal(counts.fromOrigin, 9);
  assert.match(offers.get('pt-lisboa').offerUrl, /^https:\/\/www\.aviasales\.com\/search\//);
});

test('a igual precio gana el vuelo directo y luego el más temprano', () => {
  const { offers } = monthly.pickOffers([
    rec('LIS', 50, '01-20', '01-22', { transfers: 1 }),
    rec('LIS', 50, '01-25', '01-27', { transfers: 0 }),
    rec('LIS', 50, '01-12', '01-14', { transfers: 0 }),
  ], 'MAD', 1, YEAR);
  assert.equal(offers.get('pt-lisboa').departureAt, `${YEAR}-01-12`);
  assert.equal(offers.get('pt-lisboa').transfers, 0);
});

test('Tenerife se reconoce por el código de ciudad TCI, aunque su ficha solo tenga TFN y TFS', () => {
  const tenerife = getDestinationById('es-tenerife');
  assert.equal(tenerife.iataCodes.includes('TCI'), false);
  const { offers, counts } = monthly.pickOffers([rec('TCI', 52, '01-08', '01-13')], 'MAD', 1, YEAR);
  assert.equal(offers.get('es-tenerife').price, 52);
  assert.deepEqual(plain(counts.unmatchedCodes), []);
  // También por el aeropuerto si el proveedor lo envía.
  const byAirport = monthly.pickOffers([rec('ZZZ', 55, '01-08', '01-13', { destination_airport: 'TFS' })], 'MAD', 1, YEAR);
  assert.equal(byAirport.offers.get('es-tenerife').price, 55);
});

test('los códigos que no son de ninguna ficha se anotan y no generan tarjetas', () => {
  const { offers, counts } = monthly.pickOffers([rec('QQQ', 40, '01-08', '01-10'), rec('LIS', 46, '01-22', '01-24')], 'MAD', 1, YEAR);
  assert.deepEqual([...offers.keys()], ['pt-lisboa']);
  assert.deepEqual(plain(counts.unmatchedCodes), ['QQQ']);
});

test('un destino que no tiene el mes como válido no sale aunque tenga precio (Madeira en enero)', () => {
  const { offers } = monthly.pickOffers([rec('FNC', 119, '01-18', '01-23'), rec('LIS', 46, '01-22', '01-24')], 'MAD', 1, YEAR);
  assert.equal(offers.has('pt-madeira'), false);
  assert.equal(offers.has('pt-lisboa'), true);
  const march = monthly.pickOffers([{ ...rec('FNC', 119, '03-18', '03-23') }].map((r) => ({
    ...r, departure_at: `${YEAR}-03-18T08:10:00+01:00`, return_at: `${YEAR}-03-23T21:30:00+01:00` })), 'MAD', 3, YEAR);
  assert.equal(march.offers.has('pt-madeira'), true);
});

test('nunca se ofrece como destino la ciudad de salida', () => {
  const fromMadrid = monthly.pickOffers([rec('MAD', 20, '01-10', '01-12'), rec('LIS', 46, '01-22', '01-24')], 'MAD', 1, YEAR);
  assert.equal(fromMadrid.offers.has('es-madrid'), false);
  assert.equal(fromMadrid.offers.has('pt-lisboa'), true);
  const toMadrid = monthly.pickOffers([rec('MAD', 20, '01-10', '01-12', { origin: 'BCN' })], 'BCN', 1, YEAR);
  assert.equal(toMadrid.offers.has('es-madrid'), true, 'Madrid sí es destino válido si se sale de Barcelona');
  const palma = monthly.pickOffers([rec('PMI', 20, '01-10', '01-12', { origin: 'PMI' }), rec('LIS', 46, '01-22', '01-24', { origin: 'PMI' })], 'PMI', 1, YEAR);
  assert.equal(palma.offers.has('es-palma-de-mallorca'), false);
  const tenerife = monthly.pickOffers([rec('TCI', 20, '01-10', '01-12', { origin: 'TCI' })], 'TCI', 1, YEAR);
  assert.equal(tenerife.offers.size, 0);
  const blocks = monthly.buildBlocks(new Map(), 'TCI', 1);
  assert.equal(ids(blocks.spain).includes('es-tenerife'), false);
  assert.equal(ids(monthly.buildBlocks(new Map(), 'PMI', 1).spain).includes('es-palma-de-mallorca'), false);
});

test('dos bloques de 12: primero los destinos con precio (de menor a mayor) y el resto sin precio reciente', () => {
  const records = [
    rec('PMI', 36, '01-01', '01-06'), rec('TCI', 52, '01-08', '01-13'), rec('LPA', 55, '01-26', '01-31'),
    rec('IBZ', 72, '01-05', '01-10'), rec('ACE', 86, '01-12', '01-17', { transfers: 1 }), rec('BCN', 92, '01-10', '01-12'),
    rec('MIL', 35, '01-26', '01-29'), rec('LON', 45, '01-25', '01-30'), rec('BLQ', 46, '01-21', '01-24'),
    rec('LIS', 46, '01-22', '01-24'), rec('ROM', 48, '01-16', '01-18'), rec('KRK', 70, '01-18', '01-20'),
    rec('NAP', 71, '01-15', '01-18'), rec('OPO', 72, '01-06', '01-09'), rec('PAR', 73, '01-14', '01-17'),
    rec('BRU', 75, '01-15', '01-18'), rec('GVA', 75, '01-29', '02-01'), rec('GDN', 80, '01-18', '01-22'),
    rec('BUD', 82, '01-19', '01-21'),
  ];
  const { offers } = monthly.pickOffers(records, 'MAD', 1, YEAR);
  const { spain, international } = monthly.buildBlocks(offers, 'MAD', 1);
  assert.equal(spain.length, 12);
  assert.equal(international.length, 12);
  assert.deepEqual(ids(spain).slice(0, 6), ['es-palma-de-mallorca', 'es-tenerife', 'es-gran-canaria', 'es-ibiza', 'es-lanzarote', 'es-barcelona']);
  assert.deepEqual(prices(spain).slice(0, 6), [36, 52, 55, 72, 86, 92]);
  assert.ok(spain.slice(6).every((card) => card.price === null && card.departureAt === null && card.offerUrl === null));
  assert.ok(spain.every((card) => card.countryCode === 'ES'));
  assert.ok(international.every((card) => card.countryCode !== 'ES'));
  assert.equal(international[0].id, 'it-milan');
  assert.deepEqual(prices(international).slice(0, 11), [35, 45, 46, 46, 48, 70, 71, 72, 73, 75, 75]);
  assert.equal(international[11].price, 80, 'Budapest (82 €) queda fuera del top 12');
  assert.equal(international.some((card) => card.id === 'hu-budapest'), false);
  assert.ok(international.every((card) => card.price !== null));
  for (const block of [spain, international]) {
    assert.equal(new Set(ids(block)).size, block.length, 'sin repetidos');
    const firstUnpriced = block.findIndex((card) => card.price === null);
    if (firstUnpriced >= 0) assert.ok(block.slice(firstUnpriced).every((card) => card.price === null), 'sin precio siempre al final');
  }
  const tenerife = spain.find((card) => card.id === 'es-tenerife');
  assert.equal(tenerife.nights, 5);
  assert.equal(tenerife.transfers, 0);
  assert.equal(spain.find((card) => card.id === 'es-lanzarote').transfers, 1);
});

test('los destinos sin precio de escapada pero con vuelos ese mes van primero entre los «sin precio reciente»', () => {
  const { offers, seen } = monthly.pickOffers([
    rec('PMI', 36, '01-01', '01-06'),
    rec('SVQ', 51, '01-22', '01-28'), // 6 noches: no es escapada, pero hay vuelos a Sevilla
    rec('AGP', 60, '01-02', '01-12'), // 10 noches: igual con Málaga
    rec('FNC', 119, '01-18', '01-23'), // Madeira no es válida en enero: no cuenta
  ], 'MAD', 1, YEAR);
  assert.deepEqual([...offers.keys()], ['es-palma-de-mallorca']);
  assert.deepEqual([...seen].sort(), ['es-malaga', 'es-palma-de-mallorca', 'es-sevilla']);
  const { spain } = monthly.buildBlocks(offers, 'MAD', 1, undefined, 12, seen);
  assert.equal(spain[0].id, 'es-palma-de-mallorca');
  assert.deepEqual(ids(spain).slice(1, 3).sort(), ['es-malaga', 'es-sevilla']);
  assert.ok(spain.slice(1).every((card) => card.price === null));
  assert.equal(spain.length, 12);
  // Sin esa información el orden sigue siendo el de la lista de meses (temporada tranquila primero).
  const plain = monthly.buildBlocks(offers, 'MAD', 1).spain;
  assert.equal(plain.length, 12);
});

test('si hay más de 12 destinos con precio solo salen los 12 más baratos', () => {
  const spanish = ['PMI', 'TCI', 'LPA', 'IBZ', 'ACE', 'BCN', 'SVQ', 'AGP', 'ALC', 'FUE', 'SPC', 'LEI', 'VLC', 'BIO', 'MAH'];
  const { offers } = monthly.pickOffers(spanish.map((destination, index) => rec(destination, 30 + index, '01-10', '01-13')), 'MAD', 1, YEAR);
  const { spain } = monthly.buildBlocks(offers, 'MAD', 1);
  assert.equal(spain.length, 12);
  assert.ok(spain.every((card) => card.price !== null));
  assert.deepEqual(prices(spain), Array.from({ length: 12 }, (_, index) => 30 + index));
});

test('cada tarjeta lleva sus textos en los siete idiomas y no necesita el catálogo en el navegador', () => {
  const { offers } = monthly.pickOffers([rec('LIS', 46, '01-22', '01-24'), rec('PAR', 73, '01-14', '01-17')], 'MAD', 1, YEAR);
  const { international } = monthly.buildBlocks(offers, 'MAD', 1);
  const lisbon = international.find((card) => card.id === 'pt-lisboa');
  assert.deepEqual(Array.from(Object.keys(lisbon.texts)).sort(), ['ca', 'de', 'en', 'es', 'fr', 'it', 'pt']);
  for (const text of Object.values(lisbon.texts)) assert.ok(text.name && text.country && text.stay);
  assert.equal(lisbon.name, 'Lisboa');
  assert.equal(lisbon.texts.es.country, 'Portugal');
  assert.match(lisbon.texts.en.stay, /days/);
  assert.equal(lisbon.credit, null);
  const paris = international.find((card) => card.id === 'fr-paris');
  assert.ok(paris.credit === null || (paris.credit.source && 'credit' in paris.credit), 'solo las fichas francesas llevan atribución');
  assert.equal(JSON.stringify(lisbon).includes('recommendations'), false);
});

test('la fecha de la escapada se escribe corta y por idioma', () => {
  assert.equal(shared.formatTripRange('2027-01-26T08:10:00+01:00', '2027-01-29T21:30:00+01:00', 'es'), '26–29 ene');
  assert.equal(shared.formatTripRange('2027-01-29', '2027-02-01', 'es'), '29 ene – 1 feb');
  assert.match(shared.formatTripRange('2027-01-26', '2027-01-29', 'en'), /^26–29 Jan/);
  assert.equal(shared.formatTripRange('no', 'fecha', 'es'), '');
});

function provider(handler) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return handler(url, calls.length);
  };
  return { calls, fetchImpl };
}
const okPage = (data, extra = {}) => ({ ok: true, json: async () => ({ success: true, currency: 'eur', data, ...extra }) });
const madrid = shared.findMonthlyOrigin('MAD');

test('la consulta al proveedor: un mes de salida, dos de vuelta, EUR y el token solo en la cabecera', async () => {
  const { calls, fetchImpl } = provider(() => okPage([rec('LIS', 46, '01-22', '01-24')]));
  const result = await monthly.getMonthlyBlocks({ token: 'secreto', origin: madrid, month: 1, now: new Date('2026-11-13T10:00:00Z'), fetchImpl });
  assert.equal(calls.length, 2);
  assert.deepEqual(Array.from(calls, ({ url }) => url.searchParams.get('return_at')).sort(), ['2027-01', '2027-02']);
  for (const { url, init } of calls) {
    assert.equal(url.origin + url.pathname, 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
    assert.equal(url.searchParams.get('origin'), 'MAD');
    assert.equal(url.searchParams.get('departure_at'), '2027-01');
    assert.equal(url.searchParams.get('one_way'), 'false');
    assert.equal(url.searchParams.get('unique'), 'false');
    assert.equal(url.searchParams.get('sorting'), 'price');
    assert.equal(url.searchParams.get('currency'), 'EUR');
    assert.equal(url.searchParams.get('limit'), '1000');
    assert.equal(url.searchParams.get('page'), '1');
    assert.equal(init.headers['X-Access-Token'], 'secreto');
    assert.equal(url.href.includes('secreto'), false);
  }
  assert.equal(result.year, 2027);
  assert.equal(result.international.find((card) => card.id === 'pt-lisboa').price, 46);
  assert.equal(result.counts.providerRecords, 2, 'el mismo vuelo llega por las dos consultas y se cuenta una vez por destino');
  assert.equal(new Set(ids(result.international)).size, 12);
});

test('si una página viene llena y faltan destinos con precio, se pide la siguiente (máximo 3 páginas)', async () => {
  const full = Array.from({ length: 1000 }, () => rec('LIS', 99, '01-22', '01-24'));
  const { calls, fetchImpl } = provider((url) => okPage(url.searchParams.get('page') === '1' ? full : [rec('PAR', 73, '01-14', '01-17')]));
  const result = await monthly.getMonthlyBlocks({ token: 't', origin: madrid, month: 1, now: new Date('2026-11-13T10:00:00Z'), fetchImpl });
  assert.equal(calls.length, 4, 'páginas 1 y 2 de cada mes de vuelta');
  assert.deepEqual(Array.from(calls, ({ url }) => url.searchParams.get('page')), ['1', '1', '2', '2']);
  assert.ok(result.international.some((card) => card.id === 'fr-paris' && card.price === 73));
  const endless = provider(() => okPage(full));
  await monthly.getMonthlyBlocks({ token: 't', origin: madrid, month: 1, now: new Date('2026-11-13T10:00:00Z'), fetchImpl: endless.fetchImpl });
  assert.equal(endless.calls.length, 6, 'nunca más de 3 páginas por mes de vuelta');
});

test('un fallo del proveedor se propaga: no se muestran precios a medias', async () => {
  for (const response of [
    { ok: false, json: async () => ({}) },
    { ok: true, json: async () => ({ success: false }) },
    { ok: true, json: async () => ({ success: true, data: 'x' }) },
    { ok: true, json: async () => ({ success: true, currency: 'USD', data: [] }) },
  ]) {
    await assert.rejects(monthly.getMonthlyBlocks({ token: 't', origin: madrid, month: 1, fetchImpl: provider(() => response).fetchImpl }));
  }
});

function loadRoute(env, fetchImpl) {
  const route = loader(root, {}, { process: { env }, fetch: fetchImpl, Response, AbortSignal })('app/api/travelpayouts/monthly/route.ts');
  return route;
}
const get = (route, query) => route.GET({ url: `https://destinauta.com/api/travelpayouts/monthly${query}` });

test('la ruta de la API: configuración, validación y caché', async () => {
  const { fetchImpl, calls } = provider(() => okPage([rec('LIS', 46, '01-22', '01-24')]));
  const missingToken = await get(loadRoute({}, fetchImpl), '?month=1&origin=MAD');
  assert.equal(missingToken.status, 503);
  assert.equal((await missingToken.json()).error, 'not_configured');
  const route = loadRoute({ TRAVELPAYOUTS_API_TOKEN: 'secreto' }, fetchImpl);
  for (const query of ['', '?month=0&origin=MAD', '?month=13', '?month=x', '?month=1.5', '?month=1&origin=XXX', '?month=1&origin=PARIS', '?month=1&origin=']) {
    const response = await get(route, query);
    assert.equal(response.status, 400, query);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal((await response.json()).error, 'invalid_search');
  }
  assert.equal(calls.length, 0, 'una petición inválida nunca llega al proveedor');
});

test('la ruta devuelve los dos bloques, usa Madrid por defecto y guarda en caché las respuestas con precios', async () => {
  const month = 1, year = monthly.targetYear(month);
  const { fetchImpl, calls } = provider(() => okPage([
    rec('PMI', 36, '01-01', '01-06'), rec('LIS', 46, '01-22', '01-24'),
  ].map((r) => ({ ...r, departure_at: r.departure_at.replace(String(YEAR), String(year)), return_at: r.return_at.replace(String(YEAR), String(year)) }))));
  const route = loadRoute({ TRAVELPAYOUTS_API_TOKEN: 'secreto' }, fetchImpl);
  const response = await get(route, `?month=${month}`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Cache-Control'), /s-maxage=7200/);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.origin.code, 'MAD');
  assert.equal(body.month, 1);
  assert.equal(body.year, year);
  assert.equal(body.spain.length, 12);
  assert.equal(body.international.length, 12);
  assert.equal(body.spain[0].id, 'es-palma-de-mallorca');
  assert.equal(body.spain[0].price, 36);
  assert.equal(body.counts, undefined);
  assert.equal(JSON.stringify(body).includes('secreto'), false);
  assert.equal(calls[0].url.searchParams.get('origin'), 'MAD');
  const debug = await (await get(route, `?month=${month}&origin=tci&debug=1`)).json();
  assert.equal(debug.origin.code, 'TCI');
  assert.equal(calls.at(-1).url.searchParams.get('origin'), 'TCI');
  assert.equal(typeof debug.counts.providerRecords, 'number');
});

test('sin ningún precio la caché es corta y un fallo del proveedor no se guarda', async () => {
  const empty = loadRoute({ TRAVELPAYOUTS_API_TOKEN: 't' }, provider(() => okPage([])).fetchImpl);
  const emptyResponse = await get(empty, '?month=1&origin=BCN');
  assert.equal(emptyResponse.status, 200);
  assert.match(emptyResponse.headers.get('Cache-Control'), /s-maxage=600/);
  const body = await emptyResponse.json();
  assert.ok(body.spain.every((card) => card.price === null) && body.international.every((card) => card.price === null));
  const failing = loadRoute({ TRAVELPAYOUTS_API_TOKEN: 't' }, provider(() => ({ ok: false, json: async () => ({}) })).fetchImpl);
  const failure = await get(failing, '?month=1&origin=MAD');
  assert.equal(failure.status, 502);
  assert.equal(failure.headers.get('Cache-Control'), 'no-store');
  assert.equal((await failure.json()).error, 'provider_unavailable');
});
