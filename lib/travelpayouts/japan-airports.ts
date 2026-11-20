import { japanDestinations } from '@/lib/destinations/japan';
import type { Locale } from '@/lib/i18n/translations';

type Airport = { type: 'airport'; code: string; name: string; country_code: 'JP'; city_code: string; city_name: string; index_strings: readonly string[] };
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const metropolitan = new Map([['HND', 'TYO'], ['NRT', 'TYO'], ['ITM', 'OSA'], ['KIX', 'OSA'], ['CTS', 'SPK'], ['OKD', 'SPK'], ['NGO', 'NGO'], ['NKM', 'NGO']]);

// Airport names from public airport lists on 2026-11-20 (Wikipedia, cross-checked with Booking,
// Expedia and Skyscanner pages). They identify an airport and its destination; they do not promise
// a route, fare or schedule. Not yet confirmed with the flight provider's places search.
const names: Readonly<Record<string, string>> = {
  HND: 'Tokyo International Airport (Haneda)', NRT: 'Narita International Airport',
  ITM: 'Osaka International Airport (Itami)', KIX: 'Kansai International Airport', UKB: 'Kobe Airport',
  NGO: 'Chubu Centrair International Airport', NKM: 'Nagoya Airfield (Komaki)', IBR: 'Ibaraki Airport',
  KIJ: 'Niigata Airport', MMJ: 'Matsumoto Airport', FSZ: 'Shizuoka Airport (Mt. Fuji Shizuoka)',
  HAC: 'Hachijojima Airport', CTS: 'New Chitose Airport', OKD: 'Okadama Airport', HKD: 'Hakodate Airport',
  AKJ: 'Asahikawa Airport', OBO: 'Tokachi-Obihiro Airport', KUH: 'Kushiro Airport',
  WKJ: 'Wakkanai Airport', MMB: 'Memanbetsu Airport', SHB: 'Nakashibetsu Airport', RIS: 'Rishiri Airport',
  OIR: 'Okushiri Airport', MBE: 'Monbetsu Airport', AOJ: 'Aomori Airport', MSJ: 'Misawa Airport',
  HNA: 'Hanamaki Airport', AXT: 'Akita Airport', ONJ: 'Odate-Noshiro Airport', GAJ: 'Yamagata Airport',
  SYO: 'Shonai Airport', SDJ: 'Sendai Airport', FKS: 'Fukushima Airport', TOY: 'Toyama Airport',
  KMQ: 'Komatsu Airport', NTQ: 'Noto Airport', OKJ: 'Okayama Airport', HIJ: 'Hiroshima Airport',
  IWK: 'Iwakuni Kintaikyo Airport', UBJ: 'Yamaguchi Ube Airport', TTJ: 'Tottori Airport',
  YGJ: 'Miho-Yonago Airport', IZO: 'Izumo Airport', IWJ: 'Iwami Airport (Hagi-Iwami)',
  TAK: 'Takamatsu Airport', TKS: 'Tokushima Awaodori Airport', MYJ: 'Matsuyama Airport',
  KCZ: 'Kochi Ryoma Airport', FUK: 'Fukuoka Airport', KKJ: 'Kitakyushu Airport', HSG: 'Saga Airport',
  NGS: 'Nagasaki Airport', TSJ: 'Tsushima Airport', IKI: 'Iki Airport', FUJ: 'Fukue Airport',
  KMJ: 'Kumamoto Airport', OIT: 'Oita Airport', KMI: 'Miyazaki Airport', KOJ: 'Kagoshima Airport',
  TNE: 'New Tanegashima Airport', KUM: 'Yakushima Airport', ASJ: 'Amami Airport', KKX: 'Kikai Airport',
  TKN: 'Tokunoshima Airport', OKE: 'Okinoerabu Airport', RNJ: 'Yoron Airport', OKA: 'Naha Airport',
  UEO: 'Kumejima Airport', MMY: 'Miyako Airport', SHI: 'Shimojishima Airport', ISG: 'New Ishigaki Airport',
  OGN: 'Yonaguni Airport', MMD: 'Minami-Daito Airport', KTD: 'Kitadaito Airport', OKI: 'Oki Airport',
  SHM: 'Nanki-Shirahama Airport', TJH: 'Tajima Airport',
};

/** Physical airports only. The city card determines the local tourist identity. */
export const japanAirports: readonly Airport[] = japanDestinations.flatMap(profile => profile.iataCodes.map(code => ({
  type: 'airport' as const, code, name: names[code] ?? `${profile.name} — ${code}`,
  country_code: 'JP' as const, city_code: metropolitan.get(code) ?? code,
  city_name: profile.name, index_strings: profile.aliases ?? [profile.name],
})));
export const japanCityAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  japanAirports.map(airport => [airport.code, airport.index_strings]),
);
export function japanAirportsForTerm(term: string) {
  const query = normalize(term);
  return japanAirports.filter(airport => normalize(airport.code) === query || normalize(airport.name) === query ||
    airport.index_strings.some(alias => normalize(alias) === query));
}
export function japanTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return japanDestinations.filter(profile => [profile.name, ...(profile.aliases ?? [])]
    .some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.metropolitanCodes[0] ?? profile.iataCodes[0], name: profile.name,
      country_code: 'JP' as const, city_name: profile.name, city_code: profile.metropolitanCodes[0] ?? profile.iataCodes[0],
      index_strings: profile.aliases ?? [] }));
}
export function japanAirportTown(code: string, locale: Locale) {
  const profile = japanDestinations.find(destination => destination.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
