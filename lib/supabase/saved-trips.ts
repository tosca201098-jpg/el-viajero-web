import { getSupabaseClient } from "./client";

export type TripService = "vuelo" | "hotel" | "ambos";

export type SavedTrip = {
  id: string;
  user_id: string;
  origin: string | null;
  destination: string;
  departure_date: string;
  return_date: string | null;
  travelers: number;
  service_type: TripService;
  created_at: string;
};

export type NewSavedTrip = {
  origin?: string | null;
  destination: string;
  departure_date: string;
  return_date?: string | null;
  travelers: number;
  service_type: TripService;
};

const tripColumns = "id,user_id,origin,destination,departure_date,return_date,travelers,service_type,created_at";

async function authenticatedClient() {
  const client = getSupabaseClient();
  const { data: { session }, error } = await client.auth.getSession();
  if (error) throw error;
  if (!session) throw new Error("Inicia sesión para acceder a tus viajes.");
  return { client, userId: session.user.id };
}

export async function listSavedTrips(): Promise<SavedTrip[]> {
  const { client, userId } = await authenticatedClient();
  // This filter complements RLS; the database enforces ownership independently.
  const { data, error } = await client.from("saved_trips")
    .select(tripColumns)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<SavedTrip[]>();
  if (error) throw error;
  return data ?? [];
}

export async function saveTrip(trip: NewSavedTrip): Promise<SavedTrip> {
  const { client, userId } = await authenticatedClient();
  // Copy only writable fields. Ownership always comes from the current session.
  const { data, error } = await client.from("saved_trips")
    .insert({
      user_id: userId,
      origin: trip.origin?.trim() || null,
      destination: trip.destination.trim(),
      departure_date: trip.departure_date,
      return_date: trip.return_date || null,
      travelers: trip.travelers,
      service_type: trip.service_type,
    })
    .select(tripColumns)
    .single<SavedTrip>();
  if (error) throw error;
  if (!data) throw new Error("No se ha podido guardar el viaje.");
  return data;
}

export async function deleteSavedTrip(id: string): Promise<void> {
  const { client, userId } = await authenticatedClient();
  const { data, error } = await client.from("saved_trips")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("id")
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  if (!data) throw new Error("El viaje ya no está disponible o no tienes permiso para eliminarlo.");
}
