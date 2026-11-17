// Envío con Resend por su API (una petición HTTPS, sin instalar nada). La clave la lee quien llama desde una variable
// de Vercel y NUNCA se escribe en el código, en los registros ni en las respuestas. Siempre va a UN solo destinatario.

export type SendEmailOptions = {
  apiKey: string;
  from: string;
  /** Una sola dirección (se envía como lista de uno). */
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult = { ok: true; id: string | null } | { ok: false; status: number };

type FetchLike = (input: string, init: {
  method: string; headers: Record<string, string>; body: string; signal: AbortSignal;
}) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

export const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail(options: SendEmailOptions, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<SendEmailResult> {
  try {
    const response = await fetchImpl(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${options.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: options.from,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        ...(options.headers ? { headers: options.headers } : {}),
        ...(options.tags ? { tags: options.tags } : {}),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return { ok: false, status: response.status };
    const payload = await response.json().catch(() => null) as { id?: unknown } | null;
    return { ok: true, id: typeof payload?.id === "string" ? payload.id : null };
  } catch {
    return { ok: false, status: 0 };
  }
}
