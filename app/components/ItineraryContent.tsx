"use client";

import { useLanguage } from "./LanguageProvider";
import type { Itinerary } from "@/lib/itinerary/types";

export default function ItineraryContent({ itinerary }: { itinerary: Itinerary }) {
  const { t } = useLanguage();
  return (
    <div className="min-w-0">
      <h3 className="break-words text-xl font-bold text-white">{itinerary.title}</h3>
      <p className="mt-2 break-words text-sm leading-6 text-slate-300">{itinerary.summary}</p>
      <div className="mt-5 space-y-4">
        {itinerary.days.map((day) => (
          <section key={day.dayNumber} className="min-w-0 rounded-xl border border-white/10 bg-slate-950/50 p-3 sm:p-4">
            <h4 className="break-words text-base font-bold text-white">{t("itinerary.day", { number: day.dayNumber })} — {day.title}</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {([
                ["morning", "☀️", day.morning],
                ["afternoon", "🌤️", day.afternoon],
                ["evening", "🌙", day.evening],
              ] as const).map(([period, icon, activities]) => (
                <div key={period} className="min-w-0 rounded-lg bg-white/5 p-3">
                  <h5 className="text-sm font-semibold text-cyan-100">{icon} {t(`itinerary.${period}`)}</h5>
                  <ul className="mt-2 space-y-3">
                    {activities.map((activity, index) => (
                      <li key={`${activity.name}-${index}`} className="min-w-0 break-words text-sm text-slate-300">
                        <strong className="block text-white">{activity.name}</strong>
                        {activity.area && <span className="block text-xs text-cyan-200">{activity.area}</span>}
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
      <h4 className="mt-6 text-base font-bold text-white">{t("itinerary.tips")}</h4>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-300">
        {itinerary.tips.map((tip, index) => <li key={`${index}-${tip}`}>{tip}</li>)}
      </ul>
    </div>
  );
}
