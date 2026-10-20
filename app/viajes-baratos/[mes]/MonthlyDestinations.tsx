"use client";

import Link from "next/link";
import LanguageSelector from "@/app/components/LanguageSelector";
import { useLanguage } from "@/app/components/LanguageProvider";
import { formatMonthName } from "@/lib/destinations/seasonality";
import { getDestinationCountryName, getDestinationText } from "@/lib/destinations/localization";
import type { MonthlyRecommendation } from "@/lib/destinations/monthly";

type Props = { month: number; recommendations: MonthlyRecommendation[] };

export default function MonthlyDestinations({ month, recommendations }: Props) {
  const { language, t } = useLanguage();
  const monthName = formatMonthName(month, language);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F2E8] text-stone-800">
      <header className="sticky top-0 z-40 border-b border-blue-600/20 bg-[#F7F2E8]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <Link href="/" aria-label="DESTINAUTA" className="shrink-0 whitespace-nowrap text-lg font-black tracking-tight text-black max-sm:text-base">
            DEST<span className="text-blue-500">I<span className="text-black">N</span>A</span>UTA
          </Link>
          <LanguageSelector />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <Link href="/" className="inline-flex min-h-[44px] items-center text-sm font-semibold text-blue-700 hover:underline">
          ← {t("monthly.backHome")}
        </Link>
        <div className="mt-4 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-800">{t("monthly.homeTitle")}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            {t("monthly.pageTitle", { month: monthName })}
          </h1>
          <p className="mt-3 text-base leading-6 text-stone-700 sm:text-lg">
            {t("monthly.pageSubtitle", { month: monthName })}
          </p>
          <p className="mt-3 text-sm leading-5 text-stone-600">{t("monthly.priceDisclaimer")}</p>
        </div>

        <div className="mt-8 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map(({ destination, reason }) => {
            const country = getDestinationCountryName(destination, language);
            const display = getDestinationText(destination, language);
            const stay = display.recommendedStay.replace("días", t("monthly.days"));
            const profileUrl = `/?ficha=${encodeURIComponent(destination.name)}`;
            const flightsUrl = `/?primaveraServicio=vuelo&destino=${encodeURIComponent(destination.name)}`;
            return (
              <article key={destination.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-blue-600/20 bg-white/80 shadow-sm">
                <img src={destination.image} alt={`${display.name}, ${country}`} loading="lazy" className="h-40 w-full object-cover sm:h-44" />
                <div className="flex flex-1 flex-col p-4">
                  <span className="self-start rounded-full border border-blue-600/25 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800">
                    {reason === "quiet" ? t("destinations.quietSeason") : t("monthly.goodTime")}
                  </span>
                  <h2 className="mt-3 text-xl font-black leading-tight text-stone-900">{display.name}</h2>
                  <p className="mt-1 text-sm text-stone-600">{country}</p>
                  <p className="mt-2 text-sm text-stone-700">{t("destinations.recommendedStay")}: {stay}</p>
                  {destination.countryCode === 'FR' && destination.imageSource && <a href={destination.imageSource} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-stone-600 underline">{destination.imageCredit} · {destination.imageLicense}</a>}
                  <div className="mt-auto grid gap-2 pt-4">
                    <Link href={profileUrl} className="flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                      {t("monthly.viewDestination")}
                    </Link>
                    {(destination.countryCode !== "FR" || destination.iataCodes.length > 0) && <Link href={flightsUrl} className="flex min-h-[44px] items-center justify-center rounded-xl border border-blue-600/50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                      ✈️ {t("search.findFlights")}
                    </Link>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
