import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, index) => [locale, values[index]])) as Record<Locale, string>;
type Photo = { image: string; imageSource: string; imageCredit: string; imageLicense: string; imageLicenseUrl: string };
const commons = (title: string, credit: string, license: string, licenseUrl: string): Photo => ({
  image: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=1600`,
  imageSource: `https://commons.wikimedia.org/wiki/File:${title}`,
  imageCredit: credit, imageLicense: license, imageLicenseUrl: licenseUrl,
});

// Unsplash was checked first for each leading city; these two verified photos are used where available.
// The remaining regional cards use credited Commons photos rather than unverified image search results.
const photos = {
  seoul: commons('Skyline_view_from_Seoul_City_(South_Korea).jpg', 'Laurie Nevay', 'CC BY-SA 2.0', 'https://creativecommons.org/licenses/by-sa/2.0/'),
  busan: { image: 'https://images.unsplash.com/photo-1710017640106-b84b72d37849?auto=format&fit=crop&w=1600&q=80', imageSource: 'https://unsplash.com/photos/MKvh_x92v4I', imageCredit: 'Christopher Pap de Pestény', imageLicense: 'Unsplash License', imageLicenseUrl: 'https://unsplash.com/license' },
  jeju: commons('Jeju_Island.jpg', 'Robert Simmon / USGS', 'Public domain', 'https://commons.wikimedia.org/wiki/Commons:Licensing'),
  daegu: { image: 'https://images.unsplash.com/photo-1593812145998-fb482656db7c?auto=format&fit=crop&w=1600&q=80', imageSource: 'https://unsplash.com/photos/lKY3K50ubtk', imageCredit: 'Emanuel Ekström', imageLicense: 'Unsplash License', imageLicenseUrl: 'https://unsplash.com/license' },
  southwest: commons('Goha_Island,_Mokpo,_South_Jeolla_Province,_South_Korea_01.jpg', 'Korea Tourism Organization', 'KOGL Type 1', 'http://www.kogl.or.kr/info/licenseType1.do'),
  coast: commons('Busan-IMGP7037.jpg', 'P. Baertschi', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'),
  mountain: { image: 'https://images.unsplash.com/photo-1649668045765-9ba893602b0d?auto=format&fit=crop&w=1600&q=80', imageSource: 'https://unsplash.com/photos/vWve-2po7yg', imageCredit: 'Luna Moon', imageLicense: 'Unsplash License', imageLicenseUrl: 'https://unsplash.com/license' },
} as const;
type PhotoKey = keyof typeof photos;
type Climate = 'temperate' | 'south' | 'island' | 'mountain';
type Seed = { slug: string; codes: string[]; name: string; aliases: string[]; photo: PhotoKey; climate: Climate; stay: string; recommendations: [string, string, string, string] };

const seeds: Seed[] = [
  {slug:'seoul',codes:['ICN','GMP'],name:'Seúl',aliases:['Seoul','Seúl','Incheon','Gimpo'],photo:'seoul',climate:'temperate',stay:'4–6',recommendations:['Palacio Gyeongbokgung','Aldea Bukchon Hanok','Torre N Seoul','Arroyo Cheonggyecheon']},
  {slug:'busan',codes:['PUS'],name:'Busan',aliases:['Busan','Pusan','Gimhae'],photo:'busan',climate:'south',stay:'3–4',recommendations:['Playa Haeundae','Pueblo Gamcheon','Mercado Jagalchi','Templo Haedong Yonggungsa']},
  {slug:'jeju',codes:['CJU'],name:'Jeju',aliases:['Jeju','Jeju Island','Jeju-do'],photo:'jeju',climate:'island',stay:'3–5',recommendations:['Hallasan','Cascada Jeongbang','Pico Seongsan Ilchulbong','Sendero costero Olle']},
  {slug:'daegu',codes:['TAE'],name:'Daegu',aliases:['Daegu','Taegu','Daegu Airport'],photo:'daegu',climate:'temperate',stay:'2–3',recommendations:['Templo Donghwasa','Parque Apsan','Calle Kim Gwangseok','Mercado Seomun']},
  {slug:'cheongju',codes:['CJJ'],name:'Cheongju',aliases:['Cheongju','Cheongju Airport'],photo:'seoul',climate:'temperate',stay:'2–3',recommendations:['Fortaleza Sangdangsanseong','Cheongnamdae','Museo de la Imprenta Antigua','Barrio Suamgol']},
  {slug:'sacheon',codes:['HIN'],name:'Sacheon y Jinju',aliases:['Sacheon','Jinju','Sacheon Airport'],photo:'coast',climate:'south',stay:'2–3',recommendations:['Fortaleza Jinju','Puente Samcheonpo','Teleférico de Sacheon','Parque Namgang']},
  {slug:'pohang-gyeongju',codes:['KPO'],name:'Pohang y Gyeongju',aliases:['Pohang','Gyeongju','Pohang Gyeongju'],photo:'coast',climate:'south',stay:'3–4',recommendations:['Templo Bulguksa','Estanque Donggung y Wolji','Cabo Homigot','Mercado Jukdo']},
  {slug:'gunsan',codes:['KUV'],name:'Gunsan',aliases:['Gunsan','Gunsan Airport'],photo:'southwest',climate:'temperate',stay:'2–3',recommendations:['Distrito histórico moderno','Aldea ferroviaria Gyeongam','Templo Dongguksa','Isla Seonyudo']},
  {slug:'gwangju',codes:['KWJ'],name:'Gwangju',aliases:['Gwangju','Kwangju','Gwangju Airport'],photo:'southwest',climate:'temperate',stay:'2–3',recommendations:['Centro Cultural Asiático','Archivo 5·18','Parque Mudeungsan','Barrio Yangnim-dong']},
  {slug:'muan-mokpo',codes:['MWX'],name:'Muan y Mokpo',aliases:['Muan','Mokpo','Muan International'],photo:'southwest',climate:'south',stay:'2–3',recommendations:['Teleférico marino de Mokpo','Monte Yudalsan','Roca Gatbawi','Parque ecológico de Muan']},
  {slug:'yeosu',codes:['RSU'],name:'Yeosu',aliases:['Yeosu','Yeosu Airport'],photo:'coast',climate:'south',stay:'2–3',recommendations:['Isla Odongdo','Teleférico marino','Plaza Expo','Ermita Hyangiram']},
  {slug:'ulsan',codes:['USN'],name:'Ulsan',aliases:['Ulsan','Ulsan Airport'],photo:'coast',climate:'south',stay:'2–3',recommendations:['Parque Taehwagang','Cabo Ganjeolgot','Parque Daewangam','Museo de Ballenas Jangsaengpo']},
  {slug:'wonju-hoengseong',codes:['WJU'],name:'Wonju y Hoengseong',aliases:['Wonju','Hoengseong','Wonju Airport'],photo:'mountain',climate:'mountain',stay:'2–3',recommendations:['Museo SAN','Puente colgante Sogeumsan','Parque Chiaksan','Centro del hanji']},
  {slug:'yangyang-seoraksan',codes:['YNY'],name:'Yangyang y Seoraksan',aliases:['Yangyang','Seoraksan','Yangyang Airport'],photo:'mountain',climate:'mountain',stay:'2–3',recommendations:['Parque Seoraksan','Templo Naksansa','Playa Surfyy','Aguas termales Osaek']},
];

const seasonality: Record<Climate, Seven> = {
  temperate: ['Primavera y otoño son buenas épocas para caminar; el verano puede ser caluroso y húmedo. Comprueba el tiempo y los horarios antes de viajar.', 'Spring and autumn are good for walking; summer can be hot and humid. Check weather and opening times before travelling.', 'Le printemps et l’automne sont propices aux balades ; l’été peut être chaud et humide. Vérifiez météo et horaires.', 'Frühling und Herbst eignen sich zum Spazieren; der Sommer kann heiß und feucht sein. Wetter und Öffnungszeiten prüfen.', 'Primavera e autunno sono adatti alle passeggiate; l’estate può essere calda e umida. Controlla meteo e orari.', 'A primavera e o outono são bons para passear; o verão pode ser quente e húmido. Confirme o tempo e os horários.', 'La primavera i la tardor són bones per passejar; l’estiu pot ser calent i humit. Comprova el temps i els horaris.'],
  south: ['Primavera y otoño suelen ser agradables. En verano hay calor, humedad y posibles lluvias; revisa la previsión para tus fechas.', 'Spring and autumn are usually pleasant. Summer is hot, humid and can bring rain; check the forecast for your dates.', 'Le printemps et l’automne sont généralement agréables. L’été est chaud, humide et peut être pluvieux ; vérifiez les prévisions.', 'Frühling und Herbst sind meist angenehm. Der Sommer ist heiß, feucht und kann Regen bringen; Vorhersage prüfen.', 'Primavera e autunno sono in genere piacevoli. L’estate è calda, umida e può portare pioggia; controlla le previsioni.', 'A primavera e o outono costumam ser agradáveis. O verão é quente, húmido e pode ter chuva; confirme a previsão.', 'La primavera i la tardor solen ser agradables. L’estiu és calent, humit i pot portar pluja; comprova la previsió.'],
  island: ['El clima marino cambia con rapidez. Primavera y otoño suelen ser cómodos; revisa vuelos, viento y mar para tus fechas.', 'Maritime weather changes quickly. Spring and autumn are usually comfortable; check flights, wind and sea conditions for your dates.', 'La météo maritime change rapidement. Le printemps et l’automne sont généralement agréables ; vérifiez vols, vent et mer.', 'Das maritime Wetter wechselt schnell. Frühling und Herbst sind meist angenehm; Flüge, Wind und Seegang prüfen.', 'Il clima marittimo cambia rapidamente. Primavera e autunno sono in genere piacevoli; controlla voli, vento e mare.', 'O clima marítimo muda depressa. A primavera e o outono costumam ser agradáveis; confirme voos, vento e mar.', 'El clima marítim canvia ràpid. La primavera i la tardor solen ser agradables; comprova vols, vent i estat de la mar.'],
  mountain: ['Finales de primavera, verano y comienzo de otoño favorecen las rutas de montaña. En invierno puede haber nieve; revisa accesos y tiempo.', 'Late spring, summer and early autumn suit mountain routes. Winter can bring snow; check access and weather.', 'La fin du printemps, l’été et le début de l’automne conviennent aux itinéraires de montagne. L’hiver peut apporter de la neige.', 'Spätfrühling, Sommer und Frühherbst eignen sich für Bergtouren. Im Winter kann Schnee liegen; Zugang und Wetter prüfen.', 'Tarda primavera, estate e inizio autunno sono adatti ai percorsi di montagna. In inverno può nevicare; controlla accessi e meteo.', 'O fim da primavera, o verão e o início do outono favorecem rotas de montanha. No inverno pode nevar; confirme acessos e tempo.', 'El final de primavera, l’estiu i l’inici de tardor afavoreixen les rutes de muntanya. A l’hivern hi pot haver neu; comprova accessos i temps.'],
};
const description = (name: string): Seven => [`${name} combina patrimonio, vida local y paisajes de Corea del Sur para una escapada urbana o regional.`, `${name} combines heritage, local life and South Korean scenery for an urban or regional trip.`, `${name} combine patrimoine, vie locale et paysages de Corée du Sud pour un séjour urbain ou régional.`, `${name} verbindet Kultur, lokales Leben und südkoreanische Landschaften für einen Stadt- oder Regionalurlaub.`, `${name} unisce patrimonio, vita locale e paesaggi della Corea del Sud per un viaggio urbano o regionale.`, `${name} combina património, vida local e paisagens da Coreia do Sul para uma viagem urbana ou regional.`, `${name} combina patrimoni, vida local i paisatges de Corea del Sud per a una escapada urbana o regional.`];
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const calendar = (climate: Climate) => climate === 'island' ? { best:[4,5,6,9,10], quiet:[1,2,11], high:[7,8] } : climate === 'mountain' ? { best:[5,6,7,8,9,10], quiet:[1,2,11], high:[7,8] } : { best:[3,4,5,9,10,11], quiet:[1,2,6], high:[7,8] };

function destination(seed: Seed): DestinationProfile {
  const translations = Object.fromEntries(locales.map((locale, index) => [locale, {
    name: seed.name, description: description(seed.name)[index], recommendations: seed.recommendations,
    recommendedStay: `${seed.stay} ${days[locale]}`,
    seasonalityNote: `${seasonality[seed.climate][index]} Aeropuerto${seed.codes.length > 1 ? 's' : ''}: ${seed.codes.join(', ')}.`,
  }])) as Record<Locale, DestinationText>;
  const months = calendar(seed.climate);
  return { id:`kr-${seed.slug}`, slug:seed.slug, countryCode:'KR', country:'Corea del Sur', ...photos[seed.photo], ...translations.es, translations,
    airports:seed.codes.map(iataCode => ({iataCode})), iataCodes:seed.codes, metropolitanCodes:seed.codes.length > 1 ? ['SEL'] : [],
    aliases:Array.from(new Set([seed.name,...seed.aliases])), bestMonths:months.best, lowSeasonMonths:months.quiet, highSeasonMonths:months.high,
    publication:{status:'draft'} };
}

export const southKoreaDestinations: DestinationProfile[] = seeds.map(destination);
