// PR 4A · tarjeta de destino de «Buscar vuelos» (la de Malta) con el diseño de la ficha de Roma.
//
// La tarjeta detallada de /vuelos pasa a ser la ficha en formato "no emergente": foto panorámica con país y
// nombre, cuerpo blanco, recomendaciones y estancia en tarjetas claras, planificador de itinerario claro y
// botón de hoteles con el estilo de la ficha. Se conserva todo el contenido y todas las funciones.
// El resumen PEQUEÑO del formulario de vuelos (sin "detailed") no cambia.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const helpers = require('./helpers/ficha-snapshots.cjs');
const { LOCALES, flatten, serialize, digest, loader, makeReact } = helpers;

const root = path.resolve(__dirname, '..');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);
const classes = n => String(n?.props?.className ?? '').split(/\s+/).filter(Boolean);

const dictionaries = loader(root)('lib/i18n/translations.ts');
const catalog = loader(root)('lib/destinations/index.ts');
const localization = loader(root)('lib/destinations/localization.ts');
const framing = loader(root)('lib/destinations/image-framing.ts');
const flags = loader(root)('lib/destinations/country-flags.ts');
const styleModule = loader(root)('app/components/destination-window-style.ts');
const style = styleModule.destinationWindowStyle;

function summaryFor(locale) {
  const language = { useLanguage: () => ({ language: locale, t: (k, v) => dictionaries.translate(locale, k, v), text: v => v }) };
  const react = makeReact([], { index: 0, sets: [] });
  return loader(root, { react, './LanguageProvider': language }, { React: react })('app/components/DestinationProfileSummary.tsx').default;
}
function hotelLinkFor(locale) {
  const language = { useLanguage: () => ({ language: locale, t: (k, v) => dictionaries.translate(locale, k, v), text: v => v }) };
  const react = makeReact([], { index: 0, sets: [] });
  return loader(root, { react, 'next/link': { default: 'a' }, './LanguageProvider': language }, { React: react })('app/components/HotelDestinationLink.tsx').default;
}

const DARK_BACKGROUNDS = /(^|\s)(bg-white\/5|bg-white\/10|bg-slate-950(\/\d+)?|bg-slate-900(\/\d+)?|bg-slate-800|bg-black(\/\d+)?|bg-cyan-300\/\[0\.06\]|bg-cyan-300\/10)(\s|$)/;
const DARK_TEXT = /(^|\s)(text-white|text-slate-(100|200|300|400)|text-cyan-(100|200)|text-rose-(100|200)|text-red-(100|200))(\s|$)/;

test('the detailed card of every catalog destination, in seven languages, has the design of the Roma window and all its content', () => {
  let checked = 0;
  for (const locale of LOCALES) {
    const Summary = summaryFor(locale);
    for (const destination of catalog.destinationProfiles) {
      const marker = { type: 'planner-marker', props: {}, children: [] };
      const tree = Summary({ destination, detailed: true, children: [marker] });
      const nodes = flatten(tree);
      const where = `${locale} ${destination.id}`;
      const display = localization.getDestinationText(destination, locale);
      const country = localization.getDestinationCountryName(destination, locale);

      // La tarjeta es una ficha en la página: blanca, texto oscuro, mismas esquinas que la ventana.
      assert.equal(tree.type, 'article', where);
      assert.equal(tree.props.className, style.inlineCard, where);
      assert.ok(classes(tree).includes('bg-white') && classes(tree).includes('text-slate-900'), where);

      // Cabecera: foto panorámica con el encuadre de la ficha, país con bandera fiable y nombre; sin botón de cerrar.
      const frame = nodes.find(n => n.props['data-destination-photo-frame']);
      assert.ok(frame, where + ': frame');
      assert.equal(frame.props.className, style.photoFrame, where);
      const image = flatten(frame).find(n => n.type === 'img');
      assert.equal(image.props.src, destination.image, where);
      assert.ok(image.props.alt.includes(display.name), where);
      const position = framing.panoramicImagePosition(destination);
      assert.equal(JSON.stringify(image.props.style ?? null), JSON.stringify(position ? { objectPosition: position } : null), where);
      assert.ok(!flatten(frame).some(n => n.type === 'button'), where + ': no close button');
      const title = flatten(frame).find(n => n.type === 'h2');
      assert.equal(text(title).trim(), display.name, where);
      const countryLine = flatten(frame).find(n => classes(n).join(' ') === style.country);
      assert.ok(text(countryLine).includes(country), where);
      const flag = flags.flagForCountryCode(destination.countryCode);
      assert.equal(text(countryLine).includes(flag ?? '\u0000'), Boolean(flag), where + ': flag only with a reliable code');
      assert.ok(!text(countryLine).includes('🇫🇷') || destination.countryCode === 'FR', where + ': never a French default');

      // Cuerpo: descripción, recomendaciones y estancia, con las mismas clases que la ventana.
      const body = nodes.find(n => n.props.className === style.body);
      assert.ok(body, where + ': body');
      assert.equal(text(nodes.find(n => n.props.className === style.description)), display.description, where);
      const cards = nodes.filter(n => n.props.className === style.recommendationCard);
      assert.deepEqual(cards.map(n => text(n)), Array.from(display.recommendations, place => `📍 ${place}`), where);
      assert.ok(nodes.some(n => n.props.className === style.recommendationsGrid), where);
      assert.equal(text(nodes.find(n => n.props.className === style.sectionHeading)), `✨ ${dictionaries.translate(locale, 'destinations.recommendations')}`, where);
      const stay = nodes.find(n => n.props.className === style.stayCard);
      if (display.recommendedStay) assert.equal(text(stay), `${dictionaries.translate(locale, 'destinations.recommendedStay')}: ${display.recommendedStay}`, where);
      else assert.equal(stay, undefined, where);

      // Crédito de la foto y licencia: mismos enlaces que antes.
      const links = nodes.filter(n => n.type === 'a');
      if (destination.imageSource) {
        assert.equal(links[0].props.href, destination.imageSource, where);
        assert.ok(text(links[0]).includes(destination.imageCredit ?? 'Foto'), where);
        if (destination.imageLicense && destination.imageLicenseUrl) {
          assert.equal(links[1].props.href, destination.imageLicenseUrl, where);
          assert.equal(text(links[1]), destination.imageLicense, where);
        }
        assert.ok(nodes.some(n => n.type === 'p' && n.props.className === style.photoCredit), where);
      } else assert.equal(links.length, 0, where);

      // Lo que pasa la página (planificador y botón de hoteles) va al final del cuerpo.
      assert.equal(body.children[body.children.length - 1], marker, where + ': children last');
      checked++;
    }
  }
  assert.ok(checked > 3000, 'many cards checked: ' + checked);
});

