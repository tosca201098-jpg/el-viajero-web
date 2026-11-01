'use client';

import { useEffect, useRef, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';

type Check = 'session' | 'anonymous' | 'invalid';
type Quota = { window: 'minute' | 'day' | '31days'; limit: number; used: number; remaining: number };
type Result = { outcome: 'verified'; quotas: Quota[] } |
  { outcome: 'login_required' | 'anonymous_rejected' | 'invalid_rejected' | 'unavailable' };
const windows = ['minute', 'day', '31days'] as const;
const windowNames = { minute: 'Minuto', day: 'Día', '31days': '31 días' };

function sessionIdentity(session: Session | null): string | null {
  const user = session?.user;
  return user && typeof user.id === 'string' && user.id ? `${user.is_anonymous === true ? 'anonymous' : 'registered'}:${user.id}` : null;
}

function ownQuotas(value: unknown): Quota[] | null {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  if (data.authenticated !== true || data.identity_verified !== true || data.quota_owner !== 'authenticated_user' ||
      data.voice_started !== false || data.quota_reserved !== false || !Array.isArray(data.quotas) || data.quotas.length !== 3) return null;
  const quotas: Quota[] = [];
  for (let i = 0; i < windows.length; i++) {
    const quota = data.quotas[i];
    if (!quota || typeof quota !== 'object' || quota.window !== windows[i] ||
        !Number.isInteger(quota.limit) || quota.limit < 1 || quota.limit > 999999 ||
        !Number.isSafeInteger(quota.used) || quota.used < 0 ||
        !Number.isInteger(quota.remaining) || quota.remaining !== Math.max(0, quota.limit - quota.used)) return null;
    // Copy only the reviewed public policy fields, never arbitrary provider data.
    quotas.push({ window: windows[i], limit: quota.limit, used: quota.used, remaining: quota.remaining });
  }
  return quotas;
}

/** An abort also settles a pending SDK read whose promise cannot itself be cancelled. */
function untilAborted<T>(promise: PromiseLike<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(new Error('check_cancelled'));
    if (signal.aborted) {
      // A synchronous SDK auth event may abort before this wrapper is entered.
      // Still consume a later rejection of the already-created SDK promise.
      void Promise.resolve(promise).catch(() => {});
      reject(new Error('check_cancelled'));
      return;
    }
    signal.addEventListener('abort', abort, { once: true });
    Promise.resolve(promise).then(value => {
      signal.removeEventListener('abort', abort);
      if (!signal.aborted) resolve(value);
    }, () => {
      signal.removeEventListener('abort', abort);
      reject(new Error('check_unavailable'));
    });
  });
}

