/**
 * Short, factual summaries handed back to Sofía after a search, so she can say the same real
 * prices the screen shows. Nothing here is estimated: hotel prices are never produced, and the
 * only arithmetic is "the traveller's own budget minus the real flight price".
 */
export type VoiceBudget = { amount: number; type: 'total' | 'por_persona' };

export type VoiceOfferInput = {
  price: number;
  departureAt?: string | null;
  returnAt?: string | null;
  airline?: string | null;
  transfers?: number | null;
};

export type VoiceFlightSummaryOffer = {
  pricePerPerson: number;
  totalForAllTravellers: number;
  airline: string | null;
  stops: number | null;
  departureDate: string | null;
  returnDate: string | null;
};

export type VoiceTripSummary = {
  kind: 'flights';
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  nights: number;
  travellers: number;
  currency: 'EUR';
  priceBasis: 'per_person_round_trip_recent_prices';
  offersFound: number;
  offers: VoiceFlightSummaryOffer[];
  flightBudget?: { amount: number; type: VoiceBudget['type']; offersWithinBudget: number };
  /** True when the search found no recent price at all. It never means that there are no flights. */
  noRecentPrices?: true;
  /** Set when the offers come from the days around the asked ones: each offer then carries its own real dates. */
  offersFromNearbyDays?: number;
  /** True when the provider's live list for these exact days is open on the person's screen (Sofía cannot read it). */
  liveFlightsOnScreen?: true;
  combinedBudget?: {
    total: number;
    leftForHotelAfterCheapestFlight: number | null;
    leftForHotelPerNight: number | null;
    flightAloneExceedsBudget: boolean;
  };
  note: string;
};

export type VoiceTripSummaryInput = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  travellers: number;
  offers: VoiceOfferInput[];
  /** Budget already applied to the flight search itself. */
  flightBudget?: VoiceBudget;
  /** Budget meant for flight + hotel together: only used for subtraction, never as a flight filter. */
  combinedBudget?: VoiceBudget;
  /** The exact days had no recent price, so the offers come from up to this many days around them. */
  nearbyDays?: number;
  /** The live list of flights for these exact days has just been opened on the person's screen. */
  liveFlightsOnScreen?: boolean;
};

const MAX_OFFERS = 3;

// The price list only holds prices that travellers' searches found recently. A route or date without any entry is common
// (Rome, for instance) and says nothing about whether flights exist, so Sofía must never turn it into «no flights».
const NO_FLIGHTS_WARNING = 'This is NOT the same as having no flights: flights may well exist, the list simply has no price saved. '
  + 'Never say that there are no flights, that none are available, that they are sold out or that the route does not exist. ';
const noPriceNote = (budgeted: boolean, nearbyDays?: number) => budgeted
  ? 'No recent price within the traveller\'s budget was found for this search. ' + NO_FLIGHTS_WARNING
    + 'Say only that you found no recent price within that budget, and offer a higher budget or other dates. Never guess a price.'
  : 'No recent price is saved for these dates' + (nearbyDays ? ' or for the days around them (' + nearbyDays + ' days each side)' : '') + '. '
    + NO_FLIGHTS_WARNING + 'Say only that you have no recent price saved for those dates, and offer to try other dates or another '
    + 'departure city. Never guess a price.';
// The live list is the provider's own search for the exact days, drawn in the card. Its prices are current and Sofía cannot read them.
const liveNote = (offers: number) => 'The live list of flights for these exact dates is now open on the person\'s screen, with the current '
  + 'prices, which you cannot read: say that you have opened it and ask them to look at the screen for the real prices and options. '
  + (offers > 0
    ? 'The prices in this summary are only recent prices saved earlier and may differ: if you mention one, call it a recent price '
      + 'and say that the screen has the current ones. '
    : 'You have no saved price of your own for these dates: do not guess any. ')
  + 'Never say that there are no flights.';
const nearbyNote = (days: number) => 'No recent price is saved for the exact dates the person asked for. The offers below are the real '
  + 'prices found for nearby days (up to ' + days + ' days around them) and every offer has its own departureDate and returnDate: '
  + 'always say those real dates and never present them as the dates the person asked for. Never say that there are no flights.';
const cents = (value: number) => Math.round(value * 100) / 100;
const dateOnly = (value: unknown) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null;

function nightsBetween(from: string, to: string): number {
  const days = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
  return Number.isFinite(days) && days > 0 ? days : 0;
}

function totalOf(budget: VoiceBudget, travellers: number): number {
  return cents(budget.type === 'total' ? budget.amount : budget.amount * travellers);
}

