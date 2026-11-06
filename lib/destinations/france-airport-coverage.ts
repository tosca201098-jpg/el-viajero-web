import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { franceAirportImages } from './france-airport-images';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
type Seed = {
  slug: string; code: string; airport: string; aliases: string[]; names: Seven;
  descriptions: Seven; recommendations: [Seven, Seven, Seven, Seven]; notes: Seven;
  stay: string; best: number[]; low: number[];
};
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, i) => [locale, values[i]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const check = localize([
  'Comprueba vuelos, traslados y horarios para tus fechas; algunas conexiones son estacionales. Los meses recomendados son orientativos y no garantizan buen tiempo ni precios bajos.',
  'Check flights, transfers and opening times for your dates; some services are seasonal. Suggested months are guidance and do not guarantee good weather or low prices.',
  'Vérifiez vols, transferts et horaires pour vos dates ; certaines liaisons sont saisonnières. Les mois conseillés sont indicatifs et ne garantissent ni beau temps ni prix bas.',
  'Flüge, Transfers und Öffnungszeiten für die Reisedaten prüfen; manche Verbindungen sind saisonal. Die empfohlenen Monate garantieren weder gutes Wetter noch niedrige Preise.',
  'Verifica voli, trasferimenti e orari per le tue date; alcuni collegamenti sono stagionali. I mesi consigliati sono indicativi e non garantiscono bel tempo o prezzi bassi.',
  'Confirme voos, transportes e horários para as suas datas; algumas ligações são sazonais. Os meses sugeridos são indicativos e não garantem bom tempo nem preços baixos.',
  'Comprova vols, trasllats i horaris per a les teves dates; algunes connexions són estacionals. Els mesos recomanats són orientatius i no garanteixen bon temps ni preus baixos.',
]);

// One tourist profile per served city, not one card per airport or terminal.
const seeds: Seed[] = [
  { slug: 'montpellier', code: 'MPL', airport: 'Montpellier Méditerranée', aliases: ['Montpeller', 'Montpellier-Méditerranée', 'Montpellier Mediterranee Airport', 'Montpellier Fréjorgues', 'Frejorgues'],
    names: ['Montpellier','Montpellier','Montpellier','Montpellier','Montpellier','Montpellier','Montpeller'], stay: '2–3', best: [4,5,6,9,10], low: [1,2,11],
    descriptions: [
      'Calles medievales, plazas animadas y jardines para descubrir Montpellier entre el patrimonio del Écusson y el arte del Museo Fabre.',
      'Medieval lanes, lively squares and gardens introduce Montpellier through the Écusson quarter and the art of the Musée Fabre.',
      'Ruelles médiévales, places animées et jardins pour découvrir Montpellier entre le patrimoine de l’Écusson et les collections du musée Fabre.',
      'Mittelalterliche Gassen, lebendige Plätze und Gärten erschließen Montpellier zwischen dem Écusson-Viertel und der Kunst im Musée Fabre.',
      'Vicoli medievali, piazze vivaci e giardini per scoprire Montpellier tra il patrimonio dell’Écusson e le opere del Musée Fabre.',
      'Ruelas medievais, praças animadas e jardins para descobrir Montpellier entre o património do Écusson e a arte do Musée Fabre.',
      'Carrers medievals, places animades i jardins per descobrir Montpeller entre el patrimoni de l’Écusson i l’art del Museu Fabre.',
    ], recommendations: [
      ['Pasear por la Comédie y el Écusson','Walk through Place de la Comédie and the Écusson','Flâner de la Comédie à l’Écusson','Place de la Comédie und Écusson erkunden','Passeggiare dalla Comédie all’Écusson','Passear pela Comédie e pelo Écusson','Passejar per la Comédie i l’Écusson'],
      ['Visitar el Museo Fabre','Visit the Musée Fabre','Visiter le musée Fabre','Das Musée Fabre besuchen','Visitare il Musée Fabre','Visitar o Musée Fabre','Visitar el Museu Fabre'],
      ['Recorrer el paseo del Peyrou','Explore the Promenade du Peyrou','Parcourir la promenade du Peyrou','Über die Promenade du Peyrou spazieren','Percorrere la promenade du Peyrou','Percorrer o passeio do Peyrou','Recórrer el passeig del Peyrou'],
      ['Conocer el Jardin des Plantes','Discover the Jardin des Plantes','Découvrir le Jardin des Plantes','Den Jardin des Plantes entdecken','Scoprire il Jardin des Plantes','Conhecer o Jardin des Plantes','Conèixer el Jardin des Plantes'],
    ], notes: [
      'MPL está en Mauguio, fuera del centro de Montpellier. Prevé el traslado terrestre y evita las horas de más calor en verano.',
      'MPL is in Mauguio, outside central Montpellier. Allow for a ground transfer and avoid the hottest hours in summer.',
      'MPL est situé à Mauguio, hors du centre de Montpellier. Prévoyez le transfert terrestre et évitez les heures les plus chaudes en été.',
      'MPL liegt in Mauguio außerhalb des Zentrums von Montpellier. Den Landtransfer einplanen und im Sommer die heißesten Stunden meiden.',
      'MPL si trova a Mauguio, fuori dal centro di Montpellier. Prevedi il trasferimento via terra ed evita le ore più calde in estate.',
      'MPL fica em Mauguio, fora do centro de Montpellier. Preveja o transporte terrestre e evite as horas mais quentes no verão.',
      'MPL és a Mauguio, fora del centre de Montpeller. Preveu el trasllat terrestre i evita les hores de més calor a l’estiu.',
    ] },
  { slug: 'ajaccio', code: 'AJA', airport: 'Ajaccio Napoléon Bonaparte', aliases: ['Aiaccio', 'Aiacciu', 'Campo dell’Oro', "Campo dell'Oro", 'Ajaccio Napoleon Bonaparte Airport'],
    names: ['Ajaccio','Ajaccio','Ajaccio','Ajaccio','Aiaccio','Ajaccio','Ajaccio'], stay: '3–4', best: [5,6,9], low: [1,2,11,12],
    descriptions: [
      'El casco antiguo, los museos y el frente marítimo presentan Ajaccio, una base urbana para descubrir el golfo y el patrimonio de Córcega.',
      'The old town, museums and seafront introduce Ajaccio, an urban base for exploring its gulf and Corsica’s heritage.',
      'La vieille ville, les musées et le front de mer présentent Ajaccio, point de départ urbain pour découvrir son golfe et le patrimoine corse.',
      'Altstadt, Museen und Uferpromenade prägen Ajaccio, einen städtischen Ausgangspunkt für den Golf und das Kulturerbe Korsikas.',
      'Centro storico, musei e lungomare presentano Aiaccio, base urbana per scoprire il golfo e il patrimonio della Corsica.',
      'O centro histórico, os museus e a frente marítima apresentam Ajaccio, uma base urbana para descobrir o golfo e o património da Córsega.',
      'El nucli antic, els museus i el passeig marítim presenten Ajaccio, una base urbana per descobrir el golf i el patrimoni de Còrsega.',
    ], recommendations: [
      ['Visitar el Palais Fesch','Visit the Palais Fesch','Visiter le Palais Fesch','Das Palais Fesch besuchen','Visitare il Palais Fesch','Visitar o Palais Fesch','Visitar el Palais Fesch'],
      ['Conocer la Maison Bonaparte','Discover the Maison Bonaparte','Découvrir la Maison Bonaparte','Die Maison Bonaparte entdecken','Scoprire la Maison Bonaparte','Conhecer a Maison Bonaparte','Conèixer la Maison Bonaparte'],
      ['Pasear por el casco antiguo y la plaza Foch','Explore the old town and Place Foch','Flâner dans la vieille ville et place Foch','Altstadt und Place Foch erkunden','Passeggiare nel centro storico e in place Foch','Passear pelo centro histórico e pela Place Foch','Passejar pel nucli antic i la plaça Foch'],
      ['Recorrer el frente marítimo de la ciudadela','Walk along the citadel seafront','Parcourir le front de mer de la citadelle','An der Zitadelle am Meer spazieren','Percorrere il lungomare della cittadella','Percorrer a frente marítima da cidadela','Recórrer el passeig marítim de la ciutadella'],
    ], notes: [
      'AJA está al este del centro de Ajaccio, en Campo dell’Oro. Organiza el traslado hasta tu alojamiento; recorrer otros puntos de Córcega requiere tiempo por carretera.',
      'AJA is east of central Ajaccio, at Campo dell’Oro. Plan transport to your accommodation; allow time for road journeys elsewhere in Corsica.',
      'AJA se trouve à l’est du centre d’Ajaccio, à Campo dell’Oro. Organisez le transfert vers votre hébergement et prévoyez du temps pour les trajets routiers en Corse.',
      'AJA liegt östlich der Innenstadt von Ajaccio in Campo dell’Oro. Den Transfer zur Unterkunft planen; Fahrten zu anderen Orten Korsikas benötigen Zeit.',
      'AJA si trova a est del centro di Aiaccio, a Campo dell’Oro. Organizza il trasferimento all’alloggio; per esplorare la Corsica occorre tempo su strada.',
      'AJA fica a leste do centro de Ajaccio, em Campo dell’Oro. Organize o transporte até ao alojamento; reserve tempo para deslocações por estrada na Córsega.',
      'AJA és a l’est del centre d’Ajaccio, a Campo dell’Oro. Organitza el trasllat a l’allotjament; recórrer altres indrets de Còrsega requereix temps per carretera.',
    ] },
  { slug: 'bastia', code: 'BIA', airport: 'Bastia Poretta', aliases: ['Bastia-Poretta', 'Bastia Poretta Airport', 'Bastia Poreta'],
    names: ['Bastia','Bastia','Bastia','Bastia','Bastia','Bastia','Bastia'], stay: '2–3', best: [5,6,9], low: [1,2,11,12],
    descriptions: [
      'El Vieux-Port, la ciudadela y sus jardines revelan la historia marítima de Bastia, puerta de entrada al noreste de Córcega.',
      'The Vieux-Port, citadel and gardens reveal Bastia’s maritime history at the gateway to northeastern Corsica.',
      'Le Vieux-Port, la citadelle et ses jardins révèlent l’histoire maritime de Bastia, porte d’entrée du nord-est de la Corse.',
      'Vieux-Port, Zitadelle und Gärten erzählen die Seefahrtsgeschichte Bastias am Zugang zum Nordosten Korsikas.',
      'Il Vieux-Port, la cittadella e i giardini raccontano la storia marittima di Bastia, porta della Corsica nordorientale.',
      'O Vieux-Port, a cidadela e os jardins revelam a história marítima de Bastia, porta de entrada do nordeste da Córsega.',
      'El Vieux-Port, la ciutadella i els jardins revelen la història marítima de Bastia, porta d’entrada al nord-est de Còrsega.',
    ], recommendations: [
      ['Pasear por el Vieux-Port','Walk around the Vieux-Port','Flâner sur le Vieux-Port','Am Vieux-Port spazieren','Passeggiare nel Vieux-Port','Passear pelo Vieux-Port','Passejar pel Vieux-Port'],
      ['Recorrer la ciudadela','Explore the citadel','Parcourir la citadelle','Die Zitadelle erkunden','Esplorare la cittadella','Percorrer a cidadela','Recórrer la ciutadella'],
      ['Visitar el Museo de Bastia en el palacio de los Gobernadores','Visit Bastia Museum in the Governors’ Palace','Visiter le musée de Bastia au palais des Gouverneurs','Das Museum von Bastia im Gouverneurspalast besuchen','Visitare il museo di Bastia nel palazzo dei Governatori','Visitar o Museu de Bastia no Palácio dos Governadores','Visitar el Museu de Bastia al palau dels Governadors'],
      ['Descubrir el jardín Romieu','Discover the Romieu garden','Découvrir le jardin Romieu','Den Jardin Romieu entdecken','Scoprire il giardino Romieu','Conhecer o jardim Romieu','Descobrir el jardí Romieu'],
    ], notes: [
      'BIA está en Lucciana, al sur de Bastia, y requiere traslado terrestre. La ciudadela tiene cuestas y escaleras; adapta el recorrido a tus necesidades.',
      'BIA is in Lucciana, south of Bastia, and requires a ground transfer. The citadel has slopes and steps; adapt the route to your needs.',
      'BIA est situé à Lucciana, au sud de Bastia, et nécessite un transfert terrestre. La citadelle comporte pentes et escaliers ; adaptez votre parcours.',
      'BIA liegt in Lucciana südlich von Bastia und erfordert einen Landtransfer. In der Zitadelle gibt es Steigungen und Treppen; den Rundgang entsprechend planen.',
      'BIA si trova a Lucciana, a sud di Bastia, e richiede un trasferimento via terra. La cittadella presenta salite e scale; adatta il percorso alle tue esigenze.',
      'BIA fica em Lucciana, a sul de Bastia, e exige transporte terrestre. A cidadela tem subidas e escadas; adapte o percurso às suas necessidades.',
      'BIA és a Lucciana, al sud de Bastia, i requereix trasllat terrestre. La ciutadella té pendents i escales; adapta el recorregut a les teves necessitats.',
    ] },
  { slug: 'biarritz', code: 'BIQ', airport: 'Biarritz Pays Basque', aliases: ['Biarritz-Anglet-Bayonne', 'Biarritz Anglet Bayonne Airport', 'Biarritz - Anglet - Bayonne Airport'],
    names: ['Biarritz','Biarritz','Biarritz','Biarritz','Biarritz','Biarritz','Biarritz'], stay: '2–3', best: [5,6,9], low: [1,2,11,12],
    descriptions: [
      'Paseos frente al Atlántico, patrimonio balneario y un pequeño puerto pesquero para descubrir Biarritz en la costa vasca francesa.',
      'Atlantic promenades, seaside heritage and a small fishing harbour introduce Biarritz on the French Basque coast.',
      'Promenades atlantiques, patrimoine balnéaire et petit port de pêche pour découvrir Biarritz sur la côte basque.',
      'Atlantikpromenaden, Seebadgeschichte und ein kleiner Fischerhafen prägen Biarritz an der französischen Baskenküste.',
      'Passeggiate sull’Atlantico, patrimonio balneare e un piccolo porto di pescatori per scoprire Biarritz sulla costa basca francese.',
      'Passeios junto ao Atlântico, património balnear e um pequeno porto de pesca para descobrir Biarritz na costa basca francesa.',
      'Passejades vora l’Atlàntic, patrimoni balneari i un petit port pesquer per descobrir Biarritz a la costa basca francesa.',
    ], recommendations: [
      ['Pasear junto a la Grande Plage','Walk along the Grande Plage','Flâner le long de la Grande Plage','An der Grande Plage spazieren','Passeggiare lungo la Grande Plage','Passear junto à Grande Plage','Passejar vora la Grande Plage'],
      ['Contemplar el Rocher de la Vierge','See the Rocher de la Vierge','Admirer le Rocher de la Vierge','Den Rocher de la Vierge betrachten','Ammirare il Rocher de la Vierge','Contemplar o Rocher de la Vierge','Contemplar el Rocher de la Vierge'],
      ['Conocer el Port des Pêcheurs','Explore the Port des Pêcheurs','Découvrir le Port des Pêcheurs','Den Port des Pêcheurs erkunden','Scoprire il Port des Pêcheurs','Conhecer o Port des Pêcheurs','Conèixer el Port des Pêcheurs'],
      ['Llegar al faro y sus miradores','Visit the lighthouse surroundings and viewpoints','Rejoindre le phare et ses points de vue','Die Aussichtspunkte am Leuchtturm besuchen','Raggiungere il faro e i suoi belvedere','Visitar o farol e os seus miradouros','Arribar al far i als seus miradors'],
    ], notes: [
      'BIQ ocupa terrenos de Anglet y Biarritz, fuera del centro turístico. Prevé el traslado y respeta los cierres de paseos y las indicaciones de seguridad del mar.',
      'BIQ spans parts of Anglet and Biarritz, outside the tourist centre. Plan a transfer and respect promenade closures and sea safety notices.',
      'BIQ s’étend sur Anglet et Biarritz, hors du centre touristique. Prévoyez le transfert et respectez les fermetures de promenades et les consignes en bord de mer.',
      'BIQ liegt auf Flächen von Anglet und Biarritz außerhalb des touristischen Zentrums. Transfer planen sowie Sperrungen und Sicherheitshinweise am Meer beachten.',
      'BIQ occupa terreni di Anglet e Biarritz, fuori dal centro turistico. Prevedi il trasferimento e rispetta chiusure delle passeggiate e indicazioni di sicurezza sul mare.',
      'BIQ ocupa terrenos de Anglet e Biarritz, fora do centro turístico. Preveja o transporte e respeite os encerramentos de passeios e os avisos de segurança do mar.',
      'BIQ ocupa terrenys d’Anglet i Biarritz, fora del centre turístic. Preveu el trasllat i respecta els tancaments de passeigs i els avisos de seguretat del mar.',
    ] },
  { slug: 'figari', code: 'FSC', airport: 'Figari Sud Corse', aliases: ['Figari-Sud-Corse', 'Sud Corse Airport', 'Figari Sud Corse Airport'],
    names: ['Figari','Figari','Figari','Figari','Figari','Figari','Figari'], stay: '3–4', best: [5,6,9], low: [1,2,11,12],
    descriptions: [
      'Pueblos y paisajes de la llanura de Figari ofrecen una base rural en el sur de Córcega, con excursiones a la costa y a Bonifacio.',
      'Villages and the landscapes of the Figari plain offer a rural base in southern Corsica, with trips to the coast and Bonifacio.',
      'Villages et paysages de la plaine de Figari offrent une base rurale dans le sud de la Corse, avec des excursions vers le littoral et Bonifacio.',
      'Dörfer und Landschaften der Ebene von Figari bieten einen ländlichen Ausgangspunkt im Süden Korsikas für Ausflüge an die Küste und nach Bonifacio.',
      'Paesi e paesaggi della piana di Figari offrono una base rurale nel sud della Corsica, con escursioni sulla costa e a Bonifacio.',
      'Aldeias e paisagens da planície de Figari oferecem uma base rural no sul da Córsega, com passeios à costa e a Bonifacio.',
      'Pobles i paisatges de la plana de Figari ofereixen una base rural al sud de Còrsega, amb excursions a la costa i a Bonifacio.',
    ], recommendations: [
      ['Pasear por el pueblo de Figari','Walk through Figari village','Flâner dans le village de Figari','Das Dorf Figari erkunden','Passeggiare nel paese di Figari','Passear pela aldeia de Figari','Passejar pel poble de Figari'],
      ['Conocer Pianottoli-Caldarello en una excursión','Visit Pianottoli-Caldarello on a day trip','Découvrir Pianottoli-Caldarello en excursion','Einen Ausflug nach Pianottoli-Caldarello machen','Visitare Pianottoli-Caldarello con un’escursione','Conhecer Pianottoli-Caldarello numa excursão','Conèixer Pianottoli-Caldarello en una excursió'],
      ['Explorar el entorno litoral de Ventilègne','Explore the Ventilègne coastal landscape','Explorer les paysages du littoral de Ventilègne','Die Küstenlandschaft von Ventilègne erkunden','Esplorare il paesaggio costiero di Ventilègne','Explorar a paisagem costeira de Ventilègne','Explorar l’entorn litoral de Ventilègne'],
      ['Visitar Bonifacio con traslado por carretera','Visit Bonifacio with a road transfer','Visiter Bonifacio en prévoyant le trajet routier','Bonifacio mit eingeplanter Straßenfahrt besuchen','Visitare Bonifacio prevedendo il tragitto su strada','Visitar Bonifacio com transporte por estrada','Visitar Bonifacio amb trasllat per carretera'],
    ], notes: [
      'FSC está separado del pueblo de Figari; organiza el traslado al alojamiento. Pianottoli-Caldarello, Ventilègne y Bonifacio son excursiones fuera del pueblo; respeta los espacios naturales protegidos.',
      'FSC is separate from Figari village; arrange transport to your accommodation. Pianottoli-Caldarello, Ventilègne and Bonifacio are trips beyond the village; respect protected natural areas.',
      'FSC est distinct du village de Figari ; organisez le transfert vers votre hébergement. Pianottoli-Caldarello, Ventilègne et Bonifacio sont des excursions hors du village ; respectez les espaces naturels protégés.',
      'FSC liegt außerhalb des Dorfes Figari; den Transfer zur Unterkunft organisieren. Pianottoli-Caldarello, Ventilègne und Bonifacio sind Ausflugsziele außerhalb des Dorfes; Naturschutzgebiete respektieren.',
      'FSC è separato dal paese di Figari; organizza il trasferimento all’alloggio. Pianottoli-Caldarello, Ventilègne e Bonifacio sono escursioni fuori paese; rispetta le aree naturali protette.',
      'FSC fica separado da aldeia de Figari; organize o transporte até ao alojamento. Pianottoli-Caldarello, Ventilègne e Bonifacio são passeios fora da aldeia; respeite as áreas naturais protegidas.',
      'FSC és separat del poble de Figari; organitza el trasllat a l’allotjament. Pianottoli-Caldarello, Ventilègne i Bonifacio són excursions fora del poble; respecta els espais naturals protegits.',
    ] },
  { slug: 'brest', code: 'BES', airport: 'Brest Bretagne', aliases: ['Brest Bretagne Airport', 'Brest-Guipavas', 'Brest Bretaña', 'Brest Brittany'],
    names: ['Brest','Brest','Brest','Brest','Brest','Brest','Brest'], stay: '2–3', best: [5,6,7,8,9], low: [1,2,11],
    descriptions: [
      'El castillo, las orillas de la Penfeld y los Ateliers des Capucins cuentan la historia marítima de Brest en el extremo occidental de Bretaña.',
      'The castle, Penfeld waterfront and Ateliers des Capucins tell Brest’s maritime story at the western edge of Brittany.',
      'Le château, les rives de la Penfeld et les Ateliers des Capucins racontent l’histoire maritime de Brest à la pointe de la Bretagne.',
      'Burg, Penfeld-Ufer und Ateliers des Capucins erzählen die maritime Geschichte von Brest im Westen der Bretagne.',
      'Il castello, le rive della Penfeld e gli Ateliers des Capucins raccontano la storia marittima di Brest nell’ovest della Bretagna.',
      'O castelo, as margens da Penfeld e os Ateliers des Capucins contam a história marítima de Brest no extremo ocidental da Bretanha.',
      'El castell, les ribes de la Penfeld i els Ateliers des Capucins expliquen la història marítima de Brest a l’extrem occidental de Bretanya.',
    ], recommendations: [
      ['Visitar el castillo y el Museo Nacional de la Marina','Visit the castle and National Maritime Museum','Visiter le château et le musée national de la Marine','Burg und Nationales Marinemuseum besuchen','Visitare il castello e il Museo nazionale della Marina','Visitar o castelo e o Museu Nacional da Marinha','Visitar el castell i el Museu Nacional de la Marina'],
      ['Descubrir los Ateliers des Capucins','Discover the Ateliers des Capucins','Découvrir les Ateliers des Capucins','Die Ateliers des Capucins entdecken','Scoprire gli Ateliers des Capucins','Conhecer os Ateliers des Capucins','Descobrir els Ateliers des Capucins'],
      ['Conocer la Tour Tanguy','Explore the Tour Tanguy','Visiter la Tour Tanguy','Die Tour Tanguy erkunden','Visitare la Tour Tanguy','Conhecer a Tour Tanguy','Conèixer la Tour Tanguy'],
      ['Pasear por el jardín de los Exploradores','Walk through the Jardin des Explorateurs','Flâner au jardin des Explorateurs','Durch den Jardin des Explorateurs spazieren','Passeggiare nel Jardin des Explorateurs','Passear pelo Jardin des Explorateurs','Passejar pel jardí dels Exploradors'],
    ], notes: [
      'BES está en Guipavas, fuera de Brest. Prevé el traslado terrestre y ropa para lluvia y viento, también en verano.',
      'BES is in Guipavas, outside Brest. Allow for a ground transfer and bring clothing for rain and wind, even in summer.',
      'BES se trouve à Guipavas, hors de Brest. Prévoyez le transfert terrestre et des vêtements contre pluie et vent, même en été.',
      'BES liegt in Guipavas außerhalb von Brest. Landtransfer und Kleidung für Regen und Wind auch im Sommer einplanen.',
      'BES si trova a Guipavas, fuori Brest. Prevedi il trasferimento via terra e abbigliamento per pioggia e vento anche in estate.',
      'BES fica em Guipavas, fora de Brest. Preveja o transporte terrestre e roupa para chuva e vento, mesmo no verão.',
      'BES és a Guipavas, fora de Brest. Preveu el trasllat terrestre i roba per a la pluja i el vent, també a l’estiu.',
    ] },
  { slug: 'lourdes', code: 'LDE', airport: 'Tarbes Lourdes Pyrénées', aliases: ['Tarbes-Lourdes', 'Tarbes Ossun Lourdes Airport', 'Tarbes Lourdes Pyrenees Airport', 'Lurdes', 'Lorda'],
    names: ['Lourdes','Lourdes','Lourdes','Lourdes','Lourdes','Lurdes','Lorda'], stay: '2–3', best: [4,5,6,9,10], low: [1,2,11,12],
    descriptions: [
      'El santuario, el castillo y los mercados de Lourdes reúnen patrimonio y vida local a los pies de los Pirineos.',
      'Lourdes’s sanctuary, castle and markets bring together heritage and local life at the foot of the Pyrenees.',
      'Le sanctuaire, le château et les marchés de Lourdes réunissent patrimoine et vie locale au pied des Pyrénées.',
      'Wallfahrtsstätte, Burg und Märkte von Lourdes verbinden Kulturerbe und Alltagsleben am Fuß der Pyrenäen.',
      'Il santuario, il castello e i mercati di Lourdes uniscono patrimonio e vita locale ai piedi dei Pirenei.',
      'O santuário, o castelo e os mercados de Lurdes reúnem património e vida local no sopé dos Pirenéus.',
      'El santuari, el castell i els mercats de Lorda reuneixen patrimoni i vida local als peus dels Pirineus.',
    ], recommendations: [
      ['Conocer el Santuario de Nuestra Señora de Lourdes','Visit the Sanctuary of Our Lady of Lourdes','Découvrir le Sanctuaire Notre-Dame de Lourdes','Die Wallfahrtsstätte Notre-Dame de Lourdes besuchen','Visitare il Santuario di Nostra Signora di Lourdes','Conhecer o Santuário de Nossa Senhora de Lurdes','Conèixer el Santuari de la Mare de Déu de Lorda'],
      ['Visitar el castillo y su Museo Pirenaico','Visit the castle and its Pyrenean Museum','Visiter le château fort et son Musée Pyrénéen','Burg und Pyrenäenmuseum besuchen','Visitare il castello e il Museo dei Pirenei','Visitar o castelo e o Museu dos Pirenéus','Visitar el castell i el Museu Pirinenc'],
      ['Descubrir los productos de Les Halles','Discover local produce at Les Halles','Découvrir les produits locaux aux Halles','Regionale Produkte in Les Halles entdecken','Scoprire i prodotti locali alle Halles','Descobrir os produtos locais nas Halles','Descobrir els productes locals de Les Halles'],
      ['Pasear por el entorno del lago de Lourdes','Walk beside Lake Lourdes','Se promener au bord du lac de Lourdes','Am See von Lourdes spazieren','Passeggiare presso il lago di Lourdes','Passear junto ao lago de Lurdes','Passejar per l’entorn del llac de Lorda'],
    ], notes: [
      'LDE sirve a Tarbes y Lourdes y está fuera de ambas ciudades. Organiza el traslado a Lourdes; el lago también requiere desplazamiento desde el centro. Consulta avisos municipales antes de cualquier ruta de montaña.',
      'LDE serves Tarbes and Lourdes and is outside both cities. Arrange transport to Lourdes; the lake also requires a trip from the centre. Check municipal notices before any mountain walk.',
      'LDE dessert Tarbes et Lourdes et se situe hors des deux villes. Organisez le transfert vers Lourdes ; le lac nécessite aussi un déplacement depuis le centre. Consultez les avis municipaux avant toute randonnée.',
      'LDE bedient Tarbes und Lourdes und liegt außerhalb beider Städte. Den Transfer nach Lourdes planen; auch der See liegt außerhalb des Zentrums. Vor Bergwanderungen kommunale Hinweise prüfen.',
      'LDE serve Tarbes e Lourdes ed è fuori da entrambe le città. Organizza il trasferimento a Lourdes; anche il lago richiede uno spostamento dal centro. Consulta gli avvisi comunali prima delle escursioni in montagna.',
      'LDE serve Tarbes e Lurdes e fica fora de ambas as cidades. Organize o transporte até Lurdes; o lago também exige deslocação desde o centro. Consulte os avisos municipais antes de caminhadas na montanha.',
      'LDE serveix Tarbes i Lorda i és fora de totes dues ciutats. Organitza el trasllat a Lorda; el llac també requereix desplaçament des del centre. Consulta els avisos municipals abans de qualsevol ruta de muntanya.',
    ] },
  { slug: 'rennes', code: 'RNS', airport: 'Rennes Bretagne — Saint-Jacques', aliases: ['Rennes Bretagne', 'Rennes Saint-Jacques', 'Rennes Airport', 'Roazhon'],
    names: ['Rennes','Rennes','Rennes','Rennes','Rennes','Rennes','Rennes'], stay: '2–3', best: [5,6,7,8,9], low: [1,2,11],
    descriptions: [
      'Casas de entramado de madera, mercados y jardines para conocer Rennes entre su casco histórico y el Parlamento de Bretaña.',
      'Timber-framed houses, markets and gardens introduce Rennes through its historic centre and the Parliament of Brittany.',
      'Maisons à pans de bois, marchés et jardins pour découvrir Rennes entre son centre historique et le Parlement de Bretagne.',
      'Fachwerkhäuser, Märkte und Gärten erschließen Rennes zwischen Altstadt und dem Parlament der Bretagne.',
      'Case a graticcio, mercati e giardini per conoscere Rennes tra il centro storico e il Parlamento di Bretagna.',
      'Casas em enxaimel, mercados e jardins para conhecer Rennes entre o centro histórico e o Parlamento da Bretanha.',
      'Cases d’entramat de fusta, mercats i jardins per conèixer Rennes entre el nucli històric i el Parlament de Bretanya.',
    ], recommendations: [
      ['Pasear por las calles históricas y sus casas de madera','Explore historic streets and timber-framed houses','Flâner dans les rues historiques aux maisons à pans de bois','Historische Gassen und Fachwerkhäuser erkunden','Passeggiare tra vicoli storici e case a graticcio','Passear pelas ruas históricas e casas em enxaimel','Passejar pels carrers històrics i les cases de fusta'],
      ['Conocer la plaza y el mercado de Les Lices','Discover Place des Lices and its market','Découvrir la place et le marché des Lices','Place des Lices und ihren Markt entdecken','Scoprire la piazza e il mercato delle Lices','Conhecer a praça e o mercado das Lices','Conèixer la plaça i el mercat de Les Lices'],
      ['Visitar el Parlamento de Bretaña con reserva','Visit the Parliament of Brittany with advance booking','Visiter le Parlement de Bretagne sur réservation','Das Parlament der Bretagne mit Reservierung besuchen','Visitare il Parlamento di Bretagna su prenotazione','Visitar o Parlamento da Bretanha mediante reserva','Visitar el Parlament de Bretanya amb reserva'],
      ['Recorrer el parque del Thabor','Walk through Parc du Thabor','Parcourir le parc du Thabor','Durch den Parc du Thabor spazieren','Percorrere il Parc du Thabor','Percorrer o parque do Thabor','Recórrer el parc del Thabor'],
    ], notes: [
      'RNS está en Saint-Jacques-de-la-Lande, fuera del centro de Rennes. Prevé el traslado terrestre y confirma los horarios del mercado y las visitas al Parlamento.',
      'RNS is in Saint-Jacques-de-la-Lande, outside central Rennes. Allow for a ground transfer and check market times and Parliament visits.',
      'RNS est situé à Saint-Jacques-de-la-Lande, hors du centre de Rennes. Prévoyez le transfert terrestre et vérifiez les horaires du marché et des visites du Parlement.',
      'RNS liegt in Saint-Jacques-de-la-Lande außerhalb der Innenstadt von Rennes. Landtransfer einplanen sowie Marktzeiten und Parlamentsbesichtigungen prüfen.',
      'RNS si trova a Saint-Jacques-de-la-Lande, fuori dal centro di Rennes. Prevedi il trasferimento via terra e verifica orari del mercato e visite al Parlamento.',
      'RNS fica em Saint-Jacques-de-la-Lande, fora do centro de Rennes. Preveja o transporte terrestre e confirme os horários do mercado e das visitas ao Parlamento.',
      'RNS és a Saint-Jacques-de-la-Lande, fora del centre de Rennes. Preveu el trasllat terrestre i confirma els horaris del mercat i de les visites al Parlament.',
    ] },
{
    "slug": "perpignan",
    "code": "PGF",
    "airport": "Perpignan Rivesaltes Méditerranée",
    "aliases": [
      "Perpignan",
      "Perpiñán",
      "Perpinyà",
      "Perpignano",
      "Perpinhã",
      "Perpignan-Rivesaltes",
      "Perpignan Rivesaltes Airport",
      "Perpignan Llabanère",
      "Llabanere Airport"
    ],
    "names": [
      "Perpiñán",
      "Perpignan",
      "Perpignan",
      "Perpignan",
      "Perpignano",
      "Perpinhã",
      "Perpinyà"
    ],
    "stay": "2–3",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "El Castillet, las plazas del casco antiguo y el palacio de los Reyes de Mallorca acercan al patrimonio catalán de Perpiñán.",
      "The Castillet, old-town squares and Palace of the Kings of Majorca introduce Perpignan’s Catalan heritage.",
      "Le Castillet, les places du centre ancien et le palais des Rois de Majorque révèlent le patrimoine catalan de Perpignan.",
      "Castillet, Altstadtplätze und der Palast der Könige von Mallorca erschließen das katalanische Erbe von Perpignan.",
      "Il Castillet, le piazze del centro storico e il Palazzo dei Re di Maiorca raccontano il patrimonio catalano di Perpignano.",
      "O Castillet, as praças do centro histórico e o Palácio dos Reis de Maiorca apresentam o património catalão de Perpinhã.",
      "El Castellet, les places del nucli antic i el Palau dels Reis de Mallorca apropen al patrimoni català de Perpinyà."
    ],
    "recommendations": [
      [
        "Conocer el Castillet",
        "Discover the Castillet",
        "Découvrir le Castillet",
        "Das Castillet entdecken",
        "Scoprire il Castillet",
        "Conhecer o Castillet",
        "Conèixer el Castellet"
      ],
      [
        "Visitar el palacio de los Reyes de Mallorca",
        "Visit the Palace of the Kings of Majorca",
        "Visiter le palais des Rois de Majorque",
        "Den Palast der Könige von Mallorca besuchen",
        "Visitare il Palazzo dei Re di Maiorca",
        "Visitar o Palácio dos Reis de Maiorca",
        "Visitar el Palau dels Reis de Mallorca"
      ],
      [
        "Descubrir la catedral de Saint-Jean y el Campo Santo",
        "Explore Saint-Jean Cathedral and the Campo Santo",
        "Découvrir la cathédrale Saint-Jean et le Campo Santo",
        "Die Kathedrale Saint-Jean und den Campo Santo erkunden",
        "Scoprire la cattedrale Saint-Jean e il Campo Santo",
        "Conhecer a catedral de Saint-Jean e o Campo Santo",
        "Descobrir la catedral de Sant Joan i el Campo Santo"
      ],
      [
        "Pasear por la plaza de la Loge y el casco antiguo",
        "Walk through Place de la Loge and the old town",
        "Flâner place de la Loge et dans le centre ancien",
        "Über die Place de la Loge und durch die Altstadt spazieren",
        "Passeggiare in place de la Loge e nel centro storico",
        "Passear pela Place de la Loge e pelo centro histórico",
        "Passejar per la plaça de la Llotja i el nucli antic"
      ]
    ],
    "notes": [
      "PGF está al norte de Perpiñán, fuera del centro histórico. Organiza el traslado a tu alojamiento y evita las horas de más calor en verano.",
      "PGF is north of Perpignan, outside the historic centre. Arrange transport to your accommodation and avoid the hottest hours in summer.",
      "PGF se trouve au nord de Perpignan, hors du centre historique. Organisez le transfert vers votre hébergement et évitez les heures les plus chaudes en été.",
      "PGF liegt nördlich von Perpignan außerhalb der Altstadt. Den Transfer zur Unterkunft planen und im Sommer die heißesten Stunden meiden.",
      "PGF si trova a nord di Perpignano, fuori dal centro storico. Organizza il trasferimento all’alloggio ed evita le ore più calde in estate.",
      "PGF fica a norte de Perpinhã, fora do centro histórico. Organize o transporte até ao alojamento e evite as horas mais quentes no verão.",
      "PGF és al nord de Perpinyà, fora del centre històric. Organitza el trasllat a l’allotjament i evita les hores de més calor a l’estiu."
    ]
  },
  {
    "slug": "calvi",
    "code": "CLY",
    "airport": "Calvi Sainte-Catherine",
    "aliases": [
      "Calvi-Sainte-Catherine",
      "Calvi Sainte Catherine Airport",
      "Calvi Saint Catherine Airport",
      "Sainte Catherine Airport"
    ],
    "names": [
      "Calvi",
      "Calvi",
      "Calvi",
      "Calvi",
      "Calvi",
      "Calvi",
      "Calvi"
    ],
    "stay": "3–4",
    "best": [
      5,
      6,
      9
    ],
    "low": [
      1,
      2,
      11,
      12
    ],
    "descriptions": [
      "Una ciudadela sobre el mar, un puerto y la playa del golfo definen Calvi, una base para descubrir la Balagne en el noroeste de Córcega.",
      "A seaside citadel, harbour and gulf-side beach define Calvi, a base for exploring the Balagne in northwestern Corsica.",
      "Une citadelle sur la mer, un port et la plage du golfe dessinent Calvi, point de départ pour découvrir la Balagne au nord-ouest de la Corse.",
      "Zitadelle am Meer, Hafen und Strand am Golf prägen Calvi, einen Ausgangspunkt für die Balagne im Nordwesten Korsikas.",
      "Una cittadella sul mare, un porto e la spiaggia del golfo caratterizzano Calvi, base per scoprire la Balagne nella Corsica nordoccidentale.",
      "Uma cidadela sobre o mar, um porto e a praia do golfo definem Calvi, base para descobrir a Balagne no noroeste da Córsega.",
      "Una ciutadella sobre el mar, un port i la platja del golf defineixen Calvi, una base per descobrir la Balagne al nord-oest de Còrsega."
    ],
    "recommendations": [
      [
        "Recorrer las calles y murallas de la ciudadela",
        "Explore the citadel’s streets and ramparts",
        "Parcourir les rues et les remparts de la citadelle",
        "Gassen und Festungsmauern der Zitadelle erkunden",
        "Esplorare le vie e le mura della cittadella",
        "Percorrer as ruas e muralhas da cidadela",
        "Recórrer els carrers i les muralles de la ciutadella"
      ],
      [
        "Conocer la catedral de Saint-Jean-Baptiste",
        "Discover Saint-Jean-Baptiste Cathedral",
        "Découvrir la cathédrale Saint-Jean-Baptiste",
        "Die Kathedrale Saint-Jean-Baptiste entdecken",
        "Scoprire la cattedrale Saint-Jean-Baptiste",
        "Conhecer a catedral de Saint-Jean-Baptiste",
        "Conèixer la catedral de Saint-Jean-Baptiste"
      ],
      [
        "Pasear por el puerto y el quai Landry",
        "Walk around the harbour and Quai Landry",
        "Flâner sur le port et le quai Landry",
        "Am Hafen und am Quai Landry spazieren",
        "Passeggiare al porto e sul quai Landry",
        "Passear pelo porto e pelo Quai Landry",
        "Passejar pel port i el quai Landry"
      ],
      [
        "Recorrer la pasarela junto a la playa de Calvi",
        "Walk along the boardwalk beside Calvi beach",
        "Parcourir la passerelle le long de la plage de Calvi",
        "Auf dem Holzsteg am Strand von Calvi spazieren",
        "Percorrere la passerella lungo la spiaggia di Calvi",
        "Percorrer o passadiço junto à praia de Calvi",
        "Recórrer la passarel·la vora la platja de Calvi"
      ]
    ],
    "notes": [
      "CLY está al sureste de Calvi, separado del centro y del puerto. Prevé el traslado terrestre; la ciudadela tiene cuestas y adoquines. Consulta el estado del mar antes de bañarte.",
      "CLY is southeast of Calvi, separate from the centre and harbour. Allow for a ground transfer; the citadel has slopes and cobbles. Check sea conditions before swimming.",
      "CLY se trouve au sud-est de Calvi, à l’écart du centre et du port. Prévoyez le transfert terrestre ; la citadelle comporte pentes et pavés. Vérifiez les conditions de baignade.",
      "CLY liegt südöstlich von Calvi außerhalb von Zentrum und Hafen. Landtransfer einplanen; in der Zitadelle gibt es Steigungen und Kopfsteinpflaster. Vor dem Baden die Meeresbedingungen prüfen.",
      "CLY si trova a sud-est di Calvi, separato dal centro e dal porto. Prevedi il trasferimento via terra; la cittadella ha salite e acciottolati. Controlla le condizioni del mare prima di nuotare.",
      "CLY fica a sudeste de Calvi, separado do centro e do porto. Preveja o transporte terrestre; a cidadela tem subidas e calçada. Consulte o estado do mar antes de nadar.",
      "CLY és al sud-est de Calvi, separat del centre i del port. Preveu el trasllat terrestre; la ciutadella té pendents i llambordes. Consulta l’estat del mar abans de banyar-te."
    ]
  },
  {
    "slug": "caen",
    "code": "CFR",
    "airport": "Caen Carpiquet",
    "aliases": [
      "Caen-Carpiquet",
      "Caen Carpiquet Airport",
      "Caen Airport",
      "Carpiquet Airport"
    ],
    "names": [
      "Caen",
      "Caen",
      "Caen",
      "Caen",
      "Caen",
      "Caen",
      "Caen"
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      7,
      8,
      9
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "El castillo y las dos grandes abadías recuerdan el pasado medieval de Caen; el Mémorial invita a comprender la historia del siglo XX.",
      "The castle and two great abbeys recall Caen’s medieval past, while the Memorial Museum explores twentieth-century history.",
      "Le château et les deux grandes abbayes rappellent le passé médiéval de Caen ; le Mémorial invite à comprendre l’histoire du XXe siècle.",
      "Burg und zwei große Abteien erinnern an Caens mittelalterliche Vergangenheit; das Mémorial erschließt die Geschichte des 20. Jahrhunderts.",
      "Il castello e le due grandi abbazie ricordano il passato medievale di Caen; il Mémorial invita a comprendere la storia del Novecento.",
      "O castelo e as duas grandes abadias evocam o passado medieval de Caen; o Mémorial convida a compreender a história do século XX.",
      "El castell i les dues grans abadies recorden el passat medieval de Caen; el Mémorial convida a comprendre la història del segle XX."
    ],
    "recommendations": [
      [
        "Explorar el castillo y sus museos",
        "Explore the castle and its museums",
        "Explorer le château et ses musées",
        "Die Burg und ihre Museen erkunden",
        "Esplorare il castello e i suoi musei",
        "Explorar o castelo e os seus museus",
        "Explorar el castell i els seus museus"
      ],
      [
        "Conocer la Abbaye aux Hommes",
        "Discover the Abbaye aux Hommes",
        "Découvrir l’Abbaye aux Hommes",
        "Die Abbaye aux Hommes entdecken",
        "Scoprire l’Abbaye aux Hommes",
        "Conhecer a Abbaye aux Hommes",
        "Conèixer l’Abbaye aux Hommes"
      ],
      [
        "Visitar la Abbaye aux Dames y su entorno",
        "Visit the Abbaye aux Dames and its surroundings",
        "Visiter l’Abbaye aux Dames et ses abords",
        "Die Abbaye aux Dames und ihre Umgebung besuchen",
        "Visitare l’Abbaye aux Dames e i dintorni",
        "Visitar a Abbaye aux Dames e os seus arredores",
        "Visitar l’Abbaye aux Dames i el seu entorn"
      ],
      [
        "Dedicar tiempo al Mémorial de Caen",
        "Allow time for the Caen Memorial Museum",
        "Prendre le temps de visiter le Mémorial de Caen",
        "Zeit für das Mémorial de Caen einplanen",
        "Dedicare tempo al Mémorial de Caen",
        "Reservar tempo para o Mémorial de Caen",
        "Dedicar temps al Mémorial de Caen"
      ]
    ],
    "notes": [
      "CFR está en Carpiquet, fuera de Caen. Organiza el traslado al centro y consulta los avisos de acceso por obras del aeropuerto; lleva ropa para lluvia y viento.",
      "CFR is in Carpiquet, outside Caen. Arrange a transfer to the centre and check the airport’s roadworks access notices; bring clothing for rain and wind.",
      "CFR se trouve à Carpiquet, hors de Caen. Organisez le transfert vers le centre et consultez les avis d’accès liés aux travaux de l’aéroport ; prévoyez des vêtements contre pluie et vent.",
      "CFR liegt in Carpiquet außerhalb von Caen. Transfer ins Zentrum und Hinweise des Flughafens zu Baustellen auf den Zufahrten prüfen; Kleidung für Regen und Wind mitnehmen.",
      "CFR si trova a Carpiquet, fuori Caen. Organizza il trasferimento in centro e consulta gli avvisi dell’aeroporto sui lavori lungo gli accessi; porta abbigliamento per pioggia e vento.",
      "CFR fica em Carpiquet, fora de Caen. Organize o transporte até ao centro e consulte os avisos do aeroporto sobre obras nos acessos; leve roupa para chuva e vento.",
      "CFR és a Carpiquet, fora de Caen. Organitza el trasllat al centre i consulta els avisos de l’aeroport sobre obres als accessos; porta roba per a la pluja i el vent."
    ]
  },
  {
    "slug": "carcassonne",
    "code": "CCF",
    "airport": "Carcassonne Occitanie Sud de France",
    "aliases": [
      "Carcassonne",
      "Carcasona",
      "Carcassona",
      "Carcassonne Salvaza",
      "Carcassonne Airport",
      "Carcassonne-Salvaza"
    ],
    "names": [
      "Carcasona",
      "Carcassonne",
      "Carcassonne",
      "Carcassonne",
      "Carcassonne",
      "Carcassona",
      "Carcassona"
    ],
    "stay": "2–3",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "La Cité amurallada, la bastida Saint-Louis y el canal del Midi ofrecen tres formas de descubrir Carcasona junto al río Aude.",
      "The walled Cité, Bastide Saint-Louis and Canal du Midi offer three ways to explore Carcassonne beside the River Aude.",
      "La Cité fortifiée, la bastide Saint-Louis et le canal du Midi offrent trois façons de découvrir Carcassonne au bord de l’Aude.",
      "Die befestigte Cité, die Bastide Saint-Louis und der Canal du Midi eröffnen drei Seiten von Carcassonne am Fluss Aude.",
      "La Cité fortificata, la bastide Saint-Louis e il Canal du Midi offrono tre modi per scoprire Carcassonne lungo il fiume Aude.",
      "A Cité amuralhada, a bastide Saint-Louis e o Canal du Midi oferecem três formas de descobrir Carcassona junto ao rio Aude.",
      "La ciutat emmurallada, la bastida de Sant Lluís i el canal del Migdia ofereixen tres maneres de descobrir Carcassona vora el riu Aude."
    ],
    "recommendations": [
      [
        "Visitar el castillo y las murallas de la Cité",
        "Visit the castle and ramparts of the Cité",
        "Visiter le château et les remparts de la Cité",
        "Burg und Festungsmauern der Cité besuchen",
        "Visitare il castello e le mura della Cité",
        "Visitar o castelo e as muralhas da Cité",
        "Visitar el castell i les muralles de la ciutat medieval"
      ],
      [
        "Conocer la basílica de Saint-Nazaire",
        "Discover Saint-Nazaire Basilica",
        "Découvrir la basilique Saint-Nazaire",
        "Die Basilika Saint-Nazaire entdecken",
        "Scoprire la basilica Saint-Nazaire",
        "Conhecer a basílica de Saint-Nazaire",
        "Conèixer la basílica de Sant Nazari"
      ],
      [
        "Pasear por la bastida Saint-Louis y la plaza Carnot",
        "Walk through Bastide Saint-Louis and Place Carnot",
        "Flâner dans la bastide Saint-Louis et place Carnot",
        "Durch die Bastide Saint-Louis und über die Place Carnot spazieren",
        "Passeggiare nella bastide Saint-Louis e in place Carnot",
        "Passear pela bastide Saint-Louis e pela Place Carnot",
        "Passejar per la bastida de Sant Lluís i la plaça Carnot"
      ],
      [
        "Recorrer a pie el entorno del puerto del canal del Midi",
        "Walk around the Canal du Midi harbour",
        "Parcourir à pied les abords du port du canal du Midi",
        "Am Hafen des Canal du Midi spazieren",
        "Passeggiare nei dintorni del porto del Canal du Midi",
        "Passear junto ao porto do Canal du Midi",
        "Recórrer a peu l’entorn del port del canal del Migdia"
      ]
    ],
    "notes": [
      "CCF está en Salvaza, fuera del centro. Aviso del gestor consultado el 05/11/2026: cierre por obras del 02/11/2026 al 13/12/2026; reanudación comercial prevista el 14/12/2026. Confirma la reapertura y el traslado antes de reservar.",
      "CCF is at Salvaza, outside the centre. Operator notice checked on 5 November 2026: closed for works from 2 November 2026 to 13 December 2026; commercial services are expected to resume on 14 December 2026. Confirm reopening and transfers before booking.",
      "CCF se trouve à Salvaza, hors du centre. Avis de l’exploitant consulté le 05/11/2026 : fermeture pour travaux du 02/11/2026 au 13/12/2026 ; reprise commerciale prévue le 14/12/2026. Confirmez la réouverture et le transfert avant de réserver.",
      "CCF liegt in Salvaza außerhalb des Zentrums. Betreiberhinweis, geprüft am 05.11.2026: wegen Bauarbeiten vom 02.11.2026 bis 13.12.2026 geschlossen; Wiederaufnahme der kommerziellen Flüge für den 14.12.2026 vorgesehen. Wiedereröffnung und Transfer vor der Buchung bestätigen.",
      "CCF si trova a Salvaza, fuori dal centro. Avviso del gestore consultato il 05/11/2026: chiusura per lavori dal 02/11/2026 al 13/12/2026; ripresa commerciale prevista il 14/12/2026. Conferma riapertura e trasferimento prima di prenotare.",
      "CCF fica em Salvaza, fora do centro. Aviso do gestor consultado em 05/11/2026: encerramento para obras de 02/11/2026 a 13/12/2026; retoma comercial prevista para 14/12/2026. Confirme a reabertura e o transporte antes de reservar.",
      "CCF és a Salvaza, fora del centre. Avís del gestor consultat el 05/11/2026: tancament per obres del 02/11/2026 al 13/12/2026; represa comercial prevista el 14/12/2026. Confirma la reobertura i el trasllat abans de reservar."
    ]
  },
  {
    "slug": "la-rochelle",
    "code": "LRH",
    "airport": "La Rochelle Île de Ré",
    "aliases": [
      "La Rochelle",
      "La Rochelle-Ile de Re",
      "La Rochelle Ile de Re Airport",
      "La Rochelle Laleu",
      "La Rochelle Airport",
      "Laleu Airport"
    ],
    "names": [
      "La Rochelle",
      "La Rochelle",
      "La Rochelle",
      "La Rochelle",
      "La Rochelle",
      "La Rochelle",
      "La Rochelle"
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      9
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "Las torres del Vieux-Port, las calles porticadas y el mercado cubierto unen patrimonio marítimo y vida cotidiana en La Rochelle.",
      "The Vieux-Port towers, arcaded streets and covered market bring together maritime heritage and everyday life in La Rochelle.",
      "Les tours du Vieux-Port, les rues à arcades et le marché couvert mêlent patrimoine maritime et vie quotidienne à La Rochelle.",
      "Die Türme am Vieux-Port, Arkadengassen und die Markthalle verbinden maritimes Erbe und Alltag in La Rochelle.",
      "Le torri del Vieux-Port, le vie porticate e il mercato coperto uniscono patrimonio marittimo e vita quotidiana a La Rochelle.",
      "As torres do Vieux-Port, as ruas com arcadas e o mercado coberto unem património marítimo e vida quotidiana em La Rochelle.",
      "Les torres del Vieux-Port, els carrers porxats i el mercat cobert uneixen patrimoni marítim i vida quotidiana a La Rochelle."
    ],
    "recommendations": [
      [
        "Pasear por el Vieux-Port y contemplar sus torres",
        "Walk around the Vieux-Port and admire its towers",
        "Flâner sur le Vieux-Port et admirer ses tours",
        "Am Vieux-Port spazieren und seine Türme betrachten",
        "Passeggiare nel Vieux-Port e ammirare le sue torri",
        "Passear pelo Vieux-Port e contemplar as suas torres",
        "Passejar pel Vieux-Port i contemplar-ne les torres"
      ],
      [
        "Recorrer las calles porticadas del casco antiguo",
        "Explore the arcaded streets of the old town",
        "Parcourir les rues à arcades de la vieille ville",
        "Die Arkadengassen der Altstadt erkunden",
        "Esplorare le vie porticate del centro storico",
        "Percorrer as ruas com arcadas do centro histórico",
        "Recórrer els carrers porxats del nucli antic"
      ],
      [
        "Descubrir los productos del mercado central",
        "Discover local produce at the central market",
        "Découvrir les produits du marché central",
        "Regionale Produkte auf dem Zentralmarkt entdecken",
        "Scoprire i prodotti del mercato centrale",
        "Descobrir os produtos do mercado central",
        "Descobrir els productes del mercat central"
      ],
      [
        "Pasear por el parque Charruyer",
        "Walk through Parc Charruyer",
        "Se promener dans le parc Charruyer",
        "Durch den Parc Charruyer spazieren",
        "Passeggiare nel parc Charruyer",
        "Passear pelo parque Charruyer",
        "Passejar pel parc Charruyer"
      ]
    ],
    "notes": [
      "LRH está en Laleu, en el continente, fuera del centro histórico de La Rochelle. Prevé el traslado; visitar la isla de Ré requiere otro desplazamiento. Consulta horarios del mercado y avisos de obras en parques y paseos.",
      "LRH is in Laleu, on the mainland, outside La Rochelle’s historic centre. Allow for a transfer; visiting Île de Ré requires a separate journey. Check market times and works notices for parks and promenades.",
      "LRH se trouve à Laleu, sur le continent, hors du centre historique de La Rochelle. Prévoyez le transfert ; l’île de Ré nécessite un trajet distinct. Vérifiez les horaires du marché et les travaux dans les parcs et promenades.",
      "LRH liegt in Laleu auf dem Festland außerhalb der Altstadt von La Rochelle. Den Transfer einplanen; für die Île de Ré ist eine weitere Fahrt nötig. Marktzeiten und Baustellenhinweise für Parks und Promenaden prüfen.",
      "LRH si trova a Laleu, sulla terraferma, fuori dal centro storico di La Rochelle. Prevedi il trasferimento; visitare l’Île de Ré richiede un altro spostamento. Controlla orari del mercato e avvisi sui lavori in parchi e passeggiate.",
      "LRH fica em Laleu, no continente, fora do centro histórico de La Rochelle. Preveja o transporte; visitar a Île de Ré exige outra deslocação. Consulte horários do mercado e avisos de obras em parques e passeios.",
      "LRH és a Laleu, al continent, fora del centre històric de La Rochelle. Preveu el trasllat; visitar l’illa de Ré requereix un altre desplaçament. Consulta horaris del mercat i avisos d’obres en parcs i passeigs."
    ]
  },
  {
    "slug": "beziers",
    "code": "BZR",
    "airport": "Béziers Cap d’Agde",
    "aliases": [
      "Béziers",
      "Beziers",
      "Besiers",
      "Béziers Cap d’Agde",
      "Beziers Cap d'Agde Airport",
      "Beziers Vias Airport",
      "Béziers-Vias"
    ],
    "names": [
      "Béziers",
      "Béziers",
      "Béziers",
      "Béziers",
      "Béziers",
      "Béziers",
      "Besiers"
    ],
    "stay": "2–3",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "La catedral sobre el río Orb, el Pont Vieux y las esclusas de Fonseranes conectan el casco antiguo de Béziers con el canal del Midi.",
      "The cathedral above the River Orb, Pont Vieux and Fonseranes locks connect Béziers’s old town with the Canal du Midi.",
      "La cathédrale au-dessus de l’Orb, le Pont Vieux et les écluses de Fonseranes relient le centre ancien de Béziers au canal du Midi.",
      "Kathedrale über dem Orb, Pont Vieux und Schleusen von Fonseranes verbinden die Altstadt von Béziers mit dem Canal du Midi.",
      "La cattedrale sopra il fiume Orb, il Pont Vieux e le chiuse di Fonseranes collegano il centro storico di Béziers al Canal du Midi.",
      "A catedral sobre o rio Orb, o Pont Vieux e as eclusas de Fonseranes ligam o centro histórico de Béziers ao Canal du Midi.",
      "La catedral sobre el riu Orb, el Pont Vieux i les rescloses de Fonseranes connecten el nucli antic de Besiers amb el canal del Migdia."
    ],
    "recommendations": [
      [
        "Conocer la catedral de Saint-Nazaire y sus vistas",
        "Discover Saint-Nazaire Cathedral and its views",
        "Découvrir la cathédrale Saint-Nazaire et ses vues",
        "Die Kathedrale Saint-Nazaire und ihre Aussicht entdecken",
        "Scoprire la cattedrale Saint-Nazaire e i suoi panorami",
        "Conhecer a catedral de Saint-Nazaire e as suas vistas",
        "Conèixer la catedral de Sant Nazari i les seves vistes"
      ],
      [
        "Pasear por el Pont Vieux y las orillas del Orb",
        "Walk across Pont Vieux and along the River Orb",
        "Flâner sur le Pont Vieux et les berges de l’Orb",
        "Über den Pont Vieux und am Orb entlang spazieren",
        "Passeggiare sul Pont Vieux e sulle rive dell’Orb",
        "Passear pelo Pont Vieux e pelas margens do Orb",
        "Passejar pel Pont Vieux i les ribes de l’Orb"
      ],
      [
        "Recorrer el conjunto de esclusas de Fonseranes",
        "Explore the Fonseranes lock complex",
        "Parcourir le site des écluses de Fonseranes",
        "Die Schleusenanlage von Fonseranes erkunden",
        "Esplorare il complesso delle chiuse di Fonseranes",
        "Percorrer o conjunto de eclusas de Fonseranes",
        "Recórrer el conjunt de rescloses de Fonseranes"
      ],
      [
        "Descubrir las allées Paul Riquet y el Plateau des Poètes",
        "Discover Allées Paul Riquet and Plateau des Poètes",
        "Découvrir les allées Paul Riquet et le Plateau des Poètes",
        "Allées Paul Riquet und Plateau des Poètes entdecken",
        "Scoprire le allées Paul Riquet e il Plateau des Poètes",
        "Conhecer as Allées Paul Riquet e o Plateau des Poètes",
        "Descobrir les allées Paul Riquet i el Plateau des Poètes"
      ]
    ],
    "notes": [
      "La terminal de BZR está en Portiragnes, fuera de Béziers. Organiza el traslado al centro; la ciudad alta y el canal están a diferentes alturas. Evita las horas de más calor.",
      "BZR’s terminal is in Portiragnes, outside Béziers. Arrange transport to the centre; the upper town and canal are at different levels. Avoid the hottest hours.",
      "L’aérogare de BZR se trouve à Portiragnes, hors de Béziers. Organisez le transfert vers le centre ; ville haute et canal sont à des niveaux différents. Évitez les heures les plus chaudes.",
      "Das Terminal von BZR liegt in Portiragnes außerhalb von Béziers. Transfer ins Zentrum planen; Oberstadt und Kanal liegen auf verschiedenen Höhen. Die heißesten Stunden meiden.",
      "Il terminal di BZR si trova a Portiragnes, fuori Béziers. Organizza il trasferimento in centro; città alta e canale sono a quote diverse. Evita le ore più calde.",
      "O terminal de BZR fica em Portiragnes, fora de Béziers. Organize o transporte até ao centro; cidade alta e canal ficam a cotas diferentes. Evite as horas mais quentes.",
      "La terminal de BZR és a Portiragnes, fora de Besiers. Organitza el trasllat al centre; la ciutat alta i el canal són a diferents altures. Evita les hores de més calor."
    ]
  },
  {
    "slug": "limoges",
    "code": "LIG",
    "airport": "Limoges Bellegarde",
    "aliases": [
      "Limoges-Bellegarde",
      "Limoges Bellegarde Airport",
      "Limoges Airport",
      "Llemotges",
      "Bellegarde Airport"
    ],
    "names": [
      "Limoges",
      "Limoges",
      "Limoges",
      "Limoges",
      "Limoges",
      "Limoges",
      "Llemotges"
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      7,
      8,
      9
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "La porcelana, el barrio de la Boucherie y el entorno de la catedral presentan Limoges entre oficios tradicionales, calles históricas y jardines.",
      "Porcelain, the Boucherie quarter and the cathedral area introduce Limoges through traditional crafts, historic streets and gardens.",
      "La porcelaine, le quartier de la Boucherie et les abords de la cathédrale révèlent Limoges entre savoir-faire, rues historiques et jardins.",
      "Porzellan, das Viertel Boucherie und die Umgebung der Kathedrale erschließen Limoges zwischen Handwerk, historischen Gassen und Gärten.",
      "La porcellana, il quartiere della Boucherie e i dintorni della cattedrale raccontano Limoges tra mestieri tradizionali, vie storiche e giardini.",
      "A porcelana, o bairro da Boucherie e a zona da catedral apresentam Limoges entre ofícios tradicionais, ruas históricas e jardins.",
      "La porcellana, el barri de la Boucherie i l’entorn de la catedral presenten Llemotges entre oficis tradicionals, carrers històrics i jardins."
    ],
    "recommendations": [
      [
        "Visitar el Museo Nacional Adrien Dubouché",
        "Visit the Adrien Dubouché National Museum",
        "Visiter le musée national Adrien Dubouché",
        "Das Nationalmuseum Adrien Dubouché besuchen",
        "Visitare il Museo nazionale Adrien Dubouché",
        "Visitar o Museu Nacional Adrien Dubouché",
        "Visitar el Museu Nacional Adrien Dubouché"
      ],
      [
        "Pasear por el barrio de la Boucherie",
        "Walk through the Boucherie quarter",
        "Flâner dans le quartier de la Boucherie",
        "Durch das Viertel Boucherie spazieren",
        "Passeggiare nel quartiere della Boucherie",
        "Passear pelo bairro da Boucherie",
        "Passejar pel barri de la Boucherie"
      ],
      [
        "Conocer la catedral de Saint-Étienne y los jardines del Évêché",
        "Discover Saint-Étienne Cathedral and the Évêché gardens",
        "Découvrir la cathédrale Saint-Étienne et les jardins de l’Évêché",
        "Die Kathedrale Saint-Étienne und die Gärten des Évêché entdecken",
        "Scoprire la cattedrale Saint-Étienne e i giardini dell’Évêché",
        "Conhecer a catedral de Saint-Étienne e os jardins do Évêché",
        "Conèixer la catedral de Sant Esteve i els jardins de l’Évêché"
      ],
      [
        "Recorrer las orillas de la Vienne y sus puentes históricos",
        "Explore the Vienne riverbanks and historic bridges",
        "Parcourir les bords de Vienne et leurs ponts historiques",
        "Das Ufer der Vienne und ihre historischen Brücken erkunden",
        "Esplorare le rive della Vienne e i suoi ponti storici",
        "Percorrer as margens do Vienne e as suas pontes históricas",
        "Recórrer les ribes de la Viena i els seus ponts històrics"
      ]
    ],
    "notes": [
      "LIG está en Bellegarde, al oeste del centro de Limoges. Organiza el traslado y confirma sus horarios; entre los barrios históricos y la Vienne hay desniveles. Lleva ropa para lluvia.",
      "LIG is at Bellegarde, west of central Limoges. Arrange a transfer and check its timetable; the historic quarters and River Vienne are at different levels. Bring rainwear.",
      "LIG se trouve à Bellegarde, à l’ouest du centre de Limoges. Organisez le transfert et vérifiez ses horaires ; les quartiers historiques et la Vienne présentent des dénivelés. Prévoyez des vêtements de pluie.",
      "LIG liegt in Bellegarde westlich des Zentrums von Limoges. Transfer und Fahrzeiten prüfen; zwischen historischen Vierteln und Vienne gibt es Höhenunterschiede. Regenkleidung mitnehmen.",
      "LIG si trova a Bellegarde, a ovest del centro di Limoges. Organizza il trasferimento e verificane gli orari; tra i quartieri storici e la Vienne ci sono dislivelli. Porta abbigliamento antipioggia.",
      "LIG fica em Bellegarde, a oeste do centro de Limoges. Organize o transporte e confirme os horários; há desníveis entre os bairros históricos e o Vienne. Leve roupa para chuva.",
      "LIG és a Bellegarde, a l’oest del centre de Llemotges. Organitza el trasllat i confirma’n els horaris; hi ha desnivells entre els barris històrics i la Viena. Porta roba per a la pluja."
    ]
  },
  {
    "slug": "clermont-ferrand",
    "code": "CFE",
    "airport": "Clermont-Ferrand Auvergne",
    "aliases": [
      "Clermont Ferrand",
      "Clermont-Ferrand Auvergne Airport",
      "Clermont Ferrand Airport",
      "Aulnat Airport"
    ],
    "names": [
      "Clermont-Ferrand",
      "Clermont-Ferrand",
      "Clermont-Ferrand",
      "Clermont-Ferrand",
      "Clermont-Ferrand",
      "Clermont-Ferrand",
      "Clermont-Ferrand"
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "La catedral de piedra volcánica, la basílica de Notre-Dame-du-Port y las calles de Montferrand muestran distintas épocas de Clermont-Ferrand.",
      "The volcanic-stone cathedral, Notre-Dame-du-Port Basilica and streets of Montferrand reveal different chapters of Clermont-Ferrand’s history.",
      "La cathédrale en pierre volcanique, la basilique Notre-Dame-du-Port et les rues de Montferrand racontent plusieurs époques de Clermont-Ferrand.",
      "Kathedrale aus Vulkangestein, Basilika Notre-Dame-du-Port und die Gassen von Montferrand zeigen verschiedene Epochen von Clermont-Ferrand.",
      "La cattedrale in pietra vulcanica, la basilica Notre-Dame-du-Port e le vie di Montferrand raccontano diverse epoche di Clermont-Ferrand.",
      "A catedral de pedra vulcânica, a basílica de Notre-Dame-du-Port e as ruas de Montferrand mostram diferentes épocas de Clermont-Ferrand.",
      "La catedral de pedra volcànica, la basílica de Notre-Dame-du-Port i els carrers de Montferrand mostren diferents èpoques de Clermont-Ferrand."
    ],
    "recommendations": [
      [
        "Conocer la catedral de Notre-Dame-de-l’Assomption",
        "Discover Notre-Dame-de-l’Assomption Cathedral",
        "Découvrir la cathédrale Notre-Dame-de-l’Assomption",
        "Die Kathedrale Notre-Dame-de-l’Assomption entdecken",
        "Scoprire la cattedrale Notre-Dame-de-l’Assomption",
        "Conhecer a catedral de Notre-Dame-de-l’Assomption",
        "Conèixer la catedral de Notre-Dame-de-l’Assomption"
      ],
      [
        "Visitar la basílica de Notre-Dame-du-Port",
        "Visit Notre-Dame-du-Port Basilica",
        "Visiter la basilique Notre-Dame-du-Port",
        "Die Basilika Notre-Dame-du-Port besuchen",
        "Visitare la basilica Notre-Dame-du-Port",
        "Visitar a basílica de Notre-Dame-du-Port",
        "Visitar la basílica de Notre-Dame-du-Port"
      ],
      [
        "Pasear por la plaza de Jaude y el centro histórico",
        "Walk around Place de Jaude and the historic centre",
        "Flâner place de Jaude et dans le centre historique",
        "Über die Place de Jaude und durch die Altstadt spazieren",
        "Passeggiare in place de Jaude e nel centro storico",
        "Passear pela Place de Jaude e pelo centro histórico",
        "Passejar per la plaça de Jaude i el centre històric"
      ],
      [
        "Recorrer las calles históricas de Montferrand",
        "Explore the historic streets of Montferrand",
        "Parcourir les rues historiques de Montferrand",
        "Die historischen Gassen von Montferrand erkunden",
        "Esplorare le vie storiche di Montferrand",
        "Percorrer as ruas históricas de Montferrand",
        "Recórrer els carrers històrics de Montferrand"
      ]
    ],
    "notes": [
      "CFE está en Aulnat, al este de Clermont-Ferrand. Prevé el traslado al centro; Montferrand es otro núcleo histórico de la misma ciudad. Las excursiones a los volcanes requieren desplazamiento y comprobar accesos y meteorología.",
      "CFE is in Aulnat, east of Clermont-Ferrand. Allow for a transfer to the centre; Montferrand is another historic quarter of the same city. Volcano trips require travel and checks on access and weather.",
      "CFE se trouve à Aulnat, à l’est de Clermont-Ferrand. Prévoyez le transfert vers le centre ; Montferrand est un autre noyau historique de la même ville. Les excursions aux volcans nécessitent un déplacement et une vérification des accès et de la météo.",
      "CFE liegt in Aulnat östlich von Clermont-Ferrand. Transfer ins Zentrum einplanen; Montferrand ist ein weiterer historischer Stadtteil derselben Stadt. Für Vulkanausflüge Anfahrt, Zugänglichkeit und Wetter prüfen.",
      "CFE si trova ad Aulnat, a est di Clermont-Ferrand. Prevedi il trasferimento in centro; Montferrand è un altro nucleo storico della stessa città. Le escursioni ai vulcani richiedono spostamenti e verifiche su accessi e meteo.",
      "CFE fica em Aulnat, a leste de Clermont-Ferrand. Preveja o transporte até ao centro; Montferrand é outro núcleo histórico da mesma cidade. As excursões aos vulcões exigem deslocação e consulta dos acessos e da meteorologia.",
      "CFE és a Aulnat, a l’est de Clermont-Ferrand. Preveu el trasllat al centre; Montferrand és un altre nucli històric de la mateixa ciutat. Les excursions als volcans requereixen desplaçament i comprovar accessos i meteorologia."
    ]
  },
{
    "slug": "grenoble",
    "code": "GNB",
    "airport": "Grenoble Alpes Isère",
    "aliases": [
      "Grenoble-Isère",
      "Grenoble Isere Airport",
      "Grenoble Alpes Isere",
      "Saint-Étienne-de-Saint-Geoirs",
      "Grenoble-Isere Airport"
    ],
    "names": [
      "Grenoble",
      "Grenoble",
      "Grenoble",
      "Grenoble",
      "Grenoble",
      "Grenoble",
      "Grenoble"
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      7,
      8,
      9
    ],
    "low": [
      11
    ],
    "descriptions": [
      "Museos, plazas históricas y paseos junto al Isère permiten descubrir Grenoble entre la ciudad y sus paisajes alpinos.",
      "Museums, historic squares and walks beside the Isère introduce Grenoble between its urban heritage and Alpine scenery.",
      "Musées, places historiques et promenades le long de l’Isère font découvrir Grenoble entre patrimoine urbain et paysages alpins.",
      "Museen, historische Plätze und Spaziergänge an der Isère erschließen Grenoble zwischen Stadtkultur und Alpenlandschaft.",
      "Musei, piazze storiche e passeggiate lungo l’Isère raccontano Grenoble tra patrimonio urbano e paesaggi alpini.",
      "Museus, praças históricas e passeios junto ao Isère revelam Grenoble entre património urbano e paisagens alpinas.",
      "Museus, places històriques i passejades vora l’Isère permeten descobrir Grenoble entre patrimoni urbà i paisatges alpins."
    ],
    "recommendations": [
      [
        "Visitar las salas abiertas del Museo de Grenoble",
        "Visit the open galleries of the Musée de Grenoble",
        "Visiter les salles ouvertes du musée de Grenoble",
        "Die geöffneten Säle des Musée de Grenoble besuchen",
        "Visitare le sale aperte del Musée de Grenoble",
        "Visitar as salas abertas do Museu de Grenoble",
        "Visitar les sales obertes del Museu de Grenoble"
      ],
      [
        "Pasear por la plaza Saint-André",
        "Explore Place Saint-André",
        "Flâner place Saint-André",
        "Die Place Saint-André erkunden",
        "Passeggiare in place Saint-André",
        "Passear pela Place Saint-André",
        "Passejar per la plaça Saint-André"
      ],
      [
        "Descansar en el Jardin de Ville",
        "Relax in the Jardin de Ville",
        "Faire une pause au Jardin de Ville",
        "Im Jardin de Ville entspannen",
        "Fare una pausa nel Jardin de Ville",
        "Descansar no Jardin de Ville",
        "Descansar al Jardin de Ville"
      ],
      [
        "Recorrer los muelles del Isère",
        "Walk along the Isère quays",
        "Parcourir les quais de l’Isère",
        "An den Isère-Ufern spazieren",
        "Percorrere i lungofiume dell’Isère",
        "Percorrer os cais do Isère",
        "Recórrer els molls de l’Isère"
      ]
    ],
    "notes": [
      "GNB está en Saint-Étienne-de-Saint-Geoirs, lejos del centro de Grenoble. Organiza el traslado y comprueba la oferta estacional; confirma las salas abiertas del museo. No improvises rutas de montaña sin consultar avisos.",
      "GNB is in Saint-Étienne-de-Saint-Geoirs, well outside Grenoble. Plan a ground transfer and check seasonal flights and open museum galleries. Consult current notices before any mountain walk.",
      "GNB est situé à Saint-Étienne-de-Saint-Geoirs, loin du centre de Grenoble. Organisez le transfert et vérifiez vols saisonniers et salles ouvertes du musée. Consultez les avis avant toute randonnée.",
      "GNB liegt in Saint-Étienne-de-Saint-Geoirs weit außerhalb von Grenoble. Transfer, saisonale Flüge und geöffnete Museumssäle prüfen. Vor Bergwanderungen aktuelle Hinweise beachten.",
      "GNB si trova a Saint-Étienne-de-Saint-Geoirs, lontano dal centro di Grenoble. Organizza il trasferimento e verifica voli stagionali e sale aperte del museo. Consulta gli avvisi prima delle escursioni in montagna.",
      "GNB fica em Saint-Étienne-de-Saint-Geoirs, longe do centro de Grenoble. Organize o transporte e confirme voos sazonais e salas abertas do museu. Consulte os avisos antes de caminhadas na montanha.",
      "GNB és a Saint-Étienne-de-Saint-Geoirs, lluny del centre de Grenoble. Organitza el trasllat i comprova vols estacionals i sales obertes del museu. Consulta els avisos abans de rutes de muntanya."
    ]
  },
  {
    "slug": "nimes",
    "code": "FNI",
    "airport": "Nîmes Grande Provence",
    "aliases": [
      "Nimes",
      "Nîmes Garons",
      "Nimes Garons Airport",
      "Garons Airport"
    ],
    "names": [
      "Nîmes",
      "Nîmes",
      "Nîmes",
      "Nîmes",
      "Nîmes",
      "Nîmes",
      "Nimes"
    ],
    "stay": "2–3",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "El anfiteatro, la Maison Carrée y los jardines de la Fontaine acercan a la herencia romana y los espacios públicos de Nîmes.",
      "The amphitheatre, Maison Carrée and Jardins de la Fontaine introduce Nîmes through its Roman heritage and public spaces.",
      "Les arènes, la Maison Carrée et les jardins de la Fontaine font découvrir Nîmes entre héritage romain et espaces publics.",
      "Amphitheater, Maison Carrée und Jardins de la Fontaine zeigen Nîmes zwischen römischem Erbe und öffentlichen Gärten.",
      "L’anfiteatro, la Maison Carrée e i Jardins de la Fontaine presentano Nîmes tra eredità romana e spazi pubblici.",
      "O anfiteatro, a Maison Carrée e os Jardins de la Fontaine revelam Nîmes entre herança romana e espaços públicos.",
      "L’amfiteatre, la Maison Carrée i els jardins de la Fontaine apropen al llegat romà i els espais públics de Nimes."
    ],
    "recommendations": [
      [
        "Conocer las Arènes de Nîmes",
        "Discover the Arènes de Nîmes",
        "Découvrir les arènes de Nîmes",
        "Die Arènes de Nîmes entdecken",
        "Scoprire le Arènes de Nîmes",
        "Conhecer as Arènes de Nîmes",
        "Conèixer les Arènes de Nîmes"
      ],
      [
        "Visitar la Maison Carrée",
        "Visit the Maison Carrée",
        "Visiter la Maison Carrée",
        "Die Maison Carrée besuchen",
        "Visitare la Maison Carrée",
        "Visitar a Maison Carrée",
        "Visitar la Maison Carrée"
      ],
      [
        "Pasear por los jardines de la Fontaine",
        "Walk through the Jardins de la Fontaine",
        "Flâner dans les jardins de la Fontaine",
        "Durch die Jardins de la Fontaine spazieren",
        "Passeggiare nei Jardins de la Fontaine",
        "Passear pelos Jardins de la Fontaine",
        "Passejar pels jardins de la Fontaine"
      ],
      [
        "Descubrir la Tour Magne y sus vistas",
        "Discover the Tour Magne and its views",
        "Découvrir la tour Magne et ses vues",
        "Die Tour Magne und ihre Aussicht entdecken",
        "Scoprire la Tour Magne e i suoi panorami",
        "Conhecer a Tour Magne e as suas vistas",
        "Descobrir la Tour Magne i les seves vistes"
      ]
    ],
    "notes": [
      "FNI está en Saint-Gilles, junto a Garons y fuera del centro de Nîmes. Prevé el traslado; en verano evita las horas de más calor. La subida a la Tour Magne tiene pendientes y escaleras.",
      "FNI is in Saint-Gilles near Garons, outside central Nîmes. Allow for a transfer and avoid the hottest summer hours. The Tour Magne approach and visit involve slopes and steps.",
      "FNI est situé à Saint-Gilles, près de Garons et hors du centre de Nîmes. Prévoyez le transfert et évitez les fortes chaleurs estivales. L’accès à la tour Magne comporte pentes et escaliers.",
      "FNI liegt in Saint-Gilles bei Garons außerhalb von Nîmes. Transfer einplanen und die heißesten Sommerstunden meiden. An der Tour Magne gibt es Steigungen und Treppen.",
      "FNI si trova a Saint-Gilles, presso Garons, fuori dal centro di Nîmes. Prevedi il trasferimento ed evita le ore estive più calde. La Tour Magne comporta salite e scale.",
      "FNI fica em Saint-Gilles, junto a Garons, fora do centro de Nîmes. Preveja o transporte e evite as horas de maior calor no verão. A Tour Magne envolve subidas e escadas.",
      "FNI és a Saint-Gilles, prop de Garons i fora del centre de Nimes. Preveu el trasllat i evita les hores de més calor a l’estiu. La Tour Magne té pendents i escales."
    ]
  },
  {
    "slug": "bergerac",
    "code": "EGC",
    "airport": "Bergerac Dordogne Périgord",
    "aliases": [
      "Bergerac Roumanière",
      "Bergerac Roumaniere",
      "Bergerac Dordogne Perigord",
      "Roumanieres Airport"
    ],
    "names": [
      "Bergerac",
      "Bergerac",
      "Bergerac",
      "Bergerac",
      "Bergerac",
      "Bergerac",
      "Bergerac"
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "Los muelles de la Dordogne, el centro antiguo y el patrimonio de Dordonha presentan Bergerac entre historia fluvial y cultura del Périgord.",
      "The Dordogne quays, old town and Dordonha heritage centre introduce Bergerac through river history and Périgord culture.",
      "Les quais de la Dordogne, la vieille ville et le patrimoine de Dordonha révèlent Bergerac entre histoire fluviale et culture périgourdine.",
      "Dordogne-Ufer, Altstadt und das Kulturzentrum Dordonha erschließen Bergerac zwischen Flussgeschichte und dem Périgord.",
      "I lungofiume della Dordogna, il centro antico e Dordonha raccontano Bergerac tra storia fluviale e cultura del Périgord.",
      "Os cais da Dordogne, o centro antigo e Dordonha apresentam Bergerac entre história fluvial e cultura do Périgord.",
      "Els molls de la Dordonya, el nucli antic i Dordonha presenten Bergerac entre història fluvial i cultura del Périgord."
    ],
    "recommendations": [
      [
        "Pasear por los muelles y el antiguo puerto",
        "Walk along the quays and old harbour",
        "Flâner sur les quais et le vieux port",
        "Ufer und alten Hafen erkunden",
        "Passeggiare sui lungofiume e al porto antico",
        "Passear pelos cais e pelo porto antigo",
        "Passejar pels molls i el port antic"
      ],
      [
        "Recorrer las calles del casco antiguo",
        "Explore the old-town streets",
        "Parcourir les rues de la vieille ville",
        "Durch die Altstadtgassen spazieren",
        "Esplorare le vie del centro antico",
        "Percorrer as ruas do centro antigo",
        "Recórrer els carrers del nucli antic"
      ],
      [
        "Visitar el centro cultural Dordonha",
        "Visit the Dordonha heritage centre",
        "Visiter le centre patrimonial Dordonha",
        "Das Kulturzentrum Dordonha besuchen",
        "Visitare il centro culturale Dordonha",
        "Visitar o centro cultural Dordonha",
        "Visitar el centre cultural Dordonha"
      ],
      [
        "Conocer Quai Cyrano y el claustro de los Récollets",
        "Discover Quai Cyrano and the Récollets cloister",
        "Découvrir Quai Cyrano et le cloître des Récollets",
        "Quai Cyrano und den Récollets-Kreuzgang entdecken",
        "Scoprire Quai Cyrano e il chiostro dei Récollets",
        "Conhecer Quai Cyrano e o claustro dos Récollets",
        "Conèixer Quai Cyrano i el claustre dels Récollets"
      ]
    ],
    "notes": [
      "EGC está en Roumanière, al sur de Bergerac, y requiere traslado al centro. Comprueba las conexiones estacionales; las excursiones por el Périgord necesitan desplazamientos adicionales.",
      "EGC is at Roumanière, south of Bergerac, and requires a transfer to the centre. Check seasonal flights; trips around the Périgord need additional travel.",
      "EGC se trouve à Roumanière, au sud de Bergerac, avec transfert vers le centre. Vérifiez les liaisons saisonnières ; les excursions en Périgord demandent d’autres déplacements.",
      "EGC liegt in Roumanière südlich von Bergerac und erfordert einen Transfer ins Zentrum. Saisonale Flüge prüfen; Ausflüge im Périgord benötigen zusätzliche Fahrten.",
      "EGC si trova a Roumanière, a sud di Bergerac, e richiede un trasferimento in centro. Verifica i voli stagionali; le escursioni nel Périgord richiedono altri spostamenti.",
      "EGC fica em Roumanière, a sul de Bergerac, e exige transporte até ao centro. Confirme as ligações sazonais; passeios pelo Périgord exigem outras deslocações.",
      "EGC és a Roumanière, al sud de Bergerac, i requereix trasllat al centre. Comprova les connexions estacionals; les excursions pel Périgord necessiten altres desplaçaments."
    ]
  },
  {
    "slug": "toulon",
    "code": "TLN",
    "airport": "Toulon Hyères",
    "aliases": [
      "Toulon-Hyères",
      "Toulon Hyeres",
      "Hyeres Airport",
      "Tolón",
      "Toló"
    ],
    "names": [
      "Tolón",
      "Toulon",
      "Toulon",
      "Toulon",
      "Tolone",
      "Toulon",
      "Toló"
    ],
    "stay": "2–3",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "El puerto, los mercados y los museos revelan Tolón, una ciudad marítima de la costa mediterránea entre barrios históricos y la rada.",
      "The harbour, markets and museums reveal Toulon, a Mediterranean maritime city of historic quarters and waterfront views.",
      "Le port, les marchés et les musées révèlent Toulon, ville maritime méditerranéenne entre quartiers historiques et rade.",
      "Hafen, Märkte und Museen erschließen Toulon, eine Mittelmeerstadt zwischen historischen Vierteln und Reede.",
      "Il porto, i mercati e i musei raccontano Tolone, città marittima mediterranea tra quartieri storici e rada.",
      "O porto, os mercados e os museus revelam Toulon, cidade marítima mediterrânica entre bairros históricos e a rada.",
      "El port, els mercats i els museus revelen Toló, ciutat marítima mediterrània entre barris històrics i la rada."
    ],
    "recommendations": [
      [
        "Pasear por el puerto de Tolón",
        "Walk along Toulon harbour",
        "Flâner sur le port de Toulon",
        "Am Hafen von Toulon spazieren",
        "Passeggiare al porto di Tolone",
        "Passear pelo porto de Toulon",
        "Passejar pel port de Toló"
      ],
      [
        "Visitar el Museo Nacional de la Marina",
        "Visit the National Maritime Museum",
        "Visiter le musée national de la Marine",
        "Das Nationale Marinemuseum besuchen",
        "Visitare il Museo nazionale della Marina",
        "Visitar o Museu Nacional da Marinha",
        "Visitar el Museu Nacional de la Marina"
      ],
      [
        "Recorrer el cours Lafayette y el casco antiguo",
        "Explore Cours Lafayette and the old town",
        "Parcourir le cours Lafayette et la vieille ville",
        "Cours Lafayette und die Altstadt erkunden",
        "Percorrere il cours Lafayette e il centro antico",
        "Percorrer o Cours Lafayette e o centro antigo",
        "Recórrer el cours Lafayette i el nucli antic"
      ],
      [
        "Conocer el Museo de Arte de Tolón",
        "Discover Toulon Art Museum",
        "Découvrir le musée d’Art de Toulon",
        "Das Kunstmuseum Toulon entdecken",
        "Scoprire il Museo d’arte di Tolone",
        "Conhecer o Museu de Arte de Toulon",
        "Conèixer el Museu d’Art de Toló"
      ]
    ],
    "notes": [
      "TLN está en Hyères, fuera de Tolón, y sirve a ambas ciudades. Organiza el traslado a tu alojamiento y comprueba horarios de museos y mercado; la rada militar no es un espacio de acceso libre.",
      "TLN is in Hyères, outside Toulon, and serves both cities. Plan transport to your accommodation and check museum and market times; military harbour areas are not freely accessible.",
      "TLN se trouve à Hyères, hors de Toulon, et dessert les deux villes. Organisez le transfert et vérifiez les horaires des musées et du marché ; les zones militaires ne sont pas en accès libre.",
      "TLN liegt in Hyères außerhalb von Toulon und bedient beide Städte. Transfer sowie Museums- und Marktzeiten prüfen; Militärhafenbereiche sind nicht frei zugänglich.",
      "TLN si trova a Hyères, fuori Tolone, e serve entrambe le città. Organizza il trasferimento e verifica orari di musei e mercato; le zone militari non sono ad accesso libero.",
      "TLN fica em Hyères, fora de Toulon, e serve ambas as cidades. Organize o transporte e confirme horários dos museus e mercado; as zonas militares não são de acesso livre.",
      "TLN és a Hyères, fora de Toló, i serveix totes dues ciutats. Organitza el trasllat i comprova horaris dels museus i del mercat; les zones militars no són d’accés lliure."
    ]
  },
  {
    "slug": "pau",
    "code": "PUF",
    "airport": "Pau Pyrénées",
    "aliases": [
      "Pau Pyrenees",
      "Pau Uzein",
      "Air’Py",
      "The Pau-Pyrenees International Airport"
    ],
    "names": [
      "Pau",
      "Pau",
      "Pau",
      "Pau",
      "Pau",
      "Pau",
      "Pau"
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      7,
      8,
      9,
      10
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "El castillo, el boulevard des Pyrénées y los parques de Pau combinan historia del Béarn, arte y vistas hacia las montañas.",
      "The castle, Boulevard des Pyrénées and Pau’s parks combine Béarn history, art and mountain views.",
      "Le château, le boulevard des Pyrénées et les parcs de Pau réunissent histoire du Béarn, art et vues sur les montagnes.",
      "Schloss, Boulevard des Pyrénées und die Parks von Pau verbinden die Geschichte des Béarn mit Kunst und Bergblicken.",
      "Il castello, il boulevard des Pyrénées e i parchi di Pau uniscono storia del Béarn, arte e viste sulle montagne.",
      "O castelo, o Boulevard des Pyrénées e os parques de Pau combinam história do Béarn, arte e vistas para as montanhas.",
      "El castell, el boulevard des Pyrénées i els parcs de Pau combinen història del Bearn, art i vistes cap a les muntanyes."
    ],
    "recommendations": [
      [
        "Visitar el castillo de Pau",
        "Visit Pau Castle",
        "Visiter le château de Pau",
        "Das Schloss Pau besuchen",
        "Visitare il castello di Pau",
        "Visitar o castelo de Pau",
        "Visitar el castell de Pau"
      ],
      [
        "Pasear por el boulevard des Pyrénées",
        "Walk along Boulevard des Pyrénées",
        "Flâner sur le boulevard des Pyrénées",
        "Über den Boulevard des Pyrénées spazieren",
        "Passeggiare sul boulevard des Pyrénées",
        "Passear pelo Boulevard des Pyrénées",
        "Passejar pel boulevard des Pyrénées"
      ],
      [
        "Conocer el Museo de Bellas Artes",
        "Discover the Fine Arts Museum",
        "Découvrir le musée des Beaux-Arts",
        "Das Museum der Schönen Künste entdecken",
        "Scoprire il Museo di Belle Arti",
        "Conhecer o Museu de Belas-Artes",
        "Conèixer el Museu de Belles Arts"
      ],
      [
        "Recorrer el parque Beaumont",
        "Explore Parc Beaumont",
        "Parcourir le parc Beaumont",
        "Den Parc Beaumont erkunden",
        "Percorrere il parco Beaumont",
        "Percorrer o parque Beaumont",
        "Recórrer el parc Beaumont"
      ]
    ],
    "notes": [
      "PUF está en Uzein, fuera del centro de Pau. Prevé el traslado; las vistas de los Pirineos dependen de la visibilidad. Consulta avisos antes de excursiones por ríos o montañas.",
      "PUF is in Uzein, outside central Pau. Allow for a transfer; Pyrenean views depend on visibility. Check current notices before river or mountain outings.",
      "PUF est situé à Uzein, hors du centre de Pau. Prévoyez le transfert ; la vue sur les Pyrénées dépend de la visibilité. Consultez les avis avant les sorties en rivière ou en montagne.",
      "PUF liegt in Uzein außerhalb von Pau. Transfer einplanen; der Pyrenäenblick hängt von der Sicht ab. Vor Fluss- oder Bergausflügen Hinweise prüfen.",
      "PUF si trova a Uzein, fuori dal centro di Pau. Prevedi il trasferimento; le viste sui Pirenei dipendono dalla visibilità. Consulta gli avvisi prima di escursioni lungo i fiumi o in montagna.",
      "PUF fica em Uzein, fora do centro de Pau. Preveja o transporte; as vistas dos Pirenéus dependem da visibilidade. Consulte os avisos antes de passeios pelos rios ou montanhas.",
      "PUF és a Uzein, fora del centre de Pau. Preveu el trasllat; les vistes dels Pirineus depenen de la visibilitat. Consulta els avisos abans d’excursions per rius o muntanyes."
    ]
  },
  {
    "slug": "tours",
    "code": "TUF",
    "airport": "Tours Val de Loire",
    "aliases": [
      "Tours Val-de-Loire",
      "Tours Loire Valley",
      "Val de Loire Airport"
    ],
    "names": [
      "Tours",
      "Tours",
      "Tours",
      "Tours",
      "Tours",
      "Tours",
      "Tours"
    ],
    "stay": "2–3",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "La catedral, las plazas del Vieux-Tours y los museos presentan Tours como base urbana para descubrir el patrimonio del valle del Loira.",
      "The cathedral, Vieux-Tours squares and museums introduce Tours as an urban base for the heritage of the Loire Valley.",
      "La cathédrale, les places du Vieux-Tours et les musées présentent Tours comme point de départ urbain pour le patrimoine du Val de Loire.",
      "Kathedrale, Plätze von Vieux-Tours und Museen machen Tours zum städtischen Ausgangspunkt für das Kulturerbe des Loiretals.",
      "La cattedrale, le piazze del Vieux-Tours e i musei presentano Tours come base urbana per il patrimonio della Valle della Loira.",
      "A catedral, as praças de Vieux-Tours e os museus apresentam Tours como base urbana para o património do Vale do Loire.",
      "La catedral, les places del Vieux-Tours i els museus presenten Tours com a base urbana per descobrir el patrimoni de la vall del Loira."
    ],
    "recommendations": [
      [
        "Conocer la catedral de Saint-Gatien",
        "Discover Saint-Gatien Cathedral",
        "Découvrir la cathédrale Saint-Gatien",
        "Die Kathedrale Saint-Gatien entdecken",
        "Scoprire la cattedrale Saint-Gatien",
        "Conhecer a catedral de Saint-Gatien",
        "Conèixer la catedral de Saint-Gatien"
      ],
      [
        "Pasear por la plaza Plumereau y el Vieux-Tours",
        "Explore Place Plumereau and Vieux-Tours",
        "Flâner place Plumereau et dans le Vieux-Tours",
        "Place Plumereau und Vieux-Tours erkunden",
        "Passeggiare in place Plumereau e nel Vieux-Tours",
        "Passear pela Place Plumereau e por Vieux-Tours",
        "Passejar per la plaça Plumereau i el Vieux-Tours"
      ],
      [
        "Visitar el Museo del Compagnonnage",
        "Visit the Musée du Compagnonnage",
        "Visiter le musée du Compagnonnage",
        "Das Musée du Compagnonnage besuchen",
        "Visitare il Musée du Compagnonnage",
        "Visitar o Musée du Compagnonnage",
        "Visitar el Museu del Compagnonnage"
      ],
      [
        "Conocer el castillo de Tours",
        "Discover Tours Castle",
        "Découvrir le château de Tours",
        "Das Schloss Tours entdecken",
        "Scoprire il castello di Tours",
        "Conhecer o castelo de Tours",
        "Conèixer el castell de Tours"
      ]
    ],
    "notes": [
      "TUF está al norte de Tours, fuera del centro histórico. Organiza el traslado; los castillos de otras localidades del Loira requieren otro desplazamiento y comprobar su apertura.",
      "TUF is north of Tours, outside the historic centre. Arrange a transfer; Loire castles in other towns require additional travel and checks on opening times.",
      "TUF se trouve au nord de Tours, hors du centre historique. Organisez le transfert ; les châteaux des autres communes du Val de Loire nécessitent un déplacement et une vérification des ouvertures.",
      "TUF liegt nördlich von Tours außerhalb der Altstadt. Transfer planen; Schlösser in anderen Orten des Loiretals erfordern weitere Fahrten und eine Prüfung der Öffnungszeiten.",
      "TUF si trova a nord di Tours, fuori dal centro storico. Organizza il trasferimento; i castelli di altre località della Loira richiedono altri spostamenti e verifiche sulle aperture.",
      "TUF fica a norte de Tours, fora do centro histórico. Organize o transporte; os castelos noutras localidades do Loire exigem outra deslocação e consulta das aberturas.",
      "TUF és al nord de Tours, fora del centre històric. Organitza el trasllat; els castells d’altres localitats del Loira requereixen un altre desplaçament i comprovar-ne l’obertura."
    ]
  },
  {
    "slug": "chambery",
    "code": "CMF",
    "airport": "Chambéry Savoie Mont Blanc",
    "aliases": [
      "Chambery",
      "Chambéry Aix-les-Bains",
      "Chambery Aix les Bains",
      "Chambéry Savoie"
    ],
    "names": [
      "Chambéry",
      "Chambéry",
      "Chambéry",
      "Chambéry",
      "Chambéry",
      "Chambéry",
      "Chambéry"
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      7,
      8,
      9
    ],
    "low": [
      11
    ],
    "descriptions": [
      "El castillo de los duques, la fuente de los Elefantes y los pasajes del casco antiguo muestran Chambéry entre patrimonio saboyano y montañas.",
      "The ducal castle, Elephant Fountain and old-town passages reveal Chambéry between Savoyard heritage and mountain scenery.",
      "Le château des ducs, la fontaine des Éléphants et les allées du centre ancien présentent Chambéry entre patrimoine savoyard et montagnes.",
      "Herzogsschloss, Elefantenbrunnen und Altstadtpassagen zeigen Chambéry zwischen savoyischem Erbe und Berglandschaft.",
      "Il castello dei duchi, la Fontana degli Elefanti e i passaggi del centro storico raccontano Chambéry tra patrimonio savoiardo e montagne.",
      "O castelo dos duques, a Fonte dos Elefantes e as passagens do centro antigo mostram Chambéry entre património saboiano e montanhas.",
      "El castell dels ducs, la font dels Elefants i els passatges del nucli antic mostren Chambéry entre patrimoni savoià i muntanyes."
    ],
    "recommendations": [
      [
        "Conocer el castillo de los duques de Saboya",
        "Discover the Castle of the Dukes of Savoy",
        "Découvrir le château des ducs de Savoie",
        "Das Schloss der Herzöge von Savoyen entdecken",
        "Scoprire il castello dei duchi di Savoia",
        "Conhecer o castelo dos duques de Saboia",
        "Conèixer el castell dels ducs de Savoia"
      ],
      [
        "Contemplar la fuente de los Elefantes",
        "See the Elephant Fountain",
        "Contempler la fontaine des Éléphants",
        "Den Elefantenbrunnen betrachten",
        "Ammirare la Fontana degli Elefanti",
        "Contemplar a Fonte dos Elefantes",
        "Contemplar la font dels Elefants"
      ],
      [
        "Visitar la catedral de Saint-François-de-Sales",
        "Visit Saint-François-de-Sales Cathedral",
        "Visiter la cathédrale Saint-François-de-Sales",
        "Die Kathedrale Saint-François-de-Sales besuchen",
        "Visitare la cattedrale Saint-François-de-Sales",
        "Visitar a catedral de Saint-François-de-Sales",
        "Visitar la catedral de Saint-François-de-Sales"
      ],
      [
        "Recorrer la plaza Saint-Léger y los pasajes históricos",
        "Explore Place Saint-Léger and historic passages",
        "Parcourir la place Saint-Léger et les allées historiques",
        "Place Saint-Léger und historische Passagen erkunden",
        "Percorrere place Saint-Léger e i passaggi storici",
        "Percorrer a Place Saint-Léger e as passagens históricas",
        "Recórrer la plaça Saint-Léger i els passatges històrics"
      ]
    ],
    "notes": [
      "CMF está junto a Voglans y Viviers-du-Lac, fuera del centro de Chambéry. La oferta aérea es especialmente invernal; confirma vuelos y traslado para tus fechas. Las excursiones a los Alpes requieren planificación aparte.",
      "CMF is near Voglans and Viviers-du-Lac, outside central Chambéry. Air services are particularly winter-focused; confirm flights and transfers for your dates. Alpine excursions need separate planning.",
      "CMF est situé près de Voglans et Viviers-du-Lac, hors du centre de Chambéry. L’offre aérienne est surtout hivernale ; confirmez vols et transferts pour vos dates. Les excursions alpines demandent une préparation distincte.",
      "CMF liegt bei Voglans und Viviers-du-Lac außerhalb von Chambéry. Das Flugangebot ist besonders auf den Winter ausgerichtet; Flüge und Transfer prüfen. Alpenausflüge separat planen.",
      "CMF si trova presso Voglans e Viviers-du-Lac, fuori Chambéry. L’offerta aerea è soprattutto invernale; conferma voli e trasferimenti per le tue date. Le escursioni alpine richiedono una pianificazione separata.",
      "CMF fica junto a Voglans e Viviers-du-Lac, fora do centro de Chambéry. A oferta aérea concentra-se no inverno; confirme voos e transportes para as suas datas. As excursões alpinas exigem planeamento próprio.",
      "CMF és prop de Voglans i Viviers-du-Lac, fora del centre de Chambéry. L’oferta aèria és sobretot hivernal; confirma vols i trasllats per a les teves dates. Les excursions als Alps requereixen planificació pròpia."
    ]
  },
  {
    "slug": "rodez",
    "code": "RDZ",
    "airport": "Rodez Aveyron",
    "aliases": [
      "Rodez-Aveyron",
      "Rodez Marcillac",
      "Rodez Marcillac Airport",
      "Marcillac Airport"
    ],
    "names": [
      "Rodez",
      "Rodez",
      "Rodez",
      "Rodez",
      "Rodez",
      "Rodez",
      "Rodez"
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      7,
      8,
      9
    ],
    "low": [
      1,
      2,
      11
    ],
    "descriptions": [
      "La catedral, las plazas históricas y los museos Soulages y Fenaille permiten conocer Rodez entre patrimonio del Rouergue y creación artística.",
      "The cathedral, historic squares and Soulages and Fenaille museums introduce Rodez through Rouergue heritage and artistic creation.",
      "La cathédrale, les places historiques et les musées Soulages et Fenaille font découvrir Rodez entre patrimoine du Rouergue et création artistique.",
      "Kathedrale, historische Plätze sowie die Museen Soulages und Fenaille erschließen Rodez zwischen dem Erbe des Rouergue und Kunst.",
      "La cattedrale, le piazze storiche e i musei Soulages e Fenaille presentano Rodez tra patrimonio del Rouergue e creazione artistica.",
      "A catedral, as praças históricas e os museus Soulages e Fenaille revelam Rodez entre património do Rouergue e criação artística.",
      "La catedral, les places històriques i els museus Soulages i Fenaille permeten conèixer Rodés entre patrimoni del Roergue i creació artística."
    ],
    "recommendations": [
      [
        "Conocer la catedral de Notre-Dame",
        "Discover Notre-Dame Cathedral",
        "Découvrir la cathédrale Notre-Dame",
        "Die Kathedrale Notre-Dame entdecken",
        "Scoprire la cattedrale Notre-Dame",
        "Conhecer a catedral de Notre-Dame",
        "Conèixer la catedral de Notre-Dame"
      ],
      [
        "Visitar el Museo Soulages",
        "Visit the Soulages Museum",
        "Visiter le musée Soulages",
        "Das Museum Soulages besuchen",
        "Visitare il Museo Soulages",
        "Visitar o Museu Soulages",
        "Visitar el Museu Soulages"
      ],
      [
        "Descubrir el Museo Fenaille",
        "Discover the Fenaille Museum",
        "Découvrir le musée Fenaille",
        "Das Museum Fenaille entdecken",
        "Scoprire il Museo Fenaille",
        "Conhecer o Museu Fenaille",
        "Descobrir el Museu Fenaille"
      ],
      [
        "Pasear por la plaza del Bourg y el centro antiguo",
        "Explore Place du Bourg and the old town",
        "Flâner place du Bourg et dans le centre ancien",
        "Place du Bourg und die Altstadt erkunden",
        "Passeggiare in place du Bourg e nel centro antico",
        "Passear pela Place du Bourg e pelo centro antigo",
        "Passejar per la plaça del Bourg i el nucli antic"
      ]
    ],
    "notes": [
      "RDZ está en Salles-la-Source, fuera de Rodez. Prevé el traslado y confirma la programación de vuelos y museos; el casco antiguo tiene pendientes y pavimento irregular.",
      "RDZ is in Salles-la-Source, outside Rodez. Allow for a transfer and check flight and museum schedules; the old town has slopes and uneven paving.",
      "RDZ se trouve à Salles-la-Source, hors de Rodez. Prévoyez le transfert et vérifiez les programmes des vols et musées ; le centre ancien comporte des pentes et des pavés.",
      "RDZ liegt in Salles-la-Source außerhalb von Rodez. Transfer sowie Flug- und Museumszeiten prüfen; in der Altstadt gibt es Steigungen und unebenes Pflaster.",
      "RDZ si trova a Salles-la-Source, fuori Rodez. Prevedi il trasferimento e verifica programmi di voli e musei; il centro antico presenta salite e pavimentazione irregolare.",
      "RDZ fica em Salles-la-Source, fora de Rodez. Preveja o transporte e confirme os programas de voos e museus; o centro antigo tem subidas e piso irregular.",
      "RDZ és a Salles-la-Source, fora de Rodés. Preveu el trasllat i confirma els programes de vols i museus; el nucli antic té pendents i paviment irregular."
    ]
  },
  {
    "slug": "metz",
    "code": "ETZ",
    "airport": "Metz-Nancy-Lorraine",
    "aliases": [
      "Metz-Nancy",
      "Nancy",
      "Goin",
      "Lorraine",
      "Lorraine Airport",
      "Lorraine Aéroport",
      "Metz Nancy Lorraine Airport"
    ],
    "names": [
      "Metz",
      "Metz",
      "Metz",
      "Metz",
      "Metz",
      "Metz",
      "Metz"
    ],
    "descriptions": [
      "La catedral de Saint-Étienne, famosa por sus vidrieras, el Temple Neuf junto al Mosela y el Centre Pompidou-Metz marcan una ciudad de piedra amarilla fácil de recorrer a pie.",
      "Saint-Étienne Cathedral, famed for its stained glass, the Temple Neuf by the Moselle and the Centre Pompidou-Metz mark a yellow-stone city that is easy to explore on foot.",
      "La cathédrale Saint-Étienne, célèbre pour ses vitraux, le Temple Neuf au bord de la Moselle et le Centre Pompidou-Metz marquent une ville de pierre jaune facile à parcourir à pied.",
      "Die für ihre Glasfenster berühmte Kathedrale Saint-Étienne, der Temple Neuf an der Mosel und das Centre Pompidou-Metz prägen eine Stadt aus gelbem Stein, die sich gut zu Fuß erkunden lässt.",
      "La cattedrale di Saint-Étienne, famosa per le vetrate, il Temple Neuf sulla Mosella e il Centre Pompidou-Metz caratterizzano una città di pietra gialla facile da visitare a piedi.",
      "A catedral de Saint-Étienne, famosa pelos vitrais, o Temple Neuf junto ao Mosela e o Centre Pompidou-Metz marcam uma cidade de pedra amarela fácil de percorrer a pé.",
      "La catedral de Saint-Étienne, famosa pels vitralls, el Temple Neuf vora el Mosel·la i el Centre Pompidou-Metz marquen una ciutat de pedra groga fàcil de recórrer a peu."
    ],
    "recommendations": [
      [
        "Visitar la catedral de Saint-Étienne",
        "Visit Saint-Étienne Cathedral",
        "Visiter la cathédrale Saint-Étienne",
        "Die Kathedrale Saint-Étienne besuchen",
        "Visitare la cattedrale di Saint-Étienne",
        "Visitar a catedral de Saint-Étienne",
        "Visitar la catedral de Saint-Étienne"
      ],
      [
        "Ver el Centre Pompidou-Metz",
        "See the Centre Pompidou-Metz",
        "Voir le Centre Pompidou-Metz",
        "Das Centre Pompidou-Metz ansehen",
        "Vedere il Centre Pompidou-Metz",
        "Ver o Centre Pompidou-Metz",
        "Veure el Centre Pompidou-Metz"
      ],
      [
        "Pasear por la place Saint-Louis",
        "Stroll through Place Saint-Louis",
        "Flâner place Saint-Louis",
        "Über die Place Saint-Louis schlendern",
        "Passeggiare in place Saint-Louis",
        "Passear pela Place Saint-Louis",
        "Passejar per la place Saint-Louis"
      ],
      [
        "Caminar por el Temple Neuf y el Mosela",
        "Walk to the Temple Neuf and the Moselle",
        "Marcher jusqu’au Temple Neuf et à la Moselle",
        "Zum Temple Neuf und an die Mosel spazieren",
        "Camminare fino al Temple Neuf e alla Mosella",
        "Caminhar até ao Temple Neuf e ao Mosela",
        "Caminar fins al Temple Neuf i al Mosel·la"
      ]
    ],
    "notes": [
      "ETZ está en Goin, entre Metz y Nancy y a cierta distancia de ambas. Prevé el traslado por carretera; Nancy también queda a un trayecto.",
      "ETZ is in Goin, between Metz and Nancy and some distance from both. Allow for a road transfer; Nancy is also a separate trip.",
      "ETZ est situé à Goin, entre Metz et Nancy, à distance des deux villes. Prévoyez un transfert routier ; Nancy est aussi un trajet à part.",
      "ETZ liegt in Goin zwischen Metz und Nancy, in einiger Entfernung von beiden Städten. Einen Straßentransfer einplanen; auch Nancy ist eine eigene Fahrt.",
      "ETZ si trova a Goin, tra Metz e Nancy, a una certa distanza da entrambe. Prevedi un trasferimento su strada; anche Nancy richiede un altro tragitto.",
      "ETZ fica em Goin, entre Metz e Nancy, a alguma distância de ambas. Preveja o transporte rodoviário; Nancy também implica outro trajeto.",
      "ETZ és a Goin, entre Metz i Nancy, a certa distància de totes dues. Preveu el trasllat per carretera; Nancy també requereix un trajecte a part."
    ],
    "stay": "2–3",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11
    ]
  },
  {
    "slug": "brive-la-gaillarde",
    "code": "BVE",
    "airport": "Brive Vallée de la Dordogne",
    "aliases": [
      "Brive",
      "Brive-la-Gaillarde",
      "Brive Vallée de la Dordogne",
      "Brive-Souillac",
      "Souillac",
      "Nespouls",
      "Cressensac",
      "Laroche Airport"
    ],
    "names": [
      "Brive-la-Gaillarde",
      "Brive-la-Gaillarde",
      "Brive-la-Gaillarde",
      "Brive-la-Gaillarde",
      "Brive-la-Gaillarde",
      "Brive-la-Gaillarde",
      "Brive-la-Gaillarde"
    ],
    "descriptions": [
      "La place Latreille, la colegiata de Saint-Martin y un mercado cubierto muy animado hacen de Brive una base tranquila para entrar en la Corrèze y el valle de la Dordoña.",
      "Place Latreille, the Collégiale Saint-Martin and a lively covered market make Brive a relaxed base for the Corrèze and the Dordogne valley.",
      "La place Latreille, la collégiale Saint-Martin et une halle de marché très animée font de Brive une base paisible pour explorer la Corrèze et la vallée de la Dordogne.",
      "Die Place Latreille, die Stiftskirche Saint-Martin und eine lebhafte Markthalle machen Brive zu einem entspannten Standort für die Corrèze und das Dordogne-Tal.",
      "Place Latreille, la collegiata di Saint-Martin e un mercato coperto molto vivace rendono Brive una base tranquilla per scoprire la Corrèze e la valle della Dordogna.",
      "A Place Latreille, a colegiada de Saint-Martin e um mercado coberto muito animado fazem de Brive uma base tranquila para conhecer a Corrèze e o vale do Dordonha.",
      "La place Latreille, la col·legiata de Saint-Martin i un mercat cobert molt animat fan de Brive una base tranquil·la per descobrir la Corrèze i la vall de la Dordonya."
    ],
    "recommendations": [
      [
        "Visitar la colegiata de Saint-Martin",
        "Visit the Collégiale Saint-Martin",
        "Visiter la collégiale Saint-Martin",
        "Die Stiftskirche Saint-Martin besuchen",
        "Visitare la collegiata di Saint-Martin",
        "Visitar a colegiada de Saint-Martin",
        "Visitar la col·legiata de Saint-Martin"
      ],
      [
        "Pasear por la place Latreille",
        "Stroll through Place Latreille",
        "Flâner place Latreille",
        "Über die Place Latreille schlendern",
        "Passeggiare in place Latreille",
        "Passear pela Place Latreille",
        "Passejar per la place Latreille"
      ],
      [
        "Entrar en la halle Georges-Brassens",
        "Step inside the Halle Georges-Brassens",
        "Entrer dans la halle Georges-Brassens",
        "Die Halle Georges-Brassens besuchen",
        "Entrare nella halle Georges-Brassens",
        "Entrar na Halle Georges-Brassens",
        "Entrar a la halle Georges-Brassens"
      ],
      [
        "Conocer el Museo Labenche",
        "Discover the Musée Labenche",
        "Découvrir le musée Labenche",
        "Das Musée Labenche entdecken",
        "Scoprire il Musée Labenche",
        "Conhecer o Musée Labenche",
        "Conèixer el Musée Labenche"
      ]
    ],
    "notes": [
      "BVE está en Nespouls, junto a Cressensac y fuera de Brive; su denominación aeronáutica es Brive–Souillac. Prevé el traslado terrestre.",
      "BVE is in Nespouls, next to Cressensac and outside Brive; its aeronautical name is Brive–Souillac. Allow for a ground transfer.",
      "BVE se trouve à Nespouls, près de Cressensac et hors de Brive ; sa dénomination aéronautique est Brive–Souillac. Prévoyez un transfert terrestre.",
      "BVE liegt in Nespouls bei Cressensac, außerhalb von Brive; die luftfahrtrechtliche Bezeichnung lautet Brive–Souillac. Einen Landtransfer einplanen.",
      "BVE si trova a Nespouls, vicino a Cressensac e fuori da Brive; la denominazione aeronautica è Brive–Souillac. Prevedi il trasferimento via terra.",
      "BVE fica em Nespouls, junto a Cressensac e fora de Brive; a designação aeronáutica é Brive–Souillac. Preveja o transporte terrestre.",
      "BVE és a Nespouls, a prop de Cressensac i fora de Brive; la denominació aeronàutica és Brive–Souillac. Preveu el trasllat terrestre."
    ],
    "stay": "2",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  },
  {
    "slug": "dole",
    "code": "DLE",
    "airport": "Dole Jura",
    "aliases": [
      "Dole-Jura",
      "Dole Jura",
      "Dole-Tavaux",
      "Tavaux",
      "Dole Jura Airport",
      "Dole-Jura Airport"
    ],
    "names": [
      "Dole",
      "Dole",
      "Dole",
      "Dole",
      "Dole",
      "Dole",
      "Dole"
    ],
    "descriptions": [
      "Ciudad natal de Louis Pasteur, Dole se recorre entre canales, tejados de teja y la colegiata de Notre-Dame que domina el casco antiguo.",
      "Birthplace of Louis Pasteur, Dole is best explored among canals, tiled roofs and the Collegiate Church of Notre-Dame above the old town.",
      "Ville natale de Louis Pasteur, Dole se découvre entre canaux, toits de tuiles et la collégiale Notre-Dame qui domine la vieille ville.",
      "Dole, der Geburtsort von Louis Pasteur, lässt sich zwischen Kanälen, Ziegeldächern und der Stiftskirche Notre-Dame über der Altstadt erkunden.",
      "Città natale di Louis Pasteur, Dole si scopre tra canali, tetti di tegole e la collegiata di Notre-Dame che domina il centro storico.",
      "Terra natal de Louis Pasteur, Dole descobre-se entre canais, telhados de telha e a colegiada de Notre-Dame que domina o centro histórico.",
      "Ciutat natal de Louis Pasteur, Dole es descobreix entre canals, teulades de teula i la col·legiata de Notre-Dame que domina el nucli antic."
    ],
    "recommendations": [
      [
        "Visitar la colegiata de Notre-Dame",
        "Visit the Collegiate Church of Notre-Dame",
        "Visiter la collégiale Notre-Dame",
        "Die Stiftskirche Notre-Dame besuchen",
        "Visitare la collegiata di Notre-Dame",
        "Visitar a colegiada de Notre-Dame",
        "Visitar la col·legiata de Notre-Dame"
      ],
      [
        "Pasear por el canal des Tanneurs",
        "Walk along the Canal des Tanneurs",
        "Longer le canal des Tanneurs",
        "Am Canal des Tanneurs entlang spazieren",
        "Passeggiare lungo il canal des Tanneurs",
        "Passear ao longo do Canal des Tanneurs",
        "Passejar pel canal des Tanneurs"
      ],
      [
        "Conocer la casa natal de Pasteur",
        "See Pasteur’s birthplace",
        "Voir la maison natale de Pasteur",
        "Das Geburtshaus von Pasteur ansehen",
        "Vedere la casa natale di Pasteur",
        "Ver a casa natal de Pasteur",
        "Veure la casa natal de Pasteur"
      ],
      [
        "Recorrer el casco antiguo",
        "Explore the old town",
        "Parcourir la vieille ville",
        "Die Altstadt erkunden",
        "Esplorare il centro storico",
        "Percorrer o centro histórico",
        "Recórrer el nucli antic"
      ]
    ],
    "notes": [
      "DLE está en Tavaux, fuera de Dole. Prevé el traslado terrestre; Dijon y Besançon quedan a otro trayecto y no tienen aquí ficha propia.",
      "DLE is in Tavaux, outside Dole. Allow for a ground transfer; Dijon and Besançon are separate journeys and have no profile here.",
      "DLE se trouve à Tavaux, hors de Dole. Prévoyez un transfert terrestre ; Dijon et Besançon sont des trajets distincts, sans fiche ici.",
      "DLE liegt in Tavaux außerhalb von Dole. Einen Landtransfer einplanen; Dijon und Besançon sind eigene Fahrten und haben hier kein eigenes Profil.",
      "DLE si trova a Tavaux, fuori da Dole. Prevedi il trasferimento via terra; Digione e Besançon richiedono altri tragitti e qui non hanno una scheda propria.",
      "DLE fica em Tavaux, fora de Dole. Preveja o transporte terrestre; Dijon e Besançon são outros trajetos e não têm aqui ficha própria.",
      "DLE és a Tavaux, fora de Dole. Preveu el trasllat terrestre; Dijon i Besançon són trajectes a part i aquí no tenen fitxa pròpia."
    ],
    "stay": "1–2",
    "best": [
      5,
      6,
      9
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  },
  {
    "slug": "poitiers",
    "code": "PIS",
    "airport": "Poitiers-Biard",
    "aliases": [
      "Poitiers-Biard",
      "Poitiers Biard",
      "Biard",
      "Poitiers Airport",
      "Poitiers-Biard Airport"
    ],
    "names": [
      "Poitiers",
      "Poitiers",
      "Poitiers",
      "Poitiers",
      "Poitiers",
      "Poitiers",
      "Poitiers"
    ],
    "descriptions": [
      "Iglesias románicas, el baptisterio más antiguo de Francia y el palacio de los duques de Aquitania convierten Poitiers en una escapada de historia y arte.",
      "Romanesque churches, one of France’s oldest baptisteries and the palace of the Dukes of Aquitaine make Poitiers a break full of history and art.",
      "Églises romanes, l’un des plus anciens baptistères de France et le palais des ducs d’Aquitaine font de Poitiers une escapade d’histoire et d’art.",
      "Romanische Kirchen, eines der ältesten Baptisterien Frankreichs und der Palast der Herzöge von Aquitanien machen Poitiers zu einem Ausflug voller Geschichte und Kunst.",
      "Chiese romaniche, uno dei battisteri più antichi di Francia e il palazzo dei duchi d’Aquitania fanno di Poitiers una gita ricca di storia e arte.",
      "Igrejas românicas, um dos batistérios mais antigos de França e o palácio dos duques da Aquitânia fazem de Poitiers uma escapadela de história e arte.",
      "Esglésies romàniques, un dels baptisteris més antics de França i el palau dels ducs d’Aquitània fan de Poitiers una escapada d’història i art."
    ],
    "recommendations": [
      [
        "Admirar Notre-Dame-la-Grande",
        "Admire Notre-Dame-la-Grande",
        "Admirer Notre-Dame-la-Grande",
        "Notre-Dame-la-Grande bewundern",
        "Ammirare Notre-Dame-la-Grande",
        "Admirar Notre-Dame-la-Grande",
        "Admirar Notre-Dame-la-Grande"
      ],
      [
        "Visitar el baptisterio de Saint-Jean",
        "Visit the Baptistère Saint-Jean",
        "Visiter le baptistère Saint-Jean",
        "Das Baptisterium Saint-Jean besuchen",
        "Visitare il battistero di Saint-Jean",
        "Visitar o Batistério de Saint-Jean",
        "Visitar el baptisteri de Saint-Jean"
      ],
      [
        "Ver el palacio de los duques de Aquitania",
        "See the Palace of the Dukes of Aquitaine",
        "Voir le palais des ducs d’Aquitaine",
        "Den Palast der Herzöge von Aquitanien ansehen",
        "Vedere il palazzo dei duchi d’Aquitania",
        "Ver o palácio dos duques da Aquitânia",
        "Veure el palau dels ducs d’Aquitània"
      ],
      [
        "Entrar en la catedral de Saint-Pierre",
        "Step inside Saint-Pierre Cathedral",
        "Entrer dans la cathédrale Saint-Pierre",
        "Die Kathedrale Saint-Pierre besichtigen",
        "Entrare nella cattedrale di Saint-Pierre",
        "Entrar na catedral de Saint-Pierre",
        "Entrar a la catedral de Saint-Pierre"
      ]
    ],
    "notes": [
      "PIS está en Biard, fuera del centro de Poitiers. Prevé el traslado terrestre y comprueba los horarios de visita de los monumentos.",
      "PIS is in Biard, outside central Poitiers. Allow for a ground transfer and check monument opening times.",
      "PIS est situé à Biard, hors du centre de Poitiers. Prévoyez un transfert terrestre et vérifiez les horaires de visite des monuments.",
      "PIS liegt in Biard außerhalb des Zentrums von Poitiers. Einen Landtransfer einplanen und die Öffnungszeiten der Denkmäler prüfen.",
      "PIS si trova a Biard, fuori dal centro di Poitiers. Prevedi il trasferimento via terra e verifica gli orari di visita dei monumenti.",
      "PIS fica em Biard, fora do centro de Poitiers. Preveja o transporte terrestre e confirme os horários de visita dos monumentos.",
      "PIS és a Biard, fora del centre de Poitiers. Preveu el trasllat terrestre i comprova els horaris de visita dels monuments."
    ],
    "stay": "2",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  },
  {
    "slug": "chalons-en-champagne",
    "code": "XCR",
    "airport": "Châlons-Vatry",
    "aliases": [
      "Châlons",
      "Chalons",
      "Chalons-en-Champagne",
      "Châlons-Vatry",
      "Chalons Vatry",
      "Paris-Vatry",
      "Paris Vatry",
      "Vatry",
      "Bussy-Lettrée",
      "XCR Airport",
      "Chalons Vatry Airport"
    ],
    "names": [
      "Châlons-en-Champagne",
      "Châlons-en-Champagne",
      "Châlons-en-Champagne",
      "Châlons-en-Champagne",
      "Châlons-en-Champagne",
      "Châlons-en-Champagne",
      "Châlons-en-Champagne"
    ],
    "descriptions": [
      "Canales, jardines y dos grandes iglesias, la catedral de Saint-Étienne y Notre-Dame-en-Vaux, dan a Châlons-en-Champagne un ritmo sosegado en el corazón de la región vinícola.",
      "Canals, gardens and two great churches, Saint-Étienne Cathedral and Notre-Dame-en-Vaux, give Châlons-en-Champagne a calm pace in the heart of the wine region.",
      "Canaux, jardins et deux grandes églises, la cathédrale Saint-Étienne et Notre-Dame-en-Vaux, donnent à Châlons-en-Champagne un rythme paisible au cœur de la région viticole.",
      "Kanäle, Gärten und zwei große Kirchen, die Kathedrale Saint-Étienne und Notre-Dame-en-Vaux, verleihen Châlons-en-Champagne ein ruhiges Tempo im Herzen der Weinregion.",
      "Canali, giardini e due grandi chiese, la cattedrale di Saint-Étienne e Notre-Dame-en-Vaux, danno a Châlons-en-Champagne un ritmo tranquillo nel cuore della regione vinicola.",
      "Canais, jardins e duas grandes igrejas, a catedral de Saint-Étienne e Notre-Dame-en-Vaux, dão a Châlons-en-Champagne um ritmo tranquilo no coração da região vinícola.",
      "Canals, jardins i dues grans esglésies, la catedral de Saint-Étienne i Notre-Dame-en-Vaux, donen a Châlons-en-Champagne un ritme assossegat al cor de la regió vinícola."
    ],
    "recommendations": [
      [
        "Visitar Notre-Dame-en-Vaux",
        "Visit Notre-Dame-en-Vaux",
        "Visiter Notre-Dame-en-Vaux",
        "Notre-Dame-en-Vaux besuchen",
        "Visitare Notre-Dame-en-Vaux",
        "Visitar Notre-Dame-en-Vaux",
        "Visitar Notre-Dame-en-Vaux"
      ],
      [
        "Entrar en la catedral de Saint-Étienne",
        "Step inside Saint-Étienne Cathedral",
        "Entrer dans la cathédrale Saint-Étienne",
        "Die Kathedrale Saint-Étienne besichtigen",
        "Entrare nella cattedrale di Saint-Étienne",
        "Entrar na catedral de Saint-Étienne",
        "Entrar a la catedral de Saint-Étienne"
      ],
      [
        "Pasear por el Jard",
        "Stroll through the Jard gardens",
        "Se promener au Jard",
        "Durch den Jard spazieren",
        "Passeggiare nel Jard",
        "Passear pelo Jard",
        "Passejar pel Jard"
      ],
      [
        "Caminar junto a los canales",
        "Walk beside the canals",
        "Marcher le long des canaux",
        "An den Kanälen entlang gehen",
        "Camminare lungo i canali",
        "Caminhar junto aos canais",
        "Caminar vora els canals"
      ]
    ],
    "notes": [
      "XCR está en Bussy-Lettrée, lejos del centro de Châlons y de París pese a su antigua marca Paris-Vatry. Prevé el traslado terrestre.",
      "XCR is in Bussy-Lettrée, far from central Châlons and from Paris despite its former Paris-Vatry brand. Allow for a ground transfer.",
      "XCR se trouve à Bussy-Lettrée, loin du centre de Châlons et de Paris malgré son ancienne marque Paris-Vatry. Prévoyez un transfert terrestre.",
      "XCR liegt in Bussy-Lettrée, weit vom Zentrum von Châlons und von Paris entfernt, trotz der früheren Marke Paris-Vatry. Einen Landtransfer einplanen.",
      "XCR si trova a Bussy-Lettrée, lontano dal centro di Châlons e da Parigi nonostante l’antico marchio Paris-Vatry. Prevedi il trasferimento via terra.",
      "XCR fica em Bussy-Lettrée, longe do centro de Châlons e de Paris apesar da antiga marca Paris-Vatry. Preveja o transporte terrestre.",
      "XCR és a Bussy-Lettrée, lluny del centre de Châlons i de París malgrat l’antiga marca Paris-Vatry. Preveu el trasllat terrestre."
    ],
    "stay": "1–2",
    "best": [
      5,
      6,
      9
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  },
  {
    "slug": "deauville",
    "code": "DOL",
    "airport": "Deauville–Normandie",
    "aliases": [
      "Deauville-Normandie",
      "Deauville Normandie",
      "Saint-Gatien",
      "Saint-Gatien-des-Bois",
      "Trouville",
      "Trouville-sur-Mer",
      "Deauville Airport",
      "Saint Gatien Airport"
    ],
    "names": [
      "Deauville",
      "Deauville",
      "Deauville",
      "Deauville",
      "Deauville",
      "Deauville",
      "Deauville"
    ],
    "descriptions": [
      "Las Planches, sus casetas de playa con nombres de estrellas de cine y una larga arena frente al Canal de la Mancha definen este elegante balneario normando.",
      "The Planches boardwalk, its beach cabins named after film stars and a long beach on the English Channel define this elegant Normandy seaside resort.",
      "Les Planches, leurs cabines de plage aux noms de vedettes de cinéma et une longue plage face à la Manche définissent cette élégante station balnéaire normande.",
      "Die Planches, ihre nach Filmstars benannten Strandkabinen und ein langer Strand am Ärmelkanal prägen diesen eleganten normannischen Badeort.",
      "Le Planches, con le cabine da spiaggia intitolate a star del cinema, e una lunga spiaggia sulla Manica definiscono questa elegante località balneare normanna.",
      "As Planches, com cabines de praia com nomes de estrelas de cinema, e uma longa praia no Canal da Mancha definem esta elegante estância balnear normanda.",
      "Les Planches, amb les casetes de platja amb noms d’estrelles de cinema, i una llarga platja al canal de la Mànega defineixen aquesta elegant localitat costanera normanda."
    ],
    "recommendations": [
      [
        "Pasear por Les Planches",
        "Stroll along Les Planches",
        "Se promener sur les Planches",
        "Über Les Planches spazieren",
        "Passeggiare lungo Les Planches",
        "Passear por Les Planches",
        "Passejar per Les Planches"
      ],
      [
        "Ver las casetas de playa",
        "See the beach cabins",
        "Voir les cabines de plage",
        "Die Strandkabinen ansehen",
        "Vedere le cabine da spiaggia",
        "Ver as cabines de praia",
        "Veure les casetes de platja"
      ],
      [
        "Cruzar a Trouville-sur-Mer",
        "Cross to Trouville-sur-Mer",
        "Traverser vers Trouville-sur-Mer",
        "Nach Trouville-sur-Mer hinübergehen",
        "Attraversare fino a Trouville-sur-Mer",
        "Atravessar até Trouville-sur-Mer",
        "Creuar fins a Trouville-sur-Mer"
      ],
      [
        "Conocer el hipódromo de La Touques",
        "See the La Touques racecourse",
        "Découvrir l’hippodrome de La Touques",
        "Die Rennbahn La Touques kennenlernen",
        "Scoprire l’ippodromo di La Touques",
        "Conhecer o hipódromo de La Touques",
        "Conèixer l’hipòdrom de La Touques"
      ]
    ],
    "notes": [
      "DOL está en Saint-Gatien-des-Bois, fuera de Deauville. Prevé el traslado terrestre; las fechas de las carreras y la oferta de vuelos cambian por temporada.",
      "DOL is in Saint-Gatien-des-Bois, outside Deauville. Allow for a ground transfer; race dates and flight offers change by season.",
      "DOL se trouve à Saint-Gatien-des-Bois, hors de Deauville. Prévoyez un transfert terrestre ; les dates des courses et l’offre de vols varient selon la saison.",
      "DOL liegt in Saint-Gatien-des-Bois außerhalb von Deauville. Einen Landtransfer einplanen; Renntermine und Flugangebot wechseln je nach Saison.",
      "DOL si trova a Saint-Gatien-des-Bois, fuori da Deauville. Prevedi il trasferimento via terra; le date delle corse e l’offerta di voli cambiano in base alla stagione.",
      "DOL fica em Saint-Gatien-des-Bois, fora de Deauville. Preveja o transporte terrestre; as datas das corridas e a oferta de voos mudam conforme a época.",
      "DOL és a Saint-Gatien-des-Bois, fora de Deauville. Preveu el trasllat terrestre; les dates de les curses i l’oferta de vols canvien segons la temporada."
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      9
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  },
  {
    "slug": "castres",
    "code": "DCM",
    "airport": "Castres-Mazamet",
    "aliases": [
      "Castres-Mazamet",
      "Castres Mazamet",
      "Mazamet",
      "Le Causse",
      "Castres Airport",
      "Mazamet Airport"
    ],
    "names": [
      "Castres",
      "Castres",
      "Castres",
      "Castres",
      "Castres",
      "Castres",
      "Castres"
    ],
    "descriptions": [
      "Las casas de colores colgadas sobre el Agout, el museo dedicado a Goya y los jardines del antiguo palacio episcopal dan a Castres un encanto sereno en el Tarn.",
      "Colourful houses overhanging the Agout, a museum devoted to Goya and the gardens of the former bishop’s palace give Castres a serene charm in the Tarn.",
      "Les maisons colorées suspendues au-dessus de l’Agout, le musée consacré à Goya et les jardins de l’ancien palais épiscopal donnent à Castres un charme serein dans le Tarn.",
      "Die bunten Häuser über dem Agout, ein Goya gewidmetes Museum und die Gärten des ehemaligen Bischofspalasts verleihen Castres im Tarn einen ruhigen Charme.",
      "Le case colorate sospese sull’Agout, il museo dedicato a Goya e i giardini dell’antico palazzo episcopale danno a Castres un fascino sereno nel Tarn.",
      "As casas coloridas suspensas sobre o Agout, o museu dedicado a Goya e os jardins do antigo palácio episcopal dão a Castres um encanto sereno no Tarn.",
      "Les cases de colors penjades sobre l’Agout, el museu dedicat a Goya i els jardins de l’antic palau episcopal donen a Castres un encant serè al Tarn."
    ],
    "recommendations": [
      [
        "Ver las casas sobre el Agout",
        "See the houses over the Agout",
        "Voir les maisons sur l’Agout",
        "Die Häuser über dem Agout ansehen",
        "Vedere le case sull’Agout",
        "Ver as casas sobre o Agout",
        "Veure les cases sobre l’Agout"
      ],
      [
        "Visitar el Museo Goya",
        "Visit the Goya Museum",
        "Visiter le musée Goya",
        "Das Goya-Museum besuchen",
        "Visitare il Museo Goya",
        "Visitar o Museu Goya",
        "Visitar el Museu Goya"
      ],
      [
        "Pasear por los jardines del Obispado",
        "Stroll through the Jardins de l’Évêché",
        "Se promener dans les jardins de l’Évêché",
        "Durch die Jardins de l’Évêché spazieren",
        "Passeggiare nei Jardins de l’Évêché",
        "Passear pelos Jardins de l’Évêché",
        "Passejar pels Jardins de l’Évêché"
      ],
      [
        "Entrar en la catedral de Saint-Benoît",
        "Step inside Saint-Benoît Cathedral",
        "Entrer dans la cathédrale Saint-Benoît",
        "Die Kathedrale Saint-Benoît besichtigen",
        "Entrare nella cattedrale di Saint-Benoît",
        "Entrar na catedral de Saint-Benoît",
        "Entrar a la catedral de Saint-Benoît"
      ]
    ],
    "notes": [
      "DCM está en Le Causse y da servicio a Castres y Mazamet. Prevé el traslado terrestre; Mazamet no tiene ficha propia.",
      "DCM is at Le Causse and serves Castres and Mazamet. Allow for a ground transfer; Mazamet has no profile of its own.",
      "DCM se trouve au Causse et dessert Castres et Mazamet. Prévoyez un transfert terrestre ; Mazamet n’a pas de fiche propre.",
      "DCM liegt in Le Causse und bedient Castres und Mazamet. Einen Landtransfer einplanen; Mazamet hat kein eigenes Profil.",
      "DCM si trova a Le Causse e serve Castres e Mazamet. Prevedi il trasferimento via terra; Mazamet non ha una scheda propria.",
      "DCM fica em Le Causse e serve Castres e Mazamet. Preveja o transporte terrestre; Mazamet não tem ficha própria.",
      "DCM és a Le Causse i dona servei a Castres i Mazamet. Preveu el trasllat terrestre; Mazamet no té fitxa pròpia."
    ],
    "stay": "1–2",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  },
  {
    "slug": "aurillac",
    "code": "AUR",
    "airport": "Aurillac Marie Marvingt",
    "aliases": [
      "Aurillac Marie Marvingt",
      "Marie Marvingt",
      "Tronquières",
      "Tronquieres",
      "Arpajon-sur-Cère",
      "Cantal",
      "Aurillac Airport"
    ],
    "names": [
      "Aurillac",
      "Aurillac",
      "Aurillac",
      "Aurillac",
      "Aurillac",
      "Aurillac",
      "Aurillac"
    ],
    "descriptions": [
      "Capital del Cantal, Aurillac combina un casco antiguo de tejados de pizarra, el castillo de Saint-Étienne con la Maison des Volcans y el río Jordanne a las puertas de los volcanes de Auvernia.",
      "Capital of the Cantal, Aurillac combines an old town of slate roofs, Saint-Étienne Castle with the Maison des Volcans and the Jordanne river at the gateway to Auvergne’s volcanoes.",
      "Capitale du Cantal, Aurillac réunit une vieille ville aux toits d’ardoise, le château Saint-Étienne avec la Maison des Volcans et la Jordanne aux portes des volcans d’Auvergne.",
      "Aurillac, die Hauptstadt des Cantal, verbindet eine Altstadt mit Schieferdächern, das Schloss Saint-Étienne mit der Maison des Volcans und die Jordanne am Tor zu den Vulkanen der Auvergne.",
      "Capoluogo del Cantal, Aurillac riunisce un centro storico dai tetti d’ardesia, il castello di Saint-Étienne con la Maison des Volcans e la Jordanne alle porte dei vulcani d’Alvernia.",
      "Capital do Cantal, Aurillac reúne um centro histórico de telhados de ardósia, o castelo de Saint-Étienne com a Maison des Volcans e o rio Jordanne às portas dos vulcões da Auvérnia.",
      "Capital del Cantal, Aurillac reuneix un nucli antic de teulades de pissarra, el castell de Saint-Étienne amb la Maison des Volcans i el riu Jordanne a les portes dels volcans d’Alvèrnia."
    ],
    "recommendations": [
      [
        "Visitar la Maison des Volcans",
        "Visit the Maison des Volcans",
        "Visiter la Maison des Volcans",
        "Die Maison des Volcans besuchen",
        "Visitare la Maison des Volcans",
        "Visitar a Maison des Volcans",
        "Visitar la Maison des Volcans"
      ],
      [
        "Recorrer el casco antiguo",
        "Explore the old town",
        "Parcourir la vieille ville",
        "Die Altstadt erkunden",
        "Esplorare il centro storico",
        "Percorrer o centro histórico",
        "Recórrer el nucli antic"
      ],
      [
        "Caminar junto al Jordanne y el Pont Rouge",
        "Walk by the Jordanne and the Pont Rouge",
        "Marcher le long de la Jordanne et du Pont Rouge",
        "An der Jordanne und der Pont Rouge entlang gehen",
        "Camminare lungo la Jordanne e il Pont Rouge",
        "Caminhar junto ao Jordanne e à Pont Rouge",
        "Caminar vora la Jordanne i el Pont Rouge"
      ],
      [
        "Entrar en Notre-Dame-aux-Neiges",
        "Step inside Notre-Dame-aux-Neiges",
        "Entrer à Notre-Dame-aux-Neiges",
        "Notre-Dame-aux-Neiges besichtigen",
        "Entrare a Notre-Dame-aux-Neiges",
        "Entrar em Notre-Dame-aux-Neiges",
        "Entrar a Notre-Dame-aux-Neiges"
      ]
    ],
    "notes": [
      "AUR está en Tronquières, entre Aurillac y Arpajon-sur-Cère. Prevé el traslado; para los volcanes del Cantal necesitarás coche o excursión organizada.",
      "AUR is at Tronquières, between Aurillac and Arpajon-sur-Cère. Allow for a transfer; the Cantal volcanoes need a car or an organised excursion.",
      "AUR se trouve à Tronquières, entre Aurillac et Arpajon-sur-Cère. Prévoyez un transfert ; pour les volcans du Cantal, il faut une voiture ou une excursion organisée.",
      "AUR liegt in Tronquières zwischen Aurillac und Arpajon-sur-Cère. Einen Transfer einplanen; für die Vulkane des Cantal braucht man ein Auto oder einen organisierten Ausflug.",
      "AUR si trova a Tronquières, tra Aurillac e Arpajon-sur-Cère. Prevedi il trasferimento; per i vulcani del Cantal servono un’auto o un’escursione organizzata.",
      "AUR fica em Tronquières, entre Aurillac e Arpajon-sur-Cère. Preveja o transporte; para os vulcões do Cantal precisará de carro ou excursão organizada.",
      "AUR és a Tronquières, entre Aurillac i Arpajon-sur-Cère. Preveu el trasllat; per als volcans del Cantal caldrà cotxe o una excursió organitzada."
    ],
    "stay": "2",
    "best": [
      5,
      6,
      9
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  },
  {
    "slug": "saint-etienne",
    "code": "EBU",
    "airport": "Saint-Étienne Loire",
    "aliases": [
      "Saint Etienne",
      "St Etienne",
      "Saint-Etienne",
      "Saint-Étienne Loire",
      "Saint-Étienne–Bouthéon",
      "Bouthéon",
      "Boutheon",
      "Andrézieux-Bouthéon",
      "Boutheon Airport"
    ],
    "names": [
      "Saint-Étienne",
      "Saint-Étienne",
      "Saint-Étienne",
      "Saint-Étienne",
      "Saint-Étienne",
      "Saint-Étienne",
      "Saint-Étienne"
    ],
    "descriptions": [
      "Ciudad creativa del diseño, Saint-Étienne mezcla la Cité du Design, el museo de arte moderno y el pozo minero Couriot, recuerdo vivo de su pasado industrial.",
      "A UNESCO Creative City of Design, Saint-Étienne mixes the Cité du Design, a modern art museum and the Couriot mine shaft, a living reminder of its industrial past.",
      "Ville créative de design, Saint-Étienne mêle la Cité du design, le musée d’art moderne et le puits Couriot, souvenir vivant de son passé industriel.",
      "Saint-Étienne, Kreativstadt des Designs, verbindet die Cité du Design, das Museum für moderne Kunst und den Förderschacht Couriot als lebendige Erinnerung an die industrielle Vergangenheit.",
      "Città creativa del design, Saint-Étienne unisce la Cité du Design, il museo d’arte moderna e il pozzo minerario Couriot, ricordo vivo del suo passato industriale.",
      "Cidade criativa do design, Saint-Étienne reúne a Cité du Design, o museu de arte moderna e o poço mineiro Couriot, memória viva do seu passado industrial.",
      "Ciutat creativa del disseny, Saint-Étienne barreja la Cité du Design, el museu d’art modern i el pou miner Couriot, record viu del seu passat industrial."
    ],
    "recommendations": [
      [
        "Visitar la Cité du Design",
        "Visit the Cité du Design",
        "Visiter la Cité du design",
        "Die Cité du Design besuchen",
        "Visitare la Cité du Design",
        "Visitar a Cité du Design",
        "Visitar la Cité du Design"
      ],
      [
        "Conocer el Parc-Musée de la Mine",
        "Discover the Mining Museum Park",
        "Découvrir le Parc-Musée de la Mine",
        "Den Bergbaumuseumspark kennenlernen",
        "Scoprire il Parc-Musée de la Mine",
        "Conhecer o Parc-Musée de la Mine",
        "Conèixer el Parc-Musée de la Mine"
      ],
      [
        "Ver el museo de arte moderno MAMC+",
        "See the MAMC+ modern art museum",
        "Voir le musée d’art moderne MAMC+",
        "Das Museum für moderne Kunst MAMC+ ansehen",
        "Vedere il museo d’arte moderna MAMC+",
        "Ver o museu de arte moderna MAMC+",
        "Veure el museu d’art modern MAMC+"
      ],
      [
        "Pasear por la place du Peuple",
        "Stroll through Place du Peuple",
        "Flâner place du Peuple",
        "Über die Place du Peuple schlendern",
        "Passeggiare in place du Peuple",
        "Passear pela Place du Peuple",
        "Passejar per la place du Peuple"
      ]
    ],
    "notes": [
      "EBU está en Andrézieux-Bouthéon, fuera de Saint-Étienne. Prevé el traslado terrestre y comprueba los vuelos disponibles para tus fechas, que pueden ser limitados.",
      "EBU is in Andrézieux-Bouthéon, outside Saint-Étienne. Allow for a ground transfer and check which flights run on your dates, as they may be limited.",
      "EBU se trouve à Andrézieux-Bouthéon, hors de Saint-Étienne. Prévoyez un transfert terrestre et vérifiez les vols disponibles à vos dates, parfois limités.",
      "EBU liegt in Andrézieux-Bouthéon außerhalb von Saint-Étienne. Einen Landtransfer einplanen und prüfen, welche Flüge an den Reisedaten verfügbar sind; das Angebot kann begrenzt sein.",
      "EBU si trova ad Andrézieux-Bouthéon, fuori da Saint-Étienne. Prevedi il trasferimento via terra e verifica i voli disponibili per le tue date, che possono essere limitati.",
      "EBU fica em Andrézieux-Bouthéon, fora de Saint-Étienne. Preveja o transporte terrestre e confirme os voos disponíveis nas suas datas, que podem ser limitados.",
      "EBU és a Andrézieux-Bouthéon, fora de Saint-Étienne. Preveu el trasllat terrestre i comprova els vols disponibles per a les teves dates, que poden ser limitats."
    ],
    "stay": "2",
    "best": [
      4,
      5,
      6,
      9,
      10
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  },
  {
    "slug": "lorient",
    "code": "LRT",
    "airport": "Lorient Bretagne Sud",
    "aliases": [
      "An Oriant",
      "Lorient Bretagne Sud",
      "Lorient Lann-Bihoué",
      "Lann-Bihoué",
      "Lann Bihoue",
      "Larmor-Plage",
      "Lorient Airport",
      "Lann Bihoue Airport"
    ],
    "names": [
      "Lorient",
      "Lorient",
      "Lorient",
      "Lorient",
      "Lorient",
      "Lorient",
      "Lorient"
    ],
    "descriptions": [
      "Puerto bretón de velas y de memoria marinera, Lorient reúne la Cité de la Voile Éric Tabarly, la torre de la Découverte y la rada que se cruza en barco hasta Port-Louis.",
      "A Breton port of sails and maritime memory, Lorient brings together the Cité de la Voile Éric Tabarly, the Tour de la Découverte and a harbour you can cross by boat to Port-Louis.",
      "Port breton de voiles et de mémoire maritime, Lorient réunit la Cité de la Voile Éric Tabarly, la tour de la Découverte et une rade que l’on traverse en bateau jusqu’à Port-Louis.",
      "Der bretonische Hafen der Segel und der Seefahrtserinnerung vereint die Cité de la Voile Éric Tabarly, den Tour de la Découverte und eine Reede, die man per Boot nach Port-Louis überquert.",
      "Porto bretone di vele e memoria marinara, Lorient riunisce la Cité de la Voile Éric Tabarly, la Tour de la Découverte e una rada da attraversare in barca fino a Port-Louis.",
      "Porto bretão de velas e de memória marítima, Lorient reúne a Cité de la Voile Éric Tabarly, a Tour de la Découverte e uma baía que se atravessa de barco até Port-Louis.",
      "Port bretó de veles i de memòria mariner, Lorient reuneix la Cité de la Voile Éric Tabarly, la Tour de la Découverte i una rada que es creua en barca fins a Port-Louis."
    ],
    "recommendations": [
      [
        "Visitar la Cité de la Voile Éric Tabarly",
        "Visit the Cité de la Voile Éric Tabarly",
        "Visiter la Cité de la Voile Éric Tabarly",
        "Die Cité de la Voile Éric Tabarly besuchen",
        "Visitare la Cité de la Voile Éric Tabarly",
        "Visitar a Cité de la Voile Éric Tabarly",
        "Visitar la Cité de la Voile Éric Tabarly"
      ],
      [
        "Subir a la Tour de la Découverte",
        "Climb the Tour de la Découverte",
        "Monter à la tour de la Découverte",
        "Den Tour de la Découverte besteigen",
        "Salire sulla Tour de la Découverte",
        "Subir à Tour de la Découverte",
        "Pujar a la Tour de la Découverte"
      ],
      [
        "Conocer la base de submarinos de Keroman",
        "See the Keroman submarine base",
        "Voir la base de sous-marins de Keroman",
        "Die U-Boot-Basis Keroman ansehen",
        "Vedere la base dei sommergibili di Keroman",
        "Ver a base de submarinos de Keroman",
        "Veure la base de submarins de Keroman"
      ],
      [
        "Cruzar en barco a Port-Louis",
        "Take the boat across to Port-Louis",
        "Traverser en bateau jusqu’à Port-Louis",
        "Mit dem Boot nach Port-Louis übersetzen",
        "Attraversare in barca fino a Port-Louis",
        "Atravessar de barco até Port-Louis",
        "Creuar en barca fins a Port-Louis"
      ]
    ],
    "notes": [
      "LRT está en el sector civil de Lann-Bihoué, fuera de Lorient. Prevé el traslado terrestre; la conexión regular puede ser limitada, así que comprueba los vuelos de tus fechas.",
      "LRT is in the civil sector of Lann-Bihoué, outside Lorient. Allow for a ground transfer; the scheduled service may be limited, so check flights for your dates.",
      "LRT se trouve dans le secteur civil de Lann-Bihoué, hors de Lorient. Prévoyez un transfert terrestre ; la liaison régulière peut être limitée, vérifiez les vols à vos dates.",
      "LRT liegt im zivilen Bereich von Lann-Bihoué außerhalb von Lorient. Einen Landtransfer einplanen; die Linienverbindung kann begrenzt sein, daher die Flüge für die Reisedaten prüfen.",
      "LRT si trova nel settore civile di Lann-Bihoué, fuori da Lorient. Prevedi il trasferimento via terra; il collegamento regolare può essere limitato, quindi verifica i voli per le tue date.",
      "LRT fica no setor civil de Lann-Bihoué, fora de Lorient. Preveja o transporte terrestre; a ligação regular pode ser limitada, por isso confirme os voos nas suas datas.",
      "LRT és al sector civil de Lann-Bihoué, fora de Lorient. Preveu el trasllat terrestre; la connexió regular pot ser limitada, així que comprova els vols per a les teves dates."
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      7,
      9
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  },
  {
    "slug": "le-puy-en-velay",
    "code": "LPY",
    "airport": "Le Puy-en-Velay–Loudes",
    "aliases": [
      "Le Puy",
      "Puy-en-Velay",
      "Le Puy-en-Velay Loudes",
      "Loudes",
      "Chaspuzac",
      "Le Puy Loudes Airport",
      "Loudes Airport"
    ],
    "names": [
      "Le Puy-en-Velay",
      "Le Puy-en-Velay",
      "Le Puy-en-Velay",
      "Le Puy-en-Velay",
      "Le Puy-en-Velay",
      "Le Puy-en-Velay",
      "Le Puy-en-Velay"
    ],
    "descriptions": [
      "Una capilla sobre un pitón volcánico, una catedral de piedra bicolor y un casco antiguo de calles empinadas hacen de Le Puy-en-Velay una de las paradas más singulares de Auvernia.",
      "A chapel on a volcanic needle, a two-tone stone cathedral and an old town of steep streets make Le Puy-en-Velay one of Auvergne’s most distinctive stops.",
      "Une chapelle perchée sur un piton volcanique, une cathédrale de pierre bicolore et une vieille ville aux rues pentues font du Puy-en-Velay l’une des étapes les plus singulières d’Auvergne.",
      "Eine Kapelle auf einem Vulkanschlot, eine zweifarbige Steinkathedrale und eine Altstadt mit steilen Gassen machen Le Puy-en-Velay zu einem der eigenwilligsten Ziele der Auvergne.",
      "Una cappella su un picco vulcanico, una cattedrale di pietra bicolore e un centro storico dalle strade ripide fanno di Le Puy-en-Velay una delle tappe più singolari dell’Alvernia.",
      "Uma capela sobre um pico vulcânico, uma catedral de pedra bicolor e um centro histórico de ruas íngremes fazem de Le Puy-en-Velay uma das paragens mais singulares da Auvérnia.",
      "Una capella sobre un pitó volcànic, una catedral de pedra bicolor i un nucli antic de carrers costeruts fan de Le Puy-en-Velay una de les parades més singulars d’Alvèrnia."
    ],
    "recommendations": [
      [
        "Subir a la capilla de Saint-Michel d’Aiguilhe",
        "Climb to the Saint-Michel d’Aiguilhe chapel",
        "Monter à la chapelle Saint-Michel d’Aiguilhe",
        "Zur Kapelle Saint-Michel d’Aiguilhe hinaufsteigen",
        "Salire alla cappella di Saint-Michel d’Aiguilhe",
        "Subir à capela de Saint-Michel d’Aiguilhe",
        "Pujar a la capella de Saint-Michel d’Aiguilhe"
      ],
      [
        "Visitar la catedral de Notre-Dame",
        "Visit Notre-Dame Cathedral",
        "Visiter la cathédrale Notre-Dame",
        "Die Kathedrale Notre-Dame besuchen",
        "Visitare la cattedrale di Notre-Dame",
        "Visitar a catedral de Notre-Dame",
        "Visitar la catedral de Notre-Dame"
      ],
      [
        "Ver el rocher Corneille y su estatua",
        "See the Rocher Corneille and its statue",
        "Voir le rocher Corneille et sa statue",
        "Den Rocher Corneille und seine Statue ansehen",
        "Vedere il rocher Corneille e la sua statua",
        "Ver o Rocher Corneille e a sua estátua",
        "Veure el rocher Corneille i la seva estàtua"
      ],
      [
        "Pasear por el casco antiguo",
        "Stroll through the old town",
        "Flâner dans la vieille ville",
        "Durch die Altstadt schlendern",
        "Passeggiare nel centro storico",
        "Passear pelo centro histórico",
        "Passejar pel nucli antic"
      ]
    ],
    "notes": [
      "LPY está en Loudes, fuera de Le Puy-en-Velay. Prevé el traslado terrestre y comprueba los vuelos de tus fechas, porque el servicio puede ser limitado. Hay muchos escalones y pendientes.",
      "LPY is in Loudes, outside Le Puy-en-Velay. Allow for a ground transfer and check flights for your dates, as service may be limited. There are many steps and slopes.",
      "LPY se trouve à Loudes, hors du Puy-en-Velay. Prévoyez un transfert terrestre et vérifiez les vols à vos dates, car le service peut être limité. Il y a beaucoup de marches et de pentes.",
      "LPY liegt in Loudes außerhalb von Le Puy-en-Velay. Einen Landtransfer einplanen und die Flüge für die Reisedaten prüfen, da das Angebot begrenzt sein kann. Es gibt viele Stufen und Steigungen.",
      "LPY si trova a Loudes, fuori da Le Puy-en-Velay. Prevedi il trasferimento via terra e verifica i voli per le tue date, perché il servizio può essere limitato. Ci sono molti gradini e salite.",
      "LPY fica em Loudes, fora de Le Puy-en-Velay. Preveja o transporte terrestre e confirme os voos nas suas datas, porque o serviço pode ser limitado. Há muitos degraus e subidas.",
      "LPY és a Loudes, fora de Le Puy-en-Velay. Preveu el trasllat terrestre i comprova els vols per a les teves dates, perquè el servei pot ser limitat. Hi ha molts esglaons i pendents."
    ],
    "stay": "2",
    "best": [
      5,
      6,
      9
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  },
  {
    "slug": "ouessant",
    "code": "OUI",
    "airport": "Ouessant",
    "aliases": [
      "Ushant",
      "Enez Eusa",
      "Lampaul",
      "Ouessant Airport",
      "Île d’Ouessant",
      "Ile d’Ouessant"
    ],
    "names": [
      "Ouessant",
      "Ouessant",
      "Ouessant",
      "Ouessant",
      "Ouessant",
      "Ouessant",
      "Ouessant"
    ],
    "descriptions": [
      "En el extremo occidental de Francia, la isla de Ouessant ofrece faros históricos, acantilados batidos por el Atlántico y caminos costeros para recorrer a pie o en bicicleta.",
      "At France’s western tip, the island of Ouessant (Ushant) offers historic lighthouses, Atlantic-battered cliffs and coastal paths to explore on foot or by bike.",
      "À l’extrémité occidentale de la France, l’île d’Ouessant offre des phares historiques, des falaises battues par l’Atlantique et des chemins côtiers à parcourir à pied ou à vélo.",
      "Am westlichen Ende Frankreichs bietet die Insel Ouessant historische Leuchttürme, vom Atlantik umtoste Klippen und Küstenwege zum Erkunden zu Fuß oder mit dem Rad.",
      "All’estremità occidentale della Francia, l’isola di Ouessant offre fari storici, scogliere battute dall’Atlantico e sentieri costieri da percorrere a piedi o in bicicletta.",
      "No extremo ocidental de França, a ilha de Ouessant oferece faróis históricos, falésias fustigadas pelo Atlântico e caminhos costeiros para percorrer a pé ou de bicicleta.",
      "A l’extrem occidental de França, l’illa d’Ouessant ofereix fars històrics, penya-segats batuts per l’Atlàntic i camins costaners per recórrer a peu o en bicicleta."
    ],
    "recommendations": [
      [
        "Ver el faro de Créac’h y su museo",
        "See the Créac’h lighthouse and its museum",
        "Voir le phare du Créac’h et son musée",
        "Den Leuchtturm Créac’h und sein Museum ansehen",
        "Vedere il faro di Créac’h e il suo museo",
        "Ver o farol de Créac’h e o seu museu",
        "Veure el far de Créac’h i el seu museu"
      ],
      [
        "Conocer la Maison du Niou",
        "Discover the Maison du Niou",
        "Découvrir la Maison du Niou",
        "Die Maison du Niou kennenlernen",
        "Scoprire la Maison du Niou",
        "Conhecer a Maison du Niou",
        "Conèixer la Maison du Niou"
      ],
      [
        "Caminar hasta la Pointe de Pern",
        "Walk to the Pointe de Pern",
        "Marcher jusqu’à la pointe de Pern",
        "Zur Pointe de Pern wandern",
        "Camminare fino alla Pointe de Pern",
        "Caminhar até à Pointe de Pern",
        "Caminar fins a la Pointe de Pern"
      ],
      [
        "Pasear por la bahía de Lampaul",
        "Stroll around Lampaul Bay",
        "Se promener dans la baie de Lampaul",
        "An der Bucht von Lampaul spazieren",
        "Passeggiare nella baia di Lampaul",
        "Passear pela baía de Lampaul",
        "Passejar per la badia de Lampaul"
      ]
    ],
    "notes": [
      "OUI es el aeródromo de la propia isla de Ouessant, fuera de Lampaul. Los vuelos son en avioneta y dependen del tiempo; también hay barco desde Brest o Le Conquet. Comprueba ambas opciones.",
      "OUI is the aerodrome on Ouessant island itself, outside Lampaul. Flights use small aircraft and depend on the weather; there is also a boat from Brest or Le Conquet. Check both options.",
      "OUI est l’aérodrome de l’île d’Ouessant elle-même, hors de Lampaul. Les vols se font en petit avion et dépendent de la météo ; il existe aussi un bateau depuis Brest ou Le Conquet. Vérifiez les deux options.",
      "OUI ist der Flugplatz auf der Insel Ouessant selbst, außerhalb von Lampaul. Die Flüge erfolgen mit Kleinflugzeugen und hängen vom Wetter ab; es gibt auch ein Boot ab Brest oder Le Conquet. Beide Möglichkeiten prüfen.",
      "OUI è l’aerodromo dell’isola di Ouessant stessa, fuori da Lampaul. I voli sono con piccoli aerei e dipendono dal meteo; c’è anche il battello da Brest o Le Conquet. Verifica entrambe le opzioni.",
      "OUI é o aeródromo da própria ilha de Ouessant, fora de Lampaul. Os voos são em avioneta e dependem do tempo; também há barco desde Brest ou Le Conquet. Confirme ambas as opções.",
      "OUI és l’aeròdrom de la mateixa illa d’Ouessant, fora de Lampaul. Els vols són en avioneta i depenen del temps; també hi ha vaixell des de Brest o Le Conquet. Comprova totes dues opcions."
    ],
    "stay": "2–3",
    "best": [
      5,
      6,
      9
    ],
    "low": [
      1,
      2,
      11,
      12
    ]
  }
];

export const franceAirportCoverage: DestinationProfile[] = seeds.map(seed => {
  const names = localize(seed.names), descriptions = localize(seed.descriptions), notes = localize(seed.notes);
  const recommendations = seed.recommendations.map(localize);
  const translations = Object.fromEntries(locales.map(locale => [locale, {
    name: names[locale], description: descriptions[locale],
    recommendations: recommendations.map(place => place[locale]) as DestinationText['recommendations'],
    recommendedStay: `${seed.stay} ${days[locale]}`, seasonalityNote: `${notes[locale]} ${check[locale]}`,
  }])) as Record<Locale, DestinationText>;
  return { id: `fr-${seed.slug}`, slug: seed.slug, countryCode: 'FR', country: 'Francia',
    ...franceAirportImages[seed.slug], ...translations.es, translations,
    airports: [{ iataCode: seed.code }], iataCodes: [seed.code], metropolitanCodes: [],
    aliases: Array.from(new Set([...seed.names, ...seed.aliases, seed.airport])),
    bestMonths: seed.best, lowSeasonMonths: seed.low, highSeasonMonths: [7,8], publication: { status: 'draft' },
  };
});

export const franceCoverageAirportDetails = seeds.map(seed => ({ code: seed.code, name: seed.airport, names: seed.names, aliases: seed.aliases }));
export function franceAirportTown(code: string, locale: Locale) {
  return franceCoverageAirportDetails.find(airport => airport.code === code)?.names[locales.indexOf(locale)] ?? code;
}