export default function SessionCheck() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const mounted = useRef(false);
  const generation = useRef(0);
  const revision = useRef(0);
  const identity = useRef<string | null | undefined>(undefined);
  const active = useRef<{ controller: AbortController; timeout: ReturnType<typeof setTimeout> } | null>(null);

  useEffect(() => {
    mounted.current = true;
    const clear = () => {
      generation.current++;
      active.current?.controller.abort();
      if (active.current) clearTimeout(active.current.timeout);
      active.current = null;
      if (mounted.current) {
        setBusy(false);
        setResult(null);
      }
    };
    const apply = (session: Session | null) => {
      const next = sessionIdentity(session);
      if (identity.current !== next) { identity.current = next; clear(); }
    };
    let unsubscribe: (() => void) | undefined;
    try {
      const auth = getSupabaseClient().auth;
      const subscription = auth.onAuthStateChange((_event, session) => {
        // The Supabase callback stays synchronous: no nested SDK read under its lock.
        if (!mounted.current) return;
        revision.current++;
        apply(session);
      }).data.subscription;
      unsubscribe = () => subscription.unsubscribe();
      const initialRevision = revision.current;
      void auth.getSession().then(({ data, error }) => {
        if (mounted.current && revision.current === initialRevision) apply(error ? null : data.session);
      }).catch(() => {
        if (mounted.current && revision.current === initialRevision) apply(null);
      });
    } catch { /* A deliberate check will return a generic unavailable result. */ }
    return () => {
      mounted.current = false;
      clear();
      unsubscribe?.();
    };
  }, []);

  async function run(check: Check) {
    if (!mounted.current || active.current) return;
    const runGeneration = ++generation.current;
    const controller = new AbortController();
    const operation = { controller, timeout: setTimeout(() => controller.abort(), 10000) };
    active.current = operation;
    setBusy(true);
    setResult(null);
    const current = () => mounted.current && generation.current === runGeneration && active.current === operation && !controller.signal.aborted;
    try {
      let bearer: string | undefined;
      if (check === 'session') {
        const { data, error } = await untilAborted(getSupabaseClient().auth.getSession(), controller.signal);
        if (!current()) return;
        const session = error ? null : data.session;
        const next = sessionIdentity(session);
        if (identity.current !== undefined && next !== identity.current) {
          identity.current = next;
          setResult({ outcome: 'login_required' });
          return;
        }
        identity.current = next;
        if (session?.user?.is_anonymous !== true && typeof session?.access_token === 'string' && session.access_token.trim()) bearer = session.access_token;
      } else if (check === 'invalid') bearer = 'fake.header.signature';
      if (!current()) return;
      const response = await untilAborted(fetch('/api/sofia-session-check', {
        method: 'GET', credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        headers: bearer ? { Authorization: `Bearer ${bearer}` } : {},
      }), controller.signal);
      const data: unknown = await untilAborted(response.json(), controller.signal);
      if (!current()) return;
      if (response.status === 401 && data && typeof data === 'object' &&
          (data as Record<string, unknown>).error === 'voice_auth_required') {
        setResult({ outcome: check === 'anonymous' ? 'anonymous_rejected' : check === 'invalid' ? 'invalid_rejected' : 'login_required' });
        return;
      }
      const quotas = check === 'session' && bearer && response.status === 200 ? ownQuotas(data) : null;
      setResult(quotas ? { outcome: 'verified', quotas } : { outcome: 'unavailable' });
    } catch {
      if (mounted.current && generation.current === runGeneration && active.current === operation) setResult({ outcome: 'unavailable' });
    } finally {
      clearTimeout(operation.timeout);
      if (active.current === operation) {
        active.current = null;
        if (mounted.current && generation.current === runGeneration) setBusy(false);
      }
    }
  }

  return (
    <section aria-label="Comprobación de sesión y cuotas de Sofía">
      <p>Esta comprobación temporal no inicia audio, no solicita tokens de ElevenLabs y no reserva intentos.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <button type="button" disabled={busy} onClick={() => void run('session')}>Comprobar mi sesión y mis cuotas</button>
        <button type="button" disabled={busy} onClick={() => void run('anonymous')}>Comprobar rechazo sin sesión</button>
        <button type="button" disabled={busy} onClick={() => void run('invalid')}>Comprobar rechazo de sesión inválida</button>
      </div>
      <div role="status" aria-live="polite" style={{ marginTop: 20 }}>
        {busy && <p>Comprobando de forma segura…</p>}
        {!busy && result?.outcome === 'verified' && <>
          <p>Sesión reconocida por el servidor. Identidad verificada con Supabase.</p>
          <p>Cuotas consultadas exclusivamente para tu usuario, sin reservar ni descontar intentos.</p>
          <table>
            <caption>Cuotas de tu cuenta</caption>
            <thead><tr><th>Ventana</th><th>Límite</th><th>Usados</th><th>Restantes</th></tr></thead>
            <tbody>{result.quotas.map(quota => <tr key={quota.window}><th>{windowNames[quota.window]}</th><td>{quota.limit}</td><td>{quota.used}</td><td>{quota.remaining}</td></tr>)}</tbody>
          </table>
          <p>Esta lectura no garantiza una conversación disponible: también se aplican los límites generales y por red.</p>
        </>}
        {!busy && result?.outcome === 'login_required' && <p>El servidor exige una sesión válida. Inicia sesión en DESTINAUTA y vuelve a comprobar.</p>}
        {!busy && result?.outcome === 'anonymous_rejected' && <p>Correcto: el servidor rechaza la consulta sin sesión (401).</p>}
        {!busy && result?.outcome === 'invalid_rejected' && <p>Correcto: el servidor rechaza la sesión inválida (401).</p>}
        {!busy && result?.outcome === 'unavailable' && <p>No se ha podido completar la comprobación segura. No se ha solicitado audio ni reservado ningún intento.</p>}
      </div>
      <p><Link href="/">Volver a DESTINAUTA</Link></p>
    </section>
  );
}
