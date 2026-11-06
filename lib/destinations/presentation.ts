/** Automatic catalog recommendations only. Original editorial cards (including Paris) keep their own lists. */
export function canShowDestinationAutomatically(destination: { countryCode?: string; country?: string }) {
  return destination.countryCode
    ? !['FR', 'IT', 'GB', 'DE', 'NL', 'BE', 'CH', 'AT', 'CZ', 'PL', 'HU', 'SK', 'AL', 'TR', 'RS', 'BA', 'ME', 'MK', 'XK', 'MT', 'CY', 'RO', 'BG', 'MD', 'DK', 'IS', 'FI', 'SE', 'NO', 'IE', 'EE', 'LV', 'LT', 'LU', 'GI', 'JE', 'GG', 'IM', 'FO', 'AX'].includes(destination.countryCode.trim().toUpperCase())
    : !['francia', 'italia', 'reino unido', 'alemania', 'países bajos', 'bélgica', 'suiza', 'austria', 'chequia', 'polonia', 'hungría', 'eslovaquia', 'albania', 'turquía', 'serbia', 'bosnia y herzegovina', 'montenegro', 'macedonia del norte', 'kosovo', 'malta', 'chipre', 'rumanía', 'bulgaria', 'moldavia', 'dinamarca', 'islandia', 'finlandia', 'suecia', 'noruega', 'irlanda', 'estonia', 'letonia', 'lituania', 'luxemburgo', 'gibraltar', 'jersey', 'guernsey', 'isla de man', 'islas feroe', 'islas åland'].includes((destination.country ?? '').trim().toLowerCase());
}
