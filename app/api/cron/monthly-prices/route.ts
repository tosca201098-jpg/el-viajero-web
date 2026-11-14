// Tarea diaria de Vercel (Cron): para UN aeropuerto de salida consulta Travelpayouts para los próximos 12 meses y
// guarda en Supabase el último precio real de cada destino (escapada de 2 a 5 noches). Así «Viajes por mes» va
// acumulando precios día a día. Hay una tarea por aeropuerto (ver vercel.json) para no pasar del tiempo permitido.
// Solo la puede lanzar Vercel (o quien tenga CRON_SECRET): sin la clave correcta responde 401.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { collectMonthlyOffers, ProviderError } from '@/lib/travelpayouts/monthly';
import { purgeOldRows, saveOffers } from '@/lib/travelpayouts/monthly-store';
import { findMonthlyOrigin } from '@/lib/travelpayouts/monthly-shared';

/** Tiempo máximo para empezar bloques nuevos de meses; lo que no dé tiempo se hace al día siguiente. */
const TIME_BUDGET_MS = 40000;
/** Meses que se consultan a la vez (cada uno hace 2 peticiones al proveedor). */
const CONCURRENCY = 3;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Comparación sin atajos por longitud del texto, para no dar pistas sobre la clave. */
function sameSecret(received: string, expected: string) {
  let difference = received.length ^ expected.length;
  const length = Math.max(received.length, expected.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (received.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }
  return difference === 0;
}

type MonthResult = { month: number; year?: number; matched?: number; saved?: number; error?: string };

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return json({ success: false, error: 'not_configured' }, 503);
  if (!sameSecret(request.headers.get('authorization') ?? '', `Bearer ${secret}`)) {
    return json({ success: false, error: 'unauthorized' }, 401);
  }

  const token = process.env.TRAVELPAYOUTS_API_TOKEN;
  const client = getSupabaseAdminClient();
  if (!token || !client) return json({ success: false, error: 'not_configured' }, 503);

  const origin = findMonthlyOrigin(new URL(request.url).searchParams.get('origin'));
  if (!origin) return json({ success: false, error: 'invalid_search' }, 400);

  const startedAt = Date.now();
  const now = new Date();
  // Primero el mes en curso y después los once siguientes.
  const months = Array.from({ length: 12 }, (_, index) => ((now.getUTCMonth() + index) % 12) + 1);

  async function refreshMonth(month: number): Promise<MonthResult> {
    try {
      const { year, offers } = await collectMonthlyOffers({ token: token as string, origin: origin!, month, now });
      const saved = await saveOffers(client!, { origin: origin!.code, year, month, offers, now });
      return { month, year, matched: offers.size, saved };
    } catch (error) {
      return { month, error: error instanceof ProviderError ? 'provider_unavailable' : 'storage_error' };
    }
  }

  const results: MonthResult[] = [];
  const skipped: number[] = [];
  for (let start = 0; start < months.length; start += CONCURRENCY) {
    if (Date.now() - startedAt > TIME_BUDGET_MS) {
      skipped.push(...months.slice(start));
      break;
    }
    results.push(...await Promise.all(months.slice(start, start + CONCURRENCY).map(refreshMonth)));
  }

  const purged = await purgeOldRows(client, now);
  const failed = results.filter((result) => result.error).length;
  return json({
    success: failed === 0 && skipped.length === 0,
    origin: origin.code,
    saved: results.reduce((total, result) => total + (result.saved ?? 0), 0),
    failedMonths: failed,
    skippedMonths: skipped,
    purged,
    durationMs: Date.now() - startedAt,
    months: results,
  }, failed > 0 ? 502 : 200);
}
