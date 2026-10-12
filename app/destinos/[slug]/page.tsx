"use client";

import { useParams } from "next/navigation";

export default function DestinoPage() {
  const params = useParams();
  const slug = String(params.slug);

  const nombre = slug
    .split("-")
    .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <a
          href="/temporadas/primavera"
          className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold"
        >
          ← Volver
        </a>

        <div className="mt-16">
          <h1 className="text-5xl font-black md:text-7xl">
            {nombre}
          </h1>

          <p className="mt-6 text-lg text-slate-300">
            Descubre qué ver, dónde alojarte y cómo organizar tu viaje.
          </p>
        </div>
      </section>
    </main>
  );
}