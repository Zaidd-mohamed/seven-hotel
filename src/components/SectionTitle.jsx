export default function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 font-heading text-3xl sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-white/70 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
