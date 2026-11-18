import type { Locale } from '@/lib/i18n/translations';
import type { Destination } from '@/lib/destinations/featured';

export type VoiceItineraryArguments = { destino: string; dias: number };
export type VoiceItineraryResult =
  | { status: 'success'; destination: string; days: number; locale: Locale }
  | { status: 'error'; error: 'invalid_arguments' | 'unknown_destination' | 'generation_failed' | 'busy' | 'unavailable' }
  | { status: 'cancelled' };
export type VoiceItineraryContext = { callId: string; locale: Locale; signal: AbortSignal };

export function parseVoiceItineraryCalls(value: unknown): { callId: string; args: VoiceItineraryArguments | null; responseId?: string }[] {
  if (typeof value !== 'string' || value.length > 64_000) return [];
  try {
    const event = JSON.parse(value);
    const items = event?.type === 'response.function_call_arguments.done' ? [event]
      : event?.type === 'response.output_item.done' ? [event.item]
      : event?.type === 'response.done' && event.response?.status === 'completed' ? event.response.output : [];
    if (!Array.isArray(items)) return [];
    return items.flatMap(item => {
      if (item?.name !== 'crear_itinerario' || typeof item.call_id !== 'string' ||
          !item.call_id.trim() || item.call_id.length > 128) return [];
      if (event.type !== 'response.function_call_arguments.done' &&
          (item.type !== 'function_call' || item.status !== 'completed')) return [];
      let args = null;
      try {
        const data = typeof item.arguments === 'string' ? JSON.parse(item.arguments) : null;
        if (data && typeof data.destino === 'string' && data.destino.trim() && data.destino.length <= 100 &&
            Number.isInteger(data.dias) && data.dias >= 1 && data.dias <= 7) {
          args = { destino: data.destino.trim(), dias: data.dias };
        }
      } catch { /* Report invalid arguments to the caller without executing them. */ }
      return [{ callId: item.call_id, args,
        ...(event.type !== 'response.done' && typeof event.response_id === 'string' ? { responseId: event.response_id } : {}) }];
    });
  } catch { return []; }
}

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
