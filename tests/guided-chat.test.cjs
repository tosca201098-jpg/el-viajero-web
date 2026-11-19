const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const ts = require(path.join(root, 'node_modules/typescript'));
const compilerOptions = { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React };

// Real source files, compiled on the fly; only what the test passes as `mocks` is replaced.
function loader(mocks = {}, globals = {}) {
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file);
    const exports = {}; cache.set(file, exports);
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions }).outputText, {
      exports, Intl, URL, URLSearchParams, ...globals,
      require: id => {
        if (Object.hasOwn(mocks, id)) return mocks[id];
        const base = id.startsWith('@/') ? id.slice(2) : path.join(path.dirname(file), id);
        const resolved = [base + '.ts', base + '.tsx', path.join(base, 'index.ts')].find(p => fs.existsSync(path.join(root, p)));
        if (!resolved) throw Error('Forbidden dependency: ' + id);
        return load(resolved);
      },
    }, { filename: file });
    return exports;
  }
  return load;
}
const shared = loader();
const translations = shared('lib/i18n/translations.ts');
const chat = shared('lib/chat/guided.ts');
const vocabulary = shared('lib/chat/vocabulary.ts');
const destinations = shared('lib/destinations/index.ts');
const now = new Date(2026, 10, 19, 12, 0, 0); // 19 November 2026
const codes = translations.locales.map(item => item.code);
const placeIds = new Set(destinations.destinationProfiles.map(profile => profile.id));
const names = reply => Array.from(reply.places ?? [], item => item.place?.name ?? item.name);

test('the sample questions of every language are understood in that language', () => {
  for (const code of codes) {
    const [first, second, third] = ['chat.sample1', 'chat.sample2', 'chat.sample3'].map(key => translations.translate(code, key));
    const rome = chat.answerChat(first, code, now);
    assert.equal(rome.kind, 'destination', `${code}: ${first}`);
    assert.equal(rome.places[0].place.id, 'it-rome');
    assert.equal(rome.places[0].fit, undefined, 'no month, so no month verdict');
    const october = chat.answerChat(second, code, now);
    assert.equal(october.kind, 'list', `${code}: ${second}`);
    assert.deepEqual(october.period.months.length, 1);
    assert.equal(october.period.months[0], new Intl.DateTimeFormat(code, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, 9, 1))));
    assert.ok(october.places.length > 0 && october.places.length <= 6 && october.total > 6);
    const beaches = chat.answerChat(third, code, now);
    assert.equal(beaches.kind, 'list', `${code}: ${third}`);
    assert.equal(beaches.topic, 'beach');
    assert.equal(beaches.country, new Intl.DisplayNames([code], { type: 'region' }).of('ES'));
    assert.ok(beaches.places.length > 0);
  }
});

test('a named destination shows the catalogue data in the visitor language and checks the month', () => {
  const january = chat.answerChat('quiero ir a Roma en enero', 'es', now);
  assert.equal(january.kind, 'destination');
  const [rome] = january.places;
  assert.equal(rome.place.name, 'Roma'); assert.equal(rome.place.country, 'Italia');
  assert.ok(rome.place.bestMonths && rome.place.recommendations.length === 4 && rome.place.recommendedStay);
  assert.deepEqual(JSON.parse(JSON.stringify(rome.fit)), { month: 'enero', best: false, busy: false });
  const may = chat.answerChat('Roma en mayo', 'es', now);
  assert.equal(may.places[0].fit.best, true);
  const july = chat.answerChat('Roma en julio', 'es', now);
  assert.equal(july.places[0].fit.best, false, 'July is not among the best months of Rome in the catalogue');
  // A destination whose best month is also in its high season is reported as «good but busy».
  const busy = destinations.destinationProfiles.map(profile => {
    const month = (profile.bestMonths ?? []).find(item => (profile.highSeasonMonths ?? []).includes(item));
    if (!month) return null;
    const monthName = new Intl.DateTimeFormat('es', { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, month - 1, 1)));
    const reply = chat.answerChat(`${profile.name} en ${monthName}`, 'es', now);
    return reply.kind === 'destination' && reply.places.length === 1 && reply.places[0].place.id === profile.id ? reply.places[0].fit : null;
  }).find(Boolean);
  assert.ok(busy, 'the catalogue has at least one destination whose best month is also busy');
  assert.equal(busy.best, true); assert.equal(busy.busy, true);
  const english = chat.answerChat('When should I visit Rome in October?', 'en', now);
  assert.equal(english.places[0].place.name, 'Rome'); assert.equal(english.places[0].place.country, 'Italy');
  assert.equal(english.places[0].fit.month, 'October');
});

