// Words the guided chat recognises, in the seven languages of the site. Everything is already normalised the same way as
// `normalizeDestinationName` (lower case, no accents, only a-z0-9 and single spaces), so it can be compared with the
// normalised message directly. Unknown words are never guessed: they simply do not match.

export type ChatTopicKey = 'beach' | 'mountain' | 'snow' | 'museums' | 'history' | 'nature' | 'islands' | 'lakes'
  | 'food' | 'culture' | 'north' | 'spa';
export type ChatSeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASONS: Record<ChatSeasonKey, { months: number[]; words: string[] }> = {
  spring: { months: [3, 4, 5], words: ['primavera', 'spring', 'printemps', 'fruhling'] },
  summer: { months: [6, 7, 8], words: ['verano', 'summer', 'ete', 'sommer', 'estate', 'verao', 'estiu'] },
  autumn: { months: [9, 10, 11], words: ['otono', 'autumn', 'automne', 'herbst', 'autunno', 'outono', 'tardor'] },
  winter: { months: [12, 1, 2], words: ['invierno', 'winter', 'hiver', 'inverno', 'hivern'] },
};

/**
 * `words` are what a visitor may type. `catalog` are the (Spanish) words searched in the catalogue's own texts, which always
 * carry the Spanish description and recommendations, so a Spanish search word works for every language.
 */
export const TOPICS: { key: ChatTopicKey; words: string[]; catalog: string[] }[] = [
  { key: 'beach', catalog: ['playa', 'costa'], words: ['playa', 'playas', 'platja', 'platges', 'plage', 'plages', 'spiaggia', 'spiagge', 'praia', 'praias', 'beach', 'beaches', 'strand', 'strande'] },
  { key: 'mountain', catalog: ['montan'], words: ['montana', 'montanas', 'muntanya', 'muntanyes', 'mountain', 'mountains', 'montagne', 'montagnes', 'berg', 'berge', 'gebirge', 'montagna', 'montanha', 'montanhas'] },
  { key: 'snow', catalog: ['nieve', 'esqui'], words: ['nieve', 'esqui', 'esquiar', 'snow', 'ski', 'skiing', 'neige', 'schnee', 'skifahren', 'neve', 'sci', 'sciare'] },
  { key: 'museums', catalog: ['museo', 'arte'], words: ['museo', 'museos', 'museu', 'museus', 'museum', 'museums', 'musee', 'musees', 'museen', 'arte', 'art', 'kunst'] },
  { key: 'history', catalog: ['histor', 'castillo', 'catedral', 'patrimonio'], words: ['historia', 'historico', 'historic', 'history', 'historical', 'histoire', 'historique', 'geschichte', 'historisch', 'storia', 'storico', 'castillo', 'castillos', 'castell', 'castells', 'castle', 'castles', 'chateau', 'chateaux', 'burg', 'burgen', 'schloss', 'schlosser', 'castello', 'castelli', 'castelo', 'castelos', 'catedral', 'catedrales', 'cathedral', 'cathedrale', 'kathedrale', 'cattedrale'] },
  { key: 'nature', catalog: ['sender', 'natural', 'paisaje', 'parque'], words: ['naturaleza', 'natura', 'nature', 'natur', 'senderismo', 'hiking', 'trekking', 'randonnee', 'wandern', 'escursionismo', 'caminhadas', 'excursionisme', 'paisaje', 'paisajes', 'landscape', 'landscapes', 'paysage', 'paysages', 'landschaft', 'paesaggio', 'paesaggi', 'paisagem', 'paisagens'] },
  { key: 'islands', catalog: ['isla'], words: ['isla', 'islas', 'illa', 'illes', 'island', 'islands', 'ile', 'iles', 'insel', 'inseln', 'isola', 'isole', 'ilha', 'ilhas'] },
  { key: 'lakes', catalog: ['lago'], words: ['lago', 'lagos', 'llac', 'llacs', 'lake', 'lakes', 'lac', 'lacs', 'laghi'] },
  { key: 'food', catalog: ['gastronom', 'vino', 'mercad'], words: ['gastronomia', 'comida', 'food', 'cuisine', 'gastronomie', 'essen', 'kuche', 'cucina', 'cozinha', 'menjar', 'cuina', 'vino', 'vinos', 'wine', 'wines', 'vin', 'vins', 'wein', 'weine', 'vinho', 'vinhos', 'mercado', 'mercados', 'market', 'markets', 'marche', 'marches', 'markt', 'markte', 'mercato', 'mercati'] },
  { key: 'culture', catalog: ['cultura'], words: ['cultura', 'cultural', 'culture', 'kultur'] },
  { key: 'north', catalog: ['aurora', 'fiordo'], words: ['aurora', 'auroras', 'aurore', 'polarlicht', 'nordlicht', 'fiordo', 'fiordos', 'fjord', 'fjords', 'fiord', 'fiords', 'fjorde'] },
  { key: 'spa', catalog: ['termal'], words: ['termal', 'termales', 'termas', 'thermal', 'spa', 'thermes', 'thermen', 'terme', 'balneario'] },
];

