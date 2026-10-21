import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { ukImages } from './uk-images';

type Region = 'ENG' | 'SCT' | 'WLS' | 'NIR';
type Row = [name: string, description: string, recommendations: DestinationText['recommendations']];
const regions: Record<Region, Record<Locale, string>> = {
  ENG: { es:'Inglaterra',en:'England',fr:'Angleterre',de:'England',it:'Inghilterra',pt:'Inglaterra',ca:'Anglaterra' },
  SCT: { es:'Escocia',en:'Scotland',fr:'Écosse',de:'Schottland',it:'Scozia',pt:'Escócia',ca:'Escòcia' },
  WLS: { es:'Gales',en:'Wales',fr:'Pays de Galles',de:'Wales',it:'Galles',pt:'País de Gales',ca:'Gal·les' },
  NIR: { es:'Irlanda del Norte',en:'Northern Ireland',fr:'Irlande du Nord',de:'Nordirland',it:'Irlanda del Nord',pt:'Irlanda do Norte',ca:'Irlanda del Nord' },
};
const days: Record<Locale,string> = {es:'días',en:'days',fr:'jours',de:'Tage',it:'giorni',pt:'dias',ca:'dies'};
const notes: Record<'city'|'edinburgh'|'rural'|'highlands'|'coast',Record<Locale,string>> = {
 city:{
  es:'De abril a junio y en septiembre suele ser agradable recorrer barrios, museos y mercados a pie. Lleva ropa impermeable todo el año y reserva las visitas más solicitadas. Las vacaciones y los grandes eventos pueden aumentar la afluencia; comprueba los traslados desde cada aeropuerto.',
  en:'April to June and September are good periods for walks through neighbourhoods, museums and markets. Pack waterproof clothing year-round and book popular visits ahead. Holidays and major events can draw crowds; check transfers from each airport.',
  fr:'Avril à juin et septembre se prêtent aux promenades, musées et marchés. Prévoyez des vêtements imperméables toute l’année et réservez les visites très demandées. Vacances et grands événements peuvent attirer du monde ; vérifiez les transferts depuis chaque aéroport.',
  de:'April bis Juni und September eignen sich für Viertel, Museen und Märkte. Ganzjährig Regenkleidung mitnehmen und beliebte Besichtigungen vorbuchen. Ferien und Großveranstaltungen können viel Betrieb bringen; Transfers ab dem jeweiligen Flughafen prüfen.',
  it:'Da aprile a giugno e a settembre puoi passeggiare tra quartieri, musei e mercati. Porta indumenti impermeabili tutto l’anno e prenota le visite più richieste. Festività e grandi eventi possono attirare molti visitatori; verifica i trasferimenti da ogni aeroporto.',
  pt:'De abril a junho e em setembro pode passear por bairros, museus e mercados. Leve roupa impermeável todo o ano e reserve as visitas mais procuradas. Férias e grandes eventos podem atrair mais visitantes; confirme os transportes de cada aeroporto.',
  ca:'D’abril a juny i al setembre pots passejar per barris, museus i mercats. Porta roba impermeable tot l’any i reserva les visites més sol·licitades. Les vacances i els grans esdeveniments poden atraure més gent; comprova els trasllats des de cada aeroport.',
 },
 edinburgh:{
  es:'Mayo, junio y septiembre permiten combinar el casco antiguo con paseos al aire libre. Agosto concentra festivales y más visitantes. El invierno tiene menos luz: prepara ropa impermeable y calzado con agarre para las calles empinadas.',
  en:'May, June and September suit old-town visits and outdoor walks. August brings festivals and larger crowds. Winter has shorter daylight hours: bring waterproofs and shoes with grip for steep streets.',
  fr:'Mai, juin et septembre permettent de combiner vieille ville et promenades. Août attire festivals et visiteurs. Les journées d’hiver sont courtes : prévoyez vêtements imperméables et chaussures adhérentes pour les rues pentues.',
  de:'Mai, Juni und September eignen sich für Altstadt und Spaziergänge. Im August sorgen Festivals für mehr Besucher. Wintertage sind kurz: Regenkleidung und griffige Schuhe für steile Straßen mitnehmen.',
  it:'Maggio, giugno e settembre permettono di alternare centro storico e passeggiate. Agosto richiama festival e più visitatori. In inverno le giornate sono corte: porta impermeabili e scarpe aderenti per le strade ripide.',
  pt:'Maio, junho e setembro permitem combinar o centro histórico com passeios. Agosto concentra festivais e mais visitantes. O inverno tem menos luz: leve impermeável e calçado aderente para as ruas inclinadas.',
  ca:'Maig, juny i setembre permeten combinar el nucli antic amb passejades. L’agost concentra festivals i més visitants. A l’hivern hi ha menys llum: porta impermeable i calçat adherent per als carrers costeruts.',
 },
 rural:{
  es:'De mayo a junio y en septiembre combina visitas urbanas con senderos y pueblos. Los aeropuertos son puntos de acceso con traslado terrestre, no aeropuertos propios de York u Oxford. Planifica trenes y autobuses; en zonas rurales pueden ser poco frecuentes.',
  en:'May to June and September suit a mix of town visits, paths and villages. Airports are arrival gateways requiring ground transfers, not airports belonging to York or Oxford. Plan trains and buses ahead; rural services may be infrequent.',
  fr:'Mai à juin et septembre permettent de combiner ville, sentiers et villages. Les aéroports sont des accès avec transfert terrestre, pas des aéroports propres à York ou Oxford. Prévoyez trains et bus : les dessertes rurales peuvent être rares.',
  de:'Mai bis Juni und September eignen sich für Städte, Wege und Dörfer. Die Flughäfen sind Anreisepunkte mit Landtransfer, keine eigenen Flughäfen von York oder Oxford. Bahn und Bus planen; auf dem Land fahren sie teils selten.',
  it:'Da maggio a giugno e a settembre alterna città, sentieri e villaggi. Gli aeroporti sono punti di accesso con trasferimento terrestre, non aeroporti propri di York o Oxford. Pianifica treni e autobus: in campagna possono essere poco frequenti.',
  pt:'De maio a junho e em setembro combine cidades, trilhos e aldeias. Os aeroportos são acessos com transporte terrestre, não aeroportos próprios de York ou Oxford. Planeie comboios e autocarros, que podem ser pouco frequentes no campo.',
  ca:'De maig a juny i al setembre combina ciutats, camins i pobles. Els aeroports són accessos amb trasllat terrestre, no aeroports propis de York o Oxford. Planifica trens i autobusos: al camp poden ser poc freqüents.',
 },
 highlands:{
  es:'De mayo a septiembre hay más horas de luz para lagos y senderos. El tiempo cambia rápidamente: consulta la previsión y adapta las rutas. Reserva margen para las distancias por carretera; en verano puede haber mosquitos de las Highlands y más visitantes.',
  en:'May to September brings longer daylight for lochs and trails. Weather changes quickly: check forecasts and adapt walks. Allow time for road distances; summer can bring Highland midges and more visitors.',
  fr:'De mai à septembre, les journées plus longues favorisent lacs et sentiers. La météo change vite : consultez les prévisions et adaptez les randonnées. Prévoyez les distances routières ; l’été peut apporter des moucherons et davantage de visiteurs.',
  de:'Mai bis September bieten längeres Tageslicht für Seen und Wege. Das Wetter wechselt rasch: Vorhersage prüfen und Wanderungen anpassen. Fahrzeiten einplanen; im Sommer können Highland-Mücken und mehr Besucher auftreten.',
  it:'Da maggio a settembre le giornate lunghe favoriscono laghi e sentieri. Il meteo cambia rapidamente: consulta le previsioni e adatta le escursioni. Calcola le distanze stradali; in estate possono esserci moscerini e più visitatori.',
  pt:'De maio a setembro há mais horas de luz para lagos e trilhos. O tempo muda depressa: consulte a previsão e adapte os percursos. Preveja tempo para as distâncias de estrada; no verão pode haver mosquitos e mais visitantes.',
  ca:'De maig a setembre hi ha més hores de llum per als llacs i camins. El temps canvia de pressa: consulta la previsió i adapta les rutes. Preveu les distàncies per carretera; a l’estiu hi pot haver mosquits i més visitants.',
 },
 coast:{
  es:'De mayo a septiembre puedes combinar ciudad, castillos y costa. Reserva días distintos para las excursiones y consulta mareas, viento y accesos a los senderos. Las rutas costeras requieren traslados; ningún aeropuerto garantiza una conexión directa con cada lugar turístico.',
  en:'May to September suits a mix of city, castles and coast. Keep separate days for excursions and check tides, wind and trail access. Coastal trips need ground transport; no airport guarantees a direct connection to every attraction.',
  fr:'De mai à septembre, combinez ville, châteaux et littoral. Réservez des journées aux excursions et vérifiez marées, vent et accès aux sentiers. Les sorties côtières demandent des transferts ; aucun aéroport ne garantit une liaison directe vers chaque site.',
  de:'Mai bis September eignen sich für Stadt, Burgen und Küste. Eigene Tage für Ausflüge vorsehen und Gezeiten, Wind sowie Wegzugänge prüfen. Küstentouren brauchen Landtransport; kein Flughafen garantiert direkte Verbindungen zu jeder Sehenswürdigkeit.',
  it:'Da maggio a settembre abbina città, castelli e costa. Dedica giornate distinte alle escursioni e verifica maree, vento e accessi ai sentieri. La costa richiede trasferimenti: nessun aeroporto garantisce collegamenti diretti con ogni attrazione.',
  pt:'De maio a setembro combine cidade, castelos e costa. Reserve dias distintos para excursões e consulte marés, vento e acessos aos trilhos. A costa exige transportes terrestres; nenhum aeroporto garante uma ligação direta a cada atração.',
  ca:'De maig a setembre combina ciutat, castells i costa. Reserva dies diferents per a les excursions i consulta marees, vent i accessos als camins. La costa requereix trasllats; cap aeroport garanteix connexió directa amb cada indret turístic.',
 },
};
type Seed = {slug:keyof typeof ukImages;region:Region;stay:string;airports?:string[];metro?:string;
 accessAirports?:DestinationProfile['accessAirports'];aliases?:string[];note?:keyof typeof notes;bestMonths?:number[]};
