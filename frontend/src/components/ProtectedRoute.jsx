import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
