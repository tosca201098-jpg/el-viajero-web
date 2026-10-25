# Hungría — fichas turísticas (25 de octubre de 2026)

Doce fichas nuevas en siete idiomas, todas con `publication.status: 'draft'`. No se añaden a la portada, temporadas ni páginas mensuales. Las 185 fichas previas permanecen idénticas. `lowSeasonMonths` significa demanda turística habitualmente menor; no garantiza un precio.

## Selección y acceso

La selección se basa en las [regiones y destinos de Visit Hungary](https://visithungary.com/category/destinations), completados con lugares de interés de la capital y del parque de Hortobágy. El aeropuerto de llegada se separa del destino turístico y del traslado terrestre. Ningún código garantiza una ruta desde un origen concreto ni disponibilidad en unas fechas.

| Ficha | Aeropuerto para vuelos | Acceso y cautela |
| --- | --- | --- |
| Budapest | BUD — Budapest Ferenc Liszt | Traslado urbano; comprobar horarios actuales. |
| Debrecen | DEB — Debrecen International | Traslado urbano; comprobar oferta real. |
| Szeged | BUD como acceso | Tren o autobús hasta Szeged; el aeródromo local no se presenta como aeropuerto comercial. |
| Pécs | BUD como acceso | Continuación por tierra; Pécs-Pogány (PEV) no se usa como búsqueda de vuelos regulares. |
| Eger | BUD como acceso | Continuación por tren o autobús. |
| Győr y Pannonhalma | BUD como acceso | Traslado terrestre a Győr y después a la abadía. |
| Sopron | BUD como acceso | Continuación por tierra; comprobar conexiones. |
| Tihany y lago Balatón | BUD como acceso | Ferrocarril a la zona del lago y transporte local a Tihany. |
| Hévíz | BUD como acceso | Continuación por tierra. SOB identifica Hévíz–Balaton, pero no fue reconocido por `places2`; queda en `auxiliaryCodes`, nunca para precios. |
| Tokaj | DEB como acceso | Continuación por tren o autobús. |
| Szentendre y recodo del Danubio | BUD como acceso | Transporte terrestre hacia Szentendre y los demás pueblos. |
| Parque Nacional de Hortobágy | DEB como acceso | Continuación por tierra y consulta de normas de visita. |

Los códigos BUD y DEB se contrastaron con la [información oficial de Budapest Airport](https://www.bud.hu/en/facts-about-the-airport/our-company/about-us), el [manual del aeropuerto de Debrecen](https://www.debrecenairport.com/documents/2025_05_14_Aerodrome_Manual_v13_EN.pdf), el [AIP de HungaroControl](https://ais-en.hungarocontrol.hu/aip/2022-01-27/2022-01-27-AIRAC/html/eAIP/LH-AD-1.3-en-HU.html) y consultas individuales a `places2` de Travelpayouts el 25 de octubre de 2026. `places2` devolvió BUD y DEB como ciudades húngaras, PEV como ciudad pero no aeropuerto comercial disponible, y ningún resultado húngaro para SOB. El operador de [Hévíz–Balaton](https://mail.hevizairport.com/hu/) identifica SOB y muestra operaciones puntuales; no se interpreta como ruta regular ni como código válido para la API de precios. El AIP distingue aeródromos con servicios regulares de los de aviación general. Las conexiones terrestres son orientativas y deben comprobarse para el día de viaje.

Para Balatón, [MÁV publica las conexiones ferroviarias](https://www.mavcsoport.hu/mav-szemelyszallitas/szolgaltatasok/balaton), cuya frecuencia cambia por temporada. [Visit Hungary explica la entrada aérea al país](https://visithungary.com/articles/how-to-get-to-hungary).

## Espacios protegidos

La [dirección del Parque Nacional de Hortobágy](https://www.hnp.hu/hu/szervezeti-egyseg/turizmus/oldal/latogatasi-szabalyzat) publica las normas de visita. Su [guía de senderos](https://www.hnp.hu/uploads/documents/nature-trails-in-the-hortobagy-national-park1.pdf) distingue itinerarios abiertos, zonas que requieren entrada y recorridos con guía. La ficha pide comprobar las normas y la disponibilidad actual antes de la visita.

## Fotografías

`lib/destinations/hungary-images.ts` registra la miniatura directa de Wikimedia Commons de 960 px, página de origen, autor y licencia CC BY o CC BY-SA de cada imagen. Los doce metadatos `imageinfo/extmetadata` se comprobaron en Commons; los doce enlaces de imagen respondieron HTTP 200 con `image/jpeg`. El crédito y el enlace a la licencia deben conservarse cuando se publique cada ficha. Ninguna foto viene de `source.unsplash.com`.

## Validación

`tests/fixtures/pre-hungary-catalog.json` fija los hashes de los 185 perfiles previos, las 16 tarjetas, cuatro páginas estacionales y doce archivos mensuales. `tests/hungary-destinations.test.cjs` comprueba el total de 197 perfiles y 13 países, IDs y slugs únicos, siete traducciones, recomendaciones, metadatos de imagen, separación de aeropuertos/accesos y ausencia de publicación automática. El autocompletado incluye los destinos turísticos sin asignarles un aeropuerto inexistente.
