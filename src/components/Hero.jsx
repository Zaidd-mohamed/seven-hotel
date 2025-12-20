export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-end">
      {/* Background image (placeholder) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80)",
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />

      <div className="relative container-x pt-28 pb-16">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">
            Seven — Luxury Hotels in Sri Lanka
          </p>
          <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            A quieter kind of luxury.
          </h1>
          <p className="mt-5 text-white/70 text-base sm:text-lg leading-relaxed">
            Minimal design, exceptional service, and iconic destinations —
            crafted for calm, comfort, and unforgettable stays.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#offers" className="gold-solid-btn">
              Explore Offers
            </a>
            <a href="#hotels" className="gold-outline-btn">
              View Resorts
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
