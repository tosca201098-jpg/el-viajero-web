"use client";

import Link from "next/link";
import LanguageSelector from "@/app/components/LanguageSelector";
import { useLanguage } from "@/app/components/LanguageProvider";
import { getDestinationById } from "@/lib/destinations";
import { getDestinationCountryName, getDestinationText } from "@/lib/destinations/localization";

type Offer = { id: string; price: number | null; dates?: string; stops?: number };

// Precios reales (ida y vuelta, 1 persona, salida desde Madrid) consultados el 13-11-2026 a través de
// las consultas de Travelpayouts que ya usa la web. Para enero hay pocos precios guardados: los destinos
// sin precio aparecen como «Sin precio reciente». No hay ningún precio inventado.
const SPAIN: Offer[] = [
  { id: "es-palma-de-mallorca", price: 36, dates: "9–11 ene", stops: 0 },
  { id: "es-santiago-de-compostela", price: 39, dates: "28 ene–4 feb", stops: 0 },
  { id: "es-gran-canaria", price: 50, dates: "5–12 ene", stops: 0 },
  { id: "es-sevilla", price: 51, dates: "22–28 ene", stops: 0 },
  { id: "es-tenerife", price: 52, dates: "8–13 ene", stops: 0 },
  { id: "es-ibiza", price: 72, dates: "5–10 ene", stops: 0 },
  { id: "es-lanzarote", price: 86, dates: "12–17 ene", stops: 1 },
  { id: "es-barcelona", price: 92, dates: "10–12 ene", stops: 0 },
  { id: "es-malaga", price: null },
  { id: "es-alicante", price: null },
  { id: "es-fuerteventura", price: null },
  { id: "es-la-palma", price: null },
];

const INTERNATIONAL: Offer[] = [
  { id: "it-milan", price: 40, dates: "15–18 ene", stops: 0 },
  { id: "gb-london", price: 45, dates: "25–30 ene", stops: 0 },
  { id: "it-bologna", price: 46, dates: "21–24 ene", stops: 0 },
  { id: "pt-lisboa", price: 46, dates: "22–24 ene", stops: 0 },
  { id: "it-rome", price: 48, dates: "16–18 ene", stops: 0 },
  { id: "it-naples", price: 71, dates: "15–18 ene", stops: 0 },
  { id: "be-brussels", price: 75, dates: "15–18 ene", stops: 0 },
  { id: "ch-geneva", price: 75, dates: "29 ene–1 feb", stops: 0 },
  { id: "fr-paris", price: 81, dates: "14–17 ene", stops: 0 },
  { id: "pl-warsaw", price: 83, dates: "22–24 ene", stops: 0 },
  { id: "pt-madeira", price: 119, dates: "18–23 ene", stops: 1 },
  { id: "de-berlin", price: 119, dates: "19–26 ene", stops: 0 },
];

const AIRPORTS = [
  "Madrid (MAD)", "Barcelona (BCN)", "Valencia (VLC)", "Sevilla (SVQ)", "Málaga (AGP)",
  "Bilbao (BIO)", "Palma (PMI)", "Alicante (ALC)", "Tenerife Norte (TFN)", "Gran Canaria (LPA)",
];

function stopsText(stops: number | undefined) {
  if (stops === 0) return "directo";
  if (stops === 1) return "1 escala";
  return "";
}

