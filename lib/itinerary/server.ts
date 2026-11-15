import { destinationProfiles, normalizeDestinationName, type DestinationProfile } from "@/lib/destinations";
import { destinations as featuredDestinations, type Destination } from "@/lib/destinations/featured";
import { isLocale } from "@/lib/i18n/translations";
import { calendarTripDays } from "./dates";
import type { ItineraryDestinationInput, ItineraryRequest } from "./types";

type SourceDestination = DestinationProfile | Destination;
type ValidatedRequest = { request: ItineraryRequest; destination: SourceDestination };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function destinationData(destination: SourceDestination): ItineraryDestinationInput {
  return {
    name: destination.name,
    country: destination.country,
    recommendations: [...destination.recommendations],
    recommendedStay: destination.recommendedStay ?? null,
    bestMonths: destination.bestMonths ?? [],
    lowSeasonMonths: destination.lowSeasonMonths ?? [],
    highSeasonMonths: destination.highSeasonMonths ?? [],
    seasonalityNote: destination.seasonalityNote ?? null,
  };
}

function sameArray(actual: unknown, expected: string[] | number[]): boolean {
  return Array.isArray(actual) && actual.length === expected.length &&
    actual.every((item, index) => item === expected[index]);
}

/** Validates a request against the trusted catalogue. Itineraries are written by Sofía; no provider is called here. */
export function validateItineraryRequest(value: unknown): ValidatedRequest | null {
  if (!record(value) || !record(value.destination) || !isLocale(value.locale) ||
    !Number.isInteger(value.days) || (value.days as number) < 1 || (value.days as number) > 7) return null;

  const supplied = value.destination;
  if (typeof supplied.name !== "string" || supplied.name.length > 100 ||
    typeof supplied.country !== "string" || supplied.country.length > 100) return null;
  const name = normalizeDestinationName(supplied.name);
  const country = normalizeDestinationName(supplied.country);
  const destination = [...destinationProfiles, ...featuredDestinations].find((item) => {
    if (normalizeDestinationName(item.name) !== name || normalizeDestinationName(item.country) !== country) return false;
    const trusted = destinationData(item);
    return sameArray(supplied.recommendations, trusted.recommendations) &&
      supplied.recommendedStay === trusted.recommendedStay &&
      sameArray(supplied.bestMonths, trusted.bestMonths) &&
      sameArray(supplied.lowSeasonMonths, trusted.lowSeasonMonths) &&
      sameArray(supplied.highSeasonMonths, trusted.highSeasonMonths) &&
      supplied.seasonalityNote === trusted.seasonalityNote;
  });
  if (!destination) return null;
  const trusted = destinationData(destination);

  if (value.travelers !== undefined &&
    (!Number.isInteger(value.travelers) || (value.travelers as number) < 1 || (value.travelers as number) > 20)) return null;
  if (value.budget !== undefined && (!record(value.budget) ||
    typeof value.budget.amount !== "number" || !Number.isFinite(value.budget.amount) ||
    value.budget.amount <= 0 || value.budget.amount > 100_000 ||
    (value.budget.type !== "total" && value.budget.type !== "por_persona"))) return null;
  if (value.variation !== undefined &&
    (!Number.isInteger(value.variation) || (value.variation as number) < 0 || (value.variation as number) > 20)) return null;

  const hasDeparture = value.departureDate !== undefined;
  const hasReturn = value.returnDate !== undefined;
  if (hasDeparture !== hasReturn) return null;
  if (hasDeparture) {
    if (typeof value.departureDate !== "string" || typeof value.returnDate !== "string") return null;
    const tripDays = calendarTripDays(value.departureDate, value.returnDate);
    if (tripDays === null || tripDays > 90 || value.days !== Math.min(7, tripDays)) return null;
  }

  const request: ItineraryRequest = {
    destination: trusted,
    days: value.days as number,
    locale: value.locale,
    ...(value.travelers !== undefined ? { travelers: value.travelers as number } : {}),
    ...(hasDeparture ? { departureDate: value.departureDate as string, returnDate: value.returnDate as string } : {}),
    ...(value.budget !== undefined ? { budget: { amount: value.budget.amount as number, type: value.budget.type as "total" | "por_persona" } } : {}),
    ...(value.variation !== undefined ? { variation: value.variation as number } : {}),
  };
  return { request, destination };
}
