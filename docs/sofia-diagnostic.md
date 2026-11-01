# Diagnóstico temporal de Sofía — ejecución pendiente de autorización

Solo para `codex/sofia-elevenlabs` en el proyecto `tosca201098-jpg/el-viajero-web`.
Ruta: `POST /api/sofia-diagnostic`, exclusivamente en el host
`el-viajero-web-git-codex-sofia-elevenlabs-el-viajero.vercel.app`.
No crea tokens, sesiones, audio ni simulaciones. No llama a OpenAI.
No utiliza el contador de cuotas de visitantes.

Actualización del borrador local del 30 de octubre de 2026: el diagnóstico consulta la misma Sofía nueva que selecciona la ruta de voz en esta rama (`agent_2201m677yj19e6499g2649n774f6`, versión `agtvrsn_2501m679we79ekz985446fbyygkb`). No se ha ejecutado en remoto. El selector `lib/voice/preview-target.ts` es permanente y debe conservarse al retirar el diagnóstico temporal.

## Configuración que revisaremos antes de ejecutar

Mantener Vercel Authentication en la Preview. Se requieren DOS protecciones: la
sesión de Vercel y una credencial de diagnóstico independiente. La ruta no
comprueba por sí misma la sesión de Vercel: hay que conservar esa protección en
la plataforma. La credencial temporal protege también el caso de un acceso sin
esa sesión. No habilitar AI_ENABLED, AI_VOICE_ENABLED, AI_ITINERARY_ENABLED ni
ELEVENLABS_ENABLED para este diagnóstico. Mantener producción sin autorización.

Las cinco variables Redis/ElevenLabs existentes se usan únicamente en el
servidor. AI_RATE_LIMIT_SECRET debe tener al menos 32 caracteres; el token Redis
debe permitir EVAL y las operaciones GET, EXISTS, SET, INCR, TTL y EXPIRE que se
ejecutan dentro de los scripts. Un token de solo lectura no sirve.
ELEVENLABS_AGENT_VERSION_ID debe ser exactamente
`agtvrsn_2501m679we79ekz985446fbyygkb`.

Variables adicionales, SOLO en Preview de esta rama:

| Variable | Configuración futura |
| --- | --- |
| SOFIA_DIAGNOSTIC_ENABLED | `true` solo durante el ensayo |
| SOFIA_DIAGNOSTIC_TOKEN_SHA256 | SHA-256 hexadecimal de una credencial aleatoria de 32 bytes expresada como 64 caracteres hexadecimales |
| SOFIA_DIAGNOSTIC_WINDOW_START | Fecha UTC ISO exacta, con milisegundos: `YYYY-MM-DDTHH:mm:ss.sssZ` |

La ventana comienza en esa fecha y termina 15 minutos después. No se renueva
por peticiones ni por reinicios. Fecha futura, caducada o incorrecta devuelve
404. El hash no se utiliza como contraseña: se necesita la credencial original.
Se generará con aleatoriedad criptográfica solo al autorizar la ejecución; no se
ha generado ni guardado ninguna credencial ahora. No reutilizar credenciales.
Nunca poner la credencial en URLs, código, Git, capturas, logs o mensajes. El
valor original se conservará localmente cifrado con DPAPI para el usuario de Windows, fuera del
repositorio hasta la ejecución y se enviará exclusivamente en Authorization:
Bearer, por HTTPS, a esta Preview. Vercel solo necesita guardar su hash.

### Generar credencial y hash localmente, sin mostrarlos

Cuando acordemos preparar la ejecución, abrir PowerShell en este mismo portátil
y ejecutar el bloque siguiente. No necesita administrador ni conexión de red.
Crea una carpeta nueva en LOCALAPPDATA (fuera del proyecto), guarda la credencial
cifrada con DPAPI y el hash SHA-256 por separado. DPAPI vincula la recuperación
al usuario y al ordenador actuales; otro proceso que ya ejecute con ese usuario
también puede descifrarla. No es una protección frente a un equipo comprometido.
El script no imprime la credencial, el hash ni claves API, y no los incluye en el
texto de comandos que guarda el historial. No usar Start-Transcript, depuración
de variables ni herramientas que capturen valores durante la preparación.

```powershell
$diagRuta = Join-Path $env:LOCALAPPDATA ('DESTINAUTA\sofia-diagnostic-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $diagRuta -ErrorAction Stop | Out-Null
$diagAleatorio = [Security.Cryptography.RandomNumberGenerator]::Create()
$diagSha = [Security.Cryptography.SHA256]::Create()
try {
    $diagBytes = New-Object byte[] 32
    $diagAleatorio.GetBytes($diagBytes)
    $diagCredencial = [BitConverter]::ToString($diagBytes).Replace('-', '').ToLowerInvariant()
    $diagHash = [BitConverter]::ToString($diagSha.ComputeHash([Text.Encoding]::UTF8.GetBytes($diagCredencial))).Replace('-', '').ToLowerInvariant()
    $diagCifrado = ConvertFrom-SecureString (ConvertTo-SecureString $diagCredencial -AsPlainText -Force)
    [IO.File]::WriteAllText((Join-Path $diagRuta 'credencial.dpapi'), $diagCifrado, [Text.Encoding]::ASCII)
    [IO.File]::WriteAllText((Join-Path $diagRuta 'sha256.txt'), $diagHash, [Text.Encoding]::ASCII)
} finally {
    $diagAleatorio.Dispose()
    $diagSha.Dispose()
    if ($diagBytes) { [Array]::Clear($diagBytes, 0, $diagBytes.Length) }
    Remove-Variable diagCredencial, diagHash, diagCifrado, diagBytes -ErrorAction SilentlyContinue
}
Write-Output ('Archivos preparados en: ' + $diagRuta)
```

