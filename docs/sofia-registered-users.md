# Sofía: micrófono para usuarios registrados con sesión

Preparación de la PR #38. No autoriza activar Sofía, fusionar, publicar en Production, iniciar conversaciones o contratar servicios.

## Sistema existente y alcance

DESTINAUTA ya tiene registro por correo y contraseña, confirmación de correo, inicio/cierre de sesión y recuperación de contraseña mediante Supabase. Se reutilizan `getSupabaseClient`, `AuthDialog` y su sesión existente. No se añade otro sistema de usuarios ni una clave administrativa de Supabase.

El cambio de acceso afecta únicamente al micrófono. Visitantes sin sesión pueden seguir consultando destinos, las 16 tarjetas, vuelos, hoteles, buscadores e itinerarios como antes. Los requisitos anteriores de cuenta para guardar viajes siguen igual. La IA escrita no recibe una nueva obligación de autenticación.

## Comportamiento de la interfaz

- Mientras se comprueba la sesión, el micrófono no puede iniciar audio.
- Sin una sesión registrada, aparece «Regístrate o inicia sesión para hablar con Sofía». Pulsar el micrófono o esa invitación abre el diálogo existente. Se puede cambiar entre registro e inicio de sesión.
- Iniciar sesión no activa el audio automáticamente: el usuario debe volver a pulsar el micrófono.
- Cada intento consulta al SDK la sesión actual y añade su access token solo a la cabecera Authorization del POST del mismo origen `/api/voice`. No se añade otra copia persistente del JWT ni se envía a ElevenLabs u OpenAI.
- El cierre o cambio de cuenta detiene de inmediato el cliente de voz y cancela conexiones pendientes. Las respuestas tardías no vuelven a abrirlo.
- La espera de una sesión bloqueada también se cancela con Stop o el tiempo máximo de inicio, permitiendo volver a intentarlo sin quedar atascado.

Se conserva el diseño del micrófono y se añade únicamente la invitación necesaria. El mensaje existe en los siete idiomas de la web.

## Verificación obligatoria en servidor

La admisión de voz verifica el bearer mediante `supabase.auth.getUser(jwt)` contra el proyecto Supabase configurado. No utiliza el ID del navegador, cabeceras de usuario, parámetros del cuerpo ni una decodificación local del JWT como prueba de identidad.

Se rechazan tokens ausentes, mal formados o rechazados por Auth, usuarios anónimos, identidades no válidas y roles/audiencias incompatibles. Los fallos de configuración, red o tiempo de espera se rechazan sin conceder acceso. Los errores no incluyen datos del proveedor, JWT, correos, UUID o IP.

La comprobación se incorpora a `admitAiRequest` solo para voz. Así protege tanto ElevenLabs como la voz OpenAI conservada para reversión, evitando eludir el inicio de sesión al cambiar de proveedor. Los itinerarios mantienen su admisión anterior.

El SDK se crea por petición sin persistencia, refresco automático o detección de sesión en URL. Su fetch queda limitado al GET `/auth/v1/user` del proyecto configurado, con HTTPS en entornos alojados, sin redirecciones ni caché y con tiempo de espera de 2,5 segundos. También responde a la cancelación de la petición. Una autenticación cancelada o tardía no reserva cuotas.

Respuestas relevantes: 401 con `voice_auth_required` pide iniciar sesión; 503 con `ai_unavailable` informa de indisponibilidad; 429 con `ai_rate_limited` aplica las cuotas. No se solicita un token a los proveedores tras denegar Auth o Redis.

No se promete revocación inmediata universal de todos los JWT emitidos al cerrar sesión: Supabase documenta la duración de los access tokens y verificaciones adicionales para necesidades más estrictas. Este cambio verifica remotamente la identidad y detiene la voz del cliente al salir. No altera ahora la configuración de sesiones de Supabase ni añade acceso privilegiado a sus tablas internas.

## Consumo por usuario y límites generales

Una única ejecución atómica del mismo script Redis comprueba y reserva los siete contadores. Si cualquiera está agotado, no incrementa ninguno ni amplía su ventana.

