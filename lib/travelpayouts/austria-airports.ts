import { austriaDestinations } from '@/lib/destinations/austria';

// Six Austrian international airports confirmed in the Austrian AIP and
// Travelpayouts places2 on 2026-10-22. Limited notices do not promise
// a route or a flight on any particular date.
type AustrianAirport = {
  type: 'airport'; code: string; name: string; country_code: 'AT';
  city_code: string; city_name: string; index_strings: readonly string[];
  serviceNotice?: 'limitedSeasonalFlights';
};
export const austriaCityAliases: Readonly<Record<string, readonly string[]>> = {
  VIE: ['Viena', 'Vienna', 'Wien', 'Vienne'],
  SZG: ['Salzburgo', 'Salzburg', 'Salzbourg', 'Salisburgo'],
  INN: ['Innsbruck', 'Insbruck'],
  GRZ: ['Graz', 'Gratz'],
  LNZ: ['Linz', 'Linz an der Donau'],
  KLU: ['Klagenfurt', 'Klagenfurt am Wörthersee'],
};
export const austriaAirports: readonly AustrianAirport[] = [
  { type: 'airport', code: 'VIE', name: 'Vienna International Airport', country_code: 'AT', city_code: 'VIE', city_name: 'Viena', index_strings: austriaCityAliases.VIE },
  { type: 'airport', code: 'SZG', name: 'Salzburg Airport', country_code: 'AT', city_code: 'SZG', city_name: 'Salzburgo', index_strings: austriaCityAliases.SZG, serviceNotice: 'limitedSeasonalFlights' },
  { type: 'airport', code: 'INN', name: 'Innsbruck Airport', country_code: 'AT', city_code: 'INN', city_name: 'Innsbruck', index_strings: austriaCityAliases.INN, serviceNotice: 'limitedSeasonalFlights' },
  { type: 'airport', code: 'GRZ', name: 'Graz Airport', country_code: 'AT', city_code: 'GRZ', city_name: 'Graz', index_strings: austriaCityAliases.GRZ, serviceNotice: 'limitedSeasonalFlights' },
  { type: 'airport', code: 'LNZ', name: 'Linz Airport', country_code: 'AT', city_code: 'LNZ', city_name: 'Linz', index_strings: austriaCityAliases.LNZ, serviceNotice: 'limitedSeasonalFlights' },
  { type: 'airport', code: 'KLU', name: 'Klagenfurt Airport', country_code: 'AT', city_code: 'KLU', city_name: 'Klagenfurt', index_strings: austriaCityAliases.KLU, serviceNotice: 'limitedSeasonalFlights' },
];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function austriaAirportsForTerm(term: string) {
  const q = normalize(term);
  return austriaAirports.filter(airport => normalize(airport.code) === q ||
    airport.index_strings.some(alias => normalize(alias) === q));
}
/** Tourist destinations with no own commercial airport remain code-free. */
export function austriaTouristPlacesForTerm(term: string) {
  const q = normalize(term);
  if (q.length < 2) return [];
  return austriaDestinations.filter(profile => profile.airports.length === 0)
    .filter(profile => [profile.name, ...(profile.aliases ?? [])].some(name => normalize(name).startsWith(q)))
    .map(profile => ({ type: 'city' as const, code: null, name: profile.name, country_code: 'AT' as const,
      city_name: null, city_code: null, index_strings: profile.aliases ?? [] }));
}
/** A transfer airport searches its own real city, never the tourist town. */
export function austriaAccessSearchCity(code: string) {
  const access: Record<string, string> = {
    VIE: 'Viena', SZG: 'Salzburgo', INN: 'Innsbruck', LNZ: 'Linz',
    FDH: 'Friedrichshafen', ACH: 'Altenrhein', ZRH: 'Zúrich',
  };
  return access[code] ?? code;
}
