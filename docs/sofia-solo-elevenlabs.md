# Sofía solo con ElevenLabs (sin OpenAI)

Decisión del propietario (15-11-2026): **DESTINAUTA no usa OpenAI en ninguna parte.** La voz de Sofía y los itinerarios
dependen únicamente de ElevenLabs. Este documento sustituye a cualquier frase anterior que diga que OpenAI se conserva,
que es el proveedor por defecto de Production o que `OPENAI_API_KEY` no debe retirarse.

## Qué cambió en el código

- `lib/voice/provider-selection.ts`: el único proveedor posible es `elevenlabs`. En Production hace falta
  `AI_VOICE_PROVIDER=elevenlabs` **y** `ELEVENLABS_PRODUCTION_APPROVED=true` (además del ámbito `main` del repositorio).
  Sin esos valores, o con cualquier otro (incluido `openai`), la voz queda apagada (503) sin contactar con nadie.
  En Preview y en local, ElevenLabs sigue siendo el valor por defecto.
- `app/api/voice/route.ts` solo delega en `lib/voice/elevenlabs-route.ts`. No existe ningún camino de repuesto.
- `lib/voice/session.ts` solo acepta la respuesta `{ token }` de ElevenLabs. Una respuesta con `{ value }` (la antigua forma
  de OpenAI) se rechaza como error de conexión.
- Eliminados: `lib/voice/openai-route.ts`, `lib/voice/openai-session.ts`, `lib/voice/openai-itinerary.ts`, sus pruebas,
  `app/api/itinerary/route.ts` (el generador de itinerarios con `gpt-5-mini`) y las funciones
  `buildItineraryResponseRequest` / `extractItinerary` de `lib/itinerary/server.ts`.
- `OPENAI_API_KEY` ya no existe en `.env.example` ni se lee en ningún archivo. La prueba
  `tests/itinerary.test.cjs` («OpenAI is gone…») falla si alguien vuelve a introducir una referencia en `app`, `lib` o `scripts`.

## Inventario: todo lo que hacía OpenAI y quién lo hace ahora

Revisado el 15-11-2026 en `app`, `lib`, `scripts`, `components`, `package.json` y los flujos de GitHub: OpenAI solo se usaba en
cuatro funciones, y no había ninguna otra dependencia ni librería de OpenAI.

| Función que hacía OpenAI | Cómo se hacía | Ahora la hace |
| --- | --- | --- |
| 1. Conversación de voz (micrófono de la portada) | OpenAI Realtime, modelo `gpt-realtime-2.1`, voz «marin» | Sofía (ElevenLabs), voz `eZxqQzb5CuYo3Kl6EXfZ`, ya integrada en el código (`elevenlabs-session.ts` / `elevenlabs-route.ts`) |
| 2. Búsqueda de viaje hablada: origen, destino, fechas, viajeros, vuelo/hotel/ambos y presupuesto (`buscar_viaje`) | Herramienta del asistente OpenAI | Misma herramienta `buscar_viaje` de Sofía, con el mismo validador de argumentos (`parseVoiceSearchArguments`) y las mismas acciones de la portada |
| 3. Itinerario hablado (`crear_itinerario`: destino + 1–7 días) | OpenAI avisaba a la página y esta pedía el texto a `gpt-5-mini` | Sofía escribe el itinerario y lo entrega en la propia llamada a la herramienta (ver más abajo) |
| 4. Itinerario escrito (botón «Crear itinerario con IA» de las fichas y de `/vuelos`, `POST /api/itinerary`, `gpt-5-mini`) | Servidor → API de OpenAI | El botón «Crear itinerario» sigue funcionando para todo el mundo, sin voz: devuelve la **guía básica gratuita** (sin IA, solo datos de la ficha). Ver «Itinerario escrito (botón)» más abajo |

Sofía además conserva sus propias herramientas: `consultar_catalogo` (perfiles reales del catálogo) y `mostrar_destino`
(abre la ficha existente).

