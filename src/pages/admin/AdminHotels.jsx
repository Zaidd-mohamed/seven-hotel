import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAllHotels, adminToggleHotelActive } from "../../services/adminService";
import { db } from "../../firebase/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export default function AdminHotels() {
  const { currentUser } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    id: "",
    name: "",
    location: "",
    heroImage: "",
    description: "",
  });

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const h = await fetchAllHotels();
      setHotels(h);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to load hotels.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createHotel(e) {
    e.preventDefault();
    setErr("");

    const id = form.id.trim();
    if (!id) return setErr("Hotel ID is required (e.g., seven-colombo).");
    if (!form.name.trim()) return setErr("Hotel name is required.");

    try {
      await setDoc(doc(db, "hotels", id), {
        name: form.name.trim(),
        location: form.location.trim(),
        heroImage: form.heroImage.trim() || "",
        description: form.description.trim() || "",
        active: true,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      });

      setForm({ id: "", name: "", location: "", heroImage: "", description: "" });
      await load();
    } catch (e2) {
      console.error(e2);
      setErr(e2?.message || "Failed to create hotel.");
    }
  }

  async function toggle(h) {
    try {
      await adminToggleHotelActive(h.id, !h.active, currentUser.uid);
      await load();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to update hotel.");
    }
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">Admin</p>
          <h1 className="mt-2 font-heading text-3xl">Hotel Management</h1>
          <p className="mt-3 text-white/70">Add hotels and enable/disable visibility.</p>

          {err && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {err}
            </div>
          )}

          {/* Create hotel */}
          <form onSubmit={createHotel} className="mt-8 card-luxe p-6">
            <h2 className="font-heading text-xl">Add New Hotel</h2>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="w-full bg-ink/60 border border-white/10 rounded-xl p-3 text-white"
                placeholder="Hotel ID (e.g., seven-colombo)"
                value={form.id}
                onChange={(e) => setForm((p) => ({ ...p, id: e.target.value }))}
              />
              <input
                className="w-full bg-ink/60 border border-white/10 rounded-xl p-3 text-white"
                placeholder="Name (e.g., Seven Colombo)"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                className="w-full bg-ink/60 border border-white/10 rounded-xl p-3 text-white"
                placeholder="Location"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              />
              <input
                className="w-full bg-ink/60 border border-white/10 rounded-xl p-3 text-white"
                placeholder="Hero Image URL"
                value={form.heroImage}
                onChange={(e) => setForm((p) => ({ ...p, heroImage: e.target.value }))}
              />
            </div>

            <textarea
              className="mt-4 w-full bg-ink/60 border border-white/10 rounded-xl p-3 text-white min-h-[100px]"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />

            <button className="gold-solid-btn mt-4" type="submit">
              Create Hotel
            </button>
          </form>

          {/* Hotels list */}
          {loading && <p className="mt-8 text-white/60">Loading…</p>}

          {!loading && (
            <div className="mt-8 space-y-4">
              {hotels.map((h) => (
                <div key={h.id} className="card-luxe p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="font-heading text-xl">{h.name}</p>
                    <p className="mt-1 text-sm text-white/70">{h.location}</p>
                    <p className="mt-2 text-xs text-white/50">ID: {h.id}</p>
                    <p className="mt-2 text-xs text-white/60">
                      Status:{" "}
                      <span className={h.active ? "text-gold" : "text-red-200"}>
                        {h.active ? "ACTIVE" : "DISABLED"}
                      </span>
                    </p>
                  </div>
                  <button className="gold-outline-btn" onClick={() => toggle(h)}>
                    {h.active ? "Disable" : "Enable"}
                  </button>
                </div>
              ))}
              {hotels.length === 0 && (
                <div className="card-luxe p-6 text-white/70">No hotels found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
    