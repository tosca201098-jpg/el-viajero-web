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
| 3. Itinerario hablado (`crear_itinerario`: destino + 1–7 días) | OpenAI avisaba a la página y esta pedía el texto a `gpt-5-mini` | Sofía solo da destino y días; la página pide el itinerario al servidor (**Claude Haiku 5.5**, con la sesión de la persona) y avisa a Sofía cuando ya está en pantalla (ver «Itinerarios por voz») |
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
  (`unknown_destination` → aclarar el destino, `invalid_arguments` → destino y 1 a 7 días, `busy` → esperar,
  `limited` → hoy ya usó sus itinerarios con IA, `unavailable` → disculparse y sugerir el botón «Crear itinerario»);
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
- **Quien tiene cuenta** recibe en ese mismo botón un itinerario escrito por Claude Haiku 5.5 (ver `docs/itinerario-ia-haiku.md`),
  con límite por persona y día, un tope global y respaldo a la guía básica si falla o no hay clave.
- **Por voz:** el botón «🎙️ Pedir el itinerario a Sofía» no se muestra todavía; volverá como opción añadida cuando el agente
  nuevo esté publicado y fijado (ver más abajo).

## Itinerarios por voz: Sofía pide, la página escribe con Haiku

Sofía ya **no escribe** el itinerario. Cuando la persona lo pide, Sofía llama a la herramienta de cliente `crear_itinerario`
con **dos** parámetros: `destino` y `dias` (1 a 7). Después:

1. La página valida el destino contra el catálogo y abre la ficha.
2. El planificador pide el itinerario a `POST /api/itinerary` con la sesión de la persona (solo destino, días e idioma: nunca
   fechas, viajeros ni presupuesto de la página). El servidor lo escribe con Claude Haiku 5.5 con los mismos límites que el
   botón (10 por persona y día natural de Madrid, 200 al día en toda la web; ver `docs/itinerario-ia-haiku.md`).
3. Solo cuando el itinerario **ya está en pantalla** se responde `success` a Sofía. Si no, Sofía recibe la verdad:
   `limited` (ya usó sus itinerarios con IA de hoy), `unavailable` (IA apagada, sin sesión válida, fallo, respuesta inválida o más
   de 70 segundos), `busy`, `unknown_destination`, `invalid_arguments` o `cancelled`. En `limited` y `unavailable` se muestra
   además la guía gratuita con el aviso correspondiente.
4. Si la conversación termina o se cancela mientras se escribe, la llamada se aborta y no se anuncia nada.

El itinerario sale con el aviso «escrito con IA», con «Guardar en mi cuenta» y «Descargar PDF», igual que el del botón.
Un itinerario que Sofía escribiera ella misma (parámetro opcional `itinerario`, JSON) se sigue aceptando y validando igual que
antes, pero el agente ya no tiene que enviarlo.

### Qué hay que cambiar en el agente de ElevenLabs (lo hace el propietario; no puede hacerse desde el código)

Solo ajustes del propio agente; **no hace falta cambiar la herramienta ni subir el límite de tokens**:

1. Mensaje del sistema: para un itinerario basta destino y días (no preguntar origen, fechas, viajeros ni presupuesto, ni usar
   `buscar_viaje`); confirmar el destino con `consultar_catalogo`; llamar a `crear_itinerario` con destino y días; esperar el
   resultado; con éxito decir en una o dos frases que ya está en pantalla (sin leerlo entero ni añadir horarios, precios o
   reservas); con error disculparse brevemente sin afirmar éxito. Hablar en el idioma de la persona (siete idiomas).
2. Herramienta `crear_itinerario`: tipo cliente, «espera respuesta», con parámetros `destino` y `dias`. Poner el **tiempo de
   espera de respuesta de la herramienta en unos 60 segundos** como mínimo: Haiku puede tardar entre 10 y 40 segundos y ese
   tiempo cuenta dentro de la conversación.
3. Mantener lo que el código exige del agente: voz `eZxqQzb5CuYo3Kl6EXfZ`, español, autenticación activada, **duración máxima
   300 o 360 segundos** (Production acepta ambas; el agente de pruebas de la Preview solo 360), silencio 90 s, detección de voz de
   fondo, máximo 1.024 tokens por respuesta, una conversación a la vez, límite diario 1–15 en Production, sin ráfagas ni cola, y
   sin permitir cambiar prompt, modelo, voz ni duración desde el navegador (solo idioma y primer mensaje).
4. Publicar la versión y anotar su **ID** (`agtvrsn_…`, y el `agent_…` si es un agente nuevo). El código fija la versión revisada
   en `lib/voice/preview-target.ts` y la variable `ELEVENLABS_AGENT_VERSION_ID` de Vercel Production debe coincidir: hay que abrir
   una PR que cambie esas constantes y las pruebas que las citan. **No se conecta un agente nuevo sin esa PR ni sin permiso del
   propietario.**

Privacidad del agente (decisión del propietario, ajustes de ElevenLabs → Avanzado → Privacidad): con «Guardar audio de
llamadas» activado y retención ilimitada, ElevenLabs conserva el audio de las conversaciones; conviene desactivarlo o fijar un
plazo corto, y que la política de privacidad diga lo que realmente se guarda.

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

`OPENAI_API_KEY` debe quedar vacía o eliminada. `AI_ITINERARY_ENABLED` y `AI_ITINERARY_*` solo afectan al itinerario escrito
por IA para visitantes registrados (ver `docs/itinerario-ia-haiku.md`); no cambian la voz. Las cuotas por usuario y por IP no cambian: 1 conversación por minuto y 3 por día natural de Madrid por
usuario; 2 por minuto y 5 por día por IP; 20 intentos globales al día.

## Qué no se puede comprobar desde el código

Audio real, inicio de sesión real, el estado del plan y de los créditos de ElevenLabs, la configuración vigente del agente,
Redis y las variables de Vercel solo pueden verificarse en tu cuenta. Las pruebas automáticas simulan todos esos servicios.
