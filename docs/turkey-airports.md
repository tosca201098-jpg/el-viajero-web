# Turquía: aeropuertos y fichas (lote 1)

Estado: borrador (`publication.status = 'draft'`). No aparece en portada, sitemap ni recomendaciones automáticas; solo con selección explícita en el buscador. Turquía se incluye en el catálogo europeo por decisión del usuario (6/11/2026).

## Fichas incluidas (11)

| Destino | Aeropuertos | Id |
|---|---|---|
| Estambul | IST, SAW | `tr-istanbul` |
| Ankara | ESB | `tr-ankara` |
| Esmirna | ADB | `tr-izmir` |
| Antalya | AYT | `tr-antalya` |
| Bodrum | BJV | `tr-bodrum` |
| Dalaman | DLM | `tr-dalaman` |
| Trebisonda | TZX | `tr-trabzon` |
| Capadocia | NAV (acceso: ASR) | `tr-cappadocia` |
| Gaziantep | GZT | `tr-gaziantep` |
| Konya | KYA | `tr-konya` |
| Alanya | GZP | `tr-alanya` |

## Criterios y fuentes

- Aeropuertos con actividad comercial de pasajeros conocida (estadísticas de DHMİ) y registrados en el inventario de Travelpayouts como `airport` y `flightable=true` (consulta del 6/11/2026; ver `tests/fixtures/turkey-airport-provider.json`). Un `flightable=true` no prueba servicio actual: no se ha inventado ninguna ruta, precio ni disponibilidad.
- Estambul agrupa IST (europeo) y SAW (asiático); el código de ciudad del proveedor es IST. Ankara usa ESB (ciudad ANK) y Esmirna ADB (ciudad IZM). Los códigos de ciudad ANK e IZM son `metropolitanCodes`, no aeropuertos.
- Capadocia usa NAV (Nevşehir Kapadokya); Kayseri (ASR) figura solo como aeropuerto de acceso con traslado terrestre.
- Bodrum (BJV, en Milas) y Alanya (GZP, en Gazipaşa) lo indican en la nota de traslado. Dalaman sirve de puerta a Fethiye, Ölüdeniz, Dalyan y Göcek, que no tienen ficha propia.
- Gaziantep incluye aviso de consultar las recomendaciones oficiales de viaje.

## Excluidos o pendientes

- ISL (Atatürk) y ANK Etimesgut: el proveedor los marca `flightable=false`.
- Pendientes de verificar servicio regular en el siguiente lote: Adana, Bursa, Kayseri (ficha propia), Samsun, Şanlıurfa, Mardin, Van, Erzurum, Diyarbakır, Kars, Hatay, Çanakkale, Edremit y otros regionales.
- Georgia, Armenia y Azerbaiyán quedan para la fase mundial.

## Fotos (Wikimedia Commons, miniatura de 960 px)

| Destino | Archivo | Autor | Licencia |
|---|---|---|---|
| Estambul | Fatihistanbul.jpg | Hunanuk | CC0 1.0 |
| Ankara | Anıtkabir, Ankara, Turquía, 2024-10-03, DD 20.jpg | Diego Delso | CC BY-SA 4.0 |
| Esmirna | Izmir Konak Square and Clock Tower, 2026.jpg | Mors et Vita | CC BY 4.0 |
| Antalya | Antalya kaleiçi 2.jpg | REHBER0770 | CC BY-SA 4.0 |
| Bodrum | Bodrum castle 3.JPG | Ad Meskens | CC BY-SA 3.0 |
| Dalaman | Blue Lagoon - 2014.10 - panoramio.jpg | rheins | CC BY 3.0 |
| Trebisonda | Sumela From Across Valley.JPG | Bjørn Christian Tørrissen | CC BY-SA 3.0 |
| Capadocia | Hot air balloons over valleys near Göreme, Cappadocia at dawn.JPG | MusikAnimal | CC BY-SA 4.0 |
| Gaziantep | Gaziantep Kalesi 4696.jpg | Dosseman | CC BY-SA 4.0 |
| Konya | Mevlana Müzesi 01.jpg | Bernard Gagnon | CC BY-SA 3.0 |
| Alanya | Alanya Castle Ehmedek View from height to Red Tower 3141.jpg | Dosseman | CC BY-SA 4.0 |

Origen de cada una: `https://commons.wikimedia.org/wiki/File:<archivo>` (campo `imageSource`). La foto de Estambul (CC0) y la de Bodrum quedan marcadas como mejorables en la fase 2.

## Comprobaciones

- Pruebas: 409 en total; 402 pasan. Los 7 fallos son de entorno (faltan react, postcss, js-yaml) y ya fallaban antes.
- NO ejecutado: compilación (`next build`) ni revisión visual en móvil/tablet/escritorio. Pendiente de Vercel Preview (protegida).
- Fichas con 7 idiomas, 4 recomendaciones, IATA y fotos con licencia comprobados por test.

## Archivos

- `lib/destinations/turkey.ts`, `lib/travelpayouts/turkey-airports.ts`
- Registro en `lib/destinations/index.ts`, `presentation.ts`, `app/page.tsx`, `app/api/travelpayouts/places/route.ts`
- `tests/turkey-destinations.test.cjs` y fixtures `pre-turkey-catalog.json`, `turkey-airport-provider.json`, `turkey-photos.json`
- Contadores actualizados (210→221 perfiles, 15→16 países) en tests anteriores.