test('whole names only: «Roma» is never Craiova, Rímini or «Forlì y Romaña», and «mayo» is a month, not the Irish county', () => {
  const rome = chat.answerChat('Roma', 'es', now);
  assert.deepEqual(names(rome), ['Roma']);
  const two = chat.answerChat('quiero ir a roma o florencia en mayo', 'es', now);
  assert.deepEqual(names(two), ['Roma', 'Florencia']);
  assert.equal(two.places.every(item => item.fit.month === 'mayo'), true);
  const month = chat.answerChat('mayo', 'es', now);
  assert.equal(month.kind, 'list'); assert.deepEqual(Array.from(month.period.months), ['mayo']);
  const ireland = chat.answerChat('Irlanda', 'es', now);
  assert.equal(ireland.kind, 'list'); assert.equal(ireland.country, 'Irlanda');
});

test('countries, months, seasons and topics are combined from the catalogue only', () => {
  const italy = chat.answerChat('italia', 'es', now);
  assert.equal(italy.kind, 'list'); assert.equal(italy.country, 'Italia'); assert.ok(italy.total >= 20);
  assert.ok(italy.places.every(place => place.country === 'Italia'));
  const portugal = chat.answerChat('playas en portugal en agosto', 'es', now);
  assert.equal(portugal.kind, 'list'); assert.equal(portugal.topic, 'beach');
  assert.ok(portugal.places.every(place => place.country === 'Portugal'));
  const summer = chat.answerChat('dónde ir en verano', 'es', now);
  assert.equal(summer.kind, 'list'); assert.equal(summer.period.season, 'summer'); assert.deepEqual(Array.from(summer.period.months), ['junio', 'julio', 'agosto']);
  assert.equal(summer.total, null, 'several months: no exact total is claimed');
  const winter = chat.answerChat('winter', 'en', now);
  assert.deepEqual(Array.from(winter.period.months), ['December', 'January', 'February']);
  const between = chat.answerChat('entre mayo y junio', 'es', now);
  assert.deepEqual(Array.from(between.period.months), ['mayo', 'junio']);
  const ski = chat.answerChat('esquiar en febrero', 'es', now);
  assert.equal(ski.topic, 'snow'); assert.ok(ski.places.length > 0);
  const thisMonth = chat.answerChat('qué visitar este mes', 'es', now);
  assert.deepEqual(Array.from(thisMonth.period.months), ['noviembre']);
  const december = chat.answerChat('el mes que viene', 'es', new Date(2026, 11, 5));
  assert.deepEqual(Array.from(december.period.months), ['enero'], 'next month after December is January');
  const nothing = chat.answerChat('auroras boreales en agosto', 'es', now);
  assert.ok(['list', 'none'].includes(nothing.kind));
  const empty = chat.answerChat('playas en Andorra en enero', 'es', now);
  assert.ok(['list', 'none'].includes(empty.kind));
});

test('«may» is only a month after a preposition; other English sentences are not read as months', () => {
  assert.equal(chat.answerChat('what may be the best place', 'en', now).kind, 'unknown');
  const may = chat.answerChat('where to go in may', 'en', now);
  assert.deepEqual(Array.from(may.period.months), ['May']);
});

test('prices, flights and hotels are never answered with a number: the chat says it has none and points to the searches', () => {
  const budget = chat.answerChat('tengo 700 euros', 'es', now);
  assert.equal(budget.kind, 'prices');
  for (const text of ['cuánto cuesta un vuelo a Roma', 'hoteles baratos en París', 'cheap flights', 'prix des vols', 'quanto costa un volo']) {
    const reply = chat.answerChat(text, text.startsWith('prix') ? 'fr' : text.startsWith('quanto') ? 'it' : 'es', now);
    assert.ok(['prices', 'destination', 'list'].includes(reply.kind), text);
    if (reply.kind !== 'prices') assert.equal(reply.priceNote, true, text);
  }
  const withDestination = chat.answerChat('vuelos baratos a Roma', 'es', now);
  assert.equal(withDestination.kind, 'destination'); assert.equal(withDestination.priceNote, true);
  // No reply ever carries a currency amount.
  const all = ['Roma', 'italia', 'dónde ir en octubre', 'playas en España', 'tengo 700 euros', 'vuelos a París en mayo'];
  for (const text of all) assert.equal(/\d\s?(€|eur|euros|\$|usd)|€\s?\d/i.test(JSON.stringify(chat.answerChat(text, 'es', now))), false, text);
});

