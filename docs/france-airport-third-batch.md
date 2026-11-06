# Francia: tercer lote aeroportuario

Preparación del 6 de noviembre de 2026. Ocho ciudades adicionales: Grenoble GNB, Nîmes FNI, Bergerac EGC, Tolón TLN, Pau PUF, Tours TUF, Chambéry CMF y Rodez RDZ. Francia pasa a 36 fichas y 35 IATA físicos propios; esta rama contiene 248 perfiles. Se conserva una ficha por ciudad, sin duplicar municipios periféricos o nombres comerciales compartidos. El país continúa incompleto.

## Aeropuerto, ciudad y evidencia de pasajeros

| Ciudad | IATA / nombre mostrado | Emplazamiento | Evidencia comercial primaria |
| --- | --- | --- | --- |
| Grenoble | GNB / Grenoble Alpes Isère | Saint-Étienne-de-Saint-Geoirs, lejos del centro | [Gestor actual Edeis](https://grenoble.aeroport.fr/) |
| Nîmes | FNI / Nîmes Grande Provence | Saint-Gilles, junto a Garons | [Operador: vuelos y destinos](https://nimes.aeroport.fr/domaines-application/vols-destinations/) |
| Bergerac | EGC / Bergerac Dordogne Périgord | Roumanière, al sur de Bergerac | [Programa del operador, verano 2026](https://www.bergerac.aeroport.fr/wp-content/uploads/presskit/Programmes_des_vols_Saison_Ete_2026_29%20MARS_24%20OCTOBRE.pdf) |
| Tolón | TLN / Toulon Hyères | Hyères; sirve a ambas ciudades | [Programa del operador](https://www.toulon-hyeres.aeroport.fr/fr/vols-destinations/planning-des-vols) |
| Pau | PUF / Pau Pyrénées | Uzein | [Operador: destinos](https://www.aeroport-pau.fr/passager/destinations) |
| Tours | TUF / Tours Val de Loire | Norte de Tours, fuera del centro | [Operador](https://tours.aeroport.fr/) |
| Chambéry | CMF / Chambéry Savoie Mont Blanc | Voglans/Viviers-du-Lac | [Operador: destinos](https://www.chambery-airport.com/fr/vols-et-destinations/nos-destinations); oferta especialmente invernal |
| Rodez | RDZ / Rodez Aveyron | Salles-la-Source | [Operador](https://www.aeroport-rodez.fr/) y [turismo: llegada aérea](https://www.rodez-tourisme.fr/preparez-votre-sejour/venir-se-deplacer/rodez-en-avion/) |

Fuentes y emplazamientos contrastados en el [inventario restante](france-airports-remaining.md). Los registros públicos del proveedor se conservan sin alterar en el fixture: ocho aeropuertos físicos FR con `flightable=true`. Ese indicador y un programa de temporada no garantizan vuelos para cualquier fecha; las fichas incluyen la advertencia de comprobarlos.

**Excepción GNB/LYS:** el proveedor agrupa físicamente GNB bajo `city_code=LYS`. El gestor identifica Grenoble Alpes Isère. La ficha Grenoble utiliza siempre el aeropuerto físico GNB; la normalización local existente muestra Grenoble como ciudad servida al seleccionar ese aeropuerto. No cambia el IATA, no se inventa un código ni se utiliza Lyon-Saint-Exupéry como si fuera GNB. La ficha Lyon/LYS permanece idéntica. No se altera el contrato comercial del buscador ni se realizan consultas de tarifas.

## Turismo y siete idiomas

Redacción propia, cuatro recomendaciones urbanas y notas de traslado en español, inglés, francés, alemán, italiano, portugués y catalán. Meses y estancia son orientación editorial, sin promesas de meteorología o precios. Fuentes:

- Grenoble: [Place Saint-André](https://www.grenoble-tourisme.com/fr/catalogue/detail/place-saint-andre-858638/), [Jardin de Ville](https://www.grenoble-tourisme.com/fr/catalogue/detail/jardin-de-ville-567777/) y [Museo de Grenoble](https://www.museedegrenoble.fr/). El museo indica apertura con algunas salas temporalmente cerradas; se recomiendan las salas abiertas. No se promocionan senderos de la [Bastille](https://www.grenoble-tourisme.com/fr/decouvrir/le-territoire/grenoble-est-vous/la-bastille-une-montagne-dans-la-ville/), cuyo acceso está regulado tras el incendio de julio de 2026. La foto es una panorámica histórica, no una garantía de acceso al mirador.
- Nîmes: [monumentos romanos municipales](https://www.nimes.fr/que-faire-a-nimes/patrimoine/les-monuments-romains) y [jardines de la Fontaine](https://www.nimes.fr/mon-quotidien/environnement/nature-et-espaces-verts/les-espaces-verts-et-naturels/jardins-de-la-fontaine).
- Bergerac: [Dordonha](https://www.pays-bergerac-tourisme.com/fr/diffusio/bergerac/dordonha-centre-patrimonial-et-culturel_TFOPCUAQU024FS000PK) y [Quai Cyrano/Récollets](https://www.pays-bergerac-tourisme.com/fr/vins-decouvrir-quai-cyrano). No se garantizan horarios ni degustaciones.
- Tolón: [patrimonio municipal](https://toulon.fr/patrimoine-de-caractere) y [museos](https://toulon.fr/les-musees). Se elige el Museo de Arte, no el Museo Jean Aicard cerrado por obras; no se propone acceso a zonas militares.
- Pau: [oficina de turismo](https://www.tourismepau.com/), castillo, boulevard des Pyrénées, Bellas Artes y Beaumont; la visibilidad de las montañas no se garantiza.
- Tours: [monumentos de la oficina de turismo](https://www.tours-tourisme.fr/en/blog/se-cultiver/11-monuments-historiques-a-ne-pas-manquer-a-tours/) y [Vieux-Tours/Plumereau y museos](https://www.tours-tourisme.fr/en/incontournables/10-raisons-de-choisir-tours-pour-les-week-ends-et-les-vacances/). Los castillos de otras localidades requieren otro traslado.
- Chambéry: [patrimonio oficial](https://www.chamberymontagnes.com/que-faire/visites-culture-patrimoine/sites-monuments-historiques/) y [recorrido urbano de los Elefantes](https://explore.chamberymontagnes.com/fr/itineraires/promenade-confort-en-suivant-les-elephants).
- Rodez: [recorrido de un día](https://www.rodez-tourisme.fr/preparez-votre-sejour/idees/un-jour/) y [Soulages/Fenaille](https://www.rodez-tourisme.fr/inspirations/musees-soulages-fenaille-puech/), con el plano oficial del centro para la plaza del Bourg.

## Conservación y estado

Las 240 identidades previas se protegen mediante huellas, incluidas sus fotos y puntos de encuadre; las 16 tarjetas originales quedan idénticas. Las nuevas fichas siguen en borrador y se abren por búsqueda/selección expresa, sin ampliar portada, recomendaciones automáticas, meses o sitemap.

Fotografías examinadas antes de integrarlas; se descartan detalles, una noria que oculta el monumento, vistas de barcos sin referencia urbana y una imagen con marca de agua. Atribuciones individuales en el fixture y en la ficha. Pau y Tours reutilizan puntos de encuadre existentes para proteger torres y cubiertas, sin cambiar el componente común. 

Solo datos, pruebas y documentación de Francia. Sin cambios en main, Producción, destinauta.com, Sofía/PR #38, ElevenLabs, Redis, autenticación, cuotas, variables, dependencias, contratos de afiliación, pagos o fusiones.

## Fotografías y comprobación

| Ciudad | Archivo Commons | Autor | Licencia |
| --- | --- | --- | --- |
| grenoble | [Grenoble Fort de la Bastille Vue sur Grenoble 13.jpg](https://commons.wikimedia.org/wiki/File:Grenoble_Fort_de_la_Bastille_Vue_sur_Grenoble_13.jpg) | Zairon | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| nimes | [Nîmes, Maison Carrée (1. Jhdt.n.Chr.) (46755595574).jpg](https://commons.wikimedia.org/wiki/File:N%C3%AEmes,_Maison_Carr%C3%A9e_(1._Jhdt.n.Chr.)_(46755595574).jpg) | Herbert Frank from Wien (Vienna), AT | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0) |
| bergerac | [Bergerac - View in late afternoon.jpg](https://commons.wikimedia.org/wiki/File:Bergerac_-_View_in_late_afternoon.jpg) | Benjamin Smith | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| toulon | [Panorama de Toulon.JPG](https://commons.wikimedia.org/wiki/File:Panorama_de_Toulon.JPG) | Artemisia Levé | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| pau | [Château Pau Enceinte.jpg](https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_Pau_Enceinte.jpg) | Capbourrut | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| tours | [Tours - Cathédrale Saint-Gatien - Exterior - 02.jpg](https://commons.wikimedia.org/wiki/File:Tours_-_Cath%C3%A9drale_Saint-Gatien_-_Exterior_-_02.jpg) | Benjamin Smith | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |
| chambery | [Panorama Chambéry-Centre (2014).jpeg](https://commons.wikimedia.org/wiki/File:Panorama_Chamb%C3%A9ry-Centre_(2014).jpeg) | Florian Pépellin | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0) |
| rodez | [Centre de Rodez, vu du square Buanton.jpg](https://commons.wikimedia.org/wiki/File:Centre_de_Rodez,_vu_du_square_Buanton.jpg) | Espirat | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0) |

238 pruebas distintas aprobadas: 44 de Francia/presentación y 194 de regresión. Las tres regresiones iniciales detectaron la colisión del exónimo catalán Rodés con el alias Rodes de la isla griega. Se conserva el nombre propio Rodez en el selector, sin modificar la ficha griega aprobada; las 26 comprobaciones de Grecia y cobertura francesa pasan tras corregirlo. El texto catalán conserva su redacción. TypeScript aprobado.

La prueba de interacción real de portada se limitó a estas ocho fichas en los siete idiomas (56 recorridos); sin filtro, CI conserva toda la selección habitual. Las pruebas de datos y conservación abarcan las fichas anteriores. Verificación visual de la nueva Preview pendiente; se registrará en la PR.
