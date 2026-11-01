# Sofía — política definitiva preparada para Preview

Este informe sustituye la política anterior de los informes de preparación: solo usuarios registrados con sesión validada en el servidor, **tres conversaciones por día natural de Europe/Madrid**, **360 segundos por conversación** y ningún bloqueo mensual de conversaciones.

## Integración mínima

Se reutiliza Supabase y la interfaz existente. La fachada comprueba el micrófono y WebRTC local antes del único POST de voz. La comprobación no conecta con un proveedor y detiene sus pistas. El navegador no decide la identidad, el consumo o los reembolsos.

El servidor conserva cuatro límites no reembolsables de intentos: IP 2/minuto y 5/día, usuario 1/minuto y global 20/día. Esos valores no pueden aumentarse mediante configuración por encima de sus techos. Son controles antiabuso adicionales: no garantizan que se concedan tres llamadas si otro límite está agotado.

La cuota de conversaciones usa el Lua ensayado con un HASH privado por usuario HMAC y fecha de Madrid. Reserva un hueco pendiente, valida la configuración y obtiene una credencial; confirma el consumo antes de devolverla. Ante un fallo conocido anterior a esa entrega, cancela la reserva pendiente, conservando los límites de intentos. Una confirmación ambigua se rechaza sin exponer el token y no se devuelve cuota ciegamente. Los pendientes caducan en 30 segundos; ningún identificador de reserva se entrega al navegador.

Se dejan de consultar los contadores mensuales y la antigua cuota móvil de usuario. No se borran claves remotas ni se ejecuta una migración sobre Upstash. El ledger de la nueva política comienza en el espacio v2 de esta Preview; los registros previos se dejan expirar. La validación del Lua se hizo con datos ficticios en Redis efímero, sin consumir intentos reales.

## Versión de seis minutos y protecciones

Preview fija en código la versión revisada `agtvrsn_1101m6cddd37ewmtkrth2xr64n0m`. Conserva voz Sofía, español, instrucciones y herramientas; la diferencia de conversación comprobada respecto al pin anterior es 300→360 segundos. Para completar esta actualización sin cambiar variables, Preview admite como configuración únicamente ese pin o el pin anterior revisado; en ambos casos consulta y emite exclusivamente el nuevo. Otros valores o ausencia de configuración se rechazan. Production conserva su pin y sus validadores anteriores.

La lectura actual del control compartido de ElevenLabs devuelve 100000 llamadas globales/día. La Preview acepta esa configuración conocida sin confundirla con la cuota por usuario: el techo global efectivo de la web permanece en Redis, como máximo 20 intentos/día y tres conversaciones por cuenta. Se conservan autenticación del agente, concurrencia uno, ráfagas y cola explícitamente desactivadas, voz/idioma/herramientas esperados, máximo 1024 tokens por respuesta y duración exacta 360. El cliente también cierra a los 360 segundos.

No se cambian claves API, límites de créditos, permisos, recargas o facturación del proveedor. Ningún secreto se introduce en el navegador o el repositorio. Quitar el bloqueo mensual no constituye un techo monetario: tres conversaciones de seis minutos son hasta 18 minutos diarios por cuenta. El presupuesto inicial de voz y su límite de créditos se mantienen independientes de alojamiento, Redis y licencias; no se autorizan gastos adicionales.

## Verificación y despliegue

El Lua sin cambios pasó ocho casos de integración en Redis real 7.4.12 y 18 pruebas de seguridad/calendario: [CI aislada](https://github.com/tosca201098-jpg/el-viajero-web/actions/runs/41352833532). El resto de verificaciones del parche se realiza con servicios simulados y conexiones externas bloqueadas. No se ejecutan llamadas ni tokens reales de voz para esta entrega.

El parche integrado superó **552 pruebas, sin fallos**, con red externa bloqueada, y una compilación completa Next.js que incluye TypeScript y lint. Solo permanecen los avisos preexistentes de imágenes. No se repitió el ensayo real de Lua porque su código permanece idéntico al ya aprobado.

El propietario ha autorizado ahora guardar la integración en la PR #38 y generar una Preview controlada. Por ello se vuelve a permitir únicamente el despliegue Git de `codex/sofia-elevenlabs`. Production, main y las PR #36/#37 no se modifican ni se fusionan. No se ejecutan despliegues manuales, promociones o hooks. La PR #38 permanece en borrador.

## Pendiente posterior, sin ampliar esta fase

- Una prueba humana de audio en Preview, iniciada por el propietario. Esta entrega no repite conversaciones.
- Los fallos WebRTC posteriores a entregar un token no justifican por sí solos devolver cuota: el cliente podría usarlo y solicitar una devolución. Se documenta esa limitación; no se añade un sistema de webhooks o reembolsos no verificables.
- Los informes históricos de cinco minutos, dos llamadas o bloqueos mensuales describen revisiones anteriores y quedan sustituidos por este informe.
- La revisión comercial y los pasos de Production requieren autorización aparte. El éxito de esta Preview no publica Sofía en destinauta.com.
