const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loader } = require('./sofia-harness.cjs');

const account = '11111111-1111-4111-8111-111111111111';
const project = 'https://fdjexxbncvpzrabtfswa.supabase.co';
const env = {
  VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_REF: 'claude/sofia-minutos-extra',
  VERCEL_GIT_REPO_OWNER: 'tosca201098-jpg', VERCEL_GIT_REPO_SLUG: 'el-viajero-web',
  AI_VOICE_BONUS_PREVIEW: 'true', AI_RATE_LIMIT_SECRET: 'a'.repeat(32),
  NEXT_PUBLIC_SUPABASE_URL: project, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'fake-public-key',
};
const request = new Request('https://preview.example/api/voice/minutes', {
  headers: { authorization: 'Bearer fake-access-token' },
});
const now = Date.parse('2026-11-21T10:00:00Z');
const call = seconds => ({
  start_time_unix_secs: now / 1000 - 100, call_duration_secs: seconds, status: 'done',
});

function harness({ own = [], site = [], authenticated = account, accountRows, status = 200 } = {}) {
  const calls = [];
  const modules = loader({ fetch: async (url, init) => {
    calls.push({ url: new URL(String(url)), init });
    if (String(url).startsWith(project)) {
      return Response.json(accountRows ?? [{ id: account, confirmed: true, extra_seconds_left: 300 }], { status });
    }
    return Response.json({
      conversations: new URL(String(url)).searchParams.has('user_id') ? own : site, has_more: false,
    });
  } }, { '@/lib/ai/admission': { voiceAccountId: () => authenticated } });
  return {
    calls, preview: modules('lib/voice/bonus-preview.ts'), budget: modules('lib/voice/voice-minutes.ts'),
  };
}

test('bonus preview loads the actual grant of the verified account, capped to five minutes', async () => {
  const { calls, preview } = harness({ accountRows: [{ id: account, confirmed: true, extra_seconds_left: 600 }] });
  const data = await preview.readBonusPreview(request, env);
  assert.equal(data.bonusTrialSeconds, 300);
  assert.match(data.userRef, /^u_[0-9a-f]{32}$/);
  assert.deepEqual(JSON.parse(calls[0].init.body), { p_search: account });
  assert.equal(calls[0].url.pathname, '/rest/v1/rpc/destinauta_admin_accounts');
  assert.equal(calls[0].init.headers.authorization, 'Bearer fake-access-token');
  assert.equal(calls[0].init.redirect, 'error');
});

