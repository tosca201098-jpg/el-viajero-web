import { asiaCountryDestinations, unsplashPhoto, type AsiaSeed, type Seven } from './asia-text';
import type { DestinationProfile } from './types';

const photo1 = unsplashPhoto('photo-1748066768504-99532da7d1e9', 'wOlMEpBzwHs', 'Ondrej Bocek');

const season1: Seven = ['De noviembre a marzo las temperaturas son más agradables; el verano es muy caluroso.', 'November to March brings more pleasant temperatures; summer is very hot.', 'De novembre à mars, les températures sont plus agréables ; l’été est très chaud.', 'Von November bis März sind die Temperaturen angenehmer; der Sommer ist sehr heiß.', 'Da novembre a marzo le temperature sono più piacevoli; l’estate è molto calda.', 'De novembro a março as temperaturas são mais agradáveis; o verão é muito quente.', 'De novembre a març les temperatures són més agradables; l’estiu és molt calorós.'];

const seeds: AsiaSeed[] = [
  {
    slug: 'manama', name: 'Manama', codes: ['BAH'], photo: photo1, stay: '2–3',
    description: ['Capital insular entre zocos, fortificaciones antiguas, museos y el moderno perfil del golfo Pérsico.', 'An island capital of souqs, ancient fortifications, museums and a modern Persian Gulf skyline.', 'Capitale insulaire de souks, fortifications anciennes, musées et silhouette moderne du golfe Persique.', 'Inselhauptstadt mit Souks, alten Befestigungen, Museen und moderner Skyline am Persischen Golf.', 'Capitale insulare di suq, antiche fortificazioni, musei e moderno skyline del Golfo Persico.', 'Capital insular de souks, antigas fortificações, museus e perfil moderno do Golfo Pérsico.', 'Capital insular de socs, fortificacions antigues, museus i un perfil modern del golf Pèrsic.'],
    recommendations: [
      ['Fuerte de Baréin', 'Bahrain Fort', 'Fort de Bahreïn', 'Bahrain-Fort', 'Forte del Bahrein', 'Forte do Barém', 'Fort de Bahrain'],
      ['Zoco de Manama', 'Manama Souq', 'Souk de Manama', 'Manama-Souk', 'Suq di Manama', 'Souk de Manama', 'Soc de Manama'],
      ['Museo Nacional de Baréin', 'Bahrain National Museum', 'Musée national de Bahreïn', 'Nationalmuseum Bahrain', 'Museo nazionale del Bahrein', 'Museu Nacional do Barém', 'Museu Nacional de Bahrain'],
      ['Mezquita Al Fateh', 'Al Fateh Grand Mosque', 'Grande mosquée Al Fateh', 'Al-Fateh-Moschee', 'Grande moschea Al Fateh', 'Grande Mesquita Al Fateh', 'Gran Mesquita Al Fateh'],
    ],
    seasonality: season1,
    aliases: ['Baréin', 'Bahrein', 'Bahréin', 'Barém', 'Bahrain', 'Bahrain Airport', 'Bahrain International Airport', 'BAH Airport', 'Muharraq'],
    bestMonths: [11, 12, 1, 2, 3], lowSeasonMonths: [6, 7, 8, 9], highSeasonMonths: [12, 1, 2, 3],
  },
];

export const bahrainDestinations: DestinationProfile[] = asiaCountryDestinations({ countryCode: 'BH', country: 'Baréin' }, seeds);
