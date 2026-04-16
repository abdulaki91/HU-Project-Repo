import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/api"; // your axios instance
import useFetchResource from "../hooks/useFetchResource";
import { useMutation } from "@tanstack/react-query";

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
    data: fetchedUser,
    isLoading,
    isError,
  } = useFetchResource("user/me", ["currentUser", token], !!token);

  // login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const { data } = await api.post("/user/login", credentials);
      return data;
    },
  });

  const login = async (credentials) => {
    const result = await loginMutation.mutateAsync(credentials);

    setToken(result.data.token);
    localStorage.setItem("token", result.data.token);

    return result;
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
  };

  // only expose `user` while a token exists; otherwise treat as null
  const user = token ? fetchedUser : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoading: loginMutation.isPending || isLoading,
        isError,
      }}
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
