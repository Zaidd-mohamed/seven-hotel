import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchAllHotels, fetchAllUsers, adminUpdateUser } from "../../services/adminService";

const ROLES = ["guest", "receptionist", "housekeeping", "admin"];

export default function AdminUsers() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const [u, h] = await Promise.all([fetchAllUsers(), fetchAllHotels()]);
      setUsers(u);
      setHotels(h);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const hotelOptions = useMemo(() => hotels.map((h) => h.id), [hotels]);

  async function update(uid, patch) {
    setErr("");
    try {
      await adminUpdateUser(uid, patch, currentUser.uid);
      await load();
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Failed to update user.");
    }
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">Admin</p>
          <h1 className="mt-2 font-heading text-3xl">User Management</h1>
          <p className="mt-3 text-white/70">
            Update roles, assign hotels for staff, and enable/disable accounts.
          </p>

          {err && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {err}
            </div>
          )}

          {loading && <p className="mt-8 text-white/60">Loading…</p>}

          {!loading && (
            <div className="mt-8 space-y-4">
              {users.map((u) => (
                <div key={u.id} className="card-luxe p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                      <p className="font-heading text-xl">{u.name || "Unnamed User"}</p>
                      <p className="mt-1 text-sm text-white/70">{u.email || "No email"}</p>
                      <p className="mt-2 text-xs text-white/50 break-all">UID: {u.id}</p>
                      <p className="mt-2 text-xs text-white/60">
                        Status:{" "}
                        <span className={u.disabled ? "text-red-200" : "text-gold"}>
                          {u.disabled ? "DISABLED" : "ACTIVE"}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-[280px]">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Role</p>
                        <select
                          className="w-full bg-ink/60 border border-white/10 rounded-xl p-3 text-white"
                          value={u.role || "guest"}
                          onChange={(e) => update(u.id, { role: e.target.value })}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Hotel</p>
                        <select
                          className="w-full bg-ink/60 border border-white/10 rounded-xl p-3 text-white"
                          value={u.hotelId || ""}
                          onChange={(e) =>
                            update(u.id, { hotelId: e.target.value || null })
                          }
                        >
                          <option value="">(none)</option>
                          {hotelOptions.map((hid) => (
                            <option key={hid} value={hid}>{hid}</option>
                          ))}
                        </select>
                        <p className="mt-2 text-xs text-white/50">
                          Staff should have a hotelId.
                        </p>
                      </div>

                      <div className="flex items-end">
                        <button
                          className={u.disabled ? "gold-solid-btn w-full" : "gold-outline-btn w-full"}
                          onClick={() => update(u.id, { disabled: !u.disabled })}
                        >
                          {u.disabled ? "Enable" : "Disable"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="card-luxe p-6 text-white/70">No users found.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
