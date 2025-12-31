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
          <h1 className="mt-2 font-heading text-3xl">Welcome, {userProfile?.name}</h1>
          <div className="mt-6 flex gap-3">
            <Link className="gold-solid-btn" to="/guest/bookings">
                My Bookings
            </Link>
            <Link className="gold-outline-btn" to="/">
                Search Rooms
            </Link>
            </div>

          <p className="mt-3 text-white/70">
            Bookings and service requests will appear here in later phases.
          </p>
        </div>
      </div>
    </div>
  );
}
