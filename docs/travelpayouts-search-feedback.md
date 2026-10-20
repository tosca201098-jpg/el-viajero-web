# Mensajes del buscador y configuración de Preview

Preparación local sobre `main` (`ed74f1079c733aab0b8a5a255887206a918146e1`), en la rama
`codex/travelpayouts-search-feedback`. No publicar la rama sin autorización: un push puede
crear automáticamente un despliegue de Preview. No forma parte de la PR #2.

## Cambio preparado

La búsqueda normal y la búsqueda por presupuesto interpretan los códigos públicos existentes:

| Respuesta | Mensaje |
| --- | --- |
| `503`, `not_configured` | Buscador no activado en este entorno. |
| `502`, `provider_unavailable`, o fallo de red | No se ha podido consultar el servicio; reintentar más tarde. |
| `200`, `success: true`, lista vacía válida | Mensaje existente de ausencia de precios recientes; no es un error. |
| Validación de origen, destino o fechas | Mensajes específicos existentes. |
| Error desconocido o contrato incompleto | Mensaje genérico existente, sin mostrar detalles del proveedor. |

Los dos textos nuevos existen en español, inglés, francés, alemán, italiano, portugués y
catalán. Se conservan las claves en el estado y se traducen al renderizar, por lo que cambiar
el idioma no repite la consulta. Se mantienen fechas flexibles, parámetros de presupuesto,
resolución de destinos, enlaces de afiliados, resultados ordenados y protección frente a
respuestas tardías. No se modifican rutas API, contratos, credenciales ni configuración.

Limitación: el backend agrupa actualmente rechazos del proveedor (incluida autenticación),
tiempos de espera y otras respuestas no válidas bajo `provider_unavailable`. El nuevo texto
no identifica una causa concreta ni demuestra que el fallo sea transitorio. Distinguir
autenticación requeriría otra revisión del backend y pruebas simuladas, sin exponer respuestas
privadas al cliente. Una lista vacía de la API de precios recientes tampoco demuestra que no
existan vuelos a la venta.

## Configuración comprobada y pendiente de autorización

En Vercel, proyecto `el-viajero-web`, el formulario de nueva variable permite seleccionar
`Preview Branches` y exactamente `codex/security-nextjs-upgrade`. Se comprobó sin introducir
valores, seleccionar la rama ni guardar el formulario. La entrada existente
`TRAVELPAYOUTS_API_TOKEN` permanece como Secret, solo Production. La protección de Preview
está configurada con inicio de sesión de Vercel y Standard Protection; no se ha realizado
una prueba anónima concluyente de todos sus dominios.

La alternativa más segura es una credencial adicional emitida expresamente por Travelpayouts
para pruebas, guardada como una **nueva entrada Secret** con el mismo nombre, limitada a
Preview y a esa rama. La entrada de Production debe quedar intacta y no debe crearse una
variable aplicable a todas las Previews. La rama de mensajes no necesita credenciales.

La documentación pública de Travelpayouts describe un token por cuenta y advierte que
`Update token` invalida inmediatamente el anterior. No se ha confirmado una segunda
credencial simultánea ni un sandbox: hace falta confirmación del proveedor antes de asumir
que es posible. No regenerar el token actual. No se ha enviado ninguna solicitud a soporte.

Si posteriormente se autoriza reutilizar la credencial actual solo en esa rama, seguirá
compartiendo los permisos, cuota y revocación de Production. La limitación por rama controla
su inyección en Vercel, no crea aislamiento en Travelpayouts. El Secret de Production es de
solo escritura: no se puede copiar su valor desde la interfaz. Cualquier introducción del
valor debe hacerse de forma segura en Vercel, nunca en el chat ni en archivos del proyecto.

Los cambios de variables solo se aplican a despliegues nuevos. Guardar una variable y
desplegar son acciones pendientes de autorización separada. No se ha modificado ninguna
variable, credencial, protección o despliegue.

Fuentes oficiales:

- https://vercel.com/docs/environment-variables
- https://vercel.com/docs/deployment-protection
- https://support.travelpayouts.com/hc/en-us/articles/13024069738386-Where-to-find-API-token

## Validación

Las pruebas nuevas ejecutan los manejadores reales de la página con fetch y estado simulados:
configuración ausente, fallo del servicio, red, respuesta vacía, contrato inesperado, siete
idiomas, presupuesto, parámetros de fechas flexibles y respuestas tardías. No necesitan
credenciales ni llaman a servicios externos.

Resultados locales sobre las dependencias de `main` (Next.js 13.5.1 y React 18.2.0):

- `node --test --test-isolation=none tests/*.test.cjs`: 76 pruebas superadas, 0 fallos.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: correcto.
- `node node_modules/next/dist/bin/next lint --no-cache`: sin errores; avisos existentes
  de imágenes y del script `beforeInteractive` del layout.
- `node node_modules/next/dist/bin/next build`: correcto, 27 páginas generadas. El primer
  intento quedó bloqueado por DNS al descargar Inter; tras autorizar red, terminó sin
  modificar fuentes, paquetes ni configuración.
- `git diff --check`: correcto.

No se ha probado con credenciales reales ni se ha validado este cambio en una Preview de
Next.js 15. Esa comprobación queda pendiente junto con la autorización para publicar.
