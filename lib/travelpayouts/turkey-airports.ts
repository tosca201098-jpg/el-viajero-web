import { turkeyDestinations } from '@/lib/destinations/turkey';
import type { Locale } from '@/lib/i18n/translations';

// Physical airports of the Turkish catalog (batch 1). Names follow the provider inventory and operator naming.
// An identity is not a promise of service: Kayseri (ASR) is only an access airport of Cappadocia.
const airportNames: Readonly<Record<string, string>> = {
  IST: 'Estambul — Aeropuerto de Estambul (IST)',
  SAW: 'Estambul — Sabiha Gökçen (SAW)',
  ESB: 'Ankara — Esenboğa',
  ADB: 'Esmirna — Adnan Menderes',
  AYT: 'Antalya',
  BJV: 'Bodrum — Milas-Bodrum',
  DLM: 'Dalaman',
  TZX: 'Trebisonda',
  NAV: 'Capadocia — Nevşehir Kapadokya',
  GZT: 'Gaziantep',
  KYA: 'Konya',
  GZP: 'Alanya — Gazipaşa',
};
// City codes of the provider inventory for airports whose city code differs from the airport code.
const providerCityCodes: Readonly<Record<string, string>> = { SAW: 'IST', ESB: 'ANK', ADB: 'IZM' };
export const turkeyCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  turkeyDestinations.map(profile => [profile.airports[0].iataCode, profile.aliases ?? [profile.name]]));
// Istanbul has two airports: aliases naming one of them must not point at the other.
const otherAirportAliases: Readonly<Record<string, readonly string[]>> = {
  IST: ['Sabiha Gökçen', 'Sabiha Gokcen'],
  SAW: ['Istanbul Airport', 'Istanbul New Airport'],
};
export const turkeyAirports = turkeyDestinations.flatMap(profile => profile.airports.map(({ iataCode }) => ({
  type: 'airport' as const, code: iataCode, name: airportNames[iataCode],
  country_code: 'TR' as const, city_code: providerCityCodes[iataCode] ?? iataCode, city_name: profile.name,
  index_strings: (turkeyCityAliases[profile.airports[0].iataCode] ?? []).filter(alias => !(otherAirportAliases[iataCode] ?? []).includes(alias)),
})));
const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
export function turkeyAirportsForTerm(term: string) {
  const query = normalize(term);
  return turkeyAirports.filter(airport => normalize(airport.code) === query ||
    normalize(airport.name) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function turkeyTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return turkeyDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.airports[0].iataCode, name: profile.name,
      country_code: 'TR' as const, city_name: profile.name, city_code: profile.airports[0].iataCode,
      index_strings: turkeyCityAliases[profile.airports[0].iataCode] ?? [] }));
}
export function turkeyAirportTown(code: string, locale: Locale) {
  const profile = turkeyDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
