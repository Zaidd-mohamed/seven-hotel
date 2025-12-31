import { useAuth } from "../context/AuthContext";

export default function StaffDashboard() {
  const { userProfile } = useAuth();

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Staff Dashboard
          </p>
          <h1 className="mt-2 font-heading text-3xl">
            {userProfile?.role?.toUpperCase()} Portal
          </h1>
          <p className="mt-3 text-white/70">
            Room allocations, housekeeping schedules, and guest requests come later.
          </p>
        </div>
      </div>
    </div>
  );
}
