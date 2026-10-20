import { findDestinationProfile } from '@/lib/destinations';

export type City = { name: string; code: string };
export type RecordValue = Record<string, unknown>;

export function isRecord(value: unknown): value is RecordValue {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('es');
}

export function matchingDestinationProfile(city: string, country?: string) {
  const profile = findDestinationProfile({ name: city });
  if (!profile || !country) return profile;
  const countryCode = profile.countryCode.toLowerCase();
  return [normalize(profile.country), countryCode].includes(normalize(country)) ? profile : undefined;
}

export async function resolveCity(input: string): Promise<City | null> {
  const [cityInput, countryInput] = input.split(',').map((part) => part.trim());
  const destinationProfile = matchingDestinationProfile(cityInput, countryInput);
  const profileCountryCode = destinationProfile?.countryCode ?? null;
  const isProfileAlias = destinationProfile && normalize(cityInput) !== normalize(destinationProfile.name);
  const terms = Array.from(new Set(isProfileAlias
    ? [...destinationProfile.iataCodes, cityInput, ...(destinationProfile.aliases ?? [])]
    : [cityInput, ...(destinationProfile?.iataCodes ?? []), ...(destinationProfile?.aliases ?? [])]));
  let nameMatch: City | null = null;

  for (const term of terms) {
    const url = new URL('https://autocomplete.travelpayouts.com/places2');
    url.searchParams.set('term', term);
    url.searchParams.set('locale', 'es');
    url.searchParams.set('types[]', 'city');

    const response = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('City lookup failed');
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error('Invalid city lookup response');

    const cities = payload.filter(isRecord).filter((place) =>
      place.type === 'city' && typeof place.name === 'string' &&
      typeof place.code === 'string' && /^[A-Z]{3}$/.test(place.code) &&
      (!countryInput ||
        (typeof place.country_name === 'string' && normalize(place.country_name) === normalize(countryInput)) ||
        (typeof place.country_code === 'string' && normalize(place.country_code) === normalize(countryInput)))
    );

    const byIata = destinationProfile && cities.find((place) =>
      place.country_code === profileCountryCode && destinationProfile.iataCodes.includes(place.code as string));
    if (byIata) return { name: byIata.name as string, code: byIata.code as string };

    if (!nameMatch && term === cityInput) {
      const normalizedInput = normalize(cityInput);
      const match = cities.filter((place) => {
        const normalizedName = normalize(place.name as string);
        return normalizedName === normalizedInput ||
          ` ${normalizedName} `.includes(` ${normalizedInput} `) ||
          (place.code as string).toLowerCase() === cityInput.toLowerCase() ||
          (Array.isArray(place.index_strings) && place.index_strings.some(
            (alias: unknown) => typeof alias === 'string' && normalize(alias) === normalizedInput));
      }).sort((a, b) =>
        (typeof b.weight === 'number' ? b.weight : 0) -
        (typeof a.weight === 'number' ? a.weight : 0))[0];
      if (match) {
        nameMatch = { name: match.name as string, code: match.code as string };
        if (destinationProfile && match.country_code === profileCountryCode) return nameMatch;
      }
    }
    if (!destinationProfile) return nameMatch;
  }

  return nameMatch;
}

export function offerUrl(value: unknown) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value, 'https://www.aviasales.com');
    return url.protocol === 'https:' && !url.username && !url.password &&
      (url.hostname === 'www.aviasales.com' || url.hostname === 'aviasales.com') &&
      (url.pathname.startsWith('/search/') || /^\/[A-Z]{3}\d{4}[A-Z]{3}\d{1,5}$/.test(url.pathname))
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
