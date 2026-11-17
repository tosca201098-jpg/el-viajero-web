"use client";

// «Vuelos a buen precio por correo» dentro de «Mi cuenta»: cuestionario opcional de una sola vez y casilla de permiso aparte.
// Solo guarda las respuestas en Supabase (tabla email_preferences, cada cuenta ve solo la suya); no envía ningún correo.
// Se carga al abrir el desplegable por primera vez, para no hacer una consulta cada vez que se abre «Mi cuenta».

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import EmailPreferencesForm, { type FormNotice } from "./EmailPreferencesForm";
import { emailText } from "@/lib/email-preferences/texts";
import { EMPTY_ANSWERS, type EmailPreferenceAnswers } from "@/lib/email-preferences/options";
import {
  deleteEmailPreferences, getEmailPreferences, rowToAnswers, saveEmailPreferences, type EmailPreferencesRow,
} from "@/lib/supabase/email-preferences";

export default function EmailPreferences() {
  const { language } = useLanguage();
  const [requested, setRequested] = useState(false);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [attempt, setAttempt] = useState(0);
  const [row, setRow] = useState<EmailPreferencesRow | null>(null);
  const [answers, setAnswers] = useState<EmailPreferenceAnswers>(EMPTY_ANSWERS);
  const [busy, setBusy] = useState<"" | "saving" | "deleting">("");
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const busyRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!requested) return;
    let active = true;
    setLoadState("loading");
    getEmailPreferences().then((data) => {
      if (!active) return;
      setRow(data);
      setAnswers(rowToAnswers(data));
      setLoadState("ready");
    }).catch(() => {
      if (active) setLoadState("error");
    });
    return () => { active = false; };
  }, [requested, attempt]);

  async function save() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("saving");
    setNotice(null);
    try {
      const saved = await saveEmailPreferences(answers, language);
      if (!mountedRef.current) return;
      setRow(saved);
      setAnswers(rowToAnswers(saved));
      setNotice("saved");
    } catch {
      if (mountedRef.current) setNotice("saveError");
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setBusy("");
    }
  }

  async function remove() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("deleting");
    setNotice(null);
    try {
      await deleteEmailPreferences();
      if (!mountedRef.current) return;
      setRow(null);
      setAnswers(EMPTY_ANSWERS);
      setNotice("deleted");
    } catch {
      if (mountedRef.current) setNotice("deleteError");
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setBusy("");
    }
  }

  return (
    <details className="mt-4 rounded-2xl border border-stone-200 bg-white/60" onToggle={(event) => { if (event.currentTarget.open) setRequested(true); }}>
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 rounded-2xl p-4 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-blue-600">
        <span className="min-w-0">{emailText(language, "title")}</span>
        <span className="text-xs font-normal text-stone-600">{emailText(language, "optional")}</span>
      </summary>
      <div className="px-4 pb-4">
        {loadState === "loading" && <p role="status" className="text-sm leading-6 text-stone-700">{emailText(language, "loading")}</p>}
        {loadState === "error" && (
          <div>
            <p role="alert" className="text-sm leading-6 text-red-700">{emailText(language, "loadError")}</p>
            <button type="button" onClick={() => setAttempt((current) => current + 1)} className="mt-2 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-600">{emailText(language, "retry")}</button>
          </div>
        )}
        {loadState === "ready" && (
          <EmailPreferencesForm
            language={language} answers={answers} onChange={setAnswers} onSave={save} onDelete={remove}
            busy={busy} notice={notice} hasSavedRow={row !== null}
            savedConsent={row?.email_consent === true} consentGivenAt={row?.consent_given_at ?? null} consentWithdrawnAt={row?.consent_withdrawn_at ?? null}
          />
        )}
      </div>
    </details>
  );
}
