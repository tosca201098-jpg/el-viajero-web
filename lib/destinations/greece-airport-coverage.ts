import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, i) => [locale, values[i]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const seasons = localize([
  'Primavera y otoño son buenas épocas para pasear; en verano puede haber más visitantes. Los meses tranquilos no garantizan precios bajos. Comprueba el tiempo y los horarios de visita.',
  'Spring and autumn suit walking; summer can be busier. Quieter months do not guarantee low prices. Check the weather and attraction opening times.',
  'Le printemps et l’automne se prêtent aux promenades ; l’été peut être plus fréquenté. Les mois calmes ne garantissent pas des prix bas. Vérifiez la météo et les horaires de visite.',
  'Frühling und Herbst eignen sich für Spaziergänge; im Sommer kann es voller sein. Ruhigere Monate garantieren keine niedrigen Preise. Wetter und Öffnungszeiten prüfen.',
  'Primavera e autunno sono adatti alle passeggiate; l’estate può essere più affollata. I mesi tranquilli non garantiscono prezzi bassi. Controlla meteo e orari di visita.',
  'Primavera e outono são boas épocas para passear; o verão pode ter mais visitantes. Os meses tranquilos não garantem preços baixos. Confirme o tempo e os horários das visitas.',
  'Primavera i tardor són bones èpoques per passejar; a l’estiu hi pot haver més visitants. Els mesos tranquils no garanteixen preus baixos. Comprova el temps i els horaris de visita.',
]);

const seeds = [
  {
    "slug": "kavala",
    "code": "KVA",
    "airport": "Kavala — Alexander the Great",
    "town": "Kavala",
    "aliases": [
      "Kavala",
      "Cavala",
      "Megas Alexandros"
    ],
    "stay": "2–3",
    "photo": [
      "Kavala_Greece_01.jpg",
      "51",
      "Nikodem Nijaki",
      "CC BY-SA 3.0",
      "https://creativecommons.org/licenses/by-sa/3.0/"
    ],
    "names": [
      "Kavala",
      "Kavala",
      "Kavala",
      "Kavala",
      "Kavala",
      "Cavala",
      "Kavala"
    ],
    "descriptions": [
      "El puerto, el barrio de Panagia y el acueducto Kamares dibujan una ciudad costera con patrimonio e historia del tabaco.",
      "The harbour, Panagia quarter and Kamares aqueduct shape a coastal city with heritage and a history of tobacco trading.",
      "Le port, le quartier de Panagia et l’aqueduc de Kamares dessinent une ville côtière au riche patrimoine lié au tabac.",
      "Hafen, Panagia-Viertel und Kamares-Aquädukt prägen eine Küstenstadt mit Kulturerbe und Geschichte des Tabakhandels.",
      "Il porto, il quartiere Panagia e l’acquedotto Kamares disegnano una città costiera dal patrimonio legato al tabacco.",
      "O porto, o bairro de Panagia e o aqueduto Kamares desenham uma cidade costeira com património ligado ao tabaco.",
      "El port, el barri de Panagia i l’aqüeducte Kamares dibuixen una ciutat costanera amb patrimoni lligat al tabac."
    ],
    "recommendations": [
      [
        "Barrio de Panagia",
        "Panagia old quarter",
        "Vieux quartier de Panagia",
        "Altstadtviertel Panagia",
        "Quartiere storico Panagia",
        "Bairro antigo de Panagia",
        "Barri antic de Panagia"
      ],
      [
        "Castillo de Kavala",
        "Kavala Castle",
        "Château de Kavala",
        "Burg von Kavala",
        "Castello di Kavala",
        "Castelo de Cavala",
        "Castell de Kavala"
      ],
      [
        "Acueducto Kamares",
        "Kamares aqueduct",
        "Aqueduc de Kamares",
        "Kamares-Aquädukt",
        "Acquedotto Kamares",
        "Aqueduto Kamares",
        "Aqüeducte Kamares"
      ],
      [
        "Museo del Tabaco",
        "Tobacco Museum",
        "Musée du Tabac",
        "Tabakmuseum",
        "Museo del Tabacco",
        "Museu do Tabaco",
        "Museu del Tabac"
      ]
    ],
    "notes": [
      "KVA está fuera de Kavala; prevé el traslado por carretera hasta la ciudad. Comprueba vuelos y transporte para tus fechas: la oferta internacional puede ser estacional.",
      "KVA is outside Kavala; allow for a road transfer to the city. Check flights and transport for your dates: international service may be seasonal.",
      "KVA se trouve hors de Kavala ; prévoyez le transfert routier vers la ville. Vérifiez vols et transports pour vos dates : l’offre internationale peut être saisonnière.",
      "KVA liegt außerhalb von Kavala; den Straßentransfer in die Stadt einplanen. Flüge und Verkehr für die Reisedaten prüfen: internationale Angebote können saisonal sein.",
      "KVA si trova fuori Kavala; prevedi il trasferimento su strada in città. Controlla voli e trasporti per le tue date: l’offerta internazionale può essere stagionale.",
      "KVA fica fora de Cavala; preveja o transporte por estrada até à cidade. Confirme voos e transportes para as suas datas: a oferta internacional pode ser sazonal.",
      "KVA és fora de Kavala; preveu el trasllat per carretera a la ciutat. Comprova vols i transport per a les teves dates: l’oferta internacional pot ser estacional."
    ]
  },
  {
    "slug": "mytilene",
    "code": "MJT",
    "airport": "Mytilene — Odysseas Elytis",
    "town": "Mytilene",
    "aliases": [
      "Mytilene",
      "Mytilini",
      "Mitilini",
      "Lesbos",
      "Lesvos"
    ],
    "stay": "3–4",
    "photo": [
      "Mytilene_2010-04-03.jpg",
      "e5",
      "Koutrolm",
      "Public domain",
      "https://creativecommons.org/publicdomain/mark/1.0/"
    ],
    "names": [
      "Mitilene",
      "Mytilene",
      "Mytilène",
      "Mytilini",
      "Mitilene",
      "Mitilene",
      "Mitilene"
    ],
    "descriptions": [
      "El puerto y el castillo de Mitilene ofrecen una base urbana para descubrir el patrimonio de Lesbos, reservando tiempo para recorrer la isla.",
      "Mytilene’s harbour and castle offer an urban base for Lesbos’s heritage, with time needed to explore the island.",
      "Le port et le château de Mytilène offrent une base urbaine pour découvrir le patrimoine de Lesbos en prévoyant les trajets sur l’île.",
      "Hafen und Burg von Mytilini bieten eine städtische Basis für Lesbos’ Kulturerbe; für Inselerkundungen Zeit einplanen.",
      "Il porto e il castello di Mitilene offrono una base urbana per il patrimonio di Lesbo, prevedendo tempo per gli spostamenti sull’isola.",
      "O porto e o castelo de Mitilene oferecem uma base urbana para descobrir o património de Lesbos, reservando tempo para percorrer a ilha.",
      "El port i el castell de Mitilene ofereixen una base urbana per descobrir el patrimoni de Lesbos, reservant temps per recórrer l’illa."
    ],
    "recommendations": [
      [
        "Castillo de Mitilene",
        "Mytilene Castle",
        "Château de Mytilène",
        "Burg von Mytilini",
        "Castello di Mitilene",
        "Castelo de Mitilene",
        "Castell de Mitilene"
      ],
      [
        "Puerto de Mitilene",
        "Mytilene harbour",
        "Port de Mytilène",
        "Hafen von Mytilini",
        "Porto di Mitilene",
        "Porto de Mitilene",
        "Port de Mitilene"
      ],
      [
        "Museo Arqueológico de Mitilene",
        "Archaeological Museum of Mytilene",
        "Musée archéologique de Mytilène",
        "Archäologisches Museum Mytilini",
        "Museo archeologico di Mitilene",
        "Museu Arqueológico de Mitilene",
        "Museu Arqueològic de Mitilene"
      ],
      [
        "Iglesia de Agios Therapon",
        "Agios Therapon church",
        "Église Agios Therapon",
        "Kirche Agios Therapon",
        "Chiesa Agios Therapon",
        "Igreja de Agios Therapon",
        "Església d’Agios Therapon"
      ]
    ],
    "notes": [
      "MJT está en la isla de Lesbos, fuera del centro de Mitilene. Organiza el traslado terrestre y comprueba la estacionalidad de vuelos y servicios. Visitar otros pueblos de la isla requiere desplazamientos adicionales.",
      "MJT is on Lesbos outside central Mytilene. Arrange the ground transfer and check seasonal flights and services. Visiting other island towns requires additional travel.",
      "MJT se trouve sur Lesbos, hors du centre de Mytilène. Prévoyez le transfert terrestre et vérifiez la saisonnalité des vols et services. Les autres localités de l’île nécessitent des trajets supplémentaires.",
      "MJT liegt auf Lesbos außerhalb des Zentrums von Mytilini. Landtransfer und saisonale Flüge und Angebote prüfen. Andere Inselorte erfordern zusätzliche Fahrten.",
      "MJT si trova a Lesbo, fuori dal centro di Mitilene. Organizza il trasferimento e verifica la stagionalità di voli e servizi. Visitare altri paesi dell’isola richiede ulteriori spostamenti.",
      "MJT fica na ilha de Lesbos, fora do centro de Mitilene. Organize o transporte terrestre e confirme a sazonalidade dos voos e serviços. Visitar outras localidades da ilha exige deslocações adicionais.",
      "MJT és a l’illa de Lesbos, fora del centre de Mitilene. Organitza el trasllat terrestre i comprova l’estacionalitat de vols i serveis. Visitar altres pobles de l’illa requereix desplaçaments addicionals."
    ]
  },
  {
    "slug": "paros",
    "code": "PAS",
    "airport": "Paros Airport",
    "town": "Parikia",
    "stay": "4–5",
    "aliases": [
      "Paros",
      "Paro",
      "Parikia",
      "Paroikia",
      "Naoussa Paros",
      "Naousa Paros",
      "Πάρος"
    ],
    "photo": [
      "Naoussa,_Paros.jpg",
      "6b",
      "Holger Pfiffi",
      "Public domain",
      "https://creativecommons.org/publicdomain/mark/1.0/"
    ],
    "names": [
      "Paros",
      "Paros",
      "Paros",
      "Paros",
      "Paro",
      "Paros",
      "Paros"
    ],
    "descriptions": [
      "Pueblos blancos, patrimonio de Parikia y puerto de Naoussa para explorar la vida de las Cícladas.",
      "Whitewashed villages, Parikia’s heritage and Naoussa’s harbour introduce life in the Cyclades.",
      "Villages blancs, patrimoine de Parikia et port de Naoussa pour découvrir la vie des Cyclades.",
      "Weiße Dörfer, Parikias Kulturerbe und Naoussas Hafen erschließen das Leben auf den Kykladen.",
      "Paesi bianchi, patrimonio di Parikia e porto di Naoussa per scoprire la vita delle Cicladi.",
      "Aldeias brancas, património de Parikia e porto de Naoussa para descobrir a vida das Cíclades.",
      "Pobles blancs, patrimoni de Parikia i port de Naoussa per descobrir la vida de les Cíclades."
    ],
    "recommendations": [
      [
        "Casco antiguo de Parikia",
        "Parikia Old Town",
        "Vieille ville de Parikia",
        "Altstadt von Parikia",
        "Centro storico di Parikia",
        "Centro histórico de Parikia",
        "Nucli antic de Parikia"
      ],
      [
        "Panagia Ekatontapiliani",
        "Panagia Ekatontapiliani",
        "Panagia Ekatontapiliani",
        "Panagia Ekatontapiliani",
        "Panagia Ekatontapiliani",
        "Panagia Ekatontapiliani",
        "Panagia Ekatontapiliani"
      ],
      [
        "Puerto de Naoussa",
        "Naoussa harbour",
        "Port de Naoussa",
        "Hafen von Naoussa",
        "Porto di Naoussa",
        "Porto de Naoussa",
        "Port de Naoussa"
      ],
      [
        "Pueblo de Lefkes",
        "Lefkes village",
        "Village de Lefkes",
        "Dorf Lefkes",
        "Paese di Lefkes",
        "Aldeia de Lefkes",
        "Poble de Lefkes"
      ]
    ],
    "notes": [
      "Llegada por PAS. El aeropuerto y la localidad de referencia son lugares distintos: organiza el traslado terrestre y los desplazamientos por la isla. Comprueba vuelos, transportes y servicios para tus fechas; la oferta puede ser estacional.",
      "Arrive via PAS. The airport and reference town are separate places: arrange ground transport and journeys around the island. Check flights, transport and services for your dates; availability can be seasonal.",
      "Arrivée par PAS. L’aéroport et la localité de référence sont distincts : prévoyez le transfert terrestre et les trajets sur l’île. Vérifiez vols, transports et services pour vos dates ; l’offre peut être saisonnière.",
      "Anreise über PAS. Flughafen und Bezugsort sind getrennte Orte: Landtransfer und Fahrten auf der Insel einplanen. Flüge, Verkehrsmittel und Angebote für die Reisedaten prüfen; das Angebot kann saisonal sein.",
      "Arrivo tramite PAS. L’aeroporto e la località di riferimento sono luoghi distinti: organizza il trasferimento terrestre e gli spostamenti sull’isola. Verifica voli, trasporti e servizi per le tue date; l’offerta può essere stagionale.",
      "Chegada por PAS. O aeroporto e a localidade de referência são lugares distintos: organize o transporte terrestre e as deslocações pela ilha. Confirme voos, transportes e serviços para as suas datas; a oferta pode ser sazonal.",
      "Arribada per PAS. L’aeroport i la localitat de referència són llocs diferents: organitza el trasllat terrestre i els desplaçaments per l’illa. Comprova vols, transports i serveis per a les teves dates; l’oferta pot ser estacional."
    ]
  },
  {
    "slug": "naxos",
    "code": "JNX",
    "airport": "Naxos Airport",
    "town": "Naxos Town (Chora)",
    "stay": "4–5",
    "aliases": [
      "Naxos",
      "Náxos",
      "Nasso",
      "Naxos Town",
      "Chora Naxos",
      "Chora de Naxos",
      "Hora Naxos",
      "Νάξος"
    ],
    "photo": [
      "GR-naxos-chora-portara.jpg",
      "7f",
      "User: Bgabel at wikivoyage shared",
      "CC BY-SA 3.0",
      "https://creativecommons.org/licenses/by-sa/3.0/"
    ],
    "names": [
      "Naxos",
      "Naxos",
      "Naxos",
      "Naxos",
      "Nasso",
      "Naxos",
      "Naxos"
    ],
    "descriptions": [
      "La Portara, las callejuelas de Chora y los pueblos del interior combinan patrimonio y paisajes insulares.",
      "The Portara, Chora’s lanes and inland villages combine heritage with island landscapes.",
      "La Portara, les ruelles de Chora et les villages de l’intérieur mêlent patrimoine et paysages insulaires.",
      "Portara, Choras Gassen und Dörfer im Inselinneren verbinden Kulturerbe mit Insellandschaften.",
      "La Portara, i vicoli di Chora e i paesi dell’interno uniscono patrimonio e paesaggi insulari.",
      "A Portara, as ruelas de Chora e as aldeias do interior combinam património e paisagens insulares.",
      "La Portara, els carrerons de Khora i els pobles de l’interior combinen patrimoni i paisatges insulars."
    ],
    "recommendations": [
      [
        "Portara",
        "Portara",
        "Portara",
        "Portara",
        "Portara",
        "Portara",
        "Portara"
      ],
      [
        "Kastro de Chora",
        "Chora Kastro",
        "Kastro de Chora",
        "Kastro von Chora",
        "Kastro di Chora",
        "Kastro de Chora",
        "Kastro de Khora"
      ],
      [
        "Pueblo de Apeiranthos",
        "Apeiranthos village",
        "Village d’Apeiranthos",
        "Dorf Apeiranthos",
        "Paese di Apeiranthos",
        "Aldeia de Apeiranthos",
        "Poble d’Apeiranthos"
      ],
      [
        "Playa de Agios Prokopios",
        "Agios Prokopios beach",
        "Plage d’Agios Prokopios",
        "Strand Agios Prokopios",
        "Spiaggia di Agios Prokopios",
        "Praia de Agios Prokopios",
        "Platja d’Agios Prokopios"
      ]
    ],
    "notes": [
      "Llegada por JNX. El aeropuerto y la localidad de referencia son lugares distintos: organiza el traslado terrestre y los desplazamientos por la isla. Comprueba vuelos, transportes y servicios para tus fechas; la oferta puede ser estacional.",
      "Arrive via JNX. The airport and reference town are separate places: arrange ground transport and journeys around the island. Check flights, transport and services for your dates; availability can be seasonal.",
      "Arrivée par JNX. L’aéroport et la localité de référence sont distincts : prévoyez le transfert terrestre et les trajets sur l’île. Vérifiez vols, transports et services pour vos dates ; l’offre peut être saisonnière.",
      "Anreise über JNX. Flughafen und Bezugsort sind getrennte Orte: Landtransfer und Fahrten auf der Insel einplanen. Flüge, Verkehrsmittel und Angebote für die Reisedaten prüfen; das Angebot kann saisonal sein.",
      "Arrivo tramite JNX. L’aeroporto e la località di riferimento sono luoghi distinti: organizza il trasferimento terrestre e gli spostamenti sull’isola. Verifica voli, trasporti e servizi per le tue date; l’offerta può essere stagionale.",
      "Chegada por JNX. O aeroporto e a localidade de referência são lugares distintos: organize o transporte terrestre e as deslocações pela ilha. Confirme voos, transportes e serviços para as suas datas; a oferta pode ser sazonal.",
      "Arribada per JNX. L’aeroport i la localitat de referència són llocs diferents: organitza el trasllat terrestre i els desplaçaments per l’illa. Comprova vols, transports i serveis per a les teves dates; l’oferta pot ser estacional."
    ]
  },
  {
    "slug": "milos",
    "code": "MLO",
    "airport": "Milos Airport",
    "town": "Adamas (Milos)",
    "stay": "4–5",
    "aliases": [
      "Milos",
      "Milo",
      "Melos",
      "Adamas",
      "Adamantas",
      "Μήλος"
    ],
    "photo": [
      "Aerial_view_of_Sarakiniko_Beach_on_Milos_Island,_Greece.jpg",
      "ab",
      "dronepicr",
      "CC BY 2.0",
      "https://creativecommons.org/licenses/by/2.0/"
    ],
    "names": [
      "Milos",
      "Milos",
      "Milos",
      "Milos",
      "Milo",
      "Milos",
      "Milos"
    ],
    "descriptions": [
      "Paisajes volcánicos, costa blanca y pueblos marineros para conocer una isla de geología singular.",
      "Volcanic scenery, white coastline and fishing villages reveal an island shaped by distinctive geology.",
      "Paysages volcaniques, côte blanche et villages de pêcheurs révèlent une île à la géologie singulière.",
      "Vulkanlandschaften, weiße Küsten und Fischerdörfer erschließen eine Insel mit besonderer Geologie.",
      "Paesaggi vulcanici, costa bianca e borghi marinari raccontano un’isola dalla geologia singolare.",
      "Paisagens vulcânicas, costa branca e aldeias piscatórias revelam uma ilha de geologia singular.",
      "Paisatges volcànics, costa blanca i pobles mariners per conèixer una illa de geologia singular."
    ],
    "recommendations": [
      [
        "Sarakiniko",
        "Sarakiniko",
        "Sarakiniko",
        "Sarakiniko",
        "Sarakiniko",
        "Sarakiniko",
        "Sarakiniko"
      ],
      [
        "Pueblo de Plaka",
        "Plaka village",
        "Village de Plaka",
        "Dorf Plaka",
        "Paese di Plaka",
        "Aldeia de Plaka",
        "Poble de Plaka"
      ],
      [
        "Puerto de Adamas",
        "Adamas harbour",
        "Port d’Adamas",
        "Hafen von Adamas",
        "Porto di Adamas",
        "Porto de Adamas",
        "Port d’Adamas"
      ],
      [
        "Museo Minero de Milos",
        "Milos Mining Museum",
        "Musée minier de Milos",
        "Bergbaumuseum Milos",
        "Museo minerario di Milo",
        "Museu Mineiro de Milos",
        "Museu Miner de Milos"
      ]
    ],
    "notes": [
      "Llegada por MLO. El aeropuerto y la localidad de referencia son lugares distintos: organiza el traslado terrestre y los desplazamientos por la isla. Comprueba vuelos, transportes y servicios para tus fechas; la oferta puede ser estacional.",
      "Arrive via MLO. The airport and reference town are separate places: arrange ground transport and journeys around the island. Check flights, transport and services for your dates; availability can be seasonal.",
      "Arrivée par MLO. L’aéroport et la localité de référence sont distincts : prévoyez le transfert terrestre et les trajets sur l’île. Vérifiez vols, transports et services pour vos dates ; l’offre peut être saisonnière.",
      "Anreise über MLO. Flughafen und Bezugsort sind getrennte Orte: Landtransfer und Fahrten auf der Insel einplanen. Flüge, Verkehrsmittel und Angebote für die Reisedaten prüfen; das Angebot kann saisonal sein.",
      "Arrivo tramite MLO. L’aeroporto e la località di riferimento sono luoghi distinti: organizza il trasferimento terrestre e gli spostamenti sull’isola. Verifica voli, trasporti e servizi per le tue date; l’offerta può essere stagionale.",
      "Chegada por MLO. O aeroporto e a localidade de referência são lugares distintos: organize o transporte terrestre e as deslocações pela ilha. Confirme voos, transportes e serviços para as suas datas; a oferta pode ser sazonal.",
      "Arribada per MLO. L’aeroport i la localitat de referència són llocs diferents: organitza el trasllat terrestre i els desplaçaments per l’illa. Comprova vols, transports i serveis per a les teves dates; l’oferta pot ser estacional."
    ]
  },
  {
    "slug": "chios",
    "code": "JKH",
    "airport": "Chios — Omiros",
    "town": "Chios Town",
    "stay": "4–5",
    "aliases": [
      "Chios",
      "Chíos",
      "Quíos",
      "Quios",
      "Chio",
      "Hios",
      "Khios",
      "Omiros",
      "Χίος"
    ],
    "photo": [
      "Chios_-_Port_of_Chios.jpg",
      "af",
      "Güldem Üstün",
      "CC BY 2.0",
      "https://creativecommons.org/licenses/by/2.0/"
    ],
    "names": [
      "Quíos",
      "Chios",
      "Chios",
      "Chios",
      "Chio",
      "Quios",
      "Quios"
    ],
    "descriptions": [
      "Pueblos medievales y patrimonio de la almáciga para descubrir Quíos desde su ciudad portuaria.",
      "Medieval villages and mastic heritage invite exploration of Chios from its port town.",
      "Villages médiévaux et patrimoine du mastic invitent à découvrir Chios depuis sa ville portuaire.",
      "Mittelalterliche Dörfer und Mastixkultur laden dazu ein, Chios von seiner Hafenstadt aus zu erkunden.",
      "Borghi medievali e patrimonio del mastice invitano a scoprire Chio dalla sua città portuale.",
      "Aldeias medievais e património da mástique convidam a descobrir Quios a partir da sua cidade portuária.",
      "Pobles medievals i patrimoni del llentiscle conviden a descobrir Quios des de la seva ciutat portuària."
    ],
    "recommendations": [
      [
        "Pueblo de Pyrgi",
        "Pyrgi village",
        "Village de Pyrgi",
        "Dorf Pyrgi",
        "Borgo di Pyrgi",
        "Aldeia de Pyrgi",
        "Poble de Pyrgi"
      ],
      [
        "Pueblo de Mesta",
        "Mesta village",
        "Village de Mesta",
        "Dorf Mesta",
        "Borgo di Mesta",
        "Aldeia de Mesta",
        "Poble de Mesta"
      ],
      [
        "Monasterio de Nea Moni",
        "Nea Moni monastery",
        "Monastère de Nea Moni",
        "Kloster Nea Moni",
        "Monastero di Nea Moni",
        "Mosteiro de Nea Moni",
        "Monestir de Nea Moni"
      ],
      [
        "Museo de la Almáciga de Quíos",
        "Chios Mastic Museum",
        "Musée du mastic de Chios",
        "Mastixmuseum Chios",
        "Museo del mastice di Chio",
        "Museu da Mástique de Quios",
        "Museu del Màstic de Quios"
      ]
    ],
    "notes": [
      "Llegada por JKH. El aeropuerto y la localidad de referencia son lugares distintos: organiza el traslado terrestre y los desplazamientos por la isla. Comprueba vuelos, transportes y servicios para tus fechas; la oferta puede ser estacional.",
      "Arrive via JKH. The airport and reference town are separate places: arrange ground transport and journeys around the island. Check flights, transport and services for your dates; availability can be seasonal.",
      "Arrivée par JKH. L’aéroport et la localité de référence sont distincts : prévoyez le transfert terrestre et les trajets sur l’île. Vérifiez vols, transports et services pour vos dates ; l’offre peut être saisonnière.",
      "Anreise über JKH. Flughafen und Bezugsort sind getrennte Orte: Landtransfer und Fahrten auf der Insel einplanen. Flüge, Verkehrsmittel und Angebote für die Reisedaten prüfen; das Angebot kann saisonal sein.",
      "Arrivo tramite JKH. L’aeroporto e la località di riferimento sono luoghi distinti: organizza il trasferimento terrestre e gli spostamenti sull’isola. Verifica voli, trasporti e servizi per le tue date; l’offerta può essere stagionale.",
      "Chegada por JKH. O aeroporto e a localidade de referência são lugares distintos: organize o transporte terrestre e as deslocações pela ilha. Confirme voos, transportes e serviços para as suas datas; a oferta pode ser sazonal.",
      "Arribada per JKH. L’aeroport i la localitat de referència són llocs diferents: organitza el trasllat terrestre i els desplaçaments per l’illa. Comprova vols, transports i serveis per a les teves dates; l’oferta pot ser estacional."
    ]
  },
  {
    "slug": "karpathos",
    "code": "AOK",
    "airport": "Karpathos Airport",
    "town": "Pigadia (Karpathos)",
    "stay": "4–5",
    "aliases": [
      "Karpathos",
      "Kárpatos",
      "Carpatos",
      "Carpato",
      "Scarpanto",
      "Pigadia",
      "Κάρπαθος"
    ],
    "photo": [
      "Olympos_Karpathos_001.jpg",
      "da",
      "Luca Aless",
      "CC0 1.0",
      "https://creativecommons.org/publicdomain/zero/1.0/"
    ],
    "names": [
      "Kárpatos",
      "Karpathos",
      "Karpathos",
      "Karpathos",
      "Scarpanto",
      "Cárpatos",
      "Kàrpathos"
    ],
    "descriptions": [
      "Pueblos de montaña, tradiciones de Olympos y costa del Dodecaneso, con tiempo para recorrer la isla.",
      "Mountain villages, Olympos traditions and Dodecanese coastline reward time spent exploring the island.",
      "Villages de montagne, traditions d’Olympos et littoral du Dodécanèse se découvrent en prévoyant les trajets.",
      "Bergdörfer, die Traditionen von Olympos und Dodekanes-Küsten lohnen eine Inselreise mit Zeit für Fahrten.",
      "Paesi di montagna, tradizioni di Olympos e costa del Dodecaneso da scoprire prevedendo tempo per gli spostamenti.",
      "Aldeias de montanha, tradições de Olympos e costa do Dodecaneso, com tempo para percorrer a ilha.",
      "Pobles de muntanya, tradicions d’Olympos i costa del Dodecanès, amb temps per recórrer l’illa."
    ],
    "recommendations": [
      [
        "Pueblo de Olympos",
        "Olympos village",
        "Village d’Olympos",
        "Dorf Olympos",
        "Paese di Olympos",
        "Aldeia de Olympos",
        "Poble d’Olympos"
      ],
      [
        "Puerto de Pigadia",
        "Pigadia harbour",
        "Port de Pigadia",
        "Hafen von Pigadia",
        "Porto di Pigadia",
        "Porto de Pigadia",
        "Port de Pigadia"
      ],
      [
        "Pueblo de Menetes",
        "Menetes village",
        "Village de Menetes",
        "Dorf Menetes",
        "Paese di Menetes",
        "Aldeia de Menetes",
        "Poble de Menetes"
      ],
      [
        "Bahía de Amoopi",
        "Amoopi bay",
        "Baie d’Amoopi",
        "Bucht von Amoopi",
        "Baia di Amoopi",
        "Baía de Amoopi",
        "Badia d’Amoopi"
      ]
    ],
    "notes": [
      "Llegada por AOK. El aeropuerto y la localidad de referencia son lugares distintos: organiza el traslado terrestre y los desplazamientos por la isla. Comprueba vuelos, transportes y servicios para tus fechas; la oferta puede ser estacional.",
      "Arrive via AOK. The airport and reference town are separate places: arrange ground transport and journeys around the island. Check flights, transport and services for your dates; availability can be seasonal.",
      "Arrivée par AOK. L’aéroport et la localité de référence sont distincts : prévoyez le transfert terrestre et les trajets sur l’île. Vérifiez vols, transports et services pour vos dates ; l’offre peut être saisonnière.",
      "Anreise über AOK. Flughafen und Bezugsort sind getrennte Orte: Landtransfer und Fahrten auf der Insel einplanen. Flüge, Verkehrsmittel und Angebote für die Reisedaten prüfen; das Angebot kann saisonal sein.",
      "Arrivo tramite AOK. L’aeroporto e la località di riferimento sono luoghi distinti: organizza il trasferimento terrestre e gli spostamenti sull’isola. Verifica voli, trasporti e servizi per le tue date; l’offerta può essere stagionale.",
      "Chegada por AOK. O aeroporto e a localidade de referência são lugares distintos: organize o transporte terrestre e as deslocações pela ilha. Confirme voos, transportes e serviços para as suas datas; a oferta pode ser sazonal.",
      "Arribada per AOK. L’aeroport i la localitat de referència són llocs diferents: organitza el trasllat terrestre i els desplaçaments per l’illa. Comprova vols, transports i serveis per a les teves dates; l’oferta pot ser estacional."
    ]
  },
  {
    "slug": "alexandroupoli",
    "code": "AXD",
    "airport": "Alexandroupolis — Dimokritos",
    "town": "Alexandroupoli",
    "stay": "2–3",
    "aliases": [
      "Alexandroupoli",
      "Alexandroupolis",
      "Alejandrópolis",
      "Alejandropolis",
      "Alexandroúpoli",
      "Alexandrópolis",
      "Alessandropoli",
      "Dimokritos",
      "Democritus",
      "Αλεξανδρούπολη"
    ],
    "photo": [
      "Alexandroupolis_lighthouse_(November_2018).jpg",
      "77",
      "Texniths",
      "CC BY-SA 4.0",
      "https://creativecommons.org/licenses/by-sa/4.0/"
    ],
    "names": [
      "Alejandrópolis",
      "Alexandroupoli",
      "Alexandroúpoli",
      "Alexandroupoli",
      "Alessandropoli",
      "Alexandrópolis",
      "Alexandrúpoli"
    ],
    "descriptions": [
      "El faro y el paseo marítimo ofrecen una base urbana para descubrir el patrimonio y la naturaleza de Tracia.",
      "The lighthouse and waterfront offer an urban base for exploring Thrace’s heritage and nature.",
      "Le phare et le front de mer offrent une base urbaine pour découvrir le patrimoine et la nature de Thrace.",
      "Leuchtturm und Uferpromenade bieten eine städtische Basis für das Kulturerbe und die Natur Thrakiens.",
      "Il faro e il lungomare offrono una base urbana per scoprire il patrimonio e la natura della Tracia.",
      "O farol e o passeio marítimo oferecem uma base urbana para descobrir o património e a natureza da Trácia.",
      "El far i el passeig marítim ofereixen una base urbana per descobrir el patrimoni i la natura de Tràcia."
    ],
    "recommendations": [
      [
        "Faro de Alejandrópolis",
        "Alexandroupoli lighthouse",
        "Phare d’Alexandroúpoli",
        "Leuchtturm Alexandroupoli",
        "Faro di Alessandropoli",
        "Farol de Alexandrópolis",
        "Far d’Alexandrúpoli"
      ],
      [
        "Paseo marítimo",
        "Waterfront promenade",
        "Promenade du front de mer",
        "Uferpromenade",
        "Lungomare",
        "Passeio marítimo",
        "Passeig marítim"
      ],
      [
        "Museo Etnológico de Tracia",
        "Ethnological Museum of Thrace",
        "Musée ethnologique de Thrace",
        "Ethnologisches Museum Thrakien",
        "Museo etnologico della Tracia",
        "Museu Etnológico da Trácia",
        "Museu Etnològic de Tràcia"
      ],
      [
        "Delta del Evros",
        "Evros Delta",
        "Delta de l’Evros",
        "Evros-Delta",
        "Delta dell’Evros",
        "Delta do Evros",
        "Delta de l’Evros"
      ]
    ],
    "notes": [
      "AXD está al este de Alejandrópolis, fuera del centro. Prevé el traslado terrestre y consulta los vuelos para tus fechas. El delta del Evros es una excursión fuera de la ciudad: respeta las normas del espacio protegido y comprueba acceso y visitas.",
      "AXD lies east of Alexandroupoli, outside the centre. Allow for ground transport and check flights for your dates. The Evros Delta is an excursion outside town: follow protected-area rules and check access and visits.",
      "AXD se trouve à l’est d’Alexandroúpoli, hors du centre. Prévoyez le transfert et vérifiez les vols pour vos dates. Le delta de l’Evros est une excursion hors de la ville : respectez les règles de l’espace protégé et vérifiez accès et visites.",
      "AXD liegt östlich von Alexandroupoli außerhalb des Zentrums. Landtransfer einplanen und Flüge prüfen. Das Evros-Delta ist ein Ausflug außerhalb der Stadt: Schutzgebietsregeln beachten und Zugang sowie Besuche prüfen.",
      "AXD si trova a est di Alessandropoli, fuori dal centro. Prevedi il trasferimento e verifica i voli per le tue date. Il delta dell’Evros è un’escursione fuori città: rispetta le regole dell’area protetta e verifica accesso e visite.",
      "AXD fica a leste de Alexandrópolis, fora do centro. Preveja o transporte terrestre e confirme voos para as suas datas. O delta do Evros é uma excursão fora da cidade: respeite as regras da área protegida e confirme acesso e visitas.",
      "AXD és a l’est d’Alexandrúpoli, fora del centre. Preveu el trasllat terrestre i consulta els vols per a les teves dates. El delta de l’Evros és una excursió fora de la ciutat: respecta les normes de l’espai protegit i comprova accés i visites."
    ]
  },
  {
    "slug": "patras",
    "code": "GPA",
    "airport": "Araxos Airport",
    "town": "Patras",
    "stay": "2–3",
    "aliases": [
      "Patras",
      "Patra",
      "Patrasso",
      "Patres",
      "Araxos",
      "Άραξος",
      "Πάτρα"
    ],
    "names": [
      "Patras",
      "Patras",
      "Patras",
      "Patras",
      "Patrasso",
      "Patras",
      "Patres"
    ],
    "descriptions": [
      "Puerto, casco alto y patrimonio urbano para conocer la costa occidental del Peloponeso desde Patras.",
      "Harbour, upper town and urban heritage introduce the western Peloponnese coast from Patras.",
      "Port, ville haute et patrimoine urbain pour découvrir la côte occidentale du Péloponnèse depuis Patras.",
      "Hafen, Oberstadt und städtisches Kulturerbe erschließen von Patras aus die westliche Peloponnesküste.",
      "Porto, città alta e patrimonio urbano per scoprire la costa occidentale del Peloponneso da Patrasso.",
      "Porto, cidade alta e património urbano para conhecer a costa ocidental do Peloponeso a partir de Patras.",
      "Port, ciutat alta i patrimoni urbà per descobrir la costa occidental del Peloponès des de Patres."
    ],
    "recommendations": [
      [
        "Castillo de Patras",
        "Patras Castle",
        "Château de Patras",
        "Burg von Patras",
        "Castello di Patrasso",
        "Castelo de Patras",
        "Castell de Patres"
      ],
      [
        "Ciudad Alta",
        "Upper Town",
        "Ville haute",
        "Oberstadt",
        "Città alta",
        "Cidade Alta",
        "Ciutat Alta"
      ],
      [
        "Paseo del puerto",
        "Harbour promenade",
        "Promenade du port",
        "Hafenpromenade",
        "Passeggiata del porto",
        "Passeio do porto",
        "Passeig del port"
      ],
      [
        "Puente de Río-Antírio",
        "Rio–Antirrio bridge",
        "Pont de Rio-Antirrio",
        "Rio-Andirrio-Brücke",
        "Ponte Rio-Antirio",
        "Ponte de Rio-Antírio",
        "Pont de Río-Antírio"
      ]
    ],
    "notes": [
      "Llegada por GPA, fuera del centro urbano. Prevé el traslado terrestre y comprueba vuelos, transporte y horarios para tus fechas: la oferta puede ser limitada o estacional. Las excursiones fuera de la ciudad requieren desplazamientos adicionales.",
      "Arrive via GPA, outside the city centre. Allow for ground transport and check flights, transport and opening times for your dates: service may be limited or seasonal. Excursions outside town require additional travel.",
      "Arrivée par GPA, hors du centre-ville. Prévoyez le transfert et vérifiez vols, transports et horaires pour vos dates : l’offre peut être limitée ou saisonnière. Les excursions hors de la ville nécessitent des trajets supplémentaires.",
      "Anreise über GPA außerhalb des Stadtzentrums. Landtransfer planen und Flüge, Verkehr sowie Öffnungszeiten prüfen: das Angebot kann begrenzt oder saisonal sein. Ausflüge außerhalb der Stadt erfordern zusätzliche Fahrten.",
      "Arrivo tramite GPA, fuori dal centro urbano. Prevedi il trasferimento e verifica voli, trasporti e orari per le tue date: l’offerta può essere limitata o stagionale. Le escursioni fuori città richiedono ulteriori spostamenti.",
      "Chegada por GPA, fora do centro urbano. Preveja o transporte terrestre e confirme voos, transportes e horários para as suas datas: a oferta pode ser limitada ou sazonal. As excursões fora da cidade exigem deslocações adicionais.",
      "Arribada per GPA, fora del centre urbà. Preveu el trasllat terrestre i comprova vols, transport i horaris per a les teves dates: l’oferta pot ser limitada o estacional. Les excursions fora de la ciutat requereixen desplaçaments addicionals."
    ],
    "photo": [
      "Patras_2008_view.jpg",
      "75",
      "Jérôme",
      "CC BY-SA 3.0",
      "https://creativecommons.org/licenses/by-sa/3.0/"
    ]
  },
  {
    "slug": "limnos",
    "code": "LXS",
    "airport": "Limnos — Ifaistos",
    "town": "Myrina (Lemnos)",
    "stay": "4–5",
    "aliases": [
      "Limnos",
      "Lemnos",
      "Lemno",
      "Myrina",
      "Mirina",
      "Ifaistos",
      "Hephaestus",
      "Λήμνος"
    ],
    "names": [
      "Lemnos",
      "Lemnos",
      "Lemnos",
      "Limnos",
      "Lemno",
      "Lemnos",
      "Lemnos"
    ],
    "descriptions": [
      "El castillo de Myrina, los yacimientos antiguos y los paisajes volcánicos permiten explorar una isla del Egeo septentrional.",
      "Myrina’s castle, ancient sites and volcanic scenery introduce an island in the northern Aegean.",
      "Le château de Myrina, les sites antiques et les paysages volcaniques révèlent une île de l’Égée du Nord.",
      "Myrinas Burg, antike Stätten und Vulkanlandschaften erschließen eine Insel der nördlichen Ägäis.",
      "Il castello di Myrina, i siti antichi e i paesaggi vulcanici raccontano un’isola dell’Egeo settentrionale.",
      "O castelo de Myrina, sítios antigos e paisagens vulcânicas revelam uma ilha do Egeu setentrional.",
      "El castell de Myrina, els jaciments antics i els paisatges volcànics permeten explorar una illa de l’Egeu septentrional."
    ],
    "recommendations": [
      [
        "Castillo de Myrina",
        "Myrina Castle",
        "Château de Myrina",
        "Burg von Myrina",
        "Castello di Myrina",
        "Castelo de Myrina",
        "Castell de Myrina"
      ],
      [
        "Puerto de Myrina",
        "Myrina harbour",
        "Port de Myrina",
        "Hafen von Myrina",
        "Porto di Myrina",
        "Porto de Myrina",
        "Port de Myrina"
      ],
      [
        "Poliochni",
        "Poliochni",
        "Poliochni",
        "Poliochni",
        "Poliochni",
        "Poliochni",
        "Poliochni"
      ],
      [
        "Hephaistia",
        "Hephaistia",
        "Hephaistia",
        "Hephaistia",
        "Hephaistia",
        "Hephaistia",
        "Hephaistia"
      ]
    ],
    "notes": [
      "Llegada por LXS. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional.",
      "Arrive via LXS. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal.",
      "Arrivée par LXS. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier.",
      "Anreise über LXS. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein.",
      "Arrivo tramite LXS. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale.",
      "Chegada por LXS. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal.",
      "Arribada per LXS. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional."
    ],
    "photo": [
      "Myrina_harbour_and_castle.JPG",
      "b3",
      "Phelim123",
      "CC BY-SA 3.0",
      "https://creativecommons.org/licenses/by-sa/3.0/"
    ]
  },
  {
    "slug": "ioannina",
    "code": "IOA",
    "airport": "Ioannina — King Pyrrhos",
    "town": "Ioannina",
    "stay": "3–4",
    "aliases": [
      "Ioannina",
      "Ioánina",
      "Ioànnina",
      "Giannina",
      "Janina",
      "King Pyrrhos",
      "Ιωάννινα"
    ],
    "names": [
      "Ioánina",
      "Ioannina",
      "Ioannina",
      "Ioannina",
      "Giannina",
      "Ioannina",
      "Ioànnina"
    ],
    "descriptions": [
      "Castillo, tradición artesana y paseos junto al lago Pamvótida para descubrir el patrimonio urbano de Epiro.",
      "A castle, craft traditions and Lake Pamvotida walks reveal Epirus’s urban heritage.",
      "Château, artisanat et promenades au bord du lac Pamvotida pour découvrir le patrimoine urbain de l’Épire.",
      "Burg, Handwerkstraditionen und Spaziergänge am Pamvotida-See erschließen das städtische Kulturerbe des Epirus.",
      "Castello, artigianato e passeggiate sul lago Pamvotida per scoprire il patrimonio urbano dell’Epiro.",
      "Castelo, artesanato e passeios junto ao lago Pamvótida para descobrir o património urbano do Epiro.",
      "Castell, tradició artesana i passejades vora el llac Pamvòtida per descobrir el patrimoni urbà de l’Epir."
    ],
    "recommendations": [
      [
        "Castillo de Ioánina",
        "Ioannina Castle",
        "Château d’Ioannina",
        "Burg von Ioannina",
        "Castello di Giannina",
        "Castelo de Ioannina",
        "Castell d’Ioànnina"
      ],
      [
        "Paseo del lago Pamvótida",
        "Lake Pamvotida promenade",
        "Promenade du lac Pamvotida",
        "Promenade am Pamvotida-See",
        "Lungolago Pamvotida",
        "Passeio do lago Pamvótida",
        "Passeig del llac Pamvòtida"
      ],
      [
        "Isla del lago Pamvótida",
        "Lake Pamvotida island",
        "Île du lac Pamvotida",
        "Insel im Pamvotida-See",
        "Isola del lago Pamvotida",
        "Ilha do lago Pamvótida",
        "Illa del llac Pamvòtida"
      ],
      [
        "Museo de la Platería",
        "Silversmithing Museum",
        "Musée de l’orfèvrerie",
        "Silberschmiedemuseum",
        "Museo dell’argenteria",
        "Museu da Prataria",
        "Museu de l’Argenteria"
      ]
    ],
    "notes": [
      "Llegada por IOA, fuera del centro urbano. Prevé el traslado terrestre y comprueba vuelos, transporte y horarios para tus fechas: la oferta puede ser limitada o estacional. Las excursiones fuera de la ciudad requieren desplazamientos adicionales.",
      "Arrive via IOA, outside the city centre. Allow for ground transport and check flights, transport and opening times for your dates: service may be limited or seasonal. Excursions outside town require additional travel.",
      "Arrivée par IOA, hors du centre-ville. Prévoyez le transfert et vérifiez vols, transports et horaires pour vos dates : l’offre peut être limitée ou saisonnière. Les excursions hors de la ville nécessitent des trajets supplémentaires.",
      "Anreise über IOA außerhalb des Stadtzentrums. Landtransfer planen und Flüge, Verkehr sowie Öffnungszeiten prüfen: das Angebot kann begrenzt oder saisonal sein. Ausflüge außerhalb der Stadt erfordern zusätzliche Fahrten.",
      "Arrivo tramite IOA, fuori dal centro urbano. Prevedi il trasferimento e verifica voli, trasporti e orari per le tue date: l’offerta può essere limitata o stagionale. Le escursioni fuori città richiedono ulteriori spostamenti.",
      "Chegada por IOA, fora do centro urbano. Preveja o transporte terrestre e confirme voos, transportes e horários para as suas datas: a oferta pode ser limitada ou sazonal. As excursões fora da cidade exigem deslocações adicionais.",
      "Arribada per IOA, fora del centre urbà. Preveu el trasllat terrestre i comprova vols, transport i horaris per a les teves dates: l’oferta pot ser limitada o estacional. Les excursions fora de la ciutat requereixen desplaçaments addicionals."
    ],
    "photo": [
      "Pamvotida_Lake_(Λίμνη_Παμβώτιδα)_01.jpg",
      "9d",
      "Pudelek (Marcin Szala)",
      "CC BY-SA 4.0",
      "https://creativecommons.org/licenses/by-sa/4.0/"
    ]
  },
  {
    "slug": "ikaria",
    "code": "JIK",
    "airport": "Ikaria Airport",
    "town": "Agios Kirykos (Ikaria)",
    "stay": "4–5",
    "aliases": [
      "Ikaria",
      "Icaria",
      "Icarie",
      "Icária",
      "Icària",
      "Agios Kirykos",
      "Agios Kirikos",
      "Evdilos",
      "Ικαρία"
    ],
    "names": [
      "Icaria",
      "Ikaria",
      "Icarie",
      "Ikaria",
      "Icaria",
      "Icária",
      "Icària"
    ],
    "descriptions": [
      "Pueblos costeros, montañas y tradiciones locales para conocer Icaria reservando tiempo para los trayectos insulares.",
      "Coastal villages, mountains and local traditions reward an Ikaria trip with time for island journeys.",
      "Villages côtiers, montagnes et traditions locales pour découvrir Icarie en prévoyant les trajets insulaires.",
      "Küstendörfer, Berge und lokale Traditionen laden zu einer Ikaria-Reise mit Zeit für Inselfahrten ein.",
      "Paesi costieri, montagne e tradizioni locali per scoprire Icaria prevedendo tempo per gli spostamenti.",
      "Aldeias costeiras, montanhas e tradições locais para conhecer Icária com tempo para as deslocações.",
      "Pobles costaners, muntanyes i tradicions locals per conèixer Icària reservant temps per als trajectes insulars."
    ],
    "recommendations": [
      [
        "Agios Kirykos",
        "Agios Kirykos",
        "Agios Kirykos",
        "Agios Kirykos",
        "Agios Kirykos",
        "Agios Kirykos",
        "Agios Kirykos"
      ],
      [
        "Evdilos",
        "Evdilos",
        "Evdilos",
        "Evdilos",
        "Evdilos",
        "Evdilos",
        "Evdilos"
      ],
      [
        "Christos Raches",
        "Christos Raches",
        "Christos Raches",
        "Christos Raches",
        "Christos Raches",
        "Christos Raches",
        "Christos Raches"
      ],
      [
        "Therma",
        "Therma",
        "Therma",
        "Therma",
        "Therma",
        "Therma",
        "Therma"
      ]
    ],
    "notes": [
      "Llegada por JIK. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional.",
      "Arrive via JIK. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal.",
      "Arrivée par JIK. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier.",
      "Anreise über JIK. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein.",
      "Arrivo tramite JIK. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale.",
      "Chegada por JIK. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal.",
      "Arribada per JIK. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional."
    ],
    "photo": [
      "Agios_Kirikos,_Ikaria.jpg",
      "26",
      "Stelios Kiousis",
      "CC BY-SA 2.0",
      "https://creativecommons.org/licenses/by-sa/2.0/"
    ]
  },
  {
    "slug": "leros",
    "code": "LRS",
    "airport": "Leros Airport",
    "town": "Agia Marina (Leros)",
    "stay": "3–4",
    "aliases": [
      "Leros",
      "Lero",
      "Agia Marina Leros",
      "Lakki",
      "Λέρος"
    ],
    "names": [
      "Leros",
      "Leros",
      "Leros",
      "Leros",
      "Lero",
      "Leros",
      "Leros"
    ],
    "descriptions": [
      "Puertos resguardados, arquitectura de Lakki y patrimonio de Panteli para explorar una isla del Dodecaneso.",
      "Sheltered harbours, Lakki’s architecture and Panteli’s heritage introduce a Dodecanese island.",
      "Ports abrités, architecture de Lakki et patrimoine de Panteli pour découvrir une île du Dodécanèse.",
      "Geschützte Häfen, Lakkis Architektur und Pantelis Kulturerbe erschließen eine Dodekanesinsel.",
      "Porti riparati, architettura di Lakki e patrimonio di Panteli per scoprire un’isola del Dodecaneso.",
      "Portos abrigados, arquitetura de Lakki e património de Panteli para explorar uma ilha do Dodecaneso.",
      "Ports arrecerats, arquitectura de Lakki i patrimoni de Panteli per explorar una illa del Dodecanès."
    ],
    "recommendations": [
      [
        "Agia Marina",
        "Agia Marina",
        "Agia Marina",
        "Agia Marina",
        "Agia Marina",
        "Agia Marina",
        "Agia Marina"
      ],
      [
        "Lakki",
        "Lakki",
        "Lakki",
        "Lakki",
        "Lakki",
        "Lakki",
        "Lakki"
      ],
      [
        "Castillo de Panteli",
        "Panteli Castle",
        "Château de Panteli",
        "Burg Panteli",
        "Castello di Panteli",
        "Castelo de Panteli",
        "Castell de Panteli"
      ],
      [
        "Alinda",
        "Alinda",
        "Alinda",
        "Alinda",
        "Alinda",
        "Alinda",
        "Alinda"
      ]
    ],
    "notes": [
      "Llegada por LRS. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional.",
      "Arrive via LRS. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal.",
      "Arrivée par LRS. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier.",
      "Anreise über LRS. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein.",
      "Arrivo tramite LRS. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale.",
      "Chegada por LRS. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal.",
      "Arribada per LRS. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional."
    ],
    "photo": [
      "Aghia_Marina,_Leros_island,_Greece_-_panoramio.jpg",
      "ca",
      "G Da",
      "CC BY-SA 3.0",
      "https://creativecommons.org/licenses/by-sa/3.0/"
    ]
  },
  {
    "slug": "volos",
    "code": "VOL",
    "airport": "Nea Anchialos Airport",
    "town": "Volos",
    "stay": "3–4",
    "aliases": [
      "Volos",
      "Vólos",
      "Nea Anchialos",
      "Nea Anhialos",
      "Nea Agchialos",
      "Βόλος"
    ],
    "names": [
      "Volos",
      "Volos",
      "Vólos",
      "Volos",
      "Volos",
      "Volos",
      "Volos"
    ],
    "descriptions": [
      "Paseos junto al golfo Pagasético y patrimonio de Tesalia, con excursiones que requieren salir de la ciudad.",
      "Pagasetic Gulf walks and Thessalian heritage form a base for excursions outside the city.",
      "Promenades au bord du golfe Pagasétique et patrimoine thessalien, avec des excursions hors de la ville.",
      "Spaziergänge am Pagasitischen Golf und thessalisches Kulturerbe bilden eine Basis für Ausflüge außerhalb der Stadt.",
      "Passeggiate sul golfo Pagaseo e patrimonio della Tessaglia, con escursioni che richiedono spostamenti fuori città.",
      "Passeios junto ao golfo Pagasético e património da Tessália, com excursões que exigem sair da cidade.",
      "Passejades vora el golf Pagasètic i patrimoni de Tessàlia, amb excursions que requereixen sortir de la ciutat."
    ],
    "recommendations": [
      [
        "Paseo marítimo de Volos",
        "Volos waterfront",
        "Front de mer de Volos",
        "Uferpromenade von Volos",
        "Lungomare di Volos",
        "Passeio marítimo de Volos",
        "Passeig marítim de Volos"
      ],
      [
        "Museo Arqueológico Athanasakeio",
        "Athanasakeio Archaeological Museum",
        "Musée archéologique Athanasakeio",
        "Archäologisches Museum Athanasakeio",
        "Museo archeologico Athanasakeio",
        "Museu Arqueológico Athanasakeio",
        "Museu Arqueològic Athanasakeio"
      ],
      [
        "Yacimiento de Sesklo",
        "Sesklo archaeological site",
        "Site archéologique de Sesklo",
        "Ausgrabungsstätte Sesklo",
        "Sito archeologico di Sesklo",
        "Sítio arqueológico de Sesklo",
        "Jaciment de Sesklo"
      ],
      [
        "Yacimiento de Dimini",
        "Dimini archaeological site",
        "Site archéologique de Dimini",
        "Ausgrabungsstätte Dimini",
        "Sito archeologico di Dimini",
        "Sítio arqueológico de Dimini",
        "Jaciment de Dimini"
      ]
    ],
    "notes": [
      "Llegada por VOL, fuera del centro urbano. Prevé el traslado terrestre y comprueba vuelos, transporte y horarios para tus fechas: la oferta puede ser limitada o estacional. Las excursiones fuera de la ciudad requieren desplazamientos adicionales.",
      "Arrive via VOL, outside the city centre. Allow for ground transport and check flights, transport and opening times for your dates: service may be limited or seasonal. Excursions outside town require additional travel.",
      "Arrivée par VOL, hors du centre-ville. Prévoyez le transfert et vérifiez vols, transports et horaires pour vos dates : l’offre peut être limitée ou saisonnière. Les excursions hors de la ville nécessitent des trajets supplémentaires.",
      "Anreise über VOL außerhalb des Stadtzentrums. Landtransfer planen und Flüge, Verkehr sowie Öffnungszeiten prüfen: das Angebot kann begrenzt oder saisonal sein. Ausflüge außerhalb der Stadt erfordern zusätzliche Fahrten.",
      "Arrivo tramite VOL, fuori dal centro urbano. Prevedi il trasferimento e verifica voli, trasporti e orari per le tue date: l’offerta può essere limitata o stagionale. Le escursioni fuori città richiedono ulteriori spostamenti.",
      "Chegada por VOL, fora do centro urbano. Preveja o transporte terrestre e confirme voos, transportes e horários para as suas datas: a oferta pode ser limitada ou sazonal. As excursões fora da cidade exigem deslocações adicionais.",
      "Arribada per VOL, fora del centre urbà. Preveu el trasllat terrestre i comprova vols, transport i horaris per a les teves dates: l’oferta pot ser limitada o estacional. Les excursions fora de la ciutat requereixen desplaçaments addicionals."
    ],
    "photo": [
      "Volos_port_February_2023.jpg",
      "42",
      "Khane Rokhl Barazani",
      "CC BY-SA 4.0",
      "https://creativecommons.org/licenses/by-sa/4.0/"
    ]
  },
  {
    "slug": "sitia",
    "code": "JSH",
    "airport": "Sitia Airport",
    "town": "Sitia",
    "stay": "3–4",
    "aliases": [
      "Sitia",
      "Sitía",
      "Sítia",
      "Siteia",
      "Σητεία"
    ],
    "names": [
      "Sitia",
      "Sitia",
      "Sitia",
      "Sitia",
      "Sitia",
      "Sítia",
      "Sitia"
    ],
    "descriptions": [
      "Puerto cretense, fortaleza veneciana y paisajes del este de Creta, con tiempo para los desplazamientos por la región.",
      "A Cretan harbour, Venetian fortress and eastern Crete scenery reward time for regional journeys.",
      "Port crétois, forteresse vénitienne et paysages de l’est de la Crète, en prévoyant les déplacements régionaux.",
      "Kretischer Hafen, venezianische Festung und Ostkretas Landschaften lohnen Zeit für regionale Fahrten.",
      "Porto cretese, fortezza veneziana e paesaggi di Creta orientale, prevedendo tempo per gli spostamenti.",
      "Porto cretense, fortaleza veneziana e paisagens do leste de Creta, com tempo para as deslocações.",
      "Port cretenc, fortalesa veneciana i paisatges de l’est de Creta, amb temps per als desplaçaments regionals."
    ],
    "recommendations": [
      [
        "Puerto de Sitia",
        "Sitia harbour",
        "Port de Sitia",
        "Hafen von Sitia",
        "Porto di Sitia",
        "Porto de Sítia",
        "Port de Sitia"
      ],
      [
        "Fortaleza Kazarma",
        "Kazarma fortress",
        "Forteresse Kazarma",
        "Festung Kazarma",
        "Fortezza Kazarma",
        "Fortaleza Kazarma",
        "Fortalesa Kazarma"
      ],
      [
        "Museo Arqueológico de Sitia",
        "Archaeological Museum of Sitia",
        "Musée archéologique de Sitia",
        "Archäologisches Museum Sitia",
        "Museo archeologico di Sitia",
        "Museu Arqueológico de Sítia",
        "Museu Arqueològic de Sitia"
      ],
      [
        "Palmeral de Vai",
        "Vai palm grove",
        "Palmeraie de Vai",
        "Palmenhain von Vai",
        "Palmeto di Vai",
        "Palmeiral de Vai",
        "Palmerar de Vai"
      ]
    ],
    "notes": [
      "Llegada por JSH. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional.",
      "Arrive via JSH. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal.",
      "Arrivée par JSH. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier.",
      "Anreise über JSH. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein.",
      "Arrivo tramite JSH. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale.",
      "Chegada por JSH. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal.",
      "Arribada per JSH. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional."
    ],
    "photo": [
      "SITIA-HARBOUR-KAZARMA-FORTRESS-CRETE-GREECE-1.jpg",
      "79",
      "Petro Stelte",
      "CC BY-SA 4.0",
      "https://creativecommons.org/licenses/by-sa/4.0/"
    ]
  },
  {
    "slug": "syros",
    "code": "JSY",
    "airport": "Syros Airport",
    "town": "Ermoupoli (Syros)",
    "stay": "3–4",
    "aliases": [
      "Syros",
      "Siros",
      "Siro",
      "Ermoupoli",
      "Ermoupolis",
      "Hermoupolis",
      "Σύρος"
    ],
    "names": [
      "Siros",
      "Syros",
      "Syros",
      "Syros",
      "Siro",
      "Siros",
      "Siros"
    ],
    "descriptions": [
      "Arquitectura neoclásica de Ermúpoli y callejuelas de Ano Syros para descubrir una isla con patrimonio urbano.",
      "Ermoupoli’s neoclassical architecture and Ano Syros lanes reveal an island with distinctive urban heritage.",
      "Architecture néoclassique d’Ermoupoli et ruelles d’Ano Syros pour découvrir un patrimoine urbain insulaire.",
      "Ermoupolis neoklassische Architektur und Ano Syros’ Gassen erschließen städtisches Kulturerbe auf einer Insel.",
      "Architettura neoclassica di Ermoupoli e vicoli di Ano Syros per scoprire il patrimonio urbano dell’isola.",
      "Arquitetura neoclássica de Ermúpoli e ruelas de Ano Syros para descobrir o património urbano da ilha.",
      "Arquitectura neoclàssica d’Ermúpoli i carrerons d’Ano Syros per descobrir el patrimoni urbà de l’illa."
    ],
    "recommendations": [
      [
        "Plaza Miaouli",
        "Miaouli Square",
        "Place Miaouli",
        "Miaouli-Platz",
        "Piazza Miaouli",
        "Praça Miaouli",
        "Plaça Miaouli"
      ],
      [
        "Teatro Apollon",
        "Apollon Theatre",
        "Théâtre Apollon",
        "Apollon-Theater",
        "Teatro Apollon",
        "Teatro Apollon",
        "Teatre Apollon"
      ],
      [
        "Ano Syros",
        "Ano Syros",
        "Ano Syros",
        "Ano Syros",
        "Ano Syros",
        "Ano Syros",
        "Ano Syros"
      ],
      [
        "Puerto de Ermúpoli",
        "Ermoupoli harbour",
        "Port d’Ermoupoli",
        "Hafen von Ermoupoli",
        "Porto di Ermoupoli",
        "Porto de Ermúpoli",
        "Port d’Ermúpoli"
      ]
    ],
    "notes": [
      "Llegada por JSY. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional.",
      "Arrive via JSY. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal.",
      "Arrivée par JSY. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier.",
      "Anreise über JSY. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein.",
      "Arrivo tramite JSY. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale.",
      "Chegada por JSY. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal.",
      "Arribada per JSY. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional."
    ],
    "photo": [
      "View_of_Ermoupoli_(Syros_island)_from_a_ferry_boat_2.jpg",
      "38",
      "Leeturtle",
      "CC BY-SA 4.0",
      "https://creativecommons.org/licenses/by-sa/4.0/"
    ]
  },
  {
    "slug": "astypalaia",
    "code": "JTY",
    "airport": "Astypalaia Airport",
    "town": "Chora (Astypalaia)",
    "stay": "3–4",
    "aliases": [
      "Astypalaia",
      "Astypalea",
      "Astipalea",
      "Astypalée",
      "Astipaleia",
      "Stampalia",
      "Astropalia",
      "Chora Astypalaia",
      "Αστυπάλαια"
    ],
    "names": [
      "Astipalea",
      "Astypalaia",
      "Astypalée",
      "Astypalea",
      "Stampalia",
      "Astipaleia",
      "Astipàlea"
    ],
    "descriptions": [
      "Casas blancas, molinos y un castillo sobre Chora para descubrir una isla entre las Cícladas y el Dodecaneso.",
      "Whitewashed houses, windmills and a castle above Chora reveal an island between the Cyclades and Dodecanese.",
      "Maisons blanches, moulins et château dominant Chora révèlent une île entre Cyclades et Dodécanèse.",
      "Weiße Häuser, Windmühlen und eine Burg über Chora erschließen eine Insel zwischen Kykladen und Dodekanes.",
      "Case bianche, mulini e un castello sopra Chora raccontano un’isola tra Cicladi e Dodecaneso.",
      "Casas brancas, moinhos e um castelo sobre Chora revelam uma ilha entre as Cíclades e o Dodecaneso.",
      "Cases blanques, molins i un castell sobre Khora per descobrir una illa entre les Cíclades i el Dodecanès."
    ],
    "recommendations": [
      [
        "Chora de Astipalea",
        "Chora of Astypalaia",
        "Chora d’Astypalée",
        "Chora von Astypalea",
        "Chora di Stampalia",
        "Chora de Astipaleia",
        "Khora d’Astipàlea"
      ],
      [
        "Castillo de Querini",
        "Querini Castle",
        "Château de Querini",
        "Querini-Burg",
        "Castello Querini",
        "Castelo de Querini",
        "Castell de Querini"
      ],
      [
        "Molinos de Chora",
        "Chora windmills",
        "Moulins de Chora",
        "Windmühlen von Chora",
        "Mulini di Chora",
        "Moinhos de Chora",
        "Molins de Khora"
      ],
      [
        "Livadi",
        "Livadi",
        "Livadi",
        "Livadi",
        "Livadi",
        "Livadi",
        "Livadi"
      ]
    ],
    "notes": [
      "Llegada por JTY. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional.",
      "Arrive via JTY. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal.",
      "Arrivée par JTY. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier.",
      "Anreise über JTY. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein.",
      "Arrivo tramite JTY. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale.",
      "Chegada por JTY. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal.",
      "Arribada per JTY. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional."
    ],
    "photo": [
      "Chora_and_Castle._Astypalaia,_Greece.jpg",
      "ce",
      "Ввласенко",
      "CC BY-SA 3.0",
      "https://creativecommons.org/licenses/by-sa/3.0/"
    ]
  },
  {
    "slug": "kalymnos",
    "code": "JKL",
    "airport": "Kalymnos Airport",
    "town": "Pothia (Kalymnos)",
    "stay": "4–5",
    "aliases": [
      "Kalymnos",
      "Kálimnos",
      "Calimnos",
      "Calino",
      "Cálimnos",
      "Pothia",
      "Póthia",
      "Κάλυμνος"
    ],
    "names": [
      "Kálimnos",
      "Kalymnos",
      "Kalymnos",
      "Kalymnos",
      "Calino",
      "Cálimnos",
      "Kàlimnos"
    ],
    "descriptions": [
      "Puerto de Pothia, tradición de los pescadores de esponjas y pueblos entre montañas y costa.",
      "Pothia’s harbour, sponge-diving heritage and villages lie between mountains and coastline.",
      "Port de Pothia, patrimoine des pêcheurs d’éponges et villages entre montagnes et littoral.",
      "Pothias Hafen, Schwammtauchertradition und Dörfer zwischen Bergen und Küste prägen die Insel.",
      "Porto di Pothia, tradizione dei pescatori di spugne e paesi tra montagne e costa.",
      "Porto de Pothia, tradição dos pescadores de esponjas e aldeias entre montanhas e costa.",
      "Port de Pothia, tradició dels pescadors d’esponges i pobles entre muntanyes i costa."
    ],
    "recommendations": [
      [
        "Pothia",
        "Pothia",
        "Pothia",
        "Pothia",
        "Pothia",
        "Pothia",
        "Pothia"
      ],
      [
        "Chorio",
        "Chorio",
        "Chorio",
        "Chorio",
        "Chorio",
        "Chorio",
        "Chorio"
      ],
      [
        "Vathy",
        "Vathy",
        "Vathy",
        "Vathy",
        "Vathy",
        "Vathy",
        "Vathy"
      ],
      [
        "Panagia Charitomeni",
        "Panagia Charitomeni",
        "Panagia Charitomeni",
        "Panagia Charitomeni",
        "Panagia Charitomeni",
        "Panagia Charitomeni",
        "Panagia Charitomeni"
      ]
    ],
    "notes": [
      "Llegada por JKL. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional.",
      "Arrive via JKL. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal.",
      "Arrivée par JKL. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier.",
      "Anreise über JKL. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein.",
      "Arrivo tramite JKL. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale.",
      "Chegada por JKL. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal.",
      "Arribada per JKL. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional."
    ],
    "photo": [
      "Kalymnos_Pothia_panorama.jpg",
      "de",
      "Tomisti",
      "CC BY-SA 4.0",
      "https://creativecommons.org/licenses/by-sa/4.0/"
    ]
  },
  {
    "slug": "kasos",
    "code": "KSJ",
    "airport": "Kasos Airport",
    "town": "Fry (Kasos)",
    "stay": "2–3",
    "aliases": [
      "Kasos",
      "Casos",
      "Cassos",
      "Caso",
      "Fry",
      "Fri Kasos",
      "Κάσος"
    ],
    "names": [
      "Kasos",
      "Kasos",
      "Cassos",
      "Kasos",
      "Caso",
      "Casos",
      "Kasos"
    ],
    "descriptions": [
      "El pequeño puerto de Fry y los pueblos tradicionales permiten descubrir el patrimonio marinero de Kasos.",
      "Fry’s small harbour and traditional villages introduce Kasos’s seafaring heritage.",
      "Le petit port de Fry et les villages traditionnels révèlent le patrimoine maritime de Cassos.",
      "Frys kleiner Hafen und traditionelle Dörfer erschließen das maritime Erbe von Kasos.",
      "Il piccolo porto di Fry e i paesi tradizionali raccontano il patrimonio marinaro di Caso.",
      "O pequeno porto de Fry e as aldeias tradicionais revelam o património marítimo de Casos.",
      "El petit port de Fry i els pobles tradicionals permeten descobrir el patrimoni mariner de Kasos."
    ],
    "recommendations": [
      [
        "Fry",
        "Fry",
        "Fry",
        "Fry",
        "Fry",
        "Fry",
        "Fry"
      ],
      [
        "Puerto de Bouka",
        "Bouka harbour",
        "Port de Bouka",
        "Hafen von Bouka",
        "Porticciolo di Bouka",
        "Porto de Bouka",
        "Port de Bouka"
      ],
      [
        "Emporios",
        "Emporios",
        "Emporios",
        "Emporios",
        "Emporios",
        "Emporios",
        "Emporios"
      ],
      [
        "Panagia",
        "Panagia",
        "Panagia",
        "Panagia",
        "Panagia",
        "Panagia",
        "Panagia"
      ]
    ],
    "notes": [
      "Llegada por KSJ. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional.",
      "Arrive via KSJ. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal.",
      "Arrivée par KSJ. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier.",
      "Anreise über KSJ. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein.",
      "Arrivo tramite KSJ. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale.",
      "Chegada por KSJ. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal.",
      "Arribada per KSJ. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional."
    ],
    "photo": [
      "Kasos_veduta_del_porticciolo.jpg",
      "12",
      "Luca Aless",
      "CC0 1.0",
      "https://creativecommons.org/publicdomain/zero/1.0/"
    ]
  },
  {
    "slug": "kastellorizo",
    "code": "KZS",
    "airport": "Kastellorizo Airport",
    "town": "Megisti (Kastellorizo)",
    "stay": "2–3",
    "aliases": [
      "Kastellorizo",
      "Kastelorizo",
      "Castelórizo",
      "Castellorizo",
      "Castelrosso",
      "Megisti",
      "Μεγίστη",
      "Καστελλόριζο"
    ],
    "names": [
      "Castelórizo",
      "Kastellorizo",
      "Castellorizo",
      "Kastellorizo",
      "Castelrosso",
      "Castelorizo",
      "Castellorizo"
    ],
    "descriptions": [
      "Fachadas de colores, puerto recogido y patrimonio insular en el extremo oriental del Dodecaneso.",
      "Colourful waterfront houses, a sheltered harbour and island heritage mark the eastern Dodecanese.",
      "Façades colorées, port abrité et patrimoine insulaire à l’extrémité orientale du Dodécanèse.",
      "Bunte Uferhäuser, ein geschützter Hafen und Inselkulturerbe prägen den östlichen Dodekanes.",
      "Facciate colorate, porto raccolto e patrimonio insulare all’estremità orientale del Dodecaneso.",
      "Fachadas coloridas, porto abrigado e património insular no extremo oriental do Dodecaneso.",
      "Façanes de colors, port arrecerat i patrimoni insular a l’extrem oriental del Dodecanès."
    ],
    "recommendations": [
      [
        "Paseo del puerto de Megisti",
        "Megisti harbour waterfront",
        "Front de mer de Megisti",
        "Uferpromenade von Megisti",
        "Lungomare di Megisti",
        "Passeio do porto de Megisti",
        "Passeig del port de Megisti"
      ],
      [
        "Castello Rosso",
        "Castello Rosso",
        "Castello Rosso",
        "Castello Rosso",
        "Castello Rosso",
        "Castello Rosso",
        "Castello Rosso"
      ],
      [
        "Tumba licia",
        "Lycian tomb",
        "Tombe lycienne",
        "Lykisches Grab",
        "Tomba licia",
        "Túmulo lício",
        "Tomba lícia"
      ],
      [
        "Cueva Azul",
        "Blue Cave",
        "Grotte bleue",
        "Blaue Grotte",
        "Grotta Azzurra",
        "Gruta Azul",
        "Cova Blava"
      ]
    ],
    "notes": [
      "Llegada por KZS. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional. La Cueva Azul requiere una excursión en barco sujeta al tiempo y al estado del mar.",
      "Arrive via KZS. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal. The Blue Cave requires a boat excursion subject to weather and sea conditions.",
      "Arrivée par KZS. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier. La Grotte bleue nécessite une excursion en bateau selon la météo et l’état de la mer.",
      "Anreise über KZS. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein. Die Blaue Grotte erfordert einen Bootsausflug abhängig von Wetter und Seegang.",
      "Arrivo tramite KZS. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale. La Grotta Azzurra richiede un’escursione in barca soggetta al tempo e alle condizioni del mare.",
      "Chegada por KZS. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal. A Gruta Azul exige uma excursão de barco sujeita ao tempo e ao estado do mar.",
      "Arribada per KZS. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional. La Cova Blava requereix una excursió en barca subjecta al temps i a l’estat del mar."
    ],
    "photo": [
      "DIAFORES_FOTO_031.jpg",
      "33",
      "Papoutsis Travel",
      "CC BY-SA 3.0",
      "https://creativecommons.org/licenses/by-sa/3.0/"
    ]
  },
  {
    "slug": "kastoria",
    "code": "KSO",
    "airport": "Kastoria Airport",
    "town": "Kastoria",
    "stay": "2–3",
    "aliases": [
      "Kastoria",
      "Kastoriá",
      "Castoria",
      "Καστοριά"
    ],
    "names": [
      "Kastoria",
      "Kastoria",
      "Kastoria",
      "Kastoria",
      "Kastoria",
      "Kastoria",
      "Kastoria"
    ],
    "descriptions": [
      "Lago Orestiada, barrios históricos y patrimonio bizantino para pasear por una ciudad de Macedonia occidental.",
      "Lake Orestiada, historic quarters and Byzantine heritage invite walks through a western Macedonian city.",
      "Lac Orestiada, quartiers historiques et patrimoine byzantin pour flâner dans une ville de Macédoine occidentale.",
      "Orestiada-See, historische Viertel und byzantinisches Erbe laden zu Spaziergängen in Westmakedonien ein.",
      "Lago Orestiada, quartieri storici e patrimonio bizantino per passeggiare in una città della Macedonia occidentale.",
      "Lago Orestiada, bairros históricos e património bizantino para passear numa cidade da Macedónia Ocidental.",
      "Llac Orestiada, barris històrics i patrimoni bizantí per passejar per una ciutat de Macedònia occidental."
    ],
    "recommendations": [
      [
        "Paseo del lago Orestiada",
        "Lake Orestiada promenade",
        "Promenade du lac Orestiada",
        "Promenade am Orestiada-See",
        "Lungolago Orestiada",
        "Passeio do lago Orestiada",
        "Passeig del llac Orestiada"
      ],
      [
        "Doltso",
        "Doltso",
        "Doltso",
        "Doltso",
        "Doltso",
        "Doltso",
        "Doltso"
      ],
      [
        "Apozari",
        "Apozari",
        "Apozari",
        "Apozari",
        "Apozari",
        "Apozari",
        "Apozari"
      ],
      [
        "Museo Bizantino de Kastoria",
        "Byzantine Museum of Kastoria",
        "Musée byzantin de Kastoria",
        "Byzantinisches Museum Kastoria",
        "Museo bizantino di Kastoria",
        "Museu Bizantino de Kastoria",
        "Museu Bizantí de Kastoria"
      ]
    ],
    "notes": [
      "Llegada por KSO, fuera del centro urbano. Prevé el traslado terrestre y comprueba vuelos, transporte y horarios para tus fechas: la oferta puede ser limitada o estacional. Las excursiones fuera de la ciudad requieren desplazamientos adicionales.",
      "Arrive via KSO, outside the city centre. Allow for ground transport and check flights, transport and opening times for your dates: service may be limited or seasonal. Excursions outside town require additional travel.",
      "Arrivée par KSO, hors du centre-ville. Prévoyez le transfert et vérifiez vols, transports et horaires pour vos dates : l’offre peut être limitée ou saisonnière. Les excursions hors de la ville nécessitent des trajets supplémentaires.",
      "Anreise über KSO außerhalb des Stadtzentrums. Landtransfer planen und Flüge, Verkehr sowie Öffnungszeiten prüfen: das Angebot kann begrenzt oder saisonal sein. Ausflüge außerhalb der Stadt erfordern zusätzliche Fahrten.",
      "Arrivo tramite KSO, fuori dal centro urbano. Prevedi il trasferimento e verifica voli, trasporti e orari per le tue date: l’offerta può essere limitata o stagionale. Le escursioni fuori città richiedono ulteriori spostamenti.",
      "Chegada por KSO, fora do centro urbano. Preveja o transporte terrestre e confirme voos, transportes e horários para as suas datas: a oferta pode ser limitada ou sazonal. As excursões fora da cidade exigem deslocações adicionais.",
      "Arribada per KSO, fora del centre urbà. Preveu el trasllat terrestre i comprova vols, transport i horaris per a les teves dates: l’oferta pot ser limitada o estacional. Les excursions fora de la ciutat requereixen desplaçaments addicionals."
    ],
    "photo": [
      "Golden_Hour_in_Kastoria_Greece.jpg",
      "f0",
      "Jolovema",
      "CC BY-SA 4.0",
      "https://creativecommons.org/licenses/by-sa/4.0/"
    ]
  },
  {
    "slug": "kozani",
    "code": "KZI",
    "airport": "Kozani Airport",
    "town": "Kozani",
    "stay": "2–3",
    "aliases": [
      "Kozani",
      "Kozane",
      "Κοζάνη"
    ],
    "names": [
      "Kozani",
      "Kozani",
      "Kozani",
      "Kozani",
      "Kozani",
      "Kozani",
      "Kozani"
    ],
    "descriptions": [
      "Plaza central, patrimonio local y colecciones culturales para conocer una ciudad de Macedonia occidental.",
      "A central square, local heritage and cultural collections introduce a western Macedonian city.",
      "Place centrale, patrimoine local et collections culturelles pour découvrir une ville de Macédoine occidentale.",
      "Zentraler Platz, lokales Erbe und Kultursammlungen erschließen eine Stadt in Westmakedonien.",
      "Piazza centrale, patrimonio locale e collezioni culturali per conoscere una città della Macedonia occidentale.",
      "Praça central, património local e coleções culturais para conhecer uma cidade da Macedónia Ocidental.",
      "Plaça central, patrimoni local i col·leccions culturals per conèixer una ciutat de Macedònia occidental."
    ],
    "recommendations": [
      [
        "Plaza Nikis",
        "Nikis Square",
        "Place Nikis",
        "Nikis-Platz",
        "Piazza Nikis",
        "Praça Nikis",
        "Plaça Nikis"
      ],
      [
        "Iglesia de Agios Nikolaos",
        "Agios Nikolaos church",
        "Église Agios Nikolaos",
        "Kirche Agios Nikolaos",
        "Chiesa di Agios Nikolaos",
        "Igreja de Agios Nikolaos",
        "Església d’Agios Nikolaos"
      ],
      [
        "Biblioteca Municipal Koventareios",
        "Koventareios Municipal Library",
        "Bibliothèque municipale Koventareios",
        "Stadtbibliothek Koventareios",
        "Biblioteca comunale Koventareios",
        "Biblioteca Municipal Koventareios",
        "Biblioteca Municipal Koventareios"
      ],
      [
        "Colección Arqueológica de Kozani",
        "Archaeological Collection of Kozani",
        "Collection archéologique de Kozani",
        "Archäologische Sammlung Kozani",
        "Collezione archeologica di Kozani",
        "Coleção Arqueológica de Kozani",
        "Col·lecció Arqueològica de Kozani"
      ]
    ],
    "notes": [
      "Llegada por KZI, fuera del centro urbano. Prevé el traslado terrestre y comprueba vuelos, transporte y horarios para tus fechas: la oferta puede ser limitada o estacional. Las excursiones fuera de la ciudad requieren desplazamientos adicionales.",
      "Arrive via KZI, outside the city centre. Allow for ground transport and check flights, transport and opening times for your dates: service may be limited or seasonal. Excursions outside town require additional travel.",
      "Arrivée par KZI, hors du centre-ville. Prévoyez le transfert et vérifiez vols, transports et horaires pour vos dates : l’offre peut être limitée ou saisonnière. Les excursions hors de la ville nécessitent des trajets supplémentaires.",
      "Anreise über KZI außerhalb des Stadtzentrums. Landtransfer planen und Flüge, Verkehr sowie Öffnungszeiten prüfen: das Angebot kann begrenzt oder saisonal sein. Ausflüge außerhalb der Stadt erfordern zusätzliche Fahrten.",
      "Arrivo tramite KZI, fuori dal centro urbano. Prevedi il trasferimento e verifica voli, trasporti e orari per le tue date: l’offerta può essere limitata o stagionale. Le escursioni fuori città richiedono ulteriori spostamenti.",
      "Chegada por KZI, fora do centro urbano. Preveja o transporte terrestre e confirme voos, transportes e horários para as suas datas: a oferta pode ser limitada ou sazonal. As excursões fora da cidade exigem deslocações adicionais.",
      "Arribada per KZI, fora del centre urbà. Preveu el trasllat terrestre i comprova vols, transport i horaris per a les teves dates: l’oferta pot ser limitada o estacional. Les excursions fora de la ciutat requereixen desplaçaments addicionals."
    ],
    "photo": [
      "Kozani_new_square_-_Flickr_-_Nick-K_(Nikos_Koutoulas).jpg",
      "dd",
      "Nikos Koutoulas from Kozani, Greece",
      "CC BY 2.0",
      "https://creativecommons.org/licenses/by/2.0/"
    ]
  },
  {
    "slug": "kythira",
    "code": "KIT",
    "airport": "Kythira Airport",
    "town": "Chora (Kythira)",
    "stay": "4–5",
    "aliases": [
      "Kythira",
      "Kithira",
      "Kythera",
      "Cythera",
      "Citera",
      "Cítera",
      "Cythère",
      "Cerigo",
      "Tsirigo",
      "Chora Kythira",
      "Κύθηρα"
    ],
    "names": [
      "Citera",
      "Kythira",
      "Cythère",
      "Kythira",
      "Cerigo",
      "Cítera",
      "Cítera"
    ],
    "descriptions": [
      "Chora, castillos y pueblos de influencias venecianas para recorrer una isla entre el mar Jónico y el Egeo.",
      "Chora, castles and Venetian-influenced villages invite exploration between the Ionian and Aegean seas.",
      "Chora, châteaux et villages aux influences vénitiennes pour explorer une île entre mer Ionienne et Égée.",
      "Chora, Burgen und venezianisch geprägte Dörfer laden zur Inselerkundung zwischen Ionischem Meer und Ägäis ein.",
      "Chora, castelli e paesi dalle influenze veneziane per esplorare un’isola tra mar Ionio ed Egeo.",
      "Chora, castelos e aldeias de influências venezianas para explorar uma ilha entre o mar Jónico e o Egeu.",
      "Khora, castells i pobles d’influències venecianes per recórrer una illa entre el mar Jònic i l’Egeu."
    ],
    "recommendations": [
      [
        "Chora de Citera",
        "Chora of Kythira",
        "Chora de Cythère",
        "Chora von Kythira",
        "Chora di Cerigo",
        "Chora de Cítera",
        "Khora de Cítera"
      ],
      [
        "Castillo de Chora",
        "Chora Castle",
        "Château de Chora",
        "Burg von Chora",
        "Castello di Chora",
        "Castelo de Chora",
        "Castell de Khora"
      ],
      [
        "Kapsali",
        "Kapsali",
        "Kapsali",
        "Kapsali",
        "Kapsali",
        "Kapsali",
        "Kapsali"
      ],
      [
        "Mylopotamos",
        "Mylopotamos",
        "Mylopotamos",
        "Mylopotamos",
        "Mylopotamos",
        "Mylopotamos",
        "Mylopotamos"
      ]
    ],
    "notes": [
      "Llegada por KIT. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional.",
      "Arrive via KIT. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal.",
      "Arrivée par KIT. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier.",
      "Anreise über KIT. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein.",
      "Arrivo tramite KIT. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale.",
      "Chegada por KIT. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal.",
      "Arribada per KIT. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional."
    ],
    "photo": [
      "Kythira_-_Hora_1.jpg",
      "5c",
      "Ingo Mehling",
      "CC BY-SA 3.0",
      "https://creativecommons.org/licenses/by-sa/3.0/"
    ]
  },
  {
    "slug": "skyros",
    "code": "SKU",
    "airport": "Skyros Airport",
    "town": "Chora (Skyros)",
    "stay": "3–4",
    "aliases": [
      "Skyros",
      "Skiros",
      "Esciros",
      "Sciro",
      "Esquiro",
      "Chora Skyros",
      "Σκύρος"
    ],
    "names": [
      "Esciros",
      "Skyros",
      "Skyros",
      "Skyros",
      "Sciro",
      "Esquiro",
      "Esciros"
    ],
    "descriptions": [
      "Chora sobre la roca, artesanía y costa de las Espóradas para conocer el patrimonio de Esciros.",
      "Chora on its rocky hill, crafts and Sporades coastline reveal Skyros’s heritage.",
      "Chora perchée sur son rocher, artisanat et littoral des Sporades pour découvrir le patrimoine de Skyros.",
      "Chora auf seinem Felsen, Handwerk und Sporadenküsten erschließen das Kulturerbe von Skyros.",
      "Chora sulla roccia, artigianato e costa delle Sporadi per conoscere il patrimonio di Sciro.",
      "Chora sobre a rocha, artesanato e costa das Espórades para conhecer o património de Esquiro.",
      "Khora sobre la roca, artesania i costa de les Espòrades per conèixer el patrimoni d’Esciros."
    ],
    "recommendations": [
      [
        "Chora de Esciros",
        "Chora of Skyros",
        "Chora de Skyros",
        "Chora von Skyros",
        "Chora di Sciro",
        "Chora de Esquiro",
        "Khora d’Esciros"
      ],
      [
        "Monasterio de Agios Georgios",
        "Agios Georgios monastery",
        "Monastère Agios Georgios",
        "Kloster Agios Georgios",
        "Monastero di Agios Georgios",
        "Mosteiro de Agios Georgios",
        "Monestir d’Agios Georgios"
      ],
      [
        "Museo Faltaits",
        "Faltaits Museum",
        "Musée Faltaits",
        "Faltaits-Museum",
        "Museo Faltaits",
        "Museu Faltaits",
        "Museu Faltaits"
      ],
      [
        "Playa de Molos",
        "Molos beach",
        "Plage de Molos",
        "Strand Molos",
        "Spiaggia di Molos",
        "Praia de Molos",
        "Platja de Molos"
      ]
    ],
    "notes": [
      "Llegada por SKU. La terminal y la localidad de referencia son lugares distintos. Organiza el traslado terrestre y los desplazamientos por la isla; comprueba vuelos, transportes y horarios para tus fechas. El servicio puede ser limitado o estacional.",
      "Arrive via SKU. The terminal and reference town are separate places. Arrange ground transport and journeys around the island; check flights, transport and opening times for your dates. Service may be limited or seasonal.",
      "Arrivée par SKU. Le terminal et la localité de référence sont distincts. Prévoyez le transfert terrestre et les trajets sur l’île ; vérifiez vols, transports et horaires pour vos dates. Le service peut être limité ou saisonnier.",
      "Anreise über SKU. Terminal und Bezugsort sind getrennte Orte. Landtransfer und Inselfahrten planen; Flüge, Verkehr und Öffnungszeiten für die Reisedaten prüfen. Das Angebot kann begrenzt oder saisonal sein.",
      "Arrivo tramite SKU. Il terminal e la località di riferimento sono luoghi distinti. Organizza il trasferimento e gli spostamenti sull’isola; verifica voli, trasporti e orari per le tue date. Il servizio può essere limitato o stagionale.",
      "Chegada por SKU. O terminal e a localidade de referência são lugares distintos. Organize o transporte terrestre e as deslocações pela ilha; confirme voos, transportes e horários para as suas datas. O serviço pode ser limitado ou sazonal.",
      "Arribada per SKU. La terminal i la localitat de referència són llocs diferents. Organitza el trasllat terrestre i els desplaçaments per l’illa; comprova vols, transports i horaris per a les teves dates. El servei pot ser limitat o estacional."
    ],
    "photo": [
      "Skyros-chora.JPG",
      "ce",
      "Han borg",
      "Public domain",
      "https://creativecommons.org/publicdomain/mark/1.0/"
    ]
  }
];
export const greeceAirportCoverage: DestinationProfile[] = seeds.map(seed => {
  const names=localize(seed.names as Seven), descriptions=localize(seed.descriptions as Seven), notes=localize(seed.notes as Seven);
  const recommendations=seed.recommendations.map(values=>localize(values as Seven));
  const translations=Object.fromEntries(locales.map(locale=>[locale,{
    name:names[locale],description:descriptions[locale],
    recommendations:recommendations.map(place=>place[locale]) as DestinationText['recommendations'],
    recommendedStay:seed.stay+' '+days[locale],seasonalityNote:seasons[locale]+' '+notes[locale],
  }])) as Record<Locale,DestinationText>;
  const [file,hash,credit,license,licenseUrl]=seed.photo, encoded=encodeURIComponent(file);
  return {id:'gr-'+seed.slug,slug:seed.slug,countryCode:'GR',country:'Grecia',...translations.es,translations,
    airports:[{iataCode:seed.code}],iataCodes:[seed.code],metropolitanCodes:[],
    aliases:Array.from(new Set([...Object.values(names),...seed.aliases])),
    image:seed.photo[5] ?? 'https://thumb.wikimedia.org/wikipedia/commons/thumb/'+hash[0]+'/'+hash+'/'+encoded+'/960px-'+encoded,
    imageSource:'https://commons.wikimedia.org/wiki/File:'+encoded,imageCredit:credit,
    imageLicense:license,imageLicenseUrl:licenseUrl,
    bestMonths:[5,6,9],lowSeasonMonths:[1,2,11],highSeasonMonths:[7,8],publication:{status:'draft'},
  };
});