export function buildVoiceTripSummary(input: VoiceTripSummaryInput): VoiceTripSummary {
  const travellers = input.travellers;
  const offers = input.offers.filter(o => typeof o.price === 'number' && Number.isFinite(o.price) && o.price > 0)
    .sort((a, b) => a.price - b.price);
  const nights = nightsBetween(input.departureDate, input.returnDate);

  const summary: VoiceTripSummary = {
    kind: 'flights', origin: input.origin, destination: input.destination,
    departureDate: input.departureDate, returnDate: input.returnDate, nights, travellers,
    currency: 'EUR', priceBasis: 'per_person_round_trip_recent_prices',
    offersFound: offers.length,
    offers: offers.slice(0, MAX_OFFERS).map(o => ({
      pricePerPerson: cents(o.price), totalForAllTravellers: cents(o.price * travellers),
      airline: typeof o.airline === 'string' && o.airline.trim() ? o.airline.trim() : null,
      stops: typeof o.transfers === 'number' && Number.isFinite(o.transfers) ? o.transfers : null,
      departureDate: dateOnly(o.departureAt), returnDate: dateOnly(o.returnAt),
    })),
    note: 'Flight prices are recent prices found by the search, per person, round trip, in euros: they are '
      + 'indicative and not a booking guarantee. Hotel prices and availability are NOT known: never state them. '
      + 'You may only say how much of the traveller\'s own budget is left after the real flight price.',
  };

  const nearbyDays = typeof input.nearbyDays === 'number' && input.nearbyDays > 0 ? Math.floor(input.nearbyDays) : 0;
  if (input.liveFlightsOnScreen) {
    summary.liveFlightsOnScreen = true;
    if (offers.length === 0) summary.noRecentPrices = true;
    summary.note += ' ' + liveNote(offers.length);
  } else if (offers.length === 0) {
    summary.noRecentPrices = true;
    summary.note += ' ' + noPriceNote(!!input.flightBudget, nearbyDays || undefined);
  } else if (nearbyDays) {
    summary.offersFromNearbyDays = nearbyDays;
    summary.note += ' ' + nearbyNote(nearbyDays);
  }

  if (input.flightBudget) {
    const perPersonLimit = input.flightBudget.type === 'total'
      ? input.flightBudget.amount / travellers : input.flightBudget.amount;
    summary.flightBudget = { amount: input.flightBudget.amount, type: input.flightBudget.type,
      offersWithinBudget: offers.filter(o => o.price <= perPersonLimit).length };
  }

  if (input.combinedBudget) {
    const total = totalOf(input.combinedBudget, travellers);
    const cheapest = offers[0];
    const flightTotal = cheapest ? cents(cheapest.price * travellers) : null;
    const left = flightTotal === null ? null : cents(total - flightTotal);
    summary.combinedBudget = {
      total,
      leftForHotelAfterCheapestFlight: left !== null && left > 0 ? left : left === null ? null : 0,
      leftForHotelPerNight: left !== null && left > 0 && nights > 0 ? cents(left / nights) : null,
      flightAloneExceedsBudget: left !== null && left <= 0,
    };
  }
  return summary;
}

/* ------------------------------------------------------------------ discover */

export type VoiceDiscoverInput = {
  origin: string;
  departureDate: string;
  returnDate: string;
  travellers: number;
  budget: VoiceBudget;
  results: { destination: { code?: string; name: string; country: string; recommendedStay?: string }; offer: VoiceOfferInput }[];
};

export type VoiceDiscoverSummary = {
  kind: 'discover';
  origin: string;
  departureDate: string;
  returnDate: string;
  nights: number;
  travellers: number;
  currency: 'EUR';
  priceBasis: 'per_person_round_trip_recent_prices';
  budget: VoiceBudget;
  destinationsFound: number;
  destinations: { name: string; country: string; recommendedStay: string | null;
    pricePerPerson: number; totalForAllTravellers: number; stops: number | null }[];
  note: string;
};

const MAX_DISCOVER = 6;

export function buildVoiceDiscoverSummary(input: VoiceDiscoverInput): VoiceDiscoverSummary {
  const rows = input.results
    .filter(r => r && r.destination && typeof r.offer?.price === 'number' && Number.isFinite(r.offer.price) && r.offer.price > 0)
    .sort((a, b) => a.offer.price - b.offer.price);
  return {
    kind: 'discover', origin: input.origin, departureDate: input.departureDate, returnDate: input.returnDate,
    nights: nightsBetween(input.departureDate, input.returnDate), travellers: input.travellers,
    currency: 'EUR', priceBasis: 'per_person_round_trip_recent_prices', budget: input.budget,
    destinationsFound: rows.length,
    destinations: rows.slice(0, MAX_DISCOVER).map(r => ({
      name: r.destination.name, country: r.destination.country,
      recommendedStay: r.destination.recommendedStay || null,
      pricePerPerson: cents(r.offer.price), totalForAllTravellers: cents(r.offer.price * input.travellers),
      stops: typeof r.offer.transfers === 'number' && Number.isFinite(r.offer.transfers) ? r.offer.transfers : null,
    })),
    note: 'Flight prices are recent prices found by the search for these exact dates, per person, round trip, in '
      + 'euros: indicative, not a booking guarantee. Only destinations with a real price within the budget appear. '
      + 'Hotel prices and availability are NOT known: never state them. The cards are also on screen.',
  };
}
