const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./sofia-harness.cjs');

// Monday 16 Nov 2026 12:00 in Madrid (11:00 UTC). The Madrid week started on Monday 16 Nov 00:00 (Sunday 23:00 UTC).
const NOW = Date.parse('2026-11-16T11:00:00Z');
const WEEK_START = Date.parse('2026-11-15T23:00:00Z') / 1000;
const WEEK_END = Date.parse('2026-11-22T23:00:00Z') / 1000;
const NOW_S = NOW / 1000;
// The natural Madrid month of November 2026 runs 1 Nov 00:00 to 1 Dec 00:00 (CET, UTC+1).
const MONTH_START = Date.parse('2026-10-31T23:00:00Z') / 1000;
const MONTH_END = Date.parse('2026-11-30T23:00:00Z') / 1000;
// Most tests below use a 10-minute WEEKLY allowance so the arithmetic stays small; the defaults have their own tests.
const WEEKLY = { AI_VOICE_PERIOD: 'week', AI_VOICE_USER_MINUTES: '10' };
const USER = 'u_' + 'a'.repeat(32);
const done = (seconds, extra = {}) => ({ conversation_id: 'conv_x', start_time_unix_secs: WEEK_START + 3600, call_duration_secs: seconds, status: 'done', ...extra });
const page = (conversations, more = {}) => Response.json({ conversations, has_more: false, ...more });

function voiceMinutes(fetcher, globals = {}) {
  const requests = [];
  const api = loader({ fetch: async (url, init) => { requests.push({ url: new URL(String(url)), init }); return fetcher(new URL(String(url)), init, requests.length); }, ...globals })('lib/voice/voice-minutes.ts');
  return { ...api, requests };
}
const input = (env = {}) => ({ env: { ...WEEKLY, ...env }, apiKey: 'fake-key', agentId: 'agent_test', userRef: USER, now: NOW });
const raw = (env = {}, now = NOW) => ({ env, apiKey: 'fake-key', agentId: 'agent_test', userRef: USER, now });
// One answer per kind of list: the account's own (it carries user_id) and the whole agent.
const store = (own, all) => (url) => page(url.searchParams.has('user_id') ? own : all);

test('with a weekly period the Madrid week runs Monday 00:00 to Monday 00:00 and both lists ask ElevenLabs about exactly that week', async () => {
  const w = voiceMinutes(store([done(0)], [done(0)]));
  await w.checkVoiceBudget(input());
  assert.equal(w.requests.length, 2);
  for (const { url, init } of w.requests) {
    assert.equal(url.origin + url.pathname, 'https://api.elevenlabs.io/v1/convai/conversations');
    assert.equal(url.searchParams.get('agent_id'), 'agent_test');
    assert.equal(url.searchParams.get('call_start_after_unix'), String(WEEK_START));
    assert.equal(url.searchParams.get('page_size'), '100');
    assert.equal(init.headers['xi-api-key'], 'fake-key'); assert.equal(init.cache, 'no-store');
  }
  assert.deepEqual(w.requests.map(r => r.url.searchParams.get('user_id')).sort(), [USER, null].sort());
});

test('with a weekly allowance a fresh account gets all its minutes and the answer says which period it is', async () => {
  const w = voiceMinutes(store([], []));
  assert.deepEqual({ ...await w.checkVoiceBudget(input()) },
    { ok: true, sessionSeconds: 600, remainingSeconds: 600, limitSeconds: 600, period: 'week', resetsAt: WEEK_END });
});

test('talk 7 minutes and 3 are left in the period, for this conversation and for the balance', async () => {
  const w = voiceMinutes(store([done(300), done(120)], [done(300), done(120)]));
  const result = await w.checkVoiceBudget(input({ AI_VOICE_GLOBAL_WEEK_MINUTES: '100' }));
  assert.equal(result.ok, true); assert.equal(result.remainingSeconds, 180); assert.equal(result.sessionSeconds, 180);
});

