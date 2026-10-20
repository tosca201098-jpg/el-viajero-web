import type { TranslationKey } from '@/lib/i18n/translations';

/** Map public API error codes to messages without rendering provider details. */
export function flightSearchErrorKey(error: unknown, context: 'flights' | 'discover' = 'flights'): TranslationKey {
  switch (error) {
    case 'not_configured': return 'search.flightSearchNotConfigured';
    case 'provider_unavailable': return 'search.flightSearchTemporaryError';
    case 'invalid_search': return context === 'discover' ? 'search.discoverInvalid' : 'search.flightInvalidSearch';
    case 'invalid_dates': return 'search.flightInvalidDates';
    case 'unknown_origin': return 'search.flightUnknownOrigin';
    case 'unknown_destination': return 'search.flightUnknownDestination';
    default: return context === 'discover' ? 'search.discoverError' : 'search.flightSearchError';
  }
}