test('greetings, unknown questions and off-topic questions get no invented answer', () => {
  for (const text of ['hola', 'hello', 'bonjour', 'hallo', 'ciao', 'olá', 'bon dia']) assert.equal(chat.answerChat(text, 'es', now).kind, 'welcome', text);
  for (const text of ['asdf qwer', 'quién ganó el partido de fútbol', 'dame una receta de paella', 'who will win the election', 'x']) {
    assert.equal(chat.answerChat(text, 'es', now).kind, 'unknown', text);
  }
  assert.equal(chat.answerChat('', 'es', now).kind, 'welcome');
  assert.equal(chat.answerChat('a'.repeat(chat.MAX_CHAT_INPUT + 1), 'es', now).kind, 'tooLong');
  assert.notEqual(chat.answerChat('a'.repeat(chat.MAX_CHAT_INPUT), 'es', now).kind, 'tooLong');
  for (const bad of [null, undefined, 42, {}, ['Roma']]) assert.equal(chat.answerChat(bad, 'es', now).kind, 'welcome');
});

test('every place of every answer exists in the catalogue and answers are plain data', () => {
  for (const code of codes) for (const text of ['Roma', 'Lisboa', 'octubre', 'italia', 'playa', 'castillos en Francia']) {
    const reply = chat.answerChat(text, code, now);
    for (const item of reply.places ?? []) {
      const place = item.place ?? item;
      assert.ok(placeIds.has(place.id), `${code}/${text}: ${place.id}`);
      assert.equal(typeof place.name, 'string'); assert.equal(typeof place.country, 'string');
    }
    assert.equal(JSON.stringify(reply), JSON.stringify(JSON.parse(JSON.stringify(reply))));
  }
});

test('the vocabulary is normalised, in seven languages, and does not swallow a destination name', () => {
  const normalise = destinations.normalizeDestinationName;
  const words = [...Object.values(vocabulary.SEASONS).flatMap(item => item.words), ...vocabulary.TOPICS.flatMap(item => item.words),
    ...vocabulary.PRICE_WORDS, ...vocabulary.GREETINGS, ...vocabulary.RELATIVE_MONTH.current, ...vocabulary.RELATIVE_MONTH.next];
  for (const word of words) assert.equal(normalise(word), word, `${word} must already be normalised`);
  // A destination that would lose every name to the reserved words could never be recognised.
  const reserved = new Set(words);
  for (let month = 1; month <= 12; month++) for (const code of codes) reserved.add(normalise(new Intl.DateTimeFormat(code, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2020, month - 1, 1)))));
  const lost = destinations.destinationProfiles.filter(profile => {
    const terms = [profile.name, ...(profile.aliases ?? []), ...codes.map(code => (profile.translations?.[code]?.name ?? profile.name))].map(normalise).filter(term => term.length >= 3);
    return terms.length > 0 && terms.every(term => reserved.has(term));
  });
  assert.deepEqual(Array.from(lost, profile => profile.name), [], 'destinations that only exist under a vocabulary word');
  for (const topic of vocabulary.TOPICS) {
    assert.ok(topic.words.length >= 4 && topic.catalog.length >= 1);
    for (const code of codes) assert.ok(translations.translate(code, `chat.topic.${topic.key}`), `${code} chat.topic.${topic.key}`);
  }
  for (const season of Object.keys(vocabulary.SEASONS)) for (const code of codes) assert.ok(translations.translate(code, `chat.season.${season}`));
});

test('the catalogue filters added for the chat do not change what Sofía receives', () => {
  const catalog = shared('lib/voice/catalog.ts');
  const plain = catalog.queryVoiceCatalog('Roma', 'es');
  const same = catalog.queryVoiceCatalog('Roma', 'es', { country: undefined, id: undefined });
  assert.equal(JSON.stringify(plain), JSON.stringify(same));
  assert.equal(catalog.queryVoiceCatalog('', 'es', { id: 'it-rome' }).total, 1);
  assert.equal(catalog.queryVoiceCatalog('', 'es', { country: 'PT' }).destinations.every(place => place.country === 'Portugal'), true);
  assert.equal(catalog.queryVoiceCatalog('', 'es', { id: 'no-such-id' }).total, 0);
});

