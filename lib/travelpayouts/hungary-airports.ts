import { hungaryDestinations } from '@/lib/destinations/hungary';

// BUD and DEB were confirmed against the airport operators and Travelpayouts places2.
// SOB (Hévíz–Balaton) exists, but places2 did not resolve it on 2026-10-25;
// it remains an auxiliary identifier and is never submitted for flight prices.
export const hungaryCityAliases: Readonly<Record<string, readonly string[]>> = {
  BUD: ['Budapest', 'Buda', 'Pest'],
  DEB: ['Debrecen'],
};
export const hungaryAirports = [
  { type: 'airport', code: 'BUD', name: 'Budapest Ferenc Liszt International Airport', country_code: 'HU', city_code: 'BUD', city_name: 'Budapest', index_strings: hungaryCityAliases.BUD },
  { type: 'airport', code: 'DEB', name: 'Debrecen International Airport', country_code: 'HU', city_code: 'DEB', city_name: 'Debrecen', index_strings: hungaryCityAliases.DEB },
] as const;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function hungaryAirportsForTerm(term: string) {
  const query = normalize(term);
  return hungaryAirports.filter(airport => normalize(airport.code) === query ||
    airport.index_strings.some(alias => normalize(alias) === query));
}
export function hungaryTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return hungaryDestinations.filter(profile => profile.airports.length === 0)
    .filter(profile => [profile.name, ...(profile.aliases ?? [])].some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: null, name: profile.name, country_code: 'HU' as const,
      city_name: null, city_code: null, index_strings: profile.aliases ?? [] }));
}
export function hungaryAccessSearchCity(code: string) {
  return ({ BUD: 'Budapest', DEB: 'Debrecen' } as Record<string, string>)[code] ?? code;
}
