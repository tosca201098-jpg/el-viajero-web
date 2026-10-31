# Sofía: preparación para producción

Fecha: 31 de octubre de 2026. Estado: preparación para revisión; **no autoriza publicar, fusionar ni cambiar las cuentas**.

## Resumen

La Preview ya ha demostrado escucha y respuesta audible en español: una conversación de 28 segundos, 318 créditos del plan Free, cierre normal y micrófono apagado. Esa prueba corresponde al commit `901afd70f0190c1ff181bbdf031cfc87ecdf2571`, sin sobrescribir el saludo del agente. No se ha repetido para preparar esta migración.

Se preparan dos transportes de voz conservados en el mismo árbol y una selección exclusivamente del servidor. La sustitución no elimina OpenAI: la voz anterior puede recuperarse mediante un cambio explícito de proveedor y un nuevo despliegue, sin revertir catálogos, buscadores, hoteles o itinerarios. Un error de Sofía nunca inicia automáticamente otra sesión OpenAI.

**Todavía no se puede autorizar la publicación comercial.** La cuenta utilizada es Free y falta resolver licencia, presupuesto, nueva clave de producción y variables de producción. No se ha contratado ningún servicio.

## Referencia pública antes del cambio

Lectura del panel de Vercel y de Git, sin ejecutar endpoints de IA:

| Dato | Referencia comprobada |
|---|---|
| Dominio público | `destinauta.com` |
| Despliegue de producción | `dpl_ABQUZTsJwaFzTLvtReQjnr7NWxCZ` |
| Revisión pública | `bbf31cbc9b560151cf2301bb7bed81b6f0f25c41` |
| Rama / estado | `main` / Ready |
| URL del despliegue conservado | https://vercel.com/el-viajero/el-viajero-web/ABQUZTsJwaFzTLvtReQjnr7NWxCZ |
| Preview que superó audio | https://vercel.com/el-viajero/el-viajero-web/8c3eGfBcT1kbp6bNut62nkDDBnvY |

Las variables de ElevenLabs, Redis e interruptores AI que se ven en Vercel están limitadas a Preview de `codex/sofia-elevenlabs`. Production conserva `OPENAI_API_KEY`, Travelpayouts y las variables públicas de Supabase; no hay variables compartidas vinculadas. Solo se han leído nombres y ámbitos, nunca valores privados. Antes de una futura publicación hay que volver a comprobar que este despliegue sigue siendo el actual.

## Voz anterior y nueva

| Aspecto | Voz pública anterior | Sofía preparada |
|---|---|---|
| Servicio | OpenAI Realtime, `gpt-realtime-2.1`, voz `marin` | ElevenLabs, voz Sofía `eZxqQzb5CuYo3Kl6EXfZ` |
| Autorización del servidor | `OPENAI_API_KEY` → `/v1/realtime/client_secrets` | clave ElevenLabs privada → GET del agente fijado y `/v1/convai/conversation/token` |
| Respuesta al navegador | credencial efímera `{ value }` | token efímero `{ token }` |
| Audio | WebRTC / SDP con `/v1/realtime/calls` | SDK `@elevenlabs/client@1.32.0`, WebRTC |
| Código conservado | `lib/voice/openai-session.ts`, `lib/voice/openai-route.ts`, parser de itinerarios de voz separado | `lib/voice/elevenlabs-session.ts`, `lib/voice/elevenlabs-route.ts` |
| Entrada común | `lib/voice/session.ts` y POST `/api/voice` | las mismas entradas; el servidor elige un solo proveedor |

El cliente OpenAI se conserva desde la base protegida `0bd1d46cd87feae64d5f70d931d40a9864747e4c` de la PR #37. La copia añade únicamente las adaptaciones de integración necesarias; la implementación pública previa sigue identificada por el SHA de producción de la tabla. La admisión Redis se mantiene también al volver a OpenAI.

La comparación de preservación confirma igualdad del cliente con esa base al deshacer únicamente el import local del parser (`./openai-itinerary` por `./itinerary`), normalizar CRLF a LF y quitar el salto final. SHA-256 normalizados: cliente `73073f40e765a763a87abc41b7f89bd44e4a1c82f8af139ecf12b77aba0a466f`; módulo de itinerarios legado `729ef3e809cba27cbe46adda2e7f12d1bc1ca32c16438ba3cd8d7245160a54dc`. Las pruebas históricas de sesión/turnos se conservan en suites separadas. La fachada limita a 300 segundos también la sesión OpenAI; eso es un cierre del cliente, no un límite de facturación garantizado por OpenAI.

