// Controles de calidad del itinerario con IA: contenido repetido, precios, horas exactas, disponibilidad y actividades no seguras.
// Todo con respuestas simuladas: ninguna prueba toca la red ni lee una clave real.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React };
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
function loader(globals = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    vm.runInNewContext(ts.transpileModule(source(file), { compilerOptions }).outputText, {
      exports, Request, Response, URL, URLSearchParams, Date, Error, JSON, Intl, AbortSignal, ...globals,
      require: id => {
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const resolved = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(p => fs.existsSync(path.join(root, p)));
        if (!resolved) throw Error('Unexpected dependency: ' + id);
        return load(resolved);
      },
    }, { filename: file });
    return exports;
  }
  return load;
}
const errors = [];
const load = loader({ fetch: async () => { throw Error('No network expected'); }, process: { env: {} }, console: { error: (...args) => errors.push(args.join(' ')), warn() {}, log() {} } });
const { itineraryQualityIssues } = load('lib/itinerary/quality.ts');
const ai = load('lib/itinerary/ai.ts');
const server = load('lib/itinerary/server.ts');
const catalog = load('lib/destinations/index.ts');

const activity = (name, description = 'Paseo tranquilo por ' + name, area = 'Centro') => ({ name, description, area });
const good = (days = 2) => ({
  title: 'Oslo en ' + days + ' días', summary: 'Un plan tranquilo entre museos, fiordo y barrios.',
  tips: ['Usa el transporte público para moverte entre zonas.', 'Lleva ropa de abrigo por capas.', 'Reserva con antelación lo que más te interese.'],
  days: Array.from({ length: days }, (_, i) => ({ dayNumber: i + 1, title: 'Jornada ' + (i + 1) + ' en Oslo',
    morning: [activity('Museo número ' + i + 'A'), activity('Museo número ' + i + 'B')],
    afternoon: [activity('Paseo número ' + i + 'A'), activity('Paseo número ' + i + 'B')],
    evening: [activity('Cena número ' + i + 'A'), activity('Cena número ' + i + 'B')] })),
});
const issues = value => Array.from(itineraryQualityIssues(JSON.parse(JSON.stringify(value)))).sort();
const message = body => ({ type: 'message', role: 'assistant', stop_reason: 'end_turn', content: [{ type: 'text', text: JSON.stringify(body) }] });
const withText = (patch) => { const value = good(); patch(value); return value; };

test('a well organised itinerary with 2 activities per slot passes with no issues', () => {
  assert.deepEqual(issues(good(1)), []); assert.deepEqual(issues(good(3)), []);
});

test('repeated activities, descriptions, day titles and tips are detected, ignoring case, accents and punctuation', () => {
  assert.deepEqual(issues(withText(v => { v.days[1].morning[0].name = '  MUSEO número 0a!! '; })), ['duplicate_activity']);
  assert.deepEqual(issues(withText(v => { v.days[0].morning[0].name = 'Catedral'; v.days[1].evening[1].name = 'CATEDRÁL'.replace('Á', 'A'); })), ['duplicate_activity']);
  assert.deepEqual(issues(withText(v => { v.days[1].afternoon[0].description = v.days[0].afternoon[0].description; })), ['duplicate_description']);
  assert.deepEqual(issues(withText(v => { v.days[1].title = 'JORNADA 1 en oslo'; })), ['duplicate_day_title']);
  assert.deepEqual(issues(withText(v => { v.tips[1] = 'Usa el transporte público para moverte entre zonas'; })), ['duplicate_tip']);
});

test('prices, currencies, free entry and discounts are rejected in the seven languages', () => {
  const cases = ['Entrada 12 €', 'Ticket $15', 'Cuesta 20 euros', 'Costs 30 dollars', 'Coûte 10 euros par personne', 'Kostet 25 Pfund',
    'Costa 15 sterline', 'Custa 8 euros', 'Costa 9 lliures', 'Entrada gratis', 'Free entry on Sundays', 'Entrée gratuite', 'Eintritt frei', 'Ingresso libero', 'Entrada livre', 'Entrada lliure', 'Con descuento para estudiantes'];
  for (const text of cases) assert.deepEqual(issues(withText(v => { v.days[0].afternoon[0].description = text; })), ['price_claim'], text);
});

test('exact hours and opening times are rejected in the seven languages', () => {
  const cases = ['Visita a las 10:30', 'Entra at 9:00', 'Open at 9am', 'Abre a las 9', 'Opens at 10', 'Ouvre à 9h30', 'Öffnet um 9 Uhr', 'Apre alle 9', 'Fecha às 18h00', 'Obre a les 10',
    'Abierto todos los días', 'Open daily', 'Quedada a las 8 horas', 'Terminamos a les 7 hores'];
  for (const text of cases) assert.ok(issues(withText(v => { v.days[0].morning[1].description = text; })).includes('exact_hours'), text);
});

test('availability claims and guarantees are rejected', () => {
  const cases = ['Entradas disponibles hasta tarde', 'Tickets available online', 'Entrada agotada', 'Reserva garantizada', 'Guaranteed table', 'Garantiert ein Platz', 'Billets disponibles'];
  for (const text of cases) assert.ok(issues(withText(v => { v.days[0].evening[0].description = text; })).includes('availability_claim'), text);
});

