"use client";

import type { ReactNode } from "react";
import { useLanguage } from "./LanguageProvider";
import { destinationWindowHeader } from "./destination-window-header";
import { destinationWindowStyle as windowStyle } from "./destination-window-style";
import { getDestinationCountryName, getDestinationText } from "@/lib/destinations/localization";
import { flagForCountryCode } from "@/lib/destinations/country-flags";
import { panoramicImagePosition } from "@/lib/destinations/image-framing";
import type { DestinationProfile } from "@/lib/destinations";

// Con detailed (página «Buscar vuelos») la tarjeta usa el mismo diseño que la ficha de destino (modelo Roma):
// foto panorámica con país y nombre, cuerpo blanco y tarjetas claras. Lo que se pase como children (el
// planificador de itinerario y los botones de la página) va al final del cuerpo, como en la ficha.
// Sin detailed es el resumen pequeño del formulario de vuelos, que no cambia.
export default function DestinationProfileSummary({ destination, detailed = false, children }: {
  destination: DestinationProfile;
  detailed?: boolean;
  children?: ReactNode;
}) {
  const { language, t } = useLanguage();
  const display = getDestinationText(destination, language);
  const country = getDestinationCountryName(destination, language);

  if (detailed) {
    return <article className={windowStyle.inlineCard}>
      {destinationWindowHeader({
        image: destination.image,
        imageAlt: `${display.name}, ${country}`,
        imagePosition: panoramicImagePosition(destination),
        flag: flagForCountryCode(destination.countryCode) ?? "",
        country,
        title: display.name,
        titleId: "destination-summary-title",
      })}
      <div className={windowStyle.body}>
        {destination.imageSource && <p className={windowStyle.photoCredit}>
          <a href={destination.imageSource} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            {destination.imageCredit ? `Foto: ${destination.imageCredit}` : "Foto"}
          </a>
          {destination.imageLicense && destination.imageLicenseUrl && <>
            {" · "}<a href={destination.imageLicenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{destination.imageLicense}</a>
          </>}
        </p>}
        <p className={windowStyle.description}>{display.description}</p>
        <h3 className={windowStyle.sectionHeading}>✨ {t("destinations.recommendations")}</h3>
        <div className={windowStyle.recommendationsGrid}>
          {display.recommendations.map(place => <div key={place} className={windowStyle.recommendationCard}>📍 {place}</div>)}
        </div>
        {display.recommendedStay && <p className={windowStyle.stayCard}>
          <span className={windowStyle.stayLabel}>{t("destinations.recommendedStay")}:</span> {display.recommendedStay}
        </p>}
        {children}
      </div>
    </article>;
  }

  return <span className="flex min-w-0 items-center gap-3">
    <img
      src={destination.image}
      alt={`${display.name}, ${country}`}
      style={destination.imagePosition ? { objectPosition: destination.imagePosition } : undefined}
      className="h-16 w-16 shrink-0 rounded-lg object-cover"
    />
    <span className="block min-w-0 flex-1 py-2">
      <span className="block text-xs font-semibold text-blue-700">{country}</span>
      <strong className="block text-base leading-5 text-stone-900">{display.name}</strong>
      <span className="mt-1 block line-clamp-2 text-xs leading-4 text-stone-700">
        {display.description}
      </span>
      <span className="mt-1 block text-xs font-semibold text-blue-700">{t("monthly.viewDestination")} →</span>
    </span>
  </span>;
}
