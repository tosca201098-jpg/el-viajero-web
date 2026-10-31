import { previewDiagnostic } from '@/lib/ai/preview-diagnostic';
import { voiceProvider } from '@/lib/voice/provider-selection';
import { POST as elevenlabsVoice } from '@/lib/voice/elevenlabs-route';
import { POST as openaiVoice } from '@/lib/voice/openai-route';

export async function POST(request: Request) {
  const provider = voiceProvider(process.env);
  if (!provider || process.env.AI_ENABLED !== 'true' || process.env.AI_VOICE_ENABLED !== 'true') {
    previewDiagnostic('VOICE_FLAGS');
    return Response.json({ error: 'ai_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return provider === 'openai' ? openaiVoice(request) : elevenlabsVoice(request);
}