test('a conversation never lasts more than 15 minutes even with more minutes left', async () => {
  const w = voiceMinutes(store([], []));
  const result = await w.checkVoiceBudget(input({ AI_VOICE_USER_MINUTES: '60', AI_VOICE_GLOBAL_WEEK_MINUTES: '100' }));
  assert.equal(result.sessionSeconds, 900); assert.equal(result.remainingSeconds, 3600);
});

test('the whole-site weekly budget also limits the conversation, and denies everyone once it is spent', async () => {
  const limited = voiceMinutes(store([], [done(600), done(150)]));
  assert.equal((await limited.checkVoiceBudget(input())).sessionSeconds, 150);
  const spent = voiceMinutes(store([], [done(600), done(300)]));
  assert.deepEqual({ ...await spent.checkVoiceBudget(input()) }, { ok: false, reason: 'site', resetsAt: WEEK_END });
});

test('an account that has used its minutes is denied until the period renews, with the exact renewal instant', async () => {
  for (const used of [600, 575]) {
    const w = voiceMinutes(store([done(used)], [done(used)]));
    assert.deepEqual({ ...await w.checkVoiceBudget(input({ AI_VOICE_GLOBAL_WEEK_MINUTES: '100' })) }, { ok: false, reason: 'user', resetsAt: WEEK_END });
  }
  // 30 seconds is still useful; 29 is not.
  const edge = await voiceMinutes(store([done(570)], [])).checkVoiceBudget(input());
  assert.equal(edge.ok, true); assert.equal(edge.sessionSeconds, 30);
});

test('a conversation still in progress counts the time it has lasted, capped at the 15-minute maximum', async () => {
  const live = (secondsAgo, extra = {}) => ({ conversation_id: 'c', start_time_unix_secs: NOW_S - secondsAgo, call_duration_secs: 0, status: 'in-progress', ...extra });
  assert.equal((await voiceMinutes(store([live(100)], [live(100)])).checkVoiceBudget(input())).remainingSeconds, 500);
  assert.equal((await voiceMinutes(store([live(990)], [live(990)])).checkVoiceBudget(input({ AI_VOICE_USER_MINUTES: '60', AI_VOICE_GLOBAL_WEEK_MINUTES: '100' }))).remainingSeconds, 3600 - 900);
  // A row stuck "in progress" long after any conversation could have ended counts only what it reports.
  assert.equal((await voiceMinutes(store([live(5000, { call_duration_secs: 200 })], [])).checkVoiceBudget(input())).remainingSeconds, 400);
});

test('rows of another person are never added to this account, and missing durations count as zero', async () => {
  const w = voiceMinutes(store([done(300, { user_id: 'u_' + 'b'.repeat(32) }), done(60, { user_id: USER }), { conversation_id: 'c', start_time_unix_secs: WEEK_START + 5 }], []));
  assert.equal((await w.checkVoiceBudget(input())).remainingSeconds, 540);
});

test('long lists are read page by page; too many conversations count as a spent budget', async () => {
  const pages = { '': page([done(100)], { has_more: true, next_cursor: 'c1' }), c1: page([done(100)], { has_more: true, next_cursor: 'c2' }), c2: page([done(100)]) };
  const w = voiceMinutes(url => url.searchParams.has('user_id') ? pages[url.searchParams.get('cursor') ?? ''] : page([]));
  assert.equal((await w.checkVoiceBudget(input())).remainingSeconds, 300);
  const endless = voiceMinutes(url => page([done(1)], { has_more: true, next_cursor: 'again' + url.searchParams.get('cursor') }));
  const result = await endless.checkVoiceBudget(input());
  assert.equal(result.ok, false); assert.equal(result.reason, 'user');
  assert.equal(endless.requests.filter(r => r.url.searchParams.has('user_id')).length, 5, 'the list is capped at five pages');
});

