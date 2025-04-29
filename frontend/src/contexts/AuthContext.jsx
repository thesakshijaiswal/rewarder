import { createContext, useState, useEffect, useContext } from "react";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkLoggedIn = async () => {
      if (token) {
        try {
          setLoading(true);
          const response = await fetch("http://localhost:5000/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 401) {
            // Unauthorized, remove token
            localStorage.removeItem("token");
            setToken(null);
            setIsAuthenticated(false);
            return;
          }

          const data = await response.json();

          if (data.success) {
            setUser(data.user);
            setIsAuthenticated(true);
          } else {
            // Optional: only remove token if token-specific failure
            console.warn("Token invalid or session expired.");
            localStorage.removeItem("token");
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Auth check error:", error);
          // Don't immediately log out unless you know the token is invalid
          // You can set an error state or try again later
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, [token]);

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success("Registration successful!");
        return true;
      } else {
        setError(data.message);
        toast.error(data.message || "Registration failed");
        return false;
      }
    } catch (error) {
      setError("An error occurred during registration");
      toast.error("Registration failed! Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        toast.success("Login successful!");
        return true;
      } else {
        setError(data.message);
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      setError("An error occurred during login");
      toast.error("Login failed! Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    toast.info("Logged out successfully!");
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        register,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
