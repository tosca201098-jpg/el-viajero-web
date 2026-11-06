import { croatiaSloveniaDestinations } from '@/lib/destinations/croatia-slovenia';
import type { Locale } from '@/lib/i18n/translations';

// Airports of Croatia and Slovenia. Osijek, Brač, Portorož and Maribor are pending verification.
// An identity is not a promise of service.
const airportNames: Readonly<Record<string, string>> = {
  ZAG: 'Zagreb — Franjo Tuđman', SPU: 'Split', DBV: 'Dubrovnik', ZAD: 'Zadar', PUY: 'Pula', RJK: 'Rijeka (isla de Krk)', LJU: 'Liubliana — Jože Pučnik',
};
export const croatiaSloveniaCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  croatiaSloveniaDestinations.map(profile => [profile.airports[0].iataCode, profile.aliases ?? [profile.name]]));
export const croatiaSloveniaAirports = croatiaSloveniaDestinations.map(profile => ({
  type: 'airport' as const, code: profile.airports[0].iataCode, name: airportNames[profile.airports[0].iataCode],
  country_code: profile.countryCode, city_code: profile.metropolitanCodes?.[0] ?? profile.airports[0].iataCode, city_name: profile.name,
  index_strings: croatiaSloveniaCityAliases[profile.airports[0].iataCode],
}));
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export function croatiaSloveniaAirportsForTerm(term: string) {
  const query = normalize(term);
  return croatiaSloveniaAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function croatiaSloveniaTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return croatiaSloveniaDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.airports[0].iataCode, name: profile.name,
      country_code: profile.countryCode, city_name: profile.name, city_code: profile.airports[0].iataCode,
      index_strings: croatiaSloveniaCityAliases[profile.airports[0].iataCode] ?? [] }));
}
export function croatiaSloveniaAirportTown(code: string, locale: Locale) {
  const profile = croatiaSloveniaDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
