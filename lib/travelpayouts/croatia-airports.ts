import type { Locale } from '@/lib/i18n/translations';
import { croatiaCoverageAirports } from '@/lib/destinations/croatia-airport-coverage';
import { croatiaDestinations } from '@/lib/destinations/croatia';

// Nine physical airports checked against official operators, EUROCONTROL and free places2 identifiers.
// Search availability remains date- and origin-dependent.
export const croatiaCityAliases: Readonly<Record<string, readonly string[]>> = {
  ...Object.fromEntries(croatiaCoverageAirports.map(a=>[a.code,a.index_strings])),
  "ZAG": [
    "Zagreb",
    "Zágreb",
    "Zagabria"
  ],
  "DBV": [
    "Dubrovnik",
    "Ragusa"
  ],
  "SPU": [
    "Split",
    "Spalato"
  ],
  "ZAD": [
    "Zadar",
    "Zara"
  ],
  "PUY": [
    "Pula",
    "Pola"
  ],
  "RJK": [
    "Rijeka",
    "Fiume"
  ]
};
export const croatiaAirports = [
  { type: 'airport', code: 'ZAG', name: "Franjo Tuđman Airport Zagreb", country_code: 'HR', city_code: 'ZAG', city_name: "Zagreb", index_strings: croatiaCityAliases.ZAG },
  { type: 'airport', code: 'DBV', name: "Ruđer Bošković Airport Dubrovnik", country_code: 'HR', city_code: 'DBV', city_name: "Dubrovnik", index_strings: croatiaCityAliases.DBV },
  { type: 'airport', code: 'SPU', name: "Saint Jerome Airport Split", country_code: 'HR', city_code: 'SPU', city_name: "Split", index_strings: croatiaCityAliases.SPU },
  { type: 'airport', code: 'ZAD', name: "Zadar Airport", country_code: 'HR', city_code: 'ZAD', city_name: "Zadar", index_strings: croatiaCityAliases.ZAD },
  { type: 'airport', code: 'PUY', name: "Pula Airport", country_code: 'HR', city_code: 'PUY', city_name: "Pula", index_strings: croatiaCityAliases.PUY },
  { type: 'airport', code: 'RJK', name: "Rijeka Airport", country_code: 'HR', city_code: 'RJK', city_name: "Rijeka", index_strings: croatiaCityAliases.RJK },
  ...croatiaCoverageAirports,
] as const;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export function croatiaAirportsForTerm(term: string) {
  const query = normalize(term);
  return croatiaAirports.filter(airport => normalize(airport.code) === query || normalize(airport.name) === query ||
    airport.index_strings.some(alias => normalize(alias) === query));
}
export function croatiaTouristPlacesForTerm(term: string) {
  const query = normalize(term);
  if (query.length < 2) return [];
  return croatiaDestinations.filter(profile => profile.airports.length === 0 || ['OSI','BWK','LSZ'].includes(profile.iataCodes[0]))
    .filter(profile => [profile.name, ...(profile.aliases ?? [])].some(name => normalize(name).startsWith(query)))
    .map(profile => ({ type: 'city' as const, code: profile.iataCodes[0] ?? null, name: profile.name, country_code: 'HR' as const,
      city_name: profile.iataCodes.length ? profile.name : null, city_code: profile.iataCodes[0] ?? null, index_strings: profile.aliases ?? [] }));
}
export function croatiaAccessSearchCity(code: string) {
  return ({"OSI":"Osijek","BWK":"Bol (Brač)","LSZ":"Mali Lošinj","ZAG":"Zagreb","DBV":"Dubrovnik","SPU":"Split","ZAD":"Zadar","PUY":"Pula","RJK":"Rijeka"} as Record<string, string>)[code] ?? code;
}

export function croatiaAirportTown(code:string,locale:Locale){
  const profile=croatiaDestinations.find(p=>p.iataCodes.includes(code));
  return profile?.translations?.[locale]?.name ?? profile?.name ?? code;
}
