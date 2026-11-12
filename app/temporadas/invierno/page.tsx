"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const destinosInvierno = [
  {
    nombre: "Rovaniemi y Laponia",
    pais: "Finlandia",
    imagen: "https://images.unsplash.com/photo-1645020455080-794aded408ca?auto=format&fit=crop&w=1200&q=80",
    categoria: "❄️ Nieve y auroras",
    descripcion: "Bosques nevados, renos y noches ideales para buscar auroras boreales.",
  },
  {
    nombre: "Tromsø",
    pais: "Noruega",
    imagen: "https://images.unsplash.com/photo-1536575367754-a8a6c27eed81?auto=format&fit=crop&w=1200&q=80",
    categoria: "❄️ Nieve y auroras",
    descripcion: "Una ciudad ártica entre fiordos nevados y auroras boreales.",
  },
  {
    nombre: "Islandia",
    pais: "Islandia",
    imagen: "https://images.unsplash.com/photo-1589311836849-4cec35b363cb?auto=format&fit=crop&w=1200&q=80",
    categoria: "❄️ Nieve y auroras",
    descripcion: "Largos cielos nocturnos, glaciares y paisajes volcánicos bajo auroras.",
  },
  {
    nombre: "Zermatt",
    pais: "Suiza",
    imagen: "https://images.unsplash.com/photo-1658244909731-ec8479854111?auto=format&fit=crop&w=1200&q=80",
    categoria: "⛷️ Esquí y montaña",
    descripcion: "Nieve alpina y vistas del Matterhorn junto a pistas de esquí.",
  },
  {
    nombre: "Dolomitas / Cortina d’Ampezzo",
    pais: "Italia",
    imagen: "https://images.unsplash.com/photo-1676043598815-597487beff46?auto=format&fit=crop&w=1200&q=80",
    categoria: "⛷️ Esquí y montaña",
    descripcion: "Pistas y pueblos de montaña rodeados de cumbres nevadas.",
  },
  {
    nombre: "Banff",
    pais: "Canadá",
    imagen: "https://images.unsplash.com/photo-1570298472419-a4f77236febb?auto=format&fit=crop&w=1200&q=80",
    categoria: "⛷️ Esquí y montaña",
    descripcion: "Lagos helados y montañas nevadas en las Rocosas canadienses.",
  },
  {
    nombre: "Hokkaido / Sapporo",
    pais: "Japón",
    imagen: "https://images.unsplash.com/photo-1756460885368-c3ae2e7876b2?auto=format&fit=crop&w=1200&q=80",
    categoria: "⛷️ Esquí y montaña",
    descripcion: "Nieve abundante, cultura urbana y estaciones de esquí de Hokkaido.",
  },
  {
    nombre: "Nueva York",
    pais: "Estados Unidos",
    imagen: "https://images.unsplash.com/photo-1522479968247-63eafc78951e?auto=format&fit=crop&w=1200&q=80",
    categoria: "🎄 Ciudad invernal",
    descripcion: "Luces, mercadillos y pistas de hielo dan ambiente invernal a la ciudad.",
  },
  {
    nombre: "Fuerteventura",
    pais: "España",
    imagen: "https://images.unsplash.com/photo-1545289415-50dff9405935?auto=format&fit=crop&w=1200&q=80",
    categoria: "☀️ Sol de invierno",
    descripcion: "Playas y clima suave para escapar del frío durante el invierno europeo.",
  },
  {
    nombre: "Madeira",
    pais: "Portugal",
    imagen: "https://images.unsplash.com/photo-1722608129622-f0c4a0e55dc2?auto=format&fit=crop&w=1200&q=80",
    categoria: "☀️ Sol de invierno",
    descripcion: "Senderos y paisajes verdes con clima templado para huir del frío europeo.",
  },
  {
    nombre: "Maldivas",
    pais: "Maldivas",
    imagen: "https://images.unsplash.com/photo-1758717152007-6a2eb7299409?auto=format&fit=crop&w=1200&q=80",
    categoria: "🌴 Escapada tropical",
    descripcion: "Mar turquesa y temporada seca para escapar del invierno europeo.",
  },
  {
    nombre: "Phuket y Krabi",
    pais: "Tailandia",
    imagen: "https://images.unsplash.com/photo-1673627114831-72296089fb6d?auto=format&fit=crop&w=1200&q=80",
    categoria: "🌴 Escapada tropical",
    descripcion: "Playas e islas en temporada seca, lejos del frío del invierno europeo.",
  },
  {
    nombre: "Ciudad del Cabo",
    pais: "Sudáfrica",
    imagen: "https://images.unsplash.com/photo-1770553129625-9a0803c9e645?auto=format&fit=crop&w=1200&q=80",
    categoria: "🥾 Verano austral / naturaleza",
    descripcion: "El verano austral invita a explorar montañas, costa y naturaleza.",
  },
  {
    nombre: "Patagonia",
    pais: "Argentina y Chile",
    imagen: "https://images.unsplash.com/photo-1667759318615-757c8ddbfa7a?auto=format&fit=crop&w=1200&q=80",
    categoria: "🥾 Verano austral / naturaleza",
    descripcion: "El verano austral ofrece días largos para descubrir glaciares y senderos.",
  },
  {
    nombre: "Singapur",
    pais: "Singapur",
    imagen: "https://images.unsplash.com/photo-1628866686613-6cf852bed925?auto=format&fit=crop&w=1200&q=80",
    categoria: "🌴 Escapada tropical",
    descripcion: "Calor tropical todo el año para dejar atrás el invierno europeo.",
  },
  {
    nombre: "Río de Janeiro",
    pais: "Brasil",
    imagen: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?auto=format&fit=crop&w=1200&q=80",
    categoria: "☀️ Sol de invierno",
    descripcion: "Playas y verano austral para escapar del frío del invierno europeo.",
  },
];

