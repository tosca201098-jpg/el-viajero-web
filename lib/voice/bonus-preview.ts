import { createHmac } from 'node:crypto';
import { voiceAccountId } from '@/lib/ai/admission';
import { BudgetError } from '@/lib/voice/voice-minutes';
import { SOFIA_BONUS_PREVIEW } from '@/lib/voice/preview-target';

const project = 'https://fdjexxbncvpzrabtfswa.supabase.co';
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export const isBonusPreview = (env: Record<string, string | undefined>) =>
  env.VERCEL === '1' && env.VERCEL_ENV === 'preview' && env.VERCEL_GIT_COMMIT_REF === SOFIA_BONUS_PREVIEW;

export function bonusPreviewEnabled(env: Record<string, string | undefined>) {
  return isBonusPreview(env) && env.VERCEL_GIT_REPO_OWNER === 'tosca201098-jpg' &&
    env.VERCEL_GIT_REPO_SLUG === 'el-viajero-web' && env.AI_VOICE_BONUS_PREVIEW === 'true';
}

/** Read the operator's own actual grant. The server-owned preview reference keeps trial usage separate. */
export async function readBonusPreview(request: Request, env: Record<string, string | undefined>) {
  const accountId = voiceAccountId(request);
  const auth = request.headers.get('authorization');
  const projectUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const secret = env.AI_RATE_LIMIT_SECRET;
  if (!bonusPreviewEnabled(env) || !accountId || !uuid.test(accountId) || !auth ||
      projectUrl !== project || !key || !secret || secret.length < 32) {
    throw new BudgetError('VOICE_BONUS_STORAGE');
  }

  const response = await fetch(project + '/rest/v1/rpc/destinauta_admin_accounts', {
    method: 'POST', cache: 'no-store', redirect: 'error',
    headers: { apikey: key, authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_search: accountId }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new BudgetError('VOICE_BONUS_STORAGE');
  const result: unknown = await response.json();
  const row = Array.isArray(result) && result.length === 1 ? result[0] : null;
  if (row?.id !== accountId || row.confirmed !== true || !Number.isSafeInteger(row.extra_seconds_left) ||
      row.extra_seconds_left < 0) throw new BudgetError('VOICE_BONUS_STORAGE');

  const userRef = 'u_' + createHmac('sha256', secret).update('sofia-bonus-preview:' + accountId).digest('hex').slice(0, 32);
  return { userRef, bonusTrialSeconds: Math.min(row.extra_seconds_left, 300) };
}
