"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

// Las cuatro entradas a las páginas de temporada, con una foto de fondo por temporada.
// Las fotos son las mismas que ya usan las páginas de temporada (Unsplash): Seúl, Zanzíbar, Nueva Inglaterra y Banff.
type Season = { slug: string; emoji: string; name: TranslationKey; tagline: TranslationKey; image: string; position: string };

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=75`;

const seasons: readonly Season[] = [
  { slug: "primavera", emoji: "🌸", name: "season.spring", tagline: "season.springTagline", image: unsplash("photo-1745687237545-c9975e7035f4"), position: "center" },
  { slug: "verano", emoji: "☀️", name: "season.summer", tagline: "season.summerTagline", image: unsplash("photo-1575999502951-4ab25b5ca889"), position: "center" },
  { slug: "otono", emoji: "🍂", name: "season.autumn", tagline: "season.autumnTagline", image: unsplash("photo-1634175598198-fed5994f155f"), position: "center" },
  { slug: "invierno", emoji: "❄️", name: "season.winter", tagline: "season.winterTagline", image: unsplash("photo-1570298472419-a4f77236febb"), position: "center" },
];

export default function SeasonCards() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {seasons.map((season) => (
        <a
          key={season.slug}
          href={`/temporadas/${season.slug}`}
          className="group relative flex min-h-[220px] min-w-0 flex-col justify-end overflow-hidden rounded-3xl bg-stone-800 p-4 text-white shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 sm:min-h-[300px] sm:p-5"
        >
          <img
            src={season.image}
            alt=""
            loading="lazy"
            style={{ objectPosition: season.position }}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/5" />
          <span aria-hidden="true" className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow sm:left-4 sm:top-4">
            {season.emoji}
          </span>
          <span className="relative text-2xl font-black leading-tight drop-shadow sm:text-3xl">{t(season.name)}</span>
          <span className="relative mt-1 text-sm leading-5 text-white/90 max-sm:hidden">{t(season.tagline)}</span>
          <span className="relative mt-3 inline-flex items-center gap-1 text-sm font-bold">
            {t("season.explore")} <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
          </span>
        </a>
      ))}
    </div>
  );
}
