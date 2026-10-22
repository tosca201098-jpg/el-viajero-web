# Suiza: catálogo y verificación

Base: `main` `0f7c012` (después de la PR #21). Revisión de datos: 22 de octubre de 2026. Rama independiente `feat/switzerland`; no fusionar ni publicar en producción sin autorización.

## Alcance

Se añaden 12 fichas a las 137 anteriores, para un total de **149 identidades únicas**. `tests/fixtures/pre-switzerland-catalog.json` contiene las huellas SHA-256 de las 137 fichas previas, la colección editorial de portada y las cuatro páginas de temporadas. Los IDs, imágenes, textos y orden previos permanecen intactos. Las nuevas fichas no crean tarjetas automáticas en portada, temporadas, meses o descubrimiento por presupuesto; `publication.status` sigue en `draft`.

| Destino | Cantón o cantones | Aeropuerto propio de la ficha / accesos terrestres |
|---|---|---|
| Zúrich | ZH | ZRH |
| Ginebra | GE | GVA |
| Lucerna y lago de los Cuatro Cantones | LU, UR, SZ, OW, NW | Tren desde ZRH |
| Berna | BE | BRN (oferta limitada); tren desde ZRH o EuroAirport |
| Basilea | BS | BSL (sector suizo de EuroAirport) |
| Lausana y viñedos de Lavaux | VD | Tren desde GVA o ZRH |
| Montreux y castillo de Chillon | VD | Tren desde GVA |
| Interlaken y región de Jungfrau | BE | Tren desde ZRH, GVA o EuroAirport |
| Zermatt y el Cervino | VS | Tren desde ZRH o GVA; lanzadera desde Täsch |
| San Moritz y Alta Engadina | GR | Tren desde ZRH |
| Lugano y lago de Lugano | TI | Transporte terrestre desde ZRH o MXP; LUG solo informativo |
| Schaffhausen y cataratas del Rin | SH, ZH | Tren desde ZRH |

Cada ficha contiene una descripción original, cuatro recomendaciones, estancia, meses orientativos, aviso de transporte, imagen y atribución. Todo el contenido turístico está localizado en los siete idiomas de Destinauta. Los consejos de montaña recuerdan que el tiempo, la temporada, las reservas y el mantenimiento pueden afectar remontes, rutas y trenes panorámicos. Las notas comunes indican CHF, Schengen y no pertenencia a la UE sin universalizar requisitos de entrada.

## Aeropuertos y Travelpayouts

Los códigos se contrastaron con `https://api.travelpayouts.com/data/en/airports.json`, `https://api.travelpayouts.com/data/en/cities.json` y 23 consultas públicas a `https://autocomplete.travelpayouts.com/places2`, registradas sin credenciales en `tests/fixtures/switzerland-places.json`. `flightable` identifica un aeropuerto en el proveedor; no acredita por sí mismo vuelos regulares actuales.

- **ZRH y GVA:** aeropuertos internacionales de Zúrich y Ginebra.
- **BSL y MLH:** dos identificadores/sectores de la misma instalación EuroAirport, físicamente en Saint-Louis, Francia. **EAP** es el código del área Basilea/Mulhouse, no un tercer aeropuerto. La ficha de Basilea conserva BSL como aeropuerto principal, acepta las búsquedas BSL/MLH/EAP y respeta la agrupación EAP del proveedor. El bus 50 enlaza el sector suizo y Basel SBB.
- **BRN:** Berna-Belp ofrece programación limitada o estacional; el usuario debe comprobar fechas concretas. No se promete una ruta regular para cualquier fecha.
- **ACH:** St. Gallen–Altenrhein dispone de servicio comercial limitado; las rutas y fechas vigentes deben comprobarse.
- **LUG:** aeropuerto real de Lugano-Agno, sin vuelos regulares de pasajeros confirmados en la revisión. La fila aeroportuaria se muestra como informativa y no se puede elegir como conexión comercial. La ficha turística de Lugano se puede seleccionar por separado, sin atribuirle un código aéreo válido para precios.
- **SIR:** Sion tiene oferta limitada y estacional, según el operador; las rutas no se extrapolan a todo el año.

Los códigos de estaciones de tren no se envían a la API de vuelos. Interlaken, Zermatt y San Moritz no reciben aeropuertos propios ficticios. Los aeropuertos de acceso se muestran como punto de llegada seguido de transporte terrestre. No cambian la API de precios, los presupuestos, los enlaces de afiliado ni los datos de los países anteriores.

## Fotografías y atribución

Las doce imágenes son miniaturas directas de Wikimedia Commons de 960 px. `lib/destinations/switzerland-images.ts` conserva fuente, autor, licencia y enlace de atribución, mostrados por la ficha existente. Las doce URL de imagen respondieron HTTP 200 durante la revisión. Son licencias CC BY o CC BY-SA; su reutilización exige mantener la atribución y, cuando proceda, cumplir la cláusula ShareAlike. No se sustituyó ninguna fotografía anterior.

## Comprobaciones y límites

Las pruebas automáticas verifican 149 IDs/slugs únicos, huellas de las 137 fichas anteriores, 16 tarjetas editoriales y 16 por temporada, los siete idiomas, selección contextual de las doce fichas, IATA y alias, los sectores de EuroAirport, LUG informativo y ausencia de tarjetas automáticas. El fixture del proveedor hace reproducibles los casos sin usar token. Las pruebas de voz, IA, Supabase y precios se mantienen simuladas; no se invocan servicios de pago.

En la rama local: **292 pruebas aprobadas**, TypeScript sin errores, lint con advertencias previas sobre `<img>` y compilación de producción correcta. Las 12 miniaturas se comprobaron con HTTP HEAD y devolvieron 200. El navegador integrado no pudo alcanzar el servidor local de Windows; la inspección visual de escritorio y móvil queda para la Preview de Vercel.

La configuración de Vercel, las credenciales, dependencias, SEO, rutas, vuelos, voz, hoteles y mantenimiento diario no se modifican. Los siete avisos High de la cadena de desarrollo ya documentados en la incidencia #16 permanecen visibles; esta PR no intenta ocultarlos ni altera dependencias.

## Fuentes

- EuroAirport, ubicación y operación binacional: https://www.euroairport.com/en/faq/about-euroairport
- EuroAirport, transporte y autobús 50: https://www.euroairport.com/en/transport
- Bern Airport, destinos/programación: https://old.bernairport.ch/de/destinationen
- People's, aeropuerto de Altenrhein y rutas: https://www.peoples.ch/
- Lugano Airport, perfil de aviación general y ejecutiva: https://luganoairport.ch/it/
- Sion, programación estacional publicada por operador: https://air-mountain.ch/en/schedules-and-prices/
- Switzerland Tourism, acceso ferroviario Täsch–Zermatt: https://www.myswitzerland.com/en-in/planning/offers/taesch-zermatt-shuttle/
- Switzerland Tourism, Lavaux: https://www.myswitzerland.com/en-ch/destinations/lavaux-vineyard-terraces/
- Switzerland Tourism, Jungfraujoch: https://help.myswitzerland.com/hc/en-us/articles/213127689-How-can-I-travel-up-the-Jungfraujoch-mountain-by-train
- Catálogos públicos del proveedor: https://api.travelpayouts.com/data/en/airports.json y https://api.travelpayouts.com/data/en/cities.json
