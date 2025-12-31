export default function OfferCard({ offer }) {
  return (
    <div className="card-luxe p-6">
      <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
        {offer.tag}
      </p>
      <h3 className="mt-3 font-heading text-2xl">{offer.title}</h3>
      <p className="mt-3 text-sm text-white/70 leading-relaxed">
        {offer.description}
      </p>
      <div className="mt-6">
        <button className="gold-outline-btn">Learn More</button>
      </div>
    </div>
  );
}
