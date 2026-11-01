# Verificación temporal de la sesión real y cuotas propias de Sofía

Solo para la Preview privada de `codex/sofia-elevenlabs`, PR #38 en borrador. No activa voz, cambia variables, solicita tokens de proveedores ni modifica agentes. Production devuelve 404 antes de ejecutar operaciones externas.

## Acceso y caducidad

Página `/sofia-session-check`, endpoint GET `/api/sofia-session-check`. Ambos comprueban Vercel Preview, rama, propietario, repositorio y host HTTPS exactos. El endpoint exige una petición del mismo origen. La ventana está fijada entre el 1 de noviembre de 2026 a las 19:30 UTC y el 2 de noviembre a las 19:30 UTC (20:30, hora peninsular española). Caduca automáticamente sin otro despliegue. No se crea una contraseña o clave de diagnóstico.

## Identidad y lectura

La página no ejecuta llamadas al montarse. El botón obtiene internamente la sesión del SDK Supabase ya existente y envía el bearer únicamente al endpoint del mismo origen. El servidor reutiliza `verifyVoiceUser` y `auth.getUser(jwt)`; no acepta IDs de usuario suministrados por el cliente como identidad. Sesiones ausentes, inválidas y usuarios anónimos se rechazan antes de consultar Redis.

Solo se ejecuta `MGET` sobre los tres contadores derivados del UUID validado por Supabase con el mismo HMAC y espacio de nombres de la admisión real. Se devuelve únicamente autenticación verificada y los límites, uso y saldo de esa cuenta (minuto, día y 31 días). Nunca salen UUID, correo, IP, claves Redis, hashes, JWT, secretos ni contadores globales o de otros usuarios. Los errores son genéricos y no se registran datos de la petición o del proveedor.

El HTTP POST a la API REST de Redis transporta exclusivamente una orden de lectura. No se ejecutan EVAL, INCR, EXPIRE, SET, DEL, SCAN, admisiones ni peticiones a ElevenLabs/OpenAI. Consultar no crea claves ni amplía ventanas. Los contadores pueden expirar por el transcurso normal del tiempo. El saldo mostrado no garantiza una conversación: también se conservan los límites generales y por red, que esta comprobación no consulta ni revela.

## Comprobación humana

Con la sesión de la Preview ya iniciada, abrir la página temporal y pulsar una vez «Comprobar mi sesión y mis cuotas». Debe confirmar identidad y lectura propia sin reservar. Los otros dos botones comprueban rechazo 401 sin sesión y con un bearer deliberadamente inválido; no cierran la sesión real ni alteran su almacenamiento. No se pulsa el micrófono. El cierre/cambio de cuenta cancela y oculta resultados pendientes.

## Retirada y límites

Tras registrar el informe, retirar la página, su componente, el endpoint, el módulo de alcance y sus dos suites de pruebas en la misma rama; conservar este informe como evidencia. La caducidad bloquea el diagnóstico aunque se retrase esa limpieza. No se deben activar o reutilizar el diagnóstico Redis/ElevenLabs anterior, la credencial DPAPI o sus variables.

Las pruebas automatizadas usan servicios simulados y red externa bloqueada. La comprobación de Preview deberá registrarse aparte como evidencia real, sin sustituirla por los resultados locales.

## Resultado real — 1 de noviembre de 2026

Comprobación autorizada únicamente en Preview, realizada con la sesión existente mediante los controles de la propia página, sin extraer o registrar su JWT.

| Comprobación | Resultado |
|---|---|
| Sesión real, verificada remotamente mediante Supabase | Correcta |
| Identidad usada por el servidor y selección exclusiva de sus tres claves HMAC | Correcta |
| Lectura real de Redis mediante MGET | Correcta |
| Consulta sin bearer | Rechazada con 401 |
| Consulta con bearer deliberadamente inválido | Rechazada con 401 |
| Segunda lectura tras los rechazos | Mismos contadores; no se reservó ni descontó ningún intento |
| Tokens de ElevenLabs/OpenAI, conversaciones, audio y modificación de agentes | Ninguna operación |

Los límites observados coinciden con la política prevista: uno por minuto, dos por día y tres por ventana de 31 días. No se incluyen identificadores, datos personales, valores privados o contadores de la cuenta en este informe. Las identidades anónimas de Supabase se cubrieron con pruebas simuladas; no se creó otra cuenta para la comprobación.

Validación previa: 530 pruebas correctas con red externa bloqueada, incluidas 31 específicas del diagnóstico; estas últimas volvieron a pasar tras corregir el enlace de Next.js. TypeScript y compilación completa correctos. Los paquetes cliente no contenían nombres de las variables privadas de servidor. La única advertencia de compilación restante corresponde a imágenes preexistentes.

Commit ensayado: `1387c4eee9cffca492160173d70bf7f8f4992c4c`. Preview verificada: [despliegue de Vercel](https://vercel.com/el-viajero/el-viajero-web/4iY37kRdfqkMriwnXqphn3FmKYpX). Se retiran los seis archivos de ejecución y pruebas de este diagnóstico tras finalizar; su código probado permanece en ese commit y este informe se conserva en la PR en borrador. No se cambian las rutas de voz, las cuotas, las variables de Vercel ni Production.
