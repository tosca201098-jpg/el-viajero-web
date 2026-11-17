// Baja con un clic del correo de vuelos: enlace firmado, cabeceras List-Unsubscribe y ruta /api/email/unsubscribe.
// Todo con datos simulados: ninguna prueba llama a Supabase, a Resend ni a la red.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { loader } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const LOCALES = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
const SITE = 'https://destinauta.com';
const SECRET = 'una-clave-secreta-de-prueba-de-mas-de-32-caracteres';
const USER = '3f2b8c1e-5a4d-4e6f-9a7b-1c2d3e4f5a6b';
const OTHER = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

// Supabase de mentira: anota cada tabla pedida y cada actualización.
function fakeDb({ fail = false, throws = false } = {}) {
  const state = { tables: [], updates: [], filters: [] };
  const client = {
    from(table) {
      state.tables.push(table);
      return {
        update(values) {
          state.updates.push(values);
          return {
            eq(column, value) {
              state.filters.push([column, value]);
              if (throws) throw new Error('boom');
              return Promise.resolve({ data: null, error: fail ? { message: 'boom' } : null });
            },
          };
        },
        select() { throw new Error('la baja nunca lee la tabla'); },
        insert() { throw new Error('la baja nunca inserta'); },
        upsert() { throw new Error('la baja nunca inserta'); },
        delete() { throw new Error('la baja nunca borra'); },
      };
    },
  };
  return { client, state };
}

function loadAll(env = {}, db = fakeDb()) {
  return loader(root, { 'node:crypto': crypto, '@supabase/supabase-js': { createClient: () => db.client } },
    { process: { env }, Response, Buffer, AbortSignal });
}

const ENV = { EMAIL_UNSUBSCRIBE_SECRET: SECRET, NEXT_PUBLIC_SUPABASE_URL: 'https://proyecto.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_prueba' };
const lib = loadAll(ENV)('lib/email/unsubscribe.ts');
const textsLib = loadAll(ENV)('lib/email/unsubscribe-texts.ts');
const plain = (value) => JSON.parse(JSON.stringify(value));

function route(env = ENV, db = fakeDb()) {
  return { module: loadAll(env, db)('app/api/email/unsubscribe/route.ts'), db };
}
const requestFor = (query) => ({ url: `${SITE}/api/email/unsubscribe${query}`, method: 'POST' });
const goodQuery = (user = USER, locale = 'es', secret = SECRET) => `?u=${user}&t=${lib.signUnsubscribe(user, secret)}&l=${locale}`;

// ───────────────────────── firma del enlace ─────────────────────────

test('firma: solo vale para esa cuenta y esa clave; cualquier cambio la rompe', () => {
  const token = lib.signUnsubscribe(USER, SECRET);
  assert.match(token, /^[A-Za-z0-9_-]{43}$/, 'caracteres seguros para una dirección web');
  assert.equal(lib.verifyUnsubscribe(USER, token, SECRET), true);
  assert.equal(lib.verifyUnsubscribe(USER.toUpperCase(), token, SECRET), true, 'el UUID en mayúsculas es la misma cuenta');
  assert.equal(lib.verifyUnsubscribe(OTHER, token, SECRET), false, 'la firma de una cuenta no sirve para otra');
  assert.equal(lib.verifyUnsubscribe(USER, token, `${SECRET}x`), false, 'con otra clave no vale');
  assert.equal(lib.verifyUnsubscribe(USER, `${token.slice(0, -1)}${token.endsWith('A') ? 'B' : 'A'}`, SECRET), false, 'un carácter cambiado la rompe');
  assert.equal(lib.verifyUnsubscribe(USER, lib.signUnsubscribe(OTHER, SECRET), SECRET), false);
  assert.equal(lib.signUnsubscribe(USER, SECRET), token, 'es determinista: el enlace de un correo antiguo sigue valiendo');
});

