export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Place = Record<string, unknown>;

function isPlace(value: unknown): value is Place {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function GET(request: Request) {
  const term = new URL(request.url).searchParams.get("term")?.trim() ?? "";
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

    const displayNames = new Intl.DisplayNames(["es"], { type: "region" });
    const seen = new Set<string>();
    const suggestions = payload
      .filter(isPlace)
      .filter((place) =>
        (place.type === "city" || place.type === "airport") &&
        typeof place.name === "string" && place.name.trim().length > 0
      )
      .sort((a, b) =>
        Number(b.type === "city") - Number(a.type === "city") ||
        (typeof b.weight === "number" ? b.weight : 0) -
          (typeof a.weight === "number" ? a.weight : 0)
      )
      .filter((place) => {
        const countryCode = typeof place.country_code === "string" ? place.country_code : "";
        const code = typeof place.code === "string" ? place.code : "";
        const key = `${countryCode}:${code || `${place.type}:${String(place.name).toLocaleLowerCase("es")}`}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 6)
      .map((place) => {
        const countryCode = typeof place.country_code === "string" ? place.country_code : "";
        return {
          type: place.type as "city" | "airport",
          name: (place.name as string).trim(),
          country: /^[A-Z]{2}$/.test(countryCode)
            ? displayNames.of(countryCode) ?? countryCode
            : typeof place.country_name === "string" ? place.country_name : "",
          code: typeof place.code === "string" && /^[A-Z]{3}$/.test(place.code) ? place.code : null,
          cityName: typeof place.city_name === "string" ? place.city_name : null,
          cityCode: typeof place.city_code === "string" ? place.city_code : null,
        };
      });

    return Response.json({ suggestions }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ suggestions: [] }, { headers: { "Cache-Control": "no-store" } });
  }
}
