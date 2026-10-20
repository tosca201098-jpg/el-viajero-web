# Francia: conservar las tarjetas originales y consultar fichas individuales

Base revisada: `main` en `8dd49049bc443a1bfe31ea0706256f4c74ca2e66`.
Esta rama sustituye la propuesta de la PR #9 conforme a la aclaración del usuario.
No depende de ella para fusionarse.

- Portada: conserva los 16 destacados originales, incluido París, en su orden original.
- Temporadas: conserva las 16 tarjetas originales de cada página, incluidas París,
  Valle del Loira y Borgoña. Solo desaparecen los cuatro bloques nuevos de Francia.
- Recomendaciones mensuales: se ocultan las tarjetas añadidas de Francia; las 65
  fichas anteriores de España y Portugal conservan criterios, contenido y orden.
- Descubrimiento por presupuesto: no añade tarjetas francesas automáticamente.
  No cambia la consulta de precios ni los objetos/precios ES/PT recibidos.
- No hay nuevas secciones por países. La regla para recomendaciones del catálogo
  no se aplica a las listas editoriales originales de portada y temporadas.
- El catálogo mantiene las 77 fichas, sus datos, fotografías, aeropuertos y traducciones.

## Consulta individual

El autocompletado emite una selección confirmada solo mediante clic o Enter.
Tras confirmar una ciudad francesa se ofrece «Ver destino: Lyon» (o la elegida).
Escribir o recorrer sugerencias no abre fichas. Volver a escribir invalida la
selección anterior. Se comprueba país y ciudad asociada al aeropuerto; Ginebra
no se convierte en Annecy ni Chamonix. No cambia el valor enviado al buscador.

Nombres, países y botones respetan es/en/fr/de/it/pt/ca. Se conservan los enlaces
expresos `/?ficha=...`, voz y generación manual/por voz de itinerarios.

## Validación

Las pruebas verifican los 16 destacados en siete idiomas; las listas de tarjetas
visibles de las cuatro temporadas contra una captura de referencia obtenida del
código anterior a Francia (`d0ba736`); las doce páginas mensuales en siete idiomas;
las 77 fichas conservadas y la apertura individual tras confirmación, sin apertura al escribir.
Se conservan las pruebas de vuelos exactos, flexibles, presupuesto, voz e itinerarios.
Los servicios externos se simulan, sin credenciales ni consumo de APIs de pago.

Resultados de TypeScript, lint, compilación y revisión real de Preview en la PR.
Sin cambios en los archivos canónicos, APIs, credenciales, Supabase, configuración
Vercel, rutas ni SEO. No incluye la PR #8 de Ibiza ni fusiona la PR #9 anterior.
