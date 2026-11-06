# Turquía: aeropuertos y fichas (lotes 1 y 2)

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

## Lote 2 (12 fichas más, total 23)

| Destino | Aeropuerto | Id |
|---|---|---|
| Adana | COV | `tr-adana` |
| Bursa | YEI | `tr-bursa` |
| Samsun | SZF | `tr-samsun` |
| Şanlıurfa | GNY | `tr-sanliurfa` |
| Mardin | MQM | `tr-mardin` |
| Van | VAN | `tr-van` |
| Erzurum | ERZ | `tr-erzurum` |
| Diyarbakır | DIY | `tr-diyarbakir` |
| Kars | KSY | `tr-kars` |
| Çanakkale | CKZ | `tr-canakkale` |
| Pamukkale (Denizli) | DNZ | `tr-pamukkale` |
| Rize | RZV | `tr-rize` |

Notas del lote 2: COV (Çukurova) sirve a Adana y Mersin y el proveedor lo asocia a Mersin; la ficha describe Adana. GNY figura como «Golgen» en el proveedor. Pamukkale se atiende desde Denizli Çardak (DNZ). Adana, Şanlıurfa, Mardin y Diyarbakır tienen temporada alta en primavera y otoño por el calor estival; Mardin, Şanlıurfa, Diyarbakır, Van y Gaziantep llevan aviso de consultar las recomendaciones oficiales de viaje. Fotos del lote 2:

| Destino | Archivo | Autor | Licencia |
|---|---|---|---|
| Adana | Adana Sabancı Central Mosque - Sabancı Merkez Camii 02.JPG | Zeynel Cebeci | CC BY-SA 4.0 |
| Bursa | Green Tomb - Yeşil Türbe (11).jpg | Yahia.Mokhtar | CC BY-SA 4.0 |
| Samsun | Onur Anıtı.JPG | Cobija | CC0 1.0 |
| Şanlıurfa | Balıklıgöl, Urfa 2015.jpg | Hamdigumus | CC0 1.0 |
| Mardin | Mardin panorama 1.png | KediÇobanı | CC BY-SA 4.0 |
| Van | 00 0390 Lake Van, church on Akdamar Island.jpg | W. Bulach | CC BY-SA 4.0 |
| Erzurum | Çifte Minareli Medrese (Erzurum) Exterior front side in 2006 3278 straightened.jpg | Dosseman | CC BY-SA 4.0 |
| Diyarbakır | City walls in Diyarbakır (1).jpg | Radosław Botev | CC BY 3.0 PL |
| Kars | Ani Archeological Site, March 2020 3.jpg | Héctor Ochoa “Robot8A” | CC BY-SA 4.0 |
| Çanakkale | Troy National Park 1.jpg | Ebru Sargın L. | CC BY-SA 4.0 |
| Pamukkale (Denizli) | The travertines of Pamukkale 3.jpg | Slyronit | CC BY-SA 4.0 |
| Rize | Ayder Plateau @ Rize-Turkey.JPG | Dr. Zeynel Cebeci | CC BY-SA 3.0 |

Mejorables en la fase 2: Bursa (detalle de azulejos, no panorámica), Mardin (vista lejana) y Çanakkale (ruinas de Troya poco expresivas).

## Criterios y fuentes

- Aeropuertos con actividad comercial de pasajeros conocida (estadísticas de DHMİ) y registrados en el inventario de Travelpayouts como `airport` y `flightable=true` (consulta del 6/11/2026; ver `tests/fixtures/turkey-airport-provider.json`). Un `flightable=true` no prueba servicio actual: no se ha inventado ninguna ruta, precio ni disponibilidad.
- Estambul agrupa IST (europeo) y SAW (asiático); el código de ciudad del proveedor es IST. Ankara usa ESB (ciudad ANK) y Esmirna ADB (ciudad IZM). Los códigos de ciudad ANK e IZM son `metropolitanCodes`, no aeropuertos.
- Capadocia usa NAV (Nevşehir Kapadokya); Kayseri (ASR) figura solo como aeropuerto de acceso con traslado terrestre.
- Bodrum (BJV, en Milas) y Alanya (GZP, en Gazipaşa) lo indican en la nota de traslado. Dalaman sirve de puerta a Fethiye, Ölüdeniz, Dalyan y Göcek, que no tienen ficha propia.
- Gaziantep incluye aviso de consultar las recomendaciones oficiales de viaje.

## Excluidos o pendientes

- ISL (Atatürk) y ANK Etimesgut: el proveedor los marca `flightable=false`.
- Pendientes de verificar servicio regular: Hatay (HTY), Edremit (EDO), Kayseri (ASR, solo aeropuerto de acceso de Capadocia), Eskişehir (AOE), Çorlu (TEQ), Ordu-Giresun (OGU) y pequeños regionales (KCM, MLX, EZS, VAS, ERC, BAL, SXZ, MSR, AJI, IGD, ADF, TJK, MZH, KFS, NOP, ONQ, KCO, KZR, ISE, BGG, YKO, NKT).
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

- Pruebas: 409 en total; 402 pasan (con los 23 destinos). Los 7 fallos son de entorno (faltan react, postcss, js-yaml) y ya fallaban antes.
- NO ejecutado: compilación (`next build`) ni revisión visual en móvil/tablet/escritorio. Pendiente de Vercel Preview (protegida).
- Fichas con 7 idiomas, 4 recomendaciones, IATA y fotos con licencia comprobados por test.

## Archivos

- `lib/destinations/turkey.ts`, `lib/travelpayouts/turkey-airports.ts`
- Registro en `lib/destinations/index.ts`, `presentation.ts`, `app/page.tsx`, `app/api/travelpayouts/places/route.ts`
- `tests/turkey-destinations.test.cjs` y fixtures `pre-turkey-catalog.json`, `turkey-airport-provider.json`, `turkey-photos.json`
- Contadores actualizados (210→221 perfiles, 15→16 países) en tests anteriores.
