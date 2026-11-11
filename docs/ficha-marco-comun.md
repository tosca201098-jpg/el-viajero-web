# Ficha de destino: marco común del diseño Oslo (Fase 3, PR 3A)

## Qué cambia

1. **Las clases del diseño Oslo salen de `app/page.tsx` y pasan a un archivo compartido**:
   `app/components/destination-window-style.ts`. Contiene el fondo oscuro, el marco de la ventana, la foto
   panorámica, el botón de cerrar, el bloque del título, el cuerpo (descripción, recomendaciones,
   estancia recomendada) y los botones de acción. Más adelante (PR 3B) las ventanas de las páginas de
   temporadas usarán estas mismas clases, de modo que todas las fichas se vean igual.
   - El archivo **tiene que estar dentro de `/app`**: Tailwind solo busca clases ahí
     (`tailwind.config.ts`). Si se moviera a `/lib`, los estilos dejarían de generarse.
2. **La cabecera de la ventana** (foto, degradado, cierre, país y nombre) se pinta con una función,
   `destinationWindowHeader()` en `app/components/destination-window-header.tsx`. Es una función normal y
   no un componente con estado, para que los elementos salgan exactamente igual que antes y las pruebas
   existentes sigan viéndolos.
3. **Banderas**: `lib/destinations/country-flags.ts` es una tabla de países con bandera. Si el código de
   país no está en la tabla, no se muestra bandera. Se acabó la bandera francesa "por defecto" en la
   ventana de ficha (Francia está en la tabla como cualquier otro país).
4. **Botón "Vuelo + hotel"** (`✈️🏨 Buscar Vuelo + Hotel`, siete idiomas con la clave existente
   `search.findPackage`) como tercer botón de la ventana. Sale en las mismas fichas y con la misma
   condición que el botón de vuelos. Al pulsarlo llama a `abrirPaquete(nombre)`, la función que ya usaba
   el asistente de voz: abre la ventana "Vuelo + Hotel" con el destino rellenado. No se ha tocado esa
   función ni sus mensajes.

## Qué NO cambia

- Textos, fotografías, recomendaciones, enlaces, vuelos, hoteles, itinerarios, voz y guardado.
- Las 16 tarjetas originales de la portada, los datos de los destinos y las fotografías.
- Las páginas de temporadas, los resúmenes del buscador, las tarjetas mensuales y `/destinos/*`.

## Cómo se comprueba

`tests/destination-window-common-frame.test.cjs` compara la portada y la ventana de las 16 tarjetas
originales y de los 486 perfiles del catálogo en los siete idiomas (3.514 ventanas) con las huellas de
`tests/fixtures/ficha-baseline-before-common-frame.json`, generadas con la rama de la PR #64 antes de
tocar nada. Lo único que se descarta de la comparación es el botón nuevo. También comprueba el botón
(presente donde hay vuelos, texto en cada idioma, orden, que abre el formulario existente), que
`abrirPaquete` no ha cambiado y que la ventana no tiene bandera por defecto.
