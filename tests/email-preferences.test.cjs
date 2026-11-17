// Fase 0 y 1 del correo de vuelos a buen precio: cuestionario y permiso en «Mi cuenta» (solo guardan datos; no se envía ningún correo)
// y páginas legales en borrador. Comprueba las listas de valores frente a la migración de Supabase, los textos en los siete idiomas,
// la pantalla, el guardado y las páginas de privacidad y aviso legal.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n');

// Cargador mínimo de módulos TypeScript/TSX en el mismo contexto (para que assert compare bien arrays y objetos).
// next/link no está en las herramientas de prueba: se sustituye por un <a href> con los mismos atributos.
const LinkMock = { __esModule: true, default: ({ href, children, ...rest }) => React.createElement('a', { href, ...rest }, children) };
function makeLoader(extra = {}) {
  const overrides = { 'next/link': LinkMock, ...extra };
  const cache = new Map();
  function resolve(from, id) {
    const base = id.startsWith('@/') ? path.join(root, id.slice(2)) : path.resolve(path.dirname(from), id);
    for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    }
    throw new Error(`No se encuentra ${id} desde ${from}`);
  }
  function load(file) {
    const full = path.isAbsolute(file) ? file : path.join(root, file);
    if (cache.has(full)) return cache.get(full).exports;
    const output = ts.transpileModule(fs.readFileSync(full, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const module = { exports: {} };
    cache.set(full, module);
    const localRequire = id => {
      if (id in overrides) return overrides[id];
      if (id.startsWith('.') || id.startsWith('@/')) return load(resolve(full, id));
      return require(id);
    };
    new Function('exports', 'require', 'module', output)(module.exports, localRequire, module);
    return module.exports;
  }
  return load;
}

const load = makeLoader();
const translations = load('lib/i18n/translations.ts');
const options = load('lib/email-preferences/options.ts');
const texts = load('lib/email-preferences/texts.ts');
const LOCALES = Array.from(translations.locales, l => l.code);
const migration = read('supabase/migrations/20261117000000_create_email_preferences.sql');
const sqlTest = read('supabase/tests/email_preferences_rls.sql');

const quoted = list => Array.from(list.matchAll(/'([^']+)'/g), m => m[1]);
const numbers = list => list.split(',').map(n => Number(n.trim()));
const sqlList = pattern => { const match = migration.match(pattern); assert.ok(match, `no se encuentra ${pattern}`); return match[1]; };

// ---------------------------------------------------------------- Listas de valores = restricciones de la base de datos
test('the allowed values in the app are exactly the ones the database accepts', () => {
  assert.deepEqual(quoted(sqlList(/airports <@ array\[([^\]]+)\]/)), options.AIRPORT_CODES);
  assert.deepEqual(numbers(sqlList(/months <@ array\[([^\]]+)\]/)), options.MONTH_NUMBERS);
  assert.deepEqual(quoted(sqlList(/trip_types <@ array\[([^\]]+)\]/)), options.TRIP_TYPES);
  assert.deepEqual(quoted(sqlList(/trip_length in \(([^)]+)\)/)), options.TRIP_LENGTHS);
  assert.deepEqual(quoted(sqlList(/reach in \(([^)]+)\)/)), options.REACHES);
  assert.deepEqual(quoted(sqlList(/flight_budget in \(([^)]+)\)/)), options.FLIGHT_BUDGETS);
  assert.deepEqual(quoted(sqlList(/frequency in \(([^)]+)\)/)), options.FREQUENCIES);
  assert.deepEqual(quoted(sqlList(/locale in \(([^)]+)\)/)), LOCALES);
  assert.equal(Number(sqlList(/cardinality\(airports\) <= (\d+)/)), options.MAX_AIRPORTS);
  assert.equal(Number(sqlList(/cardinality\(months\) <= (\d+)/)), options.MAX_MONTHS);
  assert.equal(Number(sqlList(/cardinality\(trip_types\) <= (\d+)/)), options.MAX_TRIP_TYPES);
});

