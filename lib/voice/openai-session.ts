import { translate, type Locale } from '@/lib/i18n/translations';
import { parseVoiceItineraryCalls, type VoiceItineraryArguments, type VoiceItineraryContext, type VoiceItineraryResult } from './openai-itinerary';

export type VoicePhase = "idle" | "connecting" | "active";
export type VoiceTurn = "listening" | "processing" | "searching" | "speaking" | "cancelled";
export type VoiceError = "permission" | "microphone" | "connection" | "timeout" | "limited" | "unavailable";
export type VoiceSearchResult = { status: 'success' | 'cancelled' } | { status: 'error'; error: string };

export type VoiceSearchArguments = {
  origen: string;
  destino: string;
  fecha_ida: string;
  fecha_vuelta: string;
  viajeros: number;
  servicio: "vuelo" | "hotel" | "ambos";
  presupuesto?: number;
  tipo_presupuesto?: "total" | "por_persona";
};

export function parseVoiceSearchArguments(value: unknown): VoiceSearchArguments | null {
  if (typeof value !== "string") return null;
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { return null; }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const data = parsed as Record<string, unknown>;
  const isDate = (date: unknown): date is string =>
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (typeof data.origen !== "string" || !data.origen.trim() ||
      typeof data.destino !== "string" || !data.destino.trim() ||
      !isDate(data.fecha_ida) || !isDate(data.fecha_vuelta) ||
      typeof data.viajeros !== "number" || !Number.isSafeInteger(data.viajeros) || data.viajeros < 1 ||
      (data.servicio !== "vuelo" && data.servicio !== "hotel" && data.servicio !== "ambos")) return null;
  const result: VoiceSearchArguments = {
    origen: data.origen.trim(), destino: data.destino.trim(),
    fecha_ida: data.fecha_ida, fecha_vuelta: data.fecha_vuelta,
    viajeros: data.viajeros, servicio: data.servicio,
  };
  if (typeof data.presupuesto === "number" && Number.isFinite(data.presupuesto) && data.presupuesto > 0 &&
      (data.tipo_presupuesto === "total" || data.tipo_presupuesto === "por_persona")) {
    result.presupuesto = data.presupuesto;
    result.tipo_presupuesto = data.tipo_presupuesto;
  }
  return result;
}

export function parseVoiceEvent(value: unknown): VoiceSearchArguments | null {
  if (typeof value !== "string") return null;
  let event: unknown;
  try { event = JSON.parse(value); } catch { return null; }
  if (!event || typeof event !== "object" || Array.isArray(event)) return null;
  const record = event as Record<string, unknown>;
  return record.type === "response.function_call_arguments.done" && record.name === "buscar_viaje"
    ? parseVoiceSearchArguments(record.arguments) : null;
}

type VoiceSessionOptions = {
  onPhase: (phase: VoicePhase) => void;
  onError: (error: VoiceError) => void;
  onTurn?: (turn: VoiceTurn) => void;
  onSearch: (arguments_: VoiceSearchArguments, context: VoiceItineraryContext) => void | VoiceSearchResult | Promise<VoiceSearchResult>;
  onItinerary?: (args: VoiceItineraryArguments, context: VoiceItineraryContext) => Promise<VoiceItineraryResult>;
  getLocale?: () => Locale;
  fetcher?: typeof fetch;
  createPeerConnection?: () => RTCPeerConnection;
  createAudio?: () => HTMLAudioElement;
  getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
  startupTimeoutMs?: number;
  rearmDelayMs?: number;
  turnTimeoutMs?: number;
};

