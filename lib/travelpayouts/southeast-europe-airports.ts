import { southeastEuropeDestinations } from '@/lib/destinations/southeast-europe';
import type { Locale } from '@/lib/i18n/translations';

// Airports of the south-eastern Europe / Mediterranean islands catalog. Kraljevo (KVO) is excluded until service is verified.
// An identity is not a promise of service.
const airportNames: Readonly<Record<string, string>> = {
  BEG: 'Belgrado — Nikola Tesla', INI: 'Niš — Constantino el Grande', SJJ: 'Sarajevo', OMO: 'Mostar', TZL: 'Tuzla', BNX: 'Banja Luka',
  TGD: 'Podgorica', TIV: 'Tivat (bahía de Kotor)', SKP: 'Skopie — Alejandro Magno', OHD: 'Ohrid — San Pablo Apóstol', PRN: 'Pristina',
  MLA: 'Malta', LCA: 'Lárnaca', PFO: 'Pafos',
};
export const southeastEuropeCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  southeastEuropeDestinations.map(profile => [profile.airports[0].iataCode, profile.aliases ?? [profile.name]]));
export const southeastEuropeAirports = southeastEuropeDestinations.map(profile => ({
  type: 'airport' as const, code: profile.airports[0].iataCode, name: airportNames[profile.airports[0].iataCode],
  country_code: profile.countryCode, city_code: profile.airports[0].iataCode, city_name: profile.name,
  index_strings: southeastEuropeCityAliases[profile.airports[0].iataCode],
}));
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export function southeastEuropeAirportsForTerm(term: string) {
  const query = normalize(term);
  return southeastEuropeAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function southeastEuropeTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return southeastEuropeDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.airports[0].iataCode, name: profile.name,
      country_code: profile.countryCode, city_name: profile.name, city_code: profile.airports[0].iataCode,
      index_strings: southeastEuropeCityAliases[profile.airports[0].iataCode] ?? [] }));
}
export function southeastEuropeAirportTown(code: string, locale: Locale) {
  const profile = southeastEuropeDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
