// Correo de vuelos (fase 3, parte 3): envío automático con todos sus candados. Todo con datos simulados: ninguna prueba llama a
// Supabase, a Resend ni a la red, y los precios y los correos son de mentira.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { loader } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const DAY = 86400000;
const NOW_ISO = '2026-11-17T12:00:00.000Z';
const NOW = new Date(NOW_ISO);
const TODAY = '2026-11-17';
const SEEN = '2026-11-15T01:00:00.000Z';
const SITE = 'https://destinauta.com';
const SECRET = 'una-clave-secreta-de-prueba-de-mas-de-32-caracteres';
const CRON = 'clave-de-prueba';
const U1 = '11111111-1111-4111-8111-111111111111';
const U2 = '22222222-2222-4222-8222-222222222222';
const U3 = '33333333-3333-4333-8333-333333333333';
const U4 = '44444444-4444-4444-8444-444444444444';
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
// El código sin comentarios, para comprobar lo que hace y no lo que dicen los comentarios.
const code = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
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

const baseLoad = loader(root, { 'node:crypto': crypto, '@supabase/supabase-js': { createClient: () => null } },
  { process: { env: {} }, AbortSignal, Buffer, Response, console: { info() {} } });
const realOptions = baseLoad('lib/email-preferences/options.ts');
const select = baseLoad('lib/email/select.ts');
const monthly = baseLoad('lib/travelpayouts/monthly.ts');
const { getDestinationById } = baseLoad('lib/destinations/index.ts');
const unsubscribe = baseLoad('lib/email/unsubscribe.ts');
const gate = baseLoad('lib/email/gate.ts');
const config = baseLoad('lib/email/config.ts');
const texts = baseLoad('lib/email/texts.ts');
const store = baseLoad('lib/email/send-store.ts');
const sender = baseLoad('lib/email/sender.ts');

const validIn = (month) => monthly.candidatesForMonth(month).filter((profile) => !monthly.isOriginCity(profile, 'MAD'));
const spanishIds = validIn(3).filter((profile) => profile.countryCode === 'ES').slice(0, 4).map((profile) => profile.id);
const foreignIds = validIn(3).filter((profile) => profile.countryCode !== 'ES').slice(0, 4).map((profile) => profile.id);
assert.ok(spanishIds.length >= 3 && foreignIds.length >= 3, 'el catálogo tiene destinos españoles y extranjeros válidos para marzo');

const offer = (id, price, extra = {}) => ({
  profile: getDestinationById(id), price, departureAt: '2027-03-12', returnAt: '2027-03-14', nights: 2, transfers: 0,
  offerUrl: 'https://www.aviasales.com/search/X?marker=prueba', ...extra,
});
const pick = (id, price, extra = {}) => ({ offer: offer(id, price, extra), seenAt: new Date(SEEN), year: 2027, month: 3 });
const threePicks = () => [pick(spanishIds[0], 40), pick(spanishIds[1], 55), pick(spanishIds[2], 70)];
const row = (userId, extra = {}) => ({
  user_id: userId, airports: ['MAD'], months: [3, 6], trip_types: [], trip_length: null, reach: null, flight_budget: null,
  frequency: 'weekly', locale: 'es', email_consent: true, ...extra,
});
const ready = (userId, extra = {}) => ({
  recipient: select.parseRecipient(row(userId, extra.row ?? {})), status: 'ready', origin: 'MAD', months: [3], maxPrice: 200, picks: threePicks(),
});

// ───────────────────────── candados ─────────────────────────

const OPEN = { live: true, legalDraft: false, legalComplete: true, resendKey: 're_clave', unsubscribeSecret: SECRET };

test('candados: todos abiertos → se puede enviar, con las claves limpias de espacios', () => {
  same(gate.sendGate({ ...OPEN, resendKey: '  re_clave  ', unsubscribeSecret: `  ${SECRET} ` }), { ok: true, apiKey: 're_clave', unsubscribeSecret: SECRET });
});

test('candados: cualquiera cerrado bloquea y el orden es interruptor → datos legales → clave de Resend → clave de baja', () => {
  same(gate.sendGate({ ...OPEN, live: false }), { ok: false, reason: 'not_live' });
  same(gate.sendGate({ ...OPEN, live: 'true' }), { ok: false, reason: 'not_live' }, 'solo un true verdadero abre');
  same(gate.sendGate({ ...OPEN, legalDraft: true }), { ok: false, reason: 'legal_incomplete' }, 'texto legal todavía en borrador');
  same(gate.sendGate({ ...OPEN, legalComplete: false }), { ok: false, reason: 'legal_incomplete' }, 'faltan datos del titular');
  same(gate.sendGate({ ...OPEN, legalDraft: undefined }), { ok: false, reason: 'legal_incomplete' });
  for (const resendKey of [undefined, null, '', '   ']) same(gate.sendGate({ ...OPEN, resendKey }), { ok: false, reason: 'resend_not_configured' });
  for (const unsubscribeSecret of [undefined, null, '', 'corta']) same(gate.sendGate({ ...OPEN, unsubscribeSecret }), { ok: false, reason: 'unsubscribe_not_configured' });
  same(gate.sendGate({ live: false, legalDraft: true, legalComplete: false, resendKey: null, unsubscribeSecret: null }), { ok: false, reason: 'not_live' }, 'manda el primero');
  same(gate.sendGate({ ...OPEN, legalComplete: false, resendKey: null }), { ok: false, reason: 'legal_incomplete' });
});

