import { asiaCountryDestinations, commonsPhoto, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1659651117607-d2b397cf100f', 'ljw3mBWuwTA', 'Ilyas Dautov');
const photo2 = unsplashPhoto('photo-1666975823342-3b755b3784d4', 'JvQCPAtNMGw', 'Viktor Hesse');
const photo3 = commonsPhoto('Kazakhstan Shymkent.jpg', 'Eurovaran', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/');
const photo4 = unsplashPhoto('photo-1662048992353-e3fad23d8a05', 'yf5xXR2fhZ4', 'Dmitriy Panchenko');

const season1: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es caluroso y el invierno, frío.', 'Spring and autumn are usually the most pleasant seasons; summer is hot and winter is cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est chaud et l’hiver froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist heiß und der Winter kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è calda e l’inverno freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é quente e o inverno, frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és calorós i l’hivern, fred.'];
const season2: Seven = ['La primavera y el otoño suelen ser los momentos más agradables; el invierno es largo y muy frío.', 'Spring and autumn are usually the most pleasant seasons; winter is long and very cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’hiver est long et très froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Winter ist lang und sehr kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’inverno è lungo e molto freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o inverno é longo e muito frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’hivern és llarg i molt fred.'];
const season3: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es muy caluroso y el invierno, frío.', 'Spring and autumn are usually the most pleasant seasons; summer is very hot and winter is cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est très chaud et l’hiver froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist sehr heiß und der Winter kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è molto calda e l’inverno freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é muito quente e o inverno, frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és molt calorós i l’hivern, fred.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'almaty', name: 'Almaty', codes: ['ALA'], photo: photo1, stay: '2–4',
    description: ['Almaty combina arquitectura, cultura local y paisajes de Kazajistán.', 'Almaty combines architecture, local culture and Kazakh landscapes.', 'Almaty combine architecture, culture locale et paysages kazakhs.', 'Almaty verbindet Architektur, lokale Kultur und kasachische Landschaften.', 'Almaty unisce architettura, cultura locale e paesaggi kazaki.', 'Almaty combina arquitetura, cultura local e paisagens cazaques.', 'Almaty combina arquitectura, cultura local i paisatges kazakhs.'],
    recommendations: [
      ['Parque Panfilov', 'Panfilov Park', 'Parc Panfilov', 'Panfilow-Park', 'Parco Panfilov', 'Parque Panfilov', 'Parc Panfilov'],
      ['Catedral de la Ascensión', 'Ascension Cathedral', 'Cathédrale de l’Ascension', 'Himmelfahrtskathedrale', 'Cattedrale dell’Ascensione', 'Catedral da Ascensão', 'Catedral de l’Ascensió'],
      ['Kok Tobe', 'Kok Tobe', 'Kok Tobe', 'Kok Tobe', 'Kok Tobe', 'Kok Tobe', 'Kok Tobe'],
      ['Medeu', 'Medeu', 'Medeu', 'Medeu', 'Medeu', 'Medeu', 'Medeu'],
    ],
    seasonality: season1,
    aliases: ['Almaty International Airport', 'Almaty Airport'],
    bestMonths: [5, 6, 9], lowSeasonMonths: [1, 2, 11, 12], highSeasonMonths: [6, 9],
  },
  {
    slug: 'astana', name: 'Astaná', codes: ['NQZ'], photo: photo2, stay: '2–4',
    description: ['Astaná combina arquitectura, cultura local y paisajes de Kazajistán.', 'Astaná combines architecture, local culture and Kazakh landscapes.', 'Astaná combine architecture, culture locale et paysages kazakhs.', 'Astaná verbindet Architektur, lokale Kultur und kasachische Landschaften.', 'Astaná unisce architettura, cultura locale e paesaggi kazaki.', 'Astaná combina arquitetura, cultura local e paisagens cazaques.', 'Astaná combina arquitectura, cultura local i paisatges kazakhs.'],
    recommendations: [
      ['Torre Baiterek', 'Baiterek Tower', 'Tour Baïterek', 'Baiterek-Turm', 'Torre Baiterek', 'Torre Baiterek', 'Torre Baiterek'],
      ['Mezquita Hazret Sultan', 'Hazrat Sultan Mosque', 'Mosquée Hazrat Sultan', 'Hazrat-Sultan-Moschee', 'Moschea Hazrat Sultan', 'Mesquita Hazrat Sultan', 'Mesquita Hazrat Sultan'],
      ['Museo Nacional de Kazajistán', 'National Museum of Kazakhstan', 'Musée national du Kazakhstan', 'Nationalmuseum von Kasachstan', 'Museo nazionale del Kazakistan', 'Museu Nacional do Cazaquistão', 'Museu Nacional del Kazakhstan'],
      ['Río Ishim', 'Ishim River', 'Fleuve Ichim', 'Fluss Ischim', 'Fiume Ishim', 'Rio Ishim', 'Riu Ishim'],
    ],
    seasonality: season2,
    aliases: ['Astana', 'Nur-Sultan', 'Nursultan', 'Astana International Airport', 'Nursultan Nazarbayev International Airport', 'Astaná Airport'],
    bestMonths: [5, 6, 9], lowSeasonMonths: [1, 2, 11, 12], highSeasonMonths: [6, 9],
  },
  {
    slug: 'shymkent', name: 'Shymkent', codes: ['CIT'], photo: photo3, stay: '2–4',
    description: ['Shymkent combina arquitectura, cultura local y paisajes de Kazajistán.', 'Shymkent combines architecture, local culture and Kazakh landscapes.', 'Shymkent combine architecture, culture locale et paysages kazakhs.', 'Shymkent verbindet Architektur, lokale Kultur und kasachische Landschaften.', 'Shymkent unisce architettura, cultura locale e paesaggi kazaki.', 'Shymkent combina arquitetura, cultura local e paisagens cazaques.', 'Shymkent combina arquitectura, cultura local i paisatges kazakhs.'],
    recommendations: [
      ['Parque de la Independencia', 'Independence Park', 'Parc de l’Indépendance', 'Unabhängigkeitspark', 'Parco dell’Indipendenza', 'Parque da Independência', 'Parc de la Independència'],
      ['Ciudadela de Shymkent', 'Shymkent Citadel', 'Citadelle de Shymkent', 'Zitadelle von Shymkent', 'Cittadella di Shymkent', 'Cidadela de Shymkent', 'Ciutadella de Shymkent'],
      ['Bazar Samal', 'Samal Bazaar', 'Bazar Samal', 'Samal-Basar', 'Bazar Samal', 'Bazar Samal', 'Basar Samal'],
      ['Mezquita central', 'Central Mosque', 'Mosquée centrale', 'Zentralmoschee', 'Moschea centrale', 'Mesquita central', 'Mesquita central'],
    ],
    seasonality: season3,
    aliases: ['Shimkent', 'Chimkent', 'Shymkent International Airport', 'Shymkent Airport'],
    bestMonths: [5, 6, 9], lowSeasonMonths: [1, 2, 11, 12], highSeasonMonths: [6, 9],
  },
  {
    slug: 'aktau', name: 'Aktau', codes: ['SCO'], photo: photo4, stay: '2–4',
    description: ['Aktau combina arquitectura, cultura local y paisajes de Kazajistán.', 'Aktau combines architecture, local culture and Kazakh landscapes.', 'Aktau combine architecture, culture locale et paysages kazakhs.', 'Aktau verbindet Architektur, lokale Kultur und kasachische Landschaften.', 'Aktau unisce architettura, cultura locale e paesaggi kazaki.', 'Aktau combina arquitetura, cultura local e paisagens cazaques.', 'Aktau combina arquitectura, cultura local i paisatges kazakhs.'],
    recommendations: [
      ['Paseo del Caspio', 'Caspian promenade', 'Promenade de la Caspienne', 'Kaspische Promenade', 'Lungomare del Caspio', 'Passeio do Cáspio', 'Passeig del Caspi'],
      ['Mezquita Beket Ata', 'Beket Ata Mosque', 'Mosquée Beket-Ata', 'Beket-Ata-Moschee', 'Moschea Beket Ata', 'Mesquita Beket Ata', 'Mesquita Beket Ata'],
      ['Costa de Aktau', 'Aktau coast', 'Côte d’Aktau', 'Küste von Aktau', 'Costa di Aktau', 'Costa de Aktau', 'Costa d’Aktau'],
      ['Museo regional', 'Regional museum', 'Musée régional', 'Regionalmuseum', 'Museo regionale', 'Museu regional', 'Museu regional'],
    ],
    seasonality: season3,
    aliases: ['Aktau International Airport', 'Aktau Airport'],
    bestMonths: [5, 6, 9], lowSeasonMonths: [1, 2, 11, 12], highSeasonMonths: [6, 9],
  },
];

export const kazakhstanDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'KZ', country: 'Kazajistán' }, seeds);
