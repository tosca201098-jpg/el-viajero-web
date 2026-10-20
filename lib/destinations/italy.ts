import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { italyImages } from './italy-images';

type TextRow = [name: string, description: string, recommendations: DestinationText['recommendations']];
const days: Record<Locale, string> = { es:'días', en:'days', fr:'jours', de:'Tage', it:'giorni', pt:'dias', ca:'dies' };
const notes: Record<'city' | 'coast' | 'venice' | 'etna', Record<Locale,string>> = {
  city: {
    es:'Primavera y principios de otoño son buenas épocas para pasear. Reserva los monumentos más solicitados y combina las visitas con los barrios y mercados. El verano suele ser caluroso y concurrido.',
    en:'Spring and early autumn are good times for walking. Book popular monuments ahead and explore neighbourhoods and markets between visits. Summer is often hot and busy.',
    fr:'Le printemps et le début de l’automne se prêtent aux promenades. Réservez les monuments très demandés et explorez quartiers et marchés. L’été est souvent chaud et fréquenté.',
    de:'Frühling und früher Herbst eignen sich zum Spazieren. Beliebte Sehenswürdigkeiten vorausbuchen und auch Viertel und Märkte erkunden. Der Sommer ist oft heiß und belebt.',
    it:'Primavera e inizio autunno sono adatti alle passeggiate. Prenota i monumenti più richiesti e dedica tempo a quartieri e mercati. L’estate è spesso calda e affollata.',
    pt:'A primavera e o início do outono favorecem os passeios. Reserve os monumentos mais procurados e explore bairros e mercados. O verão costuma ser quente e movimentado.',
    ca:'La primavera i l’inici de la tardor són bones èpoques per passejar. Reserva els monuments més sol·licitats i visita barris i mercats. L’estiu sol ser calorós i concorregut.',
  },
  coast: {
    es:'Finales de primavera y septiembre permiten combinar patrimonio y costa. Reserva tiempo para los traslados fuera de la ciudad. Julio y agosto suelen tener más calor y visitantes; la temporada de playa depende del tiempo.',
    en:'Late spring and September suit a mix of heritage and coast. Allow time for journeys outside the city. July and August are often hotter and busier; beach conditions depend on the weather.',
    fr:'La fin du printemps et septembre permettent de combiner patrimoine et littoral. Prévoyez du temps pour les déplacements hors de la ville. Juillet et août sont souvent plus chauds et fréquentés ; la plage dépend de la météo.',
    de:'Später Frühling und September eignen sich für Kultur und Küste. Für Ausflüge außerhalb der Stadt genügend Fahrzeit einplanen. Juli und August sind oft heißer und voller; Strandbedingungen hängen vom Wetter ab.',
    it:'La tarda primavera e settembre permettono di unire patrimonio e costa. Prevedi tempo per gli spostamenti fuori città. Luglio e agosto sono spesso più caldi e affollati; la spiaggia dipende dal meteo.',
    pt:'O final da primavera e setembro permitem combinar património e costa. Reserve tempo para deslocações fora da cidade. Julho e agosto costumam ser mais quentes e concorridos; a praia depende do tempo.',
    ca:'El final de la primavera i el setembre permeten combinar patrimoni i costa. Preveu temps per als desplaçaments fora de la ciutat. El juliol i l’agost solen ser més calorosos i concorreguts; la platja depèn del temps.',
  },
  venice: {
    es:'Primavera y otoño favorecen los paseos. Combina San Marco con Cannaregio y consulta las condiciones de acceso oficiales antes de viajar. Treviso es un aeropuerto de acceso con traslado terrestre, no está en la laguna.',
    en:'Spring and autumn suit walking. Combine San Marco with Cannaregio and check official access conditions before travelling. Treviso is an access airport requiring a ground transfer, outside the lagoon.',
    fr:'Le printemps et l’automne favorisent les promenades. Combinez San Marco et Cannaregio et vérifiez les conditions officielles d’accès. Trévise est un aéroport d’accès nécessitant un transfert terrestre, hors de la lagune.',
    de:'Frühling und Herbst eignen sich für Spaziergänge. San Marco mit Cannaregio verbinden und offizielle Zugangsbedingungen prüfen. Treviso liegt außerhalb der Lagune und erfordert einen Landtransfer.',
    it:'Primavera e autunno favoriscono le passeggiate. Abbina San Marco a Cannaregio e verifica le condizioni ufficiali di accesso prima del viaggio. Treviso è uno scalo di accesso con trasferimento terrestre, fuori dalla laguna.',
    pt:'A primavera e o outono favorecem os passeios. Combine San Marco com Cannaregio e consulte as condições oficiais de acesso. Treviso é um aeroporto de acesso com transporte terrestre, fora da lagoa.',
    ca:'La primavera i la tardor afavoreixen els passejos. Combina San Marco amb Cannaregio i consulta les condicions oficials d’accés. Treviso és un aeroport d’accés amb trasllat terrestre, fora de la llacuna.',
  },
  etna: {
    es:'Primavera y otoño permiten combinar ciudad y excursiones. Para el Etna comprueba los avisos oficiales, la meteorología y las condiciones de acceso; utiliza guías autorizados cuando corresponda. La actividad volcánica puede cambiar los planes.',
    en:'Spring and autumn suit city visits and excursions. For Etna, check official notices, weather and access conditions; use authorised guides where required. Volcanic activity can change plans.',
    fr:'Le printemps et l’automne permettent de combiner ville et excursions. Pour l’Etna, vérifiez les avis officiels, la météo et les accès ; faites appel aux guides autorisés si nécessaire. L’activité volcanique peut modifier les plans.',
    de:'Frühling und Herbst eignen sich für Stadt und Ausflüge. Für den Ätna offizielle Hinweise, Wetter und Zugangsbedingungen prüfen; bei Bedarf zugelassene Führungen nutzen. Vulkanische Aktivität kann Pläne verändern.',
    it:'Primavera e autunno permettono di unire città ed escursioni. Per l’Etna verifica avvisi ufficiali, meteo e condizioni di accesso; rivolgiti a guide autorizzate quando previsto. L’attività vulcanica può cambiare i programmi.',
    pt:'A primavera e o outono permitem combinar cidade e excursões. Para o Etna consulte avisos oficiais, meteorologia e acessos; recorra a guias autorizados quando necessário. A atividade vulcânica pode alterar os planos.',
    ca:'La primavera i la tardor permeten combinar ciutat i excursions. Per a l’Etna consulta els avisos oficials, la meteorologia i els accessos; utilitza guies autoritzats quan calgui. L’activitat volcànica pot canviar els plans.',
  },
};

