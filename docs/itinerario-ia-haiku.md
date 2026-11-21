# Itinerario escrito por IA (Claude Haiku 5.5) para visitantes registrados

## Qué hace

- **Todo el mundo** recibe una guía gratuita, sin IA, solo cuando pulsa «Crear itinerario». Está hecha con los datos de la ficha del destino (no se inventa nada) y se puede descargar en PDF.
- **Los visitantes registrados** reciben, al pulsar el mismo botón, un itinerario escrito por **Claude Haiku 5.5** a partir de esas mismas recomendaciones. Se muestra con el aviso «Itinerario escrito con IA… comprueba horarios, precios y reservas», se puede **guardar en la cuenta** y **descargar en PDF** (el PDF lleva el mismo aviso).
- Si la IA no está activada, no hay clave, se ha agotado el cupo del día o el servicio falla, el visitante recibe la guía gratuita con un aviso corto (siete idiomas). Nunca se queda sin nada y nunca se reintenta automáticamente.

## Límites (todos pueden bajarse con variables, ninguno puede superarse)

| Límite | Valor | Variable para bajarlo |
| --- | --- | --- |
| Por persona registrada y día natural de Madrid | 10 | `AI_ITINERARY_USER_DAY_LIMIT` |
| Por conexión (IP) y minuto | 3 | `AI_ITINERARY_MINUTE_LIMIT` |
| Por conexión (IP) y 24 h | 10 | `AI_ITINERARY_DAY_LIMIT` |
| Toda la web, 24 h | 200 | `AI_ITINERARY_GLOBAL_DAY_LIMIT` |

Un valor inválido o por encima del techo **bloquea la IA** (el visitante ve la guía gratuita); no se interpreta como «sin límite». Las reservas se hacen en una sola operación atómica en Redis antes de llamar a Anthropic y no se devuelven si Anthropic falla.

## Cómo se activa (lo hace el propietario)

1. Crear la cuenta y una clave en la consola de Anthropic y fijar allí un **límite de gasto mensual**.
2. En Vercel (Production): `ANTHROPIC_API_KEY` como variable **sensible**, `AI_ENABLED=true` y `AI_ITINERARY_ENABLED=true`. Las cuotas necesitan también las variables de Redis ya existentes.
3. Borrar o ajustar las antiguas `AI_ITINERARY_MINUTE_LIMIT`, `AI_ITINERARY_DAY_LIMIT` y `AI_ITINERARY_GLOBAL_DAY_LIMIT` si tienen valores menores que los de la tabla (bajan el techo).
4. Hacer un nuevo despliegue y probar una vez con una cuenta registrada.

Para **apagarlo** basta poner `AI_ITINERARY_ENABLED=false` (o quitar la clave): todos vuelven a la guía gratuita.

## Controles de calidad (itinerario más completo y fiable)

Además de la estructura (días exactos, mañana/tarde/noche, consejos), cada respuesta de la IA pasa por `lib/itinerary/quality.ts` antes de enseñarse:

- **Sin contenido repetido:** no se admiten actividades, descripciones, títulos de día ni consejos repetidos (se comparan sin mayúsculas, tildes ni signos).
- **Sin datos que no podemos verificar:** se rechazan precios y monedas, «gratis» y descuentos, horas exactas y horarios de apertura, disponibilidad de entradas y garantías (en los siete idiomas).
- **Sin actividades inseguras:** se rechazan actividades con drogas, prostitución o ilegalidad. Los consejos pueden advertir de ellas («evita los taxis ilegales»).
- Si algo falla, la persona recibe la **guía gratuita** con el aviso de siempre. No hay reintentos automáticos, así que **una respuesta rechazada también cuenta en el límite diario** (la reserva se hace antes de llamar a Anthropic).
- En los registros del servidor solo se escribe un código fijo, por ejemplo `Itinerary AI result quality:price_claim`; nunca el texto de la respuesta.

Lo que **no** se puede comprobar por código y solo se pide en las instrucciones a la IA: que los días agrupen lugares cercanos, que haya 2 actividades por tramo cuando el destino lo permita, que los consejos sean útiles y que los lugares existan. Por eso el itinerario con IA sigue llevando el aviso «comprueba horarios, precios y reservas».

## Seguridad y privacidad

- La clave solo se lee en el servidor, solo se envía a `https://api.anthropic.com/v1/messages` en la cabecera `x-api-key`, sin redirecciones ni reintentos, con un límite de 50 segundos.
- Se envía solo lo que ya es público en la ficha (destino, país, recomendaciones, meses) más la duración, el idioma y, si el visitante los puso, fechas y viajeros. **No** se envía correo, identificador de cuenta, IP ni presupuesto.
- La respuesta se acepta solo si termina bien, es JSON, cumple exactamente la estructura del itinerario y tiene el número de días pedido; si no, se muestra la guía gratuita.
- Los registros del servidor guardan solo una categoría de error (por ejemplo `401 authentication_error`), nunca la clave, la petición ni la respuesta.
- El texto de la ficha va al modelo como datos entre comillas, con la instrucción de ignorar cualquier orden que contenga, y se le pide no inventar horarios, precios ni disponibilidad.

## Coste orientativo (precios oficiales de Haiku 5.5: 0,10 $ entrada y 0,50 $ salida por millón de tokens)

Un itinerario cuesta entre ≈0,0015 $ (3 días) y ≈0,005 $ (máximo de un itinerario largo). Con el tope de 200 al día, el máximo teórico es ≈1 $ al día. El gasto real se consulta en la consola de Anthropic.

## Por voz (Sofía)

Cuando Sofía recibe la petición de un itinerario, solo da destino y días; la página llama a este mismo servicio con la sesión de la persona y avisa a Sofía cuando el itinerario ya está en pantalla. Cuenta en el mismo cupo (10 por persona y día). Si no hay cupo o la IA no está disponible, Sofía lo sabe (`limited` / `unavailable`) y se muestra la guía gratuita. Detalles en `docs/sofia-solo-elevenlabs.md`.
