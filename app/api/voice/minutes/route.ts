import { previewDiagnostic, type PreviewDiagnosticCode } from '@/lib/ai/preview-diagnostic';
import { admitAiRequest, voiceUserReference } from '@/lib/ai/admission';
import { sofiaPreviewTarget, sofiaProductionTarget } from '@/lib/voice/preview-target';
import { BudgetError, userPeriod } from '@/lib/voice/voice-minutes';
import { bonusPreviewEnabled, isBonusPreview, readBonusPreview } from '@/lib/voice/bonus-preview';

const unavailable = (code: PreviewDiagnosticCode) => {
  previewDiagnostic(code);
  return Response.json({ error: 'ai_unavailable' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
};

/**
 * The status bar in "Mi cuenta": how many of this account's voice minutes are left in the current period. Read only: it never starts a
 * conversation, never returns a token and only reports the account's own seconds.
 */
export async function GET(request: Request) {
  try {
    const key = process.env.ELEVENLABS_API_KEY;
    const bonusPreview = isBonusPreview(process.env);
    if (bonusPreview && !bonusPreviewEnabled(process.env)) return unavailable('VOICE_FLAGS');
    const target = sofiaPreviewTarget(process.env) ?? sofiaProductionTarget(process.env);
    if (process.env.ELEVENLABS_ENABLED !== 'true' || !target) return unavailable('VOICE_FLAGS');
    if (!key) return unavailable('VOICE_CREDENTIALS');
    const denied = await admitAiRequest(request, 'voice_budget');
    if (denied) return denied;
    const userRef = voiceUserReference(request);
    if (!userRef) return unavailable('VOICE_REQUEST');
    const trial = bonusPreview ? await readBonusPreview(request, process.env) : undefined;
    const minutes = await userPeriod({ env: process.env, apiKey: key, agentId: target.agentId,
      userRef: trial?.userRef ?? userRef, bonusTrialSeconds: trial?.bonusTrialSeconds, now: Date.now() });
    return Response.json(trial ? { ...minutes, bonusTrial: true } : minutes, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return unavailable(error instanceof BudgetError ? error.code : 'VOICE_BUDGET_MALFORMED'); }
}
