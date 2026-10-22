import { switzerlandDestinations } from '@/lib/destinations/switzerland';

// Physical identities and provider city groups checked against Travelpayouts public
// airports.json, cities.json and places2 on 2026-10-22. A provider's `flightable`
// flag is not evidence of a current scheduled passenger service.
type SwissAirport = {
  type: 'airport'; code: string; name: string; country_code: 'CH' | 'FR';
  city_code: string; city_name: string; index_strings: readonly string[];
  physicalAirportId?: 'EAP'; physicalCityName?: string;
  scheduledPassengerService?: false;
  serviceNotice?: 'euroAirportShared' | 'limitedSeasonalFlights' | 'noScheduledFlights';
};

export const switzerlandCityAliases: Readonly<Record<string, readonly string[]>> = {
  ZRH: ['Zúrich', 'Zürich', 'Zurich', 'Zurigo', 'Zurique', 'Zuric'],
  GVA: ['Ginebra', 'Genève', 'Geneva', 'Genf', 'Ginevra', 'Genebra'],
  BRN: ['Berna', 'Bern', 'Berne'],
  EAP: ['Basilea', 'Basel', 'Bâle', 'Basle'],
};

export const switzerlandAirports: readonly SwissAirport[] = [
  { type: 'airport', code: 'ZRH', name: 'Zurich Airport', country_code: 'CH', city_code: 'ZRH', city_name: 'Zúrich', index_strings: switzerlandCityAliases.ZRH },
  { type: 'airport', code: 'GVA', name: 'Geneva Airport', country_code: 'CH', city_code: 'GVA', city_name: 'Ginebra', index_strings: switzerlandCityAliases.GVA },
  // One installation in Saint-Louis, France, with two sector codes and the EAP city group.
  { type: 'airport', code: 'BSL', name: 'EuroAirport · sector suizo', country_code: 'FR', city_code: 'EAP', city_name: 'Basilea', physicalAirportId: 'EAP', physicalCityName: 'Saint-Louis (Francia)', index_strings: switzerlandCityAliases.EAP, serviceNotice: 'euroAirportShared' },
  { type: 'airport', code: 'MLH', name: 'EuroAirport · sector francés', country_code: 'FR', city_code: 'EAP', city_name: 'Basilea', physicalAirportId: 'EAP', physicalCityName: 'Saint-Louis (Francia)', index_strings: switzerlandCityAliases.EAP, serviceNotice: 'euroAirportShared' },
  { type: 'airport', code: 'BRN', name: 'Bern Airport · Belp', country_code: 'CH', city_code: 'BRN', city_name: 'Berna', index_strings: switzerlandCityAliases.BRN, serviceNotice: 'limitedSeasonalFlights' },
  { type: 'airport', code: 'ACH', name: 'St. Gallen–Altenrhein Airport', country_code: 'CH', city_code: 'ACH', city_name: 'Altenrhein', index_strings: ['Altenrhein', 'San Galo', 'St. Gallen', 'Sankt Gallen'], serviceNotice: 'limitedSeasonalFlights' },
  { type: 'airport', code: 'LUG', name: 'Lugano Airport · Agno', country_code: 'CH', city_code: 'LUG', city_name: 'Lugano', index_strings: ['Lugano', 'Agno'], scheduledPassengerService: false, serviceNotice: 'noScheduledFlights' },
  { type: 'airport', code: 'SIR', name: 'Sion Airport', country_code: 'CH', city_code: 'SIR', city_name: 'Sion', index_strings: ['Sion', 'Sitten'], serviceNotice: 'limitedSeasonalFlights' },
];

export const switzerlandPassengerAirports = switzerlandAirports.filter(airport => airport.scheduledPassengerService !== false);
function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim(); }

export function switzerlandAirportsForTerm(term: string) {
  const q = normalize(term);
  return switzerlandAirports.filter(airport => normalize(airport.code) === q || airport.index_strings.some(alias => normalize(alias) === q));
}

/** A confirmed tourist place, never an invented airport or railway IATA code. */
export function switzerlandTouristPlacesForTerm(term: string) {
  const q = normalize(term);
  if (q.length < 2) return [];
  return switzerlandDestinations.filter(profile => profile.airports.length === 0)
    .filter(profile => [profile.name, ...(profile.aliases ?? []), ...(profile.auxiliaryCodes ?? [])].some(name => normalize(name).startsWith(q)))
    .map(profile => ({ type: 'city' as const, code: null, name: profile.name, country_code: 'CH' as const,
      city_name: null, city_code: null, index_strings: profile.aliases ?? [] }));
}

/** The flight search takes the provider city or airport code, never a train-station code. */
export function switzerlandAccessSearchCity(code: string) {
  if (code === 'BSL' || code === 'MLH') return 'Basilea';
  return switzerlandPassengerAirports.find(airport => airport.code === code)?.city_name ?? code;
}
