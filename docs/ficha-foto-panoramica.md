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

## Fase 2: encuadre de las fotografías

Con el marco panorámico, las fotos poco apaisadas (verticales o casi cuadradas) enseñan solo una franja
horizontal; por defecto se centra (50 %) y a veces se corta lo reconocible (torre, cúpula, rascacielos,
castillo, villas sobre el agua). La Fase 2 solo cambia **qué franja de la foto se ve en la ventana de ficha**
(`object-position` vertical, valores `center N%`, 0 % = parte alta, 100 % = parte baja). Los valores se
eligieron uno por uno mirando la foto real en el marco panorámico, y se prefirió el cambio mínimo que deja
visible lo importante (por eso París y Nueva York usan 35 %, no 10 %).

- `lib/destinations/image-framing.ts` (archivo nuevo, sin dependencias):
  - `imageFraming`: 102 destinos del catálogo por `id` (incluida París, `fr-paris` = 35 %).
  - `featuredImageFraming`: los 8 destinos originales que no están en el catálogo, por URL de la foto
    (Nueva York 35 %, Bali 30 %, Maldivas 45 %, Dubái 30 %, Suiza 40 %, Tailandia 30 %, Sídney 30 %, Río de Janeiro 40 %).
  - `panoramicImagePosition(destination)`: devuelve la posición propia si el destino ya la tenía; si no, la de la
    tabla por `id`; si no, la de la tabla por URL de foto; si no, nada (foto centrada como siempre).
- `app/page.tsx`: la foto de la ventana de ficha usa `panoramicImagePosition(...)` en lugar de
  `imagePosition` a secas (una línea y su `import`).
- **No se modifica ningún dato**: los archivos de destinos (`featured.ts`, catálogo, fotos, créditos, textos) quedan
  byte a byte iguales, así que las pruebas históricas de "perfiles idénticos" siguen valiendo.
- Las tarjetas de la portada no leen este valor. Tokio, Roma, Londres, Santorini, Islandia, Barcelona y El Cairo
  siguen centrados.
- Se respetan los 17 destinos que ya tenían posición propia (p. ej. `center top`).
- No se tocan las 86 fotos que sustituye la PR #63 (en esa PR habrá que revisar su encuadre cuando se fusione).
- `DestinationProfileSummary` (miniaturas y resumen de `/destinos/*`) no cambia.

### Pruebas de la Fase 2

- `tests/destination-photo-framing.test.cjs` (7 pruebas): formato `center N%`; cada id existe y no tenía posición
  propia; ningún dato cambia (las posiciones del dato son exactamente las que ya existían, antes de la Fase 2);
  los 16 originales (nombres, orden, fotos) con el encuadre previsto y los otros siete sin cambio; la portada no
  usa encuadre; la ventana de ficha pasa el valor a la foto en 7 idiomas y en todo el catálogo encuadrado;
  prioridad posición propia > id > URL.
- Las pruebas de la Fase 1 ignoran únicamente el valor `objectPosition` de la foto al comparar con la versión
  anterior (`tests/fixtures/ficha-baseline-before-photo-frame.json`, regenerada desde `integration/europe`
  limpio): cualquier otro cambio en portada o fichas (texto, foto, enlaces, clases) hace fallar la prueba.
- `tests/fixtures/ficha-image-positions-before-framing.json`: posiciones que ya existían antes de la Fase 2.
