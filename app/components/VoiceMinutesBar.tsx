"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useLanguage } from "./LanguageProvider";

type Minutes = { limitSeconds: number; usedSeconds: number; remainingSeconds: number; resetsAt: number; bonusTrial: boolean };

function parseMinutes(data: unknown): Minutes | null {
  if (!data || typeof data !== "object") return null;
  const { period, limitSeconds, usedSeconds, remainingSeconds, resetsAt, bonusTrial } = data as Record<string, unknown>;
  if (period !== "week" && period !== "fortnight" && period !== "month") return null;
  if (![limitSeconds, usedSeconds, remainingSeconds, resetsAt].every(value => typeof value === "number" && Number.isInteger(value) && value >= 0) ||
      (bonusTrial !== true && (limitSeconds as number) < 1) ||
      (remainingSeconds as number) > (limitSeconds as number)) return null;
  return { limitSeconds: limitSeconds as number, usedSeconds: usedSeconds as number,
    remainingSeconds: remainingSeconds as number, resetsAt: resetsAt as number, bonusTrial: bonusTrial === true };
}

/** "8 min 20 s", "10 min" or "45 s": the units read the same in the seven languages. */
export function clock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} s`;
  return rest === 0 ? `${minutes} min` : `${minutes} min ${rest} s`;
}

/** Status bar of the voice minutes the signed-in account has left in its current period, shown inside "Mi cuenta". */
export default function VoiceMinutesBar() {
  const { t, language } = useLanguage();
  const [minutes, setMinutes] = useState<Minutes | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const { data } = await getSupabaseClient().auth.getSession();
        const token = data.session?.access_token;
        if (!token) throw new Error("no_session");
        const response = await fetch("/api/voice/minutes", {
          headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal,
        });
        if (!response.ok) throw new Error("unavailable");
        const parsed = parseMinutes(await response.json());
        if (!parsed) throw new Error("malformed");
        if (!controller.signal.aborted) { setMinutes(parsed); setState("ready"); }
      } catch {
        if (!controller.signal.aborted) setState("error");
      }
    })();
    return () => controller.abort();
  }, []);

  const title = t("account.voiceMinutes.title");
  if (state === "loading") {
    return (
      <div className="mt-4 rounded-2xl border border-stone-200 bg-white/60 p-4">
        <p className="text-sm font-semibold">{title}</p>
        <p role="status" className="mt-1 text-sm text-stone-600">{t("account.voiceMinutes.loading")}</p>
      </div>
    );
  }
  if (state === "error" || !minutes) {
    return (
      <div className="mt-4 rounded-2xl border border-stone-200 bg-white/60 p-4">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-stone-600">{t("account.voiceMinutes.error")}</p>
      </div>
    );
  }

  const meterMax = Math.max(1, minutes.limitSeconds);
  const share = Math.round((minutes.remainingSeconds / meterMax) * 100);
  const bar = minutes.remainingSeconds === 0 ? "bg-red-600" : share <= 25 ? "bg-amber-500" : "bg-blue-600";
  let date = "";
  try {
    date = new Intl.DateTimeFormat(language, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" })
      .format(minutes.resetsAt * 1000);
  } catch { /* The date is a courtesy: without it the bar still says what is left. */ }
  const summary = minutes.remainingSeconds === 0
    ? t("account.voiceMinutes.none")
    : t("account.voiceMinutes.left", { left: clock(minutes.remainingSeconds), total: clock(minutes.limitSeconds) });
  return (
    <div className="mt-4 rounded-2xl border border-stone-200 bg-white/60 p-4">
      <p id="voice-minutes-title" className="text-sm font-semibold">{title}</p>
      <div
        role="progressbar" aria-labelledby="voice-minutes-title" aria-valuemin={0} aria-valuemax={meterMax}
        aria-valuenow={minutes.remainingSeconds} aria-valuetext={summary}
        className="mt-2 h-3 w-full overflow-hidden rounded-full bg-stone-200"
      >
        <div className={`h-full rounded-full transition-[width] ${bar}`} style={{ width: `${share}%` }} />
      </div>
      <p className="mt-2 text-sm font-medium text-stone-800">{summary}</p>
      {date && !minutes.bonusTrial && <p className="mt-0.5 text-xs text-stone-600">{t("account.voiceMinutes.resets", { date })}</p>}
    </div>
  );
}
