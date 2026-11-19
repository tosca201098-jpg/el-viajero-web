import { destinationProfiles, normalizeDestinationName } from '@/lib/destinations';
import { destinations } from '@/lib/destinations/featured';
import { getDestinationText, getDestinationCountryName } from '@/lib/destinations/localization';
import { formatMonthName, formatMonthRanges } from '@/lib/destinations/seasonality';
import type { Locale } from '@/lib/i18n/translations';

const MAX_RESULTS = 12;
/** With this many results or fewer, each entry also carries its four recommendations. */
const DETAIL_THRESHOLD = 5;
const LOCALES: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];

export type VoiceCatalogOptions = {
  /** 1-12, or a month name in any supported language. Keeps only destinations whose best months include it. */
  month?: unknown;
  /** Free words (beach, museums, snow…). Matched against the catalogue's own texts only. */
  topic?: unknown;
  /** Optional exact filters used by the written chat: an ISO country code and/or one destination id. */
  country?: string;
  id?: string;
};

let monthNames: Map<string, number> | null = null;
function monthByName(value: string): number | null {
  if (!monthNames) {
    monthNames = new Map();
    for (let month = 1; month <= 12; month++) {
      for (const locale of LOCALES) monthNames.set(normalizeDestinationName(formatMonthName(month, locale)), month);
    }
  }
  return monthNames.get(normalizeDestinationName(value)) ?? null;
}

/** Returns the month number, null when the caller sent nothing, or false when the value is unusable. */
function parseMonth(value: unknown): number | null | false {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'number') return Number.isInteger(value) && value >= 1 && value <= 12 ? value : false;
  if (typeof value !== 'string' || value.length > 40) return false;
  const text = value.trim();
  if (/^\d{1,2}$/.test(text)) { const month = Number(text); return month >= 1 && month <= 12 ? month : false; }
  return monthByName(text) ?? false;
}

function parseTopic(value: unknown): string[] | null | false {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string' || value.length > 100) return false;
  const words = normalizeDestinationName(value).split(' ').filter(word => word.length >= 3);
  return words.length ? Array.from(new Set(words)).slice(0, 6) : null;
}

type Entry = {
  id: string; name: string; canonicalName: string; country: string; countryCode?: string; description: string;
  search: string; text: string;
  bestMonths?: number[]; lowSeasonMonths?: number[]; highSeasonMonths?: number[];
  recommendedStay?: string; seasonalityNote?: string; recommendations?: string[];
};

function spreadByCountry(items: Entry[], limit: number): Entry[] {
  const perCountry = new Map<string, number>();
  const first: Entry[] = [];
  const rest: Entry[] = [];
  for (const item of items) {
    const used = perCountry.get(item.country) ?? 0;
    if (used < 2 && first.length < limit) { perCountry.set(item.country, used + 1); first.push(item); }
    else rest.push(item);
  }
  return [...first, ...rest].slice(0, limit);
}

