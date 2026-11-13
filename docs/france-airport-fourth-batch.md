# Francia: cuarto lote aeroportuario

Preparación del 6 de noviembre de 2026. Doce ciudades adicionales: Metz ETZ, Brive-la-Gaillarde BVE, Dole DLE, Poitiers PIS, Châlons-en-Champagne XCR, Deauville DOL, Castres DCM, Aurillac AUR, Saint-Étienne EBU, Lorient LRT, Le Puy-en-Velay LPY y Ouessant OUI. Francia pasa de 36 a **48 fichas** y esta rama contiene **260 perfiles**. Se conserva una ficha por ciudad servida.

## Aclaración sobre «28» y «36» fichas

El código real de la PR #44 contenía **36 fichas francesas** antes de este lote: las 12 originales de `main` más tres lotes de ocho (MPL…RNS, PGF…CFE y GNB…RDZ). La descripción de la PR y la actualización de `france-airports-remaining.md` mencionaban 28 porque se redactaron al cerrar el segundo lote; el tercer lote ya estaba en la rama. La referencia correcta es el código. No hay slugs ni IATA duplicados (comprobado por pruebas).

Con este lote quedan por incorporar, de las 28 instalaciones aceptadas por el inventario, **ninguna**. Pendientes del país: CER, LEH y CHR (el proveedor las marca `flightable=false`; el operador acredita oferta turística en 2026) y los casos «pendiente» o «excluido» del inventario. El país no se da por cerrado.

## Aeropuerto, ciudad y evidencia

Registros del proveedor consultados el 6/11/2026 (`airports.json` y `cities.json`, `iata_type=airport`, `flightable=true`, país FR); copia en `tests/fixtures/france-airport-provider.json`. Fuentes primarias de pasajeros y emplazamientos: [inventario restante](france-airports-remaining.md).

| Ciudad | IATA / nombre proveedor | Emplazamiento | Decisión de agrupación |
| --- | --- | --- | --- |
| Metz | ETZ / Metz-Nancy-Lorraine (ciudad «Metz/Nancy») | Goin, entre Metz y Nancy | Una ficha, Metz; Nancy como alias, sin ficha propia |
| Brive-la-Gaillarde | BVE / «Laroche Airport» (nombre obsoleto del proveedor) | Nespouls, cerca de Cressensac (LFSL) | Ficha Brive; ubicación y nombre actuales de la AIP |
| Dole | DLE / Dole-Jura | Tavaux | Una ficha; no se duplica en Dijon ni Besançon |
| Poitiers | PIS / Poitiers-Biard | Biard | Una ficha |
| Châlons-en-Champagne | XCR / Chalons Vatry | Bussy-Lettrée | Ficha Châlons; Paris-Vatry solo como alias; no amplía la ficha París |
| Deauville | DOL / Saint Gatien | Saint-Gatien-des-Bois | Una ficha; Trouville como alias |
| Castres | DCM / Mazamet (ciudad «Castres») | Le Causse | Una ficha; Mazamet como alias |
| Aurillac | AUR / Aurillac | Tronquières | Una ficha; nombre actual Marie Marvingt |
| Saint-Étienne | EBU / Boutheon (ciudad «St Etienne») | Andrézieux-Bouthéon | Una ficha; la oferta puede ser limitada |
| Lorient | LRT / Lann Bihoue | Sector civil de Lann-Bihoué | Una ficha; servicio regular de pocas plazas |
| Le Puy-en-Velay | LPY / Loudes | Loudes / Chaspuzac | Una ficha; servicio limitado |
| Ouessant | OUI / Ouessant | Isla de Ouessant | Ficha propia; no se asocia a Brest |

Las fichas indican en la nota que el servicio puede ser estacional o limitado y que hay que comprobar los vuelos de las fechas elegidas. No se incluyen precios, plazas ni disponibilidad.

## Fotografías

Todas de Wikimedia Commons, con autor, licencia y enlace en la ficha y en `tests/fixtures/france-airport-photos.json`. Examinadas en una hoja de muestras antes de elegirlas; se descartaron detalles (portadas esculpidas, órganos), interiores, fotos con coches muy dominantes o con atribución dudosa. Se sustituyó una foto de Metz cuya autoría en Commons no era fiable por otra de H. Zell.

