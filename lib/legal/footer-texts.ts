// Textos del pie de página legal en los siete idiomas. Los enlaces llevan a páginas que de momento solo existen en español.
// Cada fila: clave, es, en, fr, de, it, pt, ca. El español es la fuente; si falta una traducción se usa el español.

import { locales, type Locale } from "@/lib/i18n/translations";

const rows = [
  ["nav", "Información legal", "Legal information", "Informations légales", "Rechtliche Informationen", "Informazioni legali", "Informações legais", "Informació legal"],
  ["legal", "Aviso legal", "Legal notice", "Mentions légales", "Impressum", "Note legali", "Aviso legal", "Avís legal"],
  ["privacy", "Política de privacidad", "Privacy policy", "Politique de confidentialité", "Datenschutzerklärung", "Informativa sulla privacy", "Política de privacidade", "Política de privacitat"],
] as const;

export type FooterTextKey = typeof rows[number][0];

/** Filas sin tratar, para las pruebas (que comprueban que no falta ningún idioma). */
export const FOOTER_TEXT_ROWS: ReadonlyArray<readonly string[]> = rows;

const dictionaries = Object.fromEntries(locales.map((locale, index) => [
  locale.code, Object.fromEntries(rows.map((row) => [row[0], row[index + 1]])),
])) as Record<Locale, Partial<Record<FooterTextKey, string>>>;

export function footerText(locale: Locale, key: FooterTextKey): string {
  return dictionaries[locale]?.[key] || dictionaries.es[key] || key;
}
