import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="pt-24">
        <div className="container-x">
          <div className="card-luxe p-6 text-white/70">Loading...</div>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  const role = userProfile?.role;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
