import { albaniaDestinations } from '@/lib/destinations/albania';
import type { Locale } from '@/lib/i18n/translations';

// Tirana is the only Albanian airport with verified current scheduled passenger service.
// An identity is not a promise of service.
const airportNames: Readonly<Record<string, string>> = {
  TIA: 'Tirana — Nënë Tereza (Rinas)',
};
export const albaniaCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  albaniaDestinations.map(profile => [profile.iataCodes[0], profile.aliases ?? [profile.name]]));
export const albaniaAirports = albaniaDestinations.map(profile => ({
  type: 'airport' as const, code: profile.iataCodes[0], name: airportNames[profile.iataCodes[0]],
  country_code: 'AL' as const, city_code: profile.iataCodes[0], city_name: profile.name,
  index_strings: albaniaCityAliases[profile.iataCodes[0]],
}));
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export function albaniaAirportsForTerm(term: string) {
  const query = normalize(term);
  return albaniaAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function albaniaTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return albaniaDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.iataCodes[0], name: profile.name,
      country_code: 'AL' as const, city_name: profile.name, city_code: profile.iataCodes[0],
      index_strings: albaniaCityAliases[profile.iataCodes[0]] ?? [] }));
}
export function albaniaAirportTown(code: string, locale: Locale) {
  const profile = albaniaDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
