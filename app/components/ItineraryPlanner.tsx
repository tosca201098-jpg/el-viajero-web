"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import type { Destination } from "@/lib/destinations/featured";
import { calendarTripDays, suggestedItineraryDays } from "@/lib/itinerary/dates";
import { basicGuideDocument, documentFileName, documentInfo, itineraryDocument } from "@/lib/itinerary/document";
import { downloadPdf } from "@/lib/itinerary/download";
import { buildPdf } from "@/lib/pdf/text-pdf";
import { isBasicGuide, isItinerary } from "@/lib/itinerary/schema";
import type { BasicGuide, Itinerary, ItineraryRequest } from "@/lib/itinerary/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { saveItinerary } from "@/lib/supabase/saved-itineraries";
import BasicGuideContent from "./BasicGuideContent";
import ItineraryContent, { type ItinerarySurface } from "./ItineraryContent";
import type { VoiceItineraryRequest } from '@/lib/voice/itinerary';

export type ItineraryContext = {
  travelers?: number;
  departureDate?: string;
  returnDate?: string;
  budget?: { amount: number; type: "total" | "por_persona" };
};

// "dark" es el aspecto de siempre (/vuelos). "light" lo usa la ventana de ficha: tarjeta clara con
// texto oscuro, sin fondos negros. Solo cambian clases de estilo.
const surfaces = {
  dark: {
    section: "mt-6 min-w-0 rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.06] p-4 sm:p-5",
    duration: "mb-3 text-sm text-slate-300",
    durationValue: "font-semibold text-white",
    maxDays: "mt-1 block text-xs text-slate-400",
    legend: "mb-2 text-sm font-semibold text-slate-200",
    dayOn: "border-cyan-300 bg-cyan-300 text-slate-950",
    dayOff: "border-cyan-300/30 text-cyan-100 hover:bg-cyan-300/10",
    status: "mt-3 text-sm text-cyan-100",
    error: "mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-sm text-rose-100",
    result: "mt-6 min-w-0 border-t border-white/10 pt-5",
    save: "mt-5 min-h-[44px] rounded-xl border border-cyan-300/60 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 disabled:opacity-60",
    saveSignin: "mt-2 text-sm text-cyan-100",
    saveError: "mt-2 text-sm text-rose-100",
  },
  light: {
    section: "mt-6 min-w-0 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:p-5",
    duration: "mb-3 text-sm text-slate-700",
    durationValue: "font-semibold text-slate-900",
    maxDays: "mt-1 block text-xs text-slate-600",
    legend: "mb-2 text-sm font-semibold text-slate-800",
    dayOn: "border-cyan-300 bg-cyan-300 text-slate-950",
    dayOff: "border-sky-300 bg-white text-sky-900 hover:bg-sky-100",
    status: "mt-3 text-sm text-sky-900",
    error: "mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900",
    result: "mt-6 min-w-0 border-t border-sky-200 pt-5",
    save: "mt-5 min-h-[44px] rounded-xl border border-sky-400 bg-white px-4 py-2 text-sm font-semibold text-sky-900 transition hover:bg-sky-100 disabled:opacity-60",
    saveSignin: "mt-2 text-sm text-sky-900",
    saveError: "mt-2 text-sm text-rose-800",
  },
} as const;

