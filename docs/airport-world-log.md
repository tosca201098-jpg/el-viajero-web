# Registro de progreso: aeropuertos del mundo

Rama de trabajo por país, siempre en borrador, nunca a producción sin autorización.

## 2026-11-06 — Albania (1 ficha: TIA)
- Rama local: `claude/albania-airports` (basada en `main`).
- Pruebas: 389 en total; 382 pasan. Los 7 fallos son de entorno (faltan react, postcss, js-yaml) y ya fallaban antes de los cambios.
- Pendiente: push y PR en borrador (falta instalar la app de Claude en GitHub), Preview de Vercel, comprobación de TIA en el inventario de Travelpayouts, revisión visual y build.
- Siguiente país: Francia (PR #44 como base), después el resto de Europa pendiente (Bosnia, Serbia, Montenegro, Macedonia del Norte, Malta, nórdicos, Irlanda, bálticos, Rumanía, Bulgaria…).

## 2026-11-06 — Turquía, lote 1 (11 fichas)
- Rama: `claude/turkey-airports` (apilada sobre `claude/albania-airports`, PR #45).
- Pruebas: 409; 402 pasan; 7 fallos de entorno previos. Sin build ni revisión visual (Preview protegida).
- Siguiente: lote 2 de Turquía (regionales a verificar), Rusia/Bielorrusia/Ucrania (solo documentación), resto de Europa.

## 2026-11-06 — Turquía, lote 2 (12 fichas, total 23)
- Adana, Bursa, Samsun, Şanlıurfa, Mardin, Van, Erzurum, Diyarbakır, Kars, Çanakkale, Pamukkale (DNZ), Rize. Misma rama y PR #48.
- Pruebas: 409; 402 pasan; 7 fallos de entorno previos. Sin build ni revisión visual.
- Pendientes de Turquía: Hatay, Edremit, Eskişehir, Çorlu, Ordu-Giresun y pequeños regionales (ver docs/turkey-airports.md).

## 2026-11-06 — Sureste de Europa e islas (14 fichas)
- Serbia (Belgrado, Niš), Bosnia y Herzegovina (Sarajevo, Mostar, Tuzla, Banja Luka), Montenegro (Podgorica, Tivat), Macedonia del Norte (Skopie, Ohrid), Kosovo (Pristina), Malta, Chipre (Lárnaca, Pafos).
- Rama: `claude/southeast-europe-airports` (apilada sobre `claude/turkey-airports`, PR #48).
- Pruebas: 420; 413 pasan; 7 fallos de entorno previos. Sin build ni revisión visual.
- Pendiente: Kraljevo (KVO). Siguiente: Rumanía, Bulgaria, Moldavia, países nórdicos, Irlanda, bálticos, Luxemburgo y territorios.

## 2026-11-06 — Rumanía, Bulgaria y Moldavia (rama `claude/eastern-europe-airports`)

15 fichas en borrador (10 RO, 4 BG, 1 MD). Pendientes: BBU, CND, BAY, ARW, BCM, SUJ, BZY. Detalle en `docs/eastern-europe-airports.md`.

## 2026-11-06 — Dinamarca, Islandia y Finlandia (rama `claude/nordics-airports`)

15 fichas en borrador (5 DK, 2 IS, 8 FI), apiladas sobre `claude/eastern-europe-airports`. Pruebas: 442; 435 pasan; 7 fallos de entorno previos. Siguiente: Suecia y Noruega, Irlanda, bálticos, Luxemburgo y territorios.

## 2026-11-06 — Suecia y Noruega (rama `claude/scandinavia-airports`)

16 fichas en borrador (7 SE, 9 NO), apiladas sobre `claude/nordics-airports`. Bergen (Noruega) se nombra «Bergen (Noruega)» por el alias existente de Mons. Pruebas: 453; 446 pasan; 7 fallos de entorno previos. Siguiente: Irlanda, bálticos, Luxemburgo y territorios.

## 2026-11-06 — Irlanda, bálticos, Luxemburgo y territorios (rama `claude/ireland-baltics-airports`)

17 fichas en borrador (5 IE, 1 EE, 1 LV, 3 LT, 1 LU, 6 territorios), apiladas sobre `claude/scandinavia-airports`. Pruebas: 464; 457 pasan; 7 fallos de entorno previos. Siguiente: completar países parciales (Reino Unido, Italia, Alemania, auditorías de España, Portugal, Polonia, Grecia, Croacia y Eslovenia) y pendientes de Francia y Turquía.

## 2026-11-06 — Croacia y Eslovenia (rama `claude/croatia-slovenia-airports`)

7 fichas en borrador (6 HR, 1 SI), apiladas sobre `claude/ireland-baltics-airports`. Pruebas: 475; 468 pasan; 7 fallos de entorno previos. Siguiente: Grecia (sin Santorini, que es tarjeta original), luego Reino Unido, Italia, Alemania y auditorías.
