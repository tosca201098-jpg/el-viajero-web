import { createHmac } from 'node:crypto';
import { verifyVoiceUser } from '@/lib/supabase/voice-auth';
import { sofiaSessionCheckAvailable, SOFIA_SESSION_CHECK_HOST, SOFIA_SESSION_CHECK_EXPIRES_AT } from '@/lib/ai/sofia-session-check-scope';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const reply = (status: number, body: object) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', Vary: 'Authorization', 'Referrer-Policy': 'no-referrer' },
});
const hidden = () => reply(404, { error: 'not_found' });
const unavailable = () => reply(503, { error: 'sofia_check_unavailable' });
export const POST = hidden;
export const HEAD = hidden;
export const PUT = hidden;
export const PATCH = hidden;
export const DELETE = hidden;
export const OPTIONS = hidden;

function limit(value: string | undefined, fallback: number) {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d{0,5}$/.test(value)) throw new Error('invalid_limit');
  return Number(value);
}
function count(value: unknown) {
  if (value === null) return 0;
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^\d+$/.test(value))) {
    throw new Error('invalid_count');
  }
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 0) throw new Error('invalid_count');
  return result;
}

export async function GET(request: Request) {
  // Scope and expiry precede authentication and every external operation.
  if (!sofiaSessionCheckAvailable(process.env)) return hidden();
  try {
    const url = new URL(request.url);
    if (url.protocol !== 'https:' || url.host !== SOFIA_SESSION_CHECK_HOST ||
        url.pathname !== '/api/sofia-session-check' || url.search || url.username || url.password ||
        request.headers.get('sec-fetch-site') !== 'same-origin' ||
        (request.headers.has('origin') && request.headers.get('origin') !== url.origin)) return hidden();
    if (request.signal.aborted) return unavailable();
    // Reuse the exact remote identity check from voice, never the admission/reservation function.
    const user = await verifyVoiceUser(request);
    if (user instanceof Response) {
      return user.status === 401 ? reply(401, { error: 'voice_auth_required' }) : unavailable();
    }
    if (request.signal.aborted || !sofiaSessionCheckAvailable(process.env)) return unavailable();

    const redisUrl = new URL(process.env.AI_REDIS_REST_URL ?? '');
    const redisToken = process.env.AI_REDIS_REST_TOKEN;
    const secret = process.env.AI_RATE_LIMIT_SECRET;
    if (redisUrl.protocol !== 'https:' || !redisUrl.hostname.endsWith('.upstash.io') ||
        redisUrl.username || redisUrl.password || redisUrl.port || redisUrl.pathname !== '/' ||
        redisUrl.search || redisUrl.hash || !redisToken || !secret || secret.length < 32) return unavailable();
    const windows = ['minute', 'day', '31days'] as const;
    const limits = [
      limit(process.env.AI_VOICE_USER_MINUTE_LIMIT, 1),
      limit(process.env.AI_VOICE_USER_DAY_LIMIT, 2),
      limit(process.env.AI_VOICE_USER_31DAY_LIMIT, 3),
    ];
    const userHash = createHmac('sha256', secret).update('user:' + user.userId).digest('hex');
    const prefix = 'destinauta:ai:v1:preview:voice:user:' + userHash;
    const keys = windows.map(window => prefix + ':' + window);
    const controller = new AbortController();
    const remainingMs = Date.parse(SOFIA_SESSION_CHECK_EXPIRES_AT) - Date.now();
    const deadline = AbortSignal.timeout(Math.max(1, Math.min(2500, remainingMs)));
    const abort = () => controller.abort();
    deadline.addEventListener('abort', abort, { once: true });
    request.signal.addEventListener('abort', abort, { once: true });
    if (deadline.aborted || request.signal.aborted) controller.abort();
    try {
      if (controller.signal.aborted) return unavailable();
      // REST uses POST, but its sole Redis command is a read-only snapshot of this user's keys.
      const response = await fetch(redisUrl, {
        method: 'POST', redirect: 'error', cache: 'no-store', signal: controller.signal,
        headers: { Authorization: 'Bearer ' + redisToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(['MGET', ...keys]),
      });
      if (!response.ok) return unavailable();
      const data: unknown = await response.json();
      if (controller.signal.aborted || !sofiaSessionCheckAvailable(process.env)) return unavailable();
      if (!data || typeof data !== 'object' || 'error' in data || !('result' in data) ||
          !Array.isArray(data.result) || data.result.length !== 3) return unavailable();
      const used = data.result.map(count);
      return reply(200, {
        authenticated: true, identity_verified: true, quota_owner: 'authenticated_user',
        quotas: windows.map((window, i) => ({ window, limit: limits[i], used: used[i],
          remaining: Math.max(0, limits[i] - used[i]) })),
        voice_started: false, quota_reserved: false,
      });
    } finally {
      deadline.removeEventListener('abort', abort);
      request.signal.removeEventListener('abort', abort);
    }
  } catch {
    // Never log or expose JWTs, identifiers, Redis credentials/keys or upstream responses.
    return unavailable();
  }
}
