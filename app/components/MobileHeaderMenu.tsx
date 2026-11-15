"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { locales } from "@/lib/i18n/translations";
import { useLanguage } from "./LanguageProvider";
import { FlagIcon } from "./LanguageSelector";

// Botón de la persona dibujada de la cabecera de la portada. Solo se ve en el móvil (menos de 640 px): ahí la cabecera lleva el
// logotipo y este botón, que abre la lista con las opciones de la cuenta («Crear cuenta» e «Iniciar sesión»; o «Mi cuenta»,
// «Mis viajes», «Itinerarios» y «Cerrar sesión» si ya se ha entrado) y el cambio de idioma, para que la barra no vaya tan
// comprimida. Desde 640 px la cabecera sigue como antes.
export default function MobileHeaderMenu({ ready, signedIn, signingOut, error, onSignUp, onSignIn, onAccount, onAccountSection, onSignOut }: {
  ready: boolean;
  signedIn: boolean;
  signingOut: boolean;
  error: string;
  onSignUp: () => void;
  onSignIn: () => void;
  onAccount: () => void;
  onAccountSection: (section: "trips" | "itineraries") => void;
  onSignOut: () => void;
}) {
  const { language, setLanguage, t, text } = useLanguage();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  // Si la sesión cambia (se acaba de entrar o de salir), la lista se cierra.
  useEffect(() => {
    setOpen(false);
  }, [signedIn]);

  // Cierra el menú y devuelve el foco al botón: así, si la acción abre una ventana (iniciar sesión, crear cuenta, mi cuenta),
  // al cerrarla el foco vuelve a un elemento que existe.
  function close() {
    setOpen(false);
    trigger.current?.focus();
  }
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    }
  }
  function choose(action: () => void) {
    close();
    action();
  }

  const itemClass = "flex min-h-[44px] w-full items-center justify-center rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600";
  const solid = `${itemClass} bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-offset-2`;
  const outline = `${itemClass} border border-blue-200 bg-white/70 text-blue-700 hover:bg-white`;
  const plain = `${itemClass} border border-stone-200 bg-white/70 text-stone-800 hover:bg-white`;

  return (
    <div
      ref={container}
      className="relative shrink-0 sm:hidden"
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={t("header.menu")}
        title={t("header.menu")}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-11 items-center justify-center rounded-full text-stone-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <span className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${open ? "border-blue-500 bg-white text-blue-700" : "border-stone-300/70 bg-white/40"}`}>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="3.6" />
            <path d="M4.8 20.2c0-3.9 3.2-6.8 7.2-6.8s7.2 2.9 7.2 6.8" />
          </svg>
        </span>
      </button>
      {open && (
        <div
          id={menuId}
          role="group"
          aria-label={t("header.menu")}
          className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100dvh-5rem)] w-72 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-2xl border border-stone-200 bg-[#F7F2E8] p-2 text-sm text-stone-800 shadow-xl"
        >
          {ready && (
            <div className="flex flex-col gap-1.5">
              {signedIn ? (
                <>
                  <button type="button" onClick={() => choose(onAccount)} className={solid}>
                    {t("account.title")}
                  </button>
                  <button type="button" onClick={() => choose(() => onAccountSection("trips"))} className={plain}>
                    {t("trips.title")}
                  </button>
                  <button type="button" onClick={() => choose(() => onAccountSection("itineraries"))} className={plain}>
                    {t("savedItineraries.title")}
                  </button>
                  <button type="button" onClick={onSignOut} disabled={signingOut} className={`${outline} disabled:opacity-60`}>
                    {signingOut ? t("auth.signingOut") : t("auth.signout")}
                  </button>
                  {error && <p role="alert" className="px-2 text-xs text-red-700">{text(error)}</p>}
                </>
              ) : (
                <>
                  <button type="button" onClick={() => choose(onSignUp)} className={solid}>
                    {t("auth.signup")}
                  </button>
                  <button type="button" onClick={() => choose(onSignIn)} className={outline}>
                    {t("auth.signin")}
                  </button>
                </>
              )}
            </div>
          )}
          <p id={`${menuId}-language`} className={`px-2 pb-1 text-xs font-bold uppercase tracking-wide text-stone-500 ${ready ? "pt-3" : "pt-1"}`}>
            {t("language.choose")}
          </p>
          <div role="group" aria-labelledby={`${menuId}-language`} className="grid grid-cols-2 gap-1">
            {locales.map((locale) => (
              <button
                key={locale.code}
                type="button"
                lang={locale.code}
                aria-pressed={language === locale.code}
                onClick={() => {
                  setLanguage(locale.code);
                  close();
                }}
                className={`flex min-h-[44px] items-center gap-2 rounded-xl px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${language === locale.code ? "bg-blue-100 font-semibold text-blue-800" : "hover:bg-white/80"}`}
              >
                <FlagIcon locale={locale.code} />
                <span className="min-w-0 truncate">{locale.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
