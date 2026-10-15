"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { locales, type Locale } from "@/lib/i18n/translations";
import { useLanguage } from "./LanguageProvider";

const languageFlags: Record<Locale, string> = {
  es: "🇪🇸", en: "🇬🇧", fr: "🇫🇷",
  de: "🇩🇪", it: "🇮🇹", pt: "🇵🇹",
};

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
        <span aria-hidden="true">{languageFlags[language]}</span>
      </button>
      {open && <div id={menuId} role="menu" aria-label={t("language.choose")} onKeyDown={onKeyDown}
        className="absolute right-0 top-full z-50 mt-2 w-44 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-stone-200 bg-[#F7F2E8] p-1.5 text-sm text-stone-800 shadow-xl">
        {locales.map((locale, index) => <button key={locale.code} ref={(element) => { items.current[index] = element; }}
          type="button" role="menuitemradio" aria-checked={language === locale.code} lang={locale.code} tabIndex={-1}
          onClick={() => { setLanguage(locale.code); setOpen(false); trigger.current?.focus(); }}
          className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${language === locale.code ? "bg-blue-100 font-semibold text-blue-800" : "hover:bg-white/80"}`}>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="text-lg leading-none">{languageFlags[locale.code]}</span>
            <span>{locale.label}</span>
          </span>
          <span aria-hidden="true">{language === locale.code ? "✓" : ""}</span>
        </button>)}
      </div>}
    </div>
  );
}
