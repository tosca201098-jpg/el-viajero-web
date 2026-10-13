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
setPasajeros(datos.viajeros);
      setDestinoSeleccionado(destino);
    }
  }
};
dc.onopen = () => {
setVozActiva(true);
  dc.send(
    JSON.stringify({
      type: "response.create",
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

  const [modal, setModal] = useState<"vuelos" | "hoteles" | null>(null);

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
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
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

<div className="fixed inset-0 z-0 bg-slate-950/60" />
      {/* FONDO ANIMADO */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-cyan-500/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-500/20 blur-[120px]" />
      </div>

      {/* NAVEGACIÓN */}
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
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
              className="transition hover:text-cyan-300"
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
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl">
            Tu asistente inteligente para descubrir destinos, organizar tu
            viaje y encontrar vuelos y hoteles.
          </p>

          {/* BUSCADOR IA */}
          <div className="mx-auto mt-10 max-w-3xl rounded-[32px] border border-cyan-300/20 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-2xl">
            <p className="mb-4 text-left text-sm font-medium text-cyan-200">
              ¿A dónde quieres viajar?
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") explorarConIA();
                }}
                placeholder="Ejemplo: Quiero viajar a Tokio..."
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50"
              />

              <button
                type="button"
                onClick={vozActiva ? apagarVoz : iniciarVoz}
       
                aria-label="Hablar con Destino AI"
                className={`rounded-2xl border px-6 py-4 text-2xl transition ${
  vozActiva
    ? "animate-pulse border-green-300 bg-green-500/40"
    : "border-red-400 bg-red-500/40 hover:bg-red-500/50"
}`}
              >
                🎙️
              </button>
            </div>

            <button
              type="button"
              onClick={explorarConIA}
              className="mt-4 w-full rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              Explorar con IA →
            </button>
          </div>

          {/* BOTONES VUELOS HOTELES */}
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => abrirVuelos(destinoSeleccionado?.name || "")}
              className="rounded-2xl border border-white/15 bg-white/[0.06] px-7 py-4 font-semibold backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              ✈️ Buscar vuelos
            </button>

            <button
              onClick={() => abrirHoteles(destinoSeleccionado?.name || "")}
              className="rounded-2xl border border-white/15 bg-white/[0.06] px-7 py-4 font-semibold backdrop-blur-xl transition hover:border-cyan-300/40 hover:bg-white/10"
            >
              🏨 Buscar hoteles
            </button>
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              🌍 Destinos reales
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              🎙️ Asistente por voz
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
              ✨ Viajes personalizados
            </span>
          </div>
        </div>
      </section>

      {/* DESTINOS */}
      <section
        id="destinos"
        className="relative z-10 mx-auto max-w-7xl px-6 py-24"
      >
        <div className="mb-12 text-center">
          <p className="text-sm font-bold tracking-[0.35em] text-cyan-300">
            INSPÍRATE
          </p>

          <h2 className="mt-4 text-4xl font-black md:text-6xl">
            Destinos que te encantarán
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
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

                  <h3 className="mt-1 text-3xl font-black">
                    {destino.name}
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="min-h-[72px] leading-6 text-slate-300">
                  {destino.description}
                </p>

                <button
                  type="button"
                  onClick={() => setDestinoSeleccionado(destino)}
                  className="mt-6 w-full rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-300 hover:text-slate-950"
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
    <p className="text-sm font-bold tracking-[0.35em] text-cyan-300">
      ELIGE EL MOMENTO PERFECTO
    </p>

    <h2 className="mt-4 text-4xl font-black md:text-6xl">
      Dónde viajar según la temporada
    </h2>

    <p className="mx-auto mt-5 max-w-2xl text-slate-300">
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
      {/* RECOMENDACIONES */}
      <section className="relative z-10 border-y border-white/10 bg-white/[0.03]">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-7">
              <div className="text-4xl">🧭</div>
              <h3 className="mt-5 text-xl font-bold">
                Recomendaciones inteligentes
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Descubre lugares y experiencias según el tipo de viaje que
                quieras realizar.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-7">
              <div className="text-4xl">✈️</div>
              <h3 className="mt-5 text-xl font-bold">
                Compara tus vuelos
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                El buscador quedará conectado a información real cuando
                añadamos el proveedor de vuelos.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-7">
              <div className="text-4xl">🏨</div>
              <h3 className="mt-5 text-xl font-bold">
                Encuentra alojamiento
              </h3>
              <p className="mt-3 leading-7 text-slate-400">
                Busca hoteles por destino, fechas, huéspedes y habitaciones
                desde la misma web.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative z-10 px-6 py-28 text-center">
        <div className="mx-auto max-w-4xl rounded-[36px] border border-cyan-300/20 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-8 backdrop-blur-xl md:p-14">
          <p className="text-sm font-bold tracking-[0.3em] text-cyan-300">
            TU PRÓXIMA AVENTURA
          </p>

          <h2 className="mt-5 text-4xl font-black md:text-6xl">
            El mundo está esperando
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-300">
            Elige un destino y empieza a construir tu viaje con DestinIA.
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
      <footer className="relative z-10 border-t border-white/10 px-6 py-10 text-center text-sm text-slate-500">
        <p>
          DESTINO <span className="text-cyan-300">AI</span> · Tu compañero
          inteligente de viaje
        </p>
      </footer>

      {/* MODAL DESTINO */}
      {destinoSeleccionado && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
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
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
          <div className="mx-auto my-8 max-w-4xl rounded-[30px] border border-white/10 bg-slate-950 p-6 shadow-2xl md:p-9">
            <div className="mb-8 flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-bold tracking-[0.25em] text-cyan-300">
                DestinIA
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
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/80 p-4 backdrop-blur-md">
          <div className="mx-auto my-8 max-w-4xl rounded-[30px] border border-white/10 bg-slate-950 p-6 shadow-2xl md:p-9">
            <div className="mb-8 flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-bold tracking-[0.25em] text-cyan-300">
                DestinIA
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
    </main>
  );
}