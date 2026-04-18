import { createContext, useContext } from "react";

const AuthContext = createContext();

const mockUser = {
  id: 1,
  firstName: "Demo",
  lastName: "User",
  email: "demo@haramaya.edu.et",
  role: "student",
  department: "Computer Science",
  batch: "2024",
  verified: true,
  status: "active",
};

export function MockAuthProvider({ children }) {
  const mockAuthValue = {
    user: mockUser,
    token: "demo-token",
    login: async (credentials) => {
      console.log("Demo login:", credentials);
      return { success: true, user: mockUser };
    },
    logout: () => {
      console.log("Demo logout");
    },
    isLoading: false,
    isError: false,
  };

  return (
    <AuthContext.Provider value={mockAuthValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within MockAuthProvider");
  }
  return context;
};