type UKProfile = DestinationProfile & {regionCode:string;regionNames:Record<Locale,string>};
function destination(seed:Seed,rows:Record<Locale,Row>):UKProfile {
 const translations = Object.fromEntries(Object.entries(rows).map(([locale,[name,description,recommendations]])=>{
  const lang=locale as Locale;
  return [lang,{name,description:regions[seed.region][lang]+'. '+description,recommendations,recommendedStay:seed.stay+' '+days[lang],seasonalityNote:notes[seed.note??'city'][lang]}];
 })) as Record<Locale,DestinationText>;
 const physical=seed.airports??[];
 return {id:'gb-'+seed.slug,slug:seed.slug,countryCode:'GB',country:'Reino Unido',
  regionCode:'GB-'+seed.region,regionNames:regions[seed.region],
  ...ukImages[seed.slug],...translations.es,translations,
  airports:physical.map(iataCode=>({iataCode})),metropolitanCodes:seed.metro?[seed.metro]:[],
  iataCodes:[...(seed.metro?[seed.metro]:[]),...physical],accessAirports:seed.accessAirports,
  aliases:Array.from(new Set([...(seed.aliases??[]),...Object.values(translations).map(t=>t.name)])),
  bestMonths:seed.bestMonths??[4,5,6,9],lowSeasonMonths:[1,2,11],highSeasonMonths:[7,8],
  publication:{status:'draft'}};
}

