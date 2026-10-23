import { destinationProfiles, getDestinationById } from "@/lib/destinations";
import type { DestinationProfile } from "@/lib/destinations";
import { isWhiteLabelFlightSearch } from "./white-label";

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
