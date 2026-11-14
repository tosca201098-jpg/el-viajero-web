// Actualización diaria de «Viajes por mes»: guardado en Supabase, mezcla con los precios de hoy, tarea diaria y vercel.json.
// Todo con datos simulados: ninguna prueba llama a Travelpayouts ni a Supabase, y los precios son de mentira.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loader } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const plain = (value) => JSON.parse(JSON.stringify(value));
const NOW = new Date('2026-11-13T10:00:00Z');
const YEAR = 2027; // enero se mira siempre en el año siguiente desde noviembre de 2026

// Supabase de mentira: guarda las filas en memoria y registra cada consulta.
function fakeSupabase(initialRows = []) {
  const state = { rows: initialRows.map((row) => ({ ...row })), upserts: [], deletes: [], selects: [], failUpsert: false, failSelect: false };
  const keyOf = (row) => [row.origin, row.destination_id, row.year, row.month].join('|');
  const client = {
    from(table) {
      assert.equal(table, 'monthly_prices');
      return {
        select(columns) {
          const query = { columns, filters: [] };
          state.selects.push(query);
          const builder = {
            eq(column, value) { query.filters.push(['eq', column, value]); return builder; },
            gte(column, value) { query.filters.push(['gte', column, value]); return builder; },
            then(resolve, reject) {
              if (state.failSelect) return Promise.resolve({ data: null, error: { message: 'boom' } }).then(resolve, reject);
              const data = state.rows.filter((row) => query.filters.every(([operator, column, value]) =>
                operator === 'eq' ? row[column] === value : row[column] >= value));
              return Promise.resolve({ data, error: null }).then(resolve, reject);
            },
          };
          return builder;
        },
        upsert(rows, options) {
          state.upserts.push({ rows, options });
          if (state.failUpsert) return Promise.resolve({ error: { message: 'boom' } });
          for (const row of rows) {
            const index = state.rows.findIndex((existing) => keyOf(existing) === keyOf(row));
            if (index >= 0) state.rows[index] = { ...row }; else state.rows.push({ ...row });
          }
          return Promise.resolve({ error: null });
        },
        delete() {
          return { lt(column, value) { state.deletes.push([column, value]); return Promise.resolve({ error: null }); } };
        },
      };
    },
  };
  return { client, state };
}

function loadAll(env = {}, supabase = fakeSupabase(), globals = {}) {
  const created = [];
  const mocks = { '@supabase/supabase-js': { createClient: (...args) => { created.push(args); return supabase.client; } } };
  const load = loader(root, mocks, { process: { env }, AbortSignal, ...globals });
  return { load, created, supabase };
}

const base = loadAll();
const monthly = base.load('lib/travelpayouts/monthly.ts');
const store = base.load('lib/travelpayouts/monthly-store.ts');
const shared = base.load('lib/travelpayouts/monthly-shared.ts');
const { getDestinationById } = base.load('lib/destinations/index.ts');

// Meses en los que la ficha de Lisboa es válida: la tarea diaria solo guarda esos (el catálogo manda, no la prueba).
const lisbonMonths = Array.from({ length: 12 }, (_, index) => index + 1)
  .filter((month) => monthly.isValidForMonth(getDestinationById('pt-lisboa'), month));

const row = (id, price, extra = {}) => ({
  origin: 'MAD', destination_id: id, year: YEAR, month: 1, price, departure_at: `${YEAR}-01-22`, return_at: `${YEAR}-01-24`,
  nights: 2, transfers: 0, offer_url: 'https://www.aviasales.com/search/MAD2201LIS24011?marker=test',
  seen_at: '2026-11-12T08:00:00.000Z', ...extra,
});
const offer = (id, price, extra = {}) => ({
  profile: getDestinationById(id), price, departureAt: `${YEAR}-01-22`, returnAt: `${YEAR}-01-24`, nights: 2, transfers: 0, offerUrl: null, ...extra,
});
const read = (client, extra = {}) => store.readStoredOffers(client, { origin: 'MAD', year: YEAR, month: 1, now: NOW, ...extra });

test('constantes: un precio guardado vale 3 días y se borra a los 30', () => {
  assert.equal(store.MAX_AGE_DAYS, 3);
  assert.equal(store.PURGE_AFTER_DAYS, 30);
  assert.equal(store.PRICES_TABLE, 'monthly_prices');
});

