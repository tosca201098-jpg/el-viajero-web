// Textos del aviso de cookies en los siete idiomas. Van en su propio archivo (y no en lib/i18n/translations.ts)
// para que añadirlos no choque con otros cambios de ese archivo. Cada fila: clave, es, en, fr, de, it, pt, ca.
// El español es la fuente; si falta una traducción se usa el español.

import { locales, type Locale } from "@/lib/i18n/translations";

const rows = [
  ["title", "Cookies y privacidad", "Cookies and privacy", "Cookies et confidentialité", "Cookies und Datenschutz", "Cookie e privacy", "Cookies e privacidade", "Cookies i privacitat"],
  ["body",
    "Usamos solo lo imprescindible para que la web funcione (por ejemplo, recordar tu idioma). Si lo permites, también cargamos servicios de terceros, como el de afiliación y medición de Travelpayouts, que guardan cookies para saber desde qué página se hace una reserva. Puedes rechazarlos y la web sigue funcionando igual.",
    "We only use what is needed for the site to work (for example, remembering your language). If you allow it, we also load third-party services, such as Travelpayouts’ affiliate and measurement service, which store cookies to know which page a booking comes from. You can refuse them and the site keeps working the same.",
    "Nous n’utilisons que le strict nécessaire au fonctionnement du site (par exemple, mémoriser votre langue). Si vous l’autorisez, nous chargeons aussi des services tiers, comme celui d’affiliation et de mesure de Travelpayouts, qui enregistrent des cookies pour savoir de quelle page provient une réservation. Vous pouvez les refuser : le site fonctionne de la même façon.",
    "Wir verwenden nur das, was für den Betrieb der Website nötig ist (z. B. Ihre Sprache merken). Wenn Sie zustimmen, laden wir zusätzlich Dienste von Drittanbietern, etwa den Affiliate- und Messdienst von Travelpayouts, die Cookies speichern, um zu erkennen, von welcher Seite eine Buchung kommt. Sie können ablehnen, die Website funktioniert trotzdem genauso.",
    "Usiamo solo ciò che serve al funzionamento del sito (ad esempio, ricordare la tua lingua). Se lo consenti, carichiamo anche servizi di terze parti, come quello di affiliazione e misurazione di Travelpayouts, che salvano cookie per sapere da quale pagina arriva una prenotazione. Puoi rifiutarli e il sito continua a funzionare allo stesso modo.",
    "Usamos apenas o necessário para o site funcionar (por exemplo, lembrar o seu idioma). Se permitir, também carregamos serviços de terceiros, como o de afiliação e medição da Travelpayouts, que guardam cookies para saber de que página vem uma reserva. Pode recusá-los e o site continua a funcionar da mesma forma.",
    "Fem servir només el que cal perquè el web funcioni (per exemple, recordar el teu idioma). Si ho permets, també carreguem serveis de tercers, com el d’afiliació i mesura de Travelpayouts, que desen cookies per saber des de quina pàgina es fa una reserva. Pots rebutjar-los i el web continua funcionant igual.",
  ],
  ["accept", "Aceptar", "Accept", "Accepter", "Akzeptieren", "Accetta", "Aceitar", "Accepta"],
  ["reject", "Rechazar", "Reject", "Refuser", "Ablehnen", "Rifiuta", "Recusar", "Rebutja"],
  ["more", "Más información", "More information", "En savoir plus", "Mehr Informationen", "Maggiori informazioni", "Mais informações", "Més informació"],
  ["footer", "Cookies", "Cookies", "Cookies", "Cookies", "Cookie", "Cookies", "Cookies"],
] as const;

export type CookieTextKey = typeof rows[number][0];

/** Filas sin tratar, para las pruebas (que comprueban que no falta ningún idioma). */
export const COOKIE_TEXT_ROWS: ReadonlyArray<readonly string[]> = rows;

const dictionaries = Object.fromEntries(locales.map((locale, index) => [
  locale.code, Object.fromEntries(rows.map((row) => [row[0], row[index + 1]])),
])) as Record<Locale, Partial<Record<CookieTextKey, string>>>;

export function cookieText(locale: Locale, key: CookieTextKey): string {
  return dictionaries[locale]?.[key] || dictionaries.es[key] || key;
}
