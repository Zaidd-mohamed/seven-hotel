import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import SectionTitle from "../components/SectionTitle";
import RoomCard from "../components/RoomCard";
import { useHotel } from "../context/HotelContext";
import { fetchRoomTypesByHotel } from "../services/roomTypeService";
import { parseDateInputToDate, nightsBetween } from "../utils/dateUtils";
import { useAuth } from "../context/AuthContext";
import { fetchBlocksOverlapping, createBooking } from "../services/bookingService";


export default function Rooms() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { currentUser } = useAuth();
  const { selectedHotelId, selectedHotel, setSelectedHotelId, hotels } = useHotel();

  // Read from URL
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

  // If URL specifies hotelId, sync it into context (so dropdown & rest match)
  useEffect(() => {
    if (hotelIdFromUrl && hotelIdFromUrl !== selectedHotelId) {
      // only set if it's a real hotel
      const exists = hotels.some((h) => h.id === hotelIdFromUrl);
      if (exists) setSelectedHotelId(hotelIdFromUrl);
    }
  }, [hotelIdFromUrl, selectedHotelId, setSelectedHotelId, hotels]);

  useEffect(() => {
    async function load() {
      const effectiveHotelId = hotelIdFromUrl || selectedHotelId;
      if (!effectiveHotelId) return;

      setLoading(true);
      setError("");
      setSuccess("");

      try {
        const types = await fetchRoomTypesByHotel(effectiveHotelId);
        setRoomTypes(types);

        // If dates provided, fetch overlapping bookings for availability badges
        if (checkInDate && checkOutDate) {
          const overlapping = await fetchBlocksOverlapping({
            hotelId: effectiveHotelId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            });


          // Mark availability (Phase 4: we don't assign rooms yet)
          // Simple realistic logic: if there is ANY booking for a roomType, reduce availability.
          // Since we didn't read rooms inventory (locked), we treat each roomType as "available unless heavily booked".
          // For better realism, you can unlock rooms read later for client-side.
          const bookedCounts = {};
          overlapping.forEach((b) => {
            bookedCounts[b.roomTypeId] = (bookedCounts[b.roomTypeId] || 0) + 1;
          });

          // We'll use a lightweight assumption: if a roomType has 3+ overlapping bookings, show sold out.
          // (In Phase 5/7 we switch to real inventory room counts with server enforcement.)
          const enriched = types.map((rt) => ({
            ...rt,
            overlapCount: bookedCounts[rt.id] || 0,
            isAvailable: (bookedCounts[rt.id] || 0) < 3,
          }));
          setRoomTypes(enriched);
        } else {
          // No dates = just show room types without availability
          setRoomTypes(types.map((rt) => ({ ...rt, isAvailable: true, overlapCount: 0 })));
        }
      } catch (e) {
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
      // send them to login, then they can come back
      navigate(`/login`);
      return;
    }

    if (!roomType.isAvailable) {
      setError("This room type is sold out for your selected dates.");
      return;
    }

    setBusyId(roomType.id);
    try {
      const totalPrice = nights * Number(roomType.pricePerNight || 0);

      await createBooking({
        userId: currentUser.uid,
        hotelId: hotelIdFromUrl || selectedHotelId,
        roomTypeId: roomType.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
      });

      setSuccess("Booking confirmed! View it in My Bookings.");
    } catch (e) {
      setError("Booking failed. Please try again.");
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
              Availability is client-side in Phase 4.
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