test('the detailed card has no dark card and no light text outside the photo', () => {
  for (const locale of ['es', 'en']) {
    const Summary = summaryFor(locale);
    for (const destination of catalog.destinationProfiles) {
      const tree = Summary({ destination, detailed: true });
      const frame = flatten(tree).find(n => n.props['data-destination-photo-frame']);
      const inside = new Set(flatten(frame));
      for (const node of flatten(tree)) {
        if (inside.has(node) || node === tree) continue;
        const names = classes(node).join(' ');
        assert.ok(!DARK_BACKGROUNDS.test(names) && !DARK_TEXT.test(names), `${locale} ${destination.id}: ${names}`);
      }
      assert.ok(!DARK_BACKGROUNDS.test(classes(tree).join(' ')));
    }
  }
});

test('the small summary of the flight form is exactly as before', () => {
  const baseline = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'summary-compact-baseline.json'), 'utf8'));
  assert.deepEqual(Object.keys(baseline), LOCALES);
  let compared = 0;
  for (const locale of LOCALES) {
    const Summary = summaryFor(locale);
    for (const [id, expected] of Object.entries(baseline[locale])) {
      const destination = catalog.getDestinationById(id);
      assert.equal(digest(serialize(Summary({ destination }))), expected, `${locale} ${id}`);
      // Pasar detailed={false} o no pasarlo es lo mismo.
      assert.equal(digest(serialize(Summary({ destination, detailed: false }))), expected, `${locale} ${id}`);
      compared++;
    }
  }
  assert.equal(compared, 56);
});

test('the hotels link keeps its default look and href, and has the window button look only on request', () => {
  const context = { travelers: 2, departureDate: '2026-12-01', returnDate: '2026-12-05' };
  const destination = { name: 'Malta', country: 'Malta' };
  for (const locale of LOCALES) {
    const Link = hotelLinkFor(locale);
    const byDefault = Link({ destination, context });
    const explicitDefault = Link({ destination, context, variant: 'default' });
    const window = Link({ destination, context, variant: 'window' });
    assert.equal(serialize(byDefault), serialize(explicitDefault));
    assert.equal(byDefault.props.className, 'inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700');
    assert.equal(window.props.className, style.actions);
    const link = window.children[0];
    assert.equal(link.props.className, style.secondaryActionLink);
    assert.equal(link.props.href, byDefault.props.href, 'same destination link');
    assert.equal(text(link), text(byDefault));
    assert.ok(text(byDefault).includes(dictionaries.translate(locale, 'search.findHotels')));
  }
  const l = styleModule.destinationWindowStyle.secondaryActionLink;
  assert.ok(!DARK_BACKGROUNDS.test(l) && !DARK_TEXT.test(l));
});

test('the flight search page uses the common card, a light planner and the window hotels button, and keeps the provider containers', () => {
  const page = source('app/vuelos/page.tsx');
  assert.match(page, /<DestinationProfileSummary destination=\{destination\} detailed>/);
  assert.match(page, /<ItineraryPlanner destination=\{destination\} context=\{itineraryContext\} surface="light" \/>/);
  assert.match(page, /<HotelDestinationLink destination=\{destination\} context=\{itineraryContext\} variant="window" \/>/);
  // Ya no hay bloque oscuro ni la tarjeta antigua.
  assert.ok(!page.includes('bg-slate-900') && !page.includes('bg-white/80') && !page.includes('border-blue-600/20'));
  // Siguen los contenedores del proveedor, el aviso sin búsqueda y el pie de página original.
  for (const piece of ['id="tpwl-search" hidden aria-hidden="true"', 'id="tpwl-tickets"', 'Inicia una búsqueda desde el formulario de vuelos de la portada.',
    'Consulta opciones de vuelo en el metabuscador de Travelpayouts.', '← Volver a Destinauta', 'https://tpemd.com/wl_web/main.js?wl_id=23773']) assert.ok(page.includes(piece), piece);
  // El orden es el de la ficha: tarjeta, planificador y botón de hoteles al final.
  assert.ok(page.indexOf('<ItineraryPlanner') < page.indexOf('<HotelDestinationLink'));
});

test('the common style adds the inline card and the hotels link without changing the window tokens', () => {
  assert.equal(style.inlineCard, 'mt-5 overflow-hidden rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-sm');
  assert.ok(style.secondaryActionLink.includes('min-h-11') && style.secondaryActionLink.includes('border-sky-300'));
  // La ventana emergente sigue igual (la comparación completa está en destination-window-common-frame.test.cjs).
  assert.ok(style.dialog.includes('bg-white') && style.primaryAction.includes('bg-cyan-300'));
  assert.ok(source('app/components/destination-window-header.tsx').includes('{onClose && ('));
});
