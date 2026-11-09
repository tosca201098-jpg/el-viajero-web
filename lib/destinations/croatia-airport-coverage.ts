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
    "slug": "osijek",
    "code": "OSI",
    "airport": "Osijek Airport — Klisa",
    "town": "Osijek",
    "aliases": [
      "Osijek",
      "Klisa",
      "Esseg"
    ],
    "stay": "2–3",
    "photo": [
      "Osijek_panorama_Gornji_grad.jpg",
      "90",
      "Rp031"
    ],
    "names": [
      "Osijek",
      "Osijek",
      "Osijek",
      "Osijek",
      "Osijek",
      "Osijek",
      "Osijek"
    ],
    "descriptions": [
      "La ribera del Drava y el barrio histórico de Tvrđa invitan a descubrir la Croacia de interior con paseos urbanos y patrimonio.",
      "The Drava riverfront and historic Tvrđa district introduce inland Croatia through urban walks and heritage.",
      "Les rives de la Drave et le quartier historique de Tvrđa invitent à découvrir les promenades et le patrimoine de la Croatie intérieure.",
      "Das Drau-Ufer und das historische Viertel Tvrđa erschließen das kroatische Binnenland mit Spaziergängen und Kulturerbe.",
      "Il lungofiume della Drava e lo storico quartiere Tvrđa invitano a scoprire il patrimonio della Croazia interna.",
      "A margem do Drava e o bairro histórico de Tvrđa convidam a descobrir o património da Croácia de interior.",
      "La riba del Drava i el barri històric de Tvrđa conviden a descobrir el patrimoni de la Croàcia interior."
    ],
    "recommendations": [
      [
        "Barrio de Tvrđa",
        "Tvrđa historic district",
        "Quartier historique de Tvrđa",
        "Altstadtviertel Tvrđa",
        "Quartiere storico Tvrđa",
        "Bairro histórico de Tvrđa",
        "Barri històric de Tvrđa"
      ],
      [
        "Paseo del Drava",
        "Drava promenade",
        "Promenade de la Drave",
        "Drau-Promenade",
        "Passeggiata della Drava",
        "Passeio do Drava",
        "Passeig del Drava"
      ],
      [
        "Concatedral de San Pedro y San Pablo",
        "Co-cathedral of St Peter and St Paul",
        "Cocathédrale Saint-Pierre-et-Saint-Paul",
        "Konkathedrale St. Peter und Paul",
        "Concattedrale dei Santi Pietro e Paolo",
        "Concatedral de São Pedro e São Paulo",
        "Concatedral de Sant Pere i Sant Pau"
      ],
      [
        "Plaza Ante Starčević",
        "Ante Starčević Square",
        "Place Ante Starčević",
        "Ante-Starčević-Platz",
        "Piazza Ante Starčević",
        "Praça Ante Starčević",
        "Plaça Ante Starčević"
      ]
    ],
    "notes": [
      "OSI está en Klisa, fuera de Osijek. Consulta el horario vigente y organiza el traslado terrestre; las rutas y frecuencias pueden cambiar.",
      "OSI is at Klisa outside Osijek. Check the current timetable and arrange a ground transfer; routes and frequencies can change.",
      "OSI se trouve à Klisa, hors d’Osijek. Vérifiez les horaires actuels et prévoyez le transfert terrestre ; lignes et fréquences peuvent changer.",
      "OSI liegt in Klisa außerhalb von Osijek. Aktuellen Flugplan und Landtransfer prüfen; Strecken und Frequenzen können sich ändern.",
      "OSI si trova a Klisa, fuori Osijek. Controlla l’orario aggiornato e organizza il trasferimento; rotte e frequenze possono cambiare.",
      "OSI fica em Klisa, fora de Osijek. Consulte o horário atual e organize o transporte terrestre; rotas e frequências podem mudar.",
      "OSI és a Klisa, fora d’Osijek. Consulta l’horari vigent i organitza el trasllat terrestre; les rutes i freqüències poden canviar."
    ]
  },
  {
    "slug": "bol",
    "code": "BWK",
    "airport": "Brač Airport — Bol / Gornji Humac",
    "town": "Bol",
    "aliases": [
      "Bol",
      "Bol Brac",
      "Bol Brač",
      "Brač",
      "Brac",
      "Gornji Humac"
    ],
    "stay": "3–4",
    "photo": [
      "Bol_Croatia.jpg",
      "fa",
      "Marin0110"
    ],
    "names": [
      "Bol (Brač)",
      "Bol (Brač)",
      "Bol (Brač)",
      "Bol (Brač)",
      "Bol (Brazza)",
      "Bol (Brač)",
      "Bol (Brač)"
    ],
    "descriptions": [
      "Bol combina su paseo portuario con las playas y paisajes de Brač; Zlatni rat y las vistas desde Vidova gora son visitas destacadas.",
      "Bol combines its harbour promenade with Brač’s beaches and scenery; Zlatni rat and the views from Vidova gora are highlights.",
      "Bol associe son port aux plages et paysages de Brač ; Zlatni rat et les vues de Vidova gora sont des visites marquantes.",
      "Bol verbindet die Hafenpromenade mit Stränden und Landschaften von Brač; Zlatni rat und die Aussicht von Vidova gora sind Höhepunkte.",
      "Bol unisce il lungomare ai paesaggi e alle spiagge di Brazza; Zlatni rat e il panorama da Vidova gora sono tappe di rilievo.",
      "Bol combina o passeio do porto com praias e paisagens de Brač; Zlatni rat e as vistas de Vidova gora são destaques.",
      "Bol combina el passeig del port amb les platges i paisatges de Brač; Zlatni rat i les vistes des de Vidova gora són visites destacades."
    ],
    "recommendations": [
      [
        "Playa Zlatni rat",
        "Zlatni rat beach",
        "Plage de Zlatni rat",
        "Strand Zlatni rat",
        "Spiaggia Zlatni rat",
        "Praia Zlatni rat",
        "Platja Zlatni rat"
      ],
      [
        "Puerto de Bol",
        "Bol harbour",
        "Port de Bol",
        "Hafen von Bol",
        "Porto di Bol",
        "Porto de Bol",
        "Port de Bol"
      ],
      [
        "Mirador de Vidova gora",
        "Vidova gora viewpoint",
        "Belvédère de Vidova gora",
        "Aussichtspunkt Vidova gora",
        "Belvedere di Vidova gora",
        "Miradouro de Vidova gora",
        "Mirador de Vidova gora"
      ],
      [
        "Monasterio dominico de Bol",
        "Bol Dominican monastery",
        "Monastère dominicain de Bol",
        "Dominikanerkloster Bol",
        "Monastero domenicano di Bol",
        "Mosteiro dominicano de Bol",
        "Monestir dominic de Bol"
      ]
    ],
    "notes": [
      "BWK está en el interior de Brač, cerca de Gornji Humac, fuera de Bol. La oferta comercial es limitada y estacional: comprueba el horario del operador y reserva el traslado. SPU y ferry son una alternativa; consulta puertos, vehículos y última salida.",
      "BWK is inland on Brač near Gornji Humac, outside Bol. Commercial service is limited and seasonal: check the operator’s timetable and arrange a transfer. SPU plus a ferry is an alternative; check ports, vehicles and last departures.",
      "BWK est à l’intérieur de Brač, près de Gornji Humac, hors de Bol. Le service commercial est limité et saisonnier : vérifiez horaires et transfert. SPU puis un ferry est une alternative ; contrôlez ports, véhicules et dernier départ.",
      "BWK liegt im Inselinneren von Brač bei Gornji Humac, außerhalb von Bol. Das kommerzielle Angebot ist begrenzt und saisonal: Flugplan und Transfer prüfen. Alternative: SPU und Fähre; Häfen, Fahrzeugmitnahme und letzte Abfahrt prüfen.",
      "BWK si trova nell’interno di Brazza, presso Gornji Humac, fuori Bol. Il servizio commerciale è limitato e stagionale: verifica orari e trasferimento. Alternativa: SPU e traghetto; controlla porti, veicoli e ultima partenza.",
      "BWK fica no interior de Brač, perto de Gornji Humac, fora de Bol. A oferta comercial é limitada e sazonal: confirme horário e transporte. SPU e ferry são alternativa; verifique portos, veículos e última saída.",
      "BWK és a l’interior de Brač, prop de Gornji Humac, fora de Bol. L’oferta comercial és limitada i estacional: comprova horaris i trasllat. SPU i ferri són una alternativa; consulta ports, vehicles i última sortida."
    ]
  },
  {
    "slug": "mali-losinj",
    "code": "LSZ",
    "airport": "Lošinj Airport — Mali Lošinj",
    "town": "Mali Lošinj",
    "aliases": [
      "Mali Lošinj",
      "Mali Losinj",
      "Lošinj",
      "Losinj",
      "Lussinpiccolo"
    ],
    "stay": "3–4",
    "photo": [
      "Lošinj.jpg",
      "b7",
      "August Dominus"
    ],
    "names": [
      "Mali Lošinj",
      "Mali Lošinj",
      "Mali Lošinj",
      "Mali Lošinj",
      "Lussinpiccolo",
      "Mali Lošinj",
      "Mali Lošinj"
    ],
    "descriptions": [
      "Mali Lošinj reúne un puerto de casas de colores, patrimonio marítimo y paseos entre pinares y bahías del Adriático.",
      "Mali Lošinj combines a colourful harbour, maritime heritage and walks through pine woods and Adriatic bays.",
      "Mali Lošinj réunit un port coloré, un patrimoine maritime et des promenades entre pinèdes et baies de l’Adriatique.",
      "Mali Lošinj verbindet einen farbenfrohen Hafen und maritimes Erbe mit Spaziergängen durch Pinien und Adriabuchten.",
      "Lussinpiccolo unisce un porto colorato e patrimonio marittimo a passeggiate tra pinete e baie dell’Adriatico.",
      "Mali Lošinj reúne um porto colorido, património marítimo e passeios entre pinhais e baías do Adriático.",
      "Mali Lošinj reuneix un port de cases de colors, patrimoni marítim i passejades entre pinedes i badies de l’Adriàtic."
    ],
    "recommendations": [
      [
        "Puerto de Mali Lošinj",
        "Mali Lošinj harbour",
        "Port de Mali Lošinj",
        "Hafen von Mali Lošinj",
        "Porto di Lussinpiccolo",
        "Porto de Mali Lošinj",
        "Port de Mali Lošinj"
      ],
      [
        "Museo de Apoxiómeno",
        "Museum of Apoxyomenos",
        "Musée de l’Apoxyomène",
        "Apoxyomenos-Museum",
        "Museo dell’Apoxyómenos",
        "Museu do Apoxiomeno",
        "Museu de l’Apoxiomen"
      ],
      [
        "Bahía de Čikat",
        "Čikat Bay",
        "Baie de Čikat",
        "Čikat-Bucht",
        "Baia di Čikat",
        "Baía de Čikat",
        "Badia de Čikat"
      ],
      [
        "Pinar de Čikat",
        "Čikat pine forest",
        "Pinède de Čikat",
        "Pinienwald Čikat",
        "Pineta di Čikat",
        "Pinhal de Čikat",
        "Pineda de Čikat"
      ]
    ],
    "notes": [
      "LSZ está fuera de Mali Lošinj. Su inclusión se justifica por el acceso turístico insular: ofrece aviación general, vuelos taxi y servicios limitados o estacionales. No presupongas una conexión regular. Confirma con el operador el vuelo y traslado; para llegar por tierra, revisa también los ferris.",
      "LSZ is outside Mali Lošinj. It is included for island tourism access: general aviation, air taxis and limited or seasonal services. Do not assume a scheduled connection. Confirm flight and transfer with the operator; overland arrivals also require checking ferries.",
      "LSZ est hors de Mali Lošinj. Son inclusion répond à l’accès touristique insulaire : aviation générale, taxis aériens et services limités ou saisonniers. Ne présumez pas de liaison régulière. Confirmez vol et transfert ; vérifiez aussi les ferries pour arriver par voie terrestre.",
      "LSZ liegt außerhalb von Mali Lošinj. Er ist wegen des touristischen Inselzugangs enthalten: allgemeine Luftfahrt, Lufttaxis und begrenzte oder saisonale Angebote. Linienverbindungen nicht voraussetzen. Flug und Transfer bestätigen; bei Landanreise auch Fähren prüfen.",
      "LSZ si trova fuori Lussinpiccolo. È incluso per l’accesso turistico all’isola: aviazione generale, aerotaxi e servizi limitati o stagionali. Non presumere un collegamento di linea. Conferma volo e trasferimento; per arrivare via terra controlla anche i traghetti.",
      "LSZ fica fora de Mali Lošinj. Inclui-se pelo acesso turístico à ilha: aviação geral, táxis aéreos e serviços limitados ou sazonais. Não pressuponha ligação regular. Confirme voo e transporte; para chegar por terra, verifique também os ferries.",
      "LSZ és fora de Mali Lošinj. S’inclou per l’accés turístic insular: aviació general, aerotaxis i serveis limitats o estacionals. No pressuposis una connexió regular. Confirma vol i trasllat; per arribar per terra, revisa també els ferris."
    ]
  }
];

