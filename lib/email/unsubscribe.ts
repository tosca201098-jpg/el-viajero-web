// Baja con un clic: un enlace firmado (HMAC-SHA256) que identifica a la cuenta sin pedirle que inicie sesión.
// El enlace solo lleva el identificador de la cuenta (un UUID, nunca el correo) y la firma. La firma se calcula con una clave
// secreta del servidor (variable de Vercel EMAIL_UNSUBSCRIBE_SECRET, que escribe el propietario): sin ella nadie puede
// fabricar un enlace de baja de otra persona. Los enlaces no caducan, porque un correo antiguo debe poder darse de baja siempre.

import { createHmac, timingSafeEqual } from "node:crypto";

export const UNSUBSCRIBE_PATH = "/api/email/unsubscribe";

/** Longitud mínima de la clave secreta: una clave corta o vacía se trata como «no configurada». */
export const MIN_SECRET_LENGTH = 32;

const USER_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const TOKEN = /^[A-Za-z0-9_-]{43}$/;

/** La clave secreta de la variable de Vercel, o null si falta o es demasiado corta. */
export function readUnsubscribeSecret(value: string | undefined | null): string | null {
  const secret = typeof value === "string" ? value.trim() : "";
  return secret.length >= MIN_SECRET_LENGTH ? secret : null;
}

/** Identificador de cuenta en minúsculas si tiene forma de UUID; si no, null. */
export function normalizeUserId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const userId = value.trim().toLowerCase();
  return USER_ID.test(userId) ? userId : null;
}

function signature(userId: string, secret: string): string {
  return createHmac("sha256", secret).update(`unsubscribe:v1:${userId}`).digest("base64url");
}

/** Firma de baja de una cuenta (43 caracteres, seguros para ir en una dirección web). */
export function signUnsubscribe(userId: string, secret: string): string {
  const id = normalizeUserId(userId);
  if (!id) throw new Error("invalid user id");
  return signature(id, secret);
}

/** true solo si la firma corresponde exactamente a esa cuenta y a esa clave. Nunca lanza errores con datos raros. */
export function verifyUnsubscribe(userId: unknown, token: unknown, secret: string | null): boolean {
  const id = normalizeUserId(userId);
  if (!id || !secret || typeof token !== "string" || !TOKEN.test(token)) return false;
  const expected = Buffer.from(signature(id, secret));
  const received = Buffer.from(token);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

/** Dirección completa del enlace de baja que va en el correo (sin correo electrónico ni otros datos personales). */
export function unsubscribeUrl(siteUrl: string, userId: string, secret: string, locale: string): string {
  const id = normalizeUserId(userId);
  if (!id) throw new Error("invalid user id");
  const query = new URLSearchParams({ u: id, t: signature(id, secret), l: locale });
  return `${siteUrl.replace(/\/+$/, "")}${UNSUBSCRIBE_PATH}?${query.toString()}`;
}

/** Cabeceras de «baja con un clic» (RFC 8058): el programa de correo muestra su propio botón «Cancelar suscripción». */
export function unsubscribeHeaders(url: string): Record<string, string> {
  return { "List-Unsubscribe": `<${url}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" };
}
