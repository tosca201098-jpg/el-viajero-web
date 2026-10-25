import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { hungaryImages } from './hungary-images';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, index) => [locale, values[index]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const visit = localize(['Visitar', 'Visit', 'Visiter', 'Besuchen:', 'Visitare', 'Visitar', 'Visitar']);
const practical = localize([
  'Comprueba horarios de transporte y apertura antes de viajar. La moneda es el florín húngaro; una temporada tranquila no garantiza precios bajos.',
  'Check transport and opening times before travelling. The currency is the Hungarian forint; a quieter season does not guarantee lower prices.',
  'Vérifiez les transports et horaires d’ouverture avant de partir. La monnaie est le forint hongrois ; une saison calme ne garantit pas des prix bas.',
  'Fahrpläne und Öffnungszeiten vor der Reise prüfen. Landeswährung ist der Forint; ruhige Saison garantiert keine niedrigen Preise.',
  'Controlla trasporti e orari di apertura prima di partire. La valuta è il fiorino ungherese; bassa stagione non garantisce prezzi bassi.',
  'Confirme transportes e horários antes da viagem. A moeda é o florim húngaro; época calma não garante preços mais baixos.',
  'Comprova transports i horaris abans de viatjar. La moneda és el fòrint hongarès; temporada tranquil·la no garanteix preus baixos.',
]);
const ownAirport = localize([
  'Aeropuerto de llegada: {codes}. Comprueba vuelos reales y el traslado urbano para tus fechas.',
  'Arrival airport: {codes}. Check actual flights and the city transfer for your dates.',
  'Aéroport d’arrivée : {codes}. Vérifiez les vols réels et le transfert urbain pour vos dates.',
  'Ankunftsflughafen: {codes}. Tatsächliche Flüge und Stadttransfer für die Reisedaten prüfen.',
  'Aeroporto di arrivo: {codes}. Verifica voli effettivi e trasferimento in città per le tue date.',
  'Aeroporto de chegada: {codes}. Confirme voos reais e transporte até à cidade para as suas datas.',
  'Aeroport d’arribada: {codes}. Comprova vols reals i trasllat a la ciutat per a les teves dates.',
]);
const ground = localize([
  'Sin aeropuerto comercial propio: llega por {codes} y continúa por tierra. Comprueba la conexión de tren o autobús.',
  'No local commercial airport: arrive via {codes} and continue overland. Check the train or bus connection.',
  'Sans aéroport commercial local : arrivez via {codes}, puis continuez par voie terrestre. Vérifiez train ou bus.',
  'Kein eigener Verkehrsflughafen: über {codes} anreisen und mit Bahn oder Bus weiterfahren. Verbindung prüfen.',
  'Senza aeroporto commerciale locale: arriva via {codes} e prosegui via terra. Verifica treno o autobus.',
  'Sem aeroporto comercial local: chegue via {codes} e continue por terra. Confirme comboio ou autocarro.',
  'Sense aeroport comercial propi: arriba via {codes} i continua per terra. Comprova tren o autobús.',
]);
const park = localize([
  'En Hortobágy consulta las normas oficiales, los senderos abiertos y los posibles requisitos de entrada o guía.',
  'In Hortobágy check official rules, open trails and any entry or guide requirements.',
  'À Hortobágy, vérifiez les règles officielles, les sentiers ouverts et les éventuelles exigences de billet ou de guide.',
  'In Hortobágy offizielle Regeln, geöffnete Wege und mögliche Eintritts- oder Führerpflicht prüfen.',
  'A Hortobágy verifica le regole ufficiali, i sentieri aperti e gli eventuali requisiti di ingresso o guida.',
  'Em Hortobágy confirme as regras oficiais, trilhos abertos e possíveis requisitos de entrada ou guia.',
  'A Hortobágy comprova les normes oficials, els senders oberts i els possibles requisits d’entrada o guia.',
]);
type Seed = {
  slug: keyof typeof hungaryImages; names: Seven; descriptions: Seven;
  places: [string, string, string, string]; region: string; aliases?: string[];
  stay: string; airports?: string[]; access?: string[]; auxiliary?: string[];
  season: 'city' | 'lake' | 'nature' | 'spa';
};
const seasons = {
  city: { best: [4,5,6,9,10], low: [1,2,11], high: [7,8,12] },
  lake: { best: [5,6,7,8,9], low: [1,2,3,11], high: [7,8] },
  nature: { best: [4,5,6,9,10], low: [1,2,11], high: [7,8] },
  spa: { best: [4,5,6,9,10], low: [1,2,11], high: [7,8] },
};
const airportNames: Record<string, string> = {
  BUD: 'Budapest Ferenc Liszt International Airport',
  DEB: 'Debrecen International Airport',
};
function profile(seed: Seed): DestinationProfile {
  const airportCodes = seed.airports ?? [];
  const arrivalCodes = airportCodes.length ? airportCodes : seed.access ?? [];
  const translations = Object.fromEntries(locales.map((locale, index) => [locale, {
    name: seed.names[index],
    description: seed.descriptions[index],
    recommendations: seed.places.map(place => `${visit[locale]} ${place}`) as DestinationText['recommendations'],
    recommendedStay: `${seed.stay} ${days[locale]}`,
    seasonalityNote: [
      practical[locale],
      (airportCodes.length ? ownAirport[locale] : ground[locale]).replace('{codes}', arrivalCodes.join(', ')),
      seed.slug === 'hortobagy' ? park[locale] : '',
    ].filter(Boolean).join(' '),
  }])) as Record<Locale, DestinationText>;
  const season = seasons[seed.season];
  return {
    id: `hu-${seed.slug}`, slug: seed.slug, countryCode: 'HU', country: 'Hungría',
    federalStates: [seed.region], ...hungaryImages[seed.slug], ...translations.es, translations,
    airports: airportCodes.map(iataCode => ({ iataCode })), iataCodes: airportCodes,
    metropolitanCodes: [], auxiliaryCodes: seed.auxiliary ?? [],
    accessAirports: (seed.access ?? []).map(iataCode => ({ iataCode, name: airportNames[iataCode], countryCode: 'HU' })),
    aliases: Array.from(new Set([...(seed.aliases ?? []), ...seed.names])),
    bestMonths: season.best, lowSeasonMonths: season.low, highSeasonMonths: season.high,
    publication: { status: 'draft' },
  };
}

const hungarySeeds: Seed[] = [
  {
    "slug": "budapest",
    "names": [
      "Budapest",
      "Budapest",
      "Budapest",
      "Budapest",
      "Budapest",
      "Budapeste",
      "Budapest"
    ],
    "descriptions": [
      "A orillas del Danubio, Budapest reúne el Parlamento, el barrio del castillo y baños termales históricos.",
      "On the Danube, Budapest brings together Parliament, the Castle District and historic thermal baths.",
      "Sur le Danube, Budapest réunit le Parlement, le quartier du château et des bains thermaux historiques.",
      "An der Donau vereint Budapest das Parlament, das Burgviertel und historische Thermalbäder.",
      "Sul Danubio, Budapest unisce il Parlamento, il quartiere del castello e storici bagni termali.",
      "Às margens do Danúbio, Budapeste reúne o Parlamento, o bairro do castelo e banhos termais históricos.",
      "A la vora del Danubi, Budapest reuneix el Parlament, el barri del castell i banys termals històrics."
    ],
    "places": [
      "Országház",
      "Halászbástya",
      "Budai Vár",
      "Széchenyi gyógyfürdő"
    ],
    "region": "HU-BU",
    "aliases": [
      "Buda",
      "Pest"
    ],
    "stay": "3–4",
    "airports": [
      "BUD"
    ],
    "season": "city"
  },
  {
    "slug": "debrecen",
    "names": [
      "Debrecen",
      "Debrecen",
      "Debrecen",
      "Debrecen",
      "Debrecen",
      "Debrecen",
      "Debrecen"
    ],
    "descriptions": [
      "La gran iglesia reformada y sus museos marcan el centro cultural del este húngaro.",
      "The Great Reformed Church and museums anchor this cultural centre of eastern Hungary.",
      "La Grande Église réformée et les musées font de Debrecen un centre culturel de l'est hongrois.",
      "Die Große Reformierte Kirche und Museen prägen dieses Kulturzentrum im Osten Ungarns.",
      "La Grande Chiesa riformata e i musei rendono Debrecen un centro culturale dell'Ungheria orientale.",
      "A Grande Igreja Reformada e os museus fazem de Debrecen um centro cultural do leste húngaro.",
      "La Gran Església Reformada i els museus fan de Debrecen un centre cultural de l'est hongarès."
    ],
    "places": [
      "Nagytemplom",
      "Déri Múzeum",
      "Nagyerdő",
      "MODEM"
    ],
    "region": "HU-HB",
    "stay": "2–3",
    "airports": [
      "DEB"
    ],
    "season": "city"
  },
  {
    "slug": "szeged",
    "names": [
      "Szeged",
      "Szeged",
      "Szeged",
      "Szeged",
      "Szeged",
      "Szeged",
      "Szeged"
    ],
    "descriptions": [
      "La catedral, las plazas y las riberas del Tisza dan a Szeged un aire mediterráneo.",
      "The cathedral, squares and Tisza riverbanks give Szeged a sunny city-break feel.",
      "La cathédrale, les places et les rives de la Tisza donnent à Szeged une allure ensoleillée.",
      "Dom, Plätze und Ufer der Theiß verleihen Szeged eine sonnige Atmosphäre.",
      "La cattedrale, le piazze e le rive del Tibisco danno a Szeged un'atmosfera luminosa.",
      "A catedral, as praças e as margens do Tisza dão a Szeged um ambiente luminoso.",
      "La catedral, les places i les ribes del Tisza donen a Szeged un ambient lluminós."
    ],
    "places": [
      "Dóm tér",
      "Fogadalmi templom",
      "Móra Ferenc Múzeum",
      "Tisza-part"
    ],
    "region": "HU-CS",
    "stay": "2–3",
    "access": [
      "BUD"
    ],
    "season": "city"
  },
  {
    "slug": "pecs",
    "names": [
      "Pécs",
      "Pécs",
      "Pécs",
      "Pécs",
      "Pécs",
      "Pécs",
      "Pécs"
    ],
    "descriptions": [
      "Pécs combina patrimonio romano, una plaza otomana y cerámicas Zsolnay al pie de Mecsek.",
      "Pécs combines Roman heritage, an Ottoman-era square and Zsolnay ceramics below the Mecsek hills.",
      "Pécs mêle héritage romain, place ottomane et céramiques Zsolnay au pied du Mecsek.",
      "Pécs verbindet römisches Erbe, einen Platz aus osmanischer Zeit und Zsolnay-Keramik am Mecsek.",
      "Pécs unisce eredità romana, una piazza ottomana e ceramiche Zsolnay ai piedi del Mecsek.",
      "Pécs combina património romano, uma praça otomana e cerâmica Zsolnay junto ao Mecsek.",
      "Pécs combina patrimoni romà, una plaça otomana i ceràmica Zsolnay al peu del Mecsek."
    ],
    "places": [
      "Széchenyi tér",
      "Ókeresztény sírkamrák",
      "Zsolnay Kulturális Negyed",
      "Pécsi székesegyház"
    ],
    "region": "HU-BA",
    "stay": "2–3",
    "access": [
      "BUD"
    ],
    "season": "city"
  },
  {
    "slug": "eger",
    "names": [
      "Eger",
      "Eger",
      "Eger",
      "Eger",
      "Eger",
      "Eger",
      "Eger"
    ],
    "descriptions": [
      "Castillo, fachadas barrocas y bodegas hacen de Eger una escapada cultural y vinícola.",
      "A castle, Baroque streets and wine cellars make Eger a cultural and wine-focused escape.",
      "Château, rues baroques et caves à vin font d'Eger une escapade culturelle et viticole.",
      "Burg, barocke Gassen und Weinkeller machen Eger zu einem Kultur- und Weinreiseziel.",
      "Castello, vie barocche e cantine rendono Eger una meta di cultura e vino.",
      "Castelo, ruas barrocas e adegas fazem de Eger uma escapadinha cultural e vínica.",
      "Castell, carrers barrocs i cellers fan d'Eger una escapada cultural i vinícola."
    ],
    "places": [
      "Egri vár",
      "Dobó tér",
      "Egri minaret",
      "Szépasszony-völgy"
    ],
    "region": "HU-HE",
    "stay": "2–3",
    "access": [
      "BUD"
    ],
    "season": "city"
  },
  {
    "slug": "gyor",
    "names": [
      "Győr y Pannonhalma",
      "Győr and Pannonhalma",
      "Győr et Pannonhalma",
      "Győr und Pannonhalma",
      "Győr e Pannonhalma",
      "Győr e Pannonhalma",
      "Győr i Pannonhalma"
    ],
    "descriptions": [
      "Las plazas barrocas de Győr se combinan con la abadía de Pannonhalma en una ruta tranquila.",
      "Győr's Baroque squares pair with Pannonhalma Abbey on a relaxed cultural route.",
      "Les places baroques de Győr se prolongent jusqu'à l'abbaye de Pannonhalma.",
      "Die barocken Plätze von Győr und die Abtei Pannonhalma bilden eine ruhige Kulturroute.",
      "Le piazze barocche di Győr e l'abbazia di Pannonhalma formano un itinerario culturale.",
      "As praças barrocas de Győr e a abadia de Pannonhalma criam um roteiro cultural.",
      "Les places barroques de Győr i l'abadia de Pannonhalma formen una ruta cultural."
    ],
    "places": [
      "Széchenyi tér",
      "Győri városháza",
      "Pannonhalmi Főapátság",
      "Rába-part"
    ],
    "region": "HU-GS",
    "aliases": [
      "Győr",
      "Gyor",
      "Pannonhalma"
    ],
    "stay": "2–3",
    "access": [
      "BUD"
    ],
    "season": "city"
  },
  {
    "slug": "sopron",
    "names": [
      "Sopron",
      "Sopron",
      "Sopron",
      "Sopron",
      "Sopron",
      "Sopron",
      "Sopron"
    ],
    "descriptions": [
      "Sopron conserva calles medievales y una torre histórica cerca de los paisajes de Fertő.",
      "Sopron preserves medieval streets and a historic tower near the Fertő landscape.",
      "Sopron conserve des rues médiévales et une tour historique près du paysage de Fertő.",
      "Sopron bewahrt mittelalterliche Gassen und einen historischen Turm nahe der Fertő-Landschaft.",
      "Sopron conserva vicoli medievali e una torre storica vicino al paesaggio del Fertő.",
      "Sopron preserva ruas medievais e uma torre histórica junto à paisagem de Fertő.",
      "Sopron conserva carrers medievals i una torre històrica prop del paisatge de Fertő."
    ],
    "places": [
      "Tűztorony",
      "Fő tér",
      "Storno-ház",
      "Fertő-tó"
    ],
    "region": "HU-GS",
    "stay": "2–3",
    "access": [
      "BUD"
    ],
    "season": "city"
  },
  {
    "slug": "tihany",
    "names": [
      "Tihany y el lago Balatón",
      "Tihany and Lake Balaton",
      "Tihany et le lac Balaton",
      "Tihany und der Plattensee",
      "Tihany e il lago Balaton",
      "Tihany e o lago Balaton",
      "Tihany i el llac Balaton"
    ],
    "descriptions": [
      "La península de Tihany ofrece vistas del Balatón, una abadía y senderos entre pueblos lacustres.",
      "The Tihany peninsula offers Balaton views, an abbey and trails between lakeside villages.",
      "La presqu'île de Tihany offre vues sur le Balaton, abbaye et sentiers entre villages.",
      "Die Halbinsel Tihany bietet Balaton-Blicke, eine Abtei und Wege zwischen Dörfern am See.",
      "La penisola di Tihany offre viste sul Balaton, un'abbazia e sentieri tra borghi lacustri.",
      "A península de Tihany oferece vistas do Balaton, uma abadia e trilhos entre aldeias.",
      "La península de Tihany ofereix vistes del Balaton, una abadia i senders entre pobles."
    ],
    "places": [
      "Tihanyi Bencés Apátság",
      "Belső-tó",
      "Levendula Ház",
      "Balatonfüred"
    ],
    "region": "HU-VE",
    "aliases": [
      "Tihany",
      "Balatón",
      "Balaton",
      "Lago Balatón",
      "Lake Balaton"
    ],
    "stay": "3–5",
    "access": [
      "BUD"
    ],
    "season": "lake"
  },
  {
    "slug": "heviz",
    "names": [
      "Hévíz",
      "Hévíz",
      "Hévíz",
      "Hévíz",
      "Hévíz",
      "Hévíz",
      "Hévíz"
    ],
    "descriptions": [
      "Hévíz gira en torno a su lago termal y permite explorar la parte occidental del Balatón.",
      "Hévíz centres on its thermal lake and offers a base for western Lake Balaton.",
      "Hévíz s'organise autour de son lac thermal et permet de découvrir l'ouest du Balaton.",
      "Hévíz dreht sich um seinen Thermalsee und eignet sich als Ausgangspunkt für den Westbalaton.",
      "Hévíz ruota attorno al lago termale ed è una base per esplorare il Balaton occidentale.",
      "Hévíz gira em torno do lago termal e permite explorar o oeste do Balaton.",
      "Hévíz gira al voltant del llac termal i permet explorar l'oest del Balaton."
    ],
    "places": [
      "Hévízi-tó",
      "Egregyi pincesor",
      "Festetics-kastély",
      "Keszthely"
    ],
    "region": "HU-ZA",
    "aliases": [
      "Heviz"
    ],
    "stay": "2–4",
    "access": [
      "BUD"
    ],
    "auxiliary": [
      "SOB"
    ],
    "season": "spa"
  },
  {
    "slug": "tokaj",
    "names": [
      "Tokaj",
      "Tokaj",
      "Tokaj",
      "Tokaj",
      "Tokaj",
      "Tokaj",
      "Tokaj"
    ],
    "descriptions": [
      "Viñedos, colinas y bodegas históricas definen este paisaje cultural del noreste.",
      "Vineyards, hills and historic cellars define this cultural landscape in the northeast.",
      "Vignes, collines et caves historiques définissent ce paysage culturel du nord-est.",
      "Weinberge, Hügel und historische Keller prägen diese Kulturlandschaft im Nordosten.",
      "Vigneti, colline e cantine storiche definiscono questo paesaggio culturale del nord-est.",
      "Vinhas, colinas e adegas históricas definem esta paisagem cultural do nordeste.",
      "Vinyes, turons i cellers històrics defineixen aquest paisatge cultural del nord-est."
    ],
    "places": [
      "Tokaji borvidék",
      "Tokaji Múzeum",
      "Kopasz-hegy",
      "Rákóczi Pince"
    ],
    "region": "HU-BZ",
    "stay": "2–3",
    "access": [
      "DEB"
    ],
    "season": "nature"
  },
  {
    "slug": "szentendre",
    "names": [
      "Szentendre y el recodo del Danubio",
      "Szentendre and the Danube Bend",
      "Szentendre et la boucle du Danube",
      "Szentendre und das Donauknie",
      "Szentendre e l'ansa del Danubio",
      "Szentendre e a curva do Danúbio",
      "Szentendre i el revolt del Danubi"
    ],
    "descriptions": [
      "Calles de artistas, museos y pueblos ribereños invitan a recorrer el Danubio al norte de Budapest.",
      "Artists' lanes, museums and riverside towns invite a trip north of Budapest along the Danube.",
      "Ruelles d'artistes, musées et villages au bord de l'eau invitent à remonter le Danube.",
      "Künstlergassen, Museen und Orte am Fluss laden zu einer Reise nördlich von Budapest ein.",
      "Vicoli di artisti, musei e borghi sul fiume invitano a seguire il Danubio verso nord.",
      "Ruelas de artistas, museus e vilas ribeirinhas convidam a seguir o Danúbio para norte.",
      "Carrers d'artistes, museus i pobles vora el riu conviden a seguir el Danubi cap al nord."
    ],
    "places": [
      "Fő tér",
      "Skanzen",
      "Visegrádi fellegvár",
      "Esztergomi bazilika"
    ],
    "region": "HU-PE",
    "aliases": [
      "Szentendre",
      "Recodo del Danubio",
      "Danube Bend",
      "Visegrád"
    ],
    "stay": "2–3",
    "access": [
      "BUD"
    ],
    "season": "city"
  },
  {
    "slug": "hortobagy",
    "names": [
      "Parque Nacional de Hortobágy",
      "Hortobágy National Park",
      "Parc national de Hortobágy",
      "Nationalpark Hortobágy",
      "Parco nazionale di Hortobágy",
      "Parque Nacional de Hortobágy",
      "Parc Nacional d'Hortobágy"
    ],
    "descriptions": [
      "La puszta de Hortobágy combina humedales, tradición pastoril y grandes horizontes.",
      "Hortobágy's puszta brings together wetlands, pastoral heritage and wide horizons.",
      "La puszta de Hortobágy mêle zones humides, patrimoine pastoral et vastes horizons.",
      "Die Puszta von Hortobágy verbindet Feuchtgebiete, Hirtenkultur und weite Horizonte.",
      "La puszta di Hortobágy unisce zone umide, tradizioni pastorali e grandi orizzonti.",
      "A puszta de Hortobágy reúne zonas húmidas, tradição pastoril e amplos horizontes.",
      "La puszta d'Hortobágy combina aiguamolls, tradició pastoral i grans horitzons."
    ],
    "places": [
      "Kilenclyukú híd",
      "Hortobágyi Nemzeti Park Látogatóközpont",
      "Hortobágyi Vadaspark",
      "Hortobágyi Halastó"
    ],
    "region": "HU-HB",
    "aliases": [
      "Hortobágy",
      "Hortobagy"
    ],
    "stay": "2–3",
    "access": [
      "DEB"
    ],
    "season": "nature"
  }
];
export const hungaryDestinations: DestinationProfile[] = hungarySeeds.map(profile);
