# Italia — doce fichas canónicas y aeropuertos de pasajeros

Base: main en e7578377000e120f1c37ad153e94ced1cff38e7f, después de la PR #11.
Esa PR ya eliminó el selector independiente: no se vuelve a introducir ni se
modifica su rama. No hay nuevos bloques por países, rutas publicadas ni cambios SEO.

## Catálogo y presentación

89 fichas: las 77 anteriores permanecen idénticas, comprobadas mediante huellas
de todos sus datos. Doce identidades nuevas: it-rome, it-milan, it-venice,
it-florence, it-naples, it-bologna, it-turin, it-verona-garda, it-pisa-tuscany,
it-palermo, it-catania-etna e it-cagliari-south-sardinia.

Cada ficha contiene siete traducciones completas, cuatro recomendaciones,
estancia orientativa, épocas recomendadas, identidad estable, aeropuertos y foto.
Los alias cortos Pisa, Verona, Catania y Cagliari conducen a su ficha combinada;
no se crean fichas separadas del Etna, Garda, Toscana o sur de Cerdeña.

Las 16 tarjetas de portada y las 16 de cada temporada mantienen contenido,
imágenes, orden y diseño. Roma, Florencia, Dolomitas, Umbría y las demás tarjetas
editoriales siguen existiendo: son selecciones históricas, no nuevas fichas
canónicas. La portada sigue usando su Roma original; la consulta expresa y la
voz usan it-rome. El servidor de itinerarios ya admite ambos contextos existentes
sin duplicar el generador ni invalidar las solicitudes manuales anteriores.
La ruta existente /destinos/roma permanece sin cambios.

La política de presentación excluye FR e IT de las tarjetas automáticas del
catálogo (meses y descubrimiento por presupuesto). Los datos de temporada siguen
siendo reutilizables. Esa política no afecta a las listas editoriales originales.

## Selección e itinerarios

Se amplía a IT el botón contextual existente tras confirmar un destino en el
autocompletado. Escribir o recorrer sugerencias no abre nada; clic o Enter confirma
la ciudad y ofrece consultar únicamente su ficha. Editar invalida la selección.
No existe un desplegable independiente ni un nuevo botón global en portada.

Se utiliza el mismo modal, el planificador y el contrato de /api/itinerary.
Las traducciones se aplican a las nuevas fichas por ID, conservando la presentación
original de las tarjetas editoriales. Voz y generación no cambian de implementación.

## Aeropuertos y límites de búsqueda

Verificación pública: 20 de octubre de 2026. Las capturas en tests/fixtures
contienen datos públicos del proveedor, sin credenciales, precios ni datos personales.

