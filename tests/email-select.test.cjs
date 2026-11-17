// Correo de vuelos (fase 3, parte 2): a quién le toca, con qué filtros y ensayo SIN enviar. Todo con datos simulados:
// ninguna prueba llama a Supabase, a Resend ni a la red, y los precios son de mentira.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loader } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const DAY = 86400000;
const NOW_ISO = '2026-11-17T12:00:00.000Z';
const NOW = new Date(NOW_ISO);
const SEEN = '2026-11-15T01:00:00.000Z';
const SITE = 'https://destinauta.com';
const U1 = '11111111-1111-4111-8111-111111111111';
const U2 = '22222222-2222-4222-8222-222222222222';
const U3 = '33333333-3333-4333-8333-333333333333';
const U4 = '44444444-4444-4444-8444-444444444444';
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const plain = (value) => JSON.parse(JSON.stringify(value));
// Los objetos creados dentro del cargador de pruebas tienen otros prototipos: se comparan por su contenido.
const same = (actual, expected, message) => assert.deepEqual(actual === undefined ? actual : plain(actual), expected === undefined ? expected : plain(expected), message);
const ago = (ms) => new Date(NOW.getTime() - ms);

function fixedDate(iso) {
  const RealDate = Date;
  return class FixedDate extends RealDate {
    constructor(...args) { if (args.length === 0) super(iso); else super(...args); }
    static now() { return new RealDate(iso).getTime(); }
  };
}

// Supabase de mentira con tres tablas. Solo admite lecturas: cualquier escritura rompe la prueba.
function fakeDb({ preferences = [], sends = [], monthly = [], failPreferences = false, failSends = false } = {}) {
  const state = { calls: [], ranges: [], ins: [] };
  const tables = { email_preferences: preferences, email_sends: sends, monthly_prices: monthly };
  const client = {
    from(table) {
      state.calls.push(table);
      if (!Object.hasOwn(tables, table)) throw new Error(`tabla inesperada ${table}`);
      return {
        select(columns) {
          const query = { table, columns, filters: [], order: null, range: null, inIds: null };
          state.ranges.push(query);
          const builder = {
            eq(column, value) { query.filters.push(['eq', column, value]); return builder; },
            gte(column, value) { query.filters.push(['gte', column, value]); return builder; },
            in(column, values) { query.inIds = values; state.ins.push(values.length); return builder; },
            order(column) { query.order = column; return builder; },
            range(from, to) { query.range = [from, to]; return builder; },
            then(resolve, reject) {
              if ((table === 'email_preferences' && failPreferences) || (table === 'email_sends' && failSends)) {
                return Promise.resolve({ data: null, error: { message: 'boom' } }).then(resolve, reject);
              }
              let data = tables[table].filter((row) => query.filters.every(([operator, column, value]) =>
                operator === 'eq' ? row[column] === value : row[column] >= value));
              if (query.inIds) data = data.filter((row) => query.inIds.includes(row.user_id));
              if (query.range) data = data.slice(query.range[0], query.range[1] + 1);
              return Promise.resolve({ data, error: null }).then(resolve, reject);
            },
          };
          return builder;
        },
        insert() { throw new Error('el ensayo nunca escribe'); },
        upsert() { throw new Error('el ensayo nunca escribe'); },
        update() { throw new Error('el ensayo nunca escribe'); },
        delete() { throw new Error('el ensayo nunca escribe'); },
      };
    },
  };
  return { client, state };
}

function loadAll(env = {}, db = fakeDb(), globals = {}) {
  return loader(root, { '@supabase/supabase-js': { createClient: () => db.client } },
    { process: { env }, AbortSignal, console: { info() {} }, ...globals });
}

const base = loadAll();
const monthly = base('lib/travelpayouts/monthly.ts');
const { getDestinationById } = base('lib/destinations/index.ts');
const select = base('lib/email/select.ts');
const recipientsLib = base('lib/email/recipients.ts');
const logLib = base('lib/email/log.ts');
const config = base('lib/email/config.ts');

