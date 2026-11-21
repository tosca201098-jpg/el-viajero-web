// Nombres públicos de los aeropuertos de las fichas de Asia (todos menos Japón y Corea, que tienen su propia tabla).
// La identidad IATA de cada código se confirmó con el buscador de vuelos (20-11-2026, Golfo) y el nombre y código de cada aeropuerto
// del lote 2 con su ficha pública en Wikipedia (21-11-2026).
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
};
