// Correo de vuelos a buen precio (fase 2: correo de PRUEBA solo para el propietario). Plantilla en siete idiomas, elección de
// vuelos reales ya guardados, comprobaciones de seguridad y ruta protegida. Todo con datos simulados: ninguna prueba llama a
// Resend, a Travelpayouts ni a Supabase, y los precios son de mentira.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { loader } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const LOCALES = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
const NOW_ISO = '2026-11-17T12:00:00.000Z';
const NOW = new Date(NOW_ISO);
const SEEN = '2026-11-15T01:00:00.000Z'; // hace 2 días
const YEAR = 2027; // marzo y junio se miran siempre en el año siguiente desde noviembre de 2026
const SITE = 'https://destinauta.com';
const RECIPIENT = 'propietario@example.com';
const plain = (value) => JSON.parse(JSON.stringify(value));
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function fixedDate(iso) {
  const RealDate = Date;
  return class FixedDate extends RealDate {
    constructor(...args) { if (args.length === 0) super(iso); else super(...args); }
    static now() { return new RealDate(iso).getTime(); }
  };
}

// Supabase de mentira con la tabla `monthly_prices`: filtra como lo haría la base de datos y anota cada consulta.
function fakeDb(rows = []) {
  const state = { rows, selects: [], failSelect: false, throwSelect: false, tables: [], writes: 0 };
  const client = {
    from(table) {
      state.tables.push(table);
      assert.equal(table, 'monthly_prices');
      return {
        select(columns) {
          const query = { columns, filters: [] };
          state.selects.push(query);
          const builder = {
            eq(column, value) { query.filters.push(['eq', column, value]); return builder; },
            gte(column, value) { query.filters.push(['gte', column, value]); return builder; },
            then(resolve, reject) {
              if (state.throwSelect) return Promise.reject(new Error('boom')).then(resolve, reject);
              if (state.failSelect) return Promise.resolve({ data: null, error: { message: 'boom' } }).then(resolve, reject);
              const data = state.rows.filter((row) => typeof row !== 'object' || row === null || query.filters.every(([operator, column, value]) =>
                operator === 'eq' ? row[column] === value : row[column] >= value));
              return Promise.resolve({ data, error: null }).then(resolve, reject);
            },
          };
          return builder;
        },
        upsert() { state.writes += 1; throw new Error('el correo de prueba nunca escribe en la base de datos'); },
        insert() { state.writes += 1; throw new Error('el correo de prueba nunca escribe en la base de datos'); },
        update() { state.writes += 1; throw new Error('el correo de prueba nunca escribe en la base de datos'); },
        delete() { state.writes += 1; throw new Error('el correo de prueba nunca escribe en la base de datos'); },
      };
    },
  };
  return { client, state };
}

function loadAll(env = {}, db = fakeDb(), globals = {}, mocks = {}) {
  return loader(root, { '@supabase/supabase-js': { createClient: () => db.client }, ...mocks }, { process: { env }, AbortSignal, console: { info() {} }, ...globals });
}

const base = loadAll();
const monthly = base('lib/travelpayouts/monthly.ts');
const { getDestinationById } = base('lib/destinations/index.ts');
const picksLib = base('lib/email/picks.ts');
const render = base('lib/email/render.ts');
const texts = base('lib/email/texts.ts');
const guard = base('lib/email/guard.ts');
const resend = base('lib/email/resend.ts');
const config = base('lib/email/config.ts');

// Destinos reales del catálogo que valen para marzo y junio y no son Madrid.
const validIn = (month) => monthly.candidatesForMonth(month).filter((profile) => !monthly.isOriginCity(profile, 'MAD'));
const IDS = validIn(3).filter((profile) => validIn(6).includes(profile)).slice(0, 6).map((profile) => profile.id);
assert.ok(IDS.length >= 5, 'el catálogo tiene destinos válidos para marzo y junio');
const name = (id) => getDestinationById(id).name;
const OFFER_URL = 'https://www.aviasales.com/search/MAD1203LIS14031?marker=prueba';

const row = (id, month, price, extra = {}) => ({
  origin: 'MAD', destination_id: id, year: YEAR, month, price,
  departure_at: `${YEAR}-${String(month).padStart(2, '0')}-12`, return_at: `${YEAR}-${String(month).padStart(2, '0')}-14`,
  nights: 2, transfers: 0, offer_url: OFFER_URL, seen_at: SEEN, ...extra,
});
const pick = (id, price, extra = {}, seen = SEEN) => ({
  offer: {
    profile: getDestinationById(id), price, departureAt: `${YEAR}-03-12`, returnAt: `${YEAR}-03-14`, nights: 2, transfers: 0,
    offerUrl: OFFER_URL, ...extra,
  },
  seenAt: new Date(seen), year: YEAR, month: 3,
});
const THREE = [pick(IDS[0], 58.4), pick(IDS[1], 74, { transfers: 1 }), pick(IDS[2], 69.9, { transfers: 2 })];

function input(overrides = {}) {
  return {
    locale: 'es', originCode: 'MAD', months: [3, 6], maxPrice: 200, picks: THREE, now: NOW, siteUrl: SITE,
    banner: 'Correo de prueba de ejemplo', reason: 'Motivo de ejemplo.', ...overrides,
  };
}
const euros = (locale, value) => new Intl.NumberFormat(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);

// ───────────────────────── textos ─────────────────────────

test('textos: todas las filas tienen los siete idiomas, ninguno vacío y las mismas variables en todos', () => {
  const variables = (value) => (value.match(/\{\w+\}/g) ?? []).sort().join(',');
  const keys = new Set();
  for (const rowValues of texts.FLIGHT_EMAIL_TEXT_ROWS) {
    assert.equal(rowValues.length, 8, `fila ${rowValues[0]}: clave + 7 idiomas`);
    assert.ok(!keys.has(rowValues[0]), `clave repetida ${rowValues[0]}`);
    keys.add(rowValues[0]);
    rowValues.slice(1).forEach((value, index) => {
      assert.ok(value.trim().length > 0, `${rowValues[0]} vacío en ${LOCALES[index]}`);
      assert.equal(variables(value), variables(rowValues[1]), `${rowValues[0]}: variables distintas en ${LOCALES[index]}`);
    });
  }
});

