# Historial de precios de «Viajes por mes»

Objetivo: empezar a **guardar los precios reales de cada semana** para poder decir algún día, solo con datos reales, «más barato de lo habitual» (por ejemplo, en el correo de vuelos a buen precio). Esta entrega **solo guarda**: no cambia nada de lo que ve la gente en la web y no envía ningún correo.

## Qué hace
- La tarea diaria de Vercel (`/api/cron/monthly-prices`, una por aeropuerto) ya guardaba en `monthly_prices` el **último** precio de cada ruta. Eso sigue exactamente igual.
- Ahora, **una vez por semana (los lunes, hora UTC)**, esa misma tarea apunta además en una tabla nueva, `monthly_price_history`, el precio más barato que devolvió el proveedor ese día para cada destino y mes: aeropuerto de salida, destino, año y mes del viaje, día en que se vio, precio, noches y escalas.
- Solo se guardan precios que **devolvió hoy Travelpayouts**. Nunca se copian los guardados de días anteriores ni se inventa nada.
- Se borra lo guardado hace más de **120 días** (unas 17 semanas).
- La tabla es **privada**: solo la clave secreta del servidor puede leerla y escribirla (como `monthly_prices`). La web y las cuentas de usuario no la ven.

## Por qué solo una vez por semana
Cada fila ocupa unos **150 bytes** (medido en una base local, contando sus dos índices). En el peor caso imaginable (todos los destinos de los 10 aeropuertos con precio los 12 meses) serían unas 38.000 filas por día de guardado:
- Una vez por semana y 120 días: unas **650.000 filas ≈ 100 MB** como máximo. Lo normal será bastante menos, porque no todos los destinos tienen precio cada semana.
- A diario sería 7 veces más (≈ 680 MB como máximo) y podría llenar el plan gratuito de Supabase (500 MB).

Con una vez por semana, «lo habitual» empieza a ser útil tras 4 o 6 semanas de datos. Si pasadas unas semanas hay espacio de sobra, se puede guardar más a menudo cambiando un número (ver abajo). No sé todavía cuántas filas reales saldrán: se verá en la respuesta de la tarea (`history.saved`) y en Supabase → *Database* → *Usage*.

## Qué NO cambia
La web, «Viajes por mes», sus tarjetas, `monthly_prices`, `vercel.json` (siguen 10 tareas, una al día), las claves y variables de Vercel, y el resultado de la tarea (`success` y el código 200/502 no dependen del historial).

## Si la tabla aún no existe, o Supabase falla
La tarea de siempre sigue funcionando igual (200 y todo guardado). El historial nunca lanza un error: en la respuesta de la tarea, el campo `history` dice si se guardó:

```json
"history": { "day": true, "saved": 120, "failedMonths": 0, "purged": true }
```
- `day`: si hoy tocaba guardar el historial (lunes).
- `saved`: filas guardadas.
- `failedMonths`: meses en los que no se pudo guardar (por ejemplo, porque falta la tabla).
- `purged`: si se pudo borrar lo antiguo (`null` los demás días).

## Puesta en marcha (la hace el propietario, una sola vez, **después** de fusionar)
1. **Crear la tabla en Supabase.** Supabase → tu proyecto → *SQL Editor* → *New query* → pega el contenido de `supabase/migrations/20261117100000_create_monthly_price_history.sql` → *Run*. En *Table Editor* debe aparecer `monthly_price_history` con la seguridad por filas (RLS) activada.
2. **No hay variables nuevas** en Vercel.
3. **Comprobar el primer lunes.** Vercel → Project → Settings → Cron Jobs → *Run* en la tarea de MAD (o esperar a la ejecución del lunes) y mirar el registro: `history.saved` mayor que 0 y `failedMonths` en 0. Los demás días debe decir `"day": false`.

## Cambiar la frecuencia o el tiempo de conservación
En `lib/travelpayouts/monthly-history.ts`:
- `HISTORY_WEEKDAYS`: días de la semana en que se guarda (0 = domingo, 1 = lunes… 6 = sábado). `[1]` es solo el lunes; `[0, 1, 2, 3, 4, 5, 6]` sería a diario (revisar antes el espacio disponible).
- `HISTORY_RETENTION_DAYS`: días que se conserva (120).

## Pruebas
- `tests/monthly-history.test.cjs` (14 pruebas con datos simulados): día de guardado, filas, bloques de 500, errores sin romper la tarea, limpieza, historial solo con precios de hoy, y que `success`/estado no cambian.
- `supabase/tests/monthly_price_history_private.sql` (46 comprobaciones pgTAP): tabla privada, sin políticas, sin permisos para `anon` ni `authenticated`, restricciones de valores y limpieza. Se ejecutan con `supabase test db` en una base local; **no ejecutar en el proyecto alojado de Supabase sin autorización**.

## Deshacer
Revertir la PR. La tabla puede quedarse sin usar; se puede borrar con `drop table public.monthly_price_history;`.
