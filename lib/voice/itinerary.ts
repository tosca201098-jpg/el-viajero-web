import type { Locale } from '@/lib/i18n/translations';
import type { Destination } from '@/lib/destinations/featured';
import { isItinerary } from '@/lib/itinerary/schema';
import type { Itinerary } from '@/lib/itinerary/types';

/** `itinerario` is the itinerary Sofía wrote, as a JSON string (see docs/sofia-solo-elevenlabs.md). */
export type VoiceItineraryArguments = { destino: string; dias: number; itinerario?: string };
export type VoiceItineraryResult =
  | { status: 'success'; destination: string; days: number; locale: Locale }
  | { status: 'error'; error: 'invalid_arguments' | 'unknown_destination' | 'generation_failed' | 'busy' | 'unavailable' }
  | { status: 'cancelled' };
export type VoiceItineraryContext = { callId: string; locale: Locale; signal: AbortSignal };

export const MAX_VOICE_ITINERARY_CHARS = 16000;

/** Parses and strictly validates an itinerary written by Sofía. Anything else is rejected, never repaired. */
export function parseVoiceItinerary(raw: unknown, days: number): Itinerary | null {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > MAX_VOICE_ITINERARY_CHARS) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isItinerary(value, days) ? value : null;
  } catch { return null; }
}

/** A cancellable UI request carrying the itinerary Sofía wrote; the planner only displays it. */
export function createVoiceItineraryRequest(destination: Destination, days: number, itinerary: Itinerary, context: VoiceItineraryContext) {
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