test('every provider problem fails closed with a constant diagnostic code and no provider detail', async () => {
  const cases = [
    ['VOICE_BUDGET_CREDENTIALS', () => new Response('private-key-detail', { status: 401 })],
    ['VOICE_BUDGET_CREDENTIALS', () => new Response('private-key-detail', { status: 403 })],
    ['VOICE_BUDGET_HTTP', () => new Response('private-provider-detail', { status: 500 })],
    ['VOICE_BUDGET_HTTP', () => new Response('private-provider-detail', { status: 429 })],
    ['VOICE_BUDGET_MALFORMED', () => new Response('not json')],
    ['VOICE_BUDGET_MALFORMED', () => Response.json({ conversations: 'x' })],
    ['VOICE_BUDGET_MALFORMED', () => Response.json({ has_more: false })],
    ['VOICE_BUDGET_MALFORMED', () => page([null])],
    ['VOICE_BUDGET_MALFORMED', () => page([done(-1)])],
    ['VOICE_BUDGET_MALFORMED', () => page([done(1.5)])],
    ['VOICE_BUDGET_MALFORMED', () => page([done(10 ** 9)])],
    ['VOICE_BUDGET_MALFORMED', () => page([{ call_duration_secs: 5 }])],
    ['VOICE_BUDGET_MALFORMED', () => page([done(5)], { has_more: true })],
    ['VOICE_BUDGET_NETWORK', () => { throw Error('private-network-detail'); }],
  ];
  for (const [code, answer] of cases) {
    const w = voiceMinutes(answer);
    await assert.rejects(w.checkVoiceBudget(input()), error => {
      assert.equal(error.code, code); assert.equal(error.message, 'voice_budget'); assert.equal(JSON.stringify(error).includes('private'), false); return true;
    });
  }
  const aborted = { timeout: () => ({ aborted: true }) };
  await assert.rejects(voiceMinutes(() => { throw Error('timeout'); }, { AbortSignal: aborted }).checkVoiceBudget(input()), error => error.code === 'VOICE_BUDGET_TIMEOUT');
});

test('settings may change the minutes only inside fixed ceilings, and anything invalid fails closed', async () => {
  const w = voiceMinutes(store([], []));
  assert.deepEqual({ ...w.voiceLimits({ AI_VOICE_USER_MINUTES: '20', AI_VOICE_GLOBAL_WEEK_MINUTES: '120' }) }, { period: 'month', userSeconds: 1200, siteSeconds: 7200 });
  for (const change of [{ AI_VOICE_USER_MINUTES: '301' }, { AI_VOICE_USER_MINUTES: '0' }, { AI_VOICE_USER_MINUTES: '-1' },
    { AI_VOICE_USER_MINUTES: 'abc' }, { AI_VOICE_USER_MINUTES: '' }, { AI_VOICE_GLOBAL_WEEK_MINUTES: '1001' }, { AI_VOICE_GLOBAL_WEEK_MINUTES: '1.5' }]) {
    assert.throws(() => w.voiceLimits(change), error => error.code === 'VOICE_BUDGET_CONFIG', JSON.stringify(change));
    await assert.rejects(w.checkVoiceBudget(input(change)), error => error.code === 'VOICE_BUDGET_CONFIG');
    assert.equal(w.requests.length, 0, 'an invalid setting never reaches the provider');
  }
});

test('the status bar reads only the account’s own period and never the site-wide list', async () => {
  const w = voiceMinutes(store([done(250)], [done(250), done(900)]));
  assert.deepEqual({ ...await w.userPeriod(input()) }, { period: 'week', limitSeconds: 600, usedSeconds: 250, remainingSeconds: 350, resetsAt: WEEK_END });
  assert.equal(w.requests.length, 1); assert.equal(w.requests[0].url.searchParams.get('user_id'), USER);
  const spent = voiceMinutes(store([done(900)], []));
  assert.deepEqual({ ...await spent.userPeriod(input()) }, { period: 'week', limitSeconds: 600, usedSeconds: 600, remainingSeconds: 0, resetsAt: WEEK_END });
  const endless = voiceMinutes(() => page([done(1)], { has_more: true, next_cursor: 'x' }));
  assert.equal((await endless.userPeriod(input())).remainingSeconds, 0);
});

