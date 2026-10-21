// Travelpayouts public snapshot verified 2026-10-21; operator/service caveats: docs/germany-destinations.md.
export const germanyPassengerAirports = [
  {"type":"airport","code":"BER","name":"Berlin Brandenburg","country_code":"DE","city_code":"BER","city_name":"Berlín","index_strings":["Berlín","Berlin","Brandenburg"]},
  {"type":"airport","code":"MUC","name":"Franz Josef Strauss Airport","country_code":"DE","city_code":"MUC","city_name":"Múnich","index_strings":["Múnich","Munich","München","Muenchen","Franz Josef Strauss Airport"]},
  {"type":"airport","code":"NUE","name":"Nuremberg Airport","country_code":"DE","city_code":"NUE","city_name":"Núremberg","index_strings":["Núremberg","Nuremberg","Nürnberg","Nuernberg","Nuremberg Airport"]},
  {"type":"airport","code":"FMM","name":"Memmingen / Allgäu","country_code":"DE","city_code":"FMM","city_name":"Memmingen","index_strings":["Memmingen","Memmingen Allgau Airport"]},
  {"type":"airport","code":"FRA","name":"Frankfurt Airport","country_code":"DE","city_code":"FRA","city_name":"Fráncfort","index_strings":["Fráncfort","Frankfurt","Frankfurt am Main","Fráncfort del Meno","Frankfurt/Main","Frankfurt Airport"]},
  {"type":"airport","code":"HHN","name":"Frankfurt-Hahn / Hunsrück","country_code":"DE","city_code":"FRA","city_name":"Fráncfort","index_strings":["Fráncfort","Frankfurt","Frankfurt am Main","Fráncfort del Meno","Frankfurt/Main","Frankfurt - Hahn Airport","Hahn","Frankfurt-Hahn"]},
  {"type":"airport","code":"KSF","name":"Kassel-Calden Airport","country_code":"DE","city_code":"KSF","city_name":"Kassel","index_strings":["Kassel","Kassel-Calden Airport"]},
  {"type":"airport","code":"HAM","name":"Hamburg Airport","country_code":"DE","city_code":"HAM","city_name":"Hamburgo","index_strings":["Hamburgo","Hamburg","Hamburg Airport"]},
  {"type":"airport","code":"HAJ","name":"Hannover Airport","country_code":"DE","city_code":"HAJ","city_name":"Hannover","index_strings":["Hannover","Hannover Airport"]},
  {"type":"airport","code":"BRE","name":"Bremen Airport","country_code":"DE","city_code":"BRE","city_name":"Bremen","index_strings":["Bremen","Bremen Airport"]},
  {"type":"airport","code":"LBC","name":"Lübeck / Blankensee","country_code":"DE","city_code":"HAM","city_name":"Hamburgo","index_strings":["Hamburgo","Hamburg","Lubeck Blankensee"]},
  {"type":"airport","code":"RLG","name":"Laage Airport","country_code":"DE","city_code":"RLG","city_name":"Rostock","index_strings":["Rostock","Laage Airport"]},
  {"type":"airport","code":"DUS","name":"Dusseldorf International Airport","country_code":"DE","city_code":"DUS","city_name":"Düsseldorf","index_strings":["Düsseldorf","Dusseldorf","Duesseldorf","Dusseldorf International Airport"]},
  {"type":"airport","code":"CGN","name":"Cologne Bonn Airport","country_code":"DE","city_code":"CGN","city_name":"Colonia","index_strings":["Colonia","Cologne","Köln","Koeln","Cologne Bonn Airport"]},
  {"type":"airport","code":"DTM","name":"Dortmund Airport","country_code":"DE","city_code":"DTM","city_name":"Dortmund","index_strings":["Dortmund","Dortmund Airport"]},
  {"type":"airport","code":"FMO","name":"Munster Osnabruck International Airport","country_code":"DE","city_code":"FMO","city_name":"Muenster","index_strings":["Muenster","Munster Osnabruck International Airport"]},
  {"type":"airport","code":"PAD","name":"Paderborn Lippstadt Airport","country_code":"DE","city_code":"PAD","city_name":"Paderborn","index_strings":["Paderborn","Paderborn Lippstadt Airport"]},
  {"type":"airport","code":"NRN","name":"Weeze / Niederrhein","country_code":"DE","city_code":"DUS","city_name":"Düsseldorf","index_strings":["Düsseldorf","Dusseldorf","Duesseldorf","Weeze Airport","Weeze","Niederrhein"]},
  {"type":"airport","code":"STR","name":"Stuttgart Airport","country_code":"DE","city_code":"STR","city_name":"Stuttgart","index_strings":["Stuttgart","Stuttgart Airport"]},
  {"type":"airport","code":"FKB","name":"Baden-Airpark","country_code":"DE","city_code":"FKB","city_name":"Karlsruhe","index_strings":["Karlsruhe","Baden-Airpark"]},
  {"type":"airport","code":"FDH","name":"Friedrichshafen Airport","country_code":"DE","city_code":"FDH","city_name":"Friedrichshafen","index_strings":["Friedrichshafen","Friedrichshafen Airport"]},
  {"type":"airport","code":"LEJ","name":"Leipzig/Halle Airport","country_code":"DE","city_code":"LEJ","city_name":"Leipzig/Halle","index_strings":["Leipzig","Leipzig/Halle","Leipzig/Halle Airport"]},
  {"type":"airport","code":"DRS","name":"Dresden International Airport","country_code":"DE","city_code":"DRS","city_name":"Dresde","index_strings":["Dresde","Dresden","Dresden International Airport"]},
  {"type":"airport","code":"ERF","name":"Erfurt Airport","country_code":"DE","city_code":"ERF","city_name":"Erfurt","index_strings":["Erfurt","Erfurt Airport"]},
  {"type":"airport","code":"SCN","name":"Ensheim Airport","country_code":"DE","city_code":"SCN","city_name":"Saarbruecken","index_strings":["Saarbruecken","Ensheim Airport"]},
  {"type":"airport","code":"GWT","name":"Westerland - Sylt Airport","country_code":"DE","city_code":"GWT","city_name":"Westerland","index_strings":["Westerland","Westerland - Sylt Airport"]},
  {"type":"airport","code":"HDF","name":"Heringsdorf","country_code":"DE","city_code":"HDF","city_name":"Heringsdorf","index_strings":["Heringsdorf","Heringsdorf Airport"]},
] as const;

