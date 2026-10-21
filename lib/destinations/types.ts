import type { Locale } from "@/lib/i18n/translations";

/** Persisted identifiers are explicit data, never regenerated from a translated name. */
export type DestinationId = string;
export type DestinationReference = { destinationId: DestinationId };

export type DestinationText = {
  name: string;
  description: string;
  recommendations: [string, string, string, string];
  recommendedStay: string;
  seasonalityNote?: string;
};

export type DestinationAirport = {
  /** A physical airport's IATA identifier, not a city/metropolitan search code. */
  iataCode: string;
};

export type DestinationProfile = DestinationText & {
  id: DestinationId;
  /** Stable, globally unique slug. It does not publish a route by itself. */
  slug: string;
  /** ISO 3166-1 alpha-2 country code; display names are localized separately. */
  countryCode: string;
  /** Legacy Spanish display value, retained for existing consumers and saved data. */
  country: string;
  airports: DestinationAirport[];
  /** Alternative arrival airports requiring a ground transfer; never used as this destination's identity or pricing codes. */
  accessAirports?: { iataCode: string; name: string; countryCode: string }[];
  /** City/metropolitan codes, populated only after verification with the provider. */
  metropolitanCodes: string[];
  /** Legacy Travelpayouts lookup identifiers. Keep these unchanged during phase 1. */
  iataCodes: string[];
  image: string;
  /** Optional focal point for the existing detail header; legacy images keep the default crop. */
  imagePosition?: string;
  bestMonths?: number[];
  lowSeasonMonths?: number[];
  highSeasonMonths?: number[];
  aliases?: string[];
  /** Legacy identifiers not accepted by Travelpayouts, never used for flight pricing. */
  auxiliaryCodes?: string[];
  imageSource?: string;
  imageCredit?: string;
  imageLicense?: string;
  imageLicenseUrl?: string;
  /** Per-field fallback: selected language, Spanish translation, legacy Spanish text. */
  translations?: Partial<Record<Locale, Partial<DestinationText>>>;
  /** Opt-in only after a real canonical page exists. No current page is opted in. */
  publication?: { status: "draft" | "published" };
};
