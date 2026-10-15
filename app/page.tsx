"use client";

import { useLanguage } from "./components/LanguageProvider";

import { FormEvent, useEffect, useRef, useState } from "react";
import AuthDialog from "./components/AuthDialog";
import HeaderAuth from "./components/HeaderAuth";
import LanguageSelector from "./components/LanguageSelector";
import { getSupabaseClient } from "@/lib/supabase/client";
import { saveTrip, type NewSavedTrip, type TripService } from "@/lib/supabase/saved-trips";
import type { TranslationKey } from "@/lib/i18n/translations";

type Destination = {
  name: string;
  country: string;
  emoji: string;
  image: string;
  description: string;
  recommendations: string[];
};

const destinations: Destination[] = [
  {
    name: "París",
    country: "Francia",
    emoji: "🇫🇷",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    description:
      "Arte, gastronomía, historia y algunos de los rincones más románticos de Europa.",
    recommendations: [
      "Torre Eiffel",
      "Museo del Louvre",
      "Montmartre",
      "Crucero por el Sena",
    ],
  },
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
const fondos = [
  // París
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=85",

  // Tokio
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1600&q=85",

  // Nueva York
  "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1600&q=85",

  // Maldivas
  "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=85",

  // Roma
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=85",

  // Santorini
  "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1600&q=85",

  // Bali
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=85",

  // Dubái
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=85",

  // Londres
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=85",

  // Islandia
  "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1600&q=85",

  // Suiza
  "https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1600&q=85",

  // Tailandia
  "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1600&q=85",
];
export default function Home() {
  const { t, text } = useLanguage();
  const destinationsCarouselRef = useRef<HTMLDivElement | null>(null);
  const [authMode, setAuthMode] = useState<"signup" | "signin" | null>(null);
  const [fondoActual, setFondoActual] = useState(0);
  const [temporada, setTemporada] = useState("primavera");
const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

useEffect(() => {
  const intervalo = setInterval(() => {
    setFondoActual((actual) => (actual + 1) % fondos.length);
  }, 7000);

  return () => clearInterval(intervalo);
}, []);

const audioRef = useRef<HTMLAudioElement | null>(null);
const [vozActiva, setVozActiva] = useState(false);
const apagarVoz = () => {
  peerConnectionRef.current?.close();
  peerConnectionRef.current = null;
  audioRef.current?.pause();
  audioRef.current = null;
  setVozActiva(false);
};
const iniciarVoz = async () => {
  try {
if (peerConnectionRef.current) {
  peerConnectionRef.current.close();
  peerConnectionRef.current = null;
}

if (audioRef.current) {
  audioRef.current.pause();
  audioRef.current.srcObject = null;
  audioRef.current = null;
}
    const response = await fetch("/api/voice", {
      method: "POST",
    });

    const data = await response.json();
    console.log("Voice session:", data);
const pc = new RTCPeerConnection();
peerConnectionRef.current = pc;

const audio = new Audio();
audio.autoplay = true;
audioRef.current = audio;
pc.ontrack = (event) => {
  audio.srcObject = event.streams[0];
};
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
});

stream.getTracks().forEach((track) => {
  pc.addTrack(track, stream);
});
const dc = pc.createDataChannel("oai-events");
dc.onmessage = (event) => {
  const evento = JSON.parse(event.data);
  console.log("Evento IA:", evento);

  if (evento.type === "response.function_call_arguments.done") {
    if (evento.name !== "buscar_viaje") return;

    const datos = JSON.parse(evento.arguments);

    const destino = destinations.find(
      (d) =>
        d.name.toLowerCase() ===
        datos.destino?.trim().toLowerCase()
    );

    if (destino) {
setOrigen(datos.origen);
setDestinoVuelo(destino.name);
setDestinoHotel(destino.name);
setFechaIda(datos.fecha_ida);
setFechaVuelta(datos.fecha_vuelta);
setEntrada(datos.fecha_ida);
setSalida(datos.fecha_vuelta);
setPasajeros(datos.viajeros);
setHuespedes(datos.viajeros);
     if (datos.servicio === "ambos") {
  abrirPaquete(destino.name);
} else {
  setDestinoSeleccionado(destino);
}
    }
  }
};
let saludoEnviado = false;
dc.onopen = () => {
setVozActiva(true);
  if (saludoEnviado) return;
  saludoEnviado = true;

  const horaLocal = new Date().getHours();
  const saludo =
    horaLocal >= 6 && horaLocal < 12
      ? "Hola, buenos días"
      : horaLocal >= 12 && horaLocal < 20
        ? "Hola, buenas tardes"
        : "Hola, buenas noches";

  dc.send(
    JSON.stringify({
      type: "response.create",
      response: {
        instructions: `Inicia esta sesión de voz diciendo exactamente: "${saludo}. ¿En qué puedo ayudarte con tu viaje?". No añadas nada más en esta intervención. Este saludo es solo para el inicio de la sesión; no lo repitas durante la conversación.`,
        tool_choice: "none",
      },
    })
  );
};
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
const token = data.value;
const sdpResponse = await fetch(
  "https://api.openai.com/v1/realtime/calls",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/sdp",
    },
    body: offer.sdp,
  }
);
const answerSdp = await sdpResponse.text();

