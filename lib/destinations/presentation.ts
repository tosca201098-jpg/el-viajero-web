/** Automatic catalog recommendations only. Original editorial cards (including Paris) keep their own lists. */
export function canShowDestinationAutomatically(destination: { countryCode?: string; country?: string }) {
  return destination.countryCode
    ? destination.countryCode.trim().toUpperCase() !== 'FR'
    : (destination.country ?? '').trim().toLowerCase() !== 'francia';
}
