// Descarga del itinerario (guía gratuita, itinerario con IA o el de Sofía) en PDF, creado en el navegador.
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
      exports, Request, Response, URL, URLSearchParams, Date, Error, JSON, Intl, Uint8Array, ...globals,
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
const shared = loader();
const pdf = shared('lib/pdf/text-pdf.ts');
const documents = shared('lib/itinerary/document.ts');
const basic = shared('lib/itinerary/basic.ts');
const translations = shared('lib/i18n/translations.ts');
const catalog = shared('lib/destinations/index.ts');
const plain = value => JSON.parse(JSON.stringify(value));
const locales = translations.locales.map(l => l.code);
const text = bytes => Buffer.from(bytes).toString('latin1');

// Reads the PDF back: pages, and every shown line with its position (hex strings are WinAnsi bytes).
function read(bytes) {
  const raw = text(bytes);
  const pages = [...raw.matchAll(/\d+ 0 obj\n<< \/Length \d+ >>\nstream\n([\s\S]*?)\nendstream/g)].map(match =>
    [...match[1].matchAll(/\/F(\d) (\d+) Tf ([\d.]+) ([\d.]+) Td <([0-9A-F]*)> Tj/gi)].map(m => ({
      bold: m[1] === '2', size: Number(m[2]), x: Number(m[3]), y: Number(m[4]),
      text: Buffer.from(m[5], 'hex').toString('latin1'),
    })));
  return { raw, pages };
}
const winAnsi = value => Buffer.from(value, 'latin1').toString('latin1');

test('the PDF is well formed: header, objects, cross-reference offsets and end marker', () => {
  const bytes = pdf.buildPdf({ title: 'Guía básica de Oslo', footer: 'destinauta.com', blocks: [{ kind: 'title', text: 'Guía básica de Oslo' }, { kind: 'paragraph', text: 'Hola' }] });
  const raw = text(bytes);
  assert.ok(raw.startsWith('%PDF-1.4\n')); assert.ok(raw.endsWith('%%EOF\n'));
  const start = Number(raw.match(/startxref\n(\d+)\n%%EOF/)[1]);
  assert.ok(raw.slice(start).startsWith('xref\n'));
  const entries = [...raw.slice(start).matchAll(/(\d{10}) 00000 n /g)].map(m => Number(m[1]));
  entries.forEach((offset, index) => assert.ok(raw.slice(offset).startsWith(`${index + 1} 0 obj`), `object ${index + 1}`));
  assert.match(raw, /\/Count 1 /); assert.match(raw, /\/BaseFont \/Helvetica /); assert.match(raw, /WinAnsiEncoding/);
  assert.ok(!/https?:/.test(raw), 'no links, scripts or external resources');
  for (const length of [...raw.matchAll(/\/Length (\d+) >>\nstream\n/g)].map(m => Number(m[1]))) assert.ok(length > 0);
});

test('accents and the characters of the seven languages are kept; unsupported letters fall back to the plain letter; emoji are removed', () => {
  const sample = pdf.toWinAnsiText('Guía básica: ñandú, çà, ü, ß, œ, «comillas», “dobles”, ’ — … ¿Qué? l·l');
  assert.equal(sample, 'Guía básica: ñandú, çà, ü, ß, œ, «comillas», “dobles”, ’ — … ¿Qué? l·l');
  assert.equal(pdf.toWinAnsiText('Kraków Wrocław Plzeň Győr Košice Đakovo Gdańsk'), 'Kraków Wroclaw Plzen Gyor Košice Dakovo Gdansk');
  assert.equal(pdf.toWinAnsiText('✨ Crear 🎙️ itinerario'), 'Crear itinerario');
  assert.equal(pdf.toWinAnsiText('a b\tc\nd'), 'a b c d');
  const bytes = pdf.buildPdf({ title: 'Kraków', footer: 'destinauta.com', blocks: [{ kind: 'paragraph', text: 'Ópera: niño, Köln, École, Kraków' }] });
  assert.ok(read(bytes).pages[0].some(line => line.text === winAnsi('Ópera: niño, Köln, École, Kraków')));
});

