# Grecia: ampliación de cobertura, primer lote

Este informe conserva el estado de su lote. La cobertura actual completa de 39 aeropuertos revisados se documenta en [greece-final-coverage.md](greece-final-coverage.md).

4 de noviembre de 2026. El objetivo vigente ya no limita Grecia a quince aeropuertos por tráfico internacional. Se conservan íntegramente las quince fichas aprobadas y se añaden dos huecos verificados de la [red de catorce aeropuertos regionales de Fraport](https://www.fraport-greece.com/en/airport-profiles.html). No se rehace la investigación del corte de tráfico de 2025: véase el informe anterior `greece-destinations.md`.

| Ficha nueva | IATA | Nombre real del aeropuerto | Referencia turística |
| --- | --- | --- | --- |
| Kavala | KVA | Kavala International Airport, Alexander the Great | Kavala; aeropuerto fuera de la ciudad y traslado terrestre. |
| Mitilene / Mytilene | MJT | Mitilini Airport, Odysseas Elytis | Mitilene, isla de Lesbos; aeropuerto fuera del centro urbano. |

Fuentes de operadores vigentes: [KVA](https://www.kva-airport.gr/en/) y [MJT](https://www.mjt-airport.gr/en/). No se fijan rutas ni horarios en las fichas; vuelos, transporte y estacionalidad deben comprobarse para las fechas del viaje. Los IATA son de aeropuertos físicos; Lesbos/Lesvos son alias del destino servido, no un código metropolitano inventado.

## Estado y continuidad

**Dos fichas nuevas, diecisiete griegas en total y 226 perfiles en esta rama.** Queda cubierto el conjunto de catorce aeropuertos de Fraport, además de ATH, HER y KLX que ya existían. Esto **no declara Grecia completa**: continúa pendiente ampliar el resto de su red comercial y turística, incluidos aeropuertos regionales e insulares.

La fuente oficial ya investigada en el lote anterior, [Growthfund, 22 aeropuertos regionales, 2026](https://growthfund.gr/wp-content/uploads/2026/04/Growthfund_EoI_22-Regional-Airports_EN.pdf), sirve de inventario para la siguiente fase. Se comprobará servicio actual y relevancia de cada aeropuerto antes de incorporar las fichas, sin añadir aeródromos militares o privados por defecto ni imponer otra cuota arbitraria. El registro mundial de la entrega de Croacia está en `docs/airport-catalog-status.md` de `codex/croatia-airport-coverage`: Croacia tiene quince fichas y nueve aeropuertos públicos revisados; Eslovenia, su conjunto oficial de tres internacionales; los países antiguos con doce fichas no se consideran completos sin auditar su cobertura.

Siguiente bloque previsto dentro de Grecia: contrastar los aeropuertos estatales de esa tabla y ampliar primero las entradas comerciales y turísticas principales, manteniendo separados los lotes del mismo país. Europa se completará antes de abrir países de otras regiones.

## Contenido, fotos y funcionamiento

- Kavala: puerto, Panagia, castillo, acueducto Kamares y patrimonio del tabaco. Fuentes: [Ministerio de Cultura](https://culturalegnatia.culture.gov.gr/en/route-stops/kavala/) y [Turismo de Kavala](https://www.visitkavala.gr/en/eksereunise/).
- Mitilene: puerto, castillo, museo arqueológico e iglesia de Agios Therapon. Fuentes: [Hellenic Heritage](https://www.hh.gr/en/destinations/mytilene-castle/), [Ministerio de Cultura](https://www.culture.gov.gr/DocLib/%CF%89%CF%81%CE%B1%CF%81%CE%B9%CE%BF.pdf) y [municipio de Mitilene](https://www.mytilene.gr/mouseia/vyzantino-mouseio/). No se copian precios ni horarios.
- Fotografía de Kavala: [Harbour Kavala](https://commons.wikimedia.org/wiki/File:Harbour_Kavala.jpg), DocWoKav, CC BY-SA 4.0.
- Fotografía de Mitilene: [Mytilene 2010-04-03](https://commons.wikimedia.org/wiki/File:Mytilene_2010-04-03.jpg), Koutrolm, declarada de dominio público por su autor. Se atribuye igualmente; el enlace Public Domain Mark identifica el estado y no se presenta como CC0. El diseño aplica su recorte CSS habitual, sin retocar archivos originales.

Se reutilizan detalle, siete idiomas, buscador, vuelos, hoteles y planificador. Las nuevas fichas siguen en draft, bajo búsqueda/selección explícita o enlace `?ficha=Kavala` y `?ficha=Mitilene`; no aparecen en las 16 tarjetas, recomendaciones automáticas, temporadas, páginas mensuales ni sitemap.

## Conservación y verificación

Una huella por perfil conserva los 224 anteriores, incluida la fotografía de Atenas elegida por el usuario. Las pruebas existentes se amplían al total de diecisiete; se añaden la conservación integral de la base, cobertura de Fraport, búsqueda por nombre aeroportuario/alias de Lesbos y declaración correcta de dominio público. Las conexiones de tests están bloqueadas. Los resultados y el recorrido visual móvil/tableta/escritorio se documentan en la PR.

Resultado local: las 411 pruebas existentes, aplicadas al catálogo ampliado, y las cuatro pruebas nuevas pasan (415 en total). No se repiten comprobaciones superadas sin motivo. La compilación, TypeScript y lint del commit final se comprueban en el despliegue de Preview.

Rama de ampliación sobre `codex/greece-destinations`, sin cambiar PR #39. No mezcla código de Croacia o Eslovenia. No modifica main, Production, Sofía, ElevenLabs, Redis, cuotas, variables, dependencias, pagos ni servicios. No se fusiona ni publica sin autorización.
