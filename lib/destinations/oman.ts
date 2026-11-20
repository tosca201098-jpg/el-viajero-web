import { asiaCountryDestinations, commonsPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = commonsPhoto('Sunset over Muscat1.jpg', 'Christoph Strässler', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/');
const photo2 = commonsPhoto('Salalah oman.jpg', 'Syed99975', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/');
const photo3 = commonsPhoto('The Developing City of Duqm.jpg', 'Talladac', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/');
const photo4 = commonsPhoto('Walking in Sohar.jpg', 'tuttotutto', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/');

const season1: Seven = ['De noviembre a marzo el clima suele ser más agradable; el verano es muy caluroso y húmedo.', 'November to March is usually more pleasant; summer is very hot and humid.', 'De novembre à mars, le climat est généralement plus agréable ; l’été est très chaud et humide.', 'Von November bis März ist das Klima meist angenehmer; der Sommer ist sehr heiß und feucht.', 'Da novembre a marzo il clima è in genere più piacevole; l’estate è molto calda e umida.', 'De novembro a março o clima costuma ser mais agradável; o verão é muito quente e húmido.', 'De novembre a març el clima sol ser més agradable; l’estiu és molt calorós i humit.'];
const season2: Seven = ['El khareef, entre julio y septiembre, transforma la zona; en invierno el tiempo es más seco y templado.', 'Khareef from July to September transforms the region; winter is drier and mild.', 'Le khareef de juillet à septembre transforme la région ; l’hiver est plus sec et doux.', 'Der Khareef von Juli bis September verwandelt die Region; der Winter ist trockener und mild.', 'Il khareef da luglio a settembre trasforma la regione; l’inverno è più secco e mite.', 'O khareef, de julho a setembro, transforma a região; o inverno é mais seco e ameno.', 'El khareef, de juliol a setembre, transforma la zona; l’hivern és més sec i temperat.'];
const season3: Seven = ['De noviembre a marzo suele ser más cómodo para recorrer la costa y el desierto.', 'November to March is usually more comfortable for exploring coast and desert.', 'De novembre à mars, la découverte de la côte et du désert est généralement plus confortable.', 'Von November bis März lassen sich Küste und Wüste meist angenehmer erkunden.', 'Da novembre a marzo è in genere più comodo esplorare costa e deserto.', 'De novembro a março costuma ser mais confortável explorar a costa e o deserto.', 'De novembre a març sol ser més còmode recórrer la costa i el desert.'];
const season4: Seven = ['El invierno es la época más agradable para visitar la costa y la fortaleza.', 'Winter is the most pleasant time to visit the coast and fort.', 'L’hiver est la période la plus agréable pour découvrir la côte et le fort.', 'Der Winter ist die angenehmste Zeit für Küste und Festung.', 'L’inverno è il periodo più piacevole per visitare costa e forte.', 'O inverno é a época mais agradável para visitar a costa e o forte.', 'L’hivern és l’època més agradable per visitar la costa i el fort.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'muscat', name: 'Mascate', codes: ['MCT'], photo: photo1, stay: '3–5',
    description: ['Capital entre montañas y mar, con fortalezas, zocos, mezquitas y calas del golfo de Omán.', 'A capital between mountains and sea, with forts, souks, mosques and coves on the Gulf of Oman.', 'Capitale entre montagnes et mer, avec forts, souks, mosquées et criques du golfe d’Oman.', 'Hauptstadt zwischen Bergen und Meer mit Festungen, Souks, Moscheen und Buchten am Golf von Oman.', 'Capitale tra montagne e mare, con forti, souk, moschee e calette del Golfo dell’Oman.', 'Capital entre montanhas e mar, com fortalezas, souks, mesquitas e enseadas do golfo de Omã.', 'Capital entre muntanyes i mar, amb fortaleses, socs, mesquites i cales del golf d’Oman.'],
    recommendations: [
      ['Gran Mezquita del Sultán Qaboos', 'Sultan Qaboos Grand Mosque', 'Grande Mosquée du Sultan Qaboos', 'Sultan-Qabus-Großmoschee', 'Grande Moschea del Sultano Qaboos', 'Grande Mesquita do Sultão Qaboos', 'Gran Mesquita del Sultà Qaboos'],
      ['Zoco de Mutrah', 'Mutrah Souq', 'Souk de Mutrah', 'Mutrah-Souk', 'Souq di Mutrah', 'Souq de Mutrah', 'Soc de Mutrah'],
      ['Corniche de Mutrah', 'Mutrah Corniche', 'Corniche de Mutrah', 'Corniche von Mutrah', 'Corniche di Mutrah', 'Corniche de Mutrah', 'Corniche de Mutrah'],
      ['Fuerte Al Jalali', 'Al Jalali Fort', 'Fort Al Jalali', 'Festung Al Jalali', 'Forte Al Jalali', 'Forte Al Jalali', 'Fort Al Jalali'],
    ],
    seasonality: season1,
    aliases: ['Muscat', 'Maskat', 'Mascat', 'Muscat Airport', 'Mascate Airport', 'Muscat International Airport', 'MCT Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'salalah', name: 'Salalah', codes: ['SLL'], photo: photo2, stay: '3–5',
    description: ['Ciudad del sur de Omán conocida por sus playas, incienso y el paisaje verde de la temporada khareef.', 'Southern Omani city known for beaches, frankincense and the green landscapes of the khareef season.', 'Ville du sud d’Oman connue pour ses plages, son encens et les paysages verts de la saison khareef.', 'Südomanische Stadt, bekannt für Strände, Weihrauch und die grüne Landschaft der Khareef-Saison.', 'Città del sud dell’Oman nota per spiagge, incenso e paesaggi verdi della stagione khareef.', 'Cidade do sul de Omã conhecida pelas praias, incenso e paisagens verdes da época khareef.', 'Ciutat del sud d’Oman coneguda per les platges, l’encens i els paisatges verds de la temporada khareef.'],
    recommendations: [
      ['Playa de Al Mughsail', 'Al Mughsail Beach', 'Plage d’Al Mughsail', 'Al-Mughsail-Strand', 'Spiaggia di Al Mughsail', 'Praia de Al Mughsail', 'Platja d’Al Mughsail'],
      ['Zoco de Al Husn', 'Al Husn Souq', 'Souk Al Husn', 'Al-Husn-Souk', 'Souq Al Husn', 'Souq Al Husn', 'Soc Al Husn'],
      ['Museo de la Tierra del Incienso', 'Museum of the Frankincense Land', 'Musée de la terre de l’encens', 'Museum des Weihrauchlands', 'Museo della Terra dell’Incenso', 'Museu da Terra do Incenso', 'Museu de la Terra de l’Encens'],
      ['Wadi Darbat', 'Wadi Darbat', 'Wadi Darbat', 'Wadi Darbat', 'Wadi Darbat', 'Wadi Darbat', 'Wadi Darbat'],
    ],
    seasonality: season2,
    aliases: ['Salala', 'Salalah Airport', 'Salalah International Airport', 'SLL Airport', 'Dhofar'],
    bestMonths: [7, 8, 9, 10, 11], lowSeasonMonths: [4, 5, 6], highSeasonMonths: [7, 8, 9],
  },
  {
    slug: 'duqm', name: 'Duqm', codes: ['DQM'], metropolitanCodes: ['JNJ'], photo: photo3, stay: '2–3',
    description: ['Costa tranquila del mar Arábigo, con paisajes desérticos, puerto y rutas hacia la reserva de Al Wusta.', 'A quiet Arabian Sea coast with desert landscapes, a port and routes to the Al Wusta reserve.', 'Côte tranquille de la mer d’Arabie, avec paysages désertiques, port et routes vers la réserve d’Al Wusta.', 'Ruhige Küste am Arabischen Meer mit Wüstenlandschaften, Hafen und Routen zum Al-Wusta-Reservat.', 'Tranquilla costa del Mar Arabico, con paesaggi desertici, porto e itinerari verso la riserva di Al Wusta.', 'Costa tranquila do mar Arábico, com paisagens desérticas, porto e rotas para a reserva de Al Wusta.', 'Costa tranquil·la del mar d’Aràbia, amb paisatges desèrtics, port i rutes cap a la reserva d’Al Wusta.'],
    recommendations: [
      ['Puerto de Duqm', 'Duqm Port', 'Port de Duqm', 'Hafen von Duqm', 'Porto di Duqm', 'Porto de Duqm', 'Port de Duqm'],
      ['Jardín de Rocas de Duqm', 'Duqm Rock Garden', 'Jardin de rochers de Duqm', 'Felsengarten von Duqm', 'Giardino roccioso di Duqm', 'Jardim de Rochas de Duqm', 'Jardí de Roques de Duqm'],
      ['Playa de Duqm', 'Duqm Beach', 'Plage de Duqm', 'Strand von Duqm', 'Spiaggia di Duqm', 'Praia de Duqm', 'Platja de Duqm'],
      ['Reserva de Al Wusta', 'Al Wusta Wildlife Reserve', 'Réserve naturelle d’Al Wusta', 'Al-Wusta-Naturschutzgebiet', 'Riserva naturale di Al Wusta', 'Reserva Natural de Al Wusta', 'Reserva Natural d’Al Wusta'],
    ],
    seasonality: season3,
    aliases: ['Duqm Airport', 'Duqm Jaaluni Airport', 'DQM Airport', 'Al Wusta'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [5, 6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'sohar', name: 'Sohar', codes: ['OHS'], photo: photo4, stay: '2–3',
    description: ['Ciudad portuaria del norte, con fortaleza histórica, costa del golfo de Omán y tradición comercial.', 'A northern port city with a historic fort, Gulf of Oman coast and trading tradition.', 'Ville portuaire du nord, avec fort historique, côte du golfe d’Oman et tradition commerciale.', 'Nördliche Hafenstadt mit historischer Festung, Küste am Golf von Oman und Handelstradition.', 'Città portuale del nord, con forte storico, costa del Golfo dell’Oman e tradizione commerciale.', 'Cidade portuária do norte, com forte histórico, costa do golfo de Omã e tradição comercial.', 'Ciutat portuària del nord, amb fort històric, costa del golf d’Oman i tradició comercial.'],
    recommendations: [
      ['Fuerte de Sohar', 'Sohar Fort', 'Fort de Sohar', 'Festung von Sohar', 'Forte di Sohar', 'Forte de Sohar', 'Fort de Sohar'],
      ['Paseo marítimo de Sohar', 'Sohar Corniche', 'Corniche de Sohar', 'Corniche von Sohar', 'Corniche di Sohar', 'Corniche de Sohar', 'Corniche de Sohar'],
      ['Zoco de Sohar', 'Sohar Souq', 'Souk de Sohar', 'Sohar-Souk', 'Souq di Sohar', 'Souq de Sohar', 'Soc de Sohar'],
      ['Playa de Sohar', 'Sohar Beach', 'Plage de Sohar', 'Strand von Sohar', 'Spiaggia di Sohar', 'Praia de Sohar', 'Platja de Sohar'],
    ],
    seasonality: season4,
    aliases: ['Suhar', 'Sohar Airport', 'Suhar Airport', 'Sohar International Airport', 'OHS Airport', 'Al Batinah'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
];

export const omanDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'OM', country: 'Omán' }, seeds);
