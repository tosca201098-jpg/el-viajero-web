import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { RESERVE_QUOTA } from '@/lib/ai/admission';
import { safeSofiaConfiguration, SOFIA_AGENT_ID, SOFIA_PREVIEW_VERSION_ID } from '@/lib/voice/provider-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const HOST = 'el-viajero-web-git-codex-sofia-elevenlabs-el-viajero.vercel.app';
const reply = (status: number, body: object) => Response.json(body, {
  status, headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
});
const hidden = () => reply(404, { error: 'not_found' });
export const GET = hidden;
export const HEAD = hidden;
export const PUT = hidden;
export const PATCH = hidden;
export const DELETE = hidden;
export const OPTIONS = hidden;

export async function POST(request: Request) {
  const env = process.env;
  // Isolation comes before credential parsing and EVERY external operation.
  if (env.VERCEL !== '1' || env.VERCEL_ENV !== 'preview' ||
      env.VERCEL_GIT_COMMIT_REF !== 'codex/sofia-elevenlabs' ||
      env.VERCEL_GIT_REPO_OWNER !== 'tosca201098-jpg' || env.VERCEL_GIT_REPO_SLUG !== 'el-viajero-web' ||
      env.SOFIA_DIAGNOSTIC_ENABLED !== 'true') return hidden();
  try {
    const url = new URL(request.url);
    if (url.protocol !== 'https:' || url.host !== HOST || url.search ||
        request.headers.get('sec-fetch-site') === 'cross-site' ||
        (request.headers.has('origin') && request.headers.get('origin') !== url.origin)) return hidden();
    const startText = env.SOFIA_DIAGNOSTIC_WINDOW_START ?? '';
    const start = Date.parse(startText);
    const remaining = start + 900000 - Date.now();
    if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(startText) ||
        !Number.isFinite(start) || new Date(start).toISOString() !== startText || start > Date.now() || remaining <= 0) return hidden();
    const expectedHash = env.SOFIA_DIAGNOSTIC_TOKEN_SHA256 ?? '';
    const authorization = request.headers.get('authorization') ?? '';
    if (!/^[a-f0-9]{64}$/.test(expectedHash) || !/^Bearer [a-f0-9]{64}$/.test(authorization)) return hidden();
    if (!timingSafeEqual(createHash('sha256').update(authorization.slice(7)).digest(), Buffer.from(expectedHash, 'hex'))) return hidden();

    const redisUrl = new URL(env.AI_REDIS_REST_URL ?? '');
    if (redisUrl.protocol !== 'https:' || !redisUrl.hostname.endsWith('.upstash.io') || redisUrl.port ||
        redisUrl.username || redisUrl.password || redisUrl.pathname !== '/' || redisUrl.search || redisUrl.hash ||
        !env.AI_REDIS_REST_TOKEN || !env.AI_RATE_LIMIT_SECRET || env.AI_RATE_LIMIT_SECRET.length < 32 ||
        !env.ELEVENLABS_API_KEY || env.ELEVENLABS_AGENT_VERSION_ID !== SOFIA_PREVIEW_VERSION_ID) {
      return reply(503, { error: 'diagnostic_configuration_unavailable' });
    }
    const signal = AbortSignal.timeout(Math.max(1, Math.min(10000, remaining)));
    const redis = async (command: (string | number)[]) => {
      const response = await fetch(redisUrl, {
        method: 'POST', redirect: 'error', cache: 'no-store', signal,
        headers: { Authorization: `Bearer ${env.AI_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(command),
      });
      if (!response.ok) throw new Error('redis_unavailable');
      const data = await response.json();
      if (!data || typeof data !== 'object' || 'error' in data || !('result' in data)) throw new Error('redis_unavailable');
      return data.result;
    };
    // A shared, expiring lock consumes the credential even if later checks fail.
    const runId = createHash('sha256').update(expectedHash).digest('hex');
    const prefix = `destinauta:diagnostic:sofia:${runId}`;
    const claimed = await redis(['EVAL',
      "if redis.call('EXISTS', KEYS[1]) == 1 then return 0 end redis.call('SET', KEYS[1], '1', 'EX', 900) return 1",
      1, prefix + ':used']);
    if (claimed === 0) return reply(409, { error: 'diagnostic_already_used' });
    if (claimed !== 1) throw new Error('redis_unavailable');
    let redisPassed = false;
    let elevenlabsPassed = false;
    try {
      // Four isolated buckets exercise the actual voice quota script, never real quotas.
      const keys = [0, 1, 2, 3].map(i => `${prefix}:probe:${randomUUID()}:${i}`);
      const command = ['EVAL', RESERVE_QUOTA, keys.length, ...keys, ...keys.flatMap(() => [1, 120])];
      const results = await Promise.all([redis(command), redis(command)]);
      const allowed = results.filter(r => Array.isArray(r) && r.length === 2 && r[0] === 1 && r[1] === 0).length;
      const denied = results.filter(r => Array.isArray(r) && r.length === 2 && r[0] === 0 && Number.isInteger(r[1]) && r[1] >= 1 && r[1] <= 120).length;
      const observed = await redis(['EVAL',
        "local out = {} for _, key in ipairs(KEYS) do table.insert(out, tonumber(redis.call('GET', key) or '-1')) table.insert(out, redis.call('TTL', key)) end return out",
        keys.length, ...keys]);
      redisPassed = allowed === 1 && denied === 1 && Array.isArray(observed) && observed.length === 8 &&
        observed.every((v: number, i: number) => i % 2 === 0 ? v === 1 : Number.isInteger(v) && v >= 1 && v <= 120);
    } catch { /* Never expose provider errors or credentials. */ }
    try {
      const agentUrl = new URL('https://api.elevenlabs.io/v1/convai/agents/' + SOFIA_AGENT_ID);
      agentUrl.searchParams.set('version_id', SOFIA_PREVIEW_VERSION_ID);
      const response = await fetch(agentUrl, {
        method: 'GET', redirect: 'error', cache: 'no-store', signal,
        headers: { 'xi-api-key': env.ELEVENLABS_API_KEY },
      });
      if (response.ok) {
        const config = await response.json();
        elevenlabsPassed = config.agent_id === SOFIA_AGENT_ID && config.version_id === SOFIA_PREVIEW_VERSION_ID &&
          safeSofiaConfiguration(config) === true;
      }
    } catch { /* Only bounded public status leaves the server. */ }
    return reply(redisPassed && elevenlabsPassed ? 200 : 503, {
      redis: redisPassed ? 'passed' : 'failed', elevenlabs: elevenlabsPassed ? 'passed' : 'failed',
    });
  } catch { return reply(503, { error: 'diagnostic_unavailable' }); }
}