test('all the chat texts exist in the seven languages with the same variables', () => {
  const keys = Object.keys(translations.dictionaries.es).filter(key => key.startsWith('chat.'));
  assert.ok(keys.length >= 48);
  for (const key of ['chat.undecided', 'chat.undecidedSearch', 'chat.openDiscover']) assert.ok(keys.includes(key), key);
  for (const key of keys) {
    const variables = text => (text.match(/\{[a-zA-Z]+\}/g) ?? []).sort().join(',');
    for (const code of codes) {
      const value = translations.dictionaries[code][key];
      assert.ok(typeof value === 'string' && value.trim(), `${code} ${key}`);
      assert.equal(variables(value), variables(translations.dictionaries.es[key]), `${code} ${key} variables`);
    }
  }
});

// A tiny hook scheduler runs the real component: the tree it returns is searched and clicked like a page would be.
function chatHarness(code, handlers) {
  const states = [], refs = [];
  let stateIndex = 0, refIndex = 0;
  const react = {
    Fragment: 'fragment',
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useState(initial) {
      const index = stateIndex++;
      if (!(index in states)) states[index] = initial;
      return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
    },
    useRef(initial) { const index = refIndex++; if (!(index in refs)) refs[index] = { current: initial }; return refs[index]; },
    useEffect() {},
  };
  const Component = loader({
    react, 'next/link': { __esModule: true, default: 'a' },
    './LanguageProvider': { useLanguage: () => ({ language: code, t: (key, variables) => translations.translate(code, key, variables) }) },
  }, { React: react })('app/components/GuidedChat.tsx').default;
  const render = () => { stateIndex = 0; refIndex = 0; return Component(handlers); };
  const walk = (node, visit) => {
    if (node == null || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(child => walk(child, visit)); return; }
    visit(node); walk(node.children, visit);
  };
  const text = node => { let out = ''; walk(node, item => { for (const child of item.children) if (typeof child === 'string' || typeof child === 'number') out += child + ' '; }); return out; };
  const all = (tree, predicate) => { const found = []; walk(tree, item => { if (predicate(item)) found.push(item); }); return found; };
  const button = (tree, label) => all(tree, item => ['button', 'a'].includes(item.type) && text(item).includes(label))[0];
  return { render, all, text, button, translate: (key, variables) => translations.translate(code, key, variables) };
}

test('the chat button opens a panel with the welcome, the scope and the sample questions', () => {
  for (const code of codes) {
    const ui = chatHarness(code, { onOpenDestination() {}, onOpenFlightSearch() {} });
    const closed = ui.render();
    const open = ui.button(closed, ui.translate('chat.title'));
    assert.equal(open.props['aria-label'], ui.translate('chat.open'));
    assert.equal(ui.all(closed, item => item.props.role === 'dialog').length, 0);
    open.props.onClick();
    const panel = ui.render();
    const dialog = ui.all(panel, item => item.props.role === 'dialog')[0];
    assert.ok(dialog, code);
    assert.equal(dialog.props['aria-label'], ui.translate('chat.title'));
    const content = ui.text(panel);
    for (const key of ['chat.welcome', 'chat.scope', 'chat.sample1', 'chat.sample2', 'chat.sample3']) assert.ok(content.includes(ui.translate(key)), `${code} ${key}`);
    const input = ui.all(panel, item => item.type === 'input')[0];
    assert.equal(input.props.maxLength, chat.MAX_CHAT_INPUT);
    assert.equal(input.props.placeholder, ui.translate('chat.placeholder'));
    dialog.props.onKeyDown({ key: 'Escape' });
    assert.equal(ui.all(ui.render(), item => item.props.role === 'dialog').length, 0, 'Escape closes the chat');
  }
});

