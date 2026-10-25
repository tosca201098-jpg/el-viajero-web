import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { slovakiaImages } from './slovakia-images';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, index) => [locale, values[index]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const visit = localize(['Visitar', 'Visit', 'Visiter', 'Besuchen:', 'Visitare', 'Visitar', 'Visitar']);
const practical = localize([
  'Comprueba horarios y entradas antes de viajar; una temporada tranquila no garantiza precios bajos.',
  'Check timetables and admission before travelling; a quieter season does not guarantee lower prices.',
  'Vérifiez horaires et accès avant de partir ; une saison calme ne garantit pas des prix bas.',
  'Fahrpläne und Eintritt vor der Reise prüfen; eine ruhige Saison garantiert keine niedrigen Preise.',
  'Controlla orari e ingressi prima di partire; una stagione tranquilla non garantisce prezzi più bassi.',
  'Confirme horários e entradas antes de viajar; uma época calma não garante preços mais baixos.',
  'Comprova horaris i entrades abans de viatjar; una temporada tranquil·la no garanteix preus baixos.',
]);
const ownAirport = localize([
  'Aeropuerto de llegada: {codes}. Comprueba los vuelos reales y el traslado local para tus fechas.',
  'Arrival airport: {codes}. Check actual flights and local transport for your dates.',
  'Aéroport d’arrivée : {codes}. Vérifiez les vols réels et le transfert local pour vos dates.',
  'Ankunftsflughafen: {codes}. Tatsächliche Flüge und Weiterfahrt für Ihre Daten prüfen.',
  'Aeroporto di arrivo: {codes}. Verifica i voli effettivi e il trasferimento per le tue date.',
  'Aeroporto de chegada: {codes}. Confirme voos reais e transporte local para as suas datas.',
  'Aeroport d’arribada: {codes}. Comprova els vols reals i el trasllat local per a les teves dates.',
]);
const ground = localize([
  'Sin aeropuerto comercial propio: llega por {codes} y continúa en tren, autobús o transporte local. Comprueba la conexión.',
  'No local commercial airport: arrive via {codes} and continue by train, bus or local transport. Check the connection.',
  'Sans aéroport commercial local : arrivez via {codes}, puis continuez en train, bus ou transport local. Vérifiez la liaison.',
  'Kein eigener Verkehrsflughafen: über {codes} anreisen und mit Bahn, Bus oder Nahverkehr weiterfahren. Verbindung prüfen.',
  'Senza aeroporto commerciale locale: arriva via {codes} e prosegui in treno, autobus o trasporto locale. Verifica i collegamenti.',
  'Sem aeroporto comercial local: chegue via {codes} e continue de comboio, autocarro ou transporte local. Confirme a ligação.',
  'Sense aeroport comercial propi: arriba via {codes} i continua en tren, autobús o transport local. Comprova la connexió.',
]);
const tatrasNote = localize([
  'En los Altos Tatras comprueba el estado de los senderos y los cierres estacionales del parque antes de salir.',
  'In the High Tatras check trail conditions and the park’s seasonal closures before setting out.',
  'Dans les Hautes Tatras, vérifiez l’état des sentiers et les fermetures saisonnières du parc.',
  'In der Hohen Tatra vor dem Aufbruch Wegzustand und saisonale Sperrungen des Parks prüfen.',
  'Negli Alti Tatra verifica le condizioni dei sentieri e le chiusure stagionali del parco.',
  'Nos Altos Tatras confirme o estado dos trilhos e os encerramentos sazonais do parque.',
  'Als Alts Tatres comprova l’estat dels senders i els tancaments estacionals del parc.',
]);
const paradiseNote = localize([
  'En el Paraíso Eslovaco consulta la transitabilidad de las gargantas; algunas rutas son de sentido único y requieren calzado firme.',
  'In Slovak Paradise check whether gorges are passable; some routes are one-way and require sturdy footwear.',
  'Au Paradis slovaque, vérifiez l’état des gorges ; certains parcours sont à sens unique et exigent de bonnes chaussures.',
  'Im Slowakischen Paradies die Begehbarkeit der Schluchten prüfen; einige Wege sind Einbahnwege und erfordern feste Schuhe.',
  'Nel Paradiso Slovacco controlla la percorribilità delle gole; alcuni itinerari sono a senso unico e richiedono scarpe robuste.',
  'No Paraíso Eslovaco confirme a passagem nas gargantas; alguns percursos são de sentido único e exigem calçado firme.',
  'Al Paradís Eslovac comprova l’accés als congostos; alguns itineraris són de sentit únic i requereixen calçat ferm.',
]);

type Seed = {
  slug: string; imageKey: keyof typeof slovakiaImages; names: Seven; descriptions: Seven;
  places: [string, string, string, string]; region: string; aliases?: string[];
  stay: string; airport?: 'BTS' | 'KSC' | 'TAT'; access?: ('BTS' | 'KSC' | 'TAT')[];
  season: 'city' | 'heritage' | 'mountain' | 'nature'; special?: 'tatras' | 'paradise';
};
const seasons = {
  city: { best: [4,5,6,9,10], low: [1,2,11], high: [7,8,12] },
  heritage: { best: [4,5,6,9,10], low: [1,2,11], high: [7,8] },
  mountain: { best: [6,7,8,9], low: [4,5,11], high: [7,8,12,1,2] },
  nature: { best: [5,6,7,8,9], low: [3,4,11], high: [7,8] },
};
const airportNames = {
  BTS: 'M. R. Štefánik Airport Bratislava',
  KSC: 'Košice International Airport',
  TAT: 'Poprad–Tatry Airport',
};
function profile(seed: Seed): DestinationProfile {
  const codes = seed.airport ? [seed.airport] : seed.access ?? [];
  const translations = Object.fromEntries(locales.map((locale, index) => [locale, {
    name: seed.names[index],
    description: seed.descriptions[index],
    recommendations: seed.places.map(place => visit[locale] + ' ' + place) as DestinationText['recommendations'],
    recommendedStay: seed.stay + ' ' + days[locale],
    seasonalityNote: [
      practical[locale],
      (seed.airport ? ownAirport[locale] : ground[locale]).replace('{codes}', codes.join(', ')),
      seed.special === 'tatras' ? tatrasNote[locale] : seed.special === 'paradise' ? paradiseNote[locale] : '',
    ].filter(Boolean).join(' '),
  }])) as Record<Locale, DestinationText>;
  const season = seasons[seed.season];
  return {
    id: 'sk-' + seed.slug, slug: seed.slug, countryCode: 'SK', country: 'Eslovaquia',
    federalStates: [seed.region], ...slovakiaImages[seed.imageKey], ...translations.es, translations,
    airports: seed.airport ? [{ iataCode: seed.airport }] : [],
    iataCodes: seed.airport ? [seed.airport] : [], metropolitanCodes: [],
    accessAirports: (seed.access ?? []).map(iataCode => ({ iataCode, name: airportNames[iataCode], countryCode: 'SK' })),
    aliases: Array.from(new Set([...(seed.aliases ?? []), ...seed.names])),
    bestMonths: season.best, lowSeasonMonths: season.low, highSeasonMonths: season.high,
    publication: { status: 'draft' },
  };
}

const seeds: Seed[] = [
  {
    slug:'bratislava', imageKey:'bratislava', region:'SK-BL', airport:'BTS', stay:'2–3', season:'city',
    names:['Bratislava','Bratislava','Bratislava','Bratislava','Bratislava','Bratislava','Bratislava'],
    descriptions:[
      'A orillas del Danubio, Bratislava combina casco antiguo, castillo y paseos junto al río.',
      'On the Danube, Bratislava combines an old town, a castle and riverside walks.',
      'Sur le Danube, Bratislava mêle vieille ville, château et promenades au bord du fleuve.',
      'An der Donau verbindet Bratislava Altstadt, Burg und Spaziergänge am Fluss.',
      'Sul Danubio, Bratislava unisce centro storico, castello e passeggiate sul fiume.',
      'Junto ao Danúbio, Bratislava reúne centro histórico, castelo e passeios ribeirinhos.',
      'Vora el Danubi, Bratislava combina nucli antic, castell i passejades pel riu.',
    ],
    places:['Bratislavský hrad','Staré Mesto','Dóm svätého Martina','Devínsky hrad'],
    aliases:['Pressburg'],
  },
  {
    slug:'kosice', imageKey:'kosice', region:'SK-KI', airport:'KSC', stay:'2–3', season:'city',
    names:['Košice','Košice','Košice','Košice','Košice','Košice','Košice'],
    descriptions:[
      'Košice destaca por su catedral gótica, su plaza alargada y su ambiente cultural.',
      'Košice stands out for its Gothic cathedral, long central square and cultural scene.',
      'Košice séduit par sa cathédrale gothique, sa grande place et sa vie culturelle.',
      'Košice bietet eine gotische Kathedrale, einen langen Hauptplatz und viel Kultur.',
      'Košice si distingue per la cattedrale gotica, la piazza allungata e la vita culturale.',
      'Košice destaca-se pela catedral gótica, praça central e ambiente cultural.',
      'Košice destaca per la catedral gòtica, la plaça allargada i la vida cultural.',
    ],
    places:['Dóm svätej Alžbety','Hlavná ulica','Kaplnka svätého Michala','Východoslovenské múzeum'],
    aliases:['Kosice','Cassovia'],
  },
  {
    slug:'poprad', imageKey:'poprad', region:'SK-PV', airport:'TAT', stay:'2–3', season:'mountain',
    names:['Poprad','Poprad','Poprad','Poprad','Poprad','Poprad','Poprad'],
    descriptions:[
      'Poprad es una puerta de entrada a los Tatras, con barrio histórico y conexiones hacia la montaña.',
      'Poprad is a gateway to the Tatras, with a historic quarter and links into the mountains.',
      'Poprad est une porte des Tatras, avec quartier historique et accès à la montagne.',
      'Poprad ist ein Tor zur Tatra mit historischem Viertel und Verbindungen ins Gebirge.',
      'Poprad è una porta sui Tatra, con quartiere storico e collegamenti verso i monti.',
      'Poprad é porta de entrada para os Tatras, com bairro histórico e ligações à montanha.',
      'Poprad és una porta als Tatres, amb barri històric i connexions cap a la muntanya.',
    ],
    places:['Spišská Sobota','Námestie svätého Egídia','Tatranská elektrická železnica','AquaCity Poprad'],
    aliases:['Poprad-Tatry','Poprad Tatry'],
  },
  {
    slug:'high-tatras', imageKey:'highTatras', region:'SK-PV', access:['TAT','KSC'], stay:'4–6', season:'mountain', special:'tatras',
    names:['Altos Tatras','High Tatras','Hautes Tatras','Hohe Tatra','Alti Tatra','Altos Tatras','Alts Tatres'],
    descriptions:[
      'Lagos alpinos y pueblos de montaña hacen de los Altos Tatras una base para caminar y disfrutar del paisaje.',
      'Alpine lakes and mountain villages make the High Tatras a base for hiking and scenery.',
      'Lacs alpins et villages de montagne font des Hautes Tatras un lieu idéal de randonnée.',
      'Alpenseen und Bergorte machen die Hohe Tatra zum Ziel für Wanderungen und Ausblicke.',
      'Laghi alpini e borghi montani fanno degli Alti Tatra una meta per escursioni e panorami.',
      'Lagos alpinos e aldeias de montanha fazem dos Altos Tatras um destino de trilhos e paisagens.',
      'Llacs alpins i pobles de muntanya fan dels Alts Tatres una base per caminar i gaudir del paisatge.',
    ],
    places:['Štrbské pleso','Starý Smokovec','Tatranská Lomnica','Hrebienok'],
    aliases:['Vysoké Tatry','Tatras','Tatry'],
  },
  {
    slug:'levoca', imageKey:'levoca', region:'SK-PV', access:['TAT','KSC'], stay:'1–2', season:'heritage',
    names:['Levoča','Levoča','Levoča','Levoča','Levoča','Levoča','Levoča'],
    descriptions:[
      'Levoča conserva murallas, una plaza renacentista y el célebre altar de la iglesia de Santiago.',
      'Levoča preserves walls, a Renaissance square and the celebrated altar of St James Church.',
      'Levoča conserve remparts, place Renaissance et célèbre autel de l’église Saint-Jacques.',
      'Levoča bewahrt Stadtmauern, Renaissanceplatz und den berühmten Altar der Jakobskirche.',
      'Levoča conserva mura, piazza rinascimentale e il celebre altare della chiesa di San Giacomo.',
      'Levoča conserva muralhas, praça renascentista e o célebre altar da igreja de São Tiago.',
      'Levoča conserva muralles, plaça renaixentista i el cèlebre altar de l’església de Sant Jaume.',
    ],
    places:['Námestie Majstra Pavla','Bazilika svätého Jakuba','Mestské hradby','Mariánska hora'],
    aliases:['Levoca'],
  },
  {
    slug:'spis-castle', imageKey:'spisCastle', region:'SK-PV', access:['TAT','KSC'], stay:'1–2', season:'heritage',
    names:['Castillo de Spiš y alrededores','Spiš Castle and surroundings','Château de Spiš et environs','Burg Spiš und Umgebung','Castello di Spiš e dintorni','Castelo de Spiš e arredores','Castell de Spiš i voltants'],
    descriptions:[
      'Las ruinas del castillo dominan Spišské Podhradie y se combinan con poblaciones históricas de la región.',
      'The castle ruins overlook Spišské Podhradie and pair well with the region’s historic towns.',
      'Les ruines du château dominent Spišské Podhradie et les villages historiques de la région.',
      'Die Burgruine überragt Spišské Podhradie und die historischen Orte der Region.',
      'Le rovine dominano Spišské Podhradie e si abbinano ai centri storici della regione.',
      'As ruínas dominam Spišské Podhradie e combinam com as vilas históricas da região.',
      'Les ruïnes dominen Spišské Podhradie i es combinen amb les viles històriques de la regió.',
    ],
    places:['Spišský hrad','Spišská Kapitula','Spišské Podhradie','Žehra'],
    aliases:['Spišský hrad','Spis Castle','Castillo de Spis','Spišské Podhradie'],
  },
  {
    slug:'banska-stiavnica', imageKey:'banskaStiavnica', region:'SK-BC', access:['BTS'], stay:'2–3', season:'heritage',
    names:['Banská Štiavnica','Banská Štiavnica','Banská Štiavnica','Banská Štiavnica','Banská Štiavnica','Banská Štiavnica','Banská Štiavnica'],
    descriptions:[
      'La antigua ciudad minera reúne calles empinadas, castillos y paisajes de colinas y embalses.',
      'This former mining town brings together steep streets, castles, hills and reservoirs.',
      'Cette ancienne ville minière réunit ruelles pentues, châteaux, collines et réservoirs.',
      'Die frühere Bergbaustadt bietet steile Gassen, Burgen, Hügel und Stauseen.',
      'L’antica città mineraria riunisce strade ripide, castelli, colline e bacini.',
      'A antiga cidade mineira reúne ruas íngremes, castelos, colinas e reservatórios.',
      'L’antiga ciutat minera reuneix carrers costeruts, castells, turons i embassaments.',
    ],
    places:['Starý zámok','Nový zámok','Námestie svätej Trojice','Banské múzeum v prírode'],
    aliases:['Banska Stiavnica','Schemnitz'],
  },
  {
    slug:'banska-bystrica', imageKey:'banskaBystrica', region:'SK-BC', access:['BTS'], stay:'2–3', season:'city',
    names:['Banská Bystrica','Banská Bystrica','Banská Bystrica','Banská Bystrica','Banská Bystrica','Banská Bystrica','Banská Bystrica'],
    descriptions:[
      'Banská Bystrica combina una plaza histórica, arquitectura cívica y memoria de la insurrección eslovaca.',
      'Banská Bystrica combines a historic square, civic architecture and Slovak uprising history.',
      'Banská Bystrica mêle place historique, architecture civique et mémoire du soulèvement slovaque.',
      'Banská Bystrica verbindet historischen Platz, Bürgerbauten und Geschichte des slowakischen Aufstands.',
      'Banská Bystrica unisce piazza storica, architettura civica e memoria dell’insurrezione slovacca.',
      'Banská Bystrica reúne praça histórica, arquitetura cívica e memória da revolta eslovaca.',
      'Banská Bystrica combina plaça històrica, arquitectura cívica i memòria de l’aixecament eslovac.',
    ],
    places:['Námestie SNP','Hodinová veža','Múzeum SNP','Barbakan'],
    aliases:['Banska Bystrica'],
  },
  {
    slug:'nitra', imageKey:'nitra', region:'SK-NI', access:['BTS'], stay:'1–2', season:'heritage',
    names:['Nitra','Nitra','Nitra','Nitra','Nitra','Nitra','Nitra'],
    descriptions:[
      'Nitra invita a recorrer su castillo, calles antiguas y miradores sobre el valle.',
      'Nitra invites visitors to explore its castle, old streets and valley viewpoints.',
      'Nitra invite à découvrir son château, ses vieilles rues et ses vues sur la vallée.',
      'Nitra lädt zu Burg, alten Gassen und Aussichtspunkten über dem Tal ein.',
      'Nitra invita a esplorare castello, vie antiche e panorami sulla valle.',
      'Nitra convida a conhecer o castelo, ruas antigas e miradouros sobre o vale.',
      'Nitra convida a recórrer el castell, els carrers antics i els miradors sobre la vall.',
    ],
    places:['Nitriansky hrad','Horné mesto','Zobor','Ponitrianske múzeum'],
  },
  {
    slug:'trencin', imageKey:'trencin', region:'SK-TC', access:['BTS'], stay:'1–2', season:'heritage',
    names:['Trenčín','Trenčín','Trenčín','Trenčín','Trenčín','Trenčín','Trenčín'],
    descriptions:[
      'Trenčín crece al pie de su castillo, con plazas peatonales y vistas sobre el río Váh.',
      'Trenčín sits below its castle, with pedestrian squares and views over the Váh River.',
      'Trenčín s’étend au pied de son château, entre places piétonnes et vues sur la Váh.',
      'Trenčín liegt unter seiner Burg, mit Fußgängerplätzen und Blick auf die Waag.',
      'Trenčín si trova ai piedi del castello, tra piazze pedonali e vedute sul Váh.',
      'Trenčín fica sob o castelo, com praças pedonais e vistas para o rio Váh.',
      'Trenčín creix als peus del castell, amb places de vianants i vistes sobre el Váh.',
    ],
    places:['Trenčiansky hrad','Mierové námestie','Rímsky nápis','Synagóga Trenčín'],
    aliases:['Trencin'],
  },
  {
    slug:'zilina', imageKey:'zilina', region:'SK-ZI', access:['BTS','TAT'], stay:'1–2', season:'city',
    names:['Žilina','Žilina','Žilina','Žilina','Žilina','Žilina','Žilina'],
    descriptions:[
      'Žilina ofrece un casco antiguo de soportales y sirve de base para explorar el valle del Váh.',
      'Žilina has an arcaded old town and makes a base for exploring the Váh valley.',
      'Žilina possède un vieux centre à arcades et permet d’explorer la vallée de la Váh.',
      'Žilina hat eine Altstadt mit Arkaden und ist Ausgangspunkt für das Waagtal.',
      'Žilina offre un centro storico porticato ed è base per esplorare la valle del Váh.',
      'Žilina tem centro histórico com arcadas e é base para explorar o vale do Váh.',
      'Žilina ofereix un nucli antic porticat i és base per explorar la vall del Váh.',
    ],
    places:['Mariánske námestie','Budatínsky hrad','Katedrála Najsvätejšej Trojice','Váh'],
    aliases:['Zilina'],
  },
  {
    slug:'slovak-paradise', imageKey:'slovakParadise', region:'SK-PV', access:['TAT','KSC'], stay:'3–4', season:'nature', special:'paradise',
    names:['Parque Nacional del Paraíso Eslovaco','Slovak Paradise National Park','Parc national du Paradis slovaque','Nationalpark Slowakisches Paradies','Parco nazionale del Paradiso Slovacco','Parque Nacional do Paraíso Eslovaco','Parc Nacional del Paradís Eslovac'],
    descriptions:[
      'El Paraíso Eslovaco reúne gargantas con escaleras, bosques y senderos señalizados.',
      'Slovak Paradise has ladder-lined gorges, forests and marked hiking routes.',
      'Le Paradis slovaque offre gorges à échelles, forêts et sentiers balisés.',
      'Das Slowakische Paradies bietet Schluchten mit Leitern, Wälder und markierte Wege.',
      'Il Paradiso Slovacco offre gole con scale, boschi e sentieri segnalati.',
      'O Paraíso Eslovaco reúne gargantas com escadas, florestas e trilhos sinalizados.',
      'El Paradís Eslovac reuneix congostos amb escales, boscos i senders senyalitzats.',
    ],
    places:['Suchá Belá','Prielom Hornádu','Tomášovský výhľad','Kláštorisko'],
    aliases:['Slovenský raj','Slovensky raj','Slovak Paradise','Paraíso Eslovaco'],
  },
];
export const slovakiaDestinations: DestinationProfile[] = seeds.map(profile);
