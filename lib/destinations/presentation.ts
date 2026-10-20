/** Presentation policy only: the canonical catalog and provider queries stay complete. */
export function canShowDestinationAutomatically(destination: { countryCode?: string; country?: string }) {
  return destination.countryCode
    ? destination.countryCode.trim().toUpperCase() !== 'FR'
    : (destination.country ?? '').trim().toLowerCase() !== 'francia';
}