export class VoiceSession {
  private phase: VoicePhase = "idle";
  private generation = 0;
  private disposed = false;
  private controller: AbortController | null = null;
  private peer: RTCPeerConnection | null = null;
  private channel: RTCDataChannel | null = null;
  private stream: MediaStream | null = null;
  private audio: HTMLAudioElement | null = null;
  private startupTimer: ReturnType<typeof setTimeout> | null = null;
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private itineraryController: AbortController | null = null;
  private itineraryCalls = new Set<string>();
  private activeResponses = new Set<string>();
  private resumeAfterTool = false;
  private turn: VoiceTurn = 'cancelled';
  private awaitingResponse = false;
  private responseId: string | null = null;
  private responseAllowsTools = false;
  private toolAccepted = false;
  private toolPending = false;
  private audioResponses = new Set<string>();
  private drainedResponses = new Set<string>();
  private inputItems = new Set<string>();
  private rearmTimer: ReturnType<typeof setTimeout> | null = null;
  private turnTimer: ReturnType<typeof setTimeout> | null = null;

  get turnStatus() { return this.turn; }

  private setTurn(turn: VoiceTurn) {
    this.turn = turn;
    // Disabling the track sends silence over WebRTC without reacquiring permission.
    this.stream?.getAudioTracks().forEach(track => { track.enabled = turn === 'listening'; });
    if (!this.disposed) this.options.onTurn?.(turn);
  }

  private send(event: object) { this.channel!.send(JSON.stringify(event)); }

  private lockTurn(id: number) {
    if (this.rearmTimer) clearTimeout(this.rearmTimer);
    this.rearmTimer = null;
    this.setTurn('processing');
    if (!this.turnTimer) this.turnTimer = setTimeout(() => this.fail(id, 'timeout'), this.options.turnTimeoutMs ?? 120000);
    this.send({ type: 'input_audio_buffer.clear' });
  }

  private requestResponse(id: number, tools: boolean, instructions?: string) {
    this.lockTurn(id);
    this.awaitingResponse = true;
    this.responseAllowsTools = tools;
    this.responseId = null;
    this.send({ type: 'response.create', response: { ...(tools ? {} : { tool_choice: 'none' }), ...(instructions ? { instructions } : {}) } });
  }

  private finishTurn(id: number) {
    if (!this.current(id) || this.awaitingResponse || this.activeResponses.size || this.toolPending || this.audioResponses.size) return;
    if (this.resumeAfterTool) {
      this.resumeAfterTool = false;
      this.requestResponse(id, false);
      return;
    }
    if (this.rearmTimer) return;
    // Keep the microphone muted briefly after the server drains playback, including
    // the local speaker/room tail. Never rearm merely on response.done.
    this.rearmTimer = setTimeout(() => {
      this.rearmTimer = null;
      if (!this.current(id)) return;
      try {
        this.send({ type: 'input_audio_buffer.clear' });
        if (this.turnTimer) clearTimeout(this.turnTimer);
        this.turnTimer = null;
        this.responseId = null;
        this.toolAccepted = false;
        this.setTurn('listening');
      } catch { this.fail(id, 'connection'); }
    }, this.options.rearmDelayMs ?? 350);
  }

  private toolOutput(callId: string, output: VoiceItineraryResult | VoiceSearchResult) {
    this.send({ type: 'conversation.item.create', item: {
      type: 'function_call_output', call_id: callId, output: JSON.stringify(output),
    } });
  }

