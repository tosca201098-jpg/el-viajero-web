import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { greeceImages } from './greece-images';
import { greeceRegionalADestinations } from './greece-regional-a';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, i) => [locale, values[i]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const visit = localize(['Visitar', 'Visit', 'Visiter', 'Besuchen:', 'Visitare', 'Visitar', 'Visitar']);
// Proper place names stay intact; descriptive landmark labels follow the selected language.
const landmarks: Readonly<Record<string, Record<Locale, string>>> = Object.fromEntries(Object.entries({
  'Acrópolis / Acropolis': ['Acrópolis', 'Acropolis', 'Acropole', 'Akropolis', 'Acropoli', 'Acrópole', 'Acròpolis'],
  'Museo de la Acrópolis / Acropolis Museum': ['Museo de la Acrópolis', 'Acropolis Museum', 'Musée de l’Acropole', 'Akropolismuseum', 'Museo dell’Acropoli', 'Museu da Acrópole', 'Museu de l’Acròpolis'],
  'Ágora Antigua / Ancient Agora': ['Ágora Antigua', 'Ancient Agora', 'Agora antique', 'Antike Agora', 'Agorà antica', 'Ágora Antiga', 'Àgora antiga'],
  'Rotonda / Rotunda': ['Rotonda', 'Rotunda', 'Rotonde', 'Rotunde', 'Rotonda', 'Rotunda', 'Rotonda'],
  'Paseo marítimo / Waterfront': ['Paseo marítimo', 'Waterfront', 'Front de mer', 'Uferpromenade', 'Lungomare', 'Passeio marítimo', 'Passeig marítim'],
  'Museo Arqueológico / Archaeological Museum': ['Museo Arqueológico', 'Archaeological Museum', 'Musée archéologique', 'Archäologisches Museum', 'Museo archeologico', 'Museu Arqueológico', 'Museu Arqueològic'],
  'Murallas venecianas / Venetian Walls': ['Murallas venecianas', 'Venetian Walls', 'Remparts vénitiens', 'Venezianische Stadtmauern', 'Mura veneziane', 'Muralhas venezianas', 'Muralles venecianes'],
  'Puerto veneciano / Venetian Harbour': ['Puerto veneciano', 'Venetian Harbour', 'Port vénitien', 'Venezianischer Hafen', 'Porto veneziano', 'Porto veneziano', 'Port venecià'],
  'Ciudad medieval / Medieval Town': ['Ciudad medieval', 'Medieval Town', 'Ville médiévale', 'Mittelalterliche Altstadt', 'Città medievale', 'Cidade medieval', 'Ciutat medieval'],
  'Palacio del Gran Maestre / Grand Master Palace': ['Palacio del Gran Maestre', 'Palace of the Grand Master', 'Palais des Grands Maîtres', 'Großmeisterpalast', 'Palazzo del Gran Maestro', 'Palácio do Grão-Mestre', 'Palau del Gran Mestre'],
  'Casco antiguo / Old Town': ['Casco antiguo', 'Old Town', 'Vieille ville', 'Altstadt', 'Centro storico', 'Centro histórico', 'Nucli antic'],
  'Fortaleza Vieja / Old Fortress': ['Fortaleza Vieja', 'Old Fortress', 'Vieille forteresse', 'Alte Festung', 'Fortezza Vecchia', 'Fortaleza Velha', 'Fortalesa Vella'],
  'Plaza Solomos / Solomos Square': ['Plaza Solomos', 'Solomos Square', 'Place Solomos', 'Solomos-Platz', 'Piazza Solomos', 'Praça Solomos', 'Plaça Solomos'],
  'Museo de Zakynthos / Zakynthos Museum': ['Museo de Zakynthos', 'Zakynthos Museum', 'Musée de Zante', 'Museum von Zakynthos', 'Museo di Zante', 'Museu de Zaquintos', 'Museu de Zacint'],
  'Casa Papadiamantis / Papadiamantis House': ['Casa de Papadiamantis', 'Papadiamantis House', 'Maison de Papadiamantis', 'Papadiamantis-Haus', 'Casa di Papadiamantis', 'Casa de Papadiamantis', 'Casa de Papadiamandis'],
  'Monasterio Evangelistria / Evangelistria Monastery': ['Monasterio Evangelistria', 'Evangelistria Monastery', 'Monastère Evangelistria', 'Kloster Evangelistria', 'Monastero Evangelistria', 'Mosteiro Evangelistria', 'Monestir Evangelistria'],
}).map(([key, values]) => [key, localize(values as Seven)]));
const notes = {
  city: localize([
    'Primavera y otoño favorecen los paseos; en verano conviene evitar las horas de más calor. Comprueba entradas y horarios de los monumentos. La temporada tranquila no garantiza precios bajos.',
    'Spring and autumn suit walking; avoid the hottest hours in summer. Check monument tickets and opening times. A quieter season does not guarantee low prices.',
    'Printemps et automne se prêtent aux promenades ; évitez les heures chaudes en été. Vérifiez billets et horaires des monuments. Une période calme ne garantit pas de prix bas.',
    'Frühling und Herbst eignen sich für Spaziergänge; im Sommer die heißesten Stunden meiden. Eintritt und Öffnungszeiten der Sehenswürdigkeiten prüfen. Ruhigere Zeiten garantieren keine niedrigen Preise.',
    'Primavera e autunno favoriscono le passeggiate; in estate evita le ore più calde. Verifica biglietti e orari dei monumenti. Un periodo tranquillo non garantisce prezzi bassi.',
    'Primavera e outono favorecem os passeios; evite as horas mais quentes no verão. Confirme bilhetes e horários dos monumentos. Uma época calma não garante preços baixos.',
    'Primavera i tardor afavoreixen les passejades; a l’estiu evita les hores de més calor. Comprova entrades i horaris dels monuments. Una època tranquil·la no garanteix preus baixos.',
  ]),
  island: localize([
    'Mayo, junio, septiembre y principios de octubre permiten combinar visitas y costa según el tiempo. Julio y agosto suelen tener más visitantes. Los vuelos, autobuses, barcos y servicios pueden ser estacionales; comprueba horarios y condiciones de acceso antes de salir.',
    'May, June, September and early October suit sightseeing and coastal visits, weather permitting. July and August are usually busier. Flights, buses, boats and services may be seasonal; check schedules and access conditions before setting out.',
    'Mai, juin, septembre et début octobre permettent de combiner visites et littoral selon la météo. Juillet et août sont souvent plus fréquentés. Vols, bus, bateaux et services peuvent être saisonniers ; vérifiez horaires et accès avant de partir.',
    'Mai, Juni, September und Anfang Oktober eignen sich je nach Wetter für Besichtigungen und Küste. Juli und August sind meist belebter. Flüge, Busse, Schiffe und Angebote können saisonal sein; Fahrpläne und Zugang vorab prüfen.',
    'Maggio, giugno, settembre e inizio ottobre permettono di unire visite e costa secondo il tempo. Luglio e agosto sono spesso più affollati. Voli, autobus, navi e servizi possono essere stagionali; verifica orari e accessi prima di partire.',
    'Maio, junho, setembro e início de outubro permitem combinar visitas e costa conforme o tempo. Julho e agosto costumam ter mais visitantes. Voos, autocarros, barcos e serviços podem ser sazonais; confirme horários e acessos antes de sair.',
    'Maig, juny, setembre i inici d’octubre permeten combinar visites i costa segons el temps. Juliol i agost solen tenir més visitants. Vols, autobusos, vaixells i serveis poden ser estacionals; comprova horaris i accessos abans de sortir.',
  ]),
};
const arrival = localize([
  'Llegada por {code}; el aeropuerto y el destino turístico son lugares distintos. Prevé el traslado por carretera hasta tu alojamiento y consulta el transporte para tus fechas.',
  'Arrive via {code}; the airport and tourist destination are separate places. Allow for the road transfer to your accommodation and check transport for your dates.',
  'Arrivée par {code} ; l’aéroport et le lieu de séjour sont distincts. Prévoyez le transfert routier jusqu’à votre hébergement et vérifiez les transports pour vos dates.',
  'Anreise über {code}; Flughafen und Reiseziel sind getrennte Orte. Den Straßentransfer zur Unterkunft einplanen und Verkehrsangebote für die Reisedaten prüfen.',
  'Arrivo tramite {code}; aeroporto e destinazione turistica sono luoghi distinti. Prevedi il trasferimento su strada fino all’alloggio e controlla i trasporti per le tue date.',
  'Chegada por {code}; o aeroporto e o destino turístico são locais distintos. Preveja o transporte por estrada até ao alojamento e confirme as opções para as suas datas.',
  'Arribada per {code}; l’aeroport i la destinació turística són llocs diferents. Preveu el trasllat per carretera fins a l’allotjament i consulta el transport per a les teves dates.',
]);
type Seed = {
  slug: keyof typeof greeceImages; airport: string; names: Seven; descriptions: Seven;
  recommendations: DestinationText['recommendations']; stay: string; city?: boolean; aliases: string[];
};
function destination(seed: Seed): DestinationProfile {
  const names = localize(seed.names), descriptions = localize(seed.descriptions);
  const translations = Object.fromEntries(locales.map(locale => [locale, {
    name: names[locale], description: descriptions[locale],
    recommendations: seed.recommendations.map(place => `${visit[locale]} ${landmarks[place]?.[locale] ?? place}`) as DestinationText['recommendations'],
    recommendedStay: `${seed.stay} ${days[locale]}`,
    seasonalityNote: `${notes[seed.city ? 'city' : 'island'][locale]} ${arrival[locale].replace('{code}', seed.airport)}`,
  }])) as Record<Locale, DestinationText>;
  return {
    id: `gr-${seed.slug}`, slug: seed.slug, countryCode: 'GR', country: 'Grecia',
    ...greeceImages[seed.slug], ...translations.es, translations,
    airports: [{ iataCode: seed.airport }], iataCodes: [seed.airport], metropolitanCodes: [],
    aliases: Array.from(new Set([...Object.values(names), ...seed.aliases])),
    bestMonths: seed.city ? [4, 5, 6, 9, 10] : [5, 6, 9, 10],
    lowSeasonMonths: [1, 2, 11, 12], highSeasonMonths: [7, 8], publication: { status: 'draft' },
  };
}

// Requested selections only: these identities do not replace the original Santorini home card.
export const greeceDestinations: DestinationProfile[] = [
  destination({ slug: 'athens', airport: 'ATH', city: true, stay: '3–4', aliases: ['Athina', 'Athína', 'Αθήνα'],
    names: ['Atenas', 'Athens', 'Athènes', 'Athen', 'Atene', 'Atenas', 'Atenes'],
    descriptions: [
      'Historia clásica y vida de barrio para recorrer a pie la capital griega.',
      'Explore classical history and neighbourhood life on foot in the Greek capital.',
      'Histoire classique et vie de quartier pour découvrir la capitale grecque à pied.',
      'Klassische Geschichte und lebendige Viertel laden zu Fuß durch Griechenlands Hauptstadt ein.',
      'Storia classica e vita di quartiere per esplorare a piedi la capitale greca.',
      'História clássica e vida de bairro para descobrir a pé a capital grega.',
      'Història clàssica i vida de barri per recórrer a peu la capital grega.',
    ], recommendations: ['Acrópolis / Acropolis', 'Museo de la Acrópolis / Acropolis Museum', 'Plaka', 'Ágora Antigua / Ancient Agora'] }),
  destination({ slug: 'thessaloniki', airport: 'SKG', city: true, stay: '2–3', aliases: ['Salónica', 'Salonika', 'Salonica', 'Θεσσαλονίκη'],
    names: ['Tesalónica', 'Thessaloniki', 'Thessalonique', 'Thessaloniki', 'Salonicco', 'Salónica', 'Tessalònica'],
    descriptions: [
      'Paseos junto al golfo y barrios históricos para conocer el norte de Grecia.',
      'Gulf-side walks and historic neighbourhoods introduce northern Greece.',
      'Promenades sur le golfe et quartiers historiques pour découvrir le nord grec.',
      'Spaziergänge am Golf und historische Viertel erschließen Nordgriechenland.',
      'Passeggiate sul golfo e quartieri storici per conoscere la Grecia settentrionale.',
      'Passeios junto ao golfo e bairros históricos para conhecer o norte da Grécia.',
      'Passejades vora el golf i barris històrics per descobrir el nord de Grècia.',
    ], recommendations: ['Lefkos Pyrgos', 'Ano Poli', 'Rotonda / Rotunda', 'Paseo marítimo / Waterfront'] }),
  destination({ slug: 'heraklion', airport: 'HER', stay: '3–4', aliases: ['Iraklio', 'Irakleio', 'Ηράκλειο'],
    names: ['Heraclión', 'Heraklion', 'Héraklion', 'Heraklion', 'Heraklion', 'Heraclião', 'Iràklio'],
    descriptions: [
      'Una base urbana para descubrir el patrimonio minoico del centro de Creta.',
      'An urban base for discovering the Minoan heritage of central Crete.',
      'Une base urbaine pour explorer le patrimoine minoen du centre de la Crète.',
      'Ein städtischer Ausgangspunkt für das minoische Erbe Zentralkretas.',
      'Una base cittadina per scoprire il patrimonio minoico di Creta centrale.',
      'Uma base urbana para descobrir o património minoico do centro de Creta.',
      'Una base urbana per descobrir el patrimoni minoic del centre de Creta.',
    ], recommendations: ['Knossos', 'Museo Arqueológico / Archaeological Museum', 'Koules', 'Murallas venecianas / Venetian Walls'] }),
  destination({ slug: 'chania', airport: 'CHQ', stay: '3–4', aliases: ['La Canea', 'Hania', 'Khania', 'Χανιά'],
    names: ['La Canea', 'Chania', 'La Canée', 'Chania', 'La Canea', 'Chania', 'Khanià'],
    descriptions: [
      'Puerto histórico y callejuelas para explorar el oeste de Creta desde la ciudad.',
      'A historic harbour and lanes make a city base for exploring western Crete.',
      'Port historique et ruelles pour découvrir l’ouest crétois depuis la ville.',
      'Historischer Hafen und Gassen als städtische Basis für Westkreta.',
      'Porto storico e vicoli per esplorare la Creta occidentale dalla città.',
      'Porto histórico e ruelas para explorar o oeste de Creta a partir da cidade.',
      'Port històric i carrerons per explorar l’oest de Creta des de la ciutat.',
    ], recommendations: ['Puerto veneciano / Venetian Harbour', 'Topanas', 'Firkas', 'Nea Hora'] }),
  destination({ slug: 'rhodes', airport: 'RHO', stay: '4–6', aliases: ['Rodos', 'Rhodos', 'Ρόδος'],
    names: ['Rodas', 'Rhodes', 'Rhodes', 'Rhodos', 'Rodi', 'Rodes', 'Rodes'],
    descriptions: [
      'Una isla para alternar patrimonio medieval, pueblos y paseos costeros.',
      'An island for alternating medieval heritage, villages and coastal walks.',
      'Une île où alterner patrimoine médiéval, villages et promenades côtières.',
      'Eine Insel für mittelalterliches Erbe, Dörfer und Spaziergänge an der Küste.',
      'Un’isola per alternare patrimonio medievale, villaggi e passeggiate costiere.',
      'Uma ilha para alternar património medieval, aldeias e passeios costeiros.',
      'Una illa per alternar patrimoni medieval, pobles i passejades costaneres.',
    ], recommendations: ['Ciudad medieval / Medieval Town', 'Palacio del Gran Maestre / Grand Master Palace', 'Lindos', 'Mandraki'] }),
  destination({ slug: 'corfu', airport: 'CFU', stay: '4–5', aliases: ['Kerkyra', 'Kerkira', 'Κέρκυρα'],
    names: ['Corfú', 'Corfu', 'Corfou', 'Korfu', 'Corfù', 'Corfu', 'Corfú'],
    descriptions: [
      'Arquitectura urbana y paisajes jónicos para recorrer la isla con calma.',
      'Town architecture and Ionian landscapes invite unhurried island exploration.',
      'Architecture urbaine et paysages ioniens pour parcourir l’île tranquillement.',
      'Stadtarchitektur und ionische Landschaften laden zur entspannten Inselreise ein.',
      'Architettura cittadina e paesaggi ionici per esplorare l’isola con calma.',
      'Arquitetura urbana e paisagens jónicas para percorrer a ilha com calma.',
      'Arquitectura urbana i paisatges jònics per recórrer l’illa amb calma.',
    ], recommendations: ['Casco antiguo / Old Town', 'Fortaleza Vieja / Old Fortress', 'Liston', 'Paleokastritsa'] }),
  destination({ slug: 'kos', airport: 'KGS', stay: '3–5', aliases: ['Cos', 'Κως'],
    names: ['Kos', 'Kos', 'Kos', 'Kos', 'Kos', 'Cós', 'Cos'],
    descriptions: [
      'Restos antiguos, pueblos y costa para descubrir una isla del Dodecaneso.',
      'Ancient remains, villages and coast introduce this Dodecanese island.',
      'Vestiges antiques, villages et littoral pour découvrir une île du Dodécanèse.',
      'Antike Überreste, Dörfer und Küste erschließen diese Dodekanesinsel.',
      'Resti antichi, villaggi e costa per scoprire un’isola del Dodecaneso.',
      'Vestígios antigos, aldeias e costa para descobrir uma ilha do Dodecaneso.',
      'Vestigis antics, pobles i costa per descobrir una illa del Dodecanès.',
    ], recommendations: ['Asklepieion', 'Ágora Antigua / Ancient Agora', 'Casa Romana', 'Zia'] }),
  destination({ slug: 'santorini', airport: 'JTR', stay: '3–4', aliases: ['Thira', 'Thera', 'Θήρα', 'Σαντορίνη'],
    names: ['Santorini', 'Santorini', 'Santorin', 'Santorin', 'Santorini', 'Santorini', 'Santorí'],
    descriptions: [
      'Pueblos de la caldera y patrimonio antiguo para recorrer la isla más allá de sus miradores.',
      'Caldera villages and ancient heritage invite exploration beyond the viewpoints.',
      'Villages de la caldeira et patrimoine antique pour explorer au-delà des belvédères.',
      'Caldera-Dörfer und antikes Erbe laden über die Aussichtspunkte hinaus zur Inselerkundung ein.',
      'Villaggi della caldera e patrimonio antico per esplorare oltre i belvedere.',
      'Aldeias da caldeira e património antigo para explorar para lá dos miradouros.',
      'Pobles de la caldera i patrimoni antic per explorar més enllà dels miradors.',
    ], recommendations: ['Oia', 'Fira', 'Akrotiri', 'Emporio'] }),
  destination({ slug: 'mykonos', airport: 'JMK', stay: '3–4', aliases: ['Mikonos', 'Míkonos', 'Μύκονος'],
    names: ['Miconos', 'Mykonos', 'Mykonos', 'Mykonos', 'Mykonos', 'Míconos', 'Míkonos'],
    descriptions: [
      'Callejuelas blancas y pueblos cicládicos para combinar paseos y vida junto al mar.',
      'Whitewashed lanes and Cycladic villages combine walks with seaside life.',
      'Ruelles blanches et villages cycladiques pour mêler promenades et vie maritime.',
      'Weiße Gassen und Kykladendörfer verbinden Spaziergänge mit dem Leben am Meer.',
      'Vicoli bianchi e villaggi cicladici per unire passeggiate e vita sul mare.',
      'Ruelas brancas e aldeias cicládicas para combinar passeios e vida à beira-mar.',
      'Carrerons blancs i pobles ciclàdics per combinar passejades i vida vora el mar.',
    ], recommendations: ['Little Venice', 'Kato Mili', 'Panagia Paraportiani', 'Ano Mera'] }),
  destination({ slug: 'zakynthos', airport: 'ZTH', stay: '4–5', aliases: ['Zante', 'Zakinthos', 'Ζάκυνθος'],
    names: ['Zante', 'Zakynthos', 'Zante', 'Zakynthos', 'Zante', 'Zaquintos', 'Zacint'],
    descriptions: [
      'Una base jónica con plazas, patrimonio y miradores alrededor de su capital.',
      'An Ionian base with squares, heritage and viewpoints around its capital.',
      'Une escale ionienne de places, patrimoine et belvédères autour de sa capitale.',
      'Ein ionisches Reiseziel mit Plätzen, Kulturerbe und Aussichtspunkten um die Hauptstadt.',
      'Una base ionica con piazze, patrimonio e punti panoramici intorno al capoluogo.',
      'Uma base jónica com praças, património e miradouros em redor da capital.',
      'Una base jònica amb places, patrimoni i miradors al voltant de la capital.',
    ], recommendations: ['Plaza Solomos / Solomos Square', 'Museo de Zakynthos / Zakynthos Museum', 'Agios Dionysios', 'Bochali'] }),
  destination({ slug: 'kefalonia', airport: 'EFL', stay: '4–6', aliases: ['Cefalonia', 'Cephalonia', 'Kefallinia', 'Κεφαλονιά'],
    names: ['Cefalonia', 'Kefalonia', 'Céphalonie', 'Kefalonia', 'Cefalonia', 'Cefalónia', 'Cefalònia'],
    descriptions: [
      'Pueblos jónicos y paisajes variados para explorar la isla reservando tiempo para los traslados.',
      'Ionian villages and varied landscapes reward an island trip with time for transfers.',
      'Villages ioniens et paysages variés à explorer en prévoyant le temps des trajets.',
      'Ionische Dörfer und vielfältige Landschaften mit Zeit für Fahrten über die Insel.',
      'Villaggi ionici e paesaggi diversi da esplorare prevedendo tempo per gli spostamenti.',
      'Aldeias jónicas e paisagens variadas para explorar com tempo para as deslocações.',
      'Pobles jònics i paisatges variats per explorar reservant temps per als trasllats.',
    ], recommendations: ['Argostoli', 'Assos', 'Fiskardo', 'Myrtos'] }),
  destination({ slug: 'skiathos', airport: 'JSI', stay: '3–5', aliases: ['Skíathos', 'Σκιάθος'],
    names: ['Scíathos', 'Skiathos', 'Skiathos', 'Skiathos', 'Sciato', 'Esquíato', 'Escíatos'],
    descriptions: [
      'Paseos de puerto, patrimonio local y costa arbolada en las Espóradas.',
      'Harbour walks, local heritage and wooded coast in the Sporades.',
      'Promenades au port, patrimoine local et côte boisée dans les Sporades.',
      'Hafenspaziergänge, lokales Erbe und bewaldete Küsten auf den Sporaden.',
      'Passeggiate sul porto, patrimonio locale e costa boscosa nelle Sporadi.',
      'Passeios no porto, património local e costa arborizada nas Espórades.',
      'Passejades pel port, patrimoni local i costa arbrada a les Espòrades.',
    ], recommendations: ['Bourtzi', 'Casa Papadiamantis / Papadiamantis House', 'Koukounaries', 'Monasterio Evangelistria / Evangelistria Monastery'] }),
  ...greeceRegionalADestinations,
];
