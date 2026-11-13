# Sureste de Europa e islas del Mediterráneo: aeropuertos y fichas

Estado: borrador (`publication.status = 'draft'`). No aparecen en portada, sitemap ni recomendaciones automáticas; solo con selección explícita en el buscador.

## Fichas incluidas (14)

| Destino | País | Aeropuerto | Id |
|---|---|---|---|
| Belgrado | Serbia | BEG | `rs-belgrade` |
| Niš | Serbia | INI | `rs-nis` |
| Sarajevo | Bosnia y Herzegovina | SJJ | `ba-sarajevo` |
| Mostar | Bosnia y Herzegovina | OMO | `ba-mostar` |
| Tuzla | Bosnia y Herzegovina | TZL | `ba-tuzla` |
| Banja Luka | Bosnia y Herzegovina | BNX | `ba-banja-luka` |
| Podgorica | Montenegro | TGD | `me-podgorica` |
| Tivat (bahía de Kotor) | Montenegro | TIV | `me-tivat` |
| Skopie | Macedonia del Norte | SKP | `mk-skopje` |
| Ohrid | Macedonia del Norte | OHD | `mk-ohrid` |
| Pristina | Kosovo | PRN | `xk-pristina` |
| Malta | Malta | MLA | `mt-malta` |
| Lárnaca | Chipre | LCA | `cy-larnaca` |
| Pafos | Chipre | PFO | `cy-paphos` |

## Criterios y fuentes

- Aeropuertos marcados como `airport` y `flightable=true` en el inventario de Travelpayouts (consulta del 6/11/2026; `tests/fixtures/southeast-europe-airport-provider.json`) y conocidos por tener tráfico regular de pasajeros. Un `flightable=true` no prueba servicio actual: no se ha inventado ninguna ruta, precio ni disponibilidad.
- Tivat sirve a la bahía de Kotor (Kotor, Perast, Budva); Mostar, Tuzla, Niš y Ohrid tienen oferta limitada o estacional, y la ficha lo indica. Dubrovnik (DBV) se cita solo como alternativa por carretera.
- Kosovo se muestra como «Kosovo» y su código ISO es XK.

## Excluidos o pendientes

- Kraljevo (KVO, Serbia): figura como volable en el proveedor, pero no hay servicio regular verificado.
- Ercan (ECN, norte de Chipre): no figura como volable en el proveedor; no se incluye.

## Fotos (Wikimedia Commons, miniatura de 960 px)

| Destino | Archivo | Autor | Licencia |
|---|---|---|---|
| Belgrado | Belgrade. View to Kalemegdan fortress in evening sunset light.jpg | Bestalex | CC BY-SA 4.0 |
| Niš | Niš Fortress, Niš, Serbia.jpg | MrPanyGoff | CC BY-SA 3.0 |
| Sarajevo | Baščaršija - Sebilj - panoramio.jpg | Mister No | CC BY 3.0 |
| Mostar | Stari Most viewed from North.jpg | Bernard Gagnon | CC BY-SA 4.0 |
| Tuzla | Salines Soli Trg Tuzla 10-0 CML.jpg | Felky | CC BY-SA 4.0 |
| Banja Luka | Kastel fortress in Banja Luka (07).jpg | Vasyatka1 | CC BY-SA 4.0 |
| Podgorica | Millenium Bridge 2023.jpg | Desemeus | CC BY-SA 4.0 |
| Tivat (bahía de Kotor) | Monasterio de San Jorge, Perast, Bahía de Kotor, Montenegro, 2014-04-19, DD 21.JPG | Diego Delso | CC BY-SA 3.0 |
| Skopie | Stone Bridge (Skopje).JPG | Avi1111 dr. avishai teicher | CC BY-SA 4.0 |
| Ohrid | Iglesia San Juan Kaneo, Ohrid, Macedonia del Norte, 2014-04-17, DD 19.jpg | Diego Delso | CC BY-SA 3.0 |
| Pristina | NEWBORN Monument.jpg | Karrota | CC BY-SA 3.0 |
| Malta | Valletta, Grand Harbour, Salute Battery, Birgu, Senglea.jpg | Cosal | CC BY-SA 4.0 |
| Lárnaca | Larnaca-agios-lazaros.jpg | Mboesch | CC BY-SA 4.0 |
| Pafos | Paphos - Flickr - sergei.gussev (1).jpg | Sergei Gussev | CC BY 2.0 |

Origen de cada una: `https://commons.wikimedia.org/wiki/File:<archivo>` (campo `imageSource`). Mejorables en la fase 2: Paphos (foto genérica de la roca de Afrodita), Pristina (monumento repintado cada año) y Tivat (muestra Perast).

## Comprobaciones

- Pruebas: 420 en total; 413 pasan. Los 7 fallos son de entorno (faltan react, postcss, js-yaml) y ya fallaban antes.
- NO ejecutado: compilación (`next build`) ni revisión visual en móvil/tablet/escritorio. Pendiente de Vercel Preview (protegida).
- Siete idiomas, 4 recomendaciones, IATA y licencias de foto comprobados por test.

## Archivos

- `lib/destinations/southeast-europe.ts`, `lib/travelpayouts/southeast-europe-airports.ts`
- Registro en `lib/destinations/index.ts`, `presentation.ts`, `app/page.tsx`, `app/api/travelpayouts/places/route.ts`
- `tests/southeast-europe-destinations.test.cjs` y fixtures `pre-southeast-europe-catalog.json`, `southeast-europe-airport-provider.json`, `southeast-europe-photos.json`
- Contadores actualizados (233→247 perfiles, 16→23 países) en tests anteriores.