export default function ItineraryPlanner({ destination, context, voiceRequest, surface = "dark" }: {
  destination: Destination;
  context: ItineraryContext;
  voiceRequest?: VoiceItineraryRequest;
  surface?: ItinerarySurface;
}) {
  const { language, t } = useLanguage();
  const look = surfaces[surface];
  const calendarDays = context.departureDate && context.returnDate
    ? calendarTripDays(context.departureDate, context.returnDate) : null;
  const hasDates = calendarDays !== null && calendarDays <= 90;
  const [selectedDays, setSelectedDays] = useState(() =>
    hasDates ? Math.min(7, calendarDays) : suggestedItineraryDays(destination.recommendedStay));
  // Manual button: /api/itinerary answers with the free basic guide (everyone). An itinerary written by Sofía
  // (ElevenLabs) can also arrive through a voice request; it is shown with the same content component.
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [basicGuide, setBasicGuide] = useState<BasicGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "signin" | "saved" | "error">("idle");
  const busyRef = useRef(false);
  const savingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const voiceEffectRef = useRef({ version: 0 });
  const activeVoiceRef = useRef<VoiceItineraryRequest | null>(null);
  const completedVoiceRef = useRef<VoiceItineraryRequest | null>(null);
  const plannerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; controllerRef.current?.abort(); activeVoiceRef.current?.cancel(); };
  }, []);

  useEffect(() => {
    if (itinerary && completedVoiceRef.current) {
      const request = completedVoiceRef.current;
      completedVoiceRef.current = null;
      if (!request.signal.aborted) {
        plannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        plannerRef.current?.focus({ preventScroll: true });
        request.complete({ status: 'success', destination: destination.name, days: request.days, locale: request.locale });
      }
    }
  }, [itinerary, destination.name]);

  useEffect(() => {
    const lifecycle = voiceEffectRef.current;
    const version = ++lifecycle.version;
    // Defer until effect replay settles, so Strict Mode cannot deliver the same request twice.
    queueMicrotask(() => {
      if (!voiceRequest || voiceRequest.settled || voiceRequest.signal.aborted || lifecycle.version !== version) return;
      activeVoiceRef.current?.cancel();
      activeVoiceRef.current = voiceRequest;
      setSelectedDays(voiceRequest.days);
      setSaveStatus('idle');
      setBasicGuide(null);
      setError(false);
      setDownloadError(false);
      completedVoiceRef.current = voiceRequest;
      setItinerary(voiceRequest.itinerary);
    });
    return () => {
      const cancelledVersion = ++lifecycle.version;
      queueMicrotask(() => { if (lifecycle.version === cancelledVersion) voiceRequest?.cancel(); });
    };
    // Each voice request is immutable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceRequest]);

  const dayLabel = (count: number) => count === 1 ? t("itinerary.oneDay") : t("itinerary.days", { count });
  const requestedDays = hasDates ? Math.min(7, calendarDays) : selectedDays;

  async function generate() {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError(false);
    setDownloadError(false);
    const controller = new AbortController();
    controllerRef.current = controller;
    const current = () => mountedRef.current && controllerRef.current === controller && !controller.signal.aborted;
    const days = requestedDays;
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
      if (!current()) return;
      if (!response.ok || typeof data !== "object" || data === null) throw new Error("Invalid itinerary");
      if ("itinerary" in data && isItinerary(data.itinerary, days)) {
        setItinerary(data.itinerary);
        setBasicGuide(null);
      } else if ("guide" in data && isBasicGuide(data.guide, days)) {
        setBasicGuide(data.guide);
        setItinerary(null);
      } else throw new Error("Invalid itinerary");
      setSaveStatus("idle");
    } catch {
      if (current()) setError(true);
    } finally {
      if (controllerRef.current === controller) {
        busyRef.current = false;
        controllerRef.current = null;
        if (mountedRef.current) setLoading(false);
      }
    }
  }

  // The same document the visitor sees (free guide, AI itinerary or the one Sofía delivered), saved as a PDF on their device.
  function download() {
    if (!itinerary && !basicGuide) return;
    let saved = false;
    try {
      // Data from the destination page plus the visitor's own dates and travelers; never prices or availability.
      const info = documentInfo(destination, language, context, t);
      const pdfDocument = itinerary ? itineraryDocument(itinerary, t, info) : basicGuideDocument(basicGuide!, requestedDays, t, info);
      saved = downloadPdf(buildPdf(pdfDocument), documentFileName(destination.name));
    } catch { saved = false; }
    setDownloadError(!saved);
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
    <section ref={plannerRef} tabIndex={-1} className={look.section} aria-label={t("itinerary.createPlan")}>
      {hasDates ? (
        <p className={look.duration}>
          {t("itinerary.duration")}: <span className={look.durationValue}>{dayLabel(Math.min(7, calendarDays))}</span>
          {calendarDays > 7 && <span className={look.maxDays}>{t("itinerary.maxDays")}</span>}
        </p>
      ) : (
        <fieldset className="mb-3">
          <legend className={look.legend}>{t("itinerary.duration")}</legend>
          <div className="grid grid-cols-7 gap-1.5">
            {([1, 2, 3, 4, 5, 6, 7] as const).map((day) => (
              <button key={day} type="button" aria-label={dayLabel(day)}
                aria-pressed={selectedDays === day} onClick={() => { setSelectedDays(day); setItinerary(null); setBasicGuide(null); setError(false); setDownloadError(false); setSaveStatus("idle"); }} disabled={loading || saving}
                className={`min-h-[44px] min-w-0 rounded-lg border text-sm font-semibold ${selectedDays === day
                  ? look.dayOn : look.dayOff}`}>
                {day}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <button type="button" onClick={() => void generate()} disabled={loading || saving}
        className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {loading ? t("itinerary.creating") : itinerary ? t("itinerary.regenerate") : t("itinerary.createPlan")}
      </button>
      {loading && <p role="status" className={look.status}>{t("itinerary.creating")}</p>}
      {error && <p role="alert" className={look.error}>{t("itinerary.error")}</p>}

      {basicGuide && (
        <div className={look.result}>
          <BasicGuideContent guide={basicGuide} requestedDays={requestedDays} surface={surface} />
          <button type="button" onClick={download} className={look.save}>{t("itinerary.download")}</button>
          {downloadError && <p role="alert" className={look.saveError}>{t("itinerary.downloadError")}</p>}
        </div>
      )}

      {itinerary && (
        <div className={look.result}>
          <ItineraryContent itinerary={itinerary} surface={surface} />
          <div className="flex flex-wrap gap-x-3">
            <button type="button" onClick={() => void saveGenerated()}
              disabled={saving || loading || saveStatus === "saved"}
              className={look.save}>
              {saving ? t("itinerary.saving") : saveStatus === "saved" ? t("itinerary.saved") : t("itinerary.save")}
            </button>
            <button type="button" onClick={download} className={look.save}>{t("itinerary.download")}</button>
          </div>
          {downloadError && <p role="alert" className={look.saveError}>{t("itinerary.downloadError")}</p>}
          {saveStatus === "signin" && <p role="alert" className={look.saveSignin}>{t("itinerary.signinRequired")}</p>}
          {saveStatus === "error" && <p role="alert" className={look.saveError}>{t("itinerary.saveError")}</p>}
        </div>
      )}
    </section>
  );
}
