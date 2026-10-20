"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { canShowDestinationAutomatically } from '@/lib/destinations/presentation';

import { franceDestinations } from '@/lib/destinations/france';
const paris = franceDestinations.find(destination => destination.id === 'fr-paris')!;

const destinosPrimavera = [
  {
    nombre: "Tokio",
    pais: "Japón",
    categoria: "🌸 Cerezos en flor",
    imagen:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Cerezos en flor, templos y barrios llenos de vida.",
  },
  {
    nombre: "Kioto",
    pais: "Japón",
    categoria: "🌸 Cerezos en flor",
    imagen:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    descripcion:
      "Templos históricos, jardines y espectaculares cerezos en flor.",
  },
  {
    nombre: "Ámsterdam",
    pais: "Países Bajos",
    categoria: "🌷 Flores y jardines",
    imagen:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Canales, tulipanes y parques llenos de color.",
  },
  {
    nombre: paris.name,
    pais: paris.country,
    categoria: "🌷 Flores y jardines",
    imagen: paris.image,
    descripcion: "Jardines florecidos, terrazas y paseos junto al Sena.", // Seasonal editorial context, not another tourist profile.
    destinationId: paris.id,
  },
  {
    nombre: "Sevilla",
    pais: "España",
    categoria: "🌼 Primavera y cultura",
    imagen:
      "https://images.unsplash.com/photo-1654122675648-51310a647f2d?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Azahar, buen clima y una primavera llena de ambiente.",
  },
  {
    nombre: "Córdoba",
    pais: "España",
    categoria: "🌼 Primavera y cultura",
    imagen:
      "https://images.pexels.com/photos/7861201/pexels-photo-7861201.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Patios floridos, calles históricas y temperaturas agradables.",
  },
  {
    nombre: "Granada",
    pais: "España",
    categoria: "🌼 Primavera y cultura",
    imagen: "https://images.pexels.com/photos/34135490/pexels-photo-34135490.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion: "La Alhambra, jardines y paisajes espectaculares.",
  },
  {
    nombre: "Lisboa",
    pais: "Portugal",
    categoria: "🌼 Primavera y cultura",
    imagen: "https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Miradores, barrios con encanto y agradables días de sol.",
  },
  {
    nombre: "Madeira",
    pais: "Portugal",
    categoria: "🌋 Naturaleza",
    imagen: "https://images.pexels.com/photos/35062415/pexels-photo-35062415.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion: "Flores, montañas, senderos y naturaleza exuberante.",
  },
  {
    nombre: "Roma",
    pais: "Italia",
    categoria: "🏛️ Historia y ciudad",
    imagen: "https://images.pexels.com/photos/36845881/pexels-photo-36845881.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Historia, plazas y terrazas antes de la llegada del calor.",
  },
  {
    nombre: "Florencia",
    pais: "Italia",
    categoria: "🏛️ Historia y ciudad",
    imagen: "https://images.pexels.com/photos/36860750/pexels-photo-36860750.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion: "Arte renacentista, jardines y paisajes de la Toscana.",
  },
  {
    nombre: "Venecia",
    pais: "Italia",
    categoria: "🏛️ Historia y ciudad",
    imagen: "https://images.pexels.com/photos/39573144/pexels-photo-39573144.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Canales y calles históricas con temperaturas más suaves.",
  },
  {
    nombre: "Santorini",
    pais: "Grecia",
    categoria: "🌊 Costa y mar",
    imagen: "https://images.pexels.com/photos/31462811/pexels-photo-31462811.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Pueblos blancos, vistas al mar y menos aglomeraciones.",
  },
  {
    nombre: "Atenas",
    pais: "Grecia",
    categoria: "🏛️ Historia y ciudad",
    imagen: "https://images.pexels.com/photos/38752583/pexels-photo-38752583.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Ruinas antiguas y clima ideal para recorrer la ciudad.",
  },
  {
    nombre: "Dubrovnik",
    pais: "Croacia",
    categoria: "🌊 Costa y mar",
    imagen: "https://images.pexels.com/photos/15553023/pexels-photo-15553023.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Murallas históricas y espectaculares vistas al Adriático.",
  },
  {
    nombre: "Praga",
    pais: "República Checa",
    categoria: "🌼 Primavera y cultura",
    imagen:
      "https://source.unsplash.com/1200x800/?prague,czech",
    descripcion:
      "Arquitectura histórica, parques y calles llenas de encanto.",
  },
  {
    nombre: "Viena",
    pais: "Austria",
    categoria: "🌷 Flores y jardines",
    imagen:
      "https://source.unsplash.com/1200x800/?vienna,austria",
    descripcion:
      "Palacios, jardines y elegantes cafés en plena primavera.",
  },
  {
    nombre: "Budapest",
    pais: "Hungría",
    categoria: "🌼 Primavera y cultura",
    imagen:
      "https://source.unsplash.com/1200x800/?budapest,hungary",
    descripcion:
      "El Danubio, arquitectura monumental y agradables paseos.",
  },
  {
    nombre: "Estambul",
    pais: "Turquía",
    categoria: "🎭 Cultura y tradición",
    imagen:
      "https://images.unsplash.com/photo-1756760910079-3952b792b0ef?auto=format&fit=crop&w=1200&q=80",
    descripcion:
      "Tulipanes, mezquitas, mercados y el fascinante Bósforo.",
  },
  {
    nombre: "Londres",
    pais: "Reino Unido",
    categoria: "🌷 Flores y jardines",
    imagen:
      "https://source.unsplash.com/1200x800/?london,england",
    descripcion:
      "Parques florecidos, mercados y barrios llenos de vida.",
  },
  {
    nombre: "Edimburgo",
    pais: "Escocia",
    categoria: "🌼 Primavera y cultura",
    imagen:
      "https://source.unsplash.com/1200x800/?edinburgh,scotland",
    descripcion:
      "Castillos, naturaleza y largos días para explorar la ciudad.",
  },
  {
    nombre: "Dublín",
    pais: "Irlanda",
    categoria: "🌼 Primavera y cultura",
    imagen:
      "https://source.unsplash.com/1200x800/?dublin,ireland",
    descripcion:
      "Parques verdes, ambiente acogedor y paisajes cercanos.",
  },
  {
    nombre: "Copenhague",
    pais: "Dinamarca",
    categoria: "🌷 Flores y jardines",
    imagen:
      "https://source.unsplash.com/1200x800/?copenhagen,denmark",
    descripcion:
      "Canales, diseño, jardines y días cada vez más luminosos.",
  },
  {
    nombre: "Marrakech",
    pais: "Marruecos",
    categoria: "🌼 Primavera y cultura",
    imagen:
      "https://source.unsplash.com/1200x800/?marrakech,morocco",
    descripcion:
      "Zocos, jardines y temperaturas ideales antes del verano.",
  },
  {
    nombre: "Chefchaouen",
    pais: "Marruecos",
    categoria: "🎭 Cultura y tradición",
    imagen:
      "https://source.unsplash.com/1200x800/?chefchaouen,morocco",
    descripcion:
      "Calles azules, montañas y una primavera de clima agradable.",
  },
  {
    nombre: "Capadocia",
    pais: "Turquía",
    categoria: "🌋 Naturaleza",
    imagen:
      "https://images.unsplash.com/photo-1664875965544-9df4ee71e73a?auto=format&fit=crop&w=1200&q=80",
    descripcion:
      "Paisajes únicos y vuelos en globo sobre sus famosos valles.",
  },
  {
    nombre: "Nueva York",
    pais: "Estados Unidos",
    categoria: "🌼 Primavera y cultura",
    imagen:
      "https://source.unsplash.com/1200x800/?new-york,central-park",
    descripcion:
      "Central Park florecido y una ciudad llena de actividades.",
  },
  {
    nombre: "Washington D. C.",
    pais: "Estados Unidos",
    categoria: "🌸 Cerezos en flor",
    imagen:
      "https://images.unsplash.com/photo-1742393993572-54d8fb7ac667?auto=format&fit=crop&w=1200&q=80",
    descripcion:
      "Famosa por sus espectaculares cerezos en flor.",
  },
  {
    nombre: "Vancouver",
    pais: "Canadá",
    categoria: "🌷 Flores y jardines",
    imagen:
      "https://source.unsplash.com/1200x800/?vancouver,canada",
    descripcion:
      "Montañas, costa, parques y miles de árboles en flor.",
  },
  {
    nombre: "Seúl",
    pais: "Corea del Sur",
    categoria: "🌸 Cerezos en flor",
    imagen:
      "https://images.unsplash.com/photo-1745687237545-c9975e7035f4?auto=format&fit=crop&w=1200&q=80",
    descripcion:
      "Cerezos en flor, palacios y modernos barrios urbanos.",
  },
  {
    nombre: "Jeju",
    pais: "Corea del Sur",
    categoria: "🌷 Flores y jardines",
    imagen:
      "https://images.unsplash.com/photo-1785686856914-828bceeb9e64?auto=format&fit=crop&w=1200&q=80",
    descripcion:
      "Campos de flores, volcanes y espectaculares paisajes costeros.",
  },
  {
    nombre: "Taipéi",
    pais: "Taiwán",
    categoria: "🌼 Primavera y cultura",
    imagen:
      "https://source.unsplash.com/1200x800/?taipei,taiwan",
    descripcion:
      "Templos, mercados nocturnos y naturaleza cerca de la ciudad.",
  },
  {
    nombre: "Bali",
    pais: "Indonesia",
    categoria: "🌋 Naturaleza",
    imagen:
      "https://source.unsplash.com/1200x800/?bali,indonesia",
    descripcion:
      "Arrozales, templos y naturaleza tropical al terminar las lluvias.",
  },
  {
    nombre: "Petra",
    pais: "Jordania",
    categoria: "🏛️ Historia y ciudad",
    imagen:
      "https://source.unsplash.com/1200x800/?petra,jordan",
    descripcion:
      "Una ciudad histórica extraordinaria con temperaturas agradables.",
  },
  {
    nombre: "Valle del Loira",
    pais: "Francia",
    categoria: "🌷 Flores y jardines",
    imagen:
      "https://images.unsplash.com/photo-1526816229784-65d5d54ac8bc?auto=format&fit=crop&w=1200&q=80",
    descripcion:
      "Castillos, jardines y paisajes verdes en plena primavera.",
  },
];

