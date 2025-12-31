import { useEffect, useState } from "react";
import SectionTitle from "../components/SectionTitle";
import { useAuth } from "../context/AuthContext";
import { useHotel } from "../context/HotelContext";
import {
  SERVICE_TYPES,
  createServiceRequest,
  listenGuestRequests,
} from "../services/serviceRequestService";

export default function GuestRequests() {
  const { currentUser } = useAuth();
  const { selectedHotelId } = useHotel();

  const [type, setType] = useState("HOUSEKEEPING");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!currentUser) return;

    setLoadingList(true);
    const unsub = listenGuestRequests(
      currentUser.uid,
      (data) => {
        setItems(data);
        setLoadingList(false);
      },
      (e) => {
        console.error(e);
        setError("Failed to load requests.");
        setLoadingList(false);
      }
    );

    return () => unsub?.();
  }, [currentUser]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedHotelId) {
      setError("Please select a hotel first (from home booking bar).");
      return;
    }
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    setSubmitting(true);
    try {
      await createServiceRequest({
        hotelId: selectedHotelId,
        userId: currentUser.uid,
        type,
        message: message.trim(),
      });

      setMessage("");
      setSuccess("Request submitted. Staff will respond shortly.");
    } catch (e2) {
      console.error(e2);
      setError(e2?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <SectionTitle
          eyebrow="Guest"
          title="Service Requests"
          subtitle="Request housekeeping, dining, transport, or maintenance and track status in real time."
        />

        {/* Form */}
        <div className="mt-8 card-luxe p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-white/60">
                Service Type
              </label>
              <select
                className="mt-2 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {SERVICE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-white/60">
                Message
              </label>
              <textarea
                className="mt-2 w-full min-h-[120px] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white"
                placeholder="Example: Please bring 2 extra towels to my room."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">
                {success}
              </div>
            )}

            <button className="gold-solid-btn w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="mt-10 card-luxe p-6">
          <h3 className="font-heading text-xl">My Requests</h3>

          {loadingList && <p className="mt-4 text-white/60">Loading...</p>}

          {!loadingList && items.length === 0 && (
            <p className="mt-4 text-white/60">No requests yet.</p>
          )}

          {!loadingList && items.length > 0 && (
            <div className="mt-6 space-y-4">
              {items.map((r) => (
                <div key={r.id} className="card-luxe p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                        {r.type}
                      </p>
                      <p className="mt-2 text-sm text-white/80">{r.message}</p>
                      <p className="mt-3 text-xs text-white/50">
                        Last update:{" "}
                        {r.updatedAt?.toDate
                          ? r.updatedAt.toDate().toLocaleString()
                          : "—"}
                      </p>
                    </div>

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
