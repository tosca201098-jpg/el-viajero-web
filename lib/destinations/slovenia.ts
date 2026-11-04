import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, i) => [locale, values[i]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const seasons = localize([
  'Primavera y otoño son buenas épocas para pasear; en verano puede haber más visitantes. Los meses tranquilos no garantizan precios bajos. Comprueba el tiempo y los horarios de visita.',
  'Spring and autumn suit walking; summer can be busier. Quieter months do not guarantee low prices. Check the weather and attraction opening times.',
  'Le printemps et l’automne se prêtent aux promenades ; l’été peut être plus fréquenté. Les mois calmes ne garantissent pas des prix bas. Vérifiez la météo et les horaires de visite.',
  'Frühling und Herbst eignen sich für Spaziergänge; im Sommer kann es voller sein. Ruhigere Monate garantieren keine niedrigen Preise. Wetter und Öffnungszeiten prüfen.',
  'Primavera e autunno sono adatti alle passeggiate; l’estate può essere più affollata. I mesi tranquilli non garantiscono prezzi bassi. Controlla meteo e orari di visita.',
  'Primavera e outono são boas épocas para passear; o verão pode ter mais visitantes. Os meses tranquilos não garantem preços baixos. Confirme o tempo e os horários das visitas.',
  'Primavera i tardor són bones èpoques per passejar; a l’estiu hi pot haver més visitants. Els mesos tranquils no garanteixen preus baixos. Comprova el temps i els horaris de visita.',
]);
const airportNotes = {
  LJU: localize([
    'LJU es el principal aeropuerto de pasajeros del país y está en Brnik, fuera de Liubliana. Consulta los vuelos y el traslado a la ciudad para tus fechas.',
    'LJU is the country’s main passenger airport, at Brnik outside Ljubljana. Check flights and the city transfer for your dates.',
    'LJU est le principal aéroport de passagers du pays, à Brnik hors de Ljubljana. Vérifiez les vols et le transfert vers la ville pour vos dates.',
    'LJU ist der wichtigste Passagierflughafen des Landes und liegt in Brnik außerhalb von Ljubljana. Flüge und Stadttransfer für die Reisedaten prüfen.',
    'LJU è il principale aeroporto passeggeri del paese e si trova a Brnik, fuori Lubiana. Verifica voli e trasferimento in città per le tue date.',
    'LJU é o principal aeroporto de passageiros do país e fica em Brnik, fora de Liubliana. Confirme os voos e o transporte para a cidade nas suas datas.',
    'LJU és el principal aeroport de passatgers del país i és a Brnik, fora de Ljubljana. Consulta els vols i el trasllat a la ciutat per a les teves dates.',
  ]),
  MBX: localize([
    'MBX está en Orehova vas, fuera de Maribor. El operador indica que se utiliza principalmente para formación de vuelo: no presupongas que hay vuelos regulares. Confirma el servicio antes de planificar; LJU es una alternativa con traslado terrestre.',
    'MBX is at Orehova vas outside Maribor. Its operator says it is mainly used for flight training: do not assume scheduled flights are available. Confirm service before planning; LJU is an alternative with a ground transfer.',
    'MBX se trouve à Orehova vas, hors de Maribor. Selon l’exploitant, il sert surtout à la formation aéronautique : ne présumez pas de vols réguliers. Confirmez le service ; LJU est une alternative avec transfert terrestre.',
    'MBX liegt in Orehova vas außerhalb von Maribor. Laut Betreiber dient er hauptsächlich der Flugausbildung: Linienflüge nicht voraussetzen. Das Angebot vor der Planung bestätigen; LJU ist eine Alternative mit Landtransfer.',
    'MBX si trova a Orehova vas, fuori Maribor. Il gestore segnala un uso soprattutto per l’addestramento: non presumere la disponibilità di voli di linea. Conferma il servizio; LJU è un’alternativa con trasferimento via terra.',
    'MBX fica em Orehova vas, fora de Maribor. Segundo o operador, é usado sobretudo para formação de voo: não pressuponha voos regulares. Confirme o serviço; LJU é uma alternativa com transporte terrestre.',
    'MBX és a Orehova vas, fora de Maribor. L’operador indica un ús principal per a formació de vol: no pressuposis vols regulars. Confirma el servei abans de planificar; LJU és una alternativa amb trasllat terrestre.',
  ]),
  POW: localize([
    'POW está en Sečovlje, fuera de Portorož. Su oferta incluye aviación general y vuelos privados; no presupongas conexiones regulares. Confirma el servicio y el traslado antes de reservar. LJU y Trieste (TRS, Italia) son alternativas por carretera.',
    'POW is at Sečovlje outside Portorož. Its services include general aviation and private flights; do not assume scheduled connections. Confirm service and transfers before booking. LJU and Trieste (TRS, Italy) are alternatives by road.',
    'POW se trouve à Sečovlje, hors de Portorož. Ses services comprennent l’aviation générale et privée ; ne présumez pas de liaisons régulières. Confirmez service et transfert. LJU et Trieste (TRS, Italie) sont des alternatives routières.',
    'POW liegt in Sečovlje außerhalb von Portorož. Das Angebot umfasst allgemeine Luftfahrt und Privatflüge; Linienverbindungen nicht voraussetzen. Angebot und Transfer vor der Buchung prüfen. LJU und Triest (TRS, Italien) sind Straßenalternativen.',
    'POW si trova a Sečovlje, fuori Portorose. L’offerta comprende aviazione generale e voli privati; non presumere collegamenti di linea. Conferma servizio e trasferimento. LJU e Trieste (TRS, Italia) sono alternative via terra.',
    'POW fica em Sečovlje, fora de Portorož. A oferta inclui aviação geral e voos privados; não pressuponha ligações regulares. Confirme serviço e transporte. LJU e Trieste (TRS, Itália) são alternativas por estrada.',
    'POW és a Sečovlje, fora de Portorož. L’oferta inclou aviació general i vols privats; no pressuposis connexions regulars. Confirma el servei i el trasllat. LJU i Trieste (TRS, Itàlia) són alternatives per carretera.',
  ]),
};
type Seed = {
  slug: string; code: keyof typeof airportNotes; names: Seven; descriptions: Seven;
  recommendations: [Seven, Seven, Seven, Seven]; stay: string; aliases: string[];
  photo: { image: string; imageSource: string; imageCredit: string; imageLicense: string; imageLicenseUrl: string };
  accessAirports?: DestinationProfile['accessAirports'];
};
function destination(seed: Seed): DestinationProfile {
  const names = localize(seed.names), descriptions = localize(seed.descriptions);
  const recommendations = seed.recommendations.map(localize);
  const translations = Object.fromEntries(locales.map(locale => [locale, {
    name: names[locale], description: descriptions[locale],
    recommendations: recommendations.map(place => place[locale]) as DestinationText['recommendations'],
    recommendedStay: `${seed.stay} ${days[locale]}`,
    seasonalityNote: `${seasons[locale]} ${airportNotes[seed.code][locale]}`,
  }])) as Record<Locale, DestinationText>;
  return {
    id: `si-${seed.slug}`, slug: seed.slug, countryCode: 'SI', country: 'Eslovenia',
    ...seed.photo, ...translations.es, translations,
    airports: [{ iataCode: seed.code }], iataCodes: [seed.code], metropolitanCodes: [],
    ...(seed.accessAirports ? { accessAirports: seed.accessAirports } : {}),
    aliases: Array.from(new Set([...Object.values(names), ...seed.aliases])),
    bestMonths: [5, 6, 9, 10], lowSeasonMonths: [1, 2, 11], highSeasonMonths: [7, 8],
    publication: { status: 'draft' },
  };
}

// Complete set of the three international airports listed by Slovenia's Ministry.
// The profile describes the served destination; it does not promise a scheduled route.
export const sloveniaDestinations: DestinationProfile[] = [
  destination({ slug: 'ljubljana', code: 'LJU', stay: '2–3', aliases: ['Ljubljana', 'Brnik', 'Zgornji Brnik', 'Jože Pučnik', 'Joze Pucnik'],
    names: ['Liubliana', 'Ljubljana', 'Ljubljana', 'Ljubljana', 'Lubiana', 'Liubliana', 'Ljubljana'],
    descriptions: [
      'Puentes sobre el Ljubljanica, mercados y un castillo en la colina para descubrir a pie la capital eslovena.',
      'Bridges over the Ljubljanica, markets and a hilltop castle invite you to explore Slovenia’s capital on foot.',
      'Ponts sur la Ljubljanica, marchés et château perché invitent à découvrir à pied la capitale slovène.',
      'Brücken über die Ljubljanica, Märkte und eine Burg auf dem Hügel laden zu Fuß durch Sloweniens Hauptstadt ein.',
      'Ponti sulla Ljubljanica, mercati e un castello sulla collina per scoprire a piedi la capitale slovena.',
      'Pontes sobre o Ljubljanica, mercados e um castelo na colina para descobrir a pé a capital eslovena.',
      'Ponts sobre el Ljubljanica, mercats i un castell al turó per descobrir a peu la capital eslovena.',
    ], recommendations: [
      ['Castillo de Liubliana', 'Ljubljana Castle', 'Château de Ljubljana', 'Burg von Ljubljana', 'Castello di Lubiana', 'Castelo de Liubliana', 'Castell de Ljubljana'],
      ['Triple Puente', 'Triple Bridge', 'Triple Pont', 'Drei Brücken', 'Triplice Ponte', 'Ponte Tripla', 'Triple Pont'],
      ['Puente de los Dragones', 'Dragon Bridge', 'Pont des Dragons', 'Drachenbrücke', 'Ponte dei Draghi', 'Ponte dos Dragões', 'Pont dels Dracs'],
      ['Mercado Central', 'Central Market', 'Marché central', 'Zentralmarkt', 'Mercato centrale', 'Mercado Central', 'Mercat Central'],
    ], photo: {
      image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/21/Ljubljanica_river_in_Ljubljana_%284%29.jpg/960px-Ljubljanica_river_in_Ljubljana_%284%29.jpg',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Ljubljanica_river_in_Ljubljana_(4).jpg',
      imageCredit: 'Tournasol7', imageLicense: 'CC BY 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  }),
  destination({ slug: 'maribor', code: 'MBX', stay: '2–3', aliases: ['Maribor', 'Marburg an der Drau', 'Orehova vas'],
    names: ['Maribor', 'Maribor', 'Maribor', 'Maribor', 'Maribor', 'Maribor', 'Maribor'],
    descriptions: [
      'El río Drava, el barrio de Lent y la tradición vinícola marcan el ritmo de esta ciudad del nordeste esloveno.',
      'The Drava river, the Lent district and wine heritage shape this city in northeastern Slovenia.',
      'La Drave, le quartier de Lent et le patrimoine viticole rythment cette ville du nord-est slovène.',
      'Drau, das Viertel Lent und Weinbautradition prägen diese Stadt im Nordosten Sloweniens.',
      'Il fiume Drava, il quartiere Lent e la tradizione vinicola caratterizzano questa città della Slovenia nordorientale.',
      'O rio Drava, o bairro de Lent e a tradição vinícola marcam esta cidade do nordeste esloveno.',
      'El riu Drava, el barri de Lent i la tradició vinícola marquen el ritme d’aquesta ciutat del nord-est eslovè.',
    ], recommendations: [
      ['Paseo del Drava en Lent', 'Lent riverside promenade', 'Promenade de Lent sur la Drave', 'Drau-Promenade in Lent', 'Lungofiume di Lent', 'Passeio do Drava em Lent', 'Passeig del Drava a Lent'],
      ['La Vieja Vid', 'The Old Vine', 'La Vieille Vigne', 'Die Alte Rebe', 'La Vecchia Vite', 'A Videira Antiga', 'El Cep Vell'],
      ['Torre del Agua', 'Water Tower', 'Tour de l’Eau', 'Wasserturm', 'Torre dell’Acqua', 'Torre da Água', 'Torre de l’Aigua'],
      ['Puente Viejo', 'Old Bridge', 'Vieux Pont', 'Alte Brücke', 'Ponte Vecchio', 'Ponte Velha', 'Pont Vell'],
    ], accessAirports: [{ iataCode: 'LJU', name: 'Ljubljana Jože Pučnik', countryCode: 'SI' }], photo: {
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/View-of-Maribor.jpg/1280px-View-of-Maribor.jpg',
      imageSource: 'https://commons.wikimedia.org/wiki/File:View-of-Maribor.jpg',
      imageCredit: 'acediscovery', imageLicense: 'CC BY 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    },
  }),
  destination({ slug: 'portoroz', code: 'POW', stay: '2–3', aliases: ['Portorož', 'Portoroz', 'Portorose', 'Sečovlje', 'Secovlje', 'Sicciole'],
    names: ['Portorož', 'Portorož', 'Portorož', 'Portorož', 'Portorose', 'Portorož', 'Portorož'],
    descriptions: [
      'Paseos junto al Adriático, salinas y una escapada a la cercana Piran para conocer la costa eslovena.',
      'Adriatic waterfront walks, salt pans and a visit to nearby Piran introduce Slovenia’s coast.',
      'Promenades sur l’Adriatique, salines et visite de Piran toute proche pour découvrir le littoral slovène.',
      'Spaziergänge an der Adria, Salinen und ein Besuch im nahen Piran erschließen Sloweniens Küste.',
      'Passeggiate sull’Adriatico, saline e una visita alla vicina Pirano per scoprire la costa slovena.',
      'Passeios junto ao Adriático, salinas e uma visita à vizinha Piran para conhecer a costa eslovena.',
      'Passejades vora l’Adriàtic, salines i una visita a la propera Piran per descobrir la costa eslovena.',
    ], recommendations: [
      ['Paseo marítimo de Portorož', 'Portorož seafront', 'Front de mer de Portorož', 'Uferpromenade von Portorož', 'Lungomare di Portorose', 'Passeio marítimo de Portorož', 'Passeig marítim de Portorož'],
      ['Salinas de Sečovlje', 'Sečovlje Salt Pans', 'Salines de Sečovlje', 'Salinen von Sečovlje', 'Saline di Sicciole', 'Salinas de Sečovlje', 'Salines de Sečovlje'],
      ['Plaza Tartini en Piran', 'Tartini Square in Piran', 'Place Tartini à Piran', 'Tartini-Platz in Piran', 'Piazza Tartini a Pirano', 'Praça Tartini em Piran', 'Plaça Tartini a Piran'],
      ['Casco antiguo de Piran', 'Piran old town', 'Vieille ville de Piran', 'Altstadt von Piran', 'Centro storico di Pirano', 'Centro histórico de Piran', 'Nucli antic de Piran'],
    ], accessAirports: [{ iataCode: 'LJU', name: 'Ljubljana Jože Pučnik', countryCode: 'SI' }, { iataCode: 'TRS', name: 'Trieste Airport', countryCode: 'IT' }], photo: {
      image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Portoroz_view.jpg/960px-Portoroz_view.jpg',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Portoroz_view.jpg',
      imageCredit: 'Dieter Karner', imageLicense: 'CC BY 2.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
    },
  }),
];
