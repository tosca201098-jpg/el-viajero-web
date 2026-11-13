# Alemania: aeropuertos con pasajeros que aún no tenían ficha

Estado: borrador (`publication.status = 'draft'`). Sin presencia en portada, sitemap ni recomendaciones automáticas. Las 16 tarjetas originales, las 12 fichas de Alemania de la PR #19 y las páginas de temporada no se tocan.

## Punto de partida
Codex dejó 27 aeropuertos alemanes verificados en el proveedor (`lib/travelpayouts/germany-airports.ts`; TXL, SXF y XFW excluidos por cierre o cambio de uso). Las 12 fichas existentes cubrían 15 de ellos (BSL, Basilea, es suizo y no cuenta). Esta rama añade una ficha para cada uno de los **12** restantes. Con esto **los 27 aeropuertos verificados quedan cubiertos** (test automático).

## Fichas nuevas (12)
| Destino | Aeropuerto | Id | Foto (autor, licencia) |
|---|---|---|---|
| Hannover | HAJ | `de-hannover` | Falk2, CC BY-SA 4.0 |
| Bremen | BRE | `de-bremen` | Dietmar Rabich, CC BY-SA 4.0 |
| Rostock y la costa del Báltico | RLG | `de-rostock-baltic` | Ravie, CC BY-SA 4.0 |
| Dortmund y el Ruhr | DTM | `de-dortmund-ruhr` | CEphoto, Uwe Aranas, CC BY-SA 3.0 |
| Münster y Osnabrück | FMO | `de-muenster-osnabrueck` | Dietmar Rabich, CC BY-SA 4.0 |
| Paderborn | PAD | `de-paderborn` | Jörg Braukmann, CC BY-SA 4.0 |
| Friedrichshafen y el lago de Constanza | FDH | `de-friedrichshafen-bodensee` | Olga Ernst, CC BY-SA 4.0 |
| Erfurt y Turingia | ERF | `de-erfurt-thuringia` | H. Zell, CC BY-SA 3.0 |
| Saarbrücken y el Sarre | SCN | `de-saarbruecken-saarland` | Gerd Eichmann, CC BY 4.0 |
| Sylt | GWT | `de-sylt` | Jörg Braukmann, CC BY-SA 4.0 |
| Usedom | HDF | `de-usedom` | Jo Vert, CC BY-SA 4.0 |
| Kassel | KSF | `de-kassel` | Dguendel, CC BY 4.0 |

Fotos de Wikimedia Commons con licencia libre; autor y licencia visibles en la ficha. Contenido completo en los siete idiomas. Meses y estancias son orientación editorial, no garantías de clima, precios ni disponibilidad. En Sylt y Usedom (islas) y en Kassel se avisa de que la oferta de vuelos es limitada y estacional.

## Pendientes y excluidos
AGB (Augsburgo) y MHG (Mannheim) figuran en el proveedor como aeropuerto pero sin servicio regular de pasajeros verificado: quedan como `pendingVerification` en `tests/fixtures/germany-regional-airport-provider.json`. TXL, SXF y XFW siguen excluidos por la decisión previa de Codex.

## Pruebas
Huella de los 354 perfiles previos y de las 16 tarjetas; 12 fichas × 7 idiomas; unicidad de nombres y alias; cada IATA resuelve a una única ficha; los 27 aeropuertos verificados cubiertos; fotos con licencia y hash de Commons. Batería completa: 497 pruebas, 490 pasan; 7 fallos de entorno previos. Sin compilación completa ni revisión visual (sin red en Bash; Preview de Vercel protegido).
