import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';
import { greeceRegionalImages } from './greece-regional-images';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, i) => [locale, values[i]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const visit = localize(['Visitar', 'Visit', 'Visiter', 'Besuchen:', 'Visitare', 'Visitar', 'Visitar']);
const seasons = {
  city: localize([
    'Primavera y principios de otoño favorecen los paseos y las visitas culturales. En verano evita las horas de más calor. Comprueba entradas y horarios de los recintos; una época tranquila no garantiza precios bajos.',
    'Spring and early autumn suit walking and cultural visits. Avoid the hottest hours in summer. Check admission and site opening times; a quieter season does not guarantee low prices.',
    'Printemps et début d’automne conviennent aux promenades et visites culturelles. Évitez les heures chaudes en été. Vérifiez billets et horaires des sites ; une période calme ne garantit pas de prix bas.',
    'Frühling und Frühherbst eignen sich für Spaziergänge und Kulturbesuche. Im Sommer die heißesten Stunden meiden. Eintritt und Öffnungszeiten prüfen; ruhigere Zeiten garantieren keine niedrigen Preise.',
    'Primavera e inizio autunno sono adatti a passeggiate e visite culturali. In estate evita le ore più calde. Verifica ingressi e orari dei siti; un periodo tranquillo non garantisce prezzi bassi.',
    'Primavera e início do outono favorecem passeios e visitas culturais. Evite as horas mais quentes no verão. Confirme bilhetes e horários dos recintos; uma época calma não garante preços baixos.',
    'Primavera i inici de tardor afavoreixen passejades i visites culturals. A l’estiu evita les hores de més calor. Comprova entrades i horaris dels recintes; una època tranquil·la no garanteix preus baixos.',
  ]),
  island: localize([
    'Mayo, junio y septiembre permiten combinar pueblos, patrimonio y costa según el tiempo. Julio y agosto suelen ser más concurridos. Los vuelos y servicios pueden ser estacionales; comprueba horarios y las condiciones de visita del túnel de Eupalinos.',
    'May, June and September suit villages, heritage and coastal visits, weather permitting. July and August are usually busier. Flights and services may be seasonal; check schedules and visiting conditions for the Tunnel of Eupalinos.',
    'Mai, juin et septembre permettent de combiner villages, patrimoine et littoral selon la météo. Juillet et août sont souvent plus fréquentés. Vols et services peuvent être saisonniers ; vérifiez horaires et conditions de visite du tunnel d’Eupalinos.',
    'Mai, Juni und September eignen sich je nach Wetter für Dörfer, Kultur und Küste. Juli und August sind meist belebter. Flüge und Angebote können saisonal sein; Fahrpläne und Besuchsbedingungen des Eupalinos-Tunnels prüfen.',
    'Maggio, giugno e settembre permettono di unire paesi, patrimonio e costa secondo il tempo. Luglio e agosto sono spesso più affollati. Voli e servizi possono essere stagionali; verifica orari e condizioni di visita del tunnel di Eupalino.',
    'Maio, junho e setembro permitem combinar aldeias, património e costa conforme o tempo. Julho e agosto costumam ser mais concorridos. Voos e serviços podem ser sazonais; confirme horários e condições de visita do túnel de Eupalinos.',
    'Maig, juny i setembre permeten combinar pobles, patrimoni i costa segons el temps. Juliol i agost solen ser més concorreguts. Vols i serveis poden ser estacionals; comprova horaris i condicions de visita del túnel d’Eupalinos.',
  ]),
};
const arrival = localize([
  'Llegada por {code}. El aeropuerto está separado del centro turístico: prevé el traslado terrestre hasta el alojamiento y consulta los vuelos y transportes disponibles para tus fechas.',
  'Arrive via {code}. The airport is separate from the tourist centre: allow for ground transport to your accommodation and check flights and transport for your dates.',
  'Arrivée par {code}. L’aéroport est distinct du centre touristique : prévoyez le transfert terrestre jusqu’à votre hébergement et vérifiez vols et transports pour vos dates.',
  'Anreise über {code}. Flughafen und touristisches Zentrum sind getrennte Orte: den Landtransfer zur Unterkunft einplanen und Flüge sowie Verkehrsmittel für die Reisedaten prüfen.',
  'Arrivo tramite {code}. L’aeroporto è separato dal centro turistico: prevedi il trasferimento terrestre fino all’alloggio e verifica voli e trasporti per le tue date.',
  'Chegada por {code}. O aeroporto fica separado do centro turístico: preveja o transporte terrestre até ao alojamento e confirme voos e transportes para as suas datas.',
  'Arribada per {code}. L’aeroport és separat del centre turístic: preveu el trasllat terrestre fins a l’allotjament i consulta vols i transports per a les teves dates.',
]);
type Seed = {
  slug: 'preveza' | 'samos' | 'kalamata'; airport: 'PVK' | 'SMI' | 'KLX';
  names: Seven; descriptions: Seven; recommendations: [Seven, Seven, Seven, Seven];
  stay: string; island?: boolean; aliases: string[];
};
function destination(seed: Seed): DestinationProfile {
  const names = localize(seed.names), descriptions = localize(seed.descriptions);
  const recommendations = seed.recommendations.map(localize);
  const translations = Object.fromEntries(locales.map(locale => [locale, {
    name: names[locale], description: descriptions[locale],
    recommendations: recommendations.map(place => `${visit[locale]} ${place[locale]}`) as DestinationText['recommendations'],
    recommendedStay: `${seed.stay} ${days[locale]}`,
    seasonalityNote: `${seasons[seed.island ? 'island' : 'city'][locale]} ${arrival[locale].replace('{code}', seed.airport)}`,
  }])) as Record<Locale, DestinationText>;
  return {
    id: `gr-${seed.slug}`, slug: seed.slug, countryCode: 'GR', country: 'Grecia',
    ...greeceRegionalImages[seed.slug], ...translations.es, translations,
    airports: [{ iataCode: seed.airport }], iataCodes: [seed.airport], metropolitanCodes: [],
    aliases: Array.from(new Set([...Object.values(names), ...seed.aliases])),
    bestMonths: seed.island ? [5, 6, 9] : [4, 5, 6, 9, 10],
    lowSeasonMonths: [1, 2, 11, 12], highSeasonMonths: [7, 8], publication: { status: 'draft' },
  };
}

// Three additions to the twelve existing Greek profiles; only explicit city/airport selections.
export const greeceRegionalADestinations: DestinationProfile[] = [
  destination({ slug: 'preveza', airport: 'PVK', stay: '2–3', aliases: ['Preveza', 'Préveza', 'Aktion', 'Aktio', 'Actium', 'Πρέβεζα'],
    names: ['Préveza', 'Preveza', 'Prévéza', 'Preveza', 'Prevesa', 'Preveza', 'Préveza'],
    descriptions: [
      'Calles históricas, puerto y patrimonio antiguo para conocer la entrada al golfo de Ambracia.',
      'Historic lanes, a waterfront and ancient heritage introduce the entrance to the Ambracian Gulf.',
      'Ruelles historiques, port et patrimoine antique pour découvrir l’entrée du golfe Ambracique.',
      'Historische Gassen, Hafen und antikes Erbe erschließen den Eingang zum Ambrakischen Golf.',
      'Vicoli storici, porto e patrimonio antico per conoscere l’ingresso del golfo di Ambracia.',
      'Ruelas históricas, porto e património antigo para conhecer a entrada do golfo de Ambrácia.',
      'Carrerons històrics, port i patrimoni antic per descobrir l’entrada del golf d’Ambràcia.',
    ], recommendations: [
      ['Casco antiguo de Préveza', 'Preveza Old Town', 'Vieille ville de Prévéza', 'Altstadt von Preveza', 'Centro storico di Prevesa', 'Centro histórico de Preveza', 'Nucli antic de Préveza'],
      ['Paseo marítimo', 'Waterfront', 'Front de mer', 'Uferpromenade', 'Lungomare', 'Passeio marítimo', 'Passeig marítim'],
      ['Nicópolis', 'Nikopolis', 'Nicopolis', 'Nikopolis', 'Nicopoli', 'Nicópolis', 'Nicòpolis'],
      ['Castillo de Agios Andreas', 'Agios Andreas Castle', 'Château d’Agios Andreas', 'Burg Agios Andreas', 'Castello di Agios Andreas', 'Castelo de Agios Andreas', 'Castell d’Agios Andreas'],
    ] }),
  destination({ slug: 'samos', airport: 'SMI', stay: '4–5', island: true, aliases: ['Samos', 'Vathy', 'Vathi', 'Pythagoreio', 'Pythagorio', 'Σάμος'],
    names: ['Samos', 'Samos', 'Samos', 'Samos', 'Samo', 'Samos', 'Samos'],
    descriptions: [
      'Pueblos, paisajes verdes y patrimonio antiguo para recorrer la isla con tiempo para los traslados.',
      'Villages, green landscapes and ancient heritage reward an island trip with time for transfers.',
      'Villages, paysages verdoyants et patrimoine antique à explorer en prévoyant le temps des trajets.',
      'Dörfer, grüne Landschaften und antikes Erbe laden zur Inselerkundung mit Zeit für Fahrten ein.',
      'Paesi, paesaggi verdi e patrimonio antico da esplorare prevedendo tempo per gli spostamenti.',
      'Aldeias, paisagens verdes e património antigo para explorar com tempo para as deslocações.',
      'Pobles, paisatges verds i patrimoni antic per explorar reservant temps per als trasllats.',
    ], recommendations: [
      ['Pythagoreio', 'Pythagoreio', 'Pythagoreio', 'Pythagoreio', 'Pythagoreio', 'Pythagoreio', 'Pythagoreio'],
      ['Heraion de Samos', 'Heraion of Samos', 'Héraion de Samos', 'Heraion von Samos', 'Heraion di Samo', 'Heraion de Samos', 'Heraion de Samos'],
      ['Túnel de Eupalinos', 'Tunnel of Eupalinos', 'Tunnel d’Eupalinos', 'Eupalinos-Tunnel', 'Tunnel di Eupalino', 'Túnel de Eupalinos', 'Túnel d’Eupalinos'],
      ['Vathy', 'Vathy', 'Vathy', 'Vathy', 'Vathy', 'Vathy', 'Vathy'],
    ] }),
  destination({ slug: 'kalamata', airport: 'KLX', stay: '3–4', aliases: ['Kalamata', 'Calamata', 'Καλαμάτα'],
    names: ['Calamata', 'Kalamata', 'Kalamata', 'Kalamata', 'Calamata', 'Calamata', 'Kalamata'],
    descriptions: [
      'Patrimonio urbano, costa y paisajes de olivos para explorar Mesenia desde su ciudad principal.',
      'Urban heritage, coast and olive landscapes make a base for exploring Messinia.',
      'Patrimoine urbain, littoral et oliveraies pour explorer la Messénie depuis sa ville principale.',
      'Städtisches Erbe, Küste und Olivenlandschaften bilden einen Ausgangspunkt für Messenien.',
      'Patrimonio urbano, costa e paesaggi di ulivi per esplorare la Messenia dalla città principale.',
      'Património urbano, costa e paisagens de olivais para explorar a Messénia a partir da cidade principal.',
      'Patrimoni urbà, costa i paisatges d’oliveres per explorar Messènia des de la seva ciutat principal.',
    ], recommendations: [
      ['Castillo de Calamata', 'Kalamata Castle', 'Château de Kalamata', 'Burg Kalamata', 'Castello di Calamata', 'Castelo de Calamata', 'Castell de Kalamata'],
      ['Casco antiguo', 'Old Town', 'Vieille ville', 'Altstadt', 'Centro storico', 'Centro histórico', 'Nucli antic'],
      ['Mercado Central', 'Central Market', 'Marché central', 'Zentralmarkt', 'Mercato centrale', 'Mercado Central', 'Mercat Central'],
      ['Antigua Mesene', 'Ancient Messene', 'Messène antique', 'Antikes Messene', 'Antica Messene', 'Antiga Messene', 'Messene antiga'],
    ] }),
];
