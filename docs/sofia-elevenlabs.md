# Sofía de ElevenLabs — integración de voz

Actualizado: 31 de octubre de 2026. Rama `codex/sofia-elevenlabs`, PR #38 en borrador. **Sin publicación ni autorización de Production.**

## Resultado comprobado

Sofía nueva escucha y responde con audio en la Preview privada. Prueba humana ya superada: 28 segundos, español, 318 créditos del plan Free y cierre normal. Corresponde a `901afd70f0190c1ff181bbdf031cfc87ecdf2571`. No se ha repetido para preparar producción.

Agente `agent_2201m677yj19e6499g2649n774f6`, versión fija `agtvrsn_2501m679we79ekz985446fbyygkb`, voz Sofía `eZxqQzb5CuYo3Kl6EXfZ`. Autenticación activa, concurrencia uno, 15 llamadas/día en el agente nuevo, sin ráfagas ni cola. Duración 300 segundos, silencio 90 segundos, detección de voz de fondo y máximo 1.024 tokens por respuesta.

El cliente utiliza el saludo guardado del agente. No enviar `first_message`: ElevenLabs lo rechazó en ejecución aunque la lectura de configuración lo marcaba permitido. Mantener `singlePeerConnection:false`, que ya funcionó, sin cambiar dependencias por un problema anterior ya resuelto.

## Preparación reversible

[Informe de preparación, credenciales, despliegue y reversión](sofia-production-readiness.md).

Se conservan ambos transportes: ElevenLabs y OpenAI Realtime. La fachada `lib/voice/session.ts` hace una sola solicitud de autorización y delega según la respuesta exclusiva del servidor; no existe fallback automático al fallar un proveedor. `AI_VOICE_PROVIDER` solo se interpreta en servidor: sin definir, Production conserva OpenAI y la Preview autorizada conserva Sofía. Un valor inválido bloquea.

El servidor solo permite Sofía nueva en la Preview exacta de esta rama o en Production del repositorio/rama correctos, con elección y aprobación explícitas y la versión revisada. Mantiene todas las validaciones y las cuotas Redis antes de emitir credenciales. Cola activada o dato ausente bloquean.

La IA escrita y los itinerarios conservan OpenAI y necesitan su clave. PR #38 incluye la protección de consumo de PR #37: en un lanzamiento futuro habrá que configurar Redis Production y `AI_ITINERARY_ENABLED=true` para conservar los itinerarios operativos.

## Acciones conservadas de Sofía

- `consultar_catalogo`: perfiles reales del catálogo en el idioma de la web.
- `mostrar_destino`: abre la ficha existente por identidad canónica.
- `buscar_viaje`: utiliza las acciones de vuelos/hoteles ya implementadas en esta PR; no promete un paquete combinado ni presupuesto conjunto.
- `crear_itinerario`: reutiliza el generador escrito existente, para 1–7 días, y solo confirma éxito después de mostrar el resultado.
- Parar, salir o cambiar idioma cancelan herramientas y audio. Se silencian entradas durante reproducción/herramientas y se deduplican los IDs de llamadas observados.

La preparación de producción no edita catálogos, tarjetas, imágenes, buscadores, página ni generador escrito.

## Credenciales, costes y límites

La clave temporal solo está guardada en servidor Preview de esta rama, con ElevenAgents Write, otros permisos denegados, límite 1.500 créditos y caducidad el 7 de noviembre de 2026 a las 09:00 de Madrid. Write fue necesario para emitir el token; Read solo permitía consultar el agente. No reutilizarla como clave permanente Production.

Las cuotas Redis son atómicas, con identidad HMAC, redes IPv6 /64 y espacios Production/Preview separados. Valores por defecto de voz: 2/minuto/IP, 5/día/IP, 20/día global y 3 por ventana fija de 31 días. Un intento admitido fallido consume reserva. No reiniciar ni aumentar contadores para pruebas. No son un tope garantizado en euros ni equivalen al ciclo de facturación.

La cuenta Free no permite uso comercial según la documentación oficial. Falta resolver licencia y aprobar presupuesto, nueva clave Production, caducidad y cuotas. No se ha contratado nada. Los precios históricos no son una propuesta de compra actual.

## Historial relevante y alcance de pruebas

La rama parte de `0bd1d46cd87feae64d5f70d931d40a9864747e4c`, base protegida de PR #37. La PR #38 incluye esas protecciones; no se ha fusionado ni modificado #37 o #36. El agente antiguo `agent_9701m5zn3h9bf57ata0q3qzn1ag6` y su borrador se conservan intactos y no son la voz OpenAI de Production.

Los fallos anteriores de flags, permisos de token y saludo se localizaron por separado. Redis admitió la sesión correcta y ElevenLabs registró audio de entrada y salida. No ejecutar el diagnóstico temporal ni repetir conversaciones para volver a demostrar esa prueba.

Las comprobaciones nuevas de producción son locales, con proveedores simulados y red externa bloqueada. No certifican una clave Production que todavía no existe, audio en siete idiomas, una llamada completa de cinco minutos ni licencia comercial. La compilación y resultados finales de esta preparación se registran en el informe de entrega.

## Referencias

- [Token WebRTC](https://elevenlabs.io/docs/api-reference/conversations/get-webrtc-token).
- [Gestión de claves](https://elevenlabs.io/docs/overview/administration/workspaces/api-keys).
- [Licencia comercial](https://elevenlabs.io/docs/help-center/legal/can-i-publish-the-content-i-generate-on-the-platform).
- [Reversión Vercel](https://vercel.com/docs/instant-rollback).

