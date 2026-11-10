import { nordicsDestinations } from '@/lib/destinations/nordics';
import type { Locale } from '@/lib/i18n/translations';

// Airports of Denmark, Iceland and Finland. Esbjerg, Karup, Sønderborg, Egilsstaðir, Ísafjörður and small Finnish regionals are pending verification.
// An identity is not a promise of service.
const airportNames: Readonly<Record<string, string>> = {
  CPH: 'Copenhague — Kastrup', AAR: 'Aarhus', BLL: 'Billund', AAL: 'Aalborg', RNN: 'Bornholm (Rønne)', KEF: 'Reikiavik — Keflavík', AEY: 'Akureyri',
  HEL: 'Helsinki — Vantaa', RVN: 'Rovaniemi', TKU: 'Turku', TMP: 'Tampere — Pirkkala', OUL: 'Oulu', KTT: 'Kittilä (Levi)', IVL: 'Ivalo (Saariselkä, Inari)', KAO: 'Kuusamo (Ruka)',
};
export const nordicsCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  nordicsDestinations.map(profile => [profile.airports[0].iataCode, profile.aliases ?? [profile.name]]));
export const nordicsAirports = nordicsDestinations.map(profile => ({
  type: 'airport' as const, code: profile.airports[0].iataCode, name: airportNames[profile.airports[0].iataCode],
  country_code: profile.countryCode, city_code: profile.metropolitanCodes?.[0] ?? profile.airports[0].iataCode, city_name: profile.name,
  index_strings: nordicsCityAliases[profile.airports[0].iataCode],
}));
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export function nordicsAirportsForTerm(term: string) {
  const query = normalize(term);
  return nordicsAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function nordicsTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return nordicsDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.airports[0].iataCode, name: profile.name,
      country_code: profile.countryCode, city_name: profile.name, city_code: profile.airports[0].iataCode,
      index_strings: nordicsCityAliases[profile.airports[0].iataCode] ?? [] }));
}
export function nordicsAirportTown(code: string, locale: Locale) {
  const profile = nordicsDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
