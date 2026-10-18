"use client";
import { useEffect, useRef, useState } from "react";

const destinosOtono = [
  {
    nombre: "Kioto",
    pais: "Japón",
    categoria: "🍁 Follaje otoñal",
    imagen: "https://images.unsplash.com/photo-1764604186461-07354b3b1c68?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Templos y jardines envueltos en los tonos rojos del otoño.",
  },
  {
    nombre: "Tōhoku",
    pais: "Japón",
    categoria: "🍁 Follaje otoñal",
    imagen: "https://images.unsplash.com/photo-1699356302651-c3354b04dd28?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Gargantas, lagos y bosques que brillan con el follaje otoñal.",
  },
  {
    nombre: "Seúl",
    pais: "Corea del Sur",
    categoria: "🍂 Otoño urbano",
    imagen: "https://images.unsplash.com/photo-1768006378015-2cb810dbeb90?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Palacios y parques urbanos entre colores dorados y rojos.",
  },
  {
    nombre: "Pokhara y Annapurna",
    pais: "Nepal",
    categoria: "🥾 Montaña y senderismo",
    imagen: "https://images.unsplash.com/photo-1604153352266-ac3a5fc876a5?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Lagos serenos y senderos del Himalaya bajo cielos despejados.",
  },
  {
    nombre: "Nueva Inglaterra",
    pais: "Estados Unidos",
    categoria: "🍁 Follaje otoñal",
    imagen: "https://images.unsplash.com/photo-1634175598198-fed5994f155f?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Rutas panorámicas, pueblos históricos y bosques de mil colores.",
  },
  {
    nombre: "Nueva York",
    pais: "Estados Unidos",
    categoria: "🍂 Otoño urbano",
    imagen: "https://images.unsplash.com/photo-1769517250320-d52d1b286379?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Central Park se tiñe de otoño entre barrios y rascacielos.",
  },
  {
    nombre: "Quebec",
    pais: "Canadá",
    categoria: "🍁 Follaje otoñal",
    imagen: "https://images.unsplash.com/photo-1761209355645-8d3457131cb5?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Calles empedradas y vistas al San Lorenzo entre hojas otoñales.",
  },
  {
    nombre: "Oaxaca",
    pais: "México",
    categoria: "🎭 Cultura y tradición",
    imagen: "https://images.unsplash.com/photo-1666749278240-85d122a30959?auto=format&fit=crop&w=1200&q=80",
    descripcion: "A finales de octubre y principios de noviembre, el Día de Muertos llena la ciudad de color y tradición.",
  },
  {
    nombre: "Highlands de Escocia",
    pais: "Escocia",
    categoria: "🍁 Follaje otoñal",
    imagen: "https://images.unsplash.com/photo-1472494060377-5e98f58af1c2?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Valles, lagos y castillos entre montañas de tonos cobrizos.",
  },
  {
    nombre: "Borgoña",
    pais: "Francia",
    categoria: "🍷 Gastronomía y vendimia",
    imagen: "https://images.unsplash.com/photo-1755497901305-6d60606671eb?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Viñedos, pueblos de piedra y gastronomía en tiempo de vendimia.",
  },
  {
    nombre: "Umbría",
    pais: "Italia",
    categoria: "🍷 Gastronomía y vendimia",
    imagen: "https://images.unsplash.com/photo-1607727562102-9319ef500e24?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Ciudades medievales y colinas tranquilas en el corazón de Italia.",
  },
  {
    nombre: "Lago Bohinj",
    pais: "Eslovenia",
    categoria: "🍁 Follaje otoñal",
    imagen: "https://images.unsplash.com/photo-1609751007951-151fdacfa96e?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Un lago alpino rodeado de montañas y senderos de otoño.",
  },
  {
    nombre: "Montenegro",
    pais: "Montenegro",
    categoria: "🥾 Montaña y senderismo",
    imagen: "https://images.unsplash.com/photo-1642356775128-fc3bd3a43459?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Bahías históricas y montañas espectaculares con clima suave.",
  },
  {
    nombre: "Fez",
    pais: "Marruecos",
    categoria: "🎭 Cultura y tradición",
    imagen: "https://images.unsplash.com/photo-1767936925033-9a5b59925613?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Medinas, artesanía y arquitectura para explorar con temperaturas agradables.",
  },
  {
    nombre: "Menorca",
    pais: "España",
    categoria: "🌊 Costa y mar",
    imagen: "https://images.unsplash.com/photo-1747752419759-8b96c167d6db?auto=format&fit=crop&w=1200&q=80",
    descripcion: "En septiembre y octubre, calas tranquilas y pueblos con menos visitantes.",
  },
  {
    nombre: "Luxor y el Nilo",
    pais: "Egipto",
    categoria: "🏛️ Historia y ciudad",
    imagen: "https://images.unsplash.com/photo-1678388103971-25c5d15c85eb?auto=format&fit=crop&w=1200&q=80",
    descripcion: "A finales de otoño, especialmente en noviembre, el Nilo y los templos se disfrutan con clima suave.",
  },
];

