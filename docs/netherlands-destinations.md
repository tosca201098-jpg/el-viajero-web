# Países Bajos: catálogo y aeropuertos

Base revisada: `main` `5da268be16f01479821c2feee7d09b010ff911d6`, tras la PR #19. Fecha: 21 de octubre de 2026. Rama independiente; no fusionar ni publicar sin autorización.

## Catálogo

Se añaden 12 identidades a las 113 anteriores: **125 destinos únicos**. La captura `tests/fixtures/pre-netherlands-catalog.json` comprueba el contenido completo de las 113 fichas anteriores, los destacados y los cuatro archivos de temporadas mediante SHA-256. No había una ficha canónica equivalente de Países Bajos; la tarjeta editorial original de Ámsterdam en primavera permanece intacta, sin sustituirla por la nueva ficha.

| Identificador | Destino | Provincia | Aeropuerto propio / acceso |
|---|---|---|---|
| nl-amsterdam | Ámsterdam | Holanda Septentrional | AMS |
| nl-rotterdam-kinderdijk | Róterdam y Kinderdijk | Holanda Meridional | RTM |
| nl-the-hague-scheveningen | La Haya y Scheveningen | Holanda Meridional | Acceso RTM / AMS |
| nl-utrecht | Utrecht | Utrecht | Acceso AMS |
| nl-delft | Delft | Holanda Meridional | Acceso RTM / AMS |
| nl-haarlem-zaanse-schans | Haarlem y Zaanse Schans | Holanda Septentrional | Acceso AMS |
| nl-leiden-keukenhof | Leiden y Keukenhof | Holanda Meridional | Acceso AMS / RTM |
| nl-maastricht | Maastricht | Limburgo | MST |
| nl-eindhoven | Eindhoven | Brabante Septentrional | EIN |
| nl-groningen | Groningen | Groningen | GRQ |
| nl-giethoorn | Giethoorn | Overijssel | Acceso AMS / GRQ |
| nl-texel-wadden-sea | Texel y el mar de Frisia | Holanda Septentrional | AMS + transporte terrestre + ferry TESO |

Los slugs estables coinciden con los identificadores sin el prefijo `nl-`. País `NL`, nombre español «Países Bajos»; «Holanda» solo es alias de búsqueda. Las provincias que incluyen Holanda conservan su denominación geográfica correcta.

Cada ficha incluye descripción propia, cuatro recomendaciones que combinan lugares y actividades, meses recomendados, estancia orientativa, provincia traducida y consejos prácticos en español, inglés, francés, alemán, italiano, portugués y catalán. Se reutiliza el contrato actual del planificador y la resolución canónica de voz, sin modificar sus APIs ni generar contenido con servicios de pago durante las pruebas. Keukenhof está en **Lisse**, fuera de Leiden: apertura primaveral y floración variables; consultar las fechas oficiales anuales. Zaanse Schans está en **Zaanstad**, fuera del centro de Haarlem. Texel requiere traslado terrestre a Den Helder y ferry, sin prometer horarios, tarifas ni conexiones.

## Aeropuertos y búsqueda

Contraste de operadores, CBS y recursos públicos de Travelpayouts `data/en/airports.json`, `data/en/cities.json` y 28 consultas reales de `autocomplete.travelpayouts.com/places2`, sin claves ni consultas de precios. Las respuestas relevantes quedan registradas en fixtures para reproducir las pruebas sin red.

| Código físico | Aeropuerto | Situación comprobada | Grupo de ciudad del proveedor |
|---|---|---|---|
| AMS | Amsterdam Airport Schiphol | Vuelos comerciales regulares y servicios estacionales | AMS |
| RTM | Rotterdam The Hague Airport | Vuelos comerciales regulares y estacionales | RTM |
| EIN | Eindhoven Airport | Comercial operativo; cierre de pista anunciado febrero–julio de 2027 | EIN |
| MST | Maastricht Aachen Airport | Oferta limitada/estacional; consultar calendario del operador | MST |
| GRQ | Groningen Airport Eelde | Oferta limitada: servicios anuales y estacionales | GRQ |