test('lectura: solo precios recientes, del aeropuerto y mes pedidos, con la fecha y el destino válidos', async () => {
  const { client, state } = fakeSupabase([
    row('pt-lisboa', 46),
    row('es-palma-de-mallorca', 36, { departure_at: `${YEAR}-01-01`, return_at: `${YEAR}-01-06`, nights: 5 }),
    row('fr-paris', 70, { seen_at: '2026-11-09T08:00:00.000Z' }), // visto hace más de 3 días
    row('de-berlin', 61, { seen_at: '2026-11-11T08:00:00.000Z' }), // visto hace 2 días: vale
    row('it-rome', 48, { origin: 'BCN' }), // otro aeropuerto
    row('it-milan', 35, { month: 2 }), // otro mes
  ]);
  const offers = await read(client);
  assert.deepEqual(Array.from(offers.keys()).sort(), ['de-berlin', 'es-palma-de-mallorca', 'pt-lisboa']);
  assert.equal(offers.get('pt-lisboa').price, 46);
  assert.equal(offers.get('pt-lisboa').nights, 2);
  assert.equal(offers.get('es-palma-de-mallorca').nights, 5);
  assert.match(offers.get('pt-lisboa').offerUrl, /^https:\/\/www\.aviasales\.com\/search\//);
  const [query] = state.selects;
  assert.deepEqual(query.filters.map(([operator, column]) => `${operator}:${column}`), ['eq:origin', 'eq:year', 'eq:month', 'gte:seen_at']);
  assert.equal(query.filters.find(([, column]) => column === 'seen_at')[2], '2026-11-10T10:00:00.000Z');
});

test('lectura: filas no válidas se descartan y nunca se enseñan', async () => {
  const bad = [
    row('xx-no-existe', 40), // ficha que no existe
    row('pt-madeira', 40), // enero no es válido para Madeira
    row('es-tenerife', 40, { origin: 'MAD', transfers: -1 }), // escalas imposibles: se queda en null, la oferta sí vale
    row('pt-lisboa', 0), // precio no válido
    row('fr-paris', 'gratis'),
    row('it-rome', 50, { nights: 1, return_at: `${YEAR}-01-23`, departure_at: `${YEAR}-01-22` }), // 1 noche
    row('it-milan', 50, { return_at: `${YEAR}-01-30` }), // 8 noches
    row('de-berlin', 50, { departure_at: `${YEAR}-02-03`, return_at: `${YEAR}-02-05` }), // sale en otro mes
    row('es-madrid', 50), // el propio aeropuerto de salida
    row('pt-porto', 50, { departure_at: '2027/01/22' }), // fecha mal escrita
    row('gr-athens', 50, { departure_at: `${YEAR}-01-05`, return_at: `${YEAR}-01-07` }), // ya habrá salido (ver prueba siguiente)
    null, 'texto', 5,
  ];
  const { client } = fakeSupabase(bad);
  const offers = await read(client);
  for (const id of ['xx-no-existe', 'pt-madeira', 'pt-lisboa', 'fr-paris', 'it-rome', 'it-milan', 'de-berlin', 'es-madrid', 'pt-porto']) {
    assert.equal(offers.has(id), false, id);
  }
  if (offers.has('es-tenerife')) assert.equal(offers.get('es-tenerife').transfers, null);
});

test('lectura: un viaje cuya salida ya pasó no se enseña, aunque el precio sea reciente', async () => {
  const { client } = fakeSupabase([row('pt-lisboa', 46, { departure_at: `${YEAR}-01-05`, return_at: `${YEAR}-01-07` })]);
  assert.equal((await read(client, { now: new Date(`${YEAR}-01-06T10:00:00Z`) })).size, 0);
  assert.equal((await read(client, { now: new Date(`${YEAR}-01-05T10:00:00Z`) })).size, 0, 'seen_at queda fuera de los 3 días');
  const recent = fakeSupabase([row('pt-lisboa', 46, { departure_at: `${YEAR}-01-05`, return_at: `${YEAR}-01-07`, seen_at: `${YEAR}-01-04T08:00:00.000Z` })]);
  assert.equal((await read(recent.client, { now: new Date(`${YEAR}-01-05T10:00:00Z`) })).size, 1, 'el día de la salida aún vale');
  assert.equal((await read(recent.client, { now: new Date(`${YEAR}-01-06T10:00:00Z`) })).size, 0);
});

test('lectura: sin Supabase, con error o con un mes inválido devuelve vacío y no falla', async () => {
  assert.equal((await read(null)).size, 0);
  const failing = fakeSupabase([row('pt-lisboa', 46)]);
  failing.state.failSelect = true;
  assert.equal((await read(failing.client)).size, 0);
  const throwing = { from() { throw new Error('sin red'); } };
  assert.equal((await read(throwing)).size, 0);
  assert.equal((await read(fakeSupabase([row('pt-lisboa', 46)]).client, { month: 13 })).size, 0);
});

test('guardado: una fila por destino, con upsert por aeropuerto, destino, año y mes', async () => {
  const { client, state } = fakeSupabase();
  const offers = new Map([['pt-lisboa', offer('pt-lisboa', 46)], ['fr-paris', offer('fr-paris', 73, { transfers: 1 })]]);
  const saved = await store.saveOffers(client, { origin: 'MAD', year: YEAR, month: 1, offers, now: NOW });
  assert.equal(saved, 2);
  assert.equal(state.upserts.length, 1);
  assert.equal(state.upserts[0].options.onConflict, 'origin,destination_id,year,month');
  const lisbon = state.rows.find((saved) => saved.destination_id === 'pt-lisboa');
  assert.deepEqual({ ...lisbon }, {
    origin: 'MAD', destination_id: 'pt-lisboa', year: YEAR, month: 1, price: 46, departure_at: `${YEAR}-01-22`,
    return_at: `${YEAR}-01-24`, nights: 2, transfers: 0, offer_url: null, seen_at: '2026-11-13T10:00:00.000Z',
  });
  // Al volver a guardar, el precio de hoy sustituye al anterior (no se acumulan filas).
  await store.saveOffers(client, { origin: 'MAD', year: YEAR, month: 1, offers: new Map([['pt-lisboa', offer('pt-lisboa', 52)]]), now: NOW });
  assert.equal(state.rows.length, 2);
  assert.equal(state.rows.find((saved) => saved.destination_id === 'pt-lisboa').price, 52);
});

test('guardado: si Supabase falla se avisa con un error y no se dice que se guardó', async () => {
  const { client, state } = fakeSupabase();
  state.failUpsert = true;
  await assert.rejects(store.saveOffers(client, { origin: 'MAD', year: YEAR, month: 1, offers: new Map([['pt-lisboa', offer('pt-lisboa', 46)]]), now: NOW }), /storage_error/);
});

test('guardado: muchos destinos se envían en bloques de 500', async () => {
  const { client, state } = fakeSupabase();
  const many = new Map(Array.from({ length: 1100 }, (_, index) => [`id-${index}`, offer('pt-lisboa', 40 + index)]));
  assert.equal(await store.saveOffers(client, { origin: 'MAD', year: YEAR, month: 1, offers: many, now: NOW }), 1100);
  assert.deepEqual(state.upserts.map((call) => call.rows.length), [500, 500, 100]);
});

test('limpieza: borra lo visto hace más de 30 días y los viajes ya pasados', async () => {
  const { client, state } = fakeSupabase();
  assert.equal(await store.purgeOldRows(client, NOW), true);
  assert.deepEqual(state.deletes.sort(), [['departure_at', '2026-11-13'], ['seen_at', '2026-10-14T10:00:00.000Z']]);
  assert.equal(await store.purgeOldRows({ from() { throw new Error('x'); } }, NOW), false);
});

test('mezcla: el precio de hoy manda; los guardados completan los destinos que hoy no salen', () => {
  const live = new Map([['pt-lisboa', offer('pt-lisboa', 46)]]);
  const stored = new Map([['pt-lisboa', offer('pt-lisboa', 30)], ['fr-paris', offer('fr-paris', 73)]]);
  const merged = monthly.mergeOffers(live, stored);
  assert.equal(merged.get('pt-lisboa').price, 46, 'el de hoy gana aunque el guardado sea más barato');
  assert.equal(merged.get('fr-paris').price, 73);
  assert.equal(merged.size, 2);
  assert.equal(monthly.mergeOffers(live).size, 1);
});

test('la API mensual: España se llena con precios guardados y se cuentan en `counts`', async () => {
  const okPage = (data) => ({ ok: true, json: async () => ({ success: true, currency: 'eur', data }) });
  const rec = (destination, price) => ({
    origin: 'MAD', destination, price, transfers: 0, departure_at: `${YEAR}-01-22T08:10:00+01:00`, return_at: `${YEAR}-01-24T21:30:00+01:00`,
    link: `/search/MAD2201${destination}24011?marker=test`,
  });
  const stored = new Map([['es-palma-de-mallorca', offer('es-palma-de-mallorca', 36)], ['pt-lisboa', offer('pt-lisboa', 99)]]);
  const result = await monthly.getMonthlyBlocks({
    token: 'secreto', origin: shared.findMonthlyOrigin('MAD'), month: 1, now: NOW, stored,
    fetchImpl: async () => okPage([rec('LIS', 46)]),
  });
  assert.deepEqual(plain(result.spain.map((card) => [card.id, card.price])), [['es-palma-de-mallorca', 36]]);
  assert.deepEqual(plain(result.international.map((card) => [card.id, card.price])), [['pt-lisboa', 46]], 'Lisboa: manda el precio de hoy');
  assert.equal(result.counts.storedOffers, 2);
  assert.equal(result.counts.usedFromStorage, 1);
  // Sin precios guardados todo funciona como antes.
  const withoutStored = await monthly.getMonthlyBlocks({ token: 'secreto', origin: shared.findMonthlyOrigin('MAD'), month: 1, now: NOW, fetchImpl: async () => okPage([rec('LIS', 46)]) });
  assert.equal(withoutStored.spain.length, 0);
  assert.equal(withoutStored.counts.storedOffers, 0);
});

test('la tarea diaria pide todas las páginas; la API se para cuando ya hay 12 + 12', async () => {
  const calls = [];
  const full = (page) => ({ ok: true, json: async () => ({ success: true, currency: 'eur', data: Array.from({ length: monthly.PAGE_SIZE }, (_, index) => ({
    origin: 'MAD', destination: 'LIS', price: 40 + index + page, transfers: 0,
    departure_at: `${YEAR}-01-22T08:10:00+01:00`, return_at: `${YEAR}-01-24T21:30:00+01:00`, link: '/search/MAD2201LIS24011',
  })) }) });
  const fetchImpl = async (url) => { calls.push(url.searchParams.get('page')); return full(Number(url.searchParams.get('page'))); };
  const result = await monthly.collectMonthlyOffers({ token: 't', origin: shared.findMonthlyOrigin('MAD'), month: 1, now: NOW, fetchImpl });
  assert.equal(calls.length, monthly.MAX_PAGES * 2, 'páginas llenas: las 3 de cada mes de vuelta');
  assert.equal(result.offers.get('pt-lisboa').price, 41);
  assert.equal(result.year, YEAR);
});

// --- Tarea diaria (cron) ---------------------------------------------------------------------------------------
// Respuesta del proveedor de mentira: un vuelo a Lisboa por mes, con el aeropuerto y el mes de la petición.
const byMonth = (url) => {
  const departure = url.searchParams.get('departure_at'); // YYYY-MM
  const month = Number(departure.slice(5, 7));
  const origin = url.searchParams.get('origin');
  return { ok: true, json: async () => ({ success: true, currency: 'eur', data: [
    { origin, destination: 'LIS', price: 40 + month, transfers: 0,
      departure_at: `${departure}-12T08:10:00+01:00`, return_at: `${departure}-14T21:30:00+01:00`, link: `/search/${origin}1201LIS14011` },
  ] }) };
};

function loadCron(env, { handler, supabase = fakeSupabase() } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, init }); return handler ? handler(url) : { ok: true, json: async () => ({ success: true, data: [] }) }; };
  const { load, created } = loadAll(env, supabase, { fetch: fetchImpl, Response, AbortSignal });
  const route = load('app/api/cron/monthly-prices/route.ts');
  return { route, calls, supabase, created };
}
const request = (query, authorization) => ({
  url: `https://destinauta.com/api/cron/monthly-prices${query}`,
  headers: { get: (name) => (name.toLowerCase() === 'authorization' ? authorization ?? null : null) },
});
const ENV = {
  CRON_SECRET: 'clave-de-prueba', TRAVELPAYOUTS_API_TOKEN: 'token-de-prueba',
  NEXT_PUBLIC_SUPABASE_URL: 'https://proyecto.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_prueba',
};

