"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { isLocale, translate, translateText, type Locale, type TranslationKey, type Variables } from "@/lib/i18n/translations";

export const LANGUAGE_STORAGE_KEY = "el-viajero.language";
const LanguageContext = createContext<{
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: TranslationKey, variables?: Variables) => string;
  text: (source: string) => string;
} | null>(null);

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Server and first client render agree. Browser storage is only read after hydration.
  const [language, updateLanguage] = useState<Locale>("es");
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isLocale(stored)) updateLanguage(stored);
    } catch { /* Storage can be disabled; the selector still works in memory. */ }
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    document.documentElement.lang = language;
    try { localStorage.setItem(LANGUAGE_STORAGE_KEY, language); } catch { /* Optional persistence. */ }
  }, [language, restored]);
  const setLanguage = useCallback((next: Locale) => {
    if (isLocale(next)) updateLanguage(next);
  }, []);
  const t = useCallback((key: TranslationKey, variables?: Variables) => translate(language, key, variables), [language]);
  const text = useCallback((source: string) => translateText(language, source), [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, t, text }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage requires LanguageProvider");
  return context;
}
