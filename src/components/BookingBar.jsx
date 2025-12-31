import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHotel } from "../context/HotelContext";

export default function BookingBar() {
  const navigate = useNavigate();
  const {
    hotels,
    selectedHotelId,
    setSelectedHotelId,
    loadingHotels,
    hotelsError,
  } = useHotel();

  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState("2");
  const [children, setChildren] = useState("0");
  const [promo, setPromo] = useState("");
  const [error, setError] = useState("");

  function onCheckRates() {
    setError("");

    if (!selectedHotelId) {
      setError("Please select a hotel.");
      return;
    }
    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    const params = new URLSearchParams({
      hotelId: selectedHotelId,
      checkIn,
      checkOut,
      adults,
      children,
      promo,
    });

    navigate(`/rooms?${params.toString()}`);
  }

  return (
    <section className="relative -mt-10 sm:-mt-12">
      <div className="container-x">
        <div className="card-luxe p-4 sm:p-5">
          {hotelsError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {hotelsError}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-2">
              <label className="label-luxe">Hotel</label>
              <select
                className="input-luxe"
                value={selectedHotelId}
                onChange={(e) => setSelectedHotelId(e.target.value)}
                disabled={loadingHotels || hotels.length === 0}
              >
                {loadingHotels && <option>Loading hotels...</option>}
                {!loadingHotels &&
                  hotels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="label-luxe">Check-in</label>
              <input
                type="date"
                className="input-luxe"
                min={todayStr}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="label-luxe">Check-out</label>
              <input
                type="date"
                className="input-luxe"
                min={checkIn || todayStr}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            <div className="lg:col-span-2">
              <label className="label-luxe">Adults</label>
              <select
                className="input-luxe"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
              >
                <option>1</option><option>2</option><option>3</option><option>4</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="label-luxe">Children</label>
              <select
                className="input-luxe"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              >
                <option>0</option><option>1</option><option>2</option><option>3</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="label-luxe">Promo</label>
              <input
                placeholder="SEVEN"
                className="input-luxe"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
            </div>

            <div className="lg:col-span-12 flex justify-end pt-1">
              <button className="gold-solid-btn w-full sm:w-auto" onClick={onCheckRates}>
                Check Rates
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-white/50">
            Availability is client-side in Phase 4. Final enforcement comes in Phase 5.
          </p>
        </div>
      </div>
    </section>
  );
}