export const croatiaAirportCoverage: DestinationProfile[] = seeds.map(seed => {
  const names=localize(seed.names as Seven), descriptions=localize(seed.descriptions as Seven), notes=localize(seed.notes as Seven);
  const recommendations=seed.recommendations.map(values=>localize(values as Seven));
  const translations=Object.fromEntries(locales.map(locale=>[locale,{
    name:names[locale],description:descriptions[locale],
    recommendations:recommendations.map(place=>place[locale]) as DestinationText['recommendations'],
    recommendedStay:seed.stay+' '+days[locale],seasonalityNote:seasons[locale]+' '+notes[locale],
  }])) as Record<Locale,DestinationText>;
  const [file,hash,credit]=seed.photo, encoded=encodeURIComponent(file);
  return {id:'hr-'+seed.slug,slug:seed.slug,countryCode:'HR',country:'Croacia',...translations.es,translations,
    airports:[{iataCode:seed.code}],iataCodes:[seed.code],metropolitanCodes:[],
    aliases:Array.from(new Set([...Object.values(names),...seed.aliases])),
    image:'https://thumb.wikimedia.org/wikipedia/commons/thumb/'+hash[0]+'/'+hash+'/'+encoded+'/960px-'+encoded,
    imageSource:'https://commons.wikimedia.org/wiki/File:'+encoded,imageCredit:credit,
    imageLicense:'CC BY-SA 4.0',imageLicenseUrl:'https://creativecommons.org/licenses/by-sa/4.0/',
    bestMonths:[5,6,9],lowSeasonMonths:[1,2,11],highSeasonMonths:[7,8],publication:{status:'draft'},
  };
});
export const croatiaCoverageAirports=seeds.map(seed=>({type:'airport' as const,code:seed.code,name:seed.airport,
  country_code:'HR' as const,city_code:seed.code,city_name:seed.names[0],
  index_strings:Array.from(new Set([...seed.names,...seed.aliases])),
}));
