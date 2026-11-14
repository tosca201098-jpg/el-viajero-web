"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
import {
  CARDS_PER_BLOCK, DEFAULT_ORIGIN_CODE, MONTHLY_ORIGINS, ORIGIN_STORAGE_KEY, findMonthlyOrigin, formatTripRange,
  type MonthlyCard, type MonthlyOffersResponse,
} from "@/lib/travelpayouts/monthly-shared";

// `children` es la lista de destinos recomendados de siempre: se muestra si no hay precios y sin JavaScript.
type Props = { month: number; monthName: string; children: ReactNode };
type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: MonthlyOffersResponse };

function isResponse(value: unknown): value is MonthlyOffersResponse {
  const body = value as Partial<MonthlyOffersResponse> | null;
  return Boolean(body && body.success === true && Array.isArray(body.spain) && Array.isArray(body.international));
}

function Skeleton() {
  return (
    <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-blue-600/10 bg-white/60">
          <div className="h-40 bg-stone-200 sm:h-44" />
          <div className="space-y-3 p-4">
            <div className="h-5 w-2/3 rounded bg-stone-200" />
            <div className="h-4 w-1/3 rounded bg-stone-200" />
            <div className="h-14 rounded-xl bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function OfferCards({ cards, zone }: { cards: MonthlyCard[]; zone: "spain" | "international" }) {
  const { language, t } = useLanguage();
  const currency = new Intl.NumberFormat(language, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  return (
    <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const text = card.texts[language] ?? card.texts.es;
        const profileUrl = `/?ficha=${encodeURIComponent(card.name)}`;
        const stops = card.transfers === null ? "" : card.transfers === 0 ? t("monthly.direct")
          : card.transfers === 1 ? t("monthly.oneStop") : t("monthly.stops", { count: card.transfers });
        const details = [
          formatTripRange(card.departureAt, card.returnAt, language),
          t("monthly.nights", { count: card.nights }),
          stops,
        ].filter(Boolean).join(" · ");
        const priceBlock = (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">{t("monthly.roundTripFrom")}</p>
            <p className="text-2xl font-black leading-tight text-stone-900">{currency.format(Math.ceil(card.price))}</p>
            <p className="text-xs text-stone-600">{details}</p>
          </>
        );
        return (
          <article key={card.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-blue-600/20 bg-white/80 shadow-sm">
            <div className="relative">
              <img src={card.image} alt={`${text.name}, ${text.country}`} loading="lazy" className="h-40 w-full object-cover sm:h-44" />
              <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm ${zone === "spain" ? "bg-blue-600" : "bg-stone-800"}`}>
                {zone === "spain" ? t("monthly.badgeSpain") : t("monthly.internationalTitle")}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-xl font-black leading-tight text-stone-900">{text.name}</h3>
              <p className="mt-1 text-sm text-stone-600">{text.country}</p>
              {card.offerUrl ? (
                <a href={card.offerUrl} target="_blank" rel="noopener noreferrer sponsored" className="mt-3 flex items-end justify-between gap-2 rounded-xl bg-blue-50 px-3 py-2 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  <span className="min-w-0">{priceBlock}</span>
                  <span className="shrink-0 pb-0.5 text-xs font-bold text-blue-700">{t("search.viewOffer")} →</span>
                </a>
              ) : (
                <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2">{priceBlock}</div>
              )}
              <p className="mt-1 text-xs text-stone-500">{t("monthly.priceSeen")}</p>
              <p className="mt-2 text-sm text-stone-700">{t("destinations.recommendedStay")}: {text.stay}</p>
              {card.credit && <a href={card.credit.source} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-stone-600 underline">{card.credit.credit} · {card.credit.license}</a>}
              <div className="mt-auto grid gap-2 pt-4">
                <Link href={profileUrl} className="flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  {t("monthly.viewDestination")}
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/**
 * Vuelos más baratos del mes desde el aeropuerto elegido: dos bloques (España e Internacional) con precios
 * reales. Si la consulta falla o no hay ningún precio, se muestra la lista de destinos recomendados de siempre.
 */
export default function MonthlyOffers({ month, monthName, children }: Props) {
  const { t } = useLanguage();
  // Servidor y primer pintado del navegador coinciden; el aeropuerto recordado se lee después de hidratar.
  const [origin, setOrigin] = useState(DEFAULT_ORIGIN_CODE);
  const [restored, setRestored] = useState(false);
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    try {
      const stored = findMonthlyOrigin(localStorage.getItem(ORIGIN_STORAGE_KEY));
      if (stored) setOrigin(stored.code);
    } catch { /* El almacenamiento puede estar desactivado: el selector sigue funcionando en memoria. */ }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    const controller = new AbortController();
    setState({ status: "loading" });
    fetch(`/api/travelpayouts/monthly?month=${month}&origin=${origin}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("monthly offers")))
      .then((body: unknown) => {
        if (controller.signal.aborted) return;
        setState(isResponse(body) ? { status: "ready", data: body } : { status: "error" });
      })
      .catch(() => { if (!controller.signal.aborted) setState({ status: "error" }); });
    return () => controller.abort();
  }, [month, origin, restored]);

  const changeOrigin = (code: string) => {
    const next = findMonthlyOrigin(code);
    if (!next) return;
    setOrigin(next.code);
    try { localStorage.setItem(ORIGIN_STORAGE_KEY, next.code); } catch { /* Persistencia opcional. */ }
  };

  const data = state.status === "ready" ? state.data : null;
  // Todas las tarjetas llevan un precio real: un destino sin precio no se muestra, y un bloque puede quedar más corto de 12.
  const priced = data ? data.spain.length + data.international.length : 0;
  const incomplete = data !== null && (data.spain.length < CARDS_PER_BLOCK || data.international.length < CARDS_PER_BLOCK);
  const note = state.status === "error" ? t("monthly.pricesUnavailable", { month: monthName })
    : data && priced === 0 ? t("monthly.noRecentPrices", { month: monthName })
    : incomplete ? t("monthly.fewPrices", { month: monthName })
    : "";

  return (
    <section className="mt-8" aria-busy={state.status === "loading"}>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="monthly-origin" className="text-sm font-bold text-stone-800">{t("monthly.originLabel")}</label>
        <select
          id="monthly-origin" value={origin} onChange={(event) => changeOrigin(event.target.value)}
          className="min-h-[44px] rounded-xl border border-blue-600/40 bg-white px-3 py-2 text-sm font-semibold text-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          {MONTHLY_ORIGINS.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
        </select>
      </div>

      {state.status === "loading" && (
        <>
          <p className="mt-6 text-sm font-semibold text-stone-600" role="status">{t("monthly.loading")}</p>
          <Skeleton />
        </>
      )}

      {note && <p className="mt-6 rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900" role="status">{note}</p>}

      {data && priced > 0 && (
        <>
          <p className="mt-4 text-xs leading-5 text-stone-500">{t("monthly.escapadaNote")}</p>
          <div className="mt-8">
            <h2 className="text-2xl font-black text-stone-900">{t("monthly.spainTitle")}</h2>
            <p className="mt-1 text-sm text-stone-600">{t("monthly.spainHint", { month: monthName })}</p>
            {data.spain.length > 0 ? <OfferCards cards={data.spain} zone="spain" />
              : <p className="mt-4 rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-600">{t("monthly.noSpainPrices", { month: monthName })}</p>}
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-black text-stone-900">{t("monthly.internationalTitle")}</h2>
            <p className="mt-1 text-sm text-stone-600">{t("monthly.internationalHint", { month: monthName })}</p>
            {data.international.length > 0 ? <OfferCards cards={data.international} zone="international" />
              : <p className="mt-4 rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-600">{t("monthly.noInternationalPrices", { month: monthName })}</p>}
          </div>
        </>
      )}

      {(state.status === "error" || (data && priced === 0)) && children}
      {/* Sin JavaScript (y para los buscadores) se ve la lista de destinos recomendados de siempre. */}
      <noscript>{children}</noscript>
    </section>
  );
}
