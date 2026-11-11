# Mejora de fotografías de destinos europeos (2026-11-11)

Solo cambian la fotografía de la tarjeta y sus metadatos internos (fuente, autor, licencia). No cambia el diseño de ninguna tarjeta ni las 16 tarjetas de la portada.

- **86 destinos con foto nueva**, todas de Wikimedia Commons, horizontales (relación ≥ 1,4) y de alta resolución (≥ 2.710 px de ancho). Tamaño, licencia y autor comprobados contra la API de Commons el 11-11-2026; las 86 miniaturas de 960 px cargan correctamente.
- **20 destinos se mantienen exactamente igual** (19 decididos por el propietario + 1 retenido por precaución, ver abajo).
- Los créditos y licencias no se superponen a ninguna imagen: se muestran, como antes, en el texto bajo la foto.

## Destino retenido por precaución

- **Le Castella / Crotone y Capo Rizzuto (`it-crotone-capo-rizzuto`)**: la foto aprobada (*Le Castella - Castello Aragonese - 08.jpg*, Benjamin Smith, CC BY-SA 4.0) lleva en Commons la marca de restricción `ita-mibac` (bien cultural italiano: el uso comercial puede requerir autorización). No se ha aplicado; conserva su foto actual hasta que el propietario decida.

## Cambio técnico mínimo

- `lib/destinations/croatia-airport-coverage.ts`: la lista de foto admite, de forma opcional, licencia y URL de licencia (por defecto sigue siendo CC BY-SA 4.0). Necesario porque la foto nueva de Mali Lošinj es CC BY-SA 3.0 de.
- Graciosa (`pt-graciosa`): se añade `imageLicenseUrl`, que antes no tenía.

## Destinos con foto nueva