function OfferCards({ offers, zone }: { offers: Offer[]; zone: "spain" | "international" }) {
  const { language, t } = useLanguage();
  return (
    <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {offers.map((offer) => {
        const destination = getDestinationById(offer.id);
        if (!destination) return null;
        const country = getDestinationCountryName(destination, language);
        const display = getDestinationText(destination, language);
        const stay = display.recommendedStay.replace("días", t("monthly.days"));
        const profileUrl = `/?ficha=${encodeURIComponent(destination.name)}`;
        const flightsUrl = `/?primaveraServicio=vuelo&destino=${encodeURIComponent(destination.name)}`;
        return (
          <article key={destination.id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-blue-600/20 bg-white/80 shadow-sm">
            <div className="relative">
              <img src={destination.image} alt={`${display.name}, ${country}`} loading="lazy" className="h-40 w-full object-cover sm:h-44" />
              <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm ${zone === "spain" ? "bg-blue-600" : "bg-stone-800"}`}>
                {zone === "spain" ? "España" : "Internacional"}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-xl font-black leading-tight text-stone-900">{display.name}</h3>
              <p className="mt-1 text-sm text-stone-600">{country}</p>
              {offer.price !== null ? (
                <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">Ida y vuelta desde</p>
                  <p className="text-2xl font-black leading-tight text-stone-900">{offer.price} €</p>
                  <p className="text-xs text-stone-600">{offer.dates}{offer.dates && stopsText(offer.stops) ? " · " : ""}{stopsText(offer.stops)}</p>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-stone-300 px-3 py-2">
                  <p className="text-sm font-semibold text-stone-600">Sin precio reciente</p>
                  <p className="text-xs text-stone-500">Mira el precio al buscar el vuelo.</p>
                </div>
              )}
              {offer.price !== null && <p className="mt-1 text-xs text-stone-500">Precio visto hace unos días. Puede cambiar.</p>}
              <p className="mt-2 text-sm text-stone-700">{t("destinations.recommendedStay")}: {stay}</p>
              {destination.countryCode === "FR" && destination.imageSource && <a href={destination.imageSource} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs text-stone-600 underline">{destination.imageCredit} · {destination.imageLicense}</a>}
              <div className="mt-auto grid gap-2 pt-4">
                <Link href={profileUrl} className="flex min-h-[44px] items-center justify-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  {t("monthly.viewDestination")}
                </Link>
                {(destination.countryCode !== "FR" || destination.iataCodes.length > 0) && <Link href={flightsUrl} className="flex min-h-[44px] items-center justify-center rounded-xl border border-blue-600/50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                  ✈️ {t("search.findFlights")}
                </Link>}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default function MonthlyOffersExample() {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F2E8] text-stone-800">
      <header className="sticky top-0 z-40 border-b border-blue-600/20 bg-[#F7F2E8]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <Link href="/" aria-label="DESTINAUTA" className="shrink-0 whitespace-nowrap text-lg font-black tracking-tight text-black max-sm:text-base">
            DEST<span className="text-blue-500">I<span className="text-black">N</span>A</span>UTA
          </Link>
          <LanguageSelector />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="rounded-xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm leading-5 text-amber-900">
          <strong>Página de ejemplo, no es la web real.</strong> Los precios son reales (consultados el 13-11-2026, ida y vuelta, 1 persona, salida desde Madrid). Para enero hay pocos precios guardados, por eso cuatro destinos de España salen sin precio. Los botones de esta página llevan a la web real.
        </div>

        <Link href="/" className="mt-4 inline-flex min-h-[44px] items-center text-sm font-semibold text-blue-700 hover:underline">
          ← {t("monthly.backHome")}
        </Link>
        <div className="mt-4 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-800">{t("monthly.homeTitle")}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">Vuelos más baratos en enero</h1>
          <p className="mt-3 text-base leading-6 text-stone-700 sm:text-lg">
            Los 12 vuelos más baratos a destinos de España y los 12 más baratos a destinos internacionales, saliendo desde tu aeropuerto.
          </p>
          <p className="mt-3 text-sm leading-5 text-stone-600">
            Precios de ida y vuelta por persona, vistos hace unos días en búsquedas reales. Pueden cambiar o agotarse. Los precios finales los muestra la web de reserva.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label htmlFor="origen" className="text-sm font-bold text-stone-800">Salir desde</label>
          <select id="origen" defaultValue="Madrid (MAD)" disabled title="Ejemplo: el selector todavía no funciona" className="min-h-[44px] rounded-xl border border-blue-600/40 bg-white px-3 py-2 text-sm font-semibold text-stone-800">
            {AIRPORTS.map((airport) => <option key={airport}>{airport}</option>)}
          </select>
          <span className="text-xs text-stone-500">En la web real se podrá cambiar y se recordará la elección.</span>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-black text-stone-900">En España</h2>
          <p className="mt-1 text-sm text-stone-600">Los 8 primeros tienen precio reciente; los otros 4 salen sin precio porque aún no hay búsquedas guardadas para enero.</p>
          <OfferCards offers={SPAIN} zone="spain" />
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black text-stone-900">Internacional</h2>
          <p className="mt-1 text-sm text-stone-600">Los 12 con el precio más bajo entre los destinos que tienen ficha y precio reciente.</p>
          <OfferCards offers={INTERNATIONAL} zone="international" />
        </section>
      </div>
    </main>
  );
}
