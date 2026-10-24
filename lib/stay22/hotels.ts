export type HotelForm = {
  destination: string; checkin: string; checkout: string;
  adults: string; children: string; infants: string; rooms: string; currency: string;
};

export const hotelDefaults: HotelForm = {
  destination: '', checkin: '', checkout: '', adults: '2', children: '0', infants: '0', rooms: '1', currency: 'EUR',
};

export function localCalendarDate(today = new Date()) {
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

function calendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(time.getTime()) && time.toISOString().slice(0, 10) === value;
}

export function validHotelDates(checkin: string, checkout: string, today = new Date()) {
  const limit = new Date(today.getFullYear() + 2, today.getMonth(), today.getDate());
  return calendarDate(checkin) && calendarDate(checkout) &&
    checkin >= localCalendarDate(today) && checkout > checkin && checkout <= localCalendarDate(limit);
}

function count(value: string, min: number, max: number) {
  return /^\d+$/.test(value) && Number(value) >= min && Number(value) <= max;
}

export function validHotelSearch(form: HotelForm, today = new Date()) {
  return form.destination.trim().length > 0 && form.destination.trim().length <= 200 &&
    !/[\u0000-\u001f\u007f]/.test(form.destination) &&
    validHotelDates(form.checkin, form.checkout, today) &&
    count(form.adults, 1, 10) && count(form.children, 0, 10) && count(form.infants, 0, 10) &&
    count(form.rooms, 1, 5) && Number(form.rooms) <= Number(form.adults) &&
    ['EUR', 'USD', 'GBP', 'CAD', 'CHF', 'JPY'].includes(form.currency);
}

/** Local URL only. The same contract is used by the home form and destination cards. */
export function hotelsHref(values: Partial<HotelForm>) {
  const params = new URLSearchParams();
  for (const key of Object.keys(hotelDefaults) as (keyof HotelForm)[]) {
    if (values[key] !== undefined) params.set(key, values[key]!.trim());
  }
  return `/hoteles?${params}`;
}

/** Only reuse a complete, valid trip for the same city. Flight departures are editable suggestions, not arrival guarantees. */
export function hotelFlightDefaults(context: { departureDate?: string; returnDate?: string; travelers?: number }, today = new Date()): Partial<HotelForm> {
  if (!context.departureDate || !context.returnDate || !validHotelDates(context.departureDate, context.returnDate, today) ||
      !Number.isInteger(context.travelers) || context.travelers! < 1 || context.travelers! > 10) return {};
  return { checkin: context.departureDate, checkout: context.returnDate, adults: String(context.travelers) };
}

/** Official Maps contract, verified 2026-10-24: https://dev.stay22.com/docs/maps/parameters */
export function stay22MapSrc(form: HotelForm, language: string, today = new Date()): string | null {
  if (!validHotelSearch(form, today)) return null;
  const params = new URLSearchParams({
    aid: 'destinauta', address: form.destination.trim(), checkin: form.checkin, checkout: form.checkout,
    adults: form.adults, children: form.children, infants: form.infants, rooms: form.rooms,
    currency: form.currency, ljs: ['es', 'en', 'fr', 'de', 'it', 'pt'].includes(language) ? language : 'es',
    priceper: 'total', campaign: 'destinauta_hoteles', maincolor: '60A5FA',
    hidecheckinout: 'true', hideguestpicker: 'true', hidesearchbar: 'true', hidecurrency: 'true', hidelanguage: 'true',
  });
  return `https://www.stay22.com/embed/gm?${params}`;
}
