import { asiaCountryDestinations, commonsPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = commonsPhoto('Doha Skyline 01.jpg', 'Zairon', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/');

const season1: Seven = ['De noviembre a marzo las temperaturas son más agradables; el verano es muy caluroso.', 'November to March brings more pleasant temperatures; summer is very hot.', 'De novembre à mars, les températures sont plus agréables ; l’été est très chaud.', 'Von November bis März sind die Temperaturen angenehmer; der Sommer ist sehr heiß.', 'Da novembre a marzo le temperature sono più piacevoli; l’estate è molto calda.', 'De novembro a março as temperaturas são mais agradáveis; o verão é muito quente.', 'De novembre a març les temperatures són més agradables; l’estiu és molt calorós.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'doha', name: 'Doha', codes: ['DOH'], photo: photo1, stay: '3–5',
    description: ['Capital costera que combina museos, zocos, arquitectura contemporánea y el paseo de la Corniche.', 'A coastal capital combining museums, souks, contemporary architecture and the Corniche promenade.', 'Capitale côtière mêlant musées, souks, architecture contemporaine et promenade de la Corniche.', 'Küstenhauptstadt mit Museen, Souks, moderner Architektur und der Corniche-Promenade.', 'Capitale costiera che unisce musei, souk, architettura contemporanea e passeggiata della Corniche.', 'Capital costeira que combina museus, souks, arquitetura contemporânea e passeio da Corniche.', 'Capital costanera que combina museus, socs, arquitectura contemporània i passeig de la Corniche.'],
    recommendations: [
      ['Museo de Arte Islámico', 'Museum of Islamic Art', 'Musée d’art islamique', 'Museum für Islamische Kunst', 'Museo d’Arte Islamica', 'Museu de Arte Islâmica', 'Museu d’Art Islàmic'],
      ['Zoco Waqif', 'Souq Waqif', 'Souk Waqif', 'Souq Waqif', 'Souq Waqif', 'Souq Waqif', 'Soc Waqif'],
      ['Corniche de Doha', 'Doha Corniche', 'Corniche de Doha', 'Corniche von Doha', 'Corniche di Doha', 'Corniche de Doha', 'Corniche de Doha'],
      ['Katara Cultural Village', 'Katara Cultural Village', 'Village culturel de Katara', 'Kulturviertel Katara', 'Villaggio culturale Katara', 'Aldeia Cultural Katara', 'Poble Cultural Katara'],
    ],
    seasonality: season1,
    aliases: ['Doha Airport', 'Hamad International Airport', 'DOH Airport', 'Doha Hamad Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
];

export const qatarDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'QA', country: 'Catar' }, seeds);