const validIn = (month) => monthly.candidatesForMonth(month).filter((profile) => !monthly.isOriginCity(profile, 'MAD'));
const spanishIds = validIn(3).filter((profile) => profile.countryCode === 'ES').slice(0, 4).map((profile) => profile.id);
const foreignIds = validIn(3).filter((profile) => profile.countryCode !== 'ES').slice(0, 4).map((profile) => profile.id);
assert.ok(spanishIds.length >= 3 && foreignIds.length >= 3, 'el catálogo tiene destinos españoles y extranjeros válidos para marzo');

const offer = (id, price, extra = {}) => ({
  profile: getDestinationById(id), price, departureAt: '2027-03-12', returnAt: '2027-03-14', nights: 2, transfers: 0,
  offerUrl: 'https://www.aviasales.com/search/X?marker=prueba', ...extra,
});
const pick = (id, price, extra = {}) => ({ offer: offer(id, price, extra), seenAt: new Date(SEEN), year: 2027, month: 3 });
const mixed = () => [
  pick(spanishIds[0], 40, { nights: 2 }), pick(spanishIds[1], 55, { nights: 3 }), pick(spanishIds[2], 70, { nights: 4 }),
  pick(foreignIds[0], 45, { nights: 2 }), pick(foreignIds[1], 90, { nights: 5 }), pick(foreignIds[2], 150, { nights: 4 }),
];

const row = (userId, extra = {}) => ({
  user_id: userId, airports: ['MAD'], months: [3, 6], trip_types: [], trip_length: null, reach: null, flight_budget: null,
  frequency: 'weekly', locale: 'es', email_consent: true, ...extra,
});
const rec = (userId, extra = {}) => select.parseRecipient(row(userId, extra));

// ───────────────────────── destinatarios ─────────────────────────

test('destinatario: solo con permiso, cuenta válida, aeropuerto y frecuencia; el resto de datos se limpia', () => {
  const ok = select.parseRecipient(row(U1, { trip_types: ['beach', 'beach', 'xx'], trip_length: 'weekend', reach: 'spain', flight_budget: 'up100', locale: 'fr', frequency: 'monthly' }));
  same(plain(ok), {
    userId: U1, airports: ['MAD'], months: [3, 6], tripTypes: ['beach'], tripLength: 'weekend', reach: 'spain', flightBudget: 'up100',
    frequency: 'monthly', locale: 'fr',
  });
  assert.equal(select.parseRecipient(row(U1, { email_consent: false })), null);
  assert.equal(select.parseRecipient(row(U1, { email_consent: 'true' })), null, 'solo un sí verdadero cuenta como permiso');
  assert.equal(select.parseRecipient(row(U1, { email_consent: undefined })), null);
  for (const userId of ['', 'abc', null, 5, '11111111-1111-4111-8111-11111111111Z']) assert.equal(select.parseRecipient(row(userId)), null, String(userId));
  assert.equal(select.parseRecipient(row(U1, { airports: [] })), null);
  assert.equal(select.parseRecipient(row(U1, { airports: ['XXX'] })), null, 'un aeropuerto que no existe no vale');
  assert.equal(select.parseRecipient(row(U1, { frequency: null })), null);
  assert.equal(select.parseRecipient(row(U1, { frequency: 'daily' })), null);
  for (const value of [null, undefined, 'x', 5, [], {}]) assert.equal(select.parseRecipient(value), null);
});

