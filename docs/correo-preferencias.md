# Correo de vuelos a buen precio: Fases 0 y 1 (cuestionario, permiso y páginas legales)

Objetivo final: que las personas registradas puedan recibir por correo vuelos a buen precio **personalizados** según sus gustos. Esta entrega es solo el principio: **no envía ningún correo**.

## Qué incluye
**Fase 1 · Cuestionario y permiso en «Mi cuenta».** Un desplegable «Vuelos a buen precio por correo (opcional)» entre el correo de la persona y el botón «Cerrar sesión». Se responde una sola vez y se puede cambiar cuando se quiera. Todas las preguntas son opcionales:
1. Aeropuerto o aeropuertos de salida (de los 10 de «Viajes por mes»; hasta 2).
2. Meses en los que le gustaría viajar (hasta 4).
3. Tipo de viaje: playa y sol, ciudad y cultura, montaña y naturaleza, gastronomía, aventura, relax (hasta 3). *De momento no se usa: hará falta etiquetar los destinos.*
4. Duración: fin de semana / 4–5 días / una semana o más.
5. Hasta dónde: España / Europa / lejos / me da igual.
6. Cuánto suele pagar por un vuelo de ida y vuelta: hasta 100 € / 200 € / 400 € / me da igual.
7. Cada cuánto quiere el correo: cada semana / cada 15 días / una vez al mes.

Debajo, **una casilla de permiso aparte, sin marcar**: «Quiero recibir por correo electrónico vuelos a buen precio según mis respuestas…». Solo se puede marcar si hay al menos un aeropuerto y una frecuencia. Se guarda la fecha y la versión del texto con las que la persona dio el permiso (y la fecha de retirada si lo quita). Hay un botón «Borrar mis respuestas». No se pregunta salud, religión, ingresos, nacionalidad ni edad exacta.

Los textos están en los siete idiomas (`lib/email-preferences/texts.ts`, en un archivo aparte para no chocar con otros cambios de `translations.ts`).

**Fase 0 · Páginas legales en borrador:** `/privacidad` (política de privacidad) y `/aviso-legal`. Salen con aviso de borrador, sin indexar en buscadores y con huecos amarillos «[PENDIENTE: …]» para los datos del titular y «[REVISAR: …]» para lo que debe confirmar un profesional. **No están enlazadas desde la portada** (no hay pie de página nuevo): solo se llega desde la casilla del permiso. Los datos del titular se rellenan una sola vez en `lib/legal/owner.ts`.

## Cómo se guarda (Supabase)
Tabla nueva `email_preferences`, una fila por cuenta, con seguridad por filas (RLS): cada persona solo ve y cambia la suya. Al borrar la cuenta se borran sus respuestas. Las fechas del permiso las pone la base de datos (un disparador), no el navegador: nadie puede inventarlas desde la web. La base rechaza valores fuera de las listas permitidas y no deja activar el permiso sin aeropuerto y frecuencia.

Archivos: `supabase/migrations/20261117000000_create_email_preferences.sql` y su prueba `supabase/tests/email_preferences_rls.sql` (63 comprobaciones; pasan en un Postgres 16 local con un sustituto de pgTAP y la prueba falla si se quita el disparador o se concede escribir las fechas).

## Puesta en marcha (la hace el propietario, una sola vez, **después** de fusionar)
1. Supabase → tu proyecto → *SQL Editor* → *New query* → pega el contenido de `supabase/migrations/20261117000000_create_email_preferences.sql` → *Run*. En *Table Editor* debe aparecer `email_preferences` con RLS activado.
2. No hay variables de entorno nuevas.
3. Hasta que se cree la tabla, abrir el desplegable enseña «No se han podido cargar tus preferencias» (con «Reintentar»); el resto de «Mi cuenta» y de la web no cambia.

> En el Preview de Vercel la web usa la misma base de Supabase que Producción si las variables de Preview apuntan a ella. **No crees la tabla hasta decidir dónde probar**: lo más seguro es esperar a la orden de fusión.

## Antes de empezar a enviar correos (lista de control)
- [ ] Rellenar `OWNER_DATA` y `LEGAL_UPDATED` en `lib/legal/owner.ts`; revisión por un profesional; después `LEGAL_IS_DRAFT = false` (quita el aviso de borrador, los «[REVISAR]» y permite indexar).
- [ ] Decidir si se añade un pie de página discreto con «Privacidad» y «Aviso legal» (no se ha tocado la portada).
- [ ] Revisar si la web usa cookies no esenciales (Travelpayouts, Stay22…; Tavus se quitó el 21-11-2026 porque ya no se usa) y si hace falta aviso de cookies.
- [ ] Elegir el servicio de envío (se sugirió Resend), verificar el dominio (DNS) y crear la baja con un clic.
- [ ] `EMAIL_SERVICE_LIVE = true` en `lib/email-preferences/options.ts`: quita el aviso «todavía no enviamos correos» del cuestionario y de la política. Revisar el texto del permiso y, si cambia, cambiar `EMAIL_CONSENT_VERSION`.
- [ ] Guardar el histórico de precios (hoy `monthly_prices` solo guarda el último precio por ruta).

## Qué NO cambia
La portada y sus 16 tarjetas, las páginas de temporadas y de destinos, los siete idiomas existentes, los buscadores, la voz y la IA, y «Viajes por mes». «Mi cuenta», «Mis viajes» e «Itinerarios» siguen igual; solo se añade el desplegable en «Mi cuenta».

## Deshacer
Fusionar una PR que quite el desplegable y las dos páginas (o revertir esta). La tabla puede quedarse sin usar; se puede borrar con `drop table public.email_preferences;` (y `drop function public.email_preferences_stamp();`).
