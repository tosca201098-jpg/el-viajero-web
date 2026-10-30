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
  'VOICE_REQUEST',
] as const;
export type PreviewDiagnosticCode = typeof codes[number];
export function previewDiagnostic(code: PreviewDiagnosticCode) {
  if (process.env.VERCEL_ENV === 'preview' &&
      process.env.VERCEL_GIT_COMMIT_REF === 'codex/sofia-elevenlabs' &&
      codes.includes(code)) console.warn('SOFIA_DIAGNOSTIC', code);
}
