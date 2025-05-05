import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import Loader from "./Loader";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loader />;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;
