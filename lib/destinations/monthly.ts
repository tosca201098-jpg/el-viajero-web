import { getDestinationsForMonth, type DestinationProfile } from "./index";

export type MonthlyRecommendation = {
  destination: DestinationProfile;
  reason: "quiet" | "best";
};

// Stable category order; future prices can be added to the returned cards without
// changing month URLs or the destination library.
export function getMonthlyRecommendations(month: number): MonthlyRecommendation[] {
  const seen = new Set<DestinationProfile>();
  const recommendations: MonthlyRecommendation[] = [];
  for (const reason of ["quiet", "best"] as const) {
    for (const destination of getDestinationsForMonth(month, reason)) {
      if (seen.has(destination)) continue;
      seen.add(destination);
      recommendations.push({ destination, reason });
    }
  }
  return recommendations;
}
