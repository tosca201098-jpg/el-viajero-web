import { italyPassengerAirports } from '@/lib/travelpayouts/italy-airports';
import { ukAirportsForTerm, ukUnavailablePassengerCodes } from '@/lib/travelpayouts/uk-airports';
import { germanyAirportsForTerm, germanyCityAliases, germanyPassengerAirports, germanyUnavailablePassengerCodes } from '@/lib/travelpayouts/germany-airports';
import { isNetherlandsCountryTerm, netherlandsAirportsForTerm, netherlandsCityAliases, netherlandsPassengerAirports, netherlandsUnavailablePassengerCodes } from '@/lib/travelpayouts/netherlands-airports';
import { belgiumAirports, belgiumAirportsForTerm, belgiumCityAliases } from '@/lib/travelpayouts/belgium-airports';
import { switzerlandAirports, switzerlandAirportsForTerm, switzerlandCityAliases, switzerlandTouristPlacesForTerm } from '@/lib/travelpayouts/switzerland-airports';
import { austriaAirports, austriaAirportsForTerm, austriaCityAliases, austriaTouristPlacesForTerm } from '@/lib/travelpayouts/austria-airports';
import { czechiaAirports, czechiaAirportsForTerm, czechiaCityAliases, czechiaTouristPlacesForTerm } from '@/lib/travelpayouts/czechia-airports';
import { polandAirports, polandAirportsForTerm, polandCityAliases, polandTouristPlacesForTerm } from '@/lib/travelpayouts/poland-airports';
import { hungaryAirports, hungaryAirportsForTerm, hungaryCityAliases, hungaryTouristPlacesForTerm } from '@/lib/travelpayouts/hungary-airports';
import { slovakiaAirports, slovakiaAirportsForTerm, slovakiaCityAliases, slovakiaTouristPlacesForTerm } from '@/lib/travelpayouts/slovakia-airports';
import { croatiaAirports, croatiaAirportsForTerm, croatiaCityAliases, croatiaTouristPlacesForTerm } from '@/lib/travelpayouts/croatia-airports';

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
    places = [...places, ...germanyAirportsForTerm(term)].map(place => {
      if (isPlace(place) && place.type === 'airport' && place.country_code === 'DE') {
        const physical = germanyPassengerAirports.find(airport => airport.code === code(place.code, 3));
        if (physical && typeof place.name === 'string' && typeof place.city_name === 'string' && normalize(place.name) === normalize(place.city_name)) {
          return { ...place, name: physical.name };
        }
      }
      if (!isPlace(place) || place.type !== 'city' || place.country_code !== 'DE') return place;
      const aliases = germanyCityAliases[code(place.code, 3)] ?? [];
      return { ...place, index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...aliases] };
    });

    // Country queries cover this European catalog only, excluding Caribbean provider miscategorizations.
    places = (isNetherlandsCountryTerm(term) ? netherlandsAirportsForTerm(term) : [...places, ...netherlandsAirportsForTerm(term)]).map(place => {
      if (!isPlace(place) || place.country_code !== 'NL') return place;
      const physical = netherlandsPassengerAirports.find(airport => airport.code === code(place.code, 3));
      if (place.type === 'airport' && physical && typeof place.name === 'string' && typeof place.city_name === 'string' && normalize(place.name) === normalize(place.city_name)) return { ...place, name: physical.name };
      if (place.type !== 'city') return place;
      return { ...place, index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...(netherlandsCityAliases[code(place.code, 3)] ?? [])] };
    });

    places = [...places, ...belgiumAirportsForTerm(term)].map(place => {
      if (!isPlace(place) || place.country_code !== 'BE') return place;
      const physical = belgiumAirports.find(a => a.code === code(place.code, 3));
      if (place.type === 'airport' && physical) return { ...place, name: physical.name,
        index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...physical.index_strings],
        physicalCityName: physical.physicalCityName, scheduledPassengerService: physical.scheduledPassengerService, serviceNotice: physical.serviceNotice };
      if (place.type !== 'city') return place;
      return { ...place, index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...(belgiumCityAliases[code(place.code, 3)] ?? [])],
        ...(place.code === 'LGG' ? { scheduledPassengerService: false, serviceNotice: 'noScheduledFlights' } : {}),
        ...(place.code === 'ANR' ? { serviceNotice: 'antwerpTuiEnds' } : {}) };
    });

    // LUG is an airport identifier without confirmed scheduled passenger flights.
    // A Lugano tourist selection remains available separately with no airport code.
    places = [...places.filter(place => !(isPlace(place) && place.type === 'city' && place.country_code === 'CH' && place.code === 'LUG')),
      ...switzerlandAirportsForTerm(term), ...switzerlandTouristPlacesForTerm(term)].map(place => {
      if (!isPlace(place) || (place.country_code !== 'CH' && !(place.country_code === 'FR' && ['BSL', 'MLH'].includes(code(place.code, 3))))) return place;
      const placeCode = code(place.code, 3);
      const airport = switzerlandAirports.find(candidate => candidate.code === placeCode);
      if (place.type === 'airport' && airport) return { ...place, name: airport.name, country_code: airport.country_code,
        city_name: airport.city_name, city_code: airport.city_code, physicalCityName: airport.physicalCityName,
        scheduledPassengerService: airport.scheduledPassengerService, serviceNotice: airport.serviceNotice,
        index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...airport.index_strings] };
      if (place.type !== 'city') return place;
      return { ...place, index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...(switzerlandCityAliases[placeCode] ?? [])],
        ...(placeCode === 'BRN' || placeCode === 'ACH' || placeCode === 'SIR' ? { serviceNotice: 'limitedSeasonalFlights' } : {}) };
    });

    places = [...places, ...austriaAirportsForTerm(term), ...austriaTouristPlacesForTerm(term)].map(place => {
      if (!isPlace(place) || place.country_code !== 'AT') return place;
      const placeCode = code(place.code, 3);
      const airport = austriaAirports.find(candidate => candidate.code === placeCode);
      if (place.type === 'airport' && airport) return { ...place, name: airport.name,
        city_name: airport.city_name, city_code: airport.city_code, serviceNotice: airport.serviceNotice,
        index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...airport.index_strings] };
      if (place.type !== 'city') return place;
      return { ...place, index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...(austriaCityAliases[placeCode] ?? [])],
        ...(airport?.serviceNotice ? { serviceNotice: airport.serviceNotice } : {}) };
    });

    places = [...places, ...czechiaAirportsForTerm(term), ...czechiaTouristPlacesForTerm(term)].map(place => {
      if (!isPlace(place) || place.country_code !== 'CZ') return place;
      const placeCode = code(place.code, 3);
      const airport = czechiaAirports.find(candidate => candidate.code === placeCode);
      if (place.type === 'airport' && airport) return { ...place, name: airport.name,
        city_name: airport.city_name, city_code: airport.city_code, serviceNotice: 'serviceNotice' in airport ? airport.serviceNotice : undefined,
        index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...airport.index_strings] };
      if (place.type !== 'city') return place;
      return { ...place, index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...(czechiaCityAliases[placeCode] ?? [])],
        ...(airport && 'serviceNotice' in airport ? { serviceNotice: airport.serviceNotice } : {}) };
    });

    places = [...places, ...polandAirportsForTerm(term), ...polandTouristPlacesForTerm(term)].map(place => {
      if (!isPlace(place) || place.country_code !== 'PL') return place;
      const placeCode = code(place.code, 3);
      const airport = polandAirports.find(candidate => candidate.code === placeCode);
      if (place.type === 'airport' && airport) return { ...place, name: airport.name,
        city_name: airport.city_name, city_code: airport.city_code,
        serviceNotice: 'serviceNotice' in airport ? airport.serviceNotice : undefined,
        index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...airport.index_strings] };
      if (place.type !== 'city') return place;
      return { ...place, index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...(polandCityAliases[placeCode] ?? [])],
        ...(airport && 'serviceNotice' in airport ? { serviceNotice: airport.serviceNotice } : {}) };
    });

    places = [...places, ...hungaryAirportsForTerm(term), ...hungaryTouristPlacesForTerm(term)].map(place => {
      if (!isPlace(place) || place.country_code !== 'HU') return place;
      const placeCode = code(place.code, 3);
      const airport = hungaryAirports.find(candidate => candidate.code === placeCode);
      if (place.type === 'airport' && airport) return { ...place, name: airport.name,
        city_name: airport.city_name, city_code: airport.city_code,
        index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...airport.index_strings] };
      if (place.type !== 'city') return place;
      return { ...place, name: placeCode === 'BUD' ? 'Budapest' : place.name,
        index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...(hungaryCityAliases[placeCode] ?? [])] };
    });
    places = [...places, ...slovakiaAirportsForTerm(term), ...slovakiaTouristPlacesForTerm(term)].map(place => {
      if (!isPlace(place) || place.country_code !== 'SK') return place;
      const placeCode = code(place.code, 3);
      const airport = slovakiaAirports.find(candidate => candidate.code === placeCode);
      if (place.type === 'airport' && airport) return { ...place, name: airport.name,
        city_name: airport.city_name, city_code: airport.city_code,
        index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...airport.index_strings] };
      if (place.type !== 'city') return place;
      return { ...place, index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...(slovakiaCityAliases[placeCode] ?? [])] };
    });
    places = [...places, ...croatiaAirportsForTerm(term), ...croatiaTouristPlacesForTerm(term)].map(place => {
      if (!isPlace(place) || place.country_code !== 'HR') return place;
      const placeCode = code(place.code, 3);
      const airport = croatiaAirports.find(candidate => candidate.code === placeCode);
      if (place.type === 'airport' && airport) return { ...place, name: airport.name,
        city_name: airport.city_name, city_code: airport.city_code,
        index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...airport.index_strings] };
      if (place.type !== 'city') return place;
      return { ...place, index_strings: [...(Array.isArray(place.index_strings) ? place.index_strings : []), ...(croatiaCityAliases[placeCode] ?? [])] };
    });
    const displayNames = new Intl.DisplayNames(["es"], { type: "region" });
    const normalizedTerm = normalize(term);
    const seen = new Set<string>();
    const suggestions = places
      .filter(isPlace)
      .filter(place => !(place.country_code === 'GB' && ukUnavailablePassengerCodes.includes(code(place.code, 3))))
      .filter(place => !(place.country_code === 'DE' && germanyUnavailablePassengerCodes.includes(code(place.code, 3))))
      .filter(place => !(place.country_code === 'NL' && netherlandsUnavailablePassengerCodes.includes(code(place.code, 3))))
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
          ...(place.scheduledPassengerService === false ? { scheduledPassengerService: false } : {}),
          ...(typeof place.serviceNotice === 'string' ? { serviceNotice: place.serviceNotice } : {}),
          ...(typeof place.physicalCityName === 'string' ? { physicalCityName: place.physicalCityName } : {}),
        };
      });

    return Response.json({ suggestions }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ suggestions: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
