# Hoteles con Stay22 (revisión 24-10-2026)

## Comprobación previa

- [Maps](https://dev.stay22.com/docs/maps): iframe dinámico sin dependencia de API ni backend.
- [Quick Start](https://dev.stay22.com/docs/maps/quick-start): distingue el constructor de Hub para un mapa puntual de la generación programática; las fechas permiten precios y disponibilidad en los marcadores.
- [Parámetros](https://dev.stay22.com/docs/maps/parameters): `address` admite destino o lugar codificado; `lat`/`lng` tienen prioridad si se proporcionan. Fechas ISO, `adults`, `children`, `infants`, `rooms` (predeterminado 1), moneda ISO y `ljs` para idioma. `priceper` admite `nightly` y `total`. El AID es público; `campaign` identifica esta integración.
- [Widescale](https://dev.stay22.com/docs/maps/widescale): construcción programática de iframes `/embed/gm`.
- [Producto Maps](https://www.stay22.com/map): iframe gratuito, modelo de ingresos por reservas.

La captura recuperada del chat confirma el mapa Hub `6add097e528793ff55961e8b` y el AID `destinauta`. No se ha confirmado un contrato para cambiar de ciudad el mapa guardado mediante parámetros. Esta implementación utiliza el endpoint documentado `/embed/gm`, no ese identificador. No cambia configuraciones del Hub, no utiliza Direct Travel API ni claves privadas.

## Comportamiento

Un único destino local `/hoteles` recibe la búsqueda general y las fichas. Las fichas sin estancia válida abren el formulario sin iframe. La portada llama al mismo constructor de URL. Los destinos de catálogo se resuelven a ciudad y país, nunca al aeropuerto de acceso. Los nombres libres también se aceptan y Stay22 realiza la geocodificación.

Las fechas/ocupantes de vuelo se sugieren únicamente desde el contexto de la misma ficha, con fechas completas válidas y recuento entero de adultos; las búsquedas flexibles no se copian como estancia exacta. Se avisa de revisar la entrada según la llegada real, especialmente tras vuelos nocturnos. Un formulario previo de hoteles válido para la misma ciudad tiene prioridad.

La búsqueda permite adultos, niños, bebés, habitaciones y seis monedas. La interfaz limita a 10 por grupo y 5 habitaciones, con al menos un adulto por habitación; son decisiones de interfaz, no límites atribuidos a Stay22. Fechas hasta dos años. Se deben confirmar las edades de menores y las condiciones del precio en el proveedor; Maps no documenta aquí edades ni asignación de huéspedes por habitación.

La página conserva los siete idiomas. Stay22 documenta seis de ellos; catalán utiliza español en el iframe con aviso visible. Los controles duplicados de destino, fechas, ocupación, idioma y moneda se ocultan en el mapa. Los cambios del formulario solo actualizan el mapa al enviar; el resumen visible identifica la búsqueda mostrada. La URL conserva los valores para compartir y recargar.

Los hoteles, precios, disponibilidad, fichas y enlaces pertenecen al iframe de Stay22. No se generan datos de muestra ni se almacenan resultados. El AID se envía como `destinauta`; esto no prueba una comisión abonada ni valida contablemente la atribución. Se requiere revisión del propietario antes de fusionar/publicar.

## Comprobación de proveedor

Se consultó el iframe oficial para Barcelona, España, 20–23 de noviembre de 2026, dos adultos, una habitación, EUR y español. Se observaron marcadores con importes y fichas con la leyenda de tres noches y total. No se efectuaron compras ni reservas. Los importes varían y no constituyen una cotización garantizada ni una auditoría de impuestos. No se han probado todos los destinos ni todas las combinaciones de ocupación.

## Validación local

`node --require ./scripts/maintenance/network-guard.cjs --test tests/*.test.cjs`

`node node_modules/typescript/bin/tsc --noEmit`

`npm run lint`

`npm run build`

Las pruebas de hoteles cubren el contrato de URL, codificación, cambios de ciudad, validación de fechas y ocupación, fallback catalán, sugerencias de vuelo, resolución de ciudad y ausencia de iframe ante entradas incompletas/inválidas. Las interacciones visuales solo deben consultar búsquedas y detalles gratuitos.

Resultado: 347/347 pruebas, TypeScript, lint y build correctos. Lint conserva avisos anteriores sobre imágenes. Se probaron vistas de 1440×1000 y 390×844 sin desbordamiento horizontal. Se comprobó en navegador el envío de la portada a `/hoteles`, la ficha original de Barcelona sin fechas (sin iframe), el cambio Barcelona→París con cuatro adultos/dos habitaciones, el aviso de cambios pendientes, el mapa móvil de París y los siete idiomas. El navegador recibió marcadores de Stay22; no se contrastaron importes finales en una reserva ni comisiones en el Hub.

Los enlaces antiguos de las páginas estacionales continúan funcionando mediante redirección desde la portada, sin modificar sus páginas editoriales. La ficha de resultados de vuelo también enlaza a este buscador con su contexto validado. Los iframes pueden incluir hoteles y otros alojamientos según el inventario de Stay22; no se promete un inventario exclusivamente hotelero.
