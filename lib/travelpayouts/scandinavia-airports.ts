import { scandinaviaDestinations } from '@/lib/destinations/scandinavia';
import type { Locale } from '@/lib/i18n/translations';

// Airports of Sweden and Norway. Umeå, Kristiansand, Alta and small regional airports are pending verification.
// An identity is not a promise of service.
const airportNames: Readonly<Record<string, string>> = {
  ARN: 'Estocolmo — Arlanda', GOT: 'Gotemburgo — Landvetter', MMX: 'Malmö — Sturup', KRN: 'Kiruna', LLA: 'Luleå', OSD: 'Åre Östersund', VBY: 'Visby (Gotland)',
  OSL: 'Oslo — Gardermoen', BGO: 'Bergen — Flesland', TRD: 'Trondheim — Værnes', SVG: 'Stavanger — Sola', TOS: 'Tromsø', BOO: 'Bodø', AES: 'Ålesund — Vigra', KKN: 'Kirkenes — Høybuktmoen', SVJ: 'Svolvær (Lofoten)',
};
export const scandinaviaCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  scandinaviaDestinations.map(profile => [profile.airports[0].iataCode, profile.aliases ?? [profile.name]]));
export const scandinaviaAirports = scandinaviaDestinations.map(profile => ({
  type: 'airport' as const, code: profile.airports[0].iataCode, name: airportNames[profile.airports[0].iataCode],
  country_code: profile.countryCode, city_code: profile.metropolitanCodes?.[0] ?? profile.airports[0].iataCode, city_name: profile.name,
  index_strings: scandinaviaCityAliases[profile.airports[0].iataCode],
}));
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export function scandinaviaAirportsForTerm(term: string) {
  const query = normalize(term);
  return scandinaviaAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function scandinaviaTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return scandinaviaDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.airports[0].iataCode, name: profile.name,
      country_code: profile.countryCode, city_name: profile.name, city_code: profile.airports[0].iataCode,
      index_strings: scandinaviaCityAliases[profile.airports[0].iataCode] ?? [] }));
}
export function scandinaviaAirportTown(code: string, locale: Locale) {
  const profile = scandinaviaDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
