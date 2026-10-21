/** Automatic catalog recommendations only. Original editorial cards (including Paris) keep their own lists. */
export function canShowDestinationAutomatically(destination: { countryCode?: string; country?: string }) {
  return destination.countryCode
    ? !['FR', 'IT', 'GB'].includes(destination.countryCode.trim().toUpperCase())
    : !['francia', 'italia', 'reino unido'].includes((destination.country ?? '').trim().toLowerCase());
}
