export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-charcoal">
      <div className="container-x py-12 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5">
          <p className="font-heading text-2xl text-gold">Seven</p>
          <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-md">
            Luxury stays across Sri Lanka — crafted with minimal elegance, calm
            spaces, and unforgettable service.
          </p>
        </div>

        <div className="md:col-span-3">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            Contact
          </p>
          <p className="mt-3 text-sm text-white/70">
            reservations@sevenhotels.lk
            <br />
            +94 11 234 5678
            <br />
            Colombo • Galle • Kandy
          </p>
        </div>

        <div className="md:col-span-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            Newsletter
          </p>
          <div className="mt-3 flex gap-3">
            <input className="input-luxe" placeholder="Email address" />
            <button className="gold-solid-btn whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="mt-3 text-xs text-white/50">
            UI only — email integration later.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Seven Hotels. All rights reserved.</span>
          <span className="tracking-[0.25em] uppercase">Luxury • Minimal • Calm</span>
        </div>
      </div>
    </footer>
  );
}
