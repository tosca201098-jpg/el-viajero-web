import { asiaCountryDestinations, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1770109001898-bd013a4b50e5', 'f7HmVNZ1okg', 'Jack Sparrow');
const photo2 = unsplashPhoto('photo-1624429864426-6630a4f766c9', 'C6kxPjfsvxE', 'Robert Levonyan');

const season1: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es caluroso y el invierno, frío.', 'Spring and autumn are usually the most pleasant seasons; summer is hot and winter is cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est chaud et l’hiver froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist heiß und der Winter kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è calda e l’inverno freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é quente e o inverno, frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és calorós i l’hivern, fred.'];
const season2: Seven = ['La primavera y el otoño suelen ser los momentos más agradables; el invierno es largo y muy frío.', 'Spring and autumn are usually the most pleasant seasons; winter is long and very cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’hiver est long et très froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Winter ist lang und sehr kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’inverno è lungo e molto freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o inverno é longo e muito frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’hivern és llarg i molt fred.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'yerevan', name: 'Ereván', codes: ['EVN'], photo: photo1, stay: '2–4',
    description: ['Capital de piedra rosada, cafés, museos y vistas del Ararat, con monasterios y paisajes armenios al alcance.', 'A capital of pink tuff stone, cafés, museums and Ararat views, with Armenian monasteries and landscapes close by.', 'Capitale de pierre rose, de cafés, de musées et de vues sur l’Ararat, avec monastères et paysages arméniens à portée.', 'Hauptstadt aus rosafarbenem Tuffstein mit Cafés, Museen und Araratblick sowie nahen armenischen Klöstern und Landschaften.', 'Capitale di tufo rosa, caffè, musei e viste sull’Ararat, con monasteri e paesaggi armeni a portata di mano.', 'Capital de pedra rosa, cafés, museus e vistas do Ararat, com mosteiros e paisagens arménias por perto.', 'Capital de pedra rosada, cafès, museus i vistes de l’Ararat, amb monestirs i paisatges armenis a prop.'],
    recommendations: [
      ['Plaza de la República', 'Republic Square', 'Place de la République', 'Platz der Republik', 'Piazza della Repubblica', 'Praça da República', 'Plaça de la República'],
      ['Complejo Cascada', 'Cascade Complex', 'Complexe de la Cascade', 'Kaskaden-Komplex', 'Complesso della Cascata', 'Complexo da Cascata', 'Complex de la Cascada'],
      ['Museo del Genocidio Armenio', 'Armenian Genocide Museum', 'Musée du génocide arménien', 'Armenisches Genozid-Museum', 'Museo del genocidio armeno', 'Museu do Genocídio Arménio', 'Museu del Genocidi Armeni'],
      ['Templo de Garni', 'Garni Temple', 'Temple de Garni', 'Garni-Tempel', 'Tempio di Garni', 'Templo de Garni', 'Temple de Garni'],
    ],
    seasonality: season1,
    aliases: ['Yerevan', 'Erevan', 'Jerewan', 'Erevã', 'Yerevan Airport', 'Erevan Airport', 'Zvartnots International Airport', 'EVN Airport', 'Zvartnots Airport'],
    bestMonths: [5, 6, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 6, 9],
  },
  {
    slug: 'gyumri', name: 'Gyumri', codes: ['LWN'], photo: photo2, stay: '1–2',
    description: ['Ciudad histórica del noroeste armenio, reconocida por su arquitectura de toba volcánica, plazas y tradición artística.', 'A historic city in north-western Armenia, known for volcanic-tuff architecture, squares and artistic traditions.', 'Ville historique du nord-ouest arménien, connue pour son architecture en tuf volcanique, ses places et ses traditions artistiques.', 'Historische Stadt im Nordwesten Armeniens, bekannt für Vulkansteinarchitektur, Plätze und künstlerische Traditionen.', 'Città storica dell’Armenia nord-occidentale, nota per l’architettura in tufo vulcanico, piazze e tradizioni artistiche.', 'Cidade histórica do noroeste arménio, reconhecida pela arquitetura de tufo vulcânico, praças e tradição artística.', 'Ciutat històrica del nord-oest armeni, reconeguda per l’arquitectura de tova volcànica, places i tradició artística.'],
    recommendations: [
      ['Plaza Vardanants', 'Vardanants Square', 'Place Vardanants', 'Wardanants-Platz', 'Piazza Vardanants', 'Praça Vardanants', 'Plaça Vardanants'],
      ['Museo Dzitoghtsyan', 'Dzitoghtsyan Museum', 'Musée Dzitoghtsyan', 'Dzitoghtsyan-Museum', 'Museo Dzitoghtsyan', 'Museu Dzitoghtsyan', 'Museu Dzitoghtsyan'],
      ['Barrio Kumayri', 'Kumayri district', 'Quartier de Kumayri', 'Kumayri-Viertel', 'Quartiere Kumayri', 'Bairro Kumayri', 'Barri Kumayri'],
      ['Monasterio de Marmashen', 'Marmashen Monastery', 'Monastère de Marmashen', 'Kloster Marmashen', 'Monastero di Marmashen', 'Mosteiro de Marmashen', 'Monestir de Marmashen'],
    ],
    seasonality: season2,
    aliases: ['Gjumri', 'Gyumri Airport', 'Shirak International Airport', 'LWN Airport', 'Shirak Airport', 'Alexandropol', 'Leninakan'],
    bestMonths: [5, 6, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 6, 9],
  },
];

export const armeniaDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'AM', country: 'Armenia' }, seeds);
