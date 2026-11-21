import type { DestinationProfile } from './types';
import { armeniaDestinations } from './armenia';
import { azerbaijanDestinations } from './azerbaijan';
import { bahrainDestinations } from './bahrain';
import { georgiaDestinations } from './georgia';
import { israelDestinations } from './israel';
import { jordanDestinations } from './jordan';
import { kazakhstanDestinations } from './kazakhstan';
import { kuwaitDestinations } from './kuwait';
import { kyrgyzstanDestinations } from './kyrgyzstan';
import { lebanonDestinations } from './lebanon';
import { omanDestinations } from './oman';
import { qatarDestinations } from './qatar';
import { saudiArabiaDestinations } from './saudi-arabia';
import { tajikistanDestinations } from './tajikistan';
import { turkmenistanDestinations } from './turkmenistan';
import { unitedArabEmiratesDestinations } from './united-arab-emirates';
import { uzbekistanDestinations } from './uzbekistan';

/**
 * Todos los países de Asia del catálogo, salvo Japón y Corea del Sur (que tienen sus propios módulos).
 * Añadir un país nuevo = una línea de import + una entrada en esta lista.
 * Las fichas nacen como borrador: no se muestran solas en la portada ni se publican páginas públicas.
 */
export const asiaDestinations: DestinationProfile[] = [
  ...armeniaDestinations,
  ...azerbaijanDestinations,
  ...bahrainDestinations,
  ...georgiaDestinations,
  ...israelDestinations,
  ...jordanDestinations,
  ...kazakhstanDestinations,
  ...kuwaitDestinations,
  ...kyrgyzstanDestinations,
  ...lebanonDestinations,
  ...omanDestinations,
  ...qatarDestinations,
  ...saudiArabiaDestinations,
  ...tajikistanDestinations,
  ...turkmenistanDestinations,
  ...unitedArabEmiratesDestinations,
  ...uzbekistanDestinations,
];

export const asiaDestinationsByCountry: Readonly<Record<string, readonly DestinationProfile[]>> = asiaDestinations.reduce<Record<string, DestinationProfile[]>>(
  (groups, profile) => { (groups[profile.countryCode] ??= []).push(profile); return groups; }, {});