test('firma: datos raros nunca lanzan errores y nunca valen', () => {
  const token = lib.signUnsubscribe(USER, SECRET);
  const weird = [undefined, null, '', ' ', 'abc', 123, {}, [], `${token} `, `${token}${token}`, token.slice(1), '../'.repeat(20), '<script>'];
  for (const value of weird) {
    assert.equal(lib.verifyUnsubscribe(USER, value, SECRET), false, String(value));
    assert.equal(lib.verifyUnsubscribe(value, token, SECRET), false, String(value));
  }
  assert.equal(lib.verifyUnsubscribe(USER, token, null), false, 'sin clave en el servidor nada vale');
  assert.equal(lib.verifyUnsubscribe(USER, token, ''), false);
  assert.throws(() => lib.signUnsubscribe('no-es-un-uuid', SECRET));
  assert.throws(() => lib.unsubscribeUrl(SITE, 'no-es-un-uuid', SECRET, 'es'));
});

test('clave secreta: falta, vacía o demasiado corta = no configurada', () => {
  assert.equal(lib.readUnsubscribeSecret(undefined), null);
  assert.equal(lib.readUnsubscribeSecret(''), null);
  assert.equal(lib.readUnsubscribeSecret('   '), null);
  assert.equal(lib.readUnsubscribeSecret('corta'), null);
  assert.equal(lib.readUnsubscribeSecret('x'.repeat(31)), null);
  assert.equal(lib.readUnsubscribeSecret('x'.repeat(32)), 'x'.repeat(32));
  assert.equal(lib.readUnsubscribeSecret(`  ${SECRET}  `), SECRET, 'se quitan espacios sobrantes');
});

test('enlace: solo lleva el identificador de la cuenta, la firma y el idioma (nunca el correo)', () => {
  const url = lib.unsubscribeUrl(`${SITE}/`, USER, SECRET, 'fr');
  const parsed = new URL(url);
  assert.equal(parsed.origin, SITE);
  assert.equal(parsed.pathname, '/api/email/unsubscribe');
  assert.deepEqual([...parsed.searchParams.keys()].sort(), ['l', 't', 'u']);
  assert.equal(parsed.searchParams.get('u'), USER);
  assert.equal(parsed.searchParams.get('l'), 'fr');
  assert.equal(lib.verifyUnsubscribe(parsed.searchParams.get('u'), parsed.searchParams.get('t'), SECRET), true);
  assert.ok(!url.includes('@'));
});

