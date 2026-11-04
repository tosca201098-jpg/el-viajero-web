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
