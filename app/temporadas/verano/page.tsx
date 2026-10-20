"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CountryDestinations from '@/app/components/CountryDestinations';

const destinosVerano = [
  {
    nombre: "Dubrovnik",
    pais: "Croacia",
    categoria: "🌊 Costa y mar",
    imagen: "https://images.unsplash.com/photo-1692502561614-71acca6650e3?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Murallas medievales y un Adriático de aguas cristalinas.",
  },
  {
    nombre: "Santorini",
    pais: "Grecia",
    categoria: "🌊 Costa y mar",
    imagen: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Pueblos blancos, cúpulas azules y atardeceres sobre la caldera.",
  },
  {
    nombre: "Mallorca",
    pais: "España",
    categoria: "🏖️ Playa",
    imagen: "https://images.unsplash.com/photo-1672264430465-781cd9154896?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Calas turquesas, pueblos mediterráneos y rutas junto al mar.",
  },
  {
    nombre: "Algarve",
    pais: "Portugal",
    categoria: "🏖️ Playa",
    imagen: "https://images.unsplash.com/photo-1621971913709-377f53807c6a?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Acantilados dorados, playas y pueblos marineros.",
  },
  {
    nombre: "Dolomitas",
    pais: "Italia",
    categoria: "🥾 Montaña y senderismo",
    imagen: "https://images.unsplash.com/photo-1724420965593-a8c905943269?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Cumbres imponentes, lagos alpinos y senderos de montaña.",
  },
  {
    nombre: "Islandia",
    pais: "Islandia",
    categoria: "🌋 Naturaleza",
    imagen: "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Cascadas, glaciares y paisajes volcánicos bajo largos días de luz.",
  },
  {
    nombre: "Islas Lofoten",
    pais: "Noruega",
    categoria: "🥾 Montaña y senderismo",
    imagen: "https://images.unsplash.com/photo-1767381522355-b1a129a2c30c?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Pueblos pesqueros y montañas que emergen del mar.",
  },
  {
    nombre: "Edimburgo",
    pais: "Escocia",
    categoria: "🏛️ Historia y ciudad",
    imagen: "https://images.unsplash.com/photo-1563273026-9c3919cc9fa7?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Castillo, calles históricas y colinas para explorar en verano.",
  },
  {
    nombre: "Banff",
    pais: "Canadá",
    categoria: "🥾 Montaña y senderismo",
    imagen: "https://images.unsplash.com/photo-1632764727060-af92af33b59e?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Lagos turquesas y senderos entre las Montañas Rocosas.",
  },
  {
    nombre: "Vancouver",
    pais: "Canadá",
    categoria: "🌋 Naturaleza",
    imagen: "https://images.unsplash.com/photo-1730661906876-18bfc6e95f2f?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Una ciudad entre el Pacífico y las montañas, llena de naturaleza.",
  },
  {
    nombre: "Cusco y Machu Picchu",
    pais: "Perú",
    categoria: "🏛️ Historia y ciudad",
    imagen: "https://images.unsplash.com/photo-1586876387176-b7fd0d320d14?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Herencia inca y paisajes andinos en un viaje inolvidable.",
  },
  {
    nombre: "Bali",
    pais: "Indonesia",
    categoria: "🏖️ Playa",
    imagen: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Templos, arrozales y playas tropicales para desconectar.",
  },
  {
    nombre: "Zanzíbar",
    pais: "Tanzania",
    categoria: "🏖️ Playa",
    imagen: "https://images.unsplash.com/photo-1575999502951-4ab25b5ca889?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Playas de arena blanca y cultura suajili junto al Índico.",
  },
  {
    nombre: "Curaçao",
    pais: "Caribe neerlandés",
    categoria: "🏖️ Playa",
    imagen: "https://images.unsplash.com/photo-1636517031771-46f4032c895f?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Casas de colores, calas caribeñas y arrecifes de coral.",
  },
  {
    nombre: "Riviera Albanesa / Ksamil",
    pais: "Albania",
    categoria: "🏖️ Playa",
    imagen: "https://images.unsplash.com/photo-1653982969536-0909d14df1ec?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Aguas transparentes y pueblos costeros del sur de Albania.",
  },
  {
    nombre: "Split",
    pais: "Croacia",
    categoria: "🌊 Costa y mar",
    imagen: "https://images.unsplash.com/photo-1660496852715-8d92403ca83f?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Historia romana, paseo marítimo y acceso a las islas dálmatas.",
  },
];

