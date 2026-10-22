import { destinations, type Destination } from './featured';
import { destinationsByCountry, normalizeDestinationName } from './index';
import type { Locale } from '@/lib/i18n/translations';

export type HomepageCountryGroup = {
  countryCode: string;
  fallbackName: string;
  flag: string;
  cards: readonly Destination[];
};

/** Editorial selection: exactly six recommended destinations per country with a canonical catalogue. */
const featuredCountrySelections = [
  { code: 'ES', name: 'España', flag: '🇪🇸', ids: ['es-barcelona', 'es-madrid', 'es-sevilla', 'es-granada', 'es-valencia', 'es-tenerife'] },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', ids: ['pt-lisboa', 'pt-porto', 'pt-madeira', 'pt-faro', 'pt-ponta-delgada', 'pt-cascais'] },
  { code: 'FR', name: 'Francia', flag: '🇫🇷', ids: ['fr-paris', 'fr-nice', 'fr-lyon', 'fr-marseille', 'fr-annecy', 'fr-mont-saint-michel'] },
  { code: 'IT', name: 'Italia', flag: '🇮🇹', ids: ['it-rome', 'it-venice', 'it-florence', 'it-milan', 'it-naples', 'it-pisa-tuscany'] },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧', ids: ['gb-london', 'gb-edinburgh', 'gb-york', 'gb-liverpool', 'gb-oxford-cotswolds', 'gb-bristol-bath'] },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪', ids: ['de-berlin', 'de-munich', 'de-hamburg', 'de-cologne-bonn', 'de-dresden', 'de-heidelberg-neckar'] },
  { code: 'NL', name: 'Países Bajos', flag: '🇳🇱', ids: ['nl-amsterdam', 'nl-rotterdam-kinderdijk', 'nl-the-hague-scheveningen', 'nl-utrecht', 'nl-haarlem-zaanse-schans', 'nl-giethoorn'] },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪', ids: ['be-brussels', 'be-bruges', 'be-ghent', 'be-antwerp', 'be-dinant-meuse-valley', 'be-belgian-ardennes-durbuy-la-roche'] },
] as const;

/** Countries represented by original editorial cards not yet covered by the 137-profile catalogue. */
const editorialCountryCodes: Readonly<Record<string, string>> = {
  'Estados Unidos': 'US', 'Japón': 'JP', 'Indonesia': 'ID', 'Maldivas': 'MV',
  'Grecia': 'GR', 'Emiratos Árabes Unidos': 'AE', 'Islandia': 'IS',
  'Suiza': 'CH', 'Tailandia': 'TH', 'Egipto': 'EG', 'Australia': 'AU', 'Brasil': 'BR',
};

function sameDestination(a: Destination, b: Destination): boolean {
  if ('id' in a && 'id' in b && typeof a.id === 'string' && a.id === b.id) return true;
  return normalizeDestinationName(a.name) === normalizeDestinationName(b.name);
}

/** Six editorial highlights per catalogued country; no expandable full catalogue on the homepage. */
export function getHomepageCountryGroups(): HomepageCountryGroup[] {
  const groups: HomepageCountryGroup[] = featuredCountrySelections.map(({ code, name, flag, ids }) => {
    const profiles = destinationsByCountry[code] ?? [];
    const cards = ids.map(id => {
      const profile = profiles.find(destination => destination.id === id);
      if (!profile) throw new Error(`Missing curated destination ${id} for ${name}`);
      // Keep original editorial photos, text and buttons for featured cards such as Paris or Barcelona.
      return destinations.find(original => original.country === name && sameDestination(original, profile)) ?? profile;
    });
    return { countryCode: code, fallbackName: name, flag, cards };
  });

  // Keep every other original featured card, even if that country has only one destination.
  for (const item of destinations) {
    if (featuredCountrySelections.some(country => country.name === item.country)) continue;
    const code = editorialCountryCodes[item.country];
    if (!code) throw new Error(`Missing country mapping for editorial destination: ${item.country}`);
    const current = groups.find(group => group.countryCode === code);
    if (current) {
      if (!current.cards.some(card => sameDestination(card, item))) {
        groups[groups.indexOf(current)] = { ...current, cards: [...current.cards, item] };
      }
    } else {
      groups.push({ countryCode: code, fallbackName: item.country, flag: item.emoji ?? '🌍', cards: [item] });
    }
  }
  return groups;
}

export function homeCountryName(group: HomepageCountryGroup, locale: Locale): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region', fallback: 'none' }).of(group.countryCode) ?? group.fallbackName;
  } catch {
    return group.fallbackName;
  }
}