test('cron: sin CRON_SECRET no hace nada; con una clave incorrecta responde 401 y no toca el proveedor ni Supabase', async () => {
  const none = loadCron({ ...ENV, CRON_SECRET: undefined });
  const missing = await none.route.GET(request('?origin=MAD', 'Bearer clave-de-prueba'));
  assert.equal(missing.status, 503);
  const cron = loadCron(ENV);
  for (const authorization of [undefined, '', 'Bearer', 'Bearer otra', 'clave-de-prueba', 'bearer clave-de-prueba', 'Bearer clave-de-prueba ']) {
    const response = await cron.route.GET(request('?origin=MAD', authorization));
    assert.equal(response.status, 401, String(authorization));
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  }
  assert.equal(cron.calls.length, 0);
  assert.equal(cron.created.length, 0, 'ni siquiera se abre Supabase');
});

test('cron: falta la configuración del proveedor o de Supabase, o el aeropuerto no es válido', async () => {
  for (const missing of ['TRAVELPAYOUTS_API_TOKEN', 'SUPABASE_SECRET_KEY', 'NEXT_PUBLIC_SUPABASE_URL']) {
    const cron = loadCron({ ...ENV, [missing]: undefined });
    const response = await cron.route.GET(request('?origin=MAD', 'Bearer clave-de-prueba'));
    assert.equal(response.status, 503, missing);
    assert.equal((await response.json()).error, 'not_configured');
    assert.equal(cron.calls.length, 0);
  }
  const cron = loadCron(ENV);
  for (const query of ['', '?origin=XXX', '?origin=', '?origin=PARIS']) {
    const response = await cron.route.GET(request(query, 'Bearer clave-de-prueba'));
    assert.equal(response.status, 400, query);
  }
  assert.equal(cron.calls.length, 0);
});

