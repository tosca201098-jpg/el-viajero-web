# Bélgica: catálogo, aeropuertos y validación

Base: `main` `66e1825a1119b2c843d605b6282280e57f988c96`, fusión de la PR #20. Verificación de datos: 21 de octubre de 2026. Rama independiente `codex/belgium-destinations`. No fusionar ni publicar en producción sin autorización.

## Identidades y contenido

Se incorporan 12 fichas a las 125 anteriores: **137 IDs y slugs únicos**. No existían identidades canónicas belgas equivalentes. La captura de integridad `tests/fixtures/pre-belgium-catalog.json` verifica SHA-256 de cada una de las 125 fichas completas anteriores, los destacados y los cuatro archivos de temporadas.

| ID | Destino | Región | Aeropuerto asociado / accesos con traslado |
|---|---|---|---|
| be-brussels | Bruselas | Bruselas-Capital | BRU; acceso CRL |
| be-bruges | Brujas | Flandes | Accesos OST, BRU, CRL |
| be-ghent | Gante | Flandes | Accesos BRU, CRL |
| be-antwerp | Amberes | Flandes | ANR, con aviso; accesos BRU, CRL |
| be-leuven | Lovaina | Flandes | Accesos BRU, CRL |
| be-ypres | Ypres | Flandes | Accesos OST, BRU, CRL |
| be-ostend-belgian-coast | Ostende y costa belga | Flandes | OST; accesos BRU, CRL |
| be-dinant-meuse-valley | Dinant y valle del Mosa | Valonia | Accesos CRL, BRU |
| be-namur | Namur | Valonia | Accesos CRL, BRU |
| be-liege | Lieja | Valonia | Accesos BRU, CRL; LGG no se ofrece como servicio regular |
| be-mons | Mons | Valonia | Accesos CRL, BRU |
| be-belgian-ardennes-durbuy-la-roche | Ardenas belgas: Durbuy y La Roche-en-Ardenne | Valonia | Accesos BRU, CRL |

Los slugs coinciden con los IDs sin `be-`. País `BE`, valor español compatible «Bélgica». Se incluyen descripción original, cuatro recomendaciones que combinan lugares y actividades, meses orientativos, estancia, región y consejos prácticos, traducidos a español, inglés, francés, alemán, italiano, portugués y catalán. El país se localiza mediante ISO y el mecanismo existente. No se inventan horarios, precios ni disponibilidades.

Regiones diferenciadas `BE-BRU`, `BE-VLG`, `BE-WAL`. Bruselas-Capital es bilingüe francés-neerlandés; Flandes utiliza neerlandés; Valonia es mayoritariamente francófona e incluye los municipios de la Comunidad germanófona del este. Se conservan nombres locales y alias como Bruxelles/Brussel, Brugge, Gent/Gand, Antwerpen/Anvers, Leuven/Louvain, Ieper, Oostende, Luik, Bergen y Namen. «Bergen» también es una ciudad noruega: el autocompletado conserva su país y no la transforma en Mons.

Las Ardenas de esta ficha son **belgas**, alrededor de Durbuy y La Roche-en-Ardenne, no las francesas. Los consejos incluyen condiciones de senderos, clima, río y desplazamientos entre pueblos. Se advierte que el interior del ayuntamiento de Lovaina permanece cerrado por obras hasta 2029 incluido; las fotos ilustran patrimonio y no garantizan su aspecto ni accesibilidad actuales. No se promete acceso al interior del Rubenshuis en Amberes, actualmente en obras.

## Aeropuertos: identidad física y servicio comercial

Identidades y agrupaciones contrastadas con los recursos públicos de Travelpayouts `data/en/airports.json` y `data/en/cities.json`, más 40 consultas públicas de autocompletado. Fixtures reproducibles sin credenciales. La programación actual se contrasta separadamente con los operadores: **`flightable:true` no prueba que existan vuelos regulares hoy**.

| IATA físico | Identidad | Ciudad de precios de Travelpayouts | Estado verificado / tratamiento |
|---|---|---|---|
| BRU | Brussels Airport, Zaventem | BRU / Bruselas | Principal aeropuerto comercial, programación regular |
| CRL | Charleroi / Brussels South Airport | BRU / Bruselas | Comercial distinto de BRU, en Charleroi; aviso de traslado terrestre a Bruselas |
| ANR | Antwerp International Airport | ANR / Amberes | Oferta limitada; TUI termina en primavera de 2027; últimas fechas publicadas varían según ruta, con Alicante el 25/03/2027 y Málaga el 24/03/2027 |
| OST | Ostend-Bruges International Airport | OST / «Brujas» | Vuelos comerciales según programación; físicamente en Ostende, no en Brujas |
| LGG | Liege Airport | LGG / Lieja | Sin vuelos regulares de pasajeros confirmados tras la salida de TUI en enero de 2026; identificación informativa, sin selección normal para vuelos |