const detallesVerano: Record<string, { lugares: [string, string, string, string]; dias: string }> = {
  ["Dubrovnik"]: { lugares: ["Murallas de Dubrovnik", "Stradun", "Fuerte Lovrijenac", "Isla de Lokrum"], dias: "3–4" },
  ["Santorini"]: { lugares: ["Oia", "Fira", "Playa Roja", "Yacimiento de Akrotiri"], dias: "3–4" },
  ["Mallorca"]: { lugares: ["Palma de Mallorca", "Cala Mondragó", "Valldemossa", "Cabo de Formentor"], dias: "4–6" },
  ["Algarve"]: { lugares: ["Praia da Marinha", "Cueva de Benagil", "Lagos", "Cabo de São Vicente"], dias: "4–5" },
  ["Dolomitas"]: { lugares: ["Tre Cime di Lavaredo", "Lago di Braies", "Alpe di Siusi", "Val di Funes"], dias: "4–6" },
  ["Islandia"]: { lugares: ["Círculo Dorado", "Cascada Skógafoss", "Laguna glaciar Jökulsárlón", "Playa de Reynisfjara"], dias: "7–10" },
  ["Islas Lofoten"]: { lugares: ["Reine", "Henningsvær", "Playa de Haukland", "Å i Lofoten"], dias: "4–6" },
  ["Edimburgo"]: { lugares: ["Castillo de Edimburgo", "Royal Mile", "Arthur’s Seat", "Calton Hill"], dias: "2–3" },
  ["Banff"]: { lugares: ["Lago Louise", "Lago Moraine", "Banff Gondola", "Johnston Canyon"], dias: "4–5" },
  ["Vancouver"]: { lugares: ["Stanley Park", "Granville Island", "Capilano Suspension Bridge", "Canada Place"], dias: "3–4" },
  ["Cusco y Machu Picchu"]: { lugares: ["Machu Picchu", "Plaza de Armas de Cusco", "Valle Sagrado", "Sacsayhuamán"], dias: "5–7" },
  ["Bali"]: { lugares: ["Ubud", "Terrazas de Tegallalang", "Templo de Uluwatu", "Playa de Seminyak"], dias: "5–7" },
  ["Zanzíbar"]: { lugares: ["Stone Town", "Playa de Nungwi", "Bosque de Jozani", "Isla Mnemba"], dias: "5–7" },
  ["Curaçao"]: { lugares: ["Willemstad", "Playa Kenepa Grandi", "Parque Christoffel", "Playa Cas Abao"], dias: "4–6" },
  ["Riviera Albanesa / Ksamil"]: { lugares: ["Playas de Ksamil", "Parque Nacional de Butrinto", "Sarandë", "Playa de Gjipe"], dias: "4–6" },
  ["Split"]: { lugares: ["Palacio de Diocleciano", "Paseo de la Riva", "Parque Marjan", "Catedral de San Duje"], dias: "3–4" },
};

