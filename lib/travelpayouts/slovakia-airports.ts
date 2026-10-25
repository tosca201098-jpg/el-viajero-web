import { slovakiaDestinations } from '@/lib/destinations/slovakia';

// BTS, KSC and TAT are listed by their operators and resolve in Travelpayouts places2.
// Search availability remains date- and origin-dependent.
export const slovakiaCityAliases: Readonly<Record<string, readonly string[]>> = {
  BTS: ['Bratislava'],
  KSC: ['Košice', 'Kosice'],
  TAT: ['Poprad', 'Poprad-Tatry'],
};
export const slovakiaAirports = [
  { type: 'airport', code: 'BTS', name: 'M. R. Štefánik Airport Bratislava', country_code: 'SK', city_code: 'BTS', city_name: 'Bratislava', index_strings: slovakiaCityAliases.BTS },
  { type: 'airport', code: 'KSC', name: 'Košice International Airport', country_code: 'SK', city_code: 'KSC', city_name: 'Košice', index_strings: slovakiaCityAliases.KSC },
  { type: 'airport', code: 'TAT', name: 'Poprad–Tatry Airport', country_code: 'SK', city_code: 'TAT', city_name: 'Poprad', index_strings: slovakiaCityAliases.TAT },
] as const;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function slovakiaAirportsForTerm(term: string) {
  const query = normalize(term);
  return slovakiaAirports.filter(airport => normalize(airport.code) === query ||
    airport.index_strings.some(alias => normalize(alias) === query));
}
export function slovakiaTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return slovakiaDestinations.filter(profile => profile.airports.length === 0)
    .filter(profile => [profile.name, ...(profile.aliases ?? [])].some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: null, name: profile.name, country_code: 'SK' as const,
      city_name: null, city_code: null, index_strings: profile.aliases ?? [] }));
}
export function slovakiaAccessSearchCity(code: string) {
  return ({ BTS: 'Bratislava', KSC: 'Košice', TAT: 'Poprad' } as Record<string, string>)[code] ?? code;
}
