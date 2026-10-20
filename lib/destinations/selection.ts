import { findDestinationProfile, normalizeDestinationName } from './index';

/** Called only after an autocomplete choice is committed, never for free-form typing. */
export function destinationFromPlaceSelection(selection: {
  type: 'city' | 'airport'; name: string; country: string; code: string | null;
  cityName: string | null; cityCode: string | null;
}) {
  const profile = findDestinationProfile({
    iataCode: selection.type === 'airport' ? selection.cityCode || selection.code : selection.code,
    name: selection.type === 'airport' ? selection.cityName || selection.name : selection.name,
  });
  if (!profile || normalizeDestinationName(selection.country) !== normalizeDestinationName(profile.country)) return undefined;
  return profile;
}
