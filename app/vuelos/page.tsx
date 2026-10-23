import type { Metadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Buscar vuelos | Destinauta',
  description: 'Consulta vuelos con el metabuscador de Travelpayouts en Destinauta.',
};

export default function VuelosPage() {
  return (
    <main className="min-h-screen bg-[#f8f6ef] px-4 py-8 text-[#292624] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-blue-700 hover:underline">
          ← Volver a Destinauta
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Buscar vuelos</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
          Consulta opciones de vuelo en el metabuscador de Travelpayouts. Los precios y la disponibilidad pueden cambiar al abrir la oferta.
        </p>
        <section aria-label="Formulario de búsqueda de vuelos" className="mt-6 min-w-0 rounded-2xl border border-blue-300 bg-white p-4 sm:p-6">
          <div id="tpwl-search" />
        </section>
        <section aria-label="Resultados de vuelos" className="mt-6 min-w-0">
          <div id="tpwl-tickets" />
        </section>
      </div>
      <Script
        id="travelpayouts-flight-widget"
        strategy="afterInteractive"
        data-noptimize="1"
        data-cfasync="false"
        data-wpfc-render="false"
        data-no-defer="1"
        {...{ nowprocket: '', 'seraph-accel-crit': '1' }}
      >
        {`(function () {
          var script = document.createElement("script");
          script.async = 1;
          script.type = "module";
          script.src = "https://tpemd.com/wl_web/main.js?wl_id=23773";
          document.head.appendChild(script);
        })();`}
      </Script>
    </main>
  );
}
