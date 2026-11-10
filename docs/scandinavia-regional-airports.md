# Noruega y Suecia: más aeropuertos con servicio regular que aún no tenían ficha

Estado: borrador (`publication.status = 'draft'`). Sin presencia en portada, sitemap ni recomendaciones automáticas. Las 16 tarjetas originales, las fichas existentes y las páginas de temporada no se tocan. Apilada sobre `claude/nordic-regional-gaps` (#60).

## Fichas nuevas (7)
| Destino | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|
| Nyköping (SE) | NYO (Estocolmo-Skavsta) | `se-nykoping-skavsta` | Sniper Zeta, CC BY-SA 4.0 |
| Kalmar (SE) | KLR | `se-kalmar-oland` | Pudelek, CC BY-SA 4.0 |
| Gällivare (SE) | GEV | `se-gallivare-lapland` | Myszka2891, CC BY-SA 4.0 |
| Honningsvåg y el Cabo Norte (NO) | HVG | `no-honningsvag-north-cape` | Stjepko Krehula, CC BY 4.0 |
| Hammerfest (NO) | HFT | `no-hammerfest` | Virtual-Pano, CC BY-SA 4.0 |
| Bardufoss (NO) | BDU | `no-bardufoss-malselv` | Obivan Kenobi, CC BY-SA 4.0 |
| Sogndal y el Sognefjord (NO) | SOG | `no-sogndal-sognefjord` | Bjørn Erik Pedersen, CC BY-SA 4.0 |

## Evidencia de servicio regular
- NYO: [Wikipedia](https://en.wikipedia.org/wiki/Stockholm_Skavsta_Airport) (aerolíneas de bajo coste; tráfico anual publicado). La ficha advierte que está a unos 100 km de Estocolmo.
- KLR: [Wikipedia](https://en.wikipedia.org/wiki/Kalmar_Airport). GEV: [Wikipedia](https://en.wikipedia.org/wiki/G%C3%A4llivare_Lapland_Airport).
- HVG: [Wikipedia](https://en.wikipedia.org/wiki/Honningsv%C3%A5g_Airport,_Valan). HFT: [Wikipedia](https://en.wikipedia.org/wiki/Hammerfest_Airport). SOG: [Wikipedia](https://en.wikipedia.org/wiki/Sogndal_Airport,_Haukasen).
- BDU: [rutas del aeropuerto](https://www.airportroutes.com/airports/endu/).
Las fichas no citan aerolíneas, rutas ni horarios. Meses y estancias son orientación editorial, no garantías de clima, precios ni disponibilidad. Las fichas del Ártico avisan de que las auroras no están garantizadas y de que hay carreteras y servicios estacionales.

## Pendientes y excluidos (sin ficha)
Se mantienen LYR (país `SJ`, decisión de estructura), HFN (no reservable), VAA y KUO (servicio por verificar). Aún sin verificar en Noruega: HOV, FDE, FRO, MQN, BNN, SSJ, RRS, SDN, LKL, VDS, MJF, RVK, OSY, SKN, ANX; en Suecia: VXO, RNB, HAD, SFT, KID, AGH, VST, BMA; además Dinamarca (EBJ, KRP, SGD), Rumanía y Turquía menor.

## Pruebas
Huella de los 386 perfiles previos y de las 16 tarjetas; 7 fichas × 7 idiomas; unicidad de nombres y alias; cada IATA resuelve a una única ficha; fotos con licencia y hash de Commons; selección por país. Totales de pruebas anteriores 386 → 393. Suite: 530 pruebas; 523 pasan; fallan las 7 de entorno ya conocidas. Sin compilación completa ni revisión visual (sin red en Bash; Preview de Vercel protegido).
