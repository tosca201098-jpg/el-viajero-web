/** Automatic catalog recommendations only. Original editorial cards (including Paris) keep their own lists. */
export function canShowDestinationAutomatically(destination: { countryCode?: string; country?: string }) {
  return destination.countryCode
    ? !['FR', 'IT', 'GB', 'DE', 'NL'].includes(destination.countryCode.trim().toUpperCase())
    : !['francia', 'italia', 'reino unido', 'alemania', 'países bajos'].includes((destination.country ?? '').trim().toLowerCase());
}
