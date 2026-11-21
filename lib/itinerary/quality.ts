import type { Itinerary, ItineraryActivity } from "./types";

// Comprobaciones de calidad del itinerario escrito por la IA. Se aplican DESPUÉS de comprobar la estructura (isItinerary):
// si el itinerario repite contenido o promete cosas que no podemos verificar (precios, horarios exactos, disponibilidad),
// se descarta y la persona recibe la guía gratuita, igual que con cualquier otra respuesta que no pasa los controles.
// No hay forma de garantizar por código que una recomendación sea segura: eso lo pide la instrucción a la IA y el aviso
// «comprueba horarios, precios y reservas» que ya acompaña a todo itinerario con IA.

/** Códigos fijos (los únicos que se escriben en los registros del servidor; nunca texto de la respuesta). */
export type QualityIssue =
  | "duplicate_activity"
  | "duplicate_description"
  | "duplicate_day_title"
  | "duplicate_tip"
  | "price_claim"
  | "exact_hours"
  | "availability_claim"
  | "unsafe_activity";

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// Límites de palabra que también valen para letras con tilde (\\b de JavaScript no las trata como letras).
const B = "(?<![\\p{L}\\p{N}])";
const E = "(?![\\p{L}\\p{N}])";
const rx = (parts: string[]) => new RegExp(parts.join("|"), "iu");

// Precios, monedas y promesas de gratuidad o descuento (siete idiomas). «free» solo en frases de entrada gratuita.
const PRICE = rx([
  "[€$£]",
  `${B}\\d+(?:[.,]\\d+)?\\s?(?:eur|euros?|usd|gbp|dolares?|dólares?|dollars?|libras?|pounds?|livres?|pfund|sterline|dollari|dolars?|lliures?)${E}`,
  `${B}(?:gratis|gratuit[oae]?s?|gratuits|gratuïts?|kostenlos|umsonst|grátis|free (?:entry|admission|of charge)|entrada libre|entrée libre|entree libre`
  + `|eintritt frei|ingresso libero|entrada livre|entrada lliure|descuentos?|discounts?|rabais|rabatt|sconti|sconto|descontos?|desconto|rebaixes?)${E}`,
]);

// Horas exactas («10:30», «9h30», «a las 9 horas», «3 pm») y horarios de apertura.
const HOURS = rx([
  `${B}(?:[01]?\\d|2[0-3])[:.h][0-5]\\d${E}`,
  `${B}(?:[01]?\\d|2[0-3])\\s?(?:am|pm|a\\.m\\.|p\\.m\\.)${E}`,
  `${B}(?:a las|a les|alle|às|at|um|à)\\s+\\d{1,2}\\s?(?:h|horas?|hours?|uhr|heures?|ore|hores)${E}`,
  `${B}(?:abre|abren|cierra|cierran|opens?|closes?|ouvre|ferme|öffnet|schliesst|schließt|apre|chiude|fecha|obre|tanca)\\s+(?:a las|a les|at|à|alle|um|às)${E}`,
  `${B}(?:abierto|abierta|open|ouvert|geöffnet|aperto|aberto|obert)\\s+(?:todos los|every|daily|24|tous les|täglich|ogni|todos os|cada|de lunes|from|hasta|until)${E}`,
]);

// Disponibilidad, entradas y garantías que no podemos conocer ni prometer.
const AVAILABILITY = rx([
  `${B}(?:agotad[oa]s?|esgotad[oa]s?|sold out|ausverkauft|esaurit[oi]|entradas? disponibles?|tickets? available|billets disponibles|bitllets disponibles`
  + `|reserva garantizada|guaranteed|garantizad[oa]s?|garantiert|garantit[oa]|garantid[oa]s?|garanti)${E}`,
]);

// Solo en nombre y descripción de actividades (no en los consejos, donde «evita los taxis ilegales» es una advertencia útil).
const UNSAFE_ACTIVITY = rx([`${B}(?:drogas?|drugs?|drogue|drogen|prostitu\\p{L}*|burdel|brothel|bordel|bordell|ilegales?|illegal\\p{L}*|illegale?)${E}`]);

function activities(itinerary: Itinerary): ItineraryActivity[] {
  return itinerary.days.flatMap((day) => [...day.morning, ...day.afternoon, ...day.evening]);
}

function hasDuplicates(values: string[]): boolean {
  const seen = new Set<string>();
  for (const value of values) {
    const key = normalize(value);
    if (!key) continue;
    if (seen.has(key)) return true;
    seen.add(key);
  }
  return false;
}

/** Problemas de calidad de un itinerario con la estructura ya válida. Lista vacía = aceptable. */
export function itineraryQualityIssues(itinerary: Itinerary): QualityIssue[] {
  const issues = new Set<QualityIssue>();
  const list = activities(itinerary);

  if (hasDuplicates(list.map((item) => item.name))) issues.add("duplicate_activity");
  if (hasDuplicates(list.map((item) => item.description))) issues.add("duplicate_description");
  if (hasDuplicates(itinerary.days.map((day) => day.title))) issues.add("duplicate_day_title");
  if (hasDuplicates(itinerary.tips)) issues.add("duplicate_tip");

  const texts = [
    itinerary.title, itinerary.summary, ...itinerary.tips,
    ...itinerary.days.map((day) => day.title),
    ...list.flatMap((item) => [item.name, item.description, item.area]),
  ];
  for (const text of texts) {
    if (PRICE.test(text)) issues.add("price_claim");
    if (HOURS.test(text)) issues.add("exact_hours");
    if (AVAILABILITY.test(text)) issues.add("availability_claim");
  }
  if (list.some((item) => UNSAFE_ACTIVITY.test(`${item.name} ${item.description}`))) issues.add("unsafe_activity");

  return [...issues];
}
