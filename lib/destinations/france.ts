import type { Locale } from '@/lib/i18n/translations';
import type { DestinationProfile, DestinationText } from './types';

// Source and license metadata verified through Wikimedia Commons imageinfo (2026-10-20).
const images = {
  "nice": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/62/Nice_from_Castle_Hill_01.jpg/960px-Nice_from_Castle_Hill_01.jpg",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Nice_from_Castle_Hill_01.jpg",
    "imageCredit": "Spike",
    "imageLicense": "CC BY-SA 4.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "lyon": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Lyon_Panorama_Saint-Jean_Part-Dieu_Fourvi%C3%A8re_Saone.JPG/960px-Lyon_Panorama_Saint-Jean_Part-Dieu_Fourvi%C3%A8re_Saone.JPG",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Lyon_Panorama_Saint-Jean_Part-Dieu_Fourvi%C3%A8re_Saone.JPG",
    "imageCredit": "Xavier Caré",
    "imageLicense": "CC BY-SA 3.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  },
  "marseille": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Marseille_Vieux_Port_Night.jpg/960px-Marseille_Vieux_Port_Night.jpg",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Marseille_Vieux_Port_Night.jpg",
    "imageCredit": "Benh LIEU SONG",
    "imageLicense": "CC BY-SA 3.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  },
  "bordeaux": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8e/Panorama_Place_de_la_Bourse_Bordeaux.jpg/960px-Panorama_Place_de_la_Bourse_Bordeaux.jpg",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Panorama_Place_de_la_Bourse_Bordeaux.jpg",
    "imageCredit": "AirScott",
    "imageLicense": "CC BY-SA 4.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "strasbourg": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/Stra%C3%9Fburg_%28Frankreich%29%2C_Petite_France_--_2011_--_1759.jpg/960px-Stra%C3%9Fburg_%28Frankreich%29%2C_Petite_France_--_2011_--_1759.jpg",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Stra%C3%9Fburg_(Frankreich),_Petite_France_--_2011_--_1759.jpg",
    "imageCredit": "Dietmar Rabich",
    "imageLicense": "CC BY-SA 4.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "toulouse": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1e/Panorama_Capitole_de_Toulouse.jpg/960px-Panorama_Capitole_de_Toulouse.jpg",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Panorama_Capitole_de_Toulouse.jpg",
    "imageCredit": "PierreSelim",
    "imageLicense": "CC BY 3.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by/3.0"
  },
  "annecy": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Annecy_Palais_de_lIsle_01.JPG/960px-Annecy_Palais_de_lIsle_01.JPG",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Annecy_Palais_de_lIsle_01.JPG",
    "imageCredit": "Zairon",
    "imageLicense": "CC BY-SA 3.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  },
  "chamonix": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/31/Panorama_of_Mont_Blanc_du_Tacul%2C_Mont_Maudit_and_Mont_Blanc_from_Aiguille_du_Midi%2C_Chamonix%2C_Haute-Savoie.jpg/960px-Panorama_of_Mont_Blanc_du_Tacul%2C_Mont_Maudit_and_Mont_Blanc_from_Aiguille_du_Midi%2C_Chamonix%2C_Haute-Savoie.jpg",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Panorama_of_Mont_Blanc_du_Tacul,_Mont_Maudit_and_Mont_Blanc_from_Aiguille_du_Midi,_Chamonix,_Haute-Savoie.jpg",
    "imageCredit": "Christian David",
    "imageLicense": "CC BY-SA 4.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "mont-saint-michel": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Clo%C3%AEtre_Abbaye_du_Mont_Saint-Michel_2015-05-28.jpg/960px-Clo%C3%AEtre_Abbaye_du_Mont_Saint-Michel_2015-05-28.jpg",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Clo%C3%AEtre_Abbaye_du_Mont_Saint-Michel_2015-05-28.jpg",
    "imageCredit": "Benh LIEU SONG (Flickr)",
    "imageLicense": "CC BY-SA 4.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by-sa/4.0"
  },
  "nantes": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Panorama_tour_du_chateau_des_ducs.jpg/960px-Panorama_tour_du_chateau_des_ducs.jpg",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Panorama_tour_du_chateau_des_ducs.jpg",
    "imageCredit": "Elie Métayer",
    "imageLicense": "CC BY-SA 3.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  },
  "lille": {
    "image": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Grand-Place_Lille_panorama.jpg/960px-Grand-Place_Lille_panorama.jpg",
    "imageSource": "https://commons.wikimedia.org/wiki/File:Grand-Place_Lille_panorama.jpg",
    "imageCredit": "Camster2",
    "imageLicense": "CC BY-SA 3.0",
    "imageLicenseUrl": "https://creativecommons.org/licenses/by-sa/3.0"
  }
};