| Ámbito | Valores por defecto conservados o añadidos |
|---|---|
| Red/IP | 2 admisiones/minuto y 5/día, conservados |
| Global | 20 admisiones/día y 3 por ventana de 31 días, conservados |
| Usuario verificado | 1 admisión/minuto, 2/día y 3 por ventana de 31 días, nuevos |

Los nuevos ajustes opcionales son `AI_VOICE_USER_MINUTE_LIMIT`, `AI_VOICE_USER_DAY_LIMIT` y `AI_VOICE_USER_31DAY_LIMIT`. Si faltan, se aplican los valores seguros anteriores; un valor inválido rechaza la reserva. No se han aumentado cuotas o reiniciado contadores.

Cambiar de IP no reinicia la cuota de la cuenta. Cambiar de cuenta no evita los límites generales o de red. Redis recibe un HMAC del UUID devuelto por Auth, con dominio separado de las identidades de red; no recibe UUID, JWT, correo o IP en claro. Production y Preview conservan sus espacios distintos de claves.

Se mantienen el máximo de cinco minutos, la versión fijada de Sofía, la autenticación del agente, concurrencia uno, ráfagas desactivadas y cola explícitamente desactivada. No se modifican agentes o herramientas de ElevenLabs.

Estos contadores son admisiones, no una contabilidad exacta en euros o minutos. Los 25 € son el presupuesto inicial de consumo de voz, ampliable solo por decisión del propietario. No se habilitan recargas, facturación extra o ampliaciones automáticas. Los costes de alojamiento, Redis y licencias permanecen separados y pendientes de aprobación cuando corresponda.

## Configuración y comprobación de Preview

El acceso reutiliza las variables públicas existentes `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. No se necesitan `service_role`, contraseñas o claves nuevas de usuarios. Ambas deben estar presentes al construir y ejecutar la Preview de `codex/sofia-elevenlabs`.

Se crearon en Vercel dos entradas Config independientes, exclusivamente para Preview de `codex/sofia-elevenlabs`, reutilizando la configuración pública existente. Se comprobó que la clave era publishable o anon, sin copiar una clave administrativa. Las entradas originales de Production conservan sus valores y su ámbito. El propietario completó la verificación de identidad requerida por Vercel; los valores no se incluyeron en archivos, GitHub o registros. No se modificaron permisos o ajustes de Supabase ni los interruptores de voz.

El registro usa el flujo de confirmación y los destinos de redirección existentes. Antes de una prueba humana de registro en Preview debe confirmarse que su URL esté permitida por Supabase. No se crean cuentas ni se envían correos de prueba por esta tarea.

Las pruebas automatizadas simulan usuarios, Auth, Redis y los proveedores: comprueban invitados, tokens rechazados, cuenta válida, suplantación de ID, cuota compartida entre IP, separación por usuario, errores, cancelaciones, identidad tardía, logout, rechazo de sesión anónima y conservación del catálogo. Una prueba usa el SDK instalado con fetch simulado para verificar su integración real sin red.

No equivalen a una conversación audible nueva ni a una comprobación real de las credenciales de Production. No se ejecutan tokens o audio reales para verificar este cambio. El informe de entrega registra los resultados de la suite, TypeScript, compilación y revisión visual que efectivamente se hayan podido completar.

## Antes de Production

Se mantiene la PR en borrador y la activación de Sofía bloqueada por sus interruptores existentes. La integración actual de la web pública sigue en su despliegue anterior hasta autorización de fusión y publicación.

Siguen pendientes Redis y la preparación privada de Production, licencia comercial, alojamiento compatible y aprobación de costes. Este cambio reutiliza el plan Supabase existente; no se contrata otro servicio de autenticación ni se garantiza uso ilimitado fuera de las cuotas de ese plan.

Fuente de la verificación de identidad: [Supabase getUser](https://supabase.com/docs/reference/javascript/auth-getuser). Límites de las sesiones y JWT: [sesiones de Supabase](https://supabase.com/docs/guides/auth/sessions).
