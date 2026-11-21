import type { DestinationProfile } from './types';
import { bahrainDestinations } from './bahrain';
import { israelDestinations } from './israel';
import { jordanDestinations } from './jordan';
import { kuwaitDestinations } from './kuwait';
import { lebanonDestinations } from './lebanon';
import { omanDestinations } from './oman';
import { qatarDestinations } from './qatar';
import { saudiArabiaDestinations } from './saudi-arabia';
import { unitedArabEmiratesDestinations } from './united-arab-emirates';

/**
 * Todos los países de Asia del catálogo, salvo Japón y Corea del Sur (que tienen sus propios módulos).
 * Añadir un país nuevo = una línea de import + una entrada en esta lista.
 * Las fichas nacen como borrador: no se muestran solas en la portada ni se publican páginas públicas.
 */
export const asiaDestinations: DestinationProfile[] = [
  ...bahrainDestinations,
  ...israelDestinations,
  ...jordanDestinations,
  ...kuwaitDestinations,
  ...lebanonDestinations,
  ...omanDestinations,
  ...qatarDestinations,
  ...saudiArabiaDestinations,
  ...unitedArabEmiratesDestinations,
];

export const asiaDestinationsByCountry: Readonly<Record<string, readonly DestinationProfile[]>> = asiaDestinations.reduce<Record<string, DestinationProfile[]>>(
  (groups, profile) => { (groups[profile.countryCode] ??= []).push(profile); return groups; }, {});
