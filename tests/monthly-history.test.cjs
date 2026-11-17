// Historial semanal de precios de «Viajes por mes»: tabla privada nueva, guardado desde la tarea diaria (solo los lunes),
// limpieza y garantía de que nunca hace fallar la tarea de siempre. Todo con datos simulados: ninguna prueba llama a
// Travelpayouts ni a Supabase, y los precios son de mentira.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loader } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const MONDAY = '2026-11-16T01:30:00.000Z';
const TUESDAY = '2026-11-17T01:30:00.000Z';
const YEAR = 2027;
const plain = (value) => JSON.parse(JSON.stringify(value));

// Reloj de mentira para el código que se carga con el cargador de pruebas: `new Date()` y `Date.now()` dan siempre la misma hora.
function fixedDate(iso) {
  const RealDate = Date;
  return class FixedDate extends RealDate {
    constructor(...args) { if (args.length === 0) super(iso); else super(...args); }
    static now() { return new RealDate(iso).getTime(); }
  };
}

// Supabase de mentira con las dos tablas: el último precio (`monthly_prices`) y el historial.
function fakeDb() {
  const state = {
    prices: [], history: [], historyUpserts: [], historyDeletes: [], pricesDeletes: [], tables: [],
    failHistory: false, throwHistory: false, failPricesAfter: Infinity, pricesUpserts: 0,
  };
  const historyKey = (row) => [row.origin, row.destination_id, row.year, row.month, row.seen_on].join('|');
  const client = {
    from(table) {
      state.tables.push(table);
      if (table === 'monthly_price_history') {
        return {
          upsert(rows, options) {
            state.historyUpserts.push({ rows, options });
            if (state.throwHistory) throw new Error('boom');
            if (state.failHistory) return Promise.resolve({ error: { message: 'boom' } });
            for (const row of rows) {
              const index = state.history.findIndex((existing) => historyKey(existing) === historyKey(row));
              if (index >= 0) state.history[index] = { ...row }; else state.history.push({ ...row });
            }
            return Promise.resolve({ error: null });
          },
          delete() {
            return {
              lt(column, value) {
                state.historyDeletes.push([column, value]);
                if (state.throwHistory) throw new Error('boom');
                return Promise.resolve({ error: state.failHistory ? { message: 'boom' } : null });
              },
            };
          },
        };
      }
      assert.equal(table, 'monthly_prices');
      return {
        upsert(rows) {
          state.pricesUpserts += 1;
          if (state.pricesUpserts > state.failPricesAfter) return Promise.resolve({ error: { message: 'boom' } });
          state.prices.push(...rows);
          return Promise.resolve({ error: null });
        },
        delete() { return { lt(column, value) { state.pricesDeletes.push([column, value]); return Promise.resolve({ error: null }); } }; },
      };
    },
  };
  return { client, state };
}

function loadAll(env = {}, db = fakeDb(), globals = {}) {
  const mocks = { '@supabase/supabase-js': { createClient: () => db.client } };
  return loader(root, mocks, { process: { env }, AbortSignal, ...globals });
}

const base = loadAll();
const history = base('lib/travelpayouts/monthly-history.ts');
const monthly = base('lib/travelpayouts/monthly.ts');
const { getDestinationById } = base('lib/destinations/index.ts');
const lisbonMonths = Array.from({ length: 12 }, (_, index) => index + 1)
  .filter((month) => monthly.isValidForMonth(getDestinationById('pt-lisboa'), month));

const offer = (id, price, extra = {}) => ({
  profile: getDestinationById(id), price, departureAt: `${YEAR}-01-22`, returnAt: `${YEAR}-01-24`, nights: 2, transfers: 0,
  offerUrl: 'https://www.aviasales.com/search/MAD2201LIS24011?marker=test', ...extra,
});
const offersMap = (...items) => new Map(items.map((item) => [item.profile.id, item]));

test('constantes: se guarda solo los lunes y durante 120 días, en la tabla monthly_price_history', () => {
  assert.equal(history.HISTORY_TABLE, 'monthly_price_history');
  assert.deepEqual(Array.from(history.HISTORY_WEEKDAYS), [1]);
  assert.equal(history.HISTORY_RETENTION_DAYS, 120);
});

