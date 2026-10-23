import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { czechiaImages } from './czechia-images';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, index) => [locale, values[index]])) as Record<Locale, string>;
const days = localize(['días','days','jours','Tage','giorni','dias','dies']);
const visit = localize(['Visitar','Visit','Visiter','Besuchen:','Visitare','Visitar','Visitar']);
const practical = localize([
  'Comprueba horarios de trenes y autobuses y la disponibilidad de vuelos para tus fechas. La moneda local es la corona checa; una temporada tranquila no garantiza precios bajos.',
  'Check train and bus timetables and flights for your dates. The local currency is the Czech koruna; a quieter season does not guarantee lower prices.',
  'Vérifiez horaires des trains et bus ainsi que les vols selon vos dates. La monnaie locale est la couronne tchèque ; une saison calme ne garantit pas de prix bas.',
  'Bahn- und Busfahrpläne sowie Flüge für die Reisedaten prüfen. Die Landeswährung ist die tschechische Krone; Nebensaison garantiert keine niedrigen Preise.',
  'Controlla orari di treni e autobus e voli per le tue date. La valuta locale è la corona ceca; la bassa stagione non garantisce prezzi inferiori.',
  'Confirme horários de comboios e autocarros e voos para as suas datas. A moeda local é a coroa checa; a época calma não garante preços baixos.',
  'Comprova horaris de trens i autobusos i vols per a les dates triades. La moneda local és la corona txeca; una temporada tranquil·la no garanteix preus baixos.',
]);
const ownAirport = localize([
  'Aeropuerto de llegada: {codes}. Tener un código IATA no garantiza vuelos regulares; comprueba la ruta y el traslado local.',
  'Arrival airport: {codes}. An IATA code does not guarantee scheduled flights; check your route and local transfer.',
  'Aéroport d’arrivée : {codes}. Un code IATA ne garantit pas de vols réguliers ; vérifiez la liaison et le transfert.',
  'Ankunftsflughafen: {codes}. Ein IATA-Code garantiert keinen Linienflug; Verbindung und Weiterfahrt prüfen.',
  'Aeroporto di arrivo: {codes}. Un codice IATA non garantisce voli di linea; verifica rotta e trasferimento.',
  'Aeroporto de chegada: {codes}. Um código IATA não garante voos regulares; confirme rota e transporte local.',
  'Aeroport d’arribada: {codes}. Un codi IATA no garanteix vols regulars; comprova ruta i trasllat.',
]);
const ground = localize([
  'No hay aeropuerto comercial propio: llega por {codes} y continúa por tierra. Comprueba trenes o autobuses para tus fechas.',
  'There is no local commercial airport: arrive via {codes} and continue overland. Check trains or buses for your dates.',
  'Pas d’aéroport commercial local : arrivez par {codes} puis continuez par voie terrestre. Vérifiez trains et bus.',
  'Kein eigener Verkehrsflughafen: über {codes} anreisen und am Boden weiterfahren. Bahn und Bus prüfen.',
  'Non c’è un aeroporto commerciale locale: arriva via {codes} e prosegui via terra. Verifica treni e autobus.',
  'Não há aeroporto comercial local: chegue por {codes} e continue por terra. Confirme comboios e autocarros.',
  'No hi ha aeroport comercial propi: arriba per {codes} i continua per terra. Comprova trens i autobusos.',
]);
const park = localize([
  'En Suiza Bohemia consulta los avisos oficiales del parque antes de salir: algunos senderos pueden estar cerrados por seguridad o conservación.',
  'In Bohemian Switzerland check official park notices before setting out: trails may close for safety or conservation.',
  'En Suisse bohémienne, consultez les avis officiels du parc : certains sentiers peuvent fermer pour sécurité ou préservation.',
  'In der Böhmischen Schweiz vorab die offiziellen Parkhinweise prüfen: Wege können aus Sicherheits- oder Naturschutzgründen gesperrt sein.',
  'Nella Svizzera boema controlla gli avvisi ufficiali del parco: i sentieri possono chiudere per sicurezza o tutela.',
  'Na Suíça Boémia consulte os avisos oficiais do parque: alguns trilhos podem fechar por segurança ou conservação.',
  'A la Suïssa Bohèmia consulta els avisos oficials del parc: alguns senders poden estar tancats per seguretat o conservació.',
]);
type Seed = { slug: keyof typeof czechiaImages; names: Seven; descriptions: Seven; places: [string,string,string,string]; region: string;
  aliases?: string[]; stay: string; airport?: string; access?: string[]; best: number[]; low: number[]; high: number[]; park?: boolean; auxiliaryCodes?: string[] };
