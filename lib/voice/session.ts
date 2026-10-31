import type { Locale } from '@/lib/i18n/translations';
import type { PartialOptions, VoiceConversation } from '@elevenlabs/client';
import type { VoiceItineraryArguments, VoiceItineraryContext, VoiceItineraryResult } from './itinerary';
import { queryVoiceCatalog } from './catalog';

export type VoicePhase = 'idle' | 'connecting' | 'active';
export type VoiceTurn = 'listening' | 'processing' | 'searching' | 'speaking' | 'cancelled';
export type VoiceError = 'permission' | 'microphone' | 'connection' | 'timeout' | 'limited' | 'unavailable';
export type VoiceSearchResult = { status: 'success' | 'cancelled' } | { status: 'error'; error: string };
export type VoiceSearchArguments = {
  origen: string; destino: string; fecha_ida: string; fecha_vuelta: string; viajeros: number;
  servicio: 'vuelo' | 'hotel' | 'ambos'; presupuesto?: number; tipo_presupuesto?: 'total' | 'por_persona';
};
export function parseVoiceSearchArguments(value: unknown): VoiceSearchArguments | null {
  try {
    const d = typeof value === 'string' ? JSON.parse(value) : value;
    const name = (v: unknown) => typeof v === 'string' && v.trim().length > 0 && v.length <= 100;
    const date = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
    if (!d || !name(d.origen) || !name(d.destino) || !date(d.fecha_ida) || !date(d.fecha_vuelta) ||
      d.fecha_vuelta < d.fecha_ida || !Number.isInteger(d.viajeros) || d.viajeros < 1 || d.viajeros > 9 ||
      !['vuelo', 'hotel', 'ambos'].includes(d.servicio)) return null;
    if (d.presupuesto !== undefined && (typeof d.presupuesto !== 'number' || !Number.isFinite(d.presupuesto) ||
      d.presupuesto <= 0 || !['total', 'por_persona'].includes(d.tipo_presupuesto))) return null;
    return { origen: d.origen.trim(), destino: d.destino.trim(), fecha_ida: d.fecha_ida,
      fecha_vuelta: d.fecha_vuelta, viajeros: d.viajeros, servicio: d.servicio,
      ...(d.presupuesto === undefined ? {} : { presupuesto: d.presupuesto, tipo_presupuesto: d.tipo_presupuesto }) };
  } catch { return null; }
}
type Connection = Pick<VoiceConversation, 'endSession' | 'setMicMuted' | 'setVolume'>;
type VoiceSessionOptions = {
  onPhase: (phase: VoicePhase) => void; onError: (error: VoiceError) => void; onTurn?: (turn: VoiceTurn) => void;
  onSearch: (args: VoiceSearchArguments, context: VoiceItineraryContext) => void | VoiceSearchResult | Promise<VoiceSearchResult>;
  onItinerary?: (args: VoiceItineraryArguments, context: VoiceItineraryContext) => Promise<VoiceItineraryResult>;
  onShowDestination?: (name: string, context: VoiceItineraryContext) => VoiceSearchResult;
  getLocale?: () => Locale; fetcher?: typeof fetch;
  startConversation?: (options: PartialOptions) => Promise<Connection>;
  startupTimeoutMs?: number; sessionTimeoutMs?: number;
};

