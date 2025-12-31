import { useParams, Link } from "react-router-dom";

export default function RoomDetails() {
  const { id } = useParams();

  const amenities = [
    "King bed with premium linen",
    "Rain shower + luxury toiletries",
    "High-speed Wi-Fi",
    "In-room dining",
    "Ocean / city / garden views (varies)",
  ];

  return (
    <div className="pt-24 pb-16 sm:pb-20">
      <div className="container-x">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
              Room Details
            </p>
            <h1 className="mt-2 font-heading text-4xl sm:text-5xl capitalize">
              {id.replaceAll("-", " ")}
            </h1>
          </div>
          <Link to="/rooms" className="gold-outline-btn">
            Back to Rooms
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 card-luxe overflow-hidden">
            <div className="aspect-[16/10]">
              <img
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=2000&q=80"
                alt="Room"
                loading="lazy"
              />
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="card-luxe p-6">
              <h2 className="font-heading text-2xl">Amenities</h2>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {amenities.map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="text-gold">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>

              <button className="gold-solid-btn w-full mt-6">Book Now</button>
              <p className="mt-3 text-xs text-white/50">
                UI only — booking flow comes in Phase 4.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
