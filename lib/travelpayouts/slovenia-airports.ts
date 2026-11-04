import { sloveniaDestinations } from '@/lib/destinations/slovenia';
import type { Locale } from '@/lib/i18n/translations';

// Ministry's complete international-airport set. An identity is not a promise of service.
const airportNames: Readonly<Record<string, string>> = {
  LJU: 'Ljubljana — Jože Pučnik (Brnik)',
  MBX: 'Maribor — Edvard Rusjan (Orehova vas)',
  POW: 'Portorož — Sečovlje',
};
export const sloveniaCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  sloveniaDestinations.map(profile => [profile.iataCodes[0], profile.aliases ?? [profile.name]]));
export const sloveniaAirports = sloveniaDestinations.map(profile => ({
  type: 'airport' as const, code: profile.iataCodes[0], name: airportNames[profile.iataCodes[0]],
  country_code: 'SI' as const, city_code: profile.iataCodes[0], city_name: profile.name,
  index_strings: sloveniaCityAliases[profile.iataCodes[0]],
}));
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function sloveniaAirportsForTerm(term: string) {
  const query = normalize(term);
  return sloveniaAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function sloveniaTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return sloveniaDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.iataCodes[0], name: profile.name,
      country_code: 'SI' as const, city_name: profile.name, city_code: profile.iataCodes[0],
      index_strings: sloveniaCityAliases[profile.iataCodes[0]] ?? [] }));
}
export function sloveniaAirportTown(code: string, locale: Locale) {
  const profile = sloveniaDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
