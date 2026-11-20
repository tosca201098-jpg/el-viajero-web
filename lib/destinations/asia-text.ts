import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';

/**
 * Plantilla común de las fichas de los países de Asia (todos menos Japón y Corea del Sur,
 * que conservan sus propios módulos). Cada país solo aporta datos: textos en siete idiomas,
 * foto con su licencia, códigos IATA y meses. Aquí se construyen igual para todos.
 *
 * Reglas:
 * - El nombre de la ciudad es el MISMO en los siete idiomas (decisión del propietario, 20-11-2026).
 *   Los nombres que antes cambiaban por idioma siguen siendo alias para el buscador.
 * - Los códigos IATA se escriben solo si el buscador de vuelos los reconoce.
 * - No hay precios, disponibilidad ni horarios en estas fichas.
 */
export const locales: readonly Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
export type Seven = readonly [string, string, string, string, string, string, string];

const localize = (values: Seven) => Object.fromEntries(locales.map((locale, index) => [locale, values[index]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
// Misma tabla que Japón y Corea (PR #127): en francés lleva espacio antes de los dos puntos.
const airportLabel = localize(['Aeropuerto:', 'Airport:', 'Aéroport :', 'Flughafen:', 'Aeroporto:', 'Aeroporto:', 'Aeroport:']);
const airportsLabel = localize(['Aeropuertos:', 'Airports:', 'Aéroports :', 'Flughäfen:', 'Aeroporti:', 'Aeroportos:', 'Aeroports:']);

export type AsiaPhoto = {
  image: string; imageSource: string; imageCredit: string; imageLicense: string; imageLicenseUrl: string;
};

/** Foto de Wikimedia Commons: el enlace de la imagen y el de su ficha se derivan del título del archivo. */
export function commonsPhoto(title: string, credit: string, license: string, licenseUrl: string): AsiaPhoto {
  return {
    image: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=1600`,
    imageSource: `https://commons.wikimedia.org/wiki/File:${title.replace(/ /g, '_')}`,
    imageCredit: credit, imageLicense: license, imageLicenseUrl: licenseUrl,
  };
}

/** Foto de Unsplash (licencia gratuita de Unsplash, sin obligación de citar al autor; el nombre se conserva por cortesía). */
export function unsplashPhoto(photoPath: string, pageId: string, credit: string): AsiaPhoto {
  return {
    image: `https://images.unsplash.com/${photoPath}?auto=format&fit=crop&w=1600&q=80`,
    imageSource: `https://unsplash.com/photos/${pageId}`,
    imageCredit: credit, imageLicense: 'Unsplash License', imageLicenseUrl: 'https://unsplash.com/license',
  };
}

export type AsiaSeed = {
  slug: string;
  /** Un solo nombre para todos los idiomas. */
  name: string;
  /** Aeropuertos físicos (códigos IATA) que sirven a la ficha. */
  codes: readonly string[];
  /** Código de ciudad que devuelve el proveedor cuando difiere del aeropuerto (p. ej. Seúl SEL, Duqm JNJ). */
  metropolitanCodes?: readonly string[];
  photo: AsiaPhoto;
  /** Estancia recomendada sin unidad, p. ej. «2–3»; la unidad se añade según el idioma. */
  stay: string;
  description: Seven;
  recommendations: readonly [Seven, Seven, Seven, Seven];
  /** Frase de la mejor época, sin la línea de aeropuertos. */
  seasonality: Seven;
  aliases: readonly string[];
  bestMonths: readonly number[];
  lowSeasonMonths: readonly number[];
  highSeasonMonths: readonly number[];
};

export type AsiaCountry = { countryCode: string; country: string };

export function asiaCountryDestinations(country: AsiaCountry, seeds: readonly AsiaSeed[]): DestinationProfile[] {
  return seeds.map(seed => {
    const airports = seed.codes.length > 1 ? airportsLabel : airportLabel;
    const translations = Object.fromEntries(locales.map((locale, index) => [locale, {
      name: seed.name,
      description: seed.description[index],
      recommendations: seed.recommendations.map(recommendation => recommendation[index]),
      recommendedStay: `${seed.stay} ${days[locale]}`,
      seasonalityNote: `${seed.seasonality[index]} ${airports[locale]} ${seed.codes.join(', ')}.`,
    }])) as Record<Locale, DestinationText>;
    return {
      id: `${country.countryCode.toLowerCase()}-${seed.slug}`,
      slug: seed.slug,
      countryCode: country.countryCode,
      country: country.country,
      ...seed.photo,
      ...translations.es,
      translations,
      airports: seed.codes.map(iataCode => ({ iataCode })),
      iataCodes: [...seed.codes],
      metropolitanCodes: [...(seed.metropolitanCodes ?? [])],
      aliases: Array.from(new Set([seed.name, ...seed.aliases])),
      bestMonths: [...seed.bestMonths],
      lowSeasonMonths: [...seed.lowSeasonMonths],
      highSeasonMonths: [...seed.highSeasonMonths],
      publication: { status: 'draft' },
    } as DestinationProfile;
  });
}