test('día de guardado: solo el lunes (hora UTC)', () => {
  const days = ['2026-11-15', '2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-23'];
  assert.deepEqual(days.map((day) => history.isHistoryDay(new Date(`${day}T12:00:00Z`))),
    [false, true, false, false, false, false, false, true]);
  assert.equal(history.isHistoryDay(new Date('2026-11-16T00:00:00Z')), true, 'el lunes desde las 00:00 UTC');
  assert.equal(history.isHistoryDay(new Date('2026-11-16T23:59:59Z')), true, 'hasta las 23:59 UTC');
  assert.equal(history.isHistoryDay(new Date('2026-11-17T00:00:00Z')), false);
});

test('fila: solo lo imprescindible, con el día de hoy y sin enlaces ni fechas del viaje', () => {
  const row = history.toHistoryRow('MAD', YEAR, 1, offer('pt-lisboa', 46, { transfers: 1 }), new Date(MONDAY));
  assert.deepEqual(JSON.parse(JSON.stringify(row)), {
    origin: 'MAD', destination_id: 'pt-lisboa', year: YEAR, month: 1, seen_on: '2026-11-16', price: 46, nights: 2, transfers: 1,
  });
  assert.equal(history.toHistoryRow('BCN', YEAR, 1, offer('pt-lisboa', 46, { transfers: null }), new Date(MONDAY)).transfers, null);
  // Cerca de medianoche UTC el día sigue siendo el UTC.
  assert.equal(history.historyDay(new Date('2026-11-16T23:59:59Z')), '2026-11-16');
});

test('guardado: un upsert por bloque, por aeropuerto, destino, año, mes y día; un precio del día sustituye al anterior del mismo día', async () => {
  const { client, state } = fakeDb();
  const result = await history.saveHistory(client, {
    origin: 'MAD', year: YEAR, month: 1, now: new Date(MONDAY),
    offers: offersMap(offer('pt-lisboa', 46), offer('fr-paris', 70)),
  });
  assert.deepEqual(plain(result), { saved: 2, error: false });
  assert.equal(state.historyUpserts.length, 1);
  assert.equal(state.historyUpserts[0].options.onConflict, 'origin,destination_id,year,month,seen_on');
  assert.deepEqual(state.history.map((row) => row.destination_id).sort(), ['fr-paris', 'pt-lisboa']);
  assert.ok(state.history.every((row) => row.seen_on === '2026-11-16' && row.origin === 'MAD'));
  assert.deepEqual(state.tables, ['monthly_price_history'], 'no toca monthly_prices');

  await history.saveHistory(client, { origin: 'MAD', year: YEAR, month: 1, now: new Date('2026-11-16T09:00:00Z'), offers: offersMap(offer('pt-lisboa', 39)) });
  assert.equal(state.history.length, 2, 'mismo día: se sustituye, no se duplica');
  assert.equal(state.history.find((row) => row.destination_id === 'pt-lisboa').price, 39);

  await history.saveHistory(client, { origin: 'MAD', year: YEAR, month: 1, now: new Date('2026-11-23T01:00:00Z'), offers: offersMap(offer('pt-lisboa', 52)) });
  assert.equal(state.history.length, 3, 'otra semana: una fila nueva (así se forma el historial)');
});

test('guardado: sin precios no se llama a Supabase; con muchos destinos se envían en bloques de 500', async () => {
  const empty = fakeDb();
  assert.deepEqual(plain(await history.saveHistory(empty.client, { origin: 'MAD', year: YEAR, month: 1, offers: new Map(), now: new Date(MONDAY) })), { saved: 0, error: false });
  assert.equal(empty.state.tables.length, 0);

  const many = fakeDb();
  const big = new Map(Array.from({ length: 1200 }, (_, index) => {
    const item = offer('pt-lisboa', 40 + (index % 50));
    return [`destino-${index}`, { ...item, profile: { ...item.profile, id: `destino-${index}` } }];
  }));
  const result = await history.saveHistory(many.client, { origin: 'MAD', year: YEAR, month: 1, offers: big, now: new Date(MONDAY) });
  assert.deepEqual(plain(result), { saved: 1200, error: false });
  assert.deepEqual(many.state.historyUpserts.map((call) => call.rows.length), [500, 500, 200]);
});

