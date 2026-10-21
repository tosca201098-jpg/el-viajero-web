# Reino Unido — 12 fichas canónicas y aeropuertos de pasajeros

Base: main `66997e1c6f1ca7622e36199f0be8ae3d78ae3c66`, después de la PR #17. Rama independiente `codex/uk-destinations`. No fusionar ni publicar sin autorización.

## Identidades, regiones e idiomas
El catálogo pasa de 89 a 101 fichas. El manifiesto pre-uk-catalog.json conserva las huellas de los 89 perfiles anteriores, las tarjetas destacadas y los archivos completos de las cuatro temporadas.

| ID | Destino | Región | Aeropuertos físicos / accesos |
|---|---|---|---|
| gb-london | Londres | Inglaterra | LHR, LGW, STN, LTN, LCY, SEN; ciudad LON |
| gb-edinburgh | Edimburgo | Escocia | EDI |
| gb-manchester | Manchester | Inglaterra | MAN |
| gb-liverpool | Liverpool | Inglaterra | LPL |
| gb-birmingham | Birmingham | Inglaterra | BHX |
| gb-bristol-bath | Bristol y Bath | Inglaterra | BRS; Bath requiere traslado |
| gb-york | York | Inglaterra | Sin aeropuerto propio; accesos LBA, MAN |
| gb-oxford-cotswolds | Oxford y los Cotswolds | Inglaterra | Sin aeropuerto regular asignado; accesos LHR, BHX |
| gb-glasgow | Glasgow | Escocia | GLA; acceso PIK/Prestwick |
| gb-inverness-highlands | Inverness y las Highlands | Escocia | INV; excursiones con traslado |
| gb-cardiff-south-wales | Cardiff y el sur de Gales | Gales | CWL |
| gb-belfast-causeway-coast | Belfast y la Costa de los Gigantes | Irlanda del Norte | BFS, BHD; costa con traslado |

GB es el país. GB-ENG, GB-SCT, GB-WLS y GB-NIR son las regiones constitutivas, con nombres en los siete idiomas. Se muestran también en la descripción localizada. Cada ficha incluye fotografía, licencia y autor, descripción propia, cuatro recomendaciones con actividades, estancia, meses y consejos prácticos en es/en/fr/de/it/pt/ca. Identidades y slugs son estables. Los alias Bristol/Bath, Oxford/Cotswolds, Inverness/Highlands, Cardiff y Belfast resuelven una sola ficha combinada.

Las tarjetas editoriales históricas de Londres, Edimburgo y Highlands permanecen con su contenido original. No se convierten en duplicados canónicos ni se borran. El generador admite el contexto editorial original y el contexto canónico según los datos de cada petición.

