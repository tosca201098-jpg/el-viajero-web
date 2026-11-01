import { previewDiagnostic, type PreviewDiagnosticCode } from '@/lib/ai/preview-diagnostic';
import { isLocale } from '@/lib/i18n/translations';
import { admitAiRequest, finalizeVoiceAdmission } from '@/lib/ai/admission';
import { sofiaPreviewTarget, sofiaProductionTarget } from '@/lib/voice/preview-target';

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
    c.conversation?.max_duration_seconds === (preview ? 360 : 300) && c.turn?.silence_end_call_timeout === 90 &&
    c.vad?.background_voice_detection === true &&
    Number(c.agent?.prompt?.max_tokens) > 0 && Number(c.agent?.prompt?.max_tokens) <= 1024 &&
    overrides?.agent?.language === true && overrides.agent.first_message === true &&
    overrides.agent.prompt?.prompt !== true && overrides.agent.prompt?.llm !== true &&
    overrides.tts?.voice_id !== true && overrides.conversation?.max_duration_seconds !== true &&
    overrides.agent.prompt?.tool_ids !== true &&
    config.platform_settings.call_limits?.agent_concurrency_limit === 1 &&
    typeof config.platform_settings.call_limits?.daily_limit === 'number' &&
    Number.isInteger(config.platform_settings.call_limits.daily_limit) &&
    config.platform_settings.call_limits.daily_limit >= 1 && config.platform_settings.call_limits.daily_limit <= (preview ? 100000 : 15) &&
    config.platform_settings.call_limits.bursting_enabled === false &&
    requiredTools.every(name => tools.some(t => t.name === name && t.type === 'client' && t.expects_response === true));
}
const unavailable = (code: PreviewDiagnosticCode) => {
  previewDiagnostic(code);
  return Response.json({ error: 'ai_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
};
export async function POST(request: Request) {
  let stage: PreviewDiagnosticCode = 'VOICE_REQUEST';
  let signal: AbortSignal | undefined;
  let tokenStage = false;
  let commitStarted = false;
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
        configuredVersion !== 'agtvrsn_2501m679we79ekz985446fbyygkb') return unavailable('VOICE_VERSION');
    // Check local activation and the immutable pin before consuming admission quota.
    if (target && version !== target.versionId) return unavailable('VOICE_VERSION');
    const denied = await admitAiRequest(request, 'voice');
    if (denied) return denied;
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
    if (target && (config.agent_id !== agentId || config.version_id !== version)) return unavailable('VOICE_CHECK_CONFIG');
    // Preview uses the reviewed 360-second version. The strict Redis global ceiling
    // remains <=20; the provider's shared global daily setting is not a per-user quota.
    if (!safeSofiaConfiguration(config, !!sofiaPreviewTarget(process.env))) return unavailable('VOICE_CHECK_CONFIG');
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
    commitStarted = true;
    if (!await finalizeVoiceAdmission(request, true)) return unavailable('VOICE_REQUEST');
    // Only the temporary session token goes to the browser; never configuration, API keys or provider errors.
    return Response.json({ token: data.token }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return unavailable(signal?.aborted ? (tokenStage ? 'VOICE_TOKEN_TIMEOUT' : 'VOICE_CHECK_TIMEOUT') : stage); }
  finally {
    // Only the server may release a hold before exposing a credential. Never refund
    // after an ambiguous commit, client abort or claimed WebRTC error with a token.
    if (!commitStarted) await finalizeVoiceAdmission(request, false);
  }
}
