// AuthContext: Quản lý authentication state (login/logout) với role-based access
import { createContext, useContext, useState } from "react";
import { getUserByEmail } from "../mock/data.js";

/* eslint-disable react-refresh/only-export-components */
const AuthContext = createContext(null);

// Role-based redirects
const ROLE_REDIRECTS = {
  ADMIN: "/admin",
  LECTURER: "/lecturer",
  STUDENT: "/student"
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    
    // Validate token exists and is not expired
    if (savedUser && savedToken) {
      try {
        const tokenData = JSON.parse(atob(savedToken));
        const now = Date.now();
        // Check if token is older than 24 hours
        if (now - tokenData.timestamp > 24 * 60 * 60 * 1000) {
          // Token expired, clear storage
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          return null;
        }
        return JSON.parse(savedUser);
      } catch (error) {
        // Invalid token, clear storage
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const mockUser = getUserByEmail(email);
      
      if (mockUser && mockUser.password === password) {
        const token = btoa(JSON.stringify({ email, role: mockUser.role, timestamp: Date.now() }));
        const userData = {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          role: mockUser.role,
          department: mockUser.department,
          ...(mockUser.studentCode && { studentCode: mockUser.studentCode }),
          ...(mockUser.courses && { courses: mockUser.courses }),
          ...(mockUser.projects && { projects: mockUser.projects })
        };
        
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
        setLoading(false);
        return { success: true, redirectPath: ROLE_REDIRECTS[mockUser.role] };
      } else {
        setLoading(false);
        return { success: false, error: "Email hoặc mật khẩu không đúng" };
      }
    } catch {
      setLoading(false);
      return { success: false, error: "Đăng nhập thất bại" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    userRole: user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
