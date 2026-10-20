# Francia — fase 2 de la biblioteca de destinos

La presentación descrita en esta fase queda sustituida por la política de
[consulta expresa](france-explicit-selection.md): Francia permanece en el
catálogo, sin añadir tarjetas automáticas nuevas. Las tarjetas originales,
incluida París en destacados y las originales de temporadas, permanecen visibles.

Base revisada: `main` en `d0ba73658604b9bd1b51f3e3be80d9548fd4f784`, tras la
PR #5 del logotipo. Rama: `codex/france-destinations`.

## Catálogo y aeropuertos

Se añaden 12 fichas francesas a las 65 existentes: **77 fichas canónicas**.
Los archivos de España y Portugal permanecen sin editar. Sus IDs, slugs,
contenido, orden, aeropuertos, temporadas y licencias siguen protegidos por las
pruebas de la fase 1; Tenerife mantiene TFN y TFS.

| ID estable | Nombre base | Slug | Aeropuertos físicos asociados | Código metropolitano | Aeropuertos de acceso con traslado terrestre |
| --- | --- | --- | --- | --- | --- |
| `fr-paris` | París | `paris` | CDG, ORY, BVA | PAR | — |
| `fr-nice` | Niza | `nice` | NCE | — | — |
| `fr-lyon` | Lyon | `lyon` | LYS | — | — |
| `fr-marseille` | Marsella | `marseille` | MRS | — | — |
| `fr-bordeaux` | Burdeos | `bordeaux` | BOD | — | — |
| `fr-strasbourg` | Estrasburgo | `strasbourg` | SXB | — | — |
| `fr-toulouse` | Toulouse | `toulouse` | TLS | — | — |
| `fr-annecy` | Annecy | `annecy` | — | — | GVA (Suiza), LYS (Francia) |
| `fr-chamonix` | Chamonix | `chamonix` | — | — | GVA (Suiza), LYS (Francia) |
| `fr-mont-saint-michel` | Mont-Saint-Michel | `mont-saint-michel` | — | — | RNS (Francia) |
| `fr-nantes` | Nantes | `nantes` | NTE | — | — |
| `fr-lille` | Lille | `lille` | LIL | — | — |

`airports` representa los aeropuertos de pasajeros asociados que se han
seleccionado para esta fase, no un inventario exhaustivo de aeródromos locales.
Annecy sí tiene un aeródromo de aviación de negocios, pero no se añade como
destino de vuelos comerciales ni se presupone disponibilidad en Travelpayouts.
Chamonix y Mont-Saint-Michel no reciben códigos aeroportuarios inventados.
Beauvais pertenece al grupo de búsqueda de París en el proveedor, pero exige
planificar un traslado terrestre; no se afirma que esté dentro de París.

El campo opcional nuevo `accessAirports` separa las alternativas de llegada de
la identidad turística y de `iataCodes`. GVA puede servir a Annecy y Chamonix
sin identificar a ninguna de las dos. LYS sigue resolviendo a Lyon y RNS no se
convierte en el código de Mont-Saint-Michel. La interfaz pide elegir un
aeropuerto de acceso y advierte del traslado terrestre separado.

## Integración y compatibilidad

- El registro por país ISO `FR` y `destinationProfiles` incorporan las mismas
  referencias a objetos de `france.ts`. ID y slug se asignan explícitamente.
- Las temporadas y páginas mensuales permiten descubrir Francia y abrir sus
  fichas. Las tarjetas usan los mismos objetos, con los textos de presentación
  obtenidos mediante `getDestinationText`. La portada conserva su estructura
  original y la tarjeta destacada de París, sin secciones independientes por país.
- Las nueve ciudades con códigos urbanos verificados reutilizan el buscador
  actual. El único cambio en el resolutor de ciudades sustituye dos reglas
  ES/PT por `countryCode` del perfil. No cambian peticiones de precios,
  ordenación, presupuesto, fechas flexibles ni enlaces de afiliación.
- En los otros tres destinos, los botones de vuelos de la ficha muestran las
  alternativas de acceso. No se envía silenciosamente GVA, LYS o RNS como si
  fueran códigos propios del destino turístico. Las tarjetas mensuales remiten
  a la ficha para esa elección.
- El generador de itinerarios y la voz ya consultan el catálogo. Admiten las
  nuevas fichas y sus nombres localizados sin modificar sus módulos, endpoints,
  modelos, permisos ni credenciales. Los payloads conservan el contenido base
  validado; solo la presentación se traduce y la generación recibe su `locale`.
- Cada ficha contiene descripción, cuatro lugares destacados, estancia
  orientativa, meses y nota estacional en es/en/fr/de/it/pt/ca. Los nombres
  localizados también funcionan como alias de búsqueda de la misma ficha.
- Los meses son selección editorial orientativa, no un calendario de eventos,
  previsión meteorológica, medición de ocupación ni garantía de menor precio.
  Chamonix distingue actividades de verano e invierno; Estrasburgo advierte de
  la afluencia navideña. Las condiciones concretas se consultan al viajar.

## Duplicados y SEO

La tarjeta de París en `featured.ts` referencia directamente `fr-paris`.
La selección de primavera usa su nombre, país, imagen y recomendaciones,
manteniendo su categoría y descripción editorial de jardines. Notre-Dame se
conserva en el texto de la ficha. La nueva selección francesa de primavera
excluye París porque ya figura en esa página. La portada muestra París solamente
en su selección original de destacados y abre la misma ficha canónica.

No se consolidan regiones como Valle del Loira o Borgoña con ciudades ni se
migran las selecciones antiguas de España/Portugal. Esa revisión editorial
continúa pendiente y no es necesaria para añadir Francia.

