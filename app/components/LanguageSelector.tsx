"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { locales, type Locale } from "@/lib/i18n/translations";
import { useLanguage } from "./LanguageProvider";

function FlagIcon({ locale }: { locale: Locale }) {
  return <svg aria-hidden="true" viewBox="0 0 24 16" className="h-4 w-6 shrink-0 overflow-hidden rounded-[2px]">
    {locale === "es" && <><path fill="#AA151B" d="M0 0h24v16H0z" /><path fill="#F1BF00" d="M0 4h24v8H0z" /><path fill="#AA151B" d="M8 6h2v4H8z" /></>}
    {locale === "en" && <><path fill="#012169" d="M0 0h24v16H0z" /><path stroke="#fff" strokeWidth="3" d="m0 0 24 16M24 0 0 16" /><path stroke="#C8102E" strokeWidth="1.3" d="m0 0 24 16M24 0 0 16" /><path stroke="#fff" strokeWidth="5" d="M12 0v16M0 8h24" /><path stroke="#C8102E" strokeWidth="2.5" d="M12 0v16M0 8h24" /></>}
    {locale === "fr" && <><path fill="#0055A4" d="M0 0h8v16H0z" /><path fill="#fff" d="M8 0h8v16H8z" /><path fill="#EF4135" d="M16 0h8v16h-8z" /></>}
    {locale === "de" && <><path d="M0 0h24v5.33H0z" /><path fill="#DD0000" d="M0 5.33h24v5.34H0z" /><path fill="#FFCE00" d="M0 10.67h24V16H0z" /></>}
    {locale === "it" && <><path fill="#009246" d="M0 0h8v16H0z" /><path fill="#fff" d="M8 0h8v16H8z" /><path fill="#CE2B37" d="M16 0h8v16h-8z" /></>}
    {locale === "pt" && <><path fill="#006600" d="M0 0h10v16H0z" /><path fill="#FF0000" d="M10 0h14v16H10z" /><circle cx="10" cy="8" r="3.3" fill="#FFCC00" /><path fill="#fff" d="M8.5 6.5h3v3h-3z" /><path fill="#003399" d="M9.5 7h1v2h-1z" /></>}
  </svg>;
}

export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const menuId = useId();
  useEffect(() => {
    if (!open) return;
    items.current[locales.findIndex((locale) => locale.code === language)]?.focus();
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, language]);
  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault(); setOpen(false); trigger.current?.focus();
    }
    if (event.key === "Tab") setOpen(false);
    const current = items.current.indexOf(document.activeElement as HTMLButtonElement);
    const direction = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (direction || event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const index = event.key === "Home" ? 0 : event.key === "End" ? locales.length - 1 : (current + direction + locales.length) % locales.length;
      items.current[index]?.focus();
    }
  }
  return (
    <div ref={container} className="relative shrink-0" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <button ref={trigger} type="button" aria-label={t("language.choose")} title={t("language.choose")}
        aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); } }}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-stone-300/70 bg-white/40 text-lg text-stone-700 transition hover:bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
        <FlagIcon locale={language} />
      </button>
      {open && <div id={menuId} role="menu" aria-label={t("language.choose")} onKeyDown={onKeyDown}
        className="absolute right-0 top-full z-50 mt-2 w-44 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-stone-200 bg-[#F7F2E8] p-1.5 text-sm text-stone-800 shadow-xl">
        {locales.map((locale, index) => <button key={locale.code} ref={(element) => { items.current[index] = element; }}
          type="button" role="menuitemradio" aria-checked={language === locale.code} lang={locale.code} tabIndex={-1}
          onClick={() => { setLanguage(locale.code); setOpen(false); trigger.current?.focus(); }}
          className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${language === locale.code ? "bg-blue-100 font-semibold text-blue-800" : "hover:bg-white/80"}`}>
          <span className="flex items-center gap-2">
            <FlagIcon locale={locale.code} />
            <span>{locale.label}</span>
          </span>
          <span aria-hidden="true">{language === locale.code ? "✓" : ""}</span>
        </button>)}
      </div>}
    </div>
  );
}
