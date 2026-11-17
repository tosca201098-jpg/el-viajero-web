// Marco común de las páginas legales (privacidad y aviso legal): título, aviso de borrador y enlaces entre ellas.
// Componente de servidor (sin estado). Los datos del titular que faltan salen resaltados con «[PENDIENTE: …]» y los puntos a revisar
// por un profesional con «[REVISAR: …]» (estos últimos solo mientras LEGAL_IS_DRAFT sea true).

import type { ReactNode } from "react";
import Link from "next/link";
import { LEGAL_IS_DRAFT, LEGAL_UPDATED } from "@/lib/legal/owner";

/** Texto que falta por completar: resaltado y visible, para que no pase desapercibido. */
export function Pending({ label }: { label: string }) {
  return <mark className="rounded bg-yellow-200 px-1 font-semibold text-stone-900">[PENDIENTE: {label}]</mark>;
}

/** Punto que debe revisar o confirmar un profesional: solo se ve mientras la página sea un borrador. */
export function Review({ label }: { label: string }) {
  return LEGAL_IS_DRAFT ? <mark className="rounded bg-yellow-200 px-1 font-semibold text-stone-900">[REVISAR: {label}]</mark> : null;
}

/** Dato del titular: el valor si está relleno; si no, un hueco «[PENDIENTE: …]». */
export function Owner({ value, label }: { value: string; label: string }) {
  return value.trim() ? <>{value}</> : <Pending label={label} />;
}

export default function LegalPage({ title, current, children }: { title: string; current: "privacidad" | "aviso-legal"; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-stone-800 sm:px-6 sm:py-12">
      <Link href="/" className="text-sm font-semibold text-blue-700 underline hover:text-blue-800">← Destinauta</Link>
      <h1 className="mt-4 text-3xl font-black sm:text-4xl">{title}</h1>
      {LEGAL_IS_DRAFT && (
        <p role="note" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <strong>Borrador sin validar.</strong> Los textos resaltados en amarillo son datos que faltan por completar o puntos que hay que confirmar, y todo el texto debe revisarlo un profesional antes de publicarlo. No constituye asesoramiento jurídico.
        </p>
      )}
      <p className="mt-4 text-sm text-stone-600">
        Última actualización: {LEGAL_UPDATED.trim() ? LEGAL_UPDATED : <Pending label="fecha de la última revisión" />}
      </p>
      <div className="mt-6 space-y-6 text-base leading-7 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-bold [&_li]:mt-2 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:font-semibold [&_a]:text-blue-700 [&_a]:underline">
        {children}
      </div>
      <nav aria-label="Páginas legales" className="mt-10 flex flex-wrap gap-4 border-t border-stone-300 pt-4 text-sm">
        <Link href="/privacidad" aria-current={current === "privacidad" ? "page" : undefined} className="font-semibold text-blue-700 underline hover:text-blue-800">Política de privacidad</Link>
        <Link href="/aviso-legal" aria-current={current === "aviso-legal" ? "page" : undefined} className="font-semibold text-blue-700 underline hover:text-blue-800">Aviso legal</Link>
      </nav>
    </main>
  );
}