  private handleEvent(value: unknown, id: number, locale: Locale) {
    if (typeof value !== 'string' || value.length > 64000) return;
    const event = (() => { try { return JSON.parse(value); } catch { return null; } })();
    if (!event || typeof event !== 'object') return;
    if (event.type === 'error') { this.fail(id, 'connection'); return; }
    if (event.type === 'input_audio_buffer.committed' && typeof event.item_id === 'string') {
      if (this.inputItems.has(event.item_id)) return;
      this.inputItems.add(event.item_id);
      if (this.turn === 'listening') this.requestResponse(id, true);
      else this.send({ type: 'conversation.item.delete', item_id: event.item_id });
      return;
    }
    // Transcripts and VAD speech_started/stopped never cancel or dispatch work.
    if (event.type === 'response.created' && typeof event.response?.id === 'string') {
      if (!this.awaitingResponse) return;
      this.awaitingResponse = false;
      this.responseId = event.response.id;
      this.activeResponses.add(event.response.id);
    }
    const responseId = event.response_id ?? event.response?.id;
    if (!responseId || responseId !== this.responseId) return;
    if (event.type === 'output_audio_buffer.started' ||
        (event.type === 'response.content_part.added' && event.part?.type === 'audio')) {
      if (this.rearmTimer) clearTimeout(this.rearmTimer);
      this.rearmTimer = null;
      if (!this.drainedResponses.has(responseId)) this.audioResponses.add(responseId);
      this.setTurn(this.toolPending ? 'searching' : 'speaking');
    }
    if (event.type === 'output_audio_buffer.stopped' || event.type === 'output_audio_buffer.cleared') {
      this.audioResponses.delete(responseId);
      this.drainedResponses.add(responseId);
    }
    const itineraries = parseVoiceItineraryCalls(value);
    const items = event.type === 'response.function_call_arguments.done' ? [event]
      : event.type === 'response.output_item.done' ? [event.item]
      : event.type === 'response.done' && event.response?.status === 'completed' ? event.response.output : [];
    const searches = (Array.isArray(items) ? items : []).flatMap(item =>
      item?.name === 'buscar_viaje' && typeof item.call_id === 'string' && item.call_id.trim() && item.call_id.length <= 128 &&
      (event.type === 'response.function_call_arguments.done' || (item.type === 'function_call' && item.status === 'completed'))
        ? [{ callId: item.call_id, args: parseVoiceSearchArguments(item.arguments) }] : []);
    for (const call of [...itineraries.map(call => ({ ...call, kind: 'itinerary' as const })),
      ...searches.map(call => ({ ...call, kind: 'search' as const }))]) {
      if (this.itineraryCalls.has(call.callId)) continue;
      this.itineraryCalls.add(call.callId);
      if (!this.responseAllowsTools || this.toolAccepted) {
        this.toolOutput(call.callId, { status: 'error', error: 'busy' });
        continue;
      }
      this.toolAccepted = true;
      this.toolPending = true;
      this.setTurn('searching');
      const controller = new AbortController();
      this.itineraryController = controller;
      const context = { callId: call.callId, locale, signal: controller.signal };
      void Promise.resolve().then(() => {
        if (controller.signal.aborted) return { status: 'cancelled' } as const;
        if (!call.args) return { status: 'error', error: 'invalid_arguments' } as const;
        return call.kind === 'itinerary'
          ? this.options.onItinerary?.(call.args as VoiceItineraryArguments, context) ?? { status: 'error', error: 'unavailable' } as const
          : this.options.onSearch(call.args as VoiceSearchArguments, context);
      }).catch(() => ({ status: 'error', error: 'generation_failed' } as const)).then(result => {
        if (!this.current(id) || this.channel?.readyState !== 'open') return;
        this.toolPending = false;
        this.itineraryController = null;
        const output = controller.signal.aborted ? { status: 'cancelled' } as const : result ?? { status: 'success' } as const;
        this.toolOutput(call.callId, output);
        this.resumeAfterTool = output.status !== 'cancelled';
        this.finishTurn(id);
      }).catch(() => this.fail(id, 'connection'));
    }
    if (event.type === 'response.done') {
      this.activeResponses.delete(responseId);
      const hasAudio = Array.isArray(event.response.output) && event.response.output.some((item: { content?: { type: string }[] }) => item.content?.some(part => part.type === 'audio'));
      if (hasAudio && !this.drainedResponses.has(responseId)) this.audioResponses.add(responseId);
    }
    this.finishTurn(id);
  }

  constructor(private readonly options: VoiceSessionOptions) {}

  get status() { return this.phase; }

  private current(id: number) { return !this.disposed && this.generation === id; }

  private setPhase(phase: VoicePhase) {
    this.phase = phase;
    if (!this.disposed) this.options.onPhase(phase);
  }

