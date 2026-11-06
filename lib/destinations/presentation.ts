/** Automatic catalog recommendations only. Original editorial cards (including Paris) keep their own lists. */
export function canShowDestinationAutomatically(destination: { countryCode?: string; country?: string }) {
  return destination.countryCode
    ? !['FR', 'IT', 'GB', 'DE', 'NL', 'BE', 'CH', 'AT', 'CZ', 'PL', 'HU', 'SK', 'AL', 'TR', 'RS', 'BA', 'ME', 'MK', 'XK', 'MT', 'CY'].includes(destination.countryCode.trim().toUpperCase())
    : !['francia', 'italia', 'reino unido', 'alemania', 'países bajos', 'bélgica', 'suiza', 'austria', 'chequia', 'polonia', 'hungría', 'eslovaquia', 'albania', 'turquía', 'serbia', 'bosnia y herzegovina', 'montenegro', 'macedonia del norte', 'kosovo', 'malta', 'chipre'].includes((destination.country ?? '').trim().toLowerCase());
}
