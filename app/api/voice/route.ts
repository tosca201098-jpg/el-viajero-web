import { previewDiagnostic } from '@/lib/ai/preview-diagnostic';
import { voiceProvider } from '@/lib/voice/provider-selection';
import { POST as elevenlabsVoice } from '@/lib/voice/elevenlabs-route';

export async function POST(request: Request) {
  // Sofía speaks only through ElevenLabs. There is no other provider and no fallback.
  if (!voiceProvider(process.env) || process.env.AI_ENABLED !== 'true' || process.env.AI_VOICE_ENABLED !== 'true') {
    previewDiagnostic('VOICE_FLAGS');
    return Response.json({ error: 'ai_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return elevenlabsVoice(request);
}