| Ciudad | Archivo Commons | Autor | Licencia |
| --- | --- | --- | --- |
| metz | [Metz Cathedral 004.JPG](https://commons.wikimedia.org/wiki/File:Metz_Cathedral_004.JPG) | H. Zell | CC BY-SA 3.0 |
| brive-la-gaillarde | [Brive-la-Gaillarde - Place Latreille - 1.jpg](https://commons.wikimedia.org/wiki/File:Brive-la-Gaillarde_-_Place_Latreille_-_1.jpg) | Benjamin Smith | CC BY-SA 4.0 |
| dole | [Dole (Jura) - Canal des Tanneurs - Collégiale Notre-Dame](https://commons.wikimedia.org/wiki/File:Dole_(Jura)_-_Canal_des_Tanneurs_-_Coll%C3%A9giale_Notre-Dame_(51944624472).jpg) | Patrick from Compiègne, France | CC BY-SA 2.0 |
| poitiers | [Poitiers - Palais de Justice 2.jpg](https://commons.wikimedia.org/wiki/File:Poitiers_-_Palais_de_Justice_2.jpg) | Christophe.Finot | CC BY-SA 2.5 |
| chalons-en-champagne | [Châlons-HDV(2025).jpg](https://commons.wikimedia.org/wiki/File:Ch%C3%A2lons-HDV(2025).jpg) | Matgrt | CC BY-SA 4.0 |
| deauville | [Plage Deauville - panoramio.jpg](https://commons.wikimedia.org/wiki/File:Plage_Deauville_-_panoramio.jpg) | minishooter | CC BY-SA 3.0 |
| castres | [(Castres) Maisons sur l'Agoût…](https://commons.wikimedia.org/wiki/File:(Castres)_Maisons_sur_l%27Ago%C3%BBt_vues_du_pont_Neuf_vers_le_pont_Tourcaudi%C3%A8re.jpg) | Didier Descouens | CC BY-SA 4.0 |
| aurillac | [Jordanne Aurillac Pont Rouge.jpg](https://commons.wikimedia.org/wiki/File:Jordanne_Aurillac_Pont_Rouge.jpg) | Adrianstork | CC BY-SA 4.0 |
| saint-etienne | [Saint Étienne-Hôtel de ville-20110117.jpg](https://commons.wikimedia.org/wiki/File:Saint_%C3%89tienne-H%C3%B4tel_de_ville-20110117.jpg) | Daniel Villafruela | CC BY-SA 3.0 |
| lorient | [Lorient-Tour-Découverte.jpg](https://commons.wikimedia.org/wiki/File:Lorient-Tour-D%C3%A9couverte.jpg) | Pline | CC BY-SA 3.0 |
| le-puy-en-velay | [Saint-Michel-d'Aiguiihe (W. Bulach)](https://commons.wikimedia.org/wiki/File:0_1138_Le_Puy-en-Velay_(Frankreich)_-_Saint-Michel-d%27Aiguiihe.jpg) | W. Bulach | CC BY-SA 4.0 |
| ouessant | [Ouessant - Phare du Creac'h et Maison.jpg](https://commons.wikimedia.org/wiki/File:Ouessant_-_Phare_du_Creac%27h_et_Maison.jpg) | Agnes DP | CC BY-SA 4.0 |

Calidad mejorable para una revisión posterior de imágenes (Fase 2): Aurillac (río y puente, no el casco histórico) y Châlons (ayuntamiento con letrero moderno).

## Pruebas

`node --test tests/*.test.cjs`: 422 pruebas, 415 aprobadas. Los 7 fallos son de entorno (faltan react, postcss y js-yaml) y ya fallaban antes de este lote. Las pruebas de Francia (cobertura, identidades, proveedor, fotos, selección y conservación de las 248 identidades previas) pasan. No se ha podido ejecutar la compilación de Next ni la revisión visual desde este entorno: queda para el Preview de Vercel.

## Alcance

Solo datos, pruebas y documentación de Francia. Sin cambios en `main`, Producción, Sofía, ElevenLabs, Redis, Supabase, Booking, variables ni diseño. Fichas en borrador: abiertas por búsqueda, no en portada, recomendaciones automáticas ni sitemap.
