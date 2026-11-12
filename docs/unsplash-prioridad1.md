# Fotos de Unsplash · prioridad 1

Estado: **borrador (Pull Request abierta, sin fusionar)**. Fecha de comprobación de las fotos: 12-11-2026.

## Qué cambia

- **29 fichas del catálogo** europeo cambian su foto de Wikimedia Commons por una de Unsplash (imagen, página de origen, autor, licencia y enlace a la licencia). Seis de ellas llevan además un encuadre vertical propio en el marco panorámico de la ficha (Murcia, Bremen, Kassel, Zúrich, Vitoria-Gasteiz y León).
- **6 tarjetas de las páginas de temporada** (Madeira, Estambul, Montenegro, Umbría, Nueva York y Fuerteventura) cambian la dirección de su foto. Las páginas de temporada no muestran créditos por foto, así que aquí solo se guarda el registro.
- Fuerteventura usa la misma foto en el catálogo y en la temporada de invierno.

## Qué NO cambia

Las 16 tarjetas de la portada, el resto del contenido de las fichas (textos en los 7 idiomas, aeropuertos, meses, recomendaciones), el diseño, los buscadores, la voz y la IA, Supabase y las integraciones de viajes. Se quedan con su foto actual: Hammerfest, Brindisi y Salento, Eger, Kálimnos, Crotona y Capo Rizzuto, Viseu, Sitia, Volos y la tarjeta de temporada de Hokkaido / Sapporo.

## Cómo se comprobó cada foto

Se abrió la página de cada foto en Unsplash y se anotó su autor, el lugar que indica, su licencia y que es gratuita (no Unsplash+). El autor y el lugar de abajo son los que figuran en esas páginas. En dos fotos Unsplash no indica el lugar (Carcasona y Valladolid); se identificaron a la vista: la Cité de Carcasona de noche y el Ayuntamiento de Valladolid. Para cambiar alguna, hay que sustituirla en `tests/fixtures/unsplash-priority1.json` y en los datos del destino.

