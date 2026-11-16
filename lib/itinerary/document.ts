import type { TranslationKey, Variables } from "@/lib/i18n/translations";
import type { PdfBlock, PdfDocument } from "@/lib/pdf/text-pdf";
import type { BasicGuide, Itinerary } from "./types";

type Translate = (key: TranslationKey, variables?: Variables) => string;
const FOOTER = "destinauta.com";

/** The itinerary exactly as it is on screen (written by the AI or delivered by Sofía), ready to download. */
export function itineraryDocument(itinerary: Itinerary, t: Translate): PdfDocument {
  const blocks: PdfBlock[] = [
    { kind: "title", text: itinerary.title },
    { kind: "paragraph", text: itinerary.summary },
  ];
  for (const day of itinerary.days) {
    blocks.push({ kind: "heading", text: `${t("itinerary.day", { number: day.dayNumber })} — ${day.title}` });
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
  return { title: itinerary.title, blocks, footer: FOOTER };
}

/** The free basic guide exactly as it is on screen, including its notes. */
export function basicGuideDocument(guide: BasicGuide, requestedDays: number, t: Translate): PdfDocument {
  const title = t("itinerary.basicTitle", { destination: guide.name });
  const blocks: PdfBlock[] = [{ kind: "title", text: title }, { kind: "paragraph", text: guide.summary }];
  for (const day of guide.days) {
    blocks.push({ kind: "heading", text: t("itinerary.day", { number: day.dayNumber }) });
    for (const item of day.items) blocks.push({ kind: "bullet", text: item });
  }
  if (guide.days.length < requestedDays) {
    const days = guide.days.length === 1 ? t("itinerary.oneDay") : t("itinerary.days", { count: guide.days.length });
    blocks.push({ kind: "note", text: t("itinerary.basicShort", { days }) });
  }
  blocks.push({ kind: "note", text: t("itinerary.basicNote") });
  return { title, blocks, footer: FOOTER };
}

/** «destinauta-oslo.pdf»: plain letters and digits only, so every phone, tablet and computer accepts the name. */
export function documentFileName(destinationName: string): string {
  const slug = destinationName.replace(/[łŁ]/g, "l").replace(/[đĐ]/g, "d").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/g, "");
  return `destinauta-${slug || "itinerario"}.pdf`;
}