- Recursos Travelpayouts: [aeropuertos](https://api.travelpayouts.com/data/en/airports.json)
  y [ciudades](https://api.travelpayouts.com/data/en/cities.json), solo registros IT.
  Los 40 son iata_type=airport y flightable=true en la captura.
- [Estadísticas oficiales de los gestores, agosto de 2026](https://assaeroporti.com/dati-di-traffico/)
  para comprobar actividad de pasajeros. Datos de tráfico no equivalen a una ruta
  disponible para cualquier fecha.
- [Elba: operador aeroportuario](https://www.elbaisland-airport.it/) y
  [horario del operador de vuelos, verano 2026](https://www.smallfly.eu/media/Small_Fly_Elba_Schedule_Summer26_v01_ITA.pdf).
- [Pantelleria y Lampedusa: servicio de pasajeros prorrogado hasta el 31/10/2026](https://mit.gov.it/normativa/decreto-direttoriale-n18-del-13-aprile-2026).
  [ENAC confirma PNL](https://www.enac.gov.it/app/uploads/2025/04/PEA_Pantelleria.pdf).

Los 32 aeropuertos solicitados más ocho adicionales: BZO, CRV, FOG, EBA, QSR,
PMF, FRL y CUF. No se añaden fichas turísticas para los aeropuertos ajenos a las doce.

| IATA físico | Nombre en el recurso del proveedor | Código de ciudad del proveedor |
|---|---|---|
| FCO | Leonardo da Vinci-Fiumicino Airport | ROM |
| CIA | Ciampino-G. B. Pastine International Airport | ROM |
| MXP | Milano Malpensa Airport | MIL |
| LIN | Milano Linate Airport | MIL |
| BGY | Orio al Serio International Airport | MIL |
| TRN | Turin Airport | TRN |
| GOA | Genoa Cristoforo Colombo Airport | GOA |
| VRN | Verona Villafranca Airport | VRN |
| VCE | Venice Marco Polo Airport | VCE |
| TSF | Treviso Airport | VCE |
| TRS | Trieste - Friuli Venezia Giulia Airport | TRS |
| FLR | Firenze-Peretola Airport | FLR |
| PSA | Pisa International Airport | PSA |
| BLQ | Guglielmo Marconi Airport | BLQ |
| PEG | Sant Egidio Airport | PEG |
| AOI | Ancona Falconara Airport | AOI |
| RMI | Miramare Airport | RMI |
| PSR | Abruzzo Airport | PSR |
| NAP | Naples International Airport | NAP |
| BRI | Palese Airport | BRI |
| BDS | Brindisi - Salento Airport | BDS |
| SUF | Lamezia Terme International Airport | SUF |
| REG | Tito Menniti Airport | REG |
| PMO | Falcone-Borsellino Airport | PMO |
| CTA | Catania-Fontanarossa Airport | CTA |
| CIY | Comiso Airport | CIY |
| TPS | Trapani-Birgi Airport | TPS |
| LMP | Lampedusa Airport | LMP |
| PNL | Pantelleria Airport | PNL |
| CAG | Cagliari Elmas Airport | CAG |
| OLB | Olbia Costa Smeralda Airport | OLB |
| AHO | Alghero-Fertilia Airport | AHO |
| BZO | Bolzano | BZO |
| CRV | Crotone | CRV |
| FOG | Gino Lisa | FOG |
| EBA | Marina Di Campo Airport | EBA |
| QSR | Pontecagnano | QSR |
| PMF | Parma Airport | PMF |
| FRL | Luigi Ridolfi | FRL |
| CUF | Levaldigi Airport | CUF |

ROM y MIL son códigos de ciudad confirmados en el proveedor, no aeropuertos físicos.
VCE identifica tanto la ciudad como Marco Polo: se conservan ambas sugerencias.
BGY se encuentra en Bérgamo y TSF en Treviso; la agrupación con MIL/VCE procede
del proveedor. En las fichas se muestran como acceso con traslado terrestre,
no como aeropuertos situados dentro de Milán/Venecia. No se inventan códigos metropolitanos.

El autocompletado combinado del proveedor devuelve algunos códigos solo como
ciudades, incluso al pedir tipo aeropuerto. Se complementan las consultas IATA
exactas con los 40 registros físicos verificados del mismo proveedor, sin llamadas
adicionales, secretos ni precios. El código físico exacto prima sobre el código
compartido de ciudad. Por nombre, se mantiene primero la ciudad exacta.
La deduplicación incluye el tipo para no confundir ciudad y aeropuerto.

Se conserva la búsqueda de precios por ciudad: seleccionar FCO utiliza Roma/ROM,
MXP/LIN/BGY utiliza Milán/MIL, y VCE/TSF utiliza Venecia/VCE, como antes.
No se introduce un filtro de precios por aeropuerto físico. Los botones de acceso
BGY/TSF también trasladan la ciudad al formulario, con una explicación en los
siete idiomas; no envían un código físico aislado al resolutor de ciudades. Los códigos ajenos
al catálogo siguen disponibles en el autocompletado y el buscador de vuelos.
El recurso verificado es una captura fechada: deberá revisarse si cambian los
códigos, servicios o agrupaciones. No garantiza rutas ni disponibilidad en fechas concretas.

## Fuentes turísticas e imágenes

Contenido editorial propio contrastado con Italia.it:
[Roma](https://www.italia.it/en/lazio/rome), [Milán](https://www.italia.it/en/lombardy/milan),
[Venecia](https://www.italia.it/en/veneto/venice), [Florencia](https://www.italia.it/en/tuscany/florence),
[Nápoles](https://www.italia.it/en/campania/naples), [Bolonia](https://www.italia.it/en/emilia-romagna/bologna),
[Turín](https://www.italia.it/en/piedmont/turin), [Verona](https://www.italia.it/en/veneto/verona),
[Pisa](https://www.italia.it/en/tuscany/pisa), [Palermo](https://www.italia.it/en/sicily/palermo),
[Catania](https://www.italia.it/en/sicily/catania), [Cagliari](https://www.italia.it/en/sardinia/cagliari).
Las épocas y duraciones son orientación editorial, sin promesas de precios.
El Etna remite a avisos y accesos oficiales conforme a
[Parco dell’Etna](https://parcoetna.it/ordinanze-sindaci/).

Fotografías reales de Wikimedia Commons, verificación de autor, fuente y licencia
mediante imageinfo; miniaturas de 960 px facilitadas por Wikimedia sin retoques
manuales. Se conservan los enlaces de atribución y licencia visibles en el modal.
No se sustituyen fotografías de las 77 fichas anteriores ni de tarjetas originales.

| Ficha | Autor y fuente | Licencia seleccionada |
|---|---|---|
| rome | [DAVID ILIFF](https://commons.wikimedia.org/wiki/File:Colosseum_in_Rome,_Italy_-_April_2007.jpg) | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5) |
| milan | [Andrea Albini](https://commons.wikimedia.org/wiki/File:Milano_-_il_Duomo_lato_Galleria_Vittorio_Emanuele_II_-_panoramio.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| venice | [Martin Falbisoner](https://commons.wikimedia.org/wiki/File:Panorama_of_Canal_Grande_and_Ponte_di_Rialto,_Venice_-_September_2017.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| florence | [Ray in Manila](https://commons.wikimedia.org/wiki/File:Florence_panorama_as_seen_from_The_Piazza_Michelangelo.jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| naples | [Mfran22](https://commons.wikimedia.org/wiki/File:Napoli_panorama_di_Napoli_da_Castel_Sant%27Elmo_-.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| bologna | [Vanni Lazzari](https://commons.wikimedia.org/wiki/File:Piazza_Maggiore_-_Bologna.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| turin | [Fred Romero from Paris, France](https://commons.wikimedia.org/wiki/File:Torino_-_Piazza_Castello_(24269304747).jpg) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| verona-garda | [Fabio Poggi](https://commons.wikimedia.org/wiki/File:Ponte_Pietra_(Verona)_-_panoramio.jpg) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0) |
| pisa-tuscany | [Guglielmo Giambartolomei](https://commons.wikimedia.org/wiki/File:Piazza_dei_miracoli_-_aerial_panorama.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| palermo | [Kiban](https://commons.wikimedia.org/wiki/File:Panoramica_Cattedrale_di_Palermo.jpg) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| catania-etna | [Dariolp83](https://commons.wikimedia.org/wiki/File:Piazza_Duomo,_Catania.jpg) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| cagliari-south-sardinia | [Riccardo de Conciliis](https://commons.wikimedia.org/wiki/File:Cagliari_Panorama.JPG) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |

## Verificación y pendientes

Pruebas automatizadas: 162 correctas; conservación de las 77 fichas y tarjetas,
traducciones, contratos de itinerarios, 40 IATA, Roma/Milán/Venecia, selección de
las doce fichas en siete idiomas y recorrido completo de voz a generación visible
para las doce identidades en los siete idiomas. Se conservan las pruebas anteriores
de errores, cancelaciones, vuelos, fechas flexibles y presupuesto.

TypeScript y lint correctos, con avisos anteriores de img y next lint.
Compilación y comprobaciones reales de Preview documentadas en la PR.
Las respuestas de proveedores se reproducen desde capturas públicas; OpenAI,
precios y Supabase se simulan. No se realizan operaciones con credenciales de producción.
No se fusiona ni se publica en producción sin autorización.
