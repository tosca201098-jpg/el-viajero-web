import type { Session, SupabaseClient } from '@supabase/supabase-js';

export type VoiceAuthState = { ready: boolean; userId: string | null };
export type VoiceAuthController = { getAccessToken: () => Promise<string | null>; dispose: () => void };

function registeredUserId(session: Session | null): string | null {
  if (!session || !session.user || session.user.is_anonymous === true ||
      typeof session.user.id !== 'string' || !session.user.id ||
      typeof session.access_token !== 'string' || !session.access_token.trim() ||
      (session.expires_at !== undefined && session.expires_at <= Date.now() / 1000)) return null;
  return session.user.id;
}

/** UI eligibility only. The server must verify the bearer with Supabase again. */
export function observeVoiceAuth(
  auth: Pick<SupabaseClient['auth'], 'getSession' | 'onAuthStateChange'>,
  onState: (state: VoiceAuthState) => void,
  onIdentityChange: () => void,
): VoiceAuthController {
  let disposed = false;
  let revision = 0;
  let identityGeneration = 0;
  let state: VoiceAuthState = { ready: false, userId: null };

  const apply = (session: Session | null) => {
    if (disposed) return;
    revision++;
    const nextId = registeredUserId(session);
    if (state.userId !== nextId || !state.ready) {
      identityGeneration++;
      // Stop synchronously before React commits the replacement account state.
      onIdentityChange();
    }
    state = { ready: true, userId: nextId };
    onState(state);
  };

  // Subscribe first: a late initial read must not restore an already-signed-out user.
  const { data: { subscription } } = auth.onAuthStateChange((_event, session) => apply(session));
  const initialRevision = revision;
  try {
    void auth.getSession().then(({ data, error }) => {
      if (!disposed && revision === initialRevision) apply(error ? null : data.session);
    }).catch(() => {
      if (!disposed && revision === initialRevision) apply(null);
    });
  } catch {
    if (revision === initialRevision) apply(null);
  }

  return {
    async getAccessToken() {
      if (disposed || !state.ready || !state.userId) return null;
      const expectedId = state.userId;
      const generation = identityGeneration;
      try {
        // The existing SDK refreshes its session when needed. Never cache another JWT.
        const { data, error } = await auth.getSession();
        if (disposed || generation !== identityGeneration) return null;
        const nextId = error ? null : registeredUserId(data.session);
        if (nextId !== expectedId) {
          apply(error ? null : data.session);
          return null;
        }
        return data.session?.access_token ?? null;
      } catch {
        if (!disposed && generation === identityGeneration) apply(null);
        return null;
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      identityGeneration++;
      subscription.unsubscribe();
    },
  };
}