test('destinatario: máximos y valores raros (2 aeropuertos, 4 meses, idioma desconocido = español, sin datos extra)', () => {
  const many = rec(U1, { airports: ['BCN', 'MAD', 'VLC'], months: [12, 3, 6, 9, 1], locale: 'xx', reach: 'moon', trip_length: 'forever', flight_budget: '5' });
  same(plain(many.airports), ['BCN', 'MAD'], 'como mucho 2, en el orden elegido');
  same(plain(many.months), [3, 6, 9, 12], 'como mucho 4 (los 4 primeros válidos), ordenados');
  assert.equal(many.locale, 'es');
  assert.equal(many.reach, null);
  assert.equal(many.tripLength, null);
  assert.equal(many.flightBudget, null);
  const withEmail = select.parseRecipient({ ...row(U1), email: 'a@b.com', name: 'Ana' });
  same(Object.keys(withEmail).sort(), ['airports', 'flightBudget', 'frequency', 'locale', 'months', 'reach', 'tripLength', 'tripTypes', 'userId']);
  assert.ok(!JSON.stringify(withEmail).includes('a@b.com'), 'nunca se arrastran correos ni nombres');
});

// ───────────────────────── cuándo le toca ─────────────────────────

test('frecuencia: semanal 7 días, quincenal 14 y mensual 30, con 12 h de margen; sin envíos previos, le toca', () => {
  same(plain(select.FREQUENCY_DAYS), { weekly: 7, fortnightly: 14, monthly: 30 });
  assert.equal(select.isDue(null, 'weekly', NOW), true);
  assert.equal(select.isDue(ago(7 * DAY), 'weekly', NOW), true);
  assert.equal(select.isDue(ago(7 * DAY - 1000), 'weekly', NOW), true, 'por un segundo no se salta un día');
  assert.equal(select.isDue(ago(6.5 * DAY), 'weekly', NOW), true, 'justo en el margen de 12 h');
  assert.equal(select.isDue(ago(6.5 * DAY - 60000), 'weekly', NOW), false);
  assert.equal(select.isDue(ago(3 * DAY), 'weekly', NOW), false);
  assert.equal(select.isDue(ago(13 * DAY), 'fortnightly', NOW), false);
  assert.equal(select.isDue(ago(14 * DAY), 'fortnightly', NOW), true);
  assert.equal(select.isDue(ago(29 * DAY), 'monthly', NOW), false);
  assert.equal(select.isDue(ago(30 * DAY), 'monthly', NOW), true);
  assert.equal(select.isDue(new Date('nope'), 'weekly', NOW), true);
});

test('meses: los suyos del más próximo al más lejano; sin elegir, los tres siguientes; da la vuelta al año', () => {
  same(select.monthsFor({ months: [3, 6, 11, 1] }, NOW), [11, 1, 3, 6]);
  same(select.monthsFor({ months: [] }, NOW), [12, 1, 2]);
  same(select.monthsFor({ months: [] }, new Date('2026-12-20T12:00:00Z')), [1, 2, 3]);
  same(select.monthsFor({ months: [] }, new Date('2026-10-02T12:00:00Z')), [11, 12, 1]);
  same(select.monthsFor({ months: [2, 12] }, new Date('2026-12-20T12:00:00Z')), [12, 2]);
});

test('aeropuerto: con dos, un correo de cada uno por turnos', () => {
  const two = { airports: ['BCN', 'MAD'] };
  same([0, 1, 2, 3].map((count) => select.originFor(two, count)), ['BCN', 'MAD', 'BCN', 'MAD']);
  assert.equal(select.originFor({ airports: ['VLC'] }, 7), 'VLC');
  assert.equal(select.originFor(two, -3), 'BCN');
});

// ───────────────────────── filtros ─────────────────────────

test('alcance: se entiende como un máximo (España; Europa incluye España; lejos y «me da igual» no filtran)', () => {
  assert.equal(select.matchesReach('ES', 'spain'), true);
  assert.equal(select.matchesReach('FR', 'spain'), false);
  assert.equal(select.matchesReach('ES', 'europe'), true);
  assert.equal(select.matchesReach('FR', 'europe'), true);
  assert.equal(select.matchesReach('XX', 'europe'), false, 'un país que no es europeo no entra en «Europa»');
  for (const reach of ['far', 'any', null]) for (const country of ['ES', 'FR', 'XX']) assert.equal(select.matchesReach(country, reach), true);
});

