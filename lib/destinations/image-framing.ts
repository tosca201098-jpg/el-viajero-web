/**
 * Phase 2 of the destination detail window: vertical framing of the photo inside the
 * common panoramic frame (`object-position`). Photos, credits, names and texts are not
 * touched and no destination data object changes: the detail window in `app/page.tsx` asks
 * `panoramicImagePosition` which part of the photo to show.
 *
 * - Only vertical positions are needed: a photo narrower than the frame (width/height
 *   below about 2.5) is cropped at the top and bottom, so the default 50% can cut a tower,
 *   a skyline or a castle.
 * - Values are "center N%" (0% = top of the photo, 100% = bottom, 50% = the old default),
 *   chosen one by one looking at the real photo in the panoramic frame.
 * - A destination that already defines its own `imagePosition` keeps it.
 * - The home cards never read this value.
 */
export type FramedDestination = { id?: string; image: string; imagePosition?: string };

/** Catalog destinations (and Paris, `fr-paris`), by id. */
export const imageFraming: Readonly<Record<string, string>> = {
  "ax-aland": "center 35%",
  "ba-banja-luka": "center 35%",
  "ba-sarajevo": "center 35%",
  "be-antwerp": "center 35%",
  "be-bruges": "center 30%",
  "be-mons": "center 35%",
  "bg-varna": "center 30%",
  "ch-bern": "center 35%",
  "ch-zurich": "center 30%",
  "cz-karlovy-vary": "center 35%",
  "cz-kutna-hora": "center 35%",
  "cz-olomouc": "center 35%",
  "cz-plzen": "center 35%",
  "de-berlin": "center 30%",
  "de-bremen": "center 35%",
  "de-frankfurt": "center 45%",
  "de-kassel": "center 20%",
  "de-muenster-osnabrueck": "center 30%",
  "de-rostock-baltic": "center 35%",
  "de-sylt": "center 35%",
  "dk-aarhus": "center 15%",
  "dk-bornholm": "center 33%",
  "dk-copenhagen": "center 30%",
  "es-a-coruna": "center 35%",
  "es-granada": "center 35%",
  "es-la-palma": "center 35%",
  "es-leon": "center 35%",
  "es-pamplona": "center 45%",
  "es-region-de-murcia": "center 30%",
  "es-san-sebastian": "center 35%",
  "es-santiago-de-compostela": "center 30%",
  "es-sevilla": "center 35%",
  "es-tenerife": "center 35%",
  "es-vitoria-gasteiz": "center 35%",
  "fr-beziers": "center 35%",
  "fr-caen": "center 35%",
  "fr-grenoble": "center 25%",
  "fr-le-puy-en-velay": "center 35%",
  "fr-montpellier": "center 35%",
  "fr-nantes": "center 30%",
  "fr-paris": "center 35%",
  "fr-perpignan": "center 35%",
  "fr-strasbourg": "center 35%",
  "gb-cardiff-south-wales": "center 35%",
  "gb-glasgow": "center 30%",
  "gb-hull-humberside": "center 30%",
  "gb-manchester": "center 30%",
  "gb-norwich": "center 55%",
  "gb-orkney": "center 60%",
  "gr-astypalaia": "center 15%",
  "gr-chios": "center 40%",
  "gr-corfu": "center 40%",
  "gr-karpathos": "center 55%",
  "gr-kasos": "center 40%",
  "gr-kastellorizo": "center 45%",
  "gr-kozani": "center 20%",
  "gr-kythira": "center 40%",
  "gr-leros": "center 40%",
  "gr-limnos": "center 55%",
  "gr-milos": "center 60%",
  "gr-mykonos": "center 30%",
  "gr-mytilene": "center 30%",
  "gr-naxos": "center 25%",
  "gr-paros": "center 45%",
  "gr-patras": "center 55%",
  "gr-santorini": "center 35%",
  "gr-skiathos": "center 50%",
  "gr-skyros": "center 25%",
  "gr-syros": "center 25%",
  "hr-bol": "center 35%",
  "hr-osijek": "center 55%",
  "hu-budapest": "center 30%",
  "hu-debrecen": "center 30%",
  "hu-gyor": "center 30%",
  "hu-pecs": "center 35%",
  "hu-szeged": "center 40%",
  "ie-cork": "center 30%",
  "ie-dublin": "center 35%",
  "ie-kerry": "center 35%",
  "ie-knock": "center 35%",
  "im-isle-of-man": "center 30%",
  "it-bari-puglia": "center 30%",
  "it-bologna": "center 30%",
  "it-cagliari-south-sardinia": "center 45%",
  "it-foggia-gargano": "center 30%",
  "it-forli-romagna": "center 30%",
  "it-lamezia-calabria": "center 40%",
  "it-pantelleria": "center 40%",
  "it-parma": "center 35%",
  "it-trapani-erice": "center 40%",
  "lt-vilnius": "center 35%",
  "lv-riga": "center 35%",
  "me-tivat": "center 35%",
  "no-alta": "center 30%",
  "no-harstad-narvik": "center 35%",
  "no-sogndal-sognefjord": "center 30%",
  "no-svolvaer": "center 40%",
  "no-tromso": "center 35%",
  "pl-bialowieza": "center 60%",
  "pl-krakow": "center 35%",
  "pl-szczecin": "center 30%",
  "pl-zakopane-tatras": "center 35%",
  "pt-beja": "center 35%",
  "pt-braga": "center 35%",
  "pt-braganca": "center 30%",
  "pt-chaves": "center 35%",
  "pt-horta": "center 35%",
  "pt-pico": "center 30%",
  "pt-portimao": "center 30%",
  "pt-vila-real": "center 30%",
  "ro-targu-mures": "center 40%",
  "sk-banska-bystrica": "center 35%",
  "sk-kosice": "center 30%",
  "sk-nitra": "center 40%",
  "sk-trencin": "center 30%",
  "tr-cappadocia": "center 15%",
  "tr-erzurum": "center 30%",
  "tr-izmir": "center 35%",
  "tr-konya": "center 40%",
  "tr-pamukkale": "center 85%",
  "tr-van": "center 35%",
};

/** The eight original destinations that are not in the catalog, by photo URL. */
export const featuredImageFraming: Readonly<Record<string, string>> = {
  "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80": "center 35%", // Nueva York
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80": "center 30%", // Bali
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80": "center 45%", // Maldivas
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80": "center 30%", // Dubái
  "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80": "center 40%", // Suiza
  "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80": "center 30%", // Tailandia
  "https://images.unsplash.com/photo-1683606095922-cda452e83878?auto=format&fit=crop&w=1200&q=80": "center 30%", // Sídney
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80": "center 40%", // Río de Janeiro
};

export function panoramicImagePosition(destination: FramedDestination): string | undefined {
  if (destination.imagePosition) return destination.imagePosition;
  if (destination.id && Object.prototype.hasOwnProperty.call(imageFraming, destination.id)) return imageFraming[destination.id];
  return Object.prototype.hasOwnProperty.call(featuredImageFraming, destination.image) ? featuredImageFraming[destination.image] : undefined;
}
