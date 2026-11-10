# Europa: aeropuertos regionales con servicio regular que aún no tenían ficha

Estado: borrador (`publication.status = 'draft'`). Sin presencia en portada, sitemap ni recomendaciones automáticas. Las 16 tarjetas originales, las fichas existentes y las páginas de temporada no se tocan.

## Punto de partida
Tras cerrar Reino Unido, Italia y Alemania, se auditó el resto de Europa contra el inventario del proveedor (Travelpayouts, `flightable`). Estos 10 aeropuertos son los que, además, tienen **servicio regular de pasajeros verificado en fuentes de rutas y estadísticas** (enlaces en `tests/fixtures/europe-regional-airport-provider.json`, campo `serviceEvidence`). Croacia, Eslovenia y Grecia no se tocan: ya los cubre el trabajo de Codex (PR #36/#41, #40 y #42).

## Fichas nuevas (10)
| Destino | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|
| Rzeszów y Podkarpacie (PL) | RZE | `pl-rzeszow-podkarpacie` | Agawa288, CC BY-SA 4.0 |
| Donegal (IE) | CFN | `ie-donegal` | Joli Rumi, CC BY-SA 4.0 |
| Alta (NO) | ALF | `no-alta` | Svein-Magne Tunli, CC BY-SA 4.0 |
| Kristiansand y el Sørlandet (NO) | KRS | `no-kristiansand-sorlandet` | Knut Arne Gjertsen, CC BY-SA 4.0 |
| Haugesund y Karmøy (NO) | HAU | `no-haugesund-karmoy` | Jules Verne Times Two, CC BY-SA 4.0 |
| Molde y Romsdal (NO) | MOL | `no-molde-romsdal` | Erik den yngre, CC BY-SA 4.0 |
| Kristiansund y la Carretera del Atlántico (NO) | KSU | `no-kristiansund-atlantic-road` | Clementp.fr, CC BY-SA 4.0 |
| Harstad y Narvik (NO) | EVE | `no-harstad-narvik` | Ximonic (Simo Räsänen), CC BY-SA 3.0 |
| Leknes (Lofoten) (NO) | LKN | `no-leknes-vestvagoy` | Ximonic (Simo Räsänen), CC BY-SA 3.0 |
| Umeå (SE) | UME | `se-umea` | Tage Olsin, CC BY-SA 2.0 |

Contenido completo en los siete idiomas (descripción, 4 recomendaciones, mejor época, estancia, aviso de acceso). Meses y estancias son orientación editorial, no garantías de clima, precios ni disponibilidad. Donegal lleva aviso de oferta de vuelos limitada; Alta, Harstad-Narvik y Leknes recuerdan que las auroras no están garantizadas. No se citan aerolíneas, rutas ni horarios en las fichas.

## Pendientes y excluidos (sin ficha)
| Código | Lugar | Motivo |
|---|---|---|
| LUG, SIR | Lugano, Sion (CH) | Sin servicio regular suficiente (ya documentado en la fase de Suiza) |
| KSD, SDL, ORB, JKG | Karlstad, Sundsvall, Örebro, Jönköping (SE) | Servicio regular por verificar |
| EBJ, KRP, SGD | Esbjerg, Karup, Sønderborg (DK) | Servicio regular por verificar |
| RDO, IEG | Radom, Zielona Góra (PL) | Servicio regular por verificar |
| BBU, CND, BAY, ARW, BCM, SUJ | Baneasa, Constanța, Baia Mare, Arad, Bacău, Satu Mare (RO) | Servicio regular por verificar (BBU es sobre todo aviación de negocios) |

Quedan registrados como `pendingVerification` en el fixture del proveedor y el test comprueba que no tienen ficha. Egilsstaðir e Ísafjörður pasaron a tener ficha en el lote siguiente (`docs/nordic-regional-airports.md`). Pendiente además: resto de aeropuertos pequeños de Noruega y Suecia, Finlandia regional, Francia (comparar con PR #44 de Codex y #47) y Turquía menor.

## Pruebas
Huella de los 366 perfiles previos y de las 16 tarjetas; 10 fichas × 7 idiomas; unicidad de nombres y alias; cada IATA resuelve a una única ficha; fotos con licencia y hash de Commons; selección por país. Se actualizaron los totales de las pruebas anteriores (366 → 376) y el número de fichas de Polonia (12 → 13). Batería completa: 508 pruebas, 501 pasan; 7 fallos de entorno previos. Sin compilación completa ni revisión visual (sin red en Bash; Preview de Vercel protegido).