Comportamientos que el asistente de OpenAI tenía en sus instrucciones y que **el agente de ElevenLabs debe seguir teniendo**
(se configuran en el agente, no en el código; hay que revisarlos en su panel):

- Responder siempre en el idioma de la web (el código ya envía el idioma a la conversación).
- Búsquedas: dejar que el usuario cuente todo libremente, no repetir preguntas ya contestadas, pedir solo lo que falte (una
  cosa cada vez), preguntar el presupuesto cuando sea útil y, si no está claro, «¿Ese presupuesto es total o por persona?»;
  confirmar brevemente los datos y **llamar siempre a `buscar_viaje`** (origen, destino, fechas, viajeros, servicio y
  presupuesto con `tipo_presupuesto`) antes de decir que la búsqueda está en curso.
- Itinerarios: no pedir origen, vuelos, hoteles, fechas ni viajeros (basta destino y duración); preguntar solo el destino o
  los días que falten; no inventar un itinerario hablado ni decir que está generado antes del resultado de la herramienta;
  con `success` confirmar brevemente que está en pantalla sin inventar actividades; con `error` explicar el fallo
  (`unknown_destination` → aclarar el destino, `invalid_arguments` → destino y 1 a 7 días, `busy` → esperar);
  con `cancelled` no confirmar éxito.
- Las reglas de búsqueda de viajes no se aplican nunca a los itinerarios.

## Botón del micrófono

El botón de la portada llama a `iniciarVoz` (`app/page.tsx`) → `VoiceSession` (`lib/voice/session.ts`):

1. Solo funciona con una cuenta registrada de DESTINAUTA. Un visitante sin sesión ve el aviso «Regístrate o inicia sesión
   para hablar con Sofía» y se abre el diálogo de acceso; no se pide micrófono ni se consume cuota.
2. Con sesión: comprobaciones locales del navegador (micrófono/WebRTC) → una sola petición `POST /api/voice` con la sesión
   de la cuenta → el servidor comprueba cuentas, cuotas (Redis) y la configuración fijada del agente → devuelve un token
   temporal → el navegador abre la conversación de voz con **Sofía de ElevenLabs** (`@elevenlabs/client`).
3. Si algo falla, no hay segundo proveedor ni reintento automático.

## Itinerario escrito (botón «Crear itinerario»)

Decisión del propietario (16-11-2026): el botón de las fichas y de `/vuelos` **sigue funcionando para quien no usa la voz**, y el
itinerario solo se crea cuando la persona pulsa «Crear itinerario» (al abrir la ficha no se genera ni se pide nada).

- **Para todo el mundo (gratis, sin IA):** `POST /api/itinerary` valida la petición contra el catálogo y devuelve una **guía básica**
  armada solo con la ficha del destino: su descripción y sus 4 recomendaciones repartidas por días en el idioma elegido (con el
  mismo respaldo al español que las fichas). No lleva horarios, precios, zonas ni reservas, y no se rellena ningún día con datos
  inventados: con 7 días pedidos y 4 recomendaciones, la guía ocupa 4 días y lo dice. No llama a ningún proveedor ni lee ninguna
  clave (código en `lib/itinerary/basic.ts`; pruebas en `tests/itinerary-basic.test.cjs`).
