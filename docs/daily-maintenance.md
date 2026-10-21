# Mantenimiento diario gratuito de DESTINAUTA

## Activación y horario

La PR prepara `.github/workflows/daily-maintenance.yml`; no se fusiona ni activa
el control diario sin autorización. GitHub solo ejecuta `schedule` cuando el
archivo existe en la rama predeterminada (`main`). Al fusionarlo quedará
programado a las **05:37 UTC**: 06:37 en Madrid en invierno y 07:37 en verano.
También estará disponible en **Actions → Mantenimiento diario gratuito → Run
workflow**, seleccionando `main`. No se configura una automatización de Codex.

Las PR que cambien este mantenimiento ejecutan únicamente la validación de
código, simulaciones y servidor local. No consultan producción ni crean
incidencias. Ninguna ejecución fusiona, despliega o modifica código automáticamente.

## Coste y permisos

- El repositorio es público y se utiliza exclusivamente `ubuntu-24.04` estándar.
  Todos los trabajos se omiten si deja de ser público o se copia a otro repositorio.
- No se suben artefactos ni se guardan cachés; se utilizan los registros y resúmenes
  de Actions. No hay servicios externos de monitorización ni suscripciones.
- Solo se usan `actions/checkout` y `actions/setup-node`, fijadas a commits de sus
  versiones oficiales verificadas. Node 24, sin nuevas dependencias del proyecto.
- Instalación limpia con `npm ci --ignore-scripts --no-audit --fund=false`; no se
  ejecutan scripts de instalación de paquetes. No se actualizan versiones ni lockfile.
- No se suministran secretos de la aplicación. Las claves de OpenAI, Travelpayouts,
  Resend y la configuración pública de Supabase se dejan vacías en estos trabajos.
- Las pruebas, TypeScript y lint precargan un bloqueo de red. La compilación solo
  permite localhost y `fonts.googleapis.com`/`fonts.gstatic.com`, necesarios para
  la fuente Inter ya utilizada por la web. Estas descargas son gratuitas.
- El token efímero `GITHUB_TOKEN` solo recibe `issues: write` en el trabajo de
  incidencias, separado de instalación, compilación y pruebas. Las PR nunca
  ejecutan ese trabajo. Checkout no conserva credenciales Git.

No se cambian el plan, la facturación, las variables, las credenciales, Vercel,
las fotos, el diseño, las rutas ni el código de la aplicación.

## Comprobaciones

1. **Calidad:** instalación limpia, todas las pruebas Node existentes y las nuevas
   pruebas de mantenimiento, TypeScript, lint y compilación de producción.
2. **Servidor local:** arranque de esa compilación con red externa bloqueada;
   GET de las mismas páginas descritas a continuación. El servidor se detiene al
   finalizar, también si hay fallos.
3. **Producción:** únicamente GET de portada, cuatro temporadas, doce páginas
   mensuales, la página existente `/destinos/roma`, recuperación de contraseña,
   sitemap y robots: **21 recursos**. Se comprueba estado HTTP, tipo y marcadores
   de contenido, no solo un 200. Máximo tres peticiones simultáneas, diez segundos
   por intento, un reintento ante errores temporales. Se rechazan redirecciones a
   otros dominios, APIs o URLs con parámetros. No se ejecuta JavaScript, imágenes,
   widgets o formularios ni se siguen enlaces de proveedores.
4. **Funciones:** las pruebas existentes simulan autocompletado y selección,
   búsquedas, fechas flexibles, presupuesto, idiomas, catálogo, temporadas,
   itinerarios y voz. No llaman a precios de Travelpayouts, OpenAI ni Supabase.
5. **Dependencias:** `npm audit --json --package-lock-only --ignore-scripts` y
   `npm audit --omit=dev --json --package-lock-only --ignore-scripts`, contra el
   registro público npm. Se registran cantidades, gravedad y avisos disponibles;
   cualquier vulnerabilidad o auditoría incompleta hace fallar esta comprobación.
   No se ejecuta `npm audit fix`. Un aviso no demuestra por sí solo explotación:
   su exposición y una posible actualización requieren revisión humana.

El resultado de cada paso aparece en los registros y en **Summary** de su
ejecución. Un fallo no oculta las demás comprobaciones; una omisión tampoco se
considera éxito. Los JSON temporales se ignoran en Git y no se suben como artefactos.

## Incidencia única y recuperación

Las ejecuciones diarias/manuales de `main` crean una incidencia con el marcador
`destinauta-daily-maintenance:v1`, resultados resumidos y enlace a los registros.
Se buscan también incidencias cerradas y se pagina el listado, sin depender del
índice de búsqueda. Las ejecuciones se serializan para evitar carreras.

- Si el fallo continúa, se actualiza la misma incidencia sin comentarios diarios.
- Si todas las comprobaciones pasan, se cierra como recuperada.
- Si vuelve un fallo, se reabre esa misma incidencia.
- Si GitHub no permite crear/editar incidencias, el trabajo falla visiblemente;
  no se anuncia que se haya notificado. Es necesario que Issues esté habilitado.

Los detalles históricos permanecen en las ejecuciones de Actions durante la
retención configurada por GitHub. La incidencia muestra la situación más reciente;
no envía correos externos ni utiliza Slack ni servicios de pago.

## Límites

Esta es una revisión diaria, no vigilancia continua. GitHub puede retrasar o
descartar ejecuciones programadas en momentos de carga y desactiva cron de
repositorios públicos tras 60 días sin actividad. Si Actions no llega a ejecutarse,
el propio workflow no puede crear una incidencia; debe comprobarse su última
ejecución. Puede reactivarse desde Actions tras revisar este estado.

HTTP verifica HTML y disponibilidad; las interacciones de buscadores/voz/IA se
verifican mediante simulaciones. No comprueba disponibilidad real de tarifas,
cuotas de proveedores, micrófono físico, generación real ni una sesión real de
Supabase. No se modifica nada para intentar reparar automáticamente un fallo.

## Verificación local sin crear incidencias

```sh
npm ci --ignore-scripts --no-audit --fund=false
node --require ./scripts/maintenance/network-guard.cjs --test tests/*.test.cjs
node --require ./scripts/maintenance/network-guard.cjs node_modules/typescript/bin/tsc --noEmit
node --require ./scripts/maintenance/network-guard.cjs node_modules/next/dist/bin/next lint
# La compilación permite exclusivamente las dos fuentes de Google y localhost:
MAINTENANCE_ALLOW_FONTS=1 NODE_OPTIONS="--require $PWD/scripts/maintenance/network-guard.cjs" npm run build
node scripts/maintenance/local-smoke.cjs
node scripts/maintenance/audit.cjs
```

No ejecutar `report-issue.cjs` manualmente con una credencial personal: las pruebas
de incidencias inyectan una API simulada. Solo el trabajo autorizado de `main`
utiliza el token efímero de Actions.

## Referencias

- [Gratuidad de ejecutores estándar en repositorios públicos](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
- [Schedule, rama predeterminada y limitaciones](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
- [Permisos mínimos y acciones fijadas a commits](https://docs.github.com/en/actions/reference/security/secure-use).
- [Comportamiento y códigos de salida de npm audit](https://docs.npmjs.com/cli/v11/commands/npm-audit/).
