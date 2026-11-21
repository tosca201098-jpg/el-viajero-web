import { asiaCountryDestinations, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1521327895744-46e309d005b4', 'mF4_MHgp4ps', 'Ramy Kabalan');

const season1: Seven = ['La primavera y el otoño suelen ser agradables; el verano es cálido y animado junto al mar.', 'Spring and autumn are usually pleasant; summer is warm and lively by the sea.', 'Le printemps et l’automne sont généralement agréables ; l’été est chaud et animé au bord de la mer.', 'Frühling und Herbst sind meist angenehm; im Sommer ist es warm und lebhaft am Meer.', 'Primavera e autunno sono in genere piacevoli; l’estate è calda e vivace sul mare.', 'A primavera e o outono costumam ser agradáveis; o verão é quente e animado junto ao mar.', 'La primavera i la tardor solen ser agradables; l’estiu és càlid i animat vora el mar.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'beirut', name: 'Beirut', codes: ['BEY'], photo: photo1, stay: '3–5',
    description: ['Capital mediterránea de historia, gastronomía, barrios creativos y paseos junto al mar.', 'A Mediterranean capital of history, food, creative districts and seafront walks.', 'Capitale méditerranéenne d’histoire, de gastronomie, de quartiers créatifs et de promenades en bord de mer.', 'Mediterrane Hauptstadt mit Geschichte, Küche, kreativen Vierteln und Spaziergängen am Meer.', 'Capitale mediterranea di storia, gastronomia, quartieri creativi e passeggiate sul mare.', 'Capital mediterrânea de história, gastronomia, bairros criativos e passeios junto ao mar.', 'Capital mediterrània d’història, gastronomia, barris creatius i passejades vora el mar.'],
    recommendations: [
      ['Corniche de Beirut', 'Beirut Corniche', 'Corniche de Beyrouth', 'Corniche von Beirut', 'Corniche di Beirut', 'Corniche de Beirute', 'Corniche de Beirut'],
      ['Museo Nacional de Beirut', 'National Museum of Beirut', 'Musée national de Beyrouth', 'Nationalmuseum Beirut', 'Museo nazionale di Beirut', 'Museu Nacional de Beirute', 'Museu Nacional de Beirut'],
      ['Rocas de Raouché', 'Raouché Rocks', 'Rochers de Raouché', 'Raouché-Felsen', 'Rocce di Raouché', 'Rochas de Raouché', 'Roques de Raouché'],
      ['Barrio de Gemmayzeh', 'Gemmayzeh district', 'Quartier de Gemmayzeh', 'Viertel Gemmayzeh', 'Quartiere di Gemmayzeh', 'Bairro de Gemmayzeh', 'Barri de Gemmayzeh'],
    ],
    seasonality: season1,
    aliases: ['Beyrouth', 'Beirute', 'Beirut Airport', 'Beirut–Rafic Hariri International Airport', 'Rafic Hariri International Airport', 'BEY Airport'],
    bestMonths: [4, 5, 6, 9, 10], lowSeasonMonths: [1, 2], highSeasonMonths: [7, 8],
  },
];

export const lebanonDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'LB', country: 'Líbano' }, seeds);