const detallesOtono: Record<string, { lugares: [string, string, string, string]; dias: string }> = {
  ["Kioto"]: { lugares: ["Fushimi Inari", "Kiyomizu-dera", "Bosque de Arashiyama", "Templo Tōfuku-ji"], dias: "3–4" },
  ["Tōhoku"]: { lugares: ["Garganta de Oirase", "Lago Towada", "Castillo de Hirosaki", "Templo Yamadera"], dias: "4–6" },
  ["Seúl"]: { lugares: ["Palacio Gyeongbokgung", "Bukchon Hanok Village", "Parque Namsan", "Arroyo Cheonggyecheon"], dias: "3–4" },
  ["Pokhara y Annapurna"]: { lugares: ["Lago Phewa", "Mirador de Sarangkot", "Pagoda de la Paz", "Mirador de Poon Hill"], dias: "5–7" },
  ["Nueva Inglaterra"]: { lugares: ["Montañas Blancas", "Stowe", "Parque Nacional Acadia", "Berkshires"], dias: "6–8" },
  ["Nueva York"]: { lugares: ["Central Park", "Puente de Brooklyn", "High Line", "Times Square"], dias: "4–5" },
  ["Quebec"]: { lugares: ["Viejo Quebec", "Château Frontenac", "Cascadas de Montmorency", "Isla de Orleans"], dias: "3–4" },
  ["Oaxaca"]: { lugares: ["Templo de Santo Domingo", "Monte Albán", "Zócalo de Oaxaca", "Mercado 20 de Noviembre"], dias: "3–4" },
  ["Highlands de Escocia"]: { lugares: ["Valle de Glencoe", "Lago Ness", "Isla de Skye", "Castillo de Eilean Donan"], dias: "5–7" },
  ["Borgoña"]: { lugares: ["Dijon", "Beaune", "Ruta de los Grandes Vinos", "Abadía de Fontenay"], dias: "3–4" },
  ["Umbría"]: { lugares: ["Asís", "Perugia", "Orvieto", "Spello"], dias: "3–4" },
  ["Lago Bohinj"]: { lugares: ["Lago Bohinj", "Cascada Savica", "Monte Vogel", "Garganta de Mostnica"], dias: "3–4" },
  ["Montenegro"]: { lugares: ["Bahía de Kotor", "Perast", "Parque Nacional Durmitor", "Sveti Stefan"], dias: "4–6" },
  ["Fez"]: { lugares: ["Medina de Fez el Bali", "Madrasa Bou Inania", "Curtiduría Chouara", "Bab Bou Jeloud"], dias: "2–3" },
  ["Menorca"]: { lugares: ["Cala Macarella", "Ciutadella", "Faro de Favàritx", "Camí de Cavalls"], dias: "4–5" },
  ["Luxor y el Nilo"]: { lugares: ["Valle de los Reyes", "Templo de Karnak", "Templo de Luxor", "Crucero por el Nilo"], dias: "4–6" },
};

export default function OtonoPage() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const activeCardRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<(typeof destinosOtono)[number] | null>(null);
  const detalleSeleccionado = destinoSeleccionado ? detallesOtono[destinoSeleccionado.nombre] : null;

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
        <a
          href="/"
          className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur-md"
        >
          ← Volver a Destinauta
        </a>

        <div className="mt-10 sm:mt-12 lg:mt-7">
          <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
            🍂 OTOÑO
          </p>
        </div>
        <div className="mt-4 sm:mt-5 lg:mt-4">
  <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
    DESTINOS RECOMENDADOS
  </p>

  <h1 className="mt-3 text-3xl font-black md:text-5xl lg:text-4xl">
    Lugares increíbles para visitar este otoño
  </h1>
  <div className="relative mt-5 sm:mt-8 lg:mt-5">
  <button
    type="button"
    aria-label="Ver más destinos de otoño"
    aria-controls="otono-carousel"
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
    id="otono-carousel"
    role="region"
    aria-label="Destinos recomendados para otoño"
    tabIndex={0}
    className="grid max-w-full gap-3 max-sm:auto-cols-[44%] max-sm:grid-flow-col max-sm:gap-2 max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:snap-x max-sm:snap-mandatory max-sm:pb-3 sm:grid-cols-2 lg:mx-auto lg:max-w-5xl lg:grid-cols-4"
  >
  {destinosOtono
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
            aria-labelledby="otono-detalle-titulo"
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
                <h2 id="otono-detalle-titulo" className="mt-1 text-3xl font-black max-sm:mt-0.5 max-sm:text-2xl max-sm:leading-7 sm:text-4xl">
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
