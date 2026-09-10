import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

function FullScreenLoader() {
  return (
    <div className="ayu-bg flex min-h-screen items-center justify-center" data-testid="route-loading">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  );
}

const HOME_BY_ROLE = {
  admin: "/admin",
  doctor: "/doctor",
  patient: "/patient",
};

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={HOME_BY_ROLE[user.role] || "/"} replace />;
  }
  return children;
}

export { HOME_BY_ROLE };
