// Comprobaciones de seguridad del envío de prueba (sin dependencias, para poder probarlas solas).

/** Comparación sin atajos por longitud del texto, para no dar pistas sobre la clave (igual que la tarea de precios). */
export function sameSecret(received: string, expected: string): boolean {
  let difference = received.length ^ expected.length;
  const length = Math.max(received.length, expected.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (received.charCodeAt(index) || 0) ^ (expected.charCodeAt(index) || 0);
  }
  return difference === 0;
}

/**
 * true solo si el texto es UNA dirección de correo sencilla. Rechaza listas separadas por comas o punto y coma, nombres
 * con <>, saltos de línea y espacios, para que la variable del destinatario no pueda enviar a más de una persona.
 */
export function isSingleEmailAddress(value: string | undefined | null): value is string {
  if (typeof value !== "string") return false;
  const email = value.trim();
  if (email.length < 6 || email.length > 254 || email !== value) return false;
  return /^[^\s@<>,;:"'()[\]\\]+@[^\s@<>,;:"'()[\]\\]+\.[^\s@<>,;:"'()[\]\\]+$/.test(email);
}
