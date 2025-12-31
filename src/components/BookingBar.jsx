import { useHotel } from "../context/HotelContext";

export default function BookingBar() {
  const {
    hotels,
    selectedHotelId,
    setSelectedHotelId,
    loadingHotels,
    hotelsError,
  } = useHotel();

  return (
    <section className="relative -mt-10 sm:-mt-12">
      <div className="container-x">
        <div className="card-luxe p-4 sm:p-5">
          {hotelsError && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {hotelsError}
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
                {!loadingHotels && hotels.length === 0 && (
                  <option>No hotels</option>
                )}
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
              <input type="date" className="input-luxe" />
            </div>

            <div className="lg:col-span-2">
              <label className="label-luxe">Check-out</label>
              <input type="date" className="input-luxe" />
            </div>

            <div className="lg:col-span-2">
              <label className="label-luxe">Adults</label>
              <select className="input-luxe">
                <option>1</option><option>2</option><option>3</option><option>4</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="label-luxe">Children</label>
              <select className="input-luxe">
                <option>0</option><option>1</option><option>2</option><option>3</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="label-luxe">Promo</label>
              <input placeholder="SEVEN" className="input-luxe" />
            </div>

            <div className="lg:col-span-12 flex justify-end pt-1">
              <button className="gold-solid-btn w-full sm:w-auto">
                Check Rates
              </button>
            </div>
          </div>

          <p className="mt-3 text-xs text-white/50">
            Read-only demo — availability logic comes in Phase 4/5.
          </p>
        </div>
      </div>
    </section>
  );
}