const city = { best:[4,5,6,9,10], low:[1,2,11], high:[7,8,12] };
const spa = { best:[5,6,7,8,9], low:[1,2,11], high:[7,8] };
function profile(seed: Seed): DestinationProfile {
  const translations = Object.fromEntries(locales.map((locale, index) => [locale, {
    name:seed.names[index], description:seed.descriptions[index],
    recommendations:seed.places.map(place => `${visit[locale]} ${place}`) as DestinationText['recommendations'],
    recommendedStay:`${seed.stay} ${days[locale]}`,
    seasonalityNote:[practical[locale], (seed.airport ? ownAirport[locale] : ground[locale]).replace('{codes}',seed.airport ?? (seed.access ?? []).join(', ')), seed.park ? park[locale] : ''].filter(Boolean).join(' '),
  }])) as Record<Locale, DestinationText>;
  return { id:`cz-${seed.slug}`, slug:seed.slug, countryCode:'CZ', country:'Chequia',
    federalStates:[seed.region], ...czechiaImages[seed.slug], ...translations.es, translations,
    airports:seed.airport ? [{iataCode:seed.airport}] : [], iataCodes:seed.airport ? [seed.airport] : [],
    auxiliaryCodes:seed.auxiliaryCodes ?? [], metropolitanCodes:[],
    accessAirports:(seed.access ?? []).map(iataCode => ({iataCode,name:accessNames[iataCode],countryCode:'CZ'})),
    aliases:Array.from(new Set([...(seed.aliases ?? []), ...seed.names])),
    bestMonths:seed.best, lowSeasonMonths:seed.low, highSeasonMonths:seed.high,
    publication:{status:'draft'} };
}
const accessNames: Record<string,string> = {PRG:'Václav Havel Airport Prague',BRQ:'Brno–Tuřany Airport',OSR:'Leoš Janáček Airport Ostrava',PED:'Pardubice Airport'};
export const czechiaDestinations: DestinationProfile[] = [
  profile({slug:'prague',names:['Praga','Prague','Prague','Prag','Praga','Praga','Praga'],descriptions:[
    'Puentes sobre el Moldava, plazas medievales y castillos forman una capital para recorrer a pie.',
    'Bridges over the Vltava, medieval squares and castle courtyards invite long city walks.',
    'Ponts sur la Vltava, places médiévales et château invitent à découvrir la capitale à pied.',
    'Brücken über der Moldau, mittelalterliche Plätze und die Burg prägen Spaziergänge durch die Hauptstadt.',
    'Ponti sulla Moldava, piazze medievali e castello invitano a esplorare la capitale a piedi.',
    'Pontes sobre o Moldava, praças medievais e castelo convidam a conhecer a capital a pé.',
    'Ponts sobre el Moldava, places medievals i castell conviden a recórrer la capital a peu.'
  ],places:['Karlův most','Staroměstské náměstí','Pražský hrad','Malá Strana'],region:'CZ-10',aliases:['Praha'],stay:'3–4',airport:'PRG',...city}),
  profile({slug:'brno',names:['Brno','Brno','Brno','Brünn','Brno','Brno','Brno'],descriptions:[
    'La capital de Moravia del Sur mezcla arquitectura moderna, fortalezas y cafés de barrio.',
    'South Moravia’s capital mixes modern architecture, a fortress and neighbourhood cafés.',
    'La capitale de Moravie-du-Sud mêle architecture moderne, forteresse et cafés de quartier.',
    'Südmährens Hauptstadt verbindet moderne Architektur, Festung und Kaffeehäuser.',
    'Il capoluogo della Moravia meridionale unisce architettura moderna, fortezza e caffè.',
    'A capital da Morávia do Sul combina arquitetura moderna, fortaleza e cafés.',
    'La capital de Moràvia del Sud combina arquitectura moderna, fortalesa i cafès.'
  ],places:['Hrad Špilberk','Vila Tugendhat','Katedrála svatého Petra a Pavla','Zelný trh'],region:'CZ-64',stay:'2–3',airport:'BRQ',...city}),
  profile({slug:'cesky-krumlov',names:['Český Krumlov','Český Krumlov','Český Krumlov','Krumau','Český Krumlov','Český Krumlov','Český Krumlov'],descriptions:[
    'Las curvas del Moldava rodean un casco antiguo de callejuelas y un castillo monumental.',
    'A bend in the Vltava wraps around narrow old-town streets and a monumental castle.',
    'Un méandre de la Vltava entoure ruelles anciennes et château monumental.',
    'Eine Moldauschleife umschließt Altstadtgassen und ein großes Schloss.',
    'Un’ansa della Moldava abbraccia vicoli antichi e un castello monumentale.',
    'Uma curva do Moldava envolve ruas antigas e um castelo monumental.',
    'Un revolt del Moldava envolta carrerons antics i un castell monumental.'
  ],places:['Státní hrad a zámek Český Krumlov','Historické centrum Českého Krumlova','Nábřeží Vltavy','Zámecká zahrada'],region:'CZ-31',stay:'1–2',access:['PRG'],...city}),
  profile({slug:'karlovy-vary',names:['Karlovy Vary','Karlovy Vary','Karlovy Vary','Karlsbad','Karlovy Vary','Karlovy Vary','Karlovy Vary'],descriptions:[
    'Columnatas termales y fachadas elegantes recorren este valle balneario de Bohemia.',
    'Thermal colonnades and elegant façades line this Bohemian spa valley.',
    'Colonnades thermales et façades élégantes bordent cette vallée thermale de Bohême.',
    'Thermalkolonnaden und elegante Fassaden prägen dieses böhmische Kurstädtchen.',
    'Colonnati termali e facciate eleganti animano questa valle termale boema.',
    'Colunatas termais e fachadas elegantes marcam este vale termal da Boémia.',
    'Columnates termals i façanes elegants omplen aquesta vall balneària de Bohèmia.'
  ],places:['Mlýnská kolonáda','Tržní kolonáda','Rozhledna Diana','Nábřeží Teplé'],region:'CZ-41',stay:'2–3',airport:'KLV',...spa}),
  profile({slug:'kutna-hora',names:['Kutná Hora','Kutná Hora','Kutná Hora','Kuttenberg','Kutná Hora','Kutná Hora','Kutná Hora'],descriptions:[
    'El pasado minero se descubre entre iglesias góticas, calles históricas y el singular osario.',
    'A mining past emerges among Gothic churches, historic lanes and an unusual ossuary.',
    'Le passé minier apparaît parmi églises gothiques, ruelles anciennes et ossuaire singulier.',
    'Bergbaugeschichte begegnet gotischen Kirchen, Altstadtgassen und einem ungewöhnlichen Beinhaus.',
    'Il passato minerario emerge fra chiese gotiche, vicoli storici e un insolito ossario.',
    'O passado mineiro revela-se entre igrejas góticas, ruas antigas e um ossário singular.',
    'El passat miner es descobreix entre esglésies gòtiques, carrers antics i un ossari singular.'
  ],places:['Chrám svaté Barbory','Kostnice Sedlec','Vlašský dvůr','Historické centrum Kutné Hory'],region:'CZ-20',stay:'1–2',access:['PRG','PED'],...city}),
  profile({slug:'olomouc',names:['Olomouc','Olomouc','Olomouc','Olmütz','Olomouc','Olomouc','Olomouc'],descriptions:[
    'Plazas barrocas, fuentes y vida universitaria distinguen esta ciudad histórica de Moravia.',
    'Baroque squares, fountains and university life define this historic Moravian city.',
    'Places baroques, fontaines et vie universitaire caractérisent cette ville morave.',
    'Barocke Plätze, Brunnen und Universitätsleben prägen diese mährische Stadt.',
    'Piazze barocche, fontane e vita universitaria caratterizzano questa città morava.',
    'Praças barrocas, fontes e vida universitária marcam esta cidade histórica da Morávia.',
    'Places barroques, fonts i vida universitària defineixen aquesta ciutat morava.'
  ],places:['Sloup Nejsvětější Trojice','Horní náměstí','Katedrála svatého Václava','Caesarova kašna'],region:'CZ-71',stay:'2–3',access:['BRQ','OSR'],...city}),
  profile({slug:'plzen',names:['Plzeň','Pilsen','Pilsen','Pilsen','Pilsen','Pilsen','Plzeň'],descriptions:[
    'Cerveza, patrimonio industrial y una gran plaza central dan carácter a esta ciudad bohemia.',
    'Beer heritage, industrial history and a vast central square give this Bohemian city its character.',
    'Tradition brassicole, patrimoine industriel et grande place centrale animent cette ville de Bohême.',
    'Biertradition, Industriegeschichte und ein großer Marktplatz prägen diese böhmische Stadt.',
    'Tradizione birraria, archeologia industriale e grande piazza caratterizzano questa città boema.',
    'Tradição cervejeira, património industrial e uma grande praça marcam esta cidade boémia.',
    'Tradició cervesera, patrimoni industrial i una gran plaça defineixen aquesta ciutat bohèmia.'
  ],places:['Náměstí Republiky','Katedrála svatého Bartoloměje','Pivovar Plzeňský Prazdroj','Velká synagoga'],region:'CZ-32',aliases:['Plzeň','Pilsen'],stay:'2–3',access:['PRG'],...city}),
  profile({slug:'ceske-budejovice',names:['České Budějovice','České Budějovice','České Budějovice','Budweis','České Budějovice','České Budějovice','České Budějovice'],descriptions:[
    'Una plaza monumental y calles porticadas hacen de esta ciudad una buena base para Bohemia del Sur.',
    'A monumental square and arcaded streets make this city a useful South Bohemia base.',
    'Une place monumentale et des rues à arcades en font une base pour explorer la Bohême du Sud.',
    'Ein großer Platz und Arkadengassen machen die Stadt zum Ausgangspunkt für Südböhmen.',
    'Una piazza monumentale e strade porticate ne fanno una base per la Boemia meridionale.',
    'Uma praça monumental e ruas com arcadas fazem dela uma base na Boémia do Sul.',
    'Una plaça monumental i carrers porxats la converteixen en base per a Bohèmia del Sud.'
  ],places:['Náměstí Přemysla Otakara II.','Černá věž','Katedrála svatého Mikuláše','Soutok Vltavy a Malše'],region:'CZ-31',aliases:['Ceske Budejovice','Budweis'],stay:'2–3',access:['PRG'],auxiliaryCodes:['JCL'],...city}),
  profile({slug:'telc',names:['Telč','Telč','Telč','Teltsch','Telč','Telč','Telč'],descriptions:[
    'Las fachadas renacentistas de su plaza y los estanques cercanos invitan a un paseo tranquilo.',
    'Renaissance façades around the square and nearby ponds invite a slow walk.',
    'Les façades Renaissance de la place et les étangs voisins invitent à flâner.',
    'Renaissancefassaden am Platz und nahe Teiche laden zu einem ruhigen Spaziergang ein.',
    'Facciate rinascimentali nella piazza e stagni vicini invitano a una passeggiata lenta.',
    'Fachadas renascentistas na praça e lagoas próximas convidam a um passeio tranquilo.',
    'Façanes renaixentistes a la plaça i estanys propers conviden a passejar sense presses.'
  ],places:['Náměstí Zachariáše z Hradce','Zámek Telč','Telčské rybníky','Historické centrum Telče'],region:'CZ-63',stay:'1–2',access:['BRQ','PRG'],...city}),
  profile({slug:'mikulov-lednice',names:['Mikulov y Lednice-Valtice','Mikulov and Lednice-Valtice','Mikulov et Lednice-Valtice','Mikulov und Lednice-Valtice','Mikulov e Lednice-Valtice','Mikulov e Lednice-Valtice','Mikulov i Lednice-Valtice'],descriptions:[
    'Viñedos, castillos y jardines componen una escapada cultural por Moravia del Sur.',
    'Vineyards, castles and gardens shape a cultural journey through South Moravia.',
    'Vignobles, châteaux et jardins composent une escapade culturelle en Moravie-du-Sud.',
    'Weinberge, Schlösser und Gärten laden zu einer Reise durch Südmähren ein.',
    'Vigneti, castelli e giardini compongono un viaggio culturale nella Moravia meridionale.',
    'Vinhas, castelos e jardins formam uma viagem cultural pela Morávia do Sul.',
    'Vinyes, castells i jardins formen una escapada cultural per Moràvia del Sud.'
  ],places:['Zámek Mikulov','Zámek Lednice','Lednický park','Zámek Valtice'],region:'CZ-64',aliases:['Mikulov','Lednice-Valtice','Lednice'],stay:'2–3',access:['BRQ'],...spa}),
  profile({slug:'bohemian-switzerland',names:['Suiza Bohemia','Bohemian Switzerland','Suisse bohémienne','Böhmische Schweiz','Svizzera boema','Suíça Boémia','Suïssa Bohèmia'],descriptions:[
    'Formaciones de arenisca y bosques protegidos ofrecen paisajes para caminar por rutas abiertas.',
    'Sandstone formations and protected forests offer scenery along trails currently open.',
    'Formations de grès et forêts protégées se découvrent sur les sentiers ouverts.',
    'Sandsteinfelsen und geschützte Wälder lassen sich auf geöffneten Wegen erleben.',
    'Formazioni di arenaria e boschi protetti si esplorano sui sentieri aperti.',
    'Formações de arenito e florestas protegidas descobrem-se pelos trilhos abertos.',
    'Formacions de gres i boscos protegits es descobreixen pels senders oberts.'
  ],places:['Pravčická brána','Hřensko','Jetřichovice','Návštěvnické centrum České Švýcarsko'],region:'CZ-42',aliases:['České Švýcarsko','Ceske Svycarsko','Parque Nacional České Švýcarsko'],stay:'2–3',access:['PRG'],park:true,best:[5,6,7,8,9,10],low:[1,2,11],high:[7,8]}),
  profile({slug:'ostrava',names:['Ostrava','Ostrava','Ostrava','Ostrau','Ostrava','Ostrava','Ostrava'],descriptions:[
    'Antiguas fábricas reconvertidas y una escena cultural activa cuentan la historia industrial morava.',
    'Repurposed factories and lively culture tell the story of Moravia’s industrial past.',
    'Usines reconverties et vie culturelle racontent le passé industriel morave.',
    'Umgenutzte Fabriken und Kultur erzählen von Mährens Industriegeschichte.',
    'Fabbriche riconvertite e una scena culturale vivace raccontano il passato industriale moravo.',
    'Fábricas reconvertidas e cultura ativa contam o passado industrial da Morávia.',
    'Fàbriques reconvertides i una cultura activa expliquen el passat industrial morau.'
  ],places:['Dolní Vítkovice','Bolt Tower','Hornické muzeum Landek','Masarykovo náměstí'],region:'CZ-80',stay:'2–3',airport:'OSR',...city}),
];
