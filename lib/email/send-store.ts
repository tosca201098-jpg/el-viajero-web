// Lo que el envío necesita de Supabase: reservar y anotar cada envío en `email_sends`, contar los de hoy y consultar el correo de
// la cuenta. Solo con el cliente de servidor (clave secreta). Nunca lanza errores: devuelve un resultado que quien llama interpreta.
// El correo de la cuenta se lee en el momento de enviar y NO se guarda en ninguna tabla ni se escribe en el registro.

import type { SupabaseClient } from "@supabase/supabase-js";
import { SENDS_TABLE } from "./recipients";
import type { ClaimResult, LookupResult } from "./sender";

type Client = Pick<SupabaseClient, "from" | "auth">;

const UNIQUE_VIOLATION = "23505";
const PROVIDER_ID_MAX = 100;

/** Reserva el envío de hoy. La base de datos solo admite una fila por cuenta y día: si ya existe, no se envía otra vez. */
export async function claimSend(client: Client, item: { userId: string; origin: string; months: readonly number[] }): Promise<ClaimResult> {
  try {
    const { data, error } = await client.from(SENDS_TABLE)
      .insert({ user_id: item.userId, kind: "flights", origin: item.origin, months: [...item.months], status: "claimed" })
      .select("id").single();
    if (error) return error.code === UNIQUE_VIOLATION ? { kind: "exists" } : { kind: "error" };
    const id = (data as { id?: unknown } | null)?.id;
    return typeof id === "number" ? { kind: "claimed", id } : { kind: "error" };
  } catch {
    return { kind: "error" };
  }
}

/** Anota el resultado: «sent» (Resend lo aceptó) o «failed» (no salió; se reintenta otro día). Solo cambia filas aún «claimed». */
export async function finishSend(
  client: Client, id: number, result: { sent: true; providerId: string | null } | { sent: false },
): Promise<boolean> {
  try {
    const values = result.sent
      ? { status: "sent", sent_at: new Date().toISOString(), provider_id: result.providerId && result.providerId.length <= PROVIDER_ID_MAX ? result.providerId : null }
      : { status: "failed" };
    const { error } = await client.from(SENDS_TABLE).update(values).eq("id", id).eq("status", "claimed");
    return !error;
  } catch {
    return false;
  }
}

/** Cuántos envíos (enviados o reservados) hay hoy (día UTC, el mismo de la tabla). null si no se pudo contar. */
export async function countSendsToday(client: Client, now: Date): Promise<number | null> {
  try {
    const { count, error } = await client.from(SENDS_TABLE).select("id", { count: "exact", head: true })
      .eq("send_day", now.toISOString().slice(0, 10)).in("status", ["sent", "claimed"]);
    return error || typeof count !== "number" ? null : count;
  } catch {
    return null;
  }
}

/** Correo de la cuenta y si está confirmado. Una cuenta sin confirmar no recibe nada. */
export async function lookupAccount(client: Client, userId: string): Promise<LookupResult> {
  try {
    const { data, error } = await client.auth.admin.getUserById(userId);
    if (error) return (error as { status?: number }).status === 404 ? { kind: "no_email" } : { kind: "error" };
    const user = data?.user;
    if (!user || typeof user.email !== "string" || !user.email) return { kind: "no_email" };
    return user.email_confirmed_at ? { kind: "ok", email: user.email } : { kind: "unverified" };
  } catch {
    return { kind: "error" };
  }
}
