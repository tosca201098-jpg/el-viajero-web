# DESTINAUTA — guía para Claude

Web de viajes en https://destinauta.com. Next.js 15 (App Router) + Tailwind + Supabase + Travelpayouts (vuelos y precios) + Stay22 (hoteles) + ElevenLabs (voz de Sofía) + Resend (correo), desplegada en Vercel desde `main`.
Repositorio: `tosca201098-jpg/el-viajero-web`. El propietario **no es programador**: explica todo en español sencillo, sin jerga, y di siempre qué has comprobado y qué no.

## Reglas del propietario (no negociables)

1. Antes de proponer cambios, **lee el código actual** (rama `main`), no la memoria.
2. Las **16 tarjetas originales de la portada** no se agrupan por países ni cambian de diseño sin permiso (`lib/destinations/featured.ts`; sus ventanas comparten marco: `docs/ficha-marco-comun.md`).
3. Respeta las páginas de **temporadas** (`app/temporadas/*`), los destinos existentes y los **7 idiomas**: es, en, fr, de, it, pt, ca. Todo texto nuevo va en `lib/i18n/translations.ts` en ese orden, con los 7 idiomas (una prueba lo exige).
4. Mantén funcionando buscadores, voz e IA, Supabase e integraciones de viajes.
5. **No inventes** precios, disponibilidad de vuelos u hoteles ni datos de aeropuertos. Sin dato real, se dice «no disponible» o se omite.
6. No elimines ni sobrescribas funcionalidades existentes.
7. Todo cambio va en **rama independiente** y **Pull Request en borrador** con pruebas y Preview de Vercel.
8. **Nunca fusiones ni publiques en producción sin autorización expresa** del propietario («fusiona la N»). Una autorización vale para esa PR, no para otras.
9. No contrates herramientas ni servicios de pago sin preguntar.
10. Claves y secretos: **nunca** los leas, imprimas, descifres ni los escribas en archivos o chat. El propietario escribe las claves y las variables de Vercel él mismo. En la documentación solo van nombres de variables, nunca valores.

Si no tienes permisos para modificar algo, dilo claramente y prepara instrucciones para Codex o una herramienta autorizada.

## Flujo de trabajo

- Rama nueva desde `main` actualizado (`claude/<tema-corto>`), commits pequeños en español, PR en **borrador** que explique el problema «en cristiano», qué cambia, qué NO cambia, pruebas y límites.
- Espera a que el estado de Vercel del commit completo sea `success` (Preview) y comprueba la Preview en un navegador cuando el cambio sea visible.
- Fusión solo con orden expresa: **merge commit** (no squash), tras sacar la PR de borrador y comprobar que no hay conflicto; después espera el despliegue de producción y verifica una página real.
- Cadenas de PR permitidas (la base es la rama de la anterior); al fusionar la primera, la segunda se reasigna a `main`.
- Cada trabajo termina con una nota en el Proyecto «DESTINAUTA» de Claude (`claude/DESTINAUTA-<tema>-<prNNN>-<fecha>.md`) con estado, qué no se pudo probar y cómo deshacerlo (Vercel → Deployments → despliegue anterior → Instant Rollback, o revertir la PR).

## Comprobaciones

```bash
node --test tests/<archivo>.test.cjs      # lo relacionado primero (rápido)
node --test tests/*.test.cjs              # todo: tarda ~17–20 min, lánzalo en segundo plano
npx tsc --noEmit                          # tipos
npm run lint && npm run build
```

- Las pruebas usan `node:test` en `.cjs`, cargan el código con `ts.transpileModule` + `vm` y simulan red, hooks y almacenamiento. Ninguna debe llamar a Travelpayouts, OpenAI/ElevenLabs ni Supabase reales.
- Algunas pruebas **fijan texto del código** (por ejemplo, el efecto de `pendingVoiceFlightSearch` en `app/page.tsx` no puede contener `await`; hay expresiones regulares sobre llamadas concretas). Si cambias esas líneas, actualiza la prueba a propósito, no la borres.
- Sin red para `npm install` (entornos sin acceso): trabaja con lo instalado y dilo.
- **Fallos que ya existían** al medir en `main` (el 19-11-2026, entorno de Claude): 10 de ~1200 — `css-toolchain`; resultados de vuelos de la página existente; páginas mensuales (parámetros asíncronos); 3 de hoteles Stay22 (campos editables, resumen móvil, aviso de afiliado por idioma); 2 de voz (`voice-auth-ui`); 2 del SDK de Supabase. Una PR es correcta si no añade fallos nuevos; no los «arregles de paso» sin avisar.
- Hay un mantenimiento diario gratuito en GitHub Actions (`.github/workflows/daily-maintenance.yml`, `docs/daily-maintenance.md`): no lo cambies sin permiso.

## Mapa del código

- `app/page.tsx` (~2000 líneas): portada, buscadores, ventana de cada destino y conexión de Sofía. Cámbialo con cuidado y con pruebas.
- `app/api/`: `travelpayouts/` (vuelos, enlaces de búsqueda), `voice/` y `itinerary/` (IA), `email/`, `cron/`, `sofia-diagnostic/`.
- `app/vuelos`, `app/vuelos-en-vivo` (lista en vivo dentro de un marco, `noindex`), `app/hoteles`, `app/destinos/*`, `app/temporadas/*`, `app/viajes-baratos/*`.
- `lib/chat/` + `app/components/GuidedChat.tsx` (chat de texto guiado, sin IA, solo con datos del catálogo; `docs/chat-guiado.md`).
- `lib/destinations/` (catálogo por país + fotos y encuadres), `lib/travelpayouts/` (aeropuertos por país, búsqueda), `lib/voice/` (Sofía), `lib/supabase/` (cuentas, viajes y vuelos guardados), `lib/i18n/`, `lib/email/`, `lib/stay22/`.
- `docs/`: una nota por país y por función (`docs/sofia-*.md`, `docs/white-label-flight-search.md`, `docs/stay22-hotels.md`…). Léela antes de tocar esa parte.

## Trampas conocidas (ya costaron tiempo)

- **Vuelos, dos fuentes distintas.** `/api/travelpayouts/flights` lee *precios guardados* (API de datos, solo fechas exactas y muchas rutas vacías: eso **no** significa «no hay vuelos»). El buscador manual y la lista en vivo usan el widget White Label (`/api/travelpayouts/flight-link` → `?flightSearch=<CÓDIGO>`), que solo se dibuja en pantalla: no se puede leer como datos y arranca una vez por página (por eso cada búsqueda de Sofía abre su propio marco). La API de búsqueda en tiempo real exige ≥50.000 usuarios/mes: no disponible.
- **Sofía** (ElevenLabs): herramientas del cliente en `lib/voice/elevenlabs-session.ts`; producción usa una **versión fija del agente** y la variable de Vercel `ELEVENLABS_AGENT_VERSION_ID` debe coincidir con la versión publicada en ElevenLabs. Cambios de solo código (texto de resultados de herramientas) no necesitan tocar ElevenLabs ni Vercel. Nunca se cita un precio que no esté en el resumen que recibe Sofía.
- Fotos de destinos: no inventes ni copies de cualquier web; usa fuentes con licencia y regístrala en los campos del destino (`imageSource`, `imageCredit`, `imageLicense`, `imageLicenseUrl`).
- `vercel.json` tiene los cron de precios mensuales por aeropuerto de origen: no cambies horarios ni orígenes sin permiso.
- Tras un cambio en producción, recomienda Ctrl+F5 al propietario antes de que lo pruebe.
