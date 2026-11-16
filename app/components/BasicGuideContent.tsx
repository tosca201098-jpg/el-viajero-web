"use client";

import { useLanguage } from "./LanguageProvider";
import type { ItinerarySurface } from "./ItineraryContent";
import type { BasicGuide } from "@/lib/itinerary/types";

// Same two looks as the AI itinerary: "dark" for /vuelos and "light" for the destination window.
const surfaces = {
  dark: {
    title: "break-words text-xl font-bold text-white",
    summary: "mt-2 break-words text-sm leading-6 text-slate-300",
    day: "min-w-0 rounded-xl border border-white/10 bg-slate-950/50 p-3 sm:p-4",
    dayTitle: "break-words text-base font-bold text-white",
    item: "min-w-0 break-words text-sm text-slate-300",
    note: "mt-4 text-xs leading-5 text-slate-400",
  },
  light: {
    title: "break-words text-xl font-bold text-slate-900",
    summary: "mt-2 break-words text-sm leading-6 text-slate-700",
    day: "min-w-0 rounded-xl border border-sky-200 bg-white p-3 sm:p-4",
    dayTitle: "break-words text-base font-bold text-slate-900",
    item: "min-w-0 break-words text-sm text-slate-700",
    note: "mt-4 text-xs leading-5 text-slate-600",
  },
} as const;

export default function BasicGuideContent({ guide, requestedDays, surface = "dark" }: {
  guide: BasicGuide;
  requestedDays: number;
  surface?: ItinerarySurface;
}) {
  const { t } = useLanguage();
  const look = surfaces[surface];
  const dayLabel = (count: number) => count === 1 ? t("itinerary.oneDay") : t("itinerary.days", { count });
  return (
    <div className="min-w-0">
      <h3 className={look.title}>{t("itinerary.basicTitle", { destination: guide.name })}</h3>
      <p className={look.summary}>{guide.summary}</p>
      <div className="mt-5 space-y-4">
        {guide.days.map((day) => (
          <section key={day.dayNumber} className={look.day}>
            <h4 className={look.dayTitle}>{t("itinerary.day", { number: day.dayNumber })}</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {day.items.map((item, index) => <li key={`${index}-${item}`} className={look.item}>{item}</li>)}
            </ul>
          </section>
        ))}
      </div>
      {guide.days.length < requestedDays && (
        <p className={look.note}>{t("itinerary.basicShort", { days: dayLabel(guide.days.length) })}</p>
      )}
      <p className={look.note}>{t("itinerary.basicNote")}</p>
    </div>
  );
}