- **Descarga en PDF (todo el mundo, con o sin cuenta):** cuando hay un itinerario o una guía en pantalla aparece el botón
  «⬇️ Descargar en PDF». El PDF se crea **en el propio móvil, tablet u ordenador** (no se envía nada a ningún servidor ni se
  guarda nada): `lib/pdf/text-pdf.ts` escribe un PDF A4 con letra estándar y decoración vectorial (cabecera azul marino con el logo y el
  país, etiquetas «DÍA n», cuadro de datos y líneas para «Mis notas», sin imágenes), `lib/itinerary/document.ts` lo compone en el
  idioma elegido y `lib/itinerary/download.ts` lo descarga como `destinauta-<destino>.pdf`. El cuadro de datos usa **solo datos que ya
  están en la ficha** (estancia recomendada, mejor época, temporada más tranquila y la nota de temporada, con los mismos textos que la
  ficha) y las fechas y viajeros de la búsqueda de la propia persona; nunca precios, horarios ni disponibilidad. Quien tiene cuenta y un itinerario con
  IA o de Sofía conserva además «Guardar en mi cuenta». Limitaciones conocidas: las letras que la tipografía estándar no incluye
  se sustituyen por la letra básica (por ejemplo «ł» → «l») y los emojis no se imprimen; algunos navegadores integrados de
  aplicaciones (redes sociales, etc.) bloquean las descargas, y en ese caso conviene abrir la web en el navegador normal.
- **Siguiente paso previsto (no incluido en esta PR):** para quienes tengan cuenta, itinerario con Claude Haiku 5.5, con límite
  por persona y día, un tope global y respaldo a la guía básica si falla o no hay clave.
- **Por voz:** el botón «🎙️ Pedir el itinerario a Sofía» no se muestra todavía; volverá como opción añadida cuando exista la
  versión nueva del agente (ver más abajo). La entrega por voz (`crear_itinerario` con `itinerario`) sigue en el código.

## Itinerarios por voz: los entrega Sofía

Además del botón, Sofía puede escribir un itinerario durante la conversación. El planificador:

- En la portada (ventana de ficha): muestra el itinerario que Sofía entrega por voz, con el mismo contenido y la misma opción de guardarlo.
- En `/vuelos` (donde no hay micrófono): el botón «Crear itinerario» funciona igual que en la ficha.

Cuando Sofía crea un itinerario llama a la herramienta de cliente `crear_itinerario` con **tres** parámetros:
`destino`, `dias` y `itinerario` (texto JSON). La página valida el destino contra el catálogo, valida el JSON con el esquema
estricto (`isItinerary`, `lib/itinerary/schema.ts`: exactamente `dias` días, textos acotados, sin claves extra, máximo 16.000
caracteres) y lo muestra en la ficha. Si falta o no es válido se devuelve `unavailable` / `generation_failed` a Sofía y no se
muestra nada. El botón «Guardar itinerario» sigue funcionando igual (Supabase, requiere cuenta).

### Qué hay que cambiar en el agente de ElevenLabs (lo hace el propietario o Codex; no puede hacerse desde el código)

El agente fijado hoy conoce `crear_itinerario({ destino, dias })` pero **no** envía el contenido. Hasta que se actualice,
pedir un itinerario por voz acaba con «no disponible». Hay que crear una **nueva versión** del agente con:

1. Herramienta de cliente `crear_itinerario` (sigue siendo `client` y con «espera respuesta»), con parámetros:
   - `destino` (texto, obligatorio): nombre de un destino del catálogo (`consultar_catalogo`).
   - `dias` (entero 1–7, obligatorio).
   - `itinerario` (texto, obligatorio): JSON **exacto** con esta forma, en el idioma de la conversación:

   ```json
   {
     "title": "máx. 160 caracteres",
     "summary": "máx. 500 caracteres",
     "days": [
       {
         "dayNumber": 1,
         "title": "máx. 120",
         "morning":   [ { "name": "máx. 120", "description": "máx. 320", "area": "máx. 100" } ],
         "afternoon": [ { "name": "...", "description": "...", "area": "..." } ],
         "evening":   [ { "name": "...", "description": "...", "area": "..." } ]
       }
     ],
     "tips": [ "2 a 5 consejos, máx. 260 caracteres cada uno" ]
   }
   ```
   Cada franja (`morning`, `afternoon`, `evening`) lleva 1 o 2 actividades. `days` tiene exactamente `dias` elementos
   numerados desde 1. No se permiten claves adicionales.
