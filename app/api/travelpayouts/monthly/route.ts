export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { getMonthlyBlocks, isValidMonth } from '@/lib/travelpayouts/monthly';
import { DEFAULT_ORIGIN_CODE, findMonthlyOrigin, type MonthlyOffersResponse } from '@/lib/travelpayouts/monthly-shared';

// Las respuestas buenas se guardan en la caché de Vercel unas horas: todas las personas que miran el mismo
// mes y aeropuerto comparten una sola consulta a Travelpayouts. Si no hay ni un precio, la caché es corta.
const CACHE_WITH_PRICES = 'public, s-maxage=7200, stale-while-revalidate=21600';
const CACHE_WITHOUT_PRICES = 'public, s-maxage=600, stale-while-revalidate=1800';

function errorResponse(error: string, status: number) {
  return Response.json({ success: false, error }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: Request) {
  const token = process.env.TRAVELPAYOUTS_API_TOKEN;
  if (!token) return errorResponse('not_configured', 503);

  const params = new URL(request.url).searchParams;
  const month = Number(params.get('month'));
  const origin = findMonthlyOrigin(params.get('origin') ?? DEFAULT_ORIGIN_CODE);
  if (!isValidMonth(month) || !origin) return errorResponse('invalid_search', 400);

  try {
    const { year, counts, spain, international } = await getMonthlyBlocks({ token, origin, month });
    const body: MonthlyOffersResponse & { counts?: typeof counts } = {
      success: true, month, year, origin, generatedAt: new Date().toISOString(), spain, international,
    };
    // `?debug=1` añade los recuentos de la consulta (útil para revisar la Preview); no incluye datos privados.
    if (params.get('debug') === '1') body.counts = counts;
    const priced = [...spain, ...international].some((card) => card.price !== null);
    return Response.json(body, { headers: { 'Cache-Control': priced ? CACHE_WITH_PRICES : CACHE_WITHOUT_PRICES } });
  } catch {
    return errorResponse('provider_unavailable', 502);
  }
}