const detallesInvierno: Record<string, { lugares: [string, string, string, string]; dias: string }> = {
  ["Rovaniemi y Laponia"]: { lugares: ["Aldea de Papá Noel", "Museo Arktikum", "Colina Ounasvaara", "Parque de fauna de Ranua"], dias: "4–5" },
  ["Tromsø"]: { lugares: ["Catedral Ártica", "Mirador Fjellheisen", "Centro Polaria", "Isla de Kvaløya"], dias: "3–5" },
  ["Islandia"]: { lugares: ["Reikiavik", "Círculo Dorado", "Laguna Jökulsárlón", "Cascada Skógafoss"], dias: "5–7" },
  ["Zermatt"]: { lugares: ["Gornergrat", "Matterhorn Glacier Paradise", "Sunnegga", "Casco antiguo de Zermatt"], dias: "3–5" },
  ["Dolomitas / Cortina d’Ampezzo"]: { lugares: ["Cortina d’Ampezzo", "Cinque Torri", "Lago di Braies", "Monte Faloria"], dias: "4–6" },
  ["Banff"]: { lugares: ["Lago Louise", "Banff Gondola", "Johnston Canyon", "Tunnel Mountain"], dias: "4–6" },
  ["Hokkaido / Sapporo"]: { lugares: ["Parque Ōdōri", "Barrio Susukino", "Canal de Otaru", "Niseko"], dias: "4–6" },
  ["Nueva York"]: { lugares: ["Rockefeller Center", "Central Park", "Bryant Park", "Quinta Avenida"], dias: "4–5" },
  ["Fuerteventura"]: { lugares: ["Dunas de Corralejo", "Playa de Cofete", "Betancuria", "Isla de Lobos"], dias: "4–6" },
  ["Madeira"]: { lugares: ["Funchal", "Cabo Girão", "Pico do Arieiro", "Bosque de Fanal"], dias: "4–6" },
  ["Maldivas"]: { lugares: ["Malé", "Atolón de Ari", "Isla de Maafushi", "Atolón Baa"], dias: "5–7" },
  ["Phuket y Krabi"]: { lugares: ["Playa Railay", "Islas Phi Phi", "Bahía de Phang Nga", "Casco antiguo de Phuket"], dias: "5–7" },
  ["Ciudad del Cabo"]: { lugares: ["Montaña de la Mesa", "Cabo de Buena Esperanza", "Jardín Kirstenbosch", "Playa Boulders"], dias: "4–6" },
  ["Patagonia"]: { lugares: ["Torres del Paine", "Glaciar Perito Moreno", "El Chaltén", "Parque Nacional Los Glaciares"], dias: "7–10" },
  ["Singapur"]: { lugares: ["Marina Bay Sands", "Gardens by the Bay", "Chinatown", "Isla Sentosa"], dias: "3–4" },
  ["Río de Janeiro"]: { lugares: ["Cristo Redentor", "Pan de Azúcar", "Playa de Copacabana", "Escalera Selarón"], dias: "4–6" },
};

