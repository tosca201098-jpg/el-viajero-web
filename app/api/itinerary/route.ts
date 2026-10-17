import { buildItineraryResponseRequest, extractItinerary, validateItineraryRequest } from "@/lib/itinerary/server";

export const maxDuration = 60;

function upstreamFailureCategory(value: unknown): string {
  if (!value || typeof value !== "object" || !("error" in value)) return "unclassified";
  const error = value.error;
  if (!error || typeof error !== "object") return "unclassified";
  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  const type = "type" in error && typeof error.type === "string" ? error.type : "";
  if (code === "ip_not_authorized" || type === "ip_not_authorized") return "ip_not_authorized";
  if (code === "invalid_api_key") return "invalid_api_key";
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  if (/\bapi\.responses\.write\b/i.test(message)) return "missing_responses_write";
  if (/\b(?:api\.)?model\.request\b/i.test(message)) return "missing_model_request";
  if (/\bapi\.realtime\.write\b/i.test(message)) return "missing_realtime_write";
  if (/\bip\b.{0,80}(not authori[sz]ed|allowlist|permission)|\bip\b.{0,30}blocked/i.test(message)) return "ip_not_authorized";
  if (/incorrect api key|invalid api key/i.test(message)) return "invalid_api_key";
  if (/must be a member of an organization|not a member of (the )?(organization|project)/i.test(message)) return "organization_membership";
  if (/missing api key|did not provide an api key|didn't provide an api key/i.test(message)) return "missing_api_key";
  if (/(api key|key).{0,80}(read.only|permission|scope)|read.only.{0,80}(api key|key)/i.test(message)) return "key_permission";
  if (/model.{0,80}(access|permission|not available)/i.test(message)) return "model_access";
  if (/permission|not authorized for this (organization|project)/i.test(message)) return "access_denied";
  return "unclassified";
}

function credentialFormat(value: string): string {
  if (/^Bearer\s/i.test(value)) return "bearer_prefix_in_value";
  if (/^["']|["']$/.test(value)) return "quoted_value";
  if (value !== value.trim()) return "surrounding_whitespace";
  return "plain_value";
}

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

    const rawApiKey = process.env.OPENAI_API_KEY;
    const apiKey = rawApiKey?.trim();
    if (!apiKey) return Response.json({ error: "temporarily_unavailable" }, { status: 503 });

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildItineraryResponseRequest(validated)),
      signal: AbortSignal.timeout(55_000),
      cache: "no-store",
    });
    if (!response.ok) {
      const upstream: unknown = await response.json().catch(() => null);
      console.error("Itinerary upstream response", response.status,
        upstreamFailureCategory(upstream), credentialFormat(rawApiKey ?? ""));
      return Response.json({ error: "generation_failed" }, { status: 502 });
    }
    const data: unknown = await response.json();
    const itinerary = extractItinerary(data, validated.request.days);
    if (!itinerary) return Response.json({ error: "generation_failed" }, { status: 502 });
    return Response.json({ itinerary }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
