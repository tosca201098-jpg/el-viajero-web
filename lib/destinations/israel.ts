import { asiaCountryDestinations, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1719757633949-3a0e42706f6d', 'zKyEk-sOQ7c', 'Eddy Shor');
const photo2 = unsplashPhoto('photo-1596033879089-43d385715ddd', 'uQFkRvGFTcY', 'Avi Theret');

const season1: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es caluroso.', 'Spring and autumn are usually the most pleasant seasons; summer is hot.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est chaud.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist heiß.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è calda.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é quente.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és calorós.'];
const season2: Seven = ['Primavera y otoño suelen ser los momentos más agradables; el verano es muy caluroso.', 'Spring and autumn are usually the most pleasant seasons; summer is very hot.', 'Le printemps et l’automne sont généralement les saisons les plus agréables ; l’été est très chaud.', 'Frühling und Herbst sind meist die angenehmsten Jahreszeiten; der Sommer ist sehr heiß.', 'Primavera e autunno sono in genere le stagioni più piacevoli; l’estate è molto calda.', 'A primavera e o outono costumam ser as épocas mais agradáveis; o verão é muito quente.', 'La primavera i la tardor solen ser les èpoques més agradables; l’estiu és molt calorós.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'tel-aviv', name: 'Tel Aviv', codes: ['TLV'], photo: photo1, stay: '3–5',
    description: ['Ciudad mediterránea de playas, arquitectura Bauhaus, mercados y vida cultural, con conexiones a Jerusalén y el centro del país.', 'A Mediterranean city of beaches, Bauhaus architecture, markets and cultural life, with links to Jerusalem and central Israel.', 'Ville méditerranéenne de plages, architecture Bauhaus, marchés et vie culturelle, avec des liaisons vers Jérusalem et le centre du pays.', 'Mittelmeerstadt mit Stränden, Bauhaus-Architektur, Märkten und Kulturleben sowie Verbindungen nach Jerusalem und ins Landeszentrum.', 'Città mediterranea di spiagge, architettura Bauhaus, mercati e vita culturale, collegata a Gerusalemme e al centro del paese.', 'Cidade mediterrânica de praias, arquitetura Bauhaus, mercados e vida cultural, com ligações a Jerusalém e ao centro do país.', 'Ciutat mediterrània de platges, arquitectura Bauhaus, mercats i vida cultural, amb connexions a Jerusalem i al centre del país.'],
    recommendations: [
      ['Paseo marítimo de Tel Aviv', 'Tel Aviv promenade', 'Promenade de Tel Aviv', 'Promenade von Tel Aviv', 'Lungomare di Tel Aviv', 'Passeio marítimo de Tel Aviv', 'Passeig marítim de Tel Aviv'],
      ['Jaffa antigua', 'Old Jaffa', 'Vieux Jaffa', 'Alt-Jaffa', 'Vecchia Giaffa', 'Jafa antiga', 'Jaffa antiga'],
      ['Mercado Carmel', 'Carmel Market', 'Marché du Carmel', 'Carmel-Markt', 'Mercato Carmel', 'Mercado Carmel', 'Mercat Carmel'],
      ['Ciudad Blanca Bauhaus', 'White City Bauhaus', 'Ville blanche Bauhaus', 'Weiße Stadt Bauhaus', 'Città Bianca Bauhaus', 'Cidade Branca Bauhaus', 'Ciutat Blanca Bauhaus'],
    ],
    seasonality: season1,
    aliases: ['Tel Aviv-Yafo', 'Tel Aviv Yafo', 'Jaffa', 'Yafo', 'Jafa', 'Giaffa', 'Tel Aviv Airport', 'Ben Gurion Airport', 'Ben Gurion International Airport', 'TLV Airport'],
    bestMonths: [3, 4, 5, 9, 10, 11], lowSeasonMonths: [1, 2, 7, 8], highSeasonMonths: [4, 5, 9, 10],
  },
  {
    slug: 'eilat', name: 'Eilat', codes: ['ETM'], photo: photo2, stay: '3–5',
    description: ['Destino del mar Rojo entre arrecifes, playas y montañas desérticas, puerta de acceso al extremo sur del país.', 'A Red Sea destination of reefs, beaches and desert mountains, gateway to the country’s far south.', 'Destination de la mer Rouge entre récifs, plages et montagnes désertiques, porte du grand sud du pays.', 'Reiseziel am Roten Meer mit Riffen, Stränden und Wüstenbergen, Tor zum äußersten Süden des Landes.', 'Destinazione sul Mar Rosso tra barriere coralline, spiagge e montagne desertiche, porta dell’estremo sud del paese.', 'Destino do mar Vermelho entre recifes, praias e montanhas desérticas, porta de entrada para o extremo sul do país.', 'Destinació del mar Roig entre esculls, platges i muntanyes desèrtiques, porta a l’extrem sud del país.'],
    recommendations: [
      ['Parque Coral Beach', 'Coral Beach Nature Reserve', 'Réserve de Coral Beach', 'Korallenstrand-Naturreservat', 'Riserva naturale Coral Beach', 'Reserva natural Coral Beach', 'Reserva natural Coral Beach'],
      ['Observatorio Marino de Eilat', 'Underwater Observatory Marine Park', 'Observatoire marin sous-marin', 'Unterwasserobservatorium', 'Osservatorio marino subacqueo', 'Observatório Marinho Subaquático', 'Observatori Marí Subaquàtic'],
      ['Montañas de Eilat', 'Eilat Mountains', 'Montagnes d’Eilat', 'Eilat-Berge', 'Monti di Eilat', 'Montanhas de Eilat', 'Muntanyes d’Eilat'],
      ['Paseo marítimo de Eilat', 'Eilat promenade', 'Promenade d’Eilat', 'Promenade von Eilat', 'Lungomare di Eilat', 'Passeio marítimo de Eilat', 'Passeig marítim d’Eilat'],
    ],
    seasonality: season2,
    aliases: ['Eilat Airport', 'Ramon Airport', 'Ramon International Airport', 'ETM Airport', 'Timna Airport', 'Eylat'],
    bestMonths: [3, 4, 5, 10, 11], lowSeasonMonths: [6, 7, 8, 9], highSeasonMonths: [3, 4, 10, 11],
  },
];

export const israelDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'IL', country: 'Israel' }, seeds);
