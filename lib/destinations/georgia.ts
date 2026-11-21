import { asiaCountryDestinations, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1542871549-b0fc1efbace7', 'ZTTjG9CS0c0', 'giorgi gvilava');
const photo2 = unsplashPhoto('photo-1643792412669-f7900db4e0c1', '55HOna6lWno', 'Ivars Utināns');
const photo3 = unsplashPhoto('photo-1724604153678-92402f19db98', 'xnFX4kSAIhU', 'Sergio Guardiola Herrador');

const season1: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es caluroso y el invierno, frío.', 'Spring and autumn are usually the most pleasant seasons; summer is hot and winter is cold.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est chaud et l’hiver froid.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist heiß und der Winter kalt.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è calda e l’inverno freddo.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é quente e o inverno, frio.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és calorós i l’hivern, fred.'];
const season2: Seven = ['De mayo a septiembre es la mejor época para disfrutar de la costa; el resto del año es más lluvioso.', 'May to September is the best time to enjoy the coast; the rest of the year is rainier.', 'De mai à septembre est la meilleure période pour profiter de la côte ; le reste de l’année est plus pluvieux.', 'Von Mai bis September ist die beste Zeit für die Küste; im restlichen Jahr regnet es mehr.', 'Da maggio a settembre è il periodo migliore per godersi la costa; nel resto dell’anno piove di più.', 'De maio a setembro é a melhor época para aproveitar a costa; no resto do ano chove mais.', 'De maig a setembre és la millor època per gaudir de la costa; la resta de l’any plou més.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'tbilisi', name: 'Tiflis', codes: ['TBS'], photo: photo1, stay: '2–4',
    description: ['Capital de baños termales, callejones antiguos, fortalezas y barrios creativos entre colinas del Cáucaso.', 'A capital of thermal baths, old lanes, fortresses and creative districts among Caucasus hills.', 'Capitale de bains thermaux, ruelles anciennes, forteresses et quartiers créatifs parmi les collines du Caucase.', 'Hauptstadt mit Thermalbädern, alten Gassen, Festungen und kreativen Vierteln in den Hügeln des Kaukasus.', 'Capitale di bagni termali, vicoli antichi, fortezze e quartieri creativi tra le colline del Caucaso.', 'Capital de banhos termais, ruelas antigas, fortalezas e bairros criativos entre colinas do Cáucaso.', 'Capital de banys termals, carrerons antics, fortaleses i barris creatius entre turons del Caucas.'],
    recommendations: [
      ['Casco antiguo de Tiflis', 'Tbilisi Old Town', 'Vieille ville de Tbilissi', 'Altstadt von Tiflis', 'Città vecchia di Tbilisi', 'Cidade velha de Tbilisi', 'Ciutat vella de Tbilisi'],
      ['Fortaleza Narikala', 'Narikala Fortress', 'Forteresse Narikala', 'Narikala-Festung', 'Fortezza di Narikala', 'Fortaleza Narikala', 'Fortalesa Narikala'],
      ['Baños de azufre de Abanotubani', 'Abanotubani sulphur baths', 'Bains de soufre d’Abanotubani', 'Schwefelbäder von Abanotubani', 'Bagni sulfurei di Abanotubani', 'Banhos de enxofre de Abanotubani', 'Banys de sofre d’Abanotubani'],
      ['Avenida Rustaveli', 'Rustaveli Avenue', 'Avenue Roustaveli', 'Rustaweli-Allee', 'Viale Rustaveli', 'Avenida Rustaveli', 'Avinguda Rustaveli'],
    ],
    seasonality: season1,
    aliases: ['Tbilisi', 'Tbilissi', 'Tbilisi Airport', 'Tbilisi International Airport', 'TBS Airport', 'Tiflis Airport'],
    bestMonths: [5, 6, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 6, 9],
  },
  {
    slug: 'batumi', name: 'Batumi', codes: ['BUS'], photo: photo2, stay: '2–4',
    description: ['Ciudad costera del mar Negro, con paseo marítimo, arquitectura contemporánea, jardines y excursiones por Adjara.', 'A Black Sea city of seafront promenades, contemporary architecture, gardens and excursions in Adjara.', 'Ville de la mer Noire, avec promenades maritimes, architecture contemporaine, jardins et excursions en Adjarie.', 'Schwarzmeerstadt mit Uferpromenaden, moderner Architektur, Gärten und Ausflügen in Adscharien.', 'Città del Mar Nero con lungomare, architettura contemporanea, giardini ed escursioni in Agiaria.', 'Cidade do mar Negro, com passeios marítimos, arquitetura contemporânea, jardins e excursões na Adjara.', 'Ciutat del mar Negre, amb passeig marítim, arquitectura contemporània, jardins i excursions per Adjara.'],
    recommendations: [
      ['Bulevar de Batumi', 'Batumi Boulevard', 'Boulevard de Batoumi', 'Batumi-Boulevard', 'Lungomare di Batumi', 'Bulevar de Batumi', 'Bulevard de Batumi'],
      ['Jardín Botánico de Batumi', 'Batumi Botanical Garden', 'Jardin botanique de Batoumi', 'Botanischer Garten Batumi', 'Giardino botanico di Batumi', 'Jardim Botânico de Batumi', 'Jardí Botànic de Batumi'],
      ['Torre del Alfabeto', 'Alphabetic Tower', 'Tour de l’Alphabet', 'Alphabetischer Turm', 'Torre dell’Alfabeto', 'Torre Alfabética', 'Torre Alfabètica'],
      ['Plaza Europa', 'Europe Square', 'Place de l’Europe', 'Europaplatz', 'Piazza Europa', 'Praça Europa', 'Plaça Europa'],
    ],
    seasonality: season2,
    aliases: ['Batoumi', 'Batumi Airport', 'Batumi International Airport', 'BUS Airport', 'Batum', 'Adjara'],
    bestMonths: [5, 6, 7, 8, 9], lowSeasonMonths: [1, 2, 3, 11], highSeasonMonths: [7, 8],
  },
  {
    slug: 'kutaisi', name: 'Kutaisi', codes: ['KUT'], photo: photo3, stay: '2–3',
    description: ['Puerta al oeste de Georgia, con catedrales medievales, cuevas, cañones y accesos a los paisajes de Imericia.', 'A gateway to western Georgia, with medieval cathedrals, caves, canyons and access to Imereti landscapes.', 'Porte de l’ouest de la Géorgie, avec cathédrales médiévales, grottes, canyons et paysages d’Iméréthie.', 'Tor zum Westen Georgiens mit mittelalterlichen Kathedralen, Höhlen, Schluchten und Landschaften Imeretiens.', 'Porta della Georgia occidentale, con cattedrali medievali, grotte, canyon e paesaggi dell’Imereti.', 'Porta do oeste da Geórgia, com catedrais medievais, grutas, canhões e paisagens da Imerétia.', 'Porta a l’oest de Geòrgia, amb catedrals medievals, coves, canyons i paisatges d’Imerecia.'],
    recommendations: [
      ['Catedral de Bagrati', 'Bagrati Cathedral', 'Cathédrale de Bagrati', 'Bagrati-Kathedrale', 'Cattedrale di Bagrati', 'Catedral de Bagrati', 'Catedral de Bagrati'],
      ['Monasterio de Gelati', 'Gelati Monastery', 'Monastère de Gélati', 'Gelati-Kloster', 'Monastero di Gelati', 'Mosteiro de Gelati', 'Monestir de Gelati'],
      ['Cueva de Prometeo', 'Prometheus Cave', 'Grotte de Prométhée', 'Prometheus-Höhle', 'Grotta di Prometeo', 'Gruta de Prometeu', 'Cova de Prometeu'],
      ['Cañón de Martvili', 'Martvili Canyon', 'Canyon de Martvili', 'Martvili-Schlucht', 'Canyon di Martvili', 'Cânion de Martvili', 'Canyó de Martvili'],
    ],
    seasonality: season1,
    aliases: ['Koutaïssi', 'Kutaissi', 'Kutaisi Airport', 'Kutaisi International Airport', 'KUT Airport', 'David the Builder Airport', 'Kutais'],
    bestMonths: [5, 6, 9, 10], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [5, 6, 9],
  },
];

export const georgiaDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'GE', country: 'Georgia' }, seeds);