const destinosPrimaveraSeleccionados = new Set([
  "Tokio",
  "Kioto",
  "Ámsterdam",
  "París",
  "Sevilla",
  "Córdoba",
  "Lisboa",
  "Madeira",
  "Roma",
  "Florencia",
  "Estambul",
  "Capadocia",
  "Washington D. C.",
  "Seúl",
  "Jeju",
  "Valle del Loira",
]);

const detallesPrimavera: Record<string, { lugares: [string, string, string, string]; dias: string }> = {
  Tokio: { lugares: ["Templo Sensō-ji", "Cruce de Shibuya", "Santuario Meiji", "Parque de Ueno"], dias: "4–5" },
  Kioto: { lugares: ["Fushimi Inari", "Kinkaku-ji", "Kiyomizu-dera", "Bosque de bambú de Arashiyama"], dias: "3–4" },
  Ámsterdam: { lugares: ["Rijksmuseum", "Museo Van Gogh", "Barrio Jordaan", "Canales de Ámsterdam"], dias: "2–3" },
  París: { lugares: paris.recommendations, dias: paris.recommendedStay.replace(' días', '') },
  Sevilla: { lugares: ["Real Alcázar", "Catedral y Giralda", "Plaza de España", "Barrio de Santa Cruz"], dias: "2–3" },
  Córdoba: { lugares: ["Mezquita-Catedral", "Alcázar de los Reyes Cristianos", "Judería", "Puente Romano"], dias: "1–2" },
  Lisboa: { lugares: ["Torre de Belém", "Monasterio de los Jerónimos", "Alfama", "Castillo de San Jorge"], dias: "2–3" },
  Madeira: { lugares: ["Funchal", "Pico do Areeiro", "Cabo Girão", "Piscinas naturales de Porto Moniz"], dias: "4–5" },
  Roma: { lugares: ["Coliseo", "Foro Romano", "Museos Vaticanos", "Fontana di Trevi"], dias: "3–4" },
  Florencia: { lugares: ["Catedral de Santa María del Fiore", "Galería Uffizi", "Ponte Vecchio", "Piazzale Michelangelo"], dias: "2–3" },
  Estambul: { lugares: ["Santa Sofía", "Mezquita Azul", "Palacio de Topkapi", "Gran Bazar"], dias: "3–4" },
  Capadocia: { lugares: ["Museo al aire libre de Göreme", "Castillo de Uçhisar", "Ciudad subterránea de Derinkuyu", "Valles de Göreme"], dias: "2–3" },
  "Washington D. C.": { lugares: ["National Mall", "Museos Smithsonian", "Monumento a Lincoln", "Capitolio de Estados Unidos"], dias: "2–3" },
  Seúl: { lugares: ["Palacio Gyeongbokgung", "Bukchon Hanok Village", "Torre N de Seúl", "Myeongdong"], dias: "3–4" },
  Jeju: { lugares: ["Seongsan Ilchulbong", "Monte Hallasan", "Cascada Jeongbang", "Cabo Seopjikoji"], dias: "3–4" },
  "Valle del Loira": { lugares: ["Castillo de Chambord", "Castillo de Chenonceau", "Castillo de Amboise", "Jardines de Villandry"], dias: "3–4" },
};

