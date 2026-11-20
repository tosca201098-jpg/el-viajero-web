import { isVoiceProductionScope } from './provider-selection';

// Reviewed immutable target. Production requires a separate explicit approval.
export const SOFIA_PREVIEW_AGENT_ID = 'agent_2201m677yj19e6499g2649n774f6';
// Sofía agente de viajes (rama `sofia-agente-viajes` del agente de ElevenLabs): prompt actualizado, herramienta
// `descubrir_destinos`, fecha de hoy y protecciones «Focus» y «Prompt Injection», más los siete idiomas con su saludo
// (versión publicada el 18-11-2026 a las 19:58, «Añadir soporte multilingüe…»). Production la usa solo cuando
// `ELEVENLABS_PRODUCTION_APPROVED` es `true` y `ELEVENLABS_AGENT_VERSION_ID` coincide exactamente con este valor.
export const SOFIA_PRODUCTION_VERSION_ID = 'agtvrsn_4001m7r0by44etcr1sz2gbvxp993';
// La Preview de `codex/sofia-elevenlabs` prueba la misma versión que se fijaría en Production.
export const SOFIA_PREVIEW_VERSION_ID = SOFIA_PRODUCTION_VERSION_ID;
// Pins anteriores: ya no se consultan ni se emiten; Preview solo los admite como valor de la variable de entorno.
export const SOFIA_PREVIOUS_PRODUCTION_VERSION_ID = 'agtvrsn_0601m7jz66wvf83ambtr3s819vfv';
export const SOFIA_PREVIOUS_PREVIEW_VERSION_ID = 'agtvrsn_1101m6cddd37ewmtkrth2xr64n0m';
export const SOFIA_BONUS_PREVIEW = 'claude/sofia-minutos-extra';

export function sofiaPreviewTarget(env: Record<string, string | undefined>) {
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'preview' ||
      !['codex/sofia-elevenlabs', SOFIA_BONUS_PREVIEW].includes(env.VERCEL_GIT_COMMIT_REF ?? '') ||
      env.VERCEL_GIT_REPO_OWNER !== 'tosca201098-jpg' ||
      env.VERCEL_GIT_REPO_SLUG !== 'el-viajero-web') return null;
  return { agentId: SOFIA_PREVIEW_AGENT_ID, versionId: SOFIA_PREVIEW_VERSION_ID };
}

export function sofiaProductionTarget(env: Record<string, string | undefined>) {
  if (!isVoiceProductionScope(env) || env.ELEVENLABS_PRODUCTION_APPROVED !== 'true' ||
      env.AI_VOICE_PROVIDER !== 'elevenlabs') return null;
  return { agentId: SOFIA_PREVIEW_AGENT_ID, versionId: SOFIA_PRODUCTION_VERSION_ID };
}
