# Croacia: doce fichas turísticas

Fecha de auditoría: 2026-10-26. Base: main `bbf31cbc9b560151cf2301bb7bed81b6f0f25c41` (PR #35 Eslovaquia). Se revisaron los patrones de las PR #34 y #35 antes de ampliar el catálogo.

## Alcance e identidad

El catálogo pasa de **209 a 221 destinos únicos**, y de **14 a 15 países**. Las doce entidades no existían en la base: seis ciudades con aeropuerto de llegada, dos ciudades con acceso terrestre, dos islas y dos parques nacionales. Hvar y Korčula representan cada isla completa, con sus poblaciones como recomendaciones, sin crear fichas adicionales de sus capitales. Šibenik representa la visita urbana; Krka representa el parque y sus accesos, aunque ambos se combinen en un viaje.

Las fichas conservan IDs y slugs explícitos, siete idiomas (es, en, fr, de, it, pt, ca), cuatro recomendaciones por ficha, estancia orientativa, meses y consejos prácticos. Los topónimos croatas de las recomendaciones se conservan como nombres propios; acciones, descripciones y notas están traducidas. No se usan traducciones de pago.

El estado de publicación es draft, como en las ampliaciones anteriores. Las fichas se encuentran por búsqueda y por `/?ficha=nombre`; no se añaden automáticamente a la portada, páginas de temporada, páginas mensuales ni sitemap. Los slugs no habilitan nuevas páginas publicadas. La prueba con `pre-croatia-catalog.json` comprueba los hashes de las 209 fichas previas, las 16 tarjetas originales y los archivos editoriales. Otra prueba comprueba que los nombres y alias croatas no colisionan con las identidades previas.

| Ficha | Slug | Aeropuerto propio/de llegada | Acceso adicional |
| --- | --- | --- | --- |
| Zagreb | zagreb | ZAG | Autobús o traslado por carretera al centro |
| Dubrovnik | dubrovnik | DBV | Autobús o traslado por carretera al centro |
| Split | split | SPU | Autobús o traslado por carretera al centro |
| Zadar | zadar | ZAD | Autobús o traslado por carretera al centro |
| Pula | pula | PUY | Autobús o traslado por carretera al centro |
| Rijeka | rijeka | RJK | Aeropuerto en Krk; carretera y puente al continente |
| Rovinj | rovinj | — | PUY o RJK; autobús o coche hasta Rovinj |
| Hvar | hvar | — | SPU, carretera al puerto de Split, ferry a Stari Grad y desplazamiento dentro de la isla; catamaranes según fechas |
| Korčula | korcula | — | DBV, carretera a Orebić, ferry a Dominče y traslado local; SPU y puerto de Split como alternativa marítima según fechas |
| Šibenik | sibenik | — | SPU o ZAD; autobús o coche hasta la ciudad |
| Lagos de Plitvice | plitvice-lakes | — | ZAG o ZAD; carretera/autobús hasta la entrada 1 o 2, con entrada y hora elegidas |
| Parque Nacional de Krka | krka-national-park | — | SPU o ZAD; carretera/autobús hasta Skradin o Lozovac para Skradinski buk |

## Aeropuertos y transportes: fuentes

Los códigos se contrastaron con la tabla oficial de [EUROCONTROL, LSSIP Croatia 2018, página impresa 19 / página PDF 30](https://www.eurocontrol.int/sites/default/files/2019-06/lssip2018_croatia_release.pdf#page=30). Es una fuente de identificadores, no de horarios actuales. Los seis códigos se resolvieron individualmente con HTTP 200 en el recurso público y gratuito places2 de Travelpayouts el 2026-10-26; respuestas conservadas en `tests/fixtures/croatia-places.json`.

Fuentes de operadores consultadas, con las limitaciones indicadas:

- [Zagreb: operador y vuelos](https://www.zagreb-airport.hr/en).
- [Dubrovnik: web oficial Ruđer Bošković](https://www.dbv.hr/). El buscador no pudo abrirla; se comprobó directamente con HTTP 200 y el título oficial.
- [Split: horario oficial con el nombre Saint Jerome](https://www.split-airport.hr/wp-content/uploads/2025/05/Summer-season-2025-flight-schedule-1.pdf). Este PDF es de 2025 y se usa como fuente del operador/nombre, sin prometer esas rutas en 2026; la portada del operador falló en la consulta directa.
- [Zadar: operador y vuelos](https://zadar-airport.hr/en/homepage/).
- [Pula: operador y acceso](https://airport-pula.hr/en/).
- [Rijeka: datos técnicos RJK y localización en Krk](https://rijeka-airport.hr/en/technical-data), [traslados por carretera](https://rijeka-airport.hr/en/how-to-reach-us), [horario oficial verano 2026](https://rijeka-airport.hr/doc/Summer_2026.pdf). La ruta /en/ devolvió 404, pero la portada raíz y las páginas anteriores funcionan. Los vuelos y traslados se deben comprobar para las fechas reales, especialmente fuera del verano.
- [Jadrolinija: Split–Stari Grad (Hvar)](https://www.jadrolinija.hr/hr/putovanje/split_-_stari_grad_hvar) y [Ayuntamiento de Hvar: conexiones marítimas](https://www.hvar.hr/portal/korisne-informacije/).
- [Jadrolinija: Orebić–Dominče (Korčula)](https://www.jadrolinija.hr/hr/putovanje/orebic_-_domince_korcula) y [Turismo de Korčula: llegada a la isla](https://visitkorcula.eu/kako-doci-na-otok/).

OSI no es un acceso pertinente para estas doce entidades y no se añade al autocompletado croata. No se usan aeródromos auxiliares de las islas ni códigos de parques como identificadores de vuelos. Los aeropuertos de acceso no forman parte de iataCodes de la ficha turística. Sus botones reutilizan la búsqueda de la ciudad real de llegada. Verificar un código no acredita un vuelo disponible desde cualquier origen o fecha. No se modifican precios, lógica de vuelos, Stay22, voz ni «No sé dónde ir»; solo se amplían los datos y la integración de catálogo/autocompletado.

## Turismo, parques y estacionalidad

El contenido es redacción original breve, contrastada con organismos y gestores turísticos; los meses y estancias son orientación editorial, no una garantía meteorológica, de disponibilidad o de precios.

- [Zagreb Tourist Board: atractivos](https://www.infozagreb.hr/en/explore-zagreb/attractions).
- [Dubrovnik: gestor de murallas y Lovrijenac](https://citywallsdubrovnik.hr/).
- [Split Tourist Board: atractivos](https://visitsplit.com/en/446/attractions).
- [Zadar Tourist Board: Órgano del Mar](https://zadar.travel/attractions/attractions/organo-marino) y [mapa turístico oficial](https://www.zadar.hr/datastore/filestore/10/Zadar_region_MAP_ENG.pdf).
- [Pula: oficina de turismo](https://pulainfo.hr/).
- [Rijeka: oficina de turismo](https://visitrijeka.hr/en/).
- [Rovinj: guía del organismo turístico](https://www.rovinj-tourism.com/en/plan-your-journey/tourist-guides/1430). La apertura directa devolvió 403; el contenido se contrastó mediante la versión indexada del dominio oficial.
- [Hvar: gestor cultural y Fortica](https://hvar1612.hr/za-posjetitelje/). Las recomendaciones no garantizan que cada recinto esté abierto; se indica comprobar las entradas y horarios.
- [Korčula: patrimonio](https://visitkorcula.eu/kulturna-bastina/).
- [Šibenik: organismo de turismo](https://www.visitsibenik.hr/en).
- [Plitvice: preguntas frecuentes](https://np-plitvicka-jezera.hr/en/faq/) y [normas de visita](https://np-plitvicka-jezera.hr/en/about-the-park/general-information/): entrada y hora, sectores superiores sujetos a cierres en invierno, baño prohibido, estado de rutas y transporte.
- [Krka: preguntas frecuentes del parque](https://npkrka.hr/en_us/informacije/f-a-q/) y [información de accesos en Parkovi Hrvatske](https://www.parkovihrvatske.hr/en/nacionalni-park-krka-v3): distinguir Skradin/Lozovac, barcos y autobuses estacionales, excursiones adicionales y baño prohibido en Skradinski buk. No se extiende esa prohibición a todo el parque.

## Fotografías

Las doce fotografías son horizontales, con anchura original mínima de 960 px. Se consultaron los metadatos imageinfo/extmetadata de Wikimedia Commons (página, artista, declaración de reutilización y dimensiones); las doce miniaturas respondieron HTTP 200 con image/jpeg y fueron inspeccionadas visualmente. Se conservan la URL devuelta por Commons, la página de archivo, autor y licencia en `croatia-images.ts`; la evidencia se conserva en `tests/fixtures/croatia-images.json`.

Korčula está declarada de dominio público por su autor: «Public domain» no significa CC0. Su enlace es la Public Domain Mark, una identificación de dominio público, no una licencia CC BY. El autor se atribuye igualmente. La interfaz puede recortar las fotos mediante object-cover; la imagen enlazada conserva sus proporciones.

| Ficha | Archivo de Commons | Autor | Declaración |
| --- | --- | --- | --- |
| zagreb | [Zagreb Centar.JPG](https://commons.wikimedia.org/wiki/File:Zagreb_Centar.JPG) | Zeitblick | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| dubrovnik | [Casco viejo de Dubrovnik, Croacia, 2014-04-14, DD 04.JPG](https://commons.wikimedia.org/wiki/File:Casco_viejo_de_Dubrovnik,_Croacia,_2014-04-14,_DD_04.JPG) | Diego Delso | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| split | [Panorama-Split.jpg](https://commons.wikimedia.org/wiki/File:Panorama-Split.jpg) | acediscovery | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0) |
| zadar | [Zadar Panorama Nordost.jpg](https://commons.wikimedia.org/wiki/File:Zadar_Panorama_Nordost.jpg) | Böhringer Friedrich | [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5) |
| pula | [Anfiteatro de Pula, Croacia, 2017-04-17, DD 13-18 HDR PAN.jpg](https://commons.wikimedia.org/wiki/File:Anfiteatro_de_Pula,_Croacia,_2017-04-17,_DD_13-18_HDR_PAN.jpg) | Diego Delso | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| rijeka | [Panorama of Rijeka (52829644470).jpg](https://commons.wikimedia.org/wiki/File:Panorama_of_Rijeka_(52829644470).jpg) | Jernej Furman from Slovenia | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| rovinj | [Rovinj seen from the sea.jpg](https://commons.wikimedia.org/wiki/File:Rovinj_seen_from_the_sea.jpg) | Giacomo Alessandroni | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| hvar | [Hvar panorama south.jpg](https://commons.wikimedia.org/wiki/File:Hvar_panorama_south.jpg) | Adbar | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| korcula | [Town of Korcula.JPG](https://commons.wikimedia.org/wiki/File:Town_of_Korcula.JPG) | Lasta | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) |
| sibenik | [Panorama Šibenika.jpg](https://commons.wikimedia.org/wiki/File:Panorama_%C5%A0ibenika.jpg) | August Dominus | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| plitvice | [Waterfalls at Plitvice Lakes.jpg](https://commons.wikimedia.org/wiki/File:Waterfalls_at_Plitvice_Lakes.jpg) | OrionCro | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| krka | [Skradinski buk waterfall – NP Krka – 2016.jpg](https://commons.wikimedia.org/wiki/File:Skradinski_buk_waterfall_%E2%80%93_NP_Krka_%E2%80%93_2016.jpg) | Skot | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |

## Verificación

- Pruebas de catálogo, traducciones, alias, autocompletado, acceso y regresión: ver el resultado de CI/PR para el commit actual.
- TypeScript y lint ejecutados; los únicos avisos de lint son los existentes sobre etiquetas img.
- Build local completado; hubo que permitir la descarga de Google Fonts que necesita el proyecto.
- El resultado visual móvil (390 px), escritorio y de la Preview se adjunta al resumen de la PR después de comprobar el despliegue.
- Sin reservas, pagos ni llamadas de IA de pago. Rama y PR en borrador; no fusionar ni publicar sin autorización expresa.
