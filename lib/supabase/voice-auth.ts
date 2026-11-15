import { createClient } from '@supabase/supabase-js';

type VoiceUser = { userId: string };
const denied = () => Response.json({ error: 'voice_auth_required' }, {
  status: 401, headers: { 'Cache-Control': 'no-store' },
});
const unavailable = () => Response.json({ error: 'ai_unavailable' }, {
  status: 503, headers: { 'Cache-Control': 'no-store' },
});

/** Verify the existing Supabase session remotely; no client-supplied identity is trusted. */
export async function verifyVoiceUser(request: Request): Promise<VoiceUser | Response> {
  if (request.signal.aborted) return unavailable();
  const authorization = request.headers.get('authorization') ?? '';
  const bearer = authorization.length <= 8192 && /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(authorization);
  if (!bearer) return denied();

  try {
    const projectUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '');
    // Match the existing browser client's normalization of a copied Data API URL.
    projectUrl.pathname = projectUrl.pathname.replace(/\/rest\/v1\/?$/, '');
    const localHttp = process.env.NODE_ENV === 'development' && projectUrl.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(projectUrl.hostname);
    if ((projectUrl.protocol !== 'https:' && !localHttp) || projectUrl.username || projectUrl.password ||
        projectUrl.search || projectUrl.hash || projectUrl.pathname.replace(/\/$/, '') !== '') return unavailable();
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
    if (!key || key.length > 4096 || /[\x00-\x1f\x7f]/.test(key)) return unavailable();

    const deadline = AbortSignal.timeout(2500);
    const controller = new AbortController();
    const abort = () => controller.abort();
    deadline.addEventListener('abort', abort, { once: true });
    request.signal.addEventListener('abort', abort, { once: true });
    if (deadline.aborted || request.signal.aborted) controller.abort();
    try {
      if (controller.signal.aborted) return unavailable();
      const authFetch: typeof fetch = (input, init) => {
        const destination = new URL(typeof input === 'string' || input instanceof URL ? String(input) : input.url);
        if (destination.origin !== projectUrl.origin || destination.pathname !== '/auth/v1/user' ||
            destination.search || destination.hash || (init?.method ?? 'GET').toUpperCase() !== 'GET') {
          return Promise.reject(new Error('invalid_auth_destination'));
        }
        return fetch(input, { ...init, signal: controller.signal, cache: 'no-store', redirect: 'error' });
      };
      // One client per request: never share another visitor's session or refresh token.
      const client = createClient(projectUrl.origin, key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { fetch: authFetch },
      });
      const { data, error } = await client.auth.getUser(bearer[1]);
      if (controller.signal.aborted || request.signal.aborted) return unavailable();
      if (error) {
        const invalidSession = error.status === 401 || error.status === 403 ||
          error.name === 'AuthSessionMissingError' ||
          ['bad_jwt', 'session_not_found', 'session_expired', 'user_not_found', 'user_banned'].includes(error.code ?? '');
        return invalidSession ? denied() : unavailable();
      }
      const user = data?.user;
      if (!user || user.is_anonymous === true ||
          (user.aud && user.aud !== 'authenticated') || (user.role && user.role !== 'authenticated') ||
          typeof user.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
        return denied();
      }
      return { userId: user.id.toLowerCase() };
    } finally {
      deadline.removeEventListener('abort', abort);
      request.signal.removeEventListener('abort', abort);
    }
  } catch {
    // No JWT, user, IP address, provider response or SDK error is logged or returned.
    return unavailable();
  }
}
