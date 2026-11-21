import { asiaCountryDestinations, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1627734632774-780d1ef9bc28', '4cB7sBA55Pg', 'Daniel Qura');
const photo2 = unsplashPhoto('photo-1557544779-e170636404c4', '5RMxZ4BNj0E', 'Snowscat');

const season1: Seven = ['Primavera y otoño suelen ofrecer temperaturas más agradables; en verano el calor puede ser intenso.', 'Spring and autumn usually bring milder temperatures; summer can be very hot.', 'Le printemps et l’automne offrent généralement des températures plus douces ; l’été peut être très chaud.', 'Frühling und Herbst sind meist angenehmer; im Sommer kann es sehr heiß werden.', 'Primavera e autunno offrono in genere temperature più miti; l’estate può essere molto calda.', 'A primavera e o outono costumam ter temperaturas mais amenas; o verão pode ser muito quente.', 'La primavera i la tardor acostumen a tenir temperatures més agradables; l’estiu pot ser molt calorós.'];
const season2: Seven = ['La primavera y el otoño son los momentos más cómodos; el verano es especialmente caluroso.', 'Spring and autumn are most comfortable; summer is especially hot.', 'Le printemps et l’automne sont les périodes les plus agréables ; l’été est particulièrement chaud.', 'Frühling und Herbst sind am angenehmsten; der Sommer ist besonders heiß.', 'Primavera e autunno sono i periodi più piacevoli; l’estate è particolarmente calda.', 'A primavera e o outono são as épocas mais agradáveis; o verão é especialmente quente.', 'La primavera i la tardor són les èpoques més còmodes; l’estiu és especialment calorós.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'amman', name: 'Ammán', codes: ['AMM'], photo: photo1, stay: '3–5',
    description: ['Capital entre colinas, con ciudadela, teatro romano, mercados y una buena base para Petra, Jerash y el mar Muerto.', 'A hilltop capital with a citadel, Roman theatre, markets and a good base for Petra, Jerash and the Dead Sea.', 'Capitale sur des collines, avec citadelle, théâtre romain, marchés et une bonne base pour Pétra, Jerash et la mer Morte.', 'Hügelige Hauptstadt mit Zitadelle, römischem Theater, Märkten und guter Ausgangslage für Petra, Jerash und das Tote Meer.', 'Capitale tra colline, con cittadella, teatro romano, mercati e una buona base per Petra, Jerash e il Mar Morto.', 'Capital entre colinas, com cidadela, teatro romano, mercados e boa base para Petra, Jerash e o Mar Morto.', 'Capital entre turons, amb ciutadella, teatre romà, mercats i una bona base per a Petra, Jerash i el mar Mort.'],
    recommendations: [
      ['Ciudadela de Ammán', 'Amman Citadel', 'Citadelle d’Amman', 'Zitadelle von Amman', 'Cittadella di Amman', 'Cidadela de Amã', 'Ciutadella d’Ammán'],
      ['Teatro romano', 'Roman Theatre', 'Théâtre romain', 'Römisches Theater', 'Teatro romano', 'Teatro romano', 'Teatre romà'],
      ['Rainbow Street', 'Rainbow Street', 'Rainbow Street', 'Rainbow Street', 'Rainbow Street', 'Rainbow Street', 'Rainbow Street'],
      ['Jerash', 'Jerash', 'Jerash', 'Jerash', 'Jerash', 'Jerash', 'Jerash'],
    ],
    seasonality: season1,
    aliases: ['Amman', 'Amã', 'Amman Airport', 'Ammán Airport', 'Queen Alia International Airport', 'Queen Alia Airport', 'AMM Airport'],
    bestMonths: [3, 4, 5, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [4, 5, 9, 10],
  },
  {
    slug: 'aqaba', name: 'Aqaba', codes: ['AQJ'], photo: photo2, stay: '2–4',
    description: ['Puerta jordana al mar Rojo, con arrecifes, playas y acceso a Wadi Rum y Petra.', 'Jordan’s gateway to the Red Sea, with reefs, beaches and access to Wadi Rum and Petra.', 'Porte jordanienne de la mer Rouge, avec récifs, plages et accès au Wadi Rum et à Pétra.', 'Jordaniens Tor zum Roten Meer mit Riffen, Stränden und Zugang zu Wadi Rum und Petra.', 'Porta giordana sul Mar Rosso, con barriere coralline, spiagge e accesso al Wadi Rum e a Petra.', 'Porta jordaniana para o mar Vermelho, com recifes, praias e acesso a Wadi Rum e Petra.', 'Porta jordana al mar Roig, amb esculls, platges i accés a Wadi Rum i Petra.'],
    recommendations: [
      ['Castillo de Aqaba', 'Aqaba Fort', 'Fort d’Aqaba', 'Festung von Aqaba', 'Forte di Aqaba', 'Forte de Aqaba', 'Fort d’Aqaba'],
      ['Parque marino de Aqaba', 'Aqaba Marine Park', 'Parc marin d’Aqaba', 'Meerespark Aqaba', 'Parco marino di Aqaba', 'Parque Marinho de Aqaba', 'Parc marí d’Aqaba'],
      ['Playa Sur', 'South Beach', 'South Beach', 'South Beach', 'South Beach', 'South Beach', 'South Beach'],
      ['Wadi Rum', 'Wadi Rum', 'Wadi Rum', 'Wadi Rum', 'Wadi Rum', 'Wadi Rum', 'Wadi Rum'],
    ],
    seasonality: season2,
    aliases: ['Aqaba Airport', 'King Hussein International Airport', 'King Hussein Airport', 'AQJ Airport'],
    bestMonths: [3, 4, 5, 10, 11], lowSeasonMonths: [6, 7, 8, 9], highSeasonMonths: [3, 4, 10, 11],
  },
];

export const jordanDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'JO', country: 'Jordania' }, seeds);
