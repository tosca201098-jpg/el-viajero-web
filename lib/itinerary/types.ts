import type { Locale } from "@/lib/i18n/translations";

export type ItineraryActivity = {
  name: string;
  description: string;
  area: string;
};

export type ItineraryDay = {
  dayNumber: number;
  title: string;
  morning: ItineraryActivity[];
  afternoon: ItineraryActivity[];
  evening: ItineraryActivity[];
};

// Reusable when itineraries are eventually saved in Mi viaje.
export type Itinerary = {
  title: string;
  summary: string;
  days: ItineraryDay[];
  tips: string[];
};

export type ItineraryDestinationInput = {
  name: string;
  country: string;
  recommendations: string[];
  recommendedStay: string | null;
  bestMonths: number[];
  lowSeasonMonths: number[];
  highSeasonMonths: number[];
  seasonalityNote: string | null;
};

export type ItineraryRequest = {
  destination: ItineraryDestinationInput;
  days: number;
  locale: Locale;
  travelers?: number;
  departureDate?: string;
  returnDate?: string;
  budget?: { amount: number; type: "total" | "por_persona" };
  variation?: number;
};

/**
 * Free itinerary: only what the destination page already knows, ordered by day. It has no time slots, areas,
 * opening hours, prices or bookings because the catalogue does not hold them and nothing is invented.
 */
export type BasicGuideDay = { dayNumber: number; items: string[] };
export type BasicGuide = {
  name: string;
  summary: string;
  /** How many recommendations the destination page has, so the guide can say why it is shorter than the trip. */
  recommendationCount: number;
  days: BasicGuideDay[];
};
