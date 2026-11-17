// Datos fijos del correo (no son secretos). La clave de Resend y el correo del propietario NO van aquí: se leen de
// variables de Vercel (RESEND_API_KEY y EMAIL_TEST_RECIPIENT) que escribe el propietario.

/** Remitente verificado en Resend (dominio avisos.destinauta.com). Elegido por el propietario el 17-11-2026. */
export const EMAIL_FROM = "Destinauta <vuelos@avisos.destinauta.com>";

/**
 * Dirección de respuesta de los correos reales (cabecera Reply-To): si alguien responde al correo, el mensaje llega al buzón de
 * contacto de Destinauta y no a vuelos@avisos…, que no recibe nada. Elegida por el propietario el 17-11-2026. No es un secreto:
 * va visible en cada correo que se envía.
 */
export const EMAIL_REPLY_TO = "Destinauta@hotmail.com";

/**
 * Máximo de correos reales por día. El plan gratuito de Resend admite 100 al día y 3.000 al mes (precios de resend.com/pricing a
 * 17-11-2026, a confirmar antes de contratar): se dejan 10 de margen para las pruebas. Si hay más personas a quienes les toca, las
 * que no caben pasan al día siguiente (empezando por las que más tiempo llevan sin recibir nada).
 */
export const DAILY_SEND_LIMIT = 90;

/**
 * Límites de una tanda de envío. Resend admite 2 peticiones por segundo por defecto: se deja un margen entre correo y correo.
 * La tarea corta a los 40 s (la función de Vercel tiene 60 s y un envío puede tardar hasta 10 s): lo que no dé tiempo sigue siendo «le toca»
 * y se envía en la siguiente tanda.
 */
export const SEND_PACE_MS = 600;
export const SEND_TIME_BUDGET_MS = 40000;

/** Franja de aviso y pie del correo de prueba (solo para el propietario, en español). */
export const TEST_BANNER = "Correo de prueba · enviado solo al propietario de Destinauta · el enlace de baja todavía no funciona";
export const TEST_REASON = "Este es un correo de prueba para revisar el diseño. No se ha enviado a nadie más y los enlaces de baja y de preferencias todavía no están activos.";
