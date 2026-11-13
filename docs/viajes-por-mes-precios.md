# Viajes por mes con precios reales

Las páginas `/viajes-baratos/[mes]` muestran, para el mes elegido y un aeropuerto de salida de España, los vuelos
de ida y vuelta más baratos **para una escapada (2 a 5 noches)**, en dos bloques: **En España** e **Internacional**.

## Qué hace

- El selector «Salir desde» tiene 10 aeropuertos: Madrid (por defecto), Barcelona, Valencia, Sevilla, Málaga,
  Bilbao, Palma, Alicante, Tenerife (TFN/TFS) y Gran Canaria. La elección se recuerda en el navegador
  (`localStorage`, clave `destinauta.origenSalida`).
- Cada bloque tiene hasta 12 tarjetas (3 filas de 4), con el mismo diseño que las tarjetas de siempre más la
  etiqueta España/Internacional y el precio. Primero van los destinos con precio, de menor a mayor.
- Si un bloque no llega a 12 destinos con precio, se completa con fichas válidas para ese mes que salen como
  «Sin precio reciente» (con el aviso «Mira el precio al buscar el vuelo»). No se inventa ningún precio. Entre los
  «sin precio» van primero los destinos que sí tienen vuelos ese mes desde ese aeropuerto pero no de escapada
  (por ejemplo, solo de 6 o más noches).
- Solo entran fichas del catálogo que marcan ese mes en `bestMonths`, `lowSeasonMonths` o `highSeasonMonths`
  y que tienen aeropuerto verificado (`iataCodes`) y foto. **El clima no se usa para elegir destinos.**
- Si la consulta falla o no hay ningún precio, la página muestra un aviso y la lista de destinos recomendados de
  siempre (`MonthlyDestinations`, sin cambios en su diseño). Esa lista también está dentro de `<noscript>`.

## Cómo funciona

`GET /api/travelpayouts/monthly?month=1..12&origin=MAD` (`app/api/travelpayouts/monthly/route.ts`):

1. Valida el mes y que el aeropuerto esté en la lista de 10 (si no, `400`). Sin `TRAVELPAYOUTS_API_TOKEN`, `503`.
2. Consulta `prices_for_dates` de Travelpayouts (1 petición por mes de vuelta; la salida es siempre el mes pedido y
   la vuelta puede caer en el mes siguiente; hasta 3 páginas de 1000 si hacen falta). El token solo viaja en la cabecera.
3. Se queda, por destino, con el vuelo más barato de 2 a 5 noches (a igual precio, el directo y luego el más temprano).
4. Respuesta cacheada en Vercel: 2 h con precios (`s-maxage=7200`), 10 min si no hay ninguno. Los errores no se cachean.
5. `&debug=1` añade `counts` (registros del proveedor, de ese aeropuerto, de escapada reconocidos, destinos con precio y
   códigos del proveedor que no corresponden a ninguna ficha) para revisar la Preview.

Código en `lib/travelpayouts/monthly.ts` (servidor) y `lib/travelpayouts/monthly-shared.ts` (también lo usa el
navegador; no importa el catálogo). Las tarjetas llegan ya con los textos en los 7 idiomas.

## Códigos de ciudad

El proveedor usa códigos de ciudad (PAR, MIL, ROM, LON…) que ya están en `iataCodes` de las fichas. La excepción
es Tenerife (TCI), que se une a la ficha en `PROVIDER_CITY_CODES`. Cualquier otro código sin ficha aparece en
`counts.unmatchedCodes` con `?debug=1`.

## Para que funcione en la Preview

La variable `TRAVELPAYOUTS_API_TOKEN` debe estar disponible en el entorno **Preview** de Vercel. Sin ella la API
devuelve `not_configured` y la página muestra la lista de siempre.

## Pruebas

`tests/monthly-offers.test.cjs` (elección de destinos y precios, bloques, ruta de la API) y
`tests/monthly-offers-ui.test.cjs` (selector, carga, tarjetas, errores). Usan datos simulados del proveedor.

## Huella de `MonthlyDestinations.tsx`

Las pruebas de cada lote del catálogo (`tests/fixtures/pre-*-catalog.json`, campo `monthPages`) guardan la huella
(SHA-256) de `MonthlyDestinations.tsx` y `page.tsx` para detectar cambios no intencionados en las páginas de mes.
Este cambio es intencionado, así que se actualizó esa huella de `MonthlyDestinations.tsx` en los 20 archivos que la
contenían. `page.tsx` no cambia. Si se vuelve a editar `MonthlyDestinations.tsx`, hay que actualizar la huella de nuevo.
