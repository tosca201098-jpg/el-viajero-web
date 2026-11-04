import type { Locale } from '@/lib/i18n/translations';

const locales: Locale[] = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ca'];
// Reference towns served by the airport; these labels do not place it in the town centre.
const towns: Readonly<Record<string, readonly string[]>> = {
  KVA: ['Kavala','Kavala','Kavala','Kavala','Kavala','Cavala','Kavala'],
  MJT: ['Mitilene','Mytilene','Mytilène','Mytilini','Mitilene','Mitilene','Mitilene'],
  ATH: ['Atenas', 'Athens', 'Athènes', 'Athen', 'Atene', 'Atenas', 'Atenes'],
  SKG: ['Tesalónica', 'Thessaloniki', 'Thessalonique', 'Thessaloniki', 'Salonicco', 'Salónica', 'Tessalònica'],
  HER: ['Heraclión', 'Heraklion', 'Héraklion', 'Heraklion', 'Heraklion', 'Heraclião', 'Iràklio'],
  CHQ: ['La Canea', 'Chania', 'La Canée', 'Chania', 'La Canea', 'Chania', 'Khanià'],
  RHO: ['Rodas', 'Rhodes', 'Rhodes', 'Rhodos', 'Rodi', 'Rodes', 'Rodes'],
  CFU: ['Corfú (Kérkyra)', 'Corfu Town (Kerkyra)', 'Corfou (Kerkyra)', 'Korfu-Stadt (Kerkyra)', 'Corfù (Kerkyra)', 'Corfu (Kerkyra)', 'Corfú (Kérkyra)'],
  KGS: ['Kos', 'Kos Town', 'Kos', 'Kos-Stadt', 'Kos', 'Cós', 'Cos'],
  JTR: ['Fira (Santorini)', 'Fira (Santorini)', 'Fira (Santorin)', 'Fira (Santorin)', 'Fira (Santorini)', 'Fira (Santorini)', 'Fira (Santorí)'],
  JMK: ['Chora de Miconos', 'Mykonos Town (Chora)', 'Chora de Mykonos', 'Mykonos-Stadt (Chora)', 'Chora di Mykonos', 'Chora de Míconos', 'Khora de Míkonos'],
  ZTH: ['Zante (ciudad de Zakynthos)', 'Zakynthos Town', 'Zante (ville)', 'Zakynthos-Stadt', 'Zante (città)', 'Cidade de Zaquintos', 'Ciutat de Zacint'],
  EFL: ['Argostoli (Cefalonia)', 'Argostoli (Kefalonia)', 'Argostoli (Céphalonie)', 'Argostoli (Kefalonia)', 'Argostoli (Cefalonia)', 'Argostoli (Cefalónia)', 'Argostoli (Cefalònia)'],
  JSI: ['Ciudad de Scíathos', 'Skiathos Town', 'Ville de Skiathos', 'Skiathos-Stadt', 'Città di Sciato', 'Cidade de Esquíato', 'Ciutat d’Escíatos'],
  PVK: ['Préveza', 'Preveza', 'Prévéza', 'Preveza', 'Prevesa', 'Préveza', 'Prèveza'],
  SMI: ['Pitagorio (Samos)', 'Pythagorio (Samos)', 'Pythagorion (Samos)', 'Pythagorio (Samos)', 'Pythagoreio (Samo)', 'Pitagório (Samos)', 'Pitagórion (Samos)'],
  KLX: ['Calamata', 'Kalamata', 'Kalamata', 'Kalamata', 'Calamata', 'Calamata', 'Calamata'],
};
export function greeceAirportTown(code: string, locale: Locale) {
  return towns[code]?.[locales.indexOf(locale)] ?? code;
}

// Keep search names separate from immutable tourism profiles. Parenthesized island labels
// are optional in city searches; no generic Chora alias is introduced.
export const greeceAirportTownAliases: Readonly<Record<string, readonly string[]>> = Object.fromEntries(
  Object.entries(towns).map(([code, labels]) => [code, Array.from(new Set([
    ...labels, ...labels.map(label => label.replace(/\s*\([^)]*\)/g, '').trim()),
  ]))]));
