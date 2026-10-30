# Sofía de ElevenLabs — integración en Preview

Estado: cambio de conexión preparado localmente para revisión, NO publicado ni autorizado para producción. Actualización: 30 de octubre de 2026.

## Sofía nueva en la rama de pruebas

El cambio preparado usa `agent_2201m677yj19e6499g2649n774f6` y la versión inmutable verificada `agtvrsn_2501m679we79ekz985446fbyygkb` exclusivamente cuando coinciden VERCEL=1, VERCEL_ENV=preview, VERCEL_GIT_COMMIT_REF=codex/sofia-elevenlabs, VERCEL_GIT_REPO_OWNER=tosca201098-jpg y VERCEL_GIT_REPO_SLUG=el-viajero-web. El selector permanente está en `lib/voice/preview-target.ts`; no depende del diagnóstico temporal.

En ese ámbito, `ELEVENLABS_AGENT_VERSION_ID` debe coincidir exactamente con la versión verificada indicada arriba. Si falta o tiene otro valor, la ruta bloquea la conexión antes de contactar con ElevenLabs. El GET de configuración y la solicitud de token usan el mismo agente/versión; además se verifican los IDs devueltos. Fuera de ese ámbito se conserva el agente anterior y el tratamiento previo de la variable de versión. No se autoriza producción.

La nueva Sofía ya conserva la voz confirmada, autenticación y límites; tiene las cuatro herramientas, duración de 300 segundos, silencio de 90 segundos y 1.024 tokens por respuesta. No se ha probado desde la web. Los ajustes no solucionan la cuota de admisión.

Antes de publicar una nueva Preview, obtener confirmación y fijar `AI_VOICE_ENABLED=false` exclusivamente para Preview de esta rama. Mantener la voz desactivada durante el despliegue y actualizar en ese mismo ámbito `ELEVENLABS_AGENT_VERSION_ID` a la versión verificada. No cambiar claves, cuotas ni valores de producción. No activar voz ni ejecutar diagnósticos remotos con la autorización de publicar archivos.

Validación local del borrador: 38 pruebas específicas de ruta de voz, selección de agente, admisión y diagnóstico con proveedores simulados; TypeScript 5.2.2 sin errores en los módulos de servidor cambiados y sus dependencias. No se ha realizado una compilación completa de Next.js ni una llamada real. Ninguna validación local acredita las credenciales guardadas en Vercel.

Último bloqueo observado en la Preview vigente: `ADMISSION_QUOTA`, 30 de octubre de 2026, 21:46:06.79 CET. Falta determinar el contador y vencimiento; los intentos admitidos que terminan en 503 también reservan cuota. No reiniciar ni ampliar contadores para repetir pruebas. Los 401/503 históricos siguen pendientes de diagnóstico.

