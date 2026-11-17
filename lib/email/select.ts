// A quién le toca el correo de vuelos y con qué criterios: SOLO decide, no envía nada y no escribe en ninguna parte.
// Parte de las respuestas del cuestionario de «Mi cuenta» (tabla email_preferences) y del historial de envíos.
// Reglas (las del plan aprobado el 17-11-2026):
//  - Solo entra quien tiene el permiso marcado, al menos un aeropuerto de salida y una frecuencia.
//  - Le toca cuando ha pasado su frecuencia desde el último envío (con 12 h de margen para que una tarea diaria no se salte un día).
//  - Los vuelos salen SOLO de precios reales ya guardados (monthly_prices): si tras aplicar sus filtros hay menos de 3 destinos,
//    NO se envía (nunca se rellena con precios inventados ni se ignoran sus filtros para completar).
//  - «Tipo de viaje» todavía no filtra: los destinos no tienen etiquetas de tipo. Se guarda pero no se usa.

import {
  normalizeAnswers, type FlightBudget, type Frequency, type Reach, type TripLength, type TripType,
} from "@/lib/email-preferences/options";
import { isLocale, type Locale } from "@/lib/i18n/translations";
import { isRecord } from "@/lib/travelpayouts/places";
import { BUDGET_LIMITS, MAX_PICKS, MIN_PICKS, choosePicks, type FlightPick } from "./picks";

const DAY_MS = 86400000;
const USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type Recipient = {
  userId: string;
  /** Aeropuertos de salida en el orden en que los eligió (de 1 a 2). */
  airports: string[];
  /** Meses preferidos (1–12). Vacío = los tres meses siguientes. */
  months: number[];
  tripTypes: TripType[];
  tripLength: TripLength | null;
  reach: Reach | null;
  flightBudget: FlightBudget | null;
  frequency: Frequency;
  locale: Locale;
};

export type SendHistory = { lastSentAt: Date | null; count: number };

/** Fila de email_preferences → destinatario. Devuelve null si no tiene permiso o le falta algo imprescindible. */
export function parseRecipient(row: unknown): Recipient | null {
  if (!isRecord(row) || row.email_consent !== true) return null;
  const userId = typeof row.user_id === "string" ? row.user_id.trim().toLowerCase() : "";
  if (!USER_ID.test(userId)) return null;
  const answers = normalizeAnswers({
    airports: row.airports, months: row.months, tripTypes: row.trip_types, tripLength: row.trip_length,
    reach: row.reach, flightBudget: row.flight_budget, frequency: row.frequency,
  });
  if (answers.airports.length === 0 || answers.frequency === "") return null;
  return {
    userId,
    airports: answers.airports,
    months: answers.months,
    tripTypes: answers.tripTypes,
    tripLength: answers.tripLength || null,
    reach: answers.reach || null,
    flightBudget: answers.flightBudget || null,
    frequency: answers.frequency,
    locale: typeof row.locale === "string" && isLocale(row.locale) ? row.locale : "es",
  };
}

export const FREQUENCY_DAYS: Readonly<Record<Frequency, number>> = { weekly: 7, fortnightly: 14, monthly: 30 };
const DUE_TOLERANCE_MS = 12 * 3600000;

/** ¿Le toca ya? Sin ningún envío anterior, sí. */
export function isDue(lastSentAt: Date | null, frequency: Frequency, now: Date): boolean {
  if (!lastSentAt || Number.isNaN(lastSentAt.getTime())) return true;
  return now.getTime() - lastSentAt.getTime() >= FREQUENCY_DAYS[frequency] * DAY_MS - DUE_TOLERANCE_MS;
}

/** Meses de su correo: los suyos o, si no eligió ninguno, los tres siguientes; siempre del más próximo al más lejano. */
export function monthsFor(recipient: Pick<Recipient, "months">, now: Date): number[] {
  const current = now.getUTCMonth() + 1;
  const chosen = recipient.months.length > 0 ? recipient.months : [1, 2, 3].map((offset) => ((current - 1 + offset) % 12) + 1);
  return [...chosen].sort((a, b) => ((a - current + 12) % 12) - ((b - current + 12) % 12));
}

/** Con dos aeropuertos, un correo sale de cada uno por turnos (según cuántos correos ha recibido ya). */
export function originFor(recipient: Pick<Recipient, "airports">, sentCount: number): string {
  return recipient.airports[Math.max(0, sentCount) % recipient.airports.length];
}

/**
 * Noches que admite cada duración. Los precios guardados son de escapadas de 2 a 5 noches, así que «una semana o más» solo
 * puede enseñar las más largas que hay (4–5 noches): el correo dice siempre las noches reales de cada vuelo.
 */
export const NIGHTS_RANGE: Readonly<Record<TripLength, readonly [number, number]>> = {
  weekend: [2, 3], short: [3, 5], week: [4, 5],
};

