// AuthContext: Quáº£n lĂ½ authentication state â€” Real API (ASP.NET BE)
import { createContext, useContext, useState } from "react";
import { loginWithCredentials } from "@/features/auth/api/authApi.js";

/* eslint-disable react-refresh/only-export-components */
const AuthContext = createContext(null);

// Role-based redirects â€” khá»›p vá»›i BE Roles enum
const ROLE_REDIRECTS = {
  ADMIN: "/admin",
  LECTURER: "/lecturer",
  STUDENT: "/student",
};

/**
 * Chuyá»ƒn BE response (LoginResponse) sang FE user object.
 * BE tráº£ vá»: { accessToken, tokenType, expiresIn, user: { id, email, fullName, roles, studentCode, lecturerCode } }
 */
function mapBEUserToFEUser(loginResponse) {
  const beUser = loginResponse.user ?? loginResponse.User ?? loginResponse; 
  
  const rawRoles = beUser.roles ?? beUser.Roles ?? beUser.role ?? beUser.Role ?? [];
  const rolesArray = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
  
  let primaryRole = rolesArray[0] ?? "STUDENT";
  if (typeof primaryRole === "object") {
    primaryRole = primaryRole.name ?? primaryRole.Name ?? primaryRole.roleName ?? "STUDENT";
  }

  return {
    id: beUser.id ?? beUser.Id,
    email: beUser.email ?? beUser.Email,
    name: beUser.fullName ?? beUser.FullName,
    role: String(primaryRole).toUpperCase(),
    studentCode: beUser.studentCode ?? beUser.StudentCode,
    lecturerCode: beUser.lecturerCode ?? beUser.LecturerCode,
  };
}

/**
 * KhĂ´i phá»¥c user tá»« localStorage khi load láº¡i trang.
 */
function restoreUserFromStorage() {
  try {
    const versionMatch = localStorage.getItem("app_version") === "2.1";
    if (!versionMatch) {
      localStorage.clear();
      localStorage.setItem("app_version", "2.1");
      return null;
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      return JSON.parse(savedUser);
    }
  } catch {
    localStorage.removeItem("user");
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(restoreUserFromStorage);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const apiRes = await loginWithCredentials(email, password);
      // loginResponse = { accessToken, tokenType, expiresIn, user: {...} }
      const loginResponse = apiRes?.data ?? apiRes?.Data ?? apiRes;

      const feUser = mapBEUserToFEUser(loginResponse);
      const token = loginResponse.accessToken ?? loginResponse.AccessToken;
      
      if (token) {
        // Use sessionStorage instead of localStorage for security (XSS protection)
        sessionStorage.setItem("accessToken", token);
      }
      
      localStorage.setItem("user", JSON.stringify(feUser));
      setUser(feUser);

      const redirect = ROLE_REDIRECTS[feUser.role] || "/";
      return { success: true, redirectPath: redirect };
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, error: err?.message ?? "Email hoáº·c máº­t kháº©u khĂ´ng Ä‘Ăºng" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await import("@/api/client.js").then(m => m.default.post("/auth/logout"));
    } catch (e) {
      console.error("Logout error", e);
    }
    
    setUser(null);
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    // Clean up all possible token keys
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    userRole: user?.role ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

