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

## 2026-11-06 — Reino Unido: aeropuertos pendientes (rama `claude/uk-airports-gaps`)

20 fichas en borrador para los aeropuertos verificados de GB que no tenían ficha; los 38 quedan cubiertos. Apiladas sobre `claude/ireland-baltics-airports` (#54) tras cerrar la #55 por duplicar a Codex (Croacia/Eslovenia). Pruebas: 475; 468 pasan; 7 fallos de entorno previos. Siguiente: Italia (24 aeropuertos), Alemania (12), auditorías de otros países.

## 2026-11-06 — Italia: aeropuertos pendientes (rama `claude/italy-airports-gaps`)

24 fichas en borrador; los 40 aeropuertos italianos verificados quedan cubiertos. Apilada sobre `claude/uk-airports-gaps` (#56). Pruebas: 486; 479 pasan; 7 fallos de entorno previos. Siguiente: Alemania (12 aeropuertos), auditorías de otros países.

## 2026-11-06 — Alemania: aeropuertos pendientes (rama `claude/germany-airports-gaps`)

12 fichas en borrador; los 27 aeropuertos alemanes verificados quedan cubiertos. Apilada sobre `claude/italy-airports-gaps` (#57). Pruebas: 497; 490 pasan; 7 fallos de entorno previos. Siguiente: auditoría de España, Portugal, Francia, Polonia y demás países con fichas existentes.

## 2026-11-06 — Europa regional: Polonia, Irlanda, Noruega y Suecia (rama `claude/europe-regional-gaps`)

10 fichas en borrador (RZE, CFN, ALF, KRS, HAU, MOL, KSU, EVE, LKN, UME) con servicio regular verificado. Apilada sobre `claude/germany-airports-gaps` (#58). Croacia, Eslovenia y Grecia se dejan al trabajo de Codex. Pruebas: 508; 501 pasan; 7 fallos de entorno previos. Siguiente: Francia (comparar con #44 y #47), resto de Noruega/Suecia/Finlandia/Dinamarca/Islandia y Rumanía tras verificar servicio.

## 2026-11-06 — Nórdicos regional: Noruega, Finlandia e Islandia (rama `claude/nordic-regional-gaps`)

10 fichas en borrador (TRF, JOE, JYV, KAJ, KEM, KOK, POR, SVL, EGS, IFJ). Apilada sobre `claude/europe-regional-gaps` (#59). Francia revisada: ya cubierta por Codex #44 y #47 (48 fichas). Pendientes: LYR (requiere país SJ), HFN (no reservable), VAA, KUO, resto de Noruega/Suecia/Dinamarca, Rumanía, Turquía menor.

## 2026-11-06 — Noruega y Suecia, tercer lote (rama `claude/scandinavia-regional-gaps`)

7 fichas en borrador (NYO, KLR, GEV, HVG, HFT, BDU, SOG). Apilada sobre `claude/nordic-regional-gaps` (#60). Pruebas: 530; 523 pasan; 7 fallos de entorno previos. Pendientes: resto de aeropuertos pequeños de Noruega y Suecia tras verificar servicio, Dinamarca, Rumanía, Turquía menor, LYR (país SJ).
