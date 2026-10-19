import type { Locale } from "@/lib/i18n/translations";
import type { DestinationProfile, DestinationText } from "./types";

export function getDestinationCountryName(
  destination: Pick<DestinationProfile, "countryCode" | "country">,
  locale: Locale,
): string {
  const code = destination.countryCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return destination.country;
  try {
    return new Intl.DisplayNames([locale], { type: "region", fallback: "none" }).of(code)
      ?? destination.country;
  } catch {
    return destination.country;
  }
}

/** Returns presentation text only: IDs, airport associations and provider inputs stay intact. */
export function getDestinationText(destination: DestinationProfile, locale: Locale): DestinationText {
  const spanish = destination.translations?.es;
  const selected = destination.translations?.[locale];
  return {
    name: selected?.name ?? spanish?.name ?? destination.name,
    description: selected?.description ?? spanish?.description ?? destination.description,
    recommendations: selected?.recommendations ?? spanish?.recommendations ?? destination.recommendations,
    recommendedStay: selected?.recommendedStay ?? spanish?.recommendedStay ?? destination.recommendedStay,
    seasonalityNote: selected?.seasonalityNote ?? spanish?.seasonalityNote ?? destination.seasonalityNote,
  };
}
