// Allow only constant codes. Never pass runtime error details to server logs.
const codes = [
  'ADMISSION_ORIGIN',
  'ADMISSION_FLAGS',
  'ADMISSION_REDIS_CONFIG',
  'ADMISSION_IP',
  'ADMISSION_LIMITS',
  'ADMISSION_REDIS_NETWORK',
  'ADMISSION_REDIS_HTTP',
  'ADMISSION_REDIS_MALFORMED',
  'ADMISSION_REDIS_TIMEOUT',
  'ADMISSION_QUOTA',
  'VOICE_FLAGS',
  'VOICE_CREDENTIALS',
  'VOICE_VERSION',
  'VOICE_CHECK_NETWORK',
  'VOICE_CHECK_HTTP',
  'VOICE_CHECK_CREDENTIALS',
  'VOICE_CHECK_MALFORMED',
  'VOICE_CHECK_CONFIG',
  'VOICE_CHECK_TIMEOUT',
  'VOICE_TOKEN_NETWORK',
  'VOICE_TOKEN_HTTP',
  'VOICE_TOKEN_CREDENTIALS',
  'VOICE_TOKEN_MALFORMED',
  'VOICE_TOKEN_TIMEOUT',
  'VOICE_BUDGET_CONFIG',
  'VOICE_BUDGET_NETWORK',
  'VOICE_BUDGET_HTTP',
  'VOICE_BUDGET_CREDENTIALS',
  'VOICE_BUDGET_MALFORMED',
  'VOICE_BUDGET_TIMEOUT',
  'VOICE_BUDGET_USER',
  'VOICE_BUDGET_SITE',
  'VOICE_REQUEST',
] as const;
export type PreviewDiagnosticCode = typeof codes[number];

// Where the code may reach the server logs: the reviewed Preview branch, and the real production deployment of
// this repository's `main` (so a "voice unavailable" answer in production has a reason in the Vercel logs).
// The code is only a constant from the list above: never a message, a key, an address or a person's data, and it
// never reaches the browser.
function diagnosticScope(env: Record<string, string | undefined>) {
  if (env.VERCEL_ENV === 'preview' && env.VERCEL_GIT_COMMIT_REF === 'codex/sofia-elevenlabs') return true;
  return env.VERCEL === '1' && env.VERCEL_ENV === 'production' && env.VERCEL_GIT_COMMIT_REF === 'main' &&
    env.VERCEL_GIT_REPO_OWNER === 'tosca201098-jpg' && env.VERCEL_GIT_REPO_SLUG === 'el-viajero-web';
}

export function previewDiagnostic(code: PreviewDiagnosticCode) {
  if (diagnosticScope(process.env) && codes.includes(code)) console.warn('SOFIA_DIAGNOSTIC', code);
}
