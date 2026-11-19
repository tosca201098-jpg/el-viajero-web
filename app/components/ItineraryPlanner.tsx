"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import type { Destination } from "@/lib/destinations/featured";
import { calendarTripDays, suggestedItineraryDays } from "@/lib/itinerary/dates";
import { basicGuideDocument, documentFileName, documentInfo, itineraryDocument } from "@/lib/itinerary/document";
import { downloadPdf } from "@/lib/itinerary/download";
import { buildPdf } from "@/lib/pdf/text-pdf";
import { AI_ITINERARIES_PER_DAY } from "@/lib/itinerary/limits";
import { isBasicGuide, isItinerary } from "@/lib/itinerary/schema";
import type { BasicGuide, Itinerary, ItineraryRequest } from "@/lib/itinerary/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { saveItinerary } from "@/lib/supabase/saved-itineraries";
import BasicGuideContent from "./BasicGuideContent";
import ItineraryContent, { type ItinerarySurface } from "./ItineraryContent";
import { basicGuideResult, type BasicGuideReason, type VoiceItineraryRequest } from '@/lib/voice/itinerary';

export type ItineraryContext = {
  travelers?: number;
  departureDate?: string;
  returnDate?: string;
  budget?: { amount: number; type: "total" | "por_persona" };
};

// "dark" es el aspecto de siempre (/vuelos). "light" lo usa la ventana de ficha: tarjeta clara con
// texto oscuro, sin fondos negros. Solo cambian clases de estilo.
// A request that comes from Sofía waits at most this long (the server gives Anthropic 50 s) before it reports «unavailable».
const VOICE_AI_WAIT_MS = 70_000;
const aiNoteKey = {
  offer: "itinerary.aiOffer", limit: "itinerary.aiLimit", unavailable: "itinerary.aiUnavailable",
} as const;

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
  // What the server says about the AI itinerary next to the free guide: offered to guests, limit reached, or unavailable.
  const [aiNote, setAiNote] = useState<"offer" | "limit" | "unavailable" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "signin" | "saved" | "error">("idle");
  const busyRef = useRef(false);
  const savingRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const voiceEffectRef = useRef({ version: 0 });
  const activeVoiceRef = useRef<VoiceItineraryRequest | null>(null);
  const completedVoiceRef = useRef<VoiceItineraryRequest | null>(null);
  const guideVoiceRef = useRef<{ request: VoiceItineraryRequest; reason: BasicGuideReason } | null>(null);
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

  // The free guide answers Sofía's request once it is on screen: she is told it is a basic guide, never an AI itinerary.
  useEffect(() => {
    if (basicGuide && guideVoiceRef.current) {
      const { request, reason } = guideVoiceRef.current;
      guideVoiceRef.current = null;
      if (!request.signal.aborted) {
        plannerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        plannerRef.current?.focus({ preventScroll: true });
        request.complete(basicGuideResult(reason, destination.name, request.days, request.locale));
      }
    }
  }, [basicGuide, destination.name]);

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
      setAiNote(null);
      setError(false);
      setDownloadError(false);
      if (voiceRequest.itinerary) {
        completedVoiceRef.current = voiceRequest;
        setItinerary(voiceRequest.itinerary);
      } else {
        // Sofía gave only the destination and the days: ask the server (Claude Haiku) and report what really happens.
        setItinerary(null);
        void generate(voiceRequest);
      }
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

  async function generate(voice?: VoiceItineraryRequest) {
    // A request from Sofía takes over a manual generation that may be in flight; the manual one is simply dropped.
    if (voice) { controllerRef.current?.abort(); busyRef.current = false; }
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading(true);
    setError(false);
    setDownloadError(false);
    setAiNote(null);
    const controller = new AbortController();
    controllerRef.current = controller;
    const stop = () => controller.abort();
    voice?.signal.addEventListener("abort", stop, { once: true });
    let timedOut = false;
    const timer = voice ? setTimeout(() => { timedOut = true; controller.abort(); }, VOICE_AI_WAIT_MS) : null;
    const mine = () => mountedRef.current && controllerRef.current === controller;
    const current = () => mine() && !controller.signal.aborted;
    // Sofía's requests carry only the destination and the days: no dates, travelers or budget from the page.
    const trip: ItineraryContext = voice ? {} : context;
    const withDates = voice ? false : hasDates;
    const days = voice ? voice.days : requestedDays;
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
      locale: voice ? voice.locale : language,
      ...(trip.travelers ? { travelers: trip.travelers } : {}),
      ...(withDates ? { departureDate: trip.departureDate, returnDate: trip.returnDate } : {}),
      ...(trip.budget ? { budget: trip.budget } : {}),
    };
    try {
      // A registered visitor sends their own session so the server can write the itinerary with the AI; without it the
      // server answers with the free guide. Any problem reading the session simply means «not signed in».
      let token: string | null = null;
      try {
        const { data: { session } } = await getSupabaseClient().auth.getSession();
        token = session?.access_token ?? null;
      } catch { token = null; }
      if (!current()) return;
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const data: unknown = await response.json();
      if (!current()) return;
      if (!response.ok || typeof data !== "object" || data === null) throw new Error("Invalid itinerary");
      if ("itinerary" in data && isItinerary(data.itinerary, days)) {
        // For Sofía, success is reported only once the itinerary is on screen (see the effect on `itinerary`).
        if (voice) completedVoiceRef.current = voice;
        setItinerary(data.itinerary);
        setBasicGuide(null);
      } else if ("guide" in data && isBasicGuide(data.guide, days)) {
        setBasicGuide(data.guide);
        setItinerary(null);
        const limited = "aiNotice" in data && data.aiNotice === "limit";
        setAiNote(limited ? "limit" : "aiNotice" in data && data.aiNotice === "unavailable" ? "unavailable"
          : "aiOffer" in data && data.aiOffer === true ? "offer" : null);
        // The free guide is shown, but the AI itinerary Sofía asked for does not exist: once the guide is on screen she is
        // told it is only the basic guide (see the effect on `basicGuide`).
        if (voice) guideVoiceRef.current = { request: voice, reason: limited ? "limited" : "unavailable" };
      } else throw new Error("Invalid itinerary");
      setSaveStatus("idle");
    } catch {
      if (current() || (timedOut && mine())) setError(true);
      if (voice && (current() || timedOut)) voice.complete({ status: "error", error: "unavailable" });
    } finally {
      if (timer) clearTimeout(timer);
      voice?.signal.removeEventListener("abort", stop);
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
                aria-pressed={selectedDays === day} onClick={() => { setSelectedDays(day); setItinerary(null); setBasicGuide(null); setAiNote(null); setError(false); setDownloadError(false); setSaveStatus("idle"); }} disabled={loading || saving}
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
          {aiNote && <p role="note" className={look.status}>{t(aiNoteKey[aiNote], { count: AI_ITINERARIES_PER_DAY })}</p>}
          <button type="button" onClick={download} className={look.save}>{t("itinerary.download")}</button>
          {downloadError && <p role="alert" className={look.saveError}>{t("itinerary.downloadError")}</p>}
        </div>
      )}

      {itinerary && (
        <div className={look.result}>
          <ItineraryContent itinerary={itinerary} surface={surface} />
          <p className={look.maxDays}>{t("itinerary.aiLabel")}</p>
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
