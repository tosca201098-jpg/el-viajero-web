const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./sofia-harness.cjs');

// Monday 16 Nov 2026 12:00 in Madrid (11:00 UTC). The Madrid week started on Monday 16 Nov 00:00 (Sunday 23:00 UTC).
const NOW = Date.parse('2026-11-16T11:00:00Z');
const WEEK_START = Date.parse('2026-11-15T23:00:00Z') / 1000;
const WEEK_END = Date.parse('2026-11-22T23:00:00Z') / 1000;
const NOW_S = NOW / 1000;
const USER = 'u_' + 'a'.repeat(32);
const done = (seconds, extra = {}) => ({ conversation_id: 'conv_x', start_time_unix_secs: WEEK_START + 3600, call_duration_secs: seconds, status: 'done', ...extra });
const page = (conversations, more = {}) => Response.json({ conversations, has_more: false, ...more });

function weekly(fetcher, globals = {}) {
  const requests = [];
  const api = loader({ fetch: async (url, init) => { requests.push({ url: new URL(String(url)), init }); return fetcher(new URL(String(url)), init, requests.length); }, ...globals })('lib/voice/weekly-minutes.ts');
  return { ...api, requests };
}
const input = (env = {}) => ({ env, apiKey: 'fake-key', agentId: 'agent_test', userRef: USER, now: NOW });
// One answer per kind of list: the account's own (it carries user_id) and the whole agent.
const store = (own, all) => (url) => page(url.searchParams.has('user_id') ? own : all);

