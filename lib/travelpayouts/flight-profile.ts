import { getDestinationById } from "@/lib/destinations";
import type { DestinationProfile } from "@/lib/destinations";
import { isWhiteLabelFlightSearch } from "./white-label";

/** Only a validated search with an explicitly resolved catalog identity may show a profile. */
export function flightProfileForSearch(flightSearch: unknown, destinationId: unknown): DestinationProfile | undefined {
  if (!isWhiteLabelFlightSearch(flightSearch) || typeof destinationId !== "string" ||
    !/^[a-z]{2}-[a-z0-9-]+$/.test(destinationId)) return undefined;
  const profile = getDestinationById(destinationId);
  return profile?.iataCodes.includes(flightSearch.slice(7, 10)) ? profile : undefined;
}