## Base y alcance
Rama web `codex/sofia-elevenlabs`, creada desde `0bd1d46cd87feae64d5f70d931d40a9864747e4c` (PR #37). La PR nueva contra main incluye esas protecciones; no modifica ni fusiona #37. Antes de integrar cualquiera de las dos hay que coordinar sus cambios compartidos. La PR #36 y sus 12 fichas de Croacia permanecen separadas. No se editan catálogos, tarjetas, estilos ni proveedores de vuelos/hoteles.

El único transporte de voz activo en esta rama es `@elevenlabs/client@1.32.0`, WebRTC. Se conserva OpenAI para itinerarios. La integración anterior de voz se recupera desde el commit de partida, sin mantener un segundo asistente. La documentación histórica de turnos describe esa versión anterior.

## Configuración anterior (histórico, sustituida solo en el ámbito nuevo de pruebas)
Agente: `agent_9701m5zn3h9bf57ata0q3qzn1ag6`.
Voz: `eZxqQzb5CuYo3Kl6EXfZ`, Sofia - Natural Conversations. La biblioteca la identifica como español peninsular.
Rama ElevenLabs: `codex-destinauta-preview`, ID `agtbrch_0101m616vm0gfr4v2qjjawxxazrh`, 0% de tráfico automático. Se puede acceder a una rama de 0% mediante selección explícita: no equivale a privada.
Versión preparada: `agtvrsn_3801m618j78bey69jjc08tdm4ppc`.

El borrador original conserva Sofía y español, pero la UI mostraba 600 segundos, silencio -1 y filtro de voces de fondo desactivado. La versión publicada original seguía con voz distinta e inglés. No se sobrescribe ni publica ese borrador.
La rama nueva sí guarda voz Sofía, español, máximo 300 s, cierre por silencio 90 s, filtro de voces de fondo, 1.024 tokens máximos por respuesta y turnos especulativos desactivados. Adjuntos desactivados. Herramientas conectadas al catálogo y acciones reales.

**Pendiente crítico:** autenticación y límites de llamadas son ajustes globales, editables únicamente desde Main del agente, según la UI. Las escrituras en la rama devolvieron los valores antiguos: autenticación desactivada, 100.000 llamadas/día, concurrencia de suscripción y ráfagas activas. No confundir Main del agente con main de GitHub. No se ha cambiado Main del agente para no publicar el borrador original accidentalmente. Resolver en el panel y comprobar de nuevo antes de emitir tokens.

## Funciones y efectos
- `consultar_catalogo`: fichas reales, máximo 12 resultados por consulta. No proporciona precios.
- `mostrar_destino`: abre una ficha existente.
- `buscar_viaje`: valida origen/destino, fechas reales, 1–9 viajeros y presupuesto total/por persona. Vuelos invoca la búsqueda existente incluso sin presupuesto. Hotel navega a la página existente de Stay22 y al salir se cierra la voz de portada. Ambos muestra vuelos y deja los datos de hoteles preparados para abrir desde la ficha; no crea un paquete combinado ni promete un presupuesto conjunto.
- `crear_itinerario`: reutiliza el generador actual de OpenAI, con destino y 1–7 días. Confirma éxito solo después de generar y mostrar el resultado.
- Parar, salir de página y cambiar idioma cancelan herramientas y cierran audio. Una conexión tardía se cierra y no se solapa con otra. El micrófono queda silenciado durante herramientas y reproducción. Se deduplican los IDs de herramienta observados por el SDK.
- El SDK usa la opción documentada `singlePeerConnection: false` para evitar depender del nuevo protocolo de conexión única de LiveKit.

## Controles del servidor
Se mantienen las cuotas Redis atómicas de #37, sin cambiar las de itinerarios. Para voz se añade un cuarto contador: por defecto tres admisiones por ventana fija de 31 días. Con cinco minutos máximos se reserva un máximo nominal de 15 minutos de sesiones admitidas por ventana. Los intentos fallidos también consumen reserva; no se reembolsa para evitar carreras.

Esto NO garantiza 25 €/mes: ventanas fijas no equivalen al ciclo de facturación; el LLM se factura aparte; otras llamadas desde ElevenLabs, otros canales o credenciales, posible reutilización de tokens y cambios de configuración quedan fuera del contador web. No se ha demostrado que el token sea de un solo uso. No presentar esta cuota como tope monetario.

Por defecto todo permanece cerrado. Si faltan Redis, secreto HMAC, clave o versión, devuelve 503; si se exceden cuotas, 429. No existe respaldo en memoria. IP anónima con HMAC y agrupación IPv6 /64: evita cookies falsificables, pero puede afectar a visitantes de la misma red y no identifica personas. No sustituye la autenticación global del agente.

El servidor valida la versión fijada, voz, idioma, límites, filtro y herramientas antes de pedir un token temporal. Solo devuelve ese token. Nunca claves, configuración del proveedor ni errores privados. Producción requiere además `ELEVENLABS_PRODUCTION_APPROVED=true`, que no se ha configurado.

## Preparación manual antes de una prueba real
1. Desde Main del agente, activar autenticación; limitar concurrencia a 1, llamadas diarias a 3 y desactivar ráfagas. Comprobar que no se publica ni descarta el borrador sin intención. Revisar la lista de hosts permitidos y la retención de audio/transcripciones.
2. Mantener idioma y saludo como únicas sobrescrituras necesarias. No permitir cambiar duración, prompt, modelo, herramientas ni voz desde el navegador. Verificar las siete lenguas y el primer mensaje sobre la versión fijada.
3. En Vercel, solo en Preview de esta rama, aportar `ELEVENLABS_API_KEY` y `ELEVENLABS_AGENT_VERSION_ID`. La clave debe tener los mínimos permisos para leer el agente y obtener tokens. No añadirla con prefijo NEXT_PUBLIC ni guardarla en archivos versionados.
4. Configurar las variables Redis/HMAC y los interruptores AI de #37. Activar `ELEVENLABS_ENABLED` solo después de comprobar autenticación. Mantener producción desactivada. Conservar la protección de acceso de Vercel Preview.
5. Verificar una reserva Redis real y un 429 con un límite bajo exclusivamente en Preview. Las pruebas actuales simulan el almacén: no certifican la ejecución real de Lua en Upstash.
6. Hacer pruebas cortas de voz en español, inglés, francés, alemán, italiano, portugués y catalán, con aceptación auditiva por una persona que conozca cada idioma. Comprobar fichas, vuelos, hoteles, itinerarios, Parar, cambio de idioma, ruido de TV y límites reales de silencio/duración. Un test de parámetros no prueba pronunciación ni calidad sonora.

## Presupuesto y licencia
La cuenta se ha comprobado en el panel: plan Free. No incluye la licencia comercial anunciada para Starter. La página oficial consultada anuncia Starter: 6 USD/mes, 75 minutos y licencia comercial; Creator: 22 USD/mes, 275 minutos. Descuentos iniciales no son precio recurrente. Impuestos excluidos; LLM facturado aparte; minutos extra y ráfagas pueden añadir cargos. No se ha contratado nada ni confirmado la factura final en euros.

Propuesta para poco tráfico: estudiar Starter, sin recarga/consumo extra automático si el panel permite desactivarlo, reservar margen para LLM y pruebas, y fijar una cuota conservadora antes de aumentar las tres sesiones actuales. No asegurar que Creator cabe en 25 € con impuestos. Revisar el precio final y licencia de esta voz de biblioteca en la cuenta antes de cualquier oferta pública; la descripción de la voz no acredita por sí sola todos los derechos comerciales.

Activar avisos de consumo/saldo disponibles en la cuenta y comprobar destinatarios; revisar semanalmente minutos, coste LLM y factura. Las alertas operativas del agente no son un tope de gasto. No se han configurado destinatarios ni comprado planes.

Fuentes oficiales:
- https://elevenlabs.io/docs/eleven-agents/libraries/java-script
- https://elevenlabs.io/docs/api-reference/conversations/get-webrtc-token
- https://elevenlabs.io/pricing/agents
- https://elevenlabs.io/docs/eleven-agents/customization/voice/customization/language

## Verificación
Las pruebas locales utilizan proveedores simulados y bloqueo de red. Comprueban cierre, carreras de conexión, deduplicación, respuestas sanitizadas, cuotas, validación de configuración y generación visible de itinerarios en los siete idiomas.
No equivalen a una conversación audible real ni a ofertas verificadas en los proveedores. No se debe fusionar hasta completar los pasos manuales y la aceptación en Preview.

Resultado local: 382 pruebas generales superadas, más 4 pruebas nuevas de acciones de viaje. Tras el último refuerzo del servidor, sus 5 pruebas y las 4 nuevas de viajes vuelven a pasar. Compilación de Next.js y TypeScript correcta. La prueba de navegador de este archivo es una prueba mínima adaptada; no se ha ejecutado como suite Playwright en esta revisión.


### Diagnóstico mínimo del 503 en Runtime Logs

Solo se emiten códigos constantes con prefijo `SOFIA_DIAGNOSTIC` cuando
`VERCEL_ENV=preview` y `VERCEL_GIT_COMMIT_REF=codex/sofia-elevenlabs`.
No se añaden peticiones externas, reintentos ni reservas adicionales. Las cuotas,
los bloqueos y las respuestas públicas se mantienen.

- `ADMISSION_FLAGS/ORIGIN/IP/LIMITS/REDIS_CONFIG`: bloqueo previo a Redis.
- `ADMISSION_REDIS_HTTP/MALFORMED/NETWORK/TIMEOUT`: fallo del almacén de cuotas.
- `ADMISSION_QUOTA`: cuota agotada (429).
- `VOICE_FLAGS/CREDENTIALS/VERSION`: configuración local incompleta o desactivada.
- `VOICE_CHECK_HTTP/CREDENTIALS/MALFORMED/CONFIG/NETWORK/TIMEOUT`: validación del agente.
- `VOICE_TOKEN_HTTP/CREDENTIALS/MALFORMED/NETWORK/TIMEOUT`: solicitud del token.
- `VOICE_REQUEST`: fallo inesperado al leer la petición.

Cuando la nueva Preview esté Ready, abrir Runtime Logs de ese despliegue,
filtrar por `/api/voice` y hacer **una sola prueba controlada**. Si falla,
copiar únicamente el código `SOFIA_DIAGNOSTIC`; no compartir cabeceras,
tokens ni cuerpos de respuesta. No repetir el micrófono antes de Ready.
La emisión correcta de un token no se registra y no demuestra voz audible.

