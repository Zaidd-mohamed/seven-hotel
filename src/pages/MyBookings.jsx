import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchMyBookings, cancelBooking, modifyBookingDates } from "../services/bookingService";
import { fetchActiveHotels } from "../services/hotelService";
import { fetchRoomTypeById } from "../services/roomTypeService";
import { parseDateInputToDate, nightsBetween, isFutureDate } from "../utils/dateUtils";

export default function MyBookings() {
  const { currentUser } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // For displaying hotel/roomType names nicely
  const [hotelsMap, setHotelsMap] = useState({});
  const [roomTypeCache, setRoomTypeCache] = useState({});

  useEffect(() => {
    async function loadSupportData() {
      try {
        const hotels = await fetchActiveHotels();
        const map = {};
        hotels.forEach((h) => (map[h.id] = h));
        setHotelsMap(map);
      } catch {
        // ignore; not critical
      }
    }
    loadSupportData();
  }, []);

  async function ensureRoomType(roomTypeId) {
    if (roomTypeCache[roomTypeId]) return roomTypeCache[roomTypeId];
    const rt = await fetchRoomTypeById(roomTypeId);
    setRoomTypeCache((prev) => ({ ...prev, [roomTypeId]: rt }));
    return rt;
  }

  async function loadBookings() {
    if (!currentUser) return;
    setLoading(true);
    setError("");
    try {
      const list = await fetchMyBookings(currentUser.uid);
      setItems(list);
    } catch (e) {
      setError("Failed to load your bookings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  const enriched = useMemo(() => items, [items]);

  async function onCancel(b) {
    setError("");
    setSuccess("");
    setBusyId(b.id);
    try {
      await cancelBooking({ bookingId: b.id, userId: currentUser.uid });
      setSuccess("Booking cancelled.");
      await loadBookings();
    } catch {
      setError("Cancel failed.");
    } finally {
      setBusyId("");
    }
  }

  async function onModify(b, newCheckInStr, newCheckOutStr) {
    setError("");
    setSuccess("");
    setBusyId(b.id);

    try {
      const rt = await ensureRoomType(b.roomTypeId);
      if (!rt) {
        setError("Room type not found.");
        return;
      }

      const ci = parseDateInputToDate(newCheckInStr);
      const co = parseDateInputToDate(newCheckOutStr);

      if (!ci || !co || co <= ci) {
        setError("Invalid date range.");
        return;
      }

      // Client-side recheck only (Phase 5 enforces server-side)
      const nights = nightsBetween(ci, co);
      const totalPrice = nights * Number(rt.pricePerNight || 0);

      await modifyBookingDates({
        bookingId: b.id,
        userId: currentUser.uid,
        checkIn: ci,
        checkOut: co,
        totalPrice,
      });

      setSuccess("Booking updated.");
      await loadBookings();
    } catch {
      setError("Update failed.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Guest
          </p>
          <h1 className="mt-2 font-heading text-3xl">My Bookings</h1>
          <p className="mt-3 text-white/70">
            Manage your reservations. (Phase 4: client-side checks)
          </p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-200">
              {success}
            </div>
          )}

          {loading && (
            <div className="mt-8 text-white/60">Loading your bookings...</div>
          )}

          {!loading && enriched.length === 0 && (
            <div className="mt-8 card-luxe p-6 text-white/70">
              No bookings yet. Search rooms and book your stay.
            </div>
          )}

          {!loading && enriched.length > 0 && (
            <div className="mt-8 space-y-4">
              {enriched.map((b) => {
                const ci = b.checkIn?.toDate ? b.checkIn.toDate() : new Date(b.checkIn);
                const co = b.checkOut?.toDate ? b.checkOut.toDate() : new Date(b.checkOut);
                const canEdit = b.status === "CONFIRMED" && isFutureDate(ci);

                return (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    hotel={hotelsMap[b.hotelId]}
                    canEdit={canEdit}
                    busy={busyId === b.id}
                    onCancel={() => onCancel(b)}
                    onModify={onModify}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingRow({ booking, hotel, canEdit, busy, onCancel, onModify }) {
  const ci = booking.checkIn?.toDate ? booking.checkIn.toDate() : new Date(booking.checkIn);
  const co = booking.checkOut?.toDate ? booking.checkOut.toDate() : new Date(booking.checkOut);

  const [edit, setEdit] = useState(false);
  const [checkInStr, setCheckInStr] = useState(toInputDate(ci));
  const [checkOutStr, setCheckOutStr] = useState(toInputDate(co));

  return (
    <div className="card-luxe p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            {hotel?.name || booking.hotelId}
          </p>
          <h3 className="mt-2 font-heading text-xl">{booking.roomTypeId}</h3>

          <p className="mt-2 text-sm text-white/70">
            {toInputDate(ci)} → {toInputDate(co)} •{" "}
            <span className="text-gold">${booking.totalPrice}</span>
          </p>

          <p className="mt-2 text-xs tracking-widest uppercase">
            Status:{" "}
            <span className={statusClass(booking.status)}>{booking.status}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          {canEdit && !edit && (
            <button className="gold-outline-btn" onClick={() => setEdit(true)} disabled={busy}>
              Modify Dates
            </button>
          )}

          {canEdit && edit && (
            <div className="w-full sm:w-[320px] card-luxe p-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="label-luxe">Check-in</label>
                  <input
                    className="input-luxe"
                    type="date"
                    value={checkInStr}
                    onChange={(e) => setCheckInStr(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-luxe">Check-out</label>
                  <input
                    className="input-luxe"
                    type="date"
                    value={checkOutStr}
                    onChange={(e) => setCheckOutStr(e.target.value)}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    className="gold-solid-btn w-full"
                    disabled={busy}
                    onClick={() => onModify(booking, checkInStr, checkOutStr)}
                  >
                    {busy ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="gold-outline-btn w-full"
                    disabled={busy}
                    onClick={() => setEdit(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {booking.status === "CONFIRMED" && canEdit && (
            <button
              className="gold-solid-btn"
              onClick={onCancel}
              disabled={busy}
              title="Cancel before check-in"
            >
              {busy ? "Cancelling..." : "Cancel Booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function toInputDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function statusClass(status) {
  if (status === "CONFIRMED") return "text-green-200";
  if (status === "CANCELLED") return "text-red-200";
  return "text-white/70";
}
