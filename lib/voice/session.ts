import { translate, type Locale } from '@/lib/i18n/translations';
import { parseVoiceItineraryCalls, type VoiceItineraryArguments, type VoiceItineraryContext, type VoiceItineraryResult } from './itinerary';

export type VoicePhase = "idle" | "connecting" | "active";
export type VoiceError = "permission" | "microphone" | "connection" | "timeout";

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
  onSearch: (arguments_: VoiceSearchArguments) => void;
  onItinerary?: (args: VoiceItineraryArguments, context: VoiceItineraryContext) => Promise<VoiceItineraryResult>;
  getLocale?: () => Locale;
  fetcher?: typeof fetch;
  createPeerConnection?: () => RTCPeerConnection;
  createAudio?: () => HTMLAudioElement;
  getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
  startupTimeoutMs?: number;
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

  private resumeToolResponse(id: number) {
    if (!this.current(id) || !this.resumeAfterTool || this.activeResponses.size || this.channel?.readyState !== 'open') return;
    this.resumeAfterTool = false;
    try {
      this.channel.send(JSON.stringify({ type: 'response.create', response: { tool_choice: 'none' } }));
    } catch { this.fail(id, 'connection'); }
  }

  private itineraryEvent(value: unknown, id: number, locale: Locale) {
    try {
      const event = typeof value === 'string' ? JSON.parse(value) : null;
      if (event?.type === 'response.created' && typeof event.response?.id === 'string') this.activeResponses.add(event.response.id);
      if (event?.type === 'response.done') this.activeResponses.delete(event.response?.id);
    } catch { /* Unrelated or malformed events remain ignored. */ }
    for (const call of parseVoiceItineraryCalls(value)) {
      if (this.itineraryCalls.has(call.callId)) continue;
      this.itineraryCalls.add(call.callId);
      if (call.responseId) this.activeResponses.add(call.responseId);
      const controller = new AbortController();
      if (call.args) {
        this.itineraryController?.abort();
        this.resumeAfterTool = false;
        this.itineraryController = controller;
      }
      const operation = Promise.resolve().then((): VoiceItineraryResult | Promise<VoiceItineraryResult> =>
        !call.args ? { status: 'error', error: 'invalid_arguments' }
          : controller.signal.aborted ? { status: 'cancelled' }
          : this.options.onItinerary?.(call.args, { callId: call.callId, locale, signal: controller.signal })
            ?? { status: 'error', error: 'unavailable' });
      void operation.catch((): VoiceItineraryResult => ({ status: 'error', error: 'generation_failed' }))
        .then(result => {
          if (!this.current(id) || this.channel?.readyState !== 'open') return;
          const output = controller.signal.aborted ? { status: 'cancelled' } : result;
          this.channel.send(JSON.stringify({ type: 'conversation.item.create', item: {
            type: 'function_call_output', call_id: call.callId, output: JSON.stringify(output),
          } }));
          if (output.status !== 'cancelled' && (!call.args || this.itineraryController === controller)) this.resumeAfterTool = true;
          this.resumeToolResponse(id);
        }).catch(() => this.fail(id, 'connection'));
    }
    this.resumeToolResponse(id);
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
    this.release();
    this.setPhase("idle");
  }

  dispose() {
    this.disposed = true;
    this.release();
    this.phase = "idle";
  }

  private fail(id: number, error: VoiceError) {
    if (!this.current(id)) return;
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
        if (this.current(id) && event.streams[0]) audio.srcObject = event.streams[0];
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
      const stream = await getUserMedia({ audio: true });
      if (!this.current(id)) { stream.getTracks().forEach((track) => track.stop()); return; }
      this.stream = stream;
      const tracks = stream.getAudioTracks();
      if (!tracks.length) throw new Error("microphone_unavailable");
      tracks.forEach((track) => peer.addTrack(track, stream));

      const channel = peer.createDataChannel("oai-events");
      this.channel = channel;
      channel.onmessage = (event) => {
        if (!this.current(id)) return;
        const args = parseVoiceEvent(event.data);
        if (args) this.options.onSearch(args);
        this.itineraryEvent(event.data, id, locale);
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
          channel.send(JSON.stringify({
            type: "response.create",
            response: {
              instructions: `Inicia esta sesión de voz diciendo exactamente: "${greeting}. ${translate(locale, 'voice.greetingQuestion')}". No añadas nada más en esta intervención. Este saludo es solo para el inicio de la sesión; no lo repitas durante la conversación.`,
              tool_choice: "none",
            },
          }));
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
