import { useEffect, useMemo, useState } from "react";
import {
  fetchAllBookings,
  fetchAllHotels,
  fetchAllRooms,
  fetchAllServiceRequests,
} from "../../services/adminService";

function toDateSafe(ts) {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
}

function ymd(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AdminHome() {
  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [h, r, b, sr] = await Promise.all([
        fetchAllHotels(),
        fetchAllRooms(),
        fetchAllBookings(),
        fetchAllServiceRequests(),
      ]);
      setHotels(h);
      setRooms(r);
      setBookings(b);
      setRequests(sr);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const metrics = useMemo(() => {
    const totalHotels = hotels.length;
    const totalRooms = rooms.length;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    // Occupancy: bookings with status CONFIRMED or CHECKED_IN overlapping today
    const occupiedBookings = bookings.filter((b) => {
      const st = b.status;
      if (!["CONFIRMED", "CHECKED_IN"].includes(st)) return false;

      const checkIn = toDateSafe(b.checkIn);
      const checkOut = toDateSafe(b.checkOut);
      if (!checkIn || !checkOut) return false;

      // overlap rule: start < end AND end > start
      return checkIn < todayEnd && checkOut > todayStart && b.roomId;
    });

    // For occupancy, count unique roomIds booked today (simplified)
    const occupiedRoomIds = new Set(occupiedBookings.map((b) => b.roomId).filter(Boolean));
    const occupancyRate = totalRooms === 0 ? 0 : Math.round((occupiedRoomIds.size / totalRooms) * 100);

    // Revenue: sum totalPrice for CONFIRMED or CHECKED_OUT
    const revenueTotal = bookings
      .filter((b) => ["CONFIRMED", "CHECKED_OUT"].includes(b.status))
      .reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);

    const openRequests = requests.filter((r) => r.status === "NEW" || r.status === "IN_PROGRESS").length;
    const doneRequests = requests.filter((r) => r.status === "DONE").length;

    return {
      totalHotels,
      totalRooms,
      occupancyRate,
      revenueTotal,
      openRequests,
      doneRequests,
    };
  }, [hotels, rooms, bookings, requests]);

  const revenueChart = useMemo(() => {
    // Last 7 days revenue by createdAt
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      days.push(ymd(d));
    }

    const map = Object.fromEntries(days.map((d) => [d, 0]));

    bookings.forEach((b) => {
      if (!["CONFIRMED", "CHECKED_OUT"].includes(b.status)) return;
      const created = toDateSafe(b.createdAt);
      if (!created) return;
      const key = ymd(created);
      if (map[key] !== undefined) map[key] += Number(b.totalPrice) || 0;
    });

    const values = days.map((d) => map[d]);
    const max = Math.max(1, ...values);

    return { days, values, max };
  }, [bookings]);

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">Admin</p>
          <h1 className="mt-2 font-heading text-3xl">Management Dashboard</h1>
          <p className="mt-3 text-white/70">
            Overview of occupancy, revenue, and service performance.
          </p>

          {err && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {err}
            </div>
          )}

          {loading && <p className="mt-8 text-white/60">Loading…</p>}

          {!loading && (
            <>
              {/* KPI Cards */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="card-luxe p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Hotels</p>
                  <p className="mt-2 font-heading text-3xl text-gold">{metrics.totalHotels}</p>
                </div>

                <div className="card-luxe p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Rooms</p>
                  <p className="mt-2 font-heading text-3xl text-gold">{metrics.totalRooms}</p>
                </div>

                <div className="card-luxe p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Occupancy Today</p>
                  <p className="mt-2 font-heading text-3xl text-gold">{metrics.occupancyRate}%</p>
                </div>

                <div className="card-luxe p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Revenue</p>
                  <p className="mt-2 font-heading text-3xl text-gold">
                    ${metrics.revenueTotal.toLocaleString()}
                  </p>
                </div>

                <div className="card-luxe p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Open Requests</p>
                  <p className="mt-2 font-heading text-3xl text-gold">{metrics.openRequests}</p>
                </div>

                <div className="card-luxe p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Completed Requests</p>
                  <p className="mt-2 font-heading text-3xl text-gold">{metrics.doneRequests}</p>
                </div>
              </div>

              {/* Simple chart */}
              <div className="mt-10 card-luxe p-6">
                <p className="text-xs uppercase tracking-[0.35em] text-gold/80">Insights</p>
                <h2 className="mt-2 font-heading text-xl">Revenue (Last 7 Days)</h2>

                <div className="mt-6 grid grid-cols-7 gap-2 items-end h-32">
                  {revenueChart.days.map((d, idx) => {
                    const value = revenueChart.values[idx];
                    const height = Math.round((value / revenueChart.max) * 100);
                    return (
                      <div key={d} className="flex flex-col items-center gap-2">
                        <div className="w-full rounded-lg border border-gold/30 bg-gold/10 overflow-hidden h-24 flex items-end">
                          <div
                            className="w-full bg-gold/70"
                            style={{ height: `${height}%` }}
                            title={`$${value}`}
                          />
                        </div>
                        <p className="text-[10px] text-white/60">{d.slice(5)}</p>
                      </div>
                    );
                  })}
                </div>

                <button className="gold-outline-btn mt-6" onClick={load}>
                  Refresh Metrics
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