test('cabeceras: List-Unsubscribe con la dirección entre < > y List-Unsubscribe-Post de un clic (RFC 8058)', () => {
  const url = lib.unsubscribeUrl(SITE, USER, SECRET, 'es');
  assert.deepEqual(plain(lib.unsubscribeHeaders(url)), {
    'List-Unsubscribe': `<${url}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  });
  assert.ok(url.startsWith('https://'), 'el enlace de baja es https');
});

// ───────────────────────── textos ─────────────────────────

test('textos de la baja: las diez filas están completas en los siete idiomas', () => {
  const rows = textsLib.UNSUBSCRIBE_TEXT_ROWS;
  assert.equal(rows.length, 10);
  for (const row of rows) {
    assert.equal(row.length, 8, row[0]);
    for (const cell of row) assert.ok(typeof cell === 'string' && cell.trim().length > 0, `${row[0]} vacío`);
    assert.ok(row.slice(1).every((cell) => !/[{}]/.test(cell)), `${row[0]}: sin variables sin rellenar`);
  }
  for (const locale of LOCALES) {
    assert.notEqual(textsLib.unsubscribeText(locale, 'button'), 'button');
  }
  assert.equal(textsLib.unsubscribeText('xx', 'button'), 'Darme de baja', 'idioma desconocido: español');
});

// ───────────────────────── página GET (no cambia nada) ─────────────────────────

test('GET con un enlace válido enseña UN botón de baja y no toca la base de datos', async () => {
  const { module, db } = route();
  const response = await module.GET(requestFor(goodQuery(USER, 'de')));
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /<html lang="de">/);
  assert.ok(html.includes('Mich abmelden'));
  assert.match(html, /<form method="post" action="\/api\/email\/unsubscribe\?u=3f2b8c1e-5a4d-4e6f-9a7b-1c2d3e4f5a6b&amp;t=[A-Za-z0-9_-]{43}&amp;l=de">/);
  assert.equal((html.match(/<button/g) ?? []).length, 1);
  assert.deepEqual(db.state.tables, [], 'abrir el enlace no consulta ni cambia nada: un programa de seguridad puede abrirlo sin dar de baja a nadie');
  assert.equal(db.state.updates.length, 0);
});

test('GET y POST: la página no se indexa, no se guarda y no deja pasar el referente', async () => {
  const { module } = route();
  for (const response of [await module.GET(requestFor(goodQuery())), await module.POST(requestFor(goodQuery())), await module.GET(requestFor('?u=1'))]) {
    assert.match(response.headers.get('Content-Type'), /^text\/html; charset=utf-8$/);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(response.headers.get('X-Robots-Tag'), 'noindex, nofollow');
    assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer');
    assert.match(response.headers.get('Content-Security-Policy'), /default-src 'none'/);
    assert.match(response.headers.get('Content-Security-Policy'), /frame-ancestors 'none'/);
    assert.match(await response.text(), /<meta name="robots" content="noindex, nofollow">/);
  }
});

test('GET: firma mal, cuenta de otra persona, datos que faltan o clave sin configurar → error y no se toca nada', async () => {
  const bad = [
    '', '?u=', `?u=${USER}`, `?t=${lib.signUnsubscribe(USER, SECRET)}`, `?u=${USER}&t=mala`,
    `?u=${OTHER}&t=${lib.signUnsubscribe(USER, SECRET)}`, `?u=${USER}&t=${lib.signUnsubscribe(USER, 'otra-clave-distinta-de-mas-de-32-caracteres')}`,
    `?u=no-es-un-uuid&t=${lib.signUnsubscribe(USER, SECRET)}`, `?u=${USER}%27%20or%201%3D1&t=${lib.signUnsubscribe(USER, SECRET)}`,
  ];
  for (const query of bad) {
    const { module, db } = route();
    const get = await module.GET(requestFor(query));
    assert.equal(get.status, 400, query);
    const post = await module.POST(requestFor(query));
    assert.equal(post.status, 400, query);
    assert.equal(db.state.tables.length, 0, `${query}: sin firma correcta no se consulta ni se cambia nada`);
    assert.ok(!(await post.text()).includes('Te has dado de baja'));
  }
  for (const env of [{ ...ENV, EMAIL_UNSUBSCRIBE_SECRET: '' }, { ...ENV, EMAIL_UNSUBSCRIBE_SECRET: 'corta' }]) {
    const { module, db } = route(env);
    assert.equal((await module.GET(requestFor(goodQuery()))).status, 503);
    assert.equal((await module.POST(requestFor(goodQuery()))).status, 503);
    assert.equal(db.state.tables.length, 0);
  }
});

test('idioma: uno desconocido o con código raro vuelve al español y nunca se escribe tal cual en la página', async () => {
  const { module } = route();
  const evil = '"><script>alert(1)</script>';
  for (const locale of ['xx', 'ES', evil, '']) {
    const html = await (await module.GET(requestFor(`?u=${USER}&t=${lib.signUnsubscribe(USER, SECRET)}&l=${encodeURIComponent(locale)}`))).text();
    assert.match(html, /<html lang="es">/, locale);
    assert.ok(!html.includes('<script>alert'), locale);
  }
});

// ───────────────────────── baja (POST) ─────────────────────────

test('POST válido: pone email_consent = false SOLO en la fila de esa cuenta y enseña «Te has dado de baja»', async () => {
  const { module, db } = route();
  const response = await module.POST(requestFor(goodQuery(USER, 'es')));
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.ok(html.includes('Te has dado de baja'));
  assert.deepEqual(db.state.tables, ['email_preferences']);
  assert.deepEqual(plain(db.state.updates), [{ email_consent: false }], 'no cambia nada más');
  assert.deepEqual(plain(db.state.filters), [['user_id', USER]], 'solo esa cuenta');
});

test('POST: se puede repetir sin problema (el programa de correo y el botón de la página pueden llamar los dos)', async () => {
  const { module, db } = route();
  for (let index = 0; index < 3; index += 1) assert.equal((await module.POST(requestFor(goodQuery()))).status, 200);
  assert.equal(db.state.updates.length, 3);
  assert.ok(db.state.updates.every((values) => Object.keys(values).join() === 'email_consent' && values.email_consent === false));
});

test('POST: la baja del programa de correo (cuerpo «List-Unsubscribe=One-Click») funciona igual', async () => {
  const { module, db } = route();
  const response = await module.POST({ url: `${SITE}/api/email/unsubscribe${goodQuery()}`, method: 'POST', text: async () => 'List-Unsubscribe=One-Click' });
  assert.equal(response.status, 200);
  assert.deepEqual(plain(db.state.updates), [{ email_consent: false }]);
});

test('POST: si Supabase falla o no está configurado, lo dice y NUNCA afirma una baja que no se ha guardado', async () => {
  const cases = [
    route(ENV, fakeDb({ fail: true })),
    route(ENV, fakeDb({ throws: true })),
    route({ ...ENV, SUPABASE_SECRET_KEY: '' }),
  ];
  for (const { module } of cases) {
    const response = await module.POST(requestFor(goodQuery(USER, 'en')));
    const html = await response.text();
    assert.equal(response.status, 503);
    assert.ok(html.includes('We could not unsubscribe you'));
    assert.ok(!html.includes('You have been unsubscribed'));
  }
});

test('POST: cada idioma muestra su propio mensaje de baja hecha', async () => {
  for (const locale of LOCALES) {
    const { module } = route();
    const html = await (await module.POST(requestFor(goodQuery(USER, locale)))).text();
    assert.match(html, new RegExp(`<html lang="${locale}">`));
    assert.ok(html.includes(textsLib.unsubscribeText(locale, 'doneTitle').replace(/'/g, '&#39;')), locale);
  }
});

// ───────────────────────── correo ─────────────────────────

const base = loadAll(ENV);
const monthly = base('lib/travelpayouts/monthly.ts');
const { getDestinationById } = base('lib/destinations/index.ts');
const render = base('lib/email/render.ts');
const IDS = monthly.candidatesForMonth(3).filter((profile) => !monthly.isOriginCity(profile, 'MAD')).slice(0, 3).map((profile) => profile.id);
const picks = IDS.map((id, index) => ({
  offer: { profile: getDestinationById(id), price: 60 + index, departureAt: '2027-03-12', returnAt: '2027-03-14', nights: 2, transfers: 0, offerUrl: 'https://www.aviasales.com/search/X?marker=1' },
  seenAt: new Date('2026-11-15T01:00:00.000Z'), year: 2027, month: 3,
}));
const emailInput = (extra = {}) => ({
  locale: 'es', originCode: 'MAD', months: [3], maxPrice: 200, picks, now: new Date('2026-11-17T12:00:00.000Z'), siteUrl: SITE,
  banner: null, reason: 'Motivo de ejemplo.', ...extra,
});

test('correo: con enlace de baja propio, el pie y el texto plano lo usan; sin él (correo de prueba) sigue yendo a la portada', () => {
  const url = lib.unsubscribeUrl(SITE, USER, SECRET, 'es');
  const withLink = render.renderFlightEmail(emailInput({ unsubscribeUrl: url }));
  const escaped = url.replace(/&/g, '&amp;');
  assert.ok(withLink.html.includes(`href="${escaped}"`), 'el botón de baja del pie lleva el enlace firmado');
  assert.match(withLink.html, new RegExp(`href="${escaped.replace(/[?.]/g, '\\$&')}"[^>]*>Darme de baja con un clic<`));
  assert.ok(withLink.text.includes(`Darme de baja con un clic: ${url}`));
  const without = render.renderFlightEmail(emailInput());
  assert.ok(without.html.includes(`href="${SITE}/" style="display:inline-block;color:#1d4ed8;font-size:13px;line-height:20px;padding:10px 18px 10px 0;font-weight:600;">Darme de baja con un clic<`));
  assert.ok(without.text.includes(`Darme de baja con un clic: ${SITE}/`));
});

test('código: la ruta de baja no envía correos, no lee usuarios ni la tabla y no usa más que email_preferences', () => {
  const source = read('app/api/email/unsubscribe/route.ts');
  assert.ok(!/resend|fetch\(|auth\.admin|listUsers|\.select\(|\.insert\(|\.delete\(|\.upsert\(/i.test(source));
  assert.equal((source.match(/\.from\('([a-z_]+)'\)/g) ?? []).join(), ".from('email_preferences')");
  assert.ok(!/console\./.test(source), 'no se escriben enlaces ni firmas en los registros');
  const lib = read('lib/email/unsubscribe.ts');
  assert.ok(!/console\./.test(lib));
});
