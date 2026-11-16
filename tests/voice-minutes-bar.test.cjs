// Barra de «Mi cuenta» con los minutos de voz que le quedan a la persona esta semana (de sus 10 por semana).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { loader, flatten } = require('./helpers/ficha-snapshots.cjs');

const root = path.resolve(__dirname, '..');
const translations = loader(root)('lib/i18n/translations.ts');
const LOCALES = Array.from(translations.locales, l => l.code);
const text = n => n == null || n === false ? '' : Array.isArray(n) ? n.map(text).join('') : typeof n === 'object' ? text(n.children) : String(n);
const RESETS = Date.parse('2026-11-22T23:00:00Z') / 1000; // Monday 23 Nov 00:00 in Madrid

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
const week = (remainingSeconds, limitSeconds = 600) => ({ limitSeconds, usedSeconds: limitSeconds - remainingSeconds, remainingSeconds, resetsAt: RESETS });
const ok = body => async () => Response.json(body);
const progress = tree => flatten(tree).find(n => n && n.props && n.props.role === 'progressbar');

test('the clock reads the same in the seven languages: minutes, minutes and seconds, or seconds', () => {
  const { clock } = bar({ answer: ok(week(600)) });
  assert.deepEqual([600, 480, 505, 45, 0, 60].map(clock), ['10 min', '8 min', '8 min 25 s', '45 s', '0 s', '1 min']);
});

test('while it asks, the bar says so; then it shows what is left of the 10 minutes and when they renew', async () => {
  const h = bar({ answer: ok(week(480)) });
  assert.equal(text(h.render()).includes(translations.translate('es', 'account.voiceMinutes.loading')), true);
  await settle();
  const tree = h.render(), bartree = progress(tree);
  assert.equal(bartree.props['aria-valuenow'], 480); assert.equal(bartree.props['aria-valuemax'], 600); assert.equal(bartree.props['aria-valuemin'], 0);
  assert.equal(bartree.props['aria-valuetext'], 'Te quedan 8 min de 10 min');
  const fill = bartree.children[0];
  assert.equal(fill.props.style.width, '80%'); assert.ok(String(fill.props.className).includes('bg-blue-600'));
  const shown = text(tree);
  assert.ok(shown.includes('Voz con Sofía esta semana') && shown.includes('Te quedan 8 min de 10 min'));
  assert.ok(/lunes/i.test(shown) && shown.includes('23') && shown.includes('noviembre') && shown.includes('00:00'), 'renewal: Monday 23 November, 00:00 (Madrid)');
});

test('7 minutes spent leaves 3: the example of the owner', async () => {
  const h = bar({ answer: ok(week(180)) });
  h.render(); await settle();
  assert.equal(progress(h.render()).props['aria-valuetext'], 'Te quedan 3 min de 10 min');
  assert.equal(progress(h.render()).children[0].props.style.width, '30%');
});

test('the bar turns amber when a quarter or less is left and red with none left, with its own message', async () => {
  const low = bar({ answer: ok(week(150)) }); low.render(); await settle();
  assert.ok(String(progress(low.render()).children[0].props.className).includes('bg-amber-500'));
  const none = bar({ answer: ok(week(0)) }); none.render(); await settle();
  const tree = none.render();
  assert.equal(progress(tree).children[0].props.style.width, '0%'); assert.ok(String(progress(tree).children[0].props.className).includes('bg-red-600'));
  assert.ok(text(tree).includes(translations.translate('es', 'account.voiceMinutes.none')));
  const seconds = bar({ answer: ok(week(45)) }); seconds.render(); await settle();
  assert.equal(progress(seconds.render()).props['aria-valuetext'], 'Te quedan 45 s de 10 min');
});

test('it asks the server with the account’s own session, never caches, and reads nothing but the account’s minutes', async () => {
  const h = bar({ answer: ok(week(600)), token: 'my.own.token' }); h.render(); await settle();
  assert.equal(h.calls.length, 1); assert.equal(h.calls[0].url, '/api/voice/minutes');
  assert.equal(h.calls[0].init.headers.Authorization, 'Bearer my.own.token'); assert.equal(h.calls[0].init.cache, 'no-store');
  assert.equal(h.calls[0].init.method, undefined, 'a plain GET');
});

test('every failure shows a calm message and no bar: no session, provider paused, malformed answers', async () => {
  const cases = [
    { answer: async () => new Response('x', { status: 503 }) }, { answer: async () => new Response('x', { status: 429 }) },
    { answer: async () => { throw Error('offline'); } }, { answer: ok({ remainingSeconds: 'many' }) }, { answer: ok(week(0, 0)) },
    { answer: ok({ ...week(100), remainingSeconds: 700 }) }, { answer: ok({ ...week(100), resetsAt: -1 }) }, { answer: ok(null) }, { answer: ok(week(600)), session: false },
  ];
  for (const options of cases) {
    const h = bar(options); h.render(); await settle();
    const tree = h.render();
    assert.equal(progress(tree), undefined); assert.ok(text(tree).includes(translations.translate('es', 'account.voiceMinutes.error')));
  }
});

test('the bar reads in the seven languages, with the renewal date in the same language', async () => {
  const words = { es: /lunes/i, en: /monday/i, fr: /lundi/i, de: /montag/i, it: /luned/i, pt: /segunda/i, ca: /dilluns/i };
  for (const locale of LOCALES) {
    const h = bar({ locale, answer: ok(week(300)) }); h.render(); await settle();
    const shown = text(h.render());
    assert.equal(shown.includes('account.voiceMinutes'), false, locale + ' has every text');
    assert.ok(shown.includes(translations.translate(locale, 'account.voiceMinutes.title')), locale);
    assert.ok(shown.includes('5 min') && shown.includes('10 min'), locale);
    assert.ok(words[locale].test(shown), locale + ' ' + shown);
  }
});
