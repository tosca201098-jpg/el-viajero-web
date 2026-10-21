import { italyPassengerAirports } from '@/lib/travelpayouts/italy-airports';
import { ukAirportsForTerm, ukUnavailablePassengerCodes } from '@/lib/travelpayouts/uk-airports';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Place = Record<string, unknown>;

function isPlace(value: unknown): value is Place {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/\s+/g, " ");
}

function code(value: unknown, length: number) {
  const normalized = typeof value === "string" ? value.trim().toUpperCase() : "";
  return (length === 3 ? /^[A-Z]{3}$/ : /^[A-Z]{2}$/).test(normalized) ? normalized : "";
}

function matchTier(value: string, term: string) {
  const name = normalize(value);
  if (name === term) return 0;
  if (name.startsWith(term)) return 1;
  if (` ${name}`.includes(` ${term}`)) return 2;
  if (name.includes(term)) return 3;
  return 4; // Preserve the provider's fuzzy/translated suggestions as a fallback.
}

function relevance(place: Place, term: string) {
  // A physical/metropolitan code must beat an airport's associated city code.
  const ownCode = code(place.code, 3);
  if (ownCode && normalize(ownCode) === term) return place.type === "airport" ? -2 : -1;

  let score = matchTier(place.name as string, term) * 3;
  const aliases = Array.isArray(place.index_strings) ? place.index_strings : [];
  for (const alias of aliases) {
    if (typeof alias === "string") score = Math.min(score, matchTier(alias, term) * 3 + 1);
  }
  if (place.type === "airport") {
    if (typeof place.city_name === "string") {
      score = Math.min(score, matchTier(place.city_name, term) * 3 + 2);
    }
    const cityCode = code(place.city_code, 3);
    if (cityCode && normalize(cityCode) === term) score = Math.min(score, 2);
  }
  return score;
}

function weight(place: Place) {
  return typeof place.weight === "number" && Number.isFinite(place.weight) ? place.weight : 0;
}

export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get("term")?.trim().replace(/\s+/g, " ") ?? "";
  if (term.length < 2 || term.length > 100) {
    return Response.json({ suggestions: [] }, { headers: { "Cache-Control": "no-store" } });
  }

  const url = new URL("https://autocomplete.travelpayouts.com/places2");
  url.searchParams.set("term", term);
  url.searchParams.set("locale", "es");
  url.searchParams.append("types[]", "city");
  url.searchParams.append("types[]", "airport");

  try {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error("Places lookup failed");

    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) throw new Error("Invalid places response");

    let places: unknown[] = payload;

    // The combined autocomplete sometimes represents a physical airport only as a city.
    // Explicit IATA searches also use the verified physical-airport resource from this provider.
    const exactCode = code(term, 3);
    const airport = italyPassengerAirports.find(airport => airport.code === exactCode);
    if (airport) places = [...places, airport];
    const ukAirports = ukAirportsForTerm(term);
    places = [...places, ...ukAirports];

    const displayNames = new Intl.DisplayNames(["es"], { type: "region" });
    const normalizedTerm = normalize(term);
    const seen = new Set<string>();
    const suggestions = places
      .filter(isPlace)
      .filter(place => !(place.country_code === 'GB' && ukUnavailablePassengerCodes.includes(code(place.code, 3))))
      .filter((place) =>
        (place.type === "city" || place.type === "airport") &&
        typeof place.name === "string" && place.name.trim().length > 0
      )
      .sort((a, b) =>
        relevance(a, normalizedTerm) - relevance(b, normalizedTerm) ||
        Number(b.type === "city") - Number(a.type === "city") ||
        weight(b) - weight(a)
      )
      .filter((place) => {
        const countryCode = code(place.country_code, 2);
        const placeCode = code(place.code, 3);
        const key = `${countryCode || normalize(String(place.country_name ?? ""))}:${place.type}:${placeCode || `${place.type}:${normalize(place.name as string)}`}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      // London has six verified physical airports plus its city; keep all seven selectable.
      .slice(0, ukAirports.filter(airport => airport.city_code === 'LON').length === 6 ? 7 : 6)
      .map((place) => {
        const countryCode = code(place.country_code, 2);
        return {
          type: place.type as "city" | "airport",
          name: (place.name as string).trim(),
          country: /^[A-Z]{2}$/.test(countryCode)
            ? displayNames.of(countryCode) ?? countryCode
            : typeof place.country_name === "string" ? place.country_name : "",
          code: code(place.code, 3) || null,
          cityName: typeof place.city_name === "string" ? place.city_name : null,
          cityCode: code(place.city_code, 3) || null,
        };
      });

    return Response.json({ suggestions }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ suggestions: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
