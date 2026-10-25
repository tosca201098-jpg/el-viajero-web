# Protección de turnos de voz de DESTINAUTA

Base investigada: `main`, commit `8cf3737254026444bd28c8149f02112cc7e2f4b6`.
Rama: `fix/voice-protected-turns-20261025`. Fecha: 25 de octubre de 2026.

## Hallazgo y reproducción

El proveedor comprobado en el código es **OpenAI Realtime por WebRTC**. El
servidor obtiene un secreto temporal en `/v1/realtime/client_secrets` y el
navegador negocia `/v1/realtime/calls`. Se conservan el modelo configurado
`gpt-realtime-2.1`, la voz `marin` y los esquemas de ambas herramientas.
No hay una integración de ElevenLabs en este recorrido.

En la versión base:

- No se fijan `create_response` ni `interrupt_response`. La interrupción
  automática del proveedor queda sin una protección explícita.
- El micrófono permanece habilitado durante generación, herramientas y audio.
  La sesión solo distingue `idle`, `connecting` y `active`.
- Otra llamada válida a `crear_itinerario` ejecuta
  `itineraryController.abort()` y la portada cancela su solicitud anterior.
- `buscar_viaje` no deduplica llamadas ni espera a que concluya la búsqueda
  asíncrona de vuelos con presupuesto.

La prueba `baseline reproducer` ejecuta la sesión real con transporte simulado:
aceptar Madrid → iniciar su herramienta → inyectar otra llamada a Lisboa.
Con el archivo original falla porque la señal de Madrid está abortada; con el
arreglo la señal sigue activa y solo se ejecuta una herramienta. Esto reproduce
la carrera de código. No demuestra qué voz concreta reconoce el modelo real.
Las otras regresiones también fallan sobre la sesión original por mantener el
micrófono abierto durante el saludo y por carecer del control de turnos.

La prueba de navegador descubrió además que la ficha de destino tapa el botón
de voz de la portada. Se añade el control de parar dentro de los cuadros de
destino, vuelos, paquete y resultados mientras la sesión está activa.

## Comportamiento implementado

El ciclo de conexión se conserva; el turno tiene estados independientes:

| Evento | Estado y efecto |
| --- | --- |
| Inicio y saludo | `processing` → `speaking`; micrófono silenciado |
| Fin efectivo de reproducción | vaciar entrada, esperar 350 ms, `listening` |
| Audio del usuario confirmado por VAD | `processing`; silenciar pista y crear una sola respuesta |
| Herramienta aceptada | `searching`; esperar su resultado real |
| Voces, transcripts o commits durante una tarea | no cancelan ni crean respuestas; los commits ajenos se eliminan de la conversación |
| Otra herramienta en el mismo turno | `busy`, sin sustituir ni abortar la primera |
| Herramienta finalizada | devolver resultado; esperar fin de respuesta/audio anterior y solicitar confirmación sin herramientas |
| Respuesta hablada | `speaking`; mantener el micrófono silenciado hasta vaciar audio |
| Botón de parar | `cancelled`; cancelar tarea, generación y audio, cerrar medios |
| Nueva consulta tras terminar | volver a `listening`; aceptar un nuevo turno |

El servidor configura VAD con `create_response: false` e
`interrupt_response: false`. El cliente decide cuándo enviar `response.create`.
No se confía en ignorar un transcript después de que el proveedor ya haya
interrumpido la respuesta: se impide la interrupción automática y la pista
WebRTC envía silencio durante procesamiento, búsqueda y reproducción.

Se deduplican `call_id` e identificadores de entrada y se vinculan las
herramientas a la respuesta solicitada. Se aceptan los eventos completos de
argumentos, elemento o respuesta sin repetir su ejecución. Las respuestas
tardías de una sesión cerrada no pueden actualizar una sesión nueva.

La búsqueda existente de vuelos con presupuesto devuelve ahora una promesa y
recibe la señal de cancelación de la tarea. Conserva su endpoint, datos,
ordenación, enlaces y componentes. Las búsquedas sin presupuesto, hoteles y
paquetes mantienen la apertura de fichas/formularios que ya tenían.

El rearme depende de `output_audio_buffer.stopped`/`cleared` y del fin de
herramientas y respuestas, no solo de `response.done`. Una reproducción que
empieza mientras el rearme está pendiente cancela ese temporizador. Se piden
cancelación de eco y supresión de ruido al navegador; no se promete que todos
los dispositivos implementen esas opciones igual.

Los errores de conexión, permisos, micrófono, salida de audio y espera se
comunican usando los avisos de voz existentes. Un turno bloqueado durante
120 segundos se cierra con error, sin dejar el micrófono en un estado ambiguo.
Siguen vigentes los gestos de contexto existentes: cerrar la ficha, cambiar de
destino o idioma y salir de la página cancelan la solicitud asociada. Durante
una tarea o TTS, decir «para» no es una vía de cancelación: hay que usar el
control explícito. El botón sigue disponible por toque y teclado en los cuadros.