test('candados: las decisiones del propietario responden 409 y la configuración técnica 503', () => {
  assert.equal(gate.gateStatus('not_live'), 409);
  assert.equal(gate.gateStatus('legal_incomplete'), 409);
  assert.equal(gate.gateStatus('resend_not_configured'), 503);
  assert.equal(gate.gateStatus('unsubscribe_not_configured'), 503);
});

test('tope pedido: sin parámetro el máximo; solo enteros de 1 al máximo; cualquier otra cosa no vale', () => {
  assert.equal(gate.parseSendLimit(null, 90), 90);
  assert.equal(gate.parseSendLimit('', 90), 90);
  assert.equal(gate.parseSendLimit('5', 90), 5);
  assert.equal(gate.parseSendLimit('90', 90), 90);
  for (const value of ['0', '91', '-1', '5.5', 'abc', '5 ', ' 5', '1e2', '0005', '1000', '5,6']) assert.equal(gate.parseSendLimit(value, 90), null, value);
});

test('textos: el pie «por qué recibes esto» existe en los siete idiomas, con el nombre del servicio y la baja', () => {
  for (const locale of ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca']) {
    const text = texts.flightEmailText(locale, 'reason');
    assert.ok(text.length > 40 && text.includes('Destinauta'), locale);
    assert.ok(!text.includes('{'), `${locale}: sin variables sin rellenar`);
  }
  const all = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'].map((locale) => texts.flightEmailText(locale, 'reason'));
  assert.equal(new Set(all).size, 7, 'siete traducciones distintas');
  assert.ok(!all.some((text) => /\b(prueba|test|essai|prova|teste|proba)\b/i.test(text)), 'ya no es el texto del correo de prueba');
});

// ───────────────────────── envío (con funciones simuladas) ─────────────────────────

const CONFIG = {
  apiKey: 're_clave', from: 'Destinauta <vuelos@avisos.destinauta.com>', siteUrl: SITE, unsubscribeSecret: SECRET,
  limit: 10, paceMs: 600, timeBudgetMs: 40000, planNow: NOW,
};

function makeDeps(overrides = {}) {
  const log = { claims: [], finishes: [], lookups: [], sends: [], sleeps: [] };
  let clock = 0;
  const deps = {
    claim: async (item) => { log.claims.push(item); return { kind: 'claimed', id: log.claims.length }; },
    finish: async (id, result) => { log.finishes.push([id, result]); return true; },
    lookup: async (userId) => { log.lookups.push(userId); return { kind: 'ok', email: `${userId.slice(0, 4)}@example.test` }; },
    send: async (options) => { log.sends.push(options); return { ok: true, id: `re_${log.sends.length}` }; },
    now: () => clock,
    sleep: async (ms) => { log.sleeps.push(ms); clock += ms; },
    ...overrides,
  };
  return { deps, log, tick: (ms) => { clock += ms; } };
}

