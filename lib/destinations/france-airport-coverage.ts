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
