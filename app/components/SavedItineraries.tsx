"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import ItineraryContent from "./ItineraryContent";
import {
  deleteSavedItinerary, listSavedItineraries, type SavedItinerary,
} from "@/lib/supabase/saved-itineraries";

export default function SavedItineraries() {
  const { language, t } = useLanguage();
  const [items, setItems] = useState<SavedItinerary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const removingRef = useRef(false);
  const selected = items.find((item) => item.id === selectedId);
  const dayLabel = (count: number) => count === 1 ? t("itinerary.oneDay") : t("itinerary.days", { count });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    listSavedItineraries().then((data) => {
      if (active) setItems(data);
    }).catch(() => {
      if (active) setLoadError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [retry]);

  async function remove(id: string) {
    if (removingRef.current) return;
    removingRef.current = true;
    setRemovingId(id);
    setDeleteError(false);
    try {
      await deleteSavedItinerary(id);
      setItems((current) => current.filter((item) => item.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch {
      setDeleteError(true);
    } finally {
      removingRef.current = false;
      setRemovingId(null);
    }
  }

  if (loading) return <p role="status" className="mt-3 text-sm">{t("savedItineraries.loading")}</p>;
  if (loadError) return (
    <div className="mt-3">
      <p role="alert" className="text-sm text-red-700">{t("savedItineraries.loadError")}</p>
      <button type="button" onClick={() => setRetry((value) => value + 1)}
        className="mt-2 min-h-[44px] rounded-lg px-3 text-sm font-semibold text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600">
        {t("trips.retry")}
      </button>
    </div>
  );

  return (
    <div className="mt-3 min-w-0">
      {deleteError && <p role="alert" className="mb-3 text-sm text-red-700">{t("savedItineraries.deleteError")}</p>}
      {selected ? (
        <div className="min-w-0">
          <button type="button" onClick={() => setSelectedId(null)}
            className="min-h-[44px] rounded-lg px-2 text-sm font-semibold text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600">
            ← {t("savedItineraries.back")}
          </button>
          <div className="mt-2 min-w-0 rounded-2xl bg-slate-900 p-4 sm:p-5">
            <p className="mb-4 break-words text-sm text-cyan-100">
              {selected.destination_name} · {selected.country} · {dayLabel(selected.days_count)}
            </p>
            <ItineraryContent itinerary={selected.itinerary} />
          </div>
          <button type="button" onClick={() => void remove(selected.id)} disabled={removingId !== null}
            className="mt-3 min-h-[44px] rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 disabled:opacity-60">
            {removingId === selected.id ? t("savedItineraries.deleting") : t("savedItineraries.delete")}
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm leading-6 text-stone-700">{t("savedItineraries.empty")}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="min-w-0 rounded-xl border border-stone-200 bg-white/80 p-3">
              <h4 className="break-words text-base font-bold text-stone-800">{item.destination_name}</h4>
              <p className="mt-1 break-words text-sm text-stone-600">
                {item.country} · {dayLabel(item.days_count)} · {new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(new Date(item.created_at))}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" onClick={() => setSelectedId(item.id)}
                  className="min-h-[44px] rounded-lg border border-blue-300 px-3 text-sm font-semibold text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600">
                  {t("savedItineraries.open")}
                </button>
                <button type="button" onClick={() => void remove(item.id)} disabled={removingId !== null}
                  aria-label={t("savedItineraries.deleteLabel", { destination: item.destination_name })}
                  className="min-h-[44px] rounded-lg border border-stone-300 px-3 text-sm font-semibold text-stone-700 hover:border-red-300 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">
                  {removingId === item.id ? t("savedItineraries.deleting") : t("savedItineraries.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
