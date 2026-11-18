"use client";

import { useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import { saveTrip, type NewSavedTrip } from "@/lib/supabase/saved-trips";
import { typedOriginFor } from "@/lib/supabase/saved-flights";

type HeartState = "idle" | "saving" | "saved" | "login" | "error";

// ♡ «Guardar vuelo»: saves the flight search (origin, destination, the day(s) chosen, travelers) into «Mis viajes».
// It never saves by itself: only when the person presses it, and only with a signed-in account.
// `search` is the provider's code for an exact search: with it, the origin name typed in the form replaces the airport code.
export default function SaveFlightHeart({ trip, search, className = "" }: { trip: NewSavedTrip; search?: string; className?: string }) {
  const { t } = useLanguage();
  const [state, setState] = useState<HeartState>("idle");
  const busy = useRef(false);

  async function save() {
    if (busy.current || state === "saved") return;
    busy.current = true;
    setState("saving");
    try {
      const { data: { session }, error } = await getSupabaseClient().auth.getSession();
      if (error) throw error;
      if (!session) { setState("login"); return; }
      const origin = search ? typedOriginFor(search) : null;
      await saveTrip(origin ? { ...trip, origin } : trip);
      setState("saved");
    } catch (error) {
      setState(error instanceof Error && error.message === "Inicia sesión para acceder a tus viajes." ? "login" : "error");
    } finally {
      busy.current = false;
    }
  }

  const saved = state === "saved";
  const label = saved ? t("search.flightSaved") : state === "saving" ? t("search.savingTrip") : t("search.saveFlight");
  return (
    <div className={className} data-save-flight>
      <button
        type="button"
        onClick={() => void save()}
        disabled={state === "saving" || saved}
        aria-pressed={saved}
        className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-default ${
          saved ? "border-rose-500 bg-rose-50 text-rose-700" : "border-rose-300 bg-white/80 text-rose-700 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"}`}
      >
        <span aria-hidden="true" className="text-lg leading-none">{saved ? "♥" : "♡"}</span>
        {label}
      </button>
      {(state === "login" || state === "error") && (
        <p role="alert" className="mt-1.5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800">
          {t(state === "login" ? "search.signInToSave" : "search.saveError")}
        </p>
      )}
    </div>
  );
}
