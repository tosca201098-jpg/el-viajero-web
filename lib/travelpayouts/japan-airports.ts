import { japanDestinations } from '@/lib/destinations/japan';
import type { Locale } from '@/lib/i18n/translations';

type Airport = { type: 'airport'; code: string; name: string; country_code: 'JP'; city_code: string; city_name: string; index_strings: readonly string[] };
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const metropolitan = new Map([['HND', 'TYO'], ['NRT', 'TYO'], ['ITM', 'OSA'], ['KIX', 'OSA'], ['CTS', 'SPK'], ['OKD', 'SPK'], ['NGO', 'NGO'], ['NKM', 'NGO']]);

/** Physical airports only. The city card determines the local tourist identity. */
export const japanAirports: readonly Airport[] = japanDestinations.flatMap(profile => profile.iataCodes.map(code => ({
  type: 'airport' as const, code, name: `${profile.name} — ${code}`,
  country_code: 'JP' as const, city_code: metropolitan.get(code) ?? code,
  city_name: profile.name, index_strings: profile.aliases ?? [profile.name],
})));
export const japanCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  japanAirports.map(airport => [airport.code, airport.index_strings]),
);
export function japanAirportsForTerm(term: string) {
  const query = normalize(term);
  return japanAirports.filter(airport => normalize(airport.code) === query || normalize(airport.name) === query ||
    airport.index_strings.some(alias => normalize(alias) === query));
}
export function japanTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return japanDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.metropolitanCodes[0] ?? profile.iataCodes[0], name: profile.name,
      country_code: 'JP' as const, city_name: profile.name, city_code: profile.metropolitanCodes[0] ?? profile.iataCodes[0],
      index_strings: profile.aliases ?? [] }));
}
export function japanAirportTown(code: string, locale: Locale) {
  const profile = japanDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