test('the airports are the ten of «Viajes por mes» and the answers are the seven approved questions', () => {
  assert.deepEqual(options.AIRPORT_CODES, ['MAD', 'BCN', 'VLC', 'SVQ', 'AGP', 'BIO', 'PMI', 'ALC', 'TCI', 'LPA']);
  assert.deepEqual(Object.keys(options.EMPTY_ANSWERS).sort(), ['airports', 'consent', 'flightBudget', 'frequency', 'months', 'reach', 'tripLength', 'tripTypes']);
  assert.equal(options.EMPTY_ANSWERS.consent, false, 'la casilla de permiso viene sin marcar');
  assert.equal(options.EMAIL_SERVICE_LIVE, false, 'mientras no se envíen correos, la pantalla y la política lo dicen');
  // Solo estas columnas: nada de salud, religión, ingresos, nacionalidad ni edad exacta.
  const table = migration.slice(migration.indexOf('create table public.email_preferences ('), migration.indexOf('  constraint email_preferences_airports_valid'));
  const columns = Array.from(table.matchAll(/^  (\w+) (?:uuid|text|smallint|boolean|timestamptz)/gm), m => m[1]);
  assert.deepEqual(columns, ['user_id', 'airports', 'months', 'trip_types', 'trip_length', 'reach', 'flight_budget', 'frequency', 'locale',
    'email_consent', 'consent_version', 'consent_given_at', 'consent_withdrawn_at', 'created_at', 'updated_at']);
});

test('the migration keeps consent dates under the control of the database and each person to their own row', () => {
  assert.match(migration, /alter table public\.email_preferences enable row level security/);
  assert.match(migration, /revoke all privileges on table public\.email_preferences\s+from public, anon, authenticated/);
  for (const operation of ['select', 'insert', 'update', 'delete']) assert.match(migration, new RegExp(`for ${operation}\\s+to authenticated`));
  assert.equal((migration.match(/\(select auth\.uid\(\)\) = user_id/g) || []).length, 5, 'cada política compara con la sesión (update, dos veces)');
  // El navegador no puede escribir las fechas del permiso: solo las columnas de respuesta están concedidas.
  const grants = migration.match(/grant (?:insert|update) \(([^)]+)\)/g).join(' ');
  assert.doesNotMatch(grants, /consent_given_at|consent_withdrawn_at|created_at|updated_at/);
  assert.match(migration, /on delete cascade/);
  assert.equal(sqlTest.match(/select plan\((\d+)\)/)[1], String(sqlTest.match(/^select (?:has_table|ok|is|isnt|lives_ok|throws_ok)\(/gm).length), 'plan(N) coincide con las comprobaciones');
});

// ---------------------------------------------------------------- Lógica de las respuestas
test('normalizeAnswers drops unknown values, repeats and anything over the limits', () => {
  const clean = options.normalizeAnswers({
    airports: ['MAD', 'MAD', 'XXX', 'BCN', 'VLC'], months: [9, 3, 13, 0, 3, 5, 7, 11], tripTypes: ['city', 'foo', 'beach', 'relax', 'adventure'],
    tripLength: 'week', reach: 'mars', flightBudget: 'up200', frequency: 'daily', consent: 'yes',
  });
  assert.deepEqual(clean, {
    airports: ['MAD', 'BCN'], months: [3, 5, 7, 9], tripTypes: ['city', 'beach', 'relax'],
    tripLength: 'week', reach: '', flightBudget: 'up200', frequency: '', consent: false,
  });
  assert.deepEqual(options.normalizeAnswers(null), options.EMPTY_ANSWERS);
  assert.deepEqual(options.normalizeAnswers({ airports: 'MAD', months: null }), options.EMPTY_ANSWERS);
});

