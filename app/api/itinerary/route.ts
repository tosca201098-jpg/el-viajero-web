import { buildBasicGuide } from "@/lib/itinerary/basic";
import { validateItineraryRequest } from "@/lib/itinerary/server";

// Free itinerary: built from the destination page's own data. No provider is called and nothing is charged.
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > 8_000) {
    return Response.json({ error: "invalid_request" }, { status: 400, headers });
  }
  try {
    const raw = await request.text();
    if (raw.length > 8_000) return Response.json({ error: "invalid_request" }, { status: 400, headers });
    const validated = validateItineraryRequest(JSON.parse(raw));
    if (!validated) return Response.json({ error: "invalid_request" }, { status: 400, headers });
    const guide = buildBasicGuide(validated.destination, validated.request.days, validated.request.locale);
    return Response.json({ guide }, { headers });
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400, headers });
  }
}
