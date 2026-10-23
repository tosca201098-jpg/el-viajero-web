import { destinationProfiles, getDestinationById } from "@/lib/destinations";
import type { DestinationProfile } from "@/lib/destinations";
import { calendarTripDays } from "@/lib/itinerary/dates";
import { isWhiteLabelFlightSearch, whiteLabelFlightSearch } from "./white-label";

/** Prefer the selected identity; the provider may remove extra URL parameters after loading. */
export function flightProfileForSearch(flightSearch: unknown, destinationId: unknown): DestinationProfile | undefined {
  if (!isWhiteLabelFlightSearch(flightSearch)) return undefined;
  const iataCode = flightSearch.slice(7, 10);
  if (destinationId !== undefined) {
    if (typeof destinationId !== "string" || !/^[a-z]{2}-[a-z0-9-]+$/.test(destinationId)) return undefined;
    const profile = getDestinationById(destinationId);
    return profile?.iataCodes.includes(iataCode) ? profile : undefined;
  }
  const matchingProfiles = destinationProfiles.filter(profile => profile.iataCodes.includes(iataCode));
  return matchingProfiles.length === 1 ? matchingProfiles[0] : undefined;
}

/** White Label has DDMM but no year. Use full dates only when they match the exact search. */
export function itineraryContextForFlightSearch(flightSearch: unknown, departureDate: unknown, returnDate: unknown, today = new Date()) {
  if (!isWhiteLabelFlightSearch(flightSearch)) return {};
  const travelers = Number(flightSearch.slice(-1));
  const context = { travelers };
  if (typeof departureDate !== "string" || typeof returnDate !== "string") return context;
  const days = calendarTripDays(departureDate, returnDate);
  if (days === null || days > 90 || whiteLabelFlightSearch({
    origin: flightSearch.slice(0, 3), destination: flightSearch.slice(7, 10),
    departureDate, returnDate, travelers,
  }, today) !== flightSearch) return context;
  return { travelers, departureDate, returnDate };
}
