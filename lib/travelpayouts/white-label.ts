const iata = /^[A-Z]{3}$/;

function dateParts(value: string): { time: number; short: string } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return { time: date.getTime(), short: value.slice(8, 10) + value.slice(5, 7) };
}

/** Travelpayouts White Label format: ORGDDMMDESTDDMM[adults], economy class. */
export function whiteLabelFlightSearch(input: {
  origin: string; destination: string; departureDate: string; returnDate: string; travelers: number;
}, today = new Date()): string | null {
  const departure = dateParts(input.departureDate);
  const returning = dateParts(input.returnDate);
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  if (!iata.test(input.origin) || !iata.test(input.destination) || input.origin === input.destination ||
    !departure || !returning || departure.time < todayUtc || returning.time <= departure.time ||
    returning.time - todayUtc > 365 * 86400000 ||
    !Number.isInteger(input.travelers) || input.travelers < 1 || input.travelers > 9) return null;
  return `${input.origin}${departure.short}${input.destination}${returning.short}${input.travelers}`;
}

export function isWhiteLabelFlightSearch(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Z]{3}\d{4}[A-Z]{3}\d{4}[1-9]$/.test(value) &&
    value.slice(0, 3) !== value.slice(7, 10);
}
