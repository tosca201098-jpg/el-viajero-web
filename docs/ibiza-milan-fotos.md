# Fotos de Ibiza y Milán

Estado: **borrador (Pull Request abierta, sin fusionar)**. Fecha de comprobación de las fotos: 15-11-2026.

## Qué cambia

Por decisión del propietario («Ibiza y Milán puedes cambiar, Asturias deja la actual»), dos fichas del catálogo cambian su fotografía. Las propuestas venían de las PR antiguas #8 (Ibiza) y #13 (Milán), que estaban 144–151 commits por detrás de `main` y chocaban con ella; aquí se reconstruyen sobre la versión actual de `main`.

| Ficha | Foto anterior | Foto nueva | Encuadre en la ventana de la ficha |
|---|---|---|---|
| Ibiza (`es-ibiza`) | Dalt Vila desde un avión, de UnFUG-Fabi (Wikimedia Commons, CC BY-SA 4.0) | Dalt Vila vista desde el mar, de [RoxFuchs](https://commons.wikimedia.org/wiki/File:Dalt_Vila_20160421_111948.jpg) (Wikimedia Commons, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)) | `center 25%` |
| Milán (`it-milan`) | Duomo desde la Galleria, de Andrea Albini (Wikimedia Commons, CC BY-SA 3.0) | Duomo al atardecer, de [Fernando Meloni](https://unsplash.com/photos/pAbn-kRJfxw) (Unsplash, [Unsplash License](https://unsplash.com/license)) | `center 55%` |

En cada ficha cambian solo la foto, su crédito (autor, página de origen, licencia y enlace a la licencia) y el encuadre vertical. Textos en los siete idiomas, aeropuertos, meses, recomendaciones y el resto de datos no cambian: una prueba lo comprueba con una huella de todos los demás campos y con el orden de los campos.

## Qué NO cambia

- **Asturias** (PR #14) conserva su foto actual de Wikimedia Commons (Lagos de Covadonga, JavierOlivares, CC BY-SA 4.0). La PR #14 proponía una imagen generada por inteligencia artificial y no se usa.
- Las 16 tarjetas de la portada, las páginas de temporadas, los destinos existentes, los siete idiomas, los buscadores, la voz y la IA, Supabase y las integraciones de viajes.
- No se añaden créditos nuevos en otras páginas: el crédito se muestra en la ventana de la ficha, igual que en las demás fichas.

## Cómo se comprobó cada foto

- **Milán**: se abrió la página de la foto en Unsplash (`pAbn-kRJfxw`): «Catedral de Milán, Italia», autor Fernando Meloni, lugar «Milano, Milão, Itália», «Uso gratuito bajo la Licencia Unsplash» (no es Unsplash+). La dirección de la imagen sigue el mismo formato que las demás fotos de Unsplash del catálogo (`?auto=format&fit=crop&w=1600&q=80`, 1600 × 1068 px).
- **Ibiza**: se abrió la página del archivo en Wikimedia Commons: autor RoxFuchs, «Own work», licencia Creative Commons Attribution-Share Alike 4.0, original de 3264 × 1836 px. La web usa una copia de 1280 × 720 px (247 KB) guardada en `public/images/ibiza-dalt-vila-roxfuchs.jpg`, redimensionada sin otros retoques, tal como proponía la PR #8; se conservan el autor, la página de origen y el enlace a la licencia en la ficha, como exige CC BY-SA.
- **Encuadre**: se probó cada foto dentro del marco panorámico de la ficha (escritorio y móvil) para que se vean el casco antiguo de Ibiza con el barco y las agujas completas del Duomo.

## Pruebas

- Prueba nueva: `tests/ibiza-milan-photos.test.cjs` (7 pruebas), con los datos de referencia en `tests/fixtures/ibiza-milan-photos.json` y el estado anterior en `tests/fixtures/ibiza-milan-photos-before.json`.
- Pruebas antiguas adaptadas sin borrar ninguna: la de Italia (`tests/italy-destinations.test.cjs`) reconoce la foto de Unsplash de Milán; las huellas de referencia (`destination-legacy-digests.json`, `ficha-baseline-before-*.json`, `pre-*.json`) se actualizan solo para `es-ibiza` e `it-milan`.

## Pendiente

Las PR antiguas #8, #13 y #14 siguen abiertas hasta que el propietario decida cerrarlas; esta PR no fusiona ni cierra nada.
