// Physical identities/city groups checked against public Travelpayouts data on 2026-10-21.
// Passenger-service status is verified separately with operators; flightable:true is not a current timetable.
type BelgianAirport={type:'airport';code:string;name:string;country_code:'BE';city_code:string;city_name:string;index_strings:readonly string[];physicalCityName?:string;scheduledPassengerService?:false;serviceNotice?:'noScheduledFlights'|'antwerpTuiEnds'|'charleroiTransfer'};
export const belgiumCityAliases:Readonly<Record<string,readonly string[]>>={
 BRU:['Bruselas','Bruxelles','Brussel','Brussels','Brüssel','Bruxelas','Brussel·les'],
 ANR:['Amberes','Antwerpen','Anvers','Antwerp','Anversa','Antuérpia'],
 // OST's provider city is named Brujas. Ostend aliases belong to the physical airport, not this city.
 OST:['Brujas','Brugge','Bruges','Brügge'],LGG:['Lieja','Liège','Liege','Luik','Lüttich','Liegi'],
};
export const belgiumAirports:readonly BelgianAirport[]=[
 {type:'airport',code:'BRU',name:'Brussels Airport — Zaventem',country_code:'BE',city_code:'BRU',city_name:'Bruselas',index_strings:[...belgiumCityAliases.BRU,'Zaventem','Brussels Airport']},
 {type:'airport',code:'CRL',name:'Charleroi / Brussels South Airport',country_code:'BE',city_code:'BRU',city_name:'Bruselas',physicalCityName:'Charleroi',index_strings:[...belgiumCityAliases.BRU,'Charleroi','Brussels South','Bruxelles-Sud'],serviceNotice:'charleroiTransfer'},
 {type:'airport',code:'ANR',name:'Antwerp International Airport',country_code:'BE',city_code:'ANR',city_name:'Amberes',index_strings:belgiumCityAliases.ANR,serviceNotice:'antwerpTuiEnds'},
 {type:'airport',code:'OST',name:'Ostend-Bruges International Airport',country_code:'BE',city_code:'OST',city_name:'Brujas',physicalCityName:'Ostende',index_strings:['Ostende','Oostende','Ostend','Ostenda',...belgiumCityAliases.OST]},
 {type:'airport',code:'LGG',name:'Liege Airport',country_code:'BE',city_code:'LGG',city_name:'Lieja',index_strings:belgiumCityAliases.LGG,scheduledPassengerService:false,serviceNotice:'noScheduledFlights'},
];
export const belgiumPassengerAirports=belgiumAirports.filter(a=>a.code!=='LGG');
function normalize(s:string){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');}
const ghent=['Gante','Gent','Gand','Ghent','Gant'];
export function belgiumAirportsForTerm(term:string){
 const q=normalize(term),matches=(aliases:readonly string[])=>aliases.some(a=>normalize(a)===q);
 const codes=matches(ghent)?['BRU','CRL']:matches(belgiumCityAliases.OST)?['OST','BRU','CRL']:matches(belgiumCityAliases.LGG)?['LGG','BRU','CRL']:undefined;
 if(codes)return codes.map(code=>({...belgiumAirports.find(a=>a.code===code)!,index_strings:[term]}));
 return belgiumAirports.filter(a=>normalize(a.code)===q||matches(a.index_strings));
}
/** Return the provider’s actual pricing city, including CRL→BRU and OST→Brujas; never invent a local airport. */
export function belgiumAccessSearchCity(code:string){return belgiumPassengerAirports.find(a=>a.code===code)?.city_name??code;}
