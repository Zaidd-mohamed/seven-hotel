import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchDirtyAndMaintenanceRooms, setRoomStatus } from "../services/staffOpsService";

export default function HousekeepingDashboard() {
  const { currentUser, userProfile } = useAuth();
  const hotelId = userProfile?.hotelId;

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    if (!hotelId) return;
    setLoading(true);
    setErr("");
    try {
      const list = await fetchDirtyAndMaintenanceRooms({ hotelId });
      // sort: DIRTY first
      const p = { DIRTY: 0, MAINTENANCE: 1, CLEAN: 2 };
      list.sort((a, b) => (p[a.status] ?? 9) - (p[b.status] ?? 9));
      setRooms(list);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to load rooms.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  async function update(roomId, newStatus) {
    setErr("");
    try {
      await setRoomStatus({
        roomId,
        newStatus,
        actorUid: currentUser.uid,
        hotelId,
      });
      await load();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to update room status.");
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
            Housekeeping
          </p>
          <h1 className="mt-2 font-heading text-3xl">Room Status</h1>
          <p className="mt-3 text-white/70">
            Prioritize DIRTY rooms first. Mark CLEAN when ready.
          </p>

          {err && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {err}
            </div>
          )}

          {loading && <p className="mt-8 text-white/60">Loading…</p>}

          {!loading && rooms.length === 0 && (
            <div className="mt-8 card-luxe p-6 text-white/70">
              No DIRTY or MAINTENANCE rooms right now.
            </div>
          )}

          {!loading && rooms.length > 0 && (
            <div className="mt-8 space-y-4">
              {rooms.map((r) => (
                <div key={r.id} className="card-luxe p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                        Room {r.roomNumber}
                      </p>
                      <p className="mt-2 text-sm text-white/70">
                        Type: {r.roomTypeId}
                      </p>
                      <p className="mt-3 text-xs tracking-widest uppercase text-white/50">
                        Status:{" "}
                        <span className={r.status === "DIRTY" ? "text-gold" : "text-white/70"}>
                          {r.status}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        className="gold-solid-btn"
                        onClick={() => update(r.id, "CLEAN")}
                        disabled={r.status === "CLEAN"}
                      >
                        Mark CLEAN
                      </button>
                      <button
                        className="gold-outline-btn"
                        onClick={() => update(r.id, "MAINTENANCE")}
                        disabled={r.status === "MAINTENANCE"}
                      >
                        Mark MAINTENANCE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
