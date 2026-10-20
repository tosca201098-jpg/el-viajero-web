# Francia: consulta expresa, sin tarjetas automáticas

Base: `main` en `8dd49049bc443a1bfe31ea0706256f4c74ca2e66`.

La política de presentación de `lib/destinations/presentation.ts` excluye Francia
de las tarjetas automáticas. No filtra ni modifica el catálogo canónico, sus
77 fichas, los datos estacionales ni las consultas a proveedores.

- Portada: 15 destacados, sin la tarjeta automática de París. Su referencia
  canónica se conserva en los datos existentes, disponible para consulta expresa.
- Temporadas: se eliminan los cuatro bloques nuevos de Francia y se ocultan las
  tarjetas editoriales anteriores de París, Valle del Loira y Borgoña. Se conserva
  todo su contenido en los datos; las tarjetas de España y Portugal no cambian.
- Meses: solo se filtra la presentación de las tarjetas francesas. Las funciones
  de recomendaciones siguen devolviendo las mismas fichas y datos estacionales.
- Descubrimiento por presupuesto: las tarjetas francesas también se ocultan en
  la interfaz; no cambian la consulta de precios, el presupuesto ni la afiliación.

## Selección individual

El autocompletado mantenía la selección como texto del formulario y no emitía un
evento diferenciado de confirmación. Ahora dispone de un callback opcional
`onSelect`, que se ejecuta después de pulsar una sugerencia o confirmarla con
Enter. Escribir, enfocar el campo o recorrer opciones con flechas no lo ejecuta.
Se conserva el mismo valor de ciudad enviado al buscador de vuelos.

Tras confirmar una ciudad francesa, aparece «Ver destino: Lyon» (o la ciudad
seleccionada) junto al campo. Solo ese botón abre la ficha. Escribir de nuevo
invalida la elección; cambiar el valor del formulario tampoco deja una ficha
anterior disponible. La resolución comprueba el país y diferencia aeropuerto
físico de ciudad asociada. Ginebra no se convierte en Annecy ni en Chamonix.

El selector «Consulta un destino» permite consultar cualquiera de las 77 fichas,
incluidos los doce destinos franceses y los que requieren traslado terrestre.
Elegir una opción no abre un modal: hay que pulsar «Ver destino». No rellena ni
envía el formulario de vuelos. Los nombres y países se muestran en el idioma
seleccionado (es/en/fr/de/it/pt/ca), con IDs estables y la misma ficha canónica.

Los enlaces expresos `/?ficha=...`, la voz, los itinerarios y los resultados de
una búsqueda de vuelos con destino concreto conservan su funcionamiento.
Las APIs de vuelos, OpenAI, Supabase, credenciales y Vercel no cambian. Esta rama
no incorpora la PR #8 de la fotografía de Ibiza, que aún es independiente.

Las pruebas cubren render real con React/DOM simulados, las doce páginas mensuales
en siete idiomas, conservación de ES/PT, selección individual, escritura,
confirmación, teclado y fichas canónicas. La validación en navegador y el estado
de la Preview se documentan en la PR; las simulaciones no consumen servicios reales.

Validación local: 141 pruebas correctas, TypeScript y lint sin errores (avisos
previos), compilación de producción con 27 páginas. La incidencia local `EPERM`
de Windows se resolvió creando directorios temporales en `.next`, sin cambiar la
configuración. Los archivos canónicos de España, Portugal y Francia, las APIs y
los módulos de voz/Supabase permanecen sin modificaciones.
