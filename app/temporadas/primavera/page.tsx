"use client";
import { useRef } from "react";

const destinosPrimavera = [
  {
    nombre: "Tokio",
    pais: "Japón",
    imagen:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Cerezos en flor, templos y barrios llenos de vida.",
  },
  {
    nombre: "Kioto",
    pais: "Japón",
    imagen:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
    descripcion:
      "Templos históricos, jardines y espectaculares cerezos en flor.",
  },
  {
    nombre: "Ámsterdam",
    pais: "Países Bajos",
    imagen:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Canales, tulipanes y parques llenos de color.",
  },
  {
    nombre: "París",
    pais: "Francia",
    imagen:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Jardines florecidos, terrazas y paseos junto al Sena.",
  },
  {
    nombre: "Sevilla",
    pais: "España",
    imagen:
      "https://images.unsplash.com/photo-1654122675648-51310a647f2d?auto=format&fit=crop&w=1200&q=80",
    descripcion: "Azahar, buen clima y una primavera llena de ambiente.",
  },
  {
    nombre: "Córdoba",
    pais: "España",
    imagen:
      "https://images.pexels.com/photos/7861201/pexels-photo-7861201.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Patios floridos, calles históricas y temperaturas agradables.",
  },
  {
    nombre: "Granada",
    pais: "España",
    imagen: "https://images.pexels.com/photos/34135490/pexels-photo-34135490.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion: "La Alhambra, jardines y paisajes espectaculares.",
  },
  {
    nombre: "Lisboa",
    pais: "Portugal",
    imagen: "https://images.pexels.com/photos/1534560/pexels-photo-1534560.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Miradores, barrios con encanto y agradables días de sol.",
  },
  {
    nombre: "Madeira",
    pais: "Portugal",
    imagen: "https://images.pexels.com/photos/35062415/pexels-photo-35062415.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion: "Flores, montañas, senderos y naturaleza exuberante.",
  },
  {
    nombre: "Roma",
    pais: "Italia",
    imagen: "https://images.pexels.com/photos/36845881/pexels-photo-36845881.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Historia, plazas y terrazas antes de la llegada del calor.",
  },
  {
    nombre: "Florencia",
    pais: "Italia",
    imagen: "https://images.pexels.com/photos/36860750/pexels-photo-36860750.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion: "Arte renacentista, jardines y paisajes de la Toscana.",
  },
  {
    nombre: "Venecia",
    pais: "Italia",
    imagen: "https://images.pexels.com/photos/39573144/pexels-photo-39573144.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Canales y calles históricas con temperaturas más suaves.",
  },
  {
    nombre: "Santorini",
    pais: "Grecia",
    imagen: "https://images.pexels.com/photos/31462811/pexels-photo-31462811.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Pueblos blancos, vistas al mar y menos aglomeraciones.",
  },
  {
    nombre: "Atenas",
    pais: "Grecia",
    imagen: "https://images.pexels.com/photos/38752583/pexels-photo-38752583.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Ruinas antiguas y clima ideal para recorrer la ciudad.",
  },
  {
    nombre: "Dubrovnik",
    pais: "Croacia",
    imagen: "https://images.pexels.com/photos/15553023/pexels-photo-15553023.jpeg?auto=compress&cs=tinysrgb&w=1200",
    descripcion:
      "Murallas históricas y espectaculares vistas al Adriático.",
  },
  {
    nombre: "Praga",
    pais: "República Checa",
    imagen:
      "https://source.unsplash.com/1200x800/?prague,czech",
    descripcion:
      "Arquitectura histórica, parques y calles llenas de encanto.",
  },
  {
    nombre: "Viena",
    pais: "Austria",
    imagen:
      "https://source.unsplash.com/1200x800/?vienna,austria",
    descripcion:
      "Palacios, jardines y elegantes cafés en plena primavera.",
  },
  {
    nombre: "Budapest",
    pais: "Hungría",
    imagen:
      "https://source.unsplash.com/1200x800/?budapest,hungary",
    descripcion:
      "El Danubio, arquitectura monumental y agradables paseos.",
  },
  {
    nombre: "Estambul",
    pais: "Turquía",
    imagen:
      "https://source.unsplash.com/1200x800/?istanbul,turkey",
    descripcion:
      "Tulipanes, mezquitas, mercados y el fascinante Bósforo.",
  },
  {
    nombre: "Londres",
    pais: "Reino Unido",
    imagen:
      "https://source.unsplash.com/1200x800/?london,england",
    descripcion:
      "Parques florecidos, mercados y barrios llenos de vida.",
  },
  {
    nombre: "Edimburgo",
    pais: "Escocia",
    imagen:
      "https://source.unsplash.com/1200x800/?edinburgh,scotland",
    descripcion:
      "Castillos, naturaleza y largos días para explorar la ciudad.",
  },
  {
    nombre: "Dublín",
    pais: "Irlanda",
    imagen:
      "https://source.unsplash.com/1200x800/?dublin,ireland",
    descripcion:
      "Parques verdes, ambiente acogedor y paisajes cercanos.",
  },
  {
    nombre: "Copenhague",
    pais: "Dinamarca",
    imagen:
      "https://source.unsplash.com/1200x800/?copenhagen,denmark",
    descripcion:
      "Canales, diseño, jardines y días cada vez más luminosos.",
  },
  {
    nombre: "Marrakech",
    pais: "Marruecos",
    imagen:
      "https://source.unsplash.com/1200x800/?marrakech,morocco",
    descripcion:
      "Zocos, jardines y temperaturas ideales antes del verano.",
  },
  {
    nombre: "Chefchaouen",
    pais: "Marruecos",
    imagen:
      "https://source.unsplash.com/1200x800/?chefchaouen,morocco",
    descripcion:
      "Calles azules, montañas y una primavera de clima agradable.",
  },
  {
    nombre: "Capadocia",
    pais: "Turquía",
    imagen:
      "https://source.unsplash.com/1200x800/?cappadocia,turkey,balloons",
    descripcion:
      "Paisajes únicos y vuelos en globo sobre sus famosos valles.",
  },
  {
    nombre: "Nueva York",
    pais: "Estados Unidos",
    imagen:
      "https://source.unsplash.com/1200x800/?new-york,central-park",
    descripcion:
      "Central Park florecido y una ciudad llena de actividades.",
  },
  {
    nombre: "Washington D. C.",
    pais: "Estados Unidos",
    imagen:
      "https://source.unsplash.com/1200x800/?washington-dc,cherry-blossom",
    descripcion:
      "Famosa por sus espectaculares cerezos en flor.",
  },
  {
    nombre: "Vancouver",
    pais: "Canadá",
    imagen:
      "https://source.unsplash.com/1200x800/?vancouver,canada",
    descripcion:
      "Montañas, costa, parques y miles de árboles en flor.",
  },
  {
    nombre: "Seúl",
    pais: "Corea del Sur",
    imagen:
      "https://source.unsplash.com/1200x800/?seoul,korea,spring",
    descripcion:
      "Cerezos en flor, palacios y modernos barrios urbanos.",
  },
  {
    nombre: "Jeju",
    pais: "Corea del Sur",
    imagen:
      "https://source.unsplash.com/1200x800/?jeju,korea",
    descripcion:
      "Campos de flores, volcanes y espectaculares paisajes costeros.",
  },
  {
    nombre: "Taipéi",
    pais: "Taiwán",
    imagen:
      "https://source.unsplash.com/1200x800/?taipei,taiwan",
    descripcion:
      "Templos, mercados nocturnos y naturaleza cerca de la ciudad.",
  },
  {
    nombre: "Bali",
    pais: "Indonesia",
    imagen:
      "https://source.unsplash.com/1200x800/?bali,indonesia",
    descripcion:
      "Arrozales, templos y naturaleza tropical al terminar las lluvias.",
  },
  {
    nombre: "Petra",
    pais: "Jordania",
    imagen:
      "https://source.unsplash.com/1200x800/?petra,jordan",
    descripcion:
      "Una ciudad histórica extraordinaria con temperaturas agradables.",
  },
  {
    nombre: "Valle del Loira",
    pais: "Francia",
    imagen:
      "https://source.unsplash.com/1200x800/?loire,valley,france,castle",
    descripcion:
      "Castillos, jardines y paisajes verdes en plena primavera.",
  },
];
export default function PrimaveraPage() {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  return (
    <main className="min-h-screen bg-[#F7F2E8] text-stone-800">
      <section className="mx-auto max-w-7xl px-6 py-20 lg:py-12">
        <a
          href="/"
          className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur-md"
        >
          ← Volver a Destino AI
        </a>

        <div className="mt-10 sm:mt-12 lg:mt-7">
          <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
            🌸 PRIMAVERA
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight md:text-5xl lg:text-4xl">
            Los mejores destinos para viajar en primavera
          </h1>

          <p className="mt-3 max-w-3xl text-lg text-stone-700 lg:mt-2">
            Descubre lugares ideales para disfrutar del buen tiempo, la
            naturaleza, las ciudades y los paisajes más espectaculares de la
            primavera.
          </p>
        </div>
        <div className="mt-10 sm:mt-12 lg:mt-8">
  <p className="text-sm font-bold tracking-[0.35em] text-cyan-800">
    DESTINOS RECOMENDADOS
  </p>

  <h2 className="mt-3 text-3xl font-black md:text-5xl lg:text-4xl">
    Lugares increíbles para visitar esta primavera
  </h2>
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
  {destinosPrimavera.map((destino) => {
    const slug = destino.nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\./g, "")
      .replace(/\s+/g, "-");

    return (
      <article
        key={`${destino.nombre}-${destino.pais}`}
        onClick={() => {
          window.location.href = `/destinos/${slug}`;
        }}
        className="group min-w-0 cursor-pointer overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] shadow-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-300/30 max-sm:snap-start max-sm:hover:translate-y-0"
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
      </article>
    );
  })}
</div>
</div>
</div>
      </section>
    </main>
  );
}
