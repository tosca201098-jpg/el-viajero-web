import { getDestinationById, type DestinationProfile } from "@/lib/destinations";
import type { Destination } from "@/lib/destinations/featured";
import { getDestinationCountryName, getDestinationText } from "@/lib/destinations/localization";
import { formatMonthList, formatMonthRanges } from "@/lib/destinations/seasonality";
import { translateText, type Locale, type TranslationKey, type Variables } from "@/lib/i18n/translations";
import type { PdfBanner, PdfBlock, PdfDocument, PdfFact } from "@/lib/pdf/text-pdf";
import type { BasicGuide, Itinerary } from "./types";

type Translate = (key: TranslationKey, variables?: Variables) => string;
const FOOTER = "destinauta.com";
const NOTE_LINES = 8;

/** What the PDF adds around the itinerary: only data that is already on the destination page or came from the visitor's own search. */
export type DocumentInfo = {
  country: string;
  /** «20 de noviembre de 2026 – 24 de noviembre de 2026 · Viajeros: 2», when the visitor searched with dates. */
  trip: string;
  /** Rows of the «datos de la ficha» panel. */
  facts: PdfFact[];
};
export type DocumentContext = { travelers?: number; departureDate?: string; returnDate?: string };

function formatDate(iso: string | undefined, locale: Locale): string | null {
  if (typeof iso !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  } catch {
    return null;
  }
}

/**
 * Real data only: the country, the recommended stay, the best and quiet months and the seasonality note exactly as the
 * destination page shows them (same texts, same languages), plus the dates and travelers the visitor searched with.
 * Nothing is estimated and no prices, hours or availability are added.
 */
export function documentInfo(
  source: DestinationProfile | Destination, locale: Locale, context: DocumentContext, t: Translate,
): DocumentInfo {
  const profile = "id" in source && typeof source.id === "string" ? getDestinationById(source.id) : undefined;
  const text = profile ? getDestinationText(profile, locale) : source;
  const country = profile ? getDestinationCountryName(profile, locale) : translateText(locale, source.country);
  const stay = text.recommendedStay ? translateText(locale, text.recommendedStay) : "";
  const note = text.seasonalityNote ? translateText(locale, text.seasonalityNote) : "";
  const facts: PdfFact[] = [];
  if (stay) facts.push({ label: t("destinations.recommendedStay"), value: stay });
  if (source.bestMonths?.length) facts.push({ label: t("destinations.bestTime"), value: formatMonthRanges(source.bestMonths, locale) });
  if (source.lowSeasonMonths?.length) facts.push({ label: t("destinations.quietSeason"), value: formatMonthList(source.lowSeasonMonths, locale) });
  if (source.bestMonths?.length) {
    if (note) facts.push({ value: note });
    facts.push({ value: t("destinations.seasonalityGuide"), small: true });
  }

  const from = formatDate(context.departureDate, locale), to = formatDate(context.returnDate, locale);
  const trip = [
    from && to ? `${from} – ${to}` : "",
    context.travelers ? `${t("search.travelers")}: ${context.travelers}` : "",
  ].filter(Boolean).join(" · ");
  return { country, trip, facts };
}

function banner(title: string, info?: DocumentInfo): PdfBanner {
  return { title, ...(info?.country ? { kicker: info.country } : {}), ...(info?.trip ? { subtitle: info.trip } : {}) };
}

/** The itinerary exactly as it is on screen (written by the AI or delivered by Sofía), ready to download. */
export function itineraryDocument(itinerary: Itinerary, t: Translate, info?: DocumentInfo): PdfDocument {
  const blocks: PdfBlock[] = [{ kind: "paragraph", text: itinerary.summary }];
  if (info?.facts.length) blocks.push({ kind: "panel", rows: info.facts });
  for (const day of itinerary.days) {
    blocks.push({ kind: "day", label: t("itinerary.day", { number: day.dayNumber }), title: day.title });
    for (const [key, activities] of [
      ["itinerary.morning", day.morning], ["itinerary.afternoon", day.afternoon], ["itinerary.evening", day.evening],
    ] as const) {
      blocks.push({ kind: "subheading", text: t(key) });
      for (const activity of activities) {
        blocks.push({ kind: "bullet", lead: activity.area ? `${activity.name} (${activity.area})` : activity.name, text: activity.description });
      }
    }
  }
  blocks.push({ kind: "heading", text: t("itinerary.tips") });
  for (const tip of itinerary.tips) blocks.push({ kind: "bullet", text: tip });
  blocks.push({ kind: "notes", title: t("itinerary.pdfNotes"), lines: NOTE_LINES });
  return { title: itinerary.title, banner: banner(itinerary.title, info), blocks, footer: FOOTER };
}

/** The free basic guide exactly as it is on screen, including its notes. */
export function basicGuideDocument(guide: BasicGuide, requestedDays: number, t: Translate, info?: DocumentInfo): PdfDocument {
  const title = t("itinerary.basicTitle", { destination: guide.name });
  const blocks: PdfBlock[] = [{ kind: "paragraph", text: guide.summary }];
  if (info?.facts.length) blocks.push({ kind: "panel", rows: info.facts });
  for (const day of guide.days) {
    blocks.push({ kind: "day", label: t("itinerary.day", { number: day.dayNumber }) });
    for (const item of day.items) blocks.push({ kind: "bullet", text: item });
  }
  if (guide.days.length < requestedDays) {
    const days = guide.days.length === 1 ? t("itinerary.oneDay") : t("itinerary.days", { count: guide.days.length });
    blocks.push({ kind: "note", text: t("itinerary.basicShort", { days }) });
  }
  blocks.push({ kind: "note", text: t("itinerary.basicNote") });
  blocks.push({ kind: "notes", title: t("itinerary.pdfNotes"), lines: NOTE_LINES });
  return { title, banner: banner(title, info), blocks, footer: FOOTER };
}

/** «destinauta-oslo.pdf»: plain letters and digits only, so every phone, tablet and computer accepts the name. */
export function documentFileName(destinationName: string): string {
  const slug = destinationName.replace(/[łŁ]/g, "l").replace(/[đĐ]/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/g, "");
  return `destinauta-${slug || "itinerario"}.pdf`;
}
