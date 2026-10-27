# Fase 1 — Protección del consumo de IA

Fecha: 27/10/2026. Propuesta en rama independiente de main y de Croacia. No desplegar en producción sin completar esta lista y autorización del propietario.

## Diagnóstico comprobado

| Servicio | Antes de esta rama | Límite que faltaba |
| --- | --- | --- |
| Voz, POST /api/voice | Clave privada en servidor, credencial efímera, validación de idioma y cuerpo de 512 caracteres, espera de 10 segundos. Modelo gpt-realtime-2.1. | Sin autenticación ni cuotas entre peticiones. La credencial abre WebRTC directamente con OpenAI. |
| Itinerarios, POST /api/itinerary | Entrada máxima de 8.000 caracteres, datos canónicos, 1–7 días, salida estructurada, 6.500 tokens máximos, espera de 55 segundos, sin almacenamiento en OpenAI. Modelo gpt-5-mini. | Sin autenticación ni cuotas entre peticiones. |
| Navegador | Evita dobles clics y cancela trabajo local. | Un cliente alternativo puede omitir esos controles. |

Una petición válida repetida puede llegar repetidamente a OpenAI según el código anterior, sin cuenta de usuario. Se comprobó mediante inspección y pruebas aisladas, no mediante un ataque a producción. No se conoce si hay un WAF externo que ya la limite: el panel de Vercel pidió iniciar sesión. Tampoco se han leído los límites privados de OpenAI. No se han mostrado, copiado ni modificado claves.

## Solución preparada

- Contador **compartido y persistente** Redis/Upstash, consultado desde el servidor; una única operación Lua EVAL comprueba y reserva todas las cuotas atómicamente. No hay alternativa en memoria que se reinicie con cada instancia.
- Cada servicio tiene cuota por minuto y 24 horas por conexión, más una cuota global de 24 horas. Las ventanas empiezan con la primera admisión y no se alargan por solicitudes rechazadas. Los fallos posteriores consumen la admisión: no se devuelven reservas que podrían haber generado coste.
- Identificación por IP proporcionada por el borde de Vercel, no por cookies ni cabeceras elegidas por el cliente. IPv6 se agrupa por /64. La base guarda un HMAC, nunca la IP en claro. Es identificación de conexión, **no autenticación de persona**.
- Preview y producción tienen contadores separados. Las Previews comparten cuota entre sí. No se incluye el identificador del despliegue para evitar que cada despliegue reinicie los límites.
- Falta de configuración, IP fiable, contador caído o respuesta inválida: bloqueo 503 **sin llamar a OpenAI**. Cuota agotada: 429 y Retry-After. Origen cruzado de navegador: 403. Origin no se considera autenticación: un robot puede omitirlo y sigue sujeto a cuota.
- Interruptores independientes: AI_ENABLED, AI_VOICE_ENABLED y AI_ITINERARY_ENABLED. Deben valer exactamente true. Por defecto la IA está pausada; ningún flag público del navegador puede activarla.
- Credencial Realtime con caducidad de 60 segundos para iniciar conexiones y respuesta sugerida de hasta 1.024 tokens. Se mantienen modelo, voz, herramientas y control de turnos.
- Avisos comprensibles en siete idiomas, utilizando los espacios de error existentes. No se modifica el diseño, las 16 tarjetas, destinos, vuelos ni hoteles. No hay reintento automático que multiplique peticiones.

### Cuotas iniciales propuestas

| Servicio | Por conexión/minuto | Por conexión/24 h | Global/24 h |
| --- | --- | --- | --- |
| Emisión de credenciales de voz | 2 | 5 | 20 |
| Generación de itinerarios | 3 | 10 | 50 |

Son valores conservadores para validar la Preview, no un presupuesto económico aprobado. Se ajustan con AI_VOICE_MINUTE_LIMIT, AI_VOICE_DAY_LIMIT, AI_VOICE_GLOBAL_DAY_LIMIT y los equivalentes AI_ITINERARY_*. Solo se admiten enteros positivos; un valor inválido bloquea la IA. No definir una variable usa el valor anterior. Pausar se hace con los interruptores, no poniendo cero.

### Ventajas y efectos sobre usuarios