/** Only existing catalogue data is returned. No prices or availability are inferred. */
export function queryVoiceCatalog(query: unknown, locale: Locale, options: VoiceCatalogOptions = {}) {
  if (query !== undefined && query !== null && (typeof query !== 'string' || query.length > 100)) {
    return { status: 'error', error: 'invalid_arguments' };
  }
  const month = parseMonth(options.month);
  const topic = parseTopic(options.topic);
  if (month === false || topic === false) return { status: 'error', error: 'invalid_arguments' };
  const term = normalizeDestinationName(typeof query === 'string' ? query : '');

  const profiles: Entry[] = destinationProfiles.map(p => {
    const text = getDestinationText(p, locale);
    const spanish = getDestinationText(p, 'es');
    return { id: p.id, name: text.name, country: getDestinationCountryName(p, locale), countryCode: p.countryCode,
      description: text.description, canonicalName: p.name,
      search: [p.name, p.country, p.countryCode, text.name, ...(p.aliases ?? [])].join(' '),
      text: [text.description, ...text.recommendations, text.seasonalityNote ?? '', text.recommendedStay,
        spanish.description, ...spanish.recommendations].join(' '),
      bestMonths: p.bestMonths, lowSeasonMonths: p.lowSeasonMonths, highSeasonMonths: p.highSeasonMonths,
      recommendedStay: text.recommendedStay, seasonalityNote: text.seasonalityNote,
      recommendations: [...text.recommendations] };
  });
  const extras: Entry[] = destinations.filter(d => !profiles.some(p => p.canonicalName === d.name))
    .map(d => ({ id: d.name, name: d.name, canonicalName: d.name, country: d.country, description: d.description,
      search: `${d.name} ${d.country}`, text: [d.description, ...d.recommendations, d.seasonalityNote ?? ''].join(' '),
      bestMonths: d.bestMonths, lowSeasonMonths: d.lowSeasonMonths, highSeasonMonths: d.highSeasonMonths,
      recommendedStay: d.recommendedStay, seasonalityNote: d.seasonalityNote, recommendations: [...d.recommendations] }));

  let matches = [...profiles, ...extras].filter(p => !term || normalizeDestinationName(p.search).includes(term));

  if (options.id) matches = matches.filter(p => p.id === options.id);
  if (options.country) matches = matches.filter(p => p.countryCode === options.country);

  // A destination is only offered for a month when the catalogue lists it among its best months.
  if (month) matches = matches.filter(p => p.bestMonths?.includes(month));

  const scores = new Map<Entry, number>();
  if (topic) {
    for (const entry of matches) {
      const haystack = normalizeDestinationName(entry.text + ' ' + entry.search);
      const hits = topic.filter(word => haystack.includes(word)).length;
      if (hits) scores.set(entry, hits);
    }
    matches = matches.filter(p => scores.has(p));
  }
  // Month searches put destinations outside their high season first; ties keep the catalogue order.
  if (topic || month) {
    const rank = (p: Entry) => (scores.get(p) ?? 0) * 10 + (month && !p.highSeasonMonths?.includes(month) ? 1 : 0);
    matches = matches.map((p, index) => ({ p, index })).sort((a, b) => rank(b.p) - rank(a.p) || a.index - b.index).map(({ p }) => p);
  }

  // An open recommendation search (no destination named) shows at most two per country first,
  // so the first page is not filled by whichever country comes first in the catalogue.
  const page = !term && (month || topic) ? spreadByCountry(matches, MAX_RESULTS) : matches.slice(0, MAX_RESULTS);
  const detailed = matches.length <= DETAIL_THRESHOLD;
  const shown = page.map(p => ({
    id: p.id, name: p.name, country: p.country, description: p.description, canonicalName: p.canonicalName,
    ...(p.bestMonths?.length ? { bestMonths: formatMonthRanges(p.bestMonths, locale) } : {}),
    ...(p.lowSeasonMonths?.length ? { quietMonths: formatMonthRanges(p.lowSeasonMonths, locale) } : {}),
    ...(p.highSeasonMonths?.length ? { busyMonths: formatMonthRanges(p.highSeasonMonths, locale) } : {}),
    ...(month ? { busyInRequestedMonth: Boolean(p.highSeasonMonths?.includes(month)) } : {}),
    ...(p.recommendedStay ? { recommendedStay: p.recommendedStay } : {}),
    ...(detailed && p.seasonalityNote ? { seasonalityNote: p.seasonalityNote } : {}),
    ...(detailed && p.recommendations?.length ? { recommendations: p.recommendations } : {}),
  }));
  return { status: 'success', total: matches.length, destinations: shown, truncated: matches.length > MAX_RESULTS,
    ...(month || topic ? { filters: { ...(month ? { month: formatMonthName(month, locale) } : {}), ...(topic ? { topic } : {}) } } : {}),
    note: 'Catalogue information only; prices and availability require a real search. '
      + 'A missing match only means the catalogue has no text for it, not that the place lacks it.' };
}
