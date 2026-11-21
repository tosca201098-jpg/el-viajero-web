import { asiaCountryDestinations, commonsPhoto, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1764505878962-4090d605f258', 'N_DVjHfpf1k', 'Nikolai Kolosov');
const photo2 = commonsPhoto('Turkmenbashi Turkmenistan.jpg', 'Hotel Kaesong', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/');

const season1: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es muy caluroso y el invierno, frío.', 'Spring and autumn are usually the most pleasant seasons; summer is very hot and winter is cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est très chaud et l’hiver froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist sehr heiß und der Winter kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è molto calda e l’inverno freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é muito quente e o inverno, frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és molt calorós i l’hivern, fred.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'ashgabat', name: 'Asjabad', codes: ['ASB'], photo: photo1, stay: '2–3',
    description: ['Asjabad combina arquitectura monumental, cultura local y paisajes de Turkmenistán.', 'Asjabad combines monumental architecture, local culture and Turkmen landscapes.', 'Asjabad combine architecture monumentale, culture locale et paysages turkmènes.', 'Asjabad verbindet monumentale Architektur, lokale Kultur und turkmenische Landschaften.', 'Asjabad unisce architettura monumentale, cultura locale e paesaggi turkmeni.', 'Asjabad combina arquitetura monumental, cultura local e paisagens turcomanas.', 'Asjabad combina arquitectura monumental, cultura local i paisatges turcmans.'],
    recommendations: [
      ['Monumento de la Independencia', 'Independence Monument', 'Monument de l’Indépendance', 'Unabhängigkeitsdenkmal', 'Monumento all’Indipendenza', 'Monumento à Independência', 'Monument a la Independència'],
      ['Mezquita Ertuğrul Gazi', 'Ertuğrul Gazi Mosque', 'Mosquée Ertuğrul Gazi', 'Ertuğrul-Gazi-Moschee', 'Moschea Ertuğrul Gazi', 'Mesquita Ertuğrul Gazi', 'Mesquita Ertuğrul Gazi'],
      ['Museo Nacional', 'National Museum', 'Musée national', 'Nationalmuseum', 'Museo nazionale', 'Museu Nacional', 'Museu Nacional'],
      ['Montes Kopet Dag', 'Kopet Dag mountains', 'Montagnes du Kopet-Dag', 'Kopet-Dag-Gebirge', 'Monti Kopet Dag', 'Montes Kopet Dag', 'Muntanyes del Kopet Dag'],
    ],
    seasonality: season1,
    aliases: ['Aşgabat', 'Ashgabat', 'Ashkhabad', 'Ashgabat International Airport', 'Asjabad Airport'],
    bestMonths: [4, 5, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 9],
  },
  {
    slug: 'turkmenbashi', name: 'Turkmenbashi', codes: ['KRW'], photo: photo2, stay: '2–3',
    description: ['Turkmenbashi combina arquitectura monumental, cultura local y paisajes de Turkmenistán.', 'Turkmenbashi combines monumental architecture, local culture and Turkmen landscapes.', 'Turkmenbashi combine architecture monumentale, culture locale et paysages turkmènes.', 'Turkmenbashi verbindet monumentale Architektur, lokale Kultur und turkmenische Landschaften.', 'Turkmenbashi unisce architettura monumentale, cultura locale e paesaggi turkmeni.', 'Turkmenbashi combina arquitetura monumental, cultura local e paisagens turcomanas.', 'Turkmenbashi combina arquitectura monumental, cultura local i paisatges turcmans.'],
    recommendations: [
      ['Puerto de Turkmenbashi', 'Turkmenbashi port', 'Port de Turkmenbashi', 'Hafen von Turkmenbashi', 'Porto di Turkmenbashi', 'Porto de Turkmenbashi', 'Port de Turkmenbashi'],
      ['Paseo del Caspio', 'Caspian promenade', 'Promenade de la Caspienne', 'Kaspische Promenade', 'Lungomare del Caspio', 'Passeio do Cáspio', 'Passeig del Caspi'],
      ['Museo local', 'Local museum', 'Musée local', 'Lokalmuseum', 'Museo locale', 'Museu local', 'Museu local'],
      ['Costa del Caspio', 'Caspian coast', 'Côte de la Caspienne', 'Kaspische Küste', 'Costa del Caspio', 'Costa do Cáspio', 'Costa del Caspi'],
    ],
    seasonality: season1,
    aliases: ['Turkmenbashi International Airport', 'Turkmenbashi Airport'],
    bestMonths: [4, 5, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 9],
  },
];

export const turkmenistanDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'TM', country: 'Turkmenistán' }, seeds);
