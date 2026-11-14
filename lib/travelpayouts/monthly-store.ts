// Precios de «Viajes por mes» guardados cada día en Supabase (tabla privada `monthly_prices`).
// La tarea diaria guarda, por aeropuerto, destino y mes, el último precio real de una escapada que vio el
// proveedor. La API mensual mezcla esos precios (si son recientes) con los de la consulta en directo.
// Nada se inventa: solo se guardan y se muestran precios que devolvió Travelpayouts, y el de hoy manda.

import type { SupabaseClient } from '@supabase/supabase-js';
import { destinationProfiles } from '@/lib/destinations';
import type { DestinationProfile } from '@/lib/destinations/types';
import {
  candidatesForMonth, isOriginCity, isValidMonth, nightsBetween, type MonthlyOffer,
} from '@/lib/travelpayouts/monthly';
import { MAX_NIGHTS, MIN_NIGHTS } from '@/lib/travelpayouts/monthly-shared';
import { isRecord, offerUrl } from '@/lib/travelpayouts/places';

export const PRICES_TABLE = 'monthly_prices';
/**
 * Un precio guardado solo se enseña si se vio hace como máximo estos días, y solo para los destinos que hoy no
 * devuelve el proveedor. El proveedor recuerda las últimas 48 h: con 3 días se cubre un día sin tarea y se
 * mantienen precios «actuales».
 */
export const MAX_AGE_DAYS = 3;
/** Las filas más viejas que esto se borran en la tarea diaria. */
export const PURGE_AFTER_DAYS = 30;

const DAY_MS = 86400000;
const UPSERT_CHUNK = 500;
const COLUMNS = 'origin,destination_id,year,month,price,departure_at,return_at,nights,transfers,offer_url,seen_at';

export type StoredPriceRow = {
  origin: string;
  destination_id: string;
  year: number;
  month: number;
  price: number;
  departure_at: string;
  return_at: string;
  nights: number;
  transfers: number | null;
  offer_url: string | null;
  seen_at: string;
};

export class StoreError extends Error {}

type Client = Pick<SupabaseClient, 'from'>;

export function toRow(origin: string, year: number, month: number, offer: MonthlyOffer, seenAt: Date): StoredPriceRow {
  return {
    origin,
    destination_id: offer.profile.id,
    year,
    month,
    price: offer.price,
    departure_at: offer.departureAt,
    return_at: offer.returnAt,
    nights: offer.nights,
    transfers: offer.transfers,
    offer_url: offer.offerUrl,
    seen_at: seenAt.toISOString(),
  };
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

/**
 * Convierte una fila guardada en una oferta, o devuelve null si no es válida. Se vuelven a comprobar las mismas
 * reglas que con los datos en directo: mes válido de la ficha, escapada de 2 a 5 noches, aeropuerto distinto del destino.
 */
export function fromRow(
  row: unknown,
  context: { origin: string; year: number; month: number; candidates: ReadonlySet<DestinationProfile> },
  profiles: readonly DestinationProfile[] = destinationProfiles,
): MonthlyOffer | null {
  if (!isRecord(row)) return null;
  const { origin, year, month, candidates } = context;
  if (row.origin !== origin || Number(row.year) !== year || Number(row.month) !== month) return null;
  const profile = typeof row.destination_id === 'string'
    ? profiles.find((destination) => destination.id === row.destination_id) : undefined;
  if (!profile || !candidates.has(profile) || isOriginCity(profile, origin)) return null;
  const price = Number(row.price);
  if (!Number.isFinite(price) || price <= 0) return null;
  const departureAt = typeof row.departure_at === 'string' ? row.departure_at.slice(0, 10) : '';
  const returnAt = typeof row.return_at === 'string' ? row.return_at.slice(0, 10) : '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(departureAt) || !/^\d{4}-\d{2}-\d{2}$/.test(returnAt) ||
    departureAt.slice(0, 7) !== `${year}-${pad(month)}`) return null;
  const nights = nightsBetween(departureAt, returnAt);
  if (!(nights >= MIN_NIGHTS && nights <= MAX_NIGHTS)) return null;
  const transfers = typeof row.transfers === 'number' && Number.isInteger(row.transfers) && row.transfers >= 0
    ? row.transfers : null;
  return { profile, price, departureAt, returnAt, nights, transfers, offerUrl: offerUrl(row.offer_url) };
}

/**
 * Precios guardados y recientes de un aeropuerto y un mes, por ficha. Nunca falla: sin configuración, sin tabla o
 * con un error de Supabase devuelve un mapa vacío y la web sigue con los precios en directo.
 */
export async function readStoredOffers(
  client: Client | null,
  options: { origin: string; year: number; month: number; now?: Date },
): Promise<Map<string, MonthlyOffer>> {
  const offers = new Map<string, MonthlyOffer>();
  if (!client || !isValidMonth(options.month)) return offers;
  const now = options.now ?? new Date();
  const since = new Date(now.getTime() - MAX_AGE_DAYS * DAY_MS).toISOString();
  const today = now.toISOString().slice(0, 10);
  try {
    const { data, error } = await client.from(PRICES_TABLE).select(COLUMNS)
      .eq('origin', options.origin).eq('year', options.year).eq('month', options.month).gte('seen_at', since);
    if (error || !Array.isArray(data)) return offers;
    const candidates = new Set(candidatesForMonth(options.month));
    for (const row of data) {
      const offer = fromRow(row, { origin: options.origin, year: options.year, month: options.month, candidates });
      // Un viaje que ya salió no se enseña aunque el precio sea reciente.
      if (offer && offer.departureAt >= today) offers.set(offer.profile.id, offer);
    }
  } catch {
    return new Map();
  }
  return offers;
}

/** Guarda (crea o actualiza) los precios vistos hoy. Lanza StoreError si Supabase rechaza el guardado. */
export async function saveOffers(
  client: Client,
  options: { origin: string; year: number; month: number; offers: ReadonlyMap<string, MonthlyOffer>; now?: Date },
): Promise<number> {
  const now = options.now ?? new Date();
  const rows = Array.from(options.offers.values(), (offer) => toRow(options.origin, options.year, options.month, offer, now));
  for (let start = 0; start < rows.length; start += UPSERT_CHUNK) {
    const { error } = await client.from(PRICES_TABLE)
      .upsert(rows.slice(start, start + UPSERT_CHUNK), { onConflict: 'origin,destination_id,year,month' });
    if (error) throw new StoreError('storage_error');
  }
  return rows.length;
}

/** Borra precios de más de PURGE_AFTER_DAYS días y viajes cuya salida ya pasó. No falla si no puede borrar. */
export async function purgeOldRows(client: Client, now: Date = new Date()): Promise<boolean> {
  try {
    const cutoff = new Date(now.getTime() - PURGE_AFTER_DAYS * DAY_MS).toISOString();
    const [old, past] = await Promise.all([
      client.from(PRICES_TABLE).delete().lt('seen_at', cutoff),
      client.from(PRICES_TABLE).delete().lt('departure_at', now.toISOString().slice(0, 10)),
    ]);
    return !old.error && !past.error;
  } catch {
    return false;
  }
}
