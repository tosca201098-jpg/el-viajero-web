import type { Locale } from '@/lib/i18n/translations';
import { asiaDestinations } from '@/lib/destinations/asia';
import { asiaAirportNames } from './asia-airport-names';

// Aeropuertos, buscador y bloque «Aeropuerto de llegada» de todos los países de Asia del catálogo
// (Japón y Corea del Sur tienen sus propios módulos). Se construye solo a partir de las fichas.

/** Países de Asia que se resuelven con este módulo. */
export const asiaCountryCodes: readonly string[] = Array.from(new Set(asiaDestinations.map(profile => profile.countryCode)));

export const asiaCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  asiaDestinations.flatMap(profile => [...profile.iataCodes, ...profile.metropolitanCodes].map(code => [code, Array.from(new Set([
    profile.name, ...(profile.aliases ?? []), ...(asiaAirportNames[code] ? [asiaAirportNames[code]] : []),
  ]))])),
);

export const asiaAirports = asiaDestinations.flatMap(profile => profile.iataCodes
  .filter(code => asiaAirportNames[code])
  .map(code => ({
    type: 'airport' as const, code, name: asiaAirportNames[code], country_code: profile.countryCode,
    city_code: profile.metropolitanCodes[0] ?? code, city_name: profile.name, index_strings: asiaCityAliases[code],
  })));

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function asiaAirportsForTerm(term: string) {
  const query = normalize(term);
  return asiaAirports.filter(airport => normalize(airport.code) === query || normalize(airport.name) === query ||
    airport.index_strings.some(alias => normalize(alias) === query));
}

export function asiaTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return asiaDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({
      type: 'city' as const, code: profile.metropolitanCodes[0] ?? profile.iataCodes[0], name: profile.name,
      country_code: profile.countryCode, city_name: profile.name,
      city_code: profile.metropolitanCodes[0] ?? profile.iataCodes[0], index_strings: profile.aliases ?? [],
    }));
}

/** Ciudad que se enseña junto al aeropuerto en la ficha (el nombre es el mismo en todos los idiomas). */
export function asiaAirportTown(code: string, locale: Locale) {
  const profile = asiaDestinations.find(candidate => candidate.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
