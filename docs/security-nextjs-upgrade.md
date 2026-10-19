# Preparación de la actualización de seguridad de Next.js

## Estado

**Borrador bloqueado por conectividad. La actualización de dependencias no está
instalada ni validada y este cambio no debe fusionarse como solución de seguridad.**

Base: `main` en `ed74f1079c733aab0b8a5a255887206a918146e1`, comprobada el
19 de octubre de 2026. Rama: `codex/security-nextjs-upgrade`.

La rama prepara la compatibilidad de la página mensual con los parámetros
asíncronos de Next 16. No modifica las dependencias hasta que sea posible
instalarlas, generar el bloqueo mediante npm y comprobar una instalación limpia.

| Dependencia | Base | Instalada en este borrador | Objetivo pendiente |
|---|---|---|---|
| Next.js | 13.5.1 | 13.5.1 | 16.4.2, volver a comprobar avisos al instalar |
| React | 18.2.0 | 18.2.0 | Versión estable compatible y parcheada, pendiente de resolver |
| React DOM | 18.2.0 | 18.2.0 | La misma versión compatible elegida para React |
| Tailwind CSS | 3.3.3 | 3.3.3 | Mantener 3, salvo incompatibilidad demostrada |

## Fuentes y decisiones de migración

La [última versión estable publicada de Next](https://github.com/vercel/next.js/releases/tag/v16.4.2)
consultada es 16.4.2. Es posterior a los parches 16.4.1 de los avisos
[SVG/optimizador](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw),
[Server Actions](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r)
y [use cache](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr).
Esto no sustituye una auditoría del árbol que finalmente se instale.

El [manifiesto oficial de Next 16.4.2](https://github.com/vercel/next.js/blob/v16.4.2/packages/next/package.json)
declara Node >=20.9.0, PostCSS 8.5.23 y sharp opcional ^0.35.5. El entorno
de partida utiliza Node 24.19.0. La versión real de Node de Vercel debe
comprobarse posteriormente; este borrador no cambia su configuración.

La [guía oficial de migración](https://nextjs.org/docs/app/guides/upgrading/version-16)
exige parámetros de petición asíncronos y elimina `next lint`. Al instalar la
versión nueva habrá que sustituir el procedimiento de lint por ESLint CLI con
una configuración compatible, y resolver React y sus tipos en conjunto.
No se activarán Cache Components, React Compiler ni funciones nuevas para
completar esta actualización. No se cambiarán los límites de seguridad de imágenes.

El único acceso síncrono a parámetros de página del servidor encontrado es
`app/viajes-baratos/[mes]/page.tsx`. Se prepara con `await params`, tanto en
metadatos como en contenido, conservando las doce rutas, canonical, texto y 404.
Esta adaptación también funciona con los objetos que entrega Next 13.
`app/destinos/[slug]/page.tsx` utiliza el hook de cliente `useParams`, que no
requiere convertirlo a promesa. Los `URLSearchParams` de las rutas API tampoco
son la API de parámetros de página y no se alteran.

## Verificación inicial

Antes de modificar el código de la rama:

| Comprobación | Resultado |
|---|---|
| Pruebas existentes | 64 aprobadas, 0 fallidas, 0 omitidas; servicios simulados |
| TypeScript, sin emisión | Correcto |
| Lint de Next 13 | Correcto, con advertencias existentes sobre `img` |
| Compilación normal de producción | Falló al descargar Inter desde Google Fonts: `ENOTFOUND fonts.googleapis.com` |
| Acceso al registro npm | Falló: `ENOTFOUND registry.npmjs.org` |

No se eliminó `next/font`, no se cambiaron las fuentes ni se utilizó un archivo
de fuentes simulado para convertir la compilación en un éxito aparente.
El fallo de compilación anterior sucede en el código de partida, antes de
instalar o actualizar Next.

## Regresión preparada

`tests/monthly-page.test.cjs` verifica los doce meses con parámetros de tipo
promesa, sus metadatos y canonical, la selección del mes y el comportamiento
404 ante parámetros inválidos. Estas pruebas complementan las existentes del
catálogo, temporadas, idiomas y sitemap.

Las comprobaciones con Next 13 son solo evidencia de compatibilidad de esta
preparación; no prueban el funcionamiento con Next 16. Las verificaciones
posteriores se documentarán cuando sea posible instalar la nueva versión.

Tras esta preparación: **66 pruebas aprobadas**, 0 fallidas y 0 omitidas;
TypeScript correcto y lint correcto con las advertencias previas de imágenes.
Las dos consultas nuevas de `npm audit`, completa y `--omit=dev`, volvieron a
fallar por `ENOTFOUND`. No se repitió la compilación con el mismo bloqueo de
Google Fonts ni se ejecutó `npm ci` sin una actualización instalable.

## Vulnerabilidades

La instantánea original de npm recuperada en la auditoría previa contiene 25
entradas: 1 Critical, 20 High y 4 Moderate. La fase de destinos no modificó
dependencias. No se dispone de un recuento actual exitoso del registro npm.

**Corregidas y verificadas por este borrador: ninguna.** Como los manifiestos y
el bloqueo no cambian, las 25 entradas originales no se consideran resueltas.
No se inventa un número de vulnerabilidades restantes para un árbol de Next 16
que todavía no se ha instalado ni auditado.

## Trabajo necesario para completar la actualización

1. Restablecer el acceso del entorno a `registry.npmjs.org` y a los servidores
   de fuentes que utiliza `next/font` (`fonts.googleapis.com` y `fonts.gstatic.com`).
2. Volver a consultar versiones y avisos oficiales; instalar Next estable
   corregido, React/React DOM compatibles, tipos y herramientas necesarias.
   Mantener Tailwind 3. Generar `package-lock.json` mediante npm, sin editarlo
   a mano ni utilizar `npm audit fix --force`.
3. Adaptar lint y los cambios mínimos que revele la compilación. Conservar
   rutas, SEO, scripts, formularios, tipografía y comportamiento de caché.
4. Ejecutar `npm ci` desde una instalación limpia, `npm audit`,
   `npm audit --omit=dev`, las pruebas, TypeScript, lint y compilación normal.
5. Verificar los flujos de la tabla siguiente y registrar cuáles siguen
   pendientes. Una respuesta simulada no valida un servicio externo real.
6. Actualizar este documento y la descripción del borrador con versiones,
   archivos, auditoría y resultados reales. No fusionar ni desplegar producción
   sin autorización posterior.

| Área protegida | Verificación pendiente con las versiones nuevas |
|---|---|
| Vuelos | Travelpayouts, presupuesto, fechas flexibles, autocompletado, traslado desde voz y enlaces afiliados |
| Voz e IA | Endpoint, inicio, cancelación y limpieza de sesiones; micrófono/WebRTC en navegador; itinerarios y guardado |
| Usuarios | Registro, login/logout, sesiones, recuperación y separación de viajes de dos usuarios mediante RLS |
| Destinos | 65 fichas, identidad canónica, Tenerife TFN/TFS, temporadas y recomendaciones |
| Idiomas y SEO | Siete idiomas, doce páginas mensuales, enlaces, metadata, canonical, robots y sitemap |
| Diseño | Comprobación de escritorio y móvil sin rediseño ni migración a Tailwind 4 |
| Correo | Recuperación y circuito de correo; no se encuentra paquete Resend en este repositorio, comprobar la configuración externa sin modificarla |

No se han realizado reservas, pagos ni consultas reales que generen costes.
No se han ejecutado migraciones SQL ni comprobado las políticas de la base
real. No se han cambiado OpenAI, Travelpayouts, Supabase, Nuitee, Expedia,
credenciales, dominio ni los identificadores técnicos `el-viajero-web`.
No se ha iniciado la expansión a Francia.