/** Países del catálogo que están en Europa (España incluida). Todo el catálogo actual es europeo. */
const EUROPE_CODES: ReadonlySet<string> = new Set([
  "ES", "PT", "FR", "IT", "GB", "DE", "NL", "BE", "CH", "AT", "CZ", "PL", "HU", "SK", "GR", "SI", "HR", "AL", "TR", "RS", "BA",
  "ME", "MK", "XK", "MT", "CY", "RO", "BG", "MD", "DK", "IS", "FI", "SE", "NO", "IE", "EE", "LV", "LT", "LU", "GI", "JE", "GG",
  "IM", "FO", "AX",
]);

/**
 * «¿Hasta dónde te apetece ir?» se entiende como un máximo: España = solo España; Europa = España y el resto de Europa;
 * Lejos y «me da igual» = cualquier destino del catálogo.
 */
export function matchesReach(countryCode: string, reach: Reach | null): boolean {
  if (reach === "spain") return countryCode === "ES";
  if (reach === "europe") return EUROPE_CODES.has(countryCode);
  return true;
}

export function matchesPreferences(pick: FlightPick, recipient: Pick<Recipient, "tripLength" | "reach">): boolean {
  const { nights, profile } = pick.offer;
  if (recipient.tripLength) {
    const [min, max] = NIGHTS_RANGE[recipient.tripLength];
    if (nights < min || nights > max) return false;
  }
  return matchesReach(profile.countryCode, recipient.reach);
}

/** Los 3 destinos más baratos que cumplen sus filtros (duración, alcance y tope de precio). Menos de 3 = no hay correo. */
export function choosePicksFor(found: readonly FlightPick[], recipient: Pick<Recipient, "tripLength" | "reach" | "flightBudget">): FlightPick[] {
  const maxPrice = recipient.flightBudget ? BUDGET_LIMITS[recipient.flightBudget] : undefined;
  return choosePicks(found.filter((pick) => matchesPreferences(pick, recipient)), { limit: MAX_PICKS, maxPrice });
}

export type PlanStatus = "ready" | "not_due" | "not_enough_data" | "over_limit";

export type Planned = {
  recipient: Recipient;
  status: PlanStatus;
  /** Solo si está listo o le faltan datos: de dónde sale su correo y para qué meses. */
  origin?: string;
  months?: number[];
  maxPrice?: number;
  picks?: FlightPick[];
};

export type PlanOptions = {
  recipients: readonly Recipient[];
  history: ReadonlyMap<string, SendHistory>;
  now: Date;
  /** Máximo de correos listos en esta tanda (el resto queda para el día siguiente). */
  limit: number;
  loadPicks: (origin: string, months: readonly number[]) => Promise<FlightPick[]>;
};

/** Primero quien nunca ha recibido nada, después el último envío más antiguo; a igualdad, por identificador (orden estable). */
function fairOrder(a: Recipient, b: Recipient, history: ReadonlyMap<string, SendHistory>): number {
  const left = history.get(a.userId)?.lastSentAt?.getTime() ?? -Infinity;
  const right = history.get(b.userId)?.lastSentAt?.getTime() ?? -Infinity;
  if (left !== right) return left < right ? -1 : 1;
  return a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0;
}

/** Decide qué pasa con cada persona. No envía nada. Cada combinación aeropuerto + meses se consulta una sola vez. */
export async function planRun(options: PlanOptions): Promise<Planned[]> {
  const { history, now, limit, loadPicks } = options;
  const limitCount = Math.max(0, Math.floor(limit));
  const cache = new Map<string, Promise<FlightPick[]>>();
  const load = (origin: string, months: readonly number[]) => {
    const key = `${origin}|${months.join(",")}`;
    let found = cache.get(key);
    if (!found) {
      found = loadPicks(origin, months).catch(() => []);
      cache.set(key, found);
    }
    return found;
  };

  const ordered = [...options.recipients].sort((a, b) => fairOrder(a, b, history));
  const results: Planned[] = [];
  let ready = 0;
  for (const recipient of ordered) {
    const past = history.get(recipient.userId) ?? { lastSentAt: null, count: 0 };
    if (!isDue(past.lastSentAt, recipient.frequency, now)) {
      results.push({ recipient, status: "not_due" });
      continue;
    }
    const origin = originFor(recipient, past.count);
    const months = monthsFor(recipient, now);
    const maxPrice = recipient.flightBudget ? BUDGET_LIMITS[recipient.flightBudget] : undefined;
    if (ready >= limitCount) {
      results.push({ recipient, status: "over_limit", origin, months, maxPrice });
      continue;
    }
    const picks = choosePicksFor(await load(origin, months), recipient);
    if (picks.length < MIN_PICKS) {
      results.push({ recipient, status: "not_enough_data", origin, months, maxPrice });
      continue;
    }
    ready += 1;
    results.push({ recipient, status: "ready", origin, months, maxPrice, picks });
  }
  return results;
}

export type PlanSummary = { consenting: number; due: number; ready: number; notDue: number; notEnoughData: number; overLimit: number };

/** Solo cuentas: nunca identificadores, correos ni precios. */
export function summarizePlan(planned: readonly Planned[]): PlanSummary {
  const count = (status: PlanStatus) => planned.filter((item) => item.status === status).length;
  const notDue = count("not_due");
  return {
    consenting: planned.length, due: planned.length - notDue, ready: count("ready"), notDue,
    notEnoughData: count("not_enough_data"), overLimit: count("over_limit"),
  };
}
