import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/auth";

type ProtectedRoutePropType = {
  children: React.ReactNode;
};

function ProtectedRoute({ children }: ProtectedRoutePropType) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Optionally show a loader/spinner
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}

export default ProtectedRoute;
