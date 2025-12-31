import { Link } from "react-router-dom";

export default function RoomCard({ roomType }) {
  const img =
    roomType?.images?.[0] ||
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=2000&q=80";

  return (
    <Link
      to={`/rooms/${roomType.id}`}
      className="group card-luxe overflow-hidden block"
    >
      <div className="aspect-[16/11] overflow-hidden">
        <img
          src={img}
          alt={roomType.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-heading text-xl">{roomType.name}</h3>
          <span className="text-xs tracking-[0.25em] uppercase text-gold">
            ${roomType.pricePerNight}/night
          </span>
        </div>

        <p className="mt-2 text-xs uppercase tracking-[0.25em] text-white/60">
          Max guests: {roomType.maxGuests}
        </p>

        <p className="mt-3 text-sm text-white/70 leading-relaxed line-clamp-2">
          {roomType.description}
        </p>

        {!!roomType.amenities?.length && (
          <div className="mt-4 flex flex-wrap gap-2">
            {roomType.amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5">
          <span className="gold-outline-btn">View Details</span>
        </div>
      </div>
    </Link>
  );
}