await pc.setRemoteDescription({
  type: "answer",
  sdp: answerSdp,
});

  } catch (error) {
    console.error("Error al iniciar voz:", error);
  }
};
  const [mensaje, setMensaje] = useState("");
  const [destinoSeleccionado, setDestinoSeleccionado] =
    useState<Destination | null>(null);

  const [modal, setModal] = useState<"vuelos" | "hoteles" | "paquete" | null>(null);

  // VUELOS
  const [origen, setOrigen] = useState("");
  const [destinoVuelo, setDestinoVuelo] = useState("");
  const [fechaIda, setFechaIda] = useState("");
  const [fechaVuelta, setFechaVuelta] = useState("");
  const [pasajeros, setPasajeros] = useState(1);
  const [mensajeVuelos, setMensajeVuelos] = useState("");

  // HOTELES
  const [destinoHotel, setDestinoHotel] = useState("");
  const [entrada, setEntrada] = useState("");
  const [salida, setSalida] = useState("");
  const [huespedes, setHuespedes] = useState(2);
  const [habitaciones, setHabitaciones] = useState(1);
  const [mensajeHoteles, setMensajeHoteles] = useState("");
  const [savingTrip, setSavingTrip] = useState<TripService | null>(null);
  const savingTripRef = useRef(false);
  const [saveFeedback, setSaveFeedback] = useState<Partial<Record<TripService, { kind: "error" | "success"; key: TranslationKey; fields?: TranslationKey[] }>>>({});

  async function saveCurrentTrip(service: TripService) {
    if (savingTripRef.current) return;

    const isHotel = service === "hotel";
    const trip: NewSavedTrip = {
      origin: isHotel ? null : origen.trim(),
      destination: (isHotel ? destinoHotel : destinoVuelo).trim(),
      departure_date: isHotel ? entrada : fechaIda,
      return_date: isHotel ? salida : fechaVuelta,
      travelers: isHotel ? huespedes : pasajeros,
      service_type: service,
    };
    const missing: TranslationKey[] = [
      ...(!isHotel && !trip.origin ? ["search.origin" as const] : []),
      ...(!trip.destination ? ["search.destination" as const] : []),
      ...(!trip.departure_date ? [isHotel ? "search.checkIn" as const : "search.departureDate" as const] : []),
      ...(!trip.return_date ? [isHotel ? "search.checkOut" as const : "search.returnDate" as const] : []),
      ...(!Number.isInteger(trip.travelers) || trip.travelers < 1 ? [isHotel ? "search.guests" as const : "search.travelers" as const] : []),
    ];
    if (missing.length) {
      setSaveFeedback((current) => ({ ...current, [service]: { kind: "error", key: "search.saveMissing", fields: missing } }));
      return;
    }
    if (trip.return_date && trip.return_date < trip.departure_date) {
      setSaveFeedback((current) => ({ ...current, [service]: { kind: "error", key: "search.saveInvalidDates" } }));
      return;
    }

    savingTripRef.current = true;
    setSavingTrip(service);
    setSaveFeedback((current) => ({ ...current, [service]: undefined }));
    try {
      const { data: { session }, error } = await getSupabaseClient().auth.getSession();
      if (error) throw error;
      if (!session) {
        setSaveFeedback((current) => ({ ...current, [service]: { kind: "error", key: "search.signInToSave" } }));
        return;
      }
      await saveTrip(trip);
      setSaveFeedback((current) => ({ ...current, [service]: { kind: "success", key: "search.tripSaved" } }));
    } catch (error) {
      const key = error instanceof Error && error.message === "Inicia sesión para acceder a tus viajes."
        ? "search.signInToSave" : "search.saveError";
      setSaveFeedback((current) => ({ ...current, [service]: { kind: "error", key } }));
    } finally {
      savingTripRef.current = false;
      setSavingTrip(null);
    }
  }

  function renderSaveTripAction(service: TripService, inModal = false) {
    const feedback = saveFeedback[service];
    return (
      <>
        <button
          type="button"
          onClick={() => void saveCurrentTrip(service)}
          disabled={savingTrip !== null}
          className={inModal
            ? "mt-3 min-h-[44px] w-full rounded-xl border border-cyan-300/70 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-wait disabled:opacity-60"
            : "mt-1.5 min-h-[44px] w-full rounded-2xl border border-blue-600 bg-white/70 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-wait disabled:opacity-60"}
        >
          ♡ {savingTrip === service ? t("search.savingTrip") : t("search.saveTrip")}
        </button>
        {feedback && (
          <p role={feedback.kind === "error" ? "alert" : "status"} className={inModal
            ? `mt-2 rounded-xl px-3 py-2 text-sm ${feedback.kind === "error" ? "bg-red-950/60 text-red-100" : "bg-cyan-300/10 text-cyan-100"}`
            : `mt-1.5 rounded-xl px-3 py-2 text-sm ${feedback.kind === "error" ? "bg-red-50 text-red-800" : "bg-blue-50 text-blue-900"}`}>
            {t(feedback.key, { fields: feedback.fields?.map((field) => t(field)).join(", ") ?? "" })}
          </p>
        )}
      </>
    );
  }

  function explorarConIA() {
    const texto = mensaje.trim();

    if (!texto) return;

    const encontrado = destinations.find((destino) =>
      texto.toLowerCase().includes(destino.name.toLowerCase())
    );

    if (encontrado) {
      setDestinoSeleccionado(encontrado);
      document
        .getElementById("destinos")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    document
      .getElementById("destinos")
      ?.scrollIntoView({ behavior: "smooth" });
  }

  function abrirVuelos(destino = "") {
    if (destino) setDestinoVuelo(destino);
    setModal("vuelos");
    setDestinoSeleccionado(null);
  }
function abrirPaquete(destino = "") {
  if (destino) {
    setDestinoVuelo(destino);
    setDestinoHotel(destino);
  }
  setModal("paquete");
  setDestinoSeleccionado(null);
}
  function abrirHoteles(destino = "") {
    if (destino) setDestinoHotel(destino);
    setModal("hoteles");
    setDestinoSeleccionado(null);
  }

  function buscarVuelos(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMensajeVuelos(
      "El buscador está preparado. Conectaremos los precios y vuelos reales mediante la API en el último paso."
    );
  }

  function buscarHoteles(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMensajeHoteles(
      "El buscador está preparado. Conectaremos la disponibilidad y los precios reales mediante la API en el último paso."
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F2E8] text-stone-800">
      {/* FONDOS DE CIUDADES */}
{fondos.map((fondo, index) => (
  <div
    key={fondo}
    className={`fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-[2000ms] ${
      index === fondoActual ? "opacity-100" : "opacity-0"
    }`}
    style={{ backgroundImage: `url(${fondo})` }}
  />
))}

<div className="fixed inset-0 z-0 bg-[#F7F2E8]/90" />
      {/* FONDO ANIMADO */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      {/* NAVEGACIÓN */}
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#F7F2E8]/70 backdrop-blur-xl lg:ring-1 lg:ring-inset lg:ring-blue-600/40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 max-sm:px-3 max-sm:py-1.5">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="shrink-0 text-xl font-black tracking-tight max-sm:text-sm"
          >
           EL V<span className="text-blue-500">IA</span>JERO
          </button>
          <div className="flex min-w-0 items-center gap-1 sm:gap-3 max-sm:gap-0.5">
            <HeaderAuth onOpenAuth={setAuthMode} />
            <LanguageSelector />
          </div>
        </div>
      </nav>

      {/* PORTADA */}
      <section className="relative z-10 flex items-center justify-center px-6 pb-10 pt-24 md:pb-12 md:pt-24 lg:pb-6 lg:pt-[72px] max-sm:pb-6 max-sm:pt-16">
        <div className="mx-auto w-full max-w-5xl text-center">
          <img
            src="https://i.ibb.co/qwy6gvm/file-00000000c0d4821099521df6da250944.png"
            alt="El vIAjero"
            className="mx-auto mb-2 h-20 w-28 object-contain sm:h-24 sm:w-32 lg:mb-1 lg:h-16 lg:w-28 max-sm:mb-0 max-sm:h-8 max-sm:w-12"
          />
          <h1 className="text-[clamp(2rem,7.5vw,6.5rem)] font-black leading-none tracking-tight lg:text-[clamp(3.5rem,6vw,5rem)] max-sm:text-[clamp(1.75rem,7vw,1.875rem)]">
            <span className="text-stone-900">EL</span>{" "}
            <span className="bg-gradient-to-r from-blue-600 to-teal-400 bg-clip-text text-transparent">VIAJERO</span>
          </h1>
          <div aria-hidden="true" className="mx-auto mt-3 h-1 w-14 rounded-full bg-blue-500 md:mt-4 md:w-16 lg:mt-2 max-sm:mt-1" />
          <p className="mx-auto mt-4 max-w-2xl text-base leading-6 text-stone-700 sm:text-lg sm:leading-7 md:mt-5 md:text-xl lg:mt-3 lg:leading-6 max-sm:mt-1.5 max-sm:text-sm max-sm:leading-[18px]">
            {t("hero.description")}
          </p>

          {/* BUSCADOR IA */}
          <div className="mx-auto mt-10 grid w-full overflow-hidden rounded-[36px] border border-stone-200 bg-[#F7F2E8]/95 text-left shadow-2xl backdrop-blur-2xl md:grid-cols-2 lg:mt-4 lg:border-blue-600 max-sm:mt-3">
            <div className="px-6 py-2 md:px-8 md:py-2 max-sm:py-1">
              <h2 className="text-xl leading-6 font-black text-stone-800">✈️ {t("search.title")}</h2>
              <div className="mt-2 grid grid-cols-3 gap-x-2 gap-y-1 max-sm:mt-1">
                <input type="radio" name="buscador-servicio" id="buscador-vuelos" className="peer/vuelos sr-only" defaultChecked />
                <input type="radio" name="buscador-servicio" id="buscador-hoteles" className="peer/hoteles sr-only" />
                <input type="radio" name="buscador-servicio" id="buscador-paquete" className="peer/paquete sr-only" />

                <label htmlFor="buscador-vuelos" className="cursor-pointer rounded-xl border border-stone-300 bg-white px-2 py-1 text-center text-sm font-bold text-stone-700 max-sm:flex max-sm:min-h-[44px] max-sm:items-center max-sm:justify-center max-sm:px-1 max-sm:py-1 max-sm:text-xs max-sm:leading-[14px] transition peer-checked/vuelos:border-blue-600 peer-checked/vuelos:bg-blue-600 peer-checked/vuelos:text-white peer-focus-visible/vuelos:ring-2 peer-focus-visible/vuelos:ring-blue-600">
                  ✈️ {t("search.flights")}
                </label>
                <label htmlFor="buscador-hoteles" className="cursor-pointer rounded-xl border border-stone-300 bg-white px-2 py-1 text-center text-sm font-bold text-stone-700 max-sm:flex max-sm:min-h-[44px] max-sm:items-center max-sm:justify-center max-sm:px-1 max-sm:py-1 max-sm:text-xs max-sm:leading-[14px] transition peer-checked/hoteles:border-blue-600 peer-checked/hoteles:bg-blue-600 peer-checked/hoteles:text-white peer-focus-visible/hoteles:ring-2 peer-focus-visible/hoteles:ring-blue-600">
                  🏨 {t("search.hotels")}
                </label>
                <label htmlFor="buscador-paquete" className="cursor-pointer rounded-xl border border-stone-300 bg-white px-2 py-1 text-center text-sm font-bold text-stone-700 max-sm:flex max-sm:min-h-[44px] max-sm:items-center max-sm:justify-center max-sm:px-1 max-sm:py-1 max-sm:text-xs max-sm:leading-[14px] transition peer-checked/paquete:border-blue-600 peer-checked/paquete:bg-blue-600 peer-checked/paquete:text-white peer-focus-visible/paquete:ring-2 peer-focus-visible/paquete:ring-blue-600">
                  ✈️🏨 {t("trips.package")}
                </label>
                <form onSubmit={buscarVuelos} className="col-span-3 mt-1 max-sm:mt-0.5 hidden peer-checked/vuelos:block">
                  <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-x-2 max-sm:[&>label:last-child:nth-child(odd)]:col-span-2">
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.origin")}
                        <input required value={origen} onChange={(e) => setOrigen(e.target.value)} placeholder="Madrid" className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.destination")}
                        <input required value={destinoVuelo} onChange={(e) => setDestinoVuelo(e.target.value)} placeholder="París" className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.departureDate")}
                        <input required type="date" value={fechaIda} onChange={(e) => setFechaIda(e.target.value)} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.returnDate")}
                        <input required type="date" value={fechaVuelta} onChange={(e) => setFechaVuelta(e.target.value)} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.travelers")}
                        <input required type="number" min={1} max={9} value={pasajeros} onChange={(e) => setPasajeros(Number(e.target.value))} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                  </div>
                  <button type="submit" className="mt-2 w-full max-sm:mt-1 max-sm:min-h-[44px] rounded-2xl bg-blue-600 px-6 py-1.5 text-sm leading-5 font-bold text-white transition hover:bg-blue-700">
                    🔍 {t("search.submit")}
                  </button>
                  {renderSaveTripAction("vuelo")}
                  {mensajeVuelos && (
                    <p role="status" className="mt-2 rounded-xl bg-blue-50 px-4 py-1.5 text-sm leading-6 text-blue-900">{text(mensajeVuelos)}</p>
                  )}
                </form>
                <form onSubmit={buscarHoteles} className="col-span-3 mt-1 max-sm:mt-0.5 hidden peer-checked/hoteles:block">
                  <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-x-2 max-sm:[&>label:last-child:nth-child(odd)]:col-span-2">
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.destination")}
                        <input required value={destinoHotel} onChange={(e) => setDestinoHotel(e.target.value)} placeholder="Barcelona" className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.checkIn")}
                        <input required type="date" value={entrada} onChange={(e) => setEntrada(e.target.value)} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.checkOut")}
                        <input required type="date" value={salida} onChange={(e) => setSalida(e.target.value)} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.guests")}
                        <input required type="number" min={1} max={10} value={huespedes} onChange={(e) => setHuespedes(Number(e.target.value))} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.rooms")}
                        <input required type="number" min={1} max={5} value={habitaciones} onChange={(e) => setHabitaciones(Number(e.target.value))} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                  </div>
                  <button type="submit" className="mt-2 w-full max-sm:mt-1 max-sm:min-h-[44px] rounded-2xl bg-blue-600 px-6 py-1.5 text-sm leading-5 font-bold text-white transition hover:bg-blue-700">
                    🔍 {t("search.submit")}
                  </button>
                  {renderSaveTripAction("hotel")}
                  {mensajeHoteles && (
                    <p role="status" className="mt-2 rounded-xl bg-blue-50 px-4 py-1.5 text-sm leading-6 text-blue-900">{text(mensajeHoteles)}</p>
                  )}
                </form>
                <form onSubmit={(e) => {
                      e.preventDefault();
                      setMensajeVuelos(
                        "El buscador de Vuelo + Hotel está preparado. Conectaremos las ofertas reales mediante la API."
                      );
                    }} className="col-span-3 mt-1 max-sm:mt-0.5 hidden peer-checked/paquete:block">
                  <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2 max-sm:grid-cols-2 max-sm:gap-x-2 max-sm:[&>label:last-child:nth-child(odd)]:col-span-2">
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.origin")}
                        <input required value={origen} onChange={(e) => setOrigen(e.target.value)} placeholder="Barcelona" className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.destination")}
                        <input required value={destinoVuelo} onChange={(e) => { setDestinoVuelo(e.target.value); setDestinoHotel(e.target.value); }} placeholder="Roma" className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.departureDate")}
                        <input required type="date" value={fechaIda} onChange={(e) => { setFechaIda(e.target.value); setEntrada(e.target.value); }} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.returnDate")}
                        <input required type="date" value={fechaVuelta} onChange={(e) => { setFechaVuelta(e.target.value); setSalida(e.target.value); }} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.travelers")}
                        <input required type="number" min={1} value={pasajeros} onChange={(e) => { const cantidad = Number(e.target.value); setPasajeros(cantidad); setHuespedes(cantidad); }} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-xs leading-4 font-semibold text-stone-700 max-sm:min-w-0 max-sm:leading-[14px]">
                        {t("search.rooms")}
                        <input required type="number" min={1} value={habitaciones} onChange={(e) => setHabitaciones(Number(e.target.value))} className="mt-0.5 w-full max-sm:mt-0 max-sm:h-11 max-sm:min-h-[44px] max-sm:min-w-0 rounded-xl border border-stone-300 bg-white px-4 py-1 max-sm:px-2 text-sm leading-4 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                  </div>
                  <button type="submit" className="mt-2 w-full max-sm:mt-1 max-sm:min-h-[44px] rounded-2xl bg-blue-600 px-6 py-1.5 text-sm leading-5 font-bold text-white transition hover:bg-blue-700">
                    🔍 {t("search.submit")}
                  </button>
                  {renderSaveTripAction("ambos")}
                  {mensajeVuelos && (
                    <p role="status" className="mt-2 rounded-xl bg-blue-50 px-4 py-1.5 text-sm leading-6 text-blue-900">{text(mensajeVuelos)}</p>
                  )}
                </form>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center border-t border-stone-200 bg-blue-50/70 px-6 py-2 text-center md:border-l md:border-t-0 md:px-8 md:py-2 max-sm:py-1">
              <h2 className="text-xl leading-6 font-black text-stone-800 max-sm:my-0 max-sm:text-lg max-sm:leading-5">✨ {t("voice.title")}</h2>
              <p className="mt-2 max-w-sm text-sm leading-5 text-stone-700 max-sm:mt-1 max-sm:leading-[18px]">
                {t("voice.description")}
              </p>
              <button
                type="button"
                onClick={vozActiva ? apagarVoz : iniciarVoz}
                aria-label={vozActiva ? t("voice.stop") : t("voice.title")}
                aria-pressed={vozActiva}
                className={`relative mt-2 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-4xl text-white shadow-xl transition hover:bg-blue-700 max-sm:mt-1 ${vozActiva ? "ring-4 ring-blue-300" : ""}`}
              >
                {vozActiva && (
                  <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-full">
                    <span className="absolute inset-0 animate-ping rounded-full border-2 border-blue-500 [animation-duration:2s]" />
                    <span className="absolute inset-0 animate-ping rounded-full border-2 border-blue-400 [animation-delay:650ms] [animation-duration:2s]" />
                    <span className="absolute inset-0 animate-ping rounded-full border-2 border-blue-300 [animation-delay:1300ms] [animation-duration:2s]" />
                  </span>
                )}
                <span className="relative z-10">🎙️</span>
              </button>
              <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-medium text-stone-700 max-sm:mt-1 max-sm:gap-y-0.5">
                <span>✓ {t("voice.ideas")}</span>
                <span>✓ {t("voice.time")}</span>
                <span>✓ {t("voice.recommendations")}</span>
              </div>
            </div>
          </div>

              
        </div>
      </section>

      {/* DESTINOS */}
      <section
        id="destinos"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24"
      >
        <div className="mb-12 text-center max-sm:mb-4">
          <h2 className="text-4xl font-black md:text-6xl">
            {t("destinations.title")}
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-stone-700">
            {t("destinations.description")}
          </p>
        </div>

        <div className="contents max-sm:relative max-sm:block">
        <div className="mb-2 flex justify-end sm:hidden max-sm:absolute max-sm:-right-3 max-sm:top-1/2 max-sm:z-10 max-sm:mb-0 max-sm:-translate-y-1/2">
          <button
            type="button"
            aria-label={t("destinations.next")}
            aria-controls="destinations-carousel"
            onClick={() => {
              const carousel = destinationsCarouselRef.current;
              const card = carousel?.querySelector("article");
              if (!carousel || !card) return;
              carousel.scrollBy({
                left: card.getBoundingClientRect().width + 8,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              });
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-800/20 bg-white/60 text-xl text-cyan-800 transition hover:bg-white"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
        <div
          ref={destinationsCarouselRef}
          id="destinations-carousel"
          role="region"
          aria-label={t("destinations.region")}
          tabIndex={0}
          className="mx-auto grid max-w-full gap-2 max-sm:auto-cols-[44%] max-sm:grid-flow-col max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:pb-3 sm:grid-cols-2 md:landscape:grid-cols-4 xl:grid-cols-4"
        >
          {destinations.map((destino) => (
            <article
              key={destino.name}
              className="group flex min-w-0 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] shadow-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-300/30 max-sm:snap-start max-sm:hover:translate-y-0"
            >
              <div className="relative h-[180px] shrink-0 overflow-hidden sm:h-[164px] lg:h-[124px] max-sm:h-[104px]">
                <img
                  src={destino.image}
                  alt={`${destino.name}, ${destino.country}`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

                <div className="absolute bottom-2.5 left-2.5 right-2.5 max-sm:bottom-2 max-sm:left-2 max-sm:right-2">
                  <p className="text-[13px] leading-4 text-cyan-200 max-sm:text-xs max-sm:leading-[14px]">
                    {destino.emoji} {destino.country}
                  </p>

                  <h3 className="mt-0.5 text-lg leading-5 font-black text-white lg:text-base lg:leading-5 max-sm:text-sm max-sm:leading-4">
                    {destino.name}
                  </h3>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-2.5 lg:p-2 max-sm:p-2">
                <p className="flex-1 text-[13px] leading-[18px] text-stone-700 max-sm:line-clamp-2 max-sm:h-8 max-sm:flex-none max-sm:text-xs max-sm:leading-4">
                  {text(destino.description)}
                </p>

                <button
                  type="button"
                  onClick={() => setDestinoSeleccionado(destino)}
                  className="mt-1.5 w-full rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-1.5 py-1 text-[13px] leading-[18px] font-semibold text-cyan-800 transition hover:bg-cyan-300 hover:text-slate-950 max-sm:mt-1 max-sm:min-h-[44px] max-sm:px-1 max-sm:py-0 max-sm:text-xs max-sm:leading-4"
                >
                  {t("destinations.explore", { destination: destino.name })}
                </button>
              </div>
            </article>
          ))}
        </div>
        </div>
      </section>
{/* VIAJAR SEGÚN LA TEMPORADA */}
<section className="relative z-10 mx-auto max-w-7xl px-6 pb-6 pt-12 sm:pb-8 sm:pt-14 lg:pt-16">
  <div className="mb-5 text-center sm:mb-6">
    <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
      {t("season.eyebrow")}
    </p>

    <h2 className="mt-2 text-3xl font-black leading-tight md:text-5xl">
      {t("season.title")}
    </h2>

    <p className="mx-auto mt-2 max-w-2xl text-stone-700">
      {t("season.description")}
    </p>
  </div>

  <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">

    <button
  onClick={() => (window.location.href = "/temporadas/primavera")}
  className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-blue-600/60 bg-white/[0.07] px-2.5 py-2.5 text-[15px] leading-5 font-bold backdrop-blur-xl sm:px-3 lg:transition-colors lg:hover:border-blue-600"
>
      <span aria-hidden="true" className="text-xl leading-none">🌸</span> {t("season.spring")}
    </button>

    <button
  onClick={() => (window.location.href = "/temporadas/verano")}
  className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-blue-600/60 bg-white/[0.07] px-2.5 py-2.5 text-[15px] leading-5 font-bold backdrop-blur-xl sm:px-3 lg:transition-colors lg:hover:border-blue-600"
>
      <span aria-hidden="true" className="text-xl leading-none">☀️</span> {t("season.summer")}
    </button>
    <button
  onClick={() => (window.location.href = "/temporadas/otono")}
  className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-blue-600/60 bg-white/[0.07] px-2.5 py-2.5 text-[15px] leading-5 font-bold backdrop-blur-xl sm:px-3 lg:transition-colors lg:hover:border-blue-600"
>
  <span aria-hidden="true" className="text-xl leading-none">🍂</span> {t("season.autumn")}
</button>

<button
  onClick={() => (window.location.href = "/temporadas/invierno")}
  className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-2xl border border-blue-600/60 bg-white/[0.07] px-2.5 py-2.5 text-[15px] leading-5 font-bold backdrop-blur-xl sm:px-3 lg:transition-colors lg:hover:border-blue-600"
>
  <span aria-hidden="true" className="text-xl leading-none">❄️</span> {t("season.winter")}
</button>
  </div>
</section>
      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-sm text-stone-700">
        <p>
          DESTINO <span className="text-cyan-800">AI</span> · {t("footer.companion")}
        </p>
      </footer>

      {/* MODAL DESTINO */}
      {destinoSeleccionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 text-white p-4 backdrop-blur-md">
          <div className="mx-auto my-8 max-w-3xl overflow-hidden rounded-[30px] border border-white/10 bg-slate-950 shadow-2xl">
            <div className="relative h-72 md:h-96">
              <img
                src={destinoSeleccionado.image}
                alt={destinoSeleccionado.name}
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />

              <button
                type="button"
                onClick={() => setDestinoSeleccionado(null)}
                className="absolute right-5 top-5 rounded-full bg-black/60 px-4 py-2 font-bold backdrop-blur"
              >
                ✕
              </button>

              <div className="absolute bottom-6 left-6">
                <p className="text-cyan-200">
                  {destinoSeleccionado.emoji}{" "}
                  {destinoSeleccionado.country}
                </p>

                <h2 className="text-4xl font-black md:text-5xl">
                  {destinoSeleccionado.name}
                </h2>
              </div>
            </div>

            <div className="p-7 md:p-9">
              <p className="text-lg leading-8 text-slate-300">
                {text(destinoSeleccionado.description)}
              </p>

              <h3 className="mt-8 text-xl font-bold">
                ✨ {t("destinations.recommendations")}
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {destinoSeleccionado.recommendations.map(
                  (recomendacion) => (
                    <div
                      key={recomendacion}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300"
                    >
                      📍 {text(recomendacion)}
                    </div>
                  )
                )}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() =>
                    abrirVuelos(destinoSeleccionado.name)
                  }
                  className="rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-slate-950"
                >
                  ✈️ {t("search.findFlights")}
                </button>

                <button
                  onClick={() =>
                    abrirHoteles(destinoSeleccionado.name)
                  }
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-6 py-4 font-bold text-cyan-200"
                >
                  🏨 {t("search.findHotels")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VUELOS */}
      {modal === "vuelos" && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 text-white p-4 backdrop-blur-md">
          <div className="mx-auto my-8 max-w-4xl rounded-[30px] border border-white/10 bg-slate-950 p-6 shadow-2xl md:p-9">
            <div className="mb-8 flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-bold tracking-[0.25em] text-cyan-300">
                EL VIAJERO
                </p>
                <h2 className="mt-2 text-3xl font-black md:text-4xl">
                  ✈️ {t("search.findFlights")}
                </h2>
              </div>

              <button
                onClick={() => setModal(null)}
                className="rounded-full bg-white px-4 py-2 font-bold text-slate-950"
              >
                ✕
              </button>
            </div>

            <form onSubmit={buscarVuelos}>
              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm text-slate-300">
                    {t("search.origin")}
                  </span>
                  <input
                    required
                    value={origen}
                    onChange={(e) => setOrigen(e.target.value)}
                    placeholder="Madrid"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none focus:border-cyan-300/50"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-slate-300">
                    {t("search.destination")}
                  </span>
                  <input
                    required
                    value={destinoVuelo}
                    onChange={(e) => setDestinoVuelo(e.target.value)}
                    placeholder="París"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none focus:border-cyan-300/50"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-slate-300">
                    {t("search.departureDate")}
                  </span>
                  <input
                    required
                    type="date"
                    value={fechaIda}
                    onChange={(e) => setFechaIda(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-slate-300">
                    {t("search.returnDate")}
                  </span>
                  <input
                    required
                    type="date"
                    value={fechaVuelta}
                    onChange={(e) => setFechaVuelta(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm text-slate-300">
                    {t("search.passengers")}
                  </span>
                  <input
                    required
                    type="number"
                    min={1}
                    max={9}
                    value={pasajeros}
                    onChange={(e) =>
                      setPasajeros(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-cyan-300 px-6 py-4 font-black text-slate-950 transition hover:bg-cyan-200"
              >
                {t("search.findFlights")}
              </button>
              {renderSaveTripAction("vuelo", true)}
            </form>

            {mensajeVuelos && (
              <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 leading-7 text-cyan-100">
                {text(mensajeVuelos)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL HOTELES */}
      {modal === "hoteles" && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 text-white p-4 backdrop-blur-md">
          <div className="mx-auto my-8 max-w-4xl rounded-[30px] border border-white/10 bg-slate-950 p-6 shadow-2xl md:p-9">
            <div className="mb-8 flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-bold tracking-[0.25em] text-cyan-300">
                EL VIAJERO
                </p>
                <h2 className="mt-2 text-3xl font-black md:text-4xl">
                  🏨 {t("search.findHotels")}
                </h2>
              </div>

              <button
                onClick={() => setModal(null)}
                className="rounded-full bg-white px-4 py-2 font-bold text-slate-950"
              >
                ✕
              </button>
            </div>

            <form onSubmit={buscarHoteles}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-2 block text-sm text-slate-300">
                    {t("search.destination")}
                  </span>
                  <input
                    required
                    value={destinoHotel}
                    onChange={(e) => setDestinoHotel(e.target.value)}
                    placeholder="Barcelona"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none focus:border-cyan-300/50"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-slate-300">
                    {t("search.checkIn")}
                  </span>
                  <input
                    required
                    type="date"
                    value={entrada}
                    onChange={(e) => setEntrada(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-slate-300">
                    {t("search.checkOut")}
                  </span>
                  <input
                    required
                    type="date"
                    value={salida}
                    onChange={(e) => setSalida(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-slate-300">
                    {t("search.guests")}
                  </span>
                  <input
                    required
                    type="number"
                    min={1}
                    max={20}
                    value={huespedes}
                    onChange={(e) =>
                      setHuespedes(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none"
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm text-slate-300">
                    {t("search.rooms")}
                  </span>
                  <input
                    required
                    type="number"
                    min={1}
                    max={10}
                    value={habitaciones}
                    onChange={(e) =>
                      setHabitaciones(Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-cyan-300 px-6 py-4 font-black text-slate-950 transition hover:bg-cyan-200"
              >
                {t("search.findHotels")}
              </button>
              {renderSaveTripAction("hotel", true)}
            </form>

            {mensajeHoteles && (
              <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 leading-7 text-cyan-100">
                {text(mensajeHoteles)}
              </div>
            )}
          </div>
        </div>
      )}

{/* MODAL VUELO + HOTEL */}
{modal === "paquete" && (
  <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 text-white p-4 backdrop-blur-md">
    <div className="mx-auto my-8 max-w-4xl rounded-[30px] border border-white/10 bg-slate-950 p-6 shadow-2xl md:p-9">

      <div className="mb-8 flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-bold tracking-[0.25em] text-cyan-300">
            EL VIAJERO
          </p>

          <h2 className="mt-2 text-3xl font-black md:text-4xl">
            ✈️🏨 {t("trips.package")}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setModal(null)}
          className="rounded-full bg-white px-4 py-2 font-bold text-slate-950"
        >
          ×
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setMensajeVuelos(
            "El buscador de Vuelo + Hotel está preparado. Conectaremos las ofertas reales mediante la API."
          );
        }}
      >
        <div className="grid gap-4 md:grid-cols-2">

          <label>
            <span className="mb-2 block text-sm text-slate-300">
              {t("search.origin")}
            </span>
            <input
              required
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
              placeholder="Barcelona"
              className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none focus:border-cyan-300/50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">
              {t("search.destination")}
            </span>
            <input
              required
              value={destinoVuelo}
              onChange={(e) => {
                setDestinoVuelo(e.target.value);
                setDestinoHotel(e.target.value);
              }}
              placeholder="Roma"
              className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none focus:border-cyan-300/50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">
              {t("search.departureDate")}
            </span>
            <input
              required
              type="date"
              value={fechaIda}
              onChange={(e) => {
                setFechaIda(e.target.value);
                setEntrada(e.target.value);
              }}
              className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none focus:border-cyan-300/50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">
              {t("search.returnDate")}
            </span>
            <input
              required
              type="date"
              value={fechaVuelta}
              onChange={(e) => {
                setFechaVuelta(e.target.value);
                setSalida(e.target.value);
              }}
              className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none focus:border-cyan-300/50"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">
              {t("search.travelers")}
            </span>
            <input
              required
              type="number"
              min="1"
              value={pasajeros}
              onChange={(e) => {
                const cantidad = Number(e.target.value);
                setPasajeros(cantidad);
                setHuespedes(cantidad);
              }}
              className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm text-slate-300">
              {t("search.rooms")}
            </span>
            <input
              required
              type="number"
              min="1"
              value={habitaciones}
              onChange={(e) =>
                setHabitaciones(Number(e.target.value))
              }
              className="w-full rounded-xl border border-white/10 bg-white/[0.07] p-4 outline-none"
            />
          </label>

        </div>

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-cyan-300 px-6 py-4 font-black text-slate-950 transition hover:bg-cyan-200"
        >
          ✈️🏨 {t("search.findPackage")}
        </button>
        {renderSaveTripAction("ambos", true)}
      </form>

      {mensajeVuelos && (
        <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 leading-7 text-cyan-100">
          {text(mensajeVuelos)}
        </div>
      )}

    </div>
  </div>
)}
        
      {authMode && <AuthDialog key={authMode} mode={authMode} onClose={() => setAuthMode(null)} />}
    </main>
  );
}
