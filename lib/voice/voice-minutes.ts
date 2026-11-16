import { madridVoicePeriod, madridVoiceWeek, type VoicePeriod } from '@/lib/ai/voice-daily-policy';
import type { PreviewDiagnosticCode } from '@/lib/ai/preview-diagnostic';

/**
 * Voice minutes. Each registered account has a free-form balance of minutes for a natural Madrid period (by default
 * 6 minutes for the calendar month: talk 2 minutes in one conversation and the other 4 stay for later in the same month), and the whole
 * site has a shared WEEKLY budget that protects the ElevenLabs plan. The minutes are NOT estimated here: they are the
 * real conversation durations that ElevenLabs reports for this agent, summed for the account (by the anonymous
 * `user_id` the browser passes when it starts the conversation) and for the whole agent.
 *
 * Fail closed: if the provider cannot be read or answers something unexpected, nobody gets a token.
 */
export const VOICE_CONVERSATION_MAX_SECONDS = 900;
/** Less than this is not a useful conversation, so it counts as "no minutes left". */
export const VOICE_MIN_USEFUL_SECONDS = 30;
const DEFAULT_USER_MINUTES = 6;
const USER_MINUTES_CEILING = 300;
const DEFAULT_PERIOD: VoicePeriod = 'month';
const DEFAULT_SITE_MINUTES = 15;
const SITE_MINUTES_CEILING = 1000;
const PAGE_SIZE = 100;
const MAX_PAGES = 5;
const LIVE_GRACE_SECONDS = 120;

export class BudgetError extends Error {
  constructor(readonly code: PreviewDiagnosticCode) { super('voice_budget'); }
}

export type VoiceLimits = { period: VoicePeriod; userSeconds: number; siteSeconds: number };
export type VoiceUsage = { seconds: number; overflow: boolean };
export type VoiceBudget =
  | { ok: true; sessionSeconds: number; remainingSeconds: number; limitSeconds: number; period: VoicePeriod; resetsAt: number }
  | { ok: false; reason: 'user' | 'site'; resetsAt: number };
export type UserPeriod = {
  period: VoicePeriod; limitSeconds: number; usedSeconds: number; remainingSeconds: number; resetsAt: number;
};

function minutes(value: string | undefined, fallback: number, ceiling: number) {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d{0,3}$/.test(value) || Number(value) > ceiling) throw new BudgetError('VOICE_BUDGET_CONFIG');
  return Number(value);
}

function periodSetting(value: string | undefined): VoicePeriod {
  if (value === undefined) return DEFAULT_PERIOD;
  if (value === 'week' || value === 'fortnight' || value === 'month') return value;
  throw new BudgetError('VOICE_BUDGET_CONFIG');
}

/**
 * Defaults: 6 minutes per account for the calendar month, and 15 minutes per WEEK for the whole site. Settings can
 * change the period (week, fortnight or month) and both amounts within a fixed ceiling.
 */
export function voiceLimits(env: Record<string, string | undefined>): VoiceLimits {
  return {
    period: periodSetting(env.AI_VOICE_PERIOD),
    userSeconds: minutes(env.AI_VOICE_USER_MINUTES, DEFAULT_USER_MINUTES, USER_MINUTES_CEILING) * 60,
    siteSeconds: minutes(env.AI_VOICE_GLOBAL_WEEK_MINUTES, DEFAULT_SITE_MINUTES, SITE_MINUTES_CEILING) * 60,
  };
}

