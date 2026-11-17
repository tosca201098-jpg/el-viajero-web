# Baja con un clic del correo de vuelos (fase 3, parte 1)

Esta Pull Request prepara **la baja del correo**: el enlace «Darme de baja con un clic» del pie y el botón «Cancelar suscripción» que los programas de correo (Hotmail, Gmail…) enseñan junto al remitente. **Todavía no envía ningún correo a nadie y ningún correo lleva este enlace**: eso llegará con el envío automático (parte 3).

## Cómo funciona

1. Cada correo real llevará un enlace como `https://destinauta.com/api/email/unsubscribe?u=…&t=…&l=es`.
   - `u` es el identificador interno de la cuenta (no el correo electrónico), `t` es una firma y `l` el idioma.
   - La firma se calcula con una clave secreta del servidor. Sin esa clave **nadie puede fabricar un enlace de baja de otra persona**.
   - Los enlaces **no caducan**: un correo de hace meses se puede dar de baja igualmente.
2. Al abrir el enlace sale una página sencilla, en el idioma de la persona, con **un botón «Darme de baja»**. Abrir el enlace **no cambia nada**: así un programa de seguridad que revisa los enlaces del correo no da de baja a nadie por error.
3. Al pulsar el botón (o el botón «Cancelar suscripción» del programa de correo) se hace la baja de verdad: se pone `email_consent = false` en la fila de esa cuenta de `email_preferences`. La base de datos anota sola la fecha de retirada del permiso. **No se borra nada** y se conservan sus gustos de viaje.
4. Si no se puede guardar (por ejemplo, Supabase no responde), la página lo dice y pide reintentar: **nunca dice «te has dado de baja» si no se ha guardado**.
5. La baja se puede repetir sin problema.
6. Las cabeceras `List-Unsubscribe` y `List-Unsubscribe-Post: List-Unsubscribe=One-Click` (RFC 8058) están preparadas en `lib/email/unsubscribe.ts` para añadirlas a cada correo real.

La página no se indexa (`noindex`), no se guarda en caché y no deja pasar el referente.

## Lo que tienes que hacer tú (solo el día del envío real, no ahora)

Crear en Vercel (Production, marcada **Sensitive**) la variable **`EMAIL_UNSUBSCRIBE_SECRET`** con una cadena larga y aleatoria (mínimo 32 caracteres; lo más fácil es pedirle a tu gestor de contraseñas una de 40–64 caracteres). Pégala solo en Vercel: no en el chat ni en GitHub.

- Si falta o es demasiado corta, la página responde «No hemos podido darte de baja» (503) y **no cambia nada**.
- **No la cambies después de enviar correos**: los enlaces ya enviados dejarían de valer.

## Qué NO hace todavía

- No se envía ningún correo ni se añade a ningún correo real (el correo de prueba sigue igual, con el enlace a la portada).
- No crea tablas nuevas. Necesita la tabla `email_preferences` de la #97, que **todavía no está creada en Supabase** (se crea después de tus datos legales). Hasta entonces, la baja respondería con el aviso de error: no hay nadie que dar de baja.
- «Cambiar mis preferencias» sigue llevando a la portada; desde ahí se abre «Mi cuenta».

## Cómo se deshace

Revertir la Pull Request: desaparecen la ruta, los textos y la prueba. No hay nada que borrar en Supabase.
