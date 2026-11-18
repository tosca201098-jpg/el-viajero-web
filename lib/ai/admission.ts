import { verifyVoiceUser } from '@/lib/supabase/voice-auth';
import { previewDiagnostic, type PreviewDiagnosticCode } from './preview-diagnostic';
import { madridVoiceDay, VOICE_DAY_LEDGER_LUA } from './voice-daily-policy';
import { createHmac, randomBytes } from 'node:crypto';
import { isIP } from 'node:net';

export type AiService = 'voice' | 'itinerary';

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

type VoiceReservation = {
  url: URL; token: string; key: string; nonce: string; startsAt: number; endsAt: number;
};
// Server-only capability: neither the reservation id nor its key is returned to the client.
const reservations = new WeakMap<Request, VoiceReservation>();

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

async function ledger(context: VoiceReservation, operation: 'reserve' | 'commit' | 'cancel'): Promise<[number, number]> {
  const response = await fetch(context.url, {
    method: 'POST', headers: { Authorization: `Bearer ${context.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['EVAL', VOICE_DAY_LEDGER_LUA, 1, context.key, operation,
      context.nonce, context.startsAt, context.endsAt, 30]),
    cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(2500),
  });
  if (!response.ok) throw new Error('quota_store_failed');
  const data: unknown = await response.json();
  if (!data || typeof data !== 'object' || 'error' in data || !('result' in data) ||
      !Array.isArray(data.result) || data.result.length !== 2) throw new Error('invalid_quota_result');
  const [code, retry] = data.result;
  if (!Number.isInteger(code) || ![-1, 0, 1, 2].includes(code) ||
      !Number.isInteger(retry) || retry < 0 || retry > 90000 ||
      (code !== 0 && retry !== 0)) throw new Error('invalid_quota_result');
  return [code, retry];
}

/** Finalize once before exposing a provider credential; failed/ambiguous commits are never refunded. */
export async function finalizeVoiceAdmission(request: Request, commit: boolean): Promise<boolean> {
  const context = reservations.get(request);
  reservations.delete(request);
  if (!context) return !commit;
  // Cancellation can release a known pending hold even after the browser disconnected.
  if (commit && request.signal.aborted) return false;
  try {
    const [code, retry] = await ledger(context, commit ? 'commit' : 'cancel');
    return retry === 0 && (commit ? code === 1 : code === 1 || code === 0);
  } catch { return false; }
}

/** Voice: non-refundable attempt limits followed by a provisional natural-Madrid-day slot. */
export async function admitAiRequest(request: Request, service: AiService): Promise<Response | null> {
  if (service === 'voice' && (request.signal.aborted || reservations.has(request))) return denial(503, 'ai_unavailable');
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== new URL(request.url).origin)) {
    if (service === 'voice') previewDiagnostic('ADMISSION_ORIGIN');
    return denial(403, 'ai_unavailable');
  }
  if (process.env.AI_ENABLED !== 'true' || process.env[`AI_${service.toUpperCase()}_ENABLED`] !== 'true') {
    if (service === 'voice') previewDiagnostic('ADMISSION_FLAGS');
    return denial(503, 'ai_unavailable');
  }
  const voiceUser = service === 'voice' ? await verifyVoiceUser(request) : null;
  if (voiceUser instanceof Response) return voiceUser;
  if (service === 'voice' && request.signal.aborted) return denial(503, 'ai_unavailable');
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
    const prefix = `destinauta:ai:v1:${scope}:${service}`;
    const kind = service.toUpperCase();
    const defaults = service === 'voice' ? [2, 5, 20] : [3, 10, 50];
    stage = 'ADMISSION_LIMITS';
    const limits = ['MINUTE', 'DAY', 'GLOBAL_DAY'].map((name, i) =>
      limit(process.env[`AI_${kind}_${name}_LIMIT`], defaults[i], service === 'voice' ? defaults[i] : undefined));
    const keys = [`${prefix}:ip:${hash}:minute`, `${prefix}:ip:${hash}:day`, `${prefix}:global:day`];
    const quotas = [limits[0], 60, limits[1], 86400, limits[2], 86400];
    let userHash: string | undefined;
    if (service === 'voice') {
      if (!voiceUser) throw new Error('missing_verified_user');
      userHash = createHmac('sha256', secret).update('user:' + voiceUser.userId).digest('hex');
      keys.push(`${prefix}:user:${userHash}:minute`);
      quotas.push(limit(process.env.AI_VOICE_USER_MINUTE_LIMIT, 1, 1), 60);
    }
    stage = 'ADMISSION_REDIS_NETWORK';
    if (service === 'voice' && request.signal.aborted) return denial(503, 'ai_unavailable');
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
      if (service === 'voice') previewDiagnostic('ADMISSION_QUOTA');
      return denial(429, 'ai_rate_limited', retry);
    }
    if (allowed !== 1 || retry !== 0) throw new Error('invalid_quota_result');
    if (service !== 'voice') return null;
    if (request.signal.aborted) return denial(503, 'ai_unavailable');

    const day = madridVoiceDay(Date.now());
    const context: VoiceReservation = { url, token,
      key: `destinauta:ai:v2:${scope}:voice:user:${userHash}:day:${day.date}`,
      nonce: randomBytes(16).toString('hex'), startsAt: day.startsAt, endsAt: day.endsAt };
    stage = 'ADMISSION_REDIS_NETWORK';
    if (request.signal.aborted) return denial(503, 'ai_unavailable');
    const [reserved, wait] = await ledger(context, 'reserve');
    stage = 'ADMISSION_REDIS_MALFORMED';
    if (reserved === 0) {
      previewDiagnostic('ADMISSION_QUOTA');
      return denial(429, 'ai_rate_limited', Math.max(1, wait));
    }
    if (reserved !== 1 || wait !== 0) throw new Error('invalid_quota_result');
    reservations.set(request, context);
    if (request.signal.aborted) {
      await finalizeVoiceAdmission(request, false);
      return denial(503, 'ai_unavailable');
    }
    return null;
  } catch {
    if (service === 'voice') previewDiagnostic(signal?.aborted ? 'ADMISSION_REDIS_TIMEOUT' : stage);
    return denial(503, 'ai_unavailable');
  }
}
