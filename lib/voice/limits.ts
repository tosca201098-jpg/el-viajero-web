/**
 * How many conversations the Sofía agent may hold at the same time. The owner's ElevenLabs plan allows up to 6, and the
 * web accepts an agent configured anywhere from 1 to 6 (it never accepts a higher number, bursting or a waiting queue).
 * The voice-minutes budget reserves the time of every conversation still running, so more conversations at once never
 * means more minutes than the account's and the site's allowance.
 */
export const SOFIA_MAX_CONCURRENT_CONVERSATIONS = 6;

export function validConcurrencyLimit(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= SOFIA_MAX_CONCURRENT_CONVERSATIONS;
}
