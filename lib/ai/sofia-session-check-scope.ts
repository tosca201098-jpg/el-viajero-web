import { sofiaPreviewTarget } from '@/lib/voice/preview-target';

export const SOFIA_SESSION_CHECK_HOST = 'el-viajero-web-git-codex-sofia-elevenlabs-el-viajero.vercel.app';
export const SOFIA_SESSION_CHECK_EXPIRES_AT = '2026-11-02T19:30:00.000Z';
const startsAt = Date.parse('2026-11-01T19:30:00.000Z');

/** Temporary acceptance check; never available in Production or after its fixed deadline. */
export function sofiaSessionCheckAvailable(env: Record<string, string | undefined>, now = Date.now()) {
  return !!sofiaPreviewTarget(env) && Number.isFinite(now) && now >= startsAt &&
    now < Date.parse(SOFIA_SESSION_CHECK_EXPIRES_AT);
}
