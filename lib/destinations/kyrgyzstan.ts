import { asiaCountryDestinations, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1671124918725-7e059980d085', 'kzxrNdTZfzs', 'Isakov Eldiiar');
const photo2 = unsplashPhoto('photo-1753861532259-283e5570ef59', '-lqcVE_o0vE', 'Dastan Suiuntbekov');

const season1: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es caluroso y el invierno, frío.', 'Spring and autumn are usually the most pleasant seasons; summer is hot and winter is cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est chaud et l’hiver froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist heiß und der Winter kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è calda e l’inverno freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é quente e o inverno, frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és calorós i l’hivern, fred.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'bishkek', name: 'Biskek', codes: ['BSZ'], photo: photo1, stay: '2–3',
    description: ['Biskek combina parques urbanos, bazares y las montañas Tian Shan cercanas.', 'Biskek combines Kyrgyz heritage, markets and landscapes.', 'Biskek combine patrimoine, marchés et paysages kirghiz.', 'Biskek verbindet kirgisisches Erbe, Märkte und Landschaften.', 'Biskek unisce patrimonio, mercati e paesaggi kirghisi.', 'Biskek combina património, mercados e paisagens quirguizes.', 'Biskek combina patrimoni, mercats i paisatges kirguisos.'],
    recommendations: [
      ['Plaza Ala-Too', 'Ala-Too Square', 'Place Ala-Too', 'Ala-Too-Platz', 'Piazza Ala-Too', 'Praça Ala-Too', 'Plaça Ala-Too'],
      ['Parque Panfilov', 'Panfilov Park', 'Parc Panfilov', 'Panfilow-Park', 'Parco Panfilov', 'Parque Panfilov', 'Parc Panfilov'],
      ['Bazar Osh', 'Osh Bazaar', 'Bazar Osh', 'Osh-Basar', 'Bazar Osh', 'Bazar Osh', 'Basar Osh'],
      ['Museo Histórico Nacional', 'National Historical Museum', 'Musée historique national', 'Nationales Historisches Museum', 'Museo storico nazionale', 'Museu Histórico Nacional', 'Museu Històric Nacional'],
    ],
    seasonality: season1,
    aliases: ['Bishkek', 'Manas', 'Manas International Airport', 'Biskek Airport'],
    bestMonths: [5, 6, 9], lowSeasonMonths: [1, 2, 11, 12], highSeasonMonths: [6, 9],
  },
  {
    slug: 'osh', name: 'Osh', codes: ['OSS'], photo: photo2, stay: '2–3',
    description: ['Osh reúne mercados históricos, cultura del valle de Ferganá y vistas hacia las montañas.', 'Osh combines Kyrgyz heritage, markets and landscapes.', 'Osh combine patrimoine, marchés et paysages kirghiz.', 'Osh verbindet kirgisisches Erbe, Märkte und Landschaften.', 'Osh unisce patrimonio, mercati e paesaggi kirghisi.', 'Osh combina património, mercados e paisagens quirguizes.', 'Osh combina patrimoni, mercats i paisatges kirguisos.'],
    recommendations: [
      ['Montaña Sulaiman-Too', 'Sulaiman-Too Mountain', 'Mont Sulaiman-Too', 'Berg Sulaiman-Too', 'Monte Sulaiman-Too', 'Monte Sulaiman-Too', 'Muntanya Sulaiman-Too'],
      ['Bazar de Osh', 'Osh Bazaar', 'Bazar d’Osh', 'Osh-Basar', 'Bazar di Osh', 'Bazar de Osh', 'Basar d’Osh'],
      ['Mezquita de Rabat Abdul Khan', 'Rabat Abdul Khan Mosque', 'Mosquée Rabat Abdul Khan', 'Rabat-Abdul-Khan-Moschee', 'Moschea Rabat Abdul Khan', 'Mesquita Rabat Abdul Khan', 'Mesquita de Rabat Abdul Khan'],
      ['Museo de Sulaiman-Too', 'Sulaiman-Too Museum', 'Musée de Sulaiman-Too', 'Sulaiman-Too-Museum', 'Museo di Sulaiman-Too', 'Museu de Sulaiman-Too', 'Museu de Sulaiman-Too'],
    ],
    seasonality: season1,
    aliases: ['Osh Airport'],
    bestMonths: [5, 6, 9], lowSeasonMonths: [1, 2, 11, 12], highSeasonMonths: [6, 9],
  },
];

export const kyrgyzstanDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'KG', country: 'Kirguistán' }, seeds);