test('a sample question gets the catalogue answer and «open the page» uses the same handler as Sofía, then closes the chat', () => {
  for (const code of codes) {
    const opened = [];
    const ui = chatHarness(code, { onOpenDestination: id => opened.push(id), onOpenFlightSearch() { throw Error('not expected'); } });
    ui.button(ui.render(), ui.translate('chat.title')).props.onClick();
    ui.button(ui.render(), ui.translate('chat.sample1')).props.onClick();
    const answered = ui.render();
    const rome = chat.answerChat(ui.translate('chat.sample1'), code, now).places[0].place;
    const content = ui.text(answered);
    assert.ok(content.includes(rome.description) && content.includes(ui.translate('chat.bestMonths', { months: rome.bestMonths })), code);
    for (const item of rome.recommendations) assert.ok(content.includes(item), `${code} ${item}`);
    ui.button(answered, ui.translate('chat.openCard', { name: rome.name })).props.onClick();
    assert.deepEqual(opened, ['it-rome'], code);
    assert.equal(ui.all(ui.render(), item => item.props.role === 'dialog').length, 0, 'the chat closes so the page can be seen');
  }
});

test('typing a question sends it, shows it and answers; a price question offers the flight search and the hotels page', () => {
  const calls = [];
  const ui = chatHarness('es', { onOpenDestination() {}, onOpenFlightSearch: () => calls.push('flights') });
  ui.button(ui.render(), 'Chat DESTINAUTA').props.onClick();
  const form = () => ui.all(ui.render(), item => item.type === 'form')[0];
  const type = value => ui.all(ui.render(), item => item.type === 'input')[0].props.onChange({ target: { value } });
  type('tengo 700 euros');
  let panel = ui.render();
  assert.equal(ui.all(panel, item => item.type === 'button' && item.props.type === 'submit')[0].props.disabled, false);
  let prevented = 0;
  form().props.onSubmit({ preventDefault: () => prevented++ });
  assert.equal(prevented, 1);
  panel = ui.render();
  assert.equal(ui.all(panel, item => item.type === 'input')[0].props.value, '', 'the box is emptied');
  const content = ui.text(panel);
  assert.ok(content.includes('tengo 700 euros') && content.includes(ui.translate('chat.prices')));
  const hotels = ui.all(panel, item => item.type === 'a')[0];
  assert.equal(hotels.props.href, '/hoteles');
  ui.button(panel, ui.translate('chat.searchFlights')).props.onClick();
  assert.deepEqual(calls, ['flights']);
  assert.equal(ui.all(ui.render(), item => item.props.role === 'dialog').length, 0);
  // Empty and blank messages are ignored and the send button is disabled.
  ui.button(ui.render(), 'Chat DESTINAUTA').props.onClick();
  type('   ');
  assert.equal(ui.all(ui.render(), item => item.type === 'button' && item.props.type === 'submit')[0].props.disabled, true);
  form().props.onSubmit({ preventDefault() {} });
  assert.equal(ui.all(ui.render(), item => typeof item.props.className === 'string' && item.props.className.includes('ml-auto')).length, 1, 'only the first message was sent');
});

