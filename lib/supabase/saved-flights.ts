import type { NewSavedTrip } from "./saved-trips";

// Pure helpers for the ♡ «Guardar vuelo» button. They only build the `NewSavedTrip` that the existing «Mis viajes»
// list already stores (origin, destination, day, travelers, service "vuelo"). No price is ever saved: the table has no
// column for it and prices change.

const isoDay = /^\d{4}-\d{2}-\d{2}$/;

function validDay(value: unknown): value is string {
  if (typeof value !== "string" || !isoDay.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** «2026-11-25T16:10:00+01:00» → «2026-11-25». Anything that is not a real day gives null. */
export function dayOf(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const day = value.slice(0, 10);
  return validDay(day) ? day : null;
}

export function savedFlight(input: {
  origin?: string | null; destination?: string | null;
  departureDate?: string | null; returnDate?: string | null; travelers?: number | null;
}): NewSavedTrip | null {
  const origin = typeof input.origin === "string" ? input.origin.trim() : "";
  const destination = typeof input.destination === "string" ? input.destination.trim() : "";
  const departure = dayOf(input.departureDate);
  const returning = input.returnDate == null ? null : dayOf(input.returnDate);
  const travelers = input.travelers;
  if (!origin || !destination || !departure) return null;
  if (input.returnDate != null && (!returning || returning < departure)) return null;
  if (typeof travelers !== "number" || !Number.isInteger(travelers) || travelers < 1 || travelers > 9) return null;
  return {
    origin: origin.slice(0, 80), destination: destination.slice(0, 80),
    departure_date: departure, return_date: returning, travelers, service_type: "vuelo",
  };
}

/**
 * Flights shown by the provider's widget for an exact search (`ORG DDMM DEST DDMM travelers`). The provider's address only
 * keeps the airport code, so the origin starts as that code; `typedOriginFor` swaps it for the name typed in the form.
 */
export function savedFlightFromSearch(
  search: string,
  destinationName: string,
  context: { departureDate?: string; returnDate?: string; travelers?: number },
): NewSavedTrip | null {
  // These codes always describe a round trip, so both exact days must be known.
  if (!/^[A-Z]{3}\d{4}[A-Z]{3}\d{4}[1-9]$/.test(search) || !context.departureDate || !context.returnDate) return null;
  return savedFlight({
    origin: search.slice(0, 3), destination: destinationName,
    departureDate: context.departureDate, returnDate: context.returnDate, travelers: context.travelers,
  });
}

export const typedOriginStorageKey = "destinauta.featured-flight-origin";

/** Before leaving for the provider's results: keep the origin the visitor typed, tied to that search code. */
export function rememberTypedOrigin(resultsUrl: string, origin: string) {
  try {
    const code = new URL(resultsUrl, "https://destinauta.com").searchParams.get("flightSearch");
    if (code && origin.trim()) sessionStorage.setItem(typedOriginStorageKey, JSON.stringify({ search: code, origin: origin.trim().slice(0, 80) }));
  } catch { /* «Guardar vuelo» falls back to the airport code. */ }
}

/** The origin typed for exactly this search, or null (another search, nothing stored, storage unavailable). */
export function typedOriginFor(search: string): string | null {
  try {
    const typed = JSON.parse(sessionStorage.getItem(typedOriginStorageKey) ?? "null") as { search?: unknown; origin?: unknown } | null;
    return typed?.search === search && typeof typed.origin === "string" && typed.origin.trim() ? typed.origin.trim().slice(0, 80) : null;
  } catch { return null; }
}

/** One flight of our own list: its own days when it has them, the searched days otherwise. */
export function savedFlightFromOffer(
  offer: { departureAt: string | null; returnAt: string | null },
  query: { origin: string; destination: string; departureDate: string; returnDate: string; travelers: number },
): NewSavedTrip | null {
  return savedFlight({
    origin: query.origin, destination: query.destination,
    departureDate: dayOf(offer.departureAt) ?? query.departureDate,
    returnDate: dayOf(offer.returnAt) ?? query.returnDate, travelers: query.travelers,
  });
}