**No hay identificación biométrica del hablante.** Una voz ajena puede ser
aceptada mientras el estado es `listening`. El arreglo protege el turno y la
tarea que ya fueron aceptados.

Protocolo contrastado con la documentación oficial de
[VAD](https://developers.openai.com/api/docs/guides/realtime-vad) y los eventos
[de cliente](https://developers.openai.com/api/reference/resources/realtime/client-events)
y [de servidor](https://developers.openai.com/api/reference/resources/realtime/server-events).

## Validación reproducible

Instalación: `npm ci --no-audit --no-fund`. Sin cambios en dependencias ni lockfile.
Resultado local: **367/367 pruebas de código y 20/20 de navegador correctas**;
TypeScript, lint y compilación correctos (con los avisos previos de lint).

```text
node --require ./scripts/maintenance/network-guard.cjs --test tests/*.test.cjs
node node_modules/typescript/bin/tsc --noEmit --incremental false
node node_modules/next/dist/bin/next lint
node node_modules/next/dist/bin/next build
```

La batería completa y las nuevas regresiones cubren los siete idiomas,
argumentos inválidos, tareas repetidas, eventos tardíos, ruido durante espera,
búsqueda y TTS, fin de reproducción, nuevas consultas, cancelación, permisos,
errores de generación/conexión/salida y bloqueo por timeout. Lint conserva los
avisos anteriores de imágenes `<img>` y de retirada futura de `next lint`.
La compilación local requirió acceso a Google Fonts y a carpetas temporales;
la versión resultante se compiló correctamente sin cambiar Next.js.

Las pruebas de navegador se ejecutan aparte:

```text
node --test tests/browser/voice-turns.browser.cjs
```

Requieren Playwright (validado con 1.64.1) instalado como herramienta de pruebas.
Puede instalarse fuera del proyecto para conservar las dependencias de la web:

```text
npm install --prefix ../voice-browser-tools --no-save --no-package-lock --ignore-scripts --no-audit --no-fund playwright@1.64.1
```

Configurar `VOICE_PLAYWRIGHT_PATH` con la ruta absoluta de
`../voice-browser-tools/node_modules/playwright`, `VOICE_TEST_URL` con la copia
local iniciada con `next start -p 3100`, y opcionalmente
`VOICE_BROWSER_EXECUTABLE` con un Chromium/Edge instalado. Sin esa última
variable Playwright necesita su propio Chromium instalado.
`VOICE_SCREENSHOT_DIR` permite guardar capturas.

Las 20 pruebas ejecutan la portada y sus componentes reales en Edge/Chromium:
1440×1000 y emulación móvil de 390×844 con toque. Cubren el recorrido de
itinerario completo, audio de fondo, TTS, parada desde el cuadro, nueva sesión,
permiso denegado, respuesta tardía, búsqueda real del controlador de vuelos
con fallo y reintento, y controles traducidos/accesibles en los siete idiomas.
Red de proveedores, WebRTC, micrófono y sonido están simulados. Todas las
llamadas externas de la página se bloquean: no se hacen reservas ni se llama a
los proveedores reales. Por eso algunas imágenes externas no aparecen en las
capturas de pruebas; la Tierra local se carga y se conserva.

El catálogo mantiene sus 185 identidades y las 16 tarjetas originales. La
batería comprueba destinos, idiomas, vuelos Travelpayouts, hoteles Stay22 y sus
enlaces. No cambian los datos de destinos, activos de la Tierra, CSS del panel,
endpoints de proveedores, credenciales, configuración de Vercel ni producción.

## Prueba de voz real pendiente antes de fusionar

En la Preview de Vercel, en escritorio y en un teléfono real:

1. Iniciar voz y esperar al mensaje «Te escucho».
2. Pedir un itinerario de Madrid de dos días. Durante la espera, hacer que otra
   persona hable o reproducir televisión cerca. Debe terminar y mostrar Madrid.
3. Repetir con una búsqueda de vuelos con datos completos y presupuesto.
4. Durante la respuesta hablada, reproducir voz de fondo. Debe terminar el
   audio y volver a escuchar; su propia voz no debe iniciar otra consulta.
5. Hacer otra consulta tras el rearme. Debe iniciar exactamente una tarea.
6. Pulsar «Apagar voz» durante búsqueda y durante respuesta, también desde la
   ficha abierta. Debe detenerse; una respuesta tardía no debe sustituir contenido.
7. Denegar permiso y volver a intentarlo; probar pérdida de conexión y los siete
   idiomas. Verificar especialmente Safari/iPhone y el altavoz sin auriculares.

Las pruebas automáticas verifican la lógica y la interfaz; no validan la
acústica, el VAD real, el reconocimiento del modelo ni las políticas de audio
de Safari/iOS. La PR debe permanecer en borrador hasta esa comprobación y la
autorización expresa para fusionar. No se ha modificado `main` ni desplegado
en producción.
