import { Link } from "react-router-dom";

export default function RoomCard({ room }) {
  return (
    <Link
      to={`/rooms/${room.id}`}
      className="group card-luxe overflow-hidden block"
    >
      <div className="aspect-[16/11] overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-heading text-xl">{room.name}</h3>
          <span className="text-xs tracking-[0.25em] uppercase text-gold">
            From ${room.price}/night
          </span>
        </div>
        <p className="mt-3 text-sm text-white/70 leading-relaxed">
          {room.summary}
        </p>

        <div className="mt-5">
          <span className="gold-outline-btn">View Details</span>
        </div>
      </div>
    </Link>
  );
}
