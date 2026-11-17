// ENVÍO REAL de los correos de vuelos a las personas que dieron su permiso. Mientras EMAIL_SERVICE_LIVE sea false (o falte algún
// dato legal o clave), NO envía nada y responde con el motivo. Se lanza desde Vercel → Cron Jobs (fila /api/email/send) y,
// sin la clave correcta (CRON_SECRET), responde 401.
// Parámetro opcional: ?limit=5 (máximo de correos de esa tanda; sin él, el tope diario). Solo devuelve cantidades.
// Orden de los candados: clave de la tarea → interruptor → datos legales → claves de Resend y de baja → tope → lectura de
// personas y de historial (si el historial no se puede leer NO se envía: se podría repetir un correo).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { DAILY_SEND_LIMIT, EMAIL_FROM, SEND_PACE_MS, SEND_TIME_BUDGET_MS } from '@/lib/email/config';
import { gateStatus, parseSendLimit, sendGate } from '@/lib/email/gate';
import { sameSecret } from '@/lib/email/guard';
import { logEmailRun } from '@/lib/email/log';
import { readFlightPicks } from '@/lib/email/picks';
import { readConsentingRecipients, readSendHistory } from '@/lib/email/recipients';
import { ownerIdentification } from '@/lib/email/render';
import { sendEmail } from '@/lib/email/resend';
import { sendPlanned } from '@/lib/email/sender';
import { claimSend, countSendsToday, finishSend, lookupAccount } from '@/lib/email/send-store';
import { planRun } from '@/lib/email/select';
import { EMAIL_SERVICE_LIVE } from '@/lib/email-preferences/options';
import { LEGAL_IS_DRAFT } from '@/lib/legal/owner';
import { siteUrl } from '@/lib/seo';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return json({ success: false, error: 'not_configured' }, 503);
  if (!sameSecret(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return json({ success: false, error: 'unauthorized' }, 401);
  }

  const gate = sendGate({
    live: EMAIL_SERVICE_LIVE,
    legalDraft: LEGAL_IS_DRAFT,
    legalComplete: ownerIdentification().complete,
    resendKey: process.env.RESEND_API_KEY,
    unsubscribeSecret: process.env.EMAIL_UNSUBSCRIBE_SECRET,
  });
  if (!gate.ok) {
    logEmailRun('send', { ok: false, sent: 0, reason: gate.reason });
    return json({ success: false, sent: 0, error: gate.reason }, gateStatus(gate.reason));
  }

  const limit = parseSendLimit(new URL(request.url).searchParams.get('limit'), DAILY_SEND_LIMIT);
  if (limit === null) return json({ success: false, sent: 0, error: 'invalid_limit' }, 400);
  const client = getSupabaseAdminClient();
  if (!client) return json({ success: false, sent: 0, error: 'not_configured' }, 503);

  const now = new Date();
  // El tope diario cuenta lo ya enviado hoy (también por otras tandas). Si no se puede contar, no se envía.
  const today = await countSendsToday(client, now);
  if (today === null) {
    logEmailRun('send', { ok: false, sent: 0, reason: 'count_unavailable' });
    return json({ success: false, sent: 0, error: 'count_unavailable' }, 503);
  }
  const remaining = DAILY_SEND_LIMIT - today;
  if (remaining <= 0) {
    logEmailRun('send', { ok: true, sent: 0, reason: 'daily_limit_reached', today });
    return json({ success: true, sent: 0, reason: 'daily_limit_reached', today, limit: DAILY_SEND_LIMIT });
  }

  const found = await readConsentingRecipients(client);
  if (!found.ok) {
    logEmailRun('send', { ok: false, sent: 0, reason: 'preferences_unavailable' });
    return json({ success: false, sent: 0, error: 'preferences_unavailable' }, 503);
  }
  const sends = await readSendHistory(client, found.recipients.map((recipient) => recipient.userId));
  if (!sends.ok) {
    logEmailRun('send', { ok: false, sent: 0, reason: 'history_unavailable' });
    return json({ success: false, sent: 0, error: 'history_unavailable' }, 503);
  }

  const planned = await planRun({
    recipients: found.recipients,
    history: sends.history,
    now,
    limit: Math.min(limit, remaining),
    loadPicks: (origin, months) => readFlightPicks(client, { origin, months, now }),
  });

  const summary = await sendPlanned(planned, {
    apiKey: gate.apiKey,
    from: EMAIL_FROM,
    siteUrl,
    unsubscribeSecret: gate.unsubscribeSecret,
    limit: Math.min(limit, remaining),
    paceMs: SEND_PACE_MS,
    timeBudgetMs: Math.max(0, SEND_TIME_BUDGET_MS - (Date.now() - startedAt)),
    planNow: now,
  }, {
    claim: (item) => claimSend(client, item),
    finish: (id, result) => finishSend(client, id, result),
    lookup: (userId) => lookupAccount(client, userId),
    send: (options) => sendEmail(options),
    now: () => Date.now(),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  });

  // Solo cantidades: nunca correos, identificadores de cuenta, destinos ni precios.
  const result = { ...summary, stopped: summary.stopped ?? 'none', todayBefore: today, limit: Math.min(limit, remaining) };
  logEmailRun('send', { ok: true, ...result });
  return json({ success: true, ...result });
}