test('envío: cada correo va a UNA dirección, con su enlace de baja firmado, sus cabeceras y sin franja de prueba', async () => {
  const { deps, log } = makeDeps();
  const summary = await sender.sendPlanned([ready(U1, { row: { locale: 'fr' } })], CONFIG, deps);
  assert.equal(log.sends.length, 1);
  const sent = log.sends[0];
  assert.equal(sent.to, '1111@example.test');
  assert.equal(typeof sent.to, 'string');
  assert.equal(sent.apiKey, 're_clave');
  assert.equal(sent.from, 'Destinauta <vuelos@avisos.destinauta.com>');
  const url = unsubscribe.unsubscribeUrl(SITE, U1, SECRET, 'fr');
  same(sent.headers, unsubscribe.unsubscribeHeaders(url));
  assert.match(sent.headers['List-Unsubscribe'], /^<https:\/\/destinauta\.com\/api\/email\/unsubscribe\?u=/);
  assert.equal(sent.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  const escaped = url.replaceAll('&', '&amp;');
  assert.ok(sent.html.includes(escaped), 'el enlace de baja de esa persona está en el pie');
  assert.ok(sent.text.includes(url));
  assert.ok(sent.html.includes('Vous recevez cet e-mail'), 'el motivo sale en su idioma');
  assert.ok(!sent.html.includes('#fef3c7') && !/correo de prueba/i.test(sent.html + sent.text), 'sin franja ni texto de prueba');
  same(sent.tags, [{ name: 'category', value: 'flights' }]);
  same(log.finishes, [[1, { sent: true, providerId: 're_1' }]]);
  same(summary, { attempted: 1, sent: 1, failed: 0, alreadyClaimed: 0, noEmail: 0, unverified: 0, errors: 0, unrecorded: 0, stopped: null, pending: 0 });
});

test('envío: lo que no está «listo» no se envía, y se reserva ANTES de buscar la cuenta o enviar', async () => {
  const order = [];
  const { deps, log } = makeDeps({
    claim: async () => { order.push('claim'); return { kind: 'claimed', id: 7 }; },
    lookup: async () => { order.push('lookup'); return { kind: 'ok', email: 'ana@example.test' }; },
    send: async () => { order.push('send'); return { ok: true, id: null }; },
    finish: async () => { order.push('finish'); return true; },
  });
  const planned = [
    { ...ready(U1), status: 'not_due' }, { ...ready(U2), status: 'not_enough_data' }, { ...ready(U3), status: 'over_limit' }, ready(U4),
  ];
  const summary = await sender.sendPlanned(planned, CONFIG, deps);
  same(order, ['claim', 'lookup', 'send', 'finish'], 'una sola persona (la única «ready») y en este orden');
  assert.equal(summary.sent, 1);
  assert.equal(log.sends.length, 0, 'las funciones simuladas de esta prueba no anotan en el registro común');
});

test('envío: si ya hay un envío reservado hoy NO se envía otra vez, y un error al reservar tampoco envía', async () => {
  const { deps, log } = makeDeps({
    claim: async (item) => (item.userId === U1 ? { kind: 'exists' } : item.userId === U2 ? { kind: 'error' } : { kind: 'claimed', id: 3 }),
  });
  const summary = await sender.sendPlanned([ready(U1), ready(U2), ready(U3)], CONFIG, deps);
  same(log.lookups, [U3], 'solo se consulta la cuenta de quien tiene la reserva');
  assert.equal(log.sends.length, 1);
  assert.equal(summary.alreadyClaimed, 1);
  assert.equal(summary.errors, 1);
  assert.equal(summary.sent, 1);
});

test('envío: cuenta sin correo, sin confirmar, con error o con una dirección rara → no se envía y la reserva queda «fallida»', async () => {
  const answers = { [U1]: { kind: 'unverified' }, [U2]: { kind: 'no_email' }, [U3]: { kind: 'error' }, [U4]: { kind: 'ok', email: 'a@example.test, b@example.test' } };
  const { deps, log } = makeDeps({ lookup: async (userId) => answers[userId] });
  const summary = await sender.sendPlanned([ready(U1), ready(U2), ready(U3), ready(U4)], CONFIG, deps);
  assert.equal(log.sends.length, 0, 'ni a una cuenta sin confirmar ni a una lista de direcciones');
  assert.equal(summary.unverified, 1);
  assert.equal(summary.noEmail, 2, 'sin correo y dirección no válida');
  assert.equal(summary.errors, 1);
  assert.equal(summary.attempted, 0, 'no cuentan como envíos intentados');
  same(log.finishes.map(([, result]) => result), [{ sent: false }, { sent: false }, { sent: false }, { sent: false }]);
});

test('envío: un rechazo de Resend no para al resto; un 429 (demasiado rápido) corta la tanda y deja lo demás para la siguiente', async () => {
  let call = 0;
  const { deps, log } = makeDeps({ send: async (options) => { call += 1; return call === 1 ? { ok: false, status: 422 } : { ok: true, id: 'ok' }; } });
  const summary = await sender.sendPlanned([ready(U1), ready(U2)], CONFIG, deps);
  assert.equal(summary.failed, 1);
  assert.equal(summary.sent, 1);
  assert.equal(summary.stopped, null);
  same(log.finishes.map(([, result]) => result.sent), [false, true]);

  const limited = makeDeps({ send: async () => ({ ok: false, status: 429 }) });
  const stopped = await sender.sendPlanned([ready(U1), ready(U2), ready(U3)], CONFIG, limited.deps);
  assert.equal(stopped.stopped, 'rate_limited');
  assert.equal(stopped.failed, 1);
  assert.equal(stopped.pending, 2, 'los otros dos ni se reservan');
  assert.equal(limited.log.claims.length, 1);
  assert.equal(limited.log.sleeps.length, 0);
});

test('envío: respeta el tope de la tanda y el tiempo; lo que queda cuenta como pendiente', async () => {
  const limited = makeDeps();
  const byLimit = await sender.sendPlanned([ready(U1), ready(U2), ready(U3)], { ...CONFIG, limit: 2 }, limited.deps);
  assert.equal(byLimit.sent, 2);
  assert.equal(byLimit.stopped, 'limit');
  assert.equal(byLimit.pending, 1);

  const slow = makeDeps({ send: async () => { slowTick(50000); return { ok: true, id: null }; } });
  const slowTick = slow.tick;
  const byTime = await sender.sendPlanned([ready(U1), ready(U2)], CONFIG, slow.deps);
  assert.equal(byTime.sent, 1);
  assert.equal(byTime.stopped, 'time');
  assert.equal(byTime.pending, 1);

  const none = makeDeps();
  const noTime = await sender.sendPlanned([ready(U1)], { ...CONFIG, timeBudgetMs: 0 }, none.deps);
  assert.equal(noTime.sent, 0);
  assert.equal(noTime.stopped, 'time');
});

test('envío: deja una pausa entre correos (no tras el último) y, si no se puede anotar un envío, sigue contando como enviado', async () => {
  const paced = makeDeps({ finish: async () => false });
  const summary = await sender.sendPlanned([ready(U1), ready(U2), ready(U3)], CONFIG, paced.deps);
  same(paced.log.sleeps, [600, 600]);
  assert.equal(summary.sent, 3);
  assert.equal(summary.unrecorded, 3, 'se avisa, pero no se repite el envío');
  assert.equal(config.SEND_PACE_MS, 600);
  assert.ok(config.SEND_TIME_BUDGET_MS <= 45000, 'cabe en los 60 s de la función de Vercel con un envío lento al final');
});

// ───────────────────────── acceso a Supabase (con un cliente simulado) ─────────────────────────

function fakeClient({ insertError = null, updateError = null, count = 4, countError = null, user = { email: 'ana@example.test', email_confirmed_at: '2026-01-01T00:00:00Z' }, authError = null, throws = false } = {}) {
  const state = { inserts: [], updates: [], filters: [], counts: [], tables: [], lookups: [] };
  const client = {
    from(table) {
      state.tables.push(table);
      if (throws) throw new Error('boom');
      return {
        insert(values) {
          state.inserts.push(values);
          return { select: () => ({ single: () => Promise.resolve(insertError ? { data: null, error: insertError } : { data: { id: 42 }, error: null }) }) };
        },
        update(values) {
          state.updates.push(values);
          const first = { eq(column, value) { state.filters.push([column, value]); return { eq(column2, value2) { state.filters.push([column2, value2]); return Promise.resolve({ error: updateError }); } }; } };
          return first;
        },
        select(columns, options) {
          state.counts.push({ columns, options, filters: [] });
          const query = state.counts[state.counts.length - 1];
          const builder = {
            eq(column, value) { query.filters.push(['eq', column, value]); return builder; },
            in(column, values) { query.filters.push(['in', column, values]); return Promise.resolve({ count: countError ? null : count, error: countError }); },
          };
          return builder;
        },
      };
    },
    auth: { admin: { getUserById: async (id) => { state.lookups.push(id); return authError ? { data: null, error: authError } : { data: { user }, error: null }; } } },
  };
  return { client, state };
}

test('reservar: inserta una fila «claimed» con cuenta, aeropuerto y meses (nada de correos) y devuelve su número', async () => {
  const fake = fakeClient();
  const result = await store.claimSend(fake.client, { userId: U1, origin: 'MAD', months: [3, 6] });
  same(result, { kind: 'claimed', id: 42 });
  same(fake.state.inserts, [{ user_id: U1, kind: 'flights', origin: 'MAD', months: [3, 6], status: 'claimed' }]);
  assert.ok(!JSON.stringify(fake.state.inserts).includes('@'));
  same(fake.state.tables, ['email_sends']);
});

test('reservar: la fila repetida del día (23505) es «exists»; cualquier otro fallo o excepción es «error»', async () => {
  same(await store.claimSend(fakeClient({ insertError: { code: '23505' } }).client, { userId: U1, origin: 'MAD', months: [3] }), { kind: 'exists' });
  same(await store.claimSend(fakeClient({ insertError: { code: '42P01' } }).client, { userId: U1, origin: 'MAD', months: [3] }), { kind: 'error' });
  same(await store.claimSend(fakeClient({ throws: true }).client, { userId: U1, origin: 'MAD', months: [3] }), { kind: 'error' });
});

test('anotar: «sent» con fecha e identificador de Resend, «failed» sin nada más; solo cambia filas aún «claimed»', async () => {
  const sent = fakeClient();
  assert.equal(await store.finishSend(sent.client, 42, { sent: true, providerId: 're_abc' }), true);
  assert.equal(sent.state.updates[0].status, 'sent');
  assert.equal(sent.state.updates[0].provider_id, 're_abc');
  assert.equal(new Date(sent.state.updates[0].sent_at).toISOString(), sent.state.updates[0].sent_at);
  same(sent.state.filters, [['id', 42], ['status', 'claimed']]);

  const failed = fakeClient();
  assert.equal(await store.finishSend(failed.client, 43, { sent: false }), true);
  same(failed.state.updates, [{ status: 'failed' }]);

  const long = fakeClient();
  await store.finishSend(long.client, 44, { sent: true, providerId: 'x'.repeat(101) });
  assert.equal(long.state.updates[0].provider_id, null, 'un identificador demasiado largo no se guarda');
  assert.equal(await store.finishSend(fakeClient({ updateError: { message: 'boom' } }).client, 1, { sent: false }), false);
  assert.equal(await store.finishSend(fakeClient({ throws: true }).client, 1, { sent: false }), false);
});

test('contar hoy: envíos enviados o reservados del día UTC; si falla, null (y entonces no se envía)', async () => {
  const fake = fakeClient({ count: 4 });
  assert.equal(await store.countSendsToday(fake.client, NOW), 4);
  same(fake.state.counts[0].options, { count: 'exact', head: true });
  same(fake.state.counts[0].filters, [['eq', 'send_day', TODAY], ['in', 'status', ['sent', 'claimed']]]);
  assert.equal(await store.countSendsToday(fakeClient({ countError: { message: 'boom' } }).client, NOW), null);
  assert.equal(await store.countSendsToday(fakeClient({ throws: true }).client, NOW), null);
  assert.equal(await store.countSendsToday(fakeClient({ count: null }).client, NOW), null);
});

test('cuenta: devuelve el correo solo si está confirmado; sin confirmar, sin correo o con error no se envía', async () => {
  same(await store.lookupAccount(fakeClient().client, U1), { kind: 'ok', email: 'ana@example.test' });
  same(await store.lookupAccount(fakeClient({ user: { email: 'ana@example.test', email_confirmed_at: null } }).client, U1), { kind: 'unverified' });
  same(await store.lookupAccount(fakeClient({ user: { email: '', email_confirmed_at: 'x' } }).client, U1), { kind: 'no_email' });
  same(await store.lookupAccount(fakeClient({ user: null }).client, U1), { kind: 'no_email' });
  same(await store.lookupAccount(fakeClient({ authError: { status: 404, message: 'not found' } }).client, U1), { kind: 'no_email' }, 'cuenta eliminada');
  same(await store.lookupAccount(fakeClient({ authError: { status: 500, message: 'boom' } }).client, U1), { kind: 'error' });
  same(await store.lookupAccount(fakeClient({ throws: true, authError: { status: 500 } }).client, U1), { kind: 'error' });
});

// ───────────────────────── ruta /api/email/send (con base de datos y Resend simulados) ─────────────────────────

function fakeDb({ preferences = [], sends = [], monthlyRows = [], users = {}, failPreferences = false, failSends = false, failCount = false } = {}) {
  const state = { calls: [], inserts: [], updates: [], lookups: [] };
  const tables = { email_preferences: preferences, email_sends: sends.map((item) => ({ ...item })), monthly_prices: monthlyRows };
  let nextId = 100;
  const client = {
    from(table) {
      state.calls.push(table);
      if (!Object.hasOwn(tables, table)) throw new Error(`tabla inesperada ${table}`);
      return {
        select(columns, options) {
          const query = { filters: [], inIds: null, range: null };
          const builder = {
            eq(column, value) { query.filters.push(['eq', column, value]); return builder; },
            gte(column, value) { query.filters.push(['gte', column, value]); return builder; },
            in(column, values) {
              if (column === 'user_id') query.inIds = values; else query.filters.push(['in', column, values]);
              return builder;
            },
            order() { return builder; },
            range(from, to) { query.range = [from, to]; return builder; },
            then(resolve, reject) {
              const head = Boolean(options && options.head);
              if ((table === 'email_preferences' && failPreferences) || (table === 'email_sends' && (head ? failCount : failSends))) {
                return Promise.resolve({ data: null, count: null, error: { message: 'boom' } }).then(resolve, reject);
              }
              let data = tables[table].filter((item) => query.filters.every(([operator, column, value]) =>
                operator === 'eq' ? item[column] === value : operator === 'in' ? value.includes(item[column]) : item[column] >= value));
              if (query.inIds) data = data.filter((item) => query.inIds.includes(item.user_id));
              if (query.range) data = data.slice(query.range[0], query.range[1] + 1);
              return Promise.resolve(head ? { count: data.length, error: null } : { data, error: null }).then(resolve, reject);
            },
          };
          return builder;
        },
        insert(values) {
          state.inserts.push({ table, values });
          const run = () => {
            if (tables.email_sends.some((item) => item.user_id === values.user_id && item.kind === values.kind && (item.send_day ?? TODAY) === TODAY)) {
              return { data: null, error: { code: '23505', message: 'duplicate' } };
            }
            const created = { id: nextId += 1, send_day: TODAY, claimed_at: NOW_ISO, ...values };
            tables.email_sends.push(created);
            return { data: { id: created.id }, error: null };
          };
          return { select: () => ({ single: () => Promise.resolve(run()) }) };
        },
        update(values) {
          state.updates.push({ table, values });
          return { eq(column, value) { return { eq(column2, value2) {
            for (const item of tables[table]) if (item[column] === value && item[column2] === value2) Object.assign(item, values);
            return Promise.resolve({ error: null });
          } }; } };
        },
        upsert() { throw new Error('el envío nunca hace upsert'); },
        delete() { throw new Error('el envío nunca borra'); },
      };
    },
    auth: { admin: { getUserById: async (id) => { state.lookups.push(id); return users[id] ? { data: { user: users[id] }, error: null } : { data: null, error: { status: 404 } }; } } },
  };
  return { client, state, tables };
}

const ENV = {
  CRON_SECRET: CRON, NEXT_PUBLIC_SUPABASE_URL: 'https://proyecto.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_prueba',
  RESEND_API_KEY: 're_clave_de_prueba', EMAIL_UNSUBSCRIBE_SECRET: SECRET,
};
const OWNER_COMPLETE = { name: 'Titular de Prueba', taxId: 'X0000000X', address: 'Calle Falsa 1, 28000 Madrid, España', email: 'contacto@example.test', registry: '' };
const OWNER_EMPTY = { name: '', taxId: '', address: '', email: '', registry: '' };
const LIVE = { live: true, draft: false, owner: OWNER_COMPLETE };
const requestFor = (query = '', auth = `Bearer ${CRON}`) => ({ url: `${SITE}/api/email/send${query}`, headers: { get: (header) => (header.toLowerCase() === 'authorization' ? auth : null) } });
const monthlyRow = (id, month, price, extra = {}) => ({
  origin: 'MAD', destination_id: id, year: 2027, month, price, departure_at: `2027-${String(month).padStart(2, '0')}-12`,
  return_at: `2027-${String(month).padStart(2, '0')}-14`, nights: 2, transfers: 0, offer_url: 'https://www.aviasales.com/search/X?marker=prueba',
  seen_at: SEEN, ...extra,
});
const PRICES = [monthlyRow(spanishIds[0], 3, 40), monthlyRow(spanishIds[1], 3, 55), monthlyRow(foreignIds[0], 6, 45), monthlyRow(foreignIds[1], 6, 90)];
const VERIFIED = { email: 'ana@example.test', email_confirmed_at: '2026-01-01T00:00:00Z' };

async function runSend({ env = ENV, db = fakeDb(), query = '', auth, state = LIVE, resend = [{ ok: true, status: 200, id: 're_1' }] } = {}) {
  const lines = [];
  const fetchCalls = [];
  const queue = [...resend];
  const mocks = {
    'node:crypto': crypto,
    '@supabase/supabase-js': { createClient: () => db.client },
    '@/lib/email-preferences/options': { ...realOptions, EMAIL_SERVICE_LIVE: state.live },
    '@/lib/legal/owner': { LEGAL_IS_DRAFT: state.draft, LEGAL_UPDATED: '', OWNER_DATA: state.owner },
  };
  const globals = {
    process: { env }, AbortSignal, Buffer, Response, Date: fixedDate(NOW_ISO), console: { info: (line) => lines.push(line) },
    setTimeout: (callback) => { callback(); return 0; },
    fetch: async (url, init) => {
      fetchCalls.push({ url, init, body: JSON.parse(init.body) });
      const next = queue.length > 1 ? queue.shift() : queue[0];
      return { ok: next.ok, status: next.status, json: async () => ({ id: next.id }) };
    },
  };
  const route = loader(root, mocks, globals)('app/api/email/send/route.ts');
  const response = await route.GET(auth === undefined ? requestFor(query) : requestFor(query, auth));
  const raw = await response.text();
  return { response, raw, body: JSON.parse(raw), lines, db, fetchCalls };
}

const consenting = (extra = {}) => fakeDb({
  preferences: [row(U1, { locale: 'fr' }), row(U2), row(U3, { email_consent: false })], monthlyRows: PRICES,
  users: { [U1]: VERIFIED, [U2]: { email: 'luis@example.test', email_confirmed_at: null } }, ...extra,
});

test('ruta: sin clave o con una equivocada, 401 y no se toca nada; sin configurar, 503', async () => {
  for (const auth of ['', 'Bearer otra', CRON]) {
    const result = await runSend({ auth, db: consenting() });
    assert.equal(result.response.status, 401, auth);
    same(plain(result.body), { success: false, error: 'unauthorized' });
    same(result.db.state.calls, []);
    assert.equal(result.fetchCalls.length, 0);
  }
  const result = await runSend({ env: { ...ENV, CRON_SECRET: '' }, db: consenting() });
  assert.equal(result.response.status, 503);
  same(result.db.state.calls, []);
});

test('ruta: con el interruptor del código apagado (como está hoy) NO envía nada ni lee la base de datos, aunque todo lo demás esté listo', async () => {
  const result = await runSend({ state: { live: false, draft: false, owner: OWNER_COMPLETE }, db: consenting() });
  assert.equal(result.response.status, 409);
  same(plain(result.body), { success: false, sent: 0, error: 'not_live' });
  same(result.db.state.calls, []);
  assert.equal(result.fetchCalls.length, 0);
  same(result.lines, ['[email:send] {"ok":false,"sent":0,"reason":"not_live"}']);
});

test('ruta: con los datos legales sin rellenar o el texto aún en borrador NO envía nada', async () => {
  for (const state of [{ live: true, draft: true, owner: OWNER_COMPLETE }, { live: true, draft: false, owner: OWNER_EMPTY }, { live: true, draft: false, owner: { ...OWNER_COMPLETE, taxId: '' } }]) {
    const result = await runSend({ state, db: consenting() });
    assert.equal(result.response.status, 409);
    assert.equal(result.body.error, 'legal_incomplete');
    same(result.db.state.calls, []);
    assert.equal(result.fetchCalls.length, 0);
  }
});

test('ruta: sin la clave de Resend o sin la clave de baja (o demasiado corta), 503 y no envía nada', async () => {
  for (const [override, error] of [[{ RESEND_API_KEY: '' }, 'resend_not_configured'], [{ EMAIL_UNSUBSCRIBE_SECRET: '' }, 'unsubscribe_not_configured'], [{ EMAIL_UNSUBSCRIBE_SECRET: 'corta' }, 'unsubscribe_not_configured']]) {
    const result = await runSend({ env: { ...ENV, ...override }, db: consenting() });
    assert.equal(result.response.status, 503);
    assert.equal(result.body.error, error);
    same(result.db.state.calls, []);
    assert.equal(result.fetchCalls.length, 0);
  }
  const noDb = await runSend({ env: { ...ENV, SUPABASE_SECRET_KEY: '' }, db: consenting() });
  assert.equal(noDb.response.status, 503);
});

test('ruta: un tope no válido (?limit=) se rechaza con 400 antes de tocar nada', async () => {
  for (const query of ['?limit=0', '?limit=abc', '?limit=91', '?limit=-3', '?limit=5.5']) {
    const result = await runSend({ query, db: consenting() });
    assert.equal(result.response.status, 400, query);
    assert.equal(result.body.error, 'invalid_limit');
    same(result.db.state.calls, []);
  }
});

test('ruta: envío completo — manda al que tiene la cuenta confirmada, salta al que no, anota todo y NO enseña correos ni identificadores', async () => {
  const db = consenting();
  const result = await runSend({ db });
  assert.equal(result.response.status, 200);
  same(plain(result.body), {
    success: true, attempted: 1, sent: 1, failed: 0, alreadyClaimed: 0, noEmail: 0, unverified: 1, errors: 0, unrecorded: 0,
    stopped: 'none', pending: 0, todayBefore: 0, limit: 90,
  });
  assert.equal(result.response.headers.get('Cache-Control'), 'no-store');

  assert.equal(result.fetchCalls.length, 1, 'un solo correo');
  const call = result.fetchCalls[0];
  assert.equal(call.url, 'https://api.resend.com/emails');
  assert.equal(call.init.headers.Authorization, 'Bearer re_clave_de_prueba');
  same(call.body.to, ['ana@example.test']);
  assert.equal(call.body.from, 'Destinauta <vuelos@avisos.destinauta.com>');
  assert.match(call.body.headers['List-Unsubscribe'], new RegExp(`^<https://destinauta\\.com/api/email/unsubscribe\\?u=${U1}&t=[A-Za-z0-9_-]{43}&l=fr>$`));
  assert.equal(call.body.headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
  assert.ok(call.body.html.includes('Vous recevez cet e-mail') && !/correo de prueba/i.test(call.body.html));

  const sends = db.tables.email_sends;
  assert.equal(sends.length, 2);
  const first = sends.find((item) => item.user_id === U1);
  assert.equal(first.status, 'sent');
  assert.equal(first.provider_id, 're_1');
  assert.equal(first.origin, 'MAD');
  assert.equal(sends.find((item) => item.user_id === U2).status, 'failed', 'cuenta sin confirmar: no se envió');
  same(db.state.lookups.sort(), [U1, U2]);
  assert.ok(!db.state.lookups.includes(U3), 'quien no dio permiso ni se consulta');

  assert.ok(!result.raw.includes('@') && !result.raw.includes(U1), 'la respuesta solo lleva cantidades');
  assert.equal(result.lines.length, 1);
  assert.match(result.lines[0], /^\[email:send\] \{"ok":true,"attempted":1,"sent":1,/);
  assert.ok(!result.lines[0].includes('@') && !result.lines[0].includes(U1));
  assert.ok(!JSON.stringify(db.state.inserts).includes('@'), 'la base de datos no guarda correos');
});

test('ruta: si la tarea se ejecuta DOS veces el mismo día, la segunda no repite ningún correo', async () => {
  const db = consenting();
  const first = await runSend({ db });
  assert.equal(first.body.sent, 1);
  const second = await runSend({ db });
  assert.equal(second.fetchCalls.length, 0, 'ningún correo más');
  assert.equal(second.body.sent, 0);
  assert.equal(second.body.alreadyClaimed, 1, 'la cuenta sin confirmar ya tiene su fila de hoy: no se reintenta hasta mañana');
  assert.equal(second.body.todayBefore, 1);
  assert.equal(db.tables.email_sends.filter((item) => item.user_id === U1).length, 1);
});

test('ruta: una tarea que murió justo después de enviar (fila «claimed») cuenta como enviada: nadie recibe el correo dos veces', async () => {
  const db = fakeDb({
    preferences: [row(U1)], monthlyRows: PRICES, users: { [U1]: VERIFIED },
    sends: [{ id: 5, user_id: U1, kind: 'flights', send_day: TODAY, status: 'claimed', claimed_at: NOW_ISO }],
  });
  const result = await runSend({ db });
  assert.equal(result.fetchCalls.length, 0);
  assert.equal(result.body.sent, 0);
});

test('ruta: quien ya recibió uno dentro de su frecuencia no recibe otro (semanal = 7 días)', async () => {
  const db = fakeDb({
    preferences: [row(U1)], monthlyRows: PRICES, users: { [U1]: VERIFIED },
    sends: [{ id: 5, user_id: U1, kind: 'flights', send_day: '2026-11-14', status: 'sent', sent_at: ago(3 * DAY).toISOString() }],
  });
  const result = await runSend({ db });
  assert.equal(result.fetchCalls.length, 0);
  assert.equal(result.body.attempted, 0);
});

test('ruta: si no se puede leer el historial o a las personas, NO se envía (se podría repetir un correo)', async () => {
  const noHistory = await runSend({ db: consenting({ failSends: true }) });
  assert.equal(noHistory.response.status, 503);
  assert.equal(noHistory.body.error, 'history_unavailable');
  assert.equal(noHistory.fetchCalls.length, 0);
  same(noHistory.db.state.inserts, []);

  const noPeople = await runSend({ db: consenting({ failPreferences: true }) });
  assert.equal(noPeople.response.status, 503);
  assert.equal(noPeople.body.error, 'preferences_unavailable');
  assert.equal(noPeople.fetchCalls.length, 0);

  const noCount = await runSend({ db: consenting({ failCount: true }) });
  assert.equal(noCount.response.status, 503);
  assert.equal(noCount.body.error, 'count_unavailable');
  assert.equal(noCount.fetchCalls.length, 0);
  same(noCount.db.state.calls, ['email_sends'], 'ni siquiera se leen las personas');
});

test('ruta: el tope diario cuenta también lo enviado por otras tandas de hoy', async () => {
  const todays = Array.from({ length: 90 }, (_, index) => ({ id: index + 1, user_id: `aaaaaaaa-0000-4000-8000-${String(index).padStart(12, '0')}`, kind: 'flights', send_day: TODAY, status: 'sent', sent_at: NOW_ISO }));
  const full = await runSend({ db: consenting({ sends: todays }) });
  assert.equal(full.response.status, 200);
  same(plain(full.body), { success: true, sent: 0, reason: 'daily_limit_reached', today: 90, limit: 90 });
  assert.equal(full.fetchCalls.length, 0);
  same(full.db.state.calls, ['email_sends'], 'ni se leen las personas');

  const partial = await runSend({ db: consenting({ preferences: [row(U1)], sends: todays.slice(0, 89) }) });
  assert.equal(partial.body.limit, 1, 'solo queda 1 hueco hoy');
  assert.equal(partial.body.sent, 1);

  const asked = await runSend({ query: '?limit=1', db: consenting({ preferences: [row(U1), row(U2, { locale: 'de' })], users: { [U1]: VERIFIED, [U2]: { ...VERIFIED, email: 'luis@example.test' } } }) });
  assert.equal(asked.body.sent, 1, 'con ?limit=1 solo sale un correo aunque haya dos personas');
  assert.equal(asked.body.limit, 1);
  assert.equal(asked.fetchCalls.length, 1);
});

test('ruta: un 429 de Resend corta la tanda y la persona afectada queda «fallida» (se reintenta otro día)', async () => {
  const db = consenting({ preferences: [row(U1), row(U2)], users: { [U1]: VERIFIED, [U2]: { ...VERIFIED, email: 'luis@example.test' } } });
  const result = await runSend({ db, resend: [{ ok: false, status: 429 }] });
  assert.equal(result.body.stopped, 'rate_limited');
  assert.equal(result.body.sent, 0);
  assert.equal(result.body.failed, 1);
  assert.equal(result.body.pending, 1);
  assert.equal(result.fetchCalls.length, 1);
  assert.equal(db.tables.email_sends.length, 1);
  assert.equal(db.tables.email_sends[0].status, 'failed');
});

test('ruta: sin suficientes destinos con precio real no se envía nada (nunca se rellena)', async () => {
  const db = consenting({ monthlyRows: PRICES.slice(0, 2) });
  const result = await runSend({ db });
  assert.equal(result.fetchCalls.length, 0);
  assert.equal(result.body.attempted, 0);
  same(db.state.inserts, []);
});

// ───────────────────────── código y configuración ─────────────────────────

test('vercel.json: la tarea del envío es una sola, con tope de 5 correos y un calendario que no llega a ejecutarse sola', () => {
  const crons = JSON.parse(read('vercel.json')).crons.filter((cron) => cron.path.startsWith('/api/email/send'));
  same(crons, [{ path: '/api/email/send?limit=5', schedule: '0 0 29 2 *' }]);
});

test('código: el envío sigue BLOQUEADO (interruptor apagado y texto legal en borrador) y la ruta aplica los candados antes de leer nada', () => {
  assert.match(read('lib/email-preferences/options.ts'), /export const EMAIL_SERVICE_LIVE = false;/);
  assert.match(read('lib/legal/owner.ts'), /export const LEGAL_IS_DRAFT = true;/);
  const route = read('app/api/email/send/route.ts');
  const position = (text) => { const index = route.indexOf(text); assert.ok(index > 0, text); return index; };
  assert.ok(position('sameSecret(') < position('sendGate('), 'primero la clave de la tarea');
  assert.ok(position('sendGate(') < position('getSupabaseAdminClient()'), 'luego los candados');
  assert.ok(position('getSupabaseAdminClient()') < position('countSendsToday('));
  assert.ok(position('countSendsToday(') < position('readConsentingRecipients('));
  assert.ok(position('readSendHistory(') < position('if (!sends.ok)'), 'se mira el historial antes de planificar');
  assert.ok(position('if (!sends.ok)') < position('planRun('));
  assert.ok(position('planRun(') < position('sendPlanned('));
  const exported = Array.from(route.matchAll(/^export (?:async )?(?:function|const) (\w+)/gm), (match) => match[1]).sort();
  same(exported, ['GET', 'dynamic', 'maxDuration', 'runtime']);
  assert.match(route, /maxDuration = 60/);
});

test('código: el envío no escribe correos en la base de datos ni en el registro, y solo send-store.ts y la ruta tocan la cuenta', () => {
  const senderSource = read('lib/email/sender.ts');
  assert.doesNotMatch(code(senderSource), /process\.env|fetch\(|supabase|resend\.com|\.from\(|auth\.admin/i, 'el envío en sí no sabe de Supabase, de Resend ni de variables');
  const storeSource = read('lib/email/send-store.ts');
  assert.match(storeSource, /auth\.admin\.getUserById/);
  assert.doesNotMatch(storeSource, /\.(upsert|delete)\(|listUsers/);
  assert.match(storeSource, /insert\(\{ user_id: item\.userId, kind: "flights", origin: item\.origin, months: \[\.\.\.item\.months\], status: "claimed" \}\)/, 'solo esas columnas, ningún correo');
  const route = read('app/api/email/send/route.ts');
  assert.doesNotMatch(route, /EMAIL_TEST_RECIPIENT/);
  assert.doesNotMatch(code(route), /logEmailRun\([^)]*(email|userId|account)\b[^)]*\)/i);
  const files = ['app/api/email/send/route.ts', 'lib/email/sender.ts', 'lib/email/send-store.ts', 'lib/email/gate.ts'];
  for (const file of files) assert.doesNotMatch(read(file), /console\.(log|info|warn|error)/, `${file}: solo se escribe con logEmailRun`);
});
