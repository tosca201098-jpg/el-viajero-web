import { franceAirportCoverage, franceCoverageAirportDetails, franceAirportTown } from '@/lib/destinations/france-airport-coverage';
export { franceAirportTown };

// First metropolitan France expansion. Each verified code opens its served city's profile.
// Existing Paris CDG/ORY/BVA and other approved city groups remain unchanged.
export const franceCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  franceAirportCoverage.map(profile => [profile.iataCodes[0], profile.aliases ?? [profile.name]]));
export const franceAirports = franceAirportCoverage.map(profile => ({
  type: 'airport' as const, code: profile.iataCodes[0],
  name: franceCoverageAirportDetails.find(airport => airport.code === profile.iataCodes[0])!.name,
  country_code: 'FR' as const, city_code: profile.iataCodes[0], city_name: profile.name,
  index_strings: franceCityAliases[profile.iataCodes[0]],
}));
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function franceAirportsForTerm(term: string) {
  const query = normalize(term);
  return franceAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function franceTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return franceAirportCoverage.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.iataCodes[0], name: profile.name,
      country_code: 'FR' as const, city_name: profile.name, city_code: profile.iataCodes[0],
      index_strings: profile.aliases ?? [] }));
}
