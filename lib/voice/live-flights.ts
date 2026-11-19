import { isWhiteLabelFlightSearch } from '@/lib/travelpayouts/white-label';

/**
 * The provider's live list of flights (the one the visitor gets from the home form) cannot be read as data: it only draws
 * itself on a page. Sofía shows it by opening that search inside the card, in a frame of its own. This file finds the
 * search code the provider needs (the same endpoint the home form uses) and builds the address of that frame.
 */
export type LiveFlightQuery = { origin: string; destination: string; departureDate: string; returnDate: string; travelers: number };

/** Same trip, same code: the screen shows the frame only next to the results of that exact search. */
export const liveFlightKey = (query: LiveFlightQuery) =>
  [query.origin, query.destination, query.departureDate, query.returnDate, query.travelers].map(part => String(part).trim().toLowerCase()).join('|');

/** Address of the minimal page that draws the live list for one valid search code, or null. */
export const liveFlightsSrc = (code: unknown): string | null =>
  isWhiteLabelFlightSearch(code) ? `/vuelos-en-vivo?flightSearch=${encodeURIComponent(code)}` : null;

type Post = (url: string, init: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) =>
  Promise<{ ok: boolean; json: () => Promise<unknown> }>;

/** The search code of the live list for this trip, or null (unknown place, past day, provider down, cancelled…). Never throws. */
export async function liveFlightCode(query: LiveFlightQuery, signal?: AbortSignal, post?: Post): Promise<string | null> {
  try {
    const send: Post = post ?? ((url, init) => fetch(url, init));
    const response = await send('/api/travelpayouts/flight-link', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, ...(signal ? { signal } : {}),
      body: JSON.stringify({ origin: query.origin, destination: query.destination, departureDate: query.departureDate,
        returnDate: query.returnDate, travelers: query.travelers }),
    });
    const data = await response.json() as { success?: unknown; url?: unknown } | null;
    if (!response.ok || data?.success !== true || typeof data.url !== 'string' || !/^\/(?!\/)/.test(data.url)) return null;
    const code = new URL(data.url, 'https://destinauta.com').searchParams.get('flightSearch');
    return isWhiteLabelFlightSearch(code) ? code : null;
  } catch { return null; }
}
