export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { findDestinationProfile } from '@/lib/destinations';
import { isRecord, matchingDestinationProfile, offerUrl, resolveCity } from '@/lib/travelpayouts/places';

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function monthsInWindow(value: string, days: number) {
  return Array.from(new Set([shiftDate(value, -days).slice(0, 7), shiftDate(value, days).slice(0, 7)]));
}

function errorResponse(error: string, status: number) {
  return Response.json(
    { success: false, error },
    { status, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function GET(request: Request) {
  const token = process.env.TRAVELPAYOUTS_API_TOKEN;
  if (!token) return errorResponse('not_configured', 503);

  const params = new URL(request.url).searchParams;
  const originInput = params.get('origin')?.trim() ?? '';
  const destinationInput = params.get('destination')?.trim() ?? '';
  const departureDate = params.get('departureDate') ?? '';
  const returnDate = params.get('returnDate') ?? '';
  const travelers = Number(params.get('travelers'));
  const budgetInput = params.get('budget');
  const budgetType = params.get('budgetType');
  const budget = budgetInput === null ? null : Number(budgetInput);
  const flexInput = params.get('flexDays');
  const flexDays = flexInput === null ? null : Number(flexInput);

  if (
    !originInput || !destinationInput ||
    originInput.length > 100 || destinationInput.length > 100 ||
    !validDate(departureDate) || !validDate(returnDate) ||
    !Number.isInteger(travelers) || travelers < 1 || travelers > 9 ||
    (budget !== null && (!Number.isFinite(budget) || budget <= 0 || budget > 10000000 ||
      (budgetType !== 'total' && budgetType !== 'por_persona'))) ||
    (budget === null && budgetType !== null) ||
    (flexDays !== null && ![1, 3, 7].includes(flexDays)) ||
    (flexDays !== null && budget !== null)
  ) return errorResponse('invalid_search', 400);
  if (returnDate < departureDate) return errorResponse('invalid_dates', 400);

  try {
    const [destinationName, destinationCountry] = destinationInput.split(',').map((part) => part.trim());
    const knownDestination = matchingDestinationProfile(destinationName, destinationCountry);
    if (knownDestination && knownDestination.iataCodes.length === 0) {
      const origin = await resolveCity(originInput);
      if (!origin) return errorResponse('unknown_origin', 422);
      return Response.json({
        success: true,
        origin,
        destination: { name: knownDestination.name, code: '' },
        results: [],
      }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const [origin, destination] = await Promise.all([
      resolveCity(originInput),
      resolveCity(destinationInput),
    ]);
    if (!origin) return errorResponse('unknown_origin', 422);
    if (!destination) return errorResponse('unknown_destination', 422);

    const maxPrice = budget === null ? null : budgetType === 'total' ? budget / travelers : budget;
    if (maxPrice !== null && maxPrice < 1) {
      return Response.json({ success: true, origin, destination, results: [] },
        { headers: { 'Cache-Control': 'no-store' } });
    }

    const url = new URL(budget === null
      ? 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates'
      : 'https://api.travelpayouts.com/aviasales/v3/search_by_price_range');
    url.searchParams.set('origin', origin.code);
    url.searchParams.set('destination', destination.code);
    url.searchParams.set('one_way', 'false');
    url.searchParams.set('currency', 'EUR');
    url.searchParams.set('limit', flexDays === null ? (budget === null ? '10' : '100') : '1000');
    if (budget === null) {
      if (flexDays === null) {
        url.searchParams.set('departure_at', departureDate);
        url.searchParams.set('return_at', returnDate);
      }
      url.searchParams.set('sorting', 'price');
    } else {
      url.searchParams.set('value_max', String(Math.floor(maxPrice! * 100) / 100));
    }

    // prices_for_dates accepts YYYY-MM: one request per distinct departure/return month pair.
    // A ±7-day window spans at most two months on each side, so this is capped at four requests.
    const urls = flexDays === null ? [url] : monthsInWindow(departureDate, flexDays).flatMap((departureMonth) =>
      monthsInWindow(returnDate, flexDays).map((returnMonth) => {
        const monthlyUrl = new URL(url);
        monthlyUrl.searchParams.set('departure_at', departureMonth);
        monthlyUrl.searchParams.set('return_at', returnMonth);
        return monthlyUrl;
      }));
    const responses = await Promise.all(urls.map((requestUrl) => fetch(requestUrl, {
      headers: { Accept: 'application/json', 'X-Access-Token': token },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })));
    if (responses.some((response) => !response.ok)) return errorResponse('provider_unavailable', 502);

    const payloads: unknown[] = await Promise.all(responses.map((response) => response.json()));
    if (payloads.some((payload) => !isRecord(payload) || payload.success !== true ||
      !Array.isArray(payload.data) ||
      (typeof payload.currency === 'string' && payload.currency.toUpperCase() !== 'EUR'))) {
      return errorResponse('provider_unavailable', 502);
    }
    const records = payloads.flatMap((payload) => (payload as { data: unknown[] }).data);
    const earliestDeparture = flexDays === null ? '' : shiftDate(departureDate, -flexDays);
    const latestDeparture = flexDays === null ? '' : shiftDate(departureDate, flexDays);
    const earliestReturn = flexDays === null ? '' : shiftDate(returnDate, -flexDays);
    const latestReturn = flexDays === null ? '' : shiftDate(returnDate, flexDays);

    const sortedResults = (flexDays === null && budget === null ? records.slice(0, 10) : records).filter(isRecord).map((flight) => ({
      origin: typeof flight.origin_code === 'string' && /^[A-Z]{3}$/.test(flight.origin_code) ? flight.origin_code
        : typeof flight.origin === 'string' && /^[A-Z]{3}$/.test(flight.origin) ? flight.origin : origin.code,
      destination: typeof flight.destination_code === 'string' && /^[A-Z]{3}$/.test(flight.destination_code) ? flight.destination_code
        : typeof flight.destination === 'string' && /^[A-Z]{3}$/.test(flight.destination) ? flight.destination : destination.code,
      price: typeof flight.price === 'number' && Number.isFinite(flight.price) && flight.price > 0 ? flight.price : null,
      departureAt: typeof flight.departure_at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(flight.departure_at) ? flight.departure_at : null,
      returnAt: typeof flight.return_at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(flight.return_at) ? flight.return_at : null,
      airline: typeof flight.airline === 'string' && /^[A-Z0-9]{2,3}$/.test(flight.airline) ? flight.airline : null,
      transfers: typeof flight.transfers === 'number' && Number.isInteger(flight.transfers) && flight.transfers >= 0 ? flight.transfers : null,
      offerUrl: offerUrl(flight.link),
    })).filter((flight) =>
      flight.price !== null && flight.origin === origin.code && flight.destination === destination.code &&
      (flexDays !== null
        ? flight.departureAt !== null && flight.returnAt !== null &&
          flight.departureAt.slice(0, 10) >= earliestDeparture && flight.departureAt.slice(0, 10) <= latestDeparture &&
          flight.returnAt.slice(0, 10) >= earliestReturn && flight.returnAt.slice(0, 10) <= latestReturn &&
          flight.returnAt.slice(0, 10) >= flight.departureAt.slice(0, 10)
        : maxPrice === null || (flight.price <= maxPrice && flight.departureAt?.slice(0, 10) === departureDate &&
          (!flight.returnAt || flight.returnAt.slice(0, 10) === returnDate)))
    ).sort((a, b) => a.price! - b.price!);
    const seenDates = new Set<string>();
    const results = sortedResults.filter((flight) => {
      if (flexDays === null) return true;
      const dates = `${flight.departureAt!.slice(0, 10)}:${flight.returnAt!.slice(0, 10)}`;
      if (seenDates.has(dates)) return false;
      seenDates.add(dates);
      return true;
    }).slice(0, 10);

    return Response.json(
      { success: true, origin, destination, results },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return errorResponse('provider_unavailable', 502);
  }
}
