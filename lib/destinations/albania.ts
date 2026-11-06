import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, i) => [locale, values[i]])) as Record<Locale, string>;
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const seasons = localize([
  'Primavera y otoño son buenas épocas para recorrer la ciudad a pie; en verano puede hacer calor y haber más visitantes. Los meses tranquilos no garantizan precios bajos. Comprueba el tiempo y los horarios de visita.',
  'Spring and autumn suit exploring the city on foot; summer can be hot and busier. Quieter months do not guarantee low prices. Check the weather and attraction opening times.',
  'Le printemps et l’automne se prêtent à la découverte de la ville à pied ; l’été peut être chaud et plus fréquenté. Les mois calmes ne garantissent pas des prix bas. Vérifiez la météo et les horaires de visite.',
  'Frühling und Herbst eignen sich für Stadtspaziergänge; im Sommer kann es heiß und voller sein. Ruhigere Monate garantieren keine niedrigen Preise. Wetter und Öffnungszeiten prüfen.',
  'Primavera e autunno sono adatti a visitare la città a piedi; l’estate può essere calda e più affollata. I mesi tranquilli non garantiscono prezzi bassi. Controlla meteo e orari di visita.',
  'Primavera e outono são boas épocas para explorar a cidade a pé; o verão pode ser quente e ter mais visitantes. Os meses tranquilos não garantem preços baixos. Confirme o tempo e os horários das visitas.',
  'Primavera i tardor són bones èpoques per passejar per la ciutat; a l’estiu pot fer calor i hi pot haver més visitants. Els mesos tranquils no garanteixen preus baixos. Comprova el temps i els horaris de visita.',
]);
const airportNotes = {
  TIA: localize([
    'TIA (aeropuerto internacional Nënë Tereza) está en Rinas, fuera de Tirana, y es el principal aeropuerto de pasajeros de Albania. Consulta los vuelos y el traslado a la ciudad para tus fechas.',
    'TIA (Nënë Tereza International Airport) is at Rinas outside Tirana and is Albania’s main passenger airport. Check flights and the city transfer for your dates.',
    'TIA (aéroport international Nënë Tereza) se trouve à Rinas, hors de Tirana, et c’est le principal aéroport de passagers d’Albanie. Vérifiez les vols et le transfert vers la ville pour vos dates.',
    'TIA (Flughafen Nënë Tereza) liegt in Rinas außerhalb von Tirana und ist der wichtigste Passagierflughafen Albaniens. Flüge und Stadttransfer für die Reisedaten prüfen.',
    'TIA (aeroporto internazionale Nënë Tereza) si trova a Rinas, fuori Tirana, ed è il principale aeroporto passeggeri dell’Albania. Verifica voli e trasferimento in città per le tue date.',
    'TIA (Aeroporto Internacional Nënë Tereza) fica em Rinas, fora de Tirana, e é o principal aeroporto de passageiros da Albânia. Confirme os voos e o transporte para a cidade nas suas datas.',
    'TIA (Aeroport Internacional Nënë Tereza) és a Rinas, fora de Tirana, i és el principal aeroport de passatgers d’Albània. Consulta els vols i el trasllat a la ciutat per a les teves dates.',
  ]),
};
type Seed = {
  slug: string; code: keyof typeof airportNotes; names: Seven; descriptions: Seven;
  recommendations: [Seven, Seven, Seven, Seven]; stay: string; aliases: string[];
  photo: { image: string; imageSource: string; imageCredit: string; imageLicense: string; imageLicenseUrl: string };
  accessAirports?: DestinationProfile['accessAirports'];
};
function destination(seed: Seed): DestinationProfile {
  const names = localize(seed.names), descriptions = localize(seed.descriptions);
  const recommendations = seed.recommendations.map(localize);
  const translations = Object.fromEntries(locales.map(locale => [locale, {
    name: names[locale], description: descriptions[locale],
    recommendations: recommendations.map(place => place[locale]) as DestinationText['recommendations'],
    recommendedStay: `${seed.stay} ${days[locale]}`,
    seasonalityNote: `${seasons[locale]} ${airportNotes[seed.code][locale]}`,
  }])) as Record<Locale, DestinationText>;
  return {
    id: `al-${seed.slug}`, slug: seed.slug, countryCode: 'AL', country: 'Albania',
    ...seed.photo, ...translations.es, translations,
    airports: [{ iataCode: seed.code }], iataCodes: [seed.code], metropolitanCodes: [],
    ...(seed.accessAirports ? { accessAirports: seed.accessAirports } : {}),
    aliases: Array.from(new Set([...Object.values(names), ...seed.aliases])),
    bestMonths: [4, 5, 6, 9, 10], lowSeasonMonths: [1, 2, 11], highSeasonMonths: [7, 8],
    publication: { status: 'draft' },
  };
}