test('with a weekly period, on Monday 00:00 in Madrid the account gets all its minutes again', async () => {
  // Sunday 22:59 UTC is still Sunday night in Madrid; one minute later it is Monday 00:00 and the week has changed.
  const before = voiceMinutes(store([done(600)], []));
  const asked = async (w, now) => { await w.userPeriod({ ...input(), now }); return Number(w.requests.at(-1).url.searchParams.get('call_start_after_unix')); };
  const sunday = await asked(before, Date.parse('2026-11-22T22:59:00Z'));
  const monday = await asked(before, Date.parse('2026-11-22T23:00:00Z'));
  assert.equal(sunday, WEEK_START); assert.equal(monday, WEEK_END);
});

test('defaults: 20 minutes per account for the calendar month and 15 minutes per week for the whole site', () => {
  const w = voiceMinutes(store([], []));
  assert.deepEqual({ ...w.voiceLimits({}) }, { period: 'month', userSeconds: 1200, siteSeconds: 900 });
});

test('by default the account is counted over the Madrid month and the site over the Madrid week', async () => {
  const w = voiceMinutes(store([done(0)], [done(0)]));
  await w.checkVoiceBudget(raw());
  const since = Object.fromEntries(w.requests.map(r => [r.url.searchParams.has('user_id') ? 'account' : 'site', r.url.searchParams.get('call_start_after_unix')]));
  assert.deepEqual(since, { account: String(MONTH_START), site: String(WEEK_START) });
});

test('the 20 minutes are one free balance: talk 9 minutes once and 11 are left for the rest of the month', async () => {
  const fresh = await voiceMinutes(store([], [])).checkVoiceBudget(raw({ AI_VOICE_GLOBAL_WEEK_MINUTES: '100' }));
  assert.deepEqual({ ...fresh }, { ok: true, sessionSeconds: 900, remainingSeconds: 1200, limitSeconds: 1200, period: 'month', resetsAt: MONTH_END });
  const later = await voiceMinutes(store([done(540)], [done(540)])).checkVoiceBudget(raw({ AI_VOICE_GLOBAL_WEEK_MINUTES: '100' }));
  assert.deepEqual({ ...later }, { ok: true, sessionSeconds: 660, remainingSeconds: 660, limitSeconds: 1200, period: 'month', resetsAt: MONTH_END });
  // Many short conversations add up exactly like one long one.
  const many = await voiceMinutes(store([done(100), done(200), done(240)], [])).checkVoiceBudget(raw({ AI_VOICE_GLOBAL_WEEK_MINUTES: '100' }));
  assert.equal(many.remainingSeconds, 660);
});

test('an account with no minutes left is denied until the 1st at Madrid midnight, while a full site is denied until Monday', async () => {
  const spent = await voiceMinutes(store([done(900), done(300)], [])).checkVoiceBudget(raw({ AI_VOICE_GLOBAL_WEEK_MINUTES: '100' }));
  assert.deepEqual({ ...spent }, { ok: false, reason: 'user', resetsAt: MONTH_END });
  const full = await voiceMinutes(store([], [done(900)])).checkVoiceBudget(raw());
  assert.deepEqual({ ...full }, { ok: false, reason: 'site', resetsAt: WEEK_END });
});

test('the account bar shows the month: minutes used earlier in the month still count, and nothing from the site total', async () => {
  const w = voiceMinutes(store([done(540)], [done(540), done(900)]));
  assert.deepEqual({ ...await w.userPeriod(raw()) }, { period: 'month', limitSeconds: 1200, usedSeconds: 540, remainingSeconds: 660, resetsAt: MONTH_END });
  assert.equal(w.requests.length, 1); assert.equal(w.requests[0].url.searchParams.get('call_start_after_unix'), String(MONTH_START));
});

