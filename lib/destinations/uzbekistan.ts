import { asiaCountryDestinations, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1654861857666-1e8c438cbe4a', 'IyeWrvpt7sQ', 'Dmitriy Efimov');
const photo2 = unsplashPhoto('photo-1763144967763-2a8a98cb8431', 'pQMkpG36644', 'LKHTK');
const photo3 = unsplashPhoto('photo-1758766182810-773ef5bdada8', 'J1_0XfHwzbI', 'Nodir Khalilov');
const photo4 = unsplashPhoto('photo-1774851406797-cd9ace6d6d6a', 'lP8nzEyxdWU', 'kai muro');

const season1: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es muy caluroso y el invierno, frío.', 'Spring and autumn are usually the most pleasant seasons; summer is very hot and winter is cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est très chaud et l’hiver froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist sehr heiß und der Winter kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è molto calda e l’inverno freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é muito quente e o inverno, frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és molt calorós i l’hivern, fred.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'tashkent', name: 'Taskent', codes: ['TAS'], photo: photo1, stay: '2–4',
    description: ['Taskent reúne patrimonio de la Ruta de la Seda, bazares y arquitectura de Uzbekistán.', 'Taskent combines Silk Road heritage, bazaars and Uzbek architecture.', 'Taskent réunit patrimoine de la Route de la soie, bazars et architecture ouzbèke.', 'Taskent verbindet Seidenstraßen-Erbe, Basare und usbekische Architektur.', 'Taskent unisce patrimonio della Via della Seta, bazar e architettura uzbeka.', 'Taskent reúne património da Rota da Seda, bazares e arquitetura uzbeque.', 'Taskent reuneix patrimoni de la Ruta de la Seda, basars i arquitectura uzbeka.'],
    recommendations: [
      ['Plaza Amir Timur', 'Amir Timur Square', 'Place Amir Timur', 'Amir-Timur-Platz', 'Piazza Amir Timur', 'Praça Amir Timur', 'Plaça Amir Timur'],
      ['Bazar Chorsu', 'Chorsu Bazaar', 'Bazar Chorsu', 'Chorsu-Basar', 'Bazar Chorsu', 'Bazar Chorsu', 'Basar Chorsu'],
      ['Complejo Hazrati Imam', 'Hazrati Imam Complex', 'Complexe Hazrati Imam', 'Hazrati-Imam-Komplex', 'Complesso Hazrati Imam', 'Complexo Hazrati Imam', 'Complex Hazrati Imam'],
      ['Metro de Taskent', 'Tashkent Metro', 'Métro de Tachkent', 'U-Bahn von Taschkent', 'Metropolitana di Tashkent', 'Metro de Tashkent', 'Metro de Tashkent'],
    ],
    seasonality: season1,
    aliases: ['Tashkent', 'Tachkent', 'Taschkent', 'Tashkent International Airport', 'Taskent Airport'],
    bestMonths: [4, 5, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 9],
  },
  {
    slug: 'samarkand', name: 'Samarcanda', codes: ['SKD'], photo: photo2, stay: '2–4',
    description: ['Samarcanda reúne patrimonio de la Ruta de la Seda, bazares y arquitectura de Uzbekistán.', 'Samarcanda combines Silk Road heritage, bazaars and Uzbek architecture.', 'Samarcanda réunit patrimoine de la Route de la soie, bazars et architecture ouzbèke.', 'Samarcanda verbindet Seidenstraßen-Erbe, Basare und usbekische Architektur.', 'Samarcanda unisce patrimonio della Via della Seta, bazar e architettura uzbeka.', 'Samarcanda reúne património da Rota da Seda, bazares e arquitetura uzbeque.', 'Samarcanda reuneix patrimoni de la Ruta de la Seda, basars i arquitectura uzbeka.'],
    recommendations: [
      ['Registán', 'Registan', 'Registan', 'Registan', 'Registan', 'Registan', 'Registan'],
      ['Mezquita Bibi-Khanym', 'Bibi-Khanym Mosque', 'Mosquée Bibi-Khanym', 'Bibi-Khanym-Moschee', 'Moschea Bibi-Khanym', 'Mesquita Bibi-Khanym', 'Mesquita Bibi-Khanym'],
      ['Necrópolis Shah-i-Zinda', 'Shah-i-Zinda Necropolis', 'Nécropole Shah-i-Zinda', 'Shah-i-Zinda-Nekropole', 'Necropoli Shah-i-Zinda', 'Necrópole Shah-i-Zinda', 'Necròpolis Shah-i-Zinda'],
      ['Observatorio de Ulugh Beg', 'Ulugh Beg Observatory', 'Observatoire d’Ulugh Beg', 'Ulugh-Beg-Observatorium', 'Osservatorio di Ulugh Beg', 'Observatório de Ulugh Beg', 'Observatori d’Ulugh Beg'],
    ],
    seasonality: season1,
    aliases: ['Samarkand', 'Samarcande', 'Samarkand International Airport', 'Samarcanda Airport'],
    bestMonths: [4, 5, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 9],
  },
  {
    slug: 'bukhara', name: 'Bujará', codes: ['BHK'], photo: photo3, stay: '2–4',
    description: ['Bujará reúne patrimonio de la Ruta de la Seda, bazares y arquitectura de Uzbekistán.', 'Bujará combines Silk Road heritage, bazaars and Uzbek architecture.', 'Bujará réunit patrimoine de la Route de la soie, bazars et architecture ouzbèke.', 'Bujará verbindet Seidenstraßen-Erbe, Basare und usbekische Architektur.', 'Bujará unisce patrimonio della Via della Seta, bazar e architettura uzbeka.', 'Bujará reúne património da Rota da Seda, bazares e arquitetura uzbeque.', 'Bujará reuneix patrimoni de la Ruta de la Seda, basars i arquitectura uzbeka.'],
    recommendations: [
      ['Arca de Bujará', 'Ark of Bukhara', 'Ark de Boukhara', 'Ark von Buchara', 'Ark di Bukhara', 'Ark de Bukhara', 'Ark de Bukhara'],
      ['Mezquita Kalon', 'Kalon Mosque', 'Mosquée Kalon', 'Kalon-Moschee', 'Moschea Kalon', 'Mesquita Kalon', 'Mesquita Kalon'],
      ['Plaza Lyabi-Hauz', 'Lyabi-Hauz Square', 'Place Lyabi-Hauz', 'Lyabi-Hauz-Platz', 'Piazza Lyabi-Hauz', 'Praça Lyabi-Hauz', 'Plaça Lyabi-Hauz'],
      ['Bazar histórico', 'Historic bazaar', 'Bazar historique', 'Historischer Basar', 'Bazar storico', 'Bazar histórico', 'Basar històric'],
    ],
    seasonality: season1,
    aliases: ['Bujara', 'Bukhara', 'Buchara', 'Boukhara', 'Bukhara International Airport', 'Bujará Airport'],
    bestMonths: [4, 5, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 9],
  },
  {
    slug: 'urgench-khiva', name: 'Urgench', codes: ['UGC'], photo: photo4, stay: '2–4',
    description: ['Urgench / Jiva reúne patrimonio de la Ruta de la Seda, bazares y arquitectura de Uzbekistán.', 'Urgench / Jiva combines Silk Road heritage, bazaars and Uzbek architecture.', 'Urgench / Jiva réunit patrimoine de la Route de la soie, bazars et architecture ouzbèke.', 'Urgench / Jiva verbindet Seidenstraßen-Erbe, Basare und usbekische Architektur.', 'Urgench / Jiva unisce patrimonio della Via della Seta, bazar e architettura uzbeka.', 'Urgench / Jiva reúne património da Rota da Seda, bazares e arquitetura uzbeque.', 'Urgench / Jiva reuneix patrimoni de la Ruta de la Seda, basars i arquitectura uzbeka.'],
    recommendations: [
      ['Itchan Kala de Jiva', 'Itchan Kala in Khiva', 'Itchan Kala de Khiva', 'Itchan Kala in Chiwa', 'Itchan Kala di Khiva', 'Itchan Kala de Khiva', 'Itchan Kala de Khiva'],
      ['Minarete Kalta Minor', 'Kalta Minor Minaret', 'Minaret Kalta Minor', 'Kalta-Minor-Minarett', 'Minareto Kalta Minor', 'Minarete Kalta Minor', 'Minaret Kalta Minor'],
      ['Palacio Tash Hauli', 'Tash Hauli Palace', 'Palais Tash Hauli', 'Tash-Hauli-Palast', 'Palazzo Tash Hauli', 'Palácio Tash Hauli', 'Palau Tash Hauli'],
      ['Murallas de Jiva', 'Khiva city walls', 'Remparts de Khiva', 'Stadtmauern von Chiwa', 'Mura di Khiva', 'Muralhas de Khiva', 'Muralles de Khiva'],
    ],
    seasonality: season1,
    aliases: ['Jiva', 'Khiva', 'Chiwa', 'Urgench y Jiva', 'Urgench International Airport'],
    bestMonths: [4, 5, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 9],
  },
];

export const uzbekistanDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'UZ', country: 'Uzbekistán' }, seeds);
