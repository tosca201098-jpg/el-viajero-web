// Historial de precios de «Viajes por mes» (tabla privada `monthly_price_history`).
// La tarea diaria ya guarda el último precio de cada ruta en `monthly_prices`; aquí se apunta además, una vez por
// semana, el precio más barato que devolvió el proveedor ese día. Con varias semanas de datos se podrá decir
// «más barato de lo habitual» sin inventar nada: solo se guardan precios reales vistos hoy, nunca los guardados antes.
// Nada de esto puede romper la tarea diaria: si la tabla no existe o Supabase falla, se avisa en la respuesta y se sigue.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { MonthlyOffer } from '@/lib/travelpayouts/monthly';

export const HISTORY_TABLE = 'monthly_price_history';
/**
 * Días de la semana (hora UTC; 0 = domingo, 1 = lunes…) en los que se guarda el historial. Solo el lunes: guardar
 * cada día llenaría la base de datos gratuita de Supabase (ver docs/historial-precios.md). Para guardar a diario,
 * poner [0, 1, 2, 3, 4, 5, 6] y revisar `HISTORY_RETENTION_DAYS`.
 */
export const HISTORY_WEEKDAYS: readonly number[] = [1];
/** Las filas más viejas que esto se borran en la tarea diaria. */
export const HISTORY_RETENTION_DAYS = 120;

const DAY_MS = 86400000;
const UPSERT_CHUNK = 500;

export type HistoryRow = {
  origin: string;
  destination_id: string;
  year: number;
  month: number;
  seen_on: string;
  price: number;
  nights: number;
  transfers: number | null;
};

type Client = Pick<SupabaseClient, 'from'>;

/** ¿Hoy toca guardar el historial? */
export function isHistoryDay(now: Date): boolean {
  return HISTORY_WEEKDAYS.includes(now.getUTCDay());
}

/** Día (AAAA-MM-DD, hora UTC) con el que se guarda el precio. */
export function historyDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function toHistoryRow(origin: string, year: number, month: number, offer: MonthlyOffer, now: Date): HistoryRow {
  return {
    origin,
    destination_id: offer.profile.id,
    year,
    month,
    seen_on: historyDay(now),
    price: offer.price,
    nights: offer.nights,
    transfers: offer.transfers,
  };
}

/**
 * Guarda (crea o sustituye el de ese día) el precio de cada destino que devolvió hoy el proveedor. Nunca lanza:
 * devuelve cuántas filas se guardaron y si hubo algún error.
 */
export async function saveHistory(
  client: Client,
  options: { origin: string; year: number; month: number; offers: ReadonlyMap<string, MonthlyOffer>; now?: Date },
): Promise<{ saved: number; error: boolean }> {
  const now = options.now ?? new Date();
  const rows = Array.from(options.offers.values(), (offer) => toHistoryRow(options.origin, options.year, options.month, offer, now));
  let saved = 0;
  try {
    for (let start = 0; start < rows.length; start += UPSERT_CHUNK) {
      const chunk = rows.slice(start, start + UPSERT_CHUNK);
      const { error } = await client.from(HISTORY_TABLE)
        .upsert(chunk, { onConflict: 'origin,destination_id,year,month,seen_on' });
      if (error) return { saved, error: true };
      saved += chunk.length;
    }
  } catch {
    return { saved, error: true };
  }
  return { saved, error: false };
}

/** Borra el historial de más de HISTORY_RETENTION_DAYS días. No falla: devuelve false si no pudo borrar. */
export async function purgeHistory(client: Client, now: Date = new Date()): Promise<boolean> {
  try {
    const cutoff = historyDay(new Date(now.getTime() - HISTORY_RETENTION_DAYS * DAY_MS));
    const { error } = await client.from(HISTORY_TABLE).delete().lt('seen_on', cutoff);
    return !error;
  } catch {
    return false;
  }
}