test('the Madrid week runs Monday 00:00 to Monday 00:00 and the weekly budget asks ElevenLabs about exactly that week', async () => {
  const w = weekly(store([done(0)], [done(0)]));
  await w.checkWeeklyBudget(input());
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

test('defaults are 10 minutes per account and 15 for the site; a fresh account gets a full 10 minutes', async () => {
  const w = weekly(store([], []));
  assert.deepEqual({ ...w.weeklyLimits({}) }, { userSeconds: 600, siteSeconds: 900 });
  assert.deepEqual({ ...await w.checkWeeklyBudget(input()) }, { ok: true, sessionSeconds: 600, weekSeconds: 600, limitSeconds: 600, resetsAt: WEEK_END });
});

test('talk 7 minutes and 3 are left this week, for this conversation and for the week', async () => {
  const w = weekly(store([done(300), done(120)], [done(300), done(120)]));
  const result = await w.checkWeeklyBudget(input({ AI_VOICE_GLOBAL_WEEK_MINUTES: '100' }));
  assert.equal(result.ok, true); assert.equal(result.weekSeconds, 180); assert.equal(result.sessionSeconds, 180);
});

test('a conversation never lasts more than 15 minutes even with more minutes left', async () => {
  const w = weekly(store([], []));
  const result = await w.checkWeeklyBudget(input({ AI_VOICE_USER_WEEK_MINUTES: '60', AI_VOICE_GLOBAL_WEEK_MINUTES: '100' }));
  assert.equal(result.sessionSeconds, 900); assert.equal(result.weekSeconds, 3600);
});

test('the whole-site weekly budget also limits the conversation, and denies everyone once it is spent', async () => {
  const limited = weekly(store([], [done(600), done(150)]));
  assert.equal((await limited.checkWeeklyBudget(input())).sessionSeconds, 150);
  const spent = weekly(store([], [done(600), done(300)]));
  assert.deepEqual({ ...await spent.checkWeeklyBudget(input()) }, { ok: false, reason: 'site', resetsAt: WEEK_END });
});

test('an account that has used its minutes is denied until Monday, with the exact renewal instant', async () => {
  for (const used of [600, 575]) {
    const w = weekly(store([done(used)], [done(used)]));
    assert.deepEqual({ ...await w.checkWeeklyBudget(input({ AI_VOICE_GLOBAL_WEEK_MINUTES: '100' })) }, { ok: false, reason: 'user', resetsAt: WEEK_END });
  }
  // 30 seconds is still useful; 29 is not.
  const edge = await weekly(store([done(570)], [])).checkWeeklyBudget(input());
  assert.equal(edge.ok, true); assert.equal(edge.sessionSeconds, 30);
});

test('a conversation still in progress counts the time it has lasted, capped at the 15-minute maximum', async () => {
  const live = (secondsAgo, extra = {}) => ({ conversation_id: 'c', start_time_unix_secs: NOW_S - secondsAgo, call_duration_secs: 0, status: 'in-progress', ...extra });
  assert.equal((await weekly(store([live(100)], [live(100)])).checkWeeklyBudget(input())).weekSeconds, 500);
  assert.equal((await weekly(store([live(990)], [live(990)])).checkWeeklyBudget(input({ AI_VOICE_USER_WEEK_MINUTES: '60', AI_VOICE_GLOBAL_WEEK_MINUTES: '100' }))).weekSeconds, 3600 - 900);
  // A row stuck "in progress" long after any conversation could have ended counts only what it reports.
  assert.equal((await weekly(store([live(5000, { call_duration_secs: 200 })], [])).checkWeeklyBudget(input())).weekSeconds, 400);
});

test('rows of another person are never added to this account, and missing durations count as zero', async () => {
  const w = weekly(store([done(300, { user_id: 'u_' + 'b'.repeat(32) }), done(60, { user_id: USER }), { conversation_id: 'c', start_time_unix_secs: WEEK_START + 5 }], []));
  assert.equal((await w.checkWeeklyBudget(input())).weekSeconds, 540);
});

test('long lists are read page by page; too many conversations count as a spent budget', async () => {
  const pages = { '': page([done(100)], { has_more: true, next_cursor: 'c1' }), c1: page([done(100)], { has_more: true, next_cursor: 'c2' }), c2: page([done(100)]) };
  const w = weekly(url => url.searchParams.has('user_id') ? pages[url.searchParams.get('cursor') ?? ''] : page([]));
  assert.equal((await w.checkWeeklyBudget(input())).weekSeconds, 300);
  const endless = weekly(url => page([done(1)], { has_more: true, next_cursor: 'again' + url.searchParams.get('cursor') }));
  const result = await endless.checkWeeklyBudget(input());
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
    const w = weekly(answer);
    await assert.rejects(w.checkWeeklyBudget(input()), error => {
      assert.equal(error.code, code); assert.equal(error.message, 'voice_budget'); assert.equal(JSON.stringify(error).includes('private'), false); return true;
    });
  }
  const aborted = { timeout: () => ({ aborted: true }) };
  await assert.rejects(weekly(() => { throw Error('timeout'); }, { AbortSignal: aborted }).checkWeeklyBudget(input()), error => error.code === 'VOICE_BUDGET_TIMEOUT');
});

test('settings may change the minutes only inside fixed ceilings, and anything invalid fails closed', async () => {
  const w = weekly(store([], []));
  assert.deepEqual({ ...w.weeklyLimits({ AI_VOICE_USER_WEEK_MINUTES: '20', AI_VOICE_GLOBAL_WEEK_MINUTES: '120' }) }, { userSeconds: 1200, siteSeconds: 7200 });
  for (const change of [{ AI_VOICE_USER_WEEK_MINUTES: '61' }, { AI_VOICE_USER_WEEK_MINUTES: '0' }, { AI_VOICE_USER_WEEK_MINUTES: '-1' },
    { AI_VOICE_USER_WEEK_MINUTES: 'abc' }, { AI_VOICE_USER_WEEK_MINUTES: '' }, { AI_VOICE_GLOBAL_WEEK_MINUTES: '1001' }, { AI_VOICE_GLOBAL_WEEK_MINUTES: '1.5' }]) {
    assert.throws(() => w.weeklyLimits(change), error => error.code === 'VOICE_BUDGET_CONFIG', JSON.stringify(change));
    await assert.rejects(w.checkWeeklyBudget(input(change)), error => error.code === 'VOICE_BUDGET_CONFIG');
    assert.equal(w.requests.length, 0, 'an invalid setting never reaches the provider');
  }
});

test('the status bar reads only the account’s own week and never the site-wide list', async () => {
  const w = weekly(store([done(250)], [done(250), done(900)]));
  assert.deepEqual({ ...await w.userWeek(input()) }, { limitSeconds: 600, usedSeconds: 250, remainingSeconds: 350, resetsAt: WEEK_END });
  assert.equal(w.requests.length, 1); assert.equal(w.requests[0].url.searchParams.get('user_id'), USER);
  const spent = weekly(store([done(900)], []));
  assert.deepEqual({ ...await spent.userWeek(input()) }, { limitSeconds: 600, usedSeconds: 600, remainingSeconds: 0, resetsAt: WEEK_END });
  const endless = weekly(() => page([done(1)], { has_more: true, next_cursor: 'x' }));
  assert.equal((await endless.userWeek(input())).remainingSeconds, 0);
});

test('on Monday 00:00 in Madrid the account gets a new week with all its minutes again', async () => {
  // Sunday 22:59 UTC is still Sunday night in Madrid; one minute later it is Monday 00:00 and the week has changed.
  const before = weekly(store([done(600)], []));
  const asked = async (w, now) => { await w.userWeek({ ...input(), now }); return Number(w.requests.at(-1).url.searchParams.get('call_start_after_unix')); };
  const sunday = await asked(before, Date.parse('2026-11-22T22:59:00Z'));
  const monday = await asked(before, Date.parse('2026-11-22T23:00:00Z'));
  assert.equal(sunday, WEEK_START); assert.equal(monday, WEEK_END);
});