test('aviso de afiliado: no promete «sin coste extra» en ningún idioma (decisión del 17-11 hasta comprobar las condiciones)', () => {
  const promises = [/sin (coste|cargo|costo)/i, /no (extra|additional) cost|at no (extra )?cost|free of charge/i, /sans (frais|coût)/i,
    /ohne (zusätzliche )?kosten|kostenlos/i, /senza (costi|costo)/i, /sem (custo|encargo)/i, /sense (cost|càrrec)/i];
  for (const locale of LOCALES) {
    const affiliate = texts.flightEmailText(locale, 'affiliate');
    assert.ok(affiliate.length > 30, locale);
    for (const pattern of promises) assert.doesNotMatch(affiliate, pattern, `${locale}: ${affiliate}`);
  }
  assert.equal(texts.flightEmailText('es', 'affiliate'), 'Algunos enlaces son de afiliado: Destinauta puede recibir una comisión si reservas.');
});

test('textos: si falta una traducción se usa el español y la variable sin valor se queda como está', () => {
  assert.equal(texts.flightEmailText('es', 'seenMany', { count: 3 }), 'Precio visto hace 3 días. Puede cambiar.');
  assert.equal(texts.flightEmailText('es', 'seenMany'), 'Precio visto hace {count} días. Puede cambiar.');
  assert.equal(texts.flightEmailText('fr', 'tagline'), 'Vols à bon prix');
});

// ───────────────────────── plantilla ─────────────────────────

test('asunto: «por menos de X» siempre es mayor que el precio más alto que sale en el correo', () => {
  const cases = [[58.4, 74, 69.9, 80], [99, 10, 20, 100], [119.2, 5, 6, 130], [120, 1, 2, 130], [9.1, 3, 4, 20], [100, 1, 1, 110]];
  for (const [highest, a, b, limit] of cases) {
    const picks = [pick(IDS[0], a), pick(IDS[1], b), pick(IDS[2], highest)];
    const email = render.renderFlightEmail(input({ picks }));
    assert.equal(email.subject, `3 vuelos desde Madrid por menos de ${euros('es', limit)} (ida y vuelta)`, `precio más alto ${highest}`);
    assert.ok(Math.ceil(highest) < limit);
  }
});

test('precios: solo salen los de las ofertas (redondeados hacia arriba como en la web) y nunca otro precio', () => {
  const email = render.renderFlightEmail(input());
  const allowed = new Set([59, 70, 74, 80, 200].map((value) => euros('es', value)));
  const found = email.html.match(/\d[\d.]* €/g) ?? [];
  assert.ok(found.length >= 4);
  for (const price of found) assert.ok(allowed.has(price), `precio inesperado ${price}`);
  for (const price of [59, 70, 74].map((value) => euros('es', value))) assert.ok(email.html.includes(price), price);
  assert.doesNotMatch(email.html, /€\s?\d/, 'el símbolo va detrás en español');
  assert.ok(email.text.includes(euros('es', 59)) && email.text.includes(euros('es', 70)) && email.text.includes(euros('es', 74)));
});

test('estructura del diseño aprobado: cabecera, criterios, tres tarjetas, botón de más vuelos, avisos y pie', () => {
  const email = render.renderFlightEmail(input());
  const { html } = email;
  assert.match(html, /<html lang="es">/);
  assert.match(html, />Destinauta<\/div>/);
  assert.match(html, /Vuelos a buen precio/);
  assert.match(html, /<h1[^>]*>Tus vuelos más baratos desde Madrid<\/h1>/);
  assert.match(html, /para viajar en marzo y junio, según lo que nos contaste\./);
  for (const chip of ['Madrid (MAD)', 'mar y jun', `Hasta ${euros('es', 200)}`]) assert.ok(html.includes(`>${chip}</span>`), chip);
  assert.equal((html.match(/Ver este vuelo/g) ?? []).length, 3);
  for (const id of IDS.slice(0, 3)) assert.ok(html.includes(`alt="${name(id)}`) || html.includes(name(id).replace(/&/g, '&amp;')), name(id));
  assert.ok(html.includes('Precio visto hace 2 días. Puede cambiar.'));
  assert.match(html, /Precios orientativos\.<\/strong> Son los que hemos visto hace unos días/);
  assert.ok(html.includes('Destinauta no vende billetes'));
  for (const label of ['Darme de baja con un clic', 'Cambiar mis preferencias', 'Política de privacidad', 'Aviso legal']) assert.ok(html.includes(label), label);
  assert.ok(html.includes(`${SITE}/privacidad`) && html.includes(`${SITE}/aviso-legal`));
  assert.ok(html.includes(`${SITE}/email/logo-correo.png`));
  assert.ok(html.includes('Correo de prueba de ejemplo') && html.includes('Motivo de ejemplo.'));
  assert.match(html, /\[PENDIENTE: titular, NIF\/CIF y domicilio\]/, 'mientras falten los datos del titular se ve el hueco resaltado');
  assert.ok(html.includes('background:#fef08a'));
});

