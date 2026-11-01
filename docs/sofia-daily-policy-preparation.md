# Sofía: preparación de 3 conversaciones por día de Madrid y 360 segundos

Preparación aislada del 1 de noviembre de 2026. El propietario ha autorizado subir exclusivamente este lote de pruebas y ejecutarlo en Redis efímero de CI, sin nueva Preview. El candidato no está integrado en la voz ni conectado a Upstash. No autoriza voz, tokens de proveedores, fusión, Production o pagos. Las cifras de 3 y 360 son la política definitiva del propietario; los bloqueos mensuales no forman parte de la nueva cuota propuesta.

## Estado comprobado

La revisión base de la PR #38 en borrador es `14fc3cb0a7dfd8fb7569d1c162cd30ab60fb1252`. Su integración de voz todavía reserva los contadores antiguos antes de solicitar voz: 2/día por cuenta, bloqueos de 31 días y duración 300 segundos. El lote de CI añade un Lua candidato sin conectarlo todavía a esa integración.

La versión fijada `agtvrsn_2501m679we79ekz985446fbyygkb` devuelve 300 segundos. Main tiene otra versión, `agtvrsn_1101m6cddd37ewmtkrth2xr64n0m`, con 360. En la comparación estructural de conversación, voz, idioma, instrucciones, herramientas, ASR, turno, VAD, autenticación, cola y overrides, la única diferencia es la duración 300→360. No se ha cambiado ni publicado ningún agente.

Hallazgo que impide dar por compatible la nueva versión: ambas lecturas devuelven el control global `daily_limit: 100000`, con concurrencia uno, autenticación activa, ráfagas desactivadas y cola desactivada. El código actual acepta como máximo 15. La comprobación previa histórica había registrado 15; no se puede atribuir el cambio a esta tarea ni inferir su motivo. No se relaja silenciosamente el validador. Este límite global no equivale a tres conversaciones por usuario.

## Fallos y equidad sin eludir cuotas

El candidato cliente obtiene sesión, realiza una comprobación local de permiso/dispositivo/pista y construcción de WebRTC sin señalización, detiene las pistas y solo entonces permite el único POST de admisión. Cancelaciones, logout, tiempo de espera y respuestas tardías detienen los recursos y no permiten iniciar una petición después.

Eso evita descontar una conversación por los fallos locales detectables. No demuestra la conectividad remota. El SDK instalado vuelve a abrir el micrófono; persiste una posible carrera posterior. No se han abierto micrófonos reales durante esta tarea: las pruebas usan medios y peers simulados.

Para errores del servidor, el Lua candidato separa una reserva pendiente de su confirmación definitiva. Cuenta consumidos más pendientes vigentes; solo admite tres huecos por cuenta y fecha de Madrid. Usa nonce privado del servidor, una espera máxima acotada, transiciones idempotentes y vencimiento absoluto en la siguiente medianoche. Un cancelado no vuelve a reservarse y un confirmado nunca se devuelve. El commit debe ocurrir antes de entregar la credencial al navegador; un resultado ambiguo de Redis nunca concede un token.

Los límites de intentos por usuario, IP y globales deben mantenerse por separado y no reembolsarse. El candidato del ledger no sustituye esos límites. No se debe integrar hasta revisar el orquestador que autentica, limita intentos, valida el agente, reserva, obtiene token y confirma o cancela antes de exponerlo.

Después de entregar un token no se devuelve cuota por un simple aviso del cliente, falta de callback o petición abortada: podría conservar la credencial, usarla y solicitar devolución. Para cubrir un fallo WebRTC posterior hace falta evidencia autenticada del proveedor y una vinculación inequívoca a la reserva. Los webhooks HMAC documentados no prueban por sí solos que todos los fallos WebRTC de navegador sean notificables; no se añade ni configura un webhook por suposición.

## Madrid, límites y consumo acumulado

La fecha es `YYYY-MM-DD` en Europe/Madrid. La expiración es su siguiente medianoche absoluta, no 24 horas desde el primer uso. Los días de cambio horario pueden durar 23 o 25 horas; el Lua consulta TIME y rechaza una ventana vencida antes de escribir. No se borran ni reinician claves reales antiguas. La migración de una ventana de 24 horas a día natural no se puede reconstruir exactamente sin historial de marcas de tiempo; debe definirse antes de activar.

