import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { croatiaImages } from './croatia-images';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, index) => [locale, values[index]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const visit = localize(['Visitar', 'Visit', 'Visiter', 'Besuchen:', 'Visitare', 'Visitar', 'Visitar']);
type AirportCode = 'ZAG' | 'DBV' | 'SPU' | 'ZAD' | 'PUY' | 'RJK';
const airportNames: Record<AirportCode, string> = {
  ZAG: 'Franjo Tuđman Airport Zagreb', DBV: 'Ruđer Bošković Airport Dubrovnik',
  SPU: 'Saint Jerome Airport Split', ZAD: 'Zadar Airport', PUY: 'Pula Airport', RJK: 'Rijeka Airport',
};
const arrival = localize([
  'Aeropuerto de llegada: {codes}. Continúa al centro en autobús o traslado por carretera; comprueba horarios y vuelos reales para tus fechas.',
  'Arrival airport: {codes}. Continue to the centre by bus or road transfer; check timetables and actual flights for your dates.',
  'Aéroport d’arrivée : {codes}. Rejoignez le centre en bus ou par transfert routier ; vérifiez horaires et vols pour vos dates.',
  'Ankunftsflughafen: {codes}. Mit Bus oder Straßentransfer ins Zentrum; Fahrpläne und tatsächliche Flüge für Ihre Reisedaten prüfen.',
  'Aeroporto di arrivo: {codes}. Prosegui in centro in autobus o con trasferimento stradale; verifica orari e voli per le tue date.',
  'Aeroporto de chegada: {codes}. Continue até ao centro de autocarro ou por estrada; confirme horários e voos para as suas datas.',
  'Aeroport d’arribada: {codes}. Continua al centre en autobús o per carretera; comprova horaris i vols reals per a les teves dates.',
]);
const ground = localize([
  'Sin aeropuerto comercial propio: accede por {codes} y continúa en autobús o coche hasta {place}. Comprueba el transporte de regreso.',
  'No local commercial airport: arrive via {codes}, then take a bus or car to {place}. Check return transport.',
  'Sans aéroport commercial local : arrivez via {codes}, puis en bus ou voiture jusqu’à {place}. Vérifiez le trajet retour.',
  'Kein eigener Verkehrsflughafen: über {codes} anreisen, dann mit Bus oder Auto nach {place}. Rückfahrt prüfen.',
  'Senza aeroporto commerciale locale: arriva via {codes}, poi in autobus o auto fino a {place}. Verifica il ritorno.',
  'Sem aeroporto comercial local: chegue via {codes}, seguindo de autocarro ou carro até {place}. Confirme o regresso.',
  'Sense aeroport comercial propi: arriba via {codes} i continua en autobús o cotxe fins a {place}. Comprova la tornada.',
]);
const seasonNotes = {
  city: localize([
    'Primavera y otoño favorecen las visitas a pie. Diciembre atrae visitantes por el Adviento; una época tranquila no garantiza precios bajos.',
    'Spring and autumn suit walking visits. Advent draws visitors in December; a quieter period does not guarantee low prices.',
    'Printemps et automne se prêtent aux balades. L’Avent attire en décembre ; une période calme ne garantit pas de prix bas.',
    'Frühling und Herbst eignen sich für Stadtspaziergänge. Der Advent zieht im Dezember Gäste an; ruhigere Zeiten garantieren keine niedrigen Preise.',
    'Primavera e autunno si prestano alle passeggiate. L’Avvento attira visitatori a dicembre; un periodo tranquillo non garantisce prezzi bassi.',
    'Primavera e outono favorecem os passeios. O Advento atrai visitantes em dezembro; uma época calma não garante preços baixos.',
    'Primavera i tardor afavoreixen les passejades. L’Advent atrau visitants al desembre; una època tranquil·la no garanteix preus baixos.',
  ]),
  coast: localize([
    'Primavera y principios de otoño son agradables para pasear; julio y agosto concentran calor y visitantes. En invierno disminuyen algunos servicios y vuelos; comprueba horarios y entradas. No se garantizan precios bajos.',
    'Spring and early autumn suit sightseeing; July and August bring heat and crowds. Some services and flights decrease in winter; check timetables and admission. Low prices are not guaranteed.',
    'Printemps et début d’automne conviennent aux visites ; juillet et août sont chauds et fréquentés. Certains services et vols diminuent en hiver ; vérifiez horaires et accès. Les prix bas ne sont pas garantis.',
    'Frühling und Frühherbst eignen sich für Besichtigungen; Juli und August sind heiß und belebt. Im Winter gibt es weniger Dienste und Flüge; Fahrpläne und Eintritt prüfen. Niedrige Preise sind nicht garantiert.',
    'Primavera e inizio autunno sono adatti alle visite; luglio e agosto portano caldo e folla. In inverno diminuiscono alcuni servizi e voli; verifica orari e ingressi. I prezzi bassi non sono garantiti.',
    'Primavera e início do outono são agradáveis para visitar; julho e agosto trazem calor e multidões. No inverno diminuem alguns serviços e voos; confirme horários e entradas. Não se garantem preços baixos.',
    'Primavera i inici de tardor són agradables per visitar; juliol i agost concentren calor i visitants. A l’hivern disminueixen alguns serveis i vols; comprova horaris i entrades. No es garanteixen preus baixos.',
  ]),
  island: localize([
    'Mayo, junio y septiembre permiten explorar la isla con menos presión que julio y agosto. Fuera de temporada hay menos barcos y servicios abiertos. Comprueba horarios, meteorología y entradas; no se garantizan precios bajos.',
    'May, June and September allow island exploration with less pressure than July and August. Outside the main season fewer boats and services operate. Check schedules, weather and admission; low prices are not guaranteed.',
    'Mai, juin et septembre permettent de découvrir l’île plus calmement qu’en juillet et août. Hors saison, bateaux et services sont réduits. Vérifiez horaires, météo et accès ; les prix bas ne sont pas garantis.',
    'Mai, Juni und September sind ruhiger als Juli und August. Außerhalb der Hauptsaison fahren weniger Schiffe und manche Einrichtungen schließen. Fahrpläne, Wetter und Eintritt prüfen; niedrige Preise sind nicht garantiert.',
    'Maggio, giugno e settembre permettono di esplorare l’isola con meno affollamento rispetto a luglio e agosto. Fuori stagione ci sono meno navi e servizi aperti. Verifica orari, meteo e ingressi; prezzi bassi non garantiti.',
    'Maio, junho e setembro permitem explorar a ilha com menos pressão do que julho e agosto. Fora de época há menos barcos e serviços abertos. Confirme horários, tempo e entradas; não se garantem preços baixos.',
    'Maig, juny i setembre permeten explorar l’illa amb menys pressió que juliol i agost. Fora de temporada hi ha menys vaixells i serveis oberts. Comprova horaris, temps i entrades; no es garanteixen preus baixos.',
  ]),
  nature: localize([
    'Primavera y otoño combinan vegetación y recorridos con menos calor; julio y agosto reciben más visitantes. Lluvia, crecidas o hielo pueden cerrar rutas. Comprueba el estado del parque y las entradas; no se garantizan precios bajos.',
    'Spring and autumn offer greenery and walks with less heat; July and August draw more visitors. Rain, high water or ice can close routes. Check park conditions and admission; low prices are not guaranteed.',
    'Printemps et automne offrent verdure et promenades moins chaudes ; juillet et août attirent davantage. Pluie, crues ou gel peuvent fermer des parcours. Vérifiez l’état du parc et les entrées ; les prix bas ne sont pas garantis.',
    'Frühling und Herbst bieten grüne Landschaften und weniger Hitze; Juli und August sind stärker besucht. Regen, Hochwasser oder Eis können Wege sperren. Parkzustand und Eintritt prüfen; niedrige Preise sind nicht garantiert.',
    'Primavera e autunno offrono verde e passeggiate con meno caldo; luglio e agosto attirano più visitatori. Pioggia, piene o ghiaccio possono chiudere i percorsi. Verifica condizioni e ingressi; prezzi bassi non garantiti.',
    'Primavera e outono oferecem vegetação e percursos com menos calor; julho e agosto recebem mais visitantes. Chuva, cheias ou gelo podem fechar trilhos. Confirme o estado do parque e entradas; não se garantem preços baixos.',
    'Primavera i tardor ofereixen vegetació i recorreguts amb menys calor; juliol i agost reben més visitants. Pluja, crescudes o gel poden tancar rutes. Comprova l’estat del parc i les entrades; no es garanteixen preus baixos.',
  ]),
};
const specialNotes = {
  rijeka: localize([
    'RJK está en la isla de Krk, unida al continente por puente: el acceso a Rijeka es por carretera, sin ferry obligatorio.',
    'RJK is on Krk island, linked to the mainland by a bridge: Rijeka is reached by road, with no compulsory ferry.',
    'RJK est sur l’île de Krk, reliée au continent par un pont : Rijeka se rejoint par la route, sans ferry obligatoire.',
    'RJK liegt auf der über eine Brücke verbundenen Insel Krk: Rijeka ist auf der Straße erreichbar, ohne notwendige Fähre.',
    'RJK si trova sull’isola di Krk, collegata alla terraferma da un ponte: Rijeka si raggiunge su strada, senza traghetto obbligatorio.',
    'RJK fica na ilha de Krk, ligada ao continente por ponte: o acesso a Rijeka é por estrada, sem ferry obrigatório.',
    'RJK és a l’illa de Krk, unida al continent per un pont: s’arriba a Rijeka per carretera, sense ferri obligatori.',
  ]),
  hvar: localize([
    'Hvar no tiene aeropuerto comercial. Desde SPU continúa por carretera al puerto de Split y en ferry a Stari Grad; después, autobús o coche a tu localidad. Los catamaranes a Hvar tienen horarios propios y pueden ser estacionales. Comprueba puerto, transporte de vehículos y última salida.',
    'Hvar has no commercial airport. From SPU travel by road to Split port and by ferry to Stari Grad, then by bus or car to your base. Catamarans to Hvar have separate timetables and may be seasonal. Check the port, vehicle carriage and last departure.',
    'Hvar n’a pas d’aéroport commercial. Depuis SPU, rejoignez le port de Split par la route, puis Stari Grad en ferry et votre localité en bus ou voiture. Les catamarans vers Hvar ont leurs propres horaires, parfois saisonniers. Vérifiez port, transport de véhicules et dernier départ.',
    'Hvar hat keinen Verkehrsflughafen. Von SPU auf der Straße zum Hafen Split, per Fähre nach Stari Grad und per Bus oder Auto zum Ziel. Katamarane nach Hvar haben eigene, teils saisonale Fahrpläne. Hafen, Fahrzeugmitnahme und letzte Abfahrt prüfen.',
    'Hvar non ha un aeroporto commerciale. Da SPU raggiungi su strada il porto di Split, poi Stari Grad in traghetto e la tua località in autobus o auto. I catamarani per Hvar hanno orari propri e possono essere stagionali. Verifica porto, trasporto veicoli e ultima partenza.',
    'Hvar não tem aeroporto comercial. De SPU siga por estrada até ao porto de Split e de ferry até Stari Grad; depois, de autocarro ou carro até à sua localidade. Os catamarãs para Hvar têm horários próprios e podem ser sazonais. Confirme porto, transporte de veículos e última saída.',
    'Hvar no té aeroport comercial. Des de SPU continua per carretera al port de Split i en ferri a Stari Grad; després, en autobús o cotxe fins a la teva localitat. Els catamarans a Hvar tenen horaris propis i poden ser estacionals. Comprova port, transport de vehicles i última sortida.',
  ]),
  korcula: localize([
    'Korčula no tiene aeropuerto comercial. Desde DBV continúa por carretera a Orebić, en ferry a Dominče y por carretera hasta tu alojamiento. Desde SPU accede al puerto de Split para las conexiones marítimas que operen en tus fechas. Verifica puerto de llegada, vehículos y regreso; no todos los barcos llegan a la ciudad de Korčula.',
    'Korčula has no commercial airport. From DBV travel by road to Orebić, by ferry to Dominče, then by road to your accommodation. From SPU reach Split port for sailings operating on your dates. Check arrival port, vehicles and return travel; not all boats call at Korčula town.',
    'Korčula n’a pas d’aéroport commercial. Depuis DBV, rejoignez Orebić par la route, Dominče en ferry, puis votre hébergement par la route. Depuis SPU, gagnez le port de Split pour les liaisons à vos dates. Vérifiez port d’arrivée, véhicules et retour ; tous les bateaux ne desservent pas la ville de Korčula.',
    'Korčula hat keinen Verkehrsflughafen. Von DBV auf der Straße nach Orebić, per Fähre nach Dominče und weiter zur Unterkunft. Von SPU zum Hafen Split für Verbindungen an Ihren Reisetagen. Ankunftshafen, Fahrzeugmitnahme und Rückfahrt prüfen; nicht alle Schiffe halten in der Stadt Korčula.',
    'Korčula non ha un aeroporto commerciale. Da DBV prosegui su strada fino a Orebić, in traghetto a Dominče e su strada fino all’alloggio. Da SPU raggiungi il porto di Split per i collegamenti nelle tue date. Verifica porto di arrivo, veicoli e ritorno; non tutte le navi arrivano alla città di Korčula.',
    'Korčula não tem aeroporto comercial. De DBV siga por estrada até Orebić, de ferry até Dominče e por estrada até ao alojamento. De SPU chegue ao porto de Split para as ligações nas suas datas. Confirme porto de chegada, veículos e regresso; nem todos os barcos chegam à cidade de Korčula.',
    'Korčula no té aeroport comercial. Des de DBV continua per carretera a Orebić, en ferri a Dominče i per carretera fins a l’allotjament. Des de SPU arriba al port de Split per a les connexions de les teves dates. Verifica port d’arribada, vehicles i tornada; no tots els vaixells arriben a la ciutat de Korčula.',
  ]),
  plitvice: localize([
    'Elige entrada y franja horaria antes de ir; en invierno pueden cerrar los lagos superiores. No está permitido bañarse. Consulta qué pasarelas, barcos y transporte panorámico funcionan ese día.',
    'Choose an entrance and entry time before travelling; the Upper Lakes may close in winter. Swimming is prohibited. Check which boardwalks, boats and panoramic transport operate that day.',
    'Choisissez entrée et créneau avant de partir ; les lacs supérieurs peuvent fermer en hiver. La baignade est interdite. Vérifiez les passerelles, bateaux et transports panoramiques en service.',
    'Eingang und Zeitfenster vorab wählen; die oberen Seen können im Winter schließen. Baden ist verboten. Geöffnete Stege, Boote und Panoramatransporte für den Besuchstag prüfen.',
    'Scegli ingresso e fascia oraria prima di partire; in inverno i laghi superiori possono chiudere. È vietato nuotare. Verifica passerelle, battelli e trasporto panoramico disponibili quel giorno.',
    'Escolha entrada e horário antes de ir; os lagos superiores podem fechar no inverno. É proibido nadar. Confirme as passarelas, barcos e transporte panorâmico em funcionamento nesse dia.',
    'Tria entrada i franja horària abans d’anar-hi; a l’hivern poden tancar els llacs superiors. No s’hi permet el bany. Consulta quines passarel·les, vaixells i transports panoràmics funcionen aquell dia.',
  ]),
  krka: localize([
    'Para Skradinski buk elige Skradin o Lozovac; verifica los barcos y autobuses del parque, que dependen de la temporada. No se permite el baño en Skradinski buk. Las excursiones a Visovac y Roški slap tienen horarios y entradas que deben comprobarse por separado.',
    'For Skradinski buk choose Skradin or Lozovac; check seasonal park boats and buses. Swimming at Skradinski buk is prohibited. Excursions to Visovac and Roški slap have schedules and tickets that must be checked separately.',
    'Pour Skradinski buk, choisissez Skradin ou Lozovac ; vérifiez les bateaux et bus saisonniers du parc. La baignade à Skradinski buk est interdite. Horaires et billets des excursions vers Visovac et Roški slap sont à vérifier séparément.',
    'Für Skradinski buk Skradin oder Lozovac wählen; saisonale Parkboote und Busse prüfen. Baden am Skradinski buk ist verboten. Fahrpläne und Tickets für Ausflüge nach Visovac und Roški slap gesondert prüfen.',
    'Per Skradinski buk scegli Skradin o Lozovac; verifica battelli e autobus stagionali del parco. È vietato nuotare a Skradinski buk. Orari e biglietti delle escursioni a Visovac e Roški slap vanno controllati separatamente.',
    'Para Skradinski buk escolha Skradin ou Lozovac; confirme barcos e autocarros sazonais do parque. É proibido nadar em Skradinski buk. Horários e bilhetes das excursões a Visovac e Roški slap devem ser verificados separadamente.',
    'Per a Skradinski buk tria Skradin o Lozovac; comprova els vaixells i autobusos estacionals del parc. No es permet el bany a Skradinski buk. Cal comprovar per separat horaris i entrades de les excursions a Visovac i Roški slap.',
  ]),
};
type Seed = {
  slug: string; imageKey: keyof typeof croatiaImages; names: Seven; descriptions: Seven;
  places: [string, string, string, string]; aliases?: string[]; stay: string;
  airport?: AirportCode; access?: AirportCode[]; transferTo?: string;
  season: keyof typeof seasonNotes; special?: keyof typeof specialNotes;
};
const seasons = {
  city: { best: [4,5,6,9,10], low: [1,2,11], high: [7,8,12] },
  coast: { best: [4,5,6,9,10], low: [11,12,1,2,3], high: [7,8] },
  island: { best: [5,6,9], low: [11,12,1,2,3], high: [7,8] },
  nature: { best: [4,5,6,9,10], low: [11,12,1,2], high: [7,8] },
};
function profile(seed: Seed): DestinationProfile {
  const codes = seed.airport ? [seed.airport] : seed.access ?? [];
  const island = seed.special === 'hvar' || seed.special === 'korcula';
  const translations = Object.fromEntries(locales.map((locale, index) => [locale, {
    name: seed.names[index], description: seed.descriptions[index],
    recommendations: seed.places.map(place => visit[locale] + ' ' + place) as DestinationText['recommendations'],
    recommendedStay: seed.stay + ' ' + days[locale],
    seasonalityNote: [
      seasonNotes[seed.season][locale],
      island ? '' : (seed.airport ? arrival[locale] : ground[locale]).replace('{codes}', codes.join(', ')).replace('{place}', seed.transferTo ?? seed.names[index]),
      seed.special ? specialNotes[seed.special][locale] : '',
    ].filter(Boolean).join(' '),
  }])) as Record<Locale, DestinationText>;
  const season = seasons[seed.season];
  return {
    id: 'hr-' + seed.slug, slug: seed.slug, countryCode: 'HR', country: 'Croacia',
    ...croatiaImages[seed.imageKey], ...translations.es, translations,
    airports: seed.airport ? [{ iataCode: seed.airport }] : [],
    iataCodes: seed.airport ? [seed.airport] : [], metropolitanCodes: [],
    accessAirports: (seed.access ?? []).map(iataCode => ({ iataCode, name: airportNames[iataCode], countryCode: 'HR' })),
    aliases: Array.from(new Set([...(seed.aliases ?? []), ...seed.names])),
    bestMonths: season.best, lowSeasonMonths: season.low, highSeasonMonths: season.high,
    publication: { status: 'draft' },
  };
}

const seeds: Seed[] = [
  {
    slug: 'zagreb', imageKey: 'zagreb', airport: 'ZAG', stay: '2–3', season: 'city',
    names: ['Zagreb','Zagreb','Zagreb','Zagreb','Zagabria','Zagreb','Zagreb'],
    descriptions: [
      'Zagreb invita a alternar las calles de la ciudad alta con mercados, parques y cafés de la ciudad baja.',
      'Zagreb invites you to combine Upper Town streets with the markets, parks and cafés of the Lower Town.',
      'Zagreb invite à relier les rues de la ville haute aux marchés, parcs et cafés de la ville basse.',
      'Zagreb verbindet Gassen der Oberstadt mit Märkten, Parks und Cafés in der Unterstadt.',
      'Zagabria invita ad alternare le vie della città alta con mercati, parchi e caffè della città bassa.',
      'Zagreb convida a alternar as ruas da cidade alta com mercados, parques e cafés da cidade baixa.',
      'Zagreb convida a combinar els carrers de la ciutat alta amb mercats, parcs i cafès de la ciutat baixa.',
    ],
    places: ['Gornji grad','Dolac','Zrinjevac','Maksimir'], aliases: ['Zágreb','Zagrab'],
  },
  {
    slug: 'dubrovnik', imageKey: 'dubrovnik', airport: 'DBV', stay: '3–4', season: 'coast',
    names: ['Dubrovnik','Dubrovnik','Dubrovnik','Dubrovnik','Dubrovnik','Dubrovnik','Dubrovnik'],
    descriptions: [
      'Entre murallas y Adriático, Dubrovnik reúne plazas de piedra, palacios y miradores sobre los tejados del casco antiguo.',
      'Between city walls and the Adriatic, Dubrovnik brings together stone squares, palaces and views over old-town rooftops.',
      'Entre remparts et Adriatique, Dubrovnik réunit places de pierre, palais et vues sur les toits de la vieille ville.',
      'Zwischen Stadtmauern und Adria bietet Dubrovnik steinerne Plätze, Paläste und Blicke über die Dächer der Altstadt.',
      'Tra mura e Adriatico, Dubrovnik riunisce piazze in pietra, palazzi e vedute sui tetti del centro storico.',
      'Entre muralhas e Adriático, Dubrovnik reúne praças de pedra, palácios e vistas sobre os telhados da cidade antiga.',
      'Entre muralles i Adriàtic, Dubrovnik reuneix places de pedra, palaus i miradors sobre les teulades del nucli antic.',
    ],
    places: ['Gradske zidine','Stradun','Tvrđava Lovrijenac','Knežev dvor'], aliases: ['Ragusa'],
  },
  {
    slug: 'split', imageKey: 'split', airport: 'SPU', stay: '3–4', season: 'coast',
    names: ['Split','Split','Split','Split','Spalato','Split','Split'],
    descriptions: [
      'Split vive entre los restos del palacio de Diocleciano, el paseo marítimo de la Riva y las laderas verdes de Marjan.',
      'Split unfolds between the remains of Diocletian’s Palace, the Riva waterfront and the green slopes of Marjan.',
      'Split se découvre entre les vestiges du palais de Dioclétien, la promenade de la Riva et les pentes vertes de Marjan.',
      'Split liegt zwischen den Resten des Diokletianpalastes, der Uferpromenade Riva und den grünen Hängen des Marjan.',
      'Spalato vive tra i resti del palazzo di Diocleziano, il lungomare della Riva e le pendici verdi del Marjan.',
      'Split vive entre os vestígios do palácio de Diocleciano, o passeio da Riva e as encostas verdes de Marjan.',
      'Split viu entre les restes del palau de Dioclecià, el passeig de la Riva i els vessants verds de Marjan.',
    ],
    places: ['Dioklecijanova palača','Riva','Marjan','Galerija Meštrović'],
  },
  {
    slug: 'zadar', imageKey: 'zadar', airport: 'ZAD', stay: '2–3', season: 'coast',
    names: ['Zadar','Zadar','Zadar','Zadar','Zara','Zadar','Zadar'],
    descriptions: [
      'La península histórica de Zadar enlaza restos romanos e iglesias con un frente marítimo donde las olas hacen sonar el Órgano del Mar.',
      'Zadar’s historic peninsula links Roman remains and churches with a waterfront where waves play the Sea Organ.',
      'La péninsule historique de Zadar relie vestiges romains et églises au front de mer où les vagues jouent de l’Orgue marin.',
      'Zadars historische Halbinsel verbindet römische Reste und Kirchen mit einer Uferpromenade, an der Wellen die Meeresorgel spielen.',
      'La penisola storica di Zara collega resti romani e chiese al lungomare dove le onde suonano l’Organo marino.',
      'A península histórica de Zadar liga vestígios romanos e igrejas à frente marítima onde as ondas tocam o Órgão do Mar.',
      'La península històrica de Zadar uneix restes romanes i esglésies amb un front marítim on les onades fan sonar l’Orgue del Mar.',
    ],
    places: ['Morske orgulje','Pozdrav Suncu','Rimski forum','Kopnena vrata'],
  },
  {
    slug: 'pula', imageKey: 'pula', airport: 'PUY', stay: '2–3', season: 'coast',
    names: ['Pula','Pula','Pula','Pula','Pola','Pula','Pula'],
    descriptions: [
      'Pula ofrece una ruta compacta por la herencia romana de Istria, desde su anfiteatro hasta el foro y el arco de los Sergios.',
      'Pula offers a compact route through Istria’s Roman heritage, from its amphitheatre to the forum and Arch of the Sergii.',
      'Pula propose un parcours à travers l’héritage romain de l’Istrie, de l’amphithéâtre au forum et à l’arc des Sergii.',
      'Pula bietet einen kompakten Rundgang durch Istriens römisches Erbe, vom Amphitheater zum Forum und Sergierbogen.',
      'Pola offre un itinerario compatto nell’eredità romana dell’Istria, dall’anfiteatro al foro e all’arco dei Sergi.',
      'Pula oferece um percurso compacto pela herança romana da Ístria, do anfiteatro ao fórum e ao arco dos Sérgios.',
      'Pula ofereix una ruta compacta per l’herència romana d’Ístria, de l’amfiteatre al fòrum i l’arc dels Sergis.',
    ],
    places: ['Arena','Augustov hram','Slavoluk Sergijevaca','Kaštel'],
  },
  {
    slug: 'rijeka', imageKey: 'rijeka', airport: 'RJK', stay: '2–3', season: 'coast', special: 'rijeka',
    names: ['Rijeka','Rijeka','Rijeka','Rijeka','Fiume','Rijeka','Rijeka'],
    descriptions: [
      'Rijeka muestra el carácter portuario del Kvarner entre el paseo de Korzo, los mercados y la fortaleza de Trsat sobre la ciudad.',
      'Rijeka reveals Kvarner’s port character through the Korzo promenade, markets and Trsat Castle overlooking the city.',
      'Rijeka révèle le caractère portuaire du Kvarner entre la promenade Korzo, les marchés et le château de Trsat dominant la ville.',
      'Rijeka zeigt Kvarners Hafencharakter zwischen Korzo, Märkten und der über der Stadt gelegenen Burg Trsat.',
      'Fiume mostra il carattere portuale del Quarnero tra il Korzo, i mercati e il castello di Tersatto sopra la città.',
      'Rijeka revela o caráter portuário do Kvarner entre o passeio Korzo, os mercados e o castelo de Trsat sobre a cidade.',
      'Rijeka mostra el caràcter portuari del Kvarner entre el passeig de Korzo, els mercats i el castell de Trsat sobre la ciutat.',
    ],
    places: ['Korzo','Trsatski kaštel','Gradski toranj','Glavna gradska tržnica'],
  },
  {
    slug: 'rovinj', imageKey: 'rovinj', access: ['PUY','RJK'], stay: '2–3', season: 'coast',
    names: ['Rovinj','Rovinj','Rovinj','Rovinj','Rovigno','Rovinj','Rovinj'],
    descriptions: [
      'El casco antiguo de Rovinj asciende desde el puerto hasta Santa Eufemia; hacia el sur, Zlatni rt ofrece senderos entre pinos y calas.',
      'Rovinj’s old town climbs from the harbour to St Euphemia; to the south, Zlatni rt offers paths among pines and coves.',
      'La vieille ville de Rovinj monte du port vers Sainte-Euphémie ; au sud, Zlatni rt offre des sentiers entre pins et criques.',
      'Rovinjs Altstadt steigt vom Hafen zur Euphemia-Kirche an; südlich bietet Zlatni rt Wege zwischen Pinien und Buchten.',
      'Il centro storico di Rovigno sale dal porto a Sant’Eufemia; a sud, Zlatni rt offre sentieri tra pini e calette.',
      'A cidade antiga de Rovinj sobe do porto até Santa Eufémia; a sul, Zlatni rt oferece trilhos entre pinheiros e enseadas.',
      'El nucli antic de Rovinj puja del port a Santa Eufèmia; al sud, Zlatni rt ofereix senders entre pins i cales.',
    ],
    places: ['Stari grad','Crkva sv. Eufemije','Grisia','Zlatni rt'],
  },
  {
    slug: 'hvar', imageKey: 'hvar', access: ['SPU'], stay: '3–5', season: 'island', special: 'hvar',
    names: ['Hvar','Hvar','Hvar','Hvar','Hvar','Hvar','Hvar'],
    descriptions: [
      'La isla de Hvar combina el puerto y las vistas de Fortica con los pueblos de Stari Grad y Jelsa, que merecen tiempo más allá de una escala.',
      'Hvar island combines its harbour and Fortica views with the towns of Stari Grad and Jelsa, worth exploring beyond a brief stop.',
      'L’île de Hvar associe son port et les vues de Fortica aux villes de Stari Grad et Jelsa, à découvrir au-delà d’une courte escale.',
      'Die Insel Hvar verbindet Hafen und Fortica-Ausblicke mit Stari Grad und Jelsa, die mehr als einen kurzen Zwischenstopp verdienen.',
      'L’isola di Hvar unisce il porto e i panorami di Fortica ai borghi di Stari Grad e Jelsa, da scoprire oltre una breve sosta.',
      'A ilha de Hvar combina o porto e as vistas de Fortica com Stari Grad e Jelsa, que merecem tempo além de uma breve escala.',
      'L’illa de Hvar combina el port i les vistes de Fortica amb Stari Grad i Jelsa, que mereixen temps més enllà d’una escala.',
    ],
    places: ['Tvrđava Fortica','Trg sv. Stjepana','Stari Grad','Jelsa'], aliases: ['Isla de Hvar','Hvar island','Lesina'],
  },
  {
    slug: 'korcula', imageKey: 'korcula', access: ['DBV','SPU'], stay: '3–5', season: 'island', special: 'korcula',
    names: ['Korčula','Korčula','Korčula','Korčula','Curzola','Korčula','Korčula'],
    descriptions: [
      'Korčula combina una ciudad amurallada con viñedos junto a Lumbarda y pueblos del interior; Vela Luka permite conocer el otro extremo de la isla.',
      'Korčula combines a walled town with vineyards near Lumbarda and inland villages; Vela Luka reveals the island’s other end.',
      'Korčula associe une ville fortifiée, les vignobles de Lumbarda et les villages de l’intérieur ; Vela Luka dévoile l’autre bout de l’île.',
      'Korčula vereint eine ummauerte Stadt, Weinberge bei Lumbarda und Dörfer im Inselinneren; Vela Luka zeigt das andere Inselende.',
      'Curzola unisce una città murata, i vigneti di Lumbarda e i borghi interni; Vela Luka permette di scoprire l’altra estremità dell’isola.',
      'Korčula combina uma cidade muralhada, vinhas perto de Lumbarda e aldeias interiores; Vela Luka revela a outra ponta da ilha.',
      'Korčula combina una ciutat emmurallada amb vinyes prop de Lumbarda i pobles de l’interior; Vela Luka mostra l’altre extrem de l’illa.',
    ],
    places: ['Stari grad Korčula','Lumbarda','Blato','Vela Luka'], aliases: ['Korcula','Isla de Korčula','Korcula island'],
  },
  {
    slug: 'sibenik', imageKey: 'sibenik', access: ['SPU','ZAD'], stay: '2–3', season: 'coast',
    names: ['Šibenik','Šibenik','Šibenik','Šibenik','Sebenico','Šibenik','Šibenik'],
    descriptions: [
      'Šibenik reúne una catedral de piedra, escalinatas y fortalezas con vistas al canal; su casco urbano ofrece una visita distinta del parque de Krka.',
      'Šibenik brings together a stone cathedral, stairways and fortresses overlooking the channel; its urban sights offer a visit distinct from Krka National Park.',
      'Šibenik réunit cathédrale de pierre, escaliers et forteresses dominant le canal ; sa vieille ville se visite séparément du parc de Krka.',
      'Šibenik vereint Steinkathedrale, Treppen und Festungen mit Kanalblick; die Stadt bietet ein eigenständiges Ziel neben dem Nationalpark Krka.',
      'Sebenico riunisce una cattedrale in pietra, scalinate e fortezze sul canale; il centro urbano offre una visita distinta dal parco di Krka.',
      'Šibenik reúne uma catedral de pedra, escadarias e fortalezas sobre o canal; a visita urbana é distinta da do parque de Krka.',
      'Šibenik reuneix una catedral de pedra, escalinates i fortaleses amb vistes al canal; el nucli urbà ofereix una visita diferenciada del parc de Krka.',
    ],
    places: ['Katedrala sv. Jakova','Tvrđava sv. Mihovila','Tvrđava Barone','Srednjovjekovni samostanski vrt sv. Lovre'], aliases: ['Sibenik'],
  },
  {
    slug: 'plitvice-lakes', imageKey: 'plitvice', access: ['ZAG','ZAD'], transferTo: 'Ulaz 1 / Ulaz 2', stay: '1–2', season: 'nature', special: 'plitvice',
    names: ['Lagos de Plitvice','Plitvice Lakes','Lacs de Plitvice','Plitvicer Seen','Laghi di Plitvice','Lagos de Plitvice','Llacs de Plitvice'],
    descriptions: [
      'El Parque Nacional de los Lagos de Plitvice enlaza lagos y cascadas mediante senderos y pasarelas; el recorrido depende de la entrada y de los sectores abiertos.',
      'Plitvice Lakes National Park links lakes and waterfalls with trails and boardwalks; your route depends on the entrance and the sections open.',
      'Le parc national des lacs de Plitvice relie lacs et cascades par des sentiers et passerelles ; le parcours dépend de l’entrée et des secteurs ouverts.',
      'Der Nationalpark Plitvicer Seen verbindet Seen und Wasserfälle über Wege und Stege; die Route hängt vom Eingang und den geöffneten Bereichen ab.',
      'Il Parco nazionale dei laghi di Plitvice collega laghi e cascate con sentieri e passerelle; il percorso dipende dall’ingresso e dalle zone aperte.',
      'O Parque Nacional dos Lagos de Plitvice liga lagos e cascatas por trilhos e passarelas; o percurso depende da entrada e das áreas abertas.',
      'El Parc Nacional dels Llacs de Plitvice connecta llacs i cascades amb senders i passarel·les; el recorregut depèn de l’entrada i dels sectors oberts.',
    ],
    places: ['Veliki slap','Donja jezera','Kozjak','Gornja jezera'], aliases: ['Plitvice','Plitvička jezera','Plitvicka jezera','Parque Nacional de Plitvice'],
  },
  {
    slug: 'krka-national-park', imageKey: 'krka', access: ['SPU','ZAD'], transferTo: 'Skradin / Lozovac', stay: '1–2', season: 'nature', special: 'krka',
    names: ['Parque Nacional de Krka','Krka National Park','Parc national de Krka','Nationalpark Krka','Parco nazionale della Krka','Parque Nacional de Krka','Parc Nacional de Krka'],
    descriptions: [
      'Krka protege un paisaje fluvial de cascadas y patrimonio junto al agua. Skradinski buk es una primera visita; Visovac, Roški slap y Burnum requieren planificar otros desplazamientos.',
      'Krka protects a river landscape of waterfalls and waterside heritage. Skradinski buk is a first visit; Visovac, Roški slap and Burnum require planning further travel.',
      'Krka protège un paysage de cascades et de patrimoine au bord de l’eau. Skradinski buk est une première visite ; Visovac, Roški slap et Burnum demandent d’autres déplacements.',
      'Krka schützt eine Flusslandschaft mit Wasserfällen und Kulturerbe am Wasser. Skradinski buk ist ein Einstieg; Visovac, Roški slap und Burnum erfordern weitere Wegeplanung.',
      'La Krka protegge un paesaggio fluviale di cascate e patrimonio sull’acqua. Skradinski buk è una prima visita; Visovac, Roški slap e Burnum richiedono altri spostamenti pianificati.',
      'Krka protege uma paisagem fluvial de cascatas e património junto à água. Skradinski buk é uma primeira visita; Visovac, Roški slap e Burnum exigem planear outros trajetos.',
      'Krka protegeix un paisatge fluvial de cascades i patrimoni vora l’aigua. Skradinski buk és una primera visita; Visovac, Roški slap i Burnum requereixen planificar altres desplaçaments.',
    ],
    places: ['Skradinski buk','Visovac','Roški slap','Burnum'], aliases: ['Krka','Nacionalni park Krka','Parque de Krka'],
  },
];

export const croatiaDestinations: DestinationProfile[] = seeds.map(profile);
