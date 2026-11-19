import { searchWithNearbyDays, type NEARBY_DAYS } from './nearby-days';
import { liveFlightCode, type LiveFlightQuery } from './live-flights';

type Outcome = { status: string; offers?: unknown[] };

/**
 * What Sofía does when someone gives her a trip to search, in one place:
 * - the saved recent prices for the exact days, as always (these are the numbers she may say aloud);
 * - the provider's live list for the same trip, which the card shows in a frame (she cannot read it, the person can);
 * - only when there is no live list (unknown place, provider down), the days around the asked ones if the exact days
 *   have no saved price (see nearby-days.ts).
 * A budget search or an already flexible one has no live list: the budget or the flexible window already decides the result.
 */
export async function searchVoiceFlights<Q extends LiveFlightQuery & { budget?: unknown; flexDays?: unknown }, R extends Outcome>(
  run: (query: Q) => Promise<R>,
  query: Q,
  signal?: AbortSignal,
  findLiveCode: typeof liveFlightCode = liveFlightCode,
): Promise<{ result: R; nearbyDays?: typeof NEARBY_DAYS; liveCode?: string }> {
  const wantsLive = !query.budget && !query.flexDays;
  // Both searches start together. A failure to find the live list never stops the saved-prices search.
  const live = wantsLive ? (async () => findLiveCode(query, signal))().catch(() => null) : Promise.resolve(null);
  const [liveCode, exact] = await Promise.all([live, run(query)]);
  if (exact.status === 'success' && liveCode) return { result: exact, liveCode };
  // Without a live list: the same rule as before, reusing the exact search that has just been made.
  return searchWithNearbyDays((search) => search === query ? Promise.resolve(exact) : run(search), query);
}