test('cron: la clave antigua de Supabase (service role) también vale y la URL con /rest/v1 se corrige', async () => {
  const cron = loadCron({ ...ENV, SUPABASE_SECRET_KEY: undefined, SUPABASE_SERVICE_ROLE_KEY: 'antigua', NEXT_PUBLIC_SUPABASE_URL: 'https://proyecto.supabase.co/rest/v1/' });
  const response = await cron.route.GET(request('?origin=MAD', 'Bearer clave-de-prueba'));
  assert.equal(response.status, 200);
  assert.deepEqual(cron.created[0].slice(0, 2), ['https://proyecto.supabase.co', 'antigua']);
  assert.equal(cron.created[0][2].auth.persistSession, false);
});

test('cron: recorre los 12 meses empezando por el actual, guarda los precios y limpia lo antiguo', async () => {
  const supabase = fakeSupabase();
  const run = loadCron(ENV, { supabase, handler: byMonth });
  const response = await run.route.GET(request('?origin=BCN', 'Bearer clave-de-prueba'));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.origin, 'BCN');
  assert.equal(body.months.length, 12);
  assert.equal(body.failedMonths, 0);
  assert.deepEqual(body.skippedMonths, []);
  assert.equal(body.purged, true);
  assert.ok(lisbonMonths.length >= 6, 'Lisboa es válida en varios meses');
  assert.equal(body.saved, lisbonMonths.length);
  const thisMonth = new Date().getUTCMonth() + 1;
  assert.equal(body.months[0].month, thisMonth, 'empieza por el mes en curso');
  assert.deepEqual(Array.from(new Set(body.months.map((result) => result.month))).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(supabase.state.rows.length, lisbonMonths.length, 'una fila de Lisboa por cada mes válido');
  assert.deepEqual(supabase.state.rows.map((saved) => saved.month).sort((a, b) => a - b), lisbonMonths);
  assert.ok(supabase.state.rows.every((saved) => saved.origin === 'BCN' && saved.destination_id === 'pt-lisboa'));
  assert.equal(supabase.state.deletes.length, 2);
  assert.equal(JSON.stringify(body).includes('clave-de-prueba'), false);
  assert.equal(JSON.stringify(body).includes('token-de-prueba'), false);
  assert.ok(run.calls.length >= 24, 'dos peticiones (mes de vuelta) por cada mes');
  assert.ok(run.calls.every(({ init }) => init.headers['X-Access-Token'] === 'token-de-prueba'));
  assert.ok(run.calls.every(({ url }) => url.searchParams.get('origin') === 'BCN'));
});

