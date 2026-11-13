// Diseño común de la ventana de ficha de destino (modelo Oslo).
//
// Aquí viven las clases de Tailwind de la ventana para que la ficha de la portada y,
// más adelante, las ventanas de las páginas de temporada usen exactamente las mismas.
// IMPORTANTE: este archivo debe estar dentro de /app. Tailwind solo busca clases en
// /app (ver tailwind.config.ts); si estuviera en /lib, los estilos dejarían de generarse.
export const destinationWindowStyle = {
  // Telón que atenúa la página (la versión "raised" va por encima de los resultados de vuelos) y ventana CLARA:
  // fondo blanco y texto oscuro. Solo la foto de la cabecera lleva texto blanco.
  overlay: "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-md sm:p-4",
  overlayRaised: "fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-md sm:p-4",
  dialog: "max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl overflow-y-auto overscroll-contain rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-2xl sm:max-h-[calc(100dvh-2rem)]",

  // Fotografía panorámica: 140 px de alto en móvil pequeño, 208 px en móvil grande y 288 px desde sm.
  photoFrame: "relative h-52 max-sm:h-[140px] sm:h-72",
  photo: "h-full w-full object-cover",
  photoGradient: "absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20",
  closeButton: "absolute right-5 top-5 rounded-full bg-black/60 px-4 py-2 font-bold text-white backdrop-blur",
  titleBox: "absolute bottom-6 left-6 right-20 text-white max-sm:bottom-3 max-sm:right-[4.75rem]",
  country: "text-cyan-200",

  // Tarjeta de destino dentro de una página (no emergente), p. ej. el resumen de «Buscar vuelos».
  inlineCard: "mt-5 overflow-hidden rounded-[30px] border border-slate-200 bg-white text-slate-900 shadow-sm",

  // Cuerpo de la ventana.
  body: "p-7 md:p-9",
  photoCredit: "mb-3 text-xs text-slate-600",
  description: "text-lg leading-8 text-slate-700",
  sectionHeading: "mt-8 text-xl font-bold text-slate-900",
  recommendationsGrid: "mt-4 grid gap-3 sm:grid-cols-2",

  // Tarjetas interiores: SIEMPRE claras sobre la ventana oscura (nunca fondos negros) y con texto oscuro
  // legible. Gris azulado muy claro para recomendaciones y estancia; azul cielo muy claro para los
  // bloques de información (mejor época, aeropuertos, presupuesto) y para el planificador de itinerario.
  recommendationCard: "rounded-2xl border border-slate-300 bg-slate-100 p-4 text-slate-800",
  stayCard: "mt-5 rounded-2xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-700",
  stayLabel: "font-semibold text-slate-900",
  infoCard: "mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-slate-700",
  infoTitle: "font-semibold text-slate-900",
  infoText: "mt-1 text-slate-600",
  infoNote: "mt-1 text-xs text-slate-600",
  airportNote: "mt-2 text-xs text-slate-600",
  budgetCard: "mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900",
  accessCard: "mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4",
  accessText: "mt-2 text-sm text-slate-700",
  accessButton: "min-h-[44px] rounded-xl border border-sky-300 bg-white px-3 py-2 text-sm text-sky-900",

  // Bloques de vuelos al final de la ficha (widget de Travelpayouts y resultados tras "Buscar vuelos").
  flightSection: "mt-8 border-t border-slate-200 pt-6",
  flightHeading: "text-xl font-bold text-slate-900",
  flightSummary: "mt-2 text-sm leading-6 text-slate-700",
  flightWidgetNote: "mt-2 text-xs leading-5 text-slate-700",
  flightFootnote: "mt-3 text-xs leading-5 text-slate-600",
  flightOfferNote: "mt-4 text-xs leading-5 text-slate-600",
  errorText: "mt-3 text-sm text-red-700",

  // Barra de la voz dentro de la ficha (solo se ve con la voz activada).
  voiceBar: "sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-sky-200 bg-sky-50 px-4 py-2 text-sky-900",
  voiceStop: "min-h-[44px] shrink-0 rounded-xl border border-sky-400 bg-white px-4 py-2 text-sm font-semibold text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600",

  // Resultados de vuelos que aparecen dentro de la ficha tras pulsar "Buscar vuelos": misma regla, tarjetas claras.
  flightOfferEmpty: "mt-3 rounded-xl border border-sky-200 bg-sky-50 p-3 text-sky-900",
  flightOfferCard: "rounded-2xl border border-slate-300 bg-slate-100 p-4 text-slate-800",
  flightOfferPrice: "text-lg font-black text-sky-800",
  flightOfferDetails: "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 sm:text-sm",
  flightOfferLink: "mt-3 inline-flex min-h-[44px] items-center rounded-lg border border-sky-500 bg-white px-3 py-1 text-xs font-bold text-sky-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600",

  // Botones de acción del final: vuelos y hoteles.
  actions: "mt-8 grid gap-3 sm:grid-cols-2",
  primaryAction: "rounded-2xl bg-cyan-300 px-6 py-4 font-bold text-slate-950 disabled:cursor-wait disabled:opacity-60",
  secondaryAction: "rounded-2xl border border-sky-300 bg-sky-50 px-6 py-4 font-bold text-sky-900",
  // El mismo botón cuando es un enlace (p. ej. «Buscar hoteles» fuera de la ventana emergente).
  secondaryActionLink: "flex min-h-11 items-center justify-center rounded-2xl border border-sky-300 bg-sky-50 px-6 py-4 text-center font-bold text-sky-900 hover:bg-sky-100",
} as const;

// El título se reduce en móvil según la longitud del nombre para que no tape el botón de cierre.
export function destinationTitleClassName(name?: string | null) {
  const length = name?.length ?? 0;
  return `break-words font-black md:text-5xl ${length > 24 ? "max-sm:text-xl max-sm:leading-6" : length > 12 ? "max-sm:text-2xl max-sm:leading-7" : ""} text-4xl`;
}
