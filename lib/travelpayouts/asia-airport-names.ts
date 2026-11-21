// Nombres públicos de los aeropuertos de las fichas de Asia (todos menos Japón y Corea, que tienen su propia tabla).
// La identidad IATA de cada código se confirmó con el buscador de vuelos (20-11-2026, Golfo) y el nombre y código de cada aeropuerto
// de los lotes 2 y 3 con su ficha pública en Wikipedia (21-11-2026).
// Identifican un aeropuerto y un destino; no prometen ruta, tarifa, horario ni disponibilidad.
// Un código sin nombre aquí no muestra nombre en la ficha (se enseña solo el código): no se inventan nombres.
export const asiaAirportNames: Readonly<Record<string, string>> = {
  // Golfo
  BAH: 'Bahrain International Airport',
  KWI: 'Kuwait International Airport',
  DOH: 'Hamad International Airport',
  MCT: 'Muscat International Airport', SLL: 'Salalah International Airport', DQM: 'Duqm Airport', OHS: 'Sohar Airport',
  RUH: 'King Khalid International Airport', JED: 'King Abdulaziz International Airport', DMM: 'King Fahd International Airport',
  MED: 'Prince Mohammad bin Abdulaziz International Airport', ULH: 'Al-Ula International Airport', AHB: 'Abha International Airport',
  // Emiratos Árabes Unidos, Líbano, Jordania e Israel
  DXB: 'Dubai International Airport', DWC: 'Al Maktoum International Airport', AUH: 'Zayed International Airport',
  SHJ: 'Sharjah International Airport', RKT: 'Ras Al Khaimah International Airport', AAN: 'Al Ain International Airport',
  BEY: 'Beirut–Rafic Hariri International Airport', AMM: 'Queen Alia International Airport', AQJ: 'King Hussein International Airport',
  TLV: 'Ben Gurion Airport', ETM: 'Ramon Airport',
  // Cáucaso y Asia Central
  EVN: 'Zvartnots International Airport', LWN: 'Shirak International Airport',
  GYD: 'Heydar Aliyev International Airport', GNJ: 'Ganja International Airport', NAJ: 'Nakhchivan International Airport',
  TBS: 'Tbilisi International Airport', BUS: 'Batumi International Airport', KUT: 'Kutaisi International Airport',
  ALA: 'Almaty International Airport', NQZ: 'Nursultan Nazarbayev International Airport', CIT: 'Shymkent International Airport', SCO: 'Aktau International Airport',
  BSZ: 'Manas International Airport', OSS: 'Osh Airport',
  DYU: 'Dushanbe International Airport', LBD: 'Khujand Airport',
  ASB: 'Ashgabat International Airport', KRW: 'Turkmenbashi International Airport',
  TAS: 'Tashkent International Airport', SKD: 'Samarkand International Airport', BHK: 'Bukhara International Airport', UGC: 'Urgench International Airport',
};
