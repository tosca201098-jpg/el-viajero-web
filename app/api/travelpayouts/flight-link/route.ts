import { matchingDestinationProfile, resolveCity } from '@/lib/travelpayouts/places';
import { whiteLabelFlightSearch } from '@/lib/travelpayouts/white-label';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  let input: Record<string, unknown>;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body');
    input = body as Record<string, unknown>;
  } catch {
    return Response.json({ success: false, error: 'invalid_search' }, { status: 400 });
  }
  const originInput = input.origin;
  const destinationInput = input.destination;
  if (typeof originInput !== 'string' || typeof destinationInput !== 'string' ||
    !originInput.trim() || !destinationInput.trim() || originInput.length > 100 || destinationInput.length > 100 ||
    typeof input.departureDate !== 'string' || typeof input.returnDate !== 'string' ||
    typeof input.travelers !== 'number' || input.budget !== undefined || input.flexDays !== undefined) {
    return Response.json({ success: false, error: 'invalid_search' }, { status: 400 });
  }
  const [destinationName, destinationCountry] = destinationInput.split(',').map(part => part.trim());
  const known = matchingDestinationProfile(destinationName, destinationCountry);
  if (known && known.iataCodes.length === 0) {
    return Response.json({ success: false, error: 'unknown_destination' }, { status: 422 });
  }
  try {
    const [origin, destination] = await Promise.all([
      resolveCity(originInput.trim()), resolveCity(destinationInput.trim()),
    ]);
    if (!origin || !destination) {
      return Response.json({ success: false, error: !origin ? 'unknown_origin' : 'unknown_destination' }, { status: 422 });
    }
    const flightSearch = whiteLabelFlightSearch({ origin: origin.code, destination: destination.code,
      departureDate: input.departureDate, returnDate: input.returnDate, travelers: input.travelers });
    if (!flightSearch) return Response.json({ success: false, error: 'invalid_search' }, { status: 400 });
    return Response.json({ success: true, url: `/vuelos?flightSearch=${flightSearch}` },
      { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ success: false, error: 'provider_unavailable' }, { status: 502 });
  }
}
