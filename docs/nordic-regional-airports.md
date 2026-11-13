# Países nórdicos: aeropuertos regionales con servicio regular que aún no tenían ficha

Estado: borrador (`publication.status = 'draft'`). Sin presencia en portada, sitemap ni recomendaciones automáticas. Las 16 tarjetas originales, las fichas existentes y las páginas de temporada no se tocan. Apilada sobre `claude/europe-regional-gaps`.

## Fichas nuevas (10)
| Destino | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|
| Sandefjord y Vestfold (NO) | TRF | `no-sandefjord-vestfold` | Ssu, CC BY-SA 4.0 |
| Joensuu y Carelia del Norte (FI) | JOE | `fi-joensuu-karelia` | Lobke Thijssen, CC BY-SA 2.5 |
| Jyväskylä (FI) | JYV | `fi-jyvaskyla` | Tiia Monto, CC BY-SA 4.0 |
| Kajaani y Kainuu (FI) | KAJ | `fi-kajaani-kainuu` | JIP, CC BY-SA 3.0 |
| Kemi y Tornio (FI) | KEM | `fi-kemi-tornio` | Art of Backpacking, CC BY 2.0 |
| Kokkola y Pietarsaari (FI) | KOK | `fi-kokkola-jakobstad` | Mikkoau, CC BY-SA 4.0 |
| Pori (FI) | POR | `fi-pori` | kallerna, CC BY-SA 3.0 |
| Savonlinna (FI) | SVL | `fi-savonlinna` | HENKKA5, CC0 |
| Egilsstaðir y el este de Islandia (IS) | EGS | `is-egilsstadir-east-iceland` | Sidetrips, CC BY-SA 4.0 |
| Ísafjörður y los Fiordos del Oeste (IS) | IFJ | `is-isafjordur-westfjords` | Smiley.toerist, CC BY-SA 4.0 |

## Evidencia de servicio regular
- JOE, JYV, KAJ, KEM, KOK: vuelos a Helsinki con apoyo estatal hasta febrero de 2028 ([Traficom](https://traficom.fi/en/news/base-airlines-ltd-wins-public-tender-air-services-savonlinna-helsinki-route-finnair-operate-state-subsidised-flights-five-regional-airports-until-27-february-2028)). POR: contrato con la ciudad hasta marzo de 2027, ampliable. SVL: contrato Savonlinna–Helsinki de 2026 a 2028 (misma fuente).
- EGS e IFJ: vuelos diarios desde Reikiavik ([Isavia, destinos nacionales](https://www.innanlandsflugvellir.is/en/reykjavik-airport/flight-schedule/destinations)).
- TRF: [rutas del aeropuerto](https://www.airportroutes.com/airports/ento/).
Las fichas no citan aerolíneas, rutas ni horarios. Meses y estancias son orientación editorial, no garantías de clima, precios ni disponibilidad.

## Pendientes y excluidos (sin ficha)
| Código | Lugar | Motivo |
|---|---|---|
| LYR | Longyearbyen (Svalbard) | El proveedor lo registra con país `SJ`; hay que añadir ese país al catálogo antes de crear la ficha (decisión de estructura, no de contenido) |
| HFN | Höfn (IS) | El proveedor lo marca como no reservable (`flightable=false`) |
| VAA, KUO | Vaasa, Kuopio (FI) | Servicio regular por verificar |

Siguen pendientes también el resto de aeropuertos pequeños de Noruega y Suecia, Dinamarca, Rumanía y Turquía menor (ver `docs/europe-regional-airports.md`).

## Pruebas
Huella de los 376 perfiles previos y de las 16 tarjetas; 10 fichas × 7 idiomas; unicidad de nombres y alias; cada IATA resuelve a una única ficha; fotos con licencia y hash de Commons; selección por país. Totales de pruebas anteriores 376 → 386. Sin compilación completa ni revisión visual (sin red en Bash; Preview de Vercel protegido).
