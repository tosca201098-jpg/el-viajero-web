// Datos compartidos entre la consulta del servidor y la página de cada mes.
// Este archivo NO importa el catálogo de destinos: así el navegador no descarga las 486 fichas.

import type { Locale } from "@/lib/i18n/translations";

/** Aeropuertos de salida del selector. `code` es el código de ciudad que usa Travelpayouts. */
export type MonthlyOrigin = { code: string; label: string };

// Tenerife usa TCI (código de ciudad que devuelve el propio proveedor); cubre Tenerife Norte (TFN) y Sur (TFS).
export const MONTHLY_ORIGINS: readonly MonthlyOrigin[] = [
  { code: "MAD", label: "Madrid (MAD)" },
  { code: "BCN", label: "Barcelona (BCN)" },
  { code: "VLC", label: "Valencia (VLC)" },
  { code: "SVQ", label: "Sevilla (SVQ)" },
  { code: "AGP", label: "Málaga (AGP)" },
  { code: "BIO", label: "Bilbao (BIO)" },
  { code: "PMI", label: "Palma (PMI)" },
  { code: "ALC", label: "Alicante (ALC)" },
  { code: "TCI", label: "Tenerife (TFN/TFS)" },
  { code: "LPA", label: "Gran Canaria (LPA)" },
];

export const DEFAULT_ORIGIN_CODE = "MAD";
export const ORIGIN_STORAGE_KEY = "destinauta.origenSalida";

export function findMonthlyOrigin(code: string | null | undefined): MonthlyOrigin | undefined {
  const normalized = code?.trim().toUpperCase();
  return normalized ? MONTHLY_ORIGINS.find((origin) => origin.code === normalized) : undefined;
}

/** Escapada = ida y vuelta de 2 a 5 noches. */
export const MIN_NIGHTS = 2;
export const MAX_NIGHTS = 5;
export const CARDS_PER_BLOCK = 12;

export type MonthlyCardText = { name: string; country: string; stay: string };

export type MonthlyCard = {
  id: string;
  /** Nombre canónico de la ficha (se usa en los enlaces «Ver destino» y «Buscar vuelos»). */
  name: string;
  image: string;
  countryCode: string;
  /** Textos ya localizados en los siete idiomas, para no enviar el catálogo al navegador. */
  texts: Record<Locale, MonthlyCardText>;
  /** Solo para fichas francesas: atribución de la foto, igual que en la lista actual. */
  credit: { source: string; credit: string; license: string } | null;
  /** Precio real más barato de ida y vuelta (EUR, 1 persona). Nunca hay tarjetas sin precio. */
  price: number;
  departureAt: string;
  returnAt: string;
  nights: number;
  transfers: number | null;
  offerUrl: string | null;
};

export type MonthlyOffersResponse = {
  success: true;
  month: number;
  year: number;
  origin: MonthlyOrigin;
  generatedAt: string;
  spain: MonthlyCard[];
  international: MonthlyCard[];
};

const MONTH_PARTS: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", timeZone: "UTC" };

function dateParts(value: string, locale: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat(locale, MONTH_PARTS).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return day && month ? { day, month, key: value.slice(0, 7) } : null;
}

/** «26–29 ene» si caen en el mismo mes; «29 ene – 1 feb» si no. */
export function formatTripRange(departureAt: string, returnAt: string, locale: string): string {
  const from = dateParts(departureAt, locale);
  const to = dateParts(returnAt, locale);
  if (!from || !to) return "";
  return from.key === to.key
    ? `${from.day}–${to.day} ${to.month}`
    : `${from.day} ${from.month} – ${to.day} ${to.month}`;
}
