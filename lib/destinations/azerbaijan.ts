import { asiaCountryDestinations, commonsPhoto, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1689189044045-7cb0767e5cf1', 'FKt2Nktzalc', 'Adil Sattarov');
const photo2 = commonsPhoto('Ganja Azerbaijan (132860343).jpeg', 'İlkin Mete', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/');
const photo3 = unsplashPhoto('photo-1698742139641-8dce61bd8ede', 'PTc1Waq4Ha0', 'Lukas Kyzur');

const season1: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es caluroso y el invierno, frío.', 'Spring and autumn are usually the most pleasant seasons; summer is hot and winter is cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est chaud et l’hiver froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist heiß und der Winter kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è calda e l’inverno freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é quente e o inverno, frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és calorós i l’hivern, fred.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'baku', name: 'Bakú', codes: ['GYD'], metropolitanCodes: ['BAK'], photo: photo1, stay: '3–5',
    description: ['Capital junto al Caspio donde la ciudad amurallada, las torres contemporáneas y el paseo marítimo forman un paisaje muy reconocible.', 'A Caspian capital where the walled old city, contemporary towers and seafront promenade form a distinctive landscape.', 'Capitale caspienne où ville fortifiée, tours contemporaines et promenade maritime composent un paysage emblématique.', 'Hauptstadt am Kaspischen Meer, in der ummauerte Altstadt, moderne Türme und Uferpromenade ein markantes Bild ergeben.', 'Capitale sul Caspio dove città murata, torri contemporanee e lungomare formano un paesaggio riconoscibile.', 'Capital junto ao Cáspio onde cidade muralhada, torres contemporâneas e passeio marítimo formam uma paisagem marcante.', 'Capital vora el Caspi on la ciutat emmurallada, les torres contemporànies i el passeig marítim formen un paisatge recognoscible.'],
    recommendations: [
      ['Ciudad Vieja de Bakú', 'Baku Old City', 'Vieille ville de Bakou', 'Altstadt von Baku', 'Città vecchia di Baku', 'Cidade Velha de Bacu', 'Ciutat Vella de Bakú'],
      ['Torre de la Doncella', 'Maiden Tower', 'Tour de la Vierge', 'Jungfrauenturm', 'Torre della Vergine', 'Torre da Donzela', 'Torre de la Donzella'],
      ['Centro Heydar Aliyev', 'Heydar Aliyev Center', 'Centre Heydar Aliyev', 'Heydar-Aliyev-Zentrum', 'Centro Heydar Aliyev', 'Centro Heydar Aliyev', 'Centre Heydar Aliyev'],
      ['Paseo marítimo de Bakú', 'Baku Boulevard', 'Boulevard de Bakou', 'Baku-Boulevard', 'Lungomare di Baku', 'Passeio marítimo de Bacu', 'Passeig marítim de Bakú'],
    ],
    seasonality: season1,
    aliases: ['Heydar Aliyev International Airport', 'Baku', 'Bakou', 'Bacu', 'Baku Airport', 'GYD Airport', 'Baku International Airport', 'Bakı'],
    bestMonths: [4, 5, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 9, 10],
  },
  {
    slug: 'ganja', name: 'Ganja', codes: ['GNJ'], photo: photo2, stay: '1–2',
    description: ['Segunda ciudad de Azerbaiyán, con plazas arboladas, arquitectura histórica y rutas cercanas hacia el oeste del país.', 'Azerbaijan’s second city, with tree-lined squares, historic architecture and routes towards the country’s west.', 'Deuxième ville d’Azerbaïdjan, avec places arborées, architecture historique et routes vers l’ouest du pays.', 'Aserbaidschans zweitgrößte Stadt mit baumbestandenen Plätzen, historischer Architektur und Routen in den Westen des Landes.', 'Seconda città dell’Azerbaigian, con piazze alberate, architettura storica e itinerari verso l’ovest del paese.', 'Segunda cidade do Azerbaijão, com praças arborizadas, arquitetura histórica e rotas para o oeste do país.', 'Segona ciutat de l’Azerbaidjan, amb places arbrades, arquitectura històrica i rutes cap a l’oest del país.'],
    recommendations: [
      ['Plaza Heydar Aliyev', 'Heydar Aliyev Square', 'Place Heydar Aliyev', 'Heydar-Aliyev-Platz', 'Piazza Heydar Aliyev', 'Praça Heydar Aliyev', 'Plaça Heydar Aliyev'],
      ['Casa de Botellas', 'Bottle House', 'Maison des bouteilles', 'Flaschenhaus', 'Casa delle bottiglie', 'Casa das Garrafas', 'Casa de les Ampolles'],
      ['Mezquita Shah Abbas', 'Shah Abbas Mosque', 'Mosquée Shah Abbas', 'Schah-Abbas-Moschee', 'Moschea Shah Abbas', 'Mesquita Shah Abbas', 'Mesquita Shah Abbas'],
      ['Lago Göygöl', 'Lake Göygöl', 'Lac Göygöl', 'Göygöl-See', 'Lago Göygöl', 'Lago Göygöl', 'Llac Göygöl'],
    ],
    seasonality: season1,
    aliases: ['Gyandzha', 'Ganja International Airport', 'Gandja', 'Gəncə', 'Ganja Airport', 'Gəncə Airport', 'Kirovabad'],
    bestMonths: [5, 6, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 6, 9],
  },
  {
    slug: 'nakhchivan', name: 'Najicheván', codes: ['NAJ'], photo: photo3, stay: '1–2',
    description: ['Ciudad histórica de la república autónoma de Najicheván, con mausoleos medievales, arquitectura singular y paisajes áridos.', 'A historic city in the Nakhchivan Autonomous Republic, with medieval mausoleums, distinctive architecture and arid landscapes.', 'Ville historique de la république autonome du Nakhitchevan, avec mausolées médiévaux, architecture singulière et paysages arides.', 'Historische Stadt in der Autonomen Republik Nachitschewan mit mittelalterlichen Mausoleen, besonderer Architektur und trockenen Landschaften.', 'Città storica della Repubblica autonoma di Nakhchivan, con mausolei medievali, architettura particolare e paesaggi aridi.', 'Cidade histórica da República Autónoma de Naquichevão, com mausoléus medievais, arquitetura singular e paisagens áridas.', 'Ciutat històrica de la República Autònoma de Nakhtxivan, amb mausoleus medievals, arquitectura singular i paisatges àrids.'],
    recommendations: [
      ['Mausoleo de Momine Khatun', 'Momine Khatun Mausoleum', 'Mausolée de Momine Khatun', 'Momine-Khatun-Mausoleum', 'Mausoleo di Momine Khatun', 'Mausoléu de Momine Khatun', 'Mausoleu de Momine Khatun'],
      ['Palacio de los Kanes', 'Khan Palace', 'Palais des Khans', 'Chan-Palast', 'Palazzo dei Khan', 'Palácio dos Cãs', 'Palau dels Khans'],
      ['Tumba de Noé', 'Noah\'s Tomb', 'Tombeau de Noé', 'Noahs Grab', 'Tomba di Noè', 'Túmulo de Noé', 'Tomba de Noè'],
      ['Castillo de Alinja', 'Alinja Castle', 'Forteresse d’Alinja', 'Burg Alinja', 'Castello di Alinja', 'Castelo de Alinja', 'Castell d’Alinja'],
    ],
    seasonality: season1,
    aliases: ['Nakhchivan', 'Nakhitchevan', 'Nachitschewan', 'Naxçıvan', 'Naquichevão', 'Nakhtxivan', 'Nakhchivan Airport', 'Nakhchivan International Airport', 'NAJ Airport', 'Naxçıvan Airport', 'Nakhichevan'],
    bestMonths: [4, 5, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [4, 5, 9],
  },
];

export const azerbaijanDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'AZ', country: 'Azerbaiyán' }, seeds);