test('long itineraries paginate inside the margins and a heading is never left alone at the bottom of a page', () => {
  const sentence = 'Pasear sin prisa por el casco antiguo, parar a tomar algo y seguir hacia el mirador para ver la ciudad. ';
  const blocks = [{ kind: 'title', text: 'Un itinerario largo' }];
  for (let day = 1; day <= 7; day++) {
    blocks.push({ kind: 'heading', text: `Día ${day} — Título ${day}` }, { kind: 'subheading', text: 'Mañana' },
      { kind: 'bullet', lead: 'Actividad (Centro)', text: sentence.repeat(5) }, { kind: 'subheading', text: 'Tarde' }, { kind: 'bullet', text: sentence.repeat(5) });
  }
  const { pages, raw } = read(pdf.buildPdf({ title: 'x', footer: 'destinauta.com', blocks }));
  assert.ok(pages.length >= 3);
  assert.match(raw, new RegExp(`/Count ${pages.length} `));
  const body = page => page.filter(line => line.y !== 36);
  pages.forEach((page, index) => {
    assert.deepEqual(plain(page.filter(line => line.y === 36).map(line => line.text)), ['destinauta.com', `${index + 1}/${pages.length}`], 'footer and page number');
  });
  for (const page of pages) for (const line of body(page)) {
    assert.ok(line.y >= 72 && line.y <= 842 - 64 + 1, 'line inside the vertical margins: ' + line.y);
    assert.ok(line.x >= 56);
  }
  pages.forEach((page, index) => {
    const last = body(page)[body(page).length - 1];
    assert.ok(!/^D\xeda \d/.test(last.text) && !/^(Ma\xf1ana|Tarde)$/.test(last.text), `page ${index + 1} does not end with a heading`);
  });
  // The page text is read back as WinAnsi bytes: «í» is 0xED and the em dash is 0x97.
  for (let day = 1; day <= 7; day++) assert.equal(pages.flat().filter(line => line.text === `D\xeda ${day} \x97 T\xedtulo ${day}`).length, 1, `day ${day} appears once`);
});

test('the Oslo guide document keeps the destination page text, the notes and a footer on every page', () => {
  const oslo = catalog.findDestinationProfile({ name: 'Oslo' });
  const t = (key, vars) => translations.translate('es', key, vars);
  const guide = basic.buildBasicGuide(oslo, 7, 'es');
  const { pages } = read(pdf.buildPdf(documents.basicGuideDocument(guide, 7, t)));
  const lines = pages.flat().map(line => line.text);
  assert.ok(lines.includes(winAnsi('Guía básica de Oslo')));
  for (const recommendation of oslo.recommendations) assert.ok(lines.join(' ').includes(winAnsi(recommendation.slice(0, 20))), recommendation);
  assert.ok(lines.join(' ').includes(winAnsi('No incluye horarios, precios ni reservas')));
  assert.ok(lines.join(' ').includes('la gu\xeda llega a 4 d\xedas'));
  assert.ok(pages.every(page => page.length));
  assert.ok(pages.every(page => page.some(line => line.y === 36 && line.text === 'destinauta.com')), 'footer on every page');
});

test('the AI or voice itinerary document has every day, period, activity and tip of the screen', () => {
  const activity = (name, area) => ({ name, area, description: 'Descripción de ' + name });
  const itinerary = { title: 'Dos días en Londres', summary: 'Un resumen.', tips: ['Lleva paraguas', 'Compra la tarjeta de transporte'],
    days: [1, 2].map(dayNumber => ({ dayNumber, title: 'Día ' + dayNumber + ' de ejemplo', morning: [activity('Big Ben ' + dayNumber, 'Westminster')],
      afternoon: [activity('Museo ' + dayNumber, '')], evening: [activity('Cena ' + dayNumber, 'Soho')] })) };
  const t = (key, vars) => translations.translate('es', key, vars);
  const all = read(pdf.buildPdf(documents.itineraryDocument(itinerary, t))).pages.flat().map(line => line.text).join(' ');
  for (const expected of ['Dos días en Londres', 'Un resumen.', 'Big Ben 1 (Westminster)', 'Museo 2', 'Cena 2 (Soho)', 'Lleva paraguas', 'Compra la tarjeta de transporte', 'Mañana', 'Tarde', 'Noche', 'Consejos para tu viaje'])
    assert.ok(all.includes(winAnsi(expected)), expected);
  assert.ok(!all.includes('Museo 2 ()'), 'no empty area in brackets');
});