test('a fortnight is a 14-day block counted from Monday 16 Nov 2026 at Madrid midnight', async () => {
  const w = voiceMinutes(store([done(0)], [done(0)]));
  const asked = async now => { await w.userPeriod(raw({ AI_VOICE_PERIOD: 'fortnight' }, now)); return Number(w.requests.at(-1).url.searchParams.get('call_start_after_unix')); };
  const first = Date.parse('2026-11-15T23:00:00Z') / 1000;   // Mon 16 Nov 00:00 Madrid
  const second = Date.parse('2026-11-29T23:00:00Z') / 1000;  // Mon 30 Nov 00:00 Madrid
  assert.equal(await asked(NOW), first);
  assert.equal(await asked(Date.parse('2026-11-29T22:59:00Z')), first);
  assert.equal(await asked(Date.parse('2026-11-29T23:00:00Z')), second);
  assert.equal((await w.userPeriod(raw({ AI_VOICE_PERIOD: 'fortnight' }))).resetsAt, second);
});

test('the period setting accepts only week, fortnight or month; anything else fails closed before reaching the provider', async () => {
  const w = voiceMinutes(store([], []));
  for (const period of ['week', 'fortnight', 'month']) assert.equal(w.voiceLimits({ AI_VOICE_PERIOD: period }).period, period);
  for (const period of ['day', '', 'Month', 'months', ' month', '30']) {
    assert.throws(() => w.voiceLimits({ AI_VOICE_PERIOD: period }), error => error.code === 'VOICE_BUDGET_CONFIG', period);
    await assert.rejects(w.checkVoiceBudget(raw({ AI_VOICE_PERIOD: period })), error => error.code === 'VOICE_BUDGET_CONFIG');
    await assert.rejects(w.userPeriod(raw({ AI_VOICE_PERIOD: period })), error => error.code === 'VOICE_BUDGET_CONFIG');
  }
  assert.equal(w.requests.length, 0);
});

test('the account allowance may go up to 300 minutes and no further', () => {
  const w = voiceMinutes(store([], []));
  assert.equal(w.voiceLimits({ AI_VOICE_USER_MINUTES: '300' }).userSeconds, 18000);
  assert.throws(() => w.voiceLimits({ AI_VOICE_USER_MINUTES: '301' }), error => error.code === 'VOICE_BUDGET_CONFIG');
});

test('the month changes at Madrid midnight, also across daylight-saving changes', async () => {
  const w = voiceMinutes(store([done(0)], [done(0)]));
  const bounds = async now => { const r = await w.userPeriod(raw({}, now)); return [Number(w.requests.at(-1).url.searchParams.get('call_start_after_unix')), r.resetsAt]; };
  const z = text => Date.parse(text) / 1000;
  assert.deepEqual(await bounds(Date.parse('2026-11-30T22:59:00Z')), [MONTH_START, MONTH_END]);
  assert.deepEqual(await bounds(Date.parse('2026-11-30T23:00:00Z')), [MONTH_END, z('2026-12-31T23:00:00Z')]);
  // March 2027 is short of one hour at its end (summer time starts on the 28th); October 2027 has one extra hour.
  assert.deepEqual(await bounds(Date.parse('2027-03-15T12:00:00Z')), [z('2027-02-28T23:00:00Z'), z('2027-03-31T22:00:00Z')]);
  assert.deepEqual(await bounds(Date.parse('2027-10-15T12:00:00Z')), [z('2027-09-30T22:00:00Z'), z('2027-10-31T23:00:00Z')]);
  // December into January crosses the year, and February 2028 is a leap month.
  assert.deepEqual(await bounds(Date.parse('2026-12-20T12:00:00Z')), [z('2026-11-30T23:00:00Z'), z('2026-12-31T23:00:00Z')]);
  assert.deepEqual(await bounds(Date.parse('2028-02-10T12:00:00Z')), [z('2028-01-31T23:00:00Z'), z('2028-02-29T23:00:00Z')]);
});
