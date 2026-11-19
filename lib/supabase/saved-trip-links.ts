import { hotelsHref, localCalendarDate, validHotelDates } from "@/lib/stay22/hotels";
import { rememberTypedOrigin } from "./saved-flights";
import type { SavedTrip } from "./saved-trips";

// «Mis viajes» → back to the results of a saved trip. Nothing new is stored and no price is ever shown here: the saved
// trip only remembers the search (origin, destination, days, travelers), so «Ver vuelos» repeats that search through the
// same endpoint as the home form, and «Ver hoteles» opens the hotels map with the same days and guests.

export type SavedTripSearch = Pick<SavedTrip, "origin" | "destination" | "departure_date" | "return_date" | "travelers" | "service_type">;

/** Why a saved trip cannot be opened again. Each one has its own translated sentence in «Mis viajes». */
export type OpenProblem = "pastDate" | "incomplete" | "unknownPlace" | "unavailable";

export const openProblemKeys = {
  pastDate: "trips.openPastDate",
  incomplete: "trips.openIncomplete",
  unknownPlace: "trips.openUnknownPlace",
  unavailable: "trips.openUnavailable",
} as const satisfies Record<OpenProblem, string>;

export type FlightRequest = { origin: string; destination: string; departureDate: string; returnDate: string; travelers: number };

export const canSearchFlights = (trip: Pick<SavedTripSearch, "service_type">) => trip.service_type !== "hotel";
export const canSearchHotels = (trip: Pick<SavedTripSearch, "service_type">) => trip.service_type !== "vuelo";

/** The exact search to repeat for a saved flight, or the reason it cannot be repeated (an old day is never searched). */
export function savedTripFlightRequest(trip: SavedTripSearch, today = new Date()): { request: FlightRequest } | { problem: OpenProblem } {
  const origin = trip.origin?.trim() ?? "";
  const destination = trip.destination.trim();
  // The provider only sells round trips with a return day after the departure, for 1 to 9 travelers.
  if (!origin || !destination || !trip.return_date || trip.return_date <= trip.departure_date ||
      !Number.isInteger(trip.travelers) || trip.travelers < 1 || trip.travelers > 9) return { problem: "incomplete" };
  if (trip.departure_date < localCalendarDate(today)) return { problem: "pastDate" };
  return { request: { origin, destination, departureDate: trip.departure_date, returnDate: trip.return_date, travelers: trip.travelers } };
}

/** Local address of the hotels page for a saved hotel trip, or the reason it cannot be opened. */
export function savedTripHotelHref(trip: SavedTripSearch, today = new Date()): { href: string } | { problem: OpenProblem } {
  const destination = trip.destination.trim();
  if (!destination || !trip.return_date || trip.return_date <= trip.departure_date ||
      !Number.isInteger(trip.travelers) || trip.travelers < 1 || trip.travelers > 10) return { problem: "incomplete" };
  if (trip.departure_date < localCalendarDate(today)) return { problem: "pastDate" };
  if (!validHotelDates(trip.departure_date, trip.return_date, today)) return { problem: "incomplete" };
  return { href: hotelsHref({ destination, checkin: trip.departure_date, checkout: trip.return_date, adults: String(trip.travelers) }) };
}

/** Only an address inside this website is ever followed (never «//other.site» or «https://…»). */
export const isLocalPath = (value: unknown): value is string => typeof value === "string" && /^\/(?!\/)/.test(value);

type Deps = {
  fetchJson?: (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;
  navigate?: (url: string) => void;
  today?: Date;
};

/**
 * Repeats the saved flight search and goes to its results (the same page the home form leads to). Resolves to null when it
 * navigated, or to the problem to show; it never throws.
 */
export async function openSavedFlight(trip: SavedTripSearch, deps: Deps = {}): Promise<OpenProblem | null> {
  const checked = savedTripFlightRequest(trip, deps.today);
  if ("problem" in checked) return checked.problem;
  const post = deps.fetchJson ?? ((url, init) => fetch(url, init));
  try {
    const response = await post("/api/travelpayouts/flight-link", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(checked.request),
    });
    const data = await response.json().catch(() => null) as { success?: unknown; url?: unknown; error?: unknown } | null;
    if (response.ok && data?.success === true && isLocalPath(data.url)) {
      rememberTypedOrigin(data.url, checked.request.origin);
      (deps.navigate ?? ((url) => window.location.assign(url)))(data.url);
      return null;
    }
    if (data?.error === "unknown_origin" || data?.error === "unknown_destination") return "unknownPlace";
    if (data?.error === "invalid_search") return "incomplete";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}
