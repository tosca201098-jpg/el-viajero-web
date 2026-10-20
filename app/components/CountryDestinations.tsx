"use client";

import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import { getDestinationsByCountry, getDestinationsForSeason, type DestinationProfile, type DestinationSeason } from '@/lib/destinations';
import { getDestinationCountryName, getDestinationText } from '@/lib/destinations/localization';

export default function CountryDestinations({ countryCode, season, excludeIds = [], onSelect }: {
  countryCode: string;
  season?: DestinationSeason;
  excludeIds?: readonly string[];
  onSelect?: (destination: DestinationProfile) => void;
}) {
  const { language, t } = useLanguage();
  const destinations = (season ? getDestinationsForSeason(season, countryCode) : getDestinationsByCountry(countryCode))
    .filter(destination => !excludeIds.includes(destination.id));
  if (!destinations.length) return null;
  const country = getDestinationCountryName(destinations[0], language);
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-label={country}>
      <h2 className="mb-5 text-3xl font-black text-stone-900">{country}</h2>
      <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {destinations.map(destination => {
          const display = getDestinationText(destination, language);
          const label = t('destinations.explore', { destination: display.name });
          const className = 'mt-auto flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700';
          return (
            <article key={destination.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-blue-600/20 bg-white/80 shadow-sm">
              {/* Remote licensed photographs keep their source attribution below. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={destination.image} alt={`${display.name}, ${country}`} loading="lazy" className="h-36 w-full object-cover" />
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h3 className="text-xl font-black text-stone-900">{display.name}</h3>
                <p className="text-sm text-stone-700">{display.description}</p>
                <p className="text-sm text-stone-600">{t('destinations.recommendedStay')}: {display.recommendedStay}</p>
                {destination.imageSource && <a href={destination.imageSource} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-600 underline">
                  {destination.imageCredit} · {destination.imageLicense}
                </a>}
                {onSelect ? <button type="button" className={className} onClick={() => onSelect(destination)}>{label}</button>
                  : <Link className={className} href={`/?ficha=${encodeURIComponent(destination.name)}`}>{label}</Link>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
