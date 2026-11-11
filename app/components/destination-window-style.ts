// Diseño común de la ventana de ficha de destino (modelo Oslo).
//
// Aquí viven las clases de Tailwind de la ventana para que la ficha de la portada y,
// más adelante, las ventanas de las páginas de temporada usen exactamente las mismas.
// IMPORTANTE: este archivo debe estar dentro de /app. Tailwind solo busca clases en
// /app (ver tailwind.config.ts); si estuviera en /lib, los estilos dejarían de generarse.
export const destinationWindowStyle = {
  // Fondo oscuro que cubre la pantalla (la versión "raised" va por encima de los resultados de vuelos).
  overlay: "fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 text-white backdrop-blur-md sm:p-4",
  overlayRaised: "fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-3 text-white backdrop-blur-md sm:p-4",
  dialog: "max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-[30px] border border-white/10 bg-slate-950 shadow-2xl sm:max-h-[calc(100dvh-2rem)]",

  // Fotografía panorámica: 140 px de alto en móvil pequeño, 208 px en móvil grande y 288 px desde sm.
  photoFrame: "relative h-52 max-sm:h-[140px] sm:h-72",
  photo: "h-full w-full object-cover",
  photoGradient: "absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20",
  closeButton: "absolute right-5 top-5 rounded-full bg-black/60 px-4 py-2 font-bold backdrop-blur",
  titleBox: "absolute bottom-6 left-6 right-20 max-sm:bottom-3 max-sm:right-[4.75rem]",
  country: "text-cyan-200",

  // Cuerpo de la ventana.
  body: "p-7 md:p-9",
  description: "text-lg leading-8 text-slate-300",
  sectionHeading: "mt-8 text-xl font-bold",
  recommendationsGrid: "mt-4 grid gap-3 sm:grid-cols-2",
  recommendationCard: "rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-300",
  stayCard: "mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-300",
  stayLabel: "font-semibold text-white",

  // Botones de acción del final: vuelos y hoteles.
  actions: "mt-8 grid gap-3 sm:grid-cols-2",
  primaryAction: "rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-slate-950 disabled:cursor-wait disabled:opacity-60",
  secondaryAction: "rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-6 py-4 font-bold text-cyan-200",
} as const;

// El título se reduce en móvil según la longitud del nombre para que no tape el botón de cierre.
export function destinationTitleClassName(name?: string | null) {
  const length = name?.length ?? 0;
  return `break-words font-black md:text-5xl ${length > 24 ? "max-sm:text-xl max-sm:leading-6" : length > 12 ? "max-sm:text-2xl max-sm:leading-7" : ""} text-4xl`;
}
