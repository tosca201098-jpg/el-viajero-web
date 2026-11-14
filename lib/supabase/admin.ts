// Cliente de Supabase SOLO para el servidor (rutas /api). Usa la clave secreta, que se salta las reglas de
// acceso: nunca debe importarse desde un componente del navegador ni guardarse en una variable NEXT_PUBLIC_.
// Si falta la configuración devuelve null y quien lo llama sigue funcionando sin precios guardados.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let admin: SupabaseClient | undefined;

function projectOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    // Igual que el cliente normal: si se copió la URL de la API de datos, se quita /rest/v1.
    url.pathname = url.pathname.replace(/\/rest\/v1\/?$/, "");
    if (
      !["https:", "http:"].includes(url.protocol) ||
      url.username || url.password || url.search || url.hash ||
      url.pathname.replace(/\/$/, "") !== ""
    ) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  if (admin) return admin;
  const url = projectOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const key = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !key) return null;
  try {
    admin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    return admin;
  } catch {
    return null;
  }
}
