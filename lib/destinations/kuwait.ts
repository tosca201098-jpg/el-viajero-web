import { asiaCountryDestinations, commonsPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = commonsPhoto('Kuwait City Kuwait Towers Panoramic View 1.jpg', 'Zairon', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/');

const season1: Seven = ['De noviembre a marzo suele ser más agradable; en verano el calor es extremo.', 'November to March is usually more pleasant; summer heat is extreme.', 'De novembre à mars, le climat est généralement plus agréable ; la chaleur estivale est extrême.', 'Von November bis März ist es meist angenehmer; im Sommer ist die Hitze extrem.', 'Da novembre a marzo il clima è in genere più piacevole; il caldo estivo è estremo.', 'De novembro a março costuma ser mais agradável; o calor de verão é extremo.', 'De novembre a març sol ser més agradable; la calor de l’estiu és extrema.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'kuwait-city', name: 'Ciudad de Kuwait', codes: ['KWI'], photo: photo1, stay: '2–4',
    description: ['Capital costera entre rascacielos, museos, zocos y el paseo del golfo Pérsico.', 'A coastal capital of skyscrapers, museums, souks and the Persian Gulf promenade.', 'Capitale côtière entre gratte-ciel, musées, souks et promenade du golfe Persique.', 'Küstenhauptstadt mit Wolkenkratzern, Museen, Souks und Promenade am Persischen Golf.', 'Capitale costiera tra grattacieli, musei, souk e passeggiata sul Golfo Persico.', 'Capital costeira de arranha-céus, museus, souks e passeio do golfo Pérsico.', 'Capital costanera de gratacels, museus, socs i passeig del golf Pèrsic.'],
    recommendations: [
      ['Torres de Kuwait', 'Kuwait Towers', 'Tours du Koweït', 'Kuwait-Türme', 'Torri del Kuwait', 'Torres do Kuwait', 'Torres de Kuwait'],
      ['Gran Mezquita', 'Grand Mosque', 'Grande Mosquée', 'Große Moschee', 'Grande Moschea', 'Grande Mesquita', 'Gran Mesquita'],
      ['Museo Nacional de Kuwait', 'Kuwait National Museum', 'Musée national du Koweït', 'Kuwait-Nationalmuseum', 'Museo nazionale del Kuwait', 'Museu Nacional do Kuwait', 'Museu Nacional de Kuwait'],
      ['Zoco Al Mubarakiya', 'Al Mubarakiya Souq', 'Souk Al Mubarakiya', 'Al-Mubarakiya-Souk', 'Souq Al Mubarakiya', 'Souq Al Mubarakiya', 'Soc Al Mubarakiya'],
    ],
    seasonality: season1,
    aliases: ['Kuwait', 'Kuwait City', 'Koweït', 'Kuwait-Stadt', 'Cidade do Kuwait', 'Ciutat de Kuwait', 'Kuwait Airport', 'Kuwait International Airport', 'KWI Airport'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8], highSeasonMonths: [12, 1, 2],
  },
];

export const kuwaitDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'KW', country: 'Kuwait' }, seeds);
