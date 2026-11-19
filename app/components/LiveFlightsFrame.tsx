"use client";

import { liveFlightsSrc } from "@/lib/voice/live-flights";

// The provider's live list of flights for one exact search, drawn by its own minimal page inside the destination card.
// A new search code gives a new frame (the key), which is what lets Sofía open a second search without reloading the page.
export default function LiveFlightsFrame({ code, title, className = "" }: { code: string; title: string; className?: string }) {
  const src = liveFlightsSrc(code);
  if (!src) return null;
  return (
    <iframe key={code} src={src} title={title} data-live-flights
      className={`block h-[70vh] min-h-[420px] w-full min-w-0 rounded-xl border-0 bg-white ${className}`} />
  );
}
