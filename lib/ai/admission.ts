import { previewDiagnostic, type PreviewDiagnosticCode } from './preview-diagnostic';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';

export type AiService = 'voice' | 'itinerary';

// Redis executes the complete reservation atomically, across workers and deployments.
// Denied requests do not extend a window or consume another bucket.
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

function denial(status: number, error: string, retry = 60) {
  return Response.json({ error }, { status, headers: {
    'Cache-Control': 'no-store', 'Retry-After': String(retry),
  } });
}

function limit(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d{0,5}$/.test(value)) throw new Error('invalid_limit');
  return Number(value);
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

/** Admission quotas, NOT a monetary cap or a limit on an already-issued provider token. */
export async function admitAiRequest(request: Request, service: AiService): Promise<Response | null> {
  const origin = request.headers.get('origin');
  if (request.headers.get('sec-fetch-site') === 'cross-site' || (origin && origin !== new URL(request.url).origin)) {
    if (service === 'voice') previewDiagnostic('ADMISSION_ORIGIN');
    return denial(403, 'ai_unavailable');
  }
  if (process.env.AI_ENABLED !== 'true' || process.env[`AI_${service.toUpperCase()}_ENABLED`] !== 'true') {
    if (service === 'voice') previewDiagnostic('ADMISSION_FLAGS');
    return denial(503, 'ai_unavailable');
  }
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
      // Vercel replaces this header at its trusted edge. Do not use client cookies or X-Forwarded-For.
      const ip = request.headers.get('x-vercel-forwarded-for')?.trim() ?? '';
      if (!isIP(ip)) throw new Error('missing_trusted_ip');
      identity = networkIdentity(ip);
    } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      // Local requests share one bucket; there is no spoofable local header override.
      identity = 'local-development';
    } else {
      throw new Error('unsupported_host');
    }
    const hash = createHmac('sha256', secret).update(identity).digest('hex');
    const prefix = `destinauta:ai:v1:${process.env.VERCEL_ENV === 'production' ? 'production' : 'preview'}:${service}`;
    const kind = service.toUpperCase();
    const defaults = service === 'voice' ? [2, 5, 20] : [3, 10, 50];
    stage = 'ADMISSION_LIMITS';
    const limits = ['MINUTE', 'DAY', 'GLOBAL_DAY'].map((name, i) => limit(process.env[`AI_${kind}_${name}_LIMIT`], defaults[i]));
    const keys = [`${prefix}:ip:${hash}:minute`, `${prefix}:ip:${hash}:day`, `${prefix}:global:day`];
    const quotas = [limits[0], 60, limits[1], 86400, limits[2], 86400];
    if (service === 'voice') {
      // Reserve five minutes per admission. Fixed 31-day windows are conservative;
      // this is a session allowance, not a billing-period or monetary guarantee.
      keys.push(prefix + ':elevenlabs:global:31days');
      quotas.push(limit(process.env.AI_VOICE_GLOBAL_31DAY_LIMIT, 3), 2678400);
    }
    stage = 'ADMISSION_REDIS_NETWORK';
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
    if (allowed === 1 && retry === 0) return null;
    if (allowed !== 0 || !Number.isInteger(retry) || retry < 1 || retry > (service === 'voice' ? 2678400 : 86400)) throw new Error('invalid_quota_result');
    if (service === 'voice') previewDiagnostic('ADMISSION_QUOTA');
    return denial(429, 'ai_rate_limited', retry);
  } catch {
    // No fallback to process memory: it would bypass quotas on cold starts / other workers.
    if (service === 'voice') previewDiagnostic(signal?.aborted ? 'ADMISSION_REDIS_TIMEOUT' : stage);
    return denial(503, 'ai_unavailable');
  }
}
