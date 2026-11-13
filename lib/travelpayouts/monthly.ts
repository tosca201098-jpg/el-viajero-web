// Precios reales de «Viajes por mes»: para un mes y un aeropuerto de salida de España devuelve, por
// separado, los destinos de España y los internacionales con el vuelo de ida y vuelta más barato de
// 2 a 5 noches (una escapada). Solo se usan precios que devuelve Travelpayouts: nada se inventa.
// Solo entran fichas del catálogo que marcan ese mes como válido (mejor época, temporada tranquila o alta).
// El clima no se usa para elegir destinos.

import { destinationProfiles, findDestinationProfile } from '@/lib/destinations';
import { getDestinationCountryName, getDestinationText } from '@/lib/destinations/localization';
import type { DestinationProfile } from '@/lib/destinations/types';
import { locales, translate, type Locale } from '@/lib/i18n/translations';
import { isRecord, offerUrl } from '@/lib/travelpayouts/places';
import {
  CARDS_PER_BLOCK, MAX_NIGHTS, MIN_NIGHTS,
  type MonthlyCard, type MonthlyCardText, type MonthlyOrigin,
} from '@/lib/travelpayouts/monthly-shared';

export const PAGE_SIZE = 1000;
export const MAX_PAGES = 3;

/**
 * Códigos de ciudad del proveedor que no figuran en `iataCodes` de la ficha.
 * Tenerife: el proveedor la llama TCI y la ficha solo tiene los aeropuertos TFN y TFS.
 */
export const PROVIDER_CITY_CODES: Readonly<Record<string, string>> = { TCI: 'es-tenerife' };

export type MonthlyOffer = {
  profile: DestinationProfile;
  price: number;
  departureAt: string;
  returnAt: string;
  nights: number;
  transfers: number | null;
  offerUrl: string | null;
};

export type MonthlyCounts = {
  providerRecords: number;
  fromOrigin: number;
  escapadaStay: number;
  matchedDestinations: number;
  unmatchedCodes: string[];
};

export function isValidMonth(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 12;
}

/** Año del próximo mes pedido: si ya pasó este año, el del año siguiente. El mes en curso cuenta como este año. */
export function targetYear(month: number, now: Date = new Date()): number {
  return month < now.getUTCMonth() + 1 ? now.getUTCFullYear() + 1 : now.getUTCFullYear();
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

/** `YYYY-MM` de salida y los meses de vuelta posibles (el mismo mes y el siguiente, por si la escapada cruza de mes). */
export function monthWindows(month: number, year: number) {
  const departure = `${year}-${pad(month)}`;
  const next = month === 12 ? `${year + 1}-01` : `${year}-${pad(month + 1)}`;
  return { departure, returns: [departure, next] as const };
}

export function isValidForMonth(destination: DestinationProfile, month: number) {
  return (destination.bestMonths?.includes(month) ?? false) ||
    (destination.lowSeasonMonths?.includes(month) ?? false) ||
    (destination.highSeasonMonths?.includes(month) ?? false);
}

/** Fichas con aeropuerto verificado, foto y el mes marcado como válido. Las demás no pueden tener precio. */
export function candidatesForMonth(month: number, profiles: readonly DestinationProfile[] = destinationProfiles) {
  return profiles.filter((destination) =>
    destination.iataCodes.length > 0 && Boolean(destination.image) && isValidForMonth(destination, month));
}

export function isOriginCity(destination: DestinationProfile, originCode: string) {
  return PROVIDER_CITY_CODES[originCode] === destination.id ||
    destination.iataCodes.some((code) => code.toUpperCase() === originCode) ||
    destination.airports.some((airport) => airport.iataCode.toUpperCase() === originCode);
}

function code(value: unknown) {
  return typeof value === 'string' && /^[A-Z]{3}$/.test(value) ? value : '';
}

function profileForCodes(...codes: string[]) {
  for (const value of codes) {
    if (!value) continue;
    const aliasId = PROVIDER_CITY_CODES[value];
    const profile = aliasId ? destinationProfiles.find((destination) => destination.id === aliasId)
      : findDestinationProfile({ iataCode: value });
    if (profile) return profile;
  }
  return undefined;
}

function dateOnly(value: unknown) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : '';
}

