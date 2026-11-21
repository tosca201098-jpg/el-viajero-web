"use client";

// Aviso de cookies: sin decisión guardada no se carga ningún servicio de terceros (ver lib/consent/scripts.ts).
// «Aceptar» y «Rechazar» tienen el mismo aspecto y tamaño. «Rechazar» (o cambiar de opinión) borra las huellas conocidas y recarga la página.
// Se vuelve a abrir desde el enlace «Cookies» del pie de página. No se pinta nada en el servidor para no descuadrar la hidratación.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { cookieText } from "@/lib/consent/texts";
import { CONSENT_KEY, OPEN_CONSENT_EVENT, clearThirdPartyTraces, readConsent, writeConsent } from "@/lib/consent/cookies";
import { loadThirdPartyScripts } from "@/lib/consent/scripts";
import type { Locale } from "@/lib/i18n/translations";

const buttonClass = "inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-2 border-blue-700 bg-white px-4 py-2 text-sm font-bold text-blue-800 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600 sm:flex-none sm:min-w-[140px]";

/** Parte visible, sin estado: así se puede comprobar el texto y los botones en los siete idiomas. */
export function CookieBanner({ language, onAccept, onReject }: { language: Locale; onAccept?: () => void; onReject?: () => void }) {
  return (
    <section
      role="region"
      aria-label={cookieText(language, "title")}
      data-cookie-banner
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-stone-300 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.12)]"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
        <div className="min-w-0 text-sm leading-6 text-stone-800">
          <p className="font-bold">{cookieText(language, "title")}</p>
          <p>
            {cookieText(language, "body")}{" "}
            <Link href="/privacidad#cookies" hrefLang="es" className="font-semibold text-blue-700 underline hover:text-blue-800">{cookieText(language, "more")}</Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button type="button" data-cookie-reject onClick={onReject} className={buttonClass}>{cookieText(language, "reject")}</button>
          <button type="button" data-cookie-accept onClick={onAccept} className={buttonClass}>{cookieText(language, "accept")}</button>
        </div>
      </div>
    </section>
  );
}

export default function CookieConsent() {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stored: Storage | undefined;
    try { stored = window.localStorage; } catch { stored = undefined; }
    const consent = readConsent(stored);
    if (!consent) setOpen(true);
    else if (consent.thirdParty) loadThirdPartyScripts(document as never);
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  const decide = useCallback((thirdParty: boolean) => {
    let local: Storage | undefined; let session: Storage | undefined;
    try { local = window.localStorage; session = window.sessionStorage; } catch { /* Sin almacenamiento. */ }
    const before = readConsent(local);
    writeConsent(local, thirdParty);
    setOpen(false);
    if (thirdParty) { loadThirdPartyScripts(document as never); return; }
    // Rechazar: se borran las huellas conocidas; si ya estaban cargados, se recarga para que dejen de funcionar.
    const removed = clearThirdPartyTraces(document, local, session);
    if (before?.thirdParty || removed.length) window.location.reload();
  }, []);

  if (!open) return null;
  return <CookieBanner language={language} onAccept={() => decide(true)} onReject={() => decide(false)} />;
}

export { CONSENT_KEY };
