# Envío automático del correo de vuelos (fase 3, parte 3)

Esta Pull Request deja **construido y probado** el envío real de los correos de vuelos a las personas que dieron su permiso. **No envía nada hoy:** está bloqueado por varios candados y ninguno se abre solo.

> Esta Pull Request **incluye** la de la baja con un clic (#102), porque cada correo real necesita su enlace de baja. Está basada en la de «a quién le toca» (#103). Si se fusionan, el orden es #102 → #103 → esta.

## Los candados (todos tienen que estar abiertos; si falta uno, no sale ningún correo y se dice cuál)

En este orden, cada vez que se lanza la tarea `/api/email/send`:

1. **Clave de la tarea** (`CRON_SECRET`). Sin ella, 401 y no se toca nada.
2. **Interruptor del código** (`EMAIL_SERVICE_LIVE`, hoy `false`). Responde 409 `not_live`.
3. **Datos legales completos** (titular, NIF, domicilio y correo en `lib/legal/owner.ts`) **y** el texto legal ya no marcado como borrador (`LEGAL_IS_DRAFT = false`). Responde 409 `legal_incomplete`.
4. **Clave de Resend** (`RESEND_API_KEY`) y **clave de baja** (`EMAIL_UNSUBSCRIBE_SECRET`, mínimo 32 caracteres). Responde 503.
5. **Tope**: `?limit=` válido (1 a 90). Si no, 400.
6. **Lectura**: se cuenta lo enviado hoy, se leen las personas con permiso y su historial. **Si cualquiera de las tres lecturas falla, no se envía nada** (sin historial se podría repetir un correo).

## Qué hace cuando todo está abierto

- Decide con las reglas de la parte 2 (#103): a quién le toca, con qué aeropuerto, meses y vuelos con precio real reciente. Si salen menos de 3 destinos, **no hay correo**.
- **Reserva antes de enviar.** Escribe una fila en `email_sends` (una por cuenta y día; la base de datos lo garantiza). Si ya existe, no envía. Después anota `sent` o `failed`.
- **Si la tarea se corta justo después de enviar**, la fila queda `claimed` y **cuenta como enviada**: es preferible no repetir a enviar dos veces.
- **Solo envía a cuentas con el correo confirmado.** El correo se lee de la cuenta en el momento de enviar y **no se guarda** en ninguna tabla ni en el registro.
- **Cada correo va a una sola dirección**, con su propio enlace de baja firmado y las cabeceras de baja con un clic (`List-Unsubscribe` y `List-Unsubscribe-Post`).
- **Respuestas:** el correo lleva la cabecera de respuesta (Reply-To) con el buzón de contacto de Destinauta (`EMAIL_REPLY_TO` en `lib/email/config.ts`, elegido por el propietario el 17-11-2026), porque `vuelos@avisos…` solo envía y no recibe. Ese buzón recibirá respuestas, dudas y peticiones de derechos de datos: hay que revisarlo.
- **Ritmo:** una pausa de 0,6 s entre correos (Resend admite 2 por segundo). La tanda se corta a los 40 s (la función de Vercel tiene 60 s); lo que no da tiempo sigue «tocando» y sale en la siguiente.
- **Un 429 de Resend** (demasiado rápido) corta la tanda: esa persona queda `failed` (se reintenta otro día) y las demás ni se reservan.
- **Un rechazo normal** con una persona no detiene a las demás.
- **Tope diario: 90 correos**, contando también los de otras tandas del mismo día (por ejemplo, una prueba manual con `?limit=5` y después la diaria).
- **Qué devuelve y qué deja en el registro:** solo cantidades (enviados, fallidos, pendientes…). Nunca correos, identificadores de cuenta, destinos ni precios.

## La fila de Vercel (`/api/email/send?limit=5`)

Está con el calendario del 29 de febrero (Vercel no admite el 30 de febrero), así que **no se ejecuta sola**: solo cuando tú pulses **Run** en Vercel → Cron Jobs. El `limit=5` es para las primeras pruebas reales con pocas personas. Para el envío diario habrá que cambiarla en una Pull Request (hora fija y sin `limit`), cuando decidas encender.

## Qué falta para encender (en este orden, cuando tú lo decidas)

1. Decidir qué datos legales se publican y rellenarlos (nombre, NIF, domicilio y correo de contacto), con revisión de un profesional, y pasar `LEGAL_IS_DRAFT` a `false`.
2. Ejecutar en Supabase el SQL de `email_preferences` (#97) y el de `email_sends` (#103).
3. Crear en Vercel `EMAIL_UNSUBSCRIBE_SECRET` (Production, Sensitive, 32 o más caracteres al azar; no cambiarla después de enviar).
4. Comprobar en Travelpayouts que el correo electrónico está entre los canales permitidos (punto verde).
5. Una Pull Request final que pase `EMAIL_SERVICE_LIVE` a `true`, repase el texto del permiso y su versión (`EMAIL_CONSENT_VERSION`) y ponga el calendario diario.
6. Primera tanda con `?limit=5` y tu propia cuenta como destinataria.

## Límites conocidos (a revisar con uso real)

- Una cuenta con permiso pero sin el correo confirmado ocupa un hueco del tope de ese día y se reintenta cada día. Con pocas cuentas no importa.
- Si alguien se da de baja mientras corre una tanda (menos de un minuto), podría recibir ese correo; la baja funciona desde el siguiente.
- «Cambiar mis preferencias» lleva todavía a la portada: falta un enlace directo a «Mi cuenta».

## Qué NO hace

- No envía nada mientras `EMAIL_SERVICE_LIVE` sea `false` (hoy lo es) ni sin los datos legales.
- No toca la portada, el cuestionario, los precios, el correo de prueba ni el ensayo.

## Cómo se deshace

Revertir la Pull Request: desaparecen la ruta, la fila de `vercel.json` y el texto nuevo del pie. Si ya hubo envíos reales, las filas de `email_sends` se quedan como historial (no hay nada que limpiar).
