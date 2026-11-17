// Textos de la página de baja del correo de vuelos, en los siete idiomas. Cada fila: clave, es, en, fr, de, it, pt, ca.
// El español es la fuente; si falta una traducción se usa el español. Son textos sencillos y sin variables.

import { locales, type Locale } from "@/lib/i18n/translations";

const rows = [
  ["title", "Darte de baja de los correos de Destinauta", "Unsubscribe from Destinauta emails", "Se désabonner des e-mails de Destinauta", "Von den Destinauta-E-Mails abmelden", "Annulla l’iscrizione alle e-mail di Destinauta", "Cancelar a subscrição dos e-mails da Destinauta", "Donar-te de baixa dels correus de Destinauta"],
  ["intro", "Si te das de baja, dejaremos de enviarte el correo de vuelos a buen precio. Podrás volver a activarlo cuando quieras desde «Mi cuenta» en la web.", "If you unsubscribe, we will stop sending you the good-value flights email. You can turn it back on whenever you like from “My account” on the website.", "Si vous vous désabonnez, nous cesserons de vous envoyer l’e-mail des vols à bon prix. Vous pourrez le réactiver quand vous le souhaitez depuis « Mon compte » sur le site.", "Wenn du dich abmeldest, schicken wir dir die E-Mail mit günstigen Flügen nicht mehr. Du kannst sie jederzeit unter „Mein Konto“ auf der Website wieder aktivieren.", "Se annulli l’iscrizione, smetteremo di inviarti l’e-mail con i voli a buon prezzo. Potrai riattivarla quando vuoi da «Il mio account» sul sito.", "Se cancelar a subscrição, deixaremos de lhe enviar o e-mail de voos a bom preço. Pode voltar a ativá-lo quando quiser em «A minha conta» no site.", "Si et dones de baixa, deixarem d’enviar-te el correu de vols a bon preu. Podràs tornar a activar-lo quan vulguis des de «El meu compte» al web."],
  ["button", "Darme de baja", "Unsubscribe me", "Me désabonner", "Mich abmelden", "Annulla l’iscrizione", "Cancelar a subscrição", "Donar-me de baixa"],
  ["doneTitle", "Te has dado de baja", "You have been unsubscribed", "Vous êtes désabonné", "Du wurdest abgemeldet", "Hai annullato l’iscrizione", "Cancelou a subscrição", "T’has donat de baixa"],
  ["doneBody", "No volverás a recibir el correo de vuelos a buen precio. Si ha sido un error, puedes volver a activarlo desde «Mi cuenta» en la web.", "You will not receive the good-value flights email again. If this was a mistake, you can turn it back on from “My account” on the website.", "Vous ne recevrez plus l’e-mail des vols à bon prix. S’il s’agit d’une erreur, vous pouvez le réactiver depuis « Mon compte » sur le site.", "Du erhältst die E-Mail mit günstigen Flügen nicht mehr. Falls das ein Versehen war, kannst du sie unter „Mein Konto“ auf der Website wieder aktivieren.", "Non riceverai più l’e-mail con i voli a buon prezzo. Se è stato un errore, puoi riattivarla da «Il mio account» sul sito.", "Não voltará a receber o e-mail de voos a bom preço. Se foi um engano, pode voltar a ativá-lo em «A minha conta» no site.", "No tornaràs a rebre el correu de vols a bon preu. Si ha estat un error, pots tornar a activar-lo des de «El meu compte» al web."],
  ["errorTitle", "No hemos podido darte de baja", "We could not unsubscribe you", "Nous n’avons pas pu vous désabonner", "Wir konnten dich nicht abmelden", "Non siamo riusciti ad annullare l’iscrizione", "Não foi possível cancelar a subscrição", "No hem pogut donar-te de baixa"],
  ["errorBody", "Ha habido un problema temporal y tu baja no se ha guardado. Inténtalo de nuevo dentro de unos minutos.", "There was a temporary problem and your request was not saved. Please try again in a few minutes.", "Un problème temporaire est survenu et votre demande n’a pas été enregistrée. Veuillez réessayer dans quelques minutes.", "Es gab ein vorübergehendes Problem und deine Abmeldung wurde nicht gespeichert. Bitte versuche es in ein paar Minuten erneut.", "C’è stato un problema temporaneo e la tua richiesta non è stata salvata. Riprova tra qualche minuto.", "Houve um problema temporário e o seu pedido não foi guardado. Tente novamente dentro de alguns minutos.", "Hi ha hagut un problema temporal i la teva baixa no s’ha desat. Torna-ho a provar d’aquí a uns minuts."],
  ["invalidTitle", "Enlace no válido", "Invalid link", "Lien non valide", "Ungültiger Link", "Link non valido", "Ligação inválida", "Enllaç no vàlid"],
  ["invalidBody", "Este enlace de baja no es válido o está incompleto. Puedes desactivar los correos desde «Mi cuenta» en la web.", "This unsubscribe link is not valid or is incomplete. You can turn the emails off from “My account” on the website.", "Ce lien de désabonnement n’est pas valide ou est incomplet. Vous pouvez désactiver les e-mails depuis « Mon compte » sur le site.", "Dieser Abmelde-Link ist ungültig oder unvollständig. Du kannst die E-Mails unter „Mein Konto“ auf der Website ausschalten.", "Questo link per annullare l’iscrizione non è valido o è incompleto. Puoi disattivare le e-mail da «Il mio account» sul sito.", "Esta ligação de cancelamento não é válida ou está incompleta. Pode desativar os e-mails em «A minha conta» no site.", "Aquest enllaç de baixa no és vàlid o està incomplet. Pots desactivar els correus des de «El meu compte» al web."],
  ["back", "Ir a Destinauta", "Go to Destinauta", "Aller sur Destinauta", "Zu Destinauta", "Vai a Destinauta", "Ir para a Destinauta", "Anar a Destinauta"],
] as const;

export type UnsubscribeTextKey = typeof rows[number][0];

/** Filas sin tratar, para las pruebas (que comprueban que no falta ningún idioma). */
export const UNSUBSCRIBE_TEXT_ROWS: ReadonlyArray<readonly string[]> = rows;

const dictionaries = Object.fromEntries(locales.map((locale, index) => [
  locale.code, Object.fromEntries(rows.map((row) => [row[0], row[index + 1]])),
])) as Record<Locale, Partial<Record<UnsubscribeTextKey, string>>>;

export function unsubscribeText(locale: Locale, key: UnsubscribeTextKey): string {
  return dictionaries[locale]?.[key] || dictionaries.es[key] || key;
}
