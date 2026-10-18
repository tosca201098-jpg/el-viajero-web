import { isItinerary } from "@/lib/itinerary/schema";
import type { Itinerary } from "@/lib/itinerary/types";
import { isLocale, type Locale } from "@/lib/i18n/translations";
import { getSupabaseClient } from "./client";

export type SavedItinerary = {
  id: string;
  user_id: string;
  destination_name: string;
  country: string;
  locale: Locale;
  days_count: number;
  itinerary: Itinerary;
  created_at: string;
};

export type NewSavedItinerary = Pick<SavedItinerary,
  "destination_name" | "country" | "locale" | "itinerary">;

const columns = "id,user_id,destination_name,country,locale,days_count,itinerary,created_at";

async function authenticatedClient() {
  const client = getSupabaseClient();
  const { data: { session }, error } = await client.auth.getSession();
  if (error) throw error;
  if (!session) throw new Error("Sign in to save itineraries.");
  return { client, userId: session.user.id };
}

function validSavedItinerary(value: SavedItinerary): boolean {
  return isLocale(value.locale) && isItinerary(value.itinerary, value.days_count);
}

export async function listSavedItineraries(): Promise<SavedItinerary[]> {
  const { client, userId } = await authenticatedClient();
  const { data, error } = await client.from("saved_itineraries")
    .select(columns)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<SavedItinerary[]>();
  if (error) throw error;
  // A malformed stored payload should never be rendered as an itinerary.
  return (data ?? []).filter(validSavedItinerary);
}

export async function saveItinerary(input: NewSavedItinerary): Promise<SavedItinerary> {
  const { client, userId } = await authenticatedClient();
  const days = input.itinerary.days.length;
  if (!isLocale(input.locale) || !isItinerary(input.itinerary, days) ||
    !input.destination_name.trim() || !input.country.trim()) {
    throw new Error("Invalid itinerary");
  }
  const { data, error } = await client.from("saved_itineraries")
    .insert({
      user_id: userId,
      destination_name: input.destination_name.trim(),
      country: input.country.trim(),
      locale: input.locale,
      days_count: days,
      itinerary: input.itinerary,
    })
    .select(columns)
    .single<SavedItinerary>();
  if (error) throw error;
  if (!data || !validSavedItinerary(data)) throw new Error("Unable to save itinerary");
  return data;
}

export async function deleteSavedItinerary(id: string): Promise<void> {
  const { client, userId } = await authenticatedClient();
  const { data, error } = await client.from("saved_itineraries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  if (!data) throw new Error("Itinerary unavailable");
}