Fuentes turísticas: [VisitBritain](https://www.visitbritain.com/en/destinations), sus páginas de Inglaterra/Escocia y [fichas oficiales](https://www.visitbritain.org/fact-sheets-itineraries-seasonal-content-resources), [Visit Wales](https://www.visitwales.com/) y [Discover Northern Ireland](https://discovernorthernireland.com/things-to-do/outdoors-nature/causeway-coastal-route/). Los textos son orientación turística, no precios, horarios de apertura ni promesas de disponibilidad.

## Visibilidad, selección y límites
No se añaden bloques «Reino Unido» ni selectores independientes. Se conservan las 16 tarjetas originales de portada y las 16 de cada temporada, incluyendo París y las selecciones editoriales británicas. La política de presentación excluye las nuevas fichas GB de recomendaciones mensuales y descubrimiento automático por presupuesto. Sus datos siguen disponibles para consultas expresas, voz e itinerarios.

Al confirmar una sugerencia del autocompletado se amplía a GB el botón contextual existente, que abre solo su ficha. Escribir, recorrer sugerencias y confirmar no abren modales; editar invalida la selección anterior. No cambia el componente de autocompletado, su teclado ni su posicionamiento móvil.

La ficha se consulta también mediante el enlace expreso existente `/?ficha=...` y por voz. Ejemplos: `/?ficha=Londres`, `/?ficha=Manchester`, `/?ficha=York`.

**York no aparece como ciudad británica en la respuesta pública del proveedor para «York»**, que ofrece Nueva York y otras coincidencias. No se inventa una sugerencia aeroportuaria ni se atribuye LBA a York para sortearlo. Su ficha está disponible por enlace expreso y voz; sus botones de acceso buscan Leeds o Manchester con traslado aparte. Oxford aparece como ciudad OXF en el proveedor, pero no se promueve Kidlington como aeropuerto regular de pasajeros. La ficha conserva accesos LHR/BHX y no un aeropuerto propio. Habilitar York como sugerencia turística independiente requeriría distinguir consultas turísticas de búsquedas de vuelos: queda fuera de esta ampliación para no cambiar ese contrato.

Las fichas sin códigos de vuelo propios ya ocultan el botón genérico de vuelos y utilizan sus accesos. El resolver de precios no cambia. Los botones de acceso GB pasan el nombre real de la ciudad del proveedor: LBA → Leeds, LHR → Londres, PIK → Glasgow. No se envía «York» como si tuviera un aeropuerto, ni se usa MAN como identidad de York.

No hay nuevas rutas públicas, entradas en sitemap, metadatos SEO o cambios en Vercel. Las fichas nuevas permanecen en estado draft, consultables con los mecanismos existentes.

## Aeropuertos verificados a 21/10/2026
Los recursos públicos de Travelpayouts confirman los códigos, país GB, tipo físico airport, ciudad asociada y flag flightable de los 38 registros reforzados. Esto acredita presencia en el proveedor; no garantiza una ruta, precio o plaza.

Fuentes: [aeropuertos](https://api.travelpayouts.com/data/en/airports.json), [ciudades](https://api.travelpayouts.com/data/en/cities.json) y [CAA, pasajeros de agosto de 2026](https://www.caa.co.uk/data-and-analysis/uk-aviation-market/airports/uk-airport-data/uk-airport-data-2026/august-2026/). La CAA acredita tráfico reciente en estos aeropuertos; los horarios y temporadas deben consultarse al operador.

| IATA físico | Aeropuerto | Ciudad del proveedor |
|---|---|---|
| LHR | Londres Heathrow | LON |
| LGW | Londres Gatwick | LON |
| STN | Londres Stansted | LON |
| LTN | Londres Luton | LON |
| LCY | London City | LON |
| SEN | Londres Southend | LON |
| MAN | Manchester | MAN |
| LPL | Liverpool John Lennon | LPL |
| BHX | Birmingham | BHX |
| EMA | East Midlands | NQT |
| LBA | Leeds Bradford | LBA |
| NCL | Newcastle | NCL |
| MME | Teesside | MME |
| BRS | Bristol | BRS |
| SOU | Southampton | SOU |
| BOH | Bournemouth | BOH |
| EXT | Exeter | EXT |
| NQY | Cornwall Newquay | NQY |
| NWI | Norwich | NWI |
| EDI | Edimburgo | EDI |
| GLA | Glasgow International | GLA |
| PIK | Glasgow Prestwick | GLA |
| ABZ | Aberdeen | ABZ |
| INV | Inverness | INV |
| DND | Dundee | DND |
| SYY | Stornoway | SYY |
| KOI | Kirkwall | KOI |
| LSI | Sumburgh | SDZ |
| ILY | Islay | ILY |
| BRR | Barra | BRR |
| BEB | Benbecula | BEB |
| CWL | Cardiff | CWL |
| BFS | Belfast International | BFS |
| BHD | George Best Belfast City | BFS |
| LDY | City of Derry | LDY |
| HUY | Humberside | HUY |
| CAL | Campbeltown | CAL |
| TRE | Tiree | TRE |

Se incluyen 35 de los 36 códigos solicitados y tres adicionales (HUY/CAL/TRE). VLY queda excluido. LON existe como ciudad metropolitana y los seis aeropuertos figuran asociados a ella; no se inventan agrupaciones regionales. BFS y GLA sirven tanto de códigos físicos como de ciudad, distinguidos por tipo. Prestwick está físicamente separado y su asociación a GLA procede del proveedor. EMA usa NQT y Sumburgh usa SDZ; no se sustituyen por códigos inventados.

[HIAL](https://www.hial.co.uk/hial-group/about-us) gestiona los aeropuertos regionales e insulares; [Tiree](https://www.hial.co.uk/tiree-airport) muestra servicio de pasajeros. Barra depende de mareas y meteorología; estas fichas de datos no prometen operación diaria.

### Exclusiones y discrepancias
- **VLY / Anglesey:** el proveedor aún indica flightable=true, pero la [respuesta oficial del Parlamento galés](https://record.senedd.wales/WrittenQuestion/93374) documenta el cierre del aeropuerto civil en 2023 y la retirada del servicio. Se excluyen sus sugerencias GB; no se añaden rutas.
- **DSA / Doncaster Sheffield:** el proveedor también mantiene flightable=true. El [Ayuntamiento de Doncaster](https://content.govdelivery.com/accounts/UKDONCO/bulletins/3f191bc) sitúa la recuperación de vuelos de pasajeros en un plan futuro de 2027/28. Sin evidencia oficial revisada de servicio regular actual, se excluyen sus sugerencias GB. La exclusión deberá revisarse si se confirma la reapertura.
- **LEQ / Land’s End e ISC / St Mary’s:** [Skybus](https://www.islesofscilly-travel.co.uk/flights/the-routes/) acredita vuelos regionales, pero el recurso público del proveedor los marca flightable=false. No se añaden al refuerzo de aeropuertos disponibles. Su presencia en datos no garantiza cobertura de tarifas en Travelpayouts.
- OXF/Kidlington y CEG/Hawarden no se añaden como alternativas regulares sin comprobar un servicio apropiado; figurar en estadísticas o tener flightable=true no basta.
- DUB, ORK y SNN conservan país IE (República de Irlanda). IOM es IM; Jersey JER es JE y Guernsey GCI es GG. Ninguno entra en la lista GB. Las sugerencias ajenas al Reino Unido conservan sus países y funcionamiento.
- Se excluye una falsa disponibilidad aeroportuaria, no se modifica el endpoint de precios ni se promete bloquear toda consulta de texto libre del usuario.

## Autocompletado y precios
Se mantienen relevancia exacta, prefijos, parciales, popularidad secundaria, normalización y deduplicación por país/tipo/código. Los registros físicos británicos verificados completan búsquedas de IATA y nombres exactos de ciudades, con la misma llamada pública gratuita existente. Para Londres se permiten siete sugerencias (ciudad más seis aeropuertos); los demás casos mantienen seis. Así London City no queda cortado por el límite anterior.

La búsqueda sigue siendo por ciudad: Heathrow/Gatwick/etc. → Londres/LON, Belfast City/BHD → Belfast/BFS, Prestwick/PIK → Glasgow/GLA. No se incorpora un filtro de tarifas exclusivo por aeropuerto. Fechas flexibles, presupuestos, pasajeros, precios y enlaces de afiliación permanecen sin cambios.

## Fotografías
Las doce imágenes proceden de Wikimedia Commons con licencia CC BY o CC BY-SA, verificadas mediante imageinfo/extmetadata. uk-images.ts guarda el archivo fuente, autor, licencia y enlace. El modal existente muestra esos créditos. Se usan miniaturas del proveedor sin editar el original; no se cambian otras fotografías.

## Validación y servicios
- 202 pruebas correctas, incluyendo huellas de los 89 perfiles previos, 101 IDs/slugs únicos, regiones y siete idiomas, 38 IATA físicos, países, exclusiones y siete opciones de Londres.
- Conservación de portada y cuatro temporadas, páginas mensuales y descubrimiento por presupuesto; selección individual y edición sin aperturas automáticas.
- Recorrido real del código voz → herramienta → ficha GB → planificador existente → itinerario visible → confirmación, para doce destinos en siete idiomas, con medios y servicios simulados. Siguen las pruebas de error, cancelación, repeticiones, idiomas, vuelos y Supabase.
- TypeScript y lint correctos; permanecen avisos anteriores de img y deprecación de next lint.
- Compilación de producción correcta (27 páginas) y 21/21 comprobaciones HTTP locales.
- Configuración de mantenimiento diario y dependencias sin modificaciones. Se ejecutan sus pruebas con el guard de red activo.
- La auditoría sin dependencias de desarrollo devuelve cero. La primera consulta completa no respondió; la repetición confirmó 7 High, 0 Critical, 0 Moderate y 0 Low. Son los siete avisos conocidos de la incidencia #16: no se corrigen ni ocultan en esta ampliación.
- No se leen ni usan credenciales de producción. No se realizan llamadas de pago, generación real de IA, micrófono ni operaciones reales en Supabase.

Las verificaciones reales son recursos públicos de lugares/aeropuertos y licencias, compilación, páginas locales y las comprobaciones de Preview documentadas en la PR. Los tests de vuelos, IA, voz y Supabase utilizan simulaciones.

Preview de la PR #18: https://el-viajero-web-git-codex-uk-destinations-el-viajero.vercel.app/ (Vercel Ready). En navegador real: las seis ciudades requeridas encabezan sus consultas; Londres muestra ciudad y seis aeropuertos, y Belfast BFS/BHD. LHR, MAN, EDI, BHD, PIK y CWL muestran su aeropuerto físico primero. Se abrieron Londres y Manchester por selección confirmada, con un único modal; escribir no abrió fichas. Las otras diez fichas se comprobaron mediante enlaces expresos. Portada y cuatro temporadas conservan 16 tarjetas; mayo conserva sus 65 tarjetas ES/PT. Se guardaron capturas, sin búsquedas de precios ni llamadas de IA.

La inspección visual sustituyó la panorámica excesivamente estrecha de Bath por una imagen más nítida de Pulteney Bridge, de Jürgen Matern (CC BY-SA 3.0). No se modifican fotografías ajenas a esta ampliación.

El último mantenimiento diario programado visible es [39552881956](https://github.com/tosca201098-jpg/el-viajero-web/actions/runs/39552881956), con fallo de la auditoría de dependencias anterior. Esto no equivale a un mantenimiento desactivado ni a una comprobación de seguridad limpia; los avisos pendientes siguen visibles. La ampliación no cambia el workflow.

## PR pendientes y archivos
Se revisaron #8 (Ibiza), #13 (foto de Milán), #14 (Asturias) y la antigua #9 (selección francesa), sin modificarlas. La retirada del selector independiente ya está en main desde #11. No se cambia italy-images.ts ni los datos de los países anteriores, para evitar conflictos con las fotografías pendientes.

Cambios funcionales limitados a: catálogo index.ts, nuevos uk.ts/uk-images.ts, presentación y selección, places/route.ts y sus datos uk-airports.ts, más la ampliación GB del modal/botón contextual de app/page.tsx. El resto son pruebas, capturas públicas de datos y documentación. No se modifican /api/voice, /api/itinerary, /api/travelpayouts/flights, resolver de precios, Supabase, credenciales, dominio, rutas, SEO, Vercel o GitHub Actions.
