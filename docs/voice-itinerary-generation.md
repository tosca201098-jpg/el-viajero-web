# Generación de itinerarios mediante voz

> El control de turnos, sustitución de peticiones y cancelación descrito abajo
> queda actualizado por [Protección de turnos de voz](voice-protected-turns.md).
> Una petición nueva ya no sustituye a una tarea activa: el micrófono permanece
> en pausa hasta terminar la tarea y su respuesta hablada.

## Recorrido

`crear_itinerario({ destino, dias })` solicita una ficha existente del catálogo y
abre su planificador. `dias` debe ser un entero de 1 a 7. La herramienta no pide
origen, vuelos, fechas ni viajeros. Un destino sin ficha devuelve
`unknown_destination`; no se inventan fichas ni contenido.

`VoiceSession` valida los eventos completos de Realtime y deduplica por
`call_id`. El controlador de la portada busca la misma ficha canónica que ya
utiliza la web y entrega una petición cancelable a `ItineraryPlanner`.
El planificador llama a su función `generate()` existente: no hay otro generador
ni cambios en `/api/itinerary`, sus modelos o su validación de resultados.

La petición de voz usa explícitamente su duración e idioma y omite el contexto
de fechas, viajeros y presupuesto del buscador. Los botones manuales conservan
su recorrido y su contexto cuando se abre una ficha normalmente. Tras una
petición de voz, el planificador muestra la duración solicitada y permite seguir
utilizando sus botones manuales.

El resultado `success` solo se resuelve después de validar la respuesta y
renderizar `ItineraryContent`. Entonces se desplaza el planificador a la vista,
se enfoca su sección y se devuelve el resultado mediante
`conversation.item.create` / `function_call_output`. El posterior
`response.create` espera al final de la respuesta de Realtime en curso y usa
`tool_choice: none`, para que el reconocimiento hablado no repita la herramienta.
El asistente recibe destino, días e idioma, no actividades inventadas.

El protocolo se basa en la [documentación oficial de Realtime](https://developers.openai.com/api/docs/guides/realtime-conversations).
`buscar_viaje`, su esquema y su procesamiento existentes se conservan; la prueba
de regresión compara su esquema completo con una copia del de `main`.

## Cancelación, errores e idiomas

- Detener la voz, cerrar la ficha, cambiar de destino o cambiar de idioma cancela
  la petición pendiente. Se descartan las respuestas tardías incluso si el
  transporte simulado ignora `AbortSignal`.
- Una petición nueva sustituye a la anterior. Un mismo `call_id` nunca vuelve a
  ejecutarse; otra petición explícita puede generar una variación. El montaje
  con repetición de efectos de React no inicia dos peticiones.
- Una generación manual en curso devuelve `busy` a la herramienta sin iniciar
  una segunda generación ni cancelar la manual.
- Los errores de generación muestran el aviso existente del planificador y
  devuelven `generation_failed`; no se confirma un éxito. Los argumentos
  incorrectos devuelven `invalid_arguments` sin invocar el generador.
- La sesión y el itinerario usan el idioma seleccionado: español, inglés,
  francés, alemán, italiano, portugués o catalán. Al cambiarlo se detiene la
  sesión anterior; el usuario puede iniciar otra en el nuevo idioma.
- Un fallo al enviar la confirmación por el canal de datos cierra y libera la
  sesión mediante el manejo de errores de voz existente.

Cancelar aborta la petición del navegador y evita actualizar la interfaz. No se
garantiza que una llamada al proveedor ya iniciada en el servidor deje de
consumir recursos; no se ha alterado el endpoint existente para ese propósito.
La cancelación cubierta corresponde a los controles y cambios de contexto
anteriores; no se añade una herramienta separada para cancelar mediante una frase.

## Validación y límites

Base: `main` en `3a7e574c249bea27112cff8c84ec102c7fc2c907`.
Node.js 24.19.0, npm 11.9.0, Next.js 15.5.28. Sin archivos de entorno ni claves
reales de servicios en la copia de trabajo.

- Instalación limpia: `npm ci --no-audit --no-fund`, 390 paquetes. Sin cambios
  en dependencias ni lockfile.
- `node --test tests/*.test.cjs`: 100 pruebas, incluidas las 78 anteriores y 22
  nuevas. Cubren el recorrido herramienta → ficha → `generate()` → contenido
  visible → resultado, los siete idiomas, días inválidos, destino desconocido,
  fallos del proveedor y del canal, peticiones repetidas, respuesta incompleta,
  cancelación, respuesta tardía, cambio de destino/idioma y generación manual.
- TypeScript: `node node_modules/typescript/bin/tsc --noEmit --incremental false`.
- Lint: `node node_modules/next/dist/bin/next lint`; mantiene los avisos previos
  sobre `<img>` y la retirada futura de `next lint`.
- Compilación: `node node_modules/next/dist/bin/next build`, 27 páginas.
  Una ejecución local terminó correctamente tras crear los directorios temporales de
  rutas bajo `.next/server/app` y `.next/types/app` por un error local `EPERM`.
  Las reejecuciones posteriores volvieron a encontrar ese bloqueo al crear
  carpetas; la compilación del commit definitivo se verifica además en Vercel y
  se registra en la PR. No se modificaron scripts ni configuración del proyecto.

Las pruebas de recorrido ejecutan el controlador real de la portada, el catálogo,
la sesión y los componentes reales del planificador/contenido con un planificador
de hooks simulado. React, red, micrófono, WebRTC y respuestas de OpenAI están
simulados. Son pruebas de integración de código, no una prueba de navegador con
audio ni una evaluación del reconocimiento de voz del modelo real.

La compilación es real. El estado de Vercel y las comprobaciones posibles sobre
la Preview se registran en la PR después de publicarla. Antes de fusionar queda
pendiente una prueba con micrófono y OpenAI reales en un entorno autorizado,
incluida la selección efectiva de la herramienta y su respuesta hablada.

No hay cambios en vuelos, fechas flexibles, precios, catálogo, Supabase, Resend,
SEO, rutas públicas, identificadores técnicos, credenciales ni configuración de
Vercel. No se han usado servicios reales de generación ni publicado en producción.
