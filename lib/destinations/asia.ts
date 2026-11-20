import type { DestinationProfile } from './types';
import { bahrainDestinations } from './bahrain';
import { kuwaitDestinations } from './kuwait';
import { omanDestinations } from './oman';
import { qatarDestinations } from './qatar';
import { saudiArabiaDestinations } from './saudi-arabia';

/**
 * Todos los países de Asia del catálogo, salvo Japón y Corea del Sur (que tienen sus propios módulos).
 * Añadir un país nuevo = una línea de import + una entrada en esta lista.
 * Las fichas nacen como borrador: no se muestran solas en la portada ni se publican páginas públicas.
 */
export const asiaDestinations: DestinationProfile[] = [
  ...bahrainDestinations,
  ...kuwaitDestinations,
  ...omanDestinations,
  ...qatarDestinations,
  ...saudiArabiaDestinations,
];

export const asiaDestinationsByCountry: Readonly<Record<string, readonly DestinationProfile[]>> = asiaDestinations.reduce<Record<string, DestinationProfile[]>>(
  (groups, profile) => { (groups[profile.countryCode] ??= []).push(profile); return groups; }, {});
