export type VoiceProvider = 'elevenlabs';

export function isVoiceProductionScope(env: Record<string, string | undefined>) {
  return env.VERCEL === '1' && env.VERCEL_ENV === 'production' &&
    env.VERCEL_GIT_COMMIT_REF === 'main' &&
    env.VERCEL_GIT_REPO_OWNER === 'tosca201098-jpg' &&
    env.VERCEL_GIT_REPO_SLUG === 'el-viajero-web';
}

// Server-only selection. Sofía uses ElevenLabs only: any other provider value is refused.
export function voiceProvider(env: Record<string, string | undefined>): VoiceProvider | null {
  const selected = env.AI_VOICE_PROVIDER;
  if (selected !== undefined && selected !== 'elevenlabs') return null;
  if (env.VERCEL_ENV === 'production') {
    // Production needs the explicit provider value AND the separate approval flag.
    if (!isVoiceProductionScope(env) || selected !== 'elevenlabs') return null;
    return env.ELEVENLABS_PRODUCTION_APPROVED === 'true' ? selected : null;
  }
  if (env.VERCEL === '1' && !['preview', 'development'].includes(env.VERCEL_ENV ?? '')) return null;
  // Preview and local development default to ElevenLabs.
  return 'elevenlabs';
}
