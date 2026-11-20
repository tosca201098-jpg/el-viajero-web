import { previewDiagnostic, previewDiagnosticDetail, type PreviewDiagnosticCode } from '@/lib/ai/preview-diagnostic';
import { sofiaConfigurationFailures } from '@/lib/voice/config-failures';
import { isLocale } from '@/lib/i18n/translations';
import { admitAiRequest, voiceUserReference } from '@/lib/ai/admission';
import { BudgetError, checkVoiceBudget } from '@/lib/voice/voice-minutes';
import { bonusPreviewEnabled, isBonusPreview, readBonusPreview } from '@/lib/voice/bonus-preview';
import { validConcurrencyLimit } from '@/lib/voice/limits';
import {
  sofiaPreviewTarget, sofiaProductionTarget, SOFIA_PREVIOUS_PREVIEW_VERSION_ID, SOFIA_PREVIOUS_PRODUCTION_VERSION_ID,
} from '@/lib/voice/preview-target';

const AGENT_ID = 'agent_9701m5zn3h9bf57ata0q3qzn1ag6';
const VOICE_ID = 'eZxqQzb5CuYo3Kl6EXfZ';
const requiredTools = ['buscar_viaje', 'crear_itinerario', 'consultar_catalogo', 'mostrar_destino'];
type AgentConfig = {
  conversation_config?: {
    agent?: { language?: string; prompt?: { max_tokens?: number; tools?: { name?: string; type?: string; expects_response?: boolean }[] } };
    tts?: { voice_id?: string };
    turn?: { silence_end_call_timeout?: number };
    vad?: { background_voice_detection?: boolean };
    conversation?: { max_duration_seconds?: number };
  };
  platform_settings?: {
    auth?: { enable_auth?: boolean };
    queueing_config?: { enabled?: boolean };
    call_limits?: { agent_concurrency_limit?: number; daily_limit?: number; bursting_enabled?: boolean };
    overrides?: { conversation_config_override?: {
      agent?: { language?: boolean; first_message?: boolean; prompt?: { prompt?: boolean; llm?: boolean; tool_ids?: boolean } };
      conversation?: { max_duration_seconds?: boolean };
      tts?: { voice_id?: boolean };
    } };
  };
};
function safeSofiaConfiguration(config: AgentConfig, preview = false) {
  const c = config.conversation_config;
  const overrides = config.platform_settings?.overrides?.conversation_config_override;
  const tools = c?.agent?.prompt?.tools ?? [];
  return config.platform_settings?.auth?.enable_auth === true &&
    config.platform_settings?.queueing_config?.enabled === false &&
    c?.tts?.voice_id === VOICE_ID && c.agent?.language === 'es' &&
    // 900 s = the 15-minute conversations of the voice-minutes design; 360 s (and 300 s in Production) are the earlier pins.
    (c.conversation?.max_duration_seconds === 900 || c.conversation?.max_duration_seconds === 360 ||
      (!preview && c.conversation?.max_duration_seconds === 300)) &&
    c.turn?.silence_end_call_timeout === 90 &&
    c.vad?.background_voice_detection === true &&
    Number(c.agent?.prompt?.max_tokens) > 0 && Number(c.agent?.prompt?.max_tokens) <= 1024 &&
    overrides?.agent?.language === true && overrides.agent.first_message === true &&
    overrides.agent.prompt?.prompt !== true && overrides.agent.prompt?.llm !== true &&
    overrides.tts?.voice_id !== true && overrides.conversation?.max_duration_seconds !== true &&
    overrides.agent.prompt?.tool_ids !== true &&
    validConcurrencyLimit(config.platform_settings.call_limits?.agent_concurrency_limit) &&
    typeof config.platform_settings.call_limits?.daily_limit === 'number' &&
    Number.isInteger(config.platform_settings.call_limits.daily_limit) &&
    config.platform_settings.call_limits.daily_limit >= 1 && config.platform_settings.call_limits.daily_limit <= (preview ? 100000 : 15) &&
    config.platform_settings.call_limits.bursting_enabled === false &&
    requiredTools.every(name => tools.some(t => t.name === name && t.type === 'client' && t.expects_response === true));
}
const budgetDenied = (error: 'ai_minutes_limit' | 'ai_site_weekly_limit', resetsAt: number) => {
  previewDiagnostic(error === 'ai_minutes_limit' ? 'VOICE_BUDGET_USER' : 'VOICE_BUDGET_SITE');
  return Response.json({ error, resetsAt }, { status: 429, headers: { 'Cache-Control': 'no-store',
    'Retry-After': String(Math.min(2764800, Math.max(1, resetsAt - Math.floor(Date.now() / 1000)))) } });
};
const unavailable = (code: PreviewDiagnosticCode) => {
  previewDiagnostic(code);
  return Response.json({ error: 'ai_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
};
export async function POST(request: Request) {
  let stage: PreviewDiagnosticCode = 'VOICE_REQUEST';
  let signal: AbortSignal | undefined;
  let tokenStage = false;
  try {
    if (Number(request.headers.get('content-length')) > 512) return Response.json({ error: 'invalid_request' }, { status: 400 });
    const raw = await request.text();
    if (raw.length > 512) return Response.json({ error: 'invalid_request' }, { status: 400 });
    let input;
    try { input = raw ? JSON.parse(raw) : {}; } catch { return Response.json({ error: 'invalid_request' }, { status: 400 }); }
    if (!input || typeof input !== 'object' || Array.isArray(input) || !isLocale(input.locale ?? 'es')) {
      return Response.json({ error: 'invalid_request' }, { status: 400 });
    }
    const key = process.env.ELEVENLABS_API_KEY;
    const configuredVersion = process.env.ELEVENLABS_AGENT_VERSION_ID;
    const previewTarget = sofiaPreviewTarget(process.env);
    const bonusPreview = isBonusPreview(process.env);
    if (bonusPreview && !bonusPreviewEnabled(process.env)) return unavailable('VOICE_FLAGS');
    const target = previewTarget ?? sofiaProductionTarget(process.env);
    // This reviewed Preview upgrade pins its version in code. Accept only its
    // previous pin or the new pin in Preview configuration; Production is unchanged.
    const version = previewTarget?.versionId ?? configuredVersion;
    const agentId = target?.agentId ?? AGENT_ID;
    if (process.env.ELEVENLABS_ENABLED !== 'true' ||
      (process.env.VERCEL_ENV === 'production' && !target)) return unavailable('VOICE_FLAGS');
    if (!key) return unavailable('VOICE_CREDENTIALS');
    if (!version || !configuredVersion || !/^agtvrsn_[a-z0-9]+$/.test(version)) return unavailable('VOICE_VERSION');
    if (previewTarget && configuredVersion !== previewTarget.versionId &&
        configuredVersion !== SOFIA_PREVIOUS_PRODUCTION_VERSION_ID &&
        configuredVersion !== SOFIA_PREVIOUS_PREVIEW_VERSION_ID) return unavailable('VOICE_VERSION');
    // Check local activation and the immutable pin before consuming admission quota.
    if (target && version !== target.versionId) return unavailable('VOICE_VERSION');
    const denied = await admitAiRequest(request, 'voice');
    if (denied) return denied;
    let userRef = voiceUserReference(request);
    if (!userRef) return unavailable('VOICE_REQUEST');
    let bonusTrialSeconds: number | undefined;
    if (bonusPreview) {
      try {
        const trial = await readBonusPreview(request, process.env);
        userRef = trial.userRef;
        bonusTrialSeconds = trial.bonusTrialSeconds;
      } catch { return unavailable('VOICE_BONUS_STORAGE'); }
    }
    const headers = { 'xi-api-key': key };
    signal = AbortSignal.timeout(10000);
    // Verify the immutable version we will request; never run an unreviewed moving HEAD.
    const checkUrl = new URL('https://api.elevenlabs.io/v1/convai/agents/' + agentId);
    checkUrl.searchParams.set('version_id', version);
    stage = 'VOICE_CHECK_NETWORK';
    const check = await fetch(checkUrl, { headers, signal, cache: 'no-store' });
    if (!check.ok) return unavailable(check.status === 401 || check.status === 403 ? 'VOICE_CHECK_CREDENTIALS' : 'VOICE_CHECK_HTTP');
    stage = 'VOICE_CHECK_MALFORMED';
    const config = await check.json();
    if (!config || typeof config !== 'object' || Array.isArray(config)) return unavailable('VOICE_CHECK_MALFORMED');
    if (target && (config.agent_id !== agentId || config.version_id !== version)) {
      const refused = unavailable('VOICE_CHECK_CONFIG'); previewDiagnosticDetail(['agent_or_version_id']); return refused;
    }
    // The allowance is decided below (voice minutes); the provider's own daily setting is only a last backstop.
    if (!safeSofiaConfiguration(config, !!previewTarget && !bonusPreview)) {
      // The log names which checks failed (constants only), so a refused agent can be fixed without guessing.
      const refused = unavailable('VOICE_CHECK_CONFIG');
      previewDiagnosticDetail(sofiaConfigurationFailures(config, !!previewTarget && !bonusPreview));
      return refused;
    }
    // Voice minutes: the real conversation time of this account (this Madrid period) and of the whole site (this Madrid
    // week). Several conversations may run at once, so each one still running reserves the agent's whole verified
    // maximum length (already checked above to be 300, 360 or 900 seconds): nobody is granted minutes that another
    // running conversation may still use.
    let budget;
    try {
      budget = await checkVoiceBudget({ env: process.env, apiKey: key, agentId, userRef, now: Date.now(), bonusTrialSeconds,
        liveReserveSeconds: config.conversation_config.conversation.max_duration_seconds });
    } catch (error) { return unavailable(error instanceof BudgetError ? error.code : 'VOICE_BUDGET_MALFORMED'); }
    if (!budget.ok) return budgetDenied(budget.reason === 'user' ? 'ai_minutes_limit' : 'ai_site_weekly_limit', budget.resetsAt);
    signal = AbortSignal.timeout(10000); // the reading above may have taken a while: the token request gets its own time
    const tokenUrl = new URL('https://api.elevenlabs.io/v1/convai/conversation/token');
    tokenUrl.searchParams.set('agent_id', agentId); tokenUrl.searchParams.set('version_id', version);
    tokenStage = true;
    stage = 'VOICE_TOKEN_NETWORK';
    const response = await fetch(tokenUrl, { headers, signal, cache: 'no-store' });
    if (!response.ok) return unavailable(response.status === 401 || response.status === 403 ? 'VOICE_TOKEN_CREDENTIALS' : 'VOICE_TOKEN_HTTP');
    stage = 'VOICE_TOKEN_MALFORMED';
    const data = await response.json();
    if (!data || typeof data.token !== 'string' || !data.token.trim()) return unavailable('VOICE_TOKEN_MALFORMED');
    if (request.signal.aborted) return unavailable('VOICE_REQUEST');
    // The temporary session token goes to the browser with the anonymous account reference (it is what ElevenLabs
    // stores as `user_id`, so the minutes can be added up) and the seconds this conversation may last. Never
    // configuration, API keys or provider errors.
    return Response.json({ token: data.token, userRef, sessionSeconds: budget.sessionSeconds, remainingSeconds: budget.remainingSeconds,
      limitSeconds: budget.limitSeconds, period: budget.period, resetsAt: budget.resetsAt }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return unavailable(signal?.aborted ? (tokenStage ? 'VOICE_TOKEN_TIMEOUT' : 'VOICE_CHECK_TIMEOUT') : stage); }
}
