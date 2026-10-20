# Relevancia del autocompletado

Base: `main` en `4a6595b5fbe0b1e1495cb7fdff234157cbdf09d4`, tras la fusión
de Francia. La corrección afecta únicamente al endpoint de sugerencias y sus
pruebas; no cambia el resolutor de vuelos ni las consultas de precios.

El proveedor público devuelve Lyon como primer resultado para `lyon`, pero el
orden anterior priorizaba ciudades y popularidad, colocando Palma, Colonia,
Tel Aviv y Ciudad Ho Chi Minh por delante de Lyon. Se corrige antes de deduplicar
y limitar a seis sugerencias, sin reglas especiales para Francia o el catálogo.

Orden de relevancia:

1. Código IATA propio exacto (físico o metropolitano).
2. Nombre exacto normalizado.
3. Nombre que empieza por la consulta.
4. Coincidencia al principio de una palabra y después en cualquier posición.
5. Resultados aproximados del proveedor como alternativa final.

En cada nivel, el nombre mostrado prima sobre un alias del proveedor y sobre la
ciudad asociada a un aeropuerto. Se mantiene la preferencia anterior por ciudades
y el peso del proveedor únicamente para desempatar relevancia equivalente.
La normalización elimina tildes, ignora mayúsculas y compacta espacios; no cambia
los nombres mostrados. Los códigos válidos se conservan en mayúsculas. Se evita
repetir un mismo código en un país, manteniendo separados PAR/CDG/ORY/BVA y
destinos homónimos de países distintos. Una búsqueda IATA exacta no se sustituye
por un aeropuerto que solo tenga ese código como ciudad asociada.

No cambia el componente cliente: teclado, selección, portal y posicionamiento
móvil mantienen su comportamiento. Seleccionar un aeropuerto sigue trasladando
su ciudad al buscador de precios, como antes; esta corrección no introduce una
búsqueda de precios por aeropuerto físico. No cambia la configuración de los
siete idiomas ni el idioma español que ya usaba la consulta al proveedor.

`tests/fixtures/autocomplete-places.json` conserva únicamente campos públicos
relevantes de ocho respuestas reales obtenidas el 20 de octubre de 2026, sin
token: lyon, marsella, paris, LYS, CDG, ORY, BVA y MRS. Las pruebas del endpoint
reproducen esas respuestas sin red y añaden escenarios internacionales,
normalización, homónimos, empates, errores y validación. Las respuestas reales
futuras del proveedor pueden variar; el endpoint solo puede ordenar los lugares
que Travelpayouts devuelve, no inventa resultados ausentes ni disponibilidades.

Validación local: 132 pruebas correctas (114 anteriores, 16 del endpoint y 2 de
interacción con React/DOM simulados), TypeScript correcto, lint sin errores con
avisos previos y compilación de producción con 27 páginas. Windows requirió
precrear directorios temporales bajo `.next` tras un `EPERM`; no se cambió la
configuración. El resultado de la Preview y la comprobación en navegador se
documentan en la PR. No se utilizan credenciales ni servicios de pago en estas
pruebas.