// Albania's only airport with verified current scheduled passenger service is Tirana (TIA).
// Kukës (KFZ) has no verified regular service and Vlorë (VLO) is not operating: see docs/albania-airports.md.
// The profile describes the served destination; it does not promise a scheduled route.
export const albaniaDestinations: DestinationProfile[] = [
  destination({ slug: 'tirana', code: 'TIA', stay: '2–3', aliases: ['Tirana', 'Tiranë', 'Tirane', 'Rinas', 'Nënë Tereza', 'Nene Tereza'],
    names: ['Tirana', 'Tirana', 'Tirana', 'Tirana', 'Tirana', 'Tirana', 'Tirana'],
    descriptions: [
      'Una gran plaza con el monumento a Skanderbeg, una mezquita histórica y un museo en un búnker de la época comunista definen el centro de Tirana.',
      'A large square with the Skanderbeg monument, a historic mosque and a museum in a communist-era bunker define central Tirana.',
      'Une grande place avec le monument à Skanderbeg, une mosquée historique et un musée dans un bunker de l’époque communiste marquent le centre de Tirana.',
      'Ein großer Platz mit dem Skanderbeg-Denkmal, eine historische Moschee und ein Museum in einem Bunker aus der kommunistischen Zeit prägen das Zentrum von Tirana.',
      'Una grande piazza con il monumento a Skanderbeg, una moschea storica e un museo in un bunker dell’epoca comunista caratterizzano il centro di Tirana.',
      'Uma grande praça com o monumento a Skanderbeg, uma mesquita histórica e um museu num bunker da época comunista marcam o centro de Tirana.',
      'Una gran plaça amb el monument a Skanderbeg, una mesquita històrica i un museu en un búnquer de l’època comunista defineixen el centre de Tirana.',
    ], recommendations: [
      ['Plaza de Skanderbeg', 'Skanderbeg Square', 'Place Skanderbeg', 'Skanderbeg-Platz', 'Piazza Skanderbeg', 'Praça Skanderbeg', 'Plaça de Skanderbeg'],
      ['Mezquita de Et’hem Bey', 'Et’hem Bey Mosque', 'Mosquée Et’hem Bey', 'Et’hem-Bey-Moschee', 'Moschea di Et’hem Bey', 'Mesquita de Et’hem Bey', 'Mesquita d’Et’hem Bey'],
      ['Bunk’Art 2', 'Bunk’Art 2', 'Bunk’Art 2', 'Bunk’Art 2', 'Bunk’Art 2', 'Bunk’Art 2', 'Bunk’Art 2'],
      ['Teleférico del monte Dajti', 'Mount Dajti cable car', 'Téléphérique du mont Dajti', 'Dajti-Seilbahn', 'Funivia del monte Dajti', 'Teleférico do monte Dajti', 'Telefèric del mont Dajti'],
    ], photo: {
      image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Tirana_-_Skanderbeg_Square_%28Sheshi_Sk%C3%ABnderbej%29_-_by_Pudelek.jpg/960px-Tirana_-_Skanderbeg_Square_%28Sheshi_Sk%C3%ABnderbej%29_-_by_Pudelek.jpg',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Tirana_-_Skanderbeg_Square_(Sheshi_Sk%C3%ABnderbej)_-_by_Pudelek.jpg',
      imageCredit: 'Pudelek', imageLicense: 'CC BY-SA 4.0', imageLicenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    },
  }),
];