No se asignan aeropuertos locales ficticios a Brujas, Gante, Lovaina, Ypres, Dinant, Namur, Mons o las Ardenas. Lieja tampoco utiliza LGG como aeropuerto comercial de su ficha. Todos los accesos añadidos están físicamente en Bélgica; no se incorporan aeropuertos extranjeros. Los traslados requieren comprobación de conexiones terrestres, sin prometer líneas, frecuencias o tiempos.

### Autocompletado y selección

- Se mantienen el comparador global por coincidencia exacta, prefijo, coincidencia parcial, tipo y popularidad; deduplicación y límites originales. Los cinco IATA identifican primero el aeropuerto físico, incluido LGG con su aviso informativo.
- Bruselas/Bruxelles/Brussel/Brussels muestran ciudad y opciones BRU/CRL diferenciadas. Charleroi resuelve CRL. Amberes y sus alias incluyen ANR con aviso de continuidad; Ostende/Oostende/Ostend priorizan el aeropuerto OST. Lieja/Liège/Luik muestran su identidad, el aviso de LGG y accesos reales BRU/CRL. Brujas conserva su ciudad OST y Gante ofrece aeropuertos de acceso reales.
- Solo las filas LGG belgas llevan `scheduledPassengerService:false`: el componente las muestra deshabilitadas con un texto traducido, evita seleccionarlas por clic/Enter y las salta con las flechas. ANR permanece seleccionable con un aviso para comprobar fechas. CRL indica que exige traslado a Bruselas. No se modifica el comportamiento de opciones anteriores de otros países.
- `physicalCityName` distingue Charleroi y Ostende en las etiquetas de los aeropuertos. `cityName` y `cityCode` conservan los valores originales para el flujo actual de búsqueda. Seleccionar CRL sigue entregando «Bruselas» a la consulta de precios; seleccionar OST entrega «Brujas», igual que el proveedor. Esto **no garantiza que todos los resultados agrupados correspondan al aeropuerto físico seleccionado**. La API de precios, presupuestos, fechas y pasajeros no cambia.
- El nombre turístico tiene prioridad solo al resolver una ciudad belga confirmada: la ciudad «Brujas» del proveedor abre `be-bruges`, mientras que elegir el aeropuerto físico OST permite consultar `be-ostend-belgian-coast`. No se duplican los IATA entre fichas para resolver esta diferencia.
- Las ciudades sin resultados del proveedor conservan las consultas expresas existentes `/?ficha=<nombre>` y la resolución por nombre del asistente; no se inventan ciudades aeroportuarias ni un buscador independiente. Las filas informativas LGG no crean una selección de vuelos: la ficha de Lieja sigue disponible por consulta expresa, con accesos BRU/CRL. Elegir un aeropuerto de acceso abre la ficha de su destino real de llegada, no atribuye falsamente ese aeropuerto a Gante o Lieja.
- Escribir o confirmar sugerencias nunca abre fichas automáticamente. El botón contextual existente abre solo la identidad confirmada.

La indisponibilidad de LGG se comunica en el autocompletado y en la ficha. Se conserva la consulta libre preexistente del buscador y la API de precios; no se ha creado un bloqueo global de cualquier petición manual o externa con el código LGG, ni se presenta una consulta de precios históricos como confirmación de una ruta actual.

## Visibilidad y funciones conservadas

Sin bloques de Bélgica ni nuevas tarjetas automáticas en portada, temporadas, meses o descubrimiento por presupuesto. Se mantienen 16 destacados y 16 originales por temporada, mismas fotos, textos y orden; París conserva su posición y Ámsterdam permanece en primavera. La nueva política de visibilidad excluye BE únicamente de recomendaciones automáticas, sin quitarlo del catálogo consultable.