Nº | Destino | Foto nueva (Commons) | Autor | Licencia | Tamaño
---|---|---|---|---|---
5 | Interlaken y región de Jungfrau (Suiza) | [Interlaken panorama 130622.jpg](https://commons.wikimedia.org/wiki/File:Interlaken_panorama_130622.jpg) | Bob Tan | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 8192×3308
7 | Ålesund (Noruega) | [Vista de Ålesund desde Aksla, Noruega, 2019-09-01, DD 16.jpg](https://commons.wikimedia.org/wiki/File:Vista_de_%C3%85lesund_desde_Aksla,_Noruega,_2019-09-01,_DD_16.jpg) | Diego Delso | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 6980×4094
10 | Hammerfest (Noruega) | [Hammerfest-panorama.jpg](https://commons.wikimedia.org/wiki/File:Hammerfest-panorama.jpg) | Øyvind A. Holm (Sunny256) | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 9374×3165
11 | Zell am See (Austria) | [Zell am See.Wiki.jpeg](https://commons.wikimedia.org/wiki/File:Zell_am_See.Wiki.jpeg) | Bestzeller | [Public domain](https://creativecommons.org/publicdomain/mark/1.0/) | 5401×3496
13 | Aarhus (Dinamarca) | [The shore of the river along Algade, Den gamle By, Aarhus, 26.08.2016.jpg](https://commons.wikimedia.org/wiki/File:The_shore_of_the_river_along_Algade,_Den_gamle_By,_Aarhus,_26.08.2016.jpg) | Liberaler Humanist | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 5184×3456
14 | Zakopane y los Tatras (Polonia) | [Panorama Tatr z Gubałówki.jpg](https://commons.wikimedia.org/wiki/File:Panorama_Tatr_z_Guba%C5%82%C3%B3wki.jpg) | Daro998 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 5385×1684
15 | Bornholm (Dinamarca) | [Wybrzeże Bornholmu.JPG](https://commons.wikimedia.org/wiki/File:Wybrze%C5%BCe_Bornholmu.JPG) | Lilly M | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 2710×1814
22 | Adana (Turquía) | [Adana Sabancı Merkez Camii ve Seyhan Nehri.jpg](https://commons.wikimedia.org/wiki/File:Adana_Sabanc%C4%B1_Merkez_Camii_ve_Seyhan_Nehri.jpg) | zamansehri | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 4680×2368
23 | Innsbruck (Austria) | [Panorama Innsbruck Hungerburg 2023.jpg](https://commons.wikimedia.org/wiki/File:Panorama_Innsbruck_Hungerburg_2023.jpg) | Snoflaxe | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 4800×2256
42 | Annecy (Francia) | [Annecy Panorama2.jpg](https://commons.wikimedia.org/wiki/File:Annecy_Panorama2.jpg) | Karlheinz Klingbeil | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 13519×6497
46 | Kos (Grecia) | [Panorama Kos 8.jpg](https://commons.wikimedia.org/wiki/File:Panorama_Kos_8.jpg) | kallerna | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 4660×2000
49 | Terceira (Portugal) | [Angra do Heroísmo at dusk, seen from Alto da Memória, Azores, Portugal (PPL2-Enhanced) julesvernex2.jpg](https://commons.wikimedia.org/wiki/File:Angra_do_Hero%C3%ADsmo_at_dusk,_seen_from_Alto_da_Mem%C3%B3ria,_Azores,_Portugal_(PPL2-Enhanced)_julesvernex2.jpg) | Jules Verne Times Two | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 8137×3789
53 | Fuerteventura (España) | [Aerial view of Esquinzo on Fuerteventura, Canary Islands.jpg](https://commons.wikimedia.org/wiki/File:Aerial_view_of_Esquinzo_on_Fuerteventura,_Canary_Islands.jpg) | dronepicr | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | 5464×3640
56 | Şanlıurfa (Turquía) | [Mevlid-i Halil Mosque 19.jpg](https://commons.wikimedia.org/wiki/File:Mevlid-i_Halil_Mosque_19.jpg) | Bernard Gagnon | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 5184×3456
58 | Banská Štiavnica (Eslovaquia) | [Nový zámok a staré mesto, Banská Štiavnica.jpg](https://commons.wikimedia.org/wiki/File:Nov%C3%BD_z%C3%A1mok_a_star%C3%A9_mesto,_Bansk%C3%A1_%C5%A0tiavnica.jpg) | Marekkacir | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 5184×3456
63 | Brindisi y Salento (Italia) | [Piazza Duomo (Lecce) 02.jpg](https://commons.wikimedia.org/wiki/File:Piazza_Duomo_(Lecce)_02.jpg) | Bernard Gagnon | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 4692×3128
72 | Billund (Dinamarca) | [Legoland Billund - Miniland.jpg](https://commons.wikimedia.org/wiki/File:Legoland_Billund_-_Miniland.jpg) | Legoland Billund Resort | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | 6016×4016
83 | Bremen (Alemania) | [Bremen-1230-Markt-Panorama-2008-gje.jpg](https://commons.wikimedia.org/wiki/File:Bremen-1230-Markt-Panorama-2008-gje.jpg) | Gerd Eichmann | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 6376×2353
86 | Brujas (Bélgica) | [Brügge Blick vom Belfried 4.jpg](https://commons.wikimedia.org/wiki/File:Br%C3%BCgge_Blick_vom_Belfried_4.jpg) | Zairon | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 4520×2896
89 | Aalborg (Dinamarca) | [Aalborg 2010 - 100 ubt.JPG](https://commons.wikimedia.org/wiki/File:Aalborg_2010_-_100_ubt.JPG) | Tomasz Sienicki | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 3072×1771
95 | Graciosa (Portugal) | [Harbour near Santa Cruz da Graciosa, Graciosa Island, Azores, Portugal (PPL1-Corrected) julesvernex2.jpg](https://commons.wikimedia.org/wiki/File:Harbour_near_Santa_Cruz_da_Graciosa,_Graciosa_Island,_Azores,_Portugal_(PPL1-Corrected)_julesvernex2.jpg) | Jules Verne Times Two | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 6196×4131
97 | Kálimnos (Grecia) | [Kalymnos Pothia panorama.jpg](https://commons.wikimedia.org/wiki/File:Kalymnos_Pothia_panorama.jpg) | Tomisti | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 7671×2446
99 | Carcasona (Francia) | [1 carcassonne aerial 2016.jpg](https://commons.wikimedia.org/wiki/File:1_carcassonne_aerial_2016.jpg) | Chensiyuan | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 7007×4134
105 | Región de Murcia (España) | [Sábado Santo en Murcia 19-04-2014 edited.jpg](https://commons.wikimedia.org/wiki/File:S%C3%A1bado_Santo_en_Murcia_19-04-2014_edited.jpg) | nesimo | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | 5184×3456
106 | León (España) | [Cathedral of León - general view.JPG](https://commons.wikimedia.org/wiki/File:Cathedral_of_Le%C3%B3n_-_general_view.JPG) | José Luiz | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 5184×3456
109 | Birmingham (Reino Unido) | [Birmingham panorama 2016.jpg](https://commons.wikimedia.org/wiki/File:Birmingham_panorama_2016.jpg) | kallerna | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 7169×2226
118 | Montreux y castillo de Chillon (Suiza) | [001 Chateau de Chillon and Dents du Midi Photo by Giles Laurent.jpg](https://commons.wikimedia.org/wiki/File:001_Chateau_de_Chillon_and_Dents_du_Midi_Photo_by_Giles_Laurent.jpg) | Giles Laurent | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 7952×5304
124 | Valladolid (España) | [Plaza Mayor de Valladolid.jpg](https://commons.wikimedia.org/wiki/File:Plaza_Mayor_de_Valladolid.jpg) | Jl FilpoC | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 3968×2232
139 | Dortmund y el Ruhr (Alemania) | [Platz der Deutschen Einheit.jpg](https://commons.wikimedia.org/wiki/File:Platz_der_Deutschen_Einheit.jpg) | Lucas Kaufmann | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 3456×2304
140 | Gällivare (Suecia) | [Gällivare water.jpg](https://commons.wikimedia.org/wiki/File:G%C3%A4llivare_water.jpg) | Smiley.toerist | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 4000×2248
144 | Pori (Finlandia) | [Pori Jazz Kokemäenjoki 2013.jpg](https://commons.wikimedia.org/wiki/File:Pori_Jazz_Kokem%C3%A4enjoki_2013.jpg) | J Hokkanen | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 6863×3419
147 | Eger (Hungría) | [2026 View of Eger (from the minaret) 1.jpg](https://commons.wikimedia.org/wiki/File:2026_View_of_Eger_(from_the_minaret)_1.jpg) | Qasinka | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 4032×2688
154 | Florencia (Italia) | [Firenze - Piazzale Michelangelo, Firenze, Italy - April 6, 2015 02.jpg](https://commons.wikimedia.org/wiki/File:Firenze_-_Piazzale_Michelangelo,_Firenze,_Italy_-_April_6,_2015_02.jpg) | Giorgio Galeotti | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | 6016×4016
155 | Perugia y Umbría (Italia) | [Panorama of Perugia 03.jpg](https://commons.wikimedia.org/wiki/File:Panorama_of_Perugia_03.jpg) | Zorro2212 | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 3872×2592
169 | Región de los lagos de Masuria (Polonia) | [Jezioro Niegocin w okolicach Giżycka 071.jpg](https://commons.wikimedia.org/wiki/File:Jezioro_Niegocin_w_okolicach_Gi%C5%BCycka_071.jpg) | Ludwig Schneider | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 3088×2056
171 | Levi (Finlandia) | [View from Levi, Sirkka, Finland.jpg](https://commons.wikimedia.org/wiki/File:View_from_Levi,_Sirkka,_Finland.jpg) | Fanny Schertzer | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 5956×3971
178 | Bursa (Turquía) | [Koza Han, Bursa1.jpg](https://commons.wikimedia.org/wiki/File:Koza_Han,_Bursa1.jpg) | Jocelyn Erskine-Kellie | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | 5883×3887
179 | Grenoble (Francia) | [Grenoble panorama 2012.jpg](https://commons.wikimedia.org/wiki/File:Grenoble_panorama_2012.jpg) | Marcin Białek | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 7923×2645
184 | Reikiavik (Islandia) | [Reykjavík, view from Hallgrímskirkja (2).jpg](https://commons.wikimedia.org/wiki/File:Reykjav%C3%ADk,_view_from_Hallgr%C3%ADmskirkja_(2).jpg) | Olga Ernst | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 4928×3264
186 | Kavala (Grecia) | [Kavala Greece 01.jpg](https://commons.wikimedia.org/wiki/File:Kavala_Greece_01.jpg) | Nikodem Nijaki | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 4512×1772
189 | Capadocia (Turquía) | [Cappadocia balloon trip, Ortahisar Castle (11893715185).jpg](https://commons.wikimedia.org/wiki/File:Cappadocia_balloon_trip,_Ortahisar_Castle_(11893715185).jpg) | Arian Zwegers | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | 5184×3456
191 | Oulu (Finlandia) | [Oulu Cathedral 2020-07-03.jpg](https://commons.wikimedia.org/wiki/File:Oulu_Cathedral_2020-07-03.jpg) | TeuvoSalmenjoki | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 6334×4231
194 | Akureyri (Islandia) | [Akureyri-06-Panorama-2018-gje.jpg](https://commons.wikimedia.org/wiki/File:Akureyri-06-Panorama-2018-gje.jpg) | Gerd Eichmann | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 5184×3456
203 | Esmirna (Turquía) | [Izmir Konak Square.jpg](https://commons.wikimedia.org/wiki/File:Izmir_Konak_Square.jpg) | Ingo Mehling | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 4262×1527
210 | Kajaani (Finlandia) | [Karolineburgin kartano.jpg](https://commons.wikimedia.org/wiki/File:Karolineburgin_kartano.jpg) | Katja Kapanen | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 3606×2404
214 | Kassel (Alemania) | [Kassel - Hercules monument, Kassel - 20170806142922.jpg](https://commons.wikimedia.org/wiki/File:Kassel_-_Hercules_monument,_Kassel_-_20170806142922.jpg) | Grischo | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 3840×2160
219 | Campbeltown y Kintyre (Reino Unido) | [Campbeltown Cross - geograph.org.uk - 3592662.jpg](https://commons.wikimedia.org/wiki/File:Campbeltown_Cross_-_geograph.org.uk_-_3592662.jpg) | Leslie Barrie | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | 5184×3456
220 | Kirkenes (Noruega) | [Kirkenes Harbour.jpg](https://commons.wikimedia.org/wiki/File:Kirkenes_Harbour.jpg) | Mathis Heibert | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | 3872×2592
221 | Isla de Barra (Reino Unido) | [Kisimul and Castlebay Barra (33976033873).jpg](https://commons.wikimedia.org/wiki/File:Kisimul_and_Castlebay_Barra_(33976033873).jpg) | Conor Lawless | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | 7360×4912
230 | Kutná Hora (Chequia) | [Czech panorama (4446984079).jpg](https://commons.wikimedia.org/wiki/File:Czech_panorama_(4446984079).jpg) | Milan Nykodym | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | 3005×1997
234 | Kastoria (Grecia) | [Golden Hour in Kastoria Greece.jpg](https://commons.wikimedia.org/wiki/File:Golden_Hour_in_Kastoria_Greece.jpg) | Jolovema | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 6016×3616
238 | Islay (Reino Unido) | [Port Ellen - Islay - panoramio.jpg](https://commons.wikimedia.org/wiki/File:Port_Ellen_-_Islay_-_panoramio.jpg) | Nigel Brown | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | 3948×2122
240 | Lausana y viñedos de Lavaux (Suiza) | [Lavaux Switzerland.jpg](https://commons.wikimedia.org/wiki/File:Lavaux_Switzerland.jpg) | Lorenz Poffet | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 5463×3073
247 | Levoča (Eslovaquia) | [Levoča Town Hall in Levoča, Levoča District, Slovakia, 2016 June.jpg](https://commons.wikimedia.org/wiki/File:Levo%C4%8Da_Town_Hall_in_Levo%C4%8Da,_Levo%C4%8Da_District,_Slovakia,_2016_June.jpg) | Ximonic (Simo Räsänen) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 3600×2458
253 | Mali Lošinj (Croacia) | [Mali Lošinj croatia.jpg](https://commons.wikimedia.org/wiki/File:Mali_Lo%C5%A1inj_croatia.jpg) | Arne Müseler | [CC BY-SA 3.0 de](https://creativecommons.org/licenses/by-sa/3.0/de/) | 4624×2601
255 | Lublin (Polonia) | [Lublin PanoramaStaregoMiasta.JPG](https://commons.wikimedia.org/wiki/File:Lublin_PanoramaStaregoMiasta.JPG) | Pankrzysztoff | [CC BY-SA 3.0 pl](https://creativecommons.org/licenses/by-sa/3.0/pl/) | 4752×3168
265 | Suceava (Rumanía) | [Suceava fortress (by Pudelek).jpg](https://commons.wikimedia.org/wiki/File:Suceava_fortress_(by_Pudelek).jpg) | Pudelek | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 4029×1562
269 | Aberdeen (Reino Unido) | [+ "Silver City" wird Aberdeen wegen seiner vielen Granitgebäude genannt. 07.jpg](https://commons.wikimedia.org/wiki/File:%2B_%22Silver_City%22_wird_Aberdeen_wegen_seiner_vielen_Granitgeb%C3%A4ude_genannt._07.jpg) | Holger Uwe Schmitt | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 5798×3450
271 | Metz (Francia) | [Metz centre ville.jpg](https://commons.wikimedia.org/wiki/File:Metz_centre_ville.jpg) | Philippe Gisselbrecht / Ville de Metz | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 6651×4439
280 | Montpellier (Francia) | [Montpellier Place de la Comédie.jpg](https://commons.wikimedia.org/wiki/File:Montpellier_Place_de_la_Com%C3%A9die.jpg) | Wolfgang Staudt | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | 4288×2848
298 | Trondheim (Noruega) | [View from Gamle Bybro, Trondheim 04.jpg](https://commons.wikimedia.org/wiki/File:View_from_Gamle_Bybro,_Trondheim_04.jpg) | Satdeep Gill | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 7952×5304
305 | Norwich (Reino Unido) | [Norwich, Elm Hill - geograph.org.uk - 7536266.jpg](https://commons.wikimedia.org/wiki/File:Norwich,_Elm_Hill_-_geograph.org.uk_-_7536266.jpg) | Michael Garlick | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | 8256×5504
306 | Nottingham (Reino Unido) | [Nottingham Council House under amber sky.jpg](https://commons.wikimedia.org/wiki/File:Nottingham_Council_House_under_amber_sky.jpg) | Theofanis Ampatzidis | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 6000×4000
316 | Samsun (Turquía) | [Samsun sea.jpg](https://commons.wikimedia.org/wiki/File:Samsun_sea.jpg) | Annysta | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 4000×2250
322 | Palanga (Lituania) | [Tiškevičiai Palace at dusk, Palanga, Lithuania - Diliff.jpg](https://commons.wikimedia.org/wiki/File:Ti%C5%A1kevi%C4%8Diai_Palace_at_dusk,_Palanga,_Lithuania_-_Diliff.jpg) | Diliff | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 5436×3401
325 | Chambéry (Francia) | [Panorama Chambéry - Rotonde + TGV.JPG](https://commons.wikimedia.org/wiki/File:Panorama_Chamb%C3%A9ry_-_Rotonde_%2B_TGV.JPG) | Florian Pépellin | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 4170×2527
331 | Burdeos (Francia) | [Bordeaux Bourse R05.jpg](https://commons.wikimedia.org/wiki/File:Bordeaux_Bourse_R05.jpg) | Marc Ryckaert (MJJR) | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) | 6106×2269
333 | Nantes (Francia) | [NantesChateau 08.jpg](https://commons.wikimedia.org/wiki/File:NantesChateau_08.jpg) | Selbymay | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 5789×3865
334 | Brno (Chequia) | [Brno View 11.jpg](https://commons.wikimedia.org/wiki/File:Brno_View_11.jpg) | Scotch Mist | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 6016×4000
357 | Porto Santo (Portugal) | [Porto Santo Picos do Facho e Branco.jpg](https://commons.wikimedia.org/wiki/File:Porto_Santo_Picos_do_Facho_e_Branco.jpg) | António Ernesto Martins | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 5184×3456
365 | Préveza (Grecia) | [Port of Preveza 2013.jpg](https://commons.wikimedia.org/wiki/File:Port_of_Preveza_2013.jpg) | Γιάννης Χουβαρδάς (Flickr) | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | 2930×1600
377 | Reggio Calabria (Italia) | [Arena dello Stretto Reggio Calabria.jpg](https://commons.wikimedia.org/wiki/File:Arena_dello_Stretto_Reggio_Calabria.jpg) | Lorenzoshttp | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 3606×2173
399 | Viseu (Portugal) | [Viseu Sé 841.jpg](https://commons.wikimedia.org/wiki/File:Viseu_S%C3%A9_841.jpg) | GFreihalter | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 4896×3264
404 | Sitia (Grecia) | [SITIA-HARBOUR-KAZARMA-FORTRESS-CRETE-GREECE-1.jpg](https://commons.wikimedia.org/wiki/File:SITIA-HARBOUR-KAZARMA-FORTRESS-CRETE-GREECE-1.jpg) | Petro Stelte | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 5472×3648
410 | Sopron (Hungría) | [Storno-ház Tűztorony és Városháza.jpg](https://commons.wikimedia.org/wiki/File:Storno-h%C3%A1z_T%C5%B1ztorony_%C3%A9s_V%C3%A1rosh%C3%A1za.jpg) | Thaler | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 3888×2592
421 | Altos Tatras (Eslovaquia) | [Štrbské pleso RH - panorama.jpg](https://commons.wikimedia.org/wiki/File:%C5%A0trbsk%C3%A9_pleso_RH_-_panorama.jpg) | Roman Horník | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 5770×2048
437 | Pamukkale (Turquía) | [Pamukkale, Denizli 2026 68.jpg](https://commons.wikimedia.org/wiki/File:Pamukkale,_Denizli_2026_68.jpg) | Biologg | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 5760×3840
438 | York (Reino Unido) | [York - York Minster from the north west city walls - geograph.org.uk - 8081888.jpg](https://commons.wikimedia.org/wiki/File:York_-_York_Minster_from_the_north_west_city_walls_-_geograph.org.uk_-_8081888.jpg) | Chris Gorringe | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | 3872×2592
439 | Tihany y el lago Balatón (Hungría) | [Balaton - Tihany.jpg](https://commons.wikimedia.org/wiki/File:Balaton_-_Tihany.jpg) | Josep Renalias Lohen11 | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 4805×3056
441 | Tiree (Reino Unido) | [Brock, towards Gott Bay - geograph.org.uk - 4484303.jpg](https://commons.wikimedia.org/wiki/File:Brock,_towards_Gott_Bay_-_geograph.org.uk_-_4484303.jpg) | Gordon Hatton | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) | 3897×2000
452 | Malmö (Suecia) | [Malmö–flygbild 06 september 2014.jpg](https://commons.wikimedia.org/wiki/File:Malm%C3%B6%E2%80%93flygbild_06_september_2014.jpg) | David Castor | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) | 3841×2561
461 | Scíathos (Grecia) | [Skiathos 10 - panoramio.jpg](https://commons.wikimedia.org/wiki/File:Skiathos_10_-_panoramio.jpg) | Mrcsifkin | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 6016×4000
468 | Vitoria-Gasteiz (España) | [Vitoria - Plaza de la Virgen Blanca 01.jpg](https://commons.wikimedia.org/wiki/File:Vitoria_-_Plaza_de_la_Virgen_Blanca_01.jpg) | Basotxerri | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 4592×3055
469 | Volos (Grecia) | [Volos port February 2023.jpg](https://commons.wikimedia.org/wiki/File:Volos_port_February_2023.jpg) | Khane Rokhl Barazani | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | 8642×3948
474 | Tesalónica (Grecia) | [Tessaloniki BW 2017-10-05 18-22-47.jpg](https://commons.wikimedia.org/wiki/File:Tessaloniki_BW_2017-10-05_18-22-47.jpg) | Berthold Werner | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 5787×3582
483 | Zúrich (Suiza) | [Zürich view Quaibrücke 20200702.jpg](https://commons.wikimedia.org/wiki/File:Z%C3%BCrich_view_Quaibr%C3%BCcke_20200702.jpg) | Daniel Kraft | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) | 12732×6619

## Destinos que se mantienen

Nº | Destino | Foto actual
---|---|---
8 | Linz (Austria) | 064_Linz_city_skyline_with_Danube_river_-_Linz,_Austria_HDR_-_Oostenrijk.jpg
33 | Alejandrópolis (Grecia) | Alexandroupolis_lighthouse_(November_2018).jpg
34 | Alicante (España) | Alicante,_Spain.jpg
70 | Hull y Humberside (Reino Unido) | Beverley_Minster_(23655270595).jpg
115 | Châlons-en-Champagne (Francia) | Châlons-HDV(2025).jpg
122 | Erzurum (Turquía) | Çifte_Minareli_Medrese_(Erzurum)_Exterior_front_side_in_2006_3278_straightened.jpg
130 | Bragança (Portugal) | Cruzeiro_do_Outeiro_4_(cropped).jpg
188 | Hévíz (Hungría) | Heviz_lake_HMTE.jpg
249 | Liverpool (Reino Unido) | Liverpool_Waterfront_and_the_Three_Graces_-_geograph.org.uk_-_3675320.jpg
297 | Craiova (Rumanía) | Nicolae_Romanescu_Park_in_Craiova,_Romania.jpg
330 | Rijeka (Croacia) | Panorama_of_Rijeka_(52829644470).jpg
338 | Pafos (Chipre) | Paphos_-_Flickr_-_sergei.gussev_(1).jpg
351 | Deauville (Francia) | Plage_Deauville_-_panoramio.jpg
390 | Sabadell (España) | Sabadell_-_Eix_Macià.jpg
391 | Saint-Étienne (Francia) | Saint_Étienne-Hôtel_de_ville-20110117.jpg
392 | Cork (Irlanda) | Saint_Fin_Barre's_Cathedral_(Cork)_2016.jpg
451 | Çanakkale (Turquía) | Troy_National_Park_1.jpg
478 | Östersund (Åre) (Suecia) | Yy_från_Frösön_mot_Östersund.jpg
481 | Zante (Grecia) | Zakynthos_Town_-_Panoramic_View.jpg
242 | Crotona y Capo Rizzuto (Italia) | Le_Castella_-_Castello_Aragonese_-_03.jpg

## Prueba

`tests/europe-photo-upgrade.test.cjs` (con `tests/fixtures/europe-photo-upgrade.json`): comprueba que las 16 tarjetas de portada no cambian (contenido, orden, textos, imágenes y huella), que las 86 fotos nuevas tienen la fuente, autor y licencia aprobados, que los 20 destinos que se mantienen no cambian y que ningún otro destino ha cambiado (380 destinos, huella verificada también contra la versión anterior).
