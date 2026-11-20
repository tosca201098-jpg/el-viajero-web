import { verifyVoiceUser } from '@/lib/supabase/voice-auth';
import { previewDiagnostic, type PreviewDiagnosticCode } from './preview-diagnostic';
import { madridVoiceDay } from './voice-daily-policy';
import { AI_ITINERARIES_GLOBAL_PER_DAY, AI_ITINERARIES_PER_DAY } from '@/lib/itinerary/limits';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

export type AiService = 'voice' | 'itinerary' | 'voice_budget';

// Non-refundable attempt limits. Denials never extend or increment another bucket.
export const RESERVE_QUOTA = `
local retry = 0
for i, key in ipairs(KEYS) do
  local count = tonumber(redis.call('GET', key) or '0')
  if count >= tonumber(ARGV[(i-1)*2+1]) then
    retry = math.max(retry, redis.call('TTL', key), 1)
  end
end
if retry > 0 then return {0, retry} end
for i, key in ipairs(KEYS) do
  local count = redis.call('INCR', key)
  if count == 1 then redis.call('EXPIRE', key, ARGV[(i-1)*2+2]) end
end
return {1, 0}
`;

// Server-only: the anonymous account reference of an admitted voice request. It is never derived from client input.
const voiceUsers = new WeakMap<Request, { reference: string; accountId: string }>();
/** Anonymous, stable per-account reference (HMAC of the verified user id). It is what ElevenLabs stores as `user_id`. */
export function voiceUserReference(request: Request): string | undefined { return voiceUsers.get(request)?.reference; }
export function voiceAccountId(request: Request): string | undefined { return voiceUsers.get(request)?.accountId; }
function userReference(secret: string, userId: string) {
  return 'u_' + createHmac('sha256', secret).update('elevenlabs-user:' + userId).digest('hex').slice(0, 32);
}

function denial(status: number, error: string, retry = 60) {
  return Response.json({ error }, { status, headers: {
    'Cache-Control': 'no-store', 'Retry-After': String(retry),
  } });
}
function limit(value: string | undefined, fallback: number, ceiling?: number): number {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d{0,5}$/.test(value)) throw new Error('invalid_limit');
  const result = Number(value);
  if (ceiling !== undefined && result > ceiling) throw new Error('invalid_limit');
  return result;
}
// Group IPv6 privacy addresses by /64. Never store the raw address.
function networkIdentity(ip: string): string {
  if (isIP(ip) === 4) return ip;
  const canonical = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
  const [left, right] = canonical.split('::');
  const a = left ? left.split(':') : [];
  const b = right ? right.split(':') : [];
  const groups = right === undefined ? a : [...a, ...Array(8 - a.length - b.length).fill('0'), ...b];
  return groups.slice(0, 4).map(x => x.padStart(4, '0')).join(':') + '::/64';
}

/**
 * Voice and AI itineraries: non-refundable attempt limits (they only protect against floods and double clicks).
 * What a person may actually USE is decided elsewhere: voice minutes (lib/voice/voice-minutes.ts) and the
 * Madrid-day itinerary allowance below. `voice_budget` is the cheap read behind the minutes bar in "Mi cuenta".
 */