type Seed = { slug: keyof typeof italyImages; airport: string; metro?: string; extraAirports?: string[];
  accessAirports?: DestinationProfile['accessAirports']; aliases?: string[]; stay: string; note?: keyof typeof notes; bestMonths?: number[] };
function destination(seed: Seed, rows: Record<Locale, TextRow>): DestinationProfile {
  const note = notes[seed.note ?? 'city'];
  const translations = Object.fromEntries(Object.entries(rows).map(([locale,[name,description,recommendations]]) =>
    [locale,{name,description,recommendations,recommendedStay:`${seed.stay} ${days[locale as Locale]}`,seasonalityNote:note[locale as Locale]}])) as Record<Locale,DestinationText>;
  const physical = [seed.airport,...(seed.extraAirports ?? [])];
  return {id:`it-${seed.slug}`,slug:seed.slug,countryCode:'IT',country:'Italia',
    ...italyImages[seed.slug],...translations.es,translations,
    airports:physical.map(iataCode=>({iataCode})),metropolitanCodes:seed.metro?[seed.metro]:[],
    iataCodes:[...(seed.metro?[seed.metro]:[]),...physical],accessAirports:seed.accessAirports,
    aliases:Array.from(new Set([...(seed.aliases??[]),...Object.values(translations).map(row=>row.name)])),
    bestMonths:seed.bestMonths??[4,5,6,9,10],lowSeasonMonths:[1,2,11],highSeasonMonths:[7,8],publication:{status:'draft'}};
}

