// Barra de «Mi cuenta» con los minutos de voz que le quedan a la persona en su periodo (por defecto el mes natural: 20 minutos).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loader, flatten } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const translations = loader(root)('lib/i18n/translations.ts');
const LOCALES = Array.from(translations.locales, l => l.code);
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);
const RESETS = Date.parse('2026-11-30T23:00:00Z') / 1000; // Tuesday 1 Dec 00:00 in Madrid

function bar({ locale = 'es', answer, token = 'fake.access.token', session = true } = {}) {
  const state = [], counter = { index: 0 }, calls = [];
  let ran = false;
  const react = {
    Fragment: 'Fragment',
    createElement: (type, p, ...children) => ({ type, props: p ?? {}, children: children.flat(Infinity) }),
    useState(initial) {
      const slot = counter.index++;
      if (!(slot in state)) state[slot] = initial;
      return [state[slot], value => { state[slot] = value; }];
    },
    useEffect(effect) { if (!ran) { ran = true; effect(); } },
  };
  const mocks = {
    react, './LanguageProvider': { useLanguage: () => ({ language: locale, t: (key, variables) => translations.translate(locale, key, variables) }) },
    '@/lib/supabase/client': { getSupabaseClient: () => ({ auth: { getSession: async () => ({ data: { session: session ? { access_token: token } : null } }) } }) },
  };
  const api = loader(root, mocks, { React: react, AbortController, fetch: async (url, init) => { calls.push({ url, init }); return answer(); } })('app/components/VoiceMinutesBar.tsx');
  return { render: () => { counter.index = 0; return api.default(); }, calls, clock: api.clock };
}
const settle = () => new Promise(resolve => setTimeout(resolve, 10));
const week = (remainingSeconds, limitSeconds = 360, period = 'month') => ({ period, limitSeconds, usedSeconds: limitSeconds - remainingSeconds, remainingSeconds, resetsAt: RESETS });
const ok = body => async () => Response.json(body);
const progress = tree => flatten(tree).find(n => n && n.props && n.props.role === 'progressbar');

test('the clock reads the same in the seven languages: minutes, minutes and seconds, or seconds', () => {
  const { clock } = bar({ answer: ok(week(1200)) });
  assert.deepEqual([1200, 600, 480, 505, 45, 0, 60, 360].map(clock), ['20 min', '10 min', '8 min', '8 min 25 s', '45 s', '0 s', '1 min', '6 min']);
});

test('while it asks, the bar says so; then it shows what is left of the 6 minutes and when they renew', async () => {
  const h = bar({ answer: ok(week(270)) });
  assert.equal(text(h.render()).includes(translations.translate('es', 'account.voiceMinutes.loading')), true);
  await settle();
  const tree = h.render(), bartree = progress(tree);
  assert.equal(bartree.props['aria-valuenow'], 270); assert.equal(bartree.props['aria-valuemax'], 360); assert.equal(bartree.props['aria-valuemin'], 0);
  assert.equal(bartree.props['aria-valuetext'], 'Te quedan 4 min 30 s de 6 min');
  const fill = bartree.children[0];
  assert.equal(fill.props.style.width, '75%'); assert.ok(String(fill.props.className).includes('bg-blue-600'));
  const shown = text(tree);
  assert.ok(shown.includes('Minutos de voz con Sofía') && shown.includes('Te quedan 4 min 30 s de 6 min'));
  assert.equal(shown.includes('semana'), false, 'the title does not claim a period: it can be a week, a fortnight or a month');
  assert.ok(/martes/i.test(shown) && shown.includes('1') && shown.includes('diciembre') && shown.includes('00:00'), 'renewal: Tuesday 1 December, 00:00 (Madrid)');
});

test('2 minutes spent in one conversation leave 4 for the rest of the month: the leftover stays in the account', async () => {
  const h = bar({ answer: ok(week(240)) });
  h.render(); await settle();
  assert.equal(progress(h.render()).props['aria-valuetext'], 'Te quedan 4 min de 6 min');
  assert.equal(progress(h.render()).children[0].props.style.width, '67%');
});

test('the bar turns amber when a quarter or less is left and red with none left, with its own message', async () => {
  const low = bar({ answer: ok(week(80)) }); low.render(); await settle();
  assert.ok(String(progress(low.render()).children[0].props.className).includes('bg-amber-500'));
  const none = bar({ answer: ok(week(0)) }); none.render(); await settle();
  const tree = none.render();
  assert.equal(progress(tree).children[0].props.style.width, '0%'); assert.ok(String(progress(tree).children[0].props.className).includes('bg-red-600'));
  assert.ok(text(tree).includes(translations.translate('es', 'account.voiceMinutes.none')));
  const seconds = bar({ answer: ok(week(45)) }); seconds.render(); await settle();
  assert.equal(progress(seconds.render()).props['aria-valuetext'], 'Te quedan 45 s de 6 min');
});

test('it asks the server with the account’s own session, never caches, and reads nothing but the account’s minutes', async () => {
  const h = bar({ answer: ok(week(360)), token: 'my.own.token' }); h.render(); await settle();
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0].url, '/api/voice/minutes');
  assert.equal(h.calls[0].init.headers.Authorization, 'Bearer my.own.token'); assert.equal(h.calls[0].init.cache, 'no-store');
  assert.equal(h.calls[0].init.method, undefined, 'a plain GET');
});

test('every failure shows a calm message and no bar: no session, provider paused, malformed answers', async () => {
  const cases = [
    { answer: async () => new Response('x', { status: 503 }) }, { answer: async () => new Response('x', { status: 429 }) },
    { answer: async () => { throw Error('offline'); } }, { answer: ok({ remainingSeconds: 'many' }) }, { answer: ok(week(0, 0)) },
    { answer: ok({ ...week(100), remainingSeconds: 1300 }) }, { answer: ok({ ...week(100), period: 'day' }) }, { answer: ok({ ...week(100), period: undefined }) }, { answer: ok({ ...week(100), resetsAt: -1 }) }, { answer: ok(null) }, { answer: ok(week(360)), session: false },
  ];
  for (const options of cases) {
    const h = bar(options); h.render(); await settle();
    const tree = h.render();
    assert.equal(progress(tree), undefined); assert.ok(text(tree).includes(translations.translate('es', 'account.voiceMinutes.error')));
  }
});

test('the bar reads in the seven languages, with the renewal date in the same language', async () => {
  const words = { es: /martes/i, en: /tuesday/i, fr: /mardi/i, de: /dienstag/i, it: /marted/i, pt: /ter[cç]a/i, ca: /dimarts/i };
  for (const locale of LOCALES) {
    const h = bar({ locale, answer: ok(week(240)) }); h.render(); await settle();
    const shown = text(h.render());
    assert.equal(shown.includes('account.voiceMinutes'), false, locale + ' has every text');
    assert.ok(shown.includes(translations.translate(locale, 'account.voiceMinutes.title')), locale);
    assert.ok(shown.includes('4 min') && shown.includes('6 min'), locale);
    assert.ok(words[locale].test(shown), locale + ' ' + shown);
  }
});

test('a weekly or fortnightly allowance is shown with the same bar: only the amounts and the renewal date change', async () => {
  for (const period of ['week', 'fortnight']) {
    const h = bar({ answer: ok(week(300, 600, period)) }); h.render(); await settle();
    const tree = h.render();
    assert.equal(progress(tree).props['aria-valuetext'], 'Te quedan 5 min de 10 min', period);
    assert.equal(progress(tree).children[0].props.style.width, '50%', period);
  }
});