export function nightsBetween(departure: string, back: string) {
  const from = Date.parse(`${departure}T00:00:00Z`);
  const to = Date.parse(`${back}T00:00:00Z`);
  return Number.isNaN(from) || Number.isNaN(to) ? NaN : Math.round((to - from) / 86400000);
}

/**
 * Elige, por destino, el precio más barato de una escapada (2–5 noches) que salga del aeropuerto pedido
 * en el mes pedido. A igualdad de precio gana el vuelo con menos escalas y luego el más temprano.
 */
export function pickOffers(
  records: readonly unknown[], originCode: string, month: number, year: number,
  candidates: readonly DestinationProfile[] = candidatesForMonth(month),
) {
  const allowed = new Set(candidates);
  const best = new Map<string, MonthlyOffer>();
  const counts: MonthlyCounts = {
    providerRecords: records.length, fromOrigin: 0, escapadaStay: 0, matchedDestinations: 0, unmatchedCodes: [],
  };
  const unmatched = new Set<string>();
  for (const flight of records) {
    if (!isRecord(flight)) continue;
    const origin = code(flight.origin) || code(flight.origin_code);
    if (origin !== originCode) continue;
    counts.fromOrigin += 1;
    const price = typeof flight.price === 'number' && Number.isFinite(flight.price) && flight.price > 0 ? flight.price : 0;
    const departureAt = dateOnly(flight.departure_at);
    const returnAt = dateOnly(flight.return_at);
    if (!price || !departureAt || !returnAt || departureAt.slice(0, 7) !== `${year}-${pad(month)}`) continue;
    const nights = nightsBetween(departureAt, returnAt);
    if (!(nights >= MIN_NIGHTS && nights <= MAX_NIGHTS)) continue;
    counts.escapadaStay += 1;
    const destinationCode = code(flight.destination) || code(flight.destination_code);
    const profile = profileForCodes(destinationCode, code(flight.destination_airport));
    if (!profile) {
      if (destinationCode) unmatched.add(destinationCode);
      continue;
    }
    if (!allowed.has(profile) || isOriginCity(profile, originCode)) continue;
    const offer: MonthlyOffer = {
      profile, price, departureAt, returnAt, nights,
      transfers: typeof flight.transfers === 'number' && Number.isInteger(flight.transfers) && flight.transfers >= 0
        ? flight.transfers : null,
      offerUrl: offerUrl(flight.link),
    };
    const previous = best.get(profile.id);
    if (!previous || isBetter(offer, previous)) best.set(profile.id, offer);
  }
  counts.matchedDestinations = best.size;
  counts.unmatchedCodes = Array.from(unmatched).sort();
  return { offers: best, counts };
}

function isBetter(next: MonthlyOffer, previous: MonthlyOffer) {
  if (next.price !== previous.price) return next.price < previous.price;
  const nextStops = next.transfers ?? 99;
  const previousStops = previous.transfers ?? 99;
  if (nextStops !== previousStops) return nextStops < previousStops;
  return next.departureAt < previous.departureAt;
}

function texts(profile: DestinationProfile): Record<Locale, MonthlyCardText> {
  return Object.fromEntries(locales.map(({ code: locale }) => {
    const display = getDestinationText(profile, locale);
    return [locale, {
      name: display.name,
      country: getDestinationCountryName(profile, locale),
      stay: display.recommendedStay.replace('días', translate(locale, 'monthly.days')),
    }];
  })) as Record<Locale, MonthlyCardText>;
}

export function toCard(profile: DestinationProfile, offer?: MonthlyOffer): MonthlyCard {
  return {
    id: profile.id,
    name: profile.name,
    image: profile.image,
    countryCode: profile.countryCode,
    texts: texts(profile),
    credit: profile.countryCode === 'FR' && profile.imageSource
      ? { source: profile.imageSource, credit: profile.imageCredit ?? '', license: profile.imageLicense ?? '' } : null,
    price: offer?.price ?? null,
    departureAt: offer?.departureAt ?? null,
    returnAt: offer?.returnAt ?? null,
    nights: offer?.nights ?? null,
    transfers: offer?.transfers ?? null,
    offerUrl: offer?.offerUrl ?? null,
  };
}

/**
 * Dos bloques (España e Internacional) de hasta 12 tarjetas: primero los destinos con precio, del más barato
 * al más caro; si no llegan a 12 se completan con fichas válidas para el mes que salen como «sin precio reciente».
 */