test('every language builds both documents without unresolved variables', () => {
  const oslo = catalog.findDestinationProfile({ name: 'Oslo' });
  const itinerary = { title: 'T', summary: 'S', tips: ['a', 'b'], days: [{ dayNumber: 1, title: 'D', morning: [{ name: 'n', area: 'a', description: 'd' }], afternoon: [{ name: 'n', area: 'a', description: 'd' }], evening: [{ name: 'n', area: 'a', description: 'd' }] }] };
  for (const locale of locales) {
    const t = (key, vars) => translations.translate(locale, key, vars);
    for (const doc of [documents.basicGuideDocument(basic.buildBasicGuide(oslo, 5, locale), 5, t), documents.itineraryDocument(itinerary, t)]) {
      const all = plain(doc).blocks.map(b => `${b.lead ?? ''} ${b.text}`).join(' ');
      assert.ok(!/[{}]/.test(all), locale + ': ' + all.slice(0, 80));
      assert.ok(read(pdf.buildPdf(doc)).pages.length >= 1);
    }
    assert.ok(translations.translate(locale, 'itinerary.download').includes('PDF'));
    assert.ok(translations.translate(locale, 'itinerary.downloadError').length > 20);
  }
});

test('file names are plain letters and digits, never empty and never an unsafe path', () => {
  assert.equal(documents.documentFileName('Nueva York'), 'destinauta-nueva-york.pdf');
  assert.equal(documents.documentFileName('Wrocław'), 'destinauta-wroclaw.pdf');
  assert.equal(documents.documentFileName('São Paulo / ../etc'), 'destinauta-sao-paulo-etc.pdf');
  assert.equal(documents.documentFileName('???'), 'destinauta-itinerario.pdf');
  assert.ok(/^destinauta-[a-z0-9-]{1,40}\.pdf$/.test(documents.documentFileName('x'.repeat(200))));
});

test('downloading creates an invisible link to the file in the browser and cleans up; any failure returns false', () => {
  const events = [];
  const link = { click: () => events.push('click'), remove: () => events.push('remove') };
  const globals = {
    Blob: class { constructor(parts, options) { events.push(['blob', options.type, parts[0].length]); } },
    URL: { createObjectURL: () => 'blob:file', revokeObjectURL: url => events.push(['revoke', url]) },
    document: { createElement: tag => { events.push(['create', tag]); return link; }, body: { appendChild: item => events.push(['append', item === link]) } },
    setTimeout: (run, ms) => { events.push(['timer', ms]); run(); },
  };
  const { downloadPdf } = loader(globals)('lib/itinerary/download.ts');
  assert.equal(downloadPdf(Uint8Array.from([37, 80, 68, 70]), 'destinauta-oslo.pdf'), true);
  assert.equal(link.href, 'blob:file'); assert.equal(link.download, 'destinauta-oslo.pdf');
  assert.deepEqual(plain(events.map(e => Array.isArray(e) ? e[0] : e)), ['blob', 'create', 'append', 'click', 'remove', 'timer', 'revoke']);
  const broken = loader({ ...globals, URL: { createObjectURL: () => { throw Error('blocked'); } } })('lib/itinerary/download.ts');
  assert.equal(broken.downloadPdf(Uint8Array.from([1]), 'x.pdf'), false);
});

test('no download code sends data anywhere', () => {
  for (const file of ['lib/pdf/text-pdf.ts', 'lib/itinerary/document.ts', 'lib/itinerary/download.ts']) {
    const code = source(file).replace(/\/\/.*$/gm, '');
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|process\.env|https?:\/\//.test(code), file);
  }
});
