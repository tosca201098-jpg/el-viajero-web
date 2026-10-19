# Actualización de seguridad de Next.js

Fecha de comprobación: 19 de octubre de 2026.
Base: `origin/main`, commit `ed74f1079c733aab0b8a5a255887206a918146e1`.
Rama: `codex/security-nextjs-upgrade`.

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

Entorno: Node.js 24.19.0, npm 11.9.0, Linux.

- `npm ci --no-audit --no-fund`: instalación limpia correcta; auditoría ejecutada
  por separado. El cache de npm se ubica en `/tmp` por los permisos del entorno.
- `node --test --test-isolation=none tests/*.test.cjs`: 66 pruebas correctas,
  incluidas las 64 existentes y dos nuevas para los parámetros asíncronos.
  Se usa el modo sin aislamiento de procesos de Node 24 para obtener y ejecutar
  los casos individuales, además del resultado por archivo.
- `node_modules/.bin/tsc --noEmit --incremental false`: sin errores.
- `npm run lint`: sin errores; conserva avisos previos sobre imágenes `<img>`.
- `npm ls --all`: árbol de dependencias válido, sin errores de peers/overrides.
- `npm run build`: correcto, incluidas las doce páginas mensuales estáticas y
  todas las rutas de API.
- `npm audit --omit=dev` y `npm audit`: 9 avisos, descritos arriba.
- Chromium sobre `next start`: portada en escritorio y móvil sin errores de
  hidratación ni excepciones del navegador; selección de los siete idiomas;
  envío de búsqueda y presentación de vuelos; apertura de ficha y generación
  de itinerario; doce páginas mensuales con canónicas correctas y 404 para un
  mes inválido; cuatro enlaces estacionales de vuelta a la portada; rutas de
  destinos y recuperación de contraseña. Las API de vuelos e itinerarios y
  los recursos externos se simulan o se bloquean en esta comprobación local.

Las pruebas existentes cubren búsqueda exacta y flexible de vuelos, descubrimiento
por presupuesto, sesión y API de voz, itinerarios, recuperación de contraseñas,
itinerarios guardados, traducciones, SEO y estacionalidad. Verifican además los
65 destinos (43 de España y 22 de Portugal), sus identificadores y los hashes de
su contenido original, así como los siete idiomas.

Las integraciones se verifican con respuestas simuladas. No se han solicitado
credenciales ni realizado llamadas reales de voz/IA/vuelos o escrituras en
Supabase. Los scripts SQL de RLS requieren una instancia de Supabase y no se han
ejecutado en este entorno. No se han modificado configuraciones de producción ni
realizado despliegues.
