# Alemania: catálogo canónico y aeropuertos

Base revisada: main `8887d57ceda8e6b7250e0070793af75d7b23c2ed`, después de la PR #18. Se añaden doce identidades sin equivalentes canónicos previos: 101 → **113 fichas**, con identificadores y slugs únicos. Las huellas de los 101 perfiles anteriores y las listas editoriales se conservan en `tests/fixtures/pre-germany-catalog.json` y se verifican en las pruebas.

## Fichas

| ID | Destino | Aeropuerto propio | Accesos separados |
| --- | --- | --- | --- |
| de-berlin | Berlín | BER | — |
| de-munich | Múnich | MUC | FMM / Memmingen |
| de-hamburg | Hamburgo | HAM | LBC / Lübeck |
| de-frankfurt | Fráncfort del Meno | FRA | HHN / Hahn, lejos de Fráncfort |
| de-cologne-bonn | Colonia y Bonn | CGN | — |
| de-dusseldorf | Düsseldorf | DUS | NRN / Weeze, requiere traslado |
| de-stuttgart | Stuttgart | STR | — |
| de-nuremberg | Núremberg | NUE | — |
| de-dresden | Dresde | DRS | — |
| de-leipzig | Leipzig | LEJ | — |
| de-heidelberg-neckar | Heidelberg y valle del Neckar | Ninguno atribuido | FRA, STR |
| de-freiburg-black-forest | Friburgo y Selva Negra | Ninguno atribuido | BSL (físicamente Francia), FKB |

Cada ficha contiene nombre, descripción, cuatro recomendaciones con actividades y monumentos, estancia orientativa, meses y consejos prácticos, foto y créditos en el modelo existente. Los textos turísticos se redactan en español, inglés, francés, alemán, italiano, portugués y catalán. País DE y nombres de país se traducen con el helper existente. La identidad no depende del nombre traducido. No se añaden precios ni disponibilidades.