// Catalog starts here.
type TextRow = [name: string, description: string, recommendations: DestinationText['recommendations']];
type Note = Record<Locale, string>;
const days: Record<Locale, string> = { es: 'días', en: 'days', fr: 'jours', de: 'Tage', it: 'giorni', pt: 'dias', ca: 'dies' };
const notes: Record<'city' | 'coast' | 'strasbourg' | 'lake' | 'mountain' | 'bay', Note> = {
  city: {
    es: 'Primavera y principios de otoño favorecen los paseos. Vacaciones, puentes y grandes eventos pueden aumentar la afluencia; reserva las visitas con antelación.',
    en: 'Spring and early autumn suit city walks. Holidays, long weekends and major events can attract crowds; book visits ahead.',
    fr: 'Le printemps et le début de l’automne se prêtent aux promenades. Vacances, ponts et grands événements peuvent attirer du monde ; anticipez les visites.',
    de: 'Frühling und früher Herbst eignen sich für Stadtspaziergänge. Ferien, verlängerte Wochenenden und Großveranstaltungen können viele Besucher anziehen; Besichtigungen vorausplanen.',
    it: 'Primavera e inizio autunno sono adatti alle passeggiate. Vacanze, ponti e grandi eventi possono attirare molte persone; prenota le visite in anticipo.',
    pt: 'A primavera e o início do outono favorecem os passeios. Férias, pontes e grandes eventos podem atrair mais visitantes; planeie as visitas com antecedência.',
    ca: 'La primavera i l’inici de la tardor afavoreixen les passejades. Vacances, ponts i grans esdeveniments poden atreure més visitants; reserva les visites amb antelació.',
  },
  coast: {
    es: 'Primavera y septiembre permiten combinar ciudad y costa. Julio y agosto suelen tener más visitantes y calor. Comprueba las condiciones de acceso a espacios naturales.',
    en: 'Spring and September suit a city-and-coast visit. July and August tend to be busier and hotter. Check access conditions for natural areas.',
    fr: 'Le printemps et septembre permettent de combiner ville et littoral. Juillet et août sont souvent plus fréquentés et chauds. Vérifiez les conditions d’accès aux espaces naturels.',
    de: 'Frühling und September eignen sich für Stadt und Küste. Juli und August sind oft voller und heißer. Zugangsbedingungen zu Naturgebieten prüfen.',
    it: 'Primavera e settembre permettono di unire città e costa. Luglio e agosto tendono a essere più affollati e caldi. Verifica gli accessi alle aree naturali.',
    pt: 'A primavera e setembro permitem combinar cidade e costa. Julho e agosto costumam ter mais visitantes e calor. Verifique as condições de acesso às áreas naturais.',
    ca: 'La primavera i el setembre permeten combinar ciutat i costa. El juliol i l’agost solen tenir més visitants i calor. Comprova l’accés als espais naturals.',
  },
  strasbourg: {
    es: 'Primavera y septiembre son adecuados para pasear. Los mercados navideños atraen mucha afluencia en noviembre y diciembre; consulta sus fechas oficiales.',
    en: 'Spring and September suit walking. Christmas markets attract crowds in November and December; check their official dates.',
    fr: 'Le printemps et septembre se prêtent aux promenades. Les marchés de Noël attirent de nombreux visiteurs en novembre et décembre ; vérifiez les dates officielles.',
    de: 'Frühling und September eignen sich für Spaziergänge. Weihnachtsmärkte ziehen im November und Dezember viele Besucher an; offizielle Termine prüfen.',
    it: 'Primavera e settembre sono adatti alle passeggiate. I mercatini natalizi attirano molti visitatori a novembre e dicembre; consulta le date ufficiali.',
    pt: 'A primavera e setembro favorecem os passeios. Os mercados de Natal atraem muitos visitantes em novembro e dezembro; consulte as datas oficiais.',
    ca: 'La primavera i el setembre són adequats per passejar. Els mercats de Nadal atreuen molts visitants al novembre i desembre; consulta les dates oficials.',
  },
  lake: {
    es: 'De mayo a septiembre se puede disfrutar del lago; el verano suele ser más concurrido. Ginebra y Lyon son aeropuertos de acceso con traslado terrestre; el aeródromo local es de aviación de negocios.',
    en: 'May to September suits the lake; summer tends to be busier. Geneva and Lyon are access airports requiring ground transfers; the local airfield serves business aviation.',
    fr: 'De mai à septembre, profitez du lac ; l’été est souvent plus fréquenté. Genève et Lyon nécessitent un transfert terrestre ; l’aéroport local est dédié à l’aviation d’affaires.',
    de: 'Mai bis September eignet sich für den See; im Sommer ist es oft voller. Genf und Lyon erfordern einen Landtransfer; der örtliche Flugplatz dient der Geschäftsfliegerei.',
    it: 'Da maggio a settembre si può godere del lago; l’estate è spesso più affollata. Ginevra e Lione richiedono un trasferimento via terra; lo scalo locale serve l’aviazione d’affari.',
    pt: 'De maio a setembro pode desfrutar do lago; o verão costuma ser mais concorrido. Genebra e Lyon exigem transporte terrestre; o aeródromo local serve a aviação de negócios.',
    ca: 'De maig a setembre es pot gaudir del llac; l’estiu sol ser més concorregut. Ginebra i Lió requereixen trasllat terrestre; l’aeròdrom local és d’aviació de negocis.',
  },
  mountain: {
    es: 'Verano para senderismo e invierno para nieve, según condiciones. Consulta meteorología, apertura de remontes y estado de senderos. No hay aeropuerto comercial propio; Ginebra o Lyon requieren traslado terrestre.',
    en: 'Summer suits hiking and winter snow activities, conditions permitting. Check weather, lift openings and trails. There is no local commercial airport; Geneva or Lyon require ground transfers.',
    fr: 'Randonnée en été et neige en hiver, selon les conditions. Vérifiez météo, remontées et sentiers. Pas d’aéroport commercial sur place ; Genève ou Lyon nécessitent un transfert terrestre.',
    de: 'Wandern im Sommer und Schneeaktivitäten im Winter, je nach Bedingungen. Wetter, Liftbetrieb und Wege prüfen. Kein eigener Verkehrsflughafen; Genf oder Lyon erfordern einen Landtransfer.',
    it: 'Escursioni in estate e neve in inverno, secondo le condizioni. Verifica meteo, impianti e sentieri. Nessun aeroporto commerciale locale; Ginevra o Lione richiedono un trasferimento via terra.',
    pt: 'Caminhadas no verão e neve no inverno, conforme as condições. Consulte meteorologia, teleféricos e trilhos. Não há aeroporto comercial local; Genebra ou Lyon exigem transporte terrestre.',
    ca: 'Senderisme a l’estiu i neu a l’hivern, segons les condicions. Consulta el temps, els remuntadors i els senders. No hi ha aeroport comercial propi; Ginebra o Lió requereixen trasllat terrestre.',
  },
  bay: {
    es: 'Primavera y septiembre permiten evitar parte de la afluencia estival. Consulta mareas y acceso a la abadía; recorre la bahía con un guía. No hay aeropuerto propio: Rennes requiere traslado terrestre.',
    en: 'Spring and September can avoid some summer crowds. Check tides and abbey access; explore the bay with a guide. There is no local airport: Rennes requires a ground transfer.',
    fr: 'Le printemps et septembre permettent d’éviter une partie des foules estivales. Vérifiez marées et accès à l’abbaye ; traversez la baie avec un guide. Pas d’aéroport sur place : transfert terrestre depuis Rennes.',
    de: 'Frühling und September können weniger voll als der Sommer sein. Gezeiten und Abteizugang prüfen; die Bucht mit Führung erkunden. Kein eigener Flughafen: Landtransfer ab Rennes erforderlich.',
    it: 'Primavera e settembre permettono di evitare parte della folla estiva. Consulta maree e accesso all’abbazia; visita la baia con una guida. Nessun aeroporto locale: trasferimento via terra da Rennes.',
    pt: 'A primavera e setembro permitem evitar parte da afluência do verão. Consulte marés e acesso à abadia; visite a baía com guia. Não há aeroporto local: transporte terrestre desde Rennes.',
    ca: 'La primavera i el setembre permeten evitar part de l’afluència estival. Consulta marees i accés a l’abadia; recorre la badia amb guia. No hi ha aeroport propi: cal trasllat terrestre des de Rennes.',
  },
};