  private clearTimers() {
    if (this.startupTimer) clearTimeout(this.startupTimer);
    if (this.disconnectTimer) clearTimeout(this.disconnectTimer);
    this.startupTimer = null;
    this.disconnectTimer = null;
  }

  private release() {
    this.generation++;
    this.itineraryController?.abort();
    this.itineraryController = null;
    this.itineraryCalls.clear();
    this.activeResponses.clear();
    this.resumeAfterTool = false;
    this.awaitingResponse = false;
    this.responseId = null;
    this.responseAllowsTools = false;
    this.toolAccepted = false;
    this.toolPending = false;
    this.audioResponses.clear();
    this.drainedResponses.clear();
    this.inputItems.clear();
    if (this.rearmTimer) clearTimeout(this.rearmTimer);
    if (this.turnTimer) clearTimeout(this.turnTimer);
    this.rearmTimer = null;
    this.turnTimer = null;
    this.clearTimers();
    this.controller?.abort();
    this.controller = null;
    const localTracks = new Set<MediaStreamTrack>(this.stream?.getTracks() ?? []);
    if (this.channel) {
      this.channel.onopen = null;
      this.channel.onmessage = null;
      this.channel.onerror = null;
      this.channel.onclose = null;
      try { this.channel.close(); } catch { /* Already closed. */ }
      this.channel = null;
    }
    if (this.peer) {
      this.peer.ontrack = null;
      this.peer.onconnectionstatechange = null;
      for (const sender of this.peer.getSenders()) if (sender.track) localTracks.add(sender.track);
      try { this.peer.close(); } catch { /* Already closed. */ }
      this.peer = null;
    }
    localTracks.forEach((track) => track.stop());
    this.stream = null;
    if (this.audio) {
      this.audio.pause();
      const remote = this.audio.srcObject;
      if (remote && "getTracks" in remote) (remote as MediaStream).getTracks().forEach((track) => track.stop());
      this.audio.srcObject = null;
      this.audio = null;
    }
  }

  stop() {
    if (this.phase === "idle") return;
    this.setTurn('cancelled');
    if (this.channel?.readyState === 'open') {
      try {
        if (this.activeResponses.size) this.send({ type: 'response.cancel' });
        this.send({ type: 'output_audio_buffer.clear' });
      } catch { /* Closing the peer below also stops playback. */ }
    }
    this.release();
    this.setPhase("idle");
  }

  dispose() {
    this.disposed = true;
    this.turn = 'cancelled';
    this.release();
    this.phase = "idle";
  }

  private fail(id: number, error: VoiceError) {
    if (!this.current(id)) return;
    this.setTurn('cancelled');
    this.release();
    this.setPhase("idle");
    this.options.onError(error);
  }

  async start() {
    if (this.disposed || this.phase !== "idle") return;
    this.setPhase("connecting");
    const id = ++this.generation;
    const controller = new AbortController();
    this.controller = controller;
    const locale = this.options.getLocale?.() ?? 'es';
    this.startupTimer = setTimeout(() => this.fail(id, "timeout"), this.options.startupTimeoutMs ?? 25000);
    try {
      const fetcher = this.options.fetcher ?? fetch;
      const response = await fetcher("/api/voice", { method: "POST", signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locale }) });
      if (!this.current(id)) return;
      if (response.status === 429) { this.fail(id, 'limited'); return; }
      if (response.status === 503) { this.fail(id, 'unavailable'); return; }
      if (!response.ok) throw new Error("voice_session_failed");
      const secret: unknown = await response.json();
      if (!this.current(id)) return;
      if (!secret || typeof secret !== "object" || typeof (secret as { value?: unknown }).value !== "string" ||
          !(secret as { value: string }).value.trim()) throw new Error("voice_session_invalid");
      const token = (secret as { value: string }).value;

