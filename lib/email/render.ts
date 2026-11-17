// Correo de vuelos a buen precio: asunto, HTML y texto plano según el diseño aprobado el 17-11-2026.
// HTML de correo: tablas, estilos en línea y solo imágenes por URL (los programas de correo no admiten SVG ni scripts).
// Todo lo que viene de fuera (nombres, enlaces, textos) se escapa. Los precios son SIEMPRE los de las ofertas recibidas,
// redondeados hacia arriba igual que en la web: aquí no se calcula ni se inventa ningún precio.

import { getDestinationCountryName, getDestinationText } from "@/lib/destinations/localization";
import { slugFromMonth } from "@/lib/destinations/months";
import { translate, type Locale } from "@/lib/i18n/translations";
import { OWNER_DATA } from "@/lib/legal/owner";
import { findMonthlyOrigin, formatTripRange } from "@/lib/travelpayouts/monthly-shared";
import type { FlightPick } from "./picks";
import { flightEmailText } from "./texts";

export type FlightEmailInput = {
  locale: Locale;
  originCode: string;
  /** Meses del viaje (1–12), en el orden que se quiere enseñar. */
  months: readonly number[];
  /** Tope de precio elegido (solo se enseña como etiqueta si existe). */
  maxPrice?: number;
  picks: readonly FlightPick[];
  now: Date;
  /** Dirección base de la web, sin barra final (p. ej. https://destinauta.com). */
  siteUrl: string;
  /** Franja amarilla de aviso arriba (p. ej. «correo de prueba»). null = sin franja. */
  banner?: string | null;
  /** Texto del pie que explica por qué se recibe el correo. */
  reason: string;
};

export type RenderedEmail = { subject: string; html: string; text: string };

const DAY_MS = 86400000;
const ACCENT = "#2563eb";
const FONT = "Inter, Arial, Helvetica, sans-serif";

export const OWNER_PENDING = "[PENDIENTE: titular, NIF/CIF y domicilio]";

/** Identificación del titular del pie. `complete` es false mientras falte algún dato de lib/legal/owner.ts. */
export function ownerIdentification(): { complete: boolean; text: string } {
  const { name, taxId, address, email } = OWNER_DATA;
  const complete = Boolean(name && taxId && address && email);
  return { complete, text: complete ? `${name} · ${taxId} · ${address}` : OWNER_PENDING };
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Solo enlaces http(s); cualquier otra cosa (javascript:, data:…) se sustituye por «#». */
function safeUrl(value: string | null | undefined): string {
  if (!value) return "#";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "#";
  } catch {
    return "#";
  }
}

function money(locale: Locale, value: number): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function monthWord(locale: Locale, month: number, style: "long" | "short"): string {
  return new Intl.DateTimeFormat(locale, { month: style, timeZone: "UTC" }).format(new Date(Date.UTC(2027, month - 1, 15)));
}

function listOf(locale: Locale, items: string[]): string {
  return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(items);
}

function cityName(originCode: string): string {
  const label = findMonthlyOrigin(originCode)?.label ?? originCode;
  return label.replace(/\s*\([^)]*\)\s*$/, "");
}

function daysSince(seenAt: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - seenAt.getTime()) / DAY_MS));
}

function seenText(locale: Locale, days: number): string {
  if (days <= 0) return flightEmailText(locale, "seenToday");
  if (days === 1) return flightEmailText(locale, "seenOne");
  return flightEmailText(locale, "seenMany", { count: days });
}

function stopsText(locale: Locale, transfers: number | null): string {
  if (transfers === null) return "";
  if (transfers === 0) return translate(locale, "monthly.direct");
  return transfers === 1 ? translate(locale, "monthly.oneStop") : translate(locale, "monthly.stops", { count: transfers });
}

type Card = {
  name: string; country: string; image: string; price: string; details: string; seen: string;
  href: string; button: string; destinationHref: string;
};

function buildCards(input: FlightEmailInput): Card[] {
  const { locale, siteUrl } = input;
  return input.picks.map(({ offer, seenAt }) => {
    const text = getDestinationText(offer.profile, locale);
    const country = getDestinationCountryName(offer.profile, locale);
    const destinationHref = `${siteUrl}/?ficha=${encodeURIComponent(offer.profile.name)}`;
    const image = offer.profile.image.startsWith("/") ? `${siteUrl}${offer.profile.image}` : offer.profile.image;
    const details = [
      formatTripRange(offer.departureAt, offer.returnAt, locale),
      translate(locale, "monthly.nights", { count: offer.nights }),
      stopsText(locale, offer.transfers),
    ].filter(Boolean).join(" · ");
    // Sin enlace de oferta válido (o con un enlace que no es http/https), el botón lleva a la ficha del destino en la web.
    const offerHref = offer.offerUrl ? safeUrl(offer.offerUrl) : "#";
    const hasOffer = offerHref !== "#";
    return {
      name: text.name, country, image: safeUrl(image), price: money(locale, Math.ceil(offer.price)), details,
      seen: seenText(locale, daysSince(seenAt, input.now)),
      href: hasOffer ? offerHref : destinationHref,
      button: hasOffer ? flightEmailText(locale, "viewFlight") : translate(locale, "monthly.viewDestination"),
      destinationHref,
    };
  });
}

