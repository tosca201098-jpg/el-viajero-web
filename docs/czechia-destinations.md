# Chequia — fichas de destino (22 de octubre de 2026)

Doce fichas editoriales con `publication.status: 'draft'`. No modifican las 16 tarjetas originales de portada ni las páginas mensuales o estacionales. Los meses de temporada tranquila se refieren a demanda turística habitual, nunca a un precio garantizado.

## Aeropuertos y proveedores

Consultamos individualmente `places2` de Travelpayouts (tipos ciudad/aeropuerto, locale `es`) para **PRG, BRQ, OSR, PED, KLV y JCL** el 22-10-2026. Los cinco primeros devolvieron la ciudad y el código `CZ`; **JCL no devolvió resultados** y solo figura como `auxiliaryCodes` de České Budějovice, sin enviarse a la API de precios.

El [AIP oficial checo](https://aim.rlp.cz/eaip/html/LK-cover-cz-CZ.html) identifica los aeródromos físicos. La existencia del aeródromo y de un código IATA no prueba que haya vuelos de pasajeros a un origen concreto en una fecha concreta. Consultar siempre el horario oficial y la oferta real del proveedor:

| Código | Ficha/uso | Advertencia |
| --- | --- | --- |
| PRG | Praga; acceso a varios destinos | [Praga publica destinos comerciales](https://www.prg.aero/en/destinations); no se promete ninguna ruta en particular. |
| BRQ | Brno; acceso a Olomouc, Telč y Mikulov/Lednice | Oferta variable; comprobar fechas y enlace terrestre. |
| OSR | Ostrava; acceso alternativo a Olomouc | El [horario oficial de Ostrava](https://www.airport-ostrava.cz/en/p/timetable) mezcla rutas y chárteres y advierte de cambios. |
| PED | Acceso alternativo a Kutná Hora | [Pardubice indica temporada mayo–octubre](https://www.airport-pardubice.cz/en/destinations/); no se presupone conectividad desde cualquier origen. |
| KLV | Karlovy Vary | [El aeropuerto](https://www.airport-k-vary.cz/cs/) comunica operaciones limitadas y cancelaciones; no se prometen vuelos regulares. |
| JCL | České Budějovice | Aeródromo [oficial](https://www.airport-cb.cz/) pero no resuelto por `places2`: código auxiliar, no se consulta para precios. |

Los destinos sin aeropuerto comercial propio mantienen `iataCodes: []` y botones separados para aeropuertos de acceso. Český Krumlov, Plzeň y České Budějovice usan PRG; Kutná Hora usa PRG/PED; Olomouc usa BRQ/OSR; Telč usa BRQ/PRG; Mikulov y Lednice-Valtice usa BRQ; Suiza Bohemia usa PRG. Son **puntos de llegada**, no rutas ni conexiones terrestres garantizadas. Se requiere comprobar tren/autobús. Para Suiza Bohemia, consultar el [aviso oficial del parque](https://www.npcs.cz/en) antes de caminar: puede haber cierres de senderos por seguridad o conservación. [VisitCzechia también publica avisos](https://www.visitczechia.com/en-us/news/2026/05/n-bohemian-switzerland-national-park-remains-open).

## Fotografías

`lib/destinations/czechia-images.ts` contiene para cada ficha la URL del thumbnail de Wikimedia Commons de 960 px, la ficha de archivo original, el crédito de autor y la licencia enlazada. Se consultaron los metadatos `imageinfo/extmetadata` de Wikimedia Commons y se descartaron licencias NC/ND. Las doce URL respondieron `200` con contenido `image/jpeg` en la comprobación HTTP individual.
