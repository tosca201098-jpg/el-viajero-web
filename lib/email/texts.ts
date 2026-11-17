// Textos del correo de vuelos a buen precio en los siete idiomas. Van en su propio archivo (y no en
// lib/i18n/translations.ts) para que añadirlos no choque con otros cambios. Cada fila: clave, es, en, fr, de, it, pt, ca.
// El español es la fuente; si falta una traducción se usa el español.
// Las palabras «noches», «directo», «escala» y «Ver destino» se toman de lib/i18n/translations.ts (las mismas de «Viajes por mes»).
// Decisiones del propietario (17-11-2026): el aviso de afiliado va debajo de las tarjetas, en letra pequeña de 12 px, y NO
// dice «sin coste extra para ti» hasta comprobar las condiciones de Travelpayouts y de cada proveedor.

import { locales, type Locale, type Variables } from "@/lib/i18n/translations";

const rows = [
  ["subject", "{count} vuelos desde {origin} por menos de {max} (ida y vuelta)", "{count} flights from {origin} for under {max} (round trip)", "{count} vols depuis {origin} à moins de {max} (aller-retour)", "{count} Flüge ab {origin} für unter {max} (Hin- und Rückflug)", "{count} voli da {origin} a meno di {max} (andata e ritorno)", "{count} voos a partir de {origin} por menos de {max} (ida e volta)", "{count} vols des de {origin} per menys de {max} (anada i tornada)"],
  ["tagline", "Vuelos a buen precio", "Good-value flights", "Vols à bon prix", "Günstige Flüge", "Voli a buon prezzo", "Voos a bom preço", "Vols a bon preu"],
  ["heading", "Tus vuelos más baratos desde {origin}", "Your cheapest flights from {origin}", "Vos vols les moins chers depuis {origin}", "Deine günstigsten Flüge ab {origin}", "I tuoi voli più economici da {origin}", "Os seus voos mais baratos a partir de {origin}", "Els teus vols més barats des de {origin}"],
  ["intro", "Hola, esto es lo más barato que hemos visto estos días para viajar en {months}, según lo que nos contaste.", "Hi, here are the cheapest flights we have seen lately for travelling in {months}, based on what you told us.", "Bonjour, voici les vols les moins chers que nous avons vus ces derniers jours pour voyager en {months}, selon ce que vous nous avez dit.", "Hallo, das sind die günstigsten Flüge, die wir in den letzten Tagen für {months} gesehen haben, passend zu deinen Angaben.", "Ciao, ecco i voli più economici che abbiamo visto in questi giorni per viaggiare a {months}, in base a quello che ci hai detto.", "Olá, estes são os voos mais baratos que vimos nos últimos dias para viajar em {months}, de acordo com o que nos indicou.", "Hola, això és el més barat que hem vist aquests dies per viatjar durant {months}, segons el que ens vas explicar."],
  ["chipUpTo", "Hasta {max}", "Up to {max}", "Jusqu’à {max}", "Bis {max}", "Fino a {max}", "Até {max}", "Fins a {max}"],
  ["prefs", "Cambiar mis preferencias", "Change my preferences", "Modifier mes préférences", "Meine Einstellungen ändern", "Modifica le mie preferenze", "Alterar as minhas preferências", "Canviar les meves preferències"],
  ["from", "desde", "from", "à partir de", "ab", "da", "desde", "des de"],
  ["roundTrip", "ida y vuelta", "round trip", "aller-retour", "Hin- und Rückflug", "andata e ritorno", "ida e volta", "anada i tornada"],
  ["viewFlight", "Ver este vuelo", "View this flight", "Voir ce vol", "Diesen Flug ansehen", "Vedi questo volo", "Ver este voo", "Veure aquest vol"],
  ["seenToday", "Precio visto hoy. Puede cambiar.", "Price seen today. It may change.", "Prix vu aujourd’hui. Il peut changer.", "Preis heute gesehen. Er kann sich ändern.", "Prezzo visto oggi. Può cambiare.", "Preço visto hoje. Pode mudar.", "Preu vist avui. Pot canviar."],
  ["seenOne", "Precio visto hace 1 día. Puede cambiar.", "Price seen 1 day ago. It may change.", "Prix vu il y a 1 jour. Il peut changer.", "Preis vor 1 Tag gesehen. Er kann sich ändern.", "Prezzo visto 1 giorno fa. Può cambiare.", "Preço visto há 1 dia. Pode mudar.", "Preu vist fa 1 dia. Pot canviar."],
  ["seenMany", "Precio visto hace {count} días. Puede cambiar.", "Price seen {count} days ago. It may change.", "Prix vu il y a {count} jours. Il peut changer.", "Preis vor {count} Tagen gesehen. Er kann sich ändern.", "Prezzo visto {count} giorni fa. Può cambiare.", "Preço visto há {count} dias. Pode mudar.", "Preu vist fa {count} dies. Pot canviar."],
  ["affiliate", "Algunos enlaces son de afiliado: Destinauta puede recibir una comisión si reservas.", "Some links are affiliate links: Destinauta may earn a commission if you book.", "Certains liens sont des liens d’affiliation : Destinauta peut percevoir une commission si vous réservez.", "Einige Links sind Affiliate-Links: Destinauta erhält möglicherweise eine Provision, wenn du buchst.", "Alcuni link sono di affiliazione: Destinauta può ricevere una commissione se prenoti.", "Alguns links são de afiliado: a Destinauta pode receber uma comissão se reservar.", "Alguns enllaços són d’afiliat: Destinauta pot rebre una comissió si reserves."],
  ["more", "Ver más vuelos de {month}", "See more flights for {month}", "Voir plus de vols pour {month}", "Mehr Flüge für {month} ansehen", "Vedi altri voli per {month}", "Ver mais voos para {month}", "Veure més vols per a {month}"],
  ["disclaimerTitle", "Precios orientativos.", "Indicative prices.", "Prix indicatifs.", "Richtpreise.", "Prezzi indicativi.", "Preços indicativos.", "Preus orientatius."],
  ["disclaimerBody", "Son los que hemos visto hace unos días en el buscador y pueden cambiar hasta que reserves. Comprueba siempre el precio final, los impuestos y las condiciones en la web del proveedor. Destinauta no vende billetes: te lleva al sitio donde se reserva.", "These are the prices we saw a few days ago in the search engine and they may change until you book. Always check the final price, taxes and conditions on the provider’s website. Destinauta does not sell tickets: it takes you to the site where you can book.", "Ce sont les prix que nous avons vus il y a quelques jours dans le moteur de recherche ; ils peuvent changer jusqu’à votre réservation. Vérifiez toujours le prix final, les taxes et les conditions sur le site du fournisseur. Destinauta ne vend pas de billets : il vous renvoie vers le site où l’on réserve.", "Das sind die Preise, die wir vor einigen Tagen in der Suche gesehen haben; sie können sich bis zur Buchung ändern. Prüfe immer den Endpreis, die Steuern und die Bedingungen auf der Website des Anbieters. Destinauta verkauft keine Tickets: Wir leiten dich zur Seite weiter, auf der gebucht wird.", "Sono i prezzi che abbiamo visto qualche giorno fa nel motore di ricerca e possono cambiare fino alla prenotazione. Controlla sempre il prezzo finale, le tasse e le condizioni sul sito del fornitore. Destinauta non vende biglietti: ti porta al sito in cui si prenota.", "São os preços que vimos há alguns dias no motor de pesquisa e podem mudar até reservar. Confirme sempre o preço final, as taxas e as condições no site do fornecedor. A Destinauta não vende bilhetes: leva-o ao site onde se reserva.", "Són els preus que hem vist fa uns dies al cercador i poden canviar fins que reservis. Comprova sempre el preu final, els impostos i les condicions al web del proveïdor. Destinauta no ven bitllets: et porta al lloc on es reserva."],
  ["unsubscribe", "Darme de baja con un clic", "Unsubscribe in one click", "Me désabonner en un clic", "Mit einem Klick abmelden", "Annulla l’iscrizione con un clic", "Cancelar a subscrição com um clique", "Donar-me de baixa amb un clic"],
  ["privacy", "Política de privacidad", "Privacy policy", "Politique de confidentialité", "Datenschutzerklärung", "Informativa sulla privacy", "Política de privacidade", "Política de privacitat"],
  ["legal", "Aviso legal", "Legal notice", "Mentions légales", "Impressum", "Note legali", "Aviso legal", "Avís legal"],
] as const;

export type FlightEmailTextKey = typeof rows[number][0];

/** Filas sin tratar, para las pruebas (que comprueban que no falta ningún idioma). */
export const FLIGHT_EMAIL_TEXT_ROWS: ReadonlyArray<readonly string[]> = rows;

const dictionaries = Object.fromEntries(locales.map((locale, index) => [
  locale.code, Object.fromEntries(rows.map((row) => [row[0], row[index + 1]])),
])) as Record<Locale, Partial<Record<FlightEmailTextKey, string>>>;

export function flightEmailText(locale: Locale, key: FlightEmailTextKey, variables: Variables = {}): string {
  const template = dictionaries[locale]?.[key] || dictionaries.es[key] || key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => String(variables[name] ?? match));
}