export const germanyCityAliases: Readonly<Record<string, readonly string[]>> = {
  "BER": [
    "Berlín",
    "Berlin"
  ],
  "MUC": [
    "Múnich",
    "Munich",
    "München",
    "Muenchen"
  ],
  "HAM": [
    "Hamburgo",
    "Hamburg"
  ],
  "FRA": [
    "Fráncfort",
    "Frankfurt",
    "Frankfurt am Main",
    "Fráncfort del Meno",
    "Frankfurt/Main"
  ],
  "CGN": [
    "Colonia",
    "Cologne",
    "Köln",
    "Koeln"
  ],
  "DUS": [
    "Düsseldorf",
    "Dusseldorf",
    "Duesseldorf"
  ],
  "STR": [
    "Stuttgart"
  ],
  "NUE": [
    "Núremberg",
    "Nuremberg",
    "Nürnberg",
    "Nuernberg"
  ],
  "DRS": [
    "Dresde",
    "Dresden"
  ],
  "LEJ": [
    "Leipzig",
    "Leipzig/Halle"
  ]
};

/** TXL/SXF are retired; XFW is an industrial airport, not a public scheduled alternative to HAM. */
export const germanyUnavailablePassengerCodes: readonly string[] = ['TXL','SXF','XFW'];

function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, ' '); }
export function germanyAirportsForTerm(term: string) {
 const normalized=normalize(term);
 return germanyPassengerAirports.filter(airport => normalize(airport.code)===normalized || airport.index_strings.some(alias=>normalize(alias)===normalized));
}

/** Preserve city pricing; EuroAirport is physically in France but belongs to the provider’s Basel/EAP group. */
export function germanyAccessSearchCity(airportCode: string) {
 if (airportCode === 'BSL' || airportCode === 'MLH') return 'Basilea';
 return germanyPassengerAirports.find(airport=>airport.code===airportCode)?.city_name ?? airportCode;
}
