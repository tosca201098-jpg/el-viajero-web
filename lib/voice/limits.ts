// Solo para el aviso que ve la persona en pantalla. Los límites reales los aplica el servidor
// (lib/ai/voice-daily-policy.ts y la configuración verificada del agente de Sofía); un test
// comprueba que estos números coinciden con ellos.
export const VOICE_CONVERSATION_MINUTES = 5;
export const VOICE_DAILY_CONVERSATIONS = 3;
export const VOICE_DAILY_MINUTES = VOICE_CONVERSATION_MINUTES * VOICE_DAILY_CONVERSATIONS;
