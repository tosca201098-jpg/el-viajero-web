# Reino Unido: aeropuertos con pasajeros que aún no tenían ficha

Estado: borrador (`publication.status = 'draft'`). Sin presencia en portada, sitemap ni recomendaciones automáticas. Las 16 tarjetas originales, las 12 fichas de Reino Unido de la PR #18 y las páginas de temporada no se tocan.

## Punto de partida
Codex dejó 38 aeropuertos del Reino Unido verificados en el proveedor (`lib/travelpayouts/uk-airports.ts`, verificación del 21/10/2026, con tráfico acreditado por la CAA). Las 12 fichas existentes cubrían 19 de ellos. Esta rama añade una ficha para cada uno de los 20 restantes, sin modificar ni duplicar las anteriores. Con esto, **los 38 aeropuertos verificados quedan cubiertos** (test automático).

## Fichas nuevas (20)
| Destino | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|
| Nottingham | EMA (ciudad NQT) | `gb-nottingham` | Enchufla Con Clave, CC BY-SA 4.0 |
| Newcastle upon Tyne | NCL | `gb-newcastle` | Benjamin Smith, CC BY-SA 4.0 |
| Durham y Teesside | MME | `gb-teesside` | mattbuck, CC BY-SA 4.0 |
| Southampton | SOU | `gb-southampton` | Peter Glyn, CC0 |
| Bournemouth | BOH | `gb-bournemouth` | Luni22, CC BY-SA 4.0 |
| Exeter | EXT | `gb-exeter` | Dietmar Rabich, CC BY-SA 4.0 |
| Newquay y Cornualles | NQY | `gb-newquay-cornwall` | Jürgen Matern, CC BY-SA 2.5 |
| Norwich | NWI | `gb-norwich` | MrsEllacott, CC BY-SA 4.0 |
| Aberdeen | ABZ | `gb-aberdeen` | Carl Farnell, CC BY-SA 2.0 |
| Dundee | DND | `gb-dundee` | Alex Liivet, CC BY 2.0 |
| Lewis y Harris | SYY | `gb-lewis-harris` | M J Richardson, CC BY-SA 2.0 |
| Orcadas | KOI | `gb-orkney` | Ymblanter, CC BY-SA 4.0 |
| Shetland | LSI (ciudad SDZ) | `gb-shetland` | Stephan Ridgway, CC BY 2.0 |
| Islay | ILY | `gb-islay` | Barbara Carr, CC BY-SA 2.0 |
| Isla de Barra | BRR | `gb-barra` | Nessy-Pic, CC BY-SA 3.0 |
| Benbecula y las Uist | BEB | `gb-benbecula-uist` | Mike O’Shea, CC BY-SA 2.0 |
| Derry/Londonderry | LDY | `gb-derry-londonderry` | Simon Burchell, CC BY-SA 4.0 |
| Hull y Humberside | HUY | `gb-hull-humberside` | Michael D Beckwith, CC0 |
| Campbeltown y Kintyre | CAL | `gb-campbeltown-kintyre` | Tim Glover, CC BY-SA 2.0 |
| Tiree | TRE | `gb-tiree` | M J Richardson, CC BY-SA 2.0 |

Todas las fotos son de Wikimedia Commons con licencia libre; el autor y la licencia se muestran en la ficha. Contenido completo en español, inglés, francés, alemán, italiano, portugués y catalán. Meses y estancias son orientación editorial, no garantías de clima, precios ni disponibilidad.

## Pendientes y excluidos
Están en el inventario del proveedor pero no tienen servicio regular de pasajeros verificado en este lote, por lo que **no** llevan ficha: WIC (Wick), NRL, EOI, SOY, WRY, PPW (aeródromos de las Orcadas), ACI (Alderney), CBG (Cambridge), BLK (Blackpool). Siguen en `tests/fixtures/uk-regional-airport-provider.json` como `pendingVerification`. VLY y DSA quedan excluidos por la decisión previa de Codex (marcas obsoletas). Estaciones de tren, autobús y helipuertos del proveedor no son aeropuertos y se ignoran.

## Cómo se usa
Se encuentran con el buscador existente (por ciudad del proveedor) y por enlace directo `/?ficha=...`. No cambia el autocompletado ni el contrato de presentación de GB. Las fichas describen el destino servido; no prometen rutas, precios ni plazas. En las islas pequeñas se avisa de que la oferta de vuelos es limitada y estacional.

## Pruebas
Huella de los 310 perfiles previos y de las 16 tarjetas; 20 fichas × 7 idiomas; unicidad de nombres y alias; cada IATA resuelve a una única ficha; los 38 aeropuertos verificados cubiertos; fotos con licencia y hash de Commons. Batería completa: 475 pruebas, 468 pasan; 7 fallos de entorno previos (css-toolchain, página de vuelos, workflow de mantenimiento, rutas mensuales asíncronas y 3 de hoteles). Sin compilación completa ni revisión visual (sin red en Bash; Preview de Vercel protegido).
