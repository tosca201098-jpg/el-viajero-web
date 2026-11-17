// Lectura (solo lectura) de quién tiene permiso de correo y de a quién se le ha enviado ya algo. Usa el cliente de servidor de
// Supabase: nunca desde el navegador. No lee correos electrónicos ni nombres: solo el identificador de la cuenta y sus respuestas.
// Nunca lanza errores: si la tabla no existe todavía o Supabase falla, devuelve ok = false y quien llama decide qué hacer.

import type { SupabaseClient } from "@supabase/supabase-js";
import { isRecord } from "@/lib/travelpayouts/places";
import { parseRecipient, type Recipient, type SendHistory } from "./select";

export const PREFERENCES_TABLE = "email_preferences";
export const SENDS_TABLE = "email_sends";

const PREFERENCE_COLUMNS = "user_id,airports,months,trip_types,trip_length,reach,flight_budget,frequency,locale,email_consent";
const PAGE_SIZE = 500;
const MAX_PAGES = 10;
const CHUNK = 100;

type Client = Pick<SupabaseClient, "from">;

/** Todas las cuentas con el permiso marcado (hasta PAGE_SIZE × MAX_PAGES filas). Las filas incompletas se descartan. */
export async function readConsentingRecipients(client: Client): Promise<{ ok: boolean; recipients: Recipient[] }> {
  const recipients: Recipient[] = [];
  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const { data, error } = await client.from(PREFERENCES_TABLE).select(PREFERENCE_COLUMNS)
        .eq("email_consent", true).order("user_id").range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (error || !Array.isArray(data)) return { ok: false, recipients: [] };
      for (const row of data) {
        const recipient = parseRecipient(row);
        if (recipient) recipients.push(recipient);
      }
      if (data.length < PAGE_SIZE) break;
    }
  } catch {
    return { ok: false, recipients: [] };
  }
  return { ok: true, recipients };
}

/** Último envío hecho y cuántos lleva cada cuenta (solo los envíos con estado «sent»). */
export async function readSendHistory(client: Client, userIds: readonly string[]): Promise<{ ok: boolean; history: Map<string, SendHistory> }> {
  const history = new Map<string, SendHistory>();
  try {
    for (let start = 0; start < userIds.length; start += CHUNK) {
      const chunk = userIds.slice(start, start + CHUNK);
      const { data, error } = await client.from(SENDS_TABLE).select("user_id,sent_at").eq("status", "sent").in("user_id", chunk);
      if (error || !Array.isArray(data)) return { ok: false, history: new Map() };
      for (const row of data) {
        if (!isRecord(row) || typeof row.user_id !== "string") continue;
        const sentAt = new Date(String(row.sent_at ?? ""));
        const previous = history.get(row.user_id) ?? { lastSentAt: null, count: 0 };
        const lastSentAt = Number.isNaN(sentAt.getTime()) ? previous.lastSentAt
          : previous.lastSentAt && previous.lastSentAt > sentAt ? previous.lastSentAt : sentAt;
        history.set(row.user_id, { lastSentAt, count: previous.count + 1 });
      }
    }
  } catch {
    return { ok: false, history: new Map() };
  }
  return { ok: true, history };
}