test('alcance: todos los países del catálogo actual son europeos (si se añade uno de otro continente esta prueba avisa)', () => {
  const { destinationProfiles } = base('lib/destinations/index.ts');
  const unknown = Array.from(new Set(destinationProfiles.map((profile) => profile.countryCode))).filter((code) => !select.matchesReach(code, 'europe'));
  same(unknown, [], 'hay países sin clasificar como Europa: revisar EUROPE_CODES de lib/email/select.ts');
});

test('duración: fin de semana 2–3 noches, 4–5 días 3–5 noches, semana o más 4–5 (lo más largo que hay); sin elegir no filtra', () => {
  same(plain(select.NIGHTS_RANGE), { weekend: [2, 3], short: [3, 5], week: [4, 5] });
  const fits = (nights, tripLength) => select.matchesPreferences(pick(spanishIds[0], 50, { nights }), { tripLength, reach: null });
  same([2, 3, 4, 5].map((nights) => fits(nights, 'weekend')), [true, true, false, false]);
  same([2, 3, 4, 5].map((nights) => fits(nights, 'short')), [false, true, true, true]);
  same([2, 3, 4, 5].map((nights) => fits(nights, 'week')), [false, false, true, true]);
  same([2, 3, 4, 5].map((nights) => fits(nights, null)), [true, true, true, true]);
});

test('elección con filtros: precio máximo redondeado hacia arriba, duración y alcance; nunca se relajan para completar', () => {
  const all = mixed();
  const none = select.choosePicksFor(all, { tripLength: null, reach: null, flightBudget: null });
  same(none.map((item) => item.offer.price), [40, 45, 55]);
  const budget = select.choosePicksFor(all, { tripLength: null, reach: null, flightBudget: 'up100' });
  same(budget.map((item) => item.offer.price), [40, 45, 55]);
  assert.equal(select.choosePicksFor([pick(spanishIds[0], 100.2), pick(spanishIds[1], 99.9), pick(spanishIds[2], 50)], { tripLength: null, reach: null, flightBudget: 'up100' }).length, 2, '100,2 € se enseñaría como 101 €: pasa del tope');
  const spain = select.choosePicksFor(all, { tripLength: null, reach: 'spain', flightBudget: null });
  same(spain.map((item) => item.offer.profile.countryCode), ['ES', 'ES', 'ES']);
  const weekend = select.choosePicksFor(all, { tripLength: 'weekend', reach: null, flightBudget: null });
  assert.equal(weekend.length, 3, 'sale justo con las escapadas de 2–3 noches');
  assert.ok(weekend.every((item) => item.offer.nights <= 3));
  const strict = select.choosePicksFor(all, { tripLength: 'week', reach: 'spain', flightBudget: 'up100' });
  assert.equal(strict.length, 1, 'con filtros muy estrictos salen menos de 3 y el correo NO se envía (no se rellena con otros)');
});

// ───────────────────────── planificación ─────────────────────────

function plannerInput(recipients, history = new Map(), extra = {}) {
  const calls = [];
  const options = {
    recipients, history, now: NOW, limit: 10,
    loadPicks: async (origin, months) => { calls.push([origin, [...months]]); return mixed(); },
    ...extra,
  };
  return { options, calls };
}