export async function admitAiRequest(request: Request, service: AiService): Promise<Response | null> {
  const voiceLike = service !== 'itinerary';
  if (voiceLike && (request.signal.aborted || voiceUsers.has(request))) return denial(503, 'ai_unavailable');
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== new URL(request.url).origin)) {
    if (voiceLike) previewDiagnostic('ADMISSION_ORIGIN');
    return denial(403, 'ai_unavailable');
  }
  const flag = service === 'itinerary' ? 'ITINERARY' : 'VOICE';
  if (process.env.AI_ENABLED !== 'true' || process.env[`AI_${flag}_ENABLED`] !== 'true') {
    if (voiceLike) previewDiagnostic('ADMISSION_FLAGS');
    return denial(503, 'ai_unavailable');
  }
  // Voice and AI itineraries are only for registered visitors; the guest path never reaches this function.
  const voiceUser = await verifyVoiceUser(request);
  if (voiceUser instanceof Response) return voiceUser;
  if (voiceLike && request.signal.aborted) return denial(503, 'ai_unavailable');
  let stage: PreviewDiagnosticCode = 'ADMISSION_REDIS_CONFIG';
  let signal: AbortSignal | undefined;
  try {
    const url = new URL(process.env.AI_REDIS_REST_URL ?? '');
    const token = process.env.AI_REDIS_REST_TOKEN;
    const secret = process.env.AI_RATE_LIMIT_SECRET;
    if (url.protocol !== 'https:' || !url.hostname.endsWith('.upstash.io') ||
        url.username || url.password || url.port || url.pathname !== '/' || url.search || url.hash ||
        !token || !secret || secret.length < 32) throw new Error('invalid_configuration');
    stage = 'ADMISSION_IP';
    let identity: string;
    if (process.env.VERCEL === '1') {
      const ip = request.headers.get('x-vercel-forwarded-for')?.trim() ?? '';
      if (!isIP(ip)) throw new Error('missing_trusted_ip');
      identity = networkIdentity(ip);
    } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      identity = 'local-development';
    } else throw new Error('unsupported_host');
    const hash = createHmac('sha256', secret).update(identity).digest('hex');
    const scope = process.env.VERCEL_ENV === 'production' ? 'production' : 'preview';
    const prefix = `destinauta:ai:v1:${scope}:${service === 'voice_budget' ? 'voice:budget' : service}`;
    if (!voiceUser) throw new Error('missing_verified_user');
    const userHash = createHmac('sha256', secret).update('user:' + voiceUser.userId).digest('hex');
    stage = 'ADMISSION_LIMITS';
    let keys: string[];
    let quotas: number[];
    if (service === 'voice') {
      // Only flood protection. No daily or per-person count of conversations: the voice minutes are the allowance.
      keys = [`${prefix}:ip:${hash}:minute`, `${prefix}:ip:${hash}:day`, `${prefix}:user:${userHash}:minute`];
      quotas = [limit(process.env.AI_VOICE_IP_MINUTE_ATTEMPTS, 6, 6), 60, limit(process.env.AI_VOICE_IP_DAY_ATTEMPTS, 60, 60), 86400,
        limit(process.env.AI_VOICE_USER_MINUTE_ATTEMPTS, 3, 3), 60];
    } else if (service === 'voice_budget') {
      keys = [`${prefix}:ip:${hash}:minute`, `${prefix}:user:${userHash}:minute`];
      quotas = [30, 60, 6, 60];
    } else {
      const defaults = [3, 10, AI_ITINERARIES_GLOBAL_PER_DAY];
      const limits = ['MINUTE', 'DAY', 'GLOBAL_DAY'].map((name, i) =>
        limit(process.env[`AI_ITINERARY_${name}_LIMIT`], defaults[i], defaults[i]));
      keys = [`${prefix}:ip:${hash}:minute`, `${prefix}:ip:${hash}:day`, `${prefix}:global:day`,
        // AI itineraries: a per-person allowance for the natural Madrid day (the key changes at midnight, Madrid time).
        `${prefix}:user:${userHash}:day:${madridVoiceDay(Date.now()).date}`];
      quotas = [limits[0], 60, limits[1], 86400, limits[2], 86400,
        limit(process.env.AI_ITINERARY_USER_DAY_LIMIT, AI_ITINERARIES_PER_DAY, AI_ITINERARIES_PER_DAY), 90000];
    }
    stage = 'ADMISSION_REDIS_NETWORK';
    if (voiceLike && request.signal.aborted) return denial(503, 'ai_unavailable');
    signal = AbortSignal.timeout(2500);
    const response = await fetch(url, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', RESERVE_QUOTA, keys.length, ...keys, ...quotas]),
      cache: 'no-store', signal,
    });
    stage = 'ADMISSION_REDIS_HTTP';
    if (!response.ok) throw new Error('quota_store_failed');
    stage = 'ADMISSION_REDIS_MALFORMED';
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || 'error' in data || !('result' in data) ||
        !Array.isArray(data.result) || data.result.length !== 2) throw new Error('invalid_quota_result');
    const [allowed, retry] = data.result;
    if (allowed === 0 && Number.isInteger(retry) && retry >= 1 && retry <= 86400) {
      if (voiceLike) previewDiagnostic('ADMISSION_QUOTA');
      return denial(429, 'ai_rate_limited', retry);
    }
    if (allowed !== 1 || retry !== 0) throw new Error('invalid_quota_result');
    if (!voiceLike) return null;
    if (request.signal.aborted) return denial(503, 'ai_unavailable');
    voiceUsers.set(request, { reference: userReference(secret, voiceUser.userId), accountId: voiceUser.userId });
    return null;
  } catch {
    if (voiceLike) previewDiagnostic(signal?.aborted ? 'ADMISSION_REDIS_TIMEOUT' : stage);
    return denial(503, 'ai_unavailable');
  }
}
