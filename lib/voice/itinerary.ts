import type { Locale } from '@/lib/i18n/translations';
import type { Destination } from '@/lib/destinations/featured';

export type VoiceItineraryArguments = { destino: string; dias: number };
export type VoiceItineraryResult =
  | { status: 'success'; destination: string; days: number; locale: Locale }
  | { status: 'error'; error: 'invalid_arguments' | 'unknown_destination' | 'generation_failed' | 'busy' | 'unavailable' }
  | { status: 'cancelled' };
export type VoiceItineraryContext = { callId: string; locale: Locale; signal: AbortSignal };

/** A cancellable UI request; generation remains entirely in ItineraryPlanner.generate(). */
export function createVoiceItineraryRequest(destination: Destination, days: number, context: VoiceItineraryContext) {
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
  return { destination, days, locale: context.locale, callId: context.callId, get settled() { return settled; },
    signal: controller.signal, promise, complete, cancel };
}
export type VoiceItineraryRequest = ReturnType<typeof createVoiceItineraryRequest>;
