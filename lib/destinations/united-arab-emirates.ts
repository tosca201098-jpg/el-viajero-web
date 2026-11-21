import { asiaCountryDestinations, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1512453979798-5ea266f8880c', 'Fr6zexbmjmc', 'David Rodrigo');
const photo2 = unsplashPhoto('photo-1512632578888-169bbbc64f33', 'kZ1zThg6G40', 'David Rodrigo');
const photo3 = unsplashPhoto('photo-1778067217860-971b430b84c6', 'mwltBINcUjY', 'Mohsin khan');
const photo4 = unsplashPhoto('photo-1542878447-e2b6df2526fa', '5MtfBu7ZB-s', 'Pranav Madhu');
const photo5 = unsplashPhoto('photo-1593760029689-14e7cfed0cd3', 'puOOEUAotjs', 'Saj Shafique');

const season1: Seven = ['De noviembre a marzo las temperaturas son más agradables; el verano es muy caluroso.', 'November to March brings more pleasant temperatures; summer is very hot.', 'De novembre à mars, les températures sont plus agréables ; l’été est très chaud.', 'Von November bis März sind die Temperaturen angenehmer; der Sommer ist sehr heiß.', 'Da novembre a marzo le temperature sono più piacevoli; l’estate è molto calda.', 'De novembro a março as temperaturas são mais agradáveis; o verão é muito quente.', 'De novembre a març les temperatures són més agradables; l’estiu és molt calorós.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'dubai', name: 'Dubái', codes: ['DXB', 'DWC'], metropolitanCodes: ['DXB'], photo: photo1, stay: '3–5',
    description: ['Metrópoli de rascacielos, zocos, playas y desierto, servida por sus dos aeropuertos comerciales.', 'A metropolis of skyscrapers, souks, beaches and desert, served by its two commercial airports.', 'Métropole de gratte-ciel, souks, plages et désert, desservie par ses deux aéroports commerciaux.', 'Metropole mit Wolkenkratzern, Souks, Stränden und Wüste, bedient von zwei Verkehrsflughäfen.', 'Metropoli di grattacieli, souk, spiagge e deserto, servita dai suoi due aeroporti commerciali.', 'Metrópole de arranha-céus, souks, praias e deserto, servida pelos seus dois aeroportos comerciais.', 'Metròpoli de gratacels, socs, platges i desert, servida pels seus dos aeroports comercials.'],
    recommendations: [
      ['Burj Khalifa', 'Burj Khalifa', 'Burj Khalifa', 'Burj Khalifa', 'Burj Khalifa', 'Burj Khalifa', 'Burj Khalifa'],
      ['Dubai Creek', 'Dubai Creek', 'Dubai Creek', 'Dubai Creek', 'Dubai Creek', 'Dubai Creek', 'Dubai Creek'],
      ['Zoco del Oro', 'Gold Souk', 'Souk de l’Or', 'Gold Souk', 'Mercato dell’Oro', 'Mercado do Ouro', 'Mercat de l’Or'],
      ['Palm Jumeirah', 'Palm Jumeirah', 'Palm Jumeirah', 'Palm Jumeirah', 'Palm Jumeirah', 'Palm Jumeirah', 'Palm Jumeirah'],
    ],
    seasonality: season1,
    aliases: ['Dubai', 'Dubaï', 'Dubai Airport', 'Dubai International Airport', 'Al Maktoum International Airport', 'DXB Airport', 'DWC Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'abu-dhabi', name: 'Abu Dabi', codes: ['AUH'], photo: photo2, stay: '3–5',
    description: ['Capital insular de museos, arquitectura contemporánea, manglares y grandes playas del golfo.', 'An island capital of museums, contemporary architecture, mangroves and Gulf beaches.', 'Capitale insulaire de musées, architecture contemporaine, mangroves et plages du Golfe.', 'Inselhauptstadt mit Museen, moderner Architektur, Mangroven und Golfstränden.', 'Capitale insulare di musei, architettura contemporanea, mangrovie e spiagge del Golfo.', 'Capital insular de museus, arquitetura contemporânea, mangais e praias do golfo.', 'Capital insular de museus, arquitectura contemporània, manglars i platges del golf.'],
    recommendations: [
      ['Gran Mezquita Sheikh Zayed', 'Sheikh Zayed Grand Mosque', 'Grande Mosquée Cheikh Zayed', 'Scheich-Zayid-Moschee', 'Grande Moschea dello Sceicco Zayed', 'Grande Mesquita Sheikh Zayed', 'Gran Mesquita Sheikh Zayed'],
      ['Louvre Abu Dhabi', 'Louvre Abu Dhabi', 'Louvre Abu Dhabi', 'Louvre Abu Dhabi', 'Louvre Abu Dhabi', 'Louvre Abu Dhabi', 'Louvre Abu Dhabi'],
      ['Corniche', 'Corniche', 'Corniche', 'Corniche', 'Corniche', 'Corniche', 'Corniche'],
      ['Isla Saadiyat', 'Saadiyat Island', 'Île de Saadiyat', 'Saadiyat-Insel', 'Isola di Saadiyat', 'Ilha de Saadiyat', 'Illa de Saadiyat'],
    ],
    seasonality: season1,
    aliases: ['Abu Dhabi', 'Abou Dabi', 'Abu Dhabi Airport', 'Zayed International Airport', 'AUH Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'sharjah', name: 'Sharjah', codes: ['SHJ'], photo: photo3, stay: '3–5',
    description: ['Emirato cultural con museos, mezquitas, paseo marítimo y una animada laguna urbana.', 'A cultural emirate with museums, mosques, waterfronts and a lively urban lagoon.', 'Émirat culturel avec musées, mosquées, front de mer et lagune urbaine animée.', 'Kulturemira mit Museen, Moscheen, Uferpromenade und lebhafter Stadtlagune.', 'Emirato culturale con musei, moschee, lungomare e vivace laguna urbana.', 'Emirado cultural com museus, mesquitas, orla e lagoa urbana animada.', 'Emirat cultural amb museus, mesquites, passeig marítim i llacuna urbana animada.'],
    recommendations: [
      ['Museo de la Civilización Islámica', 'Museum of Islamic Civilization', 'Musée de la civilisation islamique', 'Museum der islamischen Zivilisation', 'Museo della civiltà islamica', 'Museu da Civilização Islâmica', 'Museu de la Civilització Islàmica'],
      ['Al Noor Mosque', 'Al Noor Mosque', 'Al Noor Mosque', 'Al Noor Mosque', 'Al Noor Mosque', 'Al Noor Mosque', 'Al Noor Mosque'],
      ['Al Qasba', 'Al Qasba', 'Al Qasba', 'Al Qasba', 'Al Qasba', 'Al Qasba', 'Al Qasba'],
      ['Zoco Azul', 'Blue Souk', 'Souk Bleu', 'Blauer Souk', 'Suq Blu', 'Souk Azul', 'Mercat Blau'],
    ],
    seasonality: season1,
    aliases: ['Sarja', 'Schardscha', 'Sharjah Airport', 'Sharjah International Airport', 'SHJ Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'ras-al-khaimah', name: 'Ras al-Jaima', codes: ['RKT'], photo: photo4, stay: '3–5',
    description: ['Emirato de playas, montañas de Hajar y fortalezas, con rutas hacia Jebel Jais.', 'An emirate of beaches, Hajar mountains and forts, with routes to Jebel Jais.', 'Émirat de plages, montagnes du Hajar et forts, avec routes vers Jebel Jais.', 'Emirat mit Stränden, Hadschar-Bergen und Festungen sowie Routen zum Jebel Jais.', 'Emirato di spiagge, montagne Hajar e forti, con itinerari verso Jebel Jais.', 'Emirado de praias, montanhas Hajar e fortes, com rotas para Jebel Jais.', 'Emirat de platges, muntanyes Hajar i forts, amb rutes cap a Jebel Jais.'],
    recommendations: [
      ['Jebel Jais', 'Jebel Jais', 'Jebel Jais', 'Jebel Jais', 'Jebel Jais', 'Jebel Jais', 'Jebel Jais'],
      ['Fuerte Dhayah', 'Dhayah Fort', 'Fort de Dhayah', 'Festung Dhayah', 'Forte di Dhayah', 'Forte de Dhayah', 'Fort de Dhayah'],
      ['Museo Nacional de Ras al-Jaima', 'National Museum of Ras Al Khaimah', 'Musée national de Ras Al Khaïmah', 'Nationalmuseum von Ras al-Chaima', 'Museo nazionale di Ras al-Khaimah', 'Museu Nacional de Ras al-Khaimah', 'Museu Nacional de Ras al-Khaimah'],
      ['Isla Al Marjan', 'Al Marjan Island', 'Île d’Al Marjan', 'Al-Marjan-Insel', 'Isola di Al Marjan', 'Ilha de Al Marjan', 'Illa d’Al Marjan'],
    ],
    seasonality: season1,
    aliases: ['Ras Al Khaimah', 'Ras Al Khaïmah', 'Ra’s al-Chaima', 'Ras al-Khaimah', 'Ras Al Khaimah Airport', 'Ras al-Jaima Airport', 'RKT Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
  {
    slug: 'al-ain', name: 'Al Ain', codes: ['AAN'], photo: photo5, stay: '3–5',
    description: ['Ciudad oasis junto a la frontera omaní, con palmerales, fuerte histórico y la montaña Jebel Hafeet.', 'An oasis city by the Omani border, with palm groves, a historic fort and Jebel Hafeet.', 'Ville-oasis près de la frontière omanaise, avec palmeraies, fort historique et Jebel Hafeet.', 'Oasenstadt an der omanischen Grenze mit Palmenhainen, historischer Festung und Jebel Hafeet.', 'Città-oasi vicino al confine omanita, con palmeti, forte storico e Jebel Hafeet.', 'Cidade-oásis junto à fronteira de Omã, com palmeirais, forte histórico e Jebel Hafeet.', 'Ciutat-oasi prop de la frontera omanita, amb palmerars, fort històric i Jebel Hafeet.'],
    recommendations: [
      ['Oasis de Al Ain', 'Al Ain Oasis', 'Oasis d’Al Ain', 'Oase Al Ain', 'Oasi di Al Ain', 'Oásis de Al Ain', 'Oasi d’Al Ain'],
      ['Fuerte Al Jahili', 'Al Jahili Fort', 'Fort Al Jahili', 'Festung Al Jahili', 'Forte Al Jahili', 'Forte Al Jahili', 'Fort Al Jahili'],
      ['Jebel Hafeet', 'Jebel Hafeet', 'Jebel Hafeet', 'Jebel Hafeet', 'Jebel Hafeet', 'Jebel Hafeet', 'Jebel Hafeet'],
      ['Museo del Palacio de Al Ain', 'Al Ain Palace Museum', 'Musée du palais d’Al Ain', 'Palastmuseum Al Ain', 'Museo del Palazzo di Al Ain', 'Museu do Palácio de Al Ain', 'Museu del Palau d’Al Ain'],
    ],
    seasonality: season1,
    aliases: ['Al Aïn', 'Al Ain Airport', 'Al Ain International Airport', 'AAN Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
];

export const unitedArabEmiratesDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'AE', country: 'Emiratos Árabes Unidos' }, seeds);
