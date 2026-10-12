export default function VeranoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <a
          href="/"
          className="inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold backdrop-blur-md"
        >
          ← Volver a Destino AI
        </a>

        <div className="mt-14">
          <p className="text-sm font-bold tracking-[0.35em] text-cyan-300">
            ☀️ VERANO
          </p>

          <h1 className="mt-4 text-4xl font-black md:text-6xl">
            Los mejores destinos para viajar en verano
          </h1>

          <p className="mt-6 max-w-3xl text-lg text-slate-300">
            Descubre destinos ideales para disfrutar de playas, naturaleza,
            ciudades y grandes aventuras durante el verano.
          </p>
        </div>
      </section>
    </main>
  );
}