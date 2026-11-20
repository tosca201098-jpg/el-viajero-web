import { asiaCountryDestinations, commonsPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = commonsPhoto('Riyadh Skyline.jpg', 'B.alotaby', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/');
const photo2 = commonsPhoto('Jeddah Corniche Photo.jpg', 'Kolaiel', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/');
const photo3 = commonsPhoto('Corniche Dammam.jpg', 'DonToofee', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/');
const photo4 = commonsPhoto('Masjid Nabawi. Medina, Saudi Arabia.jpg', 'Ali Mansuri (Wikimedia Commons: Ali Imran)', 'CC BY-SA 2.5', 'https://creativecommons.org/licenses/by-sa/2.5/');
const photo5 = commonsPhoto('Al-Ula, Saudi Arabia, seen from the viewpoint (8).jpg', 'Richard Mortel', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/');
const photo6 = commonsPhoto('Abha, Saudi Arabia.jpg', 'Java4', 'Public domain', 'https://commons.wikimedia.org/wiki/File:Abha,_Saudi_Arabia.jpg');

const season1: Seven = ['De noviembre a marzo suele ser más agradable.', 'November to March is usually more pleasant.', 'De novembre à mars, le climat est généralement plus agréable.', 'Von November bis März ist es meist angenehmer.', 'Da novembre a marzo il clima è in genere più piacevole.', 'De novembro a março costuma ser mais agradável.', 'De novembre a març sol ser més agradable.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'riyadh', name: 'Riad', codes: ['RUH'], photo: photo1, stay: '3–5',
    description: ['Capital de Arabia Saudí, entre rascacielos, museos, mercados y el paisaje de Najd.', 'Saudi Arabia’s capital, with skyscrapers, museums, markets and Najd landscapes.', 'Capitale d’Arabie saoudite, entre gratte-ciel, musées, marchés et paysages du Najd.', 'Hauptstadt Saudi-Arabiens mit Wolkenkratzern, Museen, Märkten und Najd-Landschaften.', 'Capitale dell’Arabia Saudita, tra grattacieli, musei, mercati e paesaggi del Najd.', 'Capital da Arábia Saudita, com arranha-céus, museus, mercados e paisagens de Najd.', 'Capital de l’Aràbia Saudita, amb gratacels, museus, mercats i paisatges de Najd.'],
    recommendations: [
      ['Torre Kingdom Centre', 'Kingdom Centre Tower', 'Tour Kingdom Centre', 'Kingdom Centre Tower', 'Torre Kingdom Centre', 'Torre Kingdom Centre', 'Torre Kingdom Centre'],
      ['Diriyah', 'Diriyah', 'Diriyah', 'Diriyah', 'Diriyah', 'Diriyah', 'Diriyah'],
      ['Museo Nacional', 'National Museum', 'Musée national', 'Nationalmuseum', 'Museo nazionale', 'Museu Nacional', 'Museu Nacional'],
      ['Zoco Al Zal', 'Al Zal Souq', 'Souk Al Zal', 'Al-Zal-Souk', 'Souq Al Zal', 'Souq Al Zal', 'Soc Al Zal'],
    ],
    seasonality: season1,
    aliases: ['Riyadh', 'Riyad', 'Riade', 'Riyadh Airport', 'King Khalid International Airport', 'RUH Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'jeddah', name: 'Yeda', codes: ['JED'], photo: photo2, stay: '3–5',
    description: ['Puerta al mar Rojo, con casco histórico, coral, arte urbano y paseo marítimo.', 'Gateway to the Red Sea, with a historic centre, coral, street art and seafront.', 'Porte de la mer Rouge, avec centre historique, corail, art urbain et front de mer.', 'Tor zum Roten Meer mit Altstadt, Korallen, Street Art und Uferpromenade.', 'Porta sul Mar Rosso, con centro storico, coralli, arte urbana e lungomare.', 'Porta do mar Vermelho, com centro histórico, corais, arte urbana e orla marítima.', 'Porta al mar Roig, amb centre històric, corall, art urbà i passeig marítim.'],
    recommendations: [
      ['Yeda histórica', 'Historic Jeddah', 'Djeddah historique', 'Historisches Dschidda', 'Gedda storica', 'Jidá histórica', 'Jedda històrica'],
      ['Corniche de Yeda', 'Jeddah Corniche', 'Corniche de Djeddah', 'Corniche von Dschidda', 'Corniche di Gedda', 'Corniche de Jidá', 'Corniche de Jedda'],
      ['Fuente del Rey Fahd', 'King Fahd Fountain', 'Fontaine du roi Fahd', 'König-Fahd-Brunnen', 'Fontana di Re Fahd', 'Fonte do Rei Fahd', 'Font del Rei Fahd'],
      ['Al-Balad', 'Al-Balad', 'Al-Balad', 'Al-Balad', 'Al-Balad', 'Al-Balad', 'Al-Balad'],
    ],
    seasonality: season1,
    aliases: ['Jeddah', 'Djeddah', 'Dschidda', 'Gedda', 'Jidá', 'Jedda', 'Jeddah Airport', 'King Abdulaziz International Airport', 'JED Airport', 'Yeda Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'dammam', name: 'Dammam', codes: ['DMM'], photo: photo3, stay: '2–4',
    description: ['Ciudad del golfo Pérsico, con paseo marítimo, playas y acceso a Al Khobar y Dhahran.', 'A Persian Gulf city with a seafront, beaches and access to Al Khobar and Dhahran.', 'Ville du golfe Persique, avec front de mer, plages et accès à Al Khobar et Dhahran.', 'Stadt am Persischen Golf mit Uferpromenade, Stränden und Zugang zu Al Khobar und Dhahran.', 'Città del Golfo Persico, con lungomare, spiagge e accesso ad Al Khobar e Dhahran.', 'Cidade do golfo Pérsico, com orla, praias e acesso a Al Khobar e Dhahran.', 'Ciutat del golf Pèrsic, amb passeig marítim, platges i accés a Al Khobar i Dhahran.'],
    recommendations: [
      ['Corniche de Dammam', 'Dammam Corniche', 'Corniche de Dammam', 'Corniche von Dammam', 'Corniche di Dammam', 'Corniche de Dammam', 'Corniche de Dammam'],
      ['Parque Rey Abdullah', 'King Abdullah Park', 'Parc du roi Abdullah', 'König-Abdullah-Park', 'Parco Re Abdullah', 'Parque Rei Abdullah', 'Parc Rei Abdullah'],
      ['Al Khobar', 'Al Khobar', 'Al Khobar', 'Al Khobar', 'Al Khobar', 'Al Khobar', 'Al Khobar'],
      ['Centro Rey Abdulaziz', 'King Abdulaziz Center', 'Centre du roi Abdulaziz', 'König-Abdulaziz-Zentrum', 'Centro Re Abdulaziz', 'Centro Rei Abdulaziz', 'Centre Rei Abdulaziz'],
    ],
    seasonality: season1,
    aliases: ['Dammam Airport', 'King Fahd International Airport', 'DMM Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'medina', name: 'Medina', codes: ['MED'], photo: photo4, stay: '2–4',
    description: ['Ciudad histórica y destino espiritual, con la Mezquita del Profeta y la herencia de Al Madinah.', 'Historic and spiritual destination, with the Prophet’s Mosque and Al Madinah heritage.', 'Destination historique et spirituelle, avec la Mosquée du Prophète et le patrimoine de Médine.', 'Historisches und spirituelles Reiseziel mit Prophetenmoschee und Erbe von Medina.', 'Destinazione storica e spirituale, con la Moschea del Profeta e il patrimonio di Medina.', 'Destino histórico e espiritual, com a Mesquita do Profeta e património de Medina.', 'Destinació històrica i espiritual, amb la Mesquita del Profeta i el patrimoni de Medina.'],
    recommendations: [
      ['Mezquita del Profeta', 'Prophet’s Mosque', 'Mosquée du Prophète', 'Prophetenmoschee', 'Moschea del Profeta', 'Mesquita do Profeta', 'Mesquita del Profeta'],
      ['Mezquita Quba', 'Quba Mosque', 'Mosquée de Quba', 'Quba-Moschee', 'Moschea di Quba', 'Mesquita de Quba', 'Mesquita de Quba'],
      ['Monte Uhud', 'Mount Uhud', 'Mont Uhud', 'Berg Uhud', 'Monte Uhud', 'Monte Uhud', 'Mont Uhud'],
      ['Museo Dar Al Madinah', 'Dar Al Madinah Museum', 'Musée Dar Al Madinah', 'Dar-Al-Madinah-Museum', 'Museo Dar Al Madinah', 'Museu Dar Al Madinah', 'Museu Dar Al Madinah'],
    ],
    seasonality: season1,
    aliases: ['Madinah', 'Al Madinah', 'Al-Madinah', 'Médine', 'Medina Airport', 'Prince Mohammad bin Abdulaziz International Airport', 'MED Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'alula', name: 'AlUla', codes: ['ULH'], photo: photo5, stay: '2–4',
    description: ['Oasis del noroeste, con tumbas nabateas, cañones de arenisca y un casco antiguo entre palmeras.', 'North-western oasis with Nabataean tombs, sandstone canyons and an old town among palms.', 'Oasis du nord-ouest, avec tombes nabatéennes, canyons de grès et vieille ville parmi les palmiers.', 'Oase im Nordwesten mit nabatäischen Gräbern, Sandsteincanyons und Altstadt zwischen Palmen.', 'Oasi nord-occidentale con tombe nabatee, canyon di arenaria e città vecchia tra le palme.', 'Oásis do noroeste, com túmulos nabateus, cânions de arenito e cidade antiga entre palmeiras.', 'Oasi del nord-oest, amb tombes nabatees, canons de gres i nucli antic entre palmeres.'],
    recommendations: [
      ['Hegra', 'Hegra', 'Hegra', 'Hegra', 'Hegra', 'Hegra', 'Hegra'],
      ['Roca del Elefante', 'Elephant Rock', 'Rocher de l’Éléphant', 'Elefantenfelsen', 'Roccia dell’Elefante', 'Rocha do Elefante', 'Roca de l’Elefant'],
      ['Casco antiguo de AlUla', 'AlUla Old Town', 'Vieille ville d’AlUla', 'Altstadt von AlUla', 'Città vecchia di AlUla', 'Cidade antiga de AlUla', 'Nucli antic d’AlUla'],
      ['Oasis de AlUla', 'AlUla Oasis', 'Oasis d’AlUla', 'Oase von AlUla', 'Oasi di AlUla', 'Oásis de AlUla', 'Oasi d’AlUla'],
    ],
    seasonality: season1,
    aliases: ['Al-Ula', 'Al Ula', 'AlUla Airport', 'Prince Abdul Majeed bin Abdulaziz International Airport', 'ULH Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'abha', name: 'Abha', codes: ['AHB'], photo: photo6, stay: '2–4',
    description: ['Capital de Asir entre montañas, niebla, pueblos tradicionales y paisajes más frescos del sur.', 'Asir’s mountain capital, with mist, traditional villages and cooler southern landscapes.', 'Capitale montagneuse d’Asir, avec brume, villages traditionnels et paysages plus frais du sud.', 'Gebirgshauptstadt von Asir mit Nebel, traditionellen Dörfern und kühleren Landschaften im Süden.', 'Capitale montana di Asir, con nebbia, villaggi tradizionali e paesaggi più freschi del sud.', 'Capital montanhosa de Asir, com nevoeiro, aldeias tradicionais e paisagens mais frescas do sul.', 'Capital muntanyosa d’Asir, amb boira, pobles tradicionals i paisatges més frescos del sud.'],
    recommendations: [
      ['Parque nacional de Asir', 'Asir National Park', 'Parc national d’Asir', 'Asir-Nationalpark', 'Parco nazionale di Asir', 'Parque Nacional de Asir', 'Parc Nacional d’Asir'],
      ['Pueblo de Rijal Almaa', 'Rijal Almaa village', 'Village de Rijal Almaa', 'Dorf Rijal Almaa', 'Villaggio di Rijal Almaa', 'Aldeia de Rijal Almaa', 'Poble de Rijal Almaa'],
      ['Monte Al Soudah', 'Al Soudah Mountain', 'Mont Al Soudah', 'Berg Al Soudah', 'Monte Al Soudah', 'Monte Al Soudah', 'Mont Al Soudah'],
      ['Lago de Abha', 'Abha Lake', 'Lac d’Abha', 'Abha-See', 'Lago di Abha', 'Lago de Abha', 'Llac d’Abha'],
    ],
    seasonality: season1,
    aliases: ['Abha Airport', 'Abha International Airport', 'AHB Airport', 'Asir'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
];

export const saudiArabiaDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'SA', country: 'Arabia Saudí' }, seeds);
