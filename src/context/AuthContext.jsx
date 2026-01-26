// AuthContext: Quản lý authentication state (login/logout)
import { createContext, useContext, useState } from "react";

/* eslint-disable react-refresh/only-export-components */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (username && password) {
        const userData = {
          id: 1,
          username,
          email: `${username}@example.com`,
          name: username,
        };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setLoading(false);
        return { success: true };
      } else {
        setLoading(false);
        return { success: false, error: "Vui lòng nhập username và password" };
      }
    } catch {
      setLoading(false);
      return { success: false, error: "Đăng nhập thất bại" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
