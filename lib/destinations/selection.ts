import { findDestinationProfile, normalizeDestinationName } from './index';
import { ukPassengerAirports } from '@/lib/travelpayouts/uk-airports';
import { germanyAccessSearchCity } from '@/lib/travelpayouts/germany-airports';
import { netherlandsAccessSearchCity } from '@/lib/travelpayouts/netherlands-airports';
import { belgiumAccessSearchCity } from '@/lib/travelpayouts/belgium-airports';
import { switzerlandAccessSearchCity } from '@/lib/travelpayouts/switzerland-airports';
import { austriaAccessSearchCity } from '@/lib/travelpayouts/austria-airports';
import { czechiaAccessSearchCity } from '@/lib/travelpayouts/czechia-airports';
import { polandAccessSearchCity } from '@/lib/travelpayouts/poland-airports';
import { hungaryAccessSearchCity } from '@/lib/travelpayouts/hungary-airports';

/** Called only after an autocomplete choice is committed, never for free-form typing. */
export function destinationFromPlaceSelection(selection: {
  type: 'city' | 'airport'; name: string; country: string; code: string | null;
  cityName: string | null; cityCode: string | null;
}) {
  // The provider names OST's city "Brujas", but the physical airport is in Ostend.
  // A confirmed Belgian tourist city is resolved by its name before its airport pricing group.
  const touristCity = selection.type === 'city' && normalizeDestinationName(selection.country) === 'belgica'
    ? findDestinationProfile({ name: selection.name }) : undefined;
  const profile = touristCity?.countryCode === 'BE' ? touristCity : findDestinationProfile({
    iataCode: selection.code,
    name: selection.type === 'airport' ? selection.cityName || selection.name : selection.name,
  });
  const destination = profile ?? (selection.type === 'airport'
    ? findDestinationProfile({ iataCode: selection.cityCode, name: selection.cityName }) : undefined);
  // EuroAirport stands in France but BSL/MLH serve the Swiss Basel profile.
  const euroAirport = destination?.id === 'ch-basel' && ['BSL', 'MLH', 'EAP'].includes(selection.code ?? '');
  if (!destination || (!euroAirport && normalizeDestinationName(selection.country) !== normalizeDestinationName(destination.country))) return undefined;
  return destination;
}

/** Use actual arrival cities for access transfers without inventing local airports. */
export function accessAirportSearchInput(destination: { countryCode: string; name: string }, airportCode: string) {
  if (destination.countryCode === 'DE') return germanyAccessSearchCity(airportCode);
  if (destination.countryCode === 'NL') return netherlandsAccessSearchCity(airportCode);
  if (destination.countryCode === 'BE') return belgiumAccessSearchCity(airportCode);
  if (destination.countryCode === 'CH') return switzerlandAccessSearchCity(airportCode);
  if (destination.countryCode === 'AT') return austriaAccessSearchCity(airportCode);
  if (destination.countryCode === 'CZ') return czechiaAccessSearchCity(airportCode);
  if (destination.countryCode === 'PL') return polandAccessSearchCity(airportCode);
  if (destination.countryCode === 'HU') return hungaryAccessSearchCity(airportCode);
  if (destination.countryCode === 'GB') {
    return ukPassengerAirports.find(airport => airport.code === airportCode)?.city_name ?? airportCode;
  }
  return destination.countryCode === 'IT' ? destination.name : airportCode;
}
