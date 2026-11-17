// Elección de los vuelos del correo: SOLO precios reales ya guardados en `monthly_prices` (los que la tarea diaria de
// Travelpayouts apunta cada día). Nada se inventa: sin precios recientes suficientes no hay correo.
// Reglas (las mismas de «Viajes por mes»): escapada de 2 a 5 noches, mes válido de la ficha, aeropuerto de salida
// distinto del destino, precio visto hace como máximo MAX_AGE_DAYS días y viaje que aún no ha salido.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FlightBudget } from "@/lib/email-preferences/options";
import { candidatesForMonth, isValidMonth, targetYear, type MonthlyOffer } from "@/lib/travelpayouts/monthly";
import { MAX_AGE_DAYS, PRICES_TABLE, fromRow } from "@/lib/travelpayouts/monthly-store";
import { isRecord } from "@/lib/travelpayouts/places";

const DAY_MS = 86400000;
const COLUMNS = "origin,destination_id,year,month,price,departure_at,return_at,nights,transfers,offer_url,seen_at";

/** Cuántos destinos lleva el correo (3 en el diseño aprobado). Con menos precios reales que MIN_PICKS no se envía. */
export const MAX_PICKS = 3;
export const MIN_PICKS = 3;

/** «Hasta X €» del cuestionario → tope de precio (ida y vuelta, redondeado hacia arriba como en la web). */
export const BUDGET_LIMITS: Readonly<Record<FlightBudget, number | undefined>> = {
  up100: 100, up200: 200, up400: 400, any: undefined,
};

export type FlightPick = { offer: MonthlyOffer; seenAt: Date; year: number; month: number };

type Client = Pick<SupabaseClient, "from">;

/**
 * Ofertas válidas y recientes de un aeropuerto en varios meses, con la fecha en que se vio cada precio.
 * Nunca falla: si Supabase no responde, ese mes se salta.
 */
export async function readFlightPicks(
  client: Client,
  options: { origin: string; months: readonly number[]; now?: Date },
): Promise<FlightPick[]> {
  const now = options.now ?? new Date();
  const since = new Date(now.getTime() - MAX_AGE_DAYS * DAY_MS).toISOString();
  const today = now.toISOString().slice(0, 10);
  const picks: FlightPick[] = [];
  for (const month of options.months) {
    if (!isValidMonth(month)) continue;
    const year = targetYear(month, now);
    try {
      const { data, error } = await client.from(PRICES_TABLE).select(COLUMNS)
        .eq("origin", options.origin).eq("year", year).eq("month", month).gte("seen_at", since);
      if (error || !Array.isArray(data)) continue;
      const candidates = new Set(candidatesForMonth(month));
      for (const row of data) {
        // Una fila rara (por ejemplo vacía) se salta sola, sin perder el resto del mes.
        if (!isRecord(row)) continue;
        const offer = fromRow(row, { origin: options.origin, year, month, candidates });
        const seenAt = new Date(String(row.seen_at ?? ""));
        if (!offer || Number.isNaN(seenAt.getTime()) || offer.departureAt < today) continue;
        picks.push({ offer, seenAt, year, month });
      }
    } catch {
      continue;
    }
  }
  return picks;
}

function isBetter(next: FlightPick, previous: FlightPick) {
  if (next.offer.price !== previous.offer.price) return next.offer.price < previous.offer.price;
  const nextStops = next.offer.transfers ?? 99;
  const previousStops = previous.offer.transfers ?? 99;
  if (nextStops !== previousStops) return nextStops < previousStops;
  return next.offer.departureAt < previous.offer.departureAt;
}

/**
 * Los destinos más baratos: uno por destino (su mejor precio entre los meses pedidos), del más barato al más caro,
 * con tope de precio opcional. Los empates se desempatan por nombre para que el resultado sea siempre el mismo.
 */
export function choosePicks(
  candidates: readonly FlightPick[],
  options: { limit?: number; maxPrice?: number } = {},
): FlightPick[] {
  const limit = options.limit ?? MAX_PICKS;
  const best = new Map<string, FlightPick>();
  for (const pick of candidates) {
    const id = pick.offer.profile.id;
    const previous = best.get(id);
    if (!previous || isBetter(pick, previous)) best.set(id, pick);
  }
  return Array.from(best.values())
    .filter((pick) => options.maxPrice === undefined || Math.ceil(pick.offer.price) <= options.maxPrice)
    .sort((a, b) => a.offer.price - b.offer.price || a.offer.profile.name.localeCompare(b.offer.profile.name, "es"))
    .slice(0, Math.max(0, limit));
}
