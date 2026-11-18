"use client";

import { useLanguage } from "./LanguageProvider";

import { useEffect, useRef, useState } from "react";
import { deleteSavedTrip, listSavedTrips, type SavedTrip, type TripService } from "@/lib/supabase/saved-trips";
import {
  canSearchFlights, canSearchHotels, openProblemKeys, openSavedFlight, savedTripHotelHref, type OpenProblem,
} from "@/lib/supabase/saved-trip-links";

const serviceLabels: Record<TripService, string> = {
  vuelo: "Vuelo",
  hotel: "Hotel",
  ambos: "Vuelo + Hotel",
};

const actionClass = "min-h-11 rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60";

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export default function SavedTrips() {
  const { t, text } = useLanguage();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [openingId, setOpeningId] = useState<string | null>(null);
  const [openProblem, setOpenProblem] = useState<{ id: string; problem: OpenProblem } | null>(null);
  const removingRef = useRef(false);
  const openingRef = useRef(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    listSavedTrips().then((data) => {
      if (active) setTrips(data);
    }).catch(() => {
      if (active) setLoadError("No se han podido cargar tus viajes. Vuelve a intentarlo.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [retry]);

  async function removeTrip(id: string) {
    if (removingRef.current) return;
    removingRef.current = true;
    setRemovingId(id);
    setDeleteError("");
    try {
      await deleteSavedTrip(id);
      if (mountedRef.current) setTrips((current) => current.filter((trip) => trip.id !== id));
    } catch {
      if (mountedRef.current) setDeleteError("No se ha podido eliminar el viaje. Vuelve a intentarlo.");
    } finally {
      removingRef.current = false;
      if (mountedRef.current) setRemovingId(null);
    }
  }

  // «Ver vuelos»: repeats the saved search (same origin, destination, days and travelers) and goes to its results.
  async function openFlights(trip: SavedTrip) {
    if (openingRef.current) return;
    openingRef.current = true;
    setOpeningId(trip.id);
    setOpenProblem(null);
    const problem = await openSavedFlight(trip);
    openingRef.current = false;
    if (!mountedRef.current) return;
    setOpeningId(null);
    if (problem) setOpenProblem({ id: trip.id, problem });
  }

  if (loading) return <p role="status" className="mt-2 text-sm leading-6 text-stone-700">{t("trips.loading")}</p>;

  if (loadError) return (
    <div className="mt-2">
      <p role="alert" className="text-sm leading-6 text-red-700">{text(loadError)}</p>
      <button type="button" onClick={() => setRetry((current) => current + 1)} className="mt-2 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-600">{t("trips.retry")}</button>
    </div>
  );

  return (
    <>
      {deleteError && <p role="alert" className="mt-2 text-sm leading-6 text-red-700">{text(deleteError)}</p>}
      {trips.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-stone-700">{t("trips.empty")}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {trips.map((trip) => (
            <li key={trip.id} className="rounded-xl border border-stone-200 bg-white/80 p-3">
              <h4 className="break-words text-base font-bold text-stone-800">{trip.destination}</h4>
              <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div><dt className="font-semibold">{t("search.origin")}</dt><dd className="break-words text-stone-700">{trip.origin || t("trips.unspecified")}</dd></div>
                <div><dt className="font-semibold">{t("search.destination")}</dt><dd className="break-words text-stone-700">{trip.destination}</dd></div>
                <div><dt className="font-semibold">{trip.service_type === "hotel" ? t("search.checkIn") : t("trips.departure")}</dt><dd className="text-stone-700">{formatDate(trip.departure_date)}</dd></div>
                <div><dt className="font-semibold">{trip.service_type === "hotel" ? t("search.checkOut") : t("trips.return")}</dt><dd className="text-stone-700">{trip.return_date ? formatDate(trip.return_date) : t("trips.noDate")}</dd></div>
                <div><dt className="font-semibold">{t("search.travelers")}</dt><dd className="text-stone-700">{trip.travelers}</dd></div>
                <div><dt className="font-semibold">{t("trips.service")}</dt><dd className="text-stone-700">{text(serviceLabels[trip.service_type])}</dd></div>
              </dl>
              <div className="mt-3 flex flex-wrap gap-2">
                {canSearchFlights(trip) && (
                  <button type="button" onClick={() => void openFlights(trip)} disabled={openingId !== null || removingId !== null} aria-label={t("trips.viewFlightsLabel", { destination: trip.destination })} className={actionClass}>
                    {openingId === trip.id ? t("trips.opening") : t("trips.viewFlights")}
                  </button>
                )}
                {canSearchHotels(trip) && (() => {
                  const hotels = savedTripHotelHref(trip);
                  const label = t("trips.viewHotelsLabel", { destination: trip.destination });
                  return "href" in hotels
                    ? <a href={hotels.href} aria-label={label} className={`${actionClass} inline-flex items-center`}>{t("trips.viewHotels")}</a>
                    : <button type="button" onClick={() => setOpenProblem({ id: trip.id, problem: hotels.problem })} aria-label={label} className={actionClass}>{t("trips.viewHotels")}</button>;
                })()}
                <button type="button" onClick={() => removeTrip(trip.id)} disabled={removingId !== null} aria-label={t("trips.deleteLabel", { destination: trip.destination })} className="min-h-11 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:border-red-300 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">
                  {removingId === trip.id ? t("trips.deleting") : t("trips.delete")}
                </button>
              </div>
              {openProblem?.id === trip.id && <p role="alert" className="mt-2 text-sm leading-6 text-red-700">{t(openProblemKeys[openProblem.problem])}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
