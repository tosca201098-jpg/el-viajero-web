// Datos fijos del correo (no son secretos). La clave de Resend y el correo del propietario NO van aquí: se leen de
// variables de Vercel (RESEND_API_KEY y EMAIL_TEST_RECIPIENT) que escribe el propietario.

/** Remitente verificado en Resend (dominio avisos.destinauta.com). Elegido por el propietario el 17-11-2026. */
export const EMAIL_FROM = "Destinauta <vuelos@avisos.destinauta.com>";

/** Franja de aviso y pie del correo de prueba (solo para el propietario, en español). */
export const TEST_BANNER = "Correo de prueba · enviado solo al propietario de Destinauta · el enlace de baja todavía no funciona";
export const TEST_REASON = "Este es un correo de prueba para revisar el diseño. No se ha enviado a nadie más y los enlaces de baja y de preferencias todavía no están activos.";
