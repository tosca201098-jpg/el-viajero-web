import type { Locale } from '@/lib/i18n/translations';
import { locales } from '@/lib/i18n/translations';
import { destinationProfiles, normalizeDestinationName } from '@/lib/destinations';
import { getDestinationCountryName, getDestinationText } from '@/lib/destinations/localization';
import { formatMonthName } from '@/lib/destinations/seasonality';
import { queryVoiceCatalog } from '@/lib/voice/catalog';
import {
  BUDGET_WORDS, COMMON_WORDS, COUNTRY_ALIASES, DAY_WORDS, DOCUMENT_WORDS, FIT_WORDS, GREETINGS, HOTEL_WORDS, OUTSIDE_COUNTRY_ALIASES, PRICE_WORDS,
  RELATIVE_MONTH, SEASONS, TIPS_WORDS, TOPICS, UNDECIDED, WEEKEND_MAX_DAYS, WEEKEND_WORDS, WORLD_COUNTRY_CODES,
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
  | { kind: 'destination'; places: { place: ChatPlace; fit?: ChatMonthFit }[]; priceNote: boolean; days?: number }
  /** A country, a period and/or a topic: the destinations of the catalogue that fit, `total` when it is known. */
  | { kind: 'list'; places: ChatPlace[]; total: number | null; country?: string; period?: ChatPeriod; topic?: ChatTopicKey; weekend?: boolean; priceNote: boolean }
  | { kind: 'none'; country?: string; period?: ChatPeriod; topic?: ChatTopicKey; weekend?: boolean; priceNote: boolean }
  /** Money or «cheap»: the chat has no prices; it points to the site's budget search and, when the message has an amount, offers it. */
  | { kind: 'budget'; amount?: number }
  /** Something the site does not have (documents and visas, packing tips, couples/families/little-known places): said clearly, never guessed. */
  | { kind: 'nodata'; reason: 'documents' | 'fit' | 'tips' }
  /** A country that is not in the catalogue (Japan, Thailand, the United States…). */
  | { kind: 'outside'; country: string; priceNote: boolean };

type Index = {
  destinations: { id: string; terms: string[]; accented: string[] }[];
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
    ...TOPICS.flatMap(topic => topic.words), ...PRICE_WORDS, ...GREETINGS, ...COMMON_WORDS]);
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
    // A common word that is also a place («are» / «Åre») still names the place when it is typed with its own accents.
    const accented = new Set<string>();
    for (const value of [profile.name, ...(profile.aliases ?? []), ...locales.map(({ code }) => getDestinationText(profile, code).name)]) {
      const lower = value.toLowerCase().normalize('NFC').trim();
      if (COMMON_WORDS.indexOf(normalizeDestinationName(value)) >= 0 && lower !== normalizeDestinationName(value)) accented.add(lower);
    }
    return { id: profile.id as string, terms: Array.from(terms), accented: Array.from(accented) };
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
function findPlaces(padded: string, accentedText: string): Hit[] {
  index ??= buildIndex();
  const candidates: (Hit & { length: number })[] = [];
  for (const item of index.destinations) {
    // These names only exist with their accents, so they do not overlap with anything else the person wrote.
    for (const term of item.accented) if (accentedText.indexOf(` ${term} `) >= 0) candidates.push({ kind: 'destination', key: item.id, start: 0, end: 0, length: term.length });
  }
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

/** An amount in euros («500 €», «1.500 euros»), as a whole number, or undefined. */
function findAmount(raw: string): number | undefined {
  const match = /(\d{1,3}(?:[.,]\d{3})+|\d+)(?:[.,]\d{1,2})?\s?(?:€|eur\b|euros?\b)/i.exec(raw) ?? /€\s?(\d{1,3}(?:[.,]\d{3})+|\d+)/.exec(raw);
  if (!match) return undefined;
  const amount = Number(match[1].replace(/[.,]/g, ''));
  return Number.isInteger(amount) && amount >= 1 && amount <= 100000 ? amount : undefined;
}

/** «5 días», «3 days»…: the number of days the visitor wants to spend (1–30), or undefined. */
function findDays(padded: string): number | undefined {
  const words = padded.trim().split(' ');
  for (let position = 1; position < words.length; position++) {
    if (!/^\d{1,2}$/.test(words[position - 1]) || DAY_WORDS.indexOf(words[position]) < 0) continue;
    const days = Number(words[position - 1]);
    if (days >= 1 && days <= 30) return days;
  }
  return undefined;
}

type World = { terms: { term: string; code: string }[]; names: Map<string, Record<string, string>> };
let world: World | null | undefined;
/** Countries of the world (ISO list, names from the browser's own tables in the seven languages); built the first time it is needed. */
function buildWorld(): World | null {
  const DisplayNames = (Intl as unknown as { DisplayNames?: new (locales: string[], options: { type: string }) => { of(code: string): string | undefined } }).DisplayNames;
  if (typeof DisplayNames !== 'function') return null;
  index ??= buildIndex();
  const inCatalogue = new Set<string>(index.countries.map(item => item.code));
  const tables = locales.map(({ code }) => ({ code, names: new DisplayNames([code], { type: 'region' }) }));
  const terms: { term: string; code: string }[] = [];
  const names = new Map<string, Record<string, string>>();
  for (const code of WORLD_COUNTRY_CODES) {
    if (inCatalogue.has(code)) continue;
    const perLocale: Record<string, string> = {};
    const values: string[] = [...(OUTSIDE_COUNTRY_ALIASES[code] ?? [])];
    for (const table of tables) {
      let name: string | undefined;
      try { name = table.names.of(code); } catch { name = undefined; }
      if (!name || name === code) continue;
      perLocale[table.code] = name.replace(/\s*\(.*\)\s*$/, '');
      values.push(name, name.replace(/\s*\(.*\)\s*$/, ''));
      const inside = /\(([^)]+)\)/.exec(name);
      if (inside) values.push(inside[1]);
    }
    names.set(code, perLocale);
    const seen = new Set<string>();
    for (const value of values) {
      const term = normalizeDestinationName(value);
      if (term.length < 4 || reservedWords().has(term) || seen.has(term)) continue;
      seen.add(term);
      terms.push({ term, code });
    }
  }
  return { terms, names };
}