/** One provider connection. Stop invalidates callbacks, cancels tools and silences late sessions. */
export class VoiceSession {
  private phase: VoicePhase = 'idle';
  private turn: VoiceTurn = 'cancelled';
  private generation = 0;
  private serial = 0;
  private disposed = false;
  private controller: AbortController | null = null;
  private connection: Connection | null = null;
  private starting: Promise<void> | null = null;
  private ending: Promise<void> = Promise.resolve();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private toolPending = false;
  constructor(private options: VoiceSessionOptions) {}
  get status() { return this.phase; }
  get turnStatus() { return this.turn; }
  private current(id: number) { return !this.disposed && this.generation === id && !!this.controller && !this.controller.signal.aborted; }
  private setPhase(phase: VoicePhase) { this.phase = phase; if (!this.disposed) this.options.onPhase(phase); }
  private setTurn(turn: VoiceTurn) {
    this.turn = turn;
    this.connection?.setMicMuted(turn !== 'listening');
    if (!this.disposed) this.options.onTurn?.(turn);
  }
  private fail(id: number, error: VoiceError) {
    if (!this.current(id)) return;
    this.stop(); this.options.onError(error);
  }
  private close(connection: Connection) {
    try { connection.setMicMuted(true); connection.setVolume({ volume: 0 }); } catch { /* already closed */ }
    const ended = Promise.resolve().then(() => connection.endSession()).catch(() => undefined);
    this.ending = Promise.all([this.ending, ended]).then(() => undefined);
  }
  stop() {
    ++this.generation;
    this.controller?.abort(); this.controller = null;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null; this.toolPending = false;
    if (this.connection) { const connection = this.connection; this.connection = null; this.close(connection); }
    this.setTurn('cancelled'); this.setPhase('idle');
  }
  dispose() { this.stop(); this.disposed = true; }
  async start() {
    if (this.disposed || this.phase !== 'idle' || this.starting) return;
    const id = ++this.generation;
    this.controller = new AbortController();
    const signal = this.controller.signal;
    const locale = this.options.getLocale?.() ?? 'es';
    this.setPhase('connecting');
    this.timer = setTimeout(() => this.fail(id, 'timeout'), this.options.startupTimeoutMs ?? 20000);
    const run = async () => {
      try {
        await this.ending;
        if (!this.current(id)) return;
        const response = await (this.options.fetcher ?? fetch)('/api/voice', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locale }), signal,
        });
        if (!this.current(id)) return;
        if (!response.ok) { this.fail(id, response.status === 429 ? 'limited' : response.status === 503 ? 'unavailable' : 'connection'); return; }
        const data = await response.json();
        if (!this.current(id)) return;
        if (typeof data.token !== 'string' || !data.token.trim()) throw Error('invalid_token');
        const callIds = new WeakMap<object, string>();
        const completed = new Map<string, Promise<string>>();
        const tool = async (name: string, parameters: unknown): Promise<string> => {
          if (!this.current(id)) return JSON.stringify({ status: 'cancelled' });
          if (this.toolPending) return JSON.stringify({ status: 'error', error: 'busy' });
          this.toolPending = true; this.setTurn('searching');
          const context = { callId: 'sofia-' + id + '-' + ++this.serial, locale, signal };
          let result: unknown = { status: 'error', error: 'invalid_arguments' };
          try {
            const p = parameters as Record<string, unknown> | null;
            if (name === 'buscar_viaje') {
              const args = parseVoiceSearchArguments(parameters);
              if (args) result = await this.options.onSearch(args, context) ?? { status: 'success' };
            } else if (name === 'crear_itinerario' && p && typeof p.destino === 'string' && p.destino.trim() &&
              p.destino.length <= 100 && Number.isInteger(p.dias) && Number(p.dias) >= 1 && Number(p.dias) <= 7) {
              result = await this.options.onItinerary?.({ destino: p.destino.trim(), dias: Number(p.dias) }, context)
                ?? { status: 'error', error: 'unavailable' };
            } else if (name === 'consultar_catalogo') {
              result = queryVoiceCatalog(p?.consulta, locale);
            } else if (name === 'mostrar_destino' && p && typeof p.destino === 'string' && p.destino.length <= 100 && p.destino.trim()) {
              result = this.options.onShowDestination?.(p.destino.trim(), context) ?? { status: 'error', error: 'unavailable' };
            }
          } catch { result = { status: 'error', error: 'unavailable' }; }
          finally { if (this.current(id)) { this.toolPending = false; this.setTurn('processing'); } }
          return JSON.stringify(this.current(id) ? result : { status: 'cancelled' });
        };
        const dispatch = (name: string, params: unknown) => {
          const callId = params && typeof params === 'object' ? callIds.get(params) : undefined;
          if (callId && completed.has(callId)) return completed.get(callId)!;
          if (completed.size >= 100) return Promise.resolve(JSON.stringify({ status: 'error', error: 'limited' }));
          const result = tool(name, params);
          if (callId) completed.set(callId, result);
          return result;
        };
        const startConversation = this.options.startConversation ?? (async (options: PartialOptions) => {
          const { VoiceConversation } = await import('@elevenlabs/client');
          return VoiceConversation.startSession(options);
        });
        const connection = await startConversation({
          conversationToken: data.token, connectionType: 'webrtc', textOnly: false,
          webRtc: { singlePeerConnection: false },
          overrides: { agent: { language: locale } },
          clientTools: Object.fromEntries(['buscar_viaje', 'crear_itinerario', 'consultar_catalogo', 'mostrar_destino']
            .map(name => [name, (params: unknown) => dispatch(name, params)])),
          onIncomingEvent: (event: { type?: string; client_tool_call?: { tool_call_id?: string; parameters?: unknown } }) => {
            const call = event.client_tool_call;
            if (event.type === 'client_tool_call' && call && typeof call.tool_call_id === 'string' &&
              call.parameters && typeof call.parameters === 'object') callIds.set(call.parameters, call.tool_call_id);
          },
          onModeChange: ({ mode }) => { if (this.current(id) && !this.toolPending) this.setTurn(mode); },
          onDisconnect: ({ reason }) => {
            if (!this.current(id)) return;
            if (reason === 'error') this.fail(id, 'connection');
            else this.stop();
          },
          onError: () => this.fail(id, 'connection'),
        });
        if (!this.current(id)) { this.close(connection); return; }
        this.connection = connection;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => this.stop(), Math.min(this.options.sessionTimeoutMs ?? 300000, 300000));
        this.setPhase('active'); this.setTurn(this.turn === 'cancelled' ? 'listening' : this.turn);
      } catch (error) {
        const name = error && typeof error === 'object' && 'name' in error ? error.name : '';
        this.fail(id, name === 'NotAllowedError' ? 'permission' : name === 'NotFoundError' ? 'microphone' : 'connection');
      }
    };
    this.starting = run();
    try { await this.starting; } finally { this.starting = null; }
  }
}