async function sumConversations(input: {
  apiKey: string; agentId: string; userRef?: string; since: number; nowSeconds: number; signal: AbortSignal;
}): Promise<VoiceUsage> {
  let seconds = 0;
  let cursor = '';
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL('https://api.elevenlabs.io/v1/convai/conversations');
    url.searchParams.set('agent_id', input.agentId);
    url.searchParams.set('call_start_after_unix', String(input.since));
    url.searchParams.set('page_size', String(PAGE_SIZE));
    if (input.userRef) url.searchParams.set('user_id', input.userRef);
    if (cursor) url.searchParams.set('cursor', cursor);
    let response: Response;
    try {
      response = await fetch(url, { headers: { 'xi-api-key': input.apiKey }, signal: input.signal, cache: 'no-store' });
    } catch { throw new BudgetError(input.signal.aborted ? 'VOICE_BUDGET_TIMEOUT' : 'VOICE_BUDGET_NETWORK'); }
    if (!response.ok) throw new BudgetError(response.status === 401 || response.status === 403 ? 'VOICE_BUDGET_CREDENTIALS' : 'VOICE_BUDGET_HTTP');
    let data: unknown;
    try { data = await response.json(); } catch { throw new BudgetError('VOICE_BUDGET_MALFORMED'); }
    if (!data || typeof data !== 'object' || !('conversations' in data) || !Array.isArray(data.conversations) ||
        data.conversations.length > PAGE_SIZE) throw new BudgetError('VOICE_BUDGET_MALFORMED');
    for (const item of data.conversations as unknown[]) {
      if (!item || typeof item !== 'object') throw new BudgetError('VOICE_BUDGET_MALFORMED');
      const row = item as Record<string, unknown>;
      const start = row.start_time_unix_secs;
      const duration = row.call_duration_secs ?? 0;
      if (typeof start !== 'number' || !Number.isInteger(start) || start < 0 ||
          typeof duration !== 'number' || !Number.isInteger(duration) || duration < 0 || duration > 86400) {
        throw new BudgetError('VOICE_BUDGET_MALFORMED');
      }
      // Defensive: if the provider includes the person on each row, a row of someone else is never counted.
      if (input.userRef && typeof row.user_id === 'string' && row.user_id !== input.userRef) continue;
      let used = duration;
      const age = input.nowSeconds - start;
      // A conversation still running counts the time it has lasted so far (it can never exceed the agent maximum).
      if (row.status === 'in-progress' && age <= VOICE_CONVERSATION_MAX_SECONDS + LIVE_GRACE_SECONDS) {
        used = Math.max(duration, Math.min(Math.max(0, age), VOICE_CONVERSATION_MAX_SECONDS));
      }
      seconds += used;
    }
    if ((data as { has_more?: unknown }).has_more !== true) return { seconds, overflow: false };
    const next = (data as { next_cursor?: unknown }).next_cursor;
    if (typeof next !== 'string' || !next || next.length > 2048) throw new BudgetError('VOICE_BUDGET_MALFORMED');
    cursor = next;
  }
  // Hundreds of conversations in one period is abnormal: treat the budget as spent rather than guess.
  return { seconds, overflow: true };
}

type Input = {
  env: Record<string, string | undefined>; apiKey: string; agentId: string; userRef: string; now: number;
};

/** The account's own period, for the status bar in "Mi cuenta". Never touches the site-wide total. */
export async function userPeriod(input: Input): Promise<UserPeriod> {
  const limits = voiceLimits(input.env);
  const period = madridVoicePeriod(input.now, limits.period);
  const user = await sumConversations({ apiKey: input.apiKey, agentId: input.agentId, userRef: input.userRef,
    since: period.startsAt, nowSeconds: Math.floor(input.now / 1000), signal: AbortSignal.timeout(8000) });
  const usedSeconds = user.overflow ? limits.userSeconds : Math.min(user.seconds, limits.userSeconds);
  return { period: limits.period, limitSeconds: limits.userSeconds, usedSeconds,
    remainingSeconds: limits.userSeconds - usedSeconds, resetsAt: period.endsAt };
}

/**
 * Decide whether this account may start a conversation now, and for how many seconds at most. The account is counted
 * over its own period (month by default); the whole site is always counted over the Madrid WEEK.
 */
export async function checkVoiceBudget(input: Input): Promise<VoiceBudget> {
  const limits = voiceLimits(input.env);
  const period = madridVoicePeriod(input.now, limits.period);
  const week = madridVoiceWeek(input.now);
  const signal = AbortSignal.timeout(8000);
  const base = { apiKey: input.apiKey, agentId: input.agentId, nowSeconds: Math.floor(input.now / 1000), signal };
  const [user, site] = await Promise.all([
    sumConversations({ ...base, userRef: input.userRef, since: period.startsAt }),
    sumConversations({ ...base, since: week.startsAt }),
  ]);
  const userLeft = user.overflow ? 0 : limits.userSeconds - user.seconds;
  const siteLeft = site.overflow ? 0 : limits.siteSeconds - site.seconds;
  if (userLeft < VOICE_MIN_USEFUL_SECONDS) return { ok: false, reason: 'user', resetsAt: period.endsAt };
  if (siteLeft < VOICE_MIN_USEFUL_SECONDS) return { ok: false, reason: 'site', resetsAt: week.endsAt };
  return { ok: true, sessionSeconds: Math.min(userLeft, siteLeft, VOICE_CONVERSATION_MAX_SECONDS),
    remainingSeconds: userLeft, limitSeconds: limits.userSeconds, period: limits.period, resetsAt: period.endsAt };
}
