import { polandDestinations } from '@/lib/destinations/poland';

// Individually checked against Travelpayouts places2 on 2026-10-23. The Polish
// Civil Aviation Authority and airport operators confirm physical airports;
// neither source guarantees a service on any given date or from any origin.
export const polandCityAliases: Readonly<Record<string, readonly string[]>> = {
  WAW: ['Varsovia', 'Warszawa', 'Warsaw'],
  WMI: ['Warsaw Modlin', 'Varsovia Modlin', 'Modlin'],
  KRK: ['Cracovia', 'Kraków', 'Krakow', 'Krakau'],
  GDN: ['Gdańsk', 'Gdansk', 'Danzig', 'Sopot', 'Gdynia', 'Trójmiasto'],
  WRO: ['Breslavia', 'Wrocław', 'Wroclaw', 'Breslau'],
  POZ: ['Poznań', 'Poznan', 'Posen'],
  LCJ: ['Łódź', 'Lodz'],
  SZZ: ['Szczecin', 'Stettin'],
  LUZ: ['Lublin'],
  KTW: ['Katowice'],
  SZY: ['Szymany', 'Olsztyn-Mazury'],
  BZG: ['Bydgoszcz'],
};
export const polandAirports = [
  { type: 'airport', code: 'WAW', name: 'Warsaw Chopin Airport', country_code: 'PL', city_code: 'WAW', city_name: 'Varsovia', index_strings: polandCityAliases.WAW },
  { type: 'airport', code: 'WMI', name: 'Warsaw Modlin Airport', country_code: 'PL', city_code: 'WAW', city_name: 'Varsovia', index_strings: polandCityAliases.WMI },
  { type: 'airport', code: 'KRK', name: 'Kraków John Paul II International Airport', country_code: 'PL', city_code: 'KRK', city_name: 'Cracovia', index_strings: polandCityAliases.KRK },
  { type: 'airport', code: 'GDN', name: 'Gdańsk Lech Wałęsa Airport', country_code: 'PL', city_code: 'GDN', city_name: 'Gdańsk', index_strings: polandCityAliases.GDN },
  { type: 'airport', code: 'WRO', name: 'Copernicus Airport Wrocław', country_code: 'PL', city_code: 'WRO', city_name: 'Breslavia', index_strings: polandCityAliases.WRO },
  { type: 'airport', code: 'POZ', name: 'Poznań-Ławica Airport', country_code: 'PL', city_code: 'POZ', city_name: 'Poznań', index_strings: polandCityAliases.POZ },
  { type: 'airport', code: 'LCJ', name: 'Łódź Władysław Reymont Airport', country_code: 'PL', city_code: 'LCJ', city_name: 'Łódź', index_strings: polandCityAliases.LCJ, serviceNotice: 'limitedSeasonalFlights' },
  { type: 'airport', code: 'SZZ', name: 'Solidarity Szczecin-Goleniów Airport', country_code: 'PL', city_code: 'SZZ', city_name: 'Szczecin', index_strings: polandCityAliases.SZZ, serviceNotice: 'limitedSeasonalFlights' },
  { type: 'airport', code: 'LUZ', name: 'Lublin Airport', country_code: 'PL', city_code: 'LUZ', city_name: 'Lublin', index_strings: polandCityAliases.LUZ, serviceNotice: 'limitedSeasonalFlights' },
  { type: 'airport', code: 'KTW', name: 'Katowice Airport', country_code: 'PL', city_code: 'KTW', city_name: 'Katowice', index_strings: polandCityAliases.KTW },
  { type: 'airport', code: 'SZY', name: 'Olsztyn-Mazury Airport', country_code: 'PL', city_code: 'SZY', city_name: 'Szymany', index_strings: polandCityAliases.SZY, serviceNotice: 'limitedSeasonalFlights' },
  { type: 'airport', code: 'BZG', name: 'Bydgoszcz Airport', country_code: 'PL', city_code: 'BZG', city_name: 'Bydgoszcz', index_strings: polandCityAliases.BZG, serviceNotice: 'limitedSeasonalFlights' },
] as const;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function polandAirportsForTerm(term: string) {
  const query = normalize(term);
  return polandAirports.filter(airport => normalize(airport.code) === query || airport.index_strings.some(alias => normalize(alias) === query));
}
export function polandTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return polandDestinations.filter(profile => profile.airports.length === 0)
    .filter(profile => [profile.name, ...(profile.aliases ?? [])].some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: null, name: profile.name, country_code: 'PL' as const,
      city_name: null, city_code: null, index_strings: profile.aliases ?? [] }));
}
export function polandAccessSearchCity(code: string) {
  return ({ WAW: 'Varsovia', KRK: 'Cracovia', KTW: 'Katowice', SZY: 'Szymany', BZG: 'Bydgoszcz', LUZ: 'Lublin', GDN: 'Gdańsk' } as Record<string, string>)[code] ?? code;
}