Licencia de todas: [Unsplash License](https://unsplash.com/license).

## Fichas del catálogo (29)

| Destino | País | Autor | Lugar según Unsplash | Foto |
|---|---|---|---|---|
| Interlaken y región de Jungfrau | Suiza | Josef Ivan Jimenea | Interlaken, Switzerland | [Ay6Wdgb_P3k](https://unsplash.com/photos/Ay6Wdgb_P3k) |
| Ålesund | Noruega | Nicolai Berntsen | Alesund, Norway | [Fr4GbL5d3TA](https://unsplash.com/photos/Fr4GbL5d3TA) |
| Zell am See | Austria | Andi Steiner | Zell am See, Österreich | [y74fdU4p8uE](https://unsplash.com/photos/y74fdU4p8uE) |
| Fuerteventura | España | Michal Mrozek | Fuerteventura, Spain | [j7heFwsIq7U](https://unsplash.com/photos/j7heFwsIq7U) |
| Bremen | Alemania | Jahanzeb Ahsan | Bremen, Germany | [LgW5HDnVgvs](https://unsplash.com/photos/LgW5HDnVgvs) · encuadre center 35% |
| Región de Murcia | España | joanna hall | Murcia, Spain | [kDQaaiyCjNo](https://unsplash.com/photos/kDQaaiyCjNo) · encuadre center 30% |
| Montreux y castillo de Chillon | Suiza | Andrea Caramello | Château de Chillon, Suisse | [oOZhEzwAmZc](https://unsplash.com/photos/oOZhEzwAmZc) |
| Bursa | Turquía | Alaa Shaheen | Bursa, Turkey | [vi8rZR9rq70](https://unsplash.com/photos/vi8rZR9rq70) |
| Kassel | Alemania | Kneer Visuals | Kassel, Germany | [TZgqJSSfEpQ](https://unsplash.com/photos/TZgqJSSfEpQ) · encuadre center 20% |
| Suceava | Rumanía | Daniela Ivanescu | Romania | [1Q1txBq8uuE](https://unsplash.com/photos/1Q1txBq8uuE) |
| Metz | Francia | Timothée Gidenne | Metz Cathedral, Place d'Armes, Metz, France | [l8r0iD7_gtU](https://unsplash.com/photos/l8r0iD7_gtU) |
| Nottingham | Reino Unido | ian kelsall | Wollaton, Nottingham, UK | [5islVITCBNE](https://unsplash.com/photos/5islVITCBNE) |
| Porto Santo | Portugal | Daniele Franchi | Porto Santo, Portugal | [mbKgSUWuuVQ](https://unsplash.com/photos/mbKgSUWuuVQ) |
| Reggio Calabria | Italia | Giusy Iaria | Reggio Calabria, Metropolitan City of Reggio Calabria, Italy | [tBCK4fBoTxk](https://unsplash.com/photos/tBCK4fBoTxk) |
| York | Reino Unido | Karl Moran | York, York, United Kingdom | [JBJmXBiCBPk](https://unsplash.com/photos/JBJmXBiCBPk) |
| Vitoria-Gasteiz | España | David Vives | Catedral de María Inmaculada de Vitoria, Vitoria-Gasteiz, España | [WYxy3lzAH_4](https://unsplash.com/photos/WYxy3lzAH_4) · encuadre center 35% |
| Tesalónica | Grecia | Miltiadis Fragkidis | Thessaloniki, Greece | [zk7TNJp0nMw](https://unsplash.com/photos/zk7TNJp0nMw) |
| Annecy | Francia | Sue Winston | Annecy, France | [_cOWxmAWg2g](https://unsplash.com/photos/_cOWxmAWg2g) |
| Banská Štiavnica | Eslovaquia | Tomáš Malík | Banská Štiavnica, Slovensko | [L6Uz3kXl0sQ](https://unsplash.com/photos/L6Uz3kXl0sQ) |
| Aalborg | Dinamarca | Absent Wall | Aalborg, Denmark | [_qjIj53nEPU](https://unsplash.com/photos/_qjIj53nEPU) |
| Carcasona | Francia | Hugo Margolles | (sin lugar en Unsplash; identificada a la vista: la Cité de Carcasona de noche) | [vO4SExwFVHI](https://unsplash.com/photos/vO4SExwFVHI) |
| León | España | Sergio Otoya | León, Spain | [7fQErFlm3XA](https://unsplash.com/photos/7fQErFlm3XA) · encuadre center 35% |
| Valladolid | España | Clemente Corona | (sin lugar en Unsplash; identificada a la vista: el Ayuntamiento de Valladolid) | [kxAkBC6c1Gk](https://unsplash.com/photos/kxAkBC6c1Gk) |
| Aberdeen | Reino Unido | Aleksi Partanen | Aberdeen, UK | [C_HJw4ZBFCc](https://unsplash.com/photos/C_HJw4ZBFCc) |
| Burdeos | Francia | Juan Di Nella | Bordeaux, France | [ulhxvMjzI_4](https://unsplash.com/photos/ulhxvMjzI_4) |
| Sopron | Hungría | Boglarka Caup | Sopron, Hungary | [LNbbO2QbR7c](https://unsplash.com/photos/LNbbO2QbR7c) |
| Altos Tatras | Eslovaquia | Lukas Bato | High Tatras, Slovakia | [MNXcq2gJyxU](https://unsplash.com/photos/MNXcq2gJyxU) |
| Tihany y el lago Balatón | Hungría | Balint Miko | Tihany, Tihanyi Bencés Apátság, Hungary | [fvgbaTUXtVI](https://unsplash.com/photos/fvgbaTUXtVI) |
| Zúrich | Suiza | Henrique Ferreira | Zürich, Switzerland | [6p-I-X-sPUY](https://unsplash.com/photos/6p-I-X-sPUY) · encuadre center 30% |

## Páginas de temporada (6)

| Tarjeta | Temporada | Autor | Lugar según Unsplash | Foto |
|---|---|---|---|---|
| Madeira | Primavera | Sofia Vila Flor | Funchal, Portugal | [I3GXE-zNcBA](https://unsplash.com/photos/I3GXE-zNcBA) |
| Estambul | Primavera | Ibrahim Uzun | Kız Kulesi, Salacak, Üsküdar/İstanbul, Türkiye | [9FkQpB2rVjw](https://unsplash.com/photos/9FkQpB2rVjw) |
| Montenegro | Otoño | olga brajnovic | Kotor, Montenegro | [_nupO8tu6sg](https://unsplash.com/photos/_nupO8tu6sg) |
| Umbría | Otoño | Sterling Lanier | Trevi, Province of Perugia, Umbria, Italy | [EYeWIJu5Mc0](https://unsplash.com/photos/EYeWIJu5Mc0) |
| Nueva York | Invierno | Caitlyn Wilson | Central Park, New York, United States | [af8vmZPyFq8](https://unsplash.com/photos/af8vmZPyFq8) |
| Fuerteventura | Invierno | Michal Mrozek | Fuerteventura, Spain | [j7heFwsIq7U](https://unsplash.com/photos/j7heFwsIq7U) |

## Pruebas

- **Prueba nueva** `tests/unsplash-priority1-photos.test.cjs` (7 pruebas): cada ficha usa su foto, con su página, autor y licencia; en las 29 fichas solo cambian los campos de foto (el resto del perfil y el orden de los campos, idénticos); la ventana de la ficha en los 7 idiomas es la misma salvo foto y crédito; el encuadre existe solo en las 6 fichas indicadas; las páginas de temporada solo cambian esas 6 direcciones (si se devuelven las antiguas, la página sale igual que antes); la portada (16 tarjetas) y el resto del catálogo, intactos.
- **Pruebas antiguas que pedían "foto de Commons"** (20 archivos, por ejemplo Suiza, Hungría, Grecia, Reino Unido o los aeropuertos de Francia): ahora, para las 29 fichas cambiadas, comprueban que la foto es de Unsplash con su página, autor y licencia (`tests/helpers/unsplash-priority1.cjs`) y se saltan solo la parte de Commons. Para el resto de fichas siguen exactamente igual. El archivo `tests/fixtures/france-airport-photos.json` conserva los datos de Commons de Metz y Carcasona como registro de la foto anterior.
- **Huellas guardadas** (`tests/fixtures`): se actualizaron solo las de las 29 fichas (y, en las 6 con encuadre, la huella de su ventana) y las de las tres páginas de temporada con foto nueva. Las 16 tarjetas de la portada y la página de verano no cambian. Cada huella nueva se calculó con el código anterior más solo el cambio de foto y se comprobó que, sin ese cambio, reproduce la huella antigua.
- No se ha borrado ninguna prueba.

## Relación con la PR #63 (fotos de Commons, en borrador)

La PR #63 propone otra foto de Commons para varias de estas fichas. Esta PR parte de la rama de Madrid (PR #68) y reemplaza la foto de esas fichas por la de Unsplash. Si se fusionan las dos, habrá que resolver el choque en esas líneas quedándose con la de Unsplash.