let reserved: Set<string> | null = null;
function reservedWords(): Set<string> {
  if (!reserved) {
    index ??= buildIndex();
    reserved = new Set<string>([...Array.from(index.months.keys()), ...Object.values(SEASONS).flatMap(season => season.words),
      ...TOPICS.flatMap(topic => topic.words), ...PRICE_WORDS, ...GREETINGS, ...COMMON_WORDS]);
  }
  return reserved;
}

/** A country of the world that is not in the catalogue, named in the message (the longest name wins), or undefined. */
function findOutsideCountry(padded: string, locale: Locale): string | undefined {
  if (world === undefined) world = buildWorld();
  if (!world) return undefined;
  let best: { term: string; code: string } | undefined;
  for (const item of world.terms) {
    if (padded.indexOf(' ' + item.term + ' ') >= 0 && (!best || item.term.length > best.term.length)) best = item;
  }
  if (!best) return undefined;
  const names = world.names.get(best.code) ?? {};
  return names[locale] ?? names.en ?? Object.values(names)[0];
}

type Shown = ChatPlace & { busyInRequestedMonth?: boolean };
function catalog(locale: Locale, options: { month?: number; topic?: string; country?: string; id?: string; maxStayDays?: number }): { places: Shown[]; total: number } | null {
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
function forMonths(locale: Locale, months: number[], topic: string | undefined, country: string | undefined, maxStayDays: number | undefined) {
  if (months.length <= 1) {
    const single = catalog(locale, { month: months[0], topic, country, maxStayDays });
    return single && { places: single.places.map(plain), total: single.total as number | null };
  }
  const merged = new Map<string, { place: ChatPlace; hits: number; order: number }>();
  let order = 0;
  for (const month of months) {
    const part = catalog(locale, { month, topic, country, maxStayDays });
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
  const amount = findAmount(raw);
  const priceNote = PRICE_WORDS.some(has) || /[€$£]|\d\s?(eur|euros?)\b/i.test(raw);
  // Documents, visas and vaccines change with the person's nationality: never answered, not even next to a destination name.
  if (DOCUMENT_WORDS.some(has)) return { kind: 'nodata', reason: 'documents' };

  const accentedText = ` ${raw.toLowerCase().normalize('NFC').replace(/[.,;:!?¿¡()"'«»\-–—]+/g, ' ')} `;
  const hits = findPlaces(padded, accentedText);
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
    const days = places.length === 1 ? findDays(padded) : undefined;
    if (places.length) return { kind: 'destination', places, priceNote, ...(days ? { days } : {}) };
  }

  // What the destination pages do not say (couples, families, little-known places) and packing tips: said, not guessed.
  if (FIT_WORDS.some(has)) return { kind: 'nodata', reason: 'fit' };
  if (TIPS_WORDS.some(has)) return { kind: 'nodata', reason: 'tips' };

  // A country that is not in the catalogue (Japan, Thailand…): the chat says so instead of «I did not understand».
  if (!country) {
    const outside = findOutsideCountry(padded, locale);
    if (outside) return { kind: 'outside', country: outside, priceNote };
  }

  const weekend = WEEKEND_WORDS.some(has);
  if (country || months.length || topic || weekend) {
    const found = forMonths(locale, months, topicWords, country, weekend ? WEEKEND_MAX_DAYS : undefined);
    const scope = { ...(countryName ? { country: countryName } : {}), ...(period ? { period } : {}), ...(topic ? { topic } : {}), ...(weekend ? { weekend } : {}) };
    if (!found || !found.places.length) return { kind: 'none', ...scope, priceNote };
    return { kind: 'list', places: found.places.slice(0, MAX_LIST), total: found.total === null ? null : Math.max(found.total, found.places.length), ...scope, priceNote };
  }

  // Cheap, a budget or an amount: the site's budget search does it (with real prices); the chat has none. A hotel keeps the hotel answer.
  if ((BUDGET_WORDS.some(has) || amount !== undefined) && !HOTEL_WORDS.some(has)) return { kind: 'budget', ...(amount !== undefined ? { amount } : {}) };
  if (UNDECIDED.some(has)) return { kind: 'undecided' };
  if (priceNote) return { kind: 'prices' };
  if (GREETINGS.some(has)) return { kind: 'welcome' };
  return { kind: 'unknown' };
}
