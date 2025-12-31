import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, updateDoc, doc, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";

export default function Notifications() {
  const { currentUser } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!currentUser) return;

    setLoading(true);
    setError("");

    try {
      // ✅ No orderBy => no index requirement
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid)
      );

      const snap = await getDocs(q);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // ✅ Sort in JS newest first
      list.sort((a, b) => {
        const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });

      setItems(list);
    } catch (e) {
      console.error("Notifications load error:", e);
      setError(e?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.uid]);

  async function markRead(id) {
    await updateDoc(doc(db, "notifications", id), { status: "READ" });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n)));
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">Guest</p>
          <h1 className="mt-2 font-heading text-3xl">Notifications</h1>
          <p className="mt-3 text-white/70">Booking updates and confirmations.</p>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          {loading && <div className="mt-8 text-white/60">Loading...</div>}

          {!loading && items.length === 0 && (
            <div className="mt-8 card-luxe p-6 text-white/70">
              No notifications yet.
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="mt-8 space-y-4">
              {items.map((n) => (
                <div key={n.id} className="card-luxe p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                        {n.type || "NOTICE"}
                      </p>
                      <h3 className="mt-2 font-heading text-xl">{n.title}</h3>
                      <p className="mt-2 text-sm text-white/70">{n.message}</p>
                      <p className="mt-3 text-xs tracking-widest uppercase text-white/50">
                        Status:{" "}
                        <span className={n.status === "UNREAD" ? "text-gold" : "text-white/60"}>
                          {n.status || "UNREAD"}
                        </span>
                      </p>
                    </div>

                    {n.status !== "READ" && (
                      <button className="gold-outline-btn" onClick={() => markRead(n.id)}>
                        Mark Read
                      </button>
                    )}
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
