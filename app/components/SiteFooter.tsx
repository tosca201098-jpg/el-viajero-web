"use client";

// Pie de página legal discreto, al final de todas las páginas (se añade desde app/layout.tsx):
// «Aviso legal · Política de privacidad · Cookies» (el último reabre el aviso de cookies). No cambia ninguna tarjeta ni el diseño de la página, solo añade esta línea debajo.

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { footerText } from "@/lib/legal/footer-texts";
import { cookieText } from "@/lib/consent/texts";
import { OPEN_CONSENT_EVENT } from "@/lib/consent/cookies";

const linkClass = "inline-flex min-h-[44px] items-center rounded px-2 underline-offset-2 hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-600";

export default function SiteFooter() {
  const { language } = useLanguage();
  return (
    <footer className="relative z-10 px-4 pb-24 pt-2 text-center text-xs text-stone-600">
      <nav aria-label={footerText(language, "nav")} className="flex flex-wrap items-center justify-center gap-x-3">
        {/* Los textos legales están en español: hrefLang lo indica a lectores de pantalla y buscadores. */}
        <Link href="/aviso-legal" hrefLang="es" className={linkClass}>{footerText(language, "legal")}</Link>
        <span aria-hidden="true">·</span>
        <Link href="/privacidad" hrefLang="es" className={linkClass}>{footerText(language, "privacy")}</Link>
        <span aria-hidden="true">·</span>
        <button type="button" data-cookie-settings onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))} className={linkClass + " underline"}>{cookieText(language, "footer")}</button>
      </nav>
    </footer>
  );
}