Eliminar los bloqueos mensuales mantiene la cuota diaria, pero elimina un freno acumulado al gasto. Tres sesiones de seis minutos permiten hasta 18 minutos por cuenta y día. Con el límite global Redis anterior de 20 admisiones se permitirían nominalmente hasta 120 minutos diarios. Son minutos máximos teóricos de estas admisiones, no una equivalencia con créditos ni euros, y no una garantía contra reutilización de credenciales u otros accesos.

Por tanto, no se puede afirmar que la protección económica sea idéntica. Antes de activar deben verificarse el límite de créditos de la clave exclusiva, la ausencia de recargas/consumo adicional automático y los controles globales coherentes. El presupuesto inicial de 25 € es consumo de voz; alojamiento, Redis y licencias siguen separados. No se contrata ni habilita facturación.

## Verificación del Lua y prevención de despliegues

No hay Redis, Docker o WSL instalados en este ordenador. El ejecutor preparado admite solo loopback literal, exige autorización explícita en su CLI y encierra todas las claves en un prefijo UUID de datos ficticios. No admite secretos de la web, URLs Upstash, borrados generales ni comandos administrativos.

El workflow usa un Redis oficial efímero en un runner Ubuntu estándar. El repositorio es público según la lectura del conector; el job se limita a ese repositorio público y rama, con cinco minutos de tiempo máximo, permisos de contenido de solo lectura y sin secretos. La imagen de Redis y las acciones están fijadas por digest/commit. Incluye casos reales de concurrencia, idempotencia, carreras, expiración, corrupción y ausencia de cambios tras rechazos. Al preparar este lote la ejecución real sigue pendiente; sus resultados se registrarán por separado. Las pruebas locales no deben presentarse como validación del motor Lua.

Subir la rama genera normalmente una Preview de Vercel. El `vercel.json` de este lote desactiva exclusivamente los despliegues Git de `codex/sofia-elevenlabs`, conservando sin cambios el despliegue anterior y la rama main. El propietario ha autorizado ese bloqueo junto con la subida aislada de CI; se comprobará que no aparece una nueva Preview. No basta con usar un commit de documentación o mantener la PR en borrador para impedir un despliegue.

Ese bloqueo no impide un despliegue manual o un Deploy Hook: no se deben ejecutar. Los cambios en `scripts/maintenance` también pueden activar las comprobaciones de calidad ya existentes de la PR; se revisó que sus trabajos de páginas de Production e incidencias no se ejecutan para PR. No se alteran sus condiciones.

Secuencia propuesta: revisar y autorizar el lote aislado de Lua, ejecutor, sus pruebas y workflow con el bloqueo de despliegue; subir ese lote y comprobar que Vercel no publica una nueva Preview; esperar que el Redis efímero supere la suite. Solo después resolver el control global y fijar la versión 360 revisada, completar la integración de reservas/confirmación/cancelación y sus pruebas, y solicitar autorización separada para una Preview privada. No se ejecutan scripts sobre Upstash real, ni migraciones ni reinicios de cuotas en ese paso.

## Fuentes consultadas

- [Vercel: git.deploymentEnabled](https://vercel.com/docs/project-configuration/git-configuration)
- [GitHub: Redis como servicio de pruebas](https://docs.github.com/en/actions/tutorials/use-containerized-services/create-redis-service-containers)
- [Redis: EVAL](https://redis.io/docs/latest/commands/eval/)
- [ElevenLabs: webhooks posteriores y firmas HMAC](https://elevenlabs.io/docs/eleven-agents/workflows/post-call-webhooks)

Las lecturas de ElevenLabs de la cuenta se realizaron únicamente mediante el conector, sin conversaciones o credenciales emitidas.

## Pruebas locales efectivamente ejecutadas

56 pruebas correctas con red externa bloqueada: nueve de política/calendario/contrato estático, nueve de seguridad del ejecutor RESP local y 38 de comprobación previa del micrófono y fachada. TypeScript estricto de los dos módulos nuevos también correcto. Ninguna prueba abrió un micrófono real o contactó con un proveedor.

Esos resultados NO significan que el Lua se haya ejecutado en Redis: la suite del motor real está preparada y su ejecución de CI ya está autorizada. Tampoco significan que esté terminada la integración de reservas en las rutas de voz, la migración o los validadores de 360 segundos. El cliente de comprobación del micrófono y sus cambios de fachada no se incluyen en esta subida: permanecen como preparación local. La integración de voz y la Preview anteriores se mantienen intactas hasta una autorización posterior.

El uso propuesto de un runner estándar en el repositorio público no exige contratar un servicio: [facturación de GitHub Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions). El workflow rechaza ejecutar el job si el repositorio deja de ser público y no conserva cachés ni sube artefactos.
