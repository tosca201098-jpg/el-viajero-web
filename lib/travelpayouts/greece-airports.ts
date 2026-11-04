import { greeceDestinations } from '@/lib/destinations/greece';
import { greeceAirportTownAliases } from '@/lib/destinations/greece-airport-towns';
export { greeceAirportTown } from '@/lib/destinations/greece-airport-towns';

// All 39 commercial airport identities: Athens, Fraport’s 14 and HASP’s 24.
// The 22-airport Growthfund inventory is covered; see greece-final-coverage.md.
// The code/airport association does not promise a route, flight or price.
const names: Readonly<Record<string, string>> = {
  GPA: "Araxos Airport",
  LXS: "Limnos — Ifaistos",
  IOA: "Ioannina — King Pyrrhos",
  JIK: "Ikaria Airport",
  LRS: "Leros Airport",
  VOL: "Nea Anchialos Airport",
  JSH: "Sitia Airport",
  JSY: "Syros Airport",
  JTY: "Astypalaia Airport",
  JKL: "Kalymnos Airport",
  KSJ: "Kasos Airport",
  KZS: "Kastellorizo Airport",
  KSO: "Kastoria Airport",
  KZI: "Kozani Airport",
  KIT: "Kythira Airport",
  SKU: "Skyros Airport",
  PAS: "Paros Airport",
  JNX: "Naxos Airport",
  MLO: "Milos Airport",
  JKH: "Chios — Omiros",
  AOK: "Karpathos Airport",
  AXD: "Alexandroupolis — Dimokritos",
  KVA: 'Kavala — Alexander the Great', MJT: 'Mytilene — Odysseas Elytis',
  ATH: 'Athens — Eleftherios Venizelos', SKG: 'Thessaloniki — Makedonia',
  HER: 'Heraklion — Nikos Kazantzakis', CHQ: 'Chania — Ioannis Daskalogiannis',
  RHO: 'Rhodes — Diagoras', CFU: 'Corfu — Ioannis Kapodistrias',
  KGS: 'Kos — Ippokratis', JTR: 'Santorini (Thira)', JMK: 'Mykonos',
  ZTH: 'Zakynthos — Dionysios Solomos', EFL: 'Kefalonia — Anna Pollatou',
  JSI: 'Skiathos — Alexandros Papadiamantis',
  PVK: 'Aktion — Preveza', SMI: 'Samos — Aristarchos', KLX: 'Kalamata',
};
export const greeceCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  greeceDestinations.map(profile => [profile.iataCodes[0], Array.from(new Set([
    ...(profile.aliases ?? [profile.name]), ...(greeceAirportTownAliases[profile.iataCodes[0]] ?? []),
  ]))]));
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
  return greeceDestinations.filter(profile => [profile.name, ...(greeceCityAliases[profile.iataCodes[0]] ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.iataCodes[0], name: profile.name,
      country_code: 'GR' as const, city_name: profile.name, city_code: profile.iataCodes[0],
      index_strings: greeceCityAliases[profile.iataCodes[0]] ?? [] }));
}
