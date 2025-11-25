import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import useCreateResource from "../hooks/useCreateResource";
import useFetchResource from "../hooks/useFetchResource";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // Set axios Authorization header on start
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // React Query: Fetch logged-in user profile
  const {
    data: user,
    isLoading,
    isError,
    refetch: refetchUser,
  } = useFetchResource("user/me", "currentUser", !!token);

  // React Query mutation for login
  const loginMutation = useCreateResource("user/login", "users");

  const login = async (credentials) => {
    try {
      const result = await loginMutation.mutateAsync(credentials);

      // 1. Save token
      setToken(result.token);
      localStorage.setItem("token", result.token);

      // 2. Set header
      axios.defaults.headers.common["Authorization"] = `Bearer ${result.token}`;

      // 3. Fetch user profile
      refetchUser();
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, isError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
