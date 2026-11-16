import type { Locale } from '@/lib/i18n/translations';
import type { PartialOptions, VoiceConversation } from '@elevenlabs/client';
import type { VoiceItineraryArguments, VoiceItineraryContext, VoiceItineraryResult } from './itinerary';
import { queryVoiceCatalog } from './catalog';
import type { VoiceDiscoverSummary, VoiceTripSummary } from './trip-summary';

export type VoicePhase = 'idle' | 'connecting' | 'active';
export type VoiceTurn = 'listening' | 'processing' | 'searching' | 'speaking' | 'cancelled';
export type VoiceError = 'permission' | 'microphone' | 'connection' | 'timeout' | 'limited' | 'weeklyLimit' | 'siteWeeklyLimit' | 'unavailable';
/** A conversation never lasts more than this, whatever the server says (the agent's own maximum is 15 minutes). */
const MAX_SESSION_MS = 900_000;
/** Used only if the server does not say how long this conversation may last (earlier server versions). */
const DEFAULT_SESSION_MS = 360_000;
/** `summary` carries the real prices Sofía may say aloud (hotel prices never); `shown` names the card that opened. */
export type VoiceSearchResult = { status: 'success' | 'cancelled'; summary?: VoiceTripSummary; shown?: { name: string; country: string } }
  | { status: 'error'; error: string };
export type VoiceDiscoverArguments = {
  origen: string; fecha_ida: string; fecha_vuelta: string; viajeros: number;
  presupuesto: number; tipo_presupuesto: 'total' | 'por_persona';
};
export type VoiceDiscoverResult = { status: 'success'; summary: VoiceDiscoverSummary } | { status: 'cancelled' } | { status: 'error'; error: string };
export function parseVoiceDiscoverArguments(value: unknown): VoiceDiscoverArguments | null {
  try {
    const d = typeof value === 'string' ? JSON.parse(value) : value;
    const date = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) &&
      Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
    if (!d || typeof d.origen !== 'string' || !d.origen.trim() || d.origen.length > 100 ||
      !date(d.fecha_ida) || !date(d.fecha_vuelta) || d.fecha_vuelta < d.fecha_ida ||
      !Number.isInteger(d.viajeros) || d.viajeros < 1 || d.viajeros > 9 ||
      typeof d.presupuesto !== 'number' || !Number.isFinite(d.presupuesto) || d.presupuesto <= 0 || d.presupuesto > 10_000_000 ||
      !['total', 'por_persona'].includes(d.tipo_presupuesto)) return null;
    return { origen: d.origen.trim(), fecha_ida: d.fecha_ida, fecha_vuelta: d.fecha_vuelta,
      viajeros: d.viajeros, presupuesto: d.presupuesto, tipo_presupuesto: d.tipo_presupuesto };
  } catch { return null; }
}
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
/**
 * A departure before yesterday (Madrid) is past anywhere in the world, so it is never searched: Sofía is told today's
 * date and corrects herself. The one-day margin keeps travellers in other time zones from being rejected.
 */
export function pastDepartureError(departure: string, now: Date) {
  if (!Number.isFinite(now.getTime())) return null;
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? '';
  const today = `${part('year')}-${part('month')}-${part('day')}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return null;
  const earliest = new Date(Date.parse(`${today}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
  return departure < earliest ? { status: 'error', error: 'invalid_arguments', reason: 'date_in_past', today,
    note: `The departure date ${departure} has already passed. Today is ${today}. Use the next future date, confirm it with the traveller and search again.` } : null;
}
type Connection = Pick<VoiceConversation, 'endSession' | 'setMicMuted' | 'setVolume'>;
type VoiceSessionOptions = {
  onPhase: (phase: VoicePhase) => void; onError: (error: VoiceError) => void; onTurn?: (turn: VoiceTurn) => void;
  onSearch: (args: VoiceSearchArguments, context: VoiceItineraryContext) => void | VoiceSearchResult | Promise<VoiceSearchResult>;
  onItinerary?: (args: VoiceItineraryArguments, context: VoiceItineraryContext) => Promise<VoiceItineraryResult>;
  onShowDestination?: (name: string, context: VoiceItineraryContext) => VoiceSearchResult;
  onDiscover?: (args: VoiceDiscoverArguments, context: VoiceItineraryContext) => Promise<VoiceDiscoverResult>;
  getLocale?: () => Locale; fetcher?: typeof fetch; now?: () => Date;
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
  /** Wait for the existing asynchronous close before another provider starts. */
  waitForCleanup() { return this.ending; }
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
        if (!response.ok) {
          let reason: VoiceError = response.status === 429 ? 'limited' : response.status === 503 ? 'unavailable' : 'connection';
          if (response.status === 429) {
            // The server says why: this account's weekly minutes, the whole site's weekly minutes, or too many attempts in a row.
            let body: unknown = null;
            try { body = await response.json(); } catch { /* No readable reason: it stays a generic limit. */ }
            const code = body && typeof body === 'object' && 'error' in body ? body.error : null;
            if (code === 'ai_weekly_limit') reason = 'weeklyLimit';
            else if (code === 'ai_site_weekly_limit') reason = 'siteWeeklyLimit';
            if (!this.current(id)) return;
          }
          this.fail(id, reason);
          return;
        }
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
              const past = args && pastDepartureError(args.fecha_ida, this.options.now?.() ?? new Date());
              if (past) result = past;
              else if (args) result = await this.options.onSearch(args, context) ?? { status: 'success' };
            } else if (name === 'crear_itinerario' && p && typeof p.destino === 'string' && p.destino.trim() &&
              p.destino.length <= 100 && Number.isInteger(p.dias) && Number(p.dias) >= 1 && Number(p.dias) <= 7) {
              result = await this.options.onItinerary?.({ destino: p.destino.trim(), dias: Number(p.dias),
                ...(typeof p.itinerario === 'string' ? { itinerario: p.itinerario } : {}) }, context)
                ?? { status: 'error', error: 'unavailable' };
            } else if (name === 'consultar_catalogo') {
              result = queryVoiceCatalog(p?.consulta, locale, { month: p?.mes, topic: p?.tema });
            } else if (name === 'descubrir_destinos') {
              const args = parseVoiceDiscoverArguments(parameters);
              const past = args && pastDepartureError(args.fecha_ida, this.options.now?.() ?? new Date());
              if (past) result = past;
              else if (args) result = await this.options.onDiscover?.(args, context) ?? { status: 'error', error: 'unavailable' };
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
        // The anonymous account reference lets ElevenLabs add up this account's minutes. Only the exact format is accepted.
        const userId = typeof data.userRef === 'string' && /^u_[a-f0-9]{32}$/.test(data.userRef) ? data.userRef : undefined;
        const allowedMs = Number.isInteger(data.sessionSeconds) && data.sessionSeconds > 0
          ? Math.min(data.sessionSeconds * 1000, MAX_SESSION_MS) : DEFAULT_SESSION_MS;
        const connection = await startConversation({
          conversationToken: data.token, connectionType: 'webrtc', textOnly: false,
          ...(userId ? { userId } : {}),
          webRtc: { singlePeerConnection: false },
          overrides: { agent: { language: locale } },
          clientTools: Object.fromEntries(['buscar_viaje', 'crear_itinerario', 'consultar_catalogo', 'mostrar_destino', 'descubrir_destinos']
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
        this.timer = setTimeout(() => this.stop(), Math.min(this.options.sessionTimeoutMs ?? allowedMs, allowedMs));
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
