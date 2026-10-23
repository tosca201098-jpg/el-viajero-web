import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { polandImages } from './poland-images';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, index) => [locale, values[index]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const visit = localize(['Visitar', 'Visit', 'Visiter', 'Besuchen:', 'Visitare', 'Visitar', 'Visitar']);
const practical = localize([
  'Comprueba los horarios de transporte y vuelos para tus fechas. La moneda local es el esloti; la temporada tranquila no garantiza precios bajos.',
  'Check transport timetables and flights for your dates. The local currency is the złoty; a quieter season does not guarantee lower prices.',
  'Vérifiez les horaires des transports et les vols pour vos dates. La monnaie locale est le złoty ; une saison calme ne garantit pas des prix bas.',
  'Fahrpläne und Flüge für die Reisedaten prüfen. Die Landeswährung ist der Złoty; Nebensaison garantiert keine niedrigen Preise.',
  'Controlla orari dei trasporti e voli per le tue date. La valuta locale è lo złoty; la bassa stagione non garantisce prezzi inferiori.',
  'Confirme os horários dos transportes e os voos para as suas datas. A moeda local é o złoty; uma época calma não garante preços baixos.',
  'Comprova els horaris del transport i els vols per a les dates triades. La moneda local és el złoty; una temporada tranquil·la no garanteix preus baixos.',
]);
const ownAirport = localize([
  'Aeropuerto de llegada: {codes}. Un código IATA no garantiza vuelos regulares ni una ruta desde tu origen; comprueba la oferta real y el traslado local.',
  'Arrival airport: {codes}. An IATA code does not guarantee scheduled flights or a route from your origin; check the actual offer and local transfer.',
  'Aéroport d’arrivée : {codes}. Un code IATA ne garantit ni vols réguliers ni liaison depuis votre ville ; vérifiez l’offre et le transfert.',
  'Ankunftsflughafen: {codes}. Ein IATA-Code garantiert weder Linienflüge noch eine Verbindung vom Abflugort; Angebot und Weiterfahrt prüfen.',
  'Aeroporto di arrivo: {codes}. Un codice IATA non garantisce voli di linea né collegamenti dalla tua città; verifica le offerte e il trasferimento.',
  'Aeroporto de chegada: {codes}. Um código IATA não garante voos regulares nem ligação desde a origem; confirme a oferta e o transporte local.',
  'Aeroport d’arribada: {codes}. Un codi IATA no garanteix vols regulars ni connexió des de l’origen; comprova l’oferta i el trasllat.',
]);
const ground = localize([
  'No hay aeropuerto comercial propio: llega por {codes} y continúa por tierra. Comprueba trenes, autobuses y la disponibilidad real de vuelos.',
  'There is no local commercial airport: arrive via {codes} and continue overland. Check trains, buses and actual flight availability.',
  'Pas d’aéroport commercial local : arrivez par {codes} puis continuez par voie terrestre. Vérifiez trains, bus et vols disponibles.',
  'Kein eigener Verkehrsflughafen: über {codes} anreisen und am Boden weiterfahren. Bahn, Bus und tatsächliche Flüge prüfen.',
  'Non c’è un aeroporto commerciale locale: arriva via {codes} e prosegui via terra. Verifica treni, autobus e voli disponibili.',
  'Não há aeroporto comercial local: chegue por {codes} e continue por terra. Confirme comboios, autocarros e voos disponíveis.',
  'No hi ha aeroport comercial propi: arriba per {codes} i continua per terra. Comprova trens, autobusos i vols disponibles.',
]);
const tatras = localize([
  'En el Parque Nacional de los Tatras sigue solo los senderos autorizados, consulta el aviso turístico oficial y respeta los cierres, las restricciones nocturnas y las condiciones de montaña.',
  'In Tatra National Park use only designated trails, check the official visitor notice and respect closures, night restrictions and mountain conditions.',
  'Dans le parc national des Tatras, restez sur les sentiers autorisés, consultez les avis officiels et respectez fermetures, restrictions nocturnes et conditions en montagne.',
  'Im Tatra-Nationalpark nur freigegebene Wege benutzen, offizielle Hinweise sowie Sperrungen, Nachtbeschränkungen und Bergbedingungen beachten.',
  'Nel Parco nazionale dei Tatra segui solo i sentieri autorizzati, consulta gli avvisi ufficiali e rispetta chiusure, limiti notturni e condizioni montane.',
  'No Parque Nacional dos Tatras use apenas trilhos autorizados, consulte os avisos oficiais e respeite encerramentos, restrições noturnas e condições de montanha.',
  'Al Parc Nacional dels Tatres segueix només els senders autoritzats, consulta els avisos oficials i respecta tancaments, restriccions nocturnes i condicions de muntanya.',
]);
const bialowieza = localize([
  'En Białowieża permanece en los senderos abiertos. La zona de protección estricta solo se visita con un guía autorizado por el parque; consulta las normas y posibles cierres antes de ir.',
  'In Białowieża stay on open trails. The strictly protected area may be visited only with a park-licensed guide; check rules and closures before travelling.',
  'À Białowieża, restez sur les sentiers ouverts. La zone de protection stricte exige un guide agréé par le parc ; vérifiez règles et fermetures.',
  'In Białowieża nur offene Wege nutzen. Das streng geschützte Gebiet darf nur mit einem vom Park zugelassenen Führer besucht werden; Regeln und Sperrungen prüfen.',
  'A Białowieża resta sui sentieri aperti. L’area di protezione rigorosa richiede una guida autorizzata dal parco; verifica regole e chiusure.',
  'Em Białowieża permaneça nos trilhos abertos. A área de proteção estrita exige guia autorizado pelo parque; confirme regras e encerramentos.',
  'A Białowieża mantén-te als senders oberts. L’àrea de protecció estricta requereix guia autoritzat pel parc; comprova normes i tancaments.',
]);
type Seed = {
  slug: keyof typeof polandImages; names: Seven; descriptions: Seven; places: [string, string, string, string];
  region: string; aliases?: string[]; stay: string; airports?: string[]; access?: string[];
  best: number[]; low: number[]; high: number[]; protectedArea?: 'tatras' | 'bialowieza';
};
const cities = { best: [4, 5, 6, 9, 10], low: [1, 2, 11], high: [7, 8, 12] };
const coast = { best: [5, 6, 7, 8, 9], low: [1, 2, 3, 11], high: [7, 8] };
const nature = { best: [5, 6, 7, 8, 9], low: [1, 2, 11], high: [7, 8] };
const accessNames: Record<string, string> = {
  WAW: 'Warsaw Chopin Airport', WMI: 'Warsaw Modlin Airport', KRK: 'Kraków Airport',
  GDN: 'Gdańsk Lech Wałęsa Airport', BZG: 'Bydgoszcz Airport', KTW: 'Katowice Airport',
  SZY: 'Olsztyn-Mazury Airport', LUZ: 'Lublin Airport',
};
function profile(seed: Seed): DestinationProfile {
  const airportCodes = seed.airports ?? [];
  const arrivalCodes = airportCodes.length ? airportCodes : seed.access ?? [];
  const translations = Object.fromEntries(locales.map((locale, index) => [locale, {
    name: seed.names[index],
    description: seed.descriptions[index],
    recommendations: seed.places.map(place => `${visit[locale]} ${place}`) as DestinationText['recommendations'],
    recommendedStay: `${seed.stay} ${days[locale]}`,
    seasonalityNote: [practical[locale],
      (airportCodes.length ? ownAirport[locale] : ground[locale]).replace('{codes}', arrivalCodes.join(', ')),
      seed.protectedArea === 'tatras' ? tatras[locale] : seed.protectedArea === 'bialowieza' ? bialowieza[locale] : '',
    ].filter(Boolean).join(' '),
  }])) as Record<Locale, DestinationText>;
  return {
    id: `pl-${seed.slug}`, slug: seed.slug, countryCode: 'PL', country: 'Polonia',
    federalStates: [seed.region], ...polandImages[seed.slug], ...translations.es, translations,
    airports: airportCodes.map(iataCode => ({ iataCode })), iataCodes: airportCodes,
    metropolitanCodes: [], auxiliaryCodes: [],
    accessAirports: (seed.access ?? []).map(iataCode => ({ iataCode, name: accessNames[iataCode], countryCode: 'PL' })),
    aliases: Array.from(new Set([...(seed.aliases ?? []), ...seed.names])),
    bestMonths: seed.best, lowSeasonMonths: seed.low, highSeasonMonths: seed.high,
    publication: { status: 'draft' },
  };
}

export const polandDestinations: DestinationProfile[] = [
  profile({ slug: 'warsaw', names: ['Varsovia', 'Warsaw', 'Varsovie', 'Warschau', 'Varsavia', 'Varsóvia', 'Varsòvia'], descriptions: [
    'La capital reúne un casco antiguo reconstruido, museos y parques junto al Vístula.',
    'The capital combines a rebuilt Old Town, museums and riverside parks along the Vistula.',
    'La capitale réunit une vieille ville reconstruite, des musées et des parcs au bord de la Vistule.',
    'Die Hauptstadt verbindet eine wiederaufgebaute Altstadt, Museen und Parks an der Weichsel.',
    'La capitale unisce un centro storico ricostruito, musei e parchi lungo la Vistola.',
    'A capital reúne um centro histórico reconstruído, museus e parques junto ao Vístula.',
    'La capital combina un nucli antic reconstruït, museus i parcs vora el Vístula.',
  ], places: ['Stare Miasto', 'Zamek Królewski', 'Łazienki Królewskie', 'Muzeum POLIN'], region: 'PL-14', aliases: ['Warszawa', 'Warsaw Modlin', 'Modlin'], stay: '3–4', airports: ['WAW', 'WMI'], ...cities }),
  profile({ slug: 'krakow', names: ['Cracovia', 'Kraków', 'Cracovie', 'Krakau', 'Cracovia', 'Cracóvia', 'Cracòvia'], descriptions: [
    'Plazas medievales, el castillo de Wawel y el barrio de Kazimierz hacen de Cracovia un viaje histórico.',
    'Medieval squares, Wawel Castle and the Kazimierz quarter make Kraków a rich historical city break.',
    'Places médiévales, château du Wawel et quartier de Kazimierz composent une escapade historique.',
    'Mittelalterliche Plätze, die Wawelburg und das Viertel Kazimierz machen Krakau zu einer historischen Städtereise.',
    'Piazze medievali, castello del Wawel e quartiere Kazimierz raccontano la storia di Cracovia.',
    'Praças medievais, Castelo de Wawel e bairro de Kazimierz fazem de Cracóvia uma visita histórica.',
    'Places medievals, castell de Wawel i barri de Kazimierz fan de Cracòvia una escapada històrica.',
  ], places: ['Rynek Główny', 'Zamek Królewski na Wawelu', 'Kazimierz', 'Sukiennice'], region: 'PL-12', aliases: ['Krakow', 'Kraków'], stay: '3–4', airports: ['KRK'], ...cities }),
  profile({ slug: 'gdansk-tricity', names: ['Gdańsk, Sopot y Gdynia', 'Gdańsk, Sopot and Gdynia', 'Gdańsk, Sopot et Gdynia', 'Danzig, Sopot und Gdynia', 'Danzica, Sopot e Gdynia', 'Gdańsk, Sopot e Gdynia', 'Gdańsk, Sopot i Gdynia'], descriptions: [
    'Tres ciudades bálticas combinan historia portuaria, playas y paseos frente al mar.',
    'Three Baltic cities combine port history, beaches and seafront walks.',
    'Trois villes de la Baltique mêlent histoire portuaire, plages et promenades face à la mer.',
    'Drei Ostseestädte verbinden Hafengeschichte, Strände und Spaziergänge am Meer.',
    'Tre città baltiche uniscono storia portuale, spiagge e passeggiate sul mare.',
    'Três cidades bálticas combinam história portuária, praias e passeios junto ao mar.',
    'Tres ciutats bàltiques combinen història portuària, platges i passejades vora el mar.',
  ], places: ['Długi Targ', 'Europejskie Centrum Solidarności', 'Molo w Sopocie', 'Klif Orłowski'], region: 'PL-22', aliases: ['Gdańsk', 'Gdansk', 'Danzig', 'Sopot', 'Gdynia', 'Trójmiasto', 'Tri-City'], stay: '3–5', airports: ['GDN'], ...coast }),
  profile({ slug: 'wroclaw', names: ['Breslavia (Wrocław)', 'Wrocław', 'Wrocław', 'Breslau (Wrocław)', 'Breslavia', 'Breslávia', 'Breslau (Wrocław)'], descriptions: [
    'Puentes sobre el Óder, plazas coloridas y la isla catedralicia marcan el ritmo de Breslavia.',
    'Bridges over the Oder, colourful squares and Cathedral Island shape a walkable city.',
    'Ponts sur l’Oder, places colorées et île de la cathédrale rythment la découverte de Wrocław.',
    'Brücken über die Oder, bunte Plätze und die Dominsel prägen einen Spaziergang durch Breslau.',
    'Ponti sull’Oder, piazze colorate e isola della cattedrale caratterizzano Breslavia.',
    'Pontes sobre o Oder, praças coloridas e ilha da catedral marcam a visita a Breslávia.',
    'Ponts sobre l’Òder, places de colors i l’illa de la catedral marquen la visita a Breslau.',
  ], places: ['Rynek we Wrocławiu', 'Ostrów Tumski', 'Hala Stulecia', 'Panorama Racławicka'], region: 'PL-02', aliases: ['Wroclaw', 'Wrocław', 'Breslavia', 'Breslau'], stay: '2–3', airports: ['WRO'], ...cities }),
  profile({ slug: 'poznan', names: ['Poznań', 'Poznań', 'Poznań', 'Posen (Poznań)', 'Poznań', 'Poznań', 'Poznań'], descriptions: [
    'La plaza del mercado, el ayuntamiento y las orillas del Warta ofrecen una escapada urbana animada.',
    'The market square, town hall and Warta riverbanks make for a lively city break.',
    'La place du marché, l’hôtel de ville et les berges de la Warta invitent à une escapade animée.',
    'Marktplatz, Rathaus und Wartheufer bieten eine lebendige Städtereise.',
    'Piazza del mercato, municipio e rive del Warta offrono un viaggio urbano vivace.',
    'A praça do mercado, a câmara municipal e as margens do Warta convidam a uma escapada animada.',
    'La plaça del mercat, l’ajuntament i les ribes del Warta conviden a una escapada animada.',
  ], places: ['Stary Rynek', 'Ratusz w Poznaniu', 'Ostrów Tumski', 'Jezioro Maltańskie'], region: 'PL-30', aliases: ['Poznan', 'Posen'], stay: '2–3', airports: ['POZ'], ...cities }),
  profile({ slug: 'torun', names: ['Toruń', 'Toruń', 'Toruń', 'Thorn (Toruń)', 'Toruń', 'Toruń', 'Toruń'], descriptions: [
    'La ciudad de Copérnico conserva calles de ladrillo gótico y vistas al Vístula.',
    'Copernicus’s city preserves Gothic brick streets and views across the Vistula.',
    'La ville de Copernic préserve des rues gothiques en brique et des vues sur la Vistule.',
    'Kopernikus’ Stadt bewahrt gotische Backsteingassen und Blicke auf die Weichsel.',
    'La città di Copernico conserva vie gotiche in mattoni e vedute sulla Vistola.',
    'A cidade de Copérnico preserva ruas góticas de tijolo e vistas para o Vístula.',
    'La ciutat de Copèrnic conserva carrers gòtics de maó i vistes sobre el Vístula.',
  ], places: ['Rynek Staromiejski', 'Dom Mikołaja Kopernika', 'Ruiny Zamku Krzyżackiego', 'Bulwar Filadelfijski'], region: 'PL-04', aliases: ['Torun', 'Thorn'], stay: '2–3', access: ['BZG'], ...cities }),
  profile({ slug: 'lublin', names: ['Lublin', 'Lublin', 'Lublin', 'Lublin', 'Lublino', 'Lublin', 'Lublin'], descriptions: [
    'Puertas históricas, patios y un castillo conectan el casco antiguo con la memoria del este polaco.',
    'Historic gates, courtyards and a castle connect the Old Town with eastern Poland’s layered history.',
    'Portes historiques, cours et château relient la vieille ville à l’histoire de l’est polonais.',
    'Historische Tore, Höfe und ein Schloss verbinden die Altstadt mit der Geschichte Ostpolens.',
    'Porte storiche, cortili e castello legano il centro antico alla storia della Polonia orientale.',
    'Portas históricas, pátios e castelo ligam o centro antigo à história do leste polaco.',
    'Portes històriques, patis i castell connecten el nucli antic amb la història de l’est polonès.',
  ], places: ['Stare Miasto w Lublinie', 'Zamek Lubelski', 'Brama Krakowska', 'Plac Po Farze'], region: 'PL-06', stay: '2–3', airports: ['LUZ'], ...cities }),
  profile({ slug: 'lodz', names: ['Łódź', 'Łódź', 'Łódź', 'Lodz (Łódź)', 'Łódź', 'Łódź', 'Łódź'], descriptions: [
    'Antiguas fábricas transformadas, arte urbano y la calle Piotrkowska muestran una ciudad creativa.',
    'Repurposed factories, street art and Piotrkowska Street reveal a creative city.',
    'Usines reconverties, art urbain et rue Piotrkowska révèlent une ville créative.',
    'Umgenutzte Fabriken, Streetart und die Piotrkowska-Straße zeigen eine kreative Stadt.',
    'Fabbriche riconvertite, arte urbana e via Piotrkowska raccontano una città creativa.',
    'Fábricas reconvertidas, arte urbana e rua Piotrkowska revelam uma cidade criativa.',
    'Fàbriques reconvertides, art urbà i el carrer Piotrkowska mostren una ciutat creativa.',
  ], places: ['Ulica Piotrkowska', 'Manufaktura', 'EC1 Łódź', 'Księży Młyn'], region: 'PL-10', aliases: ['Lodz'], stay: '2–3', airports: ['LCJ'], ...cities }),
  profile({ slug: 'zakopane-tatras', names: ['Zakopane y los Tatras', 'Zakopane and the Tatras', 'Zakopane et les Tatras', 'Zakopane und die Tatra', 'Zakopane e i Tatra', 'Zakopane e os Tatras', 'Zakopane i els Tatres'], descriptions: [
    'Zakopane es base para conocer la cultura de Podhale y recorrer los senderos autorizados de los Tatras.',
    'Zakopane is a base for Podhale culture and designated walks in the Tatra Mountains.',
    'Zakopane sert de base pour découvrir la culture de Podhale et les sentiers autorisés des Tatras.',
    'Zakopane ist Ausgangspunkt für die Kultur Podhales und markierte Wege in der Tatra.',
    'Zakopane è una base per la cultura del Podhale e i sentieri autorizzati dei Tatra.',
    'Zakopane é base para conhecer a cultura de Podhale e os trilhos autorizados dos Tatras.',
    'Zakopane és una base per conèixer la cultura de Podhale i els senders autoritzats dels Tatres.',
  ], places: ['Krupówki', 'Gubałówka', 'Dolina Kościeliska', 'Morskie Oko'], region: 'PL-12', aliases: ['Zakopane', 'Tatry', 'Tatras', 'Tatra Mountains'], stay: '3–5', access: ['KRK', 'KTW'], protectedArea: 'tatras', best: [5, 6, 7, 8, 9], low: [3, 4, 11], high: [1, 2, 7, 8, 12] }),
  profile({ slug: 'masurian-lakes', names: ['Región de los lagos de Masuria', 'Masurian Lake District', 'Région des lacs de Mazurie', 'Masurische Seenplatte', 'Regione dei laghi Masuri', 'Região dos lagos da Masúria', 'Regió dels llacs de Masúria'], descriptions: [
    'Lagos, puertos deportivos y pueblos pequeños invitan a descubrir Masuria con calma.',
    'Lakes, marinas and small towns invite a slower journey through Masuria.',
    'Lacs, ports de plaisance et petites villes invitent à découvrir la Mazurie à son rythme.',
    'Seen, Jachthäfen und kleine Orte laden zu einer ruhigen Reise durch Masuren ein.',
    'Laghi, porti turistici e piccoli borghi invitano a esplorare con calma la Masuria.',
    'Lagos, marinas e pequenas localidades convidam a descobrir a Masúria sem pressa.',
    'Llacs, ports esportius i pobles petits conviden a descobrir Masúria amb calma.',
  ], places: ['Giżycko', 'Jezioro Niegocin', 'Mikołajki', 'Jezioro Śniardwy'], region: 'PL-28', aliases: ['Masuria', 'Mazury', 'Masurian Lakes', 'Olsztyn-Mazury'], stay: '4–6', access: ['SZY', 'WAW'], ...nature }),
  profile({ slug: 'szczecin', names: ['Szczecin', 'Szczecin', 'Szczecin', 'Stettin (Szczecin)', 'Stettino (Szczecin)', 'Szczecin', 'Szczecin'], descriptions: [
    'Terrazas sobre el Óder, edificios marítimos y espacios verdes definen esta ciudad portuaria.',
    'Oder river terraces, maritime buildings and green spaces define this port city.',
    'Terrasses sur l’Oder, bâtiments maritimes et espaces verts dessinent cette ville portuaire.',
    'Terrassen an der Oder, maritime Bauten und Grünflächen prägen diese Hafenstadt.',
    'Terrazze sull’Oder, edifici marittimi e spazi verdi caratterizzano questa città portuale.',
    'Terraços sobre o Oder, edifícios marítimos e espaços verdes definem esta cidade portuária.',
    'Terrasses sobre l’Òder, edificis marítims i espais verds defineixen aquesta ciutat portuària.',
  ], places: ['Wały Chrobrego', 'Zamek Książąt Pomorskich', 'Jasne Błonia', 'Filharmonia im. Mieczysława Karłowicza'], region: 'PL-32', aliases: ['Stettin'], stay: '2–3', airports: ['SZZ'], ...cities }),
  profile({ slug: 'bialowieza', names: ['Parque Nacional de Białowieża', 'Białowieża National Park', 'Parc national de Białowieża', 'Nationalpark Białowieża', 'Parco nazionale di Białowieża', 'Parque Nacional de Białowieża', 'Parc Nacional de Białowieża'], descriptions: [
    'Bosques antiguos y la presencia del bisonte europeo hacen de Białowieża una visita de naturaleza que exige respeto.',
    'Ancient woodland and European bison make Białowieża a nature visit that calls for care.',
    'Forêt ancienne et bisons d’Europe font de Białowieża une visite nature à aborder avec respect.',
    'Alter Wald und Wisente machen Białowieża zu einem Naturziel, das Rücksicht verlangt.',
    'Foreste antiche e bisonti europei rendono Białowieża una visita naturalistica da affrontare con rispetto.',
    'Floresta antiga e bisontes europeus fazem de Białowieża uma visita de natureza que exige respeito.',
    'Boscos antics i bisons europeus fan de Białowieża una visita de natura que demana respecte.',
  ], places: ['Rezerwat Pokazowy Żubrów', 'Park Pałacowy', 'Muzeum Przyrodniczo-Leśne', 'Obszar Ochrony Ścisłej z licencjonowanym przewodnikiem'], region: 'PL-20', aliases: ['Białowieża', 'Bialowieza', 'Białowieski Park Narodowy', 'Bialowieza National Park'], stay: '2–3', access: ['WAW'], protectedArea: 'bialowieza', best: [5, 6, 7, 8, 9, 10], low: [1, 2, 11], high: [7, 8] }),
];