test('móvil: al apilar la tarjeta, la celda del texto cuenta su margen interior dentro del 100 % y la línea de detalles no se corta', () => {
  // Fallo visto en el correo de prueba del 17-11: con «width:100%» y 20 px de margen a cada lado, la celda se pasaba 40 px del ancho
  // de la tarjeta (que recorta lo que sobresale) y se perdían las últimas palabras de «país · fechas · noches · escalas».
  const { html } = render.renderFlightEmail(input());
  const media = html.slice(html.indexOf('@media'), html.indexOf('</style>'));
  const rule = media.match(/\.stack\{([^}]*)\}/);
  assert.ok(rule, 'existe la regla .stack en la versión móvil');
  assert.match(rule[1], /width:100% !important/);
  assert.match(rule[1], /box-sizing:border-box !important/, 'sin esto el margen interior se suma al 100 % y la tarjeta recorta el texto');
  assert.match(html, /<td class="stack" valign="top" style="padding:18px 20px;/, 'la celda del texto es la que lleva el margen interior');
  assert.doesNotMatch(html, /white-space:\s*nowrap/, 'ninguna línea del correo se fuerza a una sola línea');
});

test('aviso de afiliado: justo debajo de las tarjetas, en 12 px, antes del botón de más vuelos y fuera del recuadro gris', () => {
  const { html } = render.renderFlightEmail(input());
  const affiliate = html.indexOf('Algunos enlaces son de afiliado');
  const lastCard = html.lastIndexOf('Ver este vuelo');
  const more = html.indexOf('Ver más vuelos de marzo');
  const box = html.indexOf('Precios orientativos.');
  assert.ok(lastCard > 0 && affiliate > lastCard, 'después de la última tarjeta');
  assert.ok(more > affiliate, 'antes del botón «Ver más vuelos»');
  assert.ok(box > more, 'el recuadro gris de precios orientativos va después');
  const paragraph = html.slice(html.lastIndexOf('<p', affiliate), affiliate);
  assert.match(paragraph, /font-size:12px/);
  assert.match(paragraph, /color:#57534e/);
  assert.doesNotMatch(html, /sin coste extra/i);
  const grey = html.slice(html.indexOf('background:#f5f5f4'), html.indexOf('</div>', html.indexOf('background:#f5f5f4')));
  assert.ok(!grey.includes('afiliado'), 'el aviso no está dentro del recuadro gris');
});

test('botón «Ver más vuelos de …»: lleva a la página del primer mes elegido', () => {
  assert.ok(render.renderFlightEmail(input({ months: [3, 6] })).html.includes(`href="${SITE}/viajes-baratos/marzo"`));
  const swapped = render.renderFlightEmail(input({ months: [6, 3] }));
  assert.ok(swapped.html.includes(`href="${SITE}/viajes-baratos/junio"`));
  assert.ok(swapped.html.includes('Ver más vuelos de junio'));
});

test('fecha del precio: hoy, hace 1 día y hace N días; una fecha futura cuenta como hoy', () => {
  const seenAt = (iso) => render.renderFlightEmail(input({ picks: [pick(IDS[0], 50, {}, iso), pick(IDS[1], 60, {}, iso), pick(IDS[2], 70, {}, iso)] })).html;
  assert.ok(seenAt('2026-11-17T08:00:00.000Z').includes('Precio visto hoy. Puede cambiar.'));
  assert.ok(seenAt('2026-11-16T08:00:00.000Z').includes('Precio visto hace 1 día. Puede cambiar.'));
  assert.ok(seenAt('2026-11-14T11:00:00.000Z').includes('Precio visto hace 3 días. Puede cambiar.'));
  assert.ok(seenAt('2026-11-18T08:00:00.000Z').includes('Precio visto hoy. Puede cambiar.'));
});

test('detalles de cada vuelo: fechas, noches y escalas con las palabras de «Viajes por mes»', () => {
  const email = render.renderFlightEmail(input());
  assert.ok(email.html.includes('12–14 mar · 2 noches · directo'));
  assert.ok(email.html.includes('12–14 mar · 2 noches · 1 escala'));
  assert.ok(email.html.includes('12–14 mar · 2 noches · 2 escalas'));
  const unknown = render.renderFlightEmail(input({ picks: [pick(IDS[0], 50, { transfers: null }), pick(IDS[1], 60), pick(IDS[2], 70)] }));
  assert.ok(unknown.html.includes('12–14 mar · 2 noches</div>'), 'sin dato de escalas no se dice nada');
});

test('seguridad: todo lo de fuera se escapa y un enlace que no es http(s) se cambia por la ficha del destino', () => {
  assert.equal(render.escapeHtml(`<a href="x" onclick='y'>&</a>`), '&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
  const evil = render.renderFlightEmail(input({
    banner: '<script>alert(1)</script>', reason: '"><img src=x onerror=alert(1)>',
    picks: [pick(IDS[0], 50, { offerUrl: 'javascript:alert(1)' }), pick(IDS[1], 60, { offerUrl: 'data:text/html,hola' }), pick(IDS[2], 70)],
  }));
  assert.doesNotMatch(evil.html, /<script|javascript:|data:text|<img src=x/i);
  assert.ok(evil.html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  const href = (id) => `${SITE}/?ficha=${encodeURIComponent(name(id))}`;
  assert.ok(evil.html.includes(`href="${href(IDS[0])}"`) && evil.html.includes(`href="${href(IDS[1])}"`));
  assert.ok(evil.html.includes('Ver destino'), 'sin oferta válida el botón dice «Ver destino»');
  assert.ok(evil.html.includes(`href="${OFFER_URL}"`) || evil.html.includes(`href="${OFFER_URL.replace(/&/g, '&amp;')}"`));
});

test('fotos: las rutas de la propia web se vuelven absolutas y las demás se dejan como están', () => {
  const local = { ...getDestinationById(IDS[0]), image: '/images/prueba.webp' };
  const html = render.renderFlightEmail(input({ picks: [pick(IDS[0], 50, { profile: local }), pick(IDS[1], 60), pick(IDS[2], 70)] })).html;
  assert.ok(html.includes(`src="${SITE}/images/prueba.webp"`));
  assert.ok(html.includes(`src="${getDestinationById(IDS[1]).image.replace(/&/g, '&amp;')}"`));
});

test('texto plano: lleva todos los vuelos, los avisos y los enlaces, sin etiquetas HTML', () => {
  const { text } = render.renderFlightEmail(input());
  assert.doesNotMatch(text, /<[a-z/!]/i);
  for (const id of IDS.slice(0, 3)) assert.ok(text.includes(name(id)), name(id));
  assert.ok(text.includes('Algunos enlaces son de afiliado') && text.includes('Precios orientativos.'));
  assert.ok(text.includes(OFFER_URL) && text.includes(`${SITE}/privacidad`) && text.includes(`${SITE}/aviso-legal`));
  assert.ok(text.startsWith('CORREO DE PRUEBA DE EJEMPLO'));
  const noBanner = render.renderFlightEmail(input({ banner: null }));
  assert.doesNotMatch(noBanner.html, /fef3c7/);
  assert.ok(noBanner.text.startsWith('Tus vuelos más baratos desde Madrid'));
});

test('siete idiomas: el correo sale completo en cada uno, sin variables sin rellenar', () => {
  for (const locale of LOCALES) {
    const email = render.renderFlightEmail(input({ locale }));
    assert.ok(email.html.includes(`<html lang="${locale}">`), locale);
    for (const part of [email.subject, email.html, email.text]) assert.doesNotMatch(part, /\{\w+\}/, `${locale}: variable sin rellenar`);
    assert.ok(email.html.includes(texts.flightEmailText(locale, 'affiliate')), locale);
    assert.ok(email.html.includes(texts.flightEmailText(locale, 'disclaimerBody')), locale);
    assert.ok(email.html.includes(texts.flightEmailText(locale, 'unsubscribe')), locale);
    assert.ok(email.html.includes(euros(locale, 59)), `${locale}: precio con el formato del idioma`);
    assert.equal((email.html.match(/font-size:12px;line-height:18px;color:#57534e/g) ?? []).length >= 4, true, `${locale}: letra pequeña de 12 px`);
  }
  assert.match(render.renderFlightEmail(input({ locale: 'en' })).subject, /^3 flights from Madrid for under .* \(round trip\)$/);
  assert.match(render.renderFlightEmail(input({ locale: 'de' })).html, /Flüge/);
  assert.match(render.renderFlightEmail(input({ locale: 'fr' })).html, /mars et juin/);
  assert.match(render.renderFlightEmail(input({ locale: 'ca' })).html, /març i juny/);
});

test('titular del pie: completo solo cuando están nombre, NIF/CIF, domicilio y correo', () => {
  assert.deepEqual(plain(render.ownerIdentification()), { complete: false, text: '[PENDIENTE: titular, NIF/CIF y domicilio]' });
  const owner = (data) => loadAll({}, fakeDb(), {}, { '@/lib/legal/owner': { OWNER_DATA: data } })('lib/email/render.ts').ownerIdentification();
  const full = { name: 'Nombre de Prueba', taxId: 'X0000000X', address: 'Calle Falsa 1, Madrid', email: 'contacto@example.com', registry: '' };
  assert.deepEqual(plain(owner(full)), { complete: true, text: 'Nombre de Prueba · X0000000X · Calle Falsa 1, Madrid' });
  for (const field of ['name', 'taxId', 'address', 'email']) assert.equal(owner({ ...full, [field]: '' }).complete, false, field);
});

test('icono de la cabecera: PNG de 120×120 guardado en la propia web (los correos no admiten SVG)', () => {
  const png = fs.readFileSync(path.join(root, 'public/email/logo-correo.png'));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 120);
  assert.equal(png.readUInt32BE(20), 120);
  assert.ok(png.length < 20000);
});

// ───────────────────────── elección de vuelos ─────────────────────────

test('lectura: pide cada mes con su año, solo precios vistos hace como mucho 3 días y nunca escribe', async () => {
  const db = fakeDb([row(IDS[0], 3, 58), row(IDS[1], 6, 74)]);
  const found = await picksLib.readFlightPicks(db.client, { origin: 'MAD', months: [3, 6], now: NOW });
  assert.deepEqual(plain(found.map((item) => [item.offer.profile.id, item.month, item.year])), [[IDS[0], 3, YEAR], [IDS[1], 6, YEAR]]);
  assert.equal(db.state.selects.length, 2);
  assert.deepEqual(plain(db.state.selects[0].filters), [
    ['eq', 'origin', 'MAD'], ['eq', 'year', YEAR], ['eq', 'month', 3], ['gte', 'seen_at', '2026-11-14T12:00:00.000Z']]);
  assert.equal(db.state.writes, 0);
  assert.ok(found[0].seenAt instanceof Date && found[0].seenAt.toISOString() === SEEN);
});

test('lectura: descarta precios viejos, viajes ya salidos, estancias fuera de 2–5 noches, destinos no válidos y el propio origen', async () => {
  const madrid = monthly.candidatesForMonth(3).find((profile) => monthly.isOriginCity(profile, 'MAD'));
  const notMarch = monthly.candidatesForMonth(7).find((profile) => !monthly.candidatesForMonth(3).includes(profile));
  const rows = [
    row(IDS[0], 3, 58),
    row(IDS[1], 3, 40, { seen_at: '2026-11-13T00:00:00.000Z' }),
    row(IDS[2], 3, 40, { departure_at: '2026-03-12', return_at: '2026-03-14' }),
    row(IDS[3], 3, 40, { return_at: `${YEAR}-03-20` }),
    row(IDS[4], 3, 40, { price: 0 }),
    row(IDS[5], 3, 40, { seen_at: 'no es una fecha' }),
    ...(madrid ? [row(madrid.id, 3, 20)] : []),
    ...(notMarch ? [row(notMarch.id, 3, 20)] : []),
    { ...row(IDS[0], 3, 10), origin: 'BCN' },
    'basura', null,
  ];
  const found = await picksLib.readFlightPicks(fakeDb(rows).client, { origin: 'MAD', months: [3], now: NOW });
  assert.deepEqual(plain(found.map((item) => item.offer.profile.id)), [IDS[0]]);
});

test('lectura: si Supabase falla o lanza un error devuelve una lista vacía y no rompe', async () => {
  const failing = fakeDb([row(IDS[0], 3, 58)]);
  failing.state.failSelect = true;
  assert.deepEqual(plain(await picksLib.readFlightPicks(failing.client, { origin: 'MAD', months: [3, 6], now: NOW })), []);
  const throwing = fakeDb([row(IDS[0], 3, 58)]);
  throwing.state.throwSelect = true;
  assert.deepEqual(plain(await picksLib.readFlightPicks(throwing.client, { origin: 'MAD', months: [3], now: NOW })), []);
  assert.deepEqual(plain(await picksLib.readFlightPicks(fakeDb().client, { origin: 'MAD', months: [0, 13, 3.5], now: NOW })), []);
});

test('elección: un destino por vez (su mejor precio entre los meses), del más barato al más caro y con el límite pedido', () => {
  const candidates = [
    pick(IDS[0], 62), { ...pick(IDS[0], 55), month: 6 }, pick(IDS[1], 80), pick(IDS[2], 70), pick(IDS[3], 60), pick(IDS[4], 65),
  ];
  const chosen = picksLib.choosePicks(candidates);
  assert.deepEqual(plain(chosen.map((item) => [item.offer.profile.id, item.offer.price])), [[IDS[0], 55], [IDS[3], 60], [IDS[4], 65]]);
  assert.equal(picksLib.choosePicks(candidates, { limit: 5 }).length, 5);
  assert.equal(picksLib.choosePicks(candidates, { limit: 0 }).length, 0);
  assert.deepEqual(plain(picksLib.choosePicks([])), []);
});

test('elección: el tope de precio se aplica al precio redondeado hacia arriba, igual que el que se enseña', () => {
  const candidates = [pick(IDS[0], 200.2), pick(IDS[1], 199.4), pick(IDS[2], 200), pick(IDS[3], 120.01)];
  assert.deepEqual(plain(picksLib.choosePicks(candidates, { maxPrice: 200 }).map((item) => item.offer.profile.id)), [IDS[3], IDS[1], IDS[2]]);
  assert.equal(picksLib.choosePicks(candidates, { maxPrice: 100 }).length, 0);
  assert.equal(picksLib.choosePicks(candidates).length, 3);
  assert.deepEqual(plain(picksLib.BUDGET_LIMITS), { up100: 100, up200: 200, up400: 400 });
  assert.equal(picksLib.BUDGET_LIMITS.any, undefined);
});

test('elección: a igual precio gana el vuelo con menos escalas y, si siguen empatados, el de salida más temprana', () => {
  const candidates = [
    pick(IDS[0], 80, { transfers: 2 }), pick(IDS[0], 80, { transfers: 0, departureAt: `${YEAR}-03-20`, returnAt: `${YEAR}-03-22` }),
    pick(IDS[0], 80, { transfers: 0, departureAt: `${YEAR}-03-13`, returnAt: `${YEAR}-03-15` }),
    pick(IDS[1], 81), pick(IDS[2], 82),
  ];
  const [first] = picksLib.choosePicks(candidates);
  assert.equal(first.offer.transfers, 0);
  assert.equal(first.offer.departureAt, `${YEAR}-03-13`);
  const tie = picksLib.choosePicks([pick(IDS[2], 50), pick(IDS[1], 50), pick(IDS[0], 50)]);
  const names = tie.map((item) => item.offer.profile.name);
  assert.deepEqual(plain(names), [...names].sort((a, b) => a.localeCompare(b, 'es')), 'empate de precio: por nombre, siempre el mismo orden');
  assert.equal(picksLib.MAX_PICKS, 3);
  assert.equal(picksLib.MIN_PICKS, 3);
});

// ───────────────────────── seguridad ─────────────────────────

test('clave: solo coincide la misma clave exacta', () => {
  assert.equal(guard.sameSecret('Bearer abc', 'Bearer abc'), true);
  for (const wrong of ['', 'Bearer abd', 'Bearer ab', 'Bearer abcd', 'bearer abc', 'Bearer abc ']) assert.equal(guard.sameSecret(wrong, 'Bearer abc'), false, wrong);
});

test('destinatario: solo UNA dirección sencilla; listas, nombres, espacios y saltos de línea se rechazan', () => {
  for (const good of ['propietario@example.com', 'a.b+c@sub.example.co.uk']) assert.equal(guard.isSingleEmailAddress(good), true, good);
  const bad = [undefined, null, '', ' ', 'sin-arroba.com', 'a@b', 'a@b.', '@x.com', 'a@@x.com', 'a@x.com, b@x.com', 'a@x.com;b@x.com', 'a@x.com,b@x.com', 'a,b@x.com', 'a;b@x.com', 'a@x.com b@x.com',
    ' a@x.com', 'a@x.com ', 'a@x.com\n', 'a@x.com\r\nBcc: b@x.com', 'Nombre <a@x.com>', '"a"@x.com', 'a@x.com>', `${'a'.repeat(250)}@x.com`];
  for (const value of bad) assert.equal(guard.isSingleEmailAddress(value), false, JSON.stringify(value));
});

test('Resend: una sola petición HTTPS con la clave en la cabecera, un único destinatario y sin la clave en el resultado', async () => {
  const calls = [];
  const fetchImpl = async (url, init) => { calls.push({ url, init }); return { ok: true, status: 200, json: async () => ({ id: 'abc-123' }) }; };
  const result = await resend.sendEmail({ apiKey: 're_clave_de_prueba', from: config.EMAIL_FROM, to: RECIPIENT, subject: 'Asunto', html: '<p>Hola</p>', text: 'Hola',
    tags: [{ name: 'category', value: 'flights_test' }] }, fetchImpl);
  assert.deepEqual(plain(result), { ok: true, id: 'abc-123' });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer re_clave_de_prueba');
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.to, [RECIPIENT]);
  assert.equal(body.from, 'Destinauta <vuelos@avisos.destinauta.com>');
  assert.deepEqual(Object.keys(body).sort(), ['from', 'html', 'subject', 'tags', 'text', 'to']);
  assert.ok(!calls[0].init.body.includes('re_clave_de_prueba'));
  const failed = await resend.sendEmail({ apiKey: 'k', from: 'f', to: RECIPIENT, subject: 's', html: 'h', text: 't' }, async () => ({ ok: false, status: 422, json: async () => ({}) }));
  assert.deepEqual(plain(failed), { ok: false, status: 422 });
  const thrown = await resend.sendEmail({ apiKey: 'k', from: 'f', to: RECIPIENT, subject: 's', html: 'h', text: 't' }, async () => { throw new Error('red caída'); });
  assert.deepEqual(plain(thrown), { ok: false, status: 0 });
  const noId = await resend.sendEmail({ apiKey: 'k', from: 'f', to: RECIPIENT, subject: 's', html: 'h', text: 't' }, async () => ({ ok: true, status: 200, json: async () => { throw new Error('no json'); } }));
  assert.deepEqual(plain(noId), { ok: true, id: null });
});

// ───────────────────────── ruta protegida ─────────────────────────

const ENV = {
  CRON_SECRET: 'clave-de-prueba', NEXT_PUBLIC_SUPABASE_URL: 'https://proyecto.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_prueba',
  RESEND_API_KEY: 're_clave_de_prueba', EMAIL_TEST_RECIPIENT: RECIPIENT,
};
const request = (query = '', auth = 'Bearer clave-de-prueba') => ({
  url: `https://destinauta.com/api/email/test${query}`,
  headers: { get: (header) => (header.toLowerCase() === 'authorization' ? auth : null) },
});
const GOOD_ROWS = () => [row(IDS[0], 3, 58.4), row(IDS[1], 6, 74, { transfers: 1 }), row(IDS[2], 3, 69.9, { transfers: 2 }), row(IDS[3], 6, 150), row(IDS[4], 3, 260)];

async function runRoute({ env = ENV, rows = GOOD_ROWS(), query = '', auth, resendResponse } = {}) {
  const db = fakeDb(rows);
  const sent = [];
  const logs = [];
  const fetchImpl = async (url, init) => {
    sent.push({ url, init });
    return resendResponse ?? { ok: true, status: 200, json: async () => ({ id: 'correo-1' }) };
  };
  const load = loadAll(env, db, { fetch: fetchImpl, Response, AbortSignal, Date: fixedDate(NOW_ISO), console: { info: (line) => logs.push(line) } });
  const route = load('app/api/email/test/route.ts');
  const response = await route.GET(auth === undefined ? request(query) : request(query, auth));
  const raw = await response.text();
  return { response, raw, body: JSON.parse(raw), sent, db, logs };
}

test('ruta: sin CRON_SECRET en el servidor responde 503; con una clave equivocada o sin clave, 401, y no se envía ni se lee nada', async () => {
  const missing = await runRoute({ env: { ...ENV, CRON_SECRET: '' } });
  assert.equal(missing.response.status, 503);
  for (const auth of ['', 'Bearer otra', 'Bearer clave-de-prueba ', 'clave-de-prueba']) {
    const result = await runRoute({ auth });
    assert.equal(result.response.status, 401, auth);
    assert.deepEqual(plain(result.body), { success: false, error: 'unauthorized' });
    assert.equal(result.sent.length, 0);
    assert.equal(result.db.state.selects.length, 0, 'sin clave ni siquiera se consulta la base de datos');
  }
  assert.equal(missing.sent.length, 0);
});

test('ruta: parámetros no válidos (aeropuerto, meses, presupuesto, idioma) responden 400 y no envían nada', async () => {
  const queries = ['?origin=XXX', '?origin=', '?months=13', '?months=0', '?months=1,1', '?months=1,2,3,4,5', '?months=a', '?months=3,', '?budget=muchisimo', '?locale=xx', '?locale=EN'];
  for (const query of queries) {
    const result = await runRoute({ query });
    assert.equal(result.response.status, 400, query);
    assert.deepEqual(plain(result.body), { success: false, error: 'invalid_search' }, query);
    assert.equal(result.sent.length, 0, query);
  }
});

test('ruta: sin clave de Resend, sin destinatario o con más de un destinatario responde 503 y no envía; el ensayo no los necesita', async () => {
  const broken = [
    { ...ENV, RESEND_API_KEY: '' }, { ...ENV, EMAIL_TEST_RECIPIENT: '' }, { ...ENV, EMAIL_TEST_RECIPIENT: 'a@example.com, b@example.com' },
    { ...ENV, EMAIL_TEST_RECIPIENT: 'a@example.com\nBcc: b@example.com' }, { ...ENV, EMAIL_TEST_RECIPIENT: 'Nombre <a@example.com>' },
    { ...ENV, SUPABASE_SECRET_KEY: '' },
  ];
  for (const env of broken) {
    const result = await runRoute({ env });
    assert.equal(result.response.status, 503, JSON.stringify(env.EMAIL_TEST_RECIPIENT));
    assert.equal(result.body.error, 'not_configured');
    assert.equal(result.sent.length, 0);
  }
  const dry = await runRoute({ env: { ...ENV, RESEND_API_KEY: '', EMAIL_TEST_RECIPIENT: '' }, query: '?months=3,6&budget=up200&dry=1' });
  assert.equal(dry.response.status, 200);
  assert.equal(dry.body.dry, true);
});

test('ruta: con menos de 3 destinos con precio real y reciente NO envía nada (nunca se rellena con precios inventados)', async () => {
  const two = await runRoute({ rows: [row(IDS[0], 3, 58), row(IDS[1], 6, 74)], query: '?months=3,6' });
  assert.equal(two.response.status, 200);
  assert.deepEqual(plain(two.body), { success: false, sent: false, error: 'not_enough_data', found: 2, needed: 3 });
  assert.equal(two.sent.length, 0);
  const none = await runRoute({ rows: [] });
  assert.equal(none.body.error, 'not_enough_data');
  assert.equal(none.sent.length, 0);
  const old = await runRoute({ rows: GOOD_ROWS().map((item) => ({ ...item, seen_at: '2026-11-01T00:00:00.000Z' })), query: '?months=3,6' });
  assert.equal(old.body.error, 'not_enough_data', 'los precios de hace más de 3 días no sirven');
  assert.equal(old.sent.length, 0);
});

test('ruta: con datos reales envía UN solo correo al destinatario de la variable, desde el remitente verificado, y no lo repite en la respuesta', async () => {
  const result = await runRoute({ query: '?origin=MAD&months=3,6&budget=up200&locale=es' });
  assert.equal(result.response.status, 200);
  assert.equal(result.sent.length, 1);
  const call = result.sent[0];
  assert.equal(call.url, 'https://api.resend.com/emails');
  assert.equal(call.init.headers.Authorization, 'Bearer re_clave_de_prueba');
  const body = JSON.parse(call.init.body);
  assert.deepEqual(body.to, [RECIPIENT]);
  assert.equal(body.from, 'Destinauta <vuelos@avisos.destinauta.com>');
  assert.equal(body.subject, `3 vuelos desde Madrid por menos de ${euros('es', 80)} (ida y vuelta)`);
  assert.ok(body.html.includes('Correo de prueba · enviado solo al propietario de Destinauta'));
  assert.ok(body.html.includes(name(IDS[0])) && body.html.includes(name(IDS[2])) && body.html.includes(name(IDS[1])));
  assert.ok(!body.html.includes(name(IDS[3])) && !body.html.includes(name(IDS[4])), 'solo los 3 más baratos');
  assert.deepEqual(plain(result.body), {
    success: true, sent: true, id: 'correo-1', subject: body.subject,
    picks: [{ id: IDS[0], price: 59 }, { id: IDS[2], price: 70 }, { id: IDS[1], price: 74 }],
  });
  assert.ok(!result.raw.includes(RECIPIENT) && !result.raw.includes('re_clave_de_prueba') && !result.raw.includes('clave-de-prueba'));
  assert.equal(result.response.headers.get('Cache-Control'), 'no-store');
  assert.equal(result.db.state.writes, 0);
  assert.deepEqual(new Set(result.db.state.tables), new Set(['monthly_prices']));
});

test('ruta: deja UNA línea en el registro de Vercel con el resultado (enviado, sin datos suficientes o error de Resend), sin correos ni claves', async () => {
  const sent = await runRoute({ query: '?months=3,6&budget=up200' });
  assert.deepEqual(sent.logs, ['[email:test] {"ok":true,"sent":true,"picks":3}']);
  const notEnough = await runRoute({ rows: [], query: '?months=3,6' });
  assert.deepEqual(notEnough.logs, ['[email:test] {"ok":false,"sent":false,"reason":"not_enough_data","found":0,"needed":3}']);
  const rejected = await runRoute({ query: '?months=3,6&budget=up200', resendResponse: { ok: false, status: 403, json: async () => ({}) } });
  assert.deepEqual(rejected.logs, ['[email:test] {"ok":false,"sent":false,"reason":"email_provider_error","status":403}']);
  const unauthorized = await runRoute({ auth: 'Bearer otra' });
  assert.deepEqual(unauthorized.logs, [], 'sin clave no se registra nada');
  for (const line of [...sent.logs, ...notEnough.logs, ...rejected.logs]) {
    assert.ok(!line.includes(RECIPIENT) && !line.includes('re_clave_de_prueba') && !line.includes('clave-de-prueba') && !line.includes('@'));
  }
});

test('ruta: el destinatario no se puede cambiar desde la dirección (to, cc, bcc, recipient, email…)', async () => {
  const query = '?to=otra@example.com&cc=otra@example.com&bcc=otra@example.com&recipient=otra@example.com&email=otra@example.com&months=3,6&budget=up200';
  const result = await runRoute({ query });
  assert.equal(result.sent.length, 1);
  const body = JSON.parse(result.sent[0].init.body);
  assert.deepEqual(body.to, [RECIPIENT]);
  assert.ok(!('cc' in body) && !('bcc' in body) && !('reply_to' in body));
  assert.ok(!result.sent[0].init.body.includes('otra@example.com'));
});

test('ruta: el tope de precio deja fuera los vuelos más caros, el idioma cambia el correo y solo se consultan los meses pedidos', async () => {
  const rows = [row(IDS[0], 3, 58.4), row(IDS[1], 6, 74), row(IDS[2], 3, 100.2), row(IDS[3], 6, 130)];
  const capped = await runRoute({ rows, query: '?months=3,6&budget=up100' });
  assert.equal(capped.body.error, 'not_enough_data');
  assert.equal(capped.body.found, 2, 'el de 100,2 € (101 € redondeado) queda fuera del tope de 100 €');
  assert.equal(capped.sent.length, 0);
  const uncapped = await runRoute({ rows, query: '?months=3,6&budget=any' });
  assert.equal(uncapped.body.sent, true, 'sin tope entran los tres más baratos');
  const english = await runRoute({ rows: GOOD_ROWS(), query: '?months=3,6&budget=up200&locale=en' });
  const body = JSON.parse(english.sent[0].init.body);
  assert.match(body.subject, /^3 flights from Madrid for under /);
  assert.ok(body.html.includes('<html lang="en">'));
  const onlyMarch = await runRoute({ rows: GOOD_ROWS(), query: '?months=3' });
  assert.deepEqual(plain(onlyMarch.db.state.selects.map((query) => query.filters.find((filter) => filter[1] === 'month')[2])), [3]);
  assert.equal(onlyMarch.body.sent, true);
  assert.deepEqual(plain(onlyMarch.body.picks.map((item) => item.id)), [IDS[0], IDS[2], IDS[4]], 'solo cuentan los precios de marzo');
  const defaults = await runRoute({ rows: [] });
  assert.deepEqual(plain(defaults.db.state.selects.map((query) => query.filters.find((filter) => filter[1] === 'month')[2])), [12, 1], 'sin meses: los dos siguientes');
  assert.equal(defaults.db.state.selects[0].filters.find((filter) => filter[1] === 'origin')[2], 'MAD');
});

test('ruta: ensayo (dry=1) enseña asunto y precios sin enviar nada', async () => {
  const result = await runRoute({ query: '?months=3,6&budget=up200&dry=1' });
  assert.equal(result.response.status, 200);
  assert.equal(result.sent.length, 0);
  assert.equal(result.body.dry, true);
  assert.equal(result.body.sent, false);
  assert.deepEqual(plain(result.body.picks), [{ id: IDS[0], price: 59 }, { id: IDS[2], price: 70 }, { id: IDS[1], price: 74 }]);
  assert.ok(!result.raw.includes(RECIPIENT));
});

test('ruta: si Resend rechaza el envío responde 502 sin la clave ni el destinatario', async () => {
  for (const resendResponse of [{ ok: false, status: 403, json: async () => ({ message: 'domain not verified' }) }, { ok: false, status: 429, json: async () => ({}) }]) {
    const result = await runRoute({ query: '?months=3,6&budget=up200', resendResponse });
    assert.equal(result.response.status, 502);
    assert.deepEqual(plain(result.body), { success: false, sent: false, error: 'email_provider_error', status: resendResponse.status });
    assert.ok(!result.raw.includes(RECIPIENT) && !result.raw.includes('re_clave_de_prueba'));
  }
});

// ───────────────────────── configuración y código ─────────────────────────

test('tarea en vercel.json: una sola entrada del correo de prueba con la dirección válida y un calendario que no llega a ejecutarse solo', () => {
  const crons = JSON.parse(read('vercel.json')).crons.filter((cron) => cron.path.startsWith('/api/email/test'));
  assert.equal(crons.length, 1);
  const url = new URL(crons[0].path, SITE);
  assert.equal(url.pathname, '/api/email/test');
  assert.equal(url.searchParams.get('origin'), 'MAD');
  assert.equal(url.searchParams.get('months'), '3,6');
  assert.equal(url.searchParams.get('budget'), 'up200');
  assert.equal(url.searchParams.get('locale'), 'es');
  assert.deepEqual(Array.from(url.searchParams.keys()).sort(), ['budget', 'locale', 'months', 'origin'], 'sin destinatario ni claves en la dirección');
  // Vercel rechaza «30 de febrero» (0 0 30 2 *) porque «nunca se ejecutaría». El 29 de febrero solo existe en años bisiestos
  // (el próximo, 2028), así que en la práctica solo se lanza con «Run» en Cron Jobs.
  assert.equal(crons[0].schedule, '0 0 29 2 *');
});

test('código: las claves salen de variables de Vercel; no hay direcciones de correo ni claves escritas, ni lectura de usuarios', () => {
  const files = ['app/api/email/test/route.ts', 'lib/email/config.ts', 'lib/email/guard.ts', 'lib/email/log.ts', 'lib/email/picks.ts', 'lib/email/render.ts', 'lib/email/resend.ts', 'lib/email/texts.ts'];
  const route = read(files[0]);
  assert.match(route, /process\.env\.CRON_SECRET/);
  assert.match(route, /process\.env\.RESEND_API_KEY/);
  assert.match(route, /process\.env\.EMAIL_TEST_RECIPIENT/);
  const combined = files.map(read).join('\n');
  assert.deepEqual(Array.from(new Set(combined.match(/[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/g) ?? [])), ['vuelos@avisos.destinauta.com']);
  assert.doesNotMatch(combined, /re_[A-Za-z0-9]{8,}|sb_secret|eyJ[A-Za-z0-9]/);
  assert.doesNotMatch(combined, /NEXT_PUBLIC_(RESEND|EMAIL|SUPABASE_SECRET|SUPABASE_SERVICE)/);
  assert.doesNotMatch(combined, /email_preferences|auth\.admin|listUsers|getUser\(/, 'no lee ni usuarios ni sus preferencias');
  assert.doesNotMatch(combined, /\.(upsert|insert|update|delete)\(/, 'no escribe en la base de datos');
  const exported = Array.from(route.matchAll(/^export (?:async )?(?:function|const) (\w+)/gm), (match) => match[1]).sort();
  assert.deepEqual(exported, ['GET', 'dynamic', 'maxDuration', 'runtime'], 'Next.js solo admite estas exportaciones en una ruta');
  assert.equal(route.match(/\.GET|export async function GET/g)?.length, 1, 'solo GET: no hay POST con el que enviar desde fuera');
});

test('envío real bloqueado: el cuestionario sigue sin enviar y esta ruta no toca EMAIL_SERVICE_LIVE ni la portada', () => {
  assert.match(read('lib/email-preferences/options.ts'), /export const EMAIL_SERVICE_LIVE = false;/);
  assert.doesNotMatch(read('app/api/email/test/route.ts') + read('lib/email/render.ts'), /EMAIL_SERVICE_LIVE/);
  assert.ok(!/\/api\/email/.test(read('app/page.tsx')), 'la portada no llama a la ruta de envío');
  assert.equal(config.EMAIL_FROM, 'Destinauta <vuelos@avisos.destinauta.com>');
});
