"use client";

import { useLanguage } from "./LanguageProvider";
import type { Itinerary } from "@/lib/itinerary/types";

// "dark" es el aspecto de siempre (cuentas guardadas, /vuelos). "light" lo usa la ventana de ficha:
// tarjetas claras con texto oscuro, sin fondos negros.
export type ItinerarySurface = "dark" | "light";

const surfaces = {
  dark: {
    title: "break-words text-xl font-bold text-white",
    summary: "mt-2 break-words text-sm leading-6 text-slate-300",
    day: "min-w-0 rounded-xl border border-white/10 bg-slate-950/50 p-3 sm:p-4",
    dayTitle: "break-words text-base font-bold text-white",
    period: "min-w-0 rounded-lg bg-white/5 p-3",
    periodTitle: "text-sm font-semibold text-cyan-100",
    activity: "min-w-0 break-words text-sm text-slate-300",
    activityName: "block text-white",
    activityArea: "block text-xs text-cyan-200",
    tipsTitle: "mt-6 text-base font-bold text-white",
    tips: "mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300",
  },
  light: {
    title: "break-words text-xl font-bold text-slate-900",
    summary: "mt-2 break-words text-sm leading-6 text-slate-700",
    day: "min-w-0 rounded-xl border border-sky-200 bg-white p-3 sm:p-4",
    dayTitle: "break-words text-base font-bold text-slate-900",
    period: "min-w-0 rounded-lg bg-sky-50 p-3",
    periodTitle: "text-sm font-semibold text-sky-900",
    activity: "min-w-0 break-words text-sm text-slate-700",
    activityName: "block text-slate-900",
    activityArea: "block text-xs text-sky-800",
    tipsTitle: "mt-6 text-base font-bold text-slate-900",
    tips: "mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700",
  },
} as const;

export default function ItineraryContent({ itinerary, surface = "dark" }: { itinerary: Itinerary; surface?: ItinerarySurface }) {
  const { t } = useLanguage();
  const look = surfaces[surface];
  return (
    <div className="min-w-0">
      <h3 className={look.title}>{itinerary.title}</h3>
      <p className={look.summary}>{itinerary.summary}</p>
      <div className="mt-5 space-y-4">
        {itinerary.days.map((day) => (
          <section key={day.dayNumber} className={look.day}>
            <h4 className={look.dayTitle}>{t("itinerary.day", { number: day.dayNumber })} — {day.title}</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {([
                ["morning", "☀️", day.morning],
                ["afternoon", "🌤️", day.afternoon],
                ["evening", "🌙", day.evening],
              ] as const).map(([period, icon, activities]) => (
                <div key={period} className={look.period}>
                  <h5 className={look.periodTitle}>{icon} {t(`itinerary.${period}`)}</h5>
                  <ul className="mt-2 space-y-3">
                    {activities.map((activity, index) => (
                      <li key={`${activity.name}-${index}`} className={look.activity}>
                        <strong className={look.activityName}>{activity.name}</strong>
                        {activity.area && <span className={look.activityArea}>{activity.area}</span>}
                        <span className="mt-1 block leading-5">{activity.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      <h4 className={look.tipsTitle}>{t("itinerary.tips")}</h4>
      <ul className={look.tips}>
        {itinerary.tips.map((tip, index) => <li key={`${index}-${tip}`}>{tip}</li>)}
      </ul>
    </div>
  );
}
