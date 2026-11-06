# Francia: ciudades y aeropuertos, primer lote de ampliación

Preparado el 5 de noviembre de 2026. Ocho ciudades nuevas, veinte fichas francesas en total y diecinueve códigos físicos propios. No es todavía la cobertura completa de Francia. Se aplica [una tarjeta por ciudad](airport-coverage-policy.md): varios aeropuertos de una misma ciudad reutilizan su ficha, como CDG/ORY/BVA en París. No se crean tarjetas distintas por terminal, código metropolitano o municipio de emplazamiento.

## Alcance y preservación

La rama `codex/france-airport-coverage` parte de `codex/greece-destinations`, commit `04e15f97d2a898c7955eff40462df112e5b4a421`, para reutilizar el detalle compartido con nombre del aeropuerto y localidad. La PR se dirige a esa misma base, de modo que su comparación contiene solo la ampliación francesa. No modifica la PR #39 ni las ramas de ampliación de Grecia, Croacia o Eslovenia.

Se conservan los 224 perfiles de la base, sus fotos y textos; las doce fichas francesas originales permanecen idénticas, incluidas las tres sin aeropuerto propio. El catálogo de esta rama pasa a 232 perfiles. Las 16 tarjetas de portada, temporadas, páginas mensuales y sitemap no se amplían. Las fichas nuevas siguen en `draft`, accesibles por búsqueda y selección expresa o enlace `?ficha=Nombre`.

## Aeropuertos y ciudades

