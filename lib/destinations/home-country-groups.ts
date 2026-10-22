import { destinations, type Destination } from './featured';
import { destinationsByCountry, normalizeDestinationName } from './index';
import type { Locale } from '@/lib/i18n/translations';

export type HomepageCountryGroup = {
  countryCode: string;
  fallbackName: string;
  flag: string;
  cards: readonly Destination[];
};

/** Keep the existing editorial cards unchanged and listed first in their country. */
const mainCountries = [
  ['ES', 'España', '🇪🇸'],
  ['PT', 'Portugal', '🇵🇹'],
  ['FR', 'Francia', '🇫🇷'],
  ['IT', 'Italia', '🇮🇹'],
  ['GB', 'Reino Unido', '🇬🇧'],
  ['DE', 'Alemania', '🇩🇪'],
  ['NL', 'Países Bajos', '🇳🇱'],
  ['BE', 'Bélgica', '🇧🇪'],
] as const;

/** Countries represented by existing editorial cards outside the current canonical catalogue. */
const editorialCountryCodes: Readonly<Record<string, string>> = {
  'Estados Unidos': 'US', 'Japón': 'JP', 'Indonesia': 'ID', 'Maldivas': 'MV',
  'Grecia': 'GR', 'Emiratos Árabes Unidos': 'AE', 'Islandia': 'IS',
  'Suiza': 'CH', 'Tailandia': 'TH', 'Egipto': 'EG', 'Australia': 'AU', 'Brasil': 'BR',
};

function sameDestination(a: Destination, b: Destination): boolean {
  if ('id' in a && 'id' in b && typeof a.id === 'string' && a.id === b.id) return true;
  return normalizeDestinationName(a.name) === normalizeDestinationName(b.name);
}

/** Pure presentation grouping. No new pages, country routes or changes to seasonal cards. */
export function getHomepageCountryGroups(): HomepageCountryGroup[] {
  const groups: HomepageCountryGroup[] = mainCountries.map(([code, label, flag]) => {
    const originals = destinations.filter(item => item.country === label);
    const cards: Destination[] = [...originals];
    for (const profile of destinationsByCountry[code] ?? []) {
      if (!cards.some(item => sameDestination(item, profile))) cards.push(profile);
    }
    return { countryCode: code, fallbackName: label, flag, cards };
  }).filter(group => group.cards.length > 0);

  // Show all 16 original cards, even when their country has no canonical catalogue yet.
  const extras = destinations.filter(item => !mainCountries.some(([, label]) => item.country === label));
  for (const item of extras) {
    const code = editorialCountryCodes[item.country];
    if (!code) throw new Error(`Missing country mapping for editorial destination: ${item.country}`);
    const existing = groups.find(group => group.countryCode === code);
    if (existing) {
      if (!existing.cards.some(card => sameDestination(card, item))) {
        // Existing country groups use mutable arrays only while this list is built.
        groups[groups.indexOf(existing)] = { ...existing, cards: [...existing.cards, item] };
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