La clave OpenAI **no debe retirarse**: la IA escrita y los itinerarios siguen usando `/v1/responses` y el generador existente. Cambiar `AI_VOICE_PROVIDER` no cambia el proveedor escrito, su modelo ni sus entradas.

### Configuración de Sofía comprobada en lectura

- Agente: `agent_2201m677yj19e6499g2649n774f6`.
- Versión fija: `agtvrsn_2501m679we79ekz985446fbyygkb`; no seguir automáticamente Main o un borrador.
- Idioma base español, voz Sofía y sus instrucciones conservadas en esa versión; saludo guardado en el agente, sin `first_message` desde el navegador.
- Herramientas cliente: `consultar_catalogo`, `mostrar_destino`, `buscar_viaje`, `crear_itinerario`, todas con respuesta esperada.
- Máximo 300 segundos, silencio 90 segundos, detección de voz de fondo y máximo 1.024 tokens por respuesta.
- Autenticación activada; concurrencia 1; límite del agente **15 llamadas/día**, ráfagas desactivadas y cola explícitamente desactivada.

El límite de 15 es el leído en **Sofía nueva**, no el de 3 llamadas/día acordado anteriormente para el agente antiguo. No se han modificado agentes. Las cuotas Redis de la web son adicionales y pueden ser mucho más restrictivas.

## Activación cerrada y reversión por proveedor

`AI_VOICE_PROVIDER` solo se interpreta en el servidor. Production conserva OpenAI como proveedor por defecto cuando la variable no existe. Un valor desconocido bloquea, sin recurrir a otro proveedor. La Preview autorizada conserva Sofía por defecto para no cambiar sus variables actuales.

Para solicitar Sofía en Production harán falta **simultáneamente** el selector explícito, los interruptores de voz y la aprobación de producción, además del repositorio y rama de producción correctos y la versión exacta revisada. La validación local precede a la reserva Redis. El servidor comprueba después la identidad del agente/versión y sus controles, incluida `queueing_config.enabled === false`, antes de emitir un token. Si falta un dato de seguridad, falla cerrado.

El navegador hace una sola solicitud de autorización a `/api/voice`; el transporte se elige por la respuesta del servidor. No solicita otro token ni una reserva de respaldo. Parar, salir o cancelar una conexión tardía deben cerrar el transporte seleccionado.

## Credenciales y variables propuestas: no aplicadas

### Clave de producción independiente

Propuesta a aprobar: clave denominada, por ejemplo, `DESTINAUTA-Sofia-Produccion-Servidor`, solo guardada en el gestor de secretos de Vercel **Production** como `ELEVENLABS_API_KEY`. No reutilizar la clave temporal de Preview, que mantiene su límite 1.500 y caduca el 7 de noviembre de 2026 a las 09:00 de Madrid.

- ElevenAgents **Write**, los demás accesos denegados. En esta cuenta Read permitió consultar el agente pero devolvió 401 al obtener el token; Write resolvió esa autorización. El servidor solo usa GET del agente y emisión de token, sin operaciones de edición.
- Este permiso es más amplio que obtener tokens. Una clave de usuario no queda técnicamente limitada a un solo agente: hereda los recursos del usuario. El aislamiento aquí consiste en clave independiente, almacenamiento exclusivo en Production, código limitado al par agente/versión y consumo acotado. No se afirma que el proveedor imponga un alcance por `agent_id`.
- Caducidad propuesta: 30 días. Revisar y renovar al menos 7 días antes; no crear una clave indefinida.
- Presupuesto indicado por el usuario: **25 € al mes, total máximo propuesto**. El límite de créditos del proveedor sigue pendiente de aprobación junto con el plan; se propone 1.500 inicialmente para el piloto, sin confundirlo con la clave temporal ni con una decisión permanente. La prueba consumió 318 créditos en 28 segundos; no existe una conversión universal demostrada a minutos o euros y cinco minutos completos pueden agotar un límite pequeño.
- Mantener detección de filtraciones. Activar avisos de consumo disponibles, con destinatario confirmado, antes del lanzamiento. No activar PAYG, recargas, ampliaciones automáticas o facturación por esta tarea.