/** Tourist identities only. Historical editorial cards remain unchanged. */
export const ukDestinations:UKProfile[] = [
 destination({slug:'london',region:'ENG',stay:'4–5',airports:['LHR','LGW','STN','LTN','LCY','SEN'],metro:'LON'},{
  es:['Londres','Recorre el Támesis, sus museos y mercados; combina Westminster con los barrios y parques de la capital británica.',['Pasear por Westminster y South Bank','Visitar el British Museum','Explorar Tower Bridge y la Torre de Londres','Descubrir los mercados de Borough y Camden']],
  en:['London','Explore the Thames, museums and markets, combining Westminster with the neighbourhoods and parks of the British capital.',['Walk around Westminster and South Bank','Visit the British Museum','Explore Tower Bridge and the Tower of London','Discover Borough and Camden markets']],
  fr:['Londres','Explorez la Tamise, les musées et les marchés, en associant Westminster aux quartiers et parcs de la capitale britannique.',['Se promener à Westminster et South Bank','Visiter le British Museum','Explorer Tower Bridge et la tour de Londres','Découvrir les marchés de Borough et Camden']],
  de:['London','Entdecke Themse, Museen und Märkte und verbinde Westminster mit den Vierteln und Parks der britischen Hauptstadt.',['Durch Westminster und South Bank spazieren','Das British Museum besuchen','Tower Bridge und Tower of London erkunden','Borough und Camden Market entdecken']],
  it:['Londra','Esplora il Tamigi, musei e mercati, abbinando Westminster ai quartieri e ai parchi della capitale britannica.',['Passeggiare a Westminster e South Bank','Visitare il British Museum','Esplorare Tower Bridge e la Torre di Londra','Scoprire i mercati di Borough e Camden']],
  pt:['Londres','Explore o Tamisa, museus e mercados, combinando Westminster com os bairros e parques da capital britânica.',['Passear por Westminster e South Bank','Visitar o British Museum','Explorar Tower Bridge e a Torre de Londres','Descobrir os mercados de Borough e Camden']],
  ca:['Londres','Recorre el Tàmesi, museus i mercats, combinant Westminster amb els barris i parcs de la capital britànica.',['Passejar per Westminster i South Bank','Visitar el British Museum','Explorar Tower Bridge i la Torre de Londres','Descobrir els mercats de Borough i Camden']],
 }),
 destination({slug:'edinburgh',region:'SCT',stay:'3–4',airports:['EDI'],note:'edinburgh',bestMonths:[5,6,9]},{
  es:['Edimburgo','Calles medievales, patios y miradores enlazan el castillo con una ciudad de literatura, jardines y colinas.',['Recorrer la Royal Mile y el castillo','Subir a Calton Hill','Pasear por Dean Village','Explorar el Museo Nacional de Escocia']],
  en:['Edinburgh','Medieval streets, closes and viewpoints connect the castle with a city of literature, gardens and hills.',['Explore the Royal Mile and castle','Climb Calton Hill','Walk through Dean Village','Visit the National Museum of Scotland']],
  fr:['Édimbourg','Rues médiévales, cours et belvédères relient le château à une ville de littérature, de jardins et de collines.',['Parcourir le Royal Mile et le château','Monter à Calton Hill','Se promener à Dean Village','Visiter le musée national d’Écosse']],
  de:['Edinburgh','Mittelalterliche Gassen, Innenhöfe und Aussichtspunkte verbinden die Burg mit einer Stadt voller Literatur, Gärten und Hügel.',['Royal Mile und Burg erkunden','Calton Hill besteigen','Durch Dean Village spazieren','Das National Museum of Scotland besuchen']],
  it:['Edimburgo','Strade medievali, cortili e belvederi collegano il castello a una città di letteratura, giardini e colline.',['Percorrere il Royal Mile e il castello','Salire a Calton Hill','Passeggiare a Dean Village','Visitare il Museo nazionale di Scozia']],
  pt:['Edimburgo','Ruas medievais, pátios e miradouros ligam o castelo a uma cidade de literatura, jardins e colinas.',['Percorrer a Royal Mile e o castelo','Subir a Calton Hill','Passear por Dean Village','Visitar o Museu Nacional da Escócia']],
  ca:['Edimburg','Carrers medievals, patis i miradors enllacen el castell amb una ciutat de literatura, jardins i turons.',['Recórrer la Royal Mile i el castell','Pujar a Calton Hill','Passejar per Dean Village','Visitar el Museu Nacional d’Escòcia']],
 }),
 destination({slug:'manchester',region:'ENG',stay:'2–3',airports:['MAN'],aliases:['Mánchester']},{
  es:['Manchester','Bibliotecas, canales y antiguos almacenes cuentan su historia industrial; hoy conviven con música, arte y fútbol.',['Visitar la biblioteca John Rylands','Recorrer el Northern Quarter','Pasear por los canales de Castlefield','Descubrir la historia del fútbol en el National Football Museum']],
  en:['Manchester','Libraries, canals and former warehouses tell an industrial story alongside a thriving mix of music, art and football.',['Visit John Rylands Library','Explore the Northern Quarter','Walk beside Castlefield’s canals','Discover football history at the National Football Museum']],
  fr:['Manchester','Bibliothèques, canaux et anciens entrepôts racontent une histoire industrielle enrichie de musique, d’art et de football.',['Visiter la bibliothèque John Rylands','Explorer le Northern Quarter','Longer les canaux de Castlefield','Découvrir l’histoire du football au National Football Museum']],
  de:['Manchester','Bibliotheken, Kanäle und ehemalige Lagerhäuser erzählen Industriegeschichte zwischen Musik, Kunst und Fußball.',['Die John Rylands Library besuchen','Das Northern Quarter erkunden','An Castlefields Kanälen spazieren','Fußballgeschichte im National Football Museum entdecken']],
  it:['Manchester','Biblioteche, canali e antichi magazzini raccontano il passato industriale tra musica, arte e calcio.',['Visitare la biblioteca John Rylands','Esplorare il Northern Quarter','Passeggiare lungo i canali di Castlefield','Scoprire la storia del calcio al National Football Museum']],
  pt:['Manchester','Bibliotecas, canais e antigos armazéns contam a história industrial entre música, arte e futebol.',['Visitar a biblioteca John Rylands','Explorar o Northern Quarter','Passear pelos canais de Castlefield','Descobrir a história do futebol no National Football Museum']],
  ca:['Manchester','Biblioteques, canals i antics magatzems expliquen el passat industrial entre música, art i futbol.',['Visitar la biblioteca John Rylands','Explorar el Northern Quarter','Passejar pels canals de Castlefield','Descobrir la història del futbol al National Football Museum']],
 }),
 destination({slug:'liverpool',region:'ENG',stay:'2–3',airports:['LPL']},{
  es:['Liverpool','El Mersey y sus muelles invitan a descubrir patrimonio marítimo, museos y la ciudad musical de los Beatles.',['Pasear por Royal Albert Dock','Descubrir la historia de los Beatles','Contemplar las Three Graces en Pier Head','Visitar el Museum of Liverpool']],
  en:['Liverpool','The Mersey and its docks reveal maritime heritage, museums and the musical city of the Beatles.',['Walk around Royal Albert Dock','Discover the Beatles’ story','Admire the Three Graces at Pier Head','Visit the Museum of Liverpool']],
  fr:['Liverpool','La Mersey et ses docks invitent à découvrir patrimoine maritime, musées et ville musicale des Beatles.',['Se promener au Royal Albert Dock','Découvrir l’histoire des Beatles','Admirer les Three Graces à Pier Head','Visiter le Museum of Liverpool']],
  de:['Liverpool','Mersey und Hafenbecken erschließen maritimes Erbe, Museen und die Musikstadt der Beatles.',['Am Royal Albert Dock spazieren','Die Geschichte der Beatles entdecken','Die Three Graces am Pier Head bewundern','Das Museum of Liverpool besuchen']],
  it:['Liverpool','Il Mersey e i docks svelano patrimonio marittimo, musei e la città musicale dei Beatles.',['Passeggiare al Royal Albert Dock','Scoprire la storia dei Beatles','Ammirare le Three Graces a Pier Head','Visitare il Museum of Liverpool']],
  pt:['Liverpool','O Mersey e as docas convidam a descobrir património marítimo, museus e a cidade musical dos Beatles.',['Passear pelo Royal Albert Dock','Descobrir a história dos Beatles','Admirar as Three Graces em Pier Head','Visitar o Museum of Liverpool']],
  ca:['Liverpool','El Mersey i els molls conviden a descobrir patrimoni marítim, museus i la ciutat musical dels Beatles.',['Passejar pel Royal Albert Dock','Descobrir la història dels Beatles','Contemplar les Three Graces a Pier Head','Visitar el Museum of Liverpool']],
 }),
 destination({slug:'birmingham',region:'ENG',stay:'2–3',airports:['BHX']},{
  es:['Birmingham','Canales, arquitectura contemporánea y barrios artesanos permiten recorrer el pasado industrial y la creatividad de las Midlands.',['Pasear por los canales de Brindleyplace','Visitar la Library of Birmingham','Explorar el Jewellery Quarter','Descubrir los talleres y cafés de Digbeth']],
  en:['Birmingham','Canals, contemporary architecture and craft districts connect the industrial past with the creativity of the Midlands.',['Walk along Brindleyplace’s canals','Visit the Library of Birmingham','Explore the Jewellery Quarter','Discover Digbeth’s workshops and cafés']],
  fr:['Birmingham','Canaux, architecture contemporaine et quartiers artisanaux relient passé industriel et créativité des Midlands.',['Longer les canaux de Brindleyplace','Visiter la Library of Birmingham','Explorer le Jewellery Quarter','Découvrir les ateliers et cafés de Digbeth']],
  de:['Birmingham','Kanäle, moderne Architektur und Handwerksviertel verbinden die Industriegeschichte mit der Kreativität der Midlands.',['An Brindleyplaces Kanälen spazieren','Die Library of Birmingham besuchen','Das Jewellery Quarter erkunden','Digbeths Werkstätten und Cafés entdecken']],
  it:['Birmingham','Canali, architettura contemporanea e quartieri artigiani uniscono passato industriale e creatività delle Midlands.',['Passeggiare lungo i canali di Brindleyplace','Visitare la Library of Birmingham','Esplorare il Jewellery Quarter','Scoprire laboratori e caffè di Digbeth']],
  pt:['Birmingham','Canais, arquitetura contemporânea e bairros artesanais ligam o passado industrial à criatividade das Midlands.',['Passear pelos canais de Brindleyplace','Visitar a Library of Birmingham','Explorar o Jewellery Quarter','Descobrir oficinas e cafés de Digbeth']],
  ca:['Birmingham','Canals, arquitectura contemporània i barris artesans uneixen el passat industrial amb la creativitat de les Midlands.',['Passejar pels canals de Brindleyplace','Visitar la Library of Birmingham','Explorar el Jewellery Quarter','Descobrir els tallers i cafès de Digbeth']],
 }),
 destination({slug:'bristol-bath',region:'ENG',stay:'3–4',airports:['BRS'],aliases:['Bristol','Bath']},{
  es:['Bristol y Bath','Combina el puerto y el arte urbano de Bristol con los baños romanos y las plazas georgianas de Bath, reservando tiempo para el traslado.',['Recorrer el Harbourside de Bristol','Contemplar el puente colgante de Clifton','Visitar los baños romanos de Bath','Pasear por Royal Crescent y The Circus']],
  en:['Bristol and Bath','Combine Bristol’s harbour and street art with Bath’s Roman baths and Georgian squares, allowing time to travel between the cities.',['Explore Bristol’s Harbourside','See Clifton Suspension Bridge','Visit Bath’s Roman Baths','Walk around Royal Crescent and The Circus']],
  fr:['Bristol et Bath','Associez port et art urbain de Bristol aux thermes romains et places géorgiennes de Bath, en prévoyant le trajet entre les villes.',['Explorer le Harbourside de Bristol','Admirer le pont suspendu de Clifton','Visiter les thermes romains de Bath','Se promener à Royal Crescent et The Circus']],
  de:['Bristol und Bath','Verbinde Bristols Hafen und Streetart mit Baths römischen Bädern und georgianischen Plätzen; Fahrzeit zwischen beiden Städten einplanen.',['Bristols Harbourside erkunden','Die Clifton Suspension Bridge sehen','Baths Roman Baths besuchen','Durch Royal Crescent und The Circus spazieren']],
  it:['Bristol e Bath','Abbina porto e arte urbana di Bristol ai bagni romani e alle piazze georgiane di Bath, prevedendo il trasferimento tra le città.',['Esplorare l’Harbourside di Bristol','Ammirare il ponte sospeso di Clifton','Visitare i bagni romani di Bath','Passeggiare a Royal Crescent e The Circus']],
  pt:['Bristol e Bath','Combine o porto e a arte urbana de Bristol com os banhos romanos e praças georgianas de Bath, prevendo o transporte entre cidades.',['Explorar o Harbourside de Bristol','Admirar a ponte suspensa de Clifton','Visitar os banhos romanos de Bath','Passear por Royal Crescent e The Circus']],
  ca:['Bristol i Bath','Combina el port i l’art urbà de Bristol amb els banys romans i les places georgianes de Bath, preveient el trasllat entre ciutats.',['Recórrer el Harbourside de Bristol','Contemplar el pont penjant de Clifton','Visitar els banys romans de Bath','Passejar per Royal Crescent i The Circus']],
 }),
 destination({slug:'york',region:'ENG',stay:'2–3',note:'rural',bestMonths:[5,6,9],accessAirports:[{iataCode:'LBA',name:'Leeds Bradford',countryCode:'GB'},{iataCode:'MAN',name:'Manchester',countryCode:'GB'}]},{
  es:['York','Murallas, callejuelas medievales y patrimonio ferroviario rodean la catedral de esta ciudad histórica de Yorkshire.',['Visitar York Minster','Pasear por The Shambles','Recorrer las murallas de la ciudad','Descubrir el National Railway Museum']],
  en:['York','City walls, medieval lanes and railway heritage surround the cathedral of this historic Yorkshire city.',['Visit York Minster','Walk along The Shambles','Explore the city walls','Discover the National Railway Museum']],
  fr:['York','Remparts, ruelles médiévales et patrimoine ferroviaire entourent la cathédrale de cette ville historique du Yorkshire.',['Visiter York Minster','Se promener dans The Shambles','Parcourir les remparts','Découvrir le National Railway Museum']],
  de:['York','Stadtmauern, mittelalterliche Gassen und Eisenbahngeschichte umgeben die Kathedrale dieser historischen Stadt in Yorkshire.',['York Minster besuchen','Durch The Shambles spazieren','Die Stadtmauern erkunden','Das National Railway Museum entdecken']],
  it:['York','Mura, vicoli medievali e patrimonio ferroviario circondano la cattedrale di questa città storica dello Yorkshire.',['Visitare York Minster','Passeggiare lungo The Shambles','Percorrere le mura cittadine','Scoprire il National Railway Museum']],
  pt:['York','Muralhas, ruelas medievais e património ferroviário rodeiam a catedral desta cidade histórica de Yorkshire.',['Visitar York Minster','Passear por The Shambles','Percorrer as muralhas','Descobrir o National Railway Museum']],
  ca:['York','Muralles, carrerons medievals i patrimoni ferroviari envolten la catedral d’aquesta ciutat històrica de Yorkshire.',['Visitar York Minster','Passejar per The Shambles','Recórrer les muralles','Descobrir el National Railway Museum']],
 }),
 destination({slug:'oxford-cotswolds',region:'ENG',stay:'3–4',note:'rural',bestMonths:[5,6,9],aliases:['Oxford','Cotswolds'],accessAirports:[{iataCode:'LHR',name:'London Heathrow',countryCode:'GB'},{iataCode:'BHX',name:'Birmingham',countryCode:'GB'}]},{
  es:['Oxford y los Cotswolds','Bibliotecas universitarias y patios de Oxford se combinan con pueblos de piedra y senderos rurales de los Cotswolds.',['Contemplar Radcliffe Camera y la Bodleian Library','Visitar los patios de los colleges','Pasear por Bourton-on-the-Water','Recorrer senderos y pueblos de los Cotswolds']],
  en:['Oxford and the Cotswolds','Oxford’s university libraries and courtyards combine with the stone villages and rural paths of the Cotswolds.',['See Radcliffe Camera and the Bodleian Library','Visit college courtyards','Walk through Bourton-on-the-Water','Explore Cotswold villages and footpaths']],
  fr:['Oxford et les Cotswolds','Bibliothèques universitaires et cours d’Oxford se combinent aux villages de pierre et chemins ruraux des Cotswolds.',['Admirer Radcliffe Camera et la Bodleian Library','Visiter les cours des colleges','Se promener à Bourton-on-the-Water','Explorer villages et sentiers des Cotswolds']],
  de:['Oxford und die Cotswolds','Oxfords Universitätsbibliotheken und Innenhöfe verbinden sich mit Steindörfern und ländlichen Wegen der Cotswolds.',['Radcliffe Camera und Bodleian Library sehen','College-Innenhöfe besuchen','Durch Bourton-on-the-Water spazieren','Dörfer und Wege der Cotswolds erkunden']],
  it:['Oxford e i Cotswolds','Biblioteche universitarie e cortili di Oxford si abbinano ai villaggi di pietra e ai sentieri rurali dei Cotswolds.',['Ammirare Radcliffe Camera e la Bodleian Library','Visitare i cortili dei college','Passeggiare a Bourton-on-the-Water','Esplorare villaggi e sentieri dei Cotswolds']],
  pt:['Oxford e os Cotswolds','Bibliotecas universitárias e pátios de Oxford combinam-se com aldeias de pedra e caminhos rurais dos Cotswolds.',['Admirar Radcliffe Camera e a Bodleian Library','Visitar os pátios dos colleges','Passear por Bourton-on-the-Water','Explorar aldeias e trilhos dos Cotswolds']],
  ca:['Oxford i els Cotswolds','Biblioteques universitàries i patis d’Oxford es combinen amb pobles de pedra i camins rurals dels Cotswolds.',['Contemplar Radcliffe Camera i la Bodleian Library','Visitar els patis dels colleges','Passejar per Bourton-on-the-Water','Explorar pobles i camins dels Cotswolds']],
 }),
 destination({slug:'glasgow',region:'SCT',stay:'2–3',airports:['GLA'],accessAirports:[{iataCode:'PIK',name:'Glasgow Prestwick',countryCode:'GB'}]},{
  es:['Glasgow','Museos, arquitectura de arenisca y barrios creativos se extienden entre el Clyde y los jardines del West End.',['Visitar Kelvingrove Art Gallery and Museum','Recorrer la Universidad de Glasgow','Descubrir la catedral y la Necrópolis','Pasear por el Clyde y escuchar música en directo']],
  en:['Glasgow','Museums, sandstone architecture and creative districts stretch between the Clyde and the gardens of the West End.',['Visit Kelvingrove Art Gallery and Museum','Explore the University of Glasgow','Discover the cathedral and Necropolis','Walk along the Clyde and enjoy live music']],
  fr:['Glasgow','Musées, architecture de grès et quartiers créatifs s’étendent entre la Clyde et les jardins du West End.',['Visiter Kelvingrove Art Gallery and Museum','Explorer l’université de Glasgow','Découvrir la cathédrale et la Nécropole','Longer la Clyde et écouter de la musique live']],
  de:['Glasgow','Museen, Sandsteinarchitektur und kreative Viertel liegen zwischen dem Clyde und den Gärten des West End.',['Kelvingrove Art Gallery and Museum besuchen','Die Universität Glasgow erkunden','Kathedrale und Nekropole entdecken','Am Clyde spazieren und Livemusik hören']],
  it:['Glasgow','Musei, architettura in arenaria e quartieri creativi si estendono tra il Clyde e i giardini del West End.',['Visitare Kelvingrove Art Gallery and Museum','Esplorare l’Università di Glasgow','Scoprire la cattedrale e la Necropoli','Passeggiare sul Clyde e ascoltare musica dal vivo']],
  pt:['Glasgow','Museus, arquitetura de arenito e bairros criativos estendem-se entre o Clyde e os jardins do West End.',['Visitar Kelvingrove Art Gallery and Museum','Explorar a Universidade de Glasgow','Descobrir a catedral e a Necrópole','Passear junto ao Clyde e ouvir música ao vivo']],
  ca:['Glasgow','Museus, arquitectura de gres i barris creatius s’estenen entre el Clyde i els jardins del West End.',['Visitar Kelvingrove Art Gallery and Museum','Recórrer la Universitat de Glasgow','Descobrir la catedral i la Necròpolis','Passejar pel Clyde i escoltar música en directe']],
 }),
 destination({slug:'inverness-highlands',region:'SCT',stay:'4–6',airports:['INV'],aliases:['Inverness','Highlands'],note:'highlands',bestMonths:[5,6,7,8,9]},{
  es:['Inverness y las Highlands','Inverness sirve de base para paseos junto al Ness y excursiones a lagos, castillos y paisajes de las Highlands.',['Pasear por el río Ness y sus islas','Explorar Loch Ness y Urquhart Castle','Conocer la historia de Culloden','Caminar por senderos de Glen Affric']],
  en:['Inverness and the Highlands','Inverness is a base for riverside walks and trips to Highland lochs, castles and landscapes.',['Walk along the River Ness and its islands','Explore Loch Ness and Urquhart Castle','Learn about Culloden’s history','Walk Glen Affric’s trails']],
  fr:['Inverness et les Highlands','Inverness permet de combiner promenades sur la Ness et excursions aux lacs, châteaux et paysages des Highlands.',['Longer la Ness et ses îles','Explorer le Loch Ness et Urquhart Castle','Découvrir l’histoire de Culloden','Parcourir les sentiers de Glen Affric']],
  de:['Inverness und die Highlands','Inverness ist Ausgangspunkt für Spaziergänge am Ness und Ausflüge zu Seen, Burgen und Landschaften der Highlands.',['Am River Ness und seinen Inseln spazieren','Loch Ness und Urquhart Castle erkunden','Die Geschichte von Culloden kennenlernen','Auf Wegen durch Glen Affric wandern']],
  it:['Inverness e le Highlands','Inverness è una base per passeggiate sul Ness ed escursioni tra laghi, castelli e paesaggi delle Highlands.',['Passeggiare sul fiume Ness e le sue isole','Esplorare Loch Ness e Urquhart Castle','Conoscere la storia di Culloden','Camminare sui sentieri di Glen Affric']],
  pt:['Inverness e as Highlands','Inverness é uma base para passeios junto ao Ness e excursões a lagos, castelos e paisagens das Highlands.',['Passear junto ao rio Ness e às suas ilhas','Explorar Loch Ness e Urquhart Castle','Conhecer a história de Culloden','Caminhar pelos trilhos de Glen Affric']],
  ca:['Inverness i les Highlands','Inverness és una base per passejar pel Ness i fer excursions a llacs, castells i paisatges de les Highlands.',['Passejar pel riu Ness i les seves illes','Explorar Loch Ness i Urquhart Castle','Conèixer la història de Culloden','Caminar pels senders de Glen Affric']],
 }),
 destination({slug:'cardiff-south-wales',region:'WLS',stay:'3–4',airports:['CWL'],aliases:['Cardiff','Caerdydd'],note:'coast',bestMonths:[5,6,7,8,9]},{
  es:['Cardiff y el sur de Gales','Combina el castillo y las galerías de Cardiff con la bahía y excursiones por el patrimonio y la costa del sur de Gales.',['Visitar Cardiff Castle','Pasear por Cardiff Bay','Descubrir St Fagans National Museum of History','Explorar la península de Gower en una excursión']],
  en:['Cardiff and South Wales','Combine Cardiff’s castle and arcades with the bay and excursions through the heritage and coast of South Wales.',['Visit Cardiff Castle','Walk around Cardiff Bay','Discover St Fagans National Museum of History','Explore the Gower Peninsula on a day trip']],
  fr:['Cardiff et le sud du Pays de Galles','Associez château et galeries de Cardiff à la baie et aux excursions culturelles et côtières dans le sud du Pays de Galles.',['Visiter Cardiff Castle','Se promener à Cardiff Bay','Découvrir St Fagans National Museum of History','Explorer la péninsule de Gower en excursion']],
  de:['Cardiff und Südwales','Verbinde Cardiffs Burg und Einkaufspassagen mit der Bucht und Ausflügen zu Kultur und Küste in Südwales.',['Cardiff Castle besuchen','An der Cardiff Bay spazieren','St Fagans National Museum of History entdecken','Einen Ausflug zur Halbinsel Gower unternehmen']],
  it:['Cardiff e il Galles meridionale','Abbina castello e gallerie di Cardiff alla baia e a escursioni tra patrimonio e costa del Galles meridionale.',['Visitare Cardiff Castle','Passeggiare a Cardiff Bay','Scoprire St Fagans National Museum of History','Esplorare la penisola di Gower in escursione']],
  pt:['Cardiff e o sul de Gales','Combine castelo e galerias de Cardiff com a baía e excursões pelo património e costa do sul de Gales.',['Visitar Cardiff Castle','Passear por Cardiff Bay','Descobrir St Fagans National Museum of History','Explorar a península de Gower numa excursão']],
  ca:['Cardiff i el sud de Gal·les','Combina el castell i les galeries de Cardiff amb la badia i excursions pel patrimoni i la costa del sud de Gal·les.',['Visitar Cardiff Castle','Passejar per Cardiff Bay','Descobrir St Fagans National Museum of History','Explorar la península de Gower en una excursió']],
 }),
 destination({slug:'belfast-causeway-coast',region:'NIR',stay:'3–5',airports:['BFS','BHD'],aliases:['Belfast'],note:'coast',bestMonths:[5,6,7,8,9]},{
  es:['Belfast y la Costa de los Gigantes','El patrimonio naval y los barrios de Belfast se combinan con una excursión a los acantilados y columnas de basalto de la costa de Antrim.',['Visitar Titanic Belfast','Recorrer Cathedral Quarter','Explorar la Calzada del Gigante','Contemplar Dunluce Castle y la costa de Antrim']],
  en:['Belfast and the Causeway Coast','Belfast’s maritime heritage and neighbourhoods combine with a trip to the cliffs and basalt columns of the Antrim coast.',['Visit Titanic Belfast','Explore the Cathedral Quarter','Discover the Giant’s Causeway','See Dunluce Castle and the Antrim coast']],
  fr:['Belfast et la côte de la Chaussée des Géants','Patrimoine naval et quartiers de Belfast se combinent aux falaises et colonnes de basalte du littoral d’Antrim.',['Visiter Titanic Belfast','Explorer le Cathedral Quarter','Découvrir la Chaussée des Géants','Admirer Dunluce Castle et la côte d’Antrim']],
  de:['Belfast und die Causeway Coast','Belfasts maritimes Erbe und Viertel verbinden sich mit Ausflügen zu Klippen und Basaltsäulen an der Küste von Antrim.',['Titanic Belfast besuchen','Das Cathedral Quarter erkunden','Den Giant’s Causeway entdecken','Dunluce Castle und die Küste von Antrim sehen']],
  it:['Belfast e la Costa del Gigante','Patrimonio navale e quartieri di Belfast si abbinano a scogliere e colonne di basalto sulla costa di Antrim.',['Visitare Titanic Belfast','Esplorare il Cathedral Quarter','Scoprire il Selciato del Gigante','Ammirare Dunluce Castle e la costa di Antrim']],
  pt:['Belfast e a Costa dos Gigantes','O património naval e os bairros de Belfast combinam-se com falésias e colunas de basalto na costa de Antrim.',['Visitar Titanic Belfast','Explorar o Cathedral Quarter','Descobrir a Calçada dos Gigantes','Admirar Dunluce Castle e a costa de Antrim']],
  ca:['Belfast i la Costa dels Gegants','El patrimoni naval i els barris de Belfast es combinen amb penya-segats i columnes de basalt a la costa d’Antrim.',['Visitar Titanic Belfast','Recórrer el Cathedral Quarter','Descobrir la Calçada del Gegant','Contemplar Dunluce Castle i la costa d’Antrim']],
 }),
];