type Seed = Pick<DestinationProfile, 'id' | 'slug' | 'airports' | 'metropolitanCodes' | 'iataCodes' | 'bestMonths' | 'lowSeasonMonths' | 'highSeasonMonths'> &
  { accessAirports?: DestinationProfile['accessAirports']; aliases?: string[] };
function destination(seed: Seed, image: Pick<DestinationProfile, 'image'> & Partial<DestinationProfile>, stay: string,
  note: Note, rows: Record<Locale, TextRow>): DestinationProfile {
  const translations = Object.fromEntries(Object.entries(rows).map(([locale, [name, description, recommendations]]) =>
    [locale, { name, description, recommendations, recommendedStay: `${stay} ${days[locale as Locale]}`, seasonalityNote: note[locale as Locale] }])) as Record<Locale, DestinationText>;
  return { ...image, ...seed, countryCode: 'FR', country: 'Francia', publication: { status: 'draft' },
    ...translations.es, translations,
    aliases: Array.from(new Set([...(seed.aliases ?? []), ...Object.values(translations).map(text => text.name)])) };
}
const geneva = { iataCode: 'GVA', name: 'Genève', countryCode: 'CH' };
const lyon = { iataCode: 'LYS', name: 'Lyon-Saint Exupéry', countryCode: 'FR' };

