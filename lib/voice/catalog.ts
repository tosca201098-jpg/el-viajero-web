import { destinationProfiles, normalizeDestinationName } from '@/lib/destinations';
import { destinations } from '@/lib/destinations/featured';
import { getDestinationText, getDestinationCountryName } from '@/lib/destinations/localization';
import type { Locale } from '@/lib/i18n/translations';

/** Only existing catalogue data is returned. No prices or availability are inferred. */
export function queryVoiceCatalog(query: unknown, locale: Locale) {
  if (typeof query !== 'string' || query.length > 100) return { status: 'error', error: 'invalid_arguments' };
  const term = normalizeDestinationName(query);
  const profiles = destinationProfiles.map(p => {
    const text = getDestinationText(p, locale);
    return { id: p.id, name: text.name, country: getDestinationCountryName(p, locale),
      description: text.description, canonicalName: p.name,
      search: [p.name, p.country, p.countryCode, text.name, ...(p.aliases ?? [])].join(' ') };
  });
  const extras = destinations.filter(d => !profiles.some(p => p.canonicalName === d.name))
    .map(d => ({ id: d.name, name: d.name, canonicalName: d.name, country: d.country, description: d.description, search: `${d.name} ${d.country}` }));
  const matches = [...profiles, ...extras].filter(p => !term || normalizeDestinationName(p.search).includes(term));
  return { status: 'success', total: matches.length, destinations: matches.slice(0, 12).map(({ search, ...p }) => p),
    truncated: matches.length > 12, note: 'Catalogue information only; prices and availability require a real search.' };
}
