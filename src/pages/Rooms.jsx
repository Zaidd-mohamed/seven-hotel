import { useEffect, useState } from "react";
import SectionTitle from "../components/SectionTitle";
import RoomCard from "../components/RoomCard";
import { useHotel } from "../context/HotelContext";
import { fetchRoomTypesByHotel } from "../services/roomTypeService";

export default function Rooms() {
  const { selectedHotelId, selectedHotel, loadingHotels } = useHotel();

  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!selectedHotelId) return;
      setLoading(true);
      setError("");
      try {
        const list = await fetchRoomTypesByHotel(selectedHotelId);
        setRoomTypes(list);
      } catch (e) {
        setError("Failed to load room types.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedHotelId]);

  return (
    <div className="pt-24 pb-16 sm:pb-20">
      <div className="container-x">
        <SectionTitle
          eyebrow="Seven"
          title="Rooms & Suites"
          subtitle={
            selectedHotel
              ? `Now showing: ${selectedHotel.name}`
              : "Select a hotel to view rooms."
          }
        />

        {(loadingHotels || loading) && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-luxe p-6 text-white/60">
                Loading...
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {!loading && !error && !loadingHotels && roomTypes.length === 0 && (
          <div className="mt-10 card-luxe p-8 text-white/70">
            No rooms available for this hotel yet.
          </div>
        )}

        {!loading && !error && roomTypes.length > 0 && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {roomTypes.map((rt) => (
              <RoomCard key={rt.id} roomType={rt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
