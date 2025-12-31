import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import RoomCard from "../components/RoomCard";
import { useHotel } from "../context/HotelContext";
import { useAuth } from "../context/AuthContext";
import { fetchRoomTypesByHotel } from "../services/roomTypeService";
import { fetchBlocksOverlapping } from "../services/bookingService";
import { createBookingEasyLock } from "../services/bookingTransactionService";
import { parseDateInputToDate, nightsBetween } from "../utils/dateUtils";

export default function Rooms() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { currentUser } = useAuth();
  const { selectedHotelId, selectedHotel, setSelectedHotelId, hotels } = useHotel();

  // URL params from BookingBar
  const hotelIdFromUrl = params.get("hotelId") || "";
  const checkInStr = params.get("checkIn") || "";
  const checkOutStr = params.get("checkOut") || "";

  const checkInDate = useMemo(() => parseDateInputToDate(checkInStr), [checkInStr]);
  const checkOutDate = useMemo(() => parseDateInputToDate(checkOutStr), [checkOutStr]);

  const nights = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    return nightsBetween(checkInDate, checkOutDate);
  }, [checkInDate, checkOutDate]);

  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [success, setSuccess] = useState("");

  // Sync URL hotelId into context
  useEffect(() => {
    if (hotelIdFromUrl && hotelIdFromUrl !== selectedHotelId) {
      const exists = hotels.some((h) => h.id === hotelIdFromUrl);
      if (exists) setSelectedHotelId(hotelIdFromUrl);
    }
  }, [hotelIdFromUrl, selectedHotelId, setSelectedHotelId, hotels]);

  // Load room types + availability badges
  useEffect(() => {
    async function load() {
      const effectiveHotelId = hotelIdFromUrl || selectedHotelId;
      if (!effectiveHotelId) return;

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const types = await fetchRoomTypesByHotel(effectiveHotelId);

        // Default: if no dates, show all as available (browse mode)
        if (!checkInDate || !checkOutDate) {
          setRoomTypes(types.map((rt) => ({ ...rt, isAvailable: true, overlapCount: 0 })));
          return;
        }

        // Get overlapping blocks for badge logic
        const overlappingBlocks = await fetchBlocksOverlapping({
          hotelId: effectiveHotelId,
          checkIn: checkInDate,
          checkOut: checkOutDate,
        });

        // Count overlaps per roomType
        const bookedCounts = {};
        overlappingBlocks.forEach((b) => {
          bookedCounts[b.roomTypeId] = (bookedCounts[b.roomTypeId] || 0) + 1;
        });

        // Simple Phase 4/5 display rule (no inventory read):
        // 0-2 overlaps => available, 3+ => sold out
        const enriched = types.map((rt) => {
          const overlapCount = bookedCounts[rt.id] || 0;
          return {
            ...rt,
            overlapCount,
            isAvailable: overlapCount < 3,
          };
        });

        setRoomTypes(enriched);
      } catch (e) {
        console.error("Rooms load error:", e);
        setError("Failed to load rooms/availability.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [hotelIdFromUrl, selectedHotelId, checkInDate, checkOutDate]);

  async function onBook(roomType) {
    setSuccess("");
    setError("");

    if (!checkInDate || !checkOutDate || nights <= 0) {
      setError("Please search with valid dates using the booking bar (Check Rates).");
      return;
    }

    if (!currentUser) {
      navigate("/login");
      return;
    }

    if (!roomType.isAvailable) {
      setError("This room type is sold out for your selected dates.");
      return;
    }

    setBusyId(roomType.id);

    try {
      const totalPrice = nights * Number(roomType.pricePerNight || 0);
      const effectiveHotelId = hotelIdFromUrl || selectedHotelId;

      // ✅ Phase 5 easy mode: Firestore transaction booking
      await createBookingEasyLock({
        userId: currentUser.uid,
        hotelId: effectiveHotelId,
        roomTypeId: roomType.id,
        checkInDate,
        checkOutDate,
        totalPrice,
        });

      setSuccess("Booking confirmed! View it in My Bookings.");
    } catch (e) {
      console.error("Booking error:", e);
      setError(e?.message || "Booking failed. Please try again.");
    } finally {
      setBusyId("");
    }
  }

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

        {/* Search summary */}
        {checkInStr && checkOutStr && (
          <div className="mt-6 card-luxe p-5 text-sm text-white/70 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <span>
              Dates: <span className="text-white">{checkInStr}</span> →{" "}
              <span className="text-white">{checkOutStr}</span> •{" "}
              <span className="text-gold">{nights} nights</span>
            </span>
            <span className="text-xs text-white/50">
              Availability + booking lock is transaction-based (assignment mode).
            </span>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">
            {success}{" "}
            <button
              className="underline text-gold ml-2"
              onClick={() => navigate("/guest/bookings")}
            >
              Go to My Bookings
            </button>
          </div>
        )}

        {loading && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card-luxe p-6 text-white/60">
                Loading...
              </div>
            ))}
          </div>
        )}

        {!loading && roomTypes.length === 0 && (
          <div className="mt-10 card-luxe p-8 text-white/70">
            No rooms available for this hotel yet.
          </div>
        )}

        {!loading && roomTypes.length > 0 && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            {roomTypes.map((rt) => (
              <div key={rt.id} className="relative">
                {/* Availability badge */}
                <div className="absolute z-10 top-4 left-4">
                  <span
                    className={
                      "rounded-full px-3 py-1 text-xs tracking-widest uppercase border " +
                      (rt.isAvailable
                        ? "border-green-500/30 bg-green-500/10 text-green-200"
                        : "border-red-500/30 bg-red-500/10 text-red-200")
                    }
                  >
                    {rt.isAvailable ? "Available" : "Sold Out"}
                  </span>
                </div>

                <RoomCard roomType={rt} />

                {/* Book action bar */}
                <div className="mt-3 card-luxe p-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                  <div className="text-sm text-white/70">
                    Total:{" "}
                    <span className="text-gold">
                      ${nights * Number(rt.pricePerNight || 0)}
                    </span>{" "}
                    <span className="text-white/50">
                      ({nights} nights × ${rt.pricePerNight}/night)
                    </span>
                  </div>

                  <button
                    className={
                      "gold-solid-btn w-full sm:w-auto " +
                      (!rt.isAvailable ? "opacity-40 cursor-not-allowed" : "")
                    }
                    onClick={() => onBook(rt)}
                    disabled={!rt.isAvailable || busyId === rt.id}
                  >
                    {busyId === rt.id ? "Booking..." : "Book Now"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