test('plan: decide quién está listo, quién aún no le toca y a quién le faltan datos, sin enviar nada', async () => {
  const history = new Map([[U2, { lastSentAt: ago(2 * DAY), count: 3 }]]);
  const { options, calls } = plannerInput([rec(U1), rec(U2), rec(U3, { reach: 'spain', flight_budget: 'up100', trip_length: 'week' })], history);
  const planned = await select.planRun(options);
  const status = Object.fromEntries(planned.map((item) => [item.recipient.userId, item.status]));
  same(status, { [U1]: 'ready', [U2]: 'not_due', [U3]: 'not_enough_data' });
  const ready = planned.find((item) => item.status === 'ready');
  assert.equal(ready.picks.length, 3);
  assert.equal(ready.origin, 'MAD');
  same(plain(ready.months), [3, 6]);
  assert.equal(planned.find((item) => item.status === 'not_due').picks, undefined);
  assert.equal(planned.find((item) => item.status === 'not_enough_data').picks, undefined, 'sin datos suficientes no hay vuelos que enseñar');
  same(summarizeKeys(select.summarizePlan(planned)), { consenting: 3, due: 2, ready: 1, notDue: 1, notEnoughData: 1, overLimit: 0 });
  assert.equal(calls.length, 1, 'la misma combinación aeropuerto + meses se consulta una sola vez');
});
const summarizeKeys = (summary) => plain(summary);

test('plan: con dos aeropuertos reparte por turnos según los correos ya recibidos', async () => {
  const history = new Map([[U1, { lastSentAt: ago(10 * DAY), count: 1 }]]);
  const { options } = plannerInput([rec(U1, { airports: ['BCN', 'MAD'] }), rec(U2, { airports: ['BCN', 'MAD'] })], history);
  const planned = await select.planRun(options);
  assert.equal(planned.find((item) => item.recipient.userId === U1).origin, 'MAD', 'ya recibió uno de BCN: toca el de MAD');
  assert.equal(planned.find((item) => item.recipient.userId === U2).origin, 'BCN', 'el primero siempre es el primero de su lista');
});

test('plan: orden justo (quien nunca ha recibido va primero, después el último envío más antiguo) y tope diario', async () => {
  const history = new Map([[U1, { lastSentAt: ago(20 * DAY), count: 2 }], [U2, { lastSentAt: ago(40 * DAY), count: 2 }], [U3, { lastSentAt: ago(9 * DAY), count: 1 }]]);
  const { options } = plannerInput([rec(U1), rec(U2), rec(U3), rec(U4)], history, { limit: 2 });
  const planned = await select.planRun(options);
  same(planned.map((item) => item.recipient.userId), [U4, U2, U1, U3]);
  same(planned.map((item) => item.status), ['ready', 'ready', 'over_limit', 'over_limit'], 'solo 2 al día; el resto pasa al día siguiente');
  same(plain(select.summarizePlan(planned)), { consenting: 4, due: 4, ready: 2, notDue: 0, notEnoughData: 0, overLimit: 2 });
  const zero = await select.planRun({ ...options, limit: 0 });
  assert.ok(zero.every((item) => item.status === 'over_limit'), 'con tope 0 nadie queda listo');
});

test('plan: si la lectura de precios falla, esa persona queda «sin datos» y la tanda no se rompe', async () => {
  const { options } = plannerInput([rec(U1), rec(U2, { airports: ['BCN'] })], new Map(), {
    loadPicks: async (origin) => { if (origin === 'BCN') throw new Error('boom'); return mixed(); },
  });
  const planned = await select.planRun(options);
  same(Object.fromEntries(planned.map((item) => [item.recipient.userId, item.status])), { [U1]: 'ready', [U2]: 'not_enough_data' });
});

test('resumen del plan: solo cantidades (nunca identificadores, correos ni precios)', async () => {
  const { options } = plannerInput([rec(U1), rec(U2)]);
  const summary = select.summarizePlan(await select.planRun(options));
  same(Object.keys(summary).sort(), ['consenting', 'due', 'notDue', 'notEnoughData', 'overLimit', 'ready']);
  assert.ok(Object.values(summary).every((value) => Number.isInteger(value)));
});

// ───────────────────────── lectura de la base de datos ─────────────────────────

