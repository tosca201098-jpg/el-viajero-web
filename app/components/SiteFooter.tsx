"use client";

// Pie de página legal discreto, al final de todas las páginas (se añade desde app/layout.tsx):
// «Aviso legal · Política de privacidad». No cambia ninguna tarjeta ni el diseño de la página, solo añade esta línea debajo.

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { footerText } from "@/lib/legal/footer-texts";

const linkClass = "inline-flex min-h-[44px] items-center rounded px-2 underline-offset-2 hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-600";

export default function SiteFooter() {
  const { language } = useLanguage();
  return (
    <footer className="px-4 pb-4 pt-2 text-center text-xs text-stone-600">
      <nav aria-label={footerText(language, "nav")} className="flex flex-wrap items-center justify-center gap-x-3">
        {/* Los textos legales están en español: hrefLang lo indica a lectores de pantalla y buscadores. */}
        <Link href="/aviso-legal" hrefLang="es" className={linkClass}>{footerText(language, "legal")}</Link>
        <span aria-hidden="true">·</span>
        <Link href="/privacidad" hrefLang="es" className={linkClass}>{footerText(language, "privacy")}</Link>
      </nav>
    </footer>
  );
}
