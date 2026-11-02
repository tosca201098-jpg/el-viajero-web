import { greeceDestinations } from '@/lib/destinations/greece';

// Twelve arrival airports for this curated block, not a complete national inventory.
// The code/airport association does not promise a route, flight or price.
const names: Readonly<Record<string, string>> = {
  ATH: 'Athens — Eleftherios Venizelos', SKG: 'Thessaloniki — Makedonia',
  HER: 'Heraklion — Nikos Kazantzakis', CHQ: 'Chania — Ioannis Daskalogiannis',
  RHO: 'Rhodes — Diagoras', CFU: 'Corfu — Ioannis Kapodistrias',
  KGS: 'Kos — Ippokratis', JTR: 'Santorini (Thira)', JMK: 'Mykonos',
  ZTH: 'Zakynthos — Dionysios Solomos', EFL: 'Kefalonia — Anna Pollatou',
  JSI: 'Skiathos — Alexandros Papadiamantis',
};
export const greeceCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  greeceDestinations.map(profile => [profile.iataCodes[0], profile.aliases ?? [profile.name]]));
export const greeceAirports = greeceDestinations.map(profile => ({
  type: 'airport' as const, code: profile.iataCodes[0], name: names[profile.iataCodes[0]],
  country_code: 'GR' as const, city_code: profile.iataCodes[0], city_name: profile.name,
  index_strings: greeceCityAliases[profile.iataCodes[0]],
}));
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function greeceAirportsForTerm(term: string) {
  const query = normalize(term);
  return greeceAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function greeceTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return greeceDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.iataCodes[0], name: profile.name,
      country_code: 'GR' as const, city_name: profile.name, city_code: profile.iataCodes[0],
      index_strings: profile.aliases ?? [] }));
}
