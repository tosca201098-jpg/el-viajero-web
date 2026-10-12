"use client";

export default function RomaPage() {
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
          <p className="text-sm font-bold tracking-[0.35em] text-cyan-300">
            ITALIA
          </p>

          <h1 className="mt-4 text-5xl font-black md:text-7xl">
          Roma 🇮🇹
          </h1>

        
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
  

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <p className="text-sm text-cyan-300">🗓️ Estancia recomendada</p>
    <p className="mt-2 font-bold">3–4 días</p>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <p className="text-sm text-cyan-300">📍 País</p>
    <p className="mt-2 font-bold">Italia 🇮🇹</p>
  </div>
</div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
  <button className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 font-bold">
    ✈️ Buscar vuelos
  </button>

  <button className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 font-bold">
    🏨 Buscar hoteles
  </button>

  <button className="rounded-2xl bg-cyan-400 px-5 py-4 font-bold text-slate-950">
    🌍 Vuelo + Hotel
  </button>
</div>
      </section>
    </main>
  );
}