test('guardado: si Supabase rechaza el guardado o lanza un error, nunca se lanza y se avisa', async () => {
  const failing = fakeDb();
  failing.state.failHistory = true;
  assert.deepEqual(plain(await history.saveHistory(failing.client, { origin: 'MAD', year: YEAR, month: 1, now: new Date(MONDAY), offers: offersMap(offer('pt-lisboa', 46)) })),
    { saved: 0, error: true });
  const throwing = fakeDb();
  throwing.state.throwHistory = true;
  assert.deepEqual(plain(await history.saveHistory(throwing.client, { origin: 'MAD', year: YEAR, month: 1, now: new Date(MONDAY), offers: offersMap(offer('pt-lisboa', 46)) })),
    { saved: 0, error: true });
});

test('limpieza: borra lo guardado hace más de 120 días y nunca falla', async () => {
  const { client, state } = fakeDb();
  assert.equal(await history.purgeHistory(client, new Date(MONDAY)), true);
  assert.deepEqual(state.historyDeletes, [['seen_on', '2026-07-19']], '2026-11-16 menos 120 días');
  const failing = fakeDb();
  failing.state.failHistory = true;
  assert.equal(await history.purgeHistory(failing.client, new Date(MONDAY)), false);
  const throwing = fakeDb();
  throwing.state.throwHistory = true;
  assert.equal(await history.purgeHistory(throwing.client, new Date(MONDAY)), false);
});

// --- Tarea diaria (cron) ---------------------------------------------------------------------------------------
const byMonth = (url) => {
  const departure = url.searchParams.get('departure_at'); // YYYY-MM
  const month = Number(departure.slice(5, 7));
  const origin = url.searchParams.get('origin');
  return { ok: true, json: async () => ({ success: true, currency: 'eur', data: [
    { origin, destination: 'LIS', price: 40 + month, transfers: 0,
      departure_at: `${departure}-12T08:10:00+01:00`, return_at: `${departure}-14T21:30:00+01:00`, link: `/search/${origin}1201LIS14011` },
  ] }) };
};
const ENV = {
  CRON_SECRET: 'clave-de-prueba', TRAVELPAYOUTS_API_TOKEN: 'token-de-prueba',
  NEXT_PUBLIC_SUPABASE_URL: 'https://proyecto.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_prueba',
};
const request = (query) => ({
  url: `https://destinauta.com/api/cron/monthly-prices${query}`,
  headers: { get: (name) => (name.toLowerCase() === 'authorization' ? 'Bearer clave-de-prueba' : null) },
});
function runCron(iso, { db = fakeDb(), handler = byMonth, query = '?origin=MAD' } = {}) {
  const fetchImpl = async (url) => handler(url);
  const load = loadAll(ENV, db, { fetch: fetchImpl, Response, AbortSignal, Date: fixedDate(iso) });
  const route = load('app/api/cron/monthly-prices/route.ts');
  return route.GET(request(query)).then(async (response) => ({ response, body: await response.json(), db }));
}

test('cron en lunes: guarda el historial de cada mes con los precios de hoy y limpia lo antiguo, sin cambiar lo demás', async () => {
  const { response, body, db } = await runCron(MONDAY);
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.saved, lisbonMonths.length, 'monthly_prices se guarda igual que siempre');
  assert.equal(db.state.prices.length, lisbonMonths.length);
  assert.deepEqual(plain(body.history), { day: true, saved: lisbonMonths.length, failedMonths: 0, purged: true });
  assert.equal(db.state.history.length, lisbonMonths.length);
  assert.deepEqual(db.state.history.map((row) => row.month).sort((a, b) => a - b), lisbonMonths);
  assert.ok(db.state.history.every((row) => row.origin === 'MAD' && row.destination_id === 'pt-lisboa' && row.seen_on === '2026-11-16'));
  assert.ok(db.state.history.every((row) => row.price === 40 + row.month && row.nights === 2), 'el precio es el que devolvió el proveedor ese día');
  assert.deepEqual(db.state.historyDeletes, [['seen_on', '2026-07-19']]);
  assert.equal(db.state.pricesDeletes.length, 2, 'la limpieza de monthly_prices sigue igual');
  assert.ok(body.months.every((result) => result.error === undefined && result.historyError === false));
});

test('cron en cualquier otro día: no toca el historial y la respuesta lo dice', async () => {
  const { response, body, db } = await runCron(TUESDAY);
  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.deepEqual(plain(body.history), { day: false, saved: 0, failedMonths: 0, purged: null });
  assert.equal(db.state.history.length, 0);
  assert.equal(db.state.historyUpserts.length, 0);
  assert.equal(db.state.historyDeletes.length, 0);
  assert.ok(!db.state.tables.includes('monthly_price_history'), 'ni siquiera se abre la tabla');
  assert.equal(db.state.prices.length, lisbonMonths.length);
});

test('cron en lunes: si el historial falla (por ejemplo, la tabla aún no existe) la tarea de siempre sigue igual: 200 y todo guardado', async () => {
  for (const mode of ['failHistory', 'throwHistory']) {
    const db = fakeDb();
    db.state[mode] = true;
    const { response, body } = await runCron(MONDAY, { db });
    assert.equal(response.status, 200, mode);
    assert.equal(body.success, true, mode);
    assert.equal(body.failedMonths, 0, mode);
    assert.equal(body.saved, lisbonMonths.length, mode);
    assert.equal(db.state.prices.length, lisbonMonths.length, mode);
    assert.deepEqual(plain(body.history), { day: true, saved: 0, failedMonths: lisbonMonths.length, purged: false }, mode);
  }
});

test('cron en lunes: el historial solo recibe precios que devolvió hoy el proveedor, nunca los guardados de antes', async () => {
  const quiet = await runCron(MONDAY, { handler: () => ({ ok: true, json: async () => ({ success: true, currency: 'eur', data: [] }) }) });
  assert.equal(quiet.body.saved, 0);
  assert.equal(quiet.db.state.history.length, 0);
  assert.equal(quiet.body.history.saved, 0);
  assert.equal(quiet.body.history.failedMonths, 0);
});

test('cron en lunes: un mes que falla en el proveedor o al guardar el precio no apunta nada en el historial y sigue viéndose como fallo', async () => {
  const brokenPrices = fakeDb();
  brokenPrices.state.failPricesAfter = 0;
  const { response, body, db } = await runCron(MONDAY, { db: brokenPrices });
  assert.equal(response.status, 502);
  assert.equal(body.failedMonths, lisbonMonths.length);
  assert.equal(db.state.history.length, 0, 'si no se pudo guardar el precio de hoy, tampoco se apunta en el historial');

  const down = await runCron(MONDAY, { handler: () => ({ ok: false, json: async () => ({}) }) });
  assert.equal(down.response.status, 502);
  assert.equal(down.db.state.history.length, 0);
});

test('cron: los archivos de la tarea no cambian de forma (vercel.json igual; sin claves nuevas en el navegador)', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  // Solo cuentan las tareas de precios (otras PR pueden añadir tareas de otro tipo, como el correo de prueba).
  const priceCrons = config.crons.filter((cron) => cron.path.startsWith('/api/cron/monthly-prices'));
  assert.equal(priceCrons.length, 10, 'siguen siendo 10 tareas de precios, una por aeropuerto');
  const route = fs.readFileSync(path.join(root, 'app/api/cron/monthly-prices/route.ts'), 'utf8');
  assert.match(route, /process\.env\.CRON_SECRET/);
  assert.doesNotMatch(route, /NEXT_PUBLIC_SUPABASE_(SECRET|SERVICE)/);
});

test('migración: tabla privada con RLS activado, sin permisos públicos, sin políticas y con las mismas columnas que se guardan', () => {
  const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20261117100000_create_monthly_price_history.sql'), 'utf8');
  assert.match(sql, /create table public\.monthly_price_history/);
  assert.match(sql, /primary key \(origin, destination_id, year, month, seen_on\)/);
  assert.match(sql, /alter table public\.monthly_price_history enable row level security/);
  assert.match(sql, /revoke all privileges on table public\.monthly_price_history\s+from public, anon, authenticated/);
  assert.match(sql, /grant select, insert, update, delete on table public\.monthly_price_history\s+to service_role/);
  assert.doesNotMatch(sql, /create policy/i);
  assert.doesNotMatch(sql, /grant[^;]*\bto\b[^;]*\b(anon|authenticated|public)\b/i);
  const body = sql.slice(sql.indexOf('create table'), sql.indexOf('primary key'));
  const columns = Array.from(body.matchAll(/^\s{2}([a-z_]+) [a-z]/gm), (match) => match[1]);
  const row = history.toHistoryRow('MAD', YEAR, 1, offer('pt-lisboa', 46), new Date(MONDAY));
  assert.deepEqual(columns.sort(), Object.keys(row).sort(), 'columnas de la tabla = campos que guarda el código');
});
