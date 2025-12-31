import { useEffect, useState } from "react";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import { listenStaffRequests, updateRequestStatus } from "../services/serviceRequestService";

export default function StaffRequests() {
  const { currentUser, userProfile } = useAuth();

  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState("");

  const staffRole = userProfile?.role;      // "receptionist" | "housekeeping"
  const hotelId = userProfile?.hotelId;     // must be set for staff accounts

  useEffect(() => {
    if (!currentUser || !staffRole || !hotelId) return;

    setLoadingList(true);
    const unsub = listenStaffRequests(
      { hotelId, staffRole },
      (data) => {
        setItems(data);
        setLoadingList(false);
      },
      (e) => {
        console.error(e);
        setError("Failed to load staff requests.");
        setLoadingList(false);
      }
    );

    return () => unsub?.();
  }, [currentUser, staffRole, hotelId]);

  async function onStart(r) {
    try {
      await updateRequestStatus({
        requestId: r.id,
        newStatus: "IN_PROGRESS",
        actorUid: currentUser.uid,
        actorRole: staffRole,
        guestUserId: r.userId,
        hotelId: r.hotelId,
      });
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to update status.");
    }
  }

  async function onComplete(r) {
    try {
      await updateRequestStatus({
        requestId: r.id,
        newStatus: "DONE",
        actorUid: currentUser.uid,
        actorRole: staffRole,
        guestUserId: r.userId,
        hotelId: r.hotelId,
      });
    } catch (e) {
      console.error(e);
      setError(e?.message || "Failed to update status.");
    }
  }

  if (!hotelId) {
    return (
      <div className="pt-24 pb-16">
        <div className="container-x card-luxe p-8 text-white/70">
          Staff account missing hotelId. Set your staff user’s hotelId in Firestore users/{`{uid}`} document.
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <SectionTitle
          eyebrow="Staff"
          title="Service Requests"
          subtitle={`Showing requests for role: ${staffRole} • Hotel: ${hotelId}`}
        />

        {error && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 card-luxe p-6">
          {loadingList && <p className="text-white/60">Loading...</p>}

          {!loadingList && items.length === 0 && (
            <p className="text-white/60">No requests right now.</p>
          )}

          {!loadingList && items.length > 0 && (
            <div className="space-y-4">
              {items.map((r) => (
                <div key={r.id} className="card-luxe p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                        {r.type} • Guest: {r.userId.slice(0, 6)}…
                      </p>
                      <p className="mt-2 text-sm text-white/80">{r.message}</p>
                      <p className="mt-3 text-xs text-white/50">
                        Updated:{" "}
                        {r.updatedAt?.toDate
                          ? r.updatedAt.toDate().toLocaleString()
                          : "—"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span
                        className={
                          "rounded-full px-3 py-1 text-xs uppercase tracking-widest border " +
                          (r.status === "NEW"
                            ? "border-gold/30 bg-gold/10 text-gold"
                            : r.status === "IN_PROGRESS"
                            ? "border-white/20 bg-white/5 text-white/80"
                            : "border-green-500/30 bg-green-500/10 text-green-200")
                        }
                      >
                        {r.status}
                      </span>

                      <div className="flex gap-2">
                        <button
                          className="gold-outline-btn"
                          onClick={() => onStart(r)}
                          disabled={r.status !== "NEW"}
                        >
                          Start
                        </button>
                        <button
                          className="gold-solid-btn"
                          onClick={() => onComplete(r)}
                          disabled={r.status !== "IN_PROGRESS"}
                        >
                          Complete
                        </button>
                      </div>
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
