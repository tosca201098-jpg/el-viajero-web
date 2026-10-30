// Permanent selector: only this Vercel Preview branch may use the new test agent.
export const SOFIA_PREVIEW_AGENT_ID = 'agent_2201m677yj19e6499g2649n774f6';
export const SOFIA_PREVIEW_VERSION_ID = 'agtvrsn_2501m679we79ekz985446fbyygkb';

export function sofiaPreviewTarget(env: Record<string, string | undefined>) {
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'preview' ||
      env.VERCEL_GIT_COMMIT_REF !== 'codex/sofia-elevenlabs' ||
      env.VERCEL_GIT_REPO_OWNER !== 'tosca201098-jpg' ||
      env.VERCEL_GIT_REPO_SLUG !== 'el-viajero-web') return null;
  return { agentId: SOFIA_PREVIEW_AGENT_ID, versionId: SOFIA_PREVIEW_VERSION_ID };
}
