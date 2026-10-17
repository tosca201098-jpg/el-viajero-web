import { buildItineraryResponseRequest, extractItinerary, validateItineraryRequest } from "@/lib/itinerary/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > 8_000) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  try {
    const raw = await request.text();
    if (raw.length > 8_000) return Response.json({ error: "invalid_request" }, { status: 400 });
    const validated = validateItineraryRequest(JSON.parse(raw));
    if (!validated) return Response.json({ error: "invalid_request" }, { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return Response.json({ error: "temporarily_unavailable" }, { status: 503 });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildItineraryResponseRequest(validated)),
      signal: AbortSignal.timeout(55_000),
      cache: "no-store",
    });
    if (!response.ok) return Response.json({ error: "generation_failed" }, { status: 502 });
    const data: unknown = await response.json();
    const itinerary = extractItinerary(data, validated.request.days);
    if (!itinerary) return Response.json({ error: "generation_failed" }, { status: 502 });
    return Response.json({ itinerary }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
