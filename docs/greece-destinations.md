# Grecia: quince fichas por selección expresa

Revisión: 3 de noviembre de 2026. Rama `codex/greece-destinations`, PR #39 de borrador, independiente de Sofía (PR #38). Base main: `bbf31cbc9b560151cf2301bb7bed81b6f0f25c41`.

## Selección y ciudades

El usuario pidió los quince aeropuertos con mayor tráfico internacional. Se utiliza el último año completo, 2025, contando pasajeros internacionales de llegada y salida. Se conservan las doce fichas ya preparadas y se añaden únicamente Préveza, Samos y Calamata. El catálogo de la rama contiene 224 perfiles (209 de main y 15 de Grecia). Croacia permanece en su PR #36.

| Aeropuerto | Ficha | Ciudad o localidad de referencia visible |
| --- | --- | --- |
| ATH | Atenas | Atenas |
| HER | Heraclión | Heraclión |
| RHO | Rodas | Rodas |
| SKG | Tesalónica | Tesalónica |
| CFU | Corfú | Corfú (Kérkyra) |
| CHQ | La Canea | La Canea |
| KGS | Kos | Kos |
| ZTH | Zante | Zante (ciudad de Zakynthos) |
| JTR | Santorini | Fira (Santorini) |
| JMK | Miconos | Chora de Miconos |
| PVK | Préveza | Préveza |
| EFL | Cefalonia | Argostoli (Cefalonia) |
| JSI | Scíathos | Ciudad de Scíathos |
| KLX | Calamata | Calamata |
| SMI | Samos | Pitagorio (Samos) |

La localidad es una referencia del destino servido. No indica que la terminal esté en el centro urbano. Las fichas insulares existentes mantienen su alcance y sus nombres; no se duplican como fichas de ciudades. El bloque de aeropuerto recuerda comprobar el traslado al alojamiento.

## Justificación del corte por tráfico internacional

- [Fraport Greece, ejercicio completo 2025, página 1](https://www.fraport-greece.com/content/dam/fraport-company-greece/documents/en/our-expertise/traffic-figures/2025/december/Fraport_Greece_YTD_12_Traffic_2025vs2024.pdf/_jcr_content/renditions/original./Fraport_Greece_YTD_12_Traffic_2025vs2024.pdf): RHO 6.139.546; SKG 5.436.702; CFU 4.175.831; CHQ 3.176.322; KGS 2.826.641; ZTH 2.182.625; JTR 1.332.231; JMK 1.090.659; PVK 862.698; EFL 769.315; JSI 573.741; SMI 285.728. Son cifras provisionales del operador. Kavala (234.727) y Mitilene (181.954) quedan por debajo de Samos.
- [AIA, Aerostat 2025](https://media.aia.gr/assets/aiaportal/media/root/corporate/corporate-publications/aerostat_handbook_2025.pdf), páginas impresas 10 y 144: ATH 24.362.437; HER 8.107.672 internacionales comerciales. El alcance comercial de esta última cifra sirve para acreditar su inclusión, sin presentarlo como una serie idéntica a todos los totales de operadores.
- [Growthfund, información de Calamata, 22 de junio de 2026](https://growthfund.gr/en/ypografi-symvasis-parachorisis-gia-tin-aksiopoiisi-tou-diethnous-aerolimena-kalamatas/): 368.515 pasajeros totales en 2025 y 92,4 % internacionales, aproximadamente 340.500. Es una estimación a partir de un porcentaje redondeado, superior al corte de Samos.
- [Growthfund, tabla de los otros 22 aeropuertos estatales](https://growthfund.gr/wp-content/uploads/2026/04/Growthfund_EoI_22-Regional-Airports_EN.pdf), páginas impresas 9–10: diecinueve tienen incluso su tráfico total por debajo de Samos. Paros, Alexandroupolis y Chios requieren separar el doméstico.
- Para esos tres, la página impresa 33 de Aerostat registra respectivamente 351.706, 315.743 y 280.764 pasajeros domésticos programados con Atenas. Restarlos de sus totales anuales (371.989, 330.155 y 321.269) da máximos internacionales de 20.283, 14.412 y 40.505. **Son límites superiores inferidos, no cifras internacionales publicadas**: basta descontar esa parte doméstica para demostrar que quedan fuera.

Las estadísticas justifican esta selección editorial. No se añaden cifras de tráfico a la interfaz ni se prometen rutas, plazas o vuelos internacionales en cualquier fecha.

## Diseño y contenido

Se reutiliza la ficha compartida: fotografía con fuente, autor y licencia, descripción, cuatro recomendaciones, estancia orientativa, meses y notas prácticas, vuelos, hoteles y planificador. Los textos están en español, inglés, francés, alemán, italiano, portugués y catalán. El nuevo bloque de aeropuerto sigue los colores, bordes y tipografía de la ficha existente y muestra nombre, IATA y localidad traducida.

Las doce fichas anteriores conservan sus datos y fotografías, incluida la Acrópolis iluminada elegida para Atenas. Las tres nuevas tienen textos originales contrastados con Visit Greece; véanse [fuentes de contenido](greece-regional-a-sources.md) y [fuentes fotográficas](greece-regional-photo-sources.md). Los meses y estancias son orientación editorial. No se copian precios ni horarios.

## Visibilidad

- Las quince fichas son `draft`, accesibles solo al solicitar el destino mediante búsqueda/selección o enlace directo como `/?ficha=Preveza`.
- Escribir o seleccionar una sugerencia no abre automáticamente la ficha: se mantiene «Ver destino».
- No se añaden tarjetas a portada, temporadas, recomendaciones automáticas, páginas mensuales o sitemap. La tarjeta editorial original de Santorini se conserva.
- Se mantienen íntegros los datos de las 16 tarjetas editoriales y de las páginas anteriores.
- La búsqueda reconoce también las localidades de referencia, como Fira, Argostoli y Pitagorio, y sus variantes traducidas, sin duplicar fichas. El autocompletado conserva la llamada gratuita existente y el comportamiento seguro ante fallos. Las pruebas usan respuestas simuladas.

«Solo por selección» describe la presentación del catálogo, no una barrera de privacidad.

## Comprobaciones

- Suite completa final: 411 pruebas correctas; TypeScript correcto y lint sin errores, con avisos previos de imágenes.
- Regresión adicional correcta: las 221 fichas del commit `af627894fc545d5f469a69ed126c3712756e1a8b`, su fotografía de Atenas y las tarjetas editoriales mantienen sus huellas. Las pruebas específicas de Grecia pasan 15/15.
- La prueba de la interfaz real con React simulado recorre las quince fichas en siete idiomas, selección/apertura, fotografía, bloque de aeropuerto y conservación de vuelos, hoteles, planificador y portada.
- La compilación local presenta las limitaciones previas de DNS de Google Fonts y permisos de Windows en `.next`; la compilación final se comprueba en Preview sin alterar la configuración.
- La revisión visual de las tres nuevas imágenes y del bloque práctico se registra tras el despliegue de Preview.
- No se realizan consultas reales de voz, generación de IA, tarifas, reservas ni pagos.

## Revisión y publicación

[Preview de Grecia](https://el-viajero-web-git-codex-greece-destinations-el-viajero.vercel.app/?ficha=Atenas). [PR #39](https://github.com/tosca201098-jpg/el-viajero-web/pull/39), de borrador.

No fusionar ni publicar Production sin autorización específica. No se alteran Sofía, cuotas, ElevenLabs, Redis, credenciales, dependencias, pagos ni configuración de Vercel. Los pagos previstos siguen aplazados al miércoles 4 de noviembre de 2026.