test('toggleLimited adds, removes and stops at the limit without touching the original list', () => {
  const list = ['MAD'];
  assert.deepEqual(options.toggleLimited(list, 'BCN', 2), ['MAD', 'BCN']);
  assert.deepEqual(list, ['MAD']);
  assert.deepEqual(options.toggleLimited(['MAD', 'BCN'], 'VLC', 2), ['MAD', 'BCN']);
  assert.deepEqual(options.toggleLimited(['MAD', 'BCN'], 'MAD', 2), ['BCN']);
});

test('emails need at least one airport and the frequency', () => {
  assert.equal(options.hasRequiredForEmails(options.EMPTY_ANSWERS), false);
  assert.equal(options.hasRequiredForEmails({ airports: ['MAD'], frequency: '' }), false);
  assert.equal(options.hasRequiredForEmails({ airports: [], frequency: 'weekly' }), false);
  assert.equal(options.hasRequiredForEmails({ airports: ['MAD'], frequency: 'monthly' }), true);
});

test('month names and the consent date come out in the seven languages', () => {
  const names = new Map();
  for (const locale of LOCALES) {
    const all = options.MONTH_NUMBERS.map(month => options.monthName(locale, month));
    assert.equal(new Set(all).size, 12, `${locale}: doce meses distintos`);
    for (const name of all) assert.equal(name.charAt(0), name.charAt(0).toLocaleUpperCase(locale), `${locale}: ${name} empieza en mayúscula`);
    names.set(locale, all);
  }
  assert.equal(names.get('es')[0], 'Enero');
  assert.equal(names.get('en')[10], 'November');
  assert.equal(options.formatConsentDate('2026-11-17T10:00:00Z', 'es'), '17 de noviembre de 2026');
  assert.equal(options.formatConsentDate('no-es-fecha', 'es'), '');
});

// ---------------------------------------------------------------- Textos en siete idiomas
test('every text exists in the seven languages, with the same variables and no empty gaps', () => {
  const keys = new Set();
  for (const row of texts.EMAIL_TEXT_ROWS) {
    assert.equal(row.length, 1 + LOCALES.length, `${row[0]}: una columna por idioma`);
    assert.ok(!keys.has(row[0]), `${row[0]} repetida`);
    keys.add(row[0]);
    const variables = value => (value.match(/\{\w+\}/g) || []).sort().join();
    for (let i = 1; i < row.length; i++) {
      assert.ok(row[i].trim(), `${row[0]} vacío en ${LOCALES[i - 1]}`);
      assert.equal(variables(row[i]), variables(row[1]), `${row[0]}: variables distintas en ${LOCALES[i - 1]}`);
    }
  }
  assert.equal(texts.emailText('en', 'limit.hint', { max: 2 }), 'Choose up to 2.');
  assert.equal(texts.emailText('ca', 'consent.recorded', { date: '17 de novembre de 2026' }), 'Permís registrat el 17 de novembre de 2026.');
  assert.equal(texts.emailText('xx', 'save'), 'Guardar', 'sin idioma conocido se usa el español');
});

