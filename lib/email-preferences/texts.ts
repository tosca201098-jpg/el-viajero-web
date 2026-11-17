// Textos del cuestionario de «Mi cuenta» en los siete idiomas. Van en su propio archivo (y no en lib/i18n/translations.ts)
// para que añadirlos no choque con otros cambios de ese archivo. Cada fila: clave, es, en, fr, de, it, pt, ca.
// El español es la fuente; si falta una traducción se usa el español.

import { locales, type Locale, type Variables } from "@/lib/i18n/translations";

const rows = [
  ["title", "Vuelos a buen precio por correo", "Good-value flights by email", "Vols à bon prix par e-mail", "Günstige Flüge per E-Mail", "Voli a buon prezzo via email", "Voos a bom preço por email", "Vols a bon preu per correu"],
  ["optional", "Opcional", "Optional", "Facultatif", "Freiwillig", "Facoltativo", "Opcional", "Opcional"],
  ["intro", "Cuéntanos qué te gusta y, si quieres, te enviaremos por correo vuelos a buen precio que encajen contigo. Se responde una sola vez y puedes cambiarlo cuando quieras. Todas las preguntas son opcionales.", "Tell us what you like and, if you want, we will email you good-value flights that suit you. You answer once and can change it whenever you like. Every question is optional.", "Dites-nous ce que vous aimez et, si vous le souhaitez, nous vous enverrons par e-mail des vols à bon prix qui vous correspondent. Vous répondez une seule fois et pouvez modifier vos réponses à tout moment. Toutes les questions sont facultatives.", "Erzähl uns, was dir gefällt, und wir schicken dir auf Wunsch passende, günstige Flüge per E-Mail. Du antwortest nur einmal und kannst alles jederzeit ändern. Alle Fragen sind freiwillig.", "Raccontaci cosa ti piace e, se vuoi, ti invieremo via email voli a buon prezzo adatti a te. Rispondi una sola volta e puoi modificare tutto quando vuoi. Tutte le domande sono facoltative.", "Conte-nos do que gosta e, se quiser, enviaremos por email voos a bom preço que lhe sirvam. Responde-se uma só vez e pode alterar quando quiser. Todas as perguntas são opcionais.", "Explica’ns què t’agrada i, si vols, t’enviarem per correu vols a bon preu que s’adaptin a tu. Es respon una sola vegada i ho pots canviar quan vulguis. Totes les preguntes són opcionals."],
  ["notLive", "Todavía no enviamos correos: estamos preparando el servicio. Puedes guardar tus gustos desde ya.", "We are not sending emails yet: the service is being prepared. You can save your preferences now.", "Nous n’envoyons pas encore d’e-mails : le service est en préparation. Vous pouvez déjà enregistrer vos préférences.", "Wir versenden noch keine E-Mails: Der Dienst ist in Vorbereitung. Du kannst deine Vorlieben schon jetzt speichern.", "Non inviamo ancora email: stiamo preparando il servizio. Puoi già salvare le tue preferenze.", "Ainda não enviamos emails: estamos a preparar o serviço. Já pode guardar as suas preferências.", "Encara no enviem correus: estem preparant el servei. Ja pots desar els teus gustos."],
  ["airports.legend", "¿Desde qué aeropuerto sueles volar?", "Which airport do you usually fly from?", "De quel aéroport partez-vous d’habitude ?", "Von welchem Flughafen fliegst du meistens?", "Da quale aeroporto voli di solito?", "De que aeroporto costuma voar?", "Des de quin aeroport acostumes a volar?"],
  ["limit.hint", "Elige hasta {max}.", "Choose up to {max}.", "Choisissez-en jusqu’à {max}.", "Wähle bis zu {max}.", "Scegline fino a {max}.", "Escolha até {max}.", "Tria’n fins a {max}."],
  ["months.legend", "¿En qué meses te gustaría viajar?", "Which months would you like to travel in?", "Quels mois aimeriez-vous voyager ?", "In welchen Monaten möchtest du reisen?", "In quali mesi ti piacerebbe viaggiare?", "Em que meses gostaria de viajar?", "En quins mesos t’agradaria viatjar?"],
  ["tripTypes.legend", "¿Qué tipo de viaje prefieres?", "What kind of trip do you prefer?", "Quel type de voyage préférez-vous ?", "Welche Art von Reise bevorzugst du?", "Che tipo di viaggio preferisci?", "Que tipo de viagem prefere?", "Quin tipus de viatge prefereixes?"],
  ["type.beach", "Playa y sol", "Beach and sun", "Plage et soleil", "Strand und Sonne", "Mare e sole", "Praia e sol", "Platja i sol"],
  ["type.city", "Ciudad y cultura", "City and culture", "Ville et culture", "Stadt und Kultur", "Città e cultura", "Cidade e cultura", "Ciutat i cultura"],
  ["type.mountain", "Montaña y naturaleza", "Mountains and nature", "Montagne et nature", "Berge und Natur", "Montagna e natura", "Montanha e natureza", "Muntanya i natura"],
  ["type.gastronomy", "Gastronomía", "Food and drink", "Gastronomie", "Kulinarik", "Gastronomia", "Gastronomia", "Gastronomia"],
  ["type.adventure", "Aventura", "Adventure", "Aventure", "Abenteuer", "Avventura", "Aventura", "Aventura"],
  ["type.relax", "Relax", "Relaxation", "Détente", "Entspannung", "Relax", "Relax", "Relax"],
  ["length.legend", "¿Cuántos días sueles viajar?", "How long do you usually travel for?", "Combien de temps voyagez-vous d’habitude ?", "Wie lange verreist du normalerweise?", "Quanti giorni viaggi di solito?", "Quantos dias costuma viajar?", "Quants dies acostumes a viatjar?"],
  ["length.weekend", "Fin de semana", "A weekend", "Un week-end", "Wochenende", "Un fine settimana", "Fim de semana", "Cap de setmana"],
  ["length.short", "4–5 días", "4–5 days", "4 à 5 jours", "4–5 Tage", "4–5 giorni", "4–5 dias", "4–5 dies"],
  ["length.week", "Una semana o más", "A week or more", "Une semaine ou plus", "Eine Woche oder länger", "Una settimana o più", "Uma semana ou mais", "Una setmana o més"],
  ["reach.legend", "¿Hasta dónde te apetece ir?", "How far would you like to go?", "Jusqu’où aimeriez-vous aller ?", "Wie weit möchtest du reisen?", "Fin dove ti va di arrivare?", "Até onde gostaria de ir?", "Fins on t’abelleix anar?"],
  ["reach.spain", "España", "Spain", "Espagne", "Spanien", "Spagna", "Espanha", "Espanya"],
  ["reach.europe", "Europa", "Europe", "Europe", "Europa", "Europa", "Europa", "Europa"],
  ["reach.far", "Lejos (otros continentes)", "Far away (other continents)", "Loin (autres continents)", "Weit weg (andere Kontinente)", "Lontano (altri continenti)", "Longe (outros continentes)", "Lluny (altres continents)"],
  ["any", "Me da igual", "I don’t mind", "Peu importe", "Egal", "Non importa", "Tanto faz", "M’és igual"],
  ["budget.legend", "¿Cuánto sueles pagar por un vuelo de ida y vuelta?", "How much do you usually pay for a return flight?", "Combien payez-vous d’habitude pour un vol aller-retour ?", "Wie viel zahlst du üblicherweise für einen Hin- und Rückflug?", "Quanto paghi di solito per un volo andata e ritorno?", "Quanto costuma pagar por um voo de ida e volta?", "Quant acostumes a pagar per un vol d’anada i tornada?"],
  ["budget.up100", "Hasta 100 €", "Up to €100", "Jusqu’à 100 €", "Bis 100 €", "Fino a 100 €", "Até 100 €", "Fins a 100 €"],
  ["budget.up200", "Hasta 200 €", "Up to €200", "Jusqu’à 200 €", "Bis 200 €", "Fino a 200 €", "Até 200 €", "Fins a 200 €"],
  ["budget.up400", "Hasta 400 €", "Up to €400", "Jusqu’à 400 €", "Bis 400 €", "Fino a 400 €", "Até 400 €", "Fins a 400 €"],
  ["frequency.legend", "¿Cada cuánto quieres recibir el correo?", "How often would you like to receive the email?", "À quelle fréquence souhaitez-vous recevoir l’e-mail ?", "Wie oft möchtest du die E-Mail erhalten?", "Ogni quanto vuoi ricevere l’email?", "Com que frequência quer receber o email?", "Cada quant vols rebre el correu?"],
  ["frequency.weekly", "Cada semana", "Every week", "Chaque semaine", "Jede Woche", "Ogni settimana", "Todas as semanas", "Cada setmana"],
  ["frequency.fortnightly", "Cada 15 días", "Every 15 days", "Tous les 15 jours", "Alle 15 Tage", "Ogni 15 giorni", "A cada 15 dias", "Cada 15 dies"],
  ["frequency.monthly", "Una vez al mes", "Once a month", "Une fois par mois", "Einmal im Monat", "Una volta al mese", "Uma vez por mês", "Un cop al mes"],
  ["unanswered", "Sin responder", "No answer", "Sans réponse", "Keine Angabe", "Senza risposta", "Sem resposta", "Sense respondre"],
  ["consent.label", "Quiero recibir por correo electrónico vuelos a buen precio según mis respuestas, con la frecuencia que he elegido. Puedo darme de baja cuando quiera.", "I want to receive good-value flights by email based on my answers, as often as I chose. I can unsubscribe at any time.", "Je souhaite recevoir par e-mail des vols à bon prix selon mes réponses, à la fréquence choisie. Je peux me désabonner à tout moment.", "Ich möchte entsprechend meinen Antworten günstige Flüge per E-Mail erhalten, in der gewählten Häufigkeit. Ich kann mich jederzeit abmelden.", "Voglio ricevere via email voli a buon prezzo in base alle mie risposte, con la frequenza scelta. Posso annullare l’iscrizione quando voglio.", "Quero receber por email voos a bom preço de acordo com as minhas respostas, com a frequência escolhida. Posso cancelar a subscrição quando quiser.", "Vull rebre per correu electrònic vols a bon preu segons les meves respostes, amb la freqüència que he triat. Em puc donar de baixa quan vulgui."],
  ["consent.privacy", "Política de privacidad (en español)", "Privacy policy (in Spanish)", "Politique de confidentialité (en espagnol)", "Datenschutzerklärung (auf Spanisch)", "Informativa sulla privacy (in spagnolo)", "Política de privacidade (em espanhol)", "Política de privacitat (en castellà)"],
  ["consent.needs", "Para activar el permiso elige al menos un aeropuerto y la frecuencia.", "To turn this on, choose at least one airport and how often.", "Pour l’activer, choisissez au moins un aéroport et la fréquence.", "Zum Aktivieren wähle mindestens einen Flughafen und die Häufigkeit.", "Per attivarlo scegli almeno un aeroporto e la frequenza.", "Para ativar, escolha pelo menos um aeroporto e a frequência.", "Per activar-ho, tria almenys un aeroport i la freqüència."],
  ["consent.recorded", "Permiso registrado el {date}.", "Permission recorded on {date}.", "Autorisation enregistrée le {date}.", "Einwilligung am {date} gespeichert.", "Consenso registrato il {date}.", "Autorização registada em {date}.", "Permís registrat el {date}."],
  ["consent.withdrawn", "Permiso retirado el {date}.", "Permission withdrawn on {date}.", "Autorisation retirée le {date}.", "Einwilligung am {date} widerrufen.", "Consenso revocato il {date}.", "Autorização retirada em {date}.", "Permís retirat el {date}."],
  ["save", "Guardar", "Save", "Enregistrer", "Speichern", "Salva", "Guardar", "Desa"],
  ["saving", "Guardando…", "Saving…", "Enregistrement…", "Wird gespeichert…", "Salvataggio…", "A guardar…", "Desant…"],
  ["saved", "Guardado.", "Saved.", "Enregistré.", "Gespeichert.", "Salvato.", "Guardado.", "Desat."],
  ["saveError", "No se ha podido guardar. Inténtalo de nuevo.", "We couldn’t save. Please try again.", "Impossible d’enregistrer. Réessayez.", "Speichern nicht möglich. Bitte versuche es erneut.", "Impossibile salvare. Riprova.", "Não foi possível guardar. Tente novamente.", "No s’ha pogut desar. Torna-ho a provar."],
  ["loading", "Cargando tus preferencias…", "Loading your preferences…", "Chargement de vos préférences…", "Deine Einstellungen werden geladen…", "Caricamento delle tue preferenze…", "A carregar as suas preferências…", "Carregant les teves preferències…"],
  ["loadError", "No se han podido cargar tus preferencias.", "We couldn’t load your preferences.", "Impossible de charger vos préférences.", "Deine Einstellungen konnten nicht geladen werden.", "Impossibile caricare le tue preferenze.", "Não foi possível carregar as suas preferências.", "No s’han pogut carregar les teves preferències."],
  ["retry", "Reintentar", "Try again", "Réessayer", "Erneut versuchen", "Riprova", "Tentar novamente", "Torna-ho a provar"],
  ["delete", "Borrar mis respuestas", "Delete my answers", "Supprimer mes réponses", "Meine Antworten löschen", "Elimina le mie risposte", "Apagar as minhas respostas", "Esborra les meves respostes"],
  ["deleting", "Borrando…", "Deleting…", "Suppression…", "Wird gelöscht…", "Eliminazione…", "A apagar…", "Esborrant…"],
  ["deleted", "Tus respuestas se han borrado.", "Your answers have been deleted.", "Vos réponses ont été supprimées.", "Deine Antworten wurden gelöscht.", "Le tue risposte sono state eliminate.", "As suas respostas foram apagadas.", "Les teves respostes s’han esborrat."],
  ["deleteError", "No se han podido borrar. Inténtalo de nuevo.", "We couldn’t delete them. Please try again.", "Impossible de les supprimer. Réessayez.", "Löschen nicht möglich. Bitte versuche es erneut.", "Impossibile eliminarle. Riprova.", "Não foi possível apagar. Tente novamente.", "No s’han pogut esborrar. Torna-ho a provar."],
] as const;

export type EmailTextKey = typeof rows[number][0];

/** Filas sin tratar, para las pruebas (que comprueban que no falta ningún idioma). */
export const EMAIL_TEXT_ROWS: ReadonlyArray<readonly string[]> = rows;

const dictionaries = Object.fromEntries(locales.map((locale, index) => [
  locale.code, Object.fromEntries(rows.map((row) => [row[0], row[index + 1]])),
])) as Record<Locale, Partial<Record<EmailTextKey, string>>>;

export function emailText(locale: Locale, key: EmailTextKey, variables: Variables = {}): string {
  const template = dictionaries[locale]?.[key] || dictionaries.es[key] || key;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => String(variables[name] ?? match));
}
