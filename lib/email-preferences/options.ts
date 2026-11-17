// Cuestionario de gustos de viaje y permiso de correo (solo en «Mi cuenta»; no envía nada).
// Las listas de valores deben coincidir con las restricciones de supabase/migrations/20261117000000_create_email_preferences.sql
// (tests/email-preferences.test.cjs lo comprueba). Este archivo no importa el catálogo de destinos.

import { MONTHLY_ORIGINS } from "@/lib/travelpayouts/monthly-shared";

/** Aeropuertos de salida: los mismos diez de «Viajes por mes». */
export const AIRPORT_CODES: readonly string[] = MONTHLY_ORIGINS.map((origin) => origin.code);

export const MAX_AIRPORTS = 2;
export const MAX_MONTHS = 4;
export const MAX_TRIP_TYPES = 3;

export const MONTH_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
export const TRIP_TYPES = ["beach", "city", "mountain", "gastronomy", "adventure", "relax"] as const;
export const TRIP_LENGTHS = ["weekend", "short", "week"] as const;
export const REACHES = ["spain", "europe", "far", "any"] as const;
export const FLIGHT_BUDGETS = ["up100", "up200", "up400", "any"] as const;
export const FREQUENCIES = ["weekly", "fortnightly", "monthly"] as const;

export type TripType = typeof TRIP_TYPES[number];
export type TripLength = typeof TRIP_LENGTHS[number];
export type Reach = typeof REACHES[number];
export type FlightBudget = typeof FLIGHT_BUDGETS[number];
export type Frequency = typeof FREQUENCIES[number];

/** Versión del texto de la casilla de permiso. Si se cambia el texto, cambia esta fecha. */
export const EMAIL_CONSENT_VERSION = "2026-11-17";

/**
 * false mientras no se envíe ningún correo: el cuestionario avisa de que el servicio se está preparando.
 * Pasar a true (y revisar el texto del permiso) justo antes de empezar a enviar.
 */
export const EMAIL_SERVICE_LIVE = false;

export type EmailPreferenceAnswers = {
  airports: string[];
  months: number[];
  tripTypes: TripType[];
  tripLength: TripLength | "";
  reach: Reach | "";
  flightBudget: FlightBudget | "";
  frequency: Frequency | "";
  consent: boolean;
};

export const EMPTY_ANSWERS: EmailPreferenceAnswers = {
  airports: [], months: [], tripTypes: [], tripLength: "", reach: "", flightBudget: "", frequency: "", consent: false,
};

function oneOf<T extends string>(allowed: readonly T[], value: unknown): T | "" {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : "";
}

function pick<T>(values: unknown, allowed: readonly T[], max: number): T[] {
  if (!Array.isArray(values)) return [];
  const result: T[] = [];
  for (const value of values) {
    if ((allowed as readonly unknown[]).includes(value) && !result.includes(value as T) && result.length < max) result.push(value as T);
  }
  return result;
}

/** Deja solo valores permitidos, sin repetidos y sin pasar de los máximos. Los meses salen ordenados. */
export function normalizeAnswers(input: Partial<Record<keyof EmailPreferenceAnswers, unknown>> | null | undefined): EmailPreferenceAnswers {
  const source = input ?? {};
  return {
    airports: pick(source.airports, AIRPORT_CODES, MAX_AIRPORTS),
    months: pick(source.months, MONTH_NUMBERS, MAX_MONTHS).sort((a, b) => a - b),
    tripTypes: pick(source.tripTypes, TRIP_TYPES, MAX_TRIP_TYPES),
    tripLength: oneOf(TRIP_LENGTHS, source.tripLength),
    reach: oneOf(REACHES, source.reach),
    flightBudget: oneOf(FLIGHT_BUDGETS, source.flightBudget),
    frequency: oneOf(FREQUENCIES, source.frequency),
    consent: source.consent === true,
  };
}

/** Marca o desmarca un valor sin superar el máximo (si ya está lleno, no añade). No modifica la lista recibida. */
export function toggleLimited<T>(list: readonly T[], value: T, max: number): T[] {
  if (list.includes(value)) return list.filter((item) => item !== value);
  return list.length >= max ? [...list] : [...list, value];
}

/** Para recibir correos hacen falta al menos un aeropuerto de salida y la frecuencia. */
export function hasRequiredForEmails(answers: Pick<EmailPreferenceAnswers, "airports" | "frequency">): boolean {
  return answers.airports.length >= 1 && answers.frequency !== "";
}

const MONTH_LABEL: Intl.DateTimeFormatOptions = { month: "long", timeZone: "UTC" };

/** Nombre del mes en el idioma de la web («enero», «January»…), con la primera letra en mayúscula. */
export function monthName(locale: string, month: number): string {
  const name = new Intl.DateTimeFormat(locale, MONTH_LABEL).format(new Date(Date.UTC(2026, month - 1, 15)));
  return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
}

/** «17 de noviembre de 2026»: la fecha con la que se anota el permiso, en horario de Madrid. */
export function formatConsentDate(isoDate: string, locale: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "Europe/Madrid" }).format(date);
}
