"use client";

import { useEffect, useRef, useState } from "react";
import { deleteSavedTrip, listSavedTrips, type SavedTrip, type TripService } from "@/lib/supabase/saved-trips";

const serviceLabels: Record<TripService, string> = {
  vuelo: "Vuelo",
  hotel: "Hotel",
  ambos: "Vuelo + Hotel",
};

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

export default function SavedTrips() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const removingRef = useRef(false);
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

  if (loading) return <p role="status" className="mt-2 text-sm leading-6 text-stone-700">Cargando tus viajes…</p>;

  if (loadError) return (
    <div className="mt-2">
      <p role="alert" className="text-sm leading-6 text-red-700">{loadError}</p>
      <button type="button" onClick={() => setRetry((current) => current + 1)} className="mt-2 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-100 focus-visible:ring-2 focus-visible:ring-blue-600">Reintentar</button>
    </div>
  );

  return (
    <>
      {deleteError && <p role="alert" className="mt-2 text-sm leading-6 text-red-700">{deleteError}</p>}
      {trips.length === 0 ? (
        <p className="mt-2 text-sm leading-6 text-stone-700">Todavía no tienes viajes guardados.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {trips.map((trip) => (
            <li key={trip.id} className="rounded-xl border border-stone-200 bg-white/80 p-3">
              <h4 className="break-words text-base font-bold text-stone-800">{trip.destination}</h4>
              <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <div><dt className="font-semibold">Origen</dt><dd className="break-words text-stone-700">{trip.origin || "No especificado"}</dd></div>
                <div><dt className="font-semibold">Destino</dt><dd className="break-words text-stone-700">{trip.destination}</dd></div>
                <div><dt className="font-semibold">{trip.service_type === "hotel" ? "Entrada" : "Ida"}</dt><dd className="text-stone-700">{formatDate(trip.departure_date)}</dd></div>
                <div><dt className="font-semibold">{trip.service_type === "hotel" ? "Salida" : "Vuelta"}</dt><dd className="text-stone-700">{trip.return_date ? formatDate(trip.return_date) : "Sin fecha"}</dd></div>
                <div><dt className="font-semibold">Viajeros</dt><dd className="text-stone-700">{trip.travelers}</dd></div>
                <div><dt className="font-semibold">Servicio</dt><dd className="text-stone-700">{serviceLabels[trip.service_type]}</dd></div>
              </dl>
              <button type="button" onClick={() => removeTrip(trip.id)} disabled={removingId !== null} aria-label={`Eliminar viaje a ${trip.destination}`} className="mt-3 rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:border-red-300 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-blue-600 disabled:opacity-60">
                {removingId === trip.id ? "Eliminando…" : "Eliminar viaje"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
