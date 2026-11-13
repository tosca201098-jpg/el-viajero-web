# Eslovenia: cobertura de los aeropuertos internacionales principales

Preparación de 4 de noviembre de 2026. Fichas de destino servidas por aeropuertos físicos, con el diseño compartido y textos en es/en/fr/de/it/pt/ca. No se promete disponibilidad de vuelos, tarifas ni servicios regulares.

| IATA / ICAO | Aeropuerto | Destino servido | Emplazamiento de la terminal |
| --- | --- | --- | --- |
| LJU / LJLJ | Ljubljana Jože Pučnik | Liubliana / Ljubljana | Brnik |
| MBX / LJMB | Maribor Edvard Rusjan | Maribor | Orehova vas |
| POW / LJPZ | Portorož | Portorož / Portorose | Sečovlje |

La selección cubre los **tres aeropuertos internacionales** enumerados por el [Ministerio esloveno](https://www.gov.si/podrocja/promet-in-energetika/letalski-promet/), no una cuota artificial de doce o quince destinos. Los aeródromos locales, deportivos y militares no se presentan como aeropuertos comerciales principales. Los códigos están corroborados en [EUROCONTROL LSSIP Slovenia](https://www.eurocontrol.int/sites/default/files/2023-06/eurocontrol-lssip-2022-slovenia.pdf); los emplazamientos, en la [policía eslovena](https://www.policija.si/delovna-podrocja/nadzor-drzavne-meje/mejni-prehodi-in-schengenska-ureditev-v-sloveniji/mejni-prehodi-na-zunanji-schengenski-meji).

## Servicios y acceso

- LJU es la principal entrada de pasajeros. [Transportes del aeropuerto](https://www.lju-airport.si/en/transport/).
- MBX: el [operador](https://www.mbx-airport.si/en/airport/) indica que el uso actual es principalmente formación de vuelo. La ficha lo explica en los siete idiomas; exige comprobar el servicio, sin afirmar conexiones regulares. LJU figura como alternativa con traslado terrestre.
- POW: el [operador](https://www.portoroz-airport.si/en/faq) describe aviación privada, escuelas y vuelos panorámicos. La ficha no presupone conexiones regulares y ofrece LJU y Trieste (TRS, Italia) como alternativas con traslado. TRS no se convierte en aeropuerto esloveno ni identidad del destino.
- Los resultados de vuelos y precios siguen dependiendo del proveedor y las fechas. Los botones conservan la búsqueda existente; no se realizan reservas ni compras en esta entrega.

## Contenido y fotografías

Recomendaciones contrastadas con [Visit Ljubljana](https://www.visitljubljana.com/en/visitors/plan-your-visit/tours-and-trips/historical-city-centre-and-ljubljana-castle/), [Visit Maribor](https://www.visitmaribor.si/en/offer/cultural-landmarks/6614-lent/) y [Turismo de Portorož/Piran](https://www.portoroz.si/app/uploads/2025/02/Cultural_Treasures_of_Piran.pdf.pdf). Estancias y meses son orientación editorial, sin garantías meteorológicas ni de precios.

| Ficha | Fuente de la fotografía | Autor | Licencia elegida |
| --- | --- | --- | --- |
| Liubliana | [Ljubljanica river in Ljubljana (4)](https://commons.wikimedia.org/wiki/File:Ljubljanica_river_in_Ljubljana_(4).jpg) | Tournasol7 | CC BY 4.0 |
| Maribor | [View-of-Maribor](https://commons.wikimedia.org/wiki/File:View-of-Maribor.jpg) | acediscovery | CC BY 4.0 |
| Portorož | [Portoroz view](https://commons.wikimedia.org/wiki/File:Portoroz_view.jpg) | Dieter Karner | CC BY 2.0 |

Se conserva la atribución visible y el enlace a la licencia. La cabecera aplica el recorte CSS compartido; no se retocan las imágenes.

## Integración y alcance

- Fichas en estado `draft`, accesibles mediante búsqueda/selección y «Ver destino» o enlace directo `?ficha=Ljubljana`, `?ficha=Maribor`, `?ficha=Portoroz`.
- No aparecen automáticamente en portada, temporadas, páginas mensuales ni sitemap.
- La rama parte del commit `04e15f97d2a898c7955eff40462df112e5b4a421` de Grecia. La PR se dirige a `codex/greece-destinations` para revisar exclusivamente Eslovenia sin duplicar ni fusionar la PR #39. Su Preview conserva las quince fichas griegas.
- La base tiene 224 perfiles; esta entrega añade tres, total 227. Una huella por perfil acredita que los 224 anteriores y las 16 tarjetas originales no se alteran. Croacia permanece en su PR #36 independiente.
- Sin cambios en Sofía/PR #38, voz, Redis, cuotas, variables, proveedores de pago o Production. No se contratan servicios.

## Verificación

Las pruebas incluyen todas las asociaciones físicas, nombres y localidades en siete idiomas; respuestas simuladas del buscador, su fallo seguro, rechazo de país incorrecto, conservación de perfiles y tarjetas, y apertura explícita del componente real de portada con React simulado. El recorrido visual se verifica en Preview. Los tests bloquean conexiones externas: sin consultas de tarifas, voz, tokens, itinerarios de IA ni reservas reales.

Resultado local: batería de 425 pruebas verificada. La ejecución completa aprobó 424; la única expectativa restante era el total de países en el test de Polonia (15 → 16), corregida y comprobada con sus 12 pruebas correctas. TypeScript y compilación completa Next.js correctos; solo avisos previos de imágenes. La compilación permite descargar exclusivamente las fuentes públicas del diseño, manteniendo bloqueadas las conexiones a otros servicios.
