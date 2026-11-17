# Correo de prueba de vuelos a buen precio (solo para el propietario)

Esto es la **fase 2** del correo de vuelos: un correo de **prueba** que se manda **solo a tu dirección**, con el diseño aprobado el 17-11-2026 y con precios **reales** que la web ya guarda. No envía nada a ningún usuario.

## Qué hace

- Una ruta protegida, `/api/email/test`, lee de la tabla `monthly_prices` (los precios que la tarea diaria de Travelpayouts guarda cada día) los 3 destinos más baratos de un aeropuerto en los meses elegidos y te manda el correo.
- Solo usa precios **vistos hace como máximo 3 días**, de escapadas de 2 a 5 noches, y que aún no han salido.
- Si no hay **al menos 3 destinos con precio real y reciente**, **no envía nada** (no se rellena nunca con precios inventados).
- El destinatario sale de una variable de Vercel (`EMAIL_TEST_RECIPIENT`): **no está escrito en el código ni en GitHub** y no se puede cambiar desde la dirección.
- El correo sale desde `Destinauta <vuelos@avisos.destinauta.com>` (dominio verificado en Resend, región Irlanda) y lleva una franja amarilla arriba: «Correo de prueba…».
- Está en los siete idiomas (parámetro `locale`). La prueba se manda en español.
- No toca el cuestionario de «Mi cuenta», ni `email_preferences`, ni la portada. **No escribe en la base de datos.**

## Qué NO hace todavía (fase 3)

- Los enlaces «Darme de baja con un clic» y «Cambiar mis preferencias» **todavía no funcionan** (en la prueba llevan a la portada). Antes de enviar a otras personas hace falta el enlace de baja de un clic y las cabeceras de baja.
- No elige destinos por tipo de viaje, duración ni alcance (solo aeropuerto, meses y tope de precio).
- No envía a nadie más. El envío real sigue bloqueado hasta tener tus datos legales, la revisión legal, la tabla `email_preferences` de la #97 y `EMAIL_SERVICE_LIVE`.
- La etiqueta «Más barato de lo habitual» no sale: necesita el historial de precios (#99) con semanas de datos.
- El botón grande del final dice «Ver más vuelos de marzo» (y lleva a la página de ese mes) en lugar de «Ver todos los vuelos desde Madrid» del borrador: la página de cada mes no permite elegir el aeropuerto desde la dirección y siempre empieza en Madrid, así que no podríamos prometer «desde Barcelona».

## Variables de Vercel (las pones tú, en Production)

| Variable | Qué es | Notas |
|---|---|---|
| `RESEND_API_KEY` | La clave de Resend | Márcala como **Sensitive**. No la pegues en el chat ni en GitHub. |
| `EMAIL_TEST_RECIPIENT` | Tu correo, **una sola dirección** | Sin comas, sin nombre, sin espacios. |
| `CRON_SECRET` | Ya existe | La usa también la tarea de precios. |
| `SUPABASE_SECRET_KEY` y `NEXT_PUBLIC_SUPABASE_URL` | Ya existen | |

Si falta alguna, la ruta responde `503 not_configured` y no envía nada.

## Cómo se lanza (solo en Producción, tras fusionar)

1. En Vercel: proyecto `el-viajero-web` → **Settings → Cron Jobs** (o pestaña **Cron Jobs**).
2. Busca la fila `/api/email/test?origin=MAD&months=3,6&budget=up200&locale=es` y pulsa **Run**.
3. Respuestas posibles: `sent: true` (mira tu bandeja y el spam), `not_enough_data` (no hay 3 destinos con precio reciente; no se envía nada) o `not_configured` (falta una variable).
   El botón **Run** no enseña la respuesta, pero desde la parte 2 de la fase 3 la ruta deja **una línea en el registro de Vercel** con el resultado, por ejemplo `[email:test] {"ok":true,"sent":true,"picks":3}` (solo números, sí/no y textos cortos: nunca la dirección ni la clave).

La fila tiene un calendario que **no se ejecuta solo en la práctica**: es el 29 de febrero, que solo existe en años bisiestos (el próximo, **29-02-2028**). Primero probé el 30 de febrero, pero Vercel lo rechaza porque «nunca se ejecutaría». Solo sale cuando pulsas **Run**. Esta fila es solo para la fase de prueba: hay que quitarla de `vercel.json` cuando acabe esa fase (en todo caso, antes del 29-02-2028, o ese día se mandaría un correo de prueba a tu dirección si las variables siguen puestas).

Para probar otros datos hay que cambiar la dirección de esa fila en `vercel.json`:

- `origin`: `MAD`, `BCN`, `VLC`, `SVQ`, `AGP`, `BIO`, `PMI`, `ALC`, `TCI`, `LPA`.
- `months`: de 1 a 4 meses separados por comas (1–12).
- `budget`: `up100`, `up200`, `up400` o `any`.
- `locale`: `es`, `en`, `fr`, `de`, `it`, `pt`, `ca`.
- `dry=1` (opcional): enseña el asunto y los precios **sin enviar**.

## Cómo se deshace

- Quitar la variable `RESEND_API_KEY` de Vercel: la ruta deja de poder enviar (responde 503).
- Revertir la Pull Request: desaparecen la ruta, el icono y la fila de `vercel.json`.
- No hay nada que borrar en Supabase: esta fase no crea tablas ni escribe datos.
