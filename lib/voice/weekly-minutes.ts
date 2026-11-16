import { madridVoiceWeek } from '@/lib/ai/voice-daily-policy';
import type { PreviewDiagnosticCode } from '@/lib/ai/preview-diagnostic';

/**
 * Weekly voice minutes. Each registered account has a budget of minutes per natural Madrid week (Monday 00:00 to the
 * next Monday 00:00), and the whole site has a shared weekly budget. The minutes are NOT estimated here: they are the
 * real conversation durations that ElevenLabs reports for this agent, summed for the account (by the anonymous
 * `user_id` the browser passes when it starts the conversation) and for the whole agent.
 *
 * Fail closed: if the provider cannot be read or answers something unexpected, nobody gets a token.
 */
export const VOICE_CONVERSATION_MAX_SECONDS = 900;
/** Less than this is not a useful conversation, so it counts as "no minutes left". */
export const VOICE_MIN_USEFUL_SECONDS = 30;
const DEFAULT_USER_MINUTES = 10;
const USER_MINUTES_CEILING = 60;
const DEFAULT_SITE_MINUTES = 15;
const SITE_MINUTES_CEILING = 1000;
const PAGE_SIZE = 100;
const MAX_PAGES = 5;
const LIVE_GRACE_SECONDS = 120;

export class BudgetError extends Error {
  constructor(readonly code: PreviewDiagnosticCode) { super('voice_budget'); }
}

export type WeeklyLimits = { userSeconds: number; siteSeconds: number };
export type WeeklyUsage = { seconds: number; overflow: boolean };
export type WeeklyBudget =
  | { ok: true; sessionSeconds: number; weekSeconds: number; limitSeconds: number; resetsAt: number }
  | { ok: false; reason: 'user' | 'site'; resetsAt: number };
export type UserWeek = { limitSeconds: number; usedSeconds: number; remainingSeconds: number; resetsAt: number };

function minutes(value: string | undefined, fallback: number, ceiling: number) {
  if (value === undefined) return fallback;
  if (!/^[1-9]\d{0,3}$/.test(value) || Number(value) > ceiling) throw new BudgetError('VOICE_BUDGET_CONFIG');
  return Number(value);
}

/** Defaults: 10 minutes per account and 15 for the whole site. Settings can change both within a fixed ceiling. */
export function weeklyLimits(env: Record<string, string | undefined>): WeeklyLimits {
  return {
    userSeconds: minutes(env.AI_VOICE_USER_WEEK_MINUTES, DEFAULT_USER_MINUTES, USER_MINUTES_CEILING) * 60,
    siteSeconds: minutes(env.AI_VOICE_GLOBAL_WEEK_MINUTES, DEFAULT_SITE_MINUTES, SITE_MINUTES_CEILING) * 60,
  };
}

async function sumWeek(input: {
  apiKey: string; agentId: string; userRef?: string; weekStart: number; nowSeconds: number; signal: AbortSignal;
}): Promise<WeeklyUsage> {
  let seconds = 0;
  let cursor = '';
  for (let page = 0; page < MAX_PAGES; page++) {
    const url = new URL('https://api.elevenlabs.io/v1/convai/conversations');
    url.searchParams.set('agent_id', input.agentId);
    url.searchParams.set('call_start_after_unix', String(input.weekStart));
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
  // Hundreds of conversations in one week is abnormal: treat the budget as spent rather than guess.
  return { seconds, overflow: true };
}

type Input = {
  env: Record<string, string | undefined>; apiKey: string; agentId: string; userRef: string; now: number;
};

/** The account's own week, for the status bar in "Mi cuenta". Never touches the site-wide total. */
export async function userWeek(input: Input): Promise<UserWeek> {
  const limits = weeklyLimits(input.env);
  const week = madridVoiceWeek(input.now);
  const user = await sumWeek({ apiKey: input.apiKey, agentId: input.agentId, userRef: input.userRef,
    weekStart: week.startsAt, nowSeconds: Math.floor(input.now / 1000), signal: AbortSignal.timeout(8000) });
  const usedSeconds = user.overflow ? limits.userSeconds : Math.min(user.seconds, limits.userSeconds);
  return { limitSeconds: limits.userSeconds, usedSeconds, remainingSeconds: limits.userSeconds - usedSeconds, resetsAt: week.endsAt };
}

/** Decide whether this account may start a conversation now, and for how many seconds at most. */
export async function checkWeeklyBudget(input: Input): Promise<WeeklyBudget> {
  const limits = weeklyLimits(input.env);
  const week = madridVoiceWeek(input.now);
  const signal = AbortSignal.timeout(8000);
  const base = { apiKey: input.apiKey, agentId: input.agentId, weekStart: week.startsAt, nowSeconds: Math.floor(input.now / 1000), signal };
  const [user, site] = await Promise.all([sumWeek({ ...base, userRef: input.userRef }), sumWeek(base)]);
  const userLeft = user.overflow ? 0 : limits.userSeconds - user.seconds;
  const siteLeft = site.overflow ? 0 : limits.siteSeconds - site.seconds;
  if (userLeft < VOICE_MIN_USEFUL_SECONDS) return { ok: false, reason: 'user', resetsAt: week.endsAt };
  if (siteLeft < VOICE_MIN_USEFUL_SECONDS) return { ok: false, reason: 'site', resetsAt: week.endsAt };
  return { ok: true, sessionSeconds: Math.min(userLeft, siteLeft, VOICE_CONVERSATION_MAX_SECONDS),
    weekSeconds: userLeft, limitSeconds: limits.userSeconds, resetsAt: week.endsAt };
}
