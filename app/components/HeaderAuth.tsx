"use client";

import { useLanguage } from "./LanguageProvider";

import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import SavedTrips from "./SavedTrips";
import SavedItineraries from "./SavedItineraries";

const primaryButton = "whitespace-nowrap max-sm:whitespace-normal max-sm:leading-[14px] max-sm:max-w-[92px] rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:px-4 sm:text-sm max-sm:min-h-[44px] max-sm:px-1.5";
const secondaryButton = "whitespace-nowrap max-sm:whitespace-normal max-sm:leading-[14px] max-sm:max-w-[92px] rounded-lg px-2 py-1 text-xs font-medium text-stone-700 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:px-3 sm:py-2 sm:text-sm";

export default function HeaderAuth({ onOpenAuth }: {
  onOpenAuth: (mode: "signup" | "signin") => void;
}) {
  const { t, text } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountSection, setAccountSection] = useState<"trips" | "itineraries">("trips");
  const signingOutRef = useRef(false);
  const accountRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    try {
      const { data: { subscription } } = getSupabaseClient().auth.onAuthStateChange(
        (_event, nextSession) => {
          // INITIAL_SESSION restores the persisted session after a reload.
          // Keep this callback synchronous: it only updates the header UI.
          setSession(nextSession);
          setReady(true);
          setError("");
          if (!nextSession) setAccountOpen(false);
        }
      );
      return () => subscription.unsubscribe();
    } catch {
      // Keep the original login buttons available if configuration is missing.
      // The existing login form reports the configuration error on submission.
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const dialog = accountRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previousFocus?.focus();
    };
  }, [accountOpen]);

  async function signOut() {
    if (signingOutRef.current) return;
    signingOutRef.current = true;
    setSigningOut(true);
    setError("");
    try {
      const { error: signOutError } = await getSupabaseClient().auth.signOut();
      if (signOutError) {
        setError("No se ha podido cerrar sesión. Inténtalo de nuevo.");
        return;
      }
      setSession(null);
      setAccountOpen(false);
    } catch {
      setError("No se ha podido cerrar sesión. Inténtalo de nuevo.");
    } finally {
      signingOutRef.current = false;
      setSigningOut(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3 max-sm:flex-row max-sm:items-center max-sm:gap-0.5">
      {!ready ? (
        <span role="status" aria-label={t("auth.checking")} className="h-16 w-28 sm:h-9 sm:w-56 max-sm:h-11 max-sm:w-44" />
      ) : session ? (
        <>
          <button type="button" onClick={() => setAccountOpen(true)} className={primaryButton}>
            {t("account.title")}
          </button>
          <button type="button" onClick={signOut} disabled={signingOut} className={`${secondaryButton} disabled:opacity-60 max-sm:min-h-[44px] max-sm:py-2`}>
            {signingOut ? t("auth.signingOut") : t("auth.signout")}
          </button>
          {error && !accountOpen && <p role="alert" className="max-w-48 text-right text-xs text-red-700">{text(error)}</p>}
        </>
      ) : (
        <>
          <button type="button" onClick={() => onOpenAuth("signup")} className={primaryButton}>
            {t("auth.signup")}
          </button>
          <button type="button" onClick={() => onOpenAuth("signin")} className={`${secondaryButton} max-sm:min-h-[44px] max-sm:py-2`}>
            {t("auth.signin")}
          </button>
        </>
      )}
      {accountOpen && session && (
        <dialog
          ref={accountRef}
          aria-labelledby="account-dialog-title"
          onCancel={(event) => { event.preventDefault(); setAccountOpen(false); }}
          className={`fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-[28px] border border-stone-200 bg-[#F7F2E8] p-4 text-left text-stone-800 shadow-2xl backdrop:bg-black/50 sm:p-8 ${accountSection === "itineraries" ? "max-w-3xl" : "max-w-md"}`}
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="account-dialog-title" className="text-2xl font-black">{t("account.title")}</h2>
            <button type="button" onClick={() => setAccountOpen(false)} aria-label={t("common.close")} className="rounded-lg px-3 py-2 text-xl hover:bg-stone-200 focus-visible:ring-2 focus-visible:ring-blue-600">×</button>
          </div>
          <div className="mt-5 rounded-2xl border border-stone-200 bg-white/60 p-4">
            <p className="text-sm font-semibold">{t("auth.email")}</p>
            <p className="mt-1 break-all text-sm text-stone-700">{session.user.email}</p>
          </div>
          <div role="tablist" aria-label={t("account.sections")} className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" role="tab" id="account-trips-tab" aria-controls="account-content" aria-selected={accountSection === "trips"}
              onClick={() => setAccountSection("trips")}
              className={`min-h-[44px] rounded-xl px-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-blue-600 ${accountSection === "trips" ? "bg-blue-600 text-white" : "border border-blue-200 text-blue-700"}`}>
              {t("trips.title")}
            </button>
            <button type="button" role="tab" id="account-itineraries-tab" aria-controls="account-content" aria-selected={accountSection === "itineraries"}
              onClick={() => setAccountSection("itineraries")}
              className={`min-h-[44px] rounded-xl px-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-blue-600 ${accountSection === "itineraries" ? "bg-blue-600 text-white" : "border border-blue-200 text-blue-700"}`}>
              {t("savedItineraries.title")}
            </button>
          </div>
          <section id="account-content" role="tabpanel" aria-labelledby={accountSection === "trips" ? "account-trips-tab" : "account-itineraries-tab"}
            className="mt-3 min-w-0 rounded-2xl border border-blue-100 bg-blue-50/70 p-3 sm:p-4">
            {accountSection === "trips" ? <SavedTrips key={session.user.id} /> : <SavedItineraries key={session.user.id} />}
          </section>
          <div className="mt-6 border-t border-stone-200 pt-4">
            {error && <p role="alert" className="mb-3 text-sm text-red-700">{text(error)}</p>}
            <button type="button" onClick={signOut} disabled={signingOut} className={`${secondaryButton} w-full border border-stone-300 disabled:opacity-60`}>
              {signingOut ? t("auth.signingOut") : t("auth.signout")}
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