export default function InviernoPage() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const activeCardRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<(typeof destinosInvierno)[number] | null>(null);
  const detalleSeleccionado = destinoSeleccionado ? detallesInvierno[destinoSeleccionado.nombre] : null;

  function cerrarDetalle() {
    setDestinoSeleccionado(null);
    requestAnimationFrame(() => activeCardRef.current?.focus());
  }

  useEffect(() => {
    if (!destinoSeleccionado) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDestinoSeleccionado(null);
        requestAnimationFrame(() => activeCardRef.current?.focus());
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [destinoSeleccionado]);

  return (
    <main className="min-h-screen bg-[#F7F2E8] text-stone-800">
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-12">
        <Link
          href="/"
          className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur-md"
        >
          ← Volver a Destinauta
        </Link>

        <div className="mt-10 sm:mt-12 lg:mt-7">
          <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
            ❄️ INVIERNO
          </p>
        </div>
        <div className="mt-4 sm:mt-5 lg:mt-4">
  <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
    DESTINOS RECOMENDADOS
  </p>

  <h1 className="mt-3 text-3xl font-black md:text-5xl lg:text-4xl">
    Lugares increíbles para visitar este invierno
  </h1>
  <div className="relative mt-5 sm:mt-8 lg:mt-5">
  <button
    type="button"
    aria-label="Ver más destinos de invierno"
    aria-controls="invierno-carousel"
    onClick={() => {
      const carousel = carouselRef.current;
      const card = carousel?.querySelector("article");
      if (!carousel || !card) return;
      carousel.scrollBy({
        left: card.getBoundingClientRect().width + 8,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }}
    className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-800/20 bg-white/70 text-xl text-cyan-800 shadow-sm transition hover:bg-white sm:hidden"
  >
    <span aria-hidden="true">→</span>
  </button>
  <div
    ref={carouselRef}
    id="invierno-carousel"
    role="region"
    aria-label="Destinos recomendados para invierno"
    tabIndex={0}
    className="grid max-w-full gap-3 max-sm:auto-cols-[44%] max-sm:grid-flow-col max-sm:gap-2 max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:pb-3 sm:grid-cols-2 lg:mx-auto lg:max-w-5xl lg:grid-cols-4"
  >
  {destinosInvierno
    .map((destino) => {
    return (
      <article
        key={`${destino.nombre}-${destino.pais}`}
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={`Ver detalles de ${destino.nombre}`}
        onClick={(event) => {
          activeCardRef.current = event.currentTarget;
          setDestinoSeleccionado(destino);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activeCardRef.current = event.currentTarget;
            setDestinoSeleccionado(destino);
          }
        }}
        className="group min-w-0 cursor-pointer overflow-hidden rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-md transition duration-300 hover:-translate-y-2 hover:border-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 max-sm:snap-start max-sm:hover:translate-y-0"
      >
        <div className="relative h-72 overflow-hidden max-sm:h-[104px] lg:h-56">
          <img
            src={destino.imagen}
            alt={`${destino.nombre}, ${destino.pais}`}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

          <div className="absolute bottom-0 left-0 p-5 max-sm:p-2 lg:p-4">
            <p className="text-sm font-semibold text-cyan-200 max-sm:text-xs max-sm:leading-4">
              {destino.pais}
            </p>

            <h3 className="mt-1 text-2xl font-black text-white max-sm:mt-0.5 max-sm:text-sm max-sm:leading-4 lg:text-xl">
              {destino.nombre}
            </h3>
          </div>
        </div>
        <div className="flex min-h-[50px] items-center px-2 py-2 sm:min-h-[52px] sm:px-4">
          <span className="inline-flex max-w-full rounded-full border border-cyan-800/20 bg-cyan-50 px-2 py-1 text-[11px] font-semibold leading-3.5 text-cyan-900 sm:px-2.5 sm:text-xs">
            {destino.categoria}
          </span>
        </div>
      </article>
    );
  })}
</div>
</div>
</div>
      </section>
      {destinoSeleccionado && detalleSeleccionado && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 p-3 backdrop-blur-md max-sm:flex max-sm:items-center max-sm:overflow-hidden max-sm:p-2 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarDetalle();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invierno-detalle-titulo"
            className="mx-auto my-3 max-w-3xl overflow-hidden rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-2xl max-sm:my-0 max-sm:max-h-[calc(100dvh-1rem)] max-sm:w-full max-sm:overflow-x-hidden max-sm:overflow-y-auto sm:my-6"
          >
            <div className="relative h-52 max-sm:h-[140px] sm:h-72">
              <img
                src={destinoSeleccionado.imagen}
                alt={`${destinoSeleccionado.nombre}, ${destinoSeleccionado.pais}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Cerrar detalle"
                onClick={cerrarDetalle}
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-xl font-bold text-white backdrop-blur transition hover:bg-black/80 sm:right-5 sm:top-5"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-5 text-white max-sm:bottom-3 max-sm:left-4 sm:bottom-6 sm:left-7">
                <p className="font-semibold text-cyan-200 max-sm:text-sm">{destinoSeleccionado.pais}</p>
                <h2 id="invierno-detalle-titulo" className="mt-1 text-3xl font-black max-sm:mt-0.5 max-sm:text-2xl max-sm:leading-7 sm:text-4xl">
                  {destinoSeleccionado.nombre}
                </h2>
              </div>
            </div>
            <div className="p-5 max-sm:p-4 sm:p-7">
              <span className="inline-flex rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-900 sm:text-sm">
                {destinoSeleccionado.categoria}
              </span>
              <p className="mt-3 text-base leading-6 text-slate-700 max-sm:text-sm max-sm:leading-5 sm:text-lg sm:leading-7">
                {destinoSeleccionado.descripcion}
              </p>
              <h3 className="mt-6 text-lg font-bold text-slate-900 max-sm:mt-4 max-sm:text-base max-sm:leading-5 sm:text-xl">✨ 4 lugares recomendados para visitar</h3>
              <div className="mt-3 grid gap-2 max-sm:mt-2 max-sm:grid-cols-2 max-sm:gap-1.5 sm:grid-cols-2">
                {detalleSeleccionado.lugares.map((lugar) => (
                  <div key={lugar} className="rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm text-slate-800 max-sm:px-2.5 max-sm:py-2 max-sm:text-[13px] max-sm:leading-4 sm:text-base">
                    📍 {lugar}
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 font-semibold text-slate-900 max-sm:mt-3 max-sm:px-3 max-sm:py-2 max-sm:text-sm max-sm:leading-5">
                🗓️ Estancia recomendada: {detalleSeleccionado.dias} días
              </p>
              <div className="mt-5 grid gap-2 max-sm:mt-3 max-sm:grid-cols-3 max-sm:gap-1.5 sm:grid-cols-3">
                <a href={`/?primaveraServicio=vuelo&destino=${encodeURIComponent(destinoSeleccionado.nombre)}#buscador`} className="flex min-h-11 items-center justify-center rounded-xl bg-cyan-300 px-3 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-200 max-sm:px-1 max-sm:py-2 max-sm:text-xs max-sm:leading-4">
                  <span className="sm:hidden">✈️ Vuelo</span><span className="max-sm:hidden">✈️ Buscar vuelos</span>
                </a>
                <a href={`/?primaveraServicio=hotel&destino=${encodeURIComponent(destinoSeleccionado.nombre)}#buscador`} className="flex min-h-11 items-center justify-center rounded-xl border border-sky-300 bg-sky-50 px-3 py-3 text-center text-sm font-bold text-sky-900 transition hover:bg-sky-100 max-sm:px-1 max-sm:py-2 max-sm:text-xs max-sm:leading-4">
                  <span className="sm:hidden">🏨 Hotel</span><span className="max-sm:hidden">🏨 Buscar hoteles</span>
                </a>
                <a href={`/?primaveraServicio=ambos&destino=${encodeURIComponent(destinoSeleccionado.nombre)}#buscador`} className="flex min-h-11 items-center justify-center rounded-xl border border-sky-300 bg-sky-50 px-3 py-3 text-center text-sm font-bold text-sky-900 transition hover:bg-sky-100 max-sm:px-1 max-sm:py-2 max-sm:text-xs max-sm:leading-4">
                  ✈️🏨 Vuelo + Hotel
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
