# Ficha de destino: marco panorámico de la fotografía (Fase 1)

## Qué cambia

La ventana de ficha de destino de `app/page.tsx` (la que abren la portada, el buscador y `?ficha=`)
usa ahora el mismo marco panorámico de fotografía que la ventana de las páginas de temporadas:

| | Antes | Ahora |
|---|---|---|
| Móvil (< 640 px) | `h-72` (288 px) | `max-sm:h-[140px]` (140 px) |
| 640–767 px | `h-72` | `sm:h-72` (288 px) |
| Escritorio (≥ 768 px) | `md:h-96` (384 px) | `sm:h-72` (288 px) |

La imagen sigue siendo `h-full w-full object-cover` con el mismo degradado, y respeta `imagePosition`
cuando un destino lo define. El marco lleva el atributo `data-destination-photo-frame="panoramic"`
para poder comprobarlo en pruebas.

El título sigue abajo a la izquierda con el tamaño de siempre (`text-4xl md:text-5xl`). Para que los
nombres largos no se corten ni tapen el botón de cerrar:

- El bloque del título deja un margen a la derecha (`right-20`, `max-sm:right-[4.75rem]`) y baja un poco en móvil (`max-sm:bottom-3`).
- El título admite saltos de línea (`break-words`).
- Solo en móvil, los nombres de más de 12 caracteres usan `max-sm:text-2xl` y los de más de 24 `max-sm:text-xl`.
  Desde 640 px el tamaño es el de siempre.

## Qué NO cambia

- La cuadrícula de las 16 tarjetas de la portada (contenido, orden, fotografías, enlaces, distribución).
- Nombres, textos, destinos, fotografías, créditos y enlaces.
- Botón de cerrar, bandera, recomendaciones, época, aeropuertos, itinerario, vuelos, voz y guardado.
- Las páginas de temporadas, el resumen de vuelos, los destinos mensuales y `/destinos/*` (fases posteriores).

## Pruebas

`tests/destination-photo-frame.test.cjs` compara con una "foto fija" de la versión anterior
(`tests/fixtures/ficha-baseline-before-photo-frame.json`, generada desde `integration/europe` antes del cambio):

1. La portada (todos los idiomas) es idéntica, incluidas las 16 tarjetas.
2. La ventana de ficha de los 16 destinos originales (7 idiomas) es idéntica salvo el marco y el bloque del título.
3. Lo mismo para los 486 destinos del catálogo (es y en).
4. Todos los destinos usan el marco panorámico y conservan foto, posición, título y botón de cerrar.
5. El título solo se reduce en móvil y solo para nombres largos.

`tests/helpers/ficha-snapshots.cjs` contiene el renderizado y la normalización usados por la prueba.
