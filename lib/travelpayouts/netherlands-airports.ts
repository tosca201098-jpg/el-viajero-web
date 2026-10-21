// Public Travelpayouts airport/city resources verified 2026-10-21; service caveats in docs/netherlands-destinations.md.
export const netherlandsPassengerAirports = [
  {type:'airport',code:'AMS',name:'Amsterdam Airport Schiphol',country_code:'NL',city_code:'AMS',city_name:'Ámsterdam',index_strings:['Ámsterdam','Amsterdam','Amesterdão','Schiphol']},
  {type:'airport',code:'RTM',name:'Rotterdam The Hague Airport',country_code:'NL',city_code:'RTM',city_name:'Róterdam',index_strings:['Róterdam','Rotterdam','Roterdão','La Haya','Den Haag','The Hague','La Haye','L’Aia','Haia','La Haia']},
  {type:'airport',code:'EIN',name:'Eindhoven Airport',country_code:'NL',city_code:'EIN',city_name:'Eindhoven',index_strings:['Eindhoven']},
  {type:'airport',code:'MST',name:'Maastricht Aachen Airport',country_code:'NL',city_code:'MST',city_name:'Mastrique',index_strings:['Maastricht','Mastrique','Maestricht','Aachen']},
  {type:'airport',code:'GRQ',name:'Groningen Airport Eelde',country_code:'NL',city_code:'GRQ',city_name:'Groninga',index_strings:['Groningen','Groninga','Groningue','Eelde']},
] as const;

export const netherlandsCityAliases: Readonly<Record<string, readonly string[]>> = {
  AMS:['Ámsterdam','Amsterdam','Amesterdão','Schiphol'],RTM:['Róterdam','Rotterdam','Roterdão'],
  EIN:['Eindhoven'],MST:['Maastricht','Mastrique','Maestricht'],GRQ:['Groningen','Groninga','Groningue'],
};
/** No regular public passenger service at present. TEX is Telluride (US), never a Texel code. */
export const netherlandsUnavailablePassengerCodes: readonly string[] = ['LEY','DHR','ENS'];
function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');}
export function isNetherlandsCountryTerm(term:string){
  return ['Países Bajos','Holanda','Netherlands','The Netherlands','Pays-Bas','Pays Bas','Niederlande','Paesi Bassi','Països Baixos'].some(alias=>normalize(alias)===normalize(term));
}
export function netherlandsAirportsForTerm(term:string){
  if(isNetherlandsCountryTerm(term))return [...netherlandsPassengerAirports];
  const normalized=normalize(term);
  // These are arrival gateways requiring a ground transfer, not airports owned by The Hague.
  const hague=['La Haya','Den Haag','The Hague','La Haye','L’Aia','Haia','La Haia'].some(alias=>normalize(alias)===normalized);
  if(hague)return [netherlandsPassengerAirports[1],{...netherlandsPassengerAirports[0],index_strings:[...netherlandsPassengerAirports[0].index_strings,term]}];
  return netherlandsPassengerAirports.filter(airport=>normalize(airport.code)===normalized||airport.index_strings.some(alias=>normalize(alias)===normalized));
}
/** Preserve the provider's actual arrival city and existing city-level pricing. */
export function netherlandsAccessSearchCity(airportCode:string){
  return netherlandsPassengerAirports.find(airport=>airport.code===airportCode)?.city_name??airportCode;
}