export default function VeranoPage() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const activeCardRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<(typeof destinosVerano)[number] | null>(null);
  const detalleSeleccionado = destinoSeleccionado ? detallesVerano[destinoSeleccionado.nombre] : null;

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
            ☀️ VERANO
          </p>
        </div>
        <div className="mt-4 sm:mt-5 lg:mt-4">
  <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
    DESTINOS RECOMENDADOS
  </p>

  <h1 className="mt-3 text-3xl font-black md:text-5xl lg:text-4xl">
    Lugares increíbles para visitar este verano
  </h1>
  <div className="relative mt-5 sm:mt-8 lg:mt-5">
  <button
    type="button"
    aria-label="Ver más destinos de verano"
    aria-controls="verano-carousel"
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
    id="verano-carousel"
    role="region"
    aria-label="Destinos recomendados para verano"
    tabIndex={0}
    className="grid max-w-full gap-3 max-sm:auto-cols-[44%] max-sm:grid-flow-col max-sm:gap-2 max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:pb-3 sm:grid-cols-2 lg:mx-auto lg:max-w-5xl lg:grid-cols-4"
  >
  {destinosVerano
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
        className="group min-w-0 cursor-pointer overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] shadow-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-300/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 max-sm:snap-start max-sm:hover:translate-y-0"
      >
        <div className="relative h-72 overflow-hidden max-sm:h-[104px] lg:h-56">
          <img
            src={destino.imagen}
            alt={`${destino.nombre}, ${destino.pais}`}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />

          <div className="absolute bottom-0 left-0 p-5 max-sm:p-2 lg:p-4">
            <p className="text-sm font-semibold text-cyan-300 max-sm:text-xs max-sm:leading-4">
              {destino.pais}
            </p>

            <h3 className="mt-1 text-2xl font-black text-white max-sm:mt-0.5 max-sm:text-sm max-sm:leading-4 lg:text-xl">
              {destino.nombre}
            </h3>
          </div>
        </div>
        <div className="flex h-[60px] items-center px-2 py-2 sm:h-[52px] sm:px-4">
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
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-3 text-white backdrop-blur-sm max-sm:flex max-sm:items-center max-sm:overflow-hidden max-sm:p-2 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) cerrarDetalle();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verano-detalle-titulo"
            className="mx-auto my-3 max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-2xl max-sm:my-0 max-sm:max-h-[calc(100dvh-1rem)] max-sm:w-full max-sm:overflow-x-hidden max-sm:overflow-y-auto sm:my-6"
          >
            <div className="relative h-52 max-sm:h-[140px] sm:h-72">
              <img
                src={destinoSeleccionado.imagen}
                alt={`${destinoSeleccionado.nombre}, ${destinoSeleccionado.pais}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Cerrar detalle"
                onClick={cerrarDetalle}
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-xl font-bold backdrop-blur transition hover:bg-black/80 sm:right-5 sm:top-5"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-5 max-sm:bottom-3 max-sm:left-4 sm:bottom-6 sm:left-7">
                <p className="font-semibold text-cyan-200 max-sm:text-sm">{destinoSeleccionado.pais}</p>
                <h2 id="verano-detalle-titulo" className="mt-1 text-3xl font-black max-sm:mt-0.5 max-sm:text-2xl max-sm:leading-7 sm:text-4xl">
                  {destinoSeleccionado.nombre}
                </h2>
              </div>
            </div>
            <div className="p-5 max-sm:p-4 sm:p-7">
              <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100 sm:text-sm">
                {destinoSeleccionado.categoria}
              </span>
              <p className="mt-3 text-base leading-6 text-slate-300 max-sm:text-sm max-sm:leading-5 sm:text-lg sm:leading-7">
                {destinoSeleccionado.descripcion}
              </p>
              <h3 className="mt-6 text-lg font-bold max-sm:mt-4 max-sm:text-base max-sm:leading-5 sm:text-xl">✨ 4 lugares recomendados para visitar</h3>
              <div className="mt-3 grid gap-2 max-sm:mt-2 max-sm:grid-cols-2 max-sm:gap-1.5 sm:grid-cols-2">
                {detalleSeleccionado.lugares.map((lugar) => (
                  <div key={lugar} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 max-sm:px-2.5 max-sm:py-2 max-sm:text-[13px] max-sm:leading-4 sm:text-base">
                    📍 {lugar}
                  </div>
                ))}
              </div>
              <p className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 font-semibold text-cyan-100 max-sm:mt-3 max-sm:px-3 max-sm:py-2 max-sm:text-sm max-sm:leading-5">
                🗓️ Estancia recomendada: {detalleSeleccionado.dias} días
              </p>
              <div className="mt-5 grid gap-2 max-sm:mt-3 max-sm:grid-cols-3 max-sm:gap-1.5 sm:grid-cols-3">
                <a href={`/?primaveraServicio=vuelo&destino=${encodeURIComponent(destinoSeleccionado.nombre)}#buscador`} className="flex min-h-11 items-center justify-center rounded-xl bg-cyan-300 px-3 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-200 max-sm:px-1 max-sm:py-2 max-sm:text-xs max-sm:leading-4">
                  <span className="sm:hidden">✈️ Vuelo</span><span className="max-sm:hidden">✈️ Buscar vuelos</span>
                </a>
                <a href={`/?primaveraServicio=hotel&destino=${encodeURIComponent(destinoSeleccionado.nombre)}#buscador`} className="flex min-h-11 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-3 py-3 text-center text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/20 max-sm:px-1 max-sm:py-2 max-sm:text-xs max-sm:leading-4">
                  <span className="sm:hidden">🏨 Hotel</span><span className="max-sm:hidden">🏨 Buscar hoteles</span>
                </a>
                <a href={`/?primaveraServicio=ambos&destino=${encodeURIComponent(destinoSeleccionado.nombre)}#buscador`} className="flex min-h-11 items-center justify-center rounded-xl border border-cyan-300/40 bg-cyan-300/10 px-3 py-3 text-center text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/20 max-sm:px-1 max-sm:py-2 max-sm:text-xs max-sm:leading-4">
                  ✈️🏨 Vuelo + Hotel
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      <CountryDestinations countryCode="FR" season="summer" />
    </main>
  );
}
