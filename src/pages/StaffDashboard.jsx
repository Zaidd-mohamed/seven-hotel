import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function StaffDashboard() {
  const { userProfile } = useAuth();

  const role = userProfile?.role; // "receptionist" | "housekeeping"
  const hotelId = userProfile?.hotelId;

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
            View and manage service requests assigned to your role in real time.
          </p>

          {!hotelId && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              This staff account does not have a <span className="text-white">hotelId</span>.
              <br />
              Set it in Firestore: <span className="text-white">users/{userProfile?.uid || "uid"}</span>{" "}
              → <span className="text-white">hotelId</span>.
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              className="card-luxe p-6 hover:border-gold/40 transition"
              to="/staff/requests"
            >
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                Service Requests
              </p>
              <p className="mt-2 font-heading text-xl">Assigned Queue</p>
              <p className="mt-2 text-sm text-white/70">
                See NEW requests first, then IN_PROGRESS, then DONE.
              </p>
              <p className="mt-3 text-xs text-white/50">
                Filtered by: role + hotel
              </p>
            </Link>

            <div className="card-luxe p-6 border border-white/10">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                Coming Next
              </p>
              <p className="mt-2 font-heading text-xl">Room Operations</p>
              <p className="mt-2 text-sm text-white/70">
                Room status (CLEAN/DIRTY/MAINTENANCE) and staff task assignment.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link className="gold-solid-btn w-full sm:w-auto" to="/staff/requests">
              Open Requests
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
