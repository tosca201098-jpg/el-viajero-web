import type { Metadata } from 'next';
import Script from 'next/script';
import { isWhiteLabelFlightSearch } from '@/lib/travelpayouts/white-label';

export const metadata: Metadata = {
  title: 'Vuelos en vivo | Destinauta',
  robots: { index: false, follow: false },
};

// Only the provider's live flight list for one exact search, meant to sit inside a frame of the destination card.
// The provider's widget starts once per page and reads its search from the address, so every search needs a page of its
// own: that is why Sofía shows each search in a new frame instead of restarting the widget of the card.
export default async function VuelosEnVivoPage({ searchParams }: { searchParams: Promise<{ flightSearch?: string }> }) {
  const { flightSearch } = await searchParams;
  if (!isWhiteLabelFlightSearch(flightSearch)) return <main className="p-4 text-sm text-slate-700" />;
  return (
    <main className="min-w-0 bg-white p-2 text-slate-900">
      {/* The shared page layout adds its footer; inside the frame only the flights are wanted. */}
      <style>{'footer{display:none}'}</style>
      <div id="tpwl-search" hidden aria-hidden="true" />
      <div id="tpwl-tickets" className="min-w-0" />
      <Script
        id="travelpayouts-live-flight-widget"
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
