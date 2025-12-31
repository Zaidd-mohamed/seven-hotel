import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchRoomTypeById } from "../services/roomTypeService";

export default function RoomDetails() {
  const { id } = useParams(); // id is roomTypeId
  const [roomType, setRoomType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const rt = await fetchRoomTypeById(id);
        if (!rt) {
          setError("Room type not found.");
          setRoomType(null);
        } else {
          setRoomType(rt);
        }
      } catch (e) {
        setError("Failed to load room details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="container-x">
          <div className="card-luxe p-8 text-white/60">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="container-x">
          <div className="card-luxe p-8">
            <p className="text-white/70">{error}</p>
            <div className="mt-6">
              <Link to="/rooms" className="gold-outline-btn">
                Back to Rooms
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const images =
    roomType.images?.length
      ? roomType.images
      : [
          "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=2000&q=80",
        ];

  return (
    <div className="pt-24 pb-16 sm:pb-20">
      <div className="container-x">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
              Room Type
            </p>
            <h1 className="mt-2 font-heading text-4xl sm:text-5xl">
              {roomType.name}
            </h1>
            <p className="mt-3 text-white/70 max-w-2xl">
              {roomType.description}
            </p>
          </div>
          <Link to="/rooms" className="gold-outline-btn">
            Back to Rooms
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="card-luxe overflow-hidden">
              <div className="aspect-[16/10]">
                <img
                  className="h-full w-full object-cover"
                  src={images[0]}
                  alt={roomType.name}
                  loading="lazy"
                />
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.slice(1, 4).map((src) => (
                  <div key={src} className="card-luxe overflow-hidden">
                    <div className="aspect-[4/3]">
                      <img
                        className="h-full w-full object-cover"
                        src={src}
                        alt="Room gallery"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="card-luxe p-6">
              <h2 className="font-heading text-2xl">Details</h2>

              <div className="mt-4 space-y-2 text-sm text-white/70">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span className="text-gold">${roomType.pricePerNight}/night</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Guests</span>
                  <span>{roomType.maxGuests}</span>
                </div>
              </div>

              <h3 className="mt-6 font-heading text-xl">Amenities</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                {(roomType.amenities || []).map((a) => (
                  <li key={a} className="flex gap-2">
                    <span className="text-gold">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>

              <button className="gold-solid-btn w-full mt-6">Book Now</button>
              <p className="mt-3 text-xs text-white/50">
                UI only — availability & booking flow comes in Phase 4/5.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
