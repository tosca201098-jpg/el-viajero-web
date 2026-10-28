import { isLocale } from '@/lib/i18n/translations';
import { admitAiRequest } from '@/lib/ai/admission';

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
    call_limits?: { agent_concurrency_limit?: number; daily_limit?: number; bursting_enabled?: boolean };
    overrides?: { conversation_config_override?: {
      agent?: { language?: boolean; first_message?: boolean; prompt?: { prompt?: boolean; llm?: boolean; tool_ids?: boolean } };
      conversation?: { max_duration_seconds?: boolean };
      tts?: { voice_id?: boolean };
    } };
  };
};
function safeSofiaConfiguration(config: AgentConfig) {
  const c = config.conversation_config;
  const overrides = config.platform_settings?.overrides?.conversation_config_override;
  const tools = c?.agent?.prompt?.tools ?? [];
  return config.platform_settings?.auth?.enable_auth === true &&
    c?.tts?.voice_id === VOICE_ID && c.agent?.language === 'es' &&
    c.conversation?.max_duration_seconds === 300 && c.turn?.silence_end_call_timeout === 90 &&
    c.vad?.background_voice_detection === true &&
    Number(c.agent?.prompt?.max_tokens) > 0 && Number(c.agent?.prompt?.max_tokens) <= 1024 &&
    overrides?.agent?.language === true && overrides.agent.first_message === true &&
    overrides.agent.prompt?.prompt !== true && overrides.agent.prompt?.llm !== true &&
    overrides.tts?.voice_id !== true && overrides.conversation?.max_duration_seconds !== true &&
    overrides.agent.prompt?.tool_ids !== true &&
    config.platform_settings.call_limits?.agent_concurrency_limit === 1 &&
    Number(config.platform_settings.call_limits.daily_limit) > 0 && Number(config.platform_settings.call_limits.daily_limit) <= 3 &&
    config.platform_settings.call_limits.bursting_enabled === false &&
    requiredTools.every(name => tools.some(t => t.name === name && t.type === 'client' && t.expects_response === true));
}
const unavailable = () => Response.json({ error: 'ai_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length')) > 512) return Response.json({ error: 'invalid_request' }, { status: 400 });
    const raw = await request.text();
    if (raw.length > 512) return Response.json({ error: 'invalid_request' }, { status: 400 });
    let input;
    try { input = raw ? JSON.parse(raw) : {}; } catch { return Response.json({ error: 'invalid_request' }, { status: 400 }); }
    if (!input || typeof input !== 'object' || Array.isArray(input) || !isLocale(input.locale ?? 'es')) {
      return Response.json({ error: 'invalid_request' }, { status: 400 });
    }
    const denied = await admitAiRequest(request, 'voice');
    if (denied) return denied;
    const key = process.env.ELEVENLABS_API_KEY;
    const version = process.env.ELEVENLABS_AGENT_VERSION_ID;
    if (process.env.ELEVENLABS_ENABLED !== 'true' || !key || !version || !/^agtvrsn_[a-z0-9]+$/.test(version) ||
      (process.env.VERCEL_ENV === 'production' && process.env.ELEVENLABS_PRODUCTION_APPROVED !== 'true')) return unavailable();
    const headers = { 'xi-api-key': key };
    const signal = AbortSignal.timeout(10000);
    // Verify the immutable version we will request; never run an unreviewed moving HEAD.
    const checkUrl = new URL('https://api.elevenlabs.io/v1/convai/agents/' + AGENT_ID);
    checkUrl.searchParams.set('version_id', version);
    const check = await fetch(checkUrl, { headers, signal, cache: 'no-store' });
    if (!check.ok || !safeSofiaConfiguration(await check.json())) return unavailable();
    const tokenUrl = new URL('https://api.elevenlabs.io/v1/convai/conversation/token');
    tokenUrl.searchParams.set('agent_id', AGENT_ID); tokenUrl.searchParams.set('version_id', version);
    const response = await fetch(tokenUrl, { headers, signal, cache: 'no-store' });
    if (!response.ok) return unavailable();
    const data = await response.json();
    if (typeof data.token !== 'string' || !data.token.trim()) return unavailable();
    // Only the temporary session token goes to the browser; never configuration, API keys or provider errors.
    return Response.json({ token: data.token }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return unavailable(); }
}