Las fichas nuevas permanecen `publication.status:draft`: no se publican rutas ni URLs inventadas en sitemap. La portada solo amplía reconocimiento de país para localización, bandera y selección contextual. El generador de itinerarios y voz reutilizan el catálogo existente sin modificar sus APIs. No cambian Supabase, viajes guardados, credenciales, Vercel, dominio, afiliación, consultas de precios ni fechas flexibles.

PR independientes de fotos revisadas: #8 Ibiza, #13 Milán y #14 Asturias siguen abiertas; sus imágenes y archivos de datos no se modifican. El mantenimiento diario sigue activo, con el horario `37 5 * * *` UTC, ejecución manual y controles de coste intactos. No se cambian dependencias.

## Fotografías y licencia

Doce fotos reales de Wikimedia Commons con licencias CC BY/CC BY-SA compatibles con uso comercial bajo sus condiciones. `belgium-images.ts` conserva autor, fuente y enlace de licencia. La atribución aparece junto a la imagen mediante el componente existente. Miniaturas sin editar; el encuadre se ajusta únicamente para las nuevas fichas con `imagePosition` cuando hace falta. Las imágenes de otras fichas permanecen intactas.

## Validación

- 279 pruebas automatizadas superadas. Incluyen integridad de 125 fichas, 137 identidades, siete idiomas, regiones, alias, diferencias BRU/CRL y Brujas/OST, LGG informativo, teclado y móvil. El flujo voz → herramienta → ficha belga → planificador → itinerario visible se ejecuta con servicios simulados para las doce identidades en los siete idiomas.
- TypeScript y lint sin errores; se conservan las advertencias preexistentes de imágenes y deprecación de `next lint`.
- Auditoría: siete avisos High de la cadena de desarrollo conocidos en #16, cero al omitir desarrollo. Se documentan sin ocultarlos ni actualizar paquetes.
- Compilación de producción correcta y 21 comprobaciones HTTP locales superadas. Se utilizó el auxiliar externo habitual para carpetas de salida de Next.js en este Windows, sin cambiar configuración del proyecto. Preview y revisión real de escritorio/móvil pendientes del primer despliegue de revisión.
- IA, voz/WebRTC, precios y Supabase se simulan sin llamadas de pago ni datos reales. Las consultas públicas de aeropuertos/lugares, fuentes oficiales y metadatos de fotografías son reales.

## Fuentes oficiales y públicas

- Identidad/regiones/idiomas: https://www.belgium.be/en/about_belgium/government/regions y https://www.belgium.be/en/about_belgium/government/communities
- BRU: https://www.brusselsairport.be/en/passengers
- CRL: https://www.brussels-charleroi-airport.com/en/destinations — la web principal presentaba una página temporal fuera de servicio durante la revisión; no se confunde ese fallo web con cierre del aeropuerto. Identidad contrastada también con recursos del proveedor y documentación pública de la Comisión Europea: https://ec.europa.eu/competition/mergers/cases1/202508/M_11071_10520043_20204_3.pdf
- ANR: https://www.antwerp-airport.com/egis_compagnies/tui/ y https://www.tuifly.be/en/antwerp-airport
- OST y programación: https://www.ostendbruges-airport.com/
- LGG: https://www.liegeairport.com/en/departures-arrivals — informa de la salida de TUI; filas operativas puntuales sin fechas no prueban una reanudación de vuelos regulares de pasajeros.
- Proveedor: https://api.travelpayouts.com/data/en/airports.json y https://api.travelpayouts.com/data/en/cities.json
- Bruselas: https://www.visit.brussels/en/visitors/what-to-do/attractions-and-monuments.BME.251039 y https://www.brussels.be/atomium
- Flandes: https://www.visitflanders.com/en/flemish-destinations
- Brujas: https://www.visitbruges.be/en/things-to-do/sightseeing
- Gante: https://visit.gent.be/sites/default/files/media/doc/2025-11/Visitgent-cityguide-2025-ENG-Digitaal.pdf
- Lovaina y obras: https://visitleuven.be/en/town-hall
- Ypres: https://www.visitflanders.com/en/stories/journey-flanders-fields-place-remembrance
- Valonia: https://visitwallonia.be/sites/default/files/Escapades%20urbaines%20-%2023%20villes%20wallonnes_0.pdf
- Lieja: https://www.visitezliege.be/fr/page/liege-en-deux-jours
- Mons: https://www.visitmons.be/fr/que-faire/sites-et-musees
- Ardenas belgas: https://www.la-roche-en-ardenne.be/gestion/ressources/PDFs/guide-touristique-mt-2022.pdf