export function buildBlocks(
  offers: ReadonlyMap<string, MonthlyOffer>, originCode: string, month: number,
  candidates: readonly DestinationProfile[] = candidatesForMonth(month),
  limit = CARDS_PER_BLOCK,
) {
  const priced = Array.from(offers.values())
    .sort((a, b) => a.price - b.price || a.profile.name.localeCompare(b.profile.name, 'es'));
  const block = (isSpain: boolean) => {
    const cards = priced.filter((offer) => (offer.profile.countryCode === 'ES') === isSpain)
      .slice(0, limit).map((offer) => toCard(offer.profile, offer));
    const used = new Set(cards.map((card) => card.id));
    // Misma prioridad que la lista de meses: primero la temporada tranquila y luego la mejor época.
    const ordered = [...candidates.filter((d) => d.lowSeasonMonths?.includes(month)),
      ...candidates.filter((d) => !d.lowSeasonMonths?.includes(month))];
    for (const destination of ordered) {
      if (cards.length >= limit) break;
      if ((destination.countryCode === 'ES') !== isSpain || used.has(destination.id) ||
        offers.has(destination.id) || isOriginCity(destination, originCode)) continue;
      used.add(destination.id);
      cards.push(toCard(destination));
    }
    return cards;
  };
  return { spain: block(true), international: block(false) };
}

export class ProviderError extends Error {}

type FetchLike = (input: URL, init: { headers: Record<string, string>; cache: 'no-store'; signal: AbortSignal }) =>
  Promise<{ ok: boolean; json: () => Promise<unknown> }>;

async function fetchPage(
  fetchImpl: FetchLike, token: string, originCode: string, departure: string, returning: string, page: number,
) {
  const url = new URL('https://api.travelpayouts.com/aviasales/v3/prices_for_dates');
  url.searchParams.set('origin', originCode);
  url.searchParams.set('departure_at', departure);
  url.searchParams.set('return_at', returning);
  url.searchParams.set('one_way', 'false');
  url.searchParams.set('unique', 'false');
  url.searchParams.set('sorting', 'price');
  url.searchParams.set('currency', 'EUR');
  url.searchParams.set('limit', String(PAGE_SIZE));
  url.searchParams.set('page', String(page));
  const response = await fetchImpl(url, {
    headers: { Accept: 'application/json', 'X-Access-Token': token },
    cache: 'no-store',
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new ProviderError('provider_unavailable');
  const payload = await response.json();
  if (!isRecord(payload) || payload.success !== true || !Array.isArray(payload.data) ||
    (typeof payload.currency === 'string' && payload.currency.toUpperCase() !== 'EUR')) {
    throw new ProviderError('provider_unavailable');
  }
  return payload.data as unknown[];
}

/**
 * Consulta Travelpayouts (una petición por mes de vuelta) y, si una página viene llena y aún faltan
 * destinos con precio, pide la siguiente (máximo 3 páginas por mes de vuelta).
 */
export async function getMonthlyBlocks(options: {
  token: string; origin: MonthlyOrigin; month: number; now?: Date; fetchImpl?: FetchLike;
}) {
  const { token, origin, month } = options;
  const fetchImpl = options.fetchImpl ?? (fetch as unknown as FetchLike);
  const year = targetYear(month, options.now);
  const windows = monthWindows(month, year);
  const candidates = candidatesForMonth(month);
  const records: unknown[] = [];
  let open = [...windows.returns];
  for (let page = 1; page <= MAX_PAGES && open.length > 0; page += 1) {
    const pages = await Promise.all(open.map((returning) =>
      fetchPage(fetchImpl, token, origin.code, windows.departure, returning, page)));
    pages.forEach((data) => records.push(...data));
    open = open.filter((_, index) => pages[index].length >= PAGE_SIZE);
    const { offers } = pickOffers(records, origin.code, month, year, candidates);
    const priced = Array.from(offers.values());
    const spain = priced.filter((offer) => offer.profile.countryCode === 'ES').length;
    if (spain >= CARDS_PER_BLOCK && priced.length - spain >= CARDS_PER_BLOCK) break;
  }
  const { offers, counts } = pickOffers(records, origin.code, month, year, candidates);
  return { year, counts, ...buildBlocks(offers, origin.code, month, candidates) };
}
