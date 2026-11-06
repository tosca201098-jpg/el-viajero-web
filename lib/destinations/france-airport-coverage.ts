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
