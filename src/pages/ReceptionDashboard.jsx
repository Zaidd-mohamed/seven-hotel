import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  allocateRoomToBooking,
  checkIn,
  checkOut,
  fetchAssignedBookings,
  fetchRoomsForType,
  fetchUnassignedBookings,
} from "../services/staffOpsService";

export default function ReceptionDashboard() {
  const { currentUser, userProfile } = useAuth();
  const hotelId = userProfile?.hotelId;

  const [unassigned, setUnassigned] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [roomsMap, setRoomsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function loadAll() {
    if (!hotelId) return;
    setLoading(true);
    setErr("");
    try {
      const [u, a] = await Promise.all([
        fetchUnassignedBookings({ hotelId }),
        fetchAssignedBookings({ hotelId }),
      ]);
      setUnassigned(u);
      setAssigned(a);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to load reception data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  async function loadRoomsForBooking(b) {
    const rooms = await fetchRoomsForType({ hotelId, roomTypeId: b.roomTypeId });
    setRoomsMap((prev) => ({ ...prev, [b.id]: rooms }));
  }

  async function onAllocate(b, roomId) {
    setErr("");
    try {
      await allocateRoomToBooking({
        bookingId: b.id,
        roomId,
        actorUid: currentUser.uid,
        hotelId,
      });
      await loadAll();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to allocate room.");
    }
  }

  async function onCheckIn(b) {
    if (!b.roomId) return;
    if (!confirm("Confirm CHECK-IN for this booking?")) return;

    setErr("");
    try {
      await checkIn({
        bookingId: b.id,
        roomId: b.roomId,
        actorUid: currentUser.uid,
        hotelId,
        guestUserId: b.userId,
      });
      await loadAll();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to check-in.");
    }
  }

  async function onCheckOut(b) {
    if (!b.roomId) return;
    if (!confirm("Confirm CHECK-OUT for this booking?")) return;

    setErr("");
    try {
      await checkOut({
        bookingId: b.id,
        roomId: b.roomId,
        actorUid: currentUser.uid,
        hotelId,
        guestUserId: b.userId,
      });
      await loadAll();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to check-out.");
    }
  }

  if (!hotelId) {
    return (
      <div className="pt-24 pb-16">
        <div className="container-x card-luxe p-8 text-white/70">
          Staff account missing <span className="text-white">hotelId</span>. Set it in
          Firestore users/{currentUser?.uid} → hotelId.
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Reception
          </p>
          <h1 className="mt-2 font-heading text-3xl">Room Allocation</h1>
          <p className="mt-3 text-white/70">
            Allocate rooms, then manage check-in and check-out.
          </p>

          {err && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {err}
            </div>
          )}

          {loading && <p className="mt-8 text-white/60">Loading…</p>}

          {!loading && (
            <>
              {/* Unassigned */}
              <div className="mt-10">
                <h2 className="font-heading text-xl">Unassigned Bookings</h2>
                <p className="mt-2 text-sm text-white/60">
                  Bookings with status CONFIRMED and no room allocated.
                </p>

                {unassigned.length === 0 ? (
                  <div className="mt-4 card-luxe p-5 text-white/70">
                    No unassigned bookings.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {unassigned.map((b) => (
                      <div key={b.id} className="card-luxe p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                              Booking
                            </p>
                            <p className="mt-2 text-sm text-white/80 break-all">
                              {b.id}
                            </p>
                            <p className="mt-2 text-xs text-white/50">
                              RoomType: {b.roomTypeId} • Guest: {b.userId?.slice(0, 6)}…
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              className="gold-outline-btn"
                              onClick={() => loadRoomsForBooking(b)}
                            >
                              Load Available Rooms
                            </button>
                          </div>
                        </div>

                        {roomsMap[b.id] && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {roomsMap[b.id].length === 0 ? (
                              <p className="text-sm text-white/60">
                                No CLEAN rooms available for this room type.
                              </p>
                            ) : (
                              roomsMap[b.id].map((r) => (
                                <button
                                  key={r.id}
                                  className="gold-solid-btn"
                                  onClick={() => onAllocate(b, r.id)}
                                >
                                  Assign Room {r.roomNumber}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Assigned */}
              <div className="mt-12">
                <h2 className="font-heading text-xl">Allocated Bookings</h2>
                <p className="mt-2 text-sm text-white/60">
                  Manage check-in / check-out.
                </p>

                {assigned.length === 0 ? (
                  <div className="mt-4 card-luxe p-5 text-white/70">
                    No allocated bookings yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {assigned.map((b) => (
                      <div key={b.id} className="card-luxe p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                              Booking
                            </p>
                            <p className="mt-2 text-sm text-white/80 break-all">
                              {b.id}
                            </p>
                            <p className="mt-2 text-xs text-white/50">
                              Room: {b.roomId} • Status:{" "}
                              <span className="text-gold">{b.status}</span>
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              className="gold-outline-btn"
                              onClick={() => onCheckIn(b)}
                              disabled={b.status !== "CONFIRMED"}
                            >
                              Check-In
                            </button>
                            <button
                              className="gold-solid-btn"
                              onClick={() => onCheckOut(b)}
                              disabled={b.status !== "CHECKED_IN"}
                            >
                              Check-Out
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
