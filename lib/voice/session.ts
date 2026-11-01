import { VoiceSession as ElevenLabsVoiceSession } from './elevenlabs-session';
import { VoiceSession as OpenAIVoiceSession } from './openai-session';
import type { VoiceError, VoicePhase, VoiceTurn } from './elevenlabs-session';
import { preflightVoice, VoicePreflightError } from './preflight';

export { parseVoiceSearchArguments } from './elevenlabs-session';
export type { VoiceError, VoicePhase, VoiceTurn, VoiceSearchResult, VoiceSearchArguments } from './elevenlabs-session';

type VoiceSessionOptions = ConstructorParameters<typeof ElevenLabsVoiceSession>[0] &
  ConstructorParameters<typeof OpenAIVoiceSession>[0] & {
    getAccessToken?: () => Promise<string | null>;
    onAuthRequired?: () => void;
    preflight?: (signal: AbortSignal) => Promise<void>;
  };
type ProviderSession = ElevenLabsVoiceSession | OpenAIVoiceSession;

/** The server response selects one provider. One admission POST; never an automatic fallback. */
export class VoiceSession {
  private phase: VoicePhase = 'idle';
  private turn: VoiceTurn = 'cancelled';
  private generation = 0;
  private disposed = false;
  private controller: AbortController | null = null;
  private delegate: ProviderSession | null = null;
  private starting: Promise<void> | null = null;
  private ending: Promise<void> = Promise.resolve();
  private timer: ReturnType<typeof setTimeout> | null = null;
  constructor(private options: VoiceSessionOptions) {}
  get status() { return this.phase; }
  get turnStatus() { return this.turn; }
  private current(id: number) {
    return !this.disposed && id === this.generation && !!this.controller && !this.controller.signal.aborted;
  }
  private clearTimer() { if (this.timer) clearTimeout(this.timer); this.timer = null; }
  private setPhase(phase: VoicePhase) {
    if (this.phase === phase) return;
    if (phase !== 'connecting') this.clearTimer();
    this.phase = phase;
    if (phase === 'active') {
      this.timer = setTimeout(() => this.stop(), Math.min(this.options.sessionTimeoutMs ?? 360000, 360000));
    }
    if (!this.disposed) this.options.onPhase(phase);
  }
  private setTurn(turn: VoiceTurn) {
    this.turn = turn;
    if (!this.disposed) this.options.onTurn?.(turn);
  }
  private trackCleanup(delegate: ProviderSession) {
    if (delegate instanceof ElevenLabsVoiceSession) {
      this.ending = Promise.all([this.ending, delegate.waitForCleanup()]).then(() => undefined);
    }
  }
  private retire(delegate = this.delegate) {
    if (!delegate) return;
    if (this.delegate === delegate) this.delegate = null;
    delegate.dispose();
    this.trackCleanup(delegate);
  }
  stop() {
    ++this.generation;
    this.controller?.abort(); this.controller = null;
    this.clearTimer(); this.retire();
    this.setTurn('cancelled'); this.setPhase('idle');
  }
  dispose() { this.stop(); this.disposed = true; }
  private fail(id: number, error: VoiceError) {
    if (!this.current(id)) return;
    this.stop();
    if (!this.disposed) this.options.onError(error);
  }
  private requireAuthentication(id: number) {
    if (!this.current(id)) return;
    this.stop();
    if (this.disposed) return;
    if (this.options.onAuthRequired) this.options.onAuthRequired();
    else this.options.onError('connection');
  }
  private accountToken(signal: AbortSignal): Promise<string | null> {
    return new Promise(resolve => {
      let settled = false;
      const finish = (value: string | null) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener('abort', cancel);
        resolve(value);
      };
      const cancel = () => finish(null);
      if (signal.aborted) { finish(null); return; }
      signal.addEventListener('abort', cancel, { once: true });
      try {
        // Always attach both handlers: a late rejection after cancellation stays handled.
        Promise.resolve(this.options.getAccessToken!()).then(finish, () => finish(null));
      } catch { finish(null); }
    });
  }
  async start() {
    if (this.disposed || this.phase !== 'idle' || this.starting) return;
    const id = ++this.generation;
    this.retire();
    this.controller = new AbortController();
    const signal = this.controller.signal;
    const locale = this.options.getLocale?.() ?? 'es';
    this.setPhase('connecting');
    this.timer = setTimeout(() => this.fail(id, 'timeout'), this.options.startupTimeoutMs ?? 20000);
    const run = async () => {
      try {
        await this.ending;
        if (!this.current(id)) return;
        let accessToken: string | null = null;
        if (this.options.getAccessToken) {
          accessToken = await this.accountToken(signal);
          if (!this.current(id)) return;
          if (typeof accessToken !== 'string' || !accessToken.trim() || /[\r\n]/.test(accessToken)) {
            this.requireAuthentication(id);
            return;
          }
        }
        // Fail local permission/device/WebRTC checks before any quota admission or provider token.
        await (this.options.preflight ?? preflightVoice)(signal);
        if (!this.current(id)) return;
        const actualFetch = this.options.fetcher ?? fetch;
        const response = await actualFetch('/api/voice', {
          method: 'POST', headers: { 'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: 'Bearer ' + accessToken } : {}) },
          body: JSON.stringify({ locale }), signal,
        });
        if (!this.current(id)) return;
        if (!response.ok) {
          if (response.status === 401) { this.requireAuthentication(id); return; }
          this.fail(id, response.status === 429 ? 'limited' : response.status === 503 ? 'unavailable' : 'connection');
          return;
        }
        const data: unknown = await response.json();
        if (!this.current(id)) return;
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw Error('invalid_session');
        const hasToken = Object.prototype.hasOwnProperty.call(data, 'token');
        const hasValue = Object.prototype.hasOwnProperty.call(data, 'value');
        if (hasToken === hasValue) throw Error('invalid_session');
        const credential = hasToken ? (data as { token: unknown }).token : (data as { value: unknown }).value;
        if (typeof credential !== 'string' || !credential.trim()) throw Error('invalid_session');
        // The selected adapter receives this response in memory, not a second HTTP request.
        const prefetched = hasToken ? { token: credential } : { value: credential };
        let consumed = false;
        const fetcher: typeof fetch = (input, init) => {
          if (input === '/api/voice') {
            if (consumed || !this.current(id)) return Promise.reject(Error('session_cancelled'));
            consumed = true;
            return Promise.resolve(Response.json(prefetched));
          }
          return actualFetch(input, init);
        };
        // Do not pass account credentials or authentication callbacks to either adapter.
        const { getAccessToken: _getAccessToken, onAuthRequired: _onAuthRequired,
          preflight: _preflight, ...providerOptions } = this.options;
        const callbacks = {
          ...providerOptions, getLocale: () => locale, fetcher,
          onPhase: (phase: VoicePhase) => {
            if (this.current(id)) this.setPhase(phase);
            // Keep this generation valid at idle: provider errors are reported AFTER idle.
          },
          onTurn: (turn: VoiceTurn) => { if (this.current(id)) this.setTurn(turn); },
          onError: (error: VoiceError) => this.fail(id, error),
        };
        const delegate = hasToken ? new ElevenLabsVoiceSession(callbacks) : new OpenAIVoiceSession(callbacks);
        this.delegate = delegate;
        await delegate.start();
        if (!this.current(id)) this.retire(delegate);
      } catch (error) { this.fail(id, error instanceof VoicePreflightError ? error.code : 'connection'); }
    };
    this.starting = run();
    try { await this.starting; } finally { this.starting = null; }
  }
}
