// Banderas de la ficha de destino.
//
// Solo se muestra bandera cuando el código de país está en esta tabla (dato fiable).
// Si el código no aparece, no se devuelve nada y la ficha no enseña ninguna bandera:
// nunca se usa una bandera "por defecto" (antes, el último recurso de la ficha era la
// bandera francesa; ahora Francia figura en la tabla como cualquier otro país).
const countryFlags = new Map<string, string>([
  ['FR', '🇫🇷'],
  ['HR', '🇭🇷'],
  ['SI', '🇸🇮'],
  ['GR', '🇬🇷'],
  ['SK', '🇸🇰'],
  ['HU', '🇭🇺'],
  ['PL', '🇵🇱'],
  ['CZ', '🇨🇿'],
  ['AT', '🇦🇹'],
  ['CH', '🇨🇭'],
  ['BE', '🇧🇪'],
  ['NL', '🇳🇱'],
  ['DE', '🇩🇪'],
  ['GB', '🇬🇧'],
  ['IT', '🇮🇹'],
  ['IE', '🇮🇪'],
  ['EE', '🇪🇪'],
  ['LV', '🇱🇻'],
  ['LT', '🇱🇹'],
  ['LU', '🇱🇺'],
  ['GI', '🇬🇮'],
  ['JE', '🇯🇪'],
  ['GG', '🇬🇬'],
  ['IM', '🇮🇲'],
  ['FO', '🇫🇴'],
  ['AX', '🇦🇽'],
  ['SE', '🇸🇪'],
  ['NO', '🇳🇴'],
  ['DK', '🇩🇰'],
  ['IS', '🇮🇸'],
  ['FI', '🇫🇮'],
  ['RO', '🇷🇴'],
  ['BG', '🇧🇬'],
  ['MD', '🇲🇩'],
  ['RS', '🇷🇸'],
  ['BA', '🇧🇦'],
  ['ME', '🇲🇪'],
  ['MK', '🇲🇰'],
  ['XK', '🇽🇰'],
  ['MT', '🇲🇹'],
  ['CY', '🇨🇾'],
  ['TR', '🇹🇷'],
  ['AL', '🇦🇱'],
]);

export function flagForCountryCode(countryCode?: string | null): string | undefined {
  return countryCode ? countryFlags.get(countryCode) : undefined;
}
