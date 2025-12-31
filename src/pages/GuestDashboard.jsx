import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function GuestDashboard() {
  const { userProfile } = useAuth();

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Guest Dashboard
          </p>

          <h1 className="mt-2 font-heading text-3xl">
            Welcome, {userProfile?.name || "Guest"}
          </h1>

          <p className="mt-3 text-white/70">
            Manage bookings and request hotel services with real-time updates.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link className="card-luxe p-6 hover:border-gold/40 transition" to="/guest/bookings">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Bookings</p>
              <p className="mt-2 font-heading text-xl">My Bookings</p>
              <p className="mt-2 text-sm text-white/70">
                View, cancel, or modify your bookings.
              </p>
            </Link>

            <Link className="card-luxe p-6 hover:border-gold/40 transition" to="/guest/requests">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Services</p>
              <p className="mt-2 font-heading text-xl">Service Requests</p>
              <p className="mt-2 text-sm text-white/70">
                Housekeeping, dining, transport, maintenance.
              </p>
            </Link>

            <Link className="card-luxe p-6 hover:border-gold/40 transition" to="/guest/notifications">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Updates</p>
              <p className="mt-2 font-heading text-xl">Notifications</p>
              <p className="mt-2 text-sm text-white/70">
                Track booking + request updates.
              </p>
            </Link>

            <Link className="card-luxe p-6 hover:border-gold/40 transition" to="/">
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Explore</p>
              <p className="mt-2 font-heading text-xl">Search Rooms</p>
              <p className="mt-2 text-sm text-white/70">
                Browse room types and availability.
              </p>
            </Link>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link className="gold-solid-btn w-full sm:w-auto" to="/guest/requests">
              New Service Request
            </Link>
            <Link className="gold-outline-btn w-full sm:w-auto" to="/rooms">
              Browse Rooms
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/50">
            Tip: Use the booking bar on the home page to select your hotel and dates.
          </p>
        </div>
      </div>
    </div>
  );
}
