import { spainDestinations } from "./spain";
import { portugalDestinations } from "./portugal";

export type DestinationProfile = {
  name: string;
  country: string;
  iataCodes: string[];
  image: string;
  description: string;
  recommendations: [string, string, string, string];
  recommendedStay: string;
  // Tourist guidance, not a prediction or guarantee of flight or hotel prices.
  bestMonths?: number[];
  lowSeasonMonths?: number[];
  highSeasonMonths?: number[];
  seasonalityNote?: string;
  aliases?: string[];
  // Airport identifiers not accepted by Travelpayouts; never use for flight pricing.
  auxiliaryCodes?: string[];
  imageSource?: string;
  imageCredit?: string;
  imageLicense?: string;
  imageLicenseUrl?: string;
};

export const destinationProfiles: DestinationProfile[] = [...spainDestinations, ...portugalDestinations];

export type DestinationMonthCategory = "best" | "quiet" | "either";

// Reusable for the future month pages. "quiet" means lower usual visitor demand,
// never a claim that prices will be cheaper in that month.
export function getDestinationsForMonth(month: number, category: DestinationMonthCategory = "either"): DestinationProfile[] {
  if (!Number.isInteger(month) || month < 1 || month > 12) return [];
  return destinationProfiles.filter((destination) => {
    const best = destination.bestMonths?.includes(month) ?? false;
    const quiet = destination.lowSeasonMonths?.includes(month) ?? false;
    return category === "best" ? best : category === "quiet" ? quiet : best || quiet;
  });
}

export function normalizeDestinationName(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function findDestinationProfile({ iataCode, name }: {
  iataCode?: string | null;
  name?: string | null;
}): DestinationProfile | undefined {
  const code = iataCode?.trim().toUpperCase();
  if (code) {
    const byIata = destinationProfiles.find((destination) =>
      destination.iataCodes.some((iata) => iata.toUpperCase() === code));
    if (byIata) return byIata;
  }

  const normalized = name ? normalizeDestinationName(name) : "";
  if (!normalized) return undefined;
  return destinationProfiles.find((destination) =>
    [destination.name, ...(destination.aliases ?? []), ...(destination.auxiliaryCodes ?? [])]
      .some((candidate) => normalizeDestinationName(candidate) === normalized));
}
