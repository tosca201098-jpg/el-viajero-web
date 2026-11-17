// Envío de los correos de vuelos ya decididos (ver select.ts). Este archivo NO sabe nada de Supabase ni de Resend: recibe las
// funciones que hacen cada cosa (reservar, buscar el correo de la cuenta, enviar, confirmar) para poder probarlo entero con datos
// simulados. Las reglas:
//  1. Antes de enviar se RESERVA el envío del día (una fila por cuenta y día): si ya existe, no se envía otra vez.
//  2. Solo se envía a cuentas con el correo CONFIRMADO (un correo sin confirmar podría ser de otra persona).
//  3. Cada correo va a UNA sola dirección, con su propio enlace de baja firmado y las cabeceras de baja con un clic.
//  4. Un fallo con una persona no para al resto; un límite de velocidad de Resend (429) o el tiempo agotado sí paran la tanda.
//  5. Si se cae justo después de enviar, el envío queda «reservado» y cuenta como enviado: es mejor no repetir que enviar dos veces.
//  6. Una reserva «fallida» no vuelve a intentarse el mismo día (solo hay una fila por cuenta y día); se reintenta al día siguiente.

import type { Locale } from "@/lib/i18n/translations";
import { isSingleEmailAddress } from "./guard";
import { renderFlightEmail } from "./render";
import type { SendEmailOptions, SendEmailResult } from "./resend";
import type { Planned } from "./select";
import { flightEmailText } from "./texts";
import { unsubscribeHeaders, unsubscribeUrl } from "./unsubscribe";

export type ClaimResult = { kind: "claimed"; id: number } | { kind: "exists" } | { kind: "error" };
export type LookupResult = { kind: "ok"; email: string } | { kind: "no_email" } | { kind: "unverified" } | { kind: "error" };

export type SendDeps = {
  /** Reserva el envío de hoy para esa cuenta. «exists» = ya hay uno hoy. */
  claim: (item: { userId: string; origin: string; months: readonly number[] }) => Promise<ClaimResult>;
  /** Anota el resultado de una reserva. Devuelve false si no se pudo anotar. */
  finish: (id: number, result: { sent: true; providerId: string | null } | { sent: false }) => Promise<boolean>;
  /** Correo de la cuenta y si está confirmado. */
  lookup: (userId: string) => Promise<LookupResult>;
  send: (options: SendEmailOptions) => Promise<SendEmailResult>;
  now: () => number;
  sleep: (ms: number) => Promise<void>;
};

export type SendConfig = {
  apiKey: string;
  from: string;
  siteUrl: string;
  unsubscribeSecret: string;
  /** Dirección de respuesta (Reply-To). Si no es una dirección sencilla, el correo sale sin ella. */
  replyTo: string;
  /** Máximo de correos que se intentan enviar en esta tanda. */
  limit: number;
  paceMs: number;
  timeBudgetMs: number;
  /** Fecha del plan (la misma con la que se eligieron los vuelos). */
  planNow: Date;
};

export type SendSummary = {
  /** Correos que se han intentado enviar a Resend. */
  attempted: number;
  sent: number;
  failed: number;
  /** Ya tenían un envío reservado hoy. */
  alreadyClaimed: number;
  noEmail: number;
  unverified: number;
  /** Fallos propios (no se pudo reservar o consultar la cuenta). */
  errors: number;
  /** Correos enviados cuya fila no se pudo marcar como enviada (siguen «reservados» y cuentan como enviados). */
  unrecorded: number;
  /** Por qué se cortó la tanda antes de terminar, si se cortó. */
  stopped: "limit" | "time" | "rate_limited" | null;
  /** Correos listos que no se llegaron a tratar (por el límite, el tiempo o la velocidad). */
  pending: number;
};

export async function sendPlanned(planned: readonly Planned[], config: SendConfig, deps: SendDeps): Promise<SendSummary> {
  const summary: SendSummary = {
    attempted: 0, sent: 0, failed: 0, alreadyClaimed: 0, noEmail: 0, unverified: 0, errors: 0, unrecorded: 0, stopped: null, pending: 0,
  };
  const ready = planned.filter((item) => item.status === "ready" && item.picks && item.origin && item.months);
  const startedAt = deps.now();
  let next = 0;

  while (next < ready.length) {
    if (summary.attempted >= config.limit) { summary.stopped = "limit"; break; }
    if (deps.now() - startedAt >= config.timeBudgetMs) { summary.stopped = "time"; break; }
    const item = ready[next];
    next += 1;
    const { recipient } = item;
    const origin = item.origin as string;
    const months = item.months as number[];

    const claim = await deps.claim({ userId: recipient.userId, origin, months });
    if (claim.kind === "exists") { summary.alreadyClaimed += 1; continue; }
    if (claim.kind === "error") { summary.errors += 1; continue; }

    const account = await deps.lookup(recipient.userId);
    if (account.kind !== "ok" || !isSingleEmailAddress(account.email)) {
      if (account.kind === "unverified") summary.unverified += 1;
      else if (account.kind === "error") summary.errors += 1;
      else summary.noEmail += 1;
      await deps.finish(claim.id, { sent: false });
      continue;
    }

    const url = unsubscribeUrl(config.siteUrl, recipient.userId, config.unsubscribeSecret, recipient.locale);
    const email = renderFlightEmail({
      locale: recipient.locale as Locale, originCode: origin, months, maxPrice: item.maxPrice, picks: item.picks ?? [],
      now: config.planNow, siteUrl: config.siteUrl, banner: null,
      reason: flightEmailText(recipient.locale as Locale, "reason"), unsubscribeUrl: url,
    });
    summary.attempted += 1;
    const result = await deps.send({
      apiKey: config.apiKey, from: config.from, to: account.email, subject: email.subject, html: email.html, text: email.text,
      ...(isSingleEmailAddress(config.replyTo) ? { replyTo: config.replyTo } : {}),
      headers: unsubscribeHeaders(url), tags: [{ name: "category", value: "flights" }],
    });

    if (result.ok) {
      summary.sent += 1;
      if (!(await deps.finish(claim.id, { sent: true, providerId: result.id }))) summary.unrecorded += 1;
    } else {
      summary.failed += 1;
      await deps.finish(claim.id, { sent: false });
      if (result.status === 429) { summary.stopped = "rate_limited"; break; }
    }
    if (next < ready.length) await deps.sleep(config.paceMs);
  }

  summary.pending = ready.length - next;
  return summary;
}
