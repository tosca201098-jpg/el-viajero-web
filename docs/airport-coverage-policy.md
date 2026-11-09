# Cobertura aeroportuaria de DESTINAUTA

Criterio solicitado por el usuario el 5 de noviembre de 2026: una cobertura amplia de aeropuertos de pasajeros comparable a la de las plataformas de viajes. Sustituye cualquier cuota editorial fija de doce fichas por país.

## Una tarjeta por ciudad

Aclaración expresa del usuario: la unidad de la ficha nueva es la ciudad servida, no cada aeropuerto. Si varios aeropuertos sirven a una misma ciudad, todos se vinculan a una única tarjeta turística, con su fotografía y contenido compartidos. Por ejemplo, la ficha existente de Roma se reutiliza para los aeropuertos asociados a Roma; no se crean tarjetas distintas por sus terminales, códigos o municipios de emplazamiento.

Conservar los códigos físicos individuales para elegir el aeropuerto y buscar vuelos. Los códigos metropolitanos son agrupaciones de búsqueda, no aeropuertos nuevos. Verificar cada asociación con la ciudad y mantener la información de ubicación y traslado cuando la terminal esté fuera de ella. No agregar aeródromos a una ciudad por proximidad sin justificación.

Las nuevas ampliaciones se centran en ciudades servidas por aeropuertos de pasajeros verificados. No añadir destinos turísticos sin aeropuerto como parte de esta tarea. Las fichas anteriores de ese tipo se conservan intactas. La cobertura se mide en aeropuertos asociados a ciudades; su total no es el número de tarjetas.

## Qué se incorpora

- Aeropuertos internacionales, nacionales, regionales e insulares con transporte comercial de pasajeros, incluidos los servicios estacionales verificados.
- Identidad física, IATA, localidad de referencia y ubicación de la terminal diferenciadas. Los códigos de área metropolitana no cuentan como aeropuertos adicionales.
- Búsqueda por IATA, nombre del aeropuerto, ciudad y variantes habituales. Enlazar cada aeropuerto a su ficha turística correspondiente, creando las que falten sin duplicar el mismo destino o instalación.
- Información turística, fotografía con licencia, siete idiomas, vuelos, hoteles y planificación con el diseño existente.

## Fotografía representativa

Preferencia expresa del usuario: panorámicas reconocibles del conjunto de la ciudad o de lugares importantes del destino, como un puerto, plaza monumental, castillo, santuario o paisaje emblemático identificado. No elegir árboles aislados, bloques de viviendas, fachadas corrientes ni paisajes genéricos sin relación clara con el lugar. En pueblos pequeños puede usarse un enclave local destacado, contrastado con una fuente oficial. Revisar la imagen real y su recorte en la tarjeta, además del nombre del archivo y su licencia. Conservar las fotos ya aprobadas y las 16 tarjetas de portada.

## Cómo se verifica

1. Inventariar aeropuertos en los recursos públicos de nuestro proveedor de vuelos y contrastar la actividad de pasajeros con autoridades y operadores.
2. Separar existencia del aeropuerto, actividad comercial actual, compatibilidad del proveedor y disponibilidad concreta para una fecha. Un indicador del proveedor no acredita por sí solo servicio regular actual.
3. Excluir del nuevo inventario comercial estaciones de tren/autobús, helipuertos, aeródromos militares o privados y registros obsoletos. Conservar intactas las fichas anteriores; cualquier limitación se documenta antes de plantear cambios en ellas.
4. Cuando un aeropuerto de pasajeros real no esté admitido por el proveedor, documentar esa carencia y las alternativas con traslado. No inventar códigos de búsqueda, tarifas ni conexiones.
5. Dar por terminada la cobertura de un país solo tras comparar el inventario con las fichas y justificar cada exclusión. El número de tarjetas puede diferir del número de aeropuertos.

Booking y otras plataformas sirven como referencia de amplitud. No se promete igualdad exacta de inventarios, aerolíneas o tarifas sin una comprobación verificable; DESTINAUTA utiliza su integración actual. No se cambian proveedores ni se contratan servicios para esta ampliación.

## Primer contraste: Francia

Consulta pública del proveedor realizada el 5 de noviembre de 2026, sin credenciales, precios ni reservas:

- El recurso de aeropuertos devuelve 168 registros con `country_code=FR`: 126 de tipo `airport` y otros tipos de localización.
- 55 registros tienen simultáneamente `iata_type=airport` y `flightable=true`: son candidatos de revisión, no 55 aeropuertos comerciales aprobados.
- Otros 33 registros marcados `flightable=true` son ubicaciones de otros tipos y no deben contarse como aeropuertos físicos.
- El filtro FR del proveedor no certifica por sí solo todos los territorios franceses de ultramar ni el aeropuerto binacional EuroAirport, que tiene sectores y agrupaciones ya tratados en el catálogo suizo. Se revisarán por su territorio/región, sin duplicarlos ni mezclarlos con la fase europea.
- La base francesa conserva doce fichas y once códigos físicos propios; los aeropuertos de traslado se contabilizan aparte. Aún falta completar la cobertura turística; el inventario nuevo no equivale a fichas ya entregadas.

Fuentes: [recurso de aeropuertos](https://api.travelpayouts.com/data/en/airports.json), [ciudades](https://api.travelpayouts.com/data/en/cities.json), [documentación del proveedor](https://travelpayouts.github.io/slate/#airport-data-in-json-format) y [DGAC, tráfico comercial 2025, edición de mayo de 2026](https://www.ecologie.gouv.fr/sites/default/files/documents/Bulletin_Statistiques_transport_aerien_2025.pdf).

## Límites de esta preparación

Cambios por países y lotes manejables en ramas/PR en borrador y Preview. Conservar las 16 tarjetas de portada, fotos y contenidos aprobados, selección expresa y política de sitemap. No modificar main, Production, Sofía, ElevenLabs, Redis, cuotas, variables ni servicios de pago. No hacer reservas ni pruebas de audio o IA reales.
