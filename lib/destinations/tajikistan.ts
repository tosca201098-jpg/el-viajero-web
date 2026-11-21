import { asiaCountryDestinations, commonsPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = commonsPhoto('The streets of Dushanbe.jpg', 'Шухрат Саъдиев', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/');
const photo2 = commonsPhoto('Detail on Khujand Fortress.jpg', 'Tuyuhun', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/');

const season1: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es caluroso y el invierno, frío.', 'Spring and autumn are usually the most pleasant seasons; summer is hot and winter is cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est chaud et l’hiver froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist heiß und der Winter kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è calda e l’inverno freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é quente e o inverno, frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és calorós i l’hivern, fred.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'dushanbe', name: 'Dusambé', codes: ['DYU'], photo: photo1, stay: '2–3',
    description: ['Dusambé combina patrimonio, mercados y paisajes de Tayikistán.', 'Dusambé combines Tajik heritage, markets and landscapes.', 'Dusambé combine patrimoine, marchés et paysages tadjiks.', 'Dusambé verbindet tadschikisches Erbe, Märkte und Landschaften.', 'Dusambé unisce patrimonio, mercati e paesaggi tagiki.', 'Dusambé combina património, mercados e paisagens tajiques.', 'Dusambé combina patrimoni, mercats i paisatges tadjiks.'],
    recommendations: [
      ['Parque Rudaki', 'Rudaki Park', 'Parc Roudaki', 'Rudaki-Park', 'Parco Rudaki', 'Parque Rudaki', 'Parc Rudaki'],
      ['Museo Nacional de Tayikistán', 'National Museum of Tajikistan', 'Musée national du Tadjikistan', 'Nationalmuseum von Tadschikistan', 'Museo nazionale del Tagikistan', 'Museu Nacional do Tajiquistão', 'Museu Nacional del Tadjikistan'],
      ['Bazar Mehrgon', 'Mehrgon Bazaar', 'Bazar Mehrgon', 'Mehrgon-Basar', 'Bazar Mehrgon', 'Bazar Mehrgon', 'Basar Mehrgon'],
      ['Fortaleza de Hissar', 'Hissar Fortress', 'Forteresse de Hissar', 'Festung Hissar', 'Fortezza di Hissar', 'Fortaleza de Hissar', 'Fortalesa de Hissar'],
    ],
    seasonality: season1,
    aliases: ['Dushanbe', 'Douchanbé', 'Duschanbe', 'Dushanbe International Airport', 'Dusambé Airport'],
    bestMonths: [4, 5, 9, 10], lowSeasonMonths: [1, 2, 12], highSeasonMonths: [5, 9],
  },
  {
    slug: 'khujand', name: 'Juyand', codes: ['LBD'], photo: photo2, stay: '2–3',
    description: ['Juyand combina patrimonio, mercados y paisajes de Tayikistán.', 'Juyand combines Tajik heritage, markets and landscapes.', 'Juyand combine patrimoine, marchés et paysages tadjiks.', 'Juyand verbindet tadschikisches Erbe, Märkte und Landschaften.', 'Juyand unisce patrimonio, mercati e paesaggi tagiki.', 'Juyand combina património, mercados e paisagens tajiques.', 'Juyand combina patrimoni, mercats i paisatges tadjiks.'],
    recommendations: [
      ['Fortaleza de Juyand', 'Khujand Fortress', 'Forteresse de Khodjent', 'Festung Chudschand', 'Fortezza di Khujand', 'Fortaleza de Khujand', 'Fortalesa de Khujand'],
      ['Bazar Panjshanbe', 'Panjshanbe Bazaar', 'Bazar Panjshanbe', 'Panjshanbe-Basar', 'Bazar Panjshanbe', 'Bazar Panjshanbe', 'Basar Panjshanbe'],
      ['Museo Histórico de Sughd', 'Sughd Historical Museum', 'Musée historique de Sughd', 'Historisches Museum von Sughd', 'Museo storico di Sughd', 'Museu Histórico de Sughd', 'Museu Històric de Sughd'],
      ['Mezquita Masjidi Jami', 'Masjidi Jami Mosque', 'Mosquée Masjidi Jami', 'Masjidi-Jami-Moschee', 'Moschea Masjidi Jami', 'Mesquita Masjidi Jami', 'Mesquita Masjidi Jami'],
    ],
    seasonality: season1,
    aliases: ['Khodjent', 'Khujand', 'Chudschand', 'Khujand Airport', 'Juyand Airport'],
    bestMonths: [4, 5, 9, 10], lowSeasonMonths: [1, 2, 12], highSeasonMonths: [5, 9],
  },
];

export const tajikistanDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'TJ', country: 'Tayikistán' }, seeds);