Generar credencial y hash localmente, sin mostrarlos

Cuando acordemos preparar la ejecución, abrir PowerShell en este mismo portátil
y ejecutar el bloque siguiente. No necesita administrador ni conexión de red.
Crea una carpeta nueva en LOCALAPPDATA (fuera del proyecto), guarda la credencial
cifrada con DPAPI y el hash SHA-256 por separado. DPAPI vincula la recuperación
al usuario y al ordenador actuales; otro proceso que ya ejecute con ese usuario
también puede descifrarla. No es una protección frente a un equipo comprometido.
El script no imprime la credencial, el hash ni claves API, y no los incluye en el
texto de comandos que guarda el historial. No usar Start-Transcript, depuración
de variables ni herramientas que capturen valores durante la preparación.

## Ejecución posterior, pendiente de autorización

1. Acordar la hora y configurar los tres valores anteriores; hacer un nuevo
   despliegue SOLO de Preview dentro de la ventana. Si caduca durante el
   despliegue, no ampliar silenciosamente el acceso: acordar una nueva ventana
   y credencial y desplegar de nuevo. Las variables nuevas no alteran despliegues
   antiguos.
2. Comprobar protección de acceso de Vercel y rama/commit de la nueva Preview.
3. Realizar una única petición POST autenticada con la credencial temporal, sin
   cuerpo ni parámetros. No usar el botón de voz. No añadir la credencial al
   cliente de DESTINAUTA ni a una herramienta de terceros. La petición se hará
   con la sesión de Vercel autorizada sin desactivar ni copiar sus protecciones.
4. El primer EVAL crea un bloqueo de uso único, con TTL de 900 segundos, compartido
   por los procesos/despliegues que usen esa credencial. La clave pertenece a
   `destinauta:diagnostic:sofia:`; no es una cuota real ni contiene IPs o secretos.
   Si Redis falla antes de registrar el bloqueo, no puede garantizarse consumo
   único; los reintentos dentro de la ventana siguen requiriendo la credencial.
5. Dos EVAL concurrentes ejecutan el script REAL de cuotas sobre cuatro claves
   temporales de ese espacio separado, con límite 1 y TTL de 120 segundos. Debe
   haber exactamente una admisión y un rechazo. Un EVAL de lectura verifica
   que todos los contadores son 1 y sus TTL son positivos. No se usa DEL, SCAN,
   KEYS ni se modifican reservas de sesiones.
6. Un único GET a ElevenLabs consulta el agente nuevo de pruebas en la versión fijada.
   Verifica IDs y los mismos controles de seguridad que utiliza el endpoint de voz,
   incluida autenticación, límites, cola desactivada, voz, tiempos y herramientas.
   La equivalencia con la ruta de voz se comprueba mediante pruebas locales, sin
   modificar su corrección de cola desactivada. No prueba el permiso de obtener
   tokens: eso queda fuera de este ensayo.
7. Respuesta máxima de éxito: `{ "redis": "passed", "elevenlabs": "passed" }`.
   Un fallo devuelve 503 y estados genéricos; credencial ya consumida, 409;
   falta de autorización/aislamiento, 404. Todas las respuestas son no-store.
   No registrar cabeceras, variables ni respuestas privadas del proveedor.

Son cuatro peticiones REST a Redis y un GET a ElevenLabs por ensayo completo.
Los scripts contienen varias operaciones Redis; pueden contar en su plan de
facturación. No afirmar que todo acceso Redis es gratuito. No hay consumo de
conversación, voz o LLM en este código. Un fallo posterior al bloqueo consume
el intento, también si falta permiso de lectura de ElevenLabs.

## Retirada

- La ventana caduca automáticamente. El bloqueo expira en 900 segundos desde
  su creación y los contadores en 120 segundos. No necesitan borrado manual.
- Desactivar/eliminar los tres valores temporales para futuros despliegues.
  Los despliegues existentes conservan sus variables: borrarlas en el panel no
  revoca por sí solo el endpoint antiguo. Su defensa es la fecha fija de caducidad.
- Eliminar los cuatro archivos temporales antes de integrar:
  `app/api/sofia-diagnostic/route.ts`, `tests/sofia-diagnostic.test.cjs`,
  `lib/voice/provider-config.ts` y este documento. La ruta de voz conserva su
  validación original y no depende de estos archivos.
  Conservar `lib/voice/preview-target.ts`, que también utiliza la ruta permanente de voz.
- Solo un despliegue posterior retira físicamente la ruta del despliegue nuevo.
  Los antiguos deben seguir privados y caducados; no cambiar la protección de
  Vercel. Retirar también el archivo local de la credencial tras la comprobación.

## Verificación local

Las pruebas usan proveedores simulados: cubren aislamiento en producción,
caducidad, autorización, concurrencia/repetición, fallos, resultados atómicos
incorrectos, TTL ausente, permisos denegados, IDs y cola. No certifican la
conexión o la ejecución Lua real en Upstash hasta la prueba autorizada en Preview.
No se ha ejecutado ningún diagnóstico remoto. Subir o desplegar estos archivos
no autoriza a ejecutar el diagnóstico ni a activar la voz.

