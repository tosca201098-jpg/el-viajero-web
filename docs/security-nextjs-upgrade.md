# Actualización de seguridad de Next.js

Fecha de revalidación: 20 de octubre de 2026.
Base actual: `origin/main`, commit `1aa990966df59e0fdbd0557c345d4f20d95b00db`,
después de la fusión de la PR #3. Base inicial: `ed74f1079c733aab0b8a5a255887206a918146e1`.
Rama: `codex/security-nextjs-upgrade`.

## Incorporación de la PR #3

Se incorpora `main` mediante una fusión sin conflictos sobre la revisión de seguridad
`e1a3942f252f7d59d92f70db1495e49d8e72b407`. Se conservan ambos historiales.
Los cinco archivos de la PR #3 coinciden íntegramente con `main`: página principal,
traducciones, helper de mensajes, pruebas y documentación del buscador.

Se mantienen los siete idiomas y los mensajes diferenciados de configuración ausente,
fallo del servicio y consulta válida sin precios recientes. No se cambia el backend de
vuelos, la resolución IATA, las fechas flexibles, las búsquedas por presupuesto ni la
voz. `package.json` y `package-lock.json` son idénticos a la revisión anterior de la PR #2.

## Dependencias y compatibilidad

| Dependencia | Antes | Después |
| --- | --- | --- |
| Next.js | 13.5.1 | 15.5.28 |
| eslint-config-next | 13.5.1 | 15.5.28 |
| ESLint | 8.49.0 | 8.57.1 |
| Tailwind CSS | 3.3.3 | 3.4.19 |
| PostCSS | 8.4.30 | 8.5.31 |
| Autoprefixer | 10.4.15 | 10.6.1 |

Se elige la versión estable con backports 15.5.28 de Next.js para incorporar
las correcciones disponibles en la rama 15 y limitar la migración. Se mantienen
React y React DOM 18.2.0, Supabase 2.117.3, TypeScript y los paquetes de tipos.
No se cambia la clasificación de las dependencias a `devDependencies`.

Next.js 15.5.28 incluye una dependencia exacta de PostCSS 8.4.31 que todavía
presenta avisos. Un `override` limitado a Next.js reutiliza el PostCSS 8.5.31
declarado en el proyecto, dentro de la misma versión mayor. El lockfile y una
instalación limpia confirman que solo se instala la versión corregida. La
compilación completa valida esta sustitución.

También se actualizan dependencias transitivas dentro de los rangos permitidos
mediante `npm audit fix`, sin `--force`.

Los únicos ajustes de código de aplicación son:

- Esperar los parámetros asíncronos de las páginas mensuales y sus metadatos,
  como requiere Next.js 15. Se conservan las doce rutas, sus recomendaciones,
  títulos, URL canónicas y el rechazo de meses inválidos.
- Usar `next/link` en los cuatro enlaces de vuelta a la portada de las páginas
  estacionales, como exige el lint actualizado. Se conservan texto y clases CSS.

No se modifican estilos, configuración de Next.js/Tailwind/PostCSS, configuración
de producción, catálogo, traducciones, lógica de voz, vuelos, itinerarios ni
migraciones de Supabase.

## Auditoría

Resultado de `npm audit --omit=dev` sobre el lockfile:

| Severidad | Antes | Después |
| --- | ---: | ---: |
| Crítica | 1 | 0 |
| Alta | 37 | 7 |
| Moderada | 10 | 2 |
| Total | 48 | 9 |

Se eliminan 39 de los 48 avisos (81,25 %). La auditoría completa, incluyendo
dependencias de desarrollo, devuelve los mismos nueve avisos. Next.js, React,
Supabase y PostCSS no aparecen en la auditoría final. El código de salida de
`npm audit` sigue siendo 1 porque hay vulnerabilidades pendientes.

Los nueve avisos de paquetes proceden de dos vulnerabilidades raíz:

