import type { Locale } from '@/lib/i18n/translations';
type Foreign = Exclude<Locale, 'es'>;
type Places = [string, string, string, string];
/**
 * South Korea: recommendations translated for every card (14).
 * The Spanish lists stay in the card seeds; these are the other six languages (en, fr, de, it, pt, ca).
 * Proper names keep their romanisation; only the generic words (castle, shrine, beach…) are translated.
 * A card that is missing here falls back to its Spanish list.
 */
export const southKoreaRecommendations: Readonly<Record<string, Record<Foreign, Places>>> = {
  seoul: {
    en: ['Gyeongbokgung Palace', 'Bukchon Hanok Village', 'N Seoul Tower', 'Cheonggyecheon Stream'],
    fr: ['Palais Gyeongbokgung', 'Village de Bukchon Hanok', 'Tour N Seoul', 'Ruisseau Cheonggyecheon'],
    de: ['Gyeongbokgung-Palast', 'Hanok-Dorf Bukchon', 'N Seoul Tower', 'Cheonggyecheon-Bach'],
    it: ['Palazzo Gyeongbokgung', 'Villaggio Hanok di Bukchon', 'Torre N Seoul', 'Torrente Cheonggyecheon'],
    pt: ['Palácio Gyeongbokgung', 'Aldeia Bukchon Hanok', 'Torre N Seoul', 'Ribeiro Cheonggyecheon'],
    ca: ['Palau Gyeongbokgung', 'Poble Bukchon Hanok', 'Torre N Seoul', 'Rierol Cheonggyecheon'],
  },
  busan: {
    en: ['Haeundae Beach', 'Gamcheon Village', 'Jagalchi Market', 'Haedong Yonggungsa Temple'],
    fr: ['Plage de Haeundae', 'Village de Gamcheon', 'Marché Jagalchi', 'Temple Haedong Yonggungsa'],
    de: ['Strand Haeundae', 'Gamcheon-Dorf', 'Jagalchi-Markt', 'Haedong-Yonggungsa-Tempel'],
    it: ['Spiaggia di Haeundae', 'Villaggio di Gamcheon', 'Mercato Jagalchi', 'Tempio Haedong Yonggungsa'],
    pt: ['Praia de Haeundae', 'Aldeia de Gamcheon', 'Mercado Jagalchi', 'Templo Haedong Yonggungsa'],
    ca: ['Platja de Haeundae', 'Poble de Gamcheon', 'Mercat Jagalchi', 'Temple Haedong Yonggungsa'],
  },
  jeju: {
    en: ['Hallasan', 'Jeongbang Falls', 'Seongsan Ilchulbong Peak', 'Olle coastal trail'],
    fr: ['Hallasan', 'Cascade Jeongbang', 'Pic Seongsan Ilchulbong', 'Sentier côtier Olle'],
    de: ['Hallasan', 'Jeongbang-Wasserfall', 'Seongsan Ilchulbong', 'Olle-Küstenwanderweg'],
    it: ['Hallasan', 'Cascata Jeongbang', 'Picco Seongsan Ilchulbong', 'Sentiero costiero Olle'],
    pt: ['Hallasan', 'Cascata Jeongbang', 'Pico Seongsan Ilchulbong', 'Trilho costeiro Olle'],
    ca: ['Hallasan', 'Cascada Jeongbang', 'Pic Seongsan Ilchulbong', 'Camí costaner Olle'],
  },
  daegu: {
    en: ['Donghwasa Temple', 'Apsan Park', 'Kim Gwangseok Street', 'Seomun Market'],
    fr: ['Temple Donghwasa', 'Parc Apsan', 'Rue Kim Gwangseok', 'Marché Seomun'],
    de: ['Donghwasa-Tempel', 'Apsan-Park', 'Kim-Gwangseok-Straße', 'Seomun-Markt'],
    it: ['Tempio Donghwasa', 'Parco Apsan', 'Via Kim Gwangseok', 'Mercato Seomun'],
    pt: ['Templo Donghwasa', 'Parque Apsan', 'Rua Kim Gwangseok', 'Mercado Seomun'],
    ca: ['Temple Donghwasa', 'Parc Apsan', 'Carrer Kim Gwangseok', 'Mercat Seomun'],
  },
  cheongju: {
    en: ['Sangdangsanseong Fortress', 'Cheongnamdae', 'Early Printing Museum', 'Suamgol neighbourhood'],
    fr: ['Forteresse Sangdangsanseong', 'Cheongnamdae', 'Musée de l’imprimerie ancienne', 'Quartier de Suamgol'],
    de: ['Festung Sangdangsanseong', 'Cheongnamdae', 'Museum für alten Buchdruck', 'Viertel Suamgol'],
    it: ['Fortezza Sangdangsanseong', 'Cheongnamdae', 'Museo della stampa antica', 'Quartiere Suamgol'],
    pt: ['Fortaleza Sangdangsanseong', 'Cheongnamdae', 'Museu da Imprensa Antiga', 'Bairro Suamgol'],
    ca: ['Fortalesa Sangdangsanseong', 'Cheongnamdae', 'Museu de la Impremta Antiga', 'Barri Suamgol'],
  },
  sacheon: {
    en: ['Jinju Fortress', 'Samcheonpo Bridge', 'Sacheon cable car', 'Namgang Park'],
    fr: ['Forteresse Jinju', 'Pont Samcheonpo', 'Téléphérique de Sacheon', 'Parc Namgang'],
    de: ['Festung Jinju', 'Samcheonpo-Brücke', 'Seilbahn von Sacheon', 'Namgang-Park'],
    it: ['Fortezza Jinju', 'Ponte Samcheonpo', 'Funivia di Sacheon', 'Parco Namgang'],
    pt: ['Fortaleza Jinju', 'Ponte Samcheonpo', 'Teleférico de Sacheon', 'Parque Namgang'],
    ca: ['Fortalesa Jinju', 'Pont Samcheonpo', 'Telefèric de Sacheon', 'Parc Namgang'],
  },
  'pohang-gyeongju': {
    en: ['Bulguksa Temple', 'Donggung and Wolji Pond', 'Cape Homigot', 'Jukdo Market'],
    fr: ['Temple Bulguksa', 'Étang Donggung et Wolji', 'Cap Homigot', 'Marché Jukdo'],
    de: ['Bulguksa-Tempel', 'Donggung- und Wolji-Teich', 'Kap Homigot', 'Jukdo-Markt'],
    it: ['Tempio Bulguksa', 'Stagno Donggung e Wolji', 'Capo Homigot', 'Mercato Jukdo'],
    pt: ['Templo Bulguksa', 'Lagoa Donggung e Wolji', 'Cabo Homigot', 'Mercado Jukdo'],
    ca: ['Temple Bulguksa', 'Estany Donggung i Wolji', 'Cap Homigot', 'Mercat Jukdo'],
  },
  gunsan: {
    en: ['Modern historic district', 'Gyeongam Railway Village', 'Dongguksa Temple', 'Seonyudo Island'],
    fr: ['Quartier historique moderne', 'Village ferroviaire de Gyeongam', 'Temple Dongguksa', 'Île Seonyudo'],
    de: ['Moderner historischer Stadtteil', 'Eisenbahndorf Gyeongam', 'Dongguksa-Tempel', 'Insel Seonyudo'],
    it: ['Quartiere storico moderno', 'Villaggio ferroviario di Gyeongam', 'Tempio Dongguksa', 'Isola Seonyudo'],
    pt: ['Bairro histórico moderno', 'Aldeia ferroviária de Gyeongam', 'Templo Dongguksa', 'Ilha Seonyudo'],
    ca: ['Barri històric modern', 'Poble ferroviari de Gyeongam', 'Temple Dongguksa', 'Illa Seonyudo'],
  },
  gwangju: {
    en: ['Asia Culture Center', '5·18 Archives', 'Mudeungsan Park', 'Yangnim-dong neighbourhood'],
    fr: ['Centre de la culture asiatique', 'Archives du 5·18', 'Parc Mudeungsan', 'Quartier de Yangnim-dong'],
    de: ['Asiatisches Kulturzentrum', '5·18-Archiv', 'Mudeungsan-Park', 'Viertel Yangnim-dong'],
    it: ['Centro culturale asiatico', 'Archivio 5·18', 'Parco Mudeungsan', 'Quartiere Yangnim-dong'],
    pt: ['Centro Cultural Asiático', 'Arquivo 5·18', 'Parque Mudeungsan', 'Bairro Yangnim-dong'],
    ca: ['Centre Cultural Asiàtic', 'Arxiu 5·18', 'Parc Mudeungsan', 'Barri Yangnim-dong'],
  },
  'muan-mokpo': {
    en: ['Mokpo Sea Cable Car', 'Mount Yudalsan', 'Gatbawi Rock', 'Muan Ecological Park'],
    fr: ['Téléphérique marin de Mokpo', 'Mont Yudalsan', 'Rocher Gatbawi', 'Parc écologique de Muan'],
    de: ['Meeresseilbahn von Mokpo', 'Berg Yudalsan', 'Gatbawi-Felsen', 'Ökologischer Park Muan'],
    it: ['Funivia marina di Mokpo', 'Monte Yudalsan', 'Roccia Gatbawi', 'Parco ecologico di Muan'],
    pt: ['Teleférico marítimo de Mokpo', 'Monte Yudalsan', 'Rocha Gatbawi', 'Parque ecológico de Muan'],
    ca: ['Telefèric marí de Mokpo', 'Mont Yudalsan', 'Roca Gatbawi', 'Parc ecològic de Muan'],
  },
  yeosu: {
    en: ['Odongdo Island', 'Sea cable car', 'Expo Square', 'Hyangiram Hermitage'],
    fr: ['Île Odongdo', 'Téléphérique marin', 'Place de l’Expo', 'Ermitage Hyangiram'],
    de: ['Insel Odongdo', 'Meeresseilbahn', 'Expo-Platz', 'Einsiedelei Hyangiram'],
    it: ['Isola Odongdo', 'Funivia marina', 'Piazza Expo', 'Eremo Hyangiram'],
    pt: ['Ilha Odongdo', 'Teleférico marítimo', 'Praça Expo', 'Eremitério Hyangiram'],
    ca: ['Illa Odongdo', 'Telefèric marí', 'Plaça Expo', 'Ermita Hyangiram'],
  },
  ulsan: {
    en: ['Taehwagang Park', 'Cape Ganjeolgot', 'Daewangam Park', 'Jangsaengpo Whale Museum'],
    fr: ['Parc Taehwagang', 'Cap Ganjeolgot', 'Parc Daewangam', 'Musée de la baleine de Jangsaengpo'],
    de: ['Taehwagang-Park', 'Kap Ganjeolgot', 'Daewangam-Park', 'Walmuseum Jangsaengpo'],
    it: ['Parco Taehwagang', 'Capo Ganjeolgot', 'Parco Daewangam', 'Museo delle balene di Jangsaengpo'],
    pt: ['Parque Taehwagang', 'Cabo Ganjeolgot', 'Parque Daewangam', 'Museu das Baleias de Jangsaengpo'],
    ca: ['Parc Taehwagang', 'Cap Ganjeolgot', 'Parc Daewangam', 'Museu de les Balenes de Jangsaengpo'],
  },
  'wonju-hoengseong': {
    en: ['SAN Museum', 'Sogeumsan Suspension Bridge', 'Chiaksan Park', 'Hanji Center'],
    fr: ['Musée SAN', 'Pont suspendu de Sogeumsan', 'Parc Chiaksan', 'Centre du hanji'],
    de: ['SAN-Museum', 'Hängebrücke Sogeumsan', 'Chiaksan-Park', 'Hanji-Zentrum'],
    it: ['Museo SAN', 'Ponte sospeso di Sogeumsan', 'Parco Chiaksan', 'Centro dell’hanji'],
    pt: ['Museu SAN', 'Ponte suspensa de Sogeumsan', 'Parque Chiaksan', 'Centro do hanji'],
    ca: ['Museu SAN', 'Pont penjant de Sogeumsan', 'Parc Chiaksan', 'Centre del hanji'],
  },
  'yangyang-seoraksan': {
    en: ['Seoraksan Park', 'Naksansa Temple', 'Surfyy Beach', 'Osaek hot springs'],
    fr: ['Parc Seoraksan', 'Temple Naksansa', 'Plage de Surfyy', 'Sources chaudes d’Osaek'],
    de: ['Seoraksan-Park', 'Naksansa-Tempel', 'Strand Surfyy', 'Thermalquellen von Osaek'],
    it: ['Parco Seoraksan', 'Tempio Naksansa', 'Spiaggia di Surfyy', 'Terme di Osaek'],
    pt: ['Parque Seoraksan', 'Templo Naksansa', 'Praia de Surfyy', 'Águas termais de Osaek'],
    ca: ['Parc Seoraksan', 'Temple Naksansa', 'Platja de Surfyy', 'Aigües termals d’Osaek'],
  },
};
