import type { Locale } from '@/lib/i18n/translations';
import type { Destination } from '@/lib/destinations/featured';
import { isItinerary } from '@/lib/itinerary/schema';
import type { Itinerary } from '@/lib/itinerary/types';

/** `itinerario` (optional) is an itinerary Sofía wrote, as a JSON string. Without it, the page asks the server (Claude Haiku). */
export type VoiceItineraryArguments = { destino: string; dias: number; itinerario?: string };
/** Why the personalised AI itinerary does not exist when only the free basic guide could be shown. */
export type BasicGuideReason = 'limited' | 'unavailable';
export type VoiceItineraryResult =
  | { status: 'success'; destination: string; days: number; locale: Locale }
  // The free basic guide is on screen, but it is NOT the AI itinerary Sofía asked for: `note` tells her exactly what it is.
  | { status: 'success'; kind: 'basic_guide'; ai_itinerary: BasicGuideReason; destination: string; days: number; locale: Locale; note: string }
  | { status: 'error'; error: 'invalid_arguments' | 'unknown_destination' | 'generation_failed' | 'busy' | 'unavailable' | 'limited' }
  | { status: 'cancelled' };
export type VoiceItineraryContext = { callId: string; locale: Locale; signal: AbortSignal };

export const MAX_VOICE_ITINERARY_CHARS = 16000;

const BASIC_GUIDE_NOTE = 'The free basic guide for this destination is now on the screen. It is a general guide with the destination\'s '
  + 'highlights and tips, NOT a personalised day-by-day AI itinerary. Tell the person so, in their language, and invite them to look '
  + 'at the screen. Do not read out, describe or invent activities, times, prices or opening hours: you cannot see its content. ';
const BASIC_GUIDE_REASON: Record<BasicGuideReason, string> = {
  unavailable: 'The personalised AI itinerary is not available right now.',
  limited: 'The person has already used their personalised AI itineraries for today; they can ask again tomorrow.',
};

/** What Sofía hears when the planner could only show the free basic guide (it is on screen, so this is not a failure). */
export function basicGuideResult(reason: BasicGuideReason, destination: string, days: number, locale: Locale): VoiceItineraryResult {
  return { status: 'success', kind: 'basic_guide', ai_itinerary: reason, destination, days, locale, note: BASIC_GUIDE_NOTE + BASIC_GUIDE_REASON[reason] };
}

/** Parses and strictly validates an itinerary written by Sofía. Anything else is rejected, never repaired. */
export function parseVoiceItinerary(raw: unknown, days: number): Itinerary | null {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > MAX_VOICE_ITINERARY_CHARS) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isItinerary(value, days) ? value : null;
  } catch { return null; }
}

/**
 * A cancellable UI request. With `itinerary` (written by Sofía) the planner only displays it; with `null` the planner
 * asks `/api/itinerary` for it (Claude Haiku, registered visitors) and reports the real outcome to Sofía.
 */
export function createVoiceItineraryRequest(destination: Destination, days: number, itinerary: Itinerary | null, context: VoiceItineraryContext) {
  const controller = new AbortController();
  let settled = false;
  let resolve!: (result: VoiceItineraryResult) => void;
  const promise = new Promise<VoiceItineraryResult>(done => { resolve = done; });
  const complete = (result: VoiceItineraryResult) => {
    if (settled) return;
    settled = true;
    context.signal.removeEventListener('abort', cancel);
    resolve(result);
  };
  const cancel = () => {
    if (settled) return;
    controller.abort();
    complete({ status: 'cancelled' });
  };
  context.signal.addEventListener('abort', cancel, { once: true });
  if (context.signal.aborted) cancel();
  return { destination, days, itinerary, locale: context.locale, callId: context.callId, get settled() { return settled; },
    signal: controller.signal, promise, complete, cancel };
}
export type VoiceItineraryRequest = ReturnType<typeof createVoiceItineraryRequest>;
