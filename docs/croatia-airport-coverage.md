# Croacia: cerrar la cobertura de aeropuertos de transporte público

Revisión de 4 de noviembre de 2026. Base: `feat/croatia-destinations`, commit `643b704fbed0990a6b70aac158c8e09eee90b00d`, PR #36. La ampliación se prepara en rama y PR separadas sobre esa base: no cambia la PR #36 ni integra otros países.

## Resultado de la comparación

La [metodología oficial DZS/Eurostat](https://ec.europa.eu/eurostat/cache/metadata/EN/avia_pa_esms_hr.htm) recoge nueve aeropuertos de transporte público: Zagreb, Split, Dubrovnik, Pula, Rijeka, Zadar, Osijek, Brač y Mali Lošinj. La base tiene fichas y códigos propios para los seis primeros. Se añaden los tres restantes sin duplicar las doce fichas ya aprobadas:

| Ficha nueva | IATA / ICAO | Aeropuerto | Localidad de referencia y acceso |
| --- | --- | --- | --- |
| Osijek | OSI / LDOS | Osijek Airport, Klisa | Osijek; terminal en Klisa, fuera de la ciudad; traslado terrestre. |
| Bol (Brač) | BWK / LDSB | Brač Airport | Bol, en Brač; terminal en el interior de la isla cerca de Gornji Humac; servicio limitado y estacional. |
| Mali Lošinj | LSZ / LDLO | Lošinj Airport | Mali Lošinj; aeropuerto fuera de la localidad; oferta limitada que debe confirmarse, incluyendo taxis aéreos y actividad estacional. |

Cobertura resultante: ZAG, DBV, SPU, ZAD, PUY, RJK, OSI, BWK y LSZ. **Tres fichas nuevas; quince croatas en total, nueve con aeropuerto físico propio y seis destinos con traslado.** La rama pasa de 221 a 224 perfiles globales. La cobertura es la del conjunto oficial citado, no una promesa de que todos tengan una ruta regular o servicio durante todo el año.

## Datos de servicio y justificación

- [Osijek, horario del operador para invierno 2026–2027](https://osijek-airport.hr/en/passenger-information/flight-schedule/). Se incorpora su identidad y aviso de comprobar rutas/frecuencias; no se fijan rutas ni precios en la ficha.
- [Brač, horario oficial de 2026](https://www.airport-brac.hr/en/timetable/) y [localización en documentación del Ministerio croata](https://mzozt.gov.hr/UserDocsImages/UPRAVA-ZA-PROCJENU-UTJECAJA-NA-OKOLIS-ODRZIVO-GOSPODARENJE-OTPADOM/Puo/30_08_2019_Netehnicki_sazetak_ZL_Brac.pdf). La ficha explica la estacionalidad; Split y ferry se describen como alternativa que requiere comprobar puertos y horarios.
- [Lošinj, operador](https://www.airportmalilosinj.hr/) y [oficina turística: llegada por avión](https://www.visitlosinj.hr/hr/dolazak-avionom.aspx). Justificación turística expresa: acceso a un destino insular de los nueve aeropuertos públicos oficiales, con aviación general/taxi y servicios limitados. No se presenta como una conexión regular garantizada; la información de posibles servicios debe confirmarse con el operador para las fechas concretas. No se añaden aeródromos militares o privados al catálogo.
- Identificadores y conjunto aeroportuario: [EUROCONTROL LSSIP Croatia 2024](https://www.eurocontrol.int/sites/default/files/2025-04/eurocontrol-lssip-2024-croatia-released.pdf).

## Información turística y fotografías

Referencias: [Turismo de Osijek](https://www.tzosijek.hr/), [Turismo de Bol](https://bol.hr/en/destination/hiking-trails/), [Museo de Apoxiómeno](https://www.visitlosinj.hr/museum-of-apoxyomenos.aspx) y [protección del pinar de Čikat](https://ju-priroda.hr/zasticena-podrucja-pgz/cikat/). Las cuatro recomendaciones, descripción, estancia y notas están traducidas en los siete idiomas. Las estancias y los meses son orientación editorial, no garantías de clima o precios.

| Ficha | Fotografía de Commons | Autor | Licencia |
| --- | --- | --- | --- |
| Osijek | [Osijek panorama Gornji grad](https://commons.wikimedia.org/wiki/File:Osijek_panorama_Gornji_grad.jpg) | Rp031 | CC BY-SA 4.0 |
| Bol | [Bol Croatia](https://commons.wikimedia.org/wiki/File:Bol_Croatia.jpg) | Marin0110 | CC BY-SA 4.0; versión actual del autor sin marca de agua |
| Mali Lošinj | [Lošinj](https://commons.wikimedia.org/wiki/File:Lo%C5%A1inj.jpg) | August Dominus | CC BY-SA 4.0 |

Las páginas de los autores y las licencias se conservan visibles en la ficha. Solo se usa el recorte CSS existente; no se retocan las fotos aprobadas ni se modifican las doce fotografías anteriores.

## Funcionamiento y corrección necesaria

Se reutilizan los componentes existentes de resumen, detalle, vuelos, hoteles y planificación. Las nueve fichas con aeropuerto muestran el bloque de nombre real, IATA y localidad de referencia con etiquetas compartidas en los siete idiomas. Las seis fichas sin aeropuerto conservan sus accesos de traslado.

La revisión encontró que `localizedCatalogProfile` omitía HR, aunque Croacia estaba registrada en el catálogo. Se añade HR a esa lista para que el detalle utilice correctamente traducciones y metadatos. No cambia ningún texto o fotografía aprobado; se comprueba el componente real para las quince fichas y los siete idiomas.

Las fichas siguen en `draft` y solo se abren por búsqueda, selección expresa o enlace directo. Las 16 tarjetas, páginas estacionales y mensuales, sitemap, identidades y datos previos permanecen protegidos. No se modifican Production, main, Sofía, cuotas, agentes, variables ni planes de pago.

## Verificación

Huella de cada uno de los 221 perfiles de la base y de las 16 tarjetas; identidades, alias, códigos propios y de traslado; nueve aeropuertos sin duplicados; búsquedas simuladas por IATA/nombre/localidad, fallo seguro y rechazo de países incorrectos; quince fichas × siete idiomas en el componente real con React simulado. Las conexiones externas de las pruebas están bloqueadas: sin voz, IA, tokens, tarifas, reservas o pagos reales. Compilación local completa correcta; el resultado final de pruebas y la revisión de Preview se indican en la PR.

Resultado: batería de 417 pruebas verificada. La ejecución completa aprobó 416; la nueva comprobación de detalle permitió detectar y corregir la omisión de HR. Las 18 pruebas de presentación afectadas, incluyendo las quince fichas por siete idiomas, pasan después de la corrección. No se repiten las demás pruebas aprobadas sin motivo. La compilación local anterior pasó; el commit final se recompila y revisa en Vercel Preview antes de darlo por entregado.