El visitante legítimo puede continuar sin crear cuenta. El coste es una consulta corta al contador por admisión (espera máxima 2,5 segundos); Redis también tiene sus propios costes. Redes compartidas, hoteles, oficinas o móviles pueden compartir cuota y recibir falsos positivos. Ajustar con datos de uso, sin eliminar el techo global. Si aumenta la demanda, añadir identidad Supabase verificada en servidor y cuotas por usuario, conservando protección por conexión para el registro y el acceso anónimo. CAPTCHA o BotID son capas adicionales, no sustitutos del contador.

Agotar la cuota global o pausar la IA interrumpe nuevas solicitudes de todos los visitantes, pero deja disponibles los demás servicios. La caducidad corta puede exigir repetir el inicio si una persona tarda más de un minuto en conceder permiso de micrófono. El máximo de salida de voz puede acortar una respuesta extensa; los itinerarios mantienen su límite anterior para evitar truncar planes de siete días.

## Límite importante de esta fase: voz y presupuesto

**No afirmar que 20 credenciales equivalen a 20 conversaciones ni a un máximo de euros.** Una credencial Realtime puede abrir varias sesiones antes de caducar, y las sesiones abiertas pueden continuar después. Una respuesta máxima no es un límite de tokens de toda la conversación ni un tope inviolable frente a un cliente modificado. El interruptor del servidor no termina sesiones que ya están conectadas a OpenAI. [Referencia oficial de credenciales Realtime](https://developers.openai.com/api/reference/resources/realtime/subresources/client_secrets/methods/create).

Por ello, esta rama reduce el abuso de los endpoints, pero **no debe habilitarse la voz pública sin verificar el límite de gasto del proyecto de OpenAI**. Si se necesita duración/coste por conversación estrictos, una fase posterior debe negociar WebRTC en el servidor sin entregar credenciales reutilizables, asociar cada llamada a una identidad y cerrar llamadas mediante un supervisor duradero. Un temporizador del navegador o de una función efímera no basta. No se ha cambiado esa arquitectura en este borrador.

## Configuración manual: OpenAI

1. Entrar con permiso de administración en el proyecto que utiliza DESTINAUTA. Comprobar que la credencial existente pertenece a ese proyecto sin copiarla al chat. Comprobar los modelos permitidos y sus límites de peticiones/tokens: gpt-realtime-2.1 y gpt-5-mini. No sustituir modelos ni claves durante esta fase.
2. En Project settings → Limits → Spend → Edit spend limit, elegir el importe mensual aprobado y activar **Enforce a hard limit**, no solo una alerta. Guardar requiere intervención del propietario. Si la cuenta no ofrece el control, confirmar con OpenAI y mantener la voz pausada.
3. Configurar alertas, por ejemplo al 50 %, 80 % y 95 % del presupuesto elegido, y verificar destinatarios. No se ha decidido un importe en nombre del propietario. La facturación puede usar una moneda distinta al presupuesto en euros: comprobar moneda e impuestos antes de equipararlos.
4. Comprobar también el límite de la organización: puede afectar a otros proyectos. No elevarlo automáticamente. Revisar Usage/Costs por proyecto y modelo; un aumento debe investigarse antes de ampliar cuotas.

Las alertas notifican y dejan continuar tráfico; el límite duro rechaza peticiones afectadas con 429. La aplicación del límite puede retrasarse ligeramente y permitir un pequeño exceso; no es una garantía exacta de euros ni se ha certificado el cierre de sesiones activas. [Límites de gasto de OpenAI](https://developers.openai.com/api/docs/guides/spend-limits). Los límites de peticiones/tokens son controles diferentes del presupuesto mensual: [límites de frecuencia](https://developers.openai.com/api/docs/guides/rate-limits).

## Configuración manual: Preview de Vercel y contador

1. Revisar que la rama de producción sigue siendo main y que esta rama solo genera Preview. Activar protección de acceso a la Preview según el plan. No asignar destinauta.com a la Preview.
2. Crear o seleccionar una base Upstash Redis para esta aplicación, con persistencia y sin expulsión automática de claves de cuota. Preferir base separada para Preview. No borrar ni vaciar cuotas activas, ni rotar su secreto HMAC para reiniciarlas. Comprobar política de datos, costes y límites del proveedor.
3. Configurar **solo en Preview** AI_REDIS_REST_URL, AI_REDIS_REST_TOKEN y AI_RATE_LIMIT_SECRET (valor aleatorio privado de al menos 32 caracteres). Los valores permanecen exclusivamente en el gestor de secretos, no en Git, documentación ni chat. El código acepta HTTPS de *.upstash.io y usa cabecera Authorization. El usuario debe introducirlos: esta tarea no crea ni modifica secretos.
4. Mantener AI_ENABLED=false y ambos interruptores de servicio en false hasta completar la configuración y las pruebas sin proveedor. Revisar que Preview no hereda por error credenciales de producción. No activar para hacer pruebas de saturación contra OpenAI.
5. Revisar Firewall de Vercel y disponibilidad/coste de WAF Rate Limiting en el plan. Propuesta inicial para POST /api/voice y /api/itinerary: regla combinada de 10 solicitudes/minuto/IP, primero en registro y después bloqueo cuando se comprueben falsos positivos. Debe filtrar antes de gastar llamadas a Redis. Cubrir dominio, alias y URLs de despliegue; no fiarse solo del dominio principal.
6. La IP fiable depende de Vercel. Un proxy externo puede agrupar conexiones; comprobarlo antes de activar. Fuera de Vercel, producción bloquea la IA. En desarrollo/test se usa un único grupo compartido, sin cabecera alternativa para simular usuarios.

Fuentes: [cabeceras de Vercel](https://vercel.com/docs/headers/request-headers), [WAF Rate Limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting), [Redis REST API](https://upstash.com/docs/redis/features/restapi). No se ha contratado ningún servicio ni cambiado reglas de cuentas.

## Comprobaciones y aceptación

- Pruebas de código sin conexiones externas: límites apagados, configuración incompleta, ausencia de IP fiable, origen cruzado, IPv6 /64, aislamiento de datos, respuestas inválidas del contador, 429 con Retry-After y 503 sin fallback. Los dos handlers reales se prueban con un proveedor espía que debe recibir **cero llamadas** en casos denegados.
- Simulación de 40 peticiones concurrentes desde dos instancias y distintas IP: solo 20 admisiones de voz. Comprueba el contrato de transacción; **no sustituye ejecutar Lua en Redis real**.
- Regresión: flujos válidos de itinerarios, herramientas de voz, cancelación, Parar y reinicio conservados con proveedor simulado. Nuevos 429/503 no solicitan micrófono y permiten volver a intentar posteriormente.
- Compilación/TypeScript y toda la batería de main, sin Croacia. El total es distinto del informe de Croacia porque esta rama parte de main y no incluye sus 14 pruebas nuevas.
- Preview: comprobar portada y rutas, y rechazo seguro de ambas APIs sin configuración. Esa prueba no acredita funcionamiento de IA real.
- Pendiente del propietario: prueba de Redis real con proveedor simulado/aislado, expiración, cuota global, misma conexión, fallo de base e integridad de las cabeceras; después, una conversación breve y un itinerario con presupuesto mínimo aprobado. Confirmar calidad de audio, siete días y que los avisos no generan reintentos automáticos.

## Alertas y respuesta a incidentes

Los registros de aplicación solo incluyen servicio y motivo de denegación, sin IP, texto de viaje, tokens ni cabeceras. Crear alertas de observabilidad ante incrementos de 429/503 y revisar contadores globales en Redis. Correlacionar con los costes reales de OpenAI; las admisiones no son importes facturados. También vigilar Redis y Vercel: bloquear OpenAI no elimina el coste de recibir tráfico.

Si hay abuso: bloquear las rutas en WAF para nuevas peticiones; pausar AI_ENABLED en el entorno afectado y aplicar el cambio mediante el procedimiento autorizado de Vercel; comprobar sesiones ya abiertas y límites de OpenAI. No revertir a código sin cuotas ni borrar contadores. Cambiar variables puede requerir un nuevo despliegue: no se debe presentar el interruptor como cancelación instantánea de llamadas activas.

El borrador no está listo para producción hasta verificar cuentas, almacenamiento real, Preview y el presupuesto aprobado. Main y PR #36 permanecen intactos.
