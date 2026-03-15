// AuthContext: Quản lý authentication state — Real API (ASP.NET BE)
import { createContext, useContext, useState } from "react";
import { loginWithCredentials } from "../features/auth/api/authApi.js";

/* eslint-disable react-refresh/only-export-components */
const AuthContext = createContext(null);

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
  const beUser = loginResponse.user ?? loginResponse.User ?? loginResponse; 
  
  // Xử lý linh hoạt: roles (array), Roles (array), role (string), Role (string)
  const rawRoles = beUser.roles ?? beUser.Roles ?? beUser.role ?? beUser.Role ?? [];
  const rolesArray = Array.isArray(rawRoles) ? rawRoles : [rawRoles];
  
  // Lấy role đầu tiên, handle nếu role là object { name: "..." } hoặc string
  let primaryRole = rolesArray[0] ?? "STUDENT";
  if (typeof primaryRole === "object") {
    primaryRole = primaryRole.name ?? primaryRole.Name ?? primaryRole.roleName ?? "STUDENT";
  }

  return {
    id: beUser.id ?? beUser.Id,
    email: beUser.email ?? beUser.Email,
    name: beUser.fullName ?? beUser.FullName,
    role: String(primaryRole).toUpperCase(),
    ...(beUser.studentCode && { studentCode: beUser.studentCode }),
    ...(beUser.lecturerCode && { lecturerCode: beUser.lecturerCode }),
  };
}

/**
 * Khôi phục user từ localStorage khi load lại trang.
 * Có kèm logic Auto-Logout: Nếu phiên bản local cache là đời cũ (chưa có cờ v2.1), 
 * thì lập tức xóa bỏ và bắt đăng nhập lại.
 */
function restoreUserFromStorage() {
  try {
    const versionMatch = localStorage.getItem("app_version") === "2.1";
    if (!versionMatch) {
      // Ép dọn dẹp cache từ bản cũ (Mock API) để tránh bị kẹt role
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      localStorage.setItem("app_version", "2.1"); // Đánh dấu đã qua bản mới
      return null;
    }

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
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    // Xóa key cũ nếu còn (từ mock)
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