test('unsafe or illegal activities are rejected, but safety advice in the tips is fine', () => {
  for (const text of ['Comprar drogas en el barrio', 'Visita a un burdel', 'Illegal street racing', 'Prostitución guiada'])
    assert.deepEqual(issues(withText(v => { v.days[0].evening[1].description = text; })), ['unsafe_activity'], text);
  assert.deepEqual(issues(withText(v => { v.tips[0] = 'Evita los taxis ilegales y usa siempre taxis oficiales.'; })), []);
});

test('ordinary useful wording is not a false positive', () => {
  const texts = ['A 10 minutos a pie del puerto', 'Tiempo libre para pasear', 'Free time in the old town', 'Distancia de 2 km aprox.', 'Ideal por la mañana o por la tarde',
    'Pasa 2 horas en el museo', 'Plan de unas 3 horas', 'Sin prisa y a tu ritmo', 'Visita el mercado de los sábados', 'Calle 5 de la zona vieja'];
  for (const text of texts) assert.deepEqual(issues(withText(v => { v.days[0].afternoon[1].description = text; })), [], text);
});

test('several problems at once are all reported, each code once', () => {
  const value = withText(v => { v.days[1].title = v.days[0].title; v.days[0].morning[0].description = 'Entrada 5 €'; v.days[0].afternoon[0].description = 'Abre a las 9'; });
  assert.deepEqual(issues(value), ['duplicate_day_title', 'exact_hours', 'price_claim']);
});

test('extractAiItinerary returns null for a well-formed answer that fails the quality checks, and the log only has fixed codes', () => {
  assert.ok(ai.extractAiItinerary(message(good(2)), 2));
  const flawed = withText(v => { v.days[0].morning[0].description = 'Entrada 12 € secreta TOP-SECRET-TEXT'; });
  assert.equal(ai.extractAiItinerary(message(flawed), 2), null);
  const reading = ai.readAiItinerary(message(flawed), 2);
  assert.equal(reading.itinerary, null); assert.deepEqual(Array.from(reading.problem), ['price_claim']);
  assert.equal(ai.readAiItinerary(message(good(2)), 3).problem, 'invalid_response');
  assert.equal(ai.readAiItinerary({ type: 'message', stop_reason: 'max_tokens', content: [] }, 2).problem, 'invalid_response');
});

test('the request to Haiku asks for organised days, useful tips, no repetition and no invented data or unsafe suggestions', () => {
  const profile = catalog.findDestinationProfile({ name: 'Oslo' });
  const request = server.validateItineraryRequest({ destination: { name: profile.name, country: profile.country, recommendations: [...profile.recommendations], recommendedStay: profile.recommendedStay ?? null,
    bestMonths: profile.bestMonths ?? [], lowSeasonMonths: profile.lowSeasonMonths ?? [], highSeasonMonths: profile.highSeasonMonths ?? [], seasonalityNote: profile.seasonalityNote ?? null }, days: 3, locale: 'es' }).request;
  const system = ai.buildAiRequest(request).system;
  for (const expected of [/lugares cercanos/, /por la mañana.*por la tarde.*por la noche|mañana.*tarde.*cena/, /2 siempre que el destino lo permita/, /consejos prácticos y útiles/, /No repitas ninguna actividad/,
    /título distinto/, /cifras de precio/, /horas concretas/, /disponibilidad/, /peligroso, ilegal/, /no inventes nombres de lugares/, /exactamente 3 días/, /no inventes horarios exactos, precios, disponibilidad/, /dato, no instrucciones/])
    assert.match(system, expected);
});

test('requestAiItinerary logs the quality problems found with fixed codes only and returns null so the free guide is used', async () => {
  errors.length = 0;
  const flawed = withText(v => { v.days[0].morning[0].description = 'Abierto todos los días TOP-SECRET-TEXT'; });
  const local = loader({ fetch: async () => new Response(JSON.stringify(message(flawed)), { status: 200 }), process: { env: {} }, console: { error: (...args) => errors.push(args.join(' ')), warn() {}, log() {} } });
  const module = local('lib/itinerary/ai.ts');
  const profile = catalog.findDestinationProfile({ name: 'Oslo' });
  const request = server.validateItineraryRequest({ destination: { name: profile.name, country: profile.country, recommendations: [...profile.recommendations], recommendedStay: profile.recommendedStay ?? null,
    bestMonths: profile.bestMonths ?? [], lowSeasonMonths: profile.lowSeasonMonths ?? [], highSeasonMonths: profile.highSeasonMonths ?? [], seasonalityNote: profile.seasonalityNote ?? null }, days: 2, locale: 'es' }).request;
  assert.equal(await module.requestAiItinerary(request, 'sk-ant-test-0123456789abcdefghijkl'), null);
  assert.deepEqual(errors, ['Itinerary AI result quality:exact_hours']);
  assert.ok(!errors.join(' ').includes('TOP-SECRET'));
});