test('cron: un mes que falla no impide guardar los demás, pero se ve como fallo (502)', async () => {
  const supabase = fakeSupabase();
  const flaky = loadCron(ENV, {
    supabase,
    handler: (url) => {
      const month = Number(url.searchParams.get('departure_at').slice(5, 7));
      if (month === 3) return { ok: false, json: async () => ({}) };
      return { ok: true, json: async () => ({ success: true, currency: 'eur', data: [] }) };
    },
  });
  const partial = await flaky.route.GET(request('?origin=MAD', 'Bearer clave-de-prueba'));
  assert.equal(partial.status, 502, 'un mes fallido se ve como fallo en Vercel, aunque los demás se hayan guardado');
  const body = await partial.json();
  assert.equal(body.success, false);
  assert.equal(body.failedMonths, 1);
  assert.equal(body.months.find((result) => result.month === 3).error, 'provider_unavailable');
  assert.equal(body.months.filter((result) => !result.error).length, 11);

  const down = loadCron(ENV, { handler: () => ({ ok: false, json: async () => ({}) }) });
  const all = await down.route.GET(request('?origin=MAD', 'Bearer clave-de-prueba'));
  assert.equal(all.status, 502);

  const brokenDb = fakeSupabase();
  brokenDb.state.failUpsert = true;
  const storage = loadCron(ENV, { supabase: brokenDb, handler: byMonth });
  const noSave = await storage.route.GET(request('?origin=MAD', 'Bearer clave-de-prueba'));
  assert.equal(noSave.status, 502, 'si Supabase rechaza el guardado, es un fallo visible');
  const storageBody = await noSave.json();
  assert.equal(storageBody.saved, 0);
  assert.equal(storageBody.failedMonths, lisbonMonths.length);
  assert.deepEqual(storageBody.months.filter((result) => result.error).map((result) => result.month).sort((a, b) => a - b), lisbonMonths);
  assert.ok(storageBody.months.every((result) => !result.error || result.error === 'storage_error'));
});

