import type { Locale } from '@/lib/i18n/translations';
import { locales } from '@/lib/i18n/translations';
import { destinationProfiles, normalizeDestinationName } from '@/lib/destinations';
import { getDestinationCountryName, getDestinationText } from '@/lib/destinations/localization';
import { formatMonthName } from '@/lib/destinations/seasonality';
import { queryVoiceCatalog } from '@/lib/voice/catalog';
import {
  COUNTRY_ALIASES, GREETINGS, PRICE_WORDS, RELATIVE_MONTH, SEASONS, TOPICS, UNDECIDED,
  type ChatSeasonKey, type ChatTopicKey,
} from './vocabulary';

export type { ChatSeasonKey, ChatTopicKey } from './vocabulary';
export const MAX_CHAT_INPUT = 300;
const MAX_LIST = 6;

/** Catalogue data of one destination, already in the visitor's language. Nothing here is a price or an availability. */
export type ChatPlace = {
  id: string; name: string; country: string; description: string;
  bestMonths?: string; quietMonths?: string; busyMonths?: string; recommendedStay?: string; seasonalityNote?: string;
  recommendations?: string[];
};
/** How a requested month sits in the catalogue's own seasons for one destination. */
export type ChatMonthFit = { month: string; best: boolean; busy: boolean };
export type ChatPeriod = { months: string[]; season?: ChatSeasonKey };
export type ChatReply =
  | { kind: 'welcome' | 'unknown' | 'tooLong' | 'prices' }
  /** The visitor does not know where to go: the chat asks what they feel like and points to the site's «I don't know where to go» search. */
  | { kind: 'undecided' }
  /** The visitor named one to three destinations. */
  | { kind: 'destination'; places: { place: ChatPlace; fit?: ChatMonthFit }[]; priceNote: boolean }
  /** A country, a period and/or a topic: the destinations of the catalogue that fit, `total` when it is known. */
  | { kind: 'list'; places: ChatPlace[]; total: number | null; country?: string; period?: ChatPeriod; topic?: ChatTopicKey; priceNote: boolean }
  | { kind: 'none'; country?: string; period?: ChatPeriod; topic?: ChatTopicKey; priceNote: boolean };

type Index = {
  destinations: { id: string; terms: string[] }[];
  countries: { code: string; terms: string[]; name: Record<Locale, string> }[];
  months: Map<string, number>;
};
let index: Index | null = null;

function buildIndex(): Index {
  const months = new Map<string, number>();
  for (let month = 1; month <= 12; month++) {
    for (const { code } of locales) months.set(normalizeDestinationName(formatMonthName(month, code)), month);
  }
  // A place name that is also a month, season, topic, price or greeting word (the Irish county «Mayo») is read as that word.
  const reserved = new Set<string>([...Array.from(months.keys()), ...Object.values(SEASONS).flatMap(season => season.words),
    ...TOPICS.flatMap(topic => topic.words), ...PRICE_WORDS, ...GREETINGS]);
  const usable = (value: string) => {
    const term = normalizeDestinationName(value);
    return term.length >= 3 && !reserved.has(term) ? term : null;
  };
  const destinations = destinationProfiles.map(profile => {
    const terms = new Set<string>();
    for (const value of [profile.name, ...(profile.aliases ?? []), ...locales.map(({ code }) => getDestinationText(profile, code).name)]) {
      const term = usable(value);
      if (term) terms.add(term);
    }
    return { id: profile.id as string, terms: Array.from(terms) };
  });
  const byCode = new Map<string, { code: string; terms: Set<string>; name: Record<Locale, string> }>();
  for (const profile of destinationProfiles) {
    const code = profile.countryCode.toUpperCase();
    if (byCode.has(code)) continue;
    const name = Object.fromEntries(locales.map(({ code: locale }) => [locale, getDestinationCountryName(profile, locale)])) as Record<Locale, string>;
    const terms = new Set<string>();
    for (const value of [profile.country, ...Object.values(name), ...(COUNTRY_ALIASES[code] ?? [])]) {
      const term = usable(value);
      if (term) terms.add(term);
    }
    byCode.set(code, { code, terms, name });
  }
  return { destinations, countries: Array.from(byCode.values()).map(item => ({ ...item, terms: Array.from(item.terms) })), months };
}

type Hit = { kind: 'destination' | 'country'; key: string; start: number; end: number };

/** Whole-word matches of destination and country names; the longest name wins and names never overlap. */
function findPlaces(padded: string): Hit[] {
  index ??= buildIndex();
  const candidates: (Hit & { length: number })[] = [];
  const scan = (kind: Hit['kind'], key: string, terms: string[]) => {
    for (const term of terms) {
      const start = padded.indexOf(` ${term} `);
      if (start >= 0) candidates.push({ kind, key, start, end: start + term.length + 2, length: term.length });
    }
  };
  for (const item of index.destinations) scan('destination', item.id, item.terms);
  for (const item of index.countries) scan('country', item.code, item.terms);
  candidates.sort((a, b) => b.length - a.length || (a.kind === 'destination' ? -1 : 1));
  const accepted: Hit[] = [];
  for (const candidate of candidates) {
    if (accepted.some(hit => candidate.start < hit.end - 1 && candidate.end - 1 > hit.start)) continue;
    if (accepted.some(hit => hit.kind === candidate.kind && hit.key === candidate.key)) continue;
    accepted.push(candidate);
  }
  return accepted.sort((a, b) => a.start - b.start);
}

