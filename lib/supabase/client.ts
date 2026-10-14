import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabaseClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !key) {
    throw new Error("El acceso a cuentas todavía no está configurado. Inténtalo más tarde.");
  }

  let projectUrl: URL;
  try {
    projectUrl = new URL(url);
  } catch {
    throw new Error("El acceso a cuentas tiene una URL de Supabase no válida. Revisa la configuración.");
  }

  // The SDK appends /auth/v1 itself. A copied Data API URL must not
  // send authentication requests to /rest/v1/auth/v1.
  projectUrl.pathname = projectUrl.pathname.replace(/\/rest\/v1\/?$/, "");
  if (
    !["https:", "http:"].includes(projectUrl.protocol) ||
    projectUrl.username || projectUrl.password || projectUrl.search || projectUrl.hash ||
    projectUrl.pathname.replace(/\/$/, "") !== ""
  ) {
    throw new Error("El acceso a cuentas necesita la URL raíz del proyecto Supabase, sin rutas de API.");
  }

  client = createClient(projectUrl.origin, key);
  return client;
}
