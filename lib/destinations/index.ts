import { spainDestinations } from "./spain";
import { portugalDestinations } from "./portugal";
import { franceDestinations } from "./france";
import { italyDestinations } from "./italy";
import { ukDestinations } from "./uk";
import { germanyDestinations } from "./germany";
import { netherlandsDestinations } from "./netherlands";
import { belgiumDestinations } from "./belgium";
import { switzerlandDestinations } from "./switzerland";
import { austriaDestinations } from "./austria";
import { czechiaDestinations } from "./czechia";
import { polandDestinations } from "./poland";
import { hungaryDestinations } from "./hungary";
import { slovakiaDestinations } from "./slovakia";
import type { DestinationId, DestinationProfile } from "./types";

export type { DestinationId, DestinationReference, DestinationAirport, DestinationText, DestinationProfile } from "./types";

export const destinationsByCountry: Readonly<Record<string, readonly DestinationProfile[]>> = {
  ES: spainDestinations,
  PT: portugalDestinations,
  FR: franceDestinations,
  IT: italyDestinations,
  GB: ukDestinations,
  DE: germanyDestinations,
  NL: netherlandsDestinations,
  BE: belgiumDestinations,
  CH: switzerlandDestinations,
  AT: austriaDestinations,
  CZ: czechiaDestinations,
  PL: polandDestinations,
  HU: hungaryDestinations,
  SK: slovakiaDestinations,
};

export const destinationProfiles: DestinationProfile[] = [...spainDestinations, ...portugalDestinations, ...franceDestinations, ...italyDestinations, ...ukDestinations, ...germanyDestinations, ...netherlandsDestinations, ...belgiumDestinations, ...switzerlandDestinations, ...austriaDestinations, ...czechiaDestinations, ...polandDestinations, ...hungaryDestinations, ...slovakiaDestinations];

export function getDestinationById(id: DestinationId): DestinationProfile | undefined {
  return destinationProfiles.find(destination => destination.id === id);
}

export function getDestinationBySlug(slug: string): DestinationProfile | undefined {
  return destinationProfiles.find(destination => destination.slug === slug);
}

export function getDestinationsByCountry(countryCode: string): readonly DestinationProfile[] {
  const code = countryCode.trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(destinationsByCountry, code)
    ? destinationsByCountry[code] : [];
}

/** Preparation for sitemap use; deliberately not connected to the live sitemap. */
export function getPublishedDestinationPages(profiles: readonly DestinationProfile[] = destinationProfiles) {
  return profiles.filter(destination => destination.publication?.status === "published")
    .map(destination => ({ destinationId: destination.id, path: `/destinos/${destination.slug}` }));
}

export type DestinationMonthCategory = "best" | "quiet" | "either";
export type DestinationSeason = 'spring' | 'summer' | 'autumn' | 'winter';
const seasonMonths: Record<DestinationSeason, number[]> = {
  spring: [3,4,5], summer: [6,7,8], autumn: [9,10,11], winter: [12,1,2],
};

export function getDestinationsForSeason(season: DestinationSeason, countryCode: string): readonly DestinationProfile[] {
  return getDestinationsByCountry(countryCode).filter(destination =>
    destination.bestMonths?.some(month => seasonMonths[season].includes(month)));
}

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
