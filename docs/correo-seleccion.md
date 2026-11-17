# A quién le toca el correo y con qué vuelos (fase 3, parte 2)

Esta Pull Request prepara **la decisión**: a quién le tocaría hoy el correo de vuelos y con qué destinos. **No envía ningún correo y no escribe en ninguna tabla.** Incluye un **ensayo** que solo cuenta personas.

## Reglas (las del plan aprobado)

- **Entra** quien tiene el permiso marcado, al menos un aeropuerto de salida y una frecuencia (así lo exige ya la base de datos).
- **Le toca** cuando ha pasado su frecuencia desde el último correo: semanal = 7 días, quincenal = 14, mensual = 30 (con 12 horas de margen, para que una tarea diaria no se salte un día). Si no ha recibido ninguno, le toca ya.
- **Aeropuerto:** el primero que eligió; si eligió dos, un correo de cada uno por turnos.
- **Meses:** los que eligió, del más próximo al más lejano. Si no eligió ninguno, los tres siguientes.
- **Vuelos:** los 3 destinos más baratos con **precio real visto hace como mucho 3 días** (los de `monthly_prices`), de escapadas de 2 a 5 noches que aún no han salido.
- **Filtros que se aplican:**
  - **Precio:** hasta 100 / 200 / 400 € (el precio se compara ya redondeado hacia arriba, como se enseña).
  - **Duración:** fin de semana = 2–3 noches; 4–5 días = 3–5 noches; **una semana o más = 4–5 noches** (lo más largo que tenemos guardado; el correo dice siempre las noches reales).
  - **Alcance:** se entiende como un máximo: *España* = solo España; *Europa* = España y el resto de Europa; *Lejos* y *me da igual* = cualquier destino del catálogo. Hoy todo el catálogo es europeo, así que «Lejos» equivale a «me da igual».
  - **Tipo de viaje:** se guarda pero **todavía no filtra**, porque los destinos no tienen etiquetas de tipo.
- **Si tras los filtros salen menos de 3 destinos, NO se envía.** Nunca se rellena con precios inventados ni se ignoran sus filtros para completar.
- **Tope diario: 90 correos** (el plan gratuito de Resend admite 100 al día; precio de resend.com/pricing a 17-11-2026, a confirmar antes de contratar). Si hay más personas, el resto pasa al día siguiente: primero quien nunca ha recibido nada, después quien lleva más tiempo sin recibir.

## El ensayo (`/api/email/plan`)

- Se lanza desde Vercel → Cron Jobs → **Run** (fila `/api/email/plan`, con calendario del 29 de febrero, como la del correo de prueba). Sin la clave (`CRON_SECRET`) responde 401.
- **Solo lee** (`email_preferences`, `email_sends` y `monthly_prices`) y **solo devuelve cantidades**: personas con permiso, a cuántas les toca, a cuántas se les podría enviar, a cuántas les faltan datos y cuántas quedarían para mañana. Nunca correos, identificadores, destinos ni precios.
- Como el botón **Run** no enseña la respuesta, ahora **deja una línea en el registro de Vercel**, por ejemplo `[email:plan] {"ok":true,"consenting":2,"due":1,"ready":1,...}`. Lo mismo hace desde ahora el correo de prueba (`[email:test] {"ok":true,"sent":true,"picks":3}`). Esas líneas **solo admiten números, sí/no y textos cortos**: nunca correos, identificadores de cuenta ni claves.
- Si la tabla `email_preferences` todavía no existe, responde `preferences_unavailable` y no hace nada más.

## La tabla nueva `email_sends` (SQL para ejecutar tú, más adelante)

`supabase/migrations/20261118000000_create_email_sends.sql` crea el registro de correos enviados: cuenta, día, aeropuerto, meses y estado (`claimed`/`sent`/`failed`). Sirve para saber cuándo le toca el siguiente y para **no enviar dos veces el mismo día** aunque la tarea se ejecute dos veces (una sola fila por cuenta y día).

- Es **privada**: sin permisos para cuentas ni visitantes; solo la lee y escribe el servidor con la clave de servicio.
- **No guarda correos electrónicos ni el contenido del mensaje.** Si una cuenta se elimina, sus filas se borran solas.
- **No la ejecutes todavía.** Esta Pull Request solo la lee; la escritura llega con el envío automático (parte 3). Sin ella, el ensayo avisa `historyAvailable: false` y cuenta a todos como «sin envíos previos».

## Qué NO hace

- No envía nada, no escribe en ninguna tabla, no lee correos electrónicos ni nombres, no toca `EMAIL_SERVICE_LIVE` (sigue en `false`), la portada, el cuestionario ni los precios.
- No hay etiquetas de «tipo de viaje» (queda para cuando se etiqueten los destinos).

## Cómo se deshace

Revertir la Pull Request: desaparecen la ruta, la fila de `vercel.json`, el registro y la lectura. Si ya ejecutaste el SQL de `email_sends`, `drop table public.email_sends;` lo quita (no hay nada más que borrar).
