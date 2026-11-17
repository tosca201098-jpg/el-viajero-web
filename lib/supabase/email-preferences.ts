import { getSupabaseClient } from "./client";
import {
  EMAIL_CONSENT_VERSION, hasRequiredForEmails, normalizeAnswers,
  type EmailPreferenceAnswers,
} from "@/lib/email-preferences/options";

/** Fila tal como está en la tabla public.email_preferences (una por cuenta). */
export type EmailPreferencesRow = {
  user_id: string;
  airports: string[];
  months: number[];
  trip_types: string[];
  trip_length: string | null;
  reach: string | null;
  flight_budget: string | null;
  frequency: string | null;
  locale: string;
  email_consent: boolean;
  consent_version: string | null;
  consent_given_at: string | null;
  consent_withdrawn_at: string | null;
  updated_at: string;
};

const columns = "user_id,airports,months,trip_types,trip_length,reach,flight_budget,frequency,locale,email_consent,consent_version,consent_given_at,consent_withdrawn_at,updated_at";

async function authenticatedClient() {
  const client = getSupabaseClient();
  const { data: { session }, error } = await client.auth.getSession();
  if (error) throw error;
  if (!session) throw new Error("Inicia sesión para acceder a tus preferencias.");
  return { client, userId: session.user.id };
}

/** Respuestas de la pantalla a partir de la fila guardada. */
export function rowToAnswers(row: EmailPreferencesRow | null): EmailPreferenceAnswers {
  if (!row) return normalizeAnswers(null);
  return normalizeAnswers({
    airports: row.airports, months: row.months, tripTypes: row.trip_types,
    tripLength: row.trip_length, reach: row.reach, flightBudget: row.flight_budget,
    frequency: row.frequency, consent: row.email_consent,
  });
}

/**
 * Datos que se envían a la base. Solo se copian los campos que la persona puede escribir:
 * la fecha del permiso y la de retirada las pone la propia base de datos.
 * El permiso solo se envía activo si hay aeropuerto y frecuencia (la base también lo exige).
 */
export function answersToPayload(userId: string, answers: EmailPreferenceAnswers, locale: string) {
  const clean = normalizeAnswers(answers);
  const consent = clean.consent && hasRequiredForEmails(clean);
  return {
    user_id: userId,
    airports: clean.airports,
    months: clean.months,
    trip_types: clean.tripTypes,
    trip_length: clean.tripLength || null,
    reach: clean.reach || null,
    flight_budget: clean.flightBudget || null,
    frequency: clean.frequency || null,
    locale,
    email_consent: consent,
    consent_version: consent ? EMAIL_CONSENT_VERSION : null,
  };
}

export async function getEmailPreferences(): Promise<EmailPreferencesRow | null> {
  const { client, userId } = await authenticatedClient();
  // Este filtro complementa RLS; la base de datos garantiza la propiedad por su cuenta.
  const { data, error } = await client.from("email_preferences")
    .select(columns)
    .eq("user_id", userId)
    .maybeSingle<EmailPreferencesRow>();
  if (error) throw error;
  return data ?? null;
}

export async function saveEmailPreferences(answers: EmailPreferenceAnswers, locale: string): Promise<EmailPreferencesRow> {
  const { client, userId } = await authenticatedClient();
  const { data, error } = await client.from("email_preferences")
    .upsert(answersToPayload(userId, answers, locale), { onConflict: "user_id" })
    .select(columns)
    .single<EmailPreferencesRow>();
  if (error) throw error;
  if (!data) throw new Error("No se han podido guardar tus preferencias.");
  return data;
}

export async function deleteEmailPreferences(): Promise<void> {
  const { client, userId } = await authenticatedClient();
  const { error } = await client.from("email_preferences").delete().eq("user_id", userId);
  if (error) throw error;
}
