# Biblioteca canónica de destinos — fase 1

Base revisada: `main` en `955ffc166e907fce556ba42a42b0be0a03191330`.

## Alcance y compatibilidad

Se mantienen las 65 fichas (43 ES y 22 PT), su orden y todos los campos previos.
Se añaden `id`, `slug`, `countryCode`, `airports` y `metropolitanCodes` explícitos
en cada registro. Los IDs se asignan una vez: no deben regenerarse al traducir
o renombrar un destino. Los hashes de los campos originales están en
`tests/fixtures/destination-legacy-digests.json` y protegen el contenido, los
alias, los códigos usados por vuelos, los meses y las licencias de imágenes.

`lib/destinations/index.ts` sigue siendo el punto de entrada compatible. Expone
`destinationProfiles`, `findDestinationProfile` y `getDestinationsForMonth`
con el mismo comportamiento, además de búsquedas por ID/slug y grupos por país.
Los tipos se reexportan desde ese punto de entrada; las importaciones existentes
no necesitan cambiar. No se añaden fichas de Francia en esta fase.

No se modifican buscador de vuelos, fechas flexibles, autocompletado, voz,
itinerarios, proveedores, Supabase, credenciales ni configuración de Vercel.
Los viajes guardados y enlaces existentes siguen usando los nombres originales.

## Referencias compartidas

Una selección futura puede almacenar referencias, no otra copia de la ficha:

```ts
import { getDestinationById, type DestinationReference } from '@/lib/destinations';

const selection: DestinationReference[] = [{ destinationId: 'es-tenerife' }];
const destination = getDestinationById(selection[0].destinationId);
```

La resolución por ID, por slug y por los métodos previos devuelve el mismo objeto
del catálogo. Un ID inexistente devuelve `undefined`; el consumidor debe manejarlo.
Los nombres y alias siguen disponibles para URLs antiguas y texto de usuario.

Para incorporar otro país más adelante: crear su archivo de datos con el mismo
tipo, registrar el grupo ISO en `destinationsByCountry` y añadirlo a
`destinationProfiles`. Las pruebas deben verificar que ambas vistas contienen
las mismas referencias y que no se repiten IDs ni slugs.

## Destino, aeropuerto y código metropolitano

- `id`: identidad de la ficha turística, por ejemplo `es-tenerife`.
- `airports`: asociaciones con aeropuertos físicos, con identificador IATA.
  En esta migración se incorporan únicamente los aeropuertos de los códigos
  ya utilizados; no es un inventario completo de aeropuertos auxiliares.
- `metropolitanCodes`: códigos de ciudad/área metropolitana, separados de los
  aeropuertos. Permanecen vacíos hasta su verificación con el proveedor.
- `iataCodes`: contrato anterior de resolución/precios de Travelpayouts,
  conservado literalmente. Los nuevos metadatos no cambian las consultas.
- `auxiliaryCodes`: referencias anteriores no aceptadas por Travelpayouts;
  no se convierten automáticamente en aeropuertos consultables ni códigos urbanos.

Tenerife mantiene una sola ficha con TFN y TFS. Asociar varios aeropuertos no
activa consultas adicionales: el buscador sigue resolviendo como antes.
Un aeropuerto cercano podrá servir a varios destinos turísticos; no debe
utilizarse como identidad del destino ni imponerse una relación exclusiva.

## Siete idiomas

Se conserva `Locale` de las siete lenguas actuales: es, en, fr, de, it, pt y ca.
`translations` permite textos parciales por lengua. `getDestinationText` aplica
fallback por campo: idioma solicitado, traducción española, texto original.
Solo devuelve texto de presentación, sin alterar IDs, aeropuertos ni entradas
enviadas a proveedores. No se inventan traducciones ni se cambia masivamente la UI.

La página mensual ahora obtiene el nombre de país desde el ISO y el idioma con
`getDestinationCountryName`. Francia, Italia, Reino Unido o Alemania ya no se
presentan como Portugal al probar esos países mediante fixtures. Esto no añade
destinos de esos países al catálogo.

## Publicación y sitemap

`slug` es metadato estable y no crea ni cambia una URL pública por sí solo.
La publicación es opcional y explícita: `publication.status = 'published'`.
`getPublishedDestinationPages` prepara referencias y rutas `/destinos/{slug}`
para un sitemap futuro. Actualmente devuelve una lista vacía: ninguna de las
65 fichas tiene aún una página canónica completa que deba anunciarse.