test('cron: respeta el límite de tiempo y deja los meses sin hacer para el día siguiente', async () => {
  const realNow = Date.now;
  let clock = 0;
  Date.now = () => clock;
  try {
    const cron = loadCron(ENV, {
      handler: () => { clock += 20000; return { ok: true, json: async () => ({ success: true, currency: 'eur', data: [] }) }; },
    });
    const response = await cron.route.GET(request('?origin=MAD', 'Bearer clave-de-prueba'));
    const body = await response.json();
    assert.equal(body.months.length, 3, 'solo un bloque de 3 meses antes de agotar los 40 s');
    assert.equal(body.skippedMonths.length, 9);
    assert.equal(body.success, false);
  } finally {
    Date.now = realNow;
  }
});

test('vercel.json: una tarea diaria por cada aeropuerto del selector, sin repetir y protegidas por la ruta', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.crons.length, shared.MONTHLY_ORIGINS.length);
  const codes = config.crons.map((cron) => new URL(cron.path, 'https://destinauta.com').searchParams.get('origin'));
  assert.deepEqual(codes, Array.from(shared.MONTHLY_ORIGINS, (origin) => origin.code));
  assert.equal(new Set(config.crons.map((cron) => cron.path)).size, config.crons.length);
  for (const cron of config.crons) {
    assert.match(cron.path, /^\/api\/cron\/monthly-prices\?origin=[A-Z]{3}$/);
    // Plan Hobby de Vercel: como máximo una ejecución al día (minuto y hora fijos, el resto asteriscos).
    assert.match(cron.schedule, /^\d{1,2} \d{1,2} \* \* \*$/, cron.schedule);
  }
  assert.deepEqual(Object.keys(config), ['crons']);
});

test('migración: tabla privada con RLS activado, sin permisos públicos y sin políticas', () => {
  const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20261113000000_create_monthly_prices.sql'), 'utf8');
  assert.match(sql, /create table public\.monthly_prices/);
  assert.match(sql, /primary key \(origin, destination_id, year, month\)/);
  assert.match(sql, /alter table public\.monthly_prices enable row level security/);
  assert.match(sql, /revoke all privileges on table public\.monthly_prices\s+from public, anon, authenticated/);
  assert.match(sql, /grant select, insert, update, delete on table public\.monthly_prices\s+to service_role/);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant[^;]*\bto\b[^;]*\b(anon|authenticated|public)\b/i);
});

test('la clave secreta nunca se usa en el navegador ni en variables públicas', () => {
  const walk = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
  const files = [...walk('app'), ...walk('lib')].filter((file) => /\.(ts|tsx)$/.test(file));
  const users = files.filter((file) => /SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY|CRON_SECRET/.test(fs.readFileSync(path.join(root, file), 'utf8')))
    .map((file) => file.replaceAll('\\', '/')).sort();
  assert.deepEqual(users, ['app/api/cron/monthly-prices/route.ts', 'lib/supabase/admin.ts']);
  for (const file of files) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(text, /NEXT_PUBLIC_[A-Z_]*(SECRET|SERVICE_ROLE)/, file);
    if (text.startsWith('"use client"') || text.startsWith("'use client'")) {
      assert.doesNotMatch(text, /supabase\/admin|monthly-store/, file);
    }
  }
});