Renovación autorizada futura: crear reemplazo con los mismos permisos y límite aprobados; guardar solo en Production; desplegar y verificar; retirar la anterior después de validar el reemplazo y con autorización. Nunca retirar `OPENAI_API_KEY` ni la clave Preview como parte de esa rotación. No se pide al usuario pegar secretos en el chat.

### Configuración de producción pendiente

| Variable | Valor o decisión pendiente |
|---|---|
| `AI_VOICE_PROVIDER` | `elevenlabs` solo en el lanzamiento expresamente autorizado; `openai` para reversión de voz |
| `AI_ENABLED` | `true` con Redis ya configurado |
| `AI_VOICE_ENABLED` | `false` durante preparación; `true` solo para lanzamiento aprobado |
| `ELEVENLABS_ENABLED` | `false` durante preparación; `true` solo para lanzamiento aprobado |
| `ELEVENLABS_PRODUCTION_APPROVED` | `false` hasta autorización explícita; entonces `true` |
| `ELEVENLABS_AGENT_VERSION_ID` | versión fija `agtvrsn_2501m679we79ekz985446fbyygkb` |
| `ELEVENLABS_API_KEY` | nueva clave de servidor Production; valor nunca documentado |
| `AI_REDIS_REST_URL`, `AI_REDIS_REST_TOKEN` | credenciales para cuotas Production con permiso EVAL; no copiar a ciegas credenciales de Preview |
| `AI_RATE_LIMIT_SECRET` | secreto independiente de Production de al menos 32 caracteres |
| `AI_ITINERARY_ENABLED` | **`true` para conservar funcionando la IA escrita** al integrar las protecciones ya incluidas en PR #38 |
| `OPENAI_API_KEY` | conservar la actual: necesaria para IA escrita y reversión de voz |
| cuotas de voz Redis | aprobar antes de lanzar; no elevar por esta preparación |

No configurar variables `NEXT_PUBLIC_*` para credenciales, aprobación ni elección de proveedor. Los tokens de sesión efímeros sí llegan al navegador por necesidad; no prometer ausencia de todo token en el navegador. No se registran claves, tokens, IP ni respuestas privadas.

**Importante para los itinerarios:** main no contiene las protecciones de PR #37; PR #38 sí las incluye. Si se fusionase sin Redis e `AI_ITINERARY_ENABLED=true`, la IA escrita quedaría pausada. Por eso no se puede publicar la PR configurando solo las variables de voz. No se modifica ahora su código ni su clave.

### Costes y licencia

Los contadores Redis reservan sesiones, no dinero: por defecto 2/minuto/IP, 5/día/IP, 20/día global y 3 por ventana fija de 31 días para voz. Las ventanas no equivalen al ciclo de factura. Intentos admitidos fallidos consumen reserva; no reiniciar contadores para repetir pruebas. Producción y Preview usan espacios de claves distintos, incluso si un día compartieran almacén. Es preferible un almacén/credencial Production independiente si el plan actual lo permite sin contratar; en caso contrario se debe aprobar expresamente la alternativa.

El límite de créditos del proveedor, las cuotas web, el máximo de cinco minutos y la concurrencia uno se complementan; no son un tope garantizado en euros ni detienen todas las conversaciones ya abiertas. La cuenta Free no tiene licencia comercial. Por los enlaces de afiliación, se considera que DESTINAUTA necesita aclarar y autorizar el uso comercial antes de publicar: es una conclusión de preparación, no una contratación.

Con el presupuesto máximo de 25 €/mes, la propuesta conservadora es **ElevenAgents Starter mensual**, anunciado a **6 USD/mes recurrentes**, 75 minutos incluidos y licencia comercial. No usar promociones del primer mes para calcular el coste recurrente ni contratar Creator por esta tarea. El precio publicado excluye impuestos; el total final en euros, IVA y cambio debe comprobarse y aprobarse antes de pagar. No se garantiza un total de 25 € a partir de un precio en dólares.

