/**
 * Sofía's flight search looks in the list of recent prices for the exact days the person gave. That list has nothing for many
 * routes and dates (Rome, for example), which used to end in «no hay vuelos». When the exact days have no price, one more
 * search looks at the days around them (the same «flexible dates» search the form offers); every price it returns is real
 * and carries its own dates. A budget search is never widened: the budget already decides what is shown.
 */
export const NEARBY_DAYS = 7 as const;

type Outcome = { status: string; offers?: unknown[] };

export async function searchWithNearbyDays<Q extends { budget?: unknown; flexDays?: unknown }, R extends Outcome>(
  run: (query: Q) => Promise<R>,
  query: Q,
): Promise<{ result: R; nearbyDays?: typeof NEARBY_DAYS }> {
  const exact = await run(query);
  const noPriceForExactDays = exact.status === 'success' && Array.isArray(exact.offers) && exact.offers.length === 0;
  if (!noPriceForExactDays || query.budget || query.flexDays) return { result: exact };
  const nearby = await run({ ...query, flexDays: NEARBY_DAYS });
  // A failure or a cancellation of the second search is what Sofía (and the screen) must report, not the empty first one.
  return nearby.status === 'success' && Array.isArray(nearby.offers) ? { result: nearby, nearbyDays: NEARBY_DAYS } : { result: nearby };
}
