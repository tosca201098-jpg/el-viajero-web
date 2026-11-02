# Grecia: doce fichas por selección expresa

Preparación: 2 de noviembre de 2026. Base: main `bbf31cbc9b560151cf2301bb7bed81b6f0f25c41`.

## Alcance

Doce fichas nuevas, con el modelo compartido de los bloques anteriores: fotografía con atribución, descripción, cuatro recomendaciones, estancia orientativa, estacionalidad y textos en español, inglés, francés, alemán, italiano, portugués y catalán. Reutilizan el diseño, los vuelos, los hoteles y el planificador existentes. Los nombres propios pueden mantenerse entre idiomas; los rótulos descriptivos se traducen.

| Ficha | Slug / ID sin prefijo gr- | Aeropuerto de llegada |
| --- | --- | --- |
| Atenas | athens | ATH |
| Tesalónica | thessaloniki | SKG |
| Heraclión | heraklion | HER |
| La Canea | chania | CHQ |
| Rodas | rhodes | RHO |
| Corfú | corfu | CFU |
| Kos | kos | KGS |
| Santorini | santorini | JTR |
| Miconos | mykonos | JMK |
| Zante | zakynthos | ZTH |
| Cefalonia | kefalonia | EFL |
| Scíathos | skiathos | JSI |

Heraclión y La Canea representan destinos distintos dentro de Creta, no dos fichas completas de toda la isla. Las demás fichas insulares representan la isla; las poblaciones y lugares propuestos son recomendaciones de esa ficha.

Este bloque sigue la selección editorial de doce destinos utilizada en las ampliaciones anteriores. **No es un inventario completo de todos los aeropuertos de Grecia**, ni declara acabada la cobertura mundial. La rama contiene 221 perfiles de 15 países: los 209 de main más estos doce. Croacia sigue exclusivamente en su PR #36; no se incorpora ni se vuelve a crear aquí. Esta PR es independiente de Sofía, PR #38.

## Visibilidad: solo cuando se pide el destino

- Las doce fichas son `draft` y el filtro de presentación excluye GR/Grecia de las recomendaciones automáticas.
- No se añaden tarjetas a la portada ni se sustituye la tarjeta editorial original de Santorini.
- Se conservan íntegros los datos de las 16 tarjetas originales, las temporadas y las páginas mensuales.
- Escribir por sí solo no abre una ficha. Al confirmar la sugerencia del buscador se ofrece «Ver destino»; pulsarlo abre la ficha elegida.
- Se conserva el acceso directo existente, por ejemplo `/?ficha=Atenas` y `/?ficha=Cefalonia`, como petición expresa. No se publican rutas `/destinos/...` nuevas ni entradas de sitemap.
- Las búsquedas exactas pueden mostrar la ficha correspondiente al destino solicitado junto a los resultados existentes de vuelos.

Los datos forman parte del código del sitio cuando se despliega esta rama. «Solo por selección» describe su presentación, no una barrera de privacidad ni contenido secreto.

## Aeropuertos y transporte

Los doce códigos identifican aeropuertos físicos de llegada. No se inventan códigos de parques ni se asume que el aeropuerto está en el centro turístico. Las notas traducidas recuerdan prever el traslado terrestre hasta el alojamiento. No se prometen conexiones, horarios, plazas, precios ni traslados incluidos.

Fuentes primarias consultadas:

