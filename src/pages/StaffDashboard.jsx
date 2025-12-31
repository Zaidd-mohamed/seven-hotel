import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function StaffDashboard() {
  const { userProfile } = useAuth();

  const role = userProfile?.role; // "receptionist" | "housekeeping"
  const hotelId = userProfile?.hotelId;

  const roomOpsPath =
    role === "receptionist"
      ? "/staff/reception/dashboard"
      : role === "housekeeping"
      ? "/staff/housekeeping/dashboard"
      : "/staff/dashboard";

  const roomOpsLabel =
    role === "receptionist"
      ? "Reception Operations"
      : role === "housekeeping"
      ? "Housekeeping Operations"
      : "Room Operations";

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Staff Dashboard
          </p>

          <h1 className="mt-2 font-heading text-3xl">
            {role ? `${role.toUpperCase()} Portal` : "Staff Portal"}
          </h1>

          <p className="mt-3 text-white/70">
            Manage service requests and hotel operations within your assigned hotel.
          </p>

          {!hotelId && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              This staff account does not have a <span className="text-white">hotelId</span>.
              <br />
              Set it in Firestore:{" "}
              <span className="text-white">
                users/{userProfile?.uid || "uid"}
              </span>{" "}
              → <span className="text-white">hotelId</span>.
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Service Requests */}
            <Link
              className="card-luxe p-6 hover:border-gold/40 transition"
              to="/staff/requests"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                Service Requests
              </p>
              <p className="mt-2 font-heading text-xl">Assigned Queue</p>
              <p className="mt-2 text-sm text-white/70">
                Handle guest requests. NEW → IN_PROGRESS → DONE.
              </p>
              <p className="mt-3 text-xs text-white/50">
                Filtered by: role + hotel (in logic)
              </p>
            </Link>

            {/* Room Operations */}
            <Link
              className={
                "card-luxe p-6 border border-white/10 transition " +
                (hotelId ? "hover:border-gold/40" : "opacity-60 pointer-events-none")
              }
              to={roomOpsPath}
              aria-disabled={!hotelId}
            >
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                Operations
              </p>
              <p className="mt-2 font-heading text-xl">{roomOpsLabel}</p>
              <p className="mt-2 text-sm text-white/70">
                {role === "receptionist"
                  ? "Allocate rooms, then manage check-in and check-out."
                  : role === "housekeeping"
                  ? "Update room status: DIRTY / CLEAN / MAINTENANCE."
                  : "Room allocation and room status management."}
              </p>
              <p className="mt-3 text-xs text-white/50">
                Scoped to your hotelId
              </p>
            </Link>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link className="gold-solid-btn w-full sm:w-auto" to="/staff/requests">
              Open Requests
            </Link>

            <Link
              className={"gold-outline-btn w-full sm:w-auto " + (!hotelId ? "opacity-60 pointer-events-none" : "")}
              to={roomOpsPath}
              aria-disabled={!hotelId}
            >
              Open Room Ops
            </Link>

            <Link className="gold-outline-btn w-full sm:w-auto" to="/staff/dashboard">
              Refresh Dashboard
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/50">
            Note: Access control will be tightened in Phase 9. For now, this is assignment-mode routing.
          </p>
        </div>
      </div>
    </div>
  );
}