export default function PrimaveraPage() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const activeCardRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<(typeof destinosPrimavera)[number] | null>(null);
  const detalleSeleccionado = destinoSeleccionado ? detallesPrimavera[destinoSeleccionado.nombre] : null;

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
            🌸 PRIMAVERA
          </p>
        </div>
        <div className="mt-4 sm:mt-5 lg:mt-4">
  <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
    DESTINOS RECOMENDADOS
  </p>

  <h1 className="mt-3 text-3xl font-black md:text-5xl lg:text-4xl">
    Lugares increíbles para visitar esta primavera
  </h1>
  <div className="relative mt-5 sm:mt-8 lg:mt-5">
  <button
    type="button"
    aria-label="Ver más destinos de primavera"
    aria-controls="primavera-carousel"
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
    id="primavera-carousel"
    role="region"
    aria-label="Destinos recomendados para primavera"
    tabIndex={0}
    className="grid max-w-full gap-3 max-sm:auto-cols-[44%] max-sm:grid-flow-col max-sm:gap-2 max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:pb-3 sm:grid-cols-2 lg:mx-auto lg:max-w-5xl lg:grid-cols-4"
  >
  {destinosPrimavera
    .filter(destino => canShowDestinationAutomatically({ country: destino.pais }))
    .filter((destino) => destinosPrimaveraSeleccionados.has(destino.nombre))
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
            aria-labelledby="primavera-detalle-titulo"
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
                <h2 id="primavera-detalle-titulo" className="mt-1 text-3xl font-black max-sm:mt-0.5 max-sm:text-2xl max-sm:leading-7 sm:text-4xl">
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
    </main>
  );
}