function subjectLine(input: FlightEmailInput): string {
  const highest = Math.max(...input.picks.map(({ offer }) => Math.ceil(offer.price)));
  // «por menos de X»: X es la decena siguiente al precio más alto, así que todos los precios son menores que X.
  const limit = (Math.floor(highest / 10) + 1) * 10;
  return flightEmailText(input.locale, "subject", {
    count: input.picks.length, origin: cityName(input.originCode), max: money(input.locale, limit),
  });
}

function chips(input: FlightEmailInput): string[] {
  const { locale } = input;
  const result = [findMonthlyOrigin(input.originCode)?.label ?? input.originCode];
  result.push(listOf(locale, input.months.map((month) => monthWord(locale, month, "short"))));
  if (input.maxPrice !== undefined) result.push(flightEmailText(locale, "chipUpTo", { max: money(locale, input.maxPrice) }));
  return result;
}

function moreLink(input: FlightEmailInput): { href: string; label: string } {
  const month = input.months[0];
  const slug = slugFromMonth(month);
  return {
    href: slug ? `${input.siteUrl}/viajes-baratos/${slug}` : input.siteUrl,
    label: flightEmailText(input.locale, "more", { month: monthWord(input.locale, month, "long") }),
  };
}

function cardHtml(card: Card): string {
  return `<tr><td style="padding:0 0 16px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e7e5e4;border-radius:14px;border-collapse:separate;overflow:hidden;">
<tr>
<td class="stack photo" width="190" valign="top" style="width:190px;background:#e7e5e4;"><img src="${escapeHtml(card.image)}" width="190" height="190" alt="${escapeHtml(`${card.name}, ${card.country}`)}" style="display:block;width:190px;height:190px;object-fit:cover;border:0;"></td>
<td class="stack" valign="top" style="padding:18px 20px;font-family:${FONT};">
<div style="font-size:20px;line-height:26px;font-weight:800;color:#1c1917;">${escapeHtml(card.name)}</div>
<div style="font-size:13px;line-height:18px;color:#57534e;padding-bottom:8px;">${escapeHtml(card.country)} · ${escapeHtml(card.details)}</div>
<div style="font-size:30px;line-height:36px;font-weight:800;color:#1c1917;letter-spacing:-0.02em;">${escapeHtml(card.price)}</div>
<div style="font-size:12px;line-height:18px;color:#57534e;padding-bottom:6px;">${escapeHtml(card.seen)}</div>
<a href="${escapeHtml(card.href)}" style="display:inline-block;background:${ACCENT};color:#ffffff;font-weight:600;font-size:14px;line-height:44px;padding:0 18px;border-radius:10px;text-decoration:none;">${escapeHtml(card.button)}</a>
</td>
</tr>
</table>
</td></tr>`;
}