- [HCAA: plan estatal de aviación 2024, tabla de aeropuertos e identificadores](https://hcaa.gov.gr/sites/default/files/documents/2024-greeceactionplan.pdf). Se utiliza para códigos, no para horarios actuales.
- [HCAA: operadores de aeropuertos comerciales](https://hcaa.gov.gr/en/foreis-leitoyrgias-aerodromion).
- [Fraport Greece: red de aeropuertos](https://www.fraport-greece.com/en/airport-profiles.html).
- [Athens International Airport](https://www.aia.gr/en).

Se amplían los datos del autocompletado de lugares, conservando su llamada gratuita y su rechazo seguro ante fallo del proveedor. Las sugerencias locales permiten los nombres en los siete idiomas, alias y búsquedas de IATA después de una respuesta válida del proveedor, incluso vacía. No se cambia la resolución de precios ni las consultas de vuelos. Las pruebas utilizan respuestas simuladas; no se han consultado tarifas ni autenticado proveedores para este bloque.

## Contenido turístico

Textos breves de redacción propia, contrastados con el organismo turístico oficial. Meses y duración son orientación editorial, no garantías climáticas o de ahorro. No se copian precios ni horarios de entradas.

- Atenas: [Acrópolis](https://www.visitgreece.gr/en/experiences/culture/archaeological-sites-monuments/acropolis-of-Athens), [barrios históricos](https://www.visitgreece.gr/inspirations/neighbourhoods-around-the-acropolis-hill/).
- [Tesalónica](https://www.visitgreece.gr/en/mainland/Mac%C3%A9doine/thessaloniki).
- Heraclión: [Knossos y Museo Arqueológico](https://www.visitgreece.gr/en/experiences/culture/archaeological-sites-monuments/the-palace-of-knossos), [ciudad y puerto](https://www.visitgreece.gr/en/islands/Cr%C3%A8te/irakleio).
- [Puerto histórico de La Canea](https://www.visitgreece.gr/en/inspirations/the-old-port-area-of-chania).
- [Rodas y Kos: patrimonio y poblaciones](https://www.visitgreece.gr/en/islands/dodecanese).
- [Corfú: patrimonio y lugares de la isla](https://archivecollections.visitgreece.gr/entities/multimedia/a83b54ac-ac00-4335-9cf2-fa8cedaca545).
- [Santorini: Oia, Fira, Akrotiri y Emporio](https://www.visitgreece.gr/en/experiences/culture/archaeological-sites-monuments/archaeological-sites-of-santorini).
- [Miconos](https://www.visitgreece.gr/en/experiences/leisure/nightlife/mykonos-nightlife).
- [Zante: capital y Bochali](https://www.visitgreece.gr/en/experiences/leisure/shopping/zakynthos-town).
- [Cefalonia](https://www.visitgreece.gr/en/mainland/islands/kefalonia).
- Scíathos: [isla](https://www.visitgreece.gr/en/islands/Sporades/skiathos), [patrimonio y Koukounaries](https://www.visitgreece.gr/en/islands/Sporades).

## Fotografías

`greece-images.ts` conserva las doce miniaturas de Commons, su página de archivo, autor y licencia. Se revisaron las páginas originales y declaraciones de reutilización. La cabecera compartida puede recortar la imagen mediante `object-cover`, sin editar el original. No se modifican las fotos anteriores.

| Destino | Archivo de Commons | Autor | Licencia |
| --- | --- | --- | --- |
| Atenas | View_of_Athen's_Acropolis.jpg | Davide Aversa | CC BY-SA 4.0 |
| Tesalónica | White_Tower_of_Thessaloniki_by_Joy_of_Museums_-_6.jpg | Joyofmuseums | CC BY-SA 4.0 |
| Heraclión | Koules_Fortress_in_Heraklion.jpg | Antonios Palimetakis | CC BY-SA 4.0 |
| La Canea | Chania_harbour_B.jpg | Wouter Hagens | CC BY-SA 3.0 |
| Rodas | Rhodos,_Grand_Master_Palace.jpg | Georg Karl Ell | CC BY-SA 4.0 |
| Corfú | The_Old_Fortress,_Corfu_Town.jpg | Plucas58 | CC BY-SA 4.0 |
| Kos | Asklepieion_Kos.jpg | Nljst | CC BY-SA 4.0 |
| Santorini | Santorini_Oia_Church.jpg | Danbu14 | CC BY-SA 3.0 |
| Miconos | Windmills_of_Mykonos.jpg | Julian Lupyan | CC0 |
| Zante | Zakynthos_Town_-_Panoramic_View.jpg | Nana B Agyei | CC BY 2.0 |
| Cefalonia | Kefalonia_Assos_Village.jpg | Spiros Rokkos | CC BY-SA 4.0 |
| Scíathos | View_of_the_harbour_of_Skiathos_-_panoramio.jpg | fabiolah | CC BY 3.0 |

Limitación: las páginas y metadatos se pudieron consultar, pero la herramienta de búsqueda devolvió errores de caché al solicitar varias miniaturas. No se afirma haber comprobado HTTP 200 de las doce imágenes ni su recorte en un navegador real. La foto de Zante es panorámica; revisar su recorte en móvil.

## Verificación

- 391 pruebas anteriores correctas después de extender los cargadores y los recuentos para Grecia.
- 14 pruebas específicas correctas: contenido en siete idiomas, conservación por huellas de las 209 fichas y páginas editoriales, códigos, alias sin colisiones, autocompletado, errores y exclusión automática/sitemap.
- Prueba adicional de la interfaz real y sus manejadores con React simulado: doce fichas × siete idiomas; escribir/seleccionar no abre el cuadro, «Ver destino» abre la identidad elegida con foto y textos traducidos, y mantiene vuelos, hoteles, planificador y 16 tarjetas de portada. Las 18 pruebas de presentación son correctas.
- TypeScript correcto. Lint sin errores, con avisos previos de imágenes.
- Compilación local bloqueada por DNS de Google Fonts y EPERM de Windows al crear carpetas en `.next`. No se cambia configuración ni se falsean fuentes para superarlo. Comprobar el resultado de la Preview de Vercel del commit final.
- Sin llamadas reales de voz, generación de IA, precios de vuelos, reservas ni escrituras en cuentas. Las pruebas de servicios son simuladas.

No se ha realizado una nueva revisión visual en navegador: el control de permisos rechazó la apertura solicitada de la Preview anterior de Croacia y no se ha intentado eludirlo. No se cambian protecciones de acceso.

## Publicación

PR de borrador para revisar en Preview. No fusionar ni publicar Production sin autorización específica. No se cambian Sofía, cuotas, ElevenLabs, Redis, credenciales, dependencias, pagos ni configuración de Vercel. Los pagos previstos siguen aplazados al 4 de noviembre de 2026.
