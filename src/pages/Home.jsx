import Hero from "../components/Hero";
import BookingBar from "../components/BookingBar";
import SectionTitle from "../components/SectionTitle";
import OfferCard from "../components/OfferCard";

export default function Home() {
  const offers = [
    {
      tag: "Limited Time",
      title: "Stay 3 Pay 2",
      description:
        "Extend your escape. Enjoy your third night on us at select Seven locations.",
    },
    {
      tag: "Wellness",
      title: "Spa & Sunset",
      description:
        "A curated wellness experience with signature treatments and ocean views.",
    },
    {
      tag: "Dining",
      title: "Chef’s Table",
      description:
        "An intimate tasting menu — seasonal Sri Lankan ingredients, elevated.",
    },
  ];

  return (
    <div>
      <Hero />
      <BookingBar />

      {/* Intro */}
      <section className="py-16 sm:py-20">
        <div className="container-x">
          <SectionTitle
            eyebrow="Sri Lanka"
            title="Iconic destinations. Quiet luxury."
            subtitle="From the coastal calm of Galle to the hill-country air of Kandy — Seven is designed for rest, beauty, and effortless service."
          />
        </div>
      </section>

      {/* Resorts & Villas */}
      <section id="hotels" className="pb-16 sm:pb-20">
        <div className="container-x">
          <div className="flex items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Resorts & Villas"
              title="Two signature escapes"
              subtitle="Handpicked experiences for oceanfront serenity or hillside privacy."
            />
            <a href="/rooms" className="gold-outline-btn hidden sm:inline-flex">
              View Rooms
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-luxe overflow-hidden">
              <div className="aspect-[16/10]">
                <img
                  className="h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80"
                  alt="Seven Galle"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
                  Coastal
                </p>
                <h3 className="mt-2 font-heading text-2xl">Seven Galle</h3>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  Ocean-view suites, candlelit dining, and an effortless pace by
                  the shore.
                </p>
              </div>
            </div>

            <div className="card-luxe overflow-hidden">
              <div className="aspect-[16/10]">
                <img
                  className="h-full w-full object-cover"
                  src="https://images.unsplash.com/photo-1501117716987-c8e1ecb210ff?auto=format&fit=crop&w=2000&q=80"
                  alt="Seven Kandy"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
                  Hill Country
                </p>
                <h3 className="mt-2 font-heading text-2xl">Seven Kandy</h3>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  Private villas above the clouds — quiet mornings, warm tea,
                  refined minimal interiors.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:hidden">
            <a href="/rooms" className="gold-outline-btn w-full">
              View Rooms
            </a>
          </div>
        </div>
      </section>

      {/* Offers */}
      <section id="offers" className="py-16 sm:py-20 border-y border-white/10">
        <div className="container-x">
          <SectionTitle
            eyebrow="Offers"
            title="Curated experiences"
            subtitle="Signature packages designed for romance, wellness, and celebration."
          />

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((o) => (
              <OfferCard key={o.title} offer={o} />
            ))}
          </div>
        </div>
      </section>

      {/* Events strip */}
      <section id="events" className="py-16 sm:py-20">
        <div className="container-x">
          <div className="relative overflow-hidden rounded-3xl border border-white/10">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80)",
              }}
            />
            <div className="absolute inset-0 bg-ink/70" />
            <div className="relative p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
                  Events
                </p>
                <h3 className="mt-3 font-heading text-3xl sm:text-4xl">
                  Weddings & private celebrations
                </h3>
                <p className="mt-4 text-white/70 leading-relaxed">
                  From beachfront vows to elegant ballroom dinners — Seven hosts
                  moments worth remembering.
                </p>
              </div>
              <button className="gold-solid-btn">Plan an Event</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
