# Italia: aeropuertos con pasajeros que aún no tenían ficha

Estado: borrador (`publication.status = 'draft'`). Sin presencia en portada, sitemap ni recomendaciones automáticas. Las 16 tarjetas originales, las 12 fichas de Italia de la PR #19 y las páginas de temporada no se tocan.

## Punto de partida
Codex dejó 40 aeropuertos italianos del proveedor revisados (`lib/travelpayouts/italy-airports.ts`, 20/10/2026, con estadísticas de gestores de agosto de 2026). Las 12 fichas existentes cubrían 16 de ellos. Esta rama añade una ficha para cada uno de los **24** restantes, sin modificar ni duplicar las anteriores. Con esto **los 40 aeropuertos verificados quedan cubiertos** (test automático).

## Fichas nuevas (24)
| Destino | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|
| Génova | GOA | `it-genoa` | Alexdechi, CC BY-SA 4.0 |
| Trieste | TRS | `it-trieste` | Petar Milošević, CC BY-SA 4.0 |
| Perugia y Umbría | PEG | `it-perugia-umbria` | Livioandronico2013, CC BY-SA 4.0 |
| Ancona y las Marcas | AOI | `it-ancona-marche` | Cinnich, CC BY-SA 4.0 |
| Rímini | RMI | `it-rimini` | Pampuco, CC BY-SA 4.0 |
| Pescara y Abruzos | PSR | `it-pescara-abruzzo` | Vincedelbenàco, CC BY-SA 4.0 |
| Bari y Apulia | BRI | `it-bari-puglia` | Benjamin Smith, CC BY-SA 4.0 |
| Brindisi y Salento | BDS | `it-brindisi-salento` | Bernard Gagnon, CC0 |
| Lamezia y Calabria | SUF | `it-lamezia-calabria` | Benjamin Smith, CC BY-SA 4.0 |
| Reggio Calabria | REG | `it-reggio-calabria` | Benjamin Smith, CC BY-SA 4.0 |
| Ragusa y Módica | CIY | `it-ragusa-modica` | Daniele Napolitano, CC BY-SA 4.0 |
| Trapani y Érice | TPS | `it-trapani-erice` | giuseppe di giorgio, CC BY-SA 3.0 |
| Lampedusa | LMP | `it-lampedusa` | ALY MOHAMED YOUSSEF, CC BY-SA 4.0 |
| Pantelleria | PNL | `it-pantelleria` | Luca Conti, CC BY 2.0 |
| Olbia y la Costa Esmeralda | OLB | `it-olbia-costa-smeralda` | Gianni Careddu, CC BY-SA 4.0 |
| Alguer | AHO | `it-alghero` | Basilicofresco, CC BY-SA 4.0 |
| Bolzano y las Dolomitas | BZO | `it-bolzano-dolomites` | Hiroki Ogawa, CC BY 3.0 |
| Crotona y Capo Rizzuto | CRV | `it-crotone-capo-rizzuto` | Benjamin Smith, CC BY-SA 4.0 |
| Foggia y el Gargano | FOG | `it-foggia-gargano` | Einaz80, CC BY-SA 4.0 |
| Isla de Elba | EBA | `it-elba` | Francesco Zanardini, CC BY-SA 3.0 |
| Salerno y la Costa Amalfitana | QSR | `it-salerno-amalfi-coast` | Bernard Gagnon, CC BY 4.0 |
| Parma | PMF | `it-parma` | Palickap, CC BY-SA 4.0 |
| Forlì y Romaña | FRL | `it-forli-romagna` | Zairon, CC BY-SA 4.0 |
| Cuneo y las Langhe | CUF | `it-cuneo-langhe` | Davide Tomatis, CC BY-SA 4.0 |

Fotos de Wikimedia Commons con licencia libre; autor y licencia visibles en la ficha. Contenido completo en español, inglés, francés, alemán, italiano, portugués y catalán. Meses y estancias son orientación editorial, no garantías de clima, precios ni disponibilidad.

## Avisos de servicio
Los datos de tráfico no equivalen a una ruta disponible para cualquier fecha. En aeropuertos con oferta limitada o estacional (islas, REG, CIY, CRV, FOG, QSR, BZO, PMF, FRL, CUF) la ficha avisa de que la oferta de vuelos es limitada y cambia por temporada. No se inventan rutas, precios ni plazas. Alghero (`it-alghero`) se llama «L’Alguer» en catalán, idioma que aún se habla en la ciudad.

## Pendiente y excluido
VBS (Montichiari/Brescia) figura en el proveedor pero no estaba entre los 40 revisados ni tiene servicio de pasajeros verificado: queda como `pendingVerification` en `tests/fixtures/italy-regional-airport-provider.json`. Estaciones de tren, helipuertos y puertos del proveedor no son aeropuertos y se ignoran.

## Pruebas
Huella de los 330 perfiles previos y de las 16 tarjetas; 24 fichas × 7 idiomas; unicidad de nombres y alias; cada IATA resuelve a una única ficha; los 40 aeropuertos verificados cubiertos; fotos con licencia y hash de Commons. Se actualizaron dos pruebas antiguas de Italia que suponían que esos 24 aeropuertos no tendrían ficha (ahora se comprueba que siguen fuera de las doce originales). Batería completa: 486 pruebas, 479 pasan; 7 fallos de entorno previos. Sin compilación completa ni revisión visual (sin red en Bash; Preview de Vercel protegido).
