// GET /api/voice/minutes: la barra de «Mi cuenta». Solo lectura: nunca un token y solo los segundos de la propia cuenta.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./sofia-harness.cjs');

const agent = 'agent_2201m677yj19e6499g2649n774f6';
const REF = 'u_' + 'c'.repeat(32);
const preview = { VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'codex/sofia-elevenlabs', VERCEL_GIT_REPO_OWNER: 'tosca201098-jpg', VERCEL_GIT_REPO_SLUG: 'el-viajero-web' };
const production = { VERCEL: '1', VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main', VERCEL_GIT_REPO_OWNER: 'tosca201098-jpg', VERCEL_GIT_REPO_SLUG: 'el-viajero-web' };
const get = () => new Request('https://preview.test/api/voice/minutes', { method: 'GET', headers: { authorization: 'Bearer a.b.c' } });
const row = seconds => ({ conversation_id: 'c', start_time_unix_secs: Math.floor(Date.now() / 1000) - 120, call_duration_secs: seconds, status: 'done' });

function route({ env = {}, deny = null, answer, userRef = REF } = {}) {
  const calls = [], services = [], logs = [];
  const api = loader({
    process: { env: { ...preview, AI_ENABLED: 'true', AI_VOICE_ENABLED: 'true', ELEVENLABS_ENABLED: 'true', ELEVENLABS_API_KEY: 'fake-key', ...env } },
    console: { warn: (...x) => logs.push(x) },
    fetch: async (url, init) => { calls.push({ url: new URL(String(url)), init }); return answer ? answer(new URL(String(url))) : Response.json({ conversations: [row(250)], has_more: false }); },
  }, { '@/lib/ai/admission': { admitAiRequest: async (_, service) => { services.push(service); return deny; }, voiceUserReference: () => userRef } })('app/api/voice/minutes/route.ts');
  return { ...api, calls, services, logs };
}

test('the account gets its own weekly seconds and nothing else: no token, no reference, no whole-site total', async () => {
  const h = route(), response = await h.GET(get());
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.deepEqual(Object.keys(body).sort(), ['limitSeconds', 'remainingSeconds', 'resetsAt', 'usedSeconds']);
  assert.equal(body.limitSeconds, 600); assert.equal(body.usedSeconds, 250); assert.equal(body.remainingSeconds, 350); assert.ok(body.resetsAt > Date.now() / 1000);
  assert.deepEqual(h.services, ['voice_budget']);
  assert.equal(h.calls.length, 1, 'one provider read, never the site-wide list');
  assert.equal(h.calls[0].url.searchParams.get('user_id'), REF); assert.equal(h.calls[0].url.searchParams.get('agent_id'), agent);
  assert.equal(h.calls[0].init.headers['xi-api-key'], 'fake-key');
  assert.equal(JSON.stringify(body).includes(REF), false);
});

test('the setting that changes the minutes per account is followed by the bar', async () => {
  const body = await (await route({ env: { AI_VOICE_USER_WEEK_MINUTES: '20' } }).GET(get())).json();
  assert.equal(body.limitSeconds, 1200); assert.equal(body.remainingSeconds, 950);
});

test('without a reviewed voice target, a key or the flags, nothing is asked: no admission and no provider call', async () => {
  const cases = [{ env: { ...production } }, { env: { VERCEL_GIT_COMMIT_REF: 'other' } }, { env: { ELEVENLABS_ENABLED: 'false' } }, { env: { ELEVENLABS_API_KEY: '' } }];
  for (const options of cases) {
    const h = route(options), response = await h.GET(get());
    assert.equal(response.status, 503, JSON.stringify(options)); assert.deepEqual(await response.json(), { error: 'ai_unavailable' });
    assert.equal(h.calls.length, 0); assert.equal(h.services.length, 0);
  }
});

test('production reads it only once the reviewed target is approved, with the same pinned agent', async () => {
  const env = { ...production, AI_VOICE_PROVIDER: 'elevenlabs', ELEVENLABS_PRODUCTION_APPROVED: 'true' };
  const h = route({ env }), response = await h.GET(get());
  assert.equal(response.status, 200); assert.equal(h.calls[0].url.searchParams.get('agent_id'), agent);
});

test('a guest, an expired session, a flood or a paused AI is answered by the admission and never reaches the provider', async () => {
  for (const status of [401, 429, 503]) {
    const h = route({ deny: Response.json({ error: 'x' }, { status }) }), response = await h.GET(get());
    assert.equal(response.status, status); assert.equal(h.calls.length, 0);
  }
  const none = route({ userRef: '' }), response = await none.GET(get());
  assert.equal(response.status, 503); assert.equal(none.calls.length, 0);
});

test('provider failures give a generic 503 with a constant diagnostic code and no provider data', async () => {
  const cases = [['VOICE_BUDGET_CREDENTIALS', () => new Response('private-detail', { status: 401 })], ['VOICE_BUDGET_HTTP', () => new Response('private-detail', { status: 500 })],
    ['VOICE_BUDGET_MALFORMED', () => Response.json({ private: 'detail' })], ['VOICE_BUDGET_NETWORK', () => { throw Error('private-detail'); }]];
  for (const [code, answer] of cases) {
    const h = route({ answer }), response = await h.GET(get());
    assert.equal(response.status, 503); const text = await response.text();
    assert.deepEqual(JSON.parse(text), { error: 'ai_unavailable' }); assert.equal(text.includes('private'), false);
    assert.deepEqual(h.logs, [['SOFIA_DIAGNOSTIC', code]]);
  }
  const bad = route({ env: { AI_VOICE_USER_WEEK_MINUTES: '999' } });
  assert.equal((await bad.GET(get())).status, 503); assert.equal(bad.calls.length, 0);
  assert.deepEqual(bad.logs, [['SOFIA_DIAGNOSTIC', 'VOICE_BUDGET_CONFIG']]);
});
