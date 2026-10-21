import { findDestinationProfile, normalizeDestinationName } from './index';
import { ukPassengerAirports } from '@/lib/travelpayouts/uk-airports';

/** Called only after an autocomplete choice is committed, never for free-form typing. */
export function destinationFromPlaceSelection(selection: {
  type: 'city' | 'airport'; name: string; country: string; code: string | null;
  cityName: string | null; cityCode: string | null;
}) {
  const profile = findDestinationProfile({
    iataCode: selection.code,
    name: selection.type === 'airport' ? selection.cityName || selection.name : selection.name,
  });
  const destination = profile ?? (selection.type === 'airport'
    ? findDestinationProfile({ iataCode: selection.cityCode, name: selection.cityName }) : undefined);
  if (!destination || normalizeDestinationName(selection.country) !== normalizeDestinationName(destination.country)) return undefined;
  return destination;
}

/** Use the provider's actual arrival city for UK transfers, never invent an airport for York/Oxford. */
export function accessAirportSearchInput(destination: { countryCode: string; name: string }, airportCode: string) {
  if (destination.countryCode === 'GB') {
    return ukPassengerAirports.find(airport => airport.code === airportCode)?.city_name ?? airportCode;
  }
  return destination.countryCode === 'IT' ? destination.name : airportCode;
}
