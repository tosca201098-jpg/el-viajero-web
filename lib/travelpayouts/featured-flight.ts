import { destinations, type Destination } from "@/lib/destinations/featured";
import { normalizeDestinationName } from "@/lib/destinations";
import { isWhiteLabelFlightSearch } from "./white-label";

export function featuredDestinationSlug(destination: Destination): string {
  return normalizeDestinationName(destination.name).replaceAll(" ", "-");
}

export function findFeaturedDestination(name: string): Destination | undefined {
  const normalized = normalizeDestinationName(name);
  return destinations.find(destination => normalizeDestinationName(destination.name) === normalized);
}

/** Only an identity from the original editorial cards may open the home flight view. */
export function featuredDestinationForSearch(search: unknown, slug: unknown): Destination | undefined {
  if (!isWhiteLabelFlightSearch(search) || typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) return undefined;
  return destinations.find(destination => featuredDestinationSlug(destination) === slug);
}
