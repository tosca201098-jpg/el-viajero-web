# Precios diarios de «Viajes por mes»

Objetivo: que las tarjetas de cada mes enseñen siempre los mejores precios **actuales** (escapadas de 2 a 5 noches) y que la web no se quede sin tarjetas cuando el proveedor no devuelve un destino ese día.

## Qué pasa cuando alguien abre un mes (por ejemplo, noviembre)
1. La API `/api/travelpayouts/monthly` pregunta a Travelpayouts por los precios de ese mes y aeropuerto. Esta respuesta se guarda 2 horas en la caché de Vercel; pasado ese tiempo se vuelve a preguntar. Por eso, si hoy Madrid está barato y mañana caro, mañana la tarjeta enseña el precio nuevo.
2. Travelpayouts solo recuerda los precios que otras personas buscaron en las **últimas 48 horas**. Si un destino no apareció, antes se quedaba sin tarjeta.
3. Ahora, para esos destinos, la API usa el **último precio guardado de los últimos 3 días** (con la misma etiqueta «Precio visto hace unos días. Puede cambiar.»). **El precio de hoy siempre manda**: un precio guardado nunca sustituye a uno de hoy.

## La tarea diaria
- Vercel ejecuta una vez al día, y para cada aeropuerto de salida, `/api/cron/monthly-prices?origin=XXX` (10 tareas en `vercel.json`, una por aeropuerto, entre la 01:00 y las 10:00 UTC; en el plan Hobby la hora exacta varía hasta 59 minutos).
- Cada tarea consulta Travelpayouts para los próximos **12 meses** (empieza por el mes en curso), elige por destino el vuelo más barato de 2 a 5 noches y lo guarda en la tabla `monthly_prices` de Supabase (un registro por aeropuerto, destino, año y mes; el de hoy sustituye al anterior).
- Se detiene al llegar a unos 40 segundos y deja los meses que falten para el día siguiente. Después borra los precios de más de 30 días y los viajes cuya salida ya pasó.
- Solo la puede lanzar Vercel: sin la clave `CRON_SECRET` correcta responde 401 y no hace nada. Si un mes falla, responde 502 (se verá como fallo en los registros de Vercel) pero los demás meses sí se guardan.

## Seguridad
- La tabla `monthly_prices` es privada: tiene la seguridad por filas activada, sin políticas y sin permisos para `anon` ni `authenticated`. Solo la clave secreta del servidor puede leerla y escribirla.
- La clave secreta (`SUPABASE_SECRET_KEY`) y `CRON_SECRET` solo se usan en el servidor, nunca en el navegador ni en variables `NEXT_PUBLIC_`.
- No se inventa ningún precio: solo se guardan y se enseñan precios que devolvió Travelpayouts. Si faltan variables o Supabase falla, la web funciona como antes, solo con los precios de hoy.

## Puesta en marcha (la hace el propietario, una sola vez)
1. **Crear la tabla en Supabase.** Supabase → tu proyecto → *SQL Editor* → *New query* → pega el contenido de `supabase/migrations/20261113000000_create_monthly_prices.sql` → *Run*. En *Table Editor* debe aparecer `monthly_prices` con la seguridad por filas (RLS) activada.
2. **Añadir dos variables en Vercel** (Project → Settings → Environment Variables, solo en *Production*):
   - `CRON_SECRET`: un texto largo y aleatorio que te inventes (mínimo 32 caracteres).
   - `SUPABASE_SECRET_KEY`: la clave **secreta** de Supabase (Project Settings → API Keys). Nunca la pegues en el chat, en GitHub ni en una variable que empiece por `NEXT_PUBLIC_`.
   Después hay que volver a desplegar para que las variables se apliquen.
3. **Probar.** Con la PR ya fusionada y desplegada: Vercel → Project → Settings → Cron Jobs → deben aparecer 10 tareas → pulsa *Run* en la de MAD y mira el registro: debe decir `success: true`. Luego, `/api/travelpayouts/monthly?month=11&origin=MAD&debug=1` muestra en `counts` cuántos precios hay guardados (`storedOffers`) y cuántos se han usado (`usedFromStorage`).

## Límites
- Las tareas diarias solo se ejecutan en **Producción**, no en las Preview.
- El plan Hobby de Vercel permite una ejecución al día por tarea y es para uso no comercial: si la web genera ingresos conviene revisar el plan.
- Si nadie ha buscado una ruta pequeña en los últimos días, Travelpayouts no tendrá precio y esa tarjeta no saldrá: no se rellena con datos inventados.
- Cambiar los días de vigencia de un precio guardado: `MAX_AGE_DAYS` en `lib/travelpayouts/monthly-store.ts`.

## Deshacer
Fusionar una PR que quite `vercel.json` (o revertir esta). La tabla puede quedarse sin usar.
