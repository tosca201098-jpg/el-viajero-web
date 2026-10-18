"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import type { Destination } from "@/lib/destinations/featured";
import { calendarTripDays, suggestedItineraryDays } from "@/lib/itinerary/dates";
import { isItinerary } from "@/lib/itinerary/schema";
import type { Itinerary, ItineraryRequest } from "@/lib/itinerary/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { saveItinerary } from "@/lib/supabase/saved-itineraries";
import ItineraryContent from "./ItineraryContent";

export type ItineraryContext = {
  travelers?: number;
  departureDate?: string;
  returnDate?: string;
  budget?: { amount: number; type: "total" | "por_persona" };
};

export default function ItineraryPlanner({ destination, context }: {
  destination: Destination;
  context: ItineraryContext;
}) {
  const { language, t } = useLanguage();
  const calendarDays = context.departureDate && context.returnDate
    ? calendarTripDays(context.departureDate, context.returnDate) : null;
  const hasDates = calendarDays !== null && calendarDays <= 90;
  const [selectedDays, setSelectedDays] = useState(() =>
    hasDates ? Math.min(7, calendarDays) : suggestedItineraryDays(destination.recommendedStay));
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "signin" | "saved" | "error">("idle");
  const busyRef = useRef(false);
  const savingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const variationRef = useRef(0);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const dayLabel = (count: number) => count === 1 ? t("itinerary.oneDay") : t("itinerary.days", { count });

  async function generate() {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError(false);
    const controller = new AbortController();
    controllerRef.current = controller;
    const days = hasDates ? Math.min(7, calendarDays) : selectedDays;
    const variation = itinerary ? (variationRef.current % 20) + 1 : 0;
    const payload: ItineraryRequest = {
      destination: {
        name: destination.name,
        country: destination.country,
        recommendations: [...destination.recommendations],
        recommendedStay: destination.recommendedStay ?? null,
        bestMonths: destination.bestMonths ?? [],
        lowSeasonMonths: destination.lowSeasonMonths ?? [],
        highSeasonMonths: destination.highSeasonMonths ?? [],
        seasonalityNote: destination.seasonalityNote ?? null,
      },
      days,
      variation,
      locale: language,
      ...(context.travelers ? { travelers: context.travelers } : {}),
      ...(hasDates ? { departureDate: context.departureDate, returnDate: context.returnDate } : {}),
      ...(context.budget ? { budget: context.budget } : {}),
    };
    try {
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (!response.ok || typeof data !== "object" || data === null ||
        !("itinerary" in data) || !isItinerary(data.itinerary, days)) throw new Error("Invalid itinerary");
      setItinerary(data.itinerary);
      setSaveStatus("idle");
      variationRef.current = variation;
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      busyRef.current = false;
      controllerRef.current = null;
      setLoading(false);
    }
  }

  async function saveGenerated() {
    if (!itinerary || savingRef.current || loading || saveStatus === "saved") return;
    savingRef.current = true;
    setSaving(true);
    setSaveStatus("idle");
    try {
      const { data: { session }, error: sessionError } = await getSupabaseClient().auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        setSaveStatus("signin");
        return;
      }
      await saveItinerary({
        destination_name: destination.name,
        country: destination.country,
        locale: language,
        itinerary,
      });
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <section className="mt-6 min-w-0 rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.06] p-4 sm:p-5" aria-label={t("itinerary.create")}>
      {hasDates ? (
        <p className="mb-3 text-sm text-slate-300">
          {t("itinerary.duration")}: <span className="font-semibold text-white">{dayLabel(Math.min(7, calendarDays))}</span>
          {calendarDays > 7 && <span className="mt-1 block text-xs text-slate-400">{t("itinerary.maxDays")}</span>}
        </p>
      ) : (
        <fieldset className="mb-3">
          <legend className="mb-2 text-sm font-semibold text-slate-200">{t("itinerary.duration")}</legend>
          <div className="grid grid-cols-7 gap-1.5">
            {([1, 2, 3, 4, 5, 6, 7] as const).map((day) => (
              <button key={day} type="button" aria-label={dayLabel(day)}
                aria-pressed={selectedDays === day} onClick={() => { setSelectedDays(day); setItinerary(null); setError(false); setSaveStatus("idle"); variationRef.current = 0; }} disabled={loading || saving}
                className={`min-h-[44px] min-w-0 rounded-lg border text-sm font-semibold ${selectedDays === day
                  ? "border-cyan-300 bg-cyan-300 text-slate-950" : "border-cyan-300/30 text-cyan-100 hover:bg-cyan-300/10"}`}>
                {day}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <button type="button" onClick={() => void generate()} disabled={loading || saving}
        className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {loading ? t("itinerary.creating") : itinerary ? t("itinerary.regenerate") : t("itinerary.create")}
      </button>
      {loading && <p role="status" className="mt-3 text-sm text-cyan-100">{t("itinerary.creating")}</p>}
      {error && <p role="alert" className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100">{t("itinerary.error")}</p>}

      {itinerary && (
        <div className="mt-6 min-w-0 border-t border-white/10 pt-5">
          <ItineraryContent itinerary={itinerary} />
          <button type="button" onClick={() => void saveGenerated()}
            disabled={saving || loading || saveStatus === "saved"}
            className="mt-5 min-h-[44px] rounded-xl border border-cyan-300/60 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-60">
            {saving ? t("itinerary.saving") : saveStatus === "saved" ? t("itinerary.saved") : t("itinerary.save")}
          </button>
          {saveStatus === "signin" && <p role="alert" className="mt-2 text-sm text-cyan-100">{t("itinerary.signinRequired")}</p>}
          {saveStatus === "error" && <p role="alert" className="mt-2 text-sm text-rose-100">{t("itinerary.saveError")}</p>}
        </div>
      )}
    </section>
  );
}
