import type { Locale } from '@/lib/i18n/translations';
import { southKoreaDestinations } from '@/lib/destinations/south-korea';

// IATA identities returned by the public places provider on 2026-11-13.
// They identify an airport and destination; they do not promise a route, fare or schedule.
const names: Readonly<Record<string, string>> = {
  ICN: 'Incheon International Airport', GMP: 'Gimpo International Airport',
  PUS: 'Gimhae International Airport', CJU: 'Jeju International Airport',
  TAE: 'Daegu International Airport', CJJ: 'Cheongju International Airport',
  HIN: 'Sacheon Airport', KPO: 'Pohang Gyeongju Airport', KUV: 'Gunsan Airport',
  KWJ: 'Gwangju Airport', MWX: 'Muan International Airport', RSU: 'Yeosu Airport',
  USN: 'Ulsan Airport', WJU: 'Wonju Airport', YNY: 'Yangyang International Airport',
};

export const southKoreaCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  southKoreaDestinations.flatMap(profile => profile.iataCodes.map(code => [code, Array.from(new Set([
    profile.name, ...(profile.aliases ?? []), ...(code === 'ICN' ? ['Incheon International Airport'] : []),
  ]))])),
);

export const southKoreaAirports = southKoreaDestinations.flatMap(profile => profile.iataCodes.map(code => ({
  type: 'airport' as const, code, name: names[code], country_code: 'KR' as const,
  city_code: profile.metropolitanCodes.includes('SEL') ? 'SEL' : code,
  city_name: profile.name, index_strings: southKoreaCityAliases[code],
})));

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function southKoreaAirportsForTerm(term: string) {
  const query = normalize(term);
  return southKoreaAirports.filter(airport => normalize(airport.code) === query || normalize(airport.name) === query ||
    airport.index_strings.some(alias => normalize(alias) === query));
}
export function southKoreaTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return southKoreaDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.iataCodes[0], name: profile.name, country_code: 'KR' as const,
      city_name: profile.name, city_code: profile.metropolitanCodes.includes('SEL') ? 'SEL' : profile.iataCodes[0],
      index_strings: southKoreaCityAliases[profile.iataCodes[0]] ?? [] }));
}
export function southKoreaAirportTown(code: string, locale: Locale) {
  const profile = southKoreaDestinations.find(candidate => candidate.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
export function southKoreaAccessSearchCity(code: string) {
  return southKoreaDestinations.find(candidate => candidate.iataCodes.includes(code))?.name ?? code;
}