export function renderFlightEmail(input: FlightEmailInput): RenderedEmail {
  const { locale, siteUrl } = input;
  const subject = subjectLine(input);
  const cards = buildCards(input);
  const city = cityName(input.originCode);
  const months = listOf(locale, input.months.map((month) => monthWord(locale, month, "long")));
  const intro = flightEmailText(locale, "intro", { months });
  const more = moreLink(input);
  const owner = ownerIdentification();
  const link = (href: string, label: string, strong = false) =>
    `<a href="${escapeHtml(safeUrl(href))}" style="display:inline-block;color:#1d4ed8;font-size:13px;line-height:20px;padding:10px 18px 10px 0;${strong ? "font-weight:600;" : ""}">${escapeHtml(label)}</a>`;

  const html = `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(subject)}</title>
<style>
@media only screen and (max-width:520px){
.wrap{padding:0 !important;}
.stack{display:block !important;width:100% !important;box-sizing:border-box !important;}
.photo img{width:100% !important;height:150px !important;}
}
</style>
</head>
<body style="margin:0;padding:0;background:#F7F2E8;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F7F2E8;">${escapeHtml(intro)}</div>
${input.banner ? `<div style="background:#fef3c7;color:#78350f;font-family:${FONT};font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;text-align:center;padding:12px 16px;">${escapeHtml(input.banner)}</div>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F7F2E8;">
<tr><td class="wrap" align="center" style="padding:24px 12px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #e7e5e4;border-radius:16px;border-collapse:separate;overflow:hidden;font-family:${FONT};color:#44403c;">
<tr><td style="background:${ACCENT};padding:22px 32px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td valign="middle" style="padding-right:14px;"><img src="${escapeHtml(siteUrl)}/email/logo-correo.png" width="40" height="40" alt="" style="display:block;border:0;"></td>
<td valign="middle" style="font-family:${FONT};"><div style="font-size:22px;line-height:26px;font-weight:800;color:#ffffff;letter-spacing:-0.01em;">Destinauta</div><div style="font-size:13px;line-height:18px;color:#dbeafe;">${escapeHtml(flightEmailText(locale, "tagline"))}</div></td>
</tr></table>
</td></tr>
<tr><td style="padding:32px 32px 8px 32px;">
<h1 style="margin:0 0 14px 0;font-size:26px;line-height:32px;font-weight:800;color:#1c1917;letter-spacing:-0.02em;">${escapeHtml(flightEmailText(locale, "heading", { origin: city }))}</h1>
<p style="margin:0 0 14px 0;font-size:16px;line-height:25px;color:#44403c;">${escapeHtml(intro)}</p>
<p style="margin:0 0 6px 0;">${chips(input).map((chip) => `<span style="display:inline-block;font-size:13px;line-height:18px;background:#eff6ff;color:#1e3a8a;border-radius:999px;padding:6px 12px;margin:0 8px 8px 0;">${escapeHtml(chip)}</span>`).join("")}</p>
<p style="margin:0;">${link(`${siteUrl}/`, flightEmailText(locale, "prefs"), true)}</p>
</td></tr>
<tr><td style="padding:8px 32px 0 32px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${cards.map(cardHtml).join("\n")}
</table>
</td></tr>
<tr><td style="padding:0 32px;"><p style="margin:0;font-size:12px;line-height:18px;color:#57534e;">${escapeHtml(flightEmailText(locale, "affiliate"))}</p></td></tr>
<tr><td style="padding:16px 32px 28px 32px;"><a href="${escapeHtml(safeUrl(more.href))}" style="display:block;box-sizing:border-box;text-align:center;border:2px solid ${ACCENT};color:#1d4ed8;font-weight:600;font-size:15px;line-height:44px;text-decoration:none;border-radius:12px;">${escapeHtml(more.label)}</a></td></tr>
<tr><td style="padding:0 32px;"><div style="background:#f5f5f4;border-radius:12px;padding:16px 18px;font-size:13px;line-height:20px;color:#44403c;"><strong style="color:#1c1917;">${escapeHtml(flightEmailText(locale, "disclaimerTitle"))}</strong> ${escapeHtml(flightEmailText(locale, "disclaimerBody"))}</div></td></tr>
<tr><td style="padding:24px 32px 28px 32px;">
<p style="margin:0 0 10px 0;font-size:12px;line-height:19px;color:#57534e;">${escapeHtml(input.reason)}</p>
<p style="margin:0 0 6px 0;">${link(`${siteUrl}/`, flightEmailText(locale, "unsubscribe"), true)}${link(`${siteUrl}/`, flightEmailText(locale, "prefs"))}${link(`${siteUrl}/privacidad`, flightEmailText(locale, "privacy"))}${link(`${siteUrl}/aviso-legal`, flightEmailText(locale, "legal"))}</p>
<p style="margin:0;font-size:12px;line-height:19px;color:#57534e;">Destinauta · ${owner.complete ? escapeHtml(owner.text) : `<span style="background:#fef08a;color:#1c1917;font-weight:600;padding:0 4px;border-radius:4px;">${escapeHtml(owner.text)}</span>`}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const lines = [
    ...(input.banner ? [input.banner.toUpperCase(), ""] : []),
    flightEmailText(locale, "heading", { origin: city }),
    "",
    intro,
    chips(input).join(" · "),
    "",
    ...cards.flatMap((card) => [
      `${card.name} (${card.country})`,
      `${flightEmailText(locale, "from")} ${card.price} · ${flightEmailText(locale, "roundTrip")}`,
      card.details,
      card.seen,
      `${card.button}: ${card.href}`,
      "",
    ]),
    flightEmailText(locale, "affiliate"),
    "",
    `${more.label}: ${more.href}`,
    "",
    `${flightEmailText(locale, "disclaimerTitle")} ${flightEmailText(locale, "disclaimerBody")}`,
    "",
    input.reason,
    `${flightEmailText(locale, "unsubscribe")}: ${siteUrl}/`,
    `${flightEmailText(locale, "prefs")}: ${siteUrl}/`,
    `${flightEmailText(locale, "privacy")}: ${siteUrl}/privacidad`,
    `${flightEmailText(locale, "legal")}: ${siteUrl}/aviso-legal`,
    `Destinauta · ${owner.text}`,
  ];

  return { subject, html, text: lines.join("\n") };
}