      const peer = this.options.createPeerConnection?.() ?? new RTCPeerConnection();
      this.peer = peer;
      const audio = this.options.createAudio?.() ?? new Audio();
      audio.autoplay = true;
      this.audio = audio;
      peer.ontrack = (event) => {
        if (this.current(id) && event.streams[0]) {
          audio.srcObject = event.streams[0];
          // Surface autoplay/output failures instead of silently leaving a muted turn.
          void Promise.resolve(audio.play?.()).catch(() => this.fail(id, 'connection'));
        }
      };
      peer.onconnectionstatechange = () => {
        if (!this.current(id)) return;
        if (peer.connectionState === "failed" || peer.connectionState === "closed") this.fail(id, "connection");
        if (peer.connectionState === "disconnected" && !this.disconnectTimer) {
          this.disconnectTimer = setTimeout(() => this.fail(id, "connection"), 5000);
        }
        if (peer.connectionState === "connected" && this.disconnectTimer) {
          clearTimeout(this.disconnectTimer);
          this.disconnectTimer = null;
        }
      };

      const getUserMedia = this.options.getUserMedia ?? ((constraints: MediaStreamConstraints) => {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("microphone_unavailable");
        return navigator.mediaDevices.getUserMedia(constraints);
      });
      const stream = await getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      if (!this.current(id)) { stream.getTracks().forEach((track) => track.stop()); return; }
      this.stream = stream;
      const tracks = stream.getAudioTracks();
      if (!tracks.length) throw new Error("microphone_unavailable");
      tracks.forEach(track => { track.enabled = false; });
      tracks.forEach((track) => peer.addTrack(track, stream));

      const channel = peer.createDataChannel("oai-events");
      this.channel = channel;
      channel.onmessage = (event) => {
        if (!this.current(id)) return;
        try { this.handleEvent(event.data, id, locale); } catch { this.fail(id, 'connection'); }
      };
      channel.onerror = () => this.fail(id, "connection");
      channel.onclose = () => this.fail(id, "connection");
      channel.onopen = () => {
        if (!this.current(id) || this.phase !== "connecting") return;
        if (this.startupTimer) clearTimeout(this.startupTimer);
        this.startupTimer = null;
        this.setPhase("active");
        const hour = new Date().getHours();
        const greeting = translate(locale, hour >= 6 && hour < 12 ? 'voice.greetingMorning'
          : hour >= 12 && hour < 20 ? 'voice.greetingAfternoon' : 'voice.greetingEvening');
        try {
          this.requestResponse(id, false, `Inicia esta sesión de voz diciendo exactamente: "${greeting}. ${translate(locale, 'voice.greetingQuestion')}". No añadas nada más en esta intervención. Este saludo es solo para el inicio de la sesión; no lo repitas durante la conversación.`);
        } catch { this.fail(id, "connection"); }
      };

      const offer = await peer.createOffer();
      if (!this.current(id)) return;
      if (typeof offer.sdp !== "string" || !offer.sdp.trim()) throw new Error("invalid_offer");
      await peer.setLocalDescription(offer);
      if (!this.current(id)) return;
      const answer = await fetcher("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/sdp" },
        body: offer.sdp,
        signal: controller.signal,
      });
      if (!this.current(id)) return;
      if (!answer.ok) throw new Error("sdp_failed");
      const sdp = await answer.text();
      if (!this.current(id)) return;
      if (!sdp.trimStart().startsWith("v=0")) throw new Error("invalid_sdp");
      await peer.setRemoteDescription({ type: "answer", sdp });
    } catch (error) {
      if (!this.current(id)) return;
      const name = error instanceof Error ? error.name : "";
      const message = error instanceof Error ? error.message : "";
      this.fail(id, name === "NotAllowedError" || name === "SecurityError" ? "permission"
        : name === "NotFoundError" || name === "DevicesNotFoundError" || name === "NotReadableError" ||
          name === "OverconstrainedError" || name === "AbortError" ||
          message === "microphone_unavailable" ? "microphone" : "connection");
    }
  }
}
