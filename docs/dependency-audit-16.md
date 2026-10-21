# Revisión de las dependencias de la incidencia #16

Fecha: 21 de octubre de 2026. Base: `ea4cfceed361a155ba017fe766b9bfa59678514d`
(`main`, con la PR #15 fusionada). Entorno local: Node 24.19.0 y npm 11.9.0.

## Resultado

Se corrigen los dos avisos moderados actualizando únicamente
`postcss-selector-parser` de 6.1.5 a **7.1.6**, primera versión corregida.
Quedan **7 avisos altos** derivados de `braces`, sin versión corregida publicada
en npm en esta revisión. No se ha ejecutado `npm audit fix`, usado `--force`,
añadido exclusiones ni relajado la auditoría.

| Auditoría real del lockfile | Antes | Después |
| --- | ---: | ---: |
| Completa: High | 7 | 7 |
| Completa: Moderate | 2 | 0 |
| Completa: Critical / Low | 0 / 0 | 0 / 0 |
| Completa: total | 9 | 7 |
| `--omit=dev`: total | 9 | 0 |

La bajada de 9 a 7 en la auditoría completa es una corrección. El resultado cero
con `--omit=dev` también refleja una clasificación más precisa: las herramientas
de compilación y desarrollo pasan a `devDependencies`. No significa que los siete
avisos restantes hayan desaparecido del proyecto. El mantenimiento diario sigue
fallando ante cualquier aviso de la auditoría completa, incluidos estos siete.

## Informe real y rutas afectadas

Los JSON completos se obtuvieron con `npm audit --json --package-lock-only
--ignore-scripts --registry=https://registry.npmjs.org`, también con `--omit=dev`,
antes y después. Los 9 nombres del informe corresponden a **dos avisos raíz**,
con propagación de gravedad a sus consumidores; no son nueve fallos independientes.

| Paquete y versión inicial | Gravedad | Ruta desde una dependencia directa | Uso real / resultado |
| --- | --- | --- | --- |
| `eslint-config-next@15.5.28` | High | directa | Lint; pendiente por `braces` |
| `@next/eslint-plugin-next@15.5.28` | High | `eslint-config-next` → plugin | Lint; pendiente |
| `fast-glob@3.3.1` y `3.3.3` | High | plugin → `fast-glob`; `tailwindcss` → `fast-glob` | Lint / búsqueda de fuentes CSS; pendiente |
| `micromatch@4.0.8` | High | ambas rutas `fast-glob` → `micromatch`; `tailwindcss` → `micromatch` | Patrones de archivos; pendiente |
| `braces@3.0.3` | High | `micromatch` → `braces`; `tailwindcss` → `chokidar` → `braces` | Causa raíz; pendiente |
| `chokidar@3.6.0` | High | `tailwindcss` → `chokidar` | Vigilancia de archivos; pendiente |
| `tailwindcss@3.4.19` | High | directa | Compilación CSS; pendiente por `braces` |
| `postcss-selector-parser@6.1.5` | Moderate | `tailwindcss` → parser; `tailwindcss` → `postcss-nested` → parser | Causa raíz; actualizado a 7.1.6 |
| `postcss-nested@6.2.0` | Moderate | `tailwindcss` → `postcss-nested` | Anidamiento CSS; corregido al actualizar su parser |

Las ubicaciones del lockfile son `node_modules/<paquete>`, con el plugin en
`node_modules/@next/eslint-plugin-next` y una segunda copia de `fast-glob` en
`node_modules/@next/eslint-plugin-next/node_modules/fast-glob`.

Inicialmente todos estaban etiquetados como producción porque sus dependencias
directas se declaraban en `dependencies`. Ahora tipos, TypeScript, ESLint y su
configuración, Tailwind, Autoprefixer y PostCSS se declaran en `devDependencies`.
PostCSS sigue estando disponible en el árbol de producción donde Next lo requiere.
`next`, `react`, `react-dom` y `@supabase/supabase-js` conservan sus versiones y
su clasificación de ejecución. La instalación para compilar debe incluir desarrollo,
como hace `npm ci` en el workflow y la Preview estándar de Vercel.

No hay importaciones de las herramientas afectadas desde `app/` o `lib/`.
Las **24 trazas `.nft.json`** de la compilación revisada no contienen archivos de
ninguno de los nueve paquetes señalados. Esto apoya su clasificación como
herramientas; no demuestra ausencia universal de riesgo. Durante el desarrollo o
la compilación siguen procesando patrones y fuentes del repositorio. No se ha
identificado una ruta pública que entregue entradas de visitantes a estos parsers.

## Actualización mínima y compatibilidad

Un override limitado a los descendientes de `tailwindcss` fija el parser a 7.1.6,
incluida la copia que usa `postcss-nested`. No se sustituye globalmente el parser
ni se actualizan otras versiones de paquetes. Se conserva el override existente
de PostCSS para Next. El cambio de versión del lockfile es solo **6.1.5 → 7.1.6**;
el resto del cambio del lockfile son metadatos de clasificación de desarrollo.

El parser cruza una versión mayor porque npm no publica un backport corregido
en la serie 6 (su última versión y etiqueta `legacy-v6` siguen siendo 6.1.5).
La versión 7 cambia la iteración cuando se insertan nodos en el árbol de selectores.
Se valida específicamente esa compatibilidad con Tailwind 3 y postcss-nested:

- El CSS completo de `app/globals.css`, procesado con la configuración real de
  Tailwind y Autoprefixer, es **idéntico byte a byte** antes y después: 59.294 bytes,
  SHA-256 `48b2f34da250cbb0b35ff838fb80fd5b3f6c921e70e64dc0f73bd4080dae2075`.
- Una prueba permanente compara contra la salida previa del parser 6.1.5:
  variantes responsive, hover/focus, group/peer, atributos, pseudo elementos,
  valores arbitrarios, espaciado y selectores descendientes.
- Otra conserva la salida de listas de selectores, anidamiento y media queries.
- Una prueba con el selector plano de 400 KB descrito en el aviso finaliza en
  un subproceso con límite de diez segundos. También finaliza con el paquete
  6.1.5 consultado: esta prueba acota esa carga, no demuestra una explotación
  reproducida antes ni reemplaza la auditoría de versiones.

No se migra Tailwind a 4 ni se baja `eslint-config-next` a 14.2.35, propuestas
mayores de npm que modificarían más el proyecto y no proporcionan un parche
para `braces@3.0.3`. Se elige 7.1.6 frente a 7.1.7 para limitar el cambio a la
primera versión que elimina el aviso conocido.

## Comprobaciones locales

- Instalación limpia: `npm ci --ignore-scripts --no-audit --fund=false`, 390 paquetes.
  Se usó la caché local ya descargada con `--offline` para repetir la instalación.
- **179/179 pruebas**, con `network-guard.cjs` y toda red externa bloqueada
  (176 previas y tres nuevas). Cubren vuelos exactos/flexibles y presupuesto,
  autocompletado, voz/WebRTC y API de voz, itinerarios IA, guardado con sesión
  Supabase simulada, recuperación de contraseña, catálogo/fichas, temporadas,
  meses y los siete idiomas.
- TypeScript sin errores (`tsc --noEmit --incremental false`).
- Lint sin errores; siguen los avisos anteriores de `<img>` y la deprecación
  anunciada de `next lint`. No se desactiva ninguna regla.
- `npm ls --all` correcto: sin dependencias inválidas ni conflictos de override.
- Compilación de producción correcta: **27/27 páginas generadas**, con las
  rutas de vuelos, voz, itinerarios y Supabase conservadas.
- **21/21 recursos locales HTTP correctos**: portada, cuatro temporadas,
  doce meses, Roma, recuperación, sitemap y robots. Solo HTML/GET.
- Auditoría completa: salida 1, 7 High. Auditoría `--omit=dev`: salida 0, cero avisos.

En Windows, el aislamiento inicial bloqueó fuentes de Google y el arranque del
servidor. La compilación y los HTTP se repitieron correctamente con permiso de
ejecución, manteniendo el bloqueo de red de mantenimiento; la compilación solo
admite los dos hosts gratuitos de fuentes y localhost. No se modificaron fuentes
ni configuración de Next para solventarlo.

Las funciones de proveedores se verifican con simulaciones. No se han realizado
llamadas reales de pago a vuelos/IA/voz, escrituras o sesiones reales en Supabase,
pruebas del micrófono físico ni una validación manual de navegador. Estas pruebas
no acreditan cuotas o disponibilidad actuales de esos proveedores.

## Mantenimiento y seguimiento pendiente

La API pública de GitHub confirma `state: active` para el workflow **391317886**,
`Mantenimiento diario gratuito`. La PR #15 está fusionada. El cron de `main`
continúa en **05:37 UTC**: 07:37 en Madrid en verano y 06:37 en invierno.
La revisión manual de `main` que abrió #16 es la
[ejecución 39548250303](https://github.com/tosca201098-jpg/el-viajero-web/actions/runs/39548250303).

Solo se amplía el filtro de PR para comprobar también `package.json`, el lockfile
y la nueva prueba CSS. No cambian cron, permisos, ejecutores, límites, política
de red ni lógica de incidencias. Los trabajos que consultan producción o editan
incidencias continúan excluidos de las PR; la auditoría completa sigue registrando
y haciendo fallar los siete avisos. El mantenimiento conserva su modelo gratuito.

La incidencia #16 seguirá abierta mientras `main` tenga estos avisos. Esta PR no
se fusiona ni publica en producción. Tras una eventual fusión autorizada, seguirá
abierta por los siete avisos de `braces`; no debe cerrarse como corregida por completo.
Cuando exista un parche de `braces` compatible, actualizar su árbol y repetir
auditorías completas, pruebas y compilación. La revisión diaria lo seguirá detectando.

## Fuentes

- [Incidencia #16](https://github.com/tosca201098-jpg/el-viajero-web/issues/16).
- [Braces: GHSA-vfj7-8cjw-p6xm, sin versión corregida](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
- [Parser: GHSA-rj75-hqrm-r3gf, corregido en 7.1.6](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).
- [Cambios oficiales del parser](https://github.com/postcss/postcss-selector-parser/blob/master/CHANGELOG.md).
