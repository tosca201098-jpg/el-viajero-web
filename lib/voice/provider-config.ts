export const SOFIA_AGENT_ID = 'agent_9701m5zn3h9bf57ata0q3qzn1ag6';
export const SOFIA_PREVIEW_VERSION_ID = 'agtvrsn_3801m618j78bey69jjc08tdm4ppc';

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
    queueing_config?: { enabled?: boolean };
    overrides?: { conversation_config_override?: {
      agent?: { language?: boolean; first_message?: boolean; prompt?: { prompt?: boolean; llm?: boolean; tool_ids?: boolean } };
      conversation?: { max_duration_seconds?: boolean };
      tts?: { voice_id?: boolean };
    } };
  };
};

// Diagnostic snapshot; parity with the existing voice route is regression-tested.
export function safeSofiaConfiguration(config: AgentConfig) {
  const c = config.conversation_config;
  const settings = config.platform_settings;
  const overrides = settings?.overrides?.conversation_config_override;
  const tools = c?.agent?.prompt?.tools ?? [];
  return settings?.auth?.enable_auth === true &&
    c?.tts?.voice_id === 'eZxqQzb5CuYo3Kl6EXfZ' && c.agent?.language === 'es' &&
    c.conversation?.max_duration_seconds === 300 && c.turn?.silence_end_call_timeout === 90 &&
    c.vad?.background_voice_detection === true &&
    Number(c.agent?.prompt?.max_tokens) > 0 && Number(c.agent?.prompt?.max_tokens) <= 1024 &&
    overrides?.agent?.language === true && overrides.agent.first_message === true &&
    overrides.agent.prompt?.prompt !== true && overrides.agent.prompt?.llm !== true &&
    overrides.tts?.voice_id !== true && overrides.conversation?.max_duration_seconds !== true &&
    overrides.agent.prompt?.tool_ids !== true &&
    settings.call_limits?.agent_concurrency_limit === 1 &&
    Number(settings.call_limits.daily_limit) > 0 && Number(settings.call_limits.daily_limit) <= 3 &&
    settings.call_limits.bursting_enabled === false && settings.queueing_config?.enabled === false &&
    ['buscar_viaje', 'crear_itinerario', 'consultar_catalogo', 'mostrar_destino']
      .every(name => tools.some(t => t.name === name && t.type === 'client' && t.expects_response === true));
}
