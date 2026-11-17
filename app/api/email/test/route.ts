// Correo de PRUEBA con vuelos reales: manda UN solo correo, al propietario, con los precios que ya guarda la web
// (tabla `monthly_prices`). No lee ni toca a ningún usuario, no usa el cuestionario de «Mi cuenta» y no sirve para
// enviar a otras personas: el destinatario sale de la variable de Vercel EMAIL_TEST_RECIPIENT y no se puede cambiar
// con la dirección de la ruta.
// Se lanza desde Vercel → Cron Jobs → «Run» (solo en Producción). Sin la clave correcta (CRON_SECRET) responde 401.
// Si no hay al menos 3 destinos con precio real y reciente, NO envía nada (nunca se rellena con precios inventados).
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

import { EMAIL_FROM, TEST_BANNER, TEST_REASON } from '@/lib/email/config';
import { BUDGET_LIMITS, MAX_PICKS, MIN_PICKS, choosePicks, readFlightPicks } from '@/lib/email/picks';
import { isSingleEmailAddress, sameSecret } from '@/lib/email/guard';
import { logEmailRun } from '@/lib/email/log';
import { renderFlightEmail } from '@/lib/email/render';
import { sendEmail } from '@/lib/email/resend';
import { FLIGHT_BUDGETS, type FlightBudget } from '@/lib/email-preferences/options';
import { isLocale, type Locale } from '@/lib/i18n/translations';
import { siteUrl } from '@/lib/seo';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_ORIGIN_CODE, findMonthlyOrigin } from '@/lib/travelpayouts/monthly-shared';

const MAX_MONTHS = 4;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Meses pedidos («3,6»): sin repetir, del 1 al 12 y como mucho 4. Sin parámetro: los dos meses siguientes. */
function parseMonths(value: string | null, now: Date): number[] | null {
  if (value === null || value === '') {
    const current = now.getUTCMonth();
    return [((current + 1) % 12) + 1, ((current + 2) % 12) + 1];
  }
  const months = value.split(',').map((part) => (/^\d{1,2}$/.test(part.trim()) ? Number(part.trim()) : NaN));
  if (months.length > MAX_MONTHS || months.some((month) => !Number.isInteger(month) || month < 1 || month > 12) ||
    new Set(months).size !== months.length) return null;
  return months;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return json({ success: false, error: 'not_configured' }, 503);
  if (!sameSecret(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return json({ success: false, error: 'unauthorized' }, 401);
  }

  const params = new URL(request.url).searchParams;
  const now = new Date();
  const origin = findMonthlyOrigin(params.get('origin') ?? DEFAULT_ORIGIN_CODE);
  const months = parseMonths(params.get('months'), now);
  const budgetParam = params.get('budget') ?? 'any';
  const localeParam = params.get('locale') ?? 'es';
  const dryRun = params.get('dry') === '1';
  if (!origin || !months || !(FLIGHT_BUDGETS as readonly string[]).includes(budgetParam) || !isLocale(localeParam)) {
    return json({ success: false, error: 'invalid_search' }, 400);
  }
  const budget = budgetParam as FlightBudget;
  const locale: Locale = localeParam;

  const client = getSupabaseAdminClient();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const recipient = process.env.EMAIL_TEST_RECIPIENT;
  if (!client || (!dryRun && (!apiKey || !isSingleEmailAddress(recipient)))) {
    return json({ success: false, error: 'not_configured' }, 503);
  }

  const found = await readFlightPicks(client, { origin: origin.code, months, now });
  const maxPrice = BUDGET_LIMITS[budget];
  const picks = choosePicks(found, { limit: MAX_PICKS, maxPrice });
  if (picks.length < MIN_PICKS) {
    // Sin suficientes precios reales no se envía nada: el correo nunca se rellena con datos inventados.
    logEmailRun('test', { ok: false, sent: false, reason: 'not_enough_data', found: picks.length, needed: MIN_PICKS });
    return json({ success: false, sent: false, error: 'not_enough_data', found: picks.length, needed: MIN_PICKS });
  }

  const email = renderFlightEmail({
    locale, originCode: origin.code, months, maxPrice, picks, now, siteUrl, banner: TEST_BANNER, reason: TEST_REASON,
  });
  const summary = picks.map(({ offer }) => ({ id: offer.profile.id, price: Math.ceil(offer.price) }));
  if (dryRun) return json({ success: true, sent: false, dry: true, subject: email.subject, picks: summary });

  const result = await sendEmail({
    apiKey: apiKey as string,
    from: EMAIL_FROM,
    to: recipient as string,
    subject: email.subject,
    html: email.html,
    text: email.text,
    tags: [{ name: 'category', value: 'flights_test' }],
  });
  // La respuesta nunca incluye la clave ni la dirección del destinatario.
  if (!result.ok) {
    logEmailRun('test', { ok: false, sent: false, reason: 'email_provider_error', status: result.status });
    return json({ success: false, sent: false, error: 'email_provider_error', status: result.status }, 502);
  }
  logEmailRun('test', { ok: true, sent: true, picks: picks.length });
  return json({ success: true, sent: true, id: result.id, subject: email.subject, picks: summary });
}
