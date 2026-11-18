import { getDestinationById, type DestinationProfile } from "@/lib/destinations";
import { getDestinationText } from "@/lib/destinations/localization";
import type { Destination } from "@/lib/destinations/featured";
import { translateText, type Locale } from "@/lib/i18n/translations";
import type { BasicGuide } from "./types";

/**
 * Orders the recommendations over the days without repeating or inventing anything. At most one day per
 * recommendation, so a long trip does not get empty days; the first days take the extra items (4 items over 3 days: 2, 1, 1).
 */
export function distributeRecommendations(items: readonly string[], requestedDays: number): string[][] {
  const count = Math.min(Math.max(Math.trunc(requestedDays), 1), items.length);
  if (count === 0) return [];
  const base = Math.floor(items.length / count);
  const extra = items.length % count;
  let start = 0;
  return Array.from({ length: count }, (_, day) => {
    const size = base + (day < extra ? 1 : 0);
    const chunk = items.slice(start, start + size);
    start += size;
    return chunk;
  });
}

/**
 * Free itinerary from the trusted catalogue entry. The text is the destination page's own text in the requested
 * language (with the same Spanish fallback the pages use); nothing else is added.
 */
export function buildBasicGuide(source: DestinationProfile | Destination, requestedDays: number, locale: Locale): BasicGuide {
  const profile = "id" in source && typeof source.id === "string" ? getDestinationById(source.id) : undefined;
  const display = profile ? getDestinationText(profile, locale) : source;
  const recommendations = display.recommendations.map((item) => translateText(locale, item));
  return {
    name: translateText(locale, display.name),
    summary: translateText(locale, display.description),
    recommendationCount: recommendations.length,
    days: distributeRecommendations(recommendations, requestedDays)
      .map((items, index) => ({ dayNumber: index + 1, items })),
  };
}