Los enlaces conservan `/?ficha={nombre-base}` y las rutas mensuales y
estacionales existentes. No se cambian dominio, canónicas, sitemap, robots,
`/destinos/[slug]` ni `/destinos/roma`. Las fichas francesas llevan
`publication.status = 'draft'`: los slugs están preparados, pero no se anuncian
como páginas SEO completas mientras la ruta genérica siga siendo un placeholder.
Francia sí aparece en el contenido de las páginas mensuales ya publicadas.

## Fuentes revisadas el 20 de octubre de 2026

Los textos son redacción propia resumida; no se copian fotografías comerciales
de las oficinas de turismo ni se añaden tarifas de transporte o de visitas.

- Turismo: [París](https://www.france.fr/en/destination/paris/),
  [Niza](https://www.france.fr/en/destination/nice/),
  [Lyon](https://www.france.fr/en/destination/lyon/),
  [Marsella](https://www.france.fr/en/destination/marseille/),
  [Burdeos](https://www.france.fr/en/destination/bordeaux/),
  [Estrasburgo](https://www.france.fr/en/destination/strasbourg/),
  [Toulouse](https://www.france.fr/en/destination/toulouse/),
  [Nantes](https://www.france.fr/en/destination/nantes/),
  [Lille](https://www.france.fr/en/destination/lille/): Atout France.
- [Casco antiguo de Annecy](https://en.lac-annecy.com/must-sees/the-old-town-of-annecy/)
  y [accesos a Annecy](https://en.lac-annecy.com/practical/how-to-get-there/):
  oficina de turismo del lago. Distingue aviación de negocios local de los
  aeropuertos internacionales de Ginebra y Lyon.
- [Actividades de Chamonix](https://en.chamonix.com/a-voir-a-faire) y
  [acceso a Chamonix](https://en.chamonix.com/plan-my-stay/usual-information-services/how-to-get-here):
  oficina de turismo del valle.
- [Mont-Saint-Michel](https://www.montsaintmichel.gouv.fr/),
  [abadía](https://montsaintmichel.gouv.fr/visite-du-mont-et-de-sa-baie/abbaye-du-mont-saint-michel)
  y [accesos, incluido Rennes](https://www.montsaintmichel.gouv.fr/acceder-au-mont-saint-michel/venir-au-mont-saint-michel):
  establecimiento público nacional.
- Aeropuertos: contraste con la [Unión de Aeropuertos Franceses](https://www.aeroport.fr/uploads/documents/telecharger-l%27obervatoire-des-couts-de-touchee---edition-2023.pdf?v12.2=)
  y comprobaciones reales del autocompletado público de Travelpayouts
  (`https://autocomplete.travelpayouts.com/places2?term=Paris&locale=es`).
  Se verificaron las nueve ciudades, PAR y los enlaces CDG/ORY/BVA → PAR.
  Annecy no devolvió una ciudad equivalente, y Chamonix/Mont-Saint-Michel no
  devolvieron resultados. No se consultaron precios ni se usó un token.
- Once fotografías nuevas: metadatos de Wikimedia Commons (`imageinfo`), con
  autor, página de origen y licencia en cada ficha y atribución visible. París
  conserva la imagen Unsplash que ya estaba en destacados.

## Validación y límites

Instalación limpia con las versiones existentes (390 paquetes). Sin cambios
en `package.json`, lockfile, servicios de hoteles, Supabase, voz, APIs de
itinerarios/vuelos, variables de entorno o configuración de Vercel.

La suite añade 14 pruebas de Francia a las 100 anteriores: 77 identidades,
preservación de las 65 previas, aeropuertos/códigos metropolitanos/acceso,
temporadas, alias y textos de los siete idiomas, objetos compartidos de París,
render de tarjetas y enlaces, validación de los 84 pares destino/idioma para
itinerarios y resolución FR/ES/PT. Las integraciones y el render de componentes
se prueban con servicios y React simulados. No consumen OpenAI, precios de
Travelpayouts ni datos de Supabase.

Validación local (Node.js 24.19.0, npm 11.9.0, Next.js 15.5.28):

- `node --test tests/*.test.cjs`: **114/114 correctas**.
- `node node_modules/typescript/bin/tsc --noEmit --incremental false`: correcto.
- `node node_modules/next/dist/bin/next lint`: sin errores; avisos previos de
  imágenes y retirada futura de `next lint`.
- `node node_modules/next/dist/bin/next build`: correcto, 27 páginas generadas.
  El primer intento local encontró `EPERM` al crear carpetas temporales; crear
  los directorios de rutas bajo `.next/server/app` y `.next/types/app` permitió
  completar la compilación, sin cambiar configuración ni fuentes del proyecto.
- `git diff --check`: correcto. Archivos ES/PT y módulos protegidos sin cambios.
- Autocompletado público: 15 consultas reales sin token para contrastar códigos.
- Las 12 imágenes respondieron HTTP 200 con tipo `image/jpeg` al comprobar sus
  cabeceras; esto no sustituye la revisión visual de la Preview.

El estado de Vercel y las verificaciones reales en navegador constan en la PR. Las
pruebas reales de generación/voz y los precios de vuelos no forman parte de
estas simulaciones ni se dan por verificados con credenciales de producción.
Los aeropuertos asociados no garantizan una ruta o una tarifa disponible.

No se fusiona la PR ni se despliega en producción. El entorno de pruebas de
OpenAI anteriormente propuesto sigue pendiente de autorización y no se crea
ni configura como parte de esta fase de Francia.