test('production, other branches, and a disabled preview cannot read the grant', async () => {
  const { calls, preview } = harness();
  for (const override of [
    { VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main' },
    { VERCEL_GIT_COMMIT_REF: 'unreviewed' },
    { AI_VOICE_BONUS_PREVIEW: 'false' },
    { VERCEL_GIT_REPO_OWNER: 'otro' },
    { NEXT_PUBLIC_SUPABASE_URL: 'https://other.supabase.co' },
  ]) await assert.rejects(preview.readBonusPreview(request, { ...env, ...override }), /voice_budget/);
  assert.equal(calls.length, 0);
});

test('the preview rejects unverified, mismatched, unconfirmed and unauthorized accounts', async () => {
  for (const override of [
    { authenticated: undefined, accountRows: [] },
    { accountRows: [{ id: 'other', confirmed: true, extra_seconds_left: 300 }] },
    { accountRows: [{ id: account, confirmed: false, extra_seconds_left: 300 }] },
    { status: 403 },
  ]) {
    const { preview } = harness(override);
    await assert.rejects(preview.readBonusPreview(request, env), /voice_budget/);
  }
});

test('five extra minutes allow a short trial call and actual provider seconds lower the balance', async () => {
  for (const used of [0, 42, 300]) {
    const { calls, preview, budget } = harness({ own: [call(used)], site: [call(360 + used)] });
    const trial = await preview.readBonusPreview(request, env);
    const input = { env, agentId: 'agent_test', apiKey: 'fake-key', now, ...trial };
    const summary = await budget.userPeriod(input);
    assert.equal(summary.limitSeconds, 300);
    assert.equal(summary.remainingSeconds, 300 - used);
    const admission = await budget.checkVoiceBudget(input);
    assert.equal(admission.ok, used < 300);
    if (admission.ok) assert.equal(admission.sessionSeconds, 60);
    assert.ok(calls.slice(1).filter(call => call.url.searchParams.has('user_id'))
      .every(call => call.url.searchParams.get('user_id') === trial.userRef));
  }
});

test('bonus does not bypass the weekly site cap or reset at a monthly boundary', async () => {
  const { preview, budget, calls } = harness({ own: [call(80)], site: [call(900)] });
  const trial = await preview.readBonusPreview(request, env);
  const input = { env, agentId: 'agent_test', apiKey: 'fake-key', now, ...trial };
  assert.equal((await budget.checkVoiceBudget(input)).reason, 'site');
  assert.equal((await budget.userPeriod({ ...input, now: Date.parse('2026-12-03T10:00:00Z') })).remainingSeconds, 220);
  const ownCalls = calls.filter(item => item.url.searchParams.has('user_id'));
  assert.equal(ownCalls[0].url.searchParams.get('call_start_after_unix'),
    ownCalls[1].url.searchParams.get('call_start_after_unix'));
});

function endpoints(override = {}, grantStatus = 200) {
  const settings = { ...env, AI_ENABLED: 'true', AI_VOICE_ENABLED: 'true', ELEVENLABS_ENABLED: 'true',
    ELEVENLABS_API_KEY: 'fake-key', ELEVENLABS_AGENT_VERSION_ID: 'agtvrsn_4001m7r0by44etcr1sz2gbvxp993',
    ...override };
  const paths = [];
  let own = [];
  const load = loader({ process: { env: settings }, console: { warn() {} }, fetch: async (url) => {
    const parsed = new URL(String(url));
    paths.push(parsed.pathname);
    if (parsed.origin === project) {
      return Response.json([{ id: account, confirmed: true, extra_seconds_left: 300 }], { status: grantStatus });
    }
    if (parsed.pathname.includes('/agents/')) {
      return Response.json({ agent_id: 'agent_2201m677yj19e6499g2649n774f6', version_id: settings.ELEVENLABS_AGENT_VERSION_ID,
        conversation_config: {
          agent: { language: 'es', prompt: { max_tokens: 1024,
            tools: ['buscar_viaje', 'crear_itinerario', 'consultar_catalogo', 'mostrar_destino']
              .map(name => ({ name, type: 'client', expects_response: true })) } },
          tts: { voice_id: 'eZxqQzb5CuYo3Kl6EXfZ' }, turn: { silence_end_call_timeout: 90 },
          vad: { background_voice_detection: true }, conversation: { max_duration_seconds: 360 },
        },
        platform_settings: { auth: { enable_auth: true }, queueing_config: { enabled: false },
          call_limits: { agent_concurrency_limit: 1, daily_limit: 15, bursting_enabled: false },
          overrides: { conversation_config_override: { agent: { language: true, first_message: true } } },
        },
      });
    }
    if (parsed.pathname.endsWith('/conversations')) {
      return Response.json({ conversations: parsed.searchParams.has('user_id') ? own : [], has_more: false });
    }
    assert.equal(parsed.pathname, '/v1/convai/conversation/token');
    return Response.json({ token: 'fake-conversation-token' });
  } }, { '@/lib/ai/admission': {
    admitAiRequest: async () => null, voiceUserReference: () => 'u_' + 'b'.repeat(32), voiceAccountId: () => account,
  } });
  const post = new Request('https://preview.example/api/voice', {
    method: 'POST', body: JSON.stringify({ locale: 'es' }), headers: request.headers,
  });
  return { get: () => load('app/api/voice/minutes/route.ts').GET(request),
    start: () => load('app/api/voice/route.ts').POST(post), paths,
    report: seconds => { own = [call(seconds)]; },
  };
}

test('the trial routes display the real grant, use a trial voice reference and refresh after a call', async () => {
  const trial = endpoints();
  const before = await (await trial.get()).json();
  assert.equal(before.bonusTrial, true);
  assert.equal(before.remainingSeconds, 300);
  const start = await trial.start();
  assert.equal(start.status, 200);
  const conversation = await start.json();
  assert.equal(conversation.token, 'fake-conversation-token');
  assert.equal(conversation.sessionSeconds, 60);
  assert.notEqual(conversation.userRef, 'u_' + 'b'.repeat(32));
  trial.report(45);
  const after = await (await trial.get()).json();
  assert.equal(after.remainingSeconds, 255);
});

test('the trial routes contact no voice provider when switched off or an operator fails the private check', async () => {
  for (const trial of [endpoints({ AI_VOICE_BONUS_PREVIEW: 'false' }), endpoints({}, 403)]) {
    assert.equal((await trial.get()).status, 503);
    assert.equal((await trial.start()).status, 503);
    assert.ok(trial.paths.every(path => path.startsWith('/rest/v1/rpc/')));
  }
});
