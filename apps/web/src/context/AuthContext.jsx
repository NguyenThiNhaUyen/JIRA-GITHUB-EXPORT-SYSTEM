<<<<<<< HEAD
// AuthContext: Quản lý authentication state (login/logout) với role-based access
import { createContext, useContext, useState } from "react";
import { getUserByEmail } from "../mock/data.js";
=======
// AuthContext: Quản lý authentication state — Real API (ASP.NET BE)
import { createContext, useContext, useState } from "react";
import { loginWithCredentials } from "../features/auth/api/authApi.js";
>>>>>>> recover-local-code

/* eslint-disable react-refresh/only-export-components */
const AuthContext = createContext(null);

<<<<<<< HEAD
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
=======
// Role-based redirects — khớp với BE Roles enum (uppercase)
const ROLE_REDIRECTS = {
  ADMIN: "/admin",
  LECTURER: "/lecturer",
  STUDENT: "/student",
};

/**
 * Chuyển BE response (LoginResponse) sang FE user object.
 * BE trả về: { accessToken, tokenType, expiresIn, user: { id, email, fullName, roles, studentCode, lecturerCode } }
 * FE cần:    { id, email, name, role, studentCode?, lecturerCode? }
 */
function mapBEUserToFEUser(loginResponse) {
  const beUser = loginResponse.user ?? loginResponse.User; // camelCase hoặc PascalCase
  const roles = beUser.roles ?? beUser.Roles ?? [];
  const primaryRole = roles[0] ?? "STUDENT"; // Lấy role đầu tiên (BE trả array)

  return {
    id: beUser.id ?? beUser.Id,
    email: beUser.email ?? beUser.Email,
    name: beUser.fullName ?? beUser.FullName,
    role: primaryRole.toUpperCase(),
    ...(beUser.studentCode && { studentCode: beUser.studentCode }),
    ...(beUser.lecturerCode && { lecturerCode: beUser.lecturerCode }),
  };
}

/**
 * Khôi phục user từ localStorage khi load lại trang.
 * Token JWT thật — không cần parse thủ công, chỉ cần kiểm tra tồn tại.
 */
function restoreUserFromStorage() {
  try {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("accessToken");
    if (savedUser && savedToken) {
      return JSON.parse(savedUser);
    }
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(restoreUserFromStorage);
  const [loading, setLoading] = useState(false);

  /**
   * login(email, password) — gọi BE thật
   * Trả về { success, redirectPath } hoặc { success: false, error }
   * Giao diện giống hệt mock cũ để Login.jsx không cần sửa.
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      // client.js interceptor đã bóc vỏ ApiResponse<T>
      // loginResponse = { accessToken, tokenType, expiresIn, user: {...} }
      // Nhưng do interceptor trả về response.data (= toàn bộ ApiResponse),
      // ta cần bóc thêm tầng .data bên trong nếu BE wrap: { success, data: LoginResponse }
      const apiRes = await loginWithCredentials(email, password);

      // apiRes có thể là ApiResponse wrapper { Success, Message, Data }
      // hoặc thẳng LoginResponse nếu interceptor đã unwrap
      const loginResponse = apiRes?.data ?? apiRes?.Data ?? apiRes;

      if (!loginResponse?.accessToken && !loginResponse?.AccessToken) {
        throw new Error(apiRes?.message ?? apiRes?.Message ?? "Đăng nhập thất bại");
      }

      const token = loginResponse.accessToken ?? loginResponse.AccessToken;
      const feUser = mapBEUserToFEUser(loginResponse);
      const redirect = ROLE_REDIRECTS[feUser.role] ?? "/";

      // Lưu vào localStorage (key "accessToken" để client.js interceptor tự đính)
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(feUser));
      setUser(feUser);

      return { success: true, redirectPath: redirect };
    } catch (err) {
      const msg = err?.message ?? "Email hoặc mật khẩu không đúng";
      return { success: false, error: msg };
    } finally {
      setLoading(false);
>>>>>>> recover-local-code
    }
  };

  const logout = () => {
    setUser(null);
<<<<<<< HEAD
    localStorage.removeItem("user");
=======
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    // Xóa key cũ nếu còn (từ mock)
>>>>>>> recover-local-code
    localStorage.removeItem("token");
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
<<<<<<< HEAD
    userRole: user?.role || null,
=======
    userRole: user?.role ?? null,
>>>>>>> recover-local-code
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
