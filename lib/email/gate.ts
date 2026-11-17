// Los «candados» del envío real. Todos tienen que estar abiertos a la vez; si falta uno, no se envía nada y se dice cuál.
// Sin dependencias, para poder probarlo solo. El orden importa: primero lo que decide el propietario (interruptor y datos legales),
// después la configuración técnica.

import { readUnsubscribeSecret } from "./unsubscribe";

export type GateInput = {
  /** Interruptor del código (EMAIL_SERVICE_LIVE). */
  live: boolean;
  /** LEGAL_IS_DRAFT: el texto legal sigue siendo un borrador. */
  legalDraft: boolean;
  /** Nombre, NIF, domicilio y correo del titular rellenados. */
  legalComplete: boolean;
  resendKey: string | undefined | null;
  unsubscribeSecret: string | undefined | null;
};

export type GateBlock = "not_live" | "legal_incomplete" | "resend_not_configured" | "unsubscribe_not_configured";
export type GateResult = { ok: true; apiKey: string; unsubscribeSecret: string } | { ok: false; reason: GateBlock };

export function sendGate(input: GateInput): GateResult {
  if (input.live !== true) return { ok: false, reason: "not_live" };
  if (input.legalDraft !== false || input.legalComplete !== true) return { ok: false, reason: "legal_incomplete" };
  const apiKey = typeof input.resendKey === "string" ? input.resendKey.trim() : "";
  if (!apiKey) return { ok: false, reason: "resend_not_configured" };
  const unsubscribeSecret = readUnsubscribeSecret(input.unsubscribeSecret);
  if (!unsubscribeSecret) return { ok: false, reason: "unsubscribe_not_configured" };
  return { ok: true, apiKey, unsubscribeSecret };
}

/** Los bloqueos que dependen de una decisión del propietario responden 409; los de configuración técnica, 503. */
export function gateStatus(reason: GateBlock): number {
  return reason === "not_live" || reason === "legal_incomplete" ? 409 : 503;
}

/** Tope de correos pedido en la dirección (?limit=5): entero de 1 al máximo diario. Sin parámetro: el máximo. null = no válido. */
export function parseSendLimit(value: string | null, max: number): number | null {
  if (value === null || value === "") return max;
  if (!/^\d{1,3}$/.test(value)) return null;
  const limit = Number(value);
  return limit >= 1 && limit <= max ? limit : null;
}
