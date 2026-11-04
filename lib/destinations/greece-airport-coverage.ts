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
      "Harbour_Kavala.jpg",
      "cc",
      "DocWoKav",
      "CC BY-SA 4.0",
      "https://creativecommons.org/licenses/by-sa/4.0/"
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
    image:'https://thumb.wikimedia.org/wikipedia/commons/thumb/'+hash[0]+'/'+hash+'/'+encoded+'/960px-'+encoded,
    imageSource:'https://commons.wikimedia.org/wiki/File:'+encoded,imageCredit:credit,
    imageLicense:license,imageLicenseUrl:licenseUrl,
    bestMonths:[5,6,9],lowSeasonMonths:[1,2,11],highSeasonMonths:[7,8],publication:{status:'draft'},
  };
});
