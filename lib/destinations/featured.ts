import { franceDestinations } from './france';

export type Destination = {
  name: string;
  country: string;
  emoji?: string;
  image: string;
  description: string;
  recommendations: string[];
  recommendedStay?: string;
  bestMonths?: number[];
  lowSeasonMonths?: number[];
  highSeasonMonths?: number[];
  seasonalityNote?: string;
  imageSource?: string;
  imageCredit?: string;
  imageLicense?: string;
  imageLicenseUrl?: string;
};

export const destinations: Destination[] = [
  franceDestinations.find(destination => destination.id === 'fr-paris')!,
  {
    name: "Nueva York",
    country: "Estados Unidos",
    emoji: "🇺🇸",
    image:
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1200&q=80",
    description:
      "Una ciudad llena de energía, barrios únicos, espectáculos y lugares icónicos.",
    recommendations: [
      "Times Square",
      "Central Park",
      "Brooklyn Bridge",
      "Empire State",
    ],
  },
  {
    name: "Tokio",
    country: "Japón",
    emoji: "🇯🇵",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    description:
      "Tradición y tecnología conviven en una de las ciudades más fascinantes del mundo.",
    recommendations: [
      "Shibuya",
      "Asakusa",
      "Tokyo Skytree",
      "Mercado de Tsukiji",
    ],
  },
  {
    name: "Roma",
    country: "Italia",
    emoji: "🇮🇹",
    image:
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    description:
      "Historia viva, arquitectura monumental y una gastronomía que merece el viaje.",
    recommendations: [
      "Coliseo",
      "Fontana di Trevi",
      "Vaticano",
      "Piazza Navona",
    ],
  },
  {
    name: "Bali",
    country: "Indonesia",
    emoji: "🇮🇩",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    description:
      "Playas, templos, naturaleza tropical y paisajes perfectos para desconectar.",
    recommendations: [
      "Ubud",
      "Templo de Uluwatu",
      "Nusa Penida",
      "Terrazas de arroz",
    ],
  },
  {
    name: "Londres",
    country: "Reino Unido",
    emoji: "🇬🇧",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80",
    description:
      "Historia, cultura, mercados y barrios que convierten cada día en un plan diferente.",
    recommendations: [
      "Big Ben",
      "Tower Bridge",
      "Camden Market",
      "British Museum",
    ],
  },
  {
    name: "Maldivas",
    country: "Maldivas",
    emoji: "🇲🇻",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
    description:
      "Aguas cristalinas, playas de arena blanca y arrecifes de coral en un auténtico paraíso tropical.",
    recommendations: [
      "Atolones",
      "Bancos de arena",
      "Snorkel en los arrecifes",
      "Malé",
    ],
  },
  {
    name: "Santorini",
    country: "Grecia",
    emoji: "🇬🇷",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    description:
      "Casas blancas, cúpulas azules y espectaculares vistas al mar Egeo y a la caldera.",
    recommendations: [
      "Oia",
      "Fira",
      "Imerovigli",
      "Playa Roja",
    ],
  },
  {
    name: "Dubái",
    country: "Emiratos Árabes Unidos",
    emoji: "🇦🇪",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
    description:
      "Rascacielos espectaculares, playas, lujo y experiencias inolvidables en pleno desierto.",
    recommendations: [
      "Burj Khalifa",
      "Dubai Marina",
      "Palm Jumeirah",
      "Desierto de Dubái",
    ],
  },
  {
    name: "Islandia",
    country: "Islandia",
    emoji: "🇮🇸",
    image:
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1200&q=80",
    description:
      "Cascadas, volcanes, glaciares y paisajes espectaculares en uno de los destinos más sorprendentes del mundo.",
    recommendations: [
      "Círculo Dorado",
      "Laguna Azul",
      "Cascadas",
      "Auroras boreales",
    ],
  },
  {
    name: "Suiza",
    country: "Suiza",
    emoji: "🇨🇭",
    image:
      "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1200&q=80",
    description:
      "Montañas alpinas, lagos cristalinos y pueblos de postal rodeados de paisajes espectaculares.",
    recommendations: [
      "Interlaken",
      "Lago de Lucerna",
      "Alpes suizos",
      "Zermatt",
    ],
  },
  {
    name: "Tailandia",
    country: "Tailandia",
    emoji: "🇹🇭",
    image:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80",
    description:
      "Templos impresionantes, playas tropicales, mercados y una de las gastronomías más famosas de Asia.",
    recommendations: [
      "Bangkok",
      "Chiang Mai",
      "Islas Phi Phi",
      "Templos y mercados",
    ],
  },
  {
    name: "Barcelona",
    country: "España",
    emoji: "🇪🇸",
    image:
      "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
    description:
      "Arquitectura modernista, playas mediterráneas, gastronomía y una ciudad llena de vida.",
    recommendations: [
      "Sagrada Familia",
      "Park Güell",
      "Barrio Gótico",
      "Las Ramblas",
    ],
  },
  {
    name: "El Cairo",
    country: "Egipto",
    emoji: "🇪🇬",
    image:
      "https://images.unsplash.com/photo-1632836388763-3a52d354cd7e?auto=format&fit=crop&w=1200&q=80",
    description:
      "Una puerta a la historia del antiguo Egipto, con pirámides, mercados y una cultura fascinante.",
    recommendations: [
      "Pirámides de Guiza",
      "Gran Esfinge",
      "Museo Egipcio",
      "Khan el-Khalili",
    ],
  },
  {
    name: "Sídney",
    country: "Australia",
    emoji: "🇦🇺",
    image:
      "https://images.unsplash.com/photo-1683606095922-cda452e83878?auto=format&fit=crop&w=1200&q=80",
    description:
      "La Ópera, el puerto y las playas hacen de Sídney una ciudad llena de lugares inolvidables.",
    recommendations: [
      "Ópera de Sídney",
      "Harbour Bridge",
      "Bondi Beach",
      "The Rocks",
    ],
  },
  {
    name: "Río de Janeiro",
    country: "Brasil",
    emoji: "🇧🇷",
    image:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=80",
    description:
      "Playas famosas, montañas espectaculares y una de las ciudades más vibrantes de Sudamérica.",
    recommendations: [
      "Cristo Redentor",
      "Pan de Azúcar",
      "Playa de Copacabana",
      "Ipanema",
    ],
  },
];