test('the screen only uses texts that exist', () => {
  const keys = new Set(texts.EMAIL_TEXT_ROWS.map(row => row[0]));
  for (const file of ['app/components/EmailPreferencesForm.tsx', 'app/components/EmailPreferences.tsx']) {
    const source = read(file);
    const used = [...source.matchAll(/emailText\(language, "([\w.]+)"/g), ...source.matchAll(/(?:legendKey|key)[=:] ?"([\w.]+)"/g)].map(m => m[1]);
    assert.ok(used.length > 0, file);
    for (const key of used) assert.ok(keys.has(key), `${file} usa «${key}», que no existe`);
  }
  const form = read('app/components/EmailPreferencesForm.tsx');
  // Cada pregunta y cada opción del cuestionario tiene su texto.
  for (const key of ['airports.legend', 'months.legend', 'tripTypes.legend', 'length.legend', 'reach.legend', 'budget.legend', 'frequency.legend', 'consent.label', 'consent.privacy']) assert.ok(form.includes(`"${key}"`), key);
  for (const value of [...options.TRIP_TYPES, ...options.TRIP_LENGTHS, ...options.FREQUENCIES]) assert.match(form, new RegExp(`value: "${value}"`), value);
});

// ---------------------------------------------------------------- Guardado (Supabase)
function supabaseSetup({ session = { user: { id: 'user-a' } }, row = null, error = null } = {}) {
  const calls = [];
  const query = {
    select(columns) { calls.push(['select', columns]); return this; },
    eq(column, value) { calls.push(['eq', column, value]); return this; },
    upsert(value, config) { calls.push(['upsert', value, config]); return this; },
    delete() { calls.push(['delete']); return this; },
    single() { return Promise.resolve({ data: row, error }); },
    maybeSingle() { return Promise.resolve({ data: row, error }); },
    then(resolve) { return Promise.resolve({ error }).then(resolve); },
  };
  const client = {
    auth: { getSession: async () => ({ data: { session }, error: null }) },
    from(table) { calls.push(['from', table]); return query; },
  };
  const loadWith = makeLoader({ './client': { getSupabaseClient: () => client } });
  return { saved: loadWith('lib/supabase/email-preferences.ts'), calls };
}

test('the payload only carries writable fields, trusts the session and drops the permission when emails are not possible', () => {
  const { saved } = supabaseSetup();
  const full = { airports: ['MAD', 'BCN'], months: [9, 3], tripTypes: ['city'], tripLength: 'weekend', reach: 'europe', flightBudget: 'up200', frequency: 'weekly', consent: true };
  const payload = saved.answersToPayload('user-a', full, 'fr');
  assert.deepEqual(payload, {
    user_id: 'user-a', airports: ['MAD', 'BCN'], months: [3, 9], trip_types: ['city'], trip_length: 'weekend', reach: 'europe',
    flight_budget: 'up200', frequency: 'weekly', locale: 'fr', email_consent: true, consent_version: options.EMAIL_CONSENT_VERSION,
  });
  assert.equal(Object.keys(payload).some(key => /consent_(given|withdrawn)_at|created_at|updated_at/.test(key)), false, 'las fechas las pone la base de datos');
  const incomplete = saved.answersToPayload('user-a', { ...full, airports: [], consent: true }, 'es');
  assert.equal(incomplete.email_consent, false);
  assert.equal(incomplete.consent_version, null);
  const empty = saved.answersToPayload('user-a', options.EMPTY_ANSWERS, 'es');
  assert.deepEqual([empty.trip_length, empty.reach, empty.flight_budget, empty.frequency, empty.email_consent, empty.consent_version], [null, null, null, null, false, null]);
  assert.deepEqual(saved.answersToPayload('user-a', { ...full, airports: ['XXX'], months: [99] }, 'es').airports, []);
});

test('rowToAnswers turns a stored row into screen answers and a missing row into the empty form', () => {
  const { saved } = supabaseSetup();
  assert.deepEqual(saved.rowToAnswers(null), options.EMPTY_ANSWERS);
  assert.deepEqual(saved.rowToAnswers({
    user_id: 'u', airports: ['LPA'], months: [12, 1], trip_types: ['relax'], trip_length: 'short', reach: 'any', flight_budget: null,
    frequency: 'monthly', locale: 'de', email_consent: true, consent_version: 'v1', consent_given_at: '2026-11-17T10:00:00Z', consent_withdrawn_at: null, updated_at: '2026-11-17T10:00:00Z',
  }), { airports: ['LPA'], months: [1, 12], tripTypes: ['relax'], tripLength: 'short', reach: 'any', flightBudget: '', frequency: 'monthly', consent: true });
});

test('get, save and delete use the current session and the table email_preferences', async () => {
  const row = { user_id: 'user-a', airports: ['MAD'], months: [], trip_types: [], trip_length: null, reach: null, flight_budget: null, frequency: 'weekly', locale: 'es', email_consent: false, consent_version: null, consent_given_at: null, consent_withdrawn_at: null, updated_at: 'x' };
  const { saved, calls } = supabaseSetup({ row });
  assert.deepEqual(await saved.getEmailPreferences(), row);
  assert.deepEqual(calls.filter(c => c[0] === 'eq'), [['eq', 'user_id', 'user-a']]);
  calls.length = 0;
  assert.deepEqual(await saved.saveEmailPreferences({ ...options.EMPTY_ANSWERS, airports: ['MAD'], frequency: 'weekly' }, 'es'), row);
  const upsert = calls.find(c => c[0] === 'upsert');
  assert.equal(upsert[1].user_id, 'user-a');
  assert.deepEqual(upsert[2], { onConflict: 'user_id' });
  assert.ok(calls.some(c => c[0] === 'from' && c[1] === 'email_preferences'));
  calls.length = 0;
  await saved.deleteEmailPreferences();
  assert.deepEqual(calls.filter(c => c[0] === 'delete' || c[0] === 'eq'), [['delete'], ['eq', 'user_id', 'user-a']]);
});

test('without a session nothing is read or written, and database errors are not hidden', async () => {
  const none = supabaseSetup({ session: null });
  await assert.rejects(none.saved.getEmailPreferences(), /Inicia sesión/);
  await assert.rejects(none.saved.saveEmailPreferences(options.EMPTY_ANSWERS, 'es'), /Inicia sesión/);
  await assert.rejects(none.saved.deleteEmailPreferences(), /Inicia sesión/);
  assert.equal(none.calls.length, 0);
  const failing = supabaseSetup({ error: new Error('rls') });
  await assert.rejects(failing.saved.getEmailPreferences(), /rls/);
  await assert.rejects(failing.saved.saveEmailPreferences(options.EMPTY_ANSWERS, 'es'), /rls/);
  await assert.rejects(failing.saved.deleteEmailPreferences(), /rls/);
});

// ---------------------------------------------------------------- Pantalla
function renderForm(language, props = {}) {
  const { default: Form } = makeLoader()('app/components/EmailPreferencesForm.tsx');
  return renderToStaticMarkup(React.createElement(Form, {
    language, answers: options.EMPTY_ANSWERS, onChange() {}, onSave() {}, onDelete() {}, busy: '', notice: null,
    hasSavedRow: false, savedConsent: false, consentGivenAt: null, consentWithdrawnAt: null, ...props,
  }));
}
const inputs = html => Array.from(html.matchAll(/<input\b[^>]*>/g), m => m[0]);
const checkboxes = html => inputs(html).filter(tag => tag.includes('type="checkbox"'));

test('the form asks the seven questions with every option, all optional, and the permission box apart and unticked', () => {
  for (const locale of LOCALES) {
    const html = renderForm(locale);
    const boxes = checkboxes(html);
    assert.equal(boxes.length, 10 + 12 + 6 + 1, `${locale}: 10 aeropuertos + 12 meses + 6 tipos + 1 permiso`);
    assert.equal(boxes.filter(tag => tag.includes('checked=""')).length, 0, `${locale}: nada marcado de salida`);
    assert.equal((html.match(/<select\b/g) || []).length, 4, `${locale}: duración, alcance, precio y frecuencia`);
    assert.equal((html.match(/<fieldset\b/g) || []).length, 3);
    for (const key of ['airports.legend', 'months.legend', 'tripTypes.legend', 'length.legend', 'reach.legend', 'budget.legend', 'frequency.legend', 'consent.label', 'save']) {
      assert.ok(html.includes(texts.emailText(locale, key).replace(/’/g, '&#x27;').replace(/'/g, '&#x27;')) || html.includes(texts.emailText(locale, key)), `${locale}: ${key}`);
    }
    assert.ok(html.includes('href="/privacidad"') && html.includes('target="_blank"') && html.includes('rel="noopener noreferrer"'), `${locale}: enlace a la política`);
    assert.ok(!/required/.test(html), 'ninguna pregunta es obligatoria');
    // Mientras no haya aeropuerto y frecuencia, el permiso no se puede activar.
    assert.ok(boxes[boxes.length - 1].includes('disabled=""'), `${locale}: permiso desactivado sin aeropuerto y frecuencia`);
    assert.ok(html.includes(texts.emailText(locale, 'consent.needs').replace(/’/g, '&#x27;')) || html.includes(texts.emailText(locale, 'consent.needs')), `${locale}: explica qué falta`);
    // Aviso de que todavía no se envía nada.
    assert.ok(html.includes(texts.emailText(locale, 'notLive').replace(/’/g, '&#x27;')) || html.includes(texts.emailText(locale, 'notLive')), `${locale}: aviso de servicio en preparación`);
  }
});

test('the limits disable the remaining options and the permission box unlocks with airport and frequency', () => {
  const html = renderForm('es', { answers: { ...options.EMPTY_ANSWERS, airports: ['MAD', 'BCN'], months: [1, 2, 3, 4], tripTypes: ['beach', 'city', 'relax'], frequency: 'weekly' } });
  const boxes = checkboxes(html);
  const disabledCount = boxes.filter(tag => tag.includes('disabled=""')).length;
  assert.equal(disabledCount, 8 + 8 + 3, '8 aeropuertos, 8 meses y 3 tipos sin marcar quedan bloqueados');
  assert.equal(boxes.filter(tag => tag.includes('checked=""')).length, 2 + 4 + 3);
  assert.ok(!boxes[boxes.length - 1].includes('disabled=""'), 'el permiso se puede marcar');
  assert.ok(!html.includes(texts.emailText('es', 'consent.needs')));
  assert.match(html, /<option value="weekly" selected="">Cada semana<\/option>/);
});

test('the form shows the saved permission date, the delete button only when there are saved answers and the save/delete states', () => {
  const given = renderForm('es', { answers: { ...options.EMPTY_ANSWERS, airports: ['MAD'], frequency: 'monthly', consent: true }, hasSavedRow: true, savedConsent: true, consentGivenAt: '2026-11-17T10:00:00Z' });
  assert.ok(given.includes('Permiso registrado el 17 de noviembre de 2026.'));
  assert.ok(given.includes('Borrar mis respuestas'));
  const withdrawn = renderForm('en', { hasSavedRow: true, savedConsent: false, consentGivenAt: '2026-11-17T10:00:00Z', consentWithdrawnAt: '2026-11-20T10:00:00Z' });
  assert.ok(withdrawn.includes('Permission withdrawn on November 20, 2026.'));
  assert.ok(!withdrawn.includes('Permission recorded'));
  assert.ok(!renderForm('es').includes('Borrar mis respuestas'), 'sin respuestas guardadas no hay botón de borrar');
  assert.ok(renderForm('es', { busy: 'saving' }).includes('Guardando…'));
  assert.ok(renderForm('es', { busy: 'deleting', hasSavedRow: true }).includes('Borrando…'));
  const saving = renderForm('es', { busy: 'saving', hasSavedRow: true });
  assert.equal((saving.match(/<button\b[^>]*disabled=""/g) || []).length, 2, 'mientras guarda no se puede pulsar dos veces ni borrar');
  assert.match(renderForm('es', { notice: 'saved' }), /role="status"[^>]*>Guardado\.</);
  assert.match(renderForm('es', { notice: 'saveError' }), /role="alert"[^>]*>No se ha podido guardar/);
  assert.match(renderForm('fr', { notice: 'deleteError' }), /role="alert"[^>]*>Impossible de les supprimer/);
  // No se puede guardar con el permiso marcado si falta aeropuerto o frecuencia.
  const blocked = renderForm('es', { answers: { ...options.EMPTY_ANSWERS, consent: true } });
  assert.match(blocked, /<button type="submit" disabled=""/);
});

test('the container is a collapsed section that loads on first open, keeps the form light and sends nothing', () => {
  const source = read('app/components/EmailPreferences.tsx');
  assert.match(source, /<details\b/);
  assert.match(source, /onToggle=\{\(event\) => \{ if \(event\.currentTarget\.open\) setRequested\(true\); \}\}/, 'la consulta se hace al abrir por primera vez');
  assert.match(source, /if \(!requested\) return;/);
  assert.match(source, /busyRef\.current/, 'no se puede guardar dos veces a la vez');
  assert.doesNotMatch(source, /fetch\(|\/api\/|resend|sendEmail/i, 'solo guarda en Supabase; no envía nada');
  const { default: Container } = makeLoader({
    './LanguageProvider': { useLanguage: () => ({ language: 'es' }) },
    '@/lib/supabase/email-preferences': { getEmailPreferences: async () => null, saveEmailPreferences: async () => null, deleteEmailPreferences: async () => {}, rowToAnswers: () => options.EMPTY_ANSWERS },
  })('app/components/EmailPreferences.tsx');
  const html = renderToStaticMarkup(React.createElement(Container));
  assert.match(html, /<details\b[^>]*>/);
  assert.ok(!/<details\b[^>]* open/.test(html), 'cerrado por defecto');
  assert.ok(html.includes('Vuelos a buen precio por correo') && html.includes('Opcional'));
  assert.equal(checkboxes(html).length, 0, 'hasta que se abre no se muestra ni se carga nada');
});

test('«Mi cuenta» shows the questionnaire once, between the e-mail and «Cerrar sesión», and the list windows do not', () => {
  const source = read('app/components/HeaderAuth.tsx');
  assert.equal((source.match(/<EmailPreferences\b/g) || []).length, 1);
  assert.match(source, /import EmailPreferences from "\.\/EmailPreferences";/);
  const account = source.slice(source.indexOf('{t("account.title")}</h2>'));
  assert.ok(account.indexOf('session.user.email') < account.indexOf('<EmailPreferences key={session.user.id} />'));
  assert.ok(account.indexOf('<EmailPreferences key={session.user.id} />') < account.indexOf('auth.signout'));
  const lists = source.slice(source.indexOf('{onlySection ? ('), source.indexOf(') : ('));
  assert.ok(!lists.includes('EmailPreferences'), 'las ventanas de «Mis viajes» e «Itinerarios» no cambian');
});

// ---------------------------------------------------------------- Páginas legales (borrador)
function renderLegal(file, ownerModule) {
  const overrides = ownerModule ? { '@/lib/legal/owner': ownerModule } : {};
  const loadWith = makeLoader(overrides);
  const page = loadWith(file);
  return { html: renderToStaticMarkup(React.createElement(page.default)), metadata: page.metadata };
}

test('the privacy policy and the legal notice are drafts: noindex, warning banner and highlighted gaps for the owner data', () => {
  for (const [file, title] of [['app/privacidad/page.tsx', 'Política de privacidad'], ['app/aviso-legal/page.tsx', 'Aviso legal']]) {
    const { html, metadata } = renderLegal(file);
    assert.deepEqual(metadata.robots, { index: false, follow: false }, `${title}: sin indexar mientras sea borrador`);
    assert.ok(metadata.title.startsWith(title));
    assert.match(html, new RegExp(`<h1[^>]*>${title}</h1>`));
    assert.match(html, /Borrador sin validar/);
    for (const label of ['nombre y apellidos o razón social', 'NIF o CIF', 'domicilio completo', 'correo de contacto', 'fecha de la última revisión']) {
      assert.ok(html.includes(`[PENDIENTE: ${label}]`), `${title}: hueco «${label}»`);
    }
    assert.match(html, /<a href="\/privacidad"/);
    assert.match(html, /<a href="\/aviso-legal"/);
    assert.match(html, /<a href="\/"/, 'enlace de vuelta a la web');
  }
});

test('the privacy policy covers what it must about the questionnaire and the permission', () => {
  const { html } = renderLegal('app/privacidad/page.tsx');
  for (const phrase of [
    'art. 6.1.a', 'consentimiento', 'retirar', 'Todavía no enviamos ningún correo', 'Supabase', 'Vercel', 'Travelpayouts', 'Stay22',
    'No te pedimos datos de salud, religión, ingresos, nacionalidad ni edad exacta', 'Borrar mis respuestas', 'Agencia Española de Protección de Datos',
    'derechos', 'No vendemos tus datos',
  ]) assert.ok(html.includes(phrase), phrase);
  assert.ok(html.includes('[REVISAR: confirmar la lista final de proveedores'), 'la lista de proveedores queda por confirmar');
  assert.ok(html.includes('[REVISAR: indicar las garantías de las transferencias internacionales'));
  // Los datos que se guardan en el cuestionario salen en la política.
  for (const phrase of ['aeropuerto', 'meses', 'tipo de viaje', 'duración habitual', 'cuánto sueles pagar', 'cada cuánto quieres recibir']) assert.ok(html.includes(phrase), phrase);
});

test('the legal notice explains affiliate links and that prices are orientative', () => {
  const { html } = renderLegal('app/aviso-legal/page.tsx');
  for (const phrase of ['artículo 10', 'LSSI-CE', 'puede recibir una comisión', 'orientativos', 'No vende billetes']) assert.ok(html.includes(phrase), phrase);
  assert.ok(!html.includes('Registro Mercantil'), 'sin registro no se muestra esa línea');
});

test('once the owner data is filled and the draft flag is off, the gaps and the warning disappear and the pages can be indexed', () => {
  const owner = {
    LEGAL_IS_DRAFT: false, LEGAL_UPDATED: '17 de noviembre de 2026',
    OWNER_DATA: { name: 'Titular de Prueba', taxId: 'X0000000X', address: 'Calle Falsa 1, 28000 Madrid, España', email: 'contacto@example.test', registry: 'Registro Mercantil de Prueba' },
  };
  for (const file of ['app/privacidad/page.tsx', 'app/aviso-legal/page.tsx']) {
    const { html, metadata } = renderLegal(file, owner);
    assert.equal(metadata.robots, undefined);
    assert.ok(!html.includes('PENDIENTE') && !html.includes('REVISAR'), `${file}: sin huecos ni notas de revisión`);
    assert.ok(!html.includes('Borrador sin validar'));
    for (const value of ['Titular de Prueba', 'X0000000X', 'Calle Falsa 1', 'contacto@example.test', '17 de noviembre de 2026']) assert.ok(html.includes(value), `${file}: ${value}`);
    assert.ok(!/\[PENDIENTE: (nombre|NIF|domicilio|correo de contacto|fecha)/.test(html), 'los datos del titular ya no salen como hueco');
  }
  assert.ok(renderLegal('app/aviso-legal/page.tsx', owner).html.includes('Registro Mercantil de Prueba'));
  // Con los correos en marcha, la política deja de decir que todavía no se envían.
  const live = makeLoader({ '@/lib/legal/owner': owner, '@/lib/email-preferences/options': { ...options, EMAIL_SERVICE_LIVE: true } })('app/privacidad/page.tsx');
  assert.ok(!renderToStaticMarkup(React.createElement(live.default)).includes('Todavía no enviamos ningún correo'));
});

test('the legal drafts stay out of the sitemap and robots, and nothing else in the site changes', () => {
  assert.doesNotMatch(read('app/sitemap.ts'), /privacidad|aviso-legal/);
  assert.doesNotMatch(read('app/robots.ts'), /privacidad|aviso-legal/);
  assert.doesNotMatch(read('app/layout.tsx'), /privacidad|aviso-legal/, 'sin pie de página nuevo hasta que el propietario lo autorice');
  assert.doesNotMatch(read('app/page.tsx'), /privacidad|aviso-legal/, 'la portada y sus 16 tarjetas no cambian');
});
