export type VoicePreflightFailure = 'permission' | 'microphone' | 'connection';

/** Contains only a constant public error code, never browser or device details. */
export class VoicePreflightError extends Error {
  constructor(readonly code: VoicePreflightFailure) {
    super(code);
    this.name = 'VoicePreflightError';
  }
}

type Dependencies = {
  secureContext?: boolean;
  createPeerConnection?: () => Pick<RTCPeerConnection, 'close'>;
  getUserMedia?: (constraints: MediaStreamConstraints) => Promise<MediaStream>;
};

function publicFailure(error: unknown) {
  let name: unknown = '';
  try { name = error && typeof error === 'object' && 'name' in error ? error.name : ''; } catch { /* generic below */ }
  return new VoicePreflightError(name === 'NotAllowedError' || name === 'SecurityError' ? 'permission'
    : ['NotFoundError', 'DevicesNotFoundError', 'NotReadableError', 'OverconstrainedError', 'AbortError'].includes(String(name))
      ? 'microphone' : 'connection');
}

/** Local capability/permission probe only. It never opens SDP, signalling, a provider or an API. */
export async function preflightVoice(signal: AbortSignal, dependencies: Dependencies = {}): Promise<void> {
  if (signal.aborted) throw new VoicePreflightError('connection');
  const secure = dependencies.secureContext ?? (typeof window !== 'undefined' && window.isSecureContext === true);
  if (!secure) throw new VoicePreflightError('permission');
  const createPeer = dependencies.createPeerConnection ?? (() => {
    if (typeof RTCPeerConnection !== 'function') throw new VoicePreflightError('connection');
    return new RTCPeerConnection({ iceServers: [] });
  });
  // Construct and close only: createOffer/setLocalDescription/connect are deliberately absent.
  let peer: Pick<RTCPeerConnection, 'close'> | undefined;
  try {
    peer = createPeer();
    if (!peer || typeof peer.close !== 'function') throw new VoicePreflightError('connection');
  } catch {
    throw new VoicePreflightError('connection');
  } finally {
    if (peer) {
      try { peer.close(); } catch { throw new VoicePreflightError('connection'); }
    }
  }
  if (signal.aborted) throw new VoicePreflightError('connection');

  const getUserMedia = dependencies.getUserMedia ?? ((constraints: MediaStreamConstraints) => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return Promise.reject(new VoicePreflightError('microphone'));
    }
    return navigator.mediaDevices.getUserMedia(constraints);
  });
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const finish = (error?: VoicePreflightError) => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', cancel);
      if (error) reject(error); else resolve();
    };
    const cancel = () => finish(new VoicePreflightError('connection'));
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) { cancel(); return; }
    let pending: Promise<MediaStream>;
    try { pending = Promise.resolve(getUserMedia({ audio: true })); }
    catch (error) {
      finish(error instanceof VoicePreflightError ? error : publicFailure(error));
      return;
    }
    // Both handlers are attached even if the SDK/browser synchronously aborts in getUserMedia.
    pending.then(stream => {
      const tracks = new Set<MediaStreamTrack>();
      let audioTracks: MediaStreamTrack[] = [];
      let valid = false;
      let wellFormed = true;
      let clean = true;
      try {
        const found = stream.getTracks();
        if (!Array.isArray(found)) throw new Error('invalid_tracks');
        found.forEach(track => tracks.add(track));
      } catch { wellFormed = false; }
      try {
        audioTracks = stream.getAudioTracks();
        if (!Array.isArray(audioTracks)) throw new Error('invalid_tracks');
        audioTracks.forEach(track => tracks.add(track));
        valid = wellFormed && audioTracks.some(track => track.readyState === 'live' && track.enabled === true);
      } catch { valid = false; }
      tracks.forEach(track => {
        try { track.stop(); } catch { clean = false; }
      });
      if (signal.aborted) { cancel(); return; }
      finish(!valid ? new VoicePreflightError('microphone') : !clean ? new VoicePreflightError('connection') : undefined);
    }, error => finish(error instanceof VoicePreflightError ? error : publicFailure(error)))
      .catch(() => finish(new VoicePreflightError('connection')));
    if (signal.aborted) cancel();
  });
}
