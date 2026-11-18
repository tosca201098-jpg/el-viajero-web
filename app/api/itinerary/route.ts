import { admitAiRequest } from "@/lib/ai/admission";
import { requestAiItinerary } from "@/lib/itinerary/ai";
import { buildBasicGuide } from "@/lib/itinerary/basic";
import { validateItineraryRequest } from "@/lib/itinerary/server";

export const maxDuration = 60;

const headers = { "Cache-Control": "no-store" };

/** The key only counts when the owner has switched the feature on; a printable single token, never logged or returned. */
function aiKey(): string | null {
  if (process.env.AI_ENABLED !== "true" || process.env.AI_ITINERARY_ENABLED !== "true") return null;
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  return key && /^[\x21-\x7e]{20,300}$/.test(key) ? key : null;
}

/**
 * Everyone gets the free basic guide, built from the destination page without any provider. Registered visitors
 * (their own Supabase session in the Authorization header) get an itinerary written by Claude Haiku instead, within
 * their daily limit; if the AI is off, over the limit or fails, they get the free guide, so the button always works.
 */
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
    const guide = buildBasicGuide(validated.destination, validated.request.days, validated.request.locale);

    const key = aiKey();
    if (!key) return Response.json({ guide }, { headers });
    if (!request.headers.get("authorization")) return Response.json({ guide, aiOffer: true }, { headers });

    const denied = await admitAiRequest(request, "itinerary");
    if (denied) {
      if (denied.status === 401) return Response.json({ guide, aiOffer: true }, { headers });
      return Response.json({ guide, aiNotice: denied.status === 429 ? "limit" : "unavailable" }, { headers });
    }
    const itinerary = await requestAiItinerary(validated.request, key);
    if (!itinerary) return Response.json({ guide, aiNotice: "unavailable" }, { headers });
    return Response.json({ itinerary }, { headers });
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
}
