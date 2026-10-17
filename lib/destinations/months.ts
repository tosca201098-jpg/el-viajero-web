export const spanishMonthSlugs = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

export function monthFromSlug(slug: string): number | null {
  const index = spanishMonthSlugs.findIndex((month) => month === slug);
  return index === -1 ? null : index + 1;
}

export function slugFromMonth(month: number): string | null {
  return Number.isInteger(month) && month >= 1 && month <= 12
    ? spanishMonthSlugs[month - 1]
    : null;
}
