import { findDestinationProfile, normalizeDestinationName } from './index';

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