test('lectura de destinatarios: solo con permiso, sin pedir correos ni nombres, por páginas y descartando filas incompletas', async () => {
  const preferences = [row(U1), row(U2, { email_consent: false }), row(U3, { airports: [] }), row(U4)];
  const db = fakeDb({ preferences });
  const result = await recipientsLib.readConsentingRecipients(db.client);
  assert.equal(result.ok, true);
  same(result.recipients.map((item) => item.userId), [U1, U4]);
  const query = db.state.ranges[0];
  assert.equal(query.table, 'email_preferences');
  same(plain(query.filters), [['eq', 'email_consent', true]]);
  assert.equal(query.columns, 'user_id,airports,months,trip_types,trip_length,reach,flight_budget,frequency,locale,email_consent');
  assert.ok(!/email\b(?!_)|name|phone/i.test(query.columns.replace(/email_consent/g, '')), 'no pide correos ni nombres');
  same(query.range, [0, 499]);
});

test('lectura de destinatarios: más de una página; y si falla Supabase o no existe la tabla devuelve ok = false sin romper', async () => {
  const many = Array.from({ length: 1100 }, (_, index) => row(`00000000-0000-4000-8000-${String(index).padStart(12, '0')}`));
  const db = fakeDb({ preferences: many });
  const result = await recipientsLib.readConsentingRecipients(db.client);
  assert.equal(result.recipients.length, 1100);
  same(db.state.ranges.map((query) => query.range), [[0, 499], [500, 999], [1000, 1499]]);
  same(plain(await recipientsLib.readConsentingRecipients(fakeDb({ failPreferences: true }).client)), { ok: false, recipients: [] });
  const throwing = { from() { throw new Error('boom'); } };
  same(plain(await recipientsLib.readConsentingRecipients(throwing)), { ok: false, recipients: [] });
});