El [boletín DGAC de tráfico comercial 2025, edición de mayo de 2026](https://www.ecologie.gouv.fr/sites/default/files/documents/Bulletin_Statistiques_transport_aerien_2025.pdf), tablas 2.2.1 y 2.2.2, acredita tráfico de pasajeros en las ocho plataformas. Son las ocho de mayor tráfico de pasajeros pendientes de este catálogo metropolitano, respetando las fichas ya existentes y el EuroAirport compartido que ya se identifica desde Basilea. Los datos DGAC y los publicados por gestores/UAF pueden diferir; no se mezclan sus cifras ni se interpretan como vuelos disponibles hoy.

| Ciudad de la ficha | IATA | Aeropuerto físico | Ubicación y servicio |
| --- | --- | --- | --- |
| Montpellier | MPL | Montpellier Méditerranée | Mauguio, fuera del centro de Montpellier; traslado terrestre. |
| Ajaccio | AJA | Ajaccio Napoléon Bonaparte | Campo dell’Oro, al este del centro; prever desplazamientos en Córcega. |
| Bastia | BIA | Bastia Poretta | Lucciana, al sur de Bastia; traslado terrestre. |
| Biarritz | BIQ | Biarritz Pays Basque | Terrenos de Anglet y Biarritz; no se coloca en el centro turístico. |
| Figari | FSC | Figari Sud Corse | Fuera del pueblo de Figari; excursiones a otras localidades requieren carretera. |
| Brest | BES | Brest Bretagne | Guipavas, fuera de Brest; ciudad francesa, no Brest en Bielorrusia. |
| Lourdes | LDE | Tarbes Lourdes Pyrénées | Sirve a Tarbes y Lourdes y está fuera de ambas; esta ficha turística es la de Lourdes. |
| Rennes | RNS | Rennes Bretagne / Saint-Jacques | Saint-Jacques-de-la-Lande, fuera del centro de Rennes. |

Verificación de códigos físicos, grupos de ciudad y país: recursos públicos del proveedor de [aeropuertos](https://api.travelpayouts.com/data/en/airports.json) y [ciudades](https://api.travelpayouts.com/data/en/cities.json), consultados el 5 de noviembre de 2026. Se conservan en las pruebas solo los ocho registros seleccionados; todos figuran como `iata_type=airport`, país FR, `flightable=true` y código de ciudad igual al físico. El indicador del proveedor acredita compatibilidad de datos, no rutas, tarifas ni plazas. Los otros registros candidatos siguen pendientes de revisión comercial; no se introducen trenes, autobuses, helicópteros o aviación de negocios en este lote.

Fuentes de operadores y emplazamientos: [AIP Montpellier](https://www.sia.aviation-civile.gouv.fr/media/dvd/eAIP_01_OCT_2026/FRANCE/AIRAC-2026-10-01/html/eAIP/FR-AD-2.LFMT-fr-FR.html), [Ajaccio](https://ajaccio-aeroport.cci.corsica/), [CCI Corse](https://www.cci.corsica/aeroports/), [Bastia y acceso aéreo, oficina de turismo](https://www.castagniccia-maremonti.com/ag_admin/document/page/53/venir-en-corse-en-avion-20260213-101955.pdf), [Biarritz](https://biarritz.aeroport.fr/en/info/), [DGAC Figari](https://www.ecologie.gouv.fr/sites/default/files/documents/Figari_fr.pdf), [Brest](https://www.brest.aeroport.bzh/horaires-d-ouverture-et-contact), [Tarbes–Lourdes UAF](https://www.aeroport.fr/aeroport/tarbes-lourdes-pyrenees) y [Rennes, VINCI Airports](https://vinci-airports.com/fr/nos-aeroports/france/aeroport-rennes-bretagne/).

## Contenido y fotografías

Descripción propia, cuatro recomendaciones, estancia y notas de traslado/temporada en español, inglés, francés, alemán, italiano, portugués y catalán. Los meses y estancias son orientación editorial y no garantizan clima ni precios. Los botones reutilizan vuelos, hoteles y planificador existentes, sin cambios en sus proveedores o servicios.

Referencias turísticas: [Écusson](https://www.montpellier-tourisme.fr/decouvrir/millenaire/quartiers-emblematiques-de-montpellier/l-ecusson-centre-historique/), [jardines de Montpellier](https://www.montpellier-tourisme.fr/decouvrir/au-coeur-de-la-nature/s-oxygener-en-pleine-nature/les-parcs-et-jardins-a-ne-pas-manquer/), [museos de Ajaccio](https://www.ajaccio-tourisme.com/decouvrir/patrimoine-culturel/musees-sites-et-monuments/nos-musees/), [ciudadela de Bastia](https://www.bastia-tourisme.com/que-faire/la-citadelle-de-bastia/), [frente marítimo de Biarritz](https://www.destination-biarritz.fr/decouvrir-biarritz-par-le-front-de-mer/), [paisajes de Figari, DREAL Corse](https://www.corse.developpement-durable.gouv.fr/IMG/pdf/6-04-Plaines_et_piemonts_de_Figari.pdf), [Pianottoli-Caldarello](https://www.pianottoli-caldarello.fr/pianottoli-caldarello-en-bref/), [patrimonio de Bonifacio](https://bonifacio.fr/a-voir-a-faire/culture-et-patrimoine/patrimoine-religieux-de-bonifacio/), [patrimonio de Brest](https://brest.fr/decouvrir-sortir/se-cultiver-se-divertir/musees-et-patrimoines), [Tour Tanguy](https://brest.fr/tour-tanguy), [castillo de Lourdes](https://www.lourdes.fr/decouvrir-lourdes/histoire-et-patrimoine/le-chateau-fort-et-son-musee-pyreneen/), [lago y patrimonio de Lourdes](https://www.lourdes.fr/images/1-Menu/Lourdes/PRESENTATION_VILLE_DE_LOURDES_2025_Villes-Villages-Fleuris.pdf), [Les Halles](https://www.lourdes.fr/commerce-economie-et-emploi/halles-et-marches/), [casas de Rennes](https://www.tourisme-rennes.com/decouvrir-rennes/histoire/plus-belles-maisons-pan-de-bois/), [Parlamento](https://www.tourisme-rennes.com/decouvrir-rennes/histoire/parlement-de-bretagne-rennes/) y [Thabor](https://www.tourisme-rennes.com/sortir/parc-du-thabor/).

El [aviso municipal de Lourdes sobre desprendimientos en el Pic du Jer](https://www.lourdes.fr/fermeture-des-sentiers-du-pic-du-jer-risque-de-chute-de-blocs-de-pierre/) impide recomendar sus senderos como abiertos. Se han elegido otras visitas y se recuerda consultar avisos antes de rutas de montaña. Las excursiones de Figari se distinguen expresamente del pueblo.

| Ciudad | Fotografía de Commons | Autor | Licencia |
| --- | --- | --- | --- |
| Montpellier | Montpellier Peyrou.jpg | G.Mannaerts / Wikimedia Commons | CC BY-SA 4.0 |
| Ajaccio | Ajaccio phare citadelle.jpg | Myrabella | CC BY-SA 3.0 |
| Bastia | Jetée Nord Vieux Port - Bastia (FR2B) - 2021-09-12 - 3.jpg | Chabe01 | CC BY-SA 4.0 |
| Biarritz | Panorama de la Grande Plage de Biarritz.jpg | SimonCourtecuisse | CC BY-SA 4.0 |
| Figari | BarrageTalza.jpg | TeletubAstyanax | CC BY-SA 4.0 |
| Brest | Brest - Château 20160714.jpg | Pymouss | CC BY-SA 4.0 |
| Lourdes | Lourdes basilique vue depuis château (1).JPG | Père Igor | CC BY-SA 3.0 |
| Rennes | Vue sud-est de la place du parlement de Bretagne, Rennes, France.jpg | Édouard Hue | CC BY-SA 3.0 |

Se han leído los metadatos y las páginas de archivo de Commons y examinado las ocho fotografías; se descartaron cuadros, retratos, mapas, vídeos y lugares homónimos. Se guardan las URL canónicas devueltas por la API, con atribución y licencia visibles. Solo se aplica el recorte CSS compartido; no se editan las fotografías originales aprobadas.

La selección final sigue la preferencia del usuario por panorámicas urbanas o lugares emblemáticos: Montpellier muestra una vista de la ciudad y el Peyrou; Rennes, la plaza y el Parlamento. Figari muestra el lago de Talza, identificado como enclave del municipio por su [ayuntamiento](https://figari.corsica/tourisme/barage-de-talza/), en lugar de una cala sin referencias reconocibles. Esta fotografía paisajística no implica acceso libre a las instalaciones del embalse. Las cinco imágenes restantes muestran la ciudadela de Ajaccio, el puerto de Bastia, la Grande Plage de Biarritz, el castillo de Brest y el santuario de Lourdes. No se modifican fotos aprobadas de las fichas antiguas.

## Verificación y siguiente lote

Pruebas con conexiones externas bloqueadas: huellas de los 224 perfiles anteriores y las 16 tarjetas, ciudades únicas, grupos de varios aeropuertos conservados, asociaciones físicas, selección por IATA/nombres/alias, país correcto, siete idiomas, fotos/licencias, apertura expresa del componente real, enlaces y contratos del planificador. Vuelos, voz, IA y autenticación se simulan; no se consumen créditos ni se hacen reservas. Se verificaron 419 pruebas únicas por grupos: 32 de Francia/presentación y el resto de regresión. Se actualizaron las dependencias explícitas de los entornos simulados y las comprobaciones de orden relativo del catálogo histórico; los ocho tests del lote se repitieron después de elegir las fotos finales. No se repiten las demás pruebas aprobadas sin motivo. Compilación y revisión responsive de Preview se documentan en la PR de este lote.

El [segundo lote](france-airport-second-batch.md) añade Perpiñán, Calvi, Caen, Carcasona, La Rochelle, Béziers, Limoges y Clermont-Ferrand: 28 fichas francesas y 27 códigos físicos propios entre ambos lotes. Francia continúa pendiente; el [inventario](france-airports-remaining.md) registra siguientes ciudades, discrepancias del proveedor y exclusiones. No se declara terminado el país ni se abre otro hasta continuar su inventario. Los territorios fuera de Europa se tratarán en su región, respetando códigos de país y sin duplicar instalaciones compartidas.

Sin cambios en main, Production, destinauta.com, Sofía/PR #38, ElevenLabs, Redis, cuotas, variables, dependencias o contratos. Sin fusiones ni pagos.
