import { easternEuropeDestinations } from '@/lib/destinations/eastern-europe';
import type { Locale } from '@/lib/i18n/translations';

// Airports of Romania, Bulgaria and Moldova. Băneasa, Constanța, Baia Mare, Arad, Bacău, Satu Mare and Bălți are pending verification.
// An identity is not a promise of service.
const airportNames: Readonly<Record<string, string>> = {
  OTP: 'Bucarest — Henri Coandă', CLJ: 'Cluj-Napoca — Avram Iancu', TSR: 'Timișoara — Traian Vuia', IAS: 'Iași', SBZ: 'Sibiu', SCV: 'Suceava — Ștefan cel Mare',
  OMR: 'Oradea', TGM: 'Târgu Mureș — Transilvania', CRA: 'Craiova', GHV: 'Brașov — Ghimbav', SOF: 'Sofía', VAR: 'Varna', BOJ: 'Burgas', PDV: 'Plovdiv', RMO: 'Chisináu',
};
export const easternEuropeCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  easternEuropeDestinations.map(profile => [profile.airports[0].iataCode, profile.aliases ?? [profile.name]]));
export const easternEuropeAirports = easternEuropeDestinations.map(profile => ({
  type: 'airport' as const, code: profile.airports[0].iataCode, name: airportNames[profile.airports[0].iataCode],
  country_code: profile.countryCode, city_code: profile.metropolitanCodes?.[0] ?? profile.airports[0].iataCode, city_name: profile.name,
  index_strings: easternEuropeCityAliases[profile.airports[0].iataCode],
}));
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export function easternEuropeAirportsForTerm(term: string) {
  const query = normalize(term);
  return easternEuropeAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function easternEuropeTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return easternEuropeDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.airports[0].iataCode, name: profile.name,
      country_code: profile.countryCode, city_name: profile.name, city_code: profile.airports[0].iataCode,
      index_strings: easternEuropeCityAliases[profile.airports[0].iataCode] ?? [] }));
}
export function easternEuropeAirportTown(code: string, locale: Locale) {
  const profile = easternEuropeDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
