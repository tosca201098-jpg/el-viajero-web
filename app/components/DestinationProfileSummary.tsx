"use client";

import { useLanguage } from "./LanguageProvider";
import { getDestinationCountryName, getDestinationText } from "@/lib/destinations/localization";
import type { DestinationProfile } from "@/lib/destinations";

export default function DestinationProfileSummary({ destination, detailed = false }: {
  destination: DestinationProfile;
  detailed?: boolean;
}) {
  const { language, t } = useLanguage();
  const display = getDestinationText(destination, language);
  const country = getDestinationCountryName(destination, language);

  return <span className={detailed ? "flex min-w-0 flex-col overflow-hidden sm:flex-row" : "flex min-w-0 items-center gap-3"}>
    <img
      src={destination.image}
      alt={`${display.name}, ${country}`}
      style={destination.imagePosition ? { objectPosition: destination.imagePosition } : undefined}
      className={detailed ? "h-40 w-full shrink-0 object-cover sm:h-auto sm:w-48" : "h-16 w-16 shrink-0 rounded-lg object-cover"}
    />
    <span className={detailed ? "block min-w-0 flex-1 p-4" : "block min-w-0 flex-1 py-2"}>
      <span className="block text-xs font-semibold text-blue-700">{country}</span>
      <strong className="block text-base leading-5 text-stone-900">{display.name}</strong>
      <span className={detailed ? "mt-2 block text-sm leading-5 text-stone-700" : "mt-1 block line-clamp-2 text-xs leading-4 text-stone-700"}>
        {display.description}
      </span>
      {detailed ? <>
        <span className="mt-3 block text-sm font-semibold text-stone-900">{t("destinations.recommendations")}</span>
        <span className="mt-1 grid gap-x-4 gap-y-1 text-sm text-stone-700 sm:grid-cols-2">
          {display.recommendations.map(place => <span key={place} className="min-w-0">📍 {place}</span>)}
        </span>
        <span className="mt-3 block text-sm text-stone-700">
          <strong>{t("destinations.recommendedStay")}:</strong> {display.recommendedStay}
        </span>
        {destination.imageSource && <span className="mt-2 block text-xs text-stone-500">
          <a href={destination.imageSource} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {destination.imageCredit || destination.imageSource}
          </a>
          {destination.imageLicense && destination.imageLicenseUrl && <>
            {" · "}<a href={destination.imageLicenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{destination.imageLicense}</a>
          </>}
        </span>}
      </> : <span className="mt-1 block text-xs font-semibold text-blue-700">{t("monthly.viewDestination")} →</span>}
    </span>
  </span>;
}
