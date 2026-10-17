import type { Locale } from "@/lib/i18n/translations";

export function formatMonthName(month: number, locale: Locale): string {
  const value = new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" })
    .format(new Date(Date.UTC(2020, month - 1, 1)));
  return value;
}

function uniqueSortedMonths(months: number[]): number[] {
  return Array.from(new Set(months)).filter((month) => Number.isInteger(month) && month >= 1 && month <= 12)
    .sort((first, second) => first - second);
}

// Groups adjacent months into readable ranges, e.g. "abril – junio · septiembre – octubre".
export function formatMonthRanges(months: number[], locale: Locale): string {
  const sorted = uniqueSortedMonths(months);
  if (!sorted.length) return "";
  const groups: number[][] = [];
  for (const month of sorted) {
    const last = groups[groups.length - 1];
    if (last && last[last.length - 1] === month - 1) last.push(month);
    else groups.push([month]);
  }
  const label = groups.map((group) => group.length === 1
    ? formatMonthName(group[0], locale)
    : `${formatMonthName(group[0], locale)} – ${formatMonthName(group[group.length - 1], locale)}`)
    .join(" · ");
  return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
}

// Keeps the locale's own conjunction ("y", "and", "et", etc.) for quiet-month lists.
export function formatMonthList(months: number[], locale: Locale): string {
  const names = uniqueSortedMonths(months).map((month) => formatMonthName(month, locale));
  if (!names.length) return "";
  const label = new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(names);
  return label.charAt(0).toLocaleUpperCase(locale) + label.slice(1);
}
