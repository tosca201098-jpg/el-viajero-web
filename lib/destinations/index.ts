import { spainDestinations } from "./spain";

export type DestinationProfile = {
  name: string;
  country: string;
  iataCodes: string[];
  image: string;
  description: string;
  recommendations: [string, string, string, string];
  recommendedStay: string;
  aliases?: string[];
  imageSource?: string;
  imageCredit?: string;
  imageLicense?: string;
  imageLicenseUrl?: string;
};

export const destinationProfiles: DestinationProfile[] = [...spainDestinations];

export function normalizeDestinationName(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function findDestinationProfile({ iataCode, name }: {
  iataCode?: string | null;
  name?: string | null;
}): DestinationProfile | undefined {
  const code = iataCode?.trim().toUpperCase();
  if (code) {
    const byIata = destinationProfiles.find((destination) =>
      destination.iataCodes.some((iata) => iata.toUpperCase() === code));
    if (byIata) return byIata;
  }

  const normalized = name ? normalizeDestinationName(name) : "";
  if (!normalized) return undefined;
  return destinationProfiles.find((destination) =>
    [destination.name, ...(destination.aliases ?? [])]
      .some((candidate) => normalizeDestinationName(candidate) === normalized));
}
