export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type City = { name: string; code: string };
type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es');
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function errorResponse(error: string, status: number) {
  return Response.json(
    { success: false, error },
    { status, headers: { 'Cache-Control': 'no-store' } }
  );
}

async function resolveCity(input: string): Promise<City | null> {
  const [cityInput, countryInput] = input.split(',').map((part) => part.trim());
  const url = new URL('https://autocomplete.travelpayouts.com/places2');
  url.searchParams.set('term', cityInput);
  url.searchParams.set('locale', 'es');
  url.searchParams.set('types[]', 'city');

  const response = await fetch(url, {
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('City lookup failed');

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error('Invalid city lookup response');

  const matches = payload
    .filter(isRecord)
    .filter((place) => {
      if (
        place.type !== 'city' ||
        typeof place.name !== 'string' ||
        typeof place.code !== 'string' ||
        !/^[A-Z]{3}$/.test(place.code)
      ) return false;
      const nameMatches =
        normalize(place.name) === normalize(cityInput) ||
        place.code.toLowerCase() === cityInput.toLowerCase() ||
        (Array.isArray(place.index_strings) &&
          place.index_strings.some(
            (alias: unknown) => typeof alias === 'string' && normalize(alias) === normalize(cityInput)
          ));
      const countryMatches = !countryInput ||
        (typeof place.country_name === 'string' && normalize(place.country_name) === normalize(countryInput)) ||
        (typeof place.country_code === 'string' && normalize(place.country_code) === normalize(countryInput));
      return nameMatches && countryMatches;
    })
    .sort((a, b) =>
      (typeof b.weight === 'number' ? b.weight : 0) -
      (typeof a.weight === 'number' ? a.weight : 0)
    );

  const city = matches[0];
  return city ? { name: city.name as string, code: city.code as string } : null;
}

function offerUrl(value: unknown) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value, 'https://www.aviasales.com');
    return url.protocol === 'https:' && !url.username && !url.password &&
      (url.hostname === 'www.aviasales.com' || url.hostname === 'aviasales.com') &&
      url.pathname.startsWith('/search/')
      ? url.toString()
      : null;
  } catch {
    return null;
  }
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

  if (
    !originInput || !destinationInput ||
    originInput.length > 100 || destinationInput.length > 100 ||
    !validDate(departureDate) || !validDate(returnDate) ||
    !Number.isInteger(travelers) || travelers < 1 || travelers > 9
  ) return errorResponse('invalid_search', 400);
  if (returnDate < departureDate) return errorResponse('invalid_dates', 400);

  try {
    const [origin, destination] = await Promise.all([
      resolveCity(originInput),
      resolveCity(destinationInput),
    ]);
    if (!origin) return errorResponse('unknown_origin', 422);
    if (!destination) return errorResponse('unknown_destination', 422);

    const url = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
    url.searchParams.set('origin', origin.code);
    url.searchParams.set('destination', destination.code);
    url.searchParams.set('departure_at', departureDate);
    url.searchParams.set('return_at', returnDate);
    url.searchParams.set('one_way', 'false');
    url.searchParams.set('currency', 'EUR');
    url.searchParams.set('sorting', 'price');
    url.searchParams.set('limit', '10');

    const response = await fetch(url, {
      headers: { Accept: 'application/json', 'X-Access-Token': token },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return errorResponse('provider_unavailable', 502);

    const payload: unknown = await response.json();
    if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data)) {
      return errorResponse('provider_unavailable', 502);
    }
    if (typeof payload.currency === 'string' && payload.currency.toUpperCase() !== 'EUR') {
      return errorResponse('provider_unavailable', 502);
    }

    const results = payload.data.slice(0, 10).filter(isRecord).map((flight) => ({
      origin: typeof flight.origin === 'string' && /^[A-Z]{3}$/.test(flight.origin) ? flight.origin : origin.code,
      destination: typeof flight.destination === 'string' && /^[A-Z]{3}$/.test(flight.destination) ? flight.destination : destination.code,
      price: typeof flight.price === 'number' && Number.isFinite(flight.price) && flight.price > 0 ? flight.price : null,
      departureAt: typeof flight.departure_at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(flight.departure_at) ? flight.departure_at : null,
      returnAt: typeof flight.return_at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(flight.return_at) ? flight.return_at : null,
      airline: typeof flight.airline === 'string' && /^[A-Z0-9]{2,3}$/.test(flight.airline) ? flight.airline : null,
      transfers: typeof flight.transfers === 'number' && Number.isInteger(flight.transfers) && flight.transfers >= 0 ? flight.transfers : null,
      offerUrl: offerUrl(flight.link),
    })).filter((flight) =>
      flight.price !== null && flight.origin === origin.code && flight.destination === destination.code
    );

    return Response.json(
      { success: true, origin, destination, results },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return errorResponse('provider_unavailable', 502);
  }
}