No se inventan códigos metropolitanos: esos cinco códigos aparecen como aeropuerto físico y como ciudad en recursos separados del proveedor. Se conserva el agrupamiento por ciudad al consultar precios. La selección de un aeropuerto de acceso conserva su ciudad real; elegir RTM permite consultar la ficha de Róterdam, no identifica falsamente RTM como un aeropuerto propio de La Haya.

Se complementa el autocompletado existente con los cinco aeropuertos físicos verificados cuando la consulta coincide con su código o alias. Se mantiene el orden global por coincidencia exacta, prefijo, coincidencia parcial, tipo y popularidad, así como teclado, móvil, límite y deduplicación originales. No se modifican precios, fechas, viajeros, presupuestos ni afiliación. El proveedor sigue siendo necesario: si falla, se conserva el manejo de error existente.

- Ámsterdam / Amsterdam → ciudad AMS y aeropuerto Schiphol.
- Róterdam / Rotterdam → ciudad RTM y aeropuerto Rotterdam The Hague.
- Eindhoven → ciudad EIN y aeropuerto EIN.
- Maastricht → ciudad del proveedor «Mastrique» MST y aeropuerto Maastricht Aachen.
- Groningen → ciudad del proveedor «Groninga» GRQ y aeropuerto Groningen Eelde.
- Schiphol → AMS.
- La Haya / Den Haag / The Hague → accesos físicos RTM y AMS, sin inventar una ciudad aeroportuaria.
- AMS, RTM, EIN, MST, GRQ → aeropuerto físico correspondiente primero.
- Países Bajos / Holanda y aliases en siete idiomas → los cinco aeropuertos europeos, sin introducir aeropuertos del Caribe.

El proveedor no devuelve localidades como Utrecht, Delft, Haarlem, Leiden, Giethoorn o Texel. No se añade un buscador independiente. Las fichas siguen accesibles mediante el mecanismo existente `/?ficha=<nombre>` y por consulta explícita/voz; sus botones de acceso usan ciudades reales de llegada. Escribir nunca abre una ficha. Tras confirmar una opción disponible, el botón contextual existente permite consultar solo esa ficha.

### Exclusiones y límites

- LEY, Lelystad: Travelpayouts `flightable:false`; el operador prevé vuelos vacacionales en 2027 sujetos a preparación/autorizaciones. No se presenta como aeropuerto comercial operativo.
- DHR, Den Helder: actividad offshore y aviación especializada; `flightable:false`, sin oferta ordinaria de pasajeros en esta ampliación.
- ENS, Twente: aviación de negocios, chárter privado y actividades especializadas; `flightable:false`, excluido del suplemento comercial.
- **TEX es Telluride Regional, Estados Unidos**, no Texel. Se conserva su identificación estadounidense en búsquedas mundiales. Texel utiliza el aeródromo ICAO EHTX; no se le asigna un IATA inventado ni se ofrece como alternativa de reserva ordinaria.
- Aruba (AW), Curazao (CW), Sint Maarten (SX), Bonaire/Saba/San Eustaquio (BQ) quedan fuera de las nuevas fichas y aeropuertos europeos. Travelpayouts clasifica erróneamente EUX como NL en su recurso público. La consulta de país europea evita incorporarlo; las búsquedas mundiales conservan los datos originales del proveedor. Corregir su clasificación mundial requiere una tarea territorial específica, sin alterar esta ampliación.

## Presentación, compatibilidad y SEO

No hay nuevos apartados por países ni nuevas tarjetas automáticas en portada, cuatro temporadas, meses o descubrimiento por presupuesto. Se conservan los 16 destacados, los 16 originales de cada temporada, orden, fotos y textos; Ámsterdam sigue en primavera. El catálogo canónico sigue disponible para consultas expresas y temporadas/meses de uso interno, aplicando la política existente que excluye nuevas incorporaciones de los listados automáticos.