Mantener las 3 reservas globales por 31 días y 300 segundos por sesión limita nominalmente estas admisiones web a 15 minutos por ventana; no equivale a una garantía de consumo del proveedor, por otros canales, posible reutilización de tokens o diferente ciclo. La página actual distingue minutos Agents y cargos LLM/créditos: no convertir los 1.500 créditos en minutos o dinero. Para el piloto, no comprar PAYG, no activar Auto Top Up ni habilitar consumo extra/UBB legacy. Si la cuenta exige alguno de esos servicios para funcionar, detenerse y consultar. Avisos de uso no son un tope de factura. Revisar uso del conjunto de la cuenta y no solo esta clave.

Fuentes oficiales consultadas:

- [Licencia comercial y plan Free](https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform).
- [Permisos y gestión de claves](https://elevenlabs.io/docs/overview/administration/workspaces/api-keys).
- [Cuentas de servicio y sus condiciones de disponibilidad](https://elevenlabs.io/docs/overview/administration/workspaces/service-accounts).
- [Token temporal WebRTC y versión](https://elevenlabs.io/docs/api-reference/conversations/get-webrtc-token).
- [Avisos de consumo](https://elevenlabs.io/docs/help-center/account/general/can-i-be-notified-when-im-running-low-on-credits).
- [Facturación y créditos adicionales](https://elevenlabs.io/docs/overview/administration/billing).
- [Precio recurrente y minutos de ElevenAgents](https://elevenlabs.io/pricing/agents?price.platform=agents_platform).
- [Coste de Agents y condiciones para exceder la cuota](https://elevenlabs.io/docs/help-center/product/eleven-agents/how-much-does-eleven-agents-cost).
- [PAYG y recargas automáticas](https://elevenlabs.io/docs/overview/administration/pay-as-you-go).

No se han verificado ni adquirido los derechos comerciales concretos de la voz de biblioteca. No asumir que un plan o un precio histórico resuelve todos los derechos. No reutilizar el audio de la prueba Free como material comercial.

### Compatibilidad del alojamiento existente

El panel muestra **Vercel Hobby**. Sus condiciones lo limitan a uso personal no comercial y las directrices citan expresamente los sitios cuya finalidad principal son enlaces de afiliación. DESTINAUTA contiene Travelpayouts/Stay22: eso obliga a aclarar el uso previsto, aunque la presencia de enlaces no demuestra por sí sola ingresos o finalidad principal. Confirmar si se usan o se pretende usarlos para comisiones; si el uso es comercial, se necesita un alojamiento/plan compatible o confirmación expresa de Vercel antes del lanzamiento. No se ha cambiado el plan ni contactado con soporte.

Los 25 €/mes indicados se han solicitado como presupuesto de **Sofía**, no como autorización para comprar Vercel, Redis u otros servicios. No incluir una ampliación de alojamiento automáticamente ni afirmar que todos los servicios caben en ese importe. Resolver y presupuestar esa cuestión por separado antes de aprobar producción.

- [Vercel: uso comercial y afiliación](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage).
- [Condiciones del plan Hobby](https://vercel.com/legal/terms#4-hobby-plan).

## Despliegue futuro: siempre con autorización

1. Revisar este informe y los cambios de la PR. Resolver licencia y aprobar presupuesto, límite de créditos y cuotas antes de crear la clave o contratar nada.
2. Autorizar por separado nueva clave y configuración Production; el usuario introduce/guarda secretos en Vercel, sin compartirlos. Mantener voz cerrada durante esa preparación. Conservar OpenAI y habilitar correctamente los itinerarios.
3. Verificar nuevamente main, PR #37 y el despliegue público: coordinar las protecciones compartidas; no fusionar #37 automáticamente ni tocar #36. Las funciones de viajes añadidas previamente por voz en PR #38 deben formar parte de la revisión final.
4. Con aprobación expresa de la revisión exacta, construir/desplegar desde **main** con entorno Production y dominio todavía sin cambiar, si la cuenta lo permite. No promover directamente la Preview de `codex/sofia-elevenlabs`: además de usar secretos Production distintos, conservaría una referencia de rama que nuestra guarda rechaza. La fusión a main y cualquier cambio de autoasignación/despliegue también requieren autorización y preparación previa de variables; no fusionar para intentar preparar después. Si no se puede generar un candidato sin publicar el dominio, detenerse y acordar el procedimiento antes de continuar.
5. Publicar únicamente después de la autorización de fusión/despliegue y activación. Autorizar entonces una primera conversación pública breve y un límite inicial reducido; la prueba ya superada en Preview no acredita las futuras credenciales Production.
6. Verificar voz, cierre y una petición escrita con autorización específica para ese consumo. Revisar métricas de errores/cuotas. No ampliar tráfico, límites ni plan automáticamente.

## Reversión sin cambiar el resto de DESTINAUTA

Primera opción, solo voz, previa autorización: configurar `AI_VOICE_PROVIDER=openai` y `ELEVENLABS_ENABLED=false` / `ELEVENLABS_PRODUCTION_APPROVED=false`, conservando `AI_ENABLED=true`, `AI_VOICE_ENABLED=true`, Redis, `AI_ITINERARY_ENABLED=true` y la clave OpenAI. Realizar un nuevo despliegue de **la misma revisión**. El cliente recibirá el contrato OpenAI y usará el transporte conservado; el resto del árbol no se revierte. Un cambio de variables no cambia despliegues existentes ni cierra audio ya abierto.

Si se precisa pausar solo nuevas sesiones, usar `AI_VOICE_ENABLED=false` y un despliegue autorizado, conservando los itinerarios. No usar `AI_ENABLED=false` como pausa de voz porque también afectaría a la IA escrita.

Último recurso: Instant Rollback de Vercel al despliegue `ABQUZTsJwaFzTLvtReQjnr7NWxCZ`, tras comprobar que sigue disponible y que OpenAI sigue válido. Vercel Hobby permite volver solo al despliegue de producción inmediatamente anterior. Esta opción revierte **todo** el despliegue y recupera sus variables incorporadas, no los ajustes externos ni Redis. La versión pública anterior no tiene las protecciones nuevas, por lo que no es la reversión preferida para voz y su uso exige valorar esa diferencia.

No borrar agentes, claves, código OpenAI ni despliegue previo hasta superar aceptación pública y recibir autorización de retirada. No reiniciar cuotas ni desactivar autenticación para resolver incidencias.

- [Cambios de variables y nuevos despliegues](https://vercel.com/docs/environment-variables/managing-environment-variables).
- [Promover un despliegue](https://vercel.com/docs/deployments/promoting-a-deployment).
- [Alcance y limitaciones de Instant Rollback](https://vercel.com/docs/instant-rollback).

## Comprobaciones y límites de la evidencia

La preparación debe superar la suite local con red externa bloqueada, TypeScript y una compilación completa de Next.js. Las pruebas cubren selección Production/Preview, bloqueo sin aprobación y sin reserva, versión fija, identidad devuelta, cola ausente/activada, cuota denegada, contratos OpenAI/ElevenLabs, cancelación y ausencia de fallback automático.

Se revisa el paquete cliente compilado para evitar claves de servidor. Los archivos de catálogos, tarjetas, imágenes, buscadores, página e itinerarios no se editan en esta preparación. La suite existente comprueba los destinos y las 16 tarjetas; las acciones de vuelos/hoteles que ya estaban en PR #38 no se presentan como diferencias nuevas.

Evidencia audible válida: la única prueba humana ya superada de 28 segundos en español, con escucha y respuesta, misma voz y versión. Las pruebas locales nuevas son simulaciones: no certifican de nuevo el audio, los siete idiomas hablados, llamadas de cinco minutos, una clave futura ni las variables Production todavía inexistentes. No se han repetido llamadas ni ejecutado el diagnóstico temporal.

Resultados locales de esta preparación: **460 pruebas aprobadas**, TypeScript sin errores y compilación completa Next.js correcta. El build mantiene los avisos de imágenes `<img>` en archivos que esta preparación no edita. Red externa bloqueada en pruebas; compilación con claves vacías en el proceso y solo fuentes de Google permitidas. Escaneo del paquete cliente: cero coincidencias de claves/variables privadas del servidor y cero mapas de fuente públicos; escaneo del código preparado sin claves privadas con formato de proveedor. `git diff --check` limpio y ninguna modificación nueva en página, catálogos, imágenes, buscadores, hoteles, generador escrito o dependencias.

No tomar estos resultados como una publicación, aceptación auditiva nueva o autorización de producción. La revisión final guardada y el estado de Preview/PR se comunican en la entrega.
