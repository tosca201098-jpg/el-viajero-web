export type VoiceProvider = 'openai' | 'elevenlabs';

export function isVoiceProductionScope(env: Record<string, string | undefined>) {
  return env.VERCEL === '1' && env.VERCEL_ENV === 'production' &&
    env.VERCEL_GIT_COMMIT_REF === 'main' &&
    env.VERCEL_GIT_REPO_OWNER === 'tosca201098-jpg' &&
    env.VERCEL_GIT_REPO_SLUG === 'el-viajero-web';
}

// Server-only selection. A failed provider never starts the other provider.
export function voiceProvider(env: Record<string, string | undefined>): VoiceProvider | null {
  const selected = env.AI_VOICE_PROVIDER;
  if (selected !== undefined && selected !== 'openai' && selected !== 'elevenlabs') return null;
  if (env.VERCEL_ENV === 'production') {
    if (!isVoiceProductionScope(env)) return null;
    if (selected === 'elevenlabs') return env.ELEVENLABS_PRODUCTION_APPROVED === 'true' ? selected : null;
    return 'openai';
  }
  if (env.VERCEL === '1' && !['preview', 'development'].includes(env.VERCEL_ENV ?? '')) return null;
  // Preserve the private Sofía Preview without requiring an environment change.
  return selected ?? 'elevenlabs';
}