function findMonths(padded: string, now: Date): number[] {
  index ??= buildIndex();
  const found = new Set<number>();
  const has = (phrase: string) => padded.includes(` ${phrase} `);
  if (RELATIVE_MONTH.current.some(has)) found.add(now.getMonth() + 1);
  if (RELATIVE_MONTH.next.some(has)) found.add((now.getMonth() + 1) % 12 + 1);
  const words = padded.trim().split(' ');
  words.forEach((word, position) => {
    const month = index!.months.get(word);
    if (!month) return;
    // «may» is also an English verb: only read it as the month after a preposition.
    if (word === 'may' && !['in', 'during', 'for', 'of', 'from', 'to', 'until', 'by', 'and', 'or'].includes(words[position - 1] ?? '')) return;
    found.add(month);
  });
  return Array.from(found).slice(0, 4);
}

function findSeason(padded: string): ChatSeasonKey | undefined {
  return (Object.keys(SEASONS) as ChatSeasonKey[]).find(key => SEASONS[key].words.some(word => padded.includes(` ${word} `)));
}

function findTopic(padded: string): ChatTopicKey | undefined {
  return TOPICS.find(topic => topic.words.some(word => padded.includes(` ${word} `)))?.key;
}

type Shown = ChatPlace & { busyInRequestedMonth?: boolean };
function catalog(locale: Locale, options: { month?: number; topic?: string; country?: string; id?: string }): { places: Shown[]; total: number } | null {
  const result = queryVoiceCatalog('', locale, options);
  if (result.status !== 'success' || !('destinations' in result) || !Array.isArray(result.destinations)) return null;
  return { places: result.destinations as Shown[], total: Number(result.total) };
}

function plain(place: Shown): ChatPlace {
  const { busyInRequestedMonth: _unused, ...rest } = place;
  void _unused;
  return rest;
}

/** Destinations for several months (a season or «between May and June»): the ones that fit most of them come first. */
function forMonths(locale: Locale, months: number[], topic: string | undefined, country: string | undefined) {
  if (months.length <= 1) {
    const single = catalog(locale, { month: months[0], topic, country });
    return single && { places: single.places.map(plain), total: single.total as number | null };
  }
  const merged = new Map<string, { place: ChatPlace; hits: number; order: number }>();
  let order = 0;
  for (const month of months) {
    const part = catalog(locale, { month, topic, country });
    if (!part) continue;
    for (const place of part.places) {
      const known = merged.get(place.id);
      if (known) known.hits++;
      else merged.set(place.id, { place: plain(place), hits: 1, order: order++ });
    }
  }
  const places = Array.from(merged.values()).sort((a, b) => b.hits - a.hits || a.order - b.order).map(item => item.place);
  return { places, total: null as number | null };
}

/**
 * Answers one visitor message using only the site's own catalogue (destinations, countries, best months, topics).
 * It never invents a price, a flight or a hotel: those words only add the «use the search» note.
 */
export function answerChat(input: string, locale: Locale, now: Date = new Date()): ChatReply {
  const raw = typeof input === 'string' ? input.trim() : '';
  if (!raw) return { kind: 'welcome' };
  if (raw.length > MAX_CHAT_INPUT) return { kind: 'tooLong' };
  const padded = ` ${normalizeDestinationName(raw)} `;
  const has = (phrase: string) => padded.includes(` ${phrase} `);
  const priceNote = PRICE_WORDS.some(has) || /[€$£]|\d\s?(eur|euros?)\b/i.test(raw);

  const hits = findPlaces(padded);
  const destinationIds = hits.filter(hit => hit.kind === 'destination').map(hit => hit.key).slice(0, 3);
  const country = hits.find(hit => hit.kind === 'country')?.key;
  const explicitMonths = findMonths(padded, now);
  const season = explicitMonths.length ? undefined : findSeason(padded);
  const months = explicitMonths.length ? explicitMonths : season ? SEASONS[season].months : [];
  const topic = findTopic(padded);
  const topicWords = topic ? TOPICS.find(item => item.key === topic)!.catalog.join(' ') : undefined;
  const period: ChatPeriod | undefined = months.length
    ? { months: months.map(month => formatMonthName(month, locale)), ...(season ? { season } : {}) } : undefined;
  const countryName = country ? index?.countries.find(item => item.code === country)?.name[locale] : undefined;

  if (destinationIds.length) {
    const places: { place: ChatPlace; fit?: ChatMonthFit }[] = [];
    for (const id of destinationIds) {
      const found = catalog(locale, { id });
      if (!found?.places[0]) continue;
      const place = plain(found.places[0]);
      let fit: ChatMonthFit | undefined;
      if (months.length === 1) {
        const inMonth = catalog(locale, { id, month: months[0] });
        fit = { month: formatMonthName(months[0], locale), best: Boolean(inMonth?.places.length), busy: Boolean(inMonth?.places[0]?.busyInRequestedMonth) };
      }
      places.push({ place, ...(fit ? { fit } : {}) });
    }
    if (places.length) return { kind: 'destination', places, priceNote };
  }

  if (country || months.length || topic) {
    const found = forMonths(locale, months, topicWords, country);
    const scope = { ...(countryName ? { country: countryName } : {}), ...(period ? { period } : {}), ...(topic ? { topic } : {}) };
    if (!found || !found.places.length) return { kind: 'none', ...scope, priceNote };
    return { kind: 'list', places: found.places.slice(0, MAX_LIST), total: found.total === null ? null : Math.max(found.total, found.places.length), ...scope, priceNote };
  }

  if (UNDECIDED.some(has)) return { kind: 'undecided' };
  if (priceNote) return { kind: 'prices' };
  if (GREETINGS.some(has)) return { kind: 'welcome' };
  return { kind: 'unknown' };
}
