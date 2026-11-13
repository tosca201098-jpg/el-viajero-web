# Fotos de Unsplash · prioridad 2

Estado: **borrador (Pull Request abierta, sin fusionar)**. Fecha de comprobación de las fotos: 12-11-2026.

## Qué cambia

- **28 fichas del catálogo** europeo cambian su foto de Wikimedia Commons por una de Unsplash (imagen, página de origen, autor, licencia y enlace a la licencia). 13 de ellas llevan además un encuadre vertical propio en el marco panorámico de la ficha.
- **3 tarjetas de la página de temporada de invierno** (Rovaniemi y Laponia, Dolomitas / Cortina d'Ampezzo y Phuket y Krabi) cambian la dirección de su foto. Las páginas de temporada no muestran créditos por foto, así que aquí solo se guarda el registro.
- Kavala y Kastoria guardan su foto en una lista (`greece-airport-coverage.ts`) que antes no tenía campo para la página de origen; se añadió un séptimo elemento opcional (`photo[6]`) y el constructor lo usa si existe. Las fichas griegas que no lo tienen se construyen igual que antes.

## Qué NO cambia

Las 16 tarjetas de la portada, el resto del contenido de las fichas (textos en los 7 idiomas, aeropuertos, meses, recomendaciones), el diseño, los buscadores, la voz y la IA, Supabase y las integraciones de viajes. Se quedan con su foto actual, por decisión del propietario: Adana, Kos, Billund, Birmingham, Masuria, Kajaani, Campbeltown y Kintyre, Isla de Barra, Levoča, Mali Lošinj, Samsun, Palanga, Chambéry, Tiree, Graciosa, Dortmund y el Ruhr, Gällivare, Pori, Perugia y Umbría, Kirkenes, Islay, Malmö, y las tarjetas de temporada de Luxor y el Nilo, Menorca y Riviera Albanesa / Ksamil.

## Cómo se comprobó cada foto

Se abrió la página de cada foto en Unsplash y se anotó su autor, el lugar que indica, su licencia y que es gratuita (no Unsplash+). El autor y el lugar de abajo son los que figuran en esas páginas. En una foto Unsplash no indica el lugar (Şanlıurfa); se identificó a la vista: el estanque de Balıklıgöl, en Şanlıurfa. Para cambiar alguna, hay que sustituirla en `tests/fixtures/unsplash-priority2.json` y en los datos del destino.

Licencia de todas: [Unsplash License](https://unsplash.com/license).

## Fichas del catálogo (28)

| Destino | País | Autor | Lugar según Unsplash | Foto |
|---|---|---|---|---|
| Aarhus | Dinamarca | Julius Yls | Aarhus, Denmark | [NXVMRWGgCfg](https://unsplash.com/photos/NXVMRWGgCfg) · encuadre center 15% |
| Zakopane y los Tatras | Polonia | Mateusz Bajdak | Hala Gąsienicowa, Szlak pieszy niebieski, Zakopane, Polska | [Z9X936FC8gM](https://unsplash.com/photos/Z9X936FC8gM) · encuadre center 35% |
| Bornholm | Dinamarca | Pramod Kumar Sharma | Bornholm, Denmark | [Fdlz_7eYAVQ](https://unsplash.com/photos/Fdlz_7eYAVQ) · encuadre center 33% |
| Innsbruck | Austria | Luca | Innsbruck, Austria | [S0ahTyEuNAU](https://unsplash.com/photos/S0ahTyEuNAU) |
| Terceira | Portugal | Antonio Araujo | Angra do Heroísmo, Portugal | [7egBST1kAQ8](https://unsplash.com/photos/7egBST1kAQ8) |
| Şanlıurfa | Turquía | Ahmet RÜZGAR | (sin lugar en Unsplash; identificada a la vista: el estanque de Balıklıgöl, en Şanlıurfa) | [7wQ3HMrywj4](https://unsplash.com/photos/7wQ3HMrywj4) |
| Brujas | Bélgica | Elijah G | Bruges, Belgium | [_BBlUZhRzjg](https://unsplash.com/photos/_BBlUZhRzjg) · encuadre center 30% |
| Florencia | Italia | Pretty Pink | Florence, Metropolitan City of Florence, Italy | [xWZa0GYCMbo](https://unsplash.com/photos/xWZa0GYCMbo) |
| Grenoble | Francia | Fabe collage | Grenoble, France | [diqJhQtHHNk](https://unsplash.com/photos/diqJhQtHHNk) · encuadre center 25% |
| Reikiavik | Islandia | Tom Podmore | Reykjavík, Iceland | [N1ONXKUAiGU](https://unsplash.com/photos/N1ONXKUAiGU) |
| Kavala | Grecia | Mehmet Talha Onuk | Kavala, Greece | [dOdGLQxrp2w](https://unsplash.com/photos/dOdGLQxrp2w) |
| Capadocia | Turquía | Ramzi Belaidi | Cappadocia, Turkey | [bU0-0vlEfZU](https://unsplash.com/photos/bU0-0vlEfZU) · encuadre center 15% |
| Oulu | Finlandia | Janne Leimola | Oulu, Finland | [OC3vnG9UG-w](https://unsplash.com/photos/OC3vnG9UG-w) |
| Akureyri | Islandia | Ed Wingate | Akureyri, Iceland | [5Yl-Yp4UfEE](https://unsplash.com/photos/5Yl-Yp4UfEE) |
| Esmirna | Turquía | Mehmet Korkmaz | Konak Meydanı, Kemeraltı Çarşısı, Konak/İzmir, Türkiye | [4T9AXWrh8q8](https://unsplash.com/photos/4T9AXWrh8q8) · encuadre center 35% |
| Kutná Hora | Chequia | Ale | Kutná Hora, Cechia | [Bdg-ljC12EA](https://unsplash.com/photos/Bdg-ljC12EA) · encuadre center 35% |
| Kastoria | Grecia | Anastasius | Kastoria, Greece | [tkUOD75ytko](https://unsplash.com/photos/tkUOD75ytko) |
| Lausana y viñedos de Lavaux | Suiza | Razvan Sassu | Lavaux, Switzerland | [vbrmbRib4uo](https://unsplash.com/photos/vbrmbRib4uo) |
| Lublin | Polonia | Tomasz Zielonka | Lublin, Poland | [to1I4axDYmY](https://unsplash.com/photos/to1I4axDYmY) |
| Montpellier | Francia | Julien Daga | Montpellier, France | [J5iirAB17TA](https://unsplash.com/photos/J5iirAB17TA) · encuadre center 35% |
| Nantes | Francia | Pascal Bernardon | Les Machines de l'Île, Boulevard Léon Bureau, Nantes, France | [LxJ5FHD495Y](https://unsplash.com/photos/LxJ5FHD495Y) · encuadre center 30% |
| Brno | Chequia | Leonhard Niederwimmer | Brno, Czechia | [fLP4rIrzt7s](https://unsplash.com/photos/fLP4rIrzt7s) |
| Préveza | Grecia | Nikos Kavvadas | Πρέβεζα, Greece | [AlGrDF2406Y](https://unsplash.com/photos/AlGrDF2406Y) |
| Pamukkale | Turquía | MURAD TURNA | Pamukkale, Denizli, Turkey | [rKXaQRCcj2k](https://unsplash.com/photos/rKXaQRCcj2k) · encuadre center 85% |
| Escíato | Grecia | Razvan Dumitrasconiu | Skiathos, Greece | [G_4T6u5zREY](https://unsplash.com/photos/G_4T6u5zREY) · encuadre center 50% |
| Levi | Finlandia | Jouni Rajala | Levi, Kittilä, Finland | [TosJYG4Zimg](https://unsplash.com/photos/TosJYG4Zimg) |
| Trondheim | Noruega | snap wander | Trondheim, Norvège | [cYnTtMn3rZc](https://unsplash.com/photos/cYnTtMn3rZc) |
| Norwich | Reino Unido | Daniel Sturley | Norwich, UK | [a96YinP0asI](https://unsplash.com/photos/a96YinP0asI) · encuadre center 55% |

## Página de temporada de invierno (3)

| Tarjeta | Temporada | Autor | Lugar según Unsplash | Foto |
|---|---|---|---|---|
| Rovaniemi y Laponia | Invierno | Roman Protsyshyn | Rovaniemi, Finland | [mK3r6olsK08](https://unsplash.com/photos/mK3r6olsK08) |
| Dolomitas / Cortina d’Ampezzo | Invierno | Dubravko Palić | Cortina d'Ampezzo, Province of Belluno, Italy | [VmM-9ptZ-OQ](https://unsplash.com/photos/VmM-9ptZ-OQ) |
| Phuket y Krabi | Invierno | Vaskar Sam | Phi Phi Islands, Krabi, Thailand | [UL1Hkp6CMcc](https://unsplash.com/photos/UL1Hkp6CMcc) |

## Pruebas

- `tests/unsplash-priority2-photos.test.cjs`: cada ficha usa su foto, con su autor y licencia; solo cambian los campos de foto (el resto del perfil, idéntico, y en el mismo orden); la ventana de la ficha en 7 idiomas es la misma salvo foto y crédito; la página de invierno solo cambia esas 3 direcciones; las otras tres temporadas y la portada, intactas.
- `tests/unsplash-priority1-photos.test.cjs` sigue pasando; su comprobación de la página de invierno ahora también deshace las 3 fotos de esta prioridad.
- Las huellas guardadas en `tests/fixtures` se actualizaron solo para las 28 fichas y la página de invierno; no se ha borrado ni relajado ninguna prueba.

## Relación con otras Pull Requests

- Esta PR parte de la rama de la prioridad 1 (PR #69), que a su vez parte de las anteriores (#63 a #68 no se tocan). Hay que fusionarlas en orden.
- La PR #63 (fotos de Commons, en borrador) propone otra foto de Commons para estas 28 fichas. Si se fusionan las dos, habrá que resolver el choque en esas líneas quedándose con la de Unsplash.