2. Instrucciones del agente (añadir, sin quitar las de búsqueda y conversación ya descritas arriba): «Cuando el usuario pida
   un itinerario, solo necesitas destino y número de días (1 a 7). Comprueba el destino con `consultar_catalogo` y llama a
   `crear_itinerario` con el JSON completo. No inventes horarios exactos, precios, disponibilidad, reservas ni clima, ni
   afirmes que algo está abierto. Usa preferentemente los lugares recomendados del catálogo. Si la herramienta responde
   `success`, di en una o dos frases que el itinerario ya está en pantalla. Si responde `generation_failed`, corrige el JSON y
   reinténtalo una sola vez. Si responde `unavailable` o `busy`, discúlpate brevemente.»
3. Mantener todo lo demás que el código exige del agente: voz `eZxqQzb5CuYo3Kl6EXfZ`, español, autenticación activada,
   duración máxima 300 s en Production, silencio 90 s, una conversación a la vez, límite diario 1–15, sin ráfagas ni cola,
   y sin permitir cambiar prompt, modelo, voz ni duración desde el navegador.
4. Después, anotar el **ID de la nueva versión** (`agtvrsn_…`). El código fija la versión revisada en
   `SOFIA_PRODUCTION_VERSION_ID` (`lib/voice/preview-target.ts`) y la variable `ELEVENLABS_AGENT_VERSION_ID` de Vercel
   Production debe coincidir con ella: hay que abrir una PR que cambie esa constante y las pruebas que la citan.

### Decisión pendiente: tope de respuesta del agente

El código solo acepta agentes cuyo `max_tokens` esté entre 1 y 1.024 (una medida contra gasto inesperado). Un itinerario
completo viaja dentro de una sola respuesta de Sofía:

- Con 1.024 tokens caben itinerarios **cortos** (1–3 días con textos breves). Más días se cortarían y se rechazarían.
- Para 4–7 días habría que subir el tope (por ejemplo a 4.096) y cambiar ese límite en
  `lib/voice/elevenlabs-route.ts` y en sus pruebas. Afecta al coste de lenguaje del agente solo cuando escribe un itinerario,
  dentro del límite de 300 s por conversación y de 3 conversaciones diarias por usuario. **No se ha cambiado sin tu permiso.**

## Variables de Production necesarias

| Variable | Valor | Para qué |
| --- | --- | --- |
| `AI_ENABLED` | `true` | Interruptor general (exactamente `true`). |
| `AI_VOICE_ENABLED` | `true` | Voz de Sofía (incluye sus itinerarios). |
| `AI_VOICE_PROVIDER` | `elevenlabs` | Proveedor único; sin él Production queda apagado. |
| `ELEVENLABS_ENABLED` | `true` | Autoriza llamar a ElevenLabs. |
| `ELEVENLABS_PRODUCTION_APPROVED` | `true` | Aprobación explícita del propietario para Production. |
| `ELEVENLABS_API_KEY` | (clave privada, solo en Production) | La escribe el propietario directamente en Vercel. |
| `ELEVENLABS_AGENT_VERSION_ID` | ID de la versión fijada en el código | Debe coincidir con la constante revisada. |
| `AI_REDIS_REST_URL`, `AI_REDIS_REST_TOKEN` | de Upstash Redis | Cuotas compartidas. |
| `AI_RATE_LIMIT_SECRET` | texto aleatorio de 32 o más caracteres | Protege los contadores. |

`AI_ITINERARY_ENABLED` y `AI_ITINERARY_*` ya no se usan (los itinerarios dependen de la voz); `OPENAI_API_KEY` debe quedar
vacía o eliminada. Las cuotas por usuario y por IP no cambian: 1 conversación por minuto y 3 por día natural de Madrid por
usuario; 2 por minuto y 5 por día por IP; 20 intentos globales al día.

## Qué no se puede comprobar desde el código

Audio real, inicio de sesión real, el estado del plan y de los créditos de ElevenLabs, la configuración vigente del agente,
Redis y las variables de Vercel solo pueden verificarse en tu cuenta. Las pruebas automáticas simulan todos esos servicios.
