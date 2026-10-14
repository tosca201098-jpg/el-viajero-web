"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

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
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1200&q=80",
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
const nombresFondos = [
  "París, Francia",
  "Tokio, Japón",
  "Nueva York, Estados Unidos",
  "Maldivas",
  "Roma, Italia",
  "Santorini, Grecia",
  "Bali, Indonesia",
  "Dubái, Emiratos Árabes Unidos",
  "Londres, Reino Unido",
  "Islandia",
  "Suiza",
  "Tailandia",
];
export default function Home() {
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
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-[#F7F2E8]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="text-xl font-black tracking-tight"
          >
           EL V<span className="text-blue-500">IA</span>JERO
          </button>

          <div className="hidden items-center gap-7 text-sm text-blue-500 md:flex">
            <button
              onClick={() =>
                document
                  .getElementById("destinos")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="transition hover:text-cyan-800"
            >
              Destinos
            </button>

            <button
              onClick={() => abrirVuelos()}
              className="transition hover:text-cyan-300"
            >
              Vuelos
            </button>

            <button
              onClick={() => abrirHoteles()}
              className="transition hover:text-cyan-300"
            >
              Hoteles
            </button>
          </div>
        </div>
      </nav>

      {/* PORTADA */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6 pb-16 pt-28">
        <div className="mx-auto w-full max-w-5xl text-center">
         
        <img
  src="https://i.ibb.co/qwy6gvm/file-00000000c0d4821099521df6da250944.png"
  alt="El vIAjero"
  className="mx-auto mb-4 h-32 w-44 object-contain"
/>
          <h1 className="text-6xl font-black tracking-tight md:text-8xl lg:text-9xl">
        EL V<span className="text-blue-500">IA</span>JERO
          </h1>
          <div className="mt-5 inline-flex items-center rounded-full border border-white/20 bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-md">
  📍 {nombresFondos[fondoActual]}
</div>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-stone-700 md:text-xl">
            Tu asistente inteligente para descubrir destinos, organizar tu
            viaje y encontrar vuelos y hoteles.
          </p>

          {/* BUSCADOR IA */}
          <div className="mx-auto mt-10 grid w-full overflow-hidden rounded-[36px] border border-stone-200 bg-[#F7F2E8]/95 text-left shadow-2xl backdrop-blur-2xl md:grid-cols-2">
            <div className="px-6 py-4 md:px-8 md:py-6">
              <h2 className="text-2xl font-black text-stone-800">✈️ Buscar tu viaje</h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <input type="radio" name="buscador-servicio" id="buscador-vuelos" className="peer/vuelos sr-only" defaultChecked />
                <input type="radio" name="buscador-servicio" id="buscador-hoteles" className="peer/hoteles sr-only" />
                <input type="radio" name="buscador-servicio" id="buscador-paquete" className="peer/paquete sr-only" />

                <label htmlFor="buscador-vuelos" className="cursor-pointer rounded-xl border border-stone-300 bg-white px-2 py-2 text-center text-sm font-bold text-stone-700 transition peer-checked/vuelos:border-blue-600 peer-checked/vuelos:bg-blue-600 peer-checked/vuelos:text-white peer-focus-visible/vuelos:ring-2 peer-focus-visible/vuelos:ring-blue-600">
                  ✈️ Vuelos
                </label>
                <label htmlFor="buscador-hoteles" className="cursor-pointer rounded-xl border border-stone-300 bg-white px-2 py-2 text-center text-sm font-bold text-stone-700 transition peer-checked/hoteles:border-blue-600 peer-checked/hoteles:bg-blue-600 peer-checked/hoteles:text-white peer-focus-visible/hoteles:ring-2 peer-focus-visible/hoteles:ring-blue-600">
                  🏨 Hoteles
                </label>
                <label htmlFor="buscador-paquete" className="cursor-pointer rounded-xl border border-stone-300 bg-white px-2 py-2 text-center text-sm font-bold text-stone-700 transition peer-checked/paquete:border-blue-600 peer-checked/paquete:bg-blue-600 peer-checked/paquete:text-white peer-focus-visible/paquete:ring-2 peer-focus-visible/paquete:ring-blue-600">
                  ✈️🏨 Vuelo + Hotel
                </label>
                <form onSubmit={buscarVuelos} className="col-span-3 mt-3 hidden peer-checked/vuelos:block">
                  <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-stone-700">
                        Origen
                        <input required value={origen} onChange={(e) => setOrigen(e.target.value)} placeholder="Madrid" className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Destino
                        <input required value={destinoVuelo} onChange={(e) => setDestinoVuelo(e.target.value)} placeholder="París" className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Fecha de ida
                        <input required type="date" value={fechaIda} onChange={(e) => setFechaIda(e.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Fecha de vuelta
                        <input required type="date" value={fechaVuelta} onChange={(e) => setFechaVuelta(e.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Viajeros
                        <input required type="number" min={1} max={9} value={pasajeros} onChange={(e) => setPasajeros(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                  </div>
                  <button type="submit" className="mt-4 w-full rounded-2xl bg-blue-600 px-6 py-3 text-lg font-bold text-white transition hover:bg-blue-700">
                    🔍 Buscar
                  </button>
                  {mensajeVuelos && (
                    <p role="status" className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">{mensajeVuelos}</p>
                  )}
                </form>
                <form onSubmit={buscarHoteles} className="col-span-3 mt-3 hidden peer-checked/hoteles:block">
                  <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-stone-700">
                        Destino
                        <input required value={destinoHotel} onChange={(e) => setDestinoHotel(e.target.value)} placeholder="Barcelona" className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Entrada
                        <input required type="date" value={entrada} onChange={(e) => setEntrada(e.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Salida
                        <input required type="date" value={salida} onChange={(e) => setSalida(e.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Huéspedes
                        <input required type="number" min={1} max={10} value={huespedes} onChange={(e) => setHuespedes(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Habitaciones
                        <input required type="number" min={1} max={5} value={habitaciones} onChange={(e) => setHabitaciones(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                  </div>
                  <button type="submit" className="mt-4 w-full rounded-2xl bg-blue-600 px-6 py-3 text-lg font-bold text-white transition hover:bg-blue-700">
                    🔍 Buscar
                  </button>
                  {mensajeHoteles && (
                    <p role="status" className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">{mensajeHoteles}</p>
                  )}
                </form>
                <form onSubmit={(e) => {
                      e.preventDefault();
                      setMensajeVuelos(
                        "El buscador de Vuelo + Hotel está preparado. Conectaremos las ofertas reales mediante la API."
                      );
                    }} className="col-span-3 mt-3 hidden peer-checked/paquete:block">
                  <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                      <label className="block text-sm font-semibold text-stone-700">
                        Origen
                        <input required value={origen} onChange={(e) => setOrigen(e.target.value)} placeholder="Barcelona" className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Destino
                        <input required value={destinoVuelo} onChange={(e) => { setDestinoVuelo(e.target.value); setDestinoHotel(e.target.value); }} placeholder="Roma" className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Fecha de ida
                        <input required type="date" value={fechaIda} onChange={(e) => { setFechaIda(e.target.value); setEntrada(e.target.value); }} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Fecha de vuelta
                        <input required type="date" value={fechaVuelta} onChange={(e) => { setFechaVuelta(e.target.value); setSalida(e.target.value); }} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Viajeros
                        <input required type="number" min={1} value={pasajeros} onChange={(e) => { const cantidad = Number(e.target.value); setPasajeros(cantidad); setHuespedes(cantidad); }} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                      <label className="block text-sm font-semibold text-stone-700">
                        Habitaciones
                        <input required type="number" min={1} value={habitaciones} onChange={(e) => setHabitaciones(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-4 py-2 text-stone-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20" />
                      </label>
                  </div>
                  <button type="submit" className="mt-4 w-full rounded-2xl bg-blue-600 px-6 py-3 text-lg font-bold text-white transition hover:bg-blue-700">
                    🔍 Buscar
                  </button>
                  {mensajeVuelos && (
                    <p role="status" className="mt-3 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-900">{mensajeVuelos}</p>
                  )}
                </form>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center border-t border-stone-200 bg-blue-50/70 px-6 py-4 text-center md:border-l md:border-t-0 md:px-8 md:py-6">
              <h2 className="text-2xl font-black text-stone-800">✨ Hablar con mi agente de viajes</h2>
              <p className="mt-3 max-w-sm leading-7 text-stone-700">
                Cuéntame qué tipo de viaje quieres y te ayudaré a encontrar las mejores opciones.
              </p>
              <button
                type="button"
                onClick={vozActiva ? apagarVoz : iniciarVoz}
                aria-label={vozActiva ? "Apagar voz" : "Hablar con mi agente de viajes"}
                aria-pressed={vozActiva}
                className={`relative mt-5 flex h-28 w-28 items-center justify-center rounded-full bg-blue-600 text-5xl text-white shadow-xl transition hover:bg-blue-700 ${vozActiva ? "ring-4 ring-blue-300" : ""}`}
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
              <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs font-medium text-stone-700">
                <span>✓ Ideas personalizadas</span>
                <span>✓ Ahorra tiempo</span>
                <span>✓ Las mejores recomendaciones</span>
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
        <div className="mb-12 text-center">
          <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
            INSPÍRATE
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-6xl">
            Destinos que te encantarán
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-stone-700">
            Descubre algunos de los destinos más fascinantes y empieza a
            preparar tu próxima aventura.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl grid-cols-5 gap-3">
          {destinations.map((destino) => (
            <article
              key={destino.name}
              className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] shadow-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-300/30"
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={destino.image}
                  alt={`${destino.name}, ${destino.country}`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

                <div className="absolute bottom-5 left-5">
                  <p className="text-sm text-cyan-200">
                    {destino.emoji} {destino.country}
                  </p>

                  <h3 className="mt-1 text-3xl font-black text-white">
                    {destino.name}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="min-h-[72px] leading-6 text-stone-700">
                  {destino.description}
                </p>

                <button
                  type="button"
                  onClick={() => setDestinoSeleccionado(destino)}
                  className="mt-6 w-full rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-800 transition hover:bg-cyan-300 hover:text-slate-950"
                >
                  Explorar {destino.name} →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
{/* VIAJAR SEGÚN LA TEMPORADA */}
<section className="relative z-10 mx-auto max-w-7xl px-6 py-24">
  <div className="mb-12 text-center">
    <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
      ELIGE EL MOMENTO PERFECTO
    </p>

    <h2 className="mt-4 text-4xl font-black md:text-6xl">
      Dónde viajar según la temporada
    </h2>

    <p className="mx-auto mt-5 max-w-2xl text-stone-700">
      Descubre destinos ideales para cada época del año.
    </p>
  </div>

  <div className="grid grid-cols-4 gap-3">

    <button
  onClick={() => (window.location.href = "/temporadas/primavera")}
  className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 font-bold backdrop-blur-xl"
>
      🌸 Primavera
    </button>

    <button
  onClick={() => (window.location.href = "/temporadas/verano")}
  className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 font-bold backdrop-blur-xl"
>
      ☀️ Verano
    </button>
    <button
  onClick={() => (window.location.href = "/temporadas/otono")}
  className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 font-bold backdrop-blur-xl"
>
  🍂 Otoño
</button>

<button
  onClick={() => (window.location.href = "/temporadas/invierno")}
  className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 font-bold backdrop-blur-xl"
>
  ❄️ Invierno
</button>
  </div>
</section>
      {/* CTA FINAL */}
      <section className="relative z-10 px-6 py-28 text-center">
        <div className="mx-auto max-w-4xl rounded-[36px] border border-cyan-300/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-8 backdrop-blur-xl md:p-14">
          <p className="text-sm font-bold tracking-[0.3em] text-cyan-800">
            TU PRÓXIMA AVENTURA
          </p>

          <h2 className="mt-5 text-4xl font-black md:text-6xl">
            El mundo está esperando
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-stone-700">
            Elige un destino y empieza a construir tu viaje con El. VIAJERO.
          </p>

          <button
            type="button"
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            className="mt-8 rounded-2xl bg-cyan-300 px-8 py-4 font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            Empezar ahora ↑
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-sm text-stone-700">
        <p>
          DESTINO <span className="text-cyan-800">AI</span> · Tu compañero
          inteligente de viaje
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
                {destinoSeleccionado.description}
              </p>

              <h3 className="mt-8 text-xl font-bold">
                ✨ Recomendaciones
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {destinoSeleccionado.recommendations.map(
                  (recomendacion) => (
                    <div
                      key={recomendacion}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300"
                    >
                      📍 {recomendacion}
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
                  ✈️ Buscar vuelos
                </button>

                <button
                  onClick={() =>
                    abrirHoteles(destinoSeleccionado.name)
                  }
                  className="rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-6 py-4 font-bold text-cyan-200"
                >
                  🏨 Buscar hoteles
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
                  ✈️ Buscar vuelos
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
                    Origen
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
                    Destino
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
                    Fecha de ida
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
                    Fecha de vuelta
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
                    Pasajeros
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
                Buscar vuelos
              </button>
            </form>

            {mensajeVuelos && (
              <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 leading-7 text-cyan-100">
                {mensajeVuelos}
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
                  🏨 Buscar hoteles
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
                    Destino
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
                    Entrada
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
                    Salida
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
                    Huéspedes
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
                    Habitaciones
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
                Buscar hoteles
              </button>
            </form>

            {mensajeHoteles && (
              <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 leading-7 text-cyan-100">
                {mensajeHoteles}
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
            ✈️🏨 Vuelo + Hotel
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
              Origen
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
              Destino
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
              Fecha de ida
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
              Fecha de vuelta
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
              Viajeros
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
              Habitaciones
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
          ✈️🏨 Buscar Vuelo + Hotel
        </button>
      </form>

      {mensajeVuelos && (
        <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 leading-7 text-cyan-100">
          {mensajeVuelos}
        </div>
      )}

    </div>
  </div>
)}
        
    </main>
  );
}