test('lectura del historial: solo envíos hechos, último y cuántos lleva cada cuenta, en bloques de 100; si falla, ok = false', async () => {
  const sends = [
    { user_id: U1, status: 'sent', sent_at: '2026-11-01T08:00:00.000Z' }, { user_id: U1, status: 'sent', sent_at: '2026-11-08T08:00:00.000Z' },
    { user_id: U1, status: 'failed', sent_at: null }, { user_id: U2, status: 'sent', sent_at: '2026-11-10T08:00:00.000Z' },
  ];
  const db = fakeDb({ sends });
  const result = await recipientsLib.readSendHistory(db.client, [U1, U2, U3]);
  assert.equal(result.ok, true);
  assert.equal(result.history.get(U1).count, 2);
  assert.equal(result.history.get(U1).lastSentAt.toISOString(), '2026-11-08T08:00:00.000Z');
  assert.equal(result.history.get(U2).count, 1);
  assert.equal(result.history.has(U3), false);
  same(plain(db.state.ranges[0].filters), [['eq', 'status', 'sent']]);
  const wide = Array.from({ length: 250 }, (_, index) => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`);
  const chunked = fakeDb();
  await recipientsLib.readSendHistory(chunked.client, wide);
  same(chunked.state.ins, [100, 100, 50]);
  same(plain(await recipientsLib.readSendHistory(fakeDb({ failSends: true }).client, [U1])), { ok: false, history: {} });
  same(plain((await recipientsLib.readSendHistory(fakeDb().client, [])).history), {});
});

// ───────────────────────── registro (log) ─────────────────────────

test('registro: solo números, sí/no y textos cortos y seguros; nunca correos, identificadores ni objetos', () => {
  const lines = [];
  const log = loadAll({}, fakeDb(), { console: { info: (line) => lines.push(line) } })('lib/email/log.ts');
  log.logEmailRun('plan', {
    ok: true, ready: 3, reason: 'not_enough_data', email: 'ana@example.com', user: U1, long: 'x'.repeat(41), spaced: 'con espacios',
    nested: { a: 1 }, nan: NaN, nothing: null, 'mala clave': 1,
  });
  assert.equal(lines.length, 1);
  assert.equal(lines[0], '[email:plan] {"ok":true,"ready":3,"reason":"not_enough_data","nothing":null}');
  assert.ok(!lines[0].includes('@') && !lines[0].includes(U1));
  assert.equal(typeof logLib.logEmailRun, 'function');
});

// ───────────────────────── ruta del ensayo ─────────────────────────

const ENV = { CRON_SECRET: 'clave-de-prueba', NEXT_PUBLIC_SUPABASE_URL: 'https://proyecto.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_prueba' };
const request = (auth = 'Bearer clave-de-prueba') => ({ url: `${SITE}/api/email/plan`, headers: { get: (header) => (header.toLowerCase() === 'authorization' ? auth : null) } });
const monthlyRow = (id, month, price, extra = {}) => ({
  origin: 'MAD', destination_id: id, year: 2027, month, price, departure_at: `2027-${String(month).padStart(2, '0')}-12`,
  return_at: `2027-${String(month).padStart(2, '0')}-14`, nights: 2, transfers: 0, offer_url: 'https://www.aviasales.com/search/X?marker=prueba',
  seen_at: SEEN, ...extra,
});

async function runPlan({ env = ENV, db = fakeDb(), auth, fetchCalls = [] } = {}) {
  const lines = [];
  const load = loadAll(env, db, {
    Response, Date: fixedDate(NOW_ISO), console: { info: (line) => lines.push(line) },
    fetch: async (...args) => { fetchCalls.push(args); throw new Error('el ensayo nunca llama a la red'); },
  });
  const route = load('app/api/email/plan/route.ts');
  const response = await route.GET(auth === undefined ? request() : request(auth));
  const raw = await response.text();
  return { response, raw, body: JSON.parse(raw), lines, db, fetchCalls };
}

test('ruta del ensayo: sin clave o con una equivocada, 401 y no se lee nada; sin configurar, 503', async () => {
  for (const auth of ['', 'Bearer otra', 'clave-de-prueba']) {
    const result = await runPlan({ auth });
    assert.equal(result.response.status, 401, auth);
    same(plain(result.body), { success: false, error: 'unauthorized' });
    same(result.db.state.calls, [], 'sin clave ni siquiera se consulta la base de datos');
  }
  for (const env of [{ ...ENV, CRON_SECRET: '' }, { ...ENV, SUPABASE_SECRET_KEY: '' }]) {
    const result = await runPlan({ env });
    assert.equal(result.response.status, 503);
    same(result.db.state.calls, []);
  }
});

test('ruta del ensayo: sin tabla email_preferences lo dice y no hace nada más', async () => {
  const result = await runPlan({ db: fakeDb({ failPreferences: true }) });
  assert.equal(result.response.status, 200);
  same(plain(result.body), { success: false, dry: true, error: 'preferences_unavailable' });
  same(result.lines, ['[email:plan] {"ok":false,"reason":"preferences_unavailable"}']);
  same(result.db.state.calls, ['email_preferences']);
});

test('ruta del ensayo: devuelve SOLO cantidades, no escribe, no llama a la red y deja una línea en el registro', async () => {
  const preferences = [row(U1), row(U2, { airports: ['MAD'], frequency: 'monthly' }), row(U3, { email_consent: false })];
  const sends = [{ user_id: U2, status: 'sent', sent_at: ago(2 * DAY).toISOString() }];
  const rows = [monthlyRow(spanishIds[0], 3, 40), monthlyRow(spanishIds[1], 3, 55), monthlyRow(foreignIds[0], 6, 45), monthlyRow(foreignIds[1], 6, 90)];
  const result = await runPlan({ db: fakeDb({ preferences, sends, monthly: rows }) });
  assert.equal(result.response.status, 200);
  same(plain(result.body), {
    success: true, dry: true, consenting: 2, due: 1, ready: 1, notDue: 1, notEnoughData: 0, overLimit: 0, limit: 90, historyAvailable: true, live: false,
  });
  assert.equal(result.response.headers.get('Cache-Control'), 'no-store');
  assert.ok(!result.raw.includes(U1) && !result.raw.includes('@') && !result.raw.includes(spanishIds[0]), 'ni identificadores, ni correos ni destinos');
  same(result.fetchCalls, [], 'no llama a Resend ni a nadie');
  assert.equal(result.lines.length, 1);
  assert.match(result.lines[0], /^\[email:plan\] \{"ok":true,"consenting":2,"due":1,"ready":1,/);
  assert.ok(!result.lines[0].includes(U1));
  same([...new Set(result.db.state.calls)].sort(), ['email_preferences', 'email_sends', 'monthly_prices']);
});

test('ruta del ensayo: si el historial no se puede leer lo avisa (todos cuentan como «sin envíos previos»)', async () => {
  const result = await runPlan({ db: fakeDb({ preferences: [row(U1)], failSends: true }) });
  assert.equal(result.body.success, true);
  assert.equal(result.body.historyAvailable, false);
  assert.equal(result.body.consenting, 1);
});

// ───────────────────────── configuración y código ─────────────────────────

test('tope diario: 90 correos (el plan gratuito de Resend admite 100 al día, con margen para las pruebas)', () => {
  assert.equal(config.DAILY_SEND_LIMIT, 90);
});

test('vercel.json: la tarea del ensayo es una sola, sin parámetros y con un calendario que no llega a ejecutarse sola', () => {
  const crons = JSON.parse(read('vercel.json')).crons.filter((cron) => cron.path.startsWith('/api/email/plan'));
  same(crons, [{ path: '/api/email/plan', schedule: '0 0 29 2 *' }]);
});

test('migración email_sends: tabla privada (sin permisos para cuentas ni visitantes), un envío por cuenta y día, sin correos', () => {
  const sql = read('supabase/migrations/20261118000000_create_email_sends.sql');
  assert.match(sql, /create table public\.email_sends/);
  assert.match(sql, /alter table public\.email_sends enable row level security;/);
  assert.match(sql, /revoke all privileges on table public\.email_sends from public, anon, authenticated;/);
  assert.match(sql, /constraint email_sends_one_per_day unique \(user_id, kind, send_day\)/);
  assert.match(sql, /status in \('claimed', 'sent', 'failed'\)/);
  assert.match(sql, /references auth\.users\(id\) on delete cascade/);
  assert.doesNotMatch(sql, /create policy|grant (select|insert|update|delete)/i, 'sin políticas ni permisos: solo la clave de servicio');
  assert.doesNotMatch(sql, /\bemail\s+text|mail_address|recipient|body|subject/i, 'no guarda correos ni contenido');
  assert.match(sql, /^begin;/m);
  assert.match(sql, /commit;\s*$/);
});

test('código: el ensayo solo LEE (nada de escribir, enviar ni leer usuarios) y no toca EMAIL_SERVICE_LIVE más que para informar', () => {
  const files = ['app/api/email/plan/route.ts', 'lib/email/select.ts', 'lib/email/recipients.ts', 'lib/email/log.ts'];
  const combined = files.map(read).join('\n');
  assert.doesNotMatch(combined, /\.(upsert|insert|update|delete)\(/);
  assert.doesNotMatch(combined, /resend|fetch\(|auth\.admin|listUsers|getUserById|getUser\(/i);
  assert.doesNotMatch(combined, /RESEND_API_KEY|EMAIL_TEST_RECIPIENT/);
  assert.equal((read('app/api/email/plan/route.ts').match(/EMAIL_SERVICE_LIVE/g) ?? []).length, 2, 'se importa y se muestra, nada más');
  const route = read('app/api/email/plan/route.ts');
  const exported = Array.from(route.matchAll(/^export (?:async )?(?:function|const) (\w+)/gm), (match) => match[1]).sort();
  same(exported, ['GET', 'dynamic', 'maxDuration', 'runtime']);
  assert.match(read('lib/email-preferences/options.ts'), /export const EMAIL_SERVICE_LIVE = false;/, 'el envío real sigue bloqueado');
});