/** Canonical tourist identities; editorial cards keep their original content and order. */
export const italyDestinations: DestinationProfile[] = [
  destination({slug:'rome',airport:'FCO',extraAirports:['CIA'],metro:'ROM',stay:'3–4'}, {
    es:['Roma','Plazas, ruinas antiguas y barrios llenos de vida para descubrir la Ciudad Eterna a pie.',['Coliseo y Foro Romano','Panteón','Fontana di Trevi','Trastevere']],
    en:['Rome','Squares, ancient ruins and lively neighbourhoods invite you to discover the Eternal City on foot.',['Colosseum and Roman Forum','Pantheon','Trevi Fountain','Trastevere']],
    fr:['Rome','Places, vestiges antiques et quartiers animés invitent à découvrir la Ville éternelle à pied.',['Colisée et Forum romain','Panthéon','Fontaine de Trevi','Trastevere']],
    de:['Rom','Plätze, antike Ruinen und lebendige Viertel laden dazu ein, die Ewige Stadt zu Fuß zu entdecken.',['Kolosseum und Forum Romanum','Pantheon','Trevi-Brunnen','Trastevere']],
    it:['Roma','Piazze, rovine antiche e quartieri vivaci invitano a scoprire la Città Eterna a piedi.',['Colosseo e Foro Romano','Pantheon','Fontana di Trevi','Trastevere']],
    pt:['Roma','Praças, ruínas antigas e bairros animados convidam a descobrir a Cidade Eterna a pé.',['Coliseu e Fórum Romano','Panteão','Fontana di Trevi','Trastevere']],
    ca:['Roma','Places, ruïnes antigues i barris plens de vida per descobrir la Ciutat Eterna a peu.',['Colosseu i Fòrum Romà','Panteó','Fontana di Trevi','Trastevere']],
  }),
  destination({slug:'milan',airport:'MXP',extraAirports:['LIN'],metro:'MIL',stay:'2–3',accessAirports:[{iataCode:'BGY',name:'Bergamo — Orio al Serio',countryCode:'IT'}]}, {
    es:['Milán','Arquitectura monumental, diseño y canales urbanos en una ciudad que combina historia y creatividad.',['Duomo de Milán','Galleria Vittorio Emanuele II','Castello Sforzesco','Navigli']],
    en:['Milan','Monumental architecture, design and urban canals in a city blending history with creativity.',['Milan Cathedral','Galleria Vittorio Emanuele II','Sforza Castle','Navigli']],
    fr:['Milan','Architecture monumentale, design et canaux urbains dans une ville mêlant histoire et créativité.',['Dôme de Milan','Galleria Vittorio Emanuele II','Château des Sforza','Navigli']],
    de:['Mailand','Monumentale Architektur, Design und städtische Kanäle verbinden Geschichte und Kreativität.',['Mailänder Dom','Galleria Vittorio Emanuele II','Castello Sforzesco','Navigli']],
    it:['Milano','Architettura monumentale, design e canali urbani in una città che unisce storia e creatività.',['Duomo di Milano','Galleria Vittorio Emanuele II','Castello Sforzesco','Navigli']],
    pt:['Milão','Arquitetura monumental, design e canais urbanos numa cidade que combina história e criatividade.',['Duomo de Milão','Galleria Vittorio Emanuele II','Castelo Sforzesco','Navigli']],
    ca:['Milà','Arquitectura monumental, disseny i canals urbans en una ciutat que combina història i creativitat.',['Duomo de Milà','Galleria Vittorio Emanuele II','Castell Sforzesco','Navigli']],
  }),
  destination({slug:'venice',airport:'VCE',stay:'2–3',note:'venice',bestMonths:[3,4,5,9,10],accessAirports:[{iataCode:'TSF',name:'Treviso — Antonio Canova',countryCode:'IT'}]}, {
    es:['Venecia','Canales, palacios y pequeños puentes para explorar la laguna más allá de sus plazas más famosas.',['Plaza de San Marcos','Palacio Ducal','Puente de Rialto','Cannaregio']],
    en:['Venice','Canals, palaces and small bridges lead through the lagoon beyond its most famous squares.',['St Mark’s Square','Doge’s Palace','Rialto Bridge','Cannaregio']],
    fr:['Venise','Canaux, palais et petits ponts invitent à explorer la lagune au-delà de ses places célèbres.',['Place Saint-Marc','Palais des Doges','Pont du Rialto','Cannaregio']],
    de:['Venedig','Kanäle, Paläste und kleine Brücken erschließen die Lagunenstadt jenseits ihrer bekanntesten Plätze.',['Markusplatz','Dogenpalast','Rialtobrücke','Cannaregio']],
    it:['Venezia','Canali, palazzi e piccoli ponti per esplorare la laguna oltre le piazze più famose.',['Piazza San Marco','Palazzo Ducale','Ponte di Rialto','Cannaregio']],
    pt:['Veneza','Canais, palácios e pequenas pontes para explorar a lagoa para lá das praças mais famosas.',['Praça de São Marcos','Palácio Ducal','Ponte de Rialto','Cannaregio']],
    ca:['Venècia','Canals, palaus i petits ponts per explorar la llacuna més enllà de les places més famoses.',['Plaça de Sant Marc','Palau Ducal','Pont de Rialto','Cannaregio']],
  }),
  destination({slug:'florence',airport:'FLR',stay:'2–3'}, {
    es:['Florencia','Arte renacentista, talleres y paseos junto al Arno entre cúpulas y miradores de la capital toscana.',['Catedral de Santa Maria del Fiore','Galería Uffizi','Ponte Vecchio','Piazzale Michelangelo']],
    en:['Florence','Renaissance art, workshops and riverside walks beneath the domes and viewpoints of Tuscany’s capital.',['Cathedral of Santa Maria del Fiore','Uffizi Gallery','Ponte Vecchio','Piazzale Michelangelo']],
    fr:['Florence','Art de la Renaissance, ateliers et promenades sur l’Arno entre coupoles et belvédères de la capitale toscane.',['Cathédrale Santa Maria del Fiore','Galerie des Offices','Ponte Vecchio','Piazzale Michelangelo']],
    de:['Florenz','Renaissancekunst, Werkstätten und Spaziergänge am Arno zwischen Kuppeln und Aussichtspunkten der toskanischen Hauptstadt.',['Kathedrale Santa Maria del Fiore','Uffizien','Ponte Vecchio','Piazzale Michelangelo']],
    it:['Firenze','Arte rinascimentale, botteghe e passeggiate sull’Arno tra cupole e belvederi del capoluogo toscano.',['Cattedrale di Santa Maria del Fiore','Galleria degli Uffizi','Ponte Vecchio','Piazzale Michelangelo']],
    pt:['Florença','Arte renascentista, oficinas e passeios junto ao Arno entre cúpulas e miradouros da capital toscana.',['Catedral de Santa Maria del Fiore','Galeria Uffizi','Ponte Vecchio','Piazzale Michelangelo']],
    ca:['Florència','Art renaixentista, tallers i passejades vora l’Arno entre cúpules i miradors de la capital toscana.',['Catedral de Santa Maria del Fiore','Galeria Uffizi','Ponte Vecchio','Piazzale Michelangelo']],
  }),
  destination({slug:'naples',airport:'NAP',stay:'3–4'}, {
    es:['Nápoles','Calles históricas, cocina popular y paseos junto al golfo en una ciudad de intensa vida mediterránea.',['Spaccanapoli','Museo Arqueológico Nacional','Piazza del Plebiscito','Castel dell’Ovo y paseo marítimo']],
    en:['Naples','Historic streets, traditional food and gulf-side walks in a city full of Mediterranean life.',['Spaccanapoli','National Archaeological Museum','Piazza del Plebiscito','Castel dell’Ovo and waterfront']],
    fr:['Naples','Rues historiques, cuisine populaire et promenades sur le golfe dans une ville méditerranéenne animée.',['Spaccanapoli','Musée archéologique national','Piazza del Plebiscito','Castel dell’Ovo et front de mer']],
    de:['Neapel','Historische Gassen, traditionelle Küche und Spaziergänge am Golf prägen das lebendige Mittelmeerleben.',['Spaccanapoli','Archäologisches Nationalmuseum','Piazza del Plebiscito','Castel dell’Ovo und Uferpromenade']],
    it:['Napoli','Strade storiche, cucina popolare e passeggiate sul golfo in una città dalla vivace anima mediterranea.',['Spaccanapoli','Museo Archeologico Nazionale','Piazza del Plebiscito','Castel dell’Ovo e lungomare']],
    pt:['Nápoles','Ruas históricas, cozinha tradicional e passeios junto ao golfo numa cidade de intensa vida mediterrânica.',['Spaccanapoli','Museu Arqueológico Nacional','Piazza del Plebiscito','Castel dell’Ovo e passeio marítimo']],
    ca:['Nàpols','Carrers històrics, cuina popular i passejos vora el golf en una ciutat de vida mediterrània intensa.',['Spaccanapoli','Museu Arqueològic Nacional','Piazza del Plebiscito','Castel dell’Ovo i passeig marítim']],
  }),
  destination({slug:'bologna',airport:'BLQ',stay:'2–3'}, {
    es:['Bolonia','Soportales, plazas medievales y sabores de Emilia-Romaña en una ciudad de tradición universitaria.',['Piazza Maggiore','Basílica de San Petronio','Archiginnasio','Pórticos de San Luca']],
    en:['Bologna','Porticoes, medieval squares and Emilia-Romagna flavours in a city with a long university tradition.',['Piazza Maggiore','Basilica of San Petronio','Archiginnasio','San Luca porticoes']],
    fr:['Bologne','Portiques, places médiévales et saveurs d’Émilie-Romagne dans une ville de tradition universitaire.',['Piazza Maggiore','Basilique San Petronio','Archiginnasio','Portiques de San Luca']],
    de:['Bologna','Arkaden, mittelalterliche Plätze und die Küche der Emilia-Romagna prägen diese traditionsreiche Universitätsstadt.',['Piazza Maggiore','Basilika San Petronio','Archiginnasio','Arkaden von San Luca']],
    it:['Bologna','Portici, piazze medievali e sapori emiliani in una città dalla lunga tradizione universitaria.',['Piazza Maggiore','Basilica di San Petronio','Archiginnasio','Portico di San Luca']],
    pt:['Bolonha','Pórticos, praças medievais e sabores da Emília-Romanha numa cidade de tradição universitária.',['Piazza Maggiore','Basílica de San Petronio','Archiginnasio','Pórticos de San Luca']],
    ca:['Bolonya','Porxos, places medievals i sabors d’Emília-Romanya en una ciutat de tradició universitària.',['Piazza Maggiore','Basílica de San Petronio','Archiginnasio','Porxos de San Luca']],
  }),
  destination({slug:'turin',airport:'TRN',stay:'2–3'}, {
    es:['Turín','Cafés históricos, palacios y museos a orillas del Po con los Alpes como horizonte.',['Museo Egizio','Mole Antonelliana','Piazza Castello','Parque del Valentino']],
    en:['Turin','Historic cafés, palaces and museums beside the Po, with the Alps on the horizon.',['Egyptian Museum','Mole Antonelliana','Piazza Castello','Valentino Park']],
    fr:['Turin','Cafés historiques, palais et musées au bord du Pô avec les Alpes à l’horizon.',['Musée égyptien','Mole Antonelliana','Piazza Castello','Parc du Valentino']],
    de:['Turin','Historische Cafés, Paläste und Museen am Po mit den Alpen am Horizont.',['Ägyptisches Museum','Mole Antonelliana','Piazza Castello','Parco del Valentino']],
    it:['Torino','Caffè storici, palazzi e musei lungo il Po con le Alpi all’orizzonte.',['Museo Egizio','Mole Antonelliana','Piazza Castello','Parco del Valentino']],
    pt:['Turim','Cafés históricos, palácios e museus junto ao Pó com os Alpes no horizonte.',['Museu Egípcio','Mole Antonelliana','Piazza Castello','Parque do Valentino']],
    ca:['Torí','Cafès històrics, palaus i museus a la vora del Po amb els Alps a l’horitzó.',['Museu Egipci','Mole Antonelliana','Piazza Castello','Parc del Valentino']],
  }),
  destination({slug:'verona-garda',airport:'VRN',stay:'3–4',aliases:['Verona','Vérone'],note:'city'}, {
    es:['Verona y Lago de Garda','Anfiteatro romano, plazas junto al Adigio y una escapada a los pueblos del lago de Garda.',['Arena de Verona','Piazza delle Erbe','Ponte Pietra','Sirmione en el lago de Garda']],
    en:['Verona and Lake Garda','A Roman amphitheatre, squares beside the Adige and a side trip to Lake Garda’s towns.',['Verona Arena','Piazza delle Erbe','Ponte Pietra','Sirmione on Lake Garda']],
    fr:['Vérone et lac de Garde','Amphithéâtre romain, places au bord de l’Adige et escapade vers les villages du lac de Garde.',['Arènes de Vérone','Piazza delle Erbe','Ponte Pietra','Sirmione sur le lac de Garde']],
    de:['Verona und Gardasee','Römisches Amphitheater, Plätze an der Etsch und ein Ausflug zu den Orten am Gardasee.',['Arena von Verona','Piazza delle Erbe','Ponte Pietra','Sirmione am Gardasee']],
    it:['Verona e Lago di Garda','Anfiteatro romano, piazze sull’Adige e una gita nei borghi del Lago di Garda.',['Arena di Verona','Piazza delle Erbe','Ponte Pietra','Sirmione sul Lago di Garda']],
    pt:['Verona e Lago de Garda','Anfiteatro romano, praças junto ao Ádige e uma escapadinha às localidades do Lago de Garda.',['Arena de Verona','Piazza delle Erbe','Ponte Pietra','Sirmione no Lago de Garda']],
    ca:['Verona i llac de Garda','Amfiteatre romà, places vora l’Adige i una escapada als pobles del llac de Garda.',['Arena de Verona','Piazza delle Erbe','Ponte Pietra','Sirmione al llac de Garda']],
  }),
  destination({slug:'pisa-tuscany',airport:'PSA',stay:'3–5',aliases:['Pisa','Pise'],note:'city'}, {
    es:['Pisa y Toscana','Monumentos de mármol, paseos junto al Arno y excursiones por la Toscana desde una base en Pisa.',['Piazza dei Miracoli','Torre inclinada de Pisa','Catedral de Pisa','Murallas de Lucca']],
    en:['Pisa and Tuscany','Marble monuments, Arno riverside walks and Tuscan day trips from a base in Pisa.',['Piazza dei Miracoli','Leaning Tower of Pisa','Pisa Cathedral','Lucca city walls']],
    fr:['Pise et Toscane','Monuments de marbre, promenades sur l’Arno et excursions toscanes depuis Pise.',['Piazza dei Miracoli','Tour penchée de Pise','Cathédrale de Pise','Remparts de Lucques']],
    de:['Pisa und Toskana','Marmormonumente, Spaziergänge am Arno und Ausflüge durch die Toskana mit Ausgangspunkt Pisa.',['Piazza dei Miracoli','Schiefer Turm von Pisa','Dom von Pisa','Stadtmauer von Lucca']],
    it:['Pisa e Toscana','Monumenti di marmo, passeggiate sull’Arno ed escursioni in Toscana con base a Pisa.',['Piazza dei Miracoli','Torre pendente di Pisa','Duomo di Pisa','Mura di Lucca']],
    pt:['Pisa e Toscana','Monumentos de mármore, passeios junto ao Arno e excursões pela Toscana com base em Pisa.',['Piazza dei Miracoli','Torre inclinada de Pisa','Catedral de Pisa','Muralhas de Lucca']],
    ca:['Pisa i Toscana','Monuments de marbre, passejos vora l’Arno i excursions per la Toscana des d’una base a Pisa.',['Piazza dei Miracoli','Torre inclinada de Pisa','Catedral de Pisa','Muralles de Lucca']],
  }),
  destination({slug:'palermo',airport:'PMO',stay:'3–4',note:'coast'}, {
    es:['Palermo','Mercados, palacios y herencia árabe-normanda en una capital siciliana abierta al Mediterráneo.',['Catedral de Palermo','Palacio de los Normandos y Capilla Palatina','Mercado de Ballarò','Teatro Massimo']],
    en:['Palermo','Markets, palaces and Arab-Norman heritage in Sicily’s Mediterranean-facing capital.',['Palermo Cathedral','Norman Palace and Palatine Chapel','Ballarò Market','Teatro Massimo']],
    fr:['Palerme','Marchés, palais et patrimoine arabo-normand dans la capitale sicilienne ouverte sur la Méditerranée.',['Cathédrale de Palerme','Palais des Normands et chapelle Palatine','Marché de Ballarò','Teatro Massimo']],
    de:['Palermo','Märkte, Paläste und arabisch-normannisches Erbe in Siziliens Hauptstadt am Mittelmeer.',['Kathedrale von Palermo','Normannenpalast und Cappella Palatina','Markt Ballarò','Teatro Massimo']],
    it:['Palermo','Mercati, palazzi e patrimonio arabo-normanno nel capoluogo siciliano affacciato sul Mediterraneo.',['Cattedrale di Palermo','Palazzo dei Normanni e Cappella Palatina','Mercato di Ballarò','Teatro Massimo']],
    pt:['Palermo','Mercados, palácios e património árabe-normando na capital siciliana aberta ao Mediterrâneo.',['Catedral de Palermo','Palácio dos Normandos e Capela Palatina','Mercado de Ballarò','Teatro Massimo']],
    ca:['Palerm','Mercats, palaus i patrimoni arabonormand en una capital siciliana oberta a la Mediterrània.',['Catedral de Palerm','Palau dels Normands i Capella Palatina','Mercat de Ballarò','Teatro Massimo']],
  }),
  destination({slug:'catania-etna',airport:'CTA',stay:'3–4',aliases:['Catania','Catane','Catânia','Catània'],note:'etna'}, {
    es:['Catania y el Etna','Piedra volcánica, mercados y arquitectura barroca como punto de partida para conocer el paisaje del Etna.',['Piazza del Duomo','Mercado de la Pescheria','Via Etnea','Parque del Etna']],
    en:['Catania and Etna','Volcanic stone, markets and Baroque architecture provide a base for exploring Etna’s landscape.',['Piazza del Duomo','Pescheria fish market','Via Etnea','Etna Park']],
    fr:['Catane et l’Etna','Pierre volcanique, marchés et architecture baroque pour découvrir les paysages de l’Etna.',['Piazza del Duomo','Marché de la Pescheria','Via Etnea','Parc de l’Etna']],
    de:['Catania und Ätna','Vulkangestein, Märkte und Barockarchitektur als Ausgangspunkt für die Landschaften des Ätna.',['Piazza del Duomo','Fischmarkt Pescheria','Via Etnea','Ätna-Park']],
    it:['Catania e l’Etna','Pietra lavica, mercati e architettura barocca come punto di partenza per conoscere il paesaggio etneo.',['Piazza del Duomo','Mercato della Pescheria','Via Etnea','Parco dell’Etna']],
    pt:['Catânia e Etna','Pedra vulcânica, mercados e arquitetura barroca como base para conhecer a paisagem do Etna.',['Piazza del Duomo','Mercado da Pescheria','Via Etnea','Parque do Etna']],
    ca:['Catània i l’Etna','Pedra volcànica, mercats i arquitectura barroca com a punt de partida per conèixer el paisatge de l’Etna.',['Piazza del Duomo','Mercat de la Pescheria','Via Etnea','Parc de l’Etna']],
  }),
  destination({slug:'cagliari-south-sardinia',airport:'CAG',stay:'3–5',aliases:['Cagliari','Càller'],note:'coast',bestMonths:[5,6,9,10]}, {
    es:['Cagliari y sur de Cerdeña','Miradores de Castello, lagunas y playas para combinar vida urbana y costa en el sur de Cerdeña.',['Barrio de Castello','Bastione di Saint Remy','Playa del Poetto','Parque de Molentargius']],
    en:['Cagliari and southern Sardinia','Castello viewpoints, lagoons and beaches combine city life with the coast in southern Sardinia.',['Castello district','Bastione di Saint Remy','Poetto Beach','Molentargius Park']],
    fr:['Cagliari et sud de la Sardaigne','Belvédères de Castello, lagunes et plages pour combiner ville et littoral dans le sud de la Sardaigne.',['Quartier de Castello','Bastione di Saint Remy','Plage du Poetto','Parc de Molentargius']],
    de:['Cagliari und Südsardinien','Aussichtspunkte in Castello, Lagunen und Strände verbinden Stadtleben und Küste in Südsardinien.',['Viertel Castello','Bastione di Saint Remy','Strand Poetto','Park Molentargius']],
    it:['Cagliari e sud Sardegna','Belvederi di Castello, lagune e spiagge per unire vita urbana e costa nel sud della Sardegna.',['Quartiere Castello','Bastione di Saint Remy','Spiaggia del Poetto','Parco di Molentargius']],
    pt:['Cagliari e sul da Sardenha','Miradouros de Castello, lagoas e praias para combinar cidade e costa no sul da Sardenha.',['Bairro de Castello','Bastione di Saint Remy','Praia do Poetto','Parque de Molentargius']],
    ca:['Càller i sud de Sardenya','Miradors de Castello, llacunes i platges per combinar vida urbana i costa al sud de Sardenya.',['Barri de Castello','Bastione di Saint Remy','Platja del Poetto','Parc de Molentargius']],
  }),
];
