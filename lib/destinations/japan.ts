import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';

/**
 * Japan's airport catalogue is deliberately city- and island-based: HND/NRT,
 * ITM/KIX, CTS/OKD and NGO/NKM share a single card, while Kobe remains Kobe.
 * All profiles are drafts; the home page and automatic recommendation lists do
 * not read this module.
 */
const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
type Seven = [string, string, string, string, string, string, string];
const localize = (values: Seven) => Object.fromEntries(locales.map((locale, index) => [locale, values[index]])) as Record<Locale, string>;
const toSeven = (value: string): Seven => [value, value, value, value, value, value, value];

type Photo = { image: string; imageSource: string; imageCredit: string; imageLicense: string; imageLicenseUrl: string };
const commons = (_path: string, title: string, credit: string, license: string, licenseUrl: string): Photo => ({
  // The file-page resolver is stable even when Commons moves an original between hashed upload paths.
  image: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}?width=1600`,
  imageSource: `https://commons.wikimedia.org/wiki/File:${title}`,
  imageCredit: credit, imageLicense: license, imageLicenseUrl: licenseUrl,
});

// Each image depicts the city or the landscape of the card's own Japanese region.
// Attribution and reuse terms were read from its Commons file page on 13-11-2026.
const photos = {
  tokyo: commons('e/ed/Tokyo_Tower%2C_Minato_City.jpg', 'Tokyo_Tower,_Minato_City.jpg', 'David Kernan', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'),
  osaka: commons('8/8b/Osaka_Castle_Outer_Moat_and_Osaka_Business_Park%2C_November_2016.jpg', 'Osaka_Castle_Outer_Moat_and_Osaka_Business_Park,_November_2016.jpg', 'Martin Falbisoner', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'),
  kobe: commons('c/cd/Kyu-kobeko-shingojo004.jpg', 'Kyu-kobeko-shingojo004.jpg', 'Tomomarusan', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'),
  nagoya: commons('b/b4/Nagoya_Castle%28Larger%29.jpg', 'Nagoya_Castle(Larger).jpg', 'Base64', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'),
  hokkaido: commons('b/b2/Sightseeing_spot_in_Furano%2C_Hokkaido_Prefecture%3B_July_2017_%2804%29.jpg', 'Sightseeing_spot_in_Furano,_Hokkaido_Prefecture;_July_2017_(04).jpg', '雷太', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/'),
  hakodate: commons('6/66/Mount-Hakodate_Night-view.jpg', 'Mount-Hakodate_Night-view.jpg', 'MaedaAkihiko', 'CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/'),
  hiroshima: commons('0/0e/Itsukushima_Gate.jpg', 'Itsukushima_Gate.jpg', 'JordyMeow', 'CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/'),
  shikoku: commons('1/14/Japan%2C_Shikoku_island%2C_rugged_coast_2.jpg', 'Japan,_Shikoku_island,_rugged_coast_2.jpg', 'Marie-Sophie Mejan', 'CC BY 4.0', 'https://creativecommons.org/licenses/by/4.0/'),
  kagoshima: commons('5/5c/Sakurajima55.jpg', 'Sakurajima55.jpg', 'TANAKA Juuyoh', 'CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/'),
  okinawa: commons('6/6f/Furuzamami_beach_Okinawa_Zamami.jpg', 'Furuzamami_beach_Okinawa_Zamami.jpg', 'Hashi photo', 'CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/'),
} as const;
type PhotoKey = keyof typeof photos;

type Climate = 'north' | 'temperate' | 'south' | 'island';
type Seed = { slug: string; codes: string[]; name: string; aliases: string[]; photo: PhotoKey; climate: Climate; stay: string; recommendations: [string, string, string, string] };

const seeds: Seed[] = [
  {slug:'tokyo',codes:['HND','NRT'],name:'Tokio',aliases:['Tokyo','Tokio','Haneda','Narita'],photo:'tokyo',climate:'temperate',stay:'4–6',recommendations:['Santuario Meiji','Cruce de Shibuya','Asakusa y Sensō-ji','Tokyo Skytree']},
  {slug:'osaka',codes:['ITM','KIX'],name:'Osaka',aliases:['Osaka','Itami','Kansai'],photo:'osaka',climate:'temperate',stay:'3–4',recommendations:['Castillo de Osaka','Dōtonbori','Mercado Kuromon','Shinsekai']},
  {slug:'kobe',codes:['UKB'],name:'Kobe',aliases:['Kobe','Kōbe','Kobe Airport'],photo:'kobe',climate:'temperate',stay:'2–3',recommendations:['Puerto de Kobe','Kitano Ijinkan','Monte Rokkō','Barrio de Nankinmachi']},
  {slug:'nagoya',codes:['NGO','NKM'],name:'Nagoya',aliases:['Nagoya','Chubu Centrair','Komaki'],photo:'nagoya',climate:'temperate',stay:'2–3',recommendations:['Castillo de Nagoya','Santuario Atsuta','Osu Kannon','Museo Toyota']},
  {slug:'ibaraki',codes:['IBR'],name:'Ibaraki',aliases:['Ibaraki','Mito','Ibaraki Airport'],photo:'tokyo',climate:'temperate',stay:'2–3',recommendations:['Jardín Kairaku-en','Santuario Kashima','Hitachi Seaside Park','Monte Tsukuba']},
  {slug:'niigata',codes:['KIJ'],name:'Niigata',aliases:['Niigata','Niigata Airport'],photo:'tokyo',climate:'temperate',stay:'2–3',recommendations:['Paseo Bandai','Puente Bandai','Mercado Pier Bandai','Sado, isla cercana']},
  {slug:'matsumoto',codes:['MMJ'],name:'Matsumoto',aliases:['Matsumoto','Shinshu Matsumoto'],photo:'tokyo',climate:'temperate',stay:'2–3',recommendations:['Castillo de Matsumoto','Calle Nawate','Museo de Arte','Alpes Japoneses']},
  {slug:'shizuoka',codes:['FSZ'],name:'Shizuoka',aliases:['Shizuoka','Mt Fuji Shizuoka'],photo:'tokyo',climate:'temperate',stay:'2–3',recommendations:['Monte Fuji','Nihondaira','Santuario Kunōzan','Plantaciones de té']},
  {slug:'hachijojima',codes:['HAC'],name:'Hachijōjima',aliases:['Hachijojima','Hachijo-jima','Hachijō-jima'],photo:'tokyo',climate:'island',stay:'2–3',recommendations:['Monte Hachijō-fuji','Uramigataki','Aguas termales','Playas volcánicas']},
  {slug:'sapporo',codes:['CTS','OKD'],name:'Sapporo',aliases:['Sapporo','New Chitose','Okadama','Chitose'],photo:'hokkaido',climate:'north',stay:'3–4',recommendations:['Parque Ōdōri','Torre del Reloj','Museo de la Cerveza','Monte Moiwa']},
  {slug:'hakodate',codes:['HKD'],name:'Hakodate',aliases:['Hakodate','Hakodate Airport'],photo:'hakodate',climate:'north',stay:'2–3',recommendations:['Monte Hakodate','Mercado matinal','Fuerte Goryōkaku','Almacenes de ladrillo rojo']},
  {slug:'asahikawa',codes:['AKJ'],name:'Asahikawa',aliases:['Asahikawa','Asahikawa Airport'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Asahiyama Zoo','Calle Heiwa','Biei Blue Pond','Daisetsuzan']},
  {slug:'obihiro',codes:['OBO'],name:'Obihiro',aliases:['Obihiro','Tokachi-Obihiro'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Jardín Manabe','Pista Banei','Tokachigawa Onsen','Llanura de Tokachi']},
  {slug:'kushiro',codes:['KUH'],name:'Kushiro',aliases:['Kushiro','Kushiro Airport'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Humedal de Kushiro','Puente Nusamai','Mercado Washo','Grullas de corona roja']},
  {slug:'wakkanai',codes:['WKJ'],name:'Wakkanai',aliases:['Wakkanai','Wakkanai Airport'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Cabo Sōya','Parque Wakkanai','Molinos de viento Sōya','Vistas hacia Rishiri']},
  {slug:'memanbetsu',codes:['MMB'],name:'Memanbetsu',aliases:['Memanbetsu','Abashiri','Memanbetsu Airport'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Museo de la Prisión de Abashiri','Mar de Ojotsk','Cabo Notoro','Lago Tōfutsu']},
  {slug:'nakashibetsu',codes:['SHB'],name:'Nakashibetsu',aliases:['Nakashibetsu','Nakashibetsu Airport'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Península de Notsuke','Lago Mashū','Mirador Kaiyōdai','Parque de Shibetsu']},
  {slug:'rishiri',codes:['RIS'],name:'Rishiri',aliases:['Rishiri','Rishiri Airport'],photo:'hokkaido',climate:'island',stay:'2–3',recommendations:['Monte Rishiri','Cabo Sukai','Lago Himenuma','Senderos costeros']},
  {slug:'okushiri',codes:['OIR'],name:'Okushiri',aliases:['Okushiri','Okushiri Airport'],photo:'hokkaido',climate:'island',stay:'2–3',recommendations:['Costa de Aonae','Arco de Nabetsuru','Museo del tsunami','Rutas de la isla']},
  {slug:'monbetsu',codes:['MBE'],name:'Monbetsu',aliases:['Monbetsu','Okhotsk Monbetsu'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Museo del hielo marino','Cabo Ōmu','Puerto de Monbetsu','Mar de Ojotsk']},
  {slug:'aomori',codes:['AOJ'],name:'Aomori',aliases:['Aomori','Aomori Airport'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Museo Nebuta','Aomori Bay Bridge','Mercado Auga','Parque Sannai-Maruyama']},
  {slug:'misawa',codes:['MSJ'],name:'Misawa',aliases:['Misawa','Misawa Airport'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Lago Ogawara','Museo de Aviación','Costa de Misawa','Cabo Tanesashi']},
  {slug:'morioka-hanamaki',codes:['HNA'],name:'Morioka y Hanamaki',aliases:['Morioka','Hanamaki','Iwate Hanamaki'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Castillo de Morioka','Aguas termales Hanamaki','Templo Chūson-ji','Garganta Geibikei']},
  {slug:'akita',codes:['AXT'],name:'Akita',aliases:['Akita','Akita Airport'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Museo de Arte de Akita','Parque Senshū','Ciudad samurái Kakunodate','Lago Tazawa']},
  {slug:'odate-noshiro',codes:['ONJ'],name:'Ōdate y Noshiro',aliases:['Odate','Ōdate','Noshiro','Odate Noshiro'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Museo del perro Akita','Bosque de Shirakami','Costa de Noshiro','Aguas termales Oyu']},
  {slug:'yamagata',codes:['GAJ'],name:'Yamagata',aliases:['Yamagata','Yamagata Airport','Junmachi'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Yamadera','Castillo de Yamagata','Aguas termales Zao','Cerezos de Kajo']},
  {slug:'shonai',codes:['SYO'],name:'Shōnai',aliases:['Shonai','Shōnai','Sakata','Tsuruoka'],photo:'hokkaido',climate:'north',stay:'2–3',recommendations:['Monte Haguro','Santuario Dewa Sanzan','Arrozales de Shōnai','Puerto de Sakata']},
  {slug:'sendai',codes:['SDJ'],name:'Sendai',aliases:['Sendai','Sendai Airport'],photo:'tokyo',climate:'temperate',stay:'2–3',recommendations:['Mausoleo Zuihōden','Ruinas de Aoba','Avenida Jozenji','Bahía de Matsushima']},
  {slug:'fukushima',codes:['FKS'],name:'Fukushima',aliases:['Fukushima','Fukushima Airport'],photo:'tokyo',climate:'temperate',stay:'2–3',recommendations:['Castillo Tsuruga','Ōuchi-juku','Lago Inawashiro','Monte Bandai']},
  {slug:'toyama',codes:['TOY'],name:'Toyama',aliases:['Toyama','Toyama Airport'],photo:'tokyo',climate:'temperate',stay:'2–3',recommendations:['Ruta Alpina Tateyama','Castillo de Toyama','Kurobe Gorge','Mercado de pescado']},
  {slug:'kanazawa-komatsu',codes:['KMQ'],name:'Kanazawa y Komatsu',aliases:['Kanazawa','Komatsu','Komatsu Airport'],photo:'nagoya',climate:'temperate',stay:'2–3',recommendations:['Jardín Kenroku-en','Distrito Higashi Chaya','Castillo de Kanazawa','Mercado Ōmichō']},
  {slug:'noto',codes:['NTQ'],name:'Península de Noto',aliases:['Noto','Wajima','Noto Airport'],photo:'nagoya',climate:'temperate',stay:'2–3',recommendations:['Mercado de Wajima','Costa de Senmaida','Cabo Suzu','Onsen de Wakura']},
  {slug:'okayama',codes:['OKJ'],name:'Okayama',aliases:['Okayama','Okayama Airport'],photo:'hiroshima',climate:'temperate',stay:'2–3',recommendations:['Jardín Kōraku-en','Castillo de Okayama','Distrito Kurashiki Bikan','Canal de Kurashiki']},
  {slug:'hiroshima',codes:['HIJ'],name:'Hiroshima',aliases:['Hiroshima','Hiroshima Airport'],photo:'hiroshima',climate:'temperate',stay:'2–3',recommendations:['Parque de la Paz','Cúpula de la Bomba','Santuario Itsukushima','Isla de Miyajima']},
  {slug:'iwakuni',codes:['IWK'],name:'Iwakuni',aliases:['Iwakuni','Iwakuni Kintaikyo'],photo:'hiroshima',climate:'temperate',stay:'2–3',recommendations:['Puente Kintai','Castillo de Iwakuni','Parque Kikko','Río Nishiki']},
  {slug:'yamaguchi-ube',codes:['UBJ'],name:'Yamaguchi Ube',aliases:['Yamaguchi Ube','Ube','Yamaguchi'],photo:'hiroshima',climate:'temperate',stay:'2–3',recommendations:['Puente Tsunoshima','Templo Ruriko-ji','Cueva Akiyoshidō','Meseta Akiyoshidai']},
  {slug:'tottori',codes:['TTJ'],name:'Tottori',aliases:['Tottori','Tottori Airport'],photo:'hiroshima',climate:'temperate',stay:'2–3',recommendations:['Dunas de Tottori','Museo de la Arena','Castillo de Tottori','Costa de Uradome']},
  {slug:'yonago',codes:['YGJ'],name:'Yonago',aliases:['Yonago','Miho','Yonago Kitaro'],photo:'hiroshima',climate:'temperate',stay:'2–3',recommendations:['Monte Daisen','Calle Kitarō','Aguas termales Kaike','Santuario Miho']},
  {slug:'izumo',codes:['IZO'],name:'Izumo',aliases:['Izumo','Matsue','Izumo Airport'],photo:'hiroshima',climate:'temperate',stay:'2–3',recommendations:['Santuario Izumo Taisha','Castillo de Matsue','Lago Shinji','Jardín Adachi']},
  {slug:'hagi-iwami',codes:['IWJ'],name:'Hagi e Iwami',aliases:['Hagi','Iwami','Hagi-Iwami'],photo:'hiroshima',climate:'temperate',stay:'2–3',recommendations:['Ciudad del castillo de Hagi','Costa de Iwami','Santuario Taikodani','Aguas termales Tsuwano']},
  {slug:'takamatsu',codes:['TAK'],name:'Takamatsu',aliases:['Takamatsu','Takamatsu Airport'],photo:'shikoku',climate:'temperate',stay:'2–3',recommendations:['Jardín Ritsurin','Castillo de Takamatsu','Isla Naoshima','Puerto de Takamatsu']},
  {slug:'tokushima',codes:['TKS'],name:'Tokushima',aliases:['Tokushima','Awaodori','Tokushima Airport'],photo:'shikoku',climate:'temperate',stay:'2–3',recommendations:['Monte Bizan','Estrecho de Naruto','Festival Awa Odori','Valle de Iya']},
  {slug:'matsuyama',codes:['MYJ'],name:'Matsuyama',aliases:['Matsuyama','Matsuyama Airport'],photo:'shikoku',climate:'temperate',stay:'2–3',recommendations:['Dōgo Onsen','Castillo de Matsuyama','Templo Ishite-ji','Canal Okaido']},
  {slug:'kochi',codes:['KCZ'],name:'Kōchi',aliases:['Kochi','Kōchi','Kochi Ryoma'],photo:'shikoku',climate:'temperate',stay:'2–3',recommendations:['Castillo de Kōchi','Mercado Hirome','Río Shimanto','Cabo Muroto']},
  {slug:'fukuoka',codes:['FUK'],name:'Fukuoka',aliases:['Fukuoka','Fukuoka Airport'],photo:'kagoshima',climate:'south',stay:'3–4',recommendations:['Canal City','Santuario Kushida','Parque Ōhori','Puestos yatai']},
  {slug:'kitakyushu',codes:['KKJ'],name:'Kitakyūshū',aliases:['Kitakyushu','Kitakyūshū','Kokura'],photo:'kagoshima',climate:'south',stay:'2–3',recommendations:['Castillo de Kokura','Mojiko Retro','Monte Sarakura','Mercado Tanga']},
  {slug:'saga',codes:['HSG'],name:'Saga',aliases:['Saga','Saga Airport'],photo:'kagoshima',climate:'south',stay:'2–3',recommendations:['Santuario Yūtoku Inari','Castillo de Saga','Cerámica de Arita','Llanura de Saga']},
  {slug:'nagasaki',codes:['NGS'],name:'Nagasaki',aliases:['Nagasaki','Nagasaki Airport'],photo:'kagoshima',climate:'south',stay:'2–3',recommendations:['Jardín Glover','Dejima','Parque de la Paz','Monte Inasa']},
  {slug:'tsushima',codes:['TSJ'],name:'Tsushima',aliases:['Tsushima','Tsushima Airport'],photo:'kagoshima',climate:'island',stay:'2–3',recommendations:['Santuario Watatsumi','Bahía Asō','Monte Shiratake','Costa de Miuda']},
  {slug:'iki',codes:['IKI'],name:'Iki',aliases:['Iki','Iki Airport'],photo:'kagoshima',climate:'island',stay:'2–3',recommendations:['Santuario Tsukiyomi','Playa Tsutsuki','Saruiwa','Cueva Onino Ashiato']},
  {slug:'goto-fukue',codes:['FUJ'],name:'Goto Fukue',aliases:['Goto','Gotō','Fukue','Goto Fukue'],photo:'kagoshima',climate:'island',stay:'2–3',recommendations:['Playa Takahama','Iglesia Dozaki','Monte Onidake','Puerto de Fukue']},
  {slug:'kumamoto',codes:['KMJ'],name:'Kumamoto',aliases:['Kumamoto','Kumamoto Airport'],photo:'kagoshima',climate:'south',stay:'2–3',recommendations:['Castillo de Kumamoto','Jardín Suizenji','Monte Aso','Garganta Takachiho']},
  {slug:'oita-beppu',codes:['OIT'],name:'Ōita y Beppu',aliases:['Oita','Ōita','Beppu','Oita Airport'],photo:'kagoshima',climate:'south',stay:'2–3',recommendations:['Onsen de Beppu','Yufuin','Monte Yufu','Cañón de Harajiri']},
  {slug:'miyazaki',codes:['KMI'],name:'Miyazaki',aliases:['Miyazaki','Miyazaki Airport'],photo:'kagoshima',climate:'south',stay:'2–3',recommendations:['Santuario Udo','Costa Nichinan','Desfiladero Takachiho','Isla Aoshima']},
  {slug:'kagoshima',codes:['KOJ'],name:'Kagoshima',aliases:['Kagoshima','Kagoshima Airport'],photo:'kagoshima',climate:'south',stay:'2–3',recommendations:['Volcán Sakurajima','Jardín Sengan-en','Puerto de Kagoshima','Aguas termales Ibusuki']},
  {slug:'tanegashima',codes:['TNE'],name:'Tanegashima',aliases:['Tanegashima','Tanegashima Airport'],photo:'kagoshima',climate:'island',stay:'2–3',recommendations:['Centro Espacial Tanegashima','Playa Hamada','Cabo Kadokura','Bosque de manglares']},
  {slug:'yakushima',codes:['KUM'],name:'Yakushima',aliases:['Yakushima','Yakushima Airport'],photo:'kagoshima',climate:'island',stay:'3–4',recommendations:['Jōmon Sugi','Bosque Shiratani','Cascada Ōko','Sendero Yakusugi']},
  {slug:'amami-oshima',codes:['ASJ'],name:'Amami Ōshima',aliases:['Amami Oshima','Amami Ōshima','Amami'],photo:'okinawa',climate:'island',stay:'3–4',recommendations:['Manglares de Kuroshio','Playa Tomori','Bosque Kinsakubaru','Cabo Miyakozaki']},
  {slug:'kikai',codes:['KKX'],name:'Kikai',aliases:['Kikai','Kikaijima','Kikai Airport'],photo:'okinawa',climate:'island',stay:'2–3',recommendations:['Arrecifes de coral','Cabo Hyakunodai','Playas de Kikai','Miradores de la isla']},
  {slug:'tokunoshima',codes:['TKN'],name:'Tokunoshima',aliases:['Tokunoshima','Tokunoshima Airport'],photo:'okinawa',climate:'island',stay:'2–3',recommendations:['Cabo Inutabu','Playa Mushiroze','Cuevas calizas','Costa de Amagi']},
  {slug:'okinoerabu',codes:['OKE'],name:'Okinoerabu',aliases:['Okinoerabu','Okinoerabujima','Okino Erabu'],photo:'okinawa',climate:'island',stay:'2–3',recommendations:['Cueva Shōryūdō','Playa Yakomo','Cabo Taminamisaki','Arrecifes de coral']},
  {slug:'yoron',codes:['RNJ'],name:'Yoron',aliases:['Yoron','Yoronjima','Yoron Airport'],photo:'okinawa',climate:'island',stay:'2–3',recommendations:['Playa Yurigahama','Cabo Southern Cross','Aldea Yoron','Arrecifes de coral']},
  {slug:'naha',codes:['OKA'],name:'Naha',aliases:['Naha','Okinawa','Naha Airport'],photo:'okinawa',climate:'island',stay:'3–4',recommendations:['Castillo Shuri','Calle Kokusai','Mercado Makishi','Jardín Fukushūen']},
  {slug:'kumejima',codes:['UEO'],name:'Kumejima',aliases:['Kumejima','Kume-jima','Kumejima Airport'],photo:'okinawa',climate:'island',stay:'2–3',recommendations:['Playa Hatenohama','Tatayama','Rocas de Tatami','Costa de Eef']},
  {slug:'miyakojima',codes:['MMY'],name:'Miyakojima',aliases:['Miyakojima','Miyako-jima','Miyako Airport'],photo:'okinawa',climate:'island',stay:'3–4',recommendations:['Playa Yonaha Maehama','Puente Irabu','Cabo Higashi-hennazaki','Bahía de Yabiji']},
  {slug:'shimojishima',codes:['SHI'],name:'Shimojishima',aliases:['Shimojishima','Shimoji-shima','Miyako'],photo:'okinawa',climate:'island',stay:'2–3',recommendations:['Estanque Tōriike','Playa Sawada','Puente Irabu','Costa de Shimoji']},
  {slug:'ishigaki',codes:['ISG'],name:'Ishigaki',aliases:['Ishigaki','Painushima Ishigaki'],photo:'okinawa',climate:'island',stay:'3–4',recommendations:['Bahía Kabira','Cabo Hirakubozaki','Playa Yonehara','Isla Taketomi']},
  {slug:'yonaguni',codes:['OGN'],name:'Yonaguni',aliases:['Yonaguni','Yonaguni Jima'],photo:'okinawa',climate:'island',stay:'2–3',recommendations:['Cabo Irizaki','Acantilados de Tindahanata','Caballos yonaguni','Costa sur de la isla']},
  {slug:'minamidaito',codes:['MMD'],name:'Minamidaitō',aliases:['Minamidaito','Minamidaitō','Minami Daito'],photo:'okinawa',climate:'island',stay:'2–3',recommendations:['Piscina oceánica','Acantilados de Minamidaitō','Caña de azúcar','Rutas de la isla']},
  {slug:'kitadaito',codes:['KTD'],name:'Kitadaitō',aliases:['Kitadaito','Kitadaitō','Kita Daito'],photo:'okinawa',climate:'island',stay:'2–3',recommendations:['Puerto de Kitadaitō','Acantilados coralinos','Rutas de la isla','Paisaje agrícola']},
  {slug:'oki',codes:['OKI'],name:'Islas Oki',aliases:['Oki','Oki Island','Islas Oki'],photo:'hiroshima',climate:'island',stay:'2–3',recommendations:['Acantilados Kuniga','Santuario Tamawakasu','Costa de Nishinoshima','Bosque de cedros']},
  {slug:'shirahama',codes:['SHM'],name:'Shirahama',aliases:['Shirahama','Nanki Shirahama'],photo:'osaka',climate:'temperate',stay:'2–3',recommendations:['Playa Shirarahama','Senjojiki','Cueva Sandanbeki','Aguas termales']},
  {slug:'tajima',codes:['TJH'],name:'Tajima',aliases:['Tajima','Toyooka','Kounotori Tajima'],photo:'osaka',climate:'temperate',stay:'2–3',recommendations:['Kinosaki Onsen','Castillo Izushi','Humedal Hachigoro','Costa de San’in']},
];

const seasonalCopy: Record<Climate, Seven> = {
  north: ['Finales de primavera, verano y comienzo de otoño suelen ser cómodos. En invierno hay nieve y frío intenso; revisa el tiempo y los horarios antes de viajar.', 'Late spring, summer and early autumn are usually comfortable. Winter brings snow and severe cold; check weather and opening times before travelling.', 'La fin du printemps, l’été et le début de l’automne sont généralement agréables. L’hiver apporte neige et grand froid : vérifiez la météo et les horaires.', 'Spätfrühling, Sommer und Frühherbst sind meist angenehm. Im Winter gibt es Schnee und strenge Kälte; Wetter und Öffnungszeiten prüfen.', 'La tarda primavera, l’estate e l’inizio dell’autunno sono in genere piacevoli. L’inverno porta neve e freddo intenso: controlla meteo e orari.', 'O fim da primavera, o verão e o início do outono costumam ser agradáveis. O inverno traz neve e frio intenso; confirme o tempo e horários.', 'El final de primavera, l’estiu i l’inici de tardor solen ser agradables. A l’hivern hi ha neu i fred intens; comprova el temps i els horaris.'],
  temperate: ['Primavera y otoño son buenas épocas para pasear; el verano puede ser caluroso y con más visitantes. Los meses tranquilos no garantizan precios bajos.', 'Spring and autumn are good for walking; summer can be hot and busier. Quieter months do not guarantee lower prices.', 'Le printemps et l’automne conviennent aux balades ; l’été peut être chaud et plus fréquenté. Les mois calmes ne garantissent pas des prix plus bas.', 'Frühling und Herbst eignen sich zum Spazieren; im Sommer kann es heißer und voller sein. Ruhigere Monate garantieren keine niedrigeren Preise.', 'Primavera e autunno sono adatti alle passeggiate; l’estate può essere calda e più affollata. I mesi tranquilli non garantiscono prezzi più bassi.', 'A primavera e o outono são bons para passear; o verão pode ser quente e mais cheio. Meses tranquilos não garantem preços mais baixos.', 'La primavera i la tardor són bones per passejar; l’estiu pot ser calorós i més ple. Els mesos tranquils no garanteixen preus més baixos.'],
  south: ['Primavera y otoño suelen ser agradables; el verano puede ser húmedo y caluroso. Revisa el tiempo, los transportes y los horarios para tus fechas.', 'Spring and autumn are usually pleasant; summer can be humid and hot. Check weather, transport and opening hours for your dates.', 'Le printemps et l’automne sont généralement agréables ; l’été peut être chaud et humide. Vérifiez météo, transports et horaires.', 'Frühling und Herbst sind meist angenehm; der Sommer kann heiß und feucht sein. Wetter, Verkehr und Öffnungszeiten prüfen.', 'Primavera e autunno sono in genere piacevoli; l’estate può essere calda e umida. Controlla meteo, trasporti e orari.', 'A primavera e o outono costumam ser agradáveis; o verão pode ser quente e húmido. Confirme tempo, transportes e horários.', 'La primavera i la tardor solen ser agradables; l’estiu pot ser calent i humit. Comprova el temps, els transports i els horaris.'],
  island: ['El clima y el mar condicionan los enlaces insulares. Comprueba la previsión, los vuelos y los barcos para tus fechas; los meses tranquilos no garantizan precios bajos.', 'Weather and sea conditions affect island links. Check forecasts, flights and ferries for your dates; quieter months do not guarantee lower prices.', 'La météo et la mer influencent les liaisons insulaires. Vérifiez prévisions, vols et ferries ; les mois calmes ne garantissent pas des prix plus bas.', 'Wetter und Seegang beeinflussen Inselverbindungen. Vorhersage, Flüge und Fähren prüfen; ruhigere Monate garantieren keine niedrigeren Preise.', 'Meteo e mare condizionano i collegamenti insulari. Controlla previsioni, voli e traghetti; i mesi tranquilli non garantiscono prezzi più bassi.', 'O clima e o mar condicionam as ligações insulares. Confirme previsão, voos e ferries; meses tranquilos não garantem preços mais baixos.', 'El clima i la mar condicionen les connexions insulars. Comprova previsió, vols i ferris; els mesos tranquils no garanteixen preus més baixos.'],
};
const description = (name: string): Seven => [
  `${name} reúne patrimonio, paisajes y gastronomía local; la ficha reúne los lugares más representativos para planificar una escapada.`,
  `${name} combines heritage, scenery and local food; this card gathers its most representative places for planning a trip.`,
  `${name} réunit patrimoine, paysages et gastronomie locale ; cette fiche rassemble ses lieux les plus représentatifs pour préparer un séjour.`,
  `${name} verbindet Kultur, Landschaften und lokale Küche; diese Karte bündelt prägende Orte für eine Reiseplanung.`,
  `${name} unisce patrimonio, paesaggi e cucina locale; questa scheda raccoglie i luoghi più rappresentativi per organizzare un viaggio.`,
  `${name} reúne património, paisagens e gastronomia local; esta ficha reúne os locais mais representativos para planear uma viagem.`,
  `${name} reuneix patrimoni, paisatges i gastronomia local; aquesta fitxa agrupa els llocs més representatius per planificar una escapada.`,
];
const days = localize(['días', 'days', 'jours', 'Tage', 'giorni', 'dias', 'dies']);
const months = (climate: Climate) => climate === 'north' ? { best:[5,6,7,8,9], quiet:[1,2,11], high:[7,8] }
  : climate === 'island' ? { best:[4,5,6,9,10], quiet:[1,2,11], high:[7,8] }
  : climate === 'south' ? { best:[3,4,5,10,11], quiet:[1,2,6], high:[7,8] }
  : { best:[3,4,5,10,11], quiet:[1,2,6], high:[7,8] };

function destination(seed: Seed): DestinationProfile {
  const translations = Object.fromEntries(locales.map((locale, index) => [locale, {
    name: seed.name,
    description: description(seed.name)[index],
    recommendations: seed.recommendations,
    recommendedStay: `${seed.stay} ${days[locale]}`,
    seasonalityNote: `${seasonalCopy[seed.climate][index]} Aeropuerto${seed.codes.length > 1 ? 's' : ''}: ${seed.codes.join(', ')}.`,
  }])) as Record<Locale, DestinationText>;
  const calendar = months(seed.climate);
  return {
    id: `jp-${seed.slug}`, slug: seed.slug, countryCode: 'JP', country: 'Japón',
    ...photos[seed.photo], ...translations.es, translations,
    airports: seed.codes.map(iataCode => ({ iataCode })), iataCodes: seed.codes,
    metropolitanCodes: seed.codes.length > 1 ? [{ HND:'TYO', ITM:'OSA', CTS:'SPK', NGO:'NGO' }[seed.codes[0]]!].filter(Boolean) : [],
    aliases: Array.from(new Set([seed.name, ...seed.aliases])),
    bestMonths: calendar.best, lowSeasonMonths: calendar.quiet, highSeasonMonths: calendar.high,
    publication: { status: 'draft' },
  };
}

export const japanDestinations: DestinationProfile[] = seeds.map(destination);