/** A message with any of these also gets the honest note: the chat has no prices and no availability. */
export const PRICE_WORDS = [
  'precio', 'precios', 'cuesta', 'cuestan', 'barato', 'baratos', 'barata', 'baratas', 'caro', 'presupuesto', 'euro', 'euros', 'eur', 'billete', 'billetes',
  'vuelo', 'vuelos', 'hotel', 'hoteles', 'alojamiento', 'reservar', 'reserva', 'oferta', 'ofertas', 'disponibilidad',
  'price', 'prices', 'cost', 'costs', 'cheap', 'budget', 'fare', 'fares', 'flight', 'flights', 'hotels', 'booking', 'availability', 'ticket', 'tickets',
  'prix', 'coute', 'cher', 'vol', 'vols', 'reserver', 'disponibilite', 'billets',
  'preis', 'preise', 'kostet', 'billig', 'flug', 'fluge', 'buchen', 'verfugbarkeit',
  'prezzo', 'prezzi', 'costano', 'economico', 'volo', 'voli', 'albergo', 'alberghi', 'prenotare', 'disponibilita', 'biglietto', 'biglietti',
  'preco', 'precos', 'custa', 'orcamento', 'voo', 'voos', 'hoteis', 'disponibilidade', 'bilhete', 'bilhetes',
  'preu', 'preus', 'barat', 'pressupost', 'disponibilitat',
];

export const GREETINGS = [
  'hola', 'buenas', 'buenos dias', 'buenas tardes', 'hello', 'hi', 'hey', 'good morning', 'bonjour', 'salut', 'bonsoir', 'hallo', 'guten tag', 'ciao', 'buongiorno',
  'ola', 'bom dia', 'boa tarde', 'bon dia', 'bona tarda', 'ayuda', 'help', 'aide', 'hilfe', 'aiuto', 'ajuda',
];

/**
 * Phrases of a visitor who has not decided where to go («no sé dónde ir», «surprise me»). They only count when the message
 * names no destination, country, month, season or topic. Normalised like the rest (no accents; «ß» and apostrophes become
 * spaces, so «weiß» reads «wei» and «don't» reads «don t»).
 */
export const UNDECIDED = [
  'no se donde ir', 'no se a donde ir', 'no se adonde ir', 'no se donde viajar', 'no se a donde viajar', 'no se que destino', 'no se que visitar',
  'donde ir', 'a donde ir', 'adonde ir', 'donde viajar', 'a donde viajar', 'donde puedo ir', 'a donde puedo ir', 'donde puedo viajar',
  'recomiendame un destino', 'que me recomiendas', 'que me recomienda', 'que destino me recomiendas', 'que destino elegir', 'sugiereme un destino',
  'sorprendeme', 'inspirame', 'ideas de viaje', 'ideas de viajes', 'ideas para viajar', 'quiero viajar', 'quiero irme de viaje', 'quiero escaparme',
  'know where to go', 'know where to travel', 'where to go', 'where should i go', 'where can i go', 'where to travel', 'where should i travel',
  'surprise me', 'inspire me', 'recommend me a destination', 'recommend a destination', 'suggest a destination', 'what do you recommend',
  'what would you recommend', 'travel ideas', 'trip ideas', 'i want to travel', 'i d like to travel',
  'je ne sais pas ou aller', 'je ne sais pas ou partir', 'ou aller', 'ou partir', 'ou voyager', 'surprenez moi', 'surprends moi', 'inspirez moi',
  'que me conseillez vous', 'que me recommandez vous', 'conseillez moi une destination', 'idees de voyage', 'idees de voyages', 'je veux voyager',
  'ich wei nicht wohin', 'ich weiss nicht wohin', 'wei noch nicht wohin', 'weiss noch nicht wohin', 'wohin reisen', 'wohin soll ich', 'wohin fahren',
  'uberrasch mich', 'inspiriere mich', 'was empfiehlst du', 'empfiehl mir ein reiseziel', 'reiseideen', 'ich mochte reisen', 'ich will reisen',
  'non so dove andare', 'dove andare', 'dove viaggiare', 'dove posso andare', 'sorprendimi', 'ispirami', 'cosa mi consigli', 'consigliami una destinazione',
  'idee di viaggio', 'idee per viaggiare', 'voglio viaggiare',
  'nao sei para onde ir', 'nao sei onde ir', 'para onde ir', 'onde ir', 'onde viajar', 'para onde posso ir', 'onde posso ir', 'surpreende me', 'surpreenda me',
  'inspira me', 'o que me recomenda', 'o que me recomendas', 'recomenda me um destino', 'ideias de viagem', 'quero viajar',
  'no se on anar', 'on anar', 'on viatjar', 'on puc anar', 'sorpren me', 'inspira m', 'que em recomanes', 'que em recomaneu', 'recomana m un desti',
  'idees de viatge', 'vull viatjar',
];

export const RELATIVE_MONTH = {
  current: ['este mes', 'this month', 'ce mois', 'ce mois ci', 'diesen monat', 'dieses monat', 'dieser monat', 'questo mese', 'neste mes', 'aquest mes'],
  next: ['proximo mes', 'mes que viene', 'next month', 'mois prochain', 'nachsten monat', 'nachster monat', 'prossimo mese', 'mese prossimo', 'mes que vem', 'proper mes', 'mes que ve'],
};

/** Short extra aliases of countries that the localised country names do not cover. */
export const COUNTRY_ALIASES: Record<string, string[]> = {
  GB: ['uk', 'inglaterra', 'england', 'escocia', 'scotland', 'angleterre', 'ecosse', 'schottland', 'inghilterra', 'scozia', 'anglaterra'],
  NL: ['holanda', 'holland', 'hollande', 'olanda', 'holanda'],
  CZ: ['republica checa', 'czech republic', 'tchequie', 'tschechien', 'repubblica ceca', 'republica txeca'],
};
