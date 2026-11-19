# Chat DESTINAUTA (guiado, sin IA)

Botón flotante «💬 Chat DESTINAUTA» en la portada (abajo a la derecha). Abre un panel donde la persona escribe y recibe respuestas
**solo con los datos que ya tiene la web**. No usa IA, no llama a ningún servicio, no cuesta nada y no guarda nada (primera entrega).

## Qué entiende (en los siete idiomas, aunque el idioma de la pregunta no sea el de la página)
- **Un destino** («¿Cuándo ir a Roma?», «quiero ir a Roma en enero»): ficha resumida con descripción, mejores meses, meses más
  tranquilos y con más gente, estancia recomendada y cuatro recomendaciones, más un botón «Abrir ficha» que abre la misma ventana de
  destino que abre Sofía. Si se pregunta por un mes, dice si está entre los mejores meses del catálogo y si suele haber más gente.
- **Un país** («Italia»): sus destinos del catálogo.
- **Un mes, varios meses o una estación** («¿dónde ir en octubre?», «entre mayo y junio», «verano», «este mes», «el mes que viene»).
- **Un tema** (playas, montaña, nieve y esquí, museos y arte, historia y castillos, naturaleza y senderismo, islas, lagos, gastronomía
  y vino, cultura, auroras y fiordos, termas y spa), solo o combinado con país y mes («playas en Portugal en agosto»).
- **«No sé dónde ir»** («no sé dónde ir», «recomiéndame un destino», «sorpréndeme», «ideas de viaje», «quiero viajar», «where
  should I go?», «où partir ?», «wohin?»…, en los siete idiomas; lista `UNDECIDED` de `lib/chat/vocabulary.ts`): el chat responde con
  seis temas para elegir (playas, montaña, museos, naturaleza, nieve, islas), invita a escribir un mes o un país, y un botón
  «Abrir «No sé dónde ir»» lleva al buscador de vuelos de la portada con esa opción ya activada (la que pide fechas y presupuesto y
  propone destinos con los precios del proveedor; el chat no da ninguno). Solo se usa si el mensaje no nombra un destino, país, mes,
  estación o tema: «no sé dónde ir en octubre» se responde con la lista de octubre.
- Los nombres de lugar se reconocen por **palabra completa** («Roma» no es «Romaña»), y un nombre que también es una palabra del
  vocabulario (el condado irlandés «Mayo») se lee como esa palabra.

## Qué NO hace (a propósito)
- **No da precios, ni disponibilidad de vuelos u hoteles.** Si se mencionan precios, vuelos, hoteles o presupuesto, lo dice con
  claridad y ofrece los buscadores («Buscar vuelos» lleva al buscador de la portada; «Buscar hoteles» a `/hoteles`).
- Si no entiende la pregunta o no es de viajes, no improvisa: explica de qué sí puede hablar y propone ejemplos.
- No guarda las preguntas ni envía nada fuera del navegador. (Siguiente entrega prevista: registro anónimo solo de preguntas de
  viajes que no supo resolver; nunca visados, política, deportes ni otros temas ajenos.)

## Dónde está el código
- `lib/chat/guided.ts`: `answerChat(texto, idioma, ahora)` devuelve datos (no texto): destino, lista, «sin resultados», precios… Usa
  `queryVoiceCatalog` (`lib/voice/catalog.ts`, la misma fuente que Sofía; se le añadieron los filtros opcionales `country` e `id`, que no
  cambian lo que recibe Sofía).
- `lib/chat/vocabulary.ts`: palabras reconocidas (estaciones, temas, precios, saludos, «este mes»…) ya normalizadas.
- `app/components/GuidedChat.tsx`: botón y panel. Se monta **solo en la portada** (`app/page.tsx`), nunca en `app/layout.tsx`: la página
  `/vuelos-en-vivo` va dentro de un marco de las fichas y no debe tener botón de chat.
- Textos: `chat.*` en `lib/i18n/translations.ts` (7 idiomas). Pruebas: `tests/guided-chat.test.cjs`.

## Cómo ampliarlo
- Una frase nueva («no sé dónde ir», «sorpréndeme»…): añadirla a la lista que le corresponde en `lib/chat/vocabulary.ts`, **ya
  normalizada** (minúsculas, sin acentos; los apóstrofos y la «ß» pasan a espacio: «don't» → `don t`, «weiß» → `wei`) y añadir el caso
  a `tests/guided-chat.test.cjs`. La lista viva de frases que se han probado y su estado está en el Proyecto
  (`claude/DESTINAUTA-chat-lista-de-frases.md`).
- Un tema nuevo: añadirlo a `TOPICS` en `lib/chat/vocabulary.ts` (palabras que escribe la gente en los 7 idiomas + palabras en español
  que aparecen en los textos del catálogo) y su nombre en `chat.topic.<clave>`. Una prueba exige textos en los 7 idiomas.
- Un país o destino nuevo: no hace falta tocar nada; entra solo cuando está en el catálogo.

## Cómo quitarlo
Borrar `<GuidedChat … />` y su importación de `app/page.tsx` (o revertir la PR). No hay datos que limpiar.