Fuentes turísticas oficiales consultadas el 21 de octubre de 2026: Germany Travel para [Berlín](https://www.germany.travel/en/cities-culture/berlin.html), [Múnich](https://www.germany.travel/en/cities-culture/munich.html), [Hamburgo](https://www.germany.travel/en/cities-culture/hamburg.html), [Fráncfort](https://www.germany.travel/en/cities-culture/frankfurt.html), [Colonia](https://www.germany.travel/en/cities-culture/cologne.html), [Düsseldorf](https://www.germany.travel/en/cities-culture/duesseldorf.html), [Stuttgart](https://www.germany.travel/en/cities-culture/stuttgart.html), [Núremberg](https://www.germany.travel/en/cities-culture/nuremberg.html), [Dresde](https://www.germany.travel/en/cities-culture/dresden.html), [Leipzig](https://www.germany.travel/en/cities-culture/leipzig.html), [Heidelberg](https://www.germany.travel/en/cities-culture/heidelberg.html) y [Friburgo](https://www.germany.travel/en/cities-culture/freiburg.html). Estancias y meses son recomendaciones editoriales, no garantías meteorológicas ni calendarios de eventos.

## Visibilidad e integración

No hay secciones de Alemania, tarjetas nuevas automáticas ni selector independiente. Se preservan las 16 tarjetas originales de portada y de cada temporada, los doce meses y los resultados editoriales por presupuesto. El filtro de presentación excluye DE, igual que FR/IT/GB; el catálogo completo sigue disponible para consultas e itinerarios.

Tras confirmar una sugerencia de ciudad o aeropuerto, el botón contextual existente abre únicamente su ficha. Escribir o seleccionar una sugerencia no abre el modal automáticamente. Los nombres de los siete idiomas y los aeropuertos propios resuelven a la misma identidad. Se reutilizan el modal, los créditos y el planificador, sin cambiar la sesión de voz ni el endpoint de itinerarios.

Heidelberg y Friburgo no reciben códigos aeroportuarios inventados. El proveedor devuelve cero sugerencias para Heidelberg y relaciona Friburgo con Basilea: no se falsifican ciudades de vuelos. Sus fichas pueden consultarse expresamente mediante los enlaces existentes `/?ficha=Heidelberg` y `/?ficha=Friburgo`, y mediante la herramienta de itinerario por nombre. Sus botones de acceso preparan la ciudad real de llegada. No se atribuye FRA a Heidelberg ni BSL a Alemania.

Las fichas permanecen en estado draft del catálogo, con la misma consulta individual existente; no se añaden rutas públicas de destino ni entradas al sitemap sin contenido editorial publicado. SEO y URLs anteriores permanecen intactos.

## Aeropuertos y agrupaciones del proveedor

Datos públicos: [airports.json](https://api.travelpayouts.com/data/en/airports.json) y [cities.json](https://api.travelpayouts.com/data/en/cities.json). Se utiliza la captura pública obtenida anteriormente el mismo 21 de octubre: el refresco posterior agotó el tiempo. Las 28 muestras de autocompletado se consultaron de nuevo durante esta revisión y se guardaron sin credenciales ni precios. `flightable=true` acredita el dato del proveedor, no garantiza rutas ni tarifas para cualquier fecha.

| IATA físico | Aeropuerto | Ciudad/grupo de precios del proveedor |
| --- | --- | --- |
| BER | Berlín-Brandeburgo | BER |
| MUC | Múnich | MUC |
| NUE | Núremberg | NUE |
| FMM | Memmingen / Allgäu | FMM |
| FRA | Fráncfort del Meno | FRA |
| HHN | Frankfurt-Hahn / Hunsrück | FRA |
| KSF | Kassel-Calden | KSF |
| HAM | Hamburgo | HAM |
| HAJ | Hannover | HAJ |
| BRE | Bremen | BRE |
| LBC | Lübeck / Blankensee | HAM |
| RLG | Rostock-Laage | RLG |
| DUS | Düsseldorf | DUS |
| CGN | Colonia/Bonn | CGN |
| DTM | Dortmund | DTM |
| FMO | Münster/Osnabrück | FMO |
| PAD | Paderborn/Lippstadt | PAD |
| NRN | Weeze / Niederrhein | DUS |
| STR | Stuttgart | STR |
| FKB | Karlsruhe/Baden-Baden | FKB |
| FDH | Friedrichshafen | FDH |
| LEJ | Leipzig/Halle | LEJ |
| DRS | Dresde | DRS |
| ERF | Erfurt-Weimar | ERF |
| SCN | Saarbrücken / Ensheim | SCN |
| GWT | Sylt / Westerland | GWT |
| HDF | Heringsdorf | HDF |

Los 27 códigos solicitados figuran como aeropuerto físico DE y flightable=true. No se inventa un código metropolitano diferente donde el proveedor comparte código físico y de ciudad: el tipo city/airport los distingue. FMM sigue siendo Memmingen, sin incorporarlo como aeropuerto físico de Múnich. HHN, NRN y LBC conservan las agrupaciones de precios FRA/DUS/HAM y se explican como accesos con traslado en las fichas. No se incorpora un filtro de tarifas exclusivo por aeropuerto: precios, fechas flexibles, presupuesto, pasajeros y enlaces de afiliación siguen usando la lógica existente.

Se mantiene el orden exacto/prefijo/parcial y la popularidad secundaria. Se completan nombres exactos y códigos con aeropuertos verificados, usando la misma llamada gratuita existente al autocompletado. Se añaden alias españoles, alemanes y variantes habituales a las ciudades DE devueltas por el proveedor. Un IATA exacto prioriza su aeropuerto físico. Para «Frankfurt», el proveedor llama exactamente «Frankfurt» a FRA: ese aeropuerto puede preceder al alias de la ciudad, respetando la relevancia existente. Cuando el proveedor da a un aeropuerto el mismo nombre que su ciudad, se utiliza su nombre físico verificado para distinguir las dos opciones, especialmente DUS.

### Operación limitada, fronteras y exclusiones

- El [operador de Berlín](https://corporate.berlin-airport.de/en/company-media/media-portal/pressemitteilungen/2020-11-08-berlin-sagt-danketxl.html) confirma el último vuelo de Tegel el 8 de noviembre de 2020. El [coordinador oficial](https://fluko.org/wp-content/uploads/2020/04/BER-Local-Guideline-W20-S21-Historic-Slots.pdf) documenta el cambio SXF → BER. TXL y SXF se excluyen como alternativas comerciales independientes.
- XFW/Finkenwerder no se ofrece como alternativa pública a HAM. [Airbus](https://www.airbus.com/en/newsroom/stories/2022-11-sustainable-aviation-fuel-reduces-airbus-scope-1-emissions) describe vuelos industriales y chárteres internos de empleados; flightable=true por sí solo no justifica añadirlo al buscador de pasajeros.
- [EuroAirport](https://www.euroairport.com/en/faq/about-euroairport) está físicamente en Francia. El proveedor etiqueta BSL/MLH como CH dentro del grupo EAP/Basilea. La ficha identifica el acceso físico FR y el buscador conserva la clasificación del proveedor para no alterar precios. Nunca se incluye BSL/MLH en los 27 aeropuertos alemanes.
- Los informes de [ADV](https://www.adv.aero/aktuelle-verkehrszahlen/) acreditan tráfico de pasajeros en los principales aeropuertos; no garantizan servicios diarios ni cubren por sí solos todos los regionales.
- [Kassel](https://www.kassel-airport.de/service-infos/flugplan/) y [Lübeck](https://www.flughafen-luebeck.de/files/flughafen-luebeck/03_reiseangebote/03_reiseangebote_flugplaene/Flugplan%20Sommer.pdf) publican horarios comerciales, con oferta limitada según temporada. [Heringsdorf](https://www.flughafen-heringsdorf.de/flugplan/) muestra operación estacional; no se promete operación todo el año.
- [Rostock](https://www.rostock-airport.de/en/flugbetrieb-luebeck) comunicó una interrupción temporal del 12 al 19 de octubre de 2026 y reanudación posterior. No se confunde esa interrupción con cierre permanente; la oferta es limitada y puede ser chárter o estacional.
- Se revisaron también LGO, HGL, BMK, HOQ, ZQW, NRD, EME y JUI: el recurso del proveedor indica flightable=false. [FLN](https://www.fln-norddeich.de/) acredita servicios regionales a Juist/Norderney, pero no se deduce cobertura de tarifas en Travelpayouts ni se refuerzan como aeropuertos disponibles sin esa verificación. No se eliminan registros de otros países.

## Fotografías

Las doce fotografías reales proceden de Wikimedia Commons con CC BY o CC BY-SA, aptas para uso comercial con sus condiciones. `germany-images.ts` contiene archivo fuente, autor, licencia y enlace comprobados con imageinfo/extmetadata el 21 de octubre de 2026. Las doce miniaturas respondieron HTTP 200 con content-type image/jpeg mediante HEAD. Esto verifica accesibilidad, no el encuadre final en navegador. El modal existente muestra los créditos. Se usan miniaturas del proveedor sin editar el archivo original. No se cambian fotografías anteriores ni las PR pendientes de Ibiza #8, Milán #13 y Asturias #14, revisadas como abiertas.

## Validación

- 225 pruebas pasan: integridad de los 101 perfiles y de tarjetas originales, 113 IDs/slugs únicos, doce fichas completas en siete idiomas, 27 IATA físicos, búsquedas españolas y alemanas, países, traslados y exclusiones.
- Pruebas de selección confirmada → ficha individual, edición sin apertura automática y voz → herramienta → planificador existente → itinerario visible para los doce destinos y siete idiomas. Voz, IA, precios y Supabase se simulan, sin usar claves ni efectuar llamadas de pago.
- TypeScript y lint pasan. Permanecen los avisos anteriores de img y deprecación de next lint.
- Compilación de producción correcta con Next.js 15.5.28; el fallo inicial EPERM de mkdir de Windows se resolvió preparando directorios de salida mediante un ayudante externo, sin cambiar configuración del proyecto.
- 21/21 comprobaciones HTTP locales correctas, con servicios externos bloqueados.
- Workflow diario 391317886 confirmado active mediante la API pública. Sigue el cron `37 5 * * *`, con ejecución manual, sin modificar GitHub Actions.
- Dependencias sin modificaciones. La primera auditoría completa no respondió; la repetición confirmó siete High, cero Critical, Moderate y Low. Son los avisos conocidos de @next/eslint-plugin-next, braces, chokidar, eslint-config-next, fast-glob, micromatch y tailwindcss, registrados en la incidencia #16. La auditoría omit=dev devuelve cero. No se ocultan ni corrigen en esta ampliación.

Verificaciones reales: metadatos públicos, autocompletado, licencias, compilación, HTTP local y Preview. Los tests de voz/IA/Supabase no son pruebas con servicios reales.

Preview de la PR #19: https://el-viajero-web-git-codex-germany-destinations-el-viajero.vercel.app/ (Vercel Ready en el primer commit). En navegador real se verificaron las 16 tarjetas originales de portada, los ocho nombres españoles requeridos encabezando sus consultas, la distinción FRA/HHN y la apertura única de Berlín por selección confirmada. Escribir y confirmar la sugerencia no abrieron el modal automáticamente: fue necesario pulsar el botón contextual. La captura de Berlín se tomó antes de que cargase la fotografía y no acredita su renderizado final.

El primer control del navegador dejó de estar disponible durante la revisión. En una segunda sesión se comprobaron realmente las doce fichas y sus imágenes cargadas (complete=true, naturalWidth=960), las 16 tarjetas de portada y las 16 de cada temporada, coincidiendo con las listas originales y sin bloques nuevos por países. Las 80 imágenes editoriales cargaron. DUS exacto prioriza «Dusseldorf International Airport»; Düsseldorf distingue la ciudad, el aeropuerto y Weeze/NRN, sin abrir fichas al escribir ni confirmar la sugerencia. El botón contextual abrió únicamente Düsseldorf.

La revisión visual detectó una firma en la foto nocturna de Heidelberg, una imagen demasiado oscura en Düsseldorf y recortes superiores de monumentos. Se sustituyeron las dos fotos por [Heidelberg, de Frans Berkelaar (CC BY 2.0)](https://commons.wikimedia.org/wiki/File:Alte_br%C3%BCcke,_Schloss_und_Altstad_Heidelberg_-_Deutschland_(48847871506).jpg) y [Medienhafen, de Dietmar Rabich (CC BY-SA 4.0)](https://commons.wikimedia.org/wiki/File:D%C3%BCsseldorf,_Medienhafen_--_2015_--_8146-51.jpg). Se mantienen archivo fuente, autor y licencia. El campo opcional imagePosition permite conservar la parte superior en Colonia, Dresde, Friburgo y Heidelberg, y el sector izquierdo del puerto de Düsseldorf. Las imágenes anteriores sin ese campo conservan exactamente su encuadre.

Después del ajuste pasan nuevamente las 225 pruebas, TypeScript, lint y compilación. Los resultados de la repetición visual sobre la nueva Preview se registran en la PR #19. No se han efectuado búsquedas reales de precios, generación de IA, uso del micrófono ni operaciones de datos en Supabase.

## Alcance

Cambios funcionales limitados al catálogo y nuevos datos DE, filtro de presentación, selección de accesos, autocompletado y habilitación DE del modal contextual existente. El resto son pruebas, capturas públicas de metadatos y documentación. No se cambian /api/voice, /api/itinerary, /api/travelpayouts/flights, resolver de precios, Supabase, dependencias, credenciales, variables, Vercel, dominio, identificadores técnicos, rutas ni mantenimiento diario. No fusionar ni publicar en producción sin autorización.