/** One tourist profile per destination. Access airports never become tourist identities or pricing codes. */
export const franceDestinations: DestinationProfile[] = [
  destination({ id: 'fr-paris', slug: 'paris', airports: [{ iataCode: 'CDG' }, { iataCode: 'ORY' }, { iataCode: 'BVA' }],
    metropolitanCodes: ['PAR'], iataCodes: ['PAR', 'CDG', 'ORY', 'BVA'], bestMonths: [4,5,6,9,10], lowSeasonMonths: [1,2,11], highSeasonMonths: [7,8,12] },
    { image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' }, '3–4', notes.city, {
    es: ['París', 'Arte, gastronomía, historia y algunos de los rincones más románticos de Europa. Jardines, terrazas y paseos junto al Sena, con Notre-Dame en la Île de la Cité.', ['Torre Eiffel','Museo del Louvre','Montmartre','Crucero por el Sena']],
    en: ['Paris', 'Art, food and history beside the Seine, with gardens, café terraces and Notre-Dame on the Île de la Cité.', ['Eiffel Tower','Louvre Museum','Montmartre','Seine river cruise']],
    fr: ['Paris', 'Art, gastronomie et histoire au bord de la Seine, entre jardins, terrasses et Notre-Dame sur l’île de la Cité.', ['Tour Eiffel','Musée du Louvre','Montmartre','Croisière sur la Seine']],
    de: ['Paris', 'Kunst, Gastronomie und Geschichte an der Seine, mit Gärten, Caféterrassen und Notre-Dame auf der Île de la Cité.', ['Eiffelturm','Louvre','Montmartre','Seine-Bootsfahrt']],
    it: ['Parigi', 'Arte, gastronomia e storia lungo la Senna, tra giardini, terrazze e Notre-Dame sull’Île de la Cité.', ['Torre Eiffel','Museo del Louvre','Montmartre','Crociera sulla Senna']],
    pt: ['Paris', 'Arte, gastronomia e história junto ao Sena, entre jardins, esplanadas e Notre-Dame na Île de la Cité.', ['Torre Eiffel','Museu do Louvre','Montmartre','Cruzeiro no Sena']],
    ca: ['París', 'Art, gastronomia i història al costat del Sena, entre jardins, terrasses i Notre-Dame a l’Île de la Cité.', ['Torre Eiffel','Museu del Louvre','Montmartre','Creuer pel Sena']],
  }),
  destination({ id: 'fr-nice', slug: 'nice', airports: [{ iataCode: 'NCE' }], metropolitanCodes: [], iataCodes: ['NCE'],
    bestMonths: [4,5,6,9,10], lowSeasonMonths: [1,2,11], highSeasonMonths: [7,8] }, images.nice, '2–3', notes.coast, {
    es: ['Niza','Paseos mediterráneos, mercados del casco antiguo y museos de arte en la Costa Azul.', ['Promenade des Anglais','Vieux Nice','Colina del Castillo','Museo Matisse']],
    en: ['Nice','Mediterranean walks, old-town markets and art museums on the French Riviera.', ['Promenade des Anglais','Vieux Nice','Castle Hill','Matisse Museum']],
    fr: ['Nice','Promenades méditerranéennes, marchés du Vieux-Nice et musées d’art sur la Côte d’Azur.', ['Promenade des Anglais','Vieux-Nice','Colline du Château','Musée Matisse']],
    de: ['Nizza','Mediterrane Spaziergänge, Altstadtmärkte und Kunstmuseen an der Côte d’Azur.', ['Promenade des Anglais','Vieux Nice','Schlosshügel','Matisse-Museum']],
    it: ['Nizza','Passeggiate mediterranee, mercati della città vecchia e musei d’arte sulla Costa Azzurra.', ['Promenade des Anglais','Vieux Nice','Collina del Castello','Museo Matisse']],
    pt: ['Nice','Passeios mediterrânicos, mercados da cidade velha e museus de arte na Côte d’Azur.', ['Promenade des Anglais','Vieux Nice','Colina do Castelo','Museu Matisse']],
    ca: ['Niça','Passejades mediterrànies, mercats del nucli antic i museus d’art a la Costa Blava.', ['Promenade des Anglais','Vieux Nice','Turó del Castell','Museu Matisse']],
  }),
  destination({ id: 'fr-lyon', slug: 'lyon', airports: [{ iataCode: 'LYS' }], metropolitanCodes: [], iataCodes: ['LYS'],
    bestMonths: [4,5,6,9,10], lowSeasonMonths: [1,2,11], highSeasonMonths: [7,8,12] }, images.lyon, '2–3', notes.city, {
    es: ['Lyon','Barrios históricos, pasajes entre patios y gastronomía entre el Ródano y el Saona.', ['Vieux Lyon','Basílica de Fourvière','Parc de la Tête d’Or','Traboules de Croix-Rousse']],
    en: ['Lyon','Historic neighbourhoods, courtyard passageways and food traditions between the Rhône and Saône.', ['Vieux Lyon','Fourvière Basilica','Parc de la Tête d’Or','Croix-Rousse traboules']],
    fr: ['Lyon','Quartiers historiques, passages entre cours et gastronomie entre Rhône et Saône.', ['Vieux Lyon','Basilique de Fourvière','Parc de la Tête d’Or','Traboules de la Croix-Rousse']],
    de: ['Lyon','Historische Viertel, Innenhofpassagen und Gastronomie zwischen Rhône und Saône.', ['Vieux Lyon','Basilika Fourvière','Parc de la Tête d’Or','Traboules der Croix-Rousse']],
    it: ['Lione','Quartieri storici, passaggi tra cortili e gastronomia tra Rodano e Saona.', ['Vieux Lyon','Basilica di Fourvière','Parc de la Tête d’Or','Traboules della Croix-Rousse']],
    pt: ['Lyon','Bairros históricos, passagens entre pátios e gastronomia entre o Ródano e o Saône.', ['Vieux Lyon','Basílica de Fourvière','Parc de la Tête d’Or','Traboules da Croix-Rousse']],
    ca: ['Lió','Barris històrics, passatges entre patis i gastronomia entre el Roine i el Saona.', ['Vieux Lyon','Basílica de Fourvière','Parc de la Tête d’Or','Traboules de la Croix-Rousse']],
  }),
  destination({ id: 'fr-marseille', slug: 'marseille', airports: [{ iataCode: 'MRS' }], metropolitanCodes: [], iataCodes: ['MRS'],
    bestMonths: [4,5,6,9,10], lowSeasonMonths: [1,2,11], highSeasonMonths: [7,8] }, images.marseille, '2–3', notes.coast, {
    es: ['Marsella','Puerto mediterráneo, barrios con historia y paisajes costeros junto al parque de las Calanques.', ['Vieux-Port','Barrio Le Panier','Mucem','Notre-Dame de la Garde']],
    en: ['Marseille','A Mediterranean harbour, historic neighbourhoods and coastal scenery beside the Calanques national park.', ['Vieux-Port','Le Panier','Mucem','Notre-Dame de la Garde']],
    fr: ['Marseille','Port méditerranéen, quartiers historiques et paysages littoraux près du parc des Calanques.', ['Vieux-Port','Le Panier','Mucem','Notre-Dame de la Garde']],
    de: ['Marseille','Mittelmeerhafen, historische Viertel und Küstenlandschaften am Nationalpark Calanques.', ['Vieux-Port','Le Panier','Mucem','Notre-Dame de la Garde']],
    it: ['Marsiglia','Porto mediterraneo, quartieri storici e paesaggi costieri vicino al parco delle Calanques.', ['Vieux-Port','Le Panier','Mucem','Notre-Dame de la Garde']],
    pt: ['Marselha','Porto mediterrânico, bairros históricos e paisagens costeiras junto ao parque das Calanques.', ['Vieux-Port','Le Panier','Mucem','Notre-Dame de la Garde']],
    ca: ['Marsella','Port mediterrani, barris històrics i paisatges costaners al costat del parc de les Calanques.', ['Vieux-Port','Le Panier','Mucem','Notre-Dame de la Garde']],
  }),
  destination({ id: 'fr-bordeaux', slug: 'bordeaux', airports: [{ iataCode: 'BOD' }], metropolitanCodes: [], iataCodes: ['BOD'],
    bestMonths: [4,5,6,9,10], lowSeasonMonths: [1,2,11], highSeasonMonths: [7,8] }, images.bordeaux, '2–3', notes.city, {
    es: ['Burdeos','Plazas monumentales, paseos junto al Garona y cultura del vino en Nueva Aquitania.', ['Place de la Bourse','Miroir d’eau','Cité du Vin','Barrio Saint-Pierre']],
    en: ['Bordeaux','Grand squares, riverside walks along the Garonne and wine culture in Nouvelle-Aquitaine.', ['Place de la Bourse','Miroir d’eau','Cité du Vin','Saint-Pierre district']],
    fr: ['Bordeaux','Places monumentales, promenades le long de la Garonne et culture du vin en Nouvelle-Aquitaine.', ['Place de la Bourse','Miroir d’eau','Cité du Vin','Quartier Saint-Pierre']],
    de: ['Bordeaux','Monumentale Plätze, Spaziergänge an der Garonne und Weinkultur in Nouvelle-Aquitaine.', ['Place de la Bourse','Miroir d’eau','Cité du Vin','Viertel Saint-Pierre']],
    it: ['Bordeaux','Piazze monumentali, passeggiate lungo la Garonna e cultura del vino in Nuova Aquitania.', ['Place de la Bourse','Miroir d’eau','Cité du Vin','Quartiere Saint-Pierre']],
    pt: ['Bordéus','Praças monumentais, passeios junto ao Garona e cultura do vinho na Nova Aquitânia.', ['Place de la Bourse','Miroir d’eau','Cité du Vin','Bairro Saint-Pierre']],
    ca: ['Bordeus','Places monumentals, passejades al costat del Garona i cultura del vi a Nova Aquitània.', ['Place de la Bourse','Miroir d’eau','Cité du Vin','Barri Saint-Pierre']],
  }),
  destination({ id: 'fr-strasbourg', slug: 'strasbourg', airports: [{ iataCode: 'SXB' }], metropolitanCodes: [], iataCodes: ['SXB'],
    bestMonths: [4,5,6,9,12], lowSeasonMonths: [1,2,3], highSeasonMonths: [7,8,11,12] }, images.strasbourg, '2–3', notes.strasbourg, {
    es: ['Estrasburgo','Canales, casas de entramado y patrimonio alsaciano alrededor de la Grande Île.', ['Catedral de Notre-Dame','Petite France','Ponts Couverts','Parc de l’Orangerie']],
    en: ['Strasbourg','Canals, timber-framed houses and Alsatian heritage around the Grande Île.', ['Notre-Dame Cathedral','Petite France','Ponts Couverts','Parc de l’Orangerie']],
    fr: ['Strasbourg','Canaux, maisons à colombages et patrimoine alsacien autour de la Grande Île.', ['Cathédrale Notre-Dame','Petite France','Ponts Couverts','Parc de l’Orangerie']],
    de: ['Straßburg','Kanäle, Fachwerkhäuser und elsässisches Kulturerbe rund um die Grande Île.', ['Straßburger Münster','Petite France','Gedeckte Brücken','Orangeriepark']],
    it: ['Strasburgo','Canali, case a graticcio e patrimonio alsaziano intorno alla Grande Île.', ['Cattedrale di Notre-Dame','Petite France','Ponts Couverts','Parc de l’Orangerie']],
    pt: ['Estrasburgo','Canais, casas de enxaimel e património alsaciano em torno da Grande Île.', ['Catedral de Notre-Dame','Petite France','Ponts Couverts','Parc de l’Orangerie']],
    ca: ['Estrasburg','Canals, cases d’entramat i patrimoni alsacià al voltant de la Grande Île.', ['Catedral de Notre-Dame','Petite France','Ponts Couverts','Parc de l’Orangerie']],
  }),
  destination({ id: 'fr-toulouse', slug: 'toulouse', airports: [{ iataCode: 'TLS' }], metropolitanCodes: [], iataCodes: ['TLS'],
    bestMonths: [4,5,6,9,10], lowSeasonMonths: [1,2,11], highSeasonMonths: [7,8] }, images.toulouse, '2–3', notes.city, {
    es: ['Toulouse','Arquitectura de ladrillo rosa, plazas animadas y paseos junto al Garona y el Canal du Midi.', ['Place du Capitole','Basílica de Saint-Sernin','Canal du Midi','Cité de l’espace']],
    en: ['Toulouse','Pink-brick architecture, lively squares and walks along the Garonne and Canal du Midi.', ['Place du Capitole','Saint-Sernin Basilica','Canal du Midi','Cité de l’espace']],
    fr: ['Toulouse','Architecture de brique rose, places animées et promenades le long de la Garonne et du canal du Midi.', ['Place du Capitole','Basilique Saint-Sernin','Canal du Midi','Cité de l’espace']],
    de: ['Toulouse','Rosa Backsteinarchitektur, belebte Plätze und Spaziergänge an Garonne und Canal du Midi.', ['Place du Capitole','Basilika Saint-Sernin','Canal du Midi','Cité de l’espace']],
    it: ['Tolosa','Architettura in mattoni rosa, piazze animate e passeggiate lungo Garonna e Canal du Midi.', ['Place du Capitole','Basilica di Saint-Sernin','Canal du Midi','Cité de l’espace']],
    pt: ['Toulouse','Arquitetura de tijolo rosa, praças animadas e passeios junto ao Garona e ao Canal du Midi.', ['Place du Capitole','Basílica de Saint-Sernin','Canal du Midi','Cité de l’espace']],
    ca: ['Tolosa','Arquitectura de maó rosa, places animades i passejades al costat del Garona i el Canal du Midi.', ['Place du Capitole','Basílica de Saint-Sernin','Canal du Midi','Cité de l’espace']],
  }),
  destination({ id: 'fr-annecy', slug: 'annecy', airports: [], metropolitanCodes: [], iataCodes: [], accessAirports: [geneva, lyon],
    bestMonths: [5,6,7,8,9], lowSeasonMonths: [1,2,11], highSeasonMonths: [7,8] }, images.annecy, '2–3', notes.lake, {
    es: ['Annecy','Canales del casco antiguo, patrimonio medieval y paseos entre el lago y las montañas.', ['Palais de l’Île','Castillo de Annecy','Lago de Annecy','Jardins de l’Europe']],
    en: ['Annecy','Old-town canals, medieval heritage and walks between the lake and the mountains.', ['Palais de l’Île','Annecy Castle','Lake Annecy','Jardins de l’Europe']],
    fr: ['Annecy','Canaux de la vieille ville, patrimoine médiéval et promenades entre lac et montagnes.', ['Palais de l’Île','Château d’Annecy','Lac d’Annecy','Jardins de l’Europe']],
    de: ['Annecy','Altstadtkanäle, mittelalterliches Erbe und Spaziergänge zwischen See und Bergen.', ['Palais de l’Île','Schloss Annecy','Lac d’Annecy','Jardins de l’Europe']],
    it: ['Annecy','Canali della città vecchia, patrimonio medievale e passeggiate tra lago e montagne.', ['Palais de l’Île','Castello di Annecy','Lago di Annecy','Jardins de l’Europe']],
    pt: ['Annecy','Canais da cidade velha, património medieval e passeios entre o lago e as montanhas.', ['Palais de l’Île','Castelo de Annecy','Lago de Annecy','Jardins de l’Europe']],
    ca: ['Annecy','Canals del nucli antic, patrimoni medieval i passejades entre el llac i les muntanyes.', ['Palais de l’Île','Castell d’Annecy','Llac d’Annecy','Jardins de l’Europe']],
  }),
  destination({ id: 'fr-chamonix', slug: 'chamonix', airports: [], metropolitanCodes: [], iataCodes: [], accessAirports: [geneva, lyon], aliases: ['Chamonix-Mont-Blanc'],
    bestMonths: [1,2,3,6,7,8,9,12], lowSeasonMonths: [4,5,10,11], highSeasonMonths: [1,2,7,8,12] }, images.chamonix, '3–4', notes.mountain, {
    es: ['Chamonix','Paisajes del macizo del Mont Blanc y actividades de montaña desde el fondo del valle.', ['Aiguille du Midi','Montenvers y Mer de Glace','Centro de Chamonix','Brévent']],
    en: ['Chamonix','Mont Blanc scenery and mountain activities from a base on the valley floor.', ['Aiguille du Midi','Montenvers and Mer de Glace','Chamonix town centre','Brévent']],
    fr: ['Chamonix','Paysages du massif du Mont-Blanc et activités de montagne depuis le fond de la vallée.', ['Aiguille du Midi','Montenvers et Mer de Glace','Centre de Chamonix','Brévent']],
    de: ['Chamonix','Landschaften des Mont-Blanc-Massivs und Bergaktivitäten vom Tal aus.', ['Aiguille du Midi','Montenvers und Mer de Glace','Ortszentrum von Chamonix','Brévent']],
    it: ['Chamonix','Paesaggi del massiccio del Monte Bianco e attività in montagna partendo dal fondovalle.', ['Aiguille du Midi','Montenvers e Mer de Glace','Centro di Chamonix','Brévent']],
    pt: ['Chamonix','Paisagens do maciço do Monte Branco e atividades de montanha a partir do vale.', ['Aiguille du Midi','Montenvers e Mer de Glace','Centro de Chamonix','Brévent']],
    ca: ['Chamonix','Paisatges del massís del Mont Blanc i activitats de muntanya des del fons de la vall.', ['Aiguille du Midi','Montenvers i Mer de Glace','Centre de Chamonix','Brévent']],
  }),
  destination({ id: 'fr-mont-saint-michel', slug: 'mont-saint-michel', airports: [], metropolitanCodes: [], iataCodes: [],
    accessAirports: [{ iataCode: 'RNS', name: 'Rennes-Saint-Jacques', countryCode: 'FR' }], aliases: ['Le Mont-Saint-Michel','Monte Saint-Michel'],
    bestMonths: [4,5,6,9,10], lowSeasonMonths: [1,2,11], highSeasonMonths: [7,8] }, images['mont-saint-michel'], '1–2', notes.bay, {
    es: ['Mont-Saint-Michel','Abadía medieval, calles del pueblo y paisajes de una bahía marcada por las mareas.', ['Abadía del Mont-Saint-Michel','Murallas del pueblo','Pasarela de acceso','Bahía con guía']],
    en: ['Mont-Saint-Michel','A medieval abbey, village streets and a tidal bay landscape.', ['Mont-Saint-Michel Abbey','Village ramparts','Access footbridge','Guided bay walk']],
    fr: ['Mont-Saint-Michel','Abbaye médiévale, ruelles du village et paysages d’une baie rythmée par les marées.', ['Abbaye du Mont-Saint-Michel','Remparts du village','Pont-passerelle','Baie avec un guide']],
    de: ['Mont-Saint-Michel','Mittelalterliche Abtei, Dorfgassen und eine von Gezeiten geprägte Bucht.', ['Abtei Mont-Saint-Michel','Dorfmauern','Zugangsbrücke','Geführte Buchtwanderung']],
    it: ['Mont-Saint-Michel','Abbazia medievale, vicoli del borgo e paesaggi di una baia modellata dalle maree.', ['Abbazia di Mont-Saint-Michel','Mura del borgo','Ponte passerella','Baia con guida']],
    pt: ['Mont-Saint-Michel','Abadia medieval, ruas da aldeia e paisagens de uma baía marcada pelas marés.', ['Abadia do Mont-Saint-Michel','Muralhas da aldeia','Ponte pedonal','Baía com guia']],
    ca: ['Mont-Saint-Michel','Abadia medieval, carrers del poble i paisatges d’una badia marcada per les marees.', ['Abadia del Mont-Saint-Michel','Muralles del poble','Passarel·la d’accés','Badia amb guia']],
  }),
  destination({ id: 'fr-nantes', slug: 'nantes', airports: [{ iataCode: 'NTE' }], metropolitanCodes: [], iataCodes: ['NTE'],
    bestMonths: [4,5,6,7,9,10], lowSeasonMonths: [1,2,11], highSeasonMonths: [7,8] }, images.nantes, '2–3', notes.city, {
    es: ['Nantes','Patrimonio del Loira, jardines y creatividad en una ciudad ligada a Julio Verne.', ['Castillo de los duques de Bretaña','Les Machines de l’île','Jardin des Plantes','Passage Pommeraye']],
    en: ['Nantes','Loire heritage, gardens and creativity in a city connected with Jules Verne.', ['Castle of the Dukes of Brittany','Les Machines de l’île','Jardin des Plantes','Passage Pommeraye']],
    fr: ['Nantes','Patrimoine ligérien, jardins et créativité dans une ville liée à Jules Verne.', ['Château des ducs de Bretagne','Les Machines de l’île','Jardin des Plantes','Passage Pommeraye']],
    de: ['Nantes','Loire-Kulturerbe, Gärten und Kreativität in der Heimatstadt von Jules Verne.', ['Schloss der Herzöge der Bretagne','Les Machines de l’île','Jardin des Plantes','Passage Pommeraye']],
    it: ['Nantes','Patrimonio della Loira, giardini e creatività in una città legata a Jules Verne.', ['Castello dei duchi di Bretagna','Les Machines de l’île','Jardin des Plantes','Passage Pommeraye']],
    pt: ['Nantes','Património do Loire, jardins e criatividade numa cidade ligada a Júlio Verne.', ['Castelo dos duques da Bretanha','Les Machines de l’île','Jardin des Plantes','Passage Pommeraye']],
    ca: ['Nantes','Patrimoni del Loira, jardins i creativitat en una ciutat vinculada a Jules Verne.', ['Castell dels ducs de Bretanya','Les Machines de l’île','Jardin des Plantes','Passage Pommeraye']],
  }),
  destination({ id: 'fr-lille', slug: 'lille', airports: [{ iataCode: 'LIL' }], metropolitanCodes: [], iataCodes: ['LIL'],
    bestMonths: [4,5,6,7,9], lowSeasonMonths: [1,2,11], highSeasonMonths: [7,8,9,12] }, images.lille, '2–3', notes.city, {
    es: ['Lille','Arquitectura de influencia flamenca, plazas y museos en el norte de Francia.', ['Grand-Place','Vieille Bourse','Vieux-Lille','Palais des Beaux-Arts']],
    en: ['Lille','Flemish-influenced architecture, squares and museums in northern France.', ['Grand-Place','Vieille Bourse','Vieux-Lille','Palais des Beaux-Arts']],
    fr: ['Lille','Architecture d’influence flamande, places et musées dans le nord de la France.', ['Grand-Place','Vieille Bourse','Vieux-Lille','Palais des Beaux-Arts']],
    de: ['Lille','Flämisch geprägte Architektur, Plätze und Museen in Nordfrankreich.', ['Grand-Place','Alte Börse','Vieux-Lille','Palais des Beaux-Arts']],
    it: ['Lille','Architettura di influenza fiamminga, piazze e musei nel nord della Francia.', ['Grand-Place','Vieille Bourse','Vieux-Lille','Palais des Beaux-Arts']],
    pt: ['Lille','Arquitetura de influência flamenga, praças e museus no norte de França.', ['Grand-Place','Vieille Bourse','Vieux-Lille','Palais des Beaux-Arts']],
    ca: ['Lilla','Arquitectura d’influència flamenca, places i museus al nord de França.', ['Grand-Place','Vieille Bourse','Vieux-Lille','Palais des Beaux-Arts']],
  }),
];
