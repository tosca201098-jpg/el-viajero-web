export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { findDestinationProfile } from '@/lib/destinations';
import { isRecord, offerUrl, resolveCity } from '@/lib/travelpayouts/places';

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function errorResponse(error: string, status: number) {
  return Response.json({ success: false, error },
    { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: Request) {
  const token = process.env.TRAVELPAYOUTS_API_TOKEN;
  if (!token) return errorResponse('not_configured', 503);

  const params = new URL(request.url).searchParams;
  const originInput = params.get('origin')?.trim() ?? '';
  const departureDate = params.get('departureDate') ?? '';
  const returnDate = params.get('returnDate') ?? '';
  const travelers = Number(params.get('travelers'));
  const budget = Number(params.get('budget'));
  const budgetType = params.get('budgetType');
  if (!originInput || originInput.length > 100 ||
    !validDate(departureDate) || !validDate(returnDate) || returnDate < departureDate ||
    !Number.isInteger(travelers) || travelers < 1 || travelers > 9 ||
    !Number.isFinite(budget) || budget <= 0 || budget > 10000000 ||
    (budgetType !== 'total' && budgetType !== 'por_persona')) {
    return errorResponse('invalid_search', 400);
  }

  try {
    const origin = await resolveCity(originInput);
    if (!origin) return errorResponse('unknown_origin', 422);
    const maxPrice = budgetType === 'total' ? budget / travelers : budget;
    if (maxPrice < 1) return Response.json({ success: true, origin, counts: {
      providerResults: 0, profileMatches: 0, withinBudget: 0,
    }, results: [] }, { headers: { 'Cache-Control': 'no-store' } });

    const url = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
    url.searchParams.set('origin', origin.code);
    url.searchParams.set('departure_at', departureDate);
    url.searchParams.set('return_at', returnDate);
    url.searchParams.set('one_way', 'false');
    url.searchParams.set('unique', 'true');
    url.searchParams.set('sorting', 'price');
    url.searchParams.set('currency', 'EUR');
    url.searchParams.set('limit', '1000');

    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'X-Access-Token': token },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return errorResponse('provider_unavailable', 502);
    const payload: unknown = await response.json();
    if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data) ||
      (typeof payload.currency === 'string' && payload.currency.toUpperCase() !== 'EUR')) {
      return errorResponse('provider_unavailable', 502);
    }

    const candidates = payload.data.filter(isRecord).map((flight) => {
      const flightOrigin = typeof flight.origin === 'string' && /^[A-Z]{3}$/.test(flight.origin)
        ? flight.origin : typeof flight.origin_code === 'string' && /^[A-Z]{3}$/.test(flight.origin_code)
          ? flight.origin_code : '';
      const destinationCode = typeof flight.destination === 'string' && /^[A-Z]{3}$/.test(flight.destination)
        ? flight.destination : typeof flight.destination_code === 'string' && /^[A-Z]{3}$/.test(flight.destination_code)
          ? flight.destination_code : '';
      const profile = findDestinationProfile({ iataCode: destinationCode });
      const price = typeof flight.price === 'number' && Number.isFinite(flight.price) ? flight.price : 0;
      const departureAt = typeof flight.departure_at === 'string' ? flight.departure_at : '';
      const returnAt = typeof flight.return_at === 'string' ? flight.return_at : '';
      return { flightOrigin, destinationCode, profile, price, departureAt, returnAt,
        airline: typeof flight.airline === 'string' && /^[A-Z0-9]{2,3}$/.test(flight.airline) ? flight.airline : null,
        transfers: typeof flight.transfers === 'number' && Number.isInteger(flight.transfers) && flight.transfers >= 0
          ? flight.transfers : null,
        offerUrl: offerUrl(flight.link),
      };
    });
    const profileMatches = new Set(candidates.filter((item) => item.flightOrigin === origin.code && item.profile?.image)
      .map((item) => item.destinationCode)).size;
    const withinBudget = candidates.filter((item) => item.flightOrigin === origin.code && item.price > 0 && item.price <= maxPrice).length;
    const cheapestByDestination = new Map<string, typeof candidates[number]>();
    for (const item of candidates) {
      if (item.flightOrigin !== origin.code || !item.profile?.image || !item.offerUrl || item.price <= 0 || item.price > maxPrice ||
        item.departureAt.slice(0, 10) !== departureDate || item.returnAt.slice(0, 10) !== returnDate) continue;
      const previous = cheapestByDestination.get(item.destinationCode);
      if (!previous || item.price < previous.price) cheapestByDestination.set(item.destinationCode, item);
    }
    const results = Array.from(cheapestByDestination.values()).sort((a, b) => a.price - b.price).map((item) => ({
      destination: { code: item.destinationCode, name: item.profile!.name, country: item.profile!.country,
        image: item.profile!.image, recommendedStay: item.profile!.recommendedStay },
      offer: { origin: origin.code, destination: item.destinationCode, price: item.price,
        departureAt: item.departureAt, returnAt: item.returnAt, airline: item.airline,
        transfers: item.transfers, offerUrl: item.offerUrl },
    }));
    return Response.json({ success: true, origin, counts: {
      providerResults: payload.data.length, profileMatches, withinBudget,
    }, results }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return errorResponse('provider_unavailable', 502);
  }
}
