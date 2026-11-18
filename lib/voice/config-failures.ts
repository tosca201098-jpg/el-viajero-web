import { validConcurrencyLimit } from '@/lib/voice/limits';

// Diagnostic only. The voice route decides with `safeSofiaConfiguration`; when it refuses an agent, this lists WHICH
// checks failed so the server log can name them. Only these constant names are ever logged: never a value, a message,
// a key or any text of the agent's configuration. Parity with the route's decision is regression-tested.
export const SOFIA_CONFIG_CHECK_NAMES = [
  'agent_or_version_id', 'missing_conversation_config', 'missing_platform_settings',
  'enable_auth', 'queueing', 'voice_id', 'language', 'max_duration_seconds', 'silence_end_call_timeout',
  'background_voice_detection', 'max_tokens', 'override_language', 'override_first_message', 'override_prompt',
  'override_llm', 'override_voice', 'override_max_duration', 'override_tool_ids', 'agent_concurrency_limit',
  'daily_limit', 'bursting', 'tool_buscar_viaje', 'tool_crear_itinerario', 'tool_consultar_catalogo', 'tool_mostrar_destino',
] as const;
export type SofiaConfigCheckName = typeof SOFIA_CONFIG_CHECK_NAMES[number];

const VOICE_ID = 'eZxqQzb5CuYo3Kl6EXfZ';
const REQUIRED_TOOLS = ['buscar_viaje', 'crear_itinerario', 'consultar_catalogo', 'mostrar_destino'] as const;

export function sofiaConfigurationFailures(config: any, preview = false): SofiaConfigCheckName[] {
  try {
    const failed: SofiaConfigCheckName[] = [];
    const c = config?.conversation_config;
    const settings = config?.platform_settings;
    const overrides = settings?.overrides?.conversation_config_override;
    const tools: any[] = Array.isArray(c?.agent?.prompt?.tools) ? c.agent.prompt.tools : [];
    if (!c) failed.push('missing_conversation_config');
    if (!settings) failed.push('missing_platform_settings');
    if (settings?.auth?.enable_auth !== true) failed.push('enable_auth');
    if (settings?.queueing_config?.enabled !== false) failed.push('queueing');
    if (c?.tts?.voice_id !== VOICE_ID) failed.push('voice_id');
    if (c?.agent?.language !== 'es') failed.push('language');
    const seconds = c?.conversation?.max_duration_seconds;
    if (!(seconds === 900 || seconds === 360 || (!preview && seconds === 300))) failed.push('max_duration_seconds');
    if (c?.turn?.silence_end_call_timeout !== 90) failed.push('silence_end_call_timeout');
    if (c?.vad?.background_voice_detection !== true) failed.push('background_voice_detection');
    const maxTokens = Number(c?.agent?.prompt?.max_tokens);
    if (!(maxTokens > 0 && maxTokens <= 1024)) failed.push('max_tokens');
    if (overrides?.agent?.language !== true) failed.push('override_language');
    if (overrides?.agent?.first_message !== true) failed.push('override_first_message');
    if (overrides?.agent?.prompt?.prompt === true) failed.push('override_prompt');
    if (overrides?.agent?.prompt?.llm === true) failed.push('override_llm');
    if (overrides?.tts?.voice_id === true) failed.push('override_voice');
    if (overrides?.conversation?.max_duration_seconds === true) failed.push('override_max_duration');
    if (overrides?.agent?.prompt?.tool_ids === true) failed.push('override_tool_ids');
    const limits = settings?.call_limits;
    if (!validConcurrencyLimit(limits?.agent_concurrency_limit)) failed.push('agent_concurrency_limit');
    const daily = limits?.daily_limit;
    if (!(typeof daily === 'number' && Number.isInteger(daily) && daily >= 1 && daily <= (preview ? 100000 : 15))) failed.push('daily_limit');
    if (limits?.bursting_enabled !== false) failed.push('bursting');
    for (const name of REQUIRED_TOOLS) {
      if (!tools.some(t => t?.name === name && t.type === 'client' && t.expects_response === true)) {
        failed.push(('tool_' + name) as SofiaConfigCheckName);
      }
    }
    return failed;
  } catch { return []; }
}
