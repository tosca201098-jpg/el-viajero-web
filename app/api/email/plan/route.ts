// ENSAYO del envío de correos de vuelos: cuenta a cuántas personas les tocaría hoy y a cuántas se les podría enviar con precios
// reales, SIN enviar nada ni escribir en ninguna tabla. Solo devuelve cantidades: nunca correos, identificadores ni precios.
// Se lanza desde Vercel → Cron Jobs → «Run» (solo en Producción) y deja una línea con el resultado en el registro.
// Sin la clave correcta (CRON_SECRET) responde 401. Si la tabla email_preferences todavía no existe, lo dice y no hace nada más.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { DAILY_SEND_LIMIT } from '@/lib/email/config';
import { sameSecret } from '@/lib/email/guard';
import { logEmailRun } from '@/lib/email/log';
import { readFlightPicks } from '@/lib/email/picks';
import { readConsentingRecipients, readSendHistory } from '@/lib/email/recipients';
import { planRun, summarizePlan } from '@/lib/email/select';
import { EMAIL_SERVICE_LIVE } from '@/lib/email-preferences/options';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return json({ success: false, error: 'not_configured' }, 503);
  if (!sameSecret(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return json({ success: false, error: 'unauthorized' }, 401);
  }
  const client = getSupabaseAdminClient();
  if (!client) return json({ success: false, error: 'not_configured' }, 503);

  const now = new Date();
  const found = await readConsentingRecipients(client);
  if (!found.ok) {
    logEmailRun('plan', { ok: false, reason: 'preferences_unavailable' });
    return json({ success: false, dry: true, error: 'preferences_unavailable' });
  }
  const sends = await readSendHistory(client, found.recipients.map((recipient) => recipient.userId));
  const planned = await planRun({
    recipients: found.recipients,
    history: sends.history,
    now,
    limit: DAILY_SEND_LIMIT,
    loadPicks: (origin, months) => readFlightPicks(client, { origin, months, now }),
  });
  const summary = summarizePlan(planned);
  // Si todavía no se puede leer el historial (tabla email_sends sin crear), se avisa: todos cuentan como «sin envíos previos».
  const result = { ...summary, limit: DAILY_SEND_LIMIT, historyAvailable: sends.ok, live: EMAIL_SERVICE_LIVE };
  logEmailRun('plan', { ok: true, ...result });
  return json({ success: true, dry: true, ...result });
}
