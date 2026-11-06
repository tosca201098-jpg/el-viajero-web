# Albania: aeropuertos y fichas

Estado: borrador (`publication.status = 'draft'`). No aparece en portada, ni en sitemap, ni en recomendaciones automáticas. Solo se llega a ella con selección explícita (buscador).

## Aeropuertos

| Código | Aeropuerto | Ficha | Decisión |
|---|---|---|---|
| TIA | Tirana — Nënë Tereza (Rinas) | `al-tirana` | Incluido. Único aeropuerto de Albania con servicio regular de pasajeros conocido. |
| KFZ | Kukës | — | Excluido: sin servicio regular verificado. |
| VLO | Vlorë | — | Excluido: sin operación verificada. |

Pendiente de verificar antes de publicar: comprobar en el inventario de Travelpayouts (`iata_type=airport`, `flightable=true`) que TIA figura como volable. Desde el entorno de desarrollo no se pudo acceder a ese inventario. No se ha inventado ningún dato de rutas, precios ni disponibilidad.

## Foto

Plaza de Skanderbeg, Tirana. Autor: Pudelek. Licencia CC BY-SA 4.0.
Origen: https://commons.wikimedia.org/wiki/File:Tirana_-_Skanderbeg_Square_(Sheshi_Sk%C3%ABnderbej)_-_by_Pudelek.jpg

## Archivos

- `lib/destinations/albania.ts`
- `lib/travelpayouts/albania-airports.ts`
- Registro en `lib/destinations/index.ts`, `presentation.ts`, `app/page.tsx`, `app/api/travelpayouts/places/route.ts`
- `tests/albania-destinations.test.cjs` y `tests/fixtures/pre-albania-catalog.json`
