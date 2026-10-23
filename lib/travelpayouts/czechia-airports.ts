import { czechiaDestinations } from '@/lib/destinations/czechia';

// Travelpayouts places2 checks, 2026-10-22: PRG, BRQ, OSR, PED and KLV resolve to CZ.
// JCL does not resolve and remains auxiliary on České Budějovice; never price-search it.
export const czechiaCityAliases: Readonly<Record<string, readonly string[]>> = {
  PRG:['Praga','Praha','Prague','Prag'], BRQ:['Brno','Brünn'], OSR:['Ostrava','Ostrau'],
  PED:['Pardubice'], KLV:['Karlovy Vary','Karlsbad'],
};
export const czechiaAirports = [
  {type:'airport',code:'PRG',name:'Václav Havel Airport Prague',country_code:'CZ',city_code:'PRG',city_name:'Praga',index_strings:czechiaCityAliases.PRG},
  {type:'airport',code:'BRQ',name:'Brno–Tuřany Airport',country_code:'CZ',city_code:'BRQ',city_name:'Brno',index_strings:czechiaCityAliases.BRQ,serviceNotice:'limitedSeasonalFlights'},
  {type:'airport',code:'OSR',name:'Leoš Janáček Airport Ostrava',country_code:'CZ',city_code:'OSR',city_name:'Ostrava',index_strings:czechiaCityAliases.OSR,serviceNotice:'limitedSeasonalFlights'},
  {type:'airport',code:'PED',name:'Pardubice Airport',country_code:'CZ',city_code:'PED',city_name:'Pardubice',index_strings:czechiaCityAliases.PED,serviceNotice:'limitedSeasonalFlights'},
  {type:'airport',code:'KLV',name:'Karlovy Vary Airport',country_code:'CZ',city_code:'KLV',city_name:'Karlovy Vary',index_strings:czechiaCityAliases.KLV,serviceNotice:'limitedSeasonalFlights'},
] as const;
const normalize=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function czechiaAirportsForTerm(term:string){const q=normalize(term);return czechiaAirports.filter(airport=>normalize(airport.code)===q||airport.index_strings.some(alias=>normalize(alias)===q));}
export function czechiaTouristPlacesForTerm(term:string){
  const q=normalize(term); if(q.length<2)return [];
  return czechiaDestinations.filter(profile=>profile.airports.length===0)
    .filter(profile=>[profile.name,...(profile.aliases??[])].some(name=>normalize(name).startsWith(q)))
    .map(profile=>({type:'city' as const,code:null,name:profile.name,country_code:'CZ' as const,city_name:null,city_code:null,index_strings:profile.aliases??[]}));
}
export function czechiaAccessSearchCity(code:string){return ({PRG:'Praga',BRQ:'Brno',OSR:'Ostrava',PED:'Pardubice'} as Record<string,string>)[code]??code;}
