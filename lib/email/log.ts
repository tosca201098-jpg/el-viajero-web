// Una línea en el registro de Vercel con el resultado de una tarea de correo, para poder ver qué pasó sin abrir la base de datos.
// SOLO admite números, textos cortos y sí/no: nunca correos, identificadores de cuenta, claves ni precios de nadie.

export type LogValue = string | number | boolean | null;

const SAFE_TEXT = /^[A-Za-z0-9_.:-]{0,40}$/;
/** Un identificador de cuenta (UUID) nunca se escribe en el registro, aunque llegue como texto. */
const UUID_LIKE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i;

export function logEmailRun(kind: string, data: Readonly<Record<string, LogValue>>): void {
  const safe: Record<string, LogValue> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!SAFE_TEXT.test(key)) continue;
    if (typeof value === "string") {
      if (SAFE_TEXT.test(value) && !UUID_LIKE.test(value)) safe[key] = value;
    } else if (value === null || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) {
      safe[key] = value;
    }
  }
  try {
    console.info(`[email:${kind}] ${JSON.stringify(safe)}`);
  } catch {
    // El registro nunca debe romper la tarea.
  }
}
