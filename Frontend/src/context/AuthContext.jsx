import { createContext, useState, useEffect, useContext, use } from "react";
// import toast from "react-hot-toast";
import api from "../api/api"; // your axios instance
import useFetchResource from "../hooks/useFetchResource";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // attach token to axios instance (not global axios)
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // fetch user only when token exists
  const {
    data: user,
    isLoading,
    isError,
  } = useFetchResource("user/me", "currentUser", !!token);

  // login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post("/user/login", credentials);
      return data;
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  const login = async (credentials) => {
    const result = await loginMutation.mutateAsync(credentials);

    setToken(result.token);
    localStorage.setItem("token", result.token);

    toast.success("Login successful");
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isLoading, isError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
