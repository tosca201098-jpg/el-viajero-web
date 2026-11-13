# Albania: aeropuertos y fichas

Estado: borrador (`publication.status = 'draft'`). No aparece en portada, ni en sitemap, ni en recomendaciones automáticas. Solo se llega a ella con selección explícita (buscador).

## Aeropuertos

| Código | Aeropuerto | Ficha | Decisión |
|---|---|---|---|
| TIA | Tirana — Nënë Tereza (Rinas) | `al-tirana` | Incluido. Único aeropuerto de Albania con servicio regular de pasajeros conocido. |
| KFZ | Kukës | — | Excluido: sin servicio regular verificado. |
| VLO | Vlorë | — | Excluido: sin operación verificada. |

Verificado el 6/11/2026 en el inventario de Travelpayouts: TIA figura como `airport` y `flightable=true`. KFZ también figura como volable en el proveedor; queda pendiente de revisar si tiene servicio regular antes de incorporarlo. VLO figura como no volable. No se ha inventado ningún dato de rutas, precios ni disponibilidad.

## Foto

Plaza de Skanderbeg, Tirana. Autor: Pudelek. Licencia CC BY-SA 4.0.
Origen: https://commons.wikimedia.org/wiki/File:Tirana_-_Skanderbeg_Square_(Sheshi_Sk%C3%ABnderbej)_-_by_Pudelek.jpg

## Archivos

- `lib/destinations/albania.ts`
- `lib/travelpayouts/albania-airports.ts`
- Registro en `lib/destinations/index.ts`, `presentation.ts`, `app/page.tsx`, `app/api/travelpayouts/places/route.ts`
- `tests/albania-destinations.test.cjs` y `tests/fixtures/pre-albania-catalog.json`
