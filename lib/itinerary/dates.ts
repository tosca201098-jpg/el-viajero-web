const DAY_MS = 86_400_000;

function utcDate(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  return date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day
    ? time : null;
}

// Counts the departure and return calendar days; a 20→22 October trip is 3 days.
export function calendarTripDays(departureDate: string, returnDate: string): number | null {
  const departure = utcDate(departureDate);
  const arrival = utcDate(returnDate);
  if (departure === null || arrival === null || arrival < departure) return null;
  return Math.floor((arrival - departure) / DAY_MS) + 1;
}

export function suggestedItineraryDays(recommendedStay?: string): number {
  const first = recommendedStay?.match(/\d+/)?.[0];
  return first ? Math.min(7, Math.max(1, Number(first))) : 3;
}
