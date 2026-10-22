import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { austriaImages } from './austria-images';

type Row = [name: string, description: string, recommendations: DestinationText['recommendations']];
const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
const localized = (values: [string, string, string, string, string, string, string]) =>
  Object.fromEntries(locales.map((locale, index) => [locale, values[index]])) as Record<Locale, string>;
const dayUnit = localized(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const generalAdvice = localized([
  'Austria usa el euro. Comprueba las conexiones y horarios de trenes y autobuses antes de viajar; en montaña, senderos y remontes dependen de la temporada y el tiempo.',
  'Austria uses the euro. Check train and bus connections before travelling; mountain trails and lifts depend on season and weather.',
  'L’Autriche utilise l’euro. Vérifiez trains et bus avant de partir ; sentiers et remontées de montagne dépendent de la saison et de la météo.',
  'In Österreich gilt der Euro. Bahn- und Busverbindungen vor der Reise prüfen; Bergwege und Seilbahnen hängen von Saison und Wetter ab.',
  'In Austria si usa l’euro. Controlla treni e autobus prima di partire; sentieri e impianti montani dipendono da stagione e meteo.',
  'A Áustria usa o euro. Confirme comboios e autocarros antes da viagem; trilhos e teleféricos dependem da época e do tempo.',
  'Àustria fa servir l’euro. Comprova trens i autobusos abans de viatjar; senders i remuntadors depenen de l’estació i del temps.',
]);
const airportAdvice = localized([
  'Aeropuerto de llegada: {code}. Comprueba los vuelos y el traslado local para tus fechas.',
  'Arrival airport: {code}. Check flights and local transfers for your dates.',
  'Aéroport d’arrivée : {code}. Vérifiez vols et transfert local pour vos dates.',
  'Ankunftsflughafen: {code}. Flüge und Weiterfahrt für die Reisedaten prüfen.',
  'Aeroporto di arrivo: {code}. Verifica voli e trasferimenti per le tue date.',
  'Aeroporto de chegada: {code}. Confirme voos e transporte local para as suas datas.',
  'Aeroport d’arribada: {code}. Comprova vols i trasllats locals per a les dates triades.',
]);
const limitedAdvice = localized([
  'La oferta comercial de {code} puede ser limitada o estacional; confirma la ruta concreta antes de planificar.',
  'Commercial flights at {code} may be limited or seasonal; confirm your specific route before planning.',
  'Les vols commerciaux à {code} peuvent être limités ou saisonniers ; confirmez la liaison envisagée.',
  'Das Flugangebot ab {code} kann begrenzt oder saisonal sein; die konkrete Strecke vorab prüfen.',
  'I voli commerciali da {code} possono essere limitati o stagionali; verifica la rotta prevista.',
  'Os voos comerciais em {code} podem ser limitados ou sazonais; confirme a rota pretendida.',
  'Els vols comercials a {code} poden ser limitats o estacionals; confirma la ruta concreta.',
]);
const groundAdvice = localized([
  'No hay aeropuerto comercial propio: llega por {codes} y continúa por tierra. Comprueba las conexiones de tren o autobús.',
  'There is no local commercial airport: arrive via {codes} and continue overland. Check train or bus connections.',
  'Pas d’aéroport commercial sur place : arrivez par {codes} puis poursuivez par voie terrestre. Vérifiez trains et bus.',
  'Kein eigener Verkehrsflughafen: über {codes} anreisen und am Boden weiterfahren. Bahn- und Busanschlüsse prüfen.',
  'Non c’è un aeroporto commerciale locale: arriva via {codes} e prosegui via terra. Verifica treni e autobus.',
  'Não existe aeroporto comercial local: chegue por {codes} e continue por terra. Confirme comboios e autocarros.',
  'No hi ha aeroport comercial propi: arriba per {codes} i continua per terra. Comprova trens i autobusos.',
]);
const hallstattAdvice = localized([
  'La estación de Hallstatt está al otro lado del lago; confirma la conexión del transbordador.',
  'Hallstatt railway station is across the lake; check the ferry connection.',
  'La gare de Hallstatt est de l’autre côté du lac ; vérifiez la liaison par bateau.',
  'Der Bahnhof Hallstatt liegt auf der anderen Seeseite; Fährverbindung prüfen.',
  'La stazione di Hallstatt è sull’altra sponda del lago; verifica il traghetto.',
  'A estação de Hallstatt fica na outra margem do lago; confirme o barco.',
  'L’estació de Hallstatt és a l’altra riba del llac; comprova el transbordador.',
]);
const borderAdvice = localized([
  'FDH está en Alemania; ACH y ZRH, en Suiza. Los tres requieren traslado terrestre y ACH tiene una oferta de vuelos limitada.',
  'FDH is in Germany; ACH and ZRH are in Switzerland. All require an overland transfer, and ACH has limited flights.',
  'FDH est en Allemagne ; ACH et ZRH en Suisse. Tous nécessitent un transfert terrestre et les vols à ACH sont limités.',
  'FDH liegt in Deutschland; ACH und ZRH in der Schweiz. Alle erfordern eine Weiterfahrt am Boden; das Flugangebot ab ACH ist begrenzt.',
  'FDH è in Germania; ACH e ZRH in Svizzera. Tutti richiedono un trasferimento via terra e i voli da ACH sono limitati.',
  'FDH fica na Alemanha; ACH e ZRH na Suíça. Todos exigem transporte terrestre e os voos em ACH são limitados.',
  'FDH és a Alemanya; ACH i ZRH, a Suïssa. Tots requereixen trasllat terrestre i els vols d’ACH són limitats.',
]);

type Seed = {
  slug: keyof typeof austriaImages; federalStates: string[]; stay: string;
  airports?: string[]; access?: string[]; aliases: string[];
  best: number[]; low: number[]; high: number[];
  limited?: boolean; hallstatt?: boolean; border?: boolean;
};
const accessAirportNames: Record<string, { name: string; countryCode: string }> = {
  VIE: { name: 'Vienna International Airport', countryCode: 'AT' },
  SZG: { name: 'Salzburg Airport', countryCode: 'AT' },
  INN: { name: 'Innsbruck Airport', countryCode: 'AT' },
  LNZ: { name: 'Linz Airport', countryCode: 'AT' },
  FDH: { name: 'Friedrichshafen Airport', countryCode: 'DE' },
  ACH: { name: 'St. Gallen–Altenrhein Airport', countryCode: 'CH' },
  ZRH: { name: 'Zurich Airport', countryCode: 'CH' },
};
function destination(seed: Seed, rows: Record<Locale, Row>): DestinationProfile {
  const airports = seed.airports ?? [];
  const translations = Object.fromEntries(locales.map(locale => {
    const [name, description, recommendations] = rows[locale];
    const code = airports.join(', ');
    const notes = [generalAdvice[locale],
      airports.length ? airportAdvice[locale].replace('{code}', code) : groundAdvice[locale].replace('{codes}', (seed.access ?? []).join(', ')),
      seed.limited ? limitedAdvice[locale].replace('{code}', code) : '',
      seed.hallstatt ? hallstattAdvice[locale] : '',
      seed.border ? borderAdvice[locale] : '',
    ].filter(Boolean).join(' ');
    return [locale, { name, description, recommendations, recommendedStay: `${seed.stay} ${dayUnit[locale]}`, seasonalityNote: notes }];
  })) as Record<Locale, DestinationText>;
  return {
    id: `at-${seed.slug}`, slug: seed.slug, countryCode: 'AT', country: 'Austria',
    federalStates: seed.federalStates, ...austriaImages[seed.slug], ...translations.es, translations,
    airports: airports.map(iataCode => ({ iataCode })), iataCodes: airports,
    metropolitanCodes: [], accessAirports: (seed.access ?? []).map(iataCode => ({ iataCode, ...accessAirportNames[iataCode] })),
    aliases: Array.from(new Set([...seed.aliases, ...Object.values(translations).map(text => text.name)])),
    bestMonths: seed.best, lowSeasonMonths: seed.low, highSeasonMonths: seed.high,
    publication: { status: 'draft' },
  };
}
const city = { best: [4, 5, 6, 9, 10], low: [1, 2, 11], high: [7, 8, 12] };
const lakes = { best: [5, 6, 7, 8, 9], low: [1, 2, 11], high: [7, 8] };
const alpine = { best: [1, 2, 6, 7, 8, 9, 12], low: [4, 5, 11], high: [1, 2, 7, 8, 12] };

export const austriaDestinations: DestinationProfile[] = [
  destination({ slug: 'vienna', federalStates: ['AT-9'], stay: '3–4', airports: ['VIE'], aliases: ['Viena', 'Wien', 'Vienna', 'Vienne', 'Viena de Austria'], ...city }, {
    es: ['Viena', 'Palacios imperiales, cafés históricos y museos se unen a barrios animados junto al Danubio.', ['Visitar el palacio de Schönbrunn', 'Recorrer el centro histórico y la catedral de San Esteban', 'Descubrir el Belvedere', 'Pasear por el Prater y la ribera del Danubio']],
    en: ['Vienna', 'Imperial palaces, historic cafés and museums meet lively neighbourhoods by the Danube.', ['Visit Schönbrunn Palace', 'Explore the old town and St Stephen’s Cathedral', 'Discover the Belvedere', 'Walk through the Prater and along the Danube']],
    fr: ['Vienne', 'Palais impériaux, cafés historiques et musées côtoient des quartiers vivants au bord du Danube.', ['Visiter le château de Schönbrunn', 'Parcourir le centre ancien et la cathédrale Saint-Étienne', 'Découvrir le Belvédère', 'Se promener au Prater et au bord du Danube']],
    de: ['Wien', 'Kaiserliche Schlösser, traditionsreiche Kaffeehäuser und Museen treffen auf lebendige Viertel an der Donau.', ['Schloss Schönbrunn besuchen', 'Altstadt und Stephansdom erkunden', 'Das Belvedere entdecken', 'Durch den Prater und an der Donau spazieren']],
    it: ['Vienna', 'Palazzi imperiali, caffè storici e musei si incontrano con quartieri vivaci lungo il Danubio.', ['Visitare Schönbrunn', 'Esplorare il centro storico e il duomo di Santo Stefano', 'Scoprire il Belvedere', 'Passeggiare nel Prater e lungo il Danubio']],
    pt: ['Viena', 'Palácios imperiais, cafés históricos e museus convivem com bairros animados junto ao Danúbio.', ['Visitar o palácio de Schönbrunn', 'Explorar o centro antigo e a catedral de Santo Estêvão', 'Descobrir o Belvedere', 'Passear no Prater e junto ao Danúbio']],
    ca: ['Viena', 'Palaus imperials, cafès històrics i museus conviuen amb barris vius vora el Danubi.', ['Visitar el palau de Schönbrunn', 'Recórrer el centre antic i la catedral de Sant Esteve', 'Descobrir el Belvedere', 'Passejar pel Prater i la riba del Danubi']],
  }),
  destination({ slug: 'salzburg', federalStates: ['AT-5'], stay: '2–3', airports: ['SZG'], aliases: ['Salzburgo', 'Salzburg', 'Salzbourg', 'Salisburgo'], limited: true, ...city }, {
    es: ['Salzburgo', 'La ciudad de Mozart combina plazas barrocas, calles antiguas y una fortaleza sobre el río Salzach.', ['Explorar la fortaleza de Hohensalzburg', 'Recorrer la calle Getreidegasse', 'Visitar los jardines de Mirabell', 'Pasear por el casco antiguo junto al Salzach']],
    en: ['Salzburg', 'Mozart’s city combines Baroque squares, old lanes and a fortress above the Salzach.', ['Explore Hohensalzburg Fortress', 'Walk along Getreidegasse', 'Visit Mirabell Gardens', 'Stroll through the old town by the Salzach']],
    fr: ['Salzbourg', 'La ville de Mozart réunit places baroques, ruelles anciennes et forteresse au-dessus de la Salzach.', ['Explorer la forteresse de Hohensalzburg', 'Parcourir la Getreidegasse', 'Visiter les jardins Mirabell', 'Flâner dans la vieille ville au bord de la Salzach']],
    de: ['Salzburg', 'Mozarts Stadt verbindet barocke Plätze, alte Gassen und eine Festung über der Salzach.', ['Festung Hohensalzburg erkunden', 'Durch die Getreidegasse gehen', 'Den Mirabellgarten besuchen', 'In der Altstadt an der Salzach spazieren']],
    it: ['Salisburgo', 'La città di Mozart unisce piazze barocche, vicoli antichi e una fortezza sopra la Salzach.', ['Esplorare la fortezza Hohensalzburg', 'Percorrere la Getreidegasse', 'Visitare i giardini Mirabell', 'Passeggiare nel centro storico lungo la Salzach']],
    pt: ['Salzburgo', 'A cidade de Mozart reúne praças barrocas, ruas antigas e uma fortaleza sobre o Salzach.', ['Explorar a fortaleza de Hohensalzburg', 'Percorrer a Getreidegasse', 'Visitar os jardins Mirabell', 'Passear no centro antigo junto ao Salzach']],
    ca: ['Salzburg', 'La ciutat de Mozart combina places barroques, carrers antics i una fortalesa damunt del Salzach.', ['Explorar la fortalesa de Hohensalzburg', 'Recórrer la Getreidegasse', 'Visitar els jardins de Mirabell', 'Passejar pel nucli antic vora el Salzach']],
  }),
  destination({ slug: 'innsbruck', federalStates: ['AT-7'], stay: '2–3', airports: ['INN'], aliases: ['Innsbruck', 'Insbruck'], limited: true, ...alpine }, {
    es: ['Innsbruck', 'Arquitectura histórica y vistas de los Alpes se encuentran en la capital tirolesa junto al río Inn.', ['Ver el Tejadillo de Oro', 'Pasear por el casco antiguo', 'Subir a Nordkette según las condiciones', 'Visitar el palacio de Ambras']],
    en: ['Innsbruck', 'Historic architecture and Alpine views meet in the Tyrolean capital beside the Inn.', ['See the Golden Roof', 'Walk through the old town', 'Visit Nordkette when conditions allow', 'Explore Ambras Castle']],
    fr: ['Innsbruck', 'Architecture historique et panoramas alpins se rejoignent dans la capitale tyrolienne au bord de l’Inn.', ['Voir le Petit Toit d’or', 'Parcourir la vieille ville', 'Monter à la Nordkette selon les conditions', 'Visiter le château d’Ambras']],
    de: ['Innsbruck', 'Historische Bauten und Alpenblicke prägen die Tiroler Hauptstadt am Inn.', ['Das Goldene Dachl sehen', 'Durch die Altstadt spazieren', 'Die Nordkette je nach Bedingungen besuchen', 'Schloss Ambras erkunden']],
    it: ['Innsbruck', 'Architettura storica e panorami alpini si incontrano nel capoluogo tirolese lungo l’Inn.', ['Vedere il Tettuccio d’Oro', 'Passeggiare nel centro storico', 'Salire sulla Nordkette secondo le condizioni', 'Visitare il castello di Ambras']],
    pt: ['Innsbruck', 'Arquitetura histórica e vistas alpinas encontram-se na capital tirolesa junto ao rio Inn.', ['Ver o Telhado Dourado', 'Passear pelo centro antigo', 'Subir à Nordkette conforme as condições', 'Visitar o castelo de Ambras']],
    ca: ['Innsbruck', 'Arquitectura històrica i vistes alpines es troben a la capital tirolesa vora el riu Inn.', ['Veure la Teuladeta d’Or', 'Passejar pel nucli antic', 'Pujar a la Nordkette segons les condicions', 'Visitar el castell d’Ambras']],
  }),
  destination({ slug: 'graz', federalStates: ['AT-6'], stay: '2–3', airports: ['GRZ'], aliases: ['Graz', 'Gratz'], limited: true, ...city }, {
    es: ['Graz', 'Patios renacentistas, diseño contemporáneo y colinas verdes dan personalidad a la capital de Estiria.', ['Subir al Schlossberg y ver la torre del reloj', 'Recorrer el casco antiguo', 'Descubrir la isla Murinsel', 'Visitar el Kunsthaus Graz']],
    en: ['Graz', 'Renaissance courtyards, contemporary design and green hills shape Styria’s capital.', ['Climb Schlossberg to see the clock tower', 'Explore the old town', 'Discover Murinsel island', 'Visit Kunsthaus Graz']],
    fr: ['Graz', 'Cours Renaissance, design contemporain et collines verdoyantes donnent du caractère à la capitale de Styrie.', ['Monter au Schlossberg et voir la tour de l’Horloge', 'Explorer la vieille ville', 'Découvrir l’île Murinsel', 'Visiter le Kunsthaus Graz']],
    de: ['Graz', 'Renaissancehöfe, zeitgenössisches Design und grüne Hügel prägen die steirische Landeshauptstadt.', ['Auf den Schlossberg zum Uhrturm steigen', 'Die Altstadt erkunden', 'Die Murinsel entdecken', 'Das Kunsthaus Graz besuchen']],
    it: ['Graz', 'Cortili rinascimentali, design contemporaneo e colline verdi caratterizzano il capoluogo della Stiria.', ['Salire allo Schlossberg e vedere la torre dell’orologio', 'Esplorare il centro storico', 'Scoprire la Murinsel', 'Visitare il Kunsthaus Graz']],
    pt: ['Graz', 'Pátios renascentistas, design contemporâneo e colinas verdes marcam a capital da Estíria.', ['Subir ao Schlossberg e ver a torre do relógio', 'Explorar o centro antigo', 'Descobrir a Murinsel', 'Visitar o Kunsthaus Graz']],
    ca: ['Graz', 'Patis renaixentistes, disseny contemporani i turons verds donen caràcter a la capital d’Estíria.', ['Pujar al Schlossberg i veure la torre del rellotge', 'Explorar el nucli antic', 'Descobrir la Murinsel', 'Visitar el Kunsthaus Graz']],
  }),
  destination({ slug: 'linz', federalStates: ['AT-4'], stay: '2–3', airports: ['LNZ'], aliases: ['Linz', 'Linz an der Donau'], limited: true, ...city }, {
    es: ['Linz', 'La ciudad del Danubio mezcla arte digital, arquitectura histórica y paseos por ambas orillas.', ['Visitar Ars Electronica Center', 'Recorrer la Hauptplatz y el casco antiguo', 'Pasear junto al Danubio', 'Subir al Pöstlingberg']],
    en: ['Linz', 'This Danube city blends digital art, historic architecture and walks along both riverbanks.', ['Visit Ars Electronica Center', 'Explore Hauptplatz and the old town', 'Walk beside the Danube', 'Go up Pöstlingberg']],
    fr: ['Linz', 'Cette ville du Danube mêle art numérique, architecture historique et promenades sur les deux rives.', ['Visiter l’Ars Electronica Center', 'Parcourir la Hauptplatz et la vieille ville', 'Longer le Danube', 'Monter au Pöstlingberg']],
    de: ['Linz', 'Die Donaustadt vereint digitale Kunst, historische Architektur und Spaziergänge an beiden Ufern.', ['Das Ars Electronica Center besuchen', 'Hauptplatz und Altstadt erkunden', 'An der Donau spazieren', 'Auf den Pöstlingberg fahren']],
    it: ['Linz', 'La città sul Danubio unisce arte digitale, architettura storica e passeggiate sulle due rive.', ['Visitare l’Ars Electronica Center', 'Esplorare Hauptplatz e centro storico', 'Passeggiare lungo il Danubio', 'Salire sul Pöstlingberg']],
    pt: ['Linz', 'A cidade do Danúbio combina arte digital, arquitetura histórica e passeios pelas duas margens.', ['Visitar o Ars Electronica Center', 'Percorrer a Hauptplatz e o centro antigo', 'Passear junto ao Danúbio', 'Subir ao Pöstlingberg']],
    ca: ['Linz', 'La ciutat del Danubi combina art digital, arquitectura històrica i passejades per totes dues ribes.', ['Visitar l’Ars Electronica Center', 'Recórrer la Hauptplatz i el nucli antic', 'Passejar vora el Danubi', 'Pujar al Pöstlingberg']],
  }),
  destination({ slug: 'klagenfurt', federalStates: ['AT-2'], stay: '2–3', airports: ['KLU'], aliases: ['Klagenfurt', 'Klagenfurt am Wörthersee'], limited: true, ...lakes }, {
    es: ['Klagenfurt', 'La capital de Carintia ofrece plazas renacentistas, paseos urbanos y acceso al lago Wörthersee.', ['Recorrer el Alter Platz', 'Ver la fuente del Lindwurm', 'Pasear junto al Wörthersee', 'Explorar el parque Europapark']],
    en: ['Klagenfurt', 'Carinthia’s capital offers Renaissance squares, city walks and access to Lake Wörthersee.', ['Explore Alter Platz', 'See the Lindwurm fountain', 'Walk beside Lake Wörthersee', 'Discover Europapark']],
    fr: ['Klagenfurt', 'La capitale de Carinthie propose places Renaissance, promenades urbaines et accès au Wörthersee.', ['Parcourir l’Alter Platz', 'Voir la fontaine du Lindwurm', 'Se promener au bord du Wörthersee', 'Explorer l’Europapark']],
    de: ['Klagenfurt', 'Kärntens Hauptstadt bietet Renaissanceplätze, Stadtspaziergänge und Zugang zum Wörthersee.', ['Den Alten Platz erkunden', 'Den Lindwurmbrunnen ansehen', 'Am Wörthersee spazieren', 'Den Europapark besuchen']],
    it: ['Klagenfurt', 'Il capoluogo della Carinzia offre piazze rinascimentali, passeggiate urbane e il lago Wörthersee.', ['Esplorare Alter Platz', 'Vedere la fontana del Lindwurm', 'Passeggiare sul Wörthersee', 'Scoprire Europapark']],
    pt: ['Klagenfurt', 'A capital da Caríntia oferece praças renascentistas, passeios urbanos e acesso ao lago Wörthersee.', ['Percorrer a Alter Platz', 'Ver a fonte Lindwurm', 'Passear junto ao Wörthersee', 'Explorar o Europapark']],
    ca: ['Klagenfurt', 'La capital de Caríntia ofereix places renaixentistes, passejades urbanes i accés al llac Wörthersee.', ['Recórrer l’Alter Platz', 'Veure la font del Lindwurm', 'Passejar vora el Wörthersee', 'Explorar l’Europapark']],
  }),
  destination({ slug: 'hallstatt', federalStates: ['AT-4'], stay: '1–2', access: ['SZG', 'LNZ'], aliases: ['Hallstatt', 'Hallstätter See'], hallstatt: true, ...lakes }, {
    es: ['Hallstatt', 'Casas junto al lago y laderas alpinas hacen de este pequeño pueblo un lugar para recorrer sin prisa.', ['Pasear por el centro histórico junto al lago', 'Contemplar Hallstätter See desde sus miradores', 'Conocer la historia salinera local', 'Explorar los senderos accesibles según la temporada']],
    en: ['Hallstatt', 'Lakeside houses and Alpine slopes make this small village a place to explore slowly.', ['Walk through the lakeside old town', 'View Hallstätter See from lookout points', 'Discover the area’s salt-mining history', 'Explore trails open in the season']],
    fr: ['Hallstatt', 'Maisons au bord du lac et versants alpins invitent à découvrir ce petit village sans se presser.', ['Parcourir le centre ancien au bord du lac', 'Voir le Hallstätter See depuis les belvédères', 'Découvrir l’histoire locale du sel', 'Explorer les sentiers accessibles selon la saison']],
    de: ['Hallstatt', 'Häuser am See und alpine Hänge laden dazu ein, das kleine Dorf in Ruhe zu erkunden.', ['Durch den historischen Ortskern am See gehen', 'Den Hallstätter See von Aussichtspunkten sehen', 'Die lokale Salzgeschichte entdecken', 'Saisonal zugängliche Wanderwege erkunden']],
    it: ['Hallstatt', 'Case sul lago e pendii alpini invitano a scoprire questo piccolo borgo con calma.', ['Passeggiare nel centro storico sul lago', 'Ammirare il Hallstätter See dai belvedere', 'Conoscere la storia locale del sale', 'Esplorare i sentieri accessibili nella stagione']],
    pt: ['Hallstatt', 'Casas junto ao lago e encostas alpinas convidam a explorar esta pequena vila sem pressa.', ['Passear no centro antigo junto ao lago', 'Ver o Hallstätter See dos miradouros', 'Conhecer a história local do sal', 'Explorar trilhos acessíveis conforme a época']],
    ca: ['Hallstatt', 'Cases vora el llac i vessants alpins conviden a descobrir aquest poble petit sense presses.', ['Passejar pel nucli antic vora el llac', 'Contemplar el Hallstätter See des dels miradors', 'Conèixer la història local de la sal', 'Explorar senders accessibles segons l’estació']],
  }),
  destination({ slug: 'wachau-valley', federalStates: ['AT-3'], stay: '2–3', access: ['VIE', 'LNZ'], aliases: ['Valle de Wachau', 'Wachau', 'Wachau Valley', 'Vallée de la Wachau'], best: [4, 5, 6, 9, 10], low: [1, 2, 11], high: [7, 8] }, {
    es: ['Valle de Wachau', 'Entre viñedos y pueblos históricos, el Danubio atraviesa uno de los paisajes culturales de Baja Austria.', ['Pasear por Dürnstein', 'Descubrir Melk y su abadía', 'Recorrer viñedos y caminos del Danubio', 'Visitar Krems y sus calles antiguas']],
    en: ['Wachau Valley', 'Between vineyards and historic towns, the Danube crosses a cultural landscape of Lower Austria.', ['Walk through Dürnstein', 'Discover Melk and its abbey', 'Explore vineyards and Danube paths', 'Visit Krems and its old streets']],
    fr: ['Vallée de la Wachau', 'Entre vignobles et villages anciens, le Danube traverse un paysage culturel de Basse-Autriche.', ['Se promener à Dürnstein', 'Découvrir Melk et son abbaye', 'Parcourir vignobles et chemins du Danube', 'Visiter Krems et ses ruelles anciennes']],
    de: ['Wachau', 'Zwischen Weinbergen und historischen Orten fließt die Donau durch eine Kulturlandschaft Niederösterreichs.', ['Durch Dürnstein spazieren', 'Melk und sein Stift entdecken', 'Weinberge und Donauwege erkunden', 'Krems und seine Altstadt besuchen']],
    it: ['Valle della Wachau', 'Tra vigneti e borghi storici, il Danubio attraversa un paesaggio culturale della Bassa Austria.', ['Passeggiare a Dürnstein', 'Scoprire Melk e la sua abbazia', 'Esplorare vigneti e sentieri del Danubio', 'Visitare Krems e le sue vie antiche']],
    pt: ['Vale de Wachau', 'Entre vinhas e vilas históricas, o Danúbio atravessa uma paisagem cultural da Baixa Áustria.', ['Passear por Dürnstein', 'Descobrir Melk e a sua abadia', 'Percorrer vinhas e caminhos do Danúbio', 'Visitar Krems e as suas ruas antigas']],
    ca: ['Vall de Wachau', 'Entre vinyes i pobles històrics, el Danubi travessa un paisatge cultural de la Baixa Àustria.', ['Passejar per Dürnstein', 'Descobrir Melk i la seva abadia', 'Recórrer vinyes i camins del Danubi', 'Visitar Krems i els seus carrers antics']],
  }),
  destination({ slug: 'zell-am-see', federalStates: ['AT-5'], stay: '3–4', access: ['SZG', 'INN'], aliases: ['Zell am See', 'Zell', 'Zell am See-Kaprun'], ...alpine }, {
    es: ['Zell am See', 'El lago Zeller See y las montañas cercanas permiten combinar paseos junto al agua y excursiones alpinas.', ['Pasear por la orilla del Zeller See', 'Explorar el centro de Zell am See', 'Subir a Schmittenhöhe según la temporada', 'Descubrir el entorno de Kaprun']],
    en: ['Zell am See', 'Lake Zeller See and nearby mountains combine waterside walks with Alpine outings.', ['Walk along Lake Zeller See', 'Explore the centre of Zell am See', 'Visit Schmittenhöhe in season', 'Discover the area around Kaprun']],
    fr: ['Zell am See', 'Le Zeller See et les montagnes proches associent balades au bord de l’eau et excursions alpines.', ['Longer le Zeller See', 'Explorer le centre de Zell am See', 'Monter à la Schmittenhöhe selon la saison', 'Découvrir les environs de Kaprun']],
    de: ['Zell am See', 'Zeller See und umliegende Berge verbinden Spaziergänge am Wasser mit Ausflügen in die Alpen.', ['Am Zeller See spazieren', 'Das Zentrum von Zell am See erkunden', 'Die Schmittenhöhe saisonal besuchen', 'Die Umgebung von Kaprun entdecken']],
    it: ['Zell am See', 'Il lago Zeller See e le montagne vicine uniscono passeggiate sull’acqua ed escursioni alpine.', ['Passeggiare lungo lo Zeller See', 'Esplorare il centro di Zell am See', 'Salire sulla Schmittenhöhe nella stagione adatta', 'Scoprire i dintorni di Kaprun']],
    pt: ['Zell am See', 'O lago Zeller See e as montanhas próximas juntam passeios à beira da água e excursões alpinas.', ['Passear junto ao Zeller See', 'Explorar o centro de Zell am See', 'Subir à Schmittenhöhe na época adequada', 'Descobrir os arredores de Kaprun']],
    ca: ['Zell am See', 'El llac Zeller See i les muntanyes properes combinen passejades vora l’aigua i excursions alpines.', ['Passejar per la riba del Zeller See', 'Explorar el centre de Zell am See', 'Pujar a la Schmittenhöhe segons l’estació', 'Descobrir l’entorn de Kaprun']],
  }),
  destination({ slug: 'kitzbuehel', federalStates: ['AT-7'], stay: '3–4', access: ['INN', 'SZG'], aliases: ['Kitzbühel', 'Kitzbuehel', 'Kitzbuhel'], ...alpine }, {
    es: ['Kitzbühel', 'Un centro tirolés de fachadas coloridas rodeado de montañas, rutas de senderismo y pistas de esquí estacionales.', ['Pasear por el centro histórico', 'Explorar las laderas de Hahnenkamm según la temporada', 'Conocer el entorno de Kitzbüheler Horn', 'Recorrer caminos de montaña señalizados']],
    en: ['Kitzbühel', 'A Tyrolean town of colourful façades surrounded by mountains, hiking routes and seasonal ski slopes.', ['Walk through the old town', 'Explore Hahnenkamm slopes in season', 'Discover the Kitzbüheler Horn area', 'Follow marked mountain trails']],
    fr: ['Kitzbühel', 'Une ville tyrolienne aux façades colorées entourée de montagnes, sentiers et pistes de ski saisonnières.', ['Parcourir le centre ancien', 'Explorer le Hahnenkamm selon la saison', 'Découvrir le Kitzbüheler Horn', 'Suivre les sentiers de montagne balisés']],
    de: ['Kitzbühel', 'Eine Tiroler Stadt mit bunten Fassaden, umgeben von Bergen, Wanderwegen und saisonalen Skipisten.', ['Durch die Altstadt spazieren', 'Den Hahnenkamm je nach Saison erkunden', 'Die Gegend am Kitzbüheler Horn entdecken', 'Markierten Bergwegen folgen']],
    it: ['Kitzbühel', 'Una cittadina tirolese dalle facciate colorate tra montagne, sentieri e piste da sci stagionali.', ['Passeggiare nel centro storico', 'Esplorare l’Hahnenkamm nella stagione adatta', 'Scoprire il Kitzbüheler Horn', 'Seguire i sentieri montani segnati']],
    pt: ['Kitzbühel', 'Uma cidade tirolesa de fachadas coloridas entre montanhas, trilhos e pistas de esqui sazonais.', ['Passear no centro antigo', 'Explorar o Hahnenkamm conforme a época', 'Conhecer o Kitzbüheler Horn', 'Percorrer trilhos de montanha assinalados']],
    ca: ['Kitzbühel', 'Una vila tirolesa de façanes acolorides envoltada de muntanyes, senders i pistes d’esquí estacionals.', ['Passejar pel nucli antic', 'Explorar el Hahnenkamm segons l’estació', 'Descobrir el Kitzbüheler Horn', 'Seguir senders de muntanya senyalitzats']],
  }),
  destination({ slug: 'bregenz', federalStates: ['AT-8'], stay: '2–3', access: ['FDH', 'ACH', 'ZRH'], aliases: ['Bregenz', 'Brégence', 'Bregencia'], border: true, ...lakes }, {
    es: ['Bregenz', 'La capital de Vorarlberg mira al lago de Constanza entre calles tranquilas, arte y vistas desde el Pfänder.', ['Pasear por la ribera del lago de Constanza', 'Explorar el casco antiguo y Martinsturm', 'Subir al Pfänder según las condiciones', 'Conocer el escenario lacustre de los Festivales de Bregenz']],
    en: ['Bregenz', 'Vorarlberg’s capital faces Lake Constance with quiet streets, art and views from the Pfänder.', ['Walk along Lake Constance', 'Explore the old town and Martinsturm', 'Visit Pfänder when conditions allow', 'See the Bregenz Festival lakeside stage']],
    fr: ['Brégence', 'La capitale du Vorarlberg borde le lac de Constance entre rues paisibles, art et vues depuis le Pfänder.', ['Longer le lac de Constance', 'Explorer la vieille ville et la Martinsturm', 'Monter au Pfänder selon les conditions', 'Découvrir la scène lacustre du festival de Brégence']],
    de: ['Bregenz', 'Vorarlbergs Hauptstadt liegt am Bodensee und bietet ruhige Gassen, Kunst und Ausblicke vom Pfänder.', ['Am Bodensee spazieren', 'Altstadt und Martinsturm erkunden', 'Den Pfänder je nach Bedingungen besuchen', 'Die Seebühne der Bregenzer Festspiele ansehen']],
    it: ['Bregenz', 'Il capoluogo del Vorarlberg si affaccia sul Lago di Costanza tra vie tranquille, arte e panorami dal Pfänder.', ['Passeggiare sul Lago di Costanza', 'Esplorare il centro storico e Martinsturm', 'Salire sul Pfänder secondo le condizioni', 'Vedere il palcoscenico sul lago del Festival di Bregenz']],
    pt: ['Bregenz', 'A capital do Vorarlberg olha para o Lago de Constança entre ruas tranquilas, arte e vistas do Pfänder.', ['Passear junto ao Lago de Constança', 'Explorar o centro antigo e a Martinsturm', 'Subir ao Pfänder conforme as condições', 'Conhecer o palco lacustre do Festival de Bregenz']],
    ca: ['Bregenz', 'La capital de Vorarlberg mira al llac de Constança entre carrers tranquils, art i vistes des del Pfänder.', ['Passejar per la riba del llac de Constança', 'Explorar el nucli antic i la Martinsturm', 'Pujar al Pfänder segons les condicions', 'Conèixer l’escenari lacustre del Festival de Bregenz']],
  }),
  destination({ slug: 'bad-gastein', federalStates: ['AT-5'], stay: '3–4', access: ['SZG'], aliases: ['Bad Gastein', 'Badgastein', 'Gastein'], ...alpine }, {
    es: ['Bad Gastein', 'Una cascada atraviesa esta villa alpina de edificios históricos, termas y rutas del valle de Gastein.', ['Contemplar la cascada de Bad Gastein', 'Pasear entre los edificios históricos', 'Visitar los espacios termales disponibles', 'Explorar los senderos del valle según la temporada']],
    en: ['Bad Gastein', 'A waterfall runs through this Alpine town of historic buildings, thermal baths and Gastein Valley paths.', ['See Bad Gastein Waterfall', 'Walk among historic buildings', 'Visit available thermal baths', 'Explore valley trails in season']],
    fr: ['Bad Gastein', 'Une cascade traverse cette station alpine aux bâtiments anciens, thermes et sentiers de la vallée de Gastein.', ['Admirer la cascade de Bad Gastein', 'Se promener parmi les bâtiments historiques', 'Découvrir les thermes ouverts', 'Explorer les sentiers de la vallée selon la saison']],
    de: ['Bad Gastein', 'Ein Wasserfall durchzieht den Alpenort mit historischen Bauten, Thermen und Wegen im Gasteinertal.', ['Den Bad Gasteiner Wasserfall ansehen', 'Zwischen historischen Gebäuden spazieren', 'Geöffnete Thermen besuchen', 'Talwege je nach Saison erkunden']],
    it: ['Bad Gastein', 'Una cascata attraversa questa località alpina di edifici storici, terme e sentieri nella valle di Gastein.', ['Ammirare la cascata di Bad Gastein', 'Passeggiare tra gli edifici storici', 'Visitare le terme disponibili', 'Esplorare i sentieri della valle nella stagione adatta']],
    pt: ['Bad Gastein', 'Uma cascata atravessa esta vila alpina de edifícios históricos, termas e trilhos no vale de Gastein.', ['Contemplar a cascata de Bad Gastein', 'Passear entre os edifícios históricos', 'Visitar as termas disponíveis', 'Explorar os trilhos do vale conforme a época']],
    ca: ['Bad Gastein', 'Una cascada travessa aquesta vila alpina d’edificis històrics, termes i senders de la vall de Gastein.', ['Contemplar la cascada de Bad Gastein', 'Passejar entre els edificis històrics', 'Visitar els espais termals disponibles', 'Explorar els senders de la vall segons l’estació']],
  }),
];
