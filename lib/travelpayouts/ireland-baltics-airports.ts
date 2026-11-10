import { irelandBalticsDestinations } from '@/lib/destinations/ireland-baltics';
import type { Locale } from '@/lib/i18n/translations';

// Airports of Ireland, the Baltic states, Luxembourg and territories. Donegal, Tartu, Kärdla and Kuressaare are pending verification.
// An identity is not a promise of service.
const airportNames: Readonly<Record<string, string>> = {
  DUB: 'Dublín', ORK: 'Cork', SNN: 'Shannon', NOC: 'Ireland West — Knock', KIR: 'Kerry (Farranfore)', TLL: 'Tallin — Lennart Meri', RIX: 'Riga', VNO: 'Vilna', KUN: 'Kaunas', PLQ: 'Palanga',
  LUX: 'Luxemburgo — Findel', GIB: 'Gibraltar — North Front', JER: 'Jersey', GCI: 'Guernsey', IOM: 'Isla de Man — Ronaldsway', FAE: 'Islas Feroe — Vágar', MHQ: 'Åland — Mariehamn',
};
export const irelandBalticsCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  irelandBalticsDestinations.map(profile => [profile.airports[0].iataCode, profile.aliases ?? [profile.name]]));
export const irelandBalticsAirports = irelandBalticsDestinations.map(profile => ({
  type: 'airport' as const, code: profile.airports[0].iataCode, name: airportNames[profile.airports[0].iataCode],
  country_code: profile.countryCode, city_code: profile.metropolitanCodes?.[0] ?? profile.airports[0].iataCode, city_name: profile.name,
  index_strings: irelandBalticsCityAliases[profile.airports[0].iataCode],
}));
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export function irelandBalticsAirportsForTerm(term: string) {
  const query = normalize(term);
  return irelandBalticsAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function irelandBalticsTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return irelandBalticsDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.airports[0].iataCode, name: profile.name,
      country_code: profile.countryCode, city_name: profile.name, city_code: profile.airports[0].iataCode,
      index_strings: irelandBalticsCityAliases[profile.airports[0].iataCode] ?? [] }));
}
export function irelandBalticsAirportTown(code: string, locale: Locale) {
  const profile = irelandBalticsDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