test('a list answer says how many there are and a country question shows the destinations of that country', () => {
  const ui = chatHarness('es', { onOpenDestination() {}, onOpenFlightSearch() {} });
  ui.button(ui.render(), 'Chat DESTINAUTA').props.onClick();
  const input = () => ui.all(ui.render(), item => item.type === 'input')[0];
  input().props.onChange({ target: { value: 'italia' } });
  ui.all(ui.render(), item => item.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  const panel = ui.render();
  const content = ui.text(panel);
  assert.ok(content.includes('Destinos de DESTINAUTA para: Italia'));
  assert.match(content, /Te enseño 6 de \d+\. Añade un país, un mes o un tema para afinar\./);
  assert.equal(ui.all(panel, item => item.type === 'article').length, 6);
});

test('the first delivery stores and sends nothing: no network, no storage, no cookies', () => {
  const source = ['app/components/GuidedChat.tsx', 'lib/chat/guided.ts', 'lib/chat/vocabulary.ts'].map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  assert.equal(/fetch\(|XMLHttpRequest|sendBeacon|WebSocket|localStorage|sessionStorage|indexedDB|document\.cookie|process\.env|supabase/i.test(source), false);
  const page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
  assert.equal((page.match(/<GuidedChat/g) ?? []).length, 1, 'mounted once, on the home page only');
  assert.match(page, /import GuidedChat from "\.\/components\/GuidedChat"/);
  assert.match(page, /onOpenDestination=\{\(id\) => \{\s*const destination = getDestinationById\(id\);/);
  const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
  assert.equal(/GuidedChat/.test(layout), false, 'not in the layout: the live-flights frame page must never get a chat button');
  // The destination window is z-50 and the other windows z-60/z-70: the chat steps aside instead of drawing over them.
  assert.match(page, /hidden=\{Boolean\(destinoSeleccionado \|\| modal \|\| flightResultsOpen \|\| authMode\)\}/);
});

test('the chat steps aside while a window of the page is open and keeps its conversation when it comes back', () => {
  const handlers = { onOpenDestination() {}, onOpenFlightSearch() {}, hidden: false };
  const ui = chatHarness('es', handlers);
  ui.button(ui.render(), 'Chat DESTINAUTA').props.onClick();
  ui.button(ui.render(), ui.translate('chat.sample2')).props.onClick();
  assert.ok(ui.text(ui.render()).includes('Destinos de DESTINAUTA para: octubre'));
  handlers.hidden = true;
  assert.equal(ui.render(), null, 'nothing is drawn over the destination, search or sign-in windows');
  handlers.hidden = false;
  const back = ui.render();
  assert.ok(ui.all(back, item => item.props.role === 'dialog').length === 1, 'still open, as it was');
  assert.ok(ui.text(back).includes('Destinos de DESTINAUTA para: octubre'), 'the conversation is kept');
});

test('the home page has exactly one chat button, and the comparison tests of the 16 cards ignore only that button', () => {
  const helpers = require('./helpers/ficha-snapshots.cjs');
  for (const locale of ['es', 'en', 'ca']) {
    const renderer = helpers.createRenderer(root, locale);
    const raw = helpers.flatten(renderer.rawHome());
    const chats = raw.filter(node => node.type === helpers.CHAT_TAG);
    assert.equal(chats.length, 1, `${locale}: one chat on the home page`);
    assert.equal(typeof chats[0].props.onOpenDestination, 'function');
    assert.equal(typeof chats[0].props.onOpenFlightSearch, 'function');
    assert.equal(chats[0].props.hidden, false, 'visible while no window is open');
    const clean = helpers.flatten(renderer.home());
    assert.equal(clean.filter(node => node.type === helpers.CHAT_TAG).length, 0);
    assert.equal(clean.length, raw.length - 1, 'removing the chat removes that single node and nothing else');
    // The 16 original cards are still all there, untouched, in the page the other tests compare.
    assert.equal(clean.filter(node => node.type === 'article').length, raw.filter(node => node.type === 'article').length);
  }
});

test('«no sé dónde ir» and similar phrases are understood in the seven languages and ask what the person feels like', () => {
  const phrases = {
    es: ['no sé dónde ir', 'No se donde ir', 'no sé a dónde viajar', 'recomiéndame un destino', 'sorpréndeme', 'ideas de viaje', '¿qué me recomiendas?', 'quiero viajar', 'dónde puedo ir'],
    en: ["I don't know where to go", 'where should I go?', 'surprise me', 'travel ideas', 'what do you recommend'],
    fr: ['je ne sais pas où aller', 'où partir ?', 'surprenez-moi', 'idées de voyage'],
    de: ['ich weiß nicht, wohin', 'Ich weiss noch nicht wohin', 'überrasch mich', 'Reiseideen'],
    it: ['non so dove andare', 'dove andare?', 'sorprendimi', 'idee di viaggio'],
    pt: ['não sei para onde ir', 'não sei onde ir', 'surpreende-me', 'ideias de viagem'],
    ca: ['no sé on anar', 'on puc anar?', 'sorprèn-me', 'idees de viatge'],
  };
  for (const [code, list] of Object.entries(phrases)) {
    for (const phrase of list) assert.deepEqual(Object.assign({}, chat.answerChat(phrase, code, now)), { kind: 'undecided' }, `${code}: ${phrase}`);
  }
  // Another language than the page's one also works, as everything else in the chat does.
  assert.equal(chat.answerChat("I don't know where to go", 'es', now).kind, 'undecided');
});

test('being undecided never hides what the person did say: a destination, country, month, season or topic is answered first', () => {
  assert.equal(chat.answerChat('no sé dónde ir en octubre', 'es', now).kind, 'list');
  assert.equal(chat.answerChat('no sé dónde ir, quiero playa', 'es', now).kind, 'list');
  assert.equal(chat.answerChat('no sé dónde ir en Italia', 'es', now).kind, 'list');
  assert.equal(chat.answerChat('no sé si ir a Roma', 'es', now).kind, 'destination');
  assert.equal(chat.answerChat('where to go in summer', 'en', now).kind, 'list');
  // Prices, flights and hotels still get the honest note, and the generic words do not turn into «undecided».
  assert.equal(chat.answerChat('recomiéndame un hotel', 'es', now).kind, 'prices');
  assert.equal(chat.answerChat('vuelos baratos', 'es', now).kind, 'prices');
  assert.equal(chat.answerChat('tengo 700 euros', 'es', now).kind, 'prices');
  assert.equal(chat.answerChat('hola', 'es', now).kind, 'welcome');
  assert.equal(chat.answerChat('quién ganó la liga', 'es', now).kind, 'unknown');
});

test('the topic buttons offered to an undecided person are understood as topics in the seven languages', () => {
  for (const code of codes) {
    for (const topic of ['beach', 'mountain', 'museums', 'nature', 'snow', 'islands']) {
      const label = translations.translate(code, `chat.topic.${topic}`);
      const reply = chat.answerChat(label, code, now);
      assert.equal(reply.kind, 'list', `${code}: ${label}`);
      assert.equal(reply.topic, topic, `${code}: ${label}`);
      assert.ok(reply.places.length > 0);
    }
  }
});

test('an undecided question offers topics and the «I don\'t know where to go» search of the page, and closes the chat for it', () => {
  const calls = [];
  const ui = chatHarness('es', { onOpenDestination() {}, onOpenFlightSearch: options => calls.push(options) });
  ui.button(ui.render(), 'Chat DESTINAUTA').props.onClick();
  const type = value => ui.all(ui.render(), item => item.type === 'input')[0].props.onChange({ target: { value } });
  const exact = (tree, label) => ui.all(tree, item => item.type === 'button' && ui.text(item).trim() === label)[0];
  type('no sé dónde ir');
  ui.all(ui.render(), item => item.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  let panel = ui.render();
  const content = ui.text(panel);
  assert.ok(content.includes(ui.translate('chat.undecided')) && content.includes(ui.translate('chat.undecidedSearch')));
  for (const topic of ['beach', 'mountain', 'museums', 'nature', 'snow', 'islands']) {
    const label = ui.translate(`chat.topic.${topic}`);
    assert.ok(exact(panel, label.charAt(0).toUpperCase() + label.slice(1)), topic);
  }
  // A topic button asks that topic as if it had been typed.
  exact(panel, 'Playas').props.onClick();
  panel = ui.render();
  assert.ok(ui.text(panel).includes(ui.translate('chat.listIntro', { filters: ui.translate('chat.topic.beach') })));
  assert.ok(ui.all(panel, item => item.type === 'article').length > 0);
  // The search button asks the page to switch on «No sé dónde ir» and closes the chat.
  type('no sé dónde ir');
  ui.all(ui.render(), item => item.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  ui.button(ui.render(), ui.translate('chat.openDiscover')).props.onClick();
  assert.deepEqual(calls.map(options => ({ ...options })), [{ discover: true }]);
  assert.equal(ui.all(ui.render(), item => item.props.role === 'dialog').length, 0);
  // The price answer still calls the search without switching on «No sé dónde ir».
  ui.button(ui.render(), 'Chat DESTINAUTA').props.onClick();
  type('tengo 700 euros');
  ui.all(ui.render(), item => item.type === 'form')[0].props.onSubmit({ preventDefault() {} });
  ui.button(ui.render(), ui.translate('chat.searchFlights')).props.onClick();
  assert.deepEqual(calls.map(options => options === undefined ? null : { ...options }), [{ discover: true }, null]);
});

test('the page switches on «No sé dónde ir» only when the chat asks for it, and keeps the rest of the search handler', () => {
  const page = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
  assert.match(page, /onOpenFlightSearch=\{\(options\) => \{[\s\S]*?if \(options\?\.discover\) setDiscoverMode\(true\);[\s\S]*?radio\?\.click\(\);/);
  assert.equal((page.match(/options\?\.discover/g) ?? []).length, 1, 'only the chat handler reads the option');
});