| Causa | Paquetes afectados por propagación | Estado |
| --- | --- | --- |
| [`braces` <=3.0.3: agotamiento de pila con patrones anidados](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | `braces`, `chokidar`, `micromatch`, `fast-glob`, `@next/eslint-plugin-next`, `eslint-config-next`, `tailwindcss` | 7 avisos altos; la solución propuesta por npm exige cambiar dependencias mayores, incluida Tailwind 4. |
| [`postcss-selector-parser` <7.1.6: consumo cuadrático de CPU](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) | `postcss-selector-parser`, `postcss-nested` | 2 avisos moderados; Tailwind 3 depende de la serie 6 del parser. |

Estos paquetes intervienen en el análisis de patrones, CSS y lint. Los avisos
siguen presentes y requieren seguimiento; no se considera completada su
remediación. Se conserva Tailwind 3 por el requisito del proyecto y se evita
forzar un parser de otra versión mayor sin una validación de compatibilidad
específica. No se ha demostrado una incompatibilidad que justifique migrar a
Tailwind 4 en esta PR.

## Validación

Revalidación actual: Node.js 24.19.0, npm 11.9.0, Windows, copia aislada sin archivos
de entorno ni credenciales de servicios. Se usa el CLI de npm instalado en el entorno.

- `npm ci --no-audit --no-fund`: instalación limpia correcta, 390 paquetes;
  auditoría ejecutada por separado. Sin modificar el lockfile ni ejecutar `audit fix`.
- `node --test --test-isolation=none tests/*.test.cjs`: **78 pruebas correctas**,
  incluidas las 66 de seguridad y las 12 incorporadas por la PR #3.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: sin errores.
- `npm run lint`: sin errores; conserva avisos previos sobre imágenes `<img>`.
  Next.js 15 también avisa de la retirada futura de `next lint` en la versión 16;
  no se modifica la configuración de lint en esta revalidación.
- `npm ls --all`: árbol de dependencias válido, sin errores de peers/overrides.
- `node node_modules/next/dist/bin/next build`: correcto, 27 páginas generadas,
  incluidas las doce páginas mensuales y las rutas de API. Se descarga la fuente real.
  En Windows, `npm run build` encontró `EPERM` al crear directorios de `.next`;
  ejecutar directamente el mismo CLI de Next.js completó la compilación. No se
  cambiaron scripts, fuentes, estilos ni configuración para resolver este límite local.
- `npm audit --omit=dev` y `npm audit`: 9 avisos, descritos arriba.
- 24 comprobaciones HTTP reales en un servidor de producción local de Next.js,
  dentro del mismo proceso de prueba: portada, recuperación, destinos, cuatro
  estaciones, doce meses y sus canónicas, sitemap, robots y mes inválido con 404.
  La ruta genérica de destinos conserva su comportamiento previo de placeholder
  con HTTP 200. Vuelos sin token devuelve realmente `503` y `not_configured`.
- 28 comprobaciones adicionales del componente real `AuthDialog` con React y SDK
  simulados: acceso correcto/incorrecto y registro con confirmación/cuenta existente
  en los siete idiomas. No crean usuarios ni envían correos. Se registran aparte de
  las 78 pruebas del repositorio; los scripts de comprobación son externos al proyecto.
- Revisión de las 22 trazas de despliegue `.nft.json`: no contienen archivos de
  `braces`, `chokidar`, `micromatch`, `fast-glob`, `postcss-nested` o
  `postcss-selector-parser`. Es evidencia de su uso como herramientas, no una
  demostración de ausencia de vulnerabilidades ni motivo para ocultar los avisos.

El navegador automatizado local no llegó a abrir la aplicación: el entorno Windows
bloqueó el arranque de Edge y el navegador integrado no pudo acceder al servidor
local aislado. No se da por repetida en esta revisión la comprobación visual previa
de Chromium, que sí se había realizado el 19 de octubre. La compilación, los HTTP
reales y las simulaciones anteriores se distinguen de una prueba visual completa.
El estado de la nueva Preview y las verificaciones visuales posibles se registran
en la descripción de la PR tras publicar esta revisión.

Las pruebas existentes cubren búsqueda exacta y flexible de vuelos, descubrimiento
por presupuesto, sesión y API de voz, itinerarios, recuperación de contraseñas,
itinerarios guardados, traducciones, SEO y estacionalidad. Verifican además los
65 destinos (43 de España y 22 de Portugal), sus identificadores y los hashes de
su contenido original, así como los siete idiomas.

Las integraciones se verifican con respuestas simuladas. No se han solicitado
credenciales ni realizado llamadas reales de voz/IA/vuelos o escrituras en
Supabase. Los scripts SQL de RLS requieren una instancia de Supabase y no se han
ejecutado en este entorno. No se han modificado configuraciones ni realizado
despliegues de producción. La actualización de la rama solo puede generar una
nueva Preview con la configuración existente, sin añadir variables ni credenciales.
