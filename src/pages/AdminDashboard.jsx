import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { userProfile } = useAuth();

  return (
    <div className="pt-24 pb-16">
      <div className="container-x">
        <div className="card-luxe p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-gold/80">
            Admin Dashboard
          </p>
          <h1 className="mt-2 font-heading text-3xl">Control Center</h1>
          <p className="mt-3 text-white/70">
            You will manage users, roles, hotels, and dashboards in later phases.
          </p>
          <p className="mt-4 text-xs text-white/50">
            Signed in as: {userProfile?.email}
          </p>
        </div>
      </div>
    </div>
  );
}