No se cambia `app/sitemap.ts`, `robots.ts`, `/destinos/[slug]`, `/destinos/roma`
ni las 12 rutas mensuales. Antes de conectar el helper al sitemap habrá que
resolver la ficha en servidor, generar metadata/canonical, validar 404 y conservar
enlaces anteriores. Un selector de idioma cliente no crea siete URLs SEO.

## Duplicados y consolidación posterior sin pérdida de contenido

Esta fase documenta las coincidencias, sin borrar ni reemplazar las listas actuales.

| Ubicación | Destinos ya presentes en la biblioteca | Acción posterior |
|---|---|---|
| `featured.ts` | Barcelona → `es-barcelona` | Mantener posición/emoji/contexto de destacado y referenciar la ficha; comparar y conservar fotografía, descripción y recomendaciones anteriores antes de retirar la copia. |
| Primavera | Sevilla, Córdoba, Granada, Lisboa, Madeira | Sustituir contenido repetido por sus IDs. Conservar motivos de primavera y curación como contexto de esa selección. |
| Verano | Algarve coincide con un alias de Faro → `pt-faro` | No fusionar automáticamente una región con una ciudad. Revisar el alcance antes de cambiar la referencia. |
| Otoño | Menorca → `es-menorca` | Referenciar ID y conservar explicación de otoño. |
| Invierno | Fuerteventura, Madeira | Referenciar IDs y conservar contexto de invierno. |

París está en destacados y primavera, pero no en las 65 fichas canónicas actuales.
Valle del Loira y Borgoña son referencias regionales francesas ya existentes.
Su consolidación corresponde a la fase 2, no a una nueva ficha de aeropuerto.
Roma tiene contenido en destacados, primavera y una ruta específica; se preserva
para una fase posterior sin cambiar su dirección. Otros internacionales repetidos
(por ejemplo Nueva York, Bali o Islandia) necesitan el mismo inventario por país.

También hay equivalencias de alcance que requieren revisión editorial, como
Mallorca frente a Palma de Mallorca, Algarve frente a Faro y Madeira frente a
Funchal. Los alias actuales se conservan por compatibilidad; no prueban que sean
la misma entidad geográfica. Nunca deduplicar solo por texto normalizado o IATA.

## Pendientes deliberados

- No migrar masivamente destacados/temporadas: revisar primero los textos y las
  fotos alternativos, después usar referencias con contexto sin copiar la ficha.
- `lib/travelpayouts/places.ts` aún tiene reglas ES/PT y el autocompletado reduce
  aeropuerto a ciudad. Generalizarlos cambia resolución de vuelos; requiere una
  fase específica con pruebas antes de activar nuevos países o selección exacta.
- Itinerarios aún aceptan las fuentes y contratos anteriores. Migrar solicitudes
  a ID requiere mantener la validación de datos confiables y los viajes guardados.
- No integrar Nuitee/Expedia ni añadir identificadores hoteleros supuestos.
- No comenzar Francia, fusionar ni desplegar sin autorización.

## Verificación de esta entrega

- Base sin cambios: 56 pruebas aprobadas.
- Con fase 1: 64 pruebas aprobadas (`node --test tests/*.test.cjs`), incluidas
  las ocho nuevas de identidad, preservación de datos, aeropuertos, idiomas,
  representación mensual y publicación optativa. Proveedores simulados.
- TypeScript: `node node_modules/typescript/bin/tsc --noEmit --incremental false`, correcto.
- Lint: correcto con avisos existentes sobre imágenes y el script del layout.
- `next build` ordinario: bloqueado al descargar Inter por DNS de Google Fonts.
- Compilación completa, incluidos tipos y 27 páginas estáticas: correcta al usar
  `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` solo en el proceso de verificación, leyendo
  archivos Inter reales de una compilación local anterior. No se modifica ningún
  archivo del proyecto, dependencia o ajuste desplegado para esa sustitución.
- Prueba HTTP local: bloqueada por `EACCES` de la conexión a loopback del entorno.
  La revisión real en navegador y la compilación con red normal quedan pendientes
  antes de fusionar. No se ha consumido ninguna API real ni desplegado producción.