Todas las fichas nuevas mantienen `publication.status: draft`. No se publican rutas nuevas ni se incorporan URLs ficticias al sitemap; se conserva SEO, dominio y rutas actuales. El archivo de portada cambia únicamente el reconocimiento del país NL para localización, bandera y selección contextual.

No cambian dependencias, credenciales, configuración de Vercel, Supabase, Realtime, itinerarios, afiliados ni mantenimiento diario. Las PR abiertas #8 (Ibiza), #13 (Milán) y #14 (Asturias) se revisaron para evitar tocar sus fotografías; esos archivos permanecen sin cambios. El workflow diario sigue activo (`37 5 * * *` UTC), con ejecución manual y protección contra uso de servicios de pago.

## Fotografías y atribución

Fotografías reales de Wikimedia Commons, licencias CC BY / CC BY-SA compatibles con uso comercial con atribución. La ficha muestra autor, fuente y enlace de licencia mediante el mecanismo existente. Se usan miniaturas del proveedor sin editar archivos originales; cualquier recorte de presentación se hace con el encuadre CSS habitual. Metadatos y URLs en `lib/destinations/netherlands-images.ts`, verificados el 21 de octubre de 2026. No se cambian fotografías de otros países.

## Validación

- 248 pruebas automatizadas superadas: integridad de 113 fichas, 125 IDs/slugs, siete idiomas, tarjetas originales, selección contextual, temporadas/meses y 5 IATA. Incluyen el recorrido voz → herramienta → ficha neerlandesa → planificador → resultado visible con proveedores simulados en los siete idiomas.
- TypeScript y lint sin errores; advertencias preexistentes de imágenes y deprecación de `next lint`.
- Compilación de producción correcta, sin credenciales de servicios; fuentes públicas permitidas. En este Windows se usa un auxiliar externo al proyecto para preparar carpetas de salida, sin cambiar la configuración del repositorio.
- Auditoría: se mantienen **7 avisos High** de la cadena de desarrollo (incidencia #16), **0** al omitir dependencias de desarrollo. No se actualizan ni ocultan paquetes.
- Las comprobaciones reales de navegador, capturas de fotografías y Preview se registrarán después del primer despliegue de revisión.

## Fuentes

- CBS, tráfico de los cinco aeropuertos comerciales: https://www.cbs.nl/en-gb/figures/detail/37478eng
- Schiphol: https://www.schiphol.nl/en/aviation-partnerships/destinations/european-destinations/
- Rotterdam: https://www.rotterdamthehagueairport.nl/en/flights/destinations/
- Eindhoven, cierre temporal: https://www.eindhovenairport.nl/en/runway-closure
- Maastricht: https://www.maa.nl/en/flights/flight-schedule/
- Groningen: https://www.groningenairport.nl/alle-vluchten/vluchtschema
- Lelystad: https://www.lelystadairport.nl/en/flights/holiday-flights/
- Den Helder: https://denhelderairport.nl/eng/services/
- Twente: https://www.twente-airport.nl/index.php/en/flying
- Texel EHTX: https://texelairport.nl/aip-ehtx/
- Telluride TEX: https://tellurideairport.com/wp-content/uploads/2025/04/Brochure2025-TEX_Telluride-Regional.pdf
- Recursos del proveedor: https://api.travelpayouts.com/data/en/airports.json y https://api.travelpayouts.com/data/en/cities.json
- Turismo oficial NBTC: https://www.holland.com/global/tourism/discover-the-netherlands/visit-the-cities/best-city-breaks-beyond-amsterdam
- Museos: https://www.holland.com/global/tourism/getting-around/interests/arts-culture/museums-to-visit-in-the-netherlands
- Keukenhof: https://keukenhof.nl/en/page/11/
- Kinderdijk: https://kinderdijk.nl/en/
- Zaanse Schans / Zaanstad: https://www.zaanseschans.com/
- Eindhoven: https://www.thisiseindhoven.com/en/see-and-do/culture-and-design/museums-in-eindhoven
- Texel: https://www.holland.com/global/tourism/getting-around/interests/natural-areas/dunes-of-texel
- Ferry TESO: https://www.teso.nl/en/?lang=en
