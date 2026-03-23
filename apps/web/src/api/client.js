/**
 * Axios client — kết nối Backend ASP.NET Core
 *
 * baseURL = VITE_API_URL + "/api"
 *   → Đảm bảo KHÔNG bao giờ có /api/api double-prefix
 *
 * Để dùng local BE:
 *   Tạo .env.local và thêm: VITE_API_URL=http://localhost:5000
 */
import axios from "axios";
import { unwrapError } from "./unwrap.js"; // BUG-71: Import our robust error extractor

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://jira-github-export-system-production.up.railway.app";

const client = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 60_000,
    headers: {
        "Content-Type": "application/json",
    },
});

/* ── Request Interceptor: Tự đính kèm JWT từ localStorage ── */
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* ── Response Interceptor: Bóc tách wrapper ApiResponse<T> ── */
// BE luôn trả về: { success, message, data: T }
// Interceptor này tự bóc ra chỉ còn phần `data` để FE dùng trực tiếp
client.interceptors.response.use(
    (response) => {
        // ASP.NET trả về 200/201 → response.data là ApiResponse<T>
        // Trả về nguyên response.data để giữ cả { success, message, data }
        // Từng API function tự quyết định lấy .data bên trong nếu cần
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        
        // BUG-71: Normalize error format globally for consistent Toast display
        // Lấy lỗi chi tiết (ValidationErrors array, vv.) từ unwrapError đã làm ở Phase 10
        const message = status 
            ? unwrapError(error.response?.data) 
            : ("Hệ thống đang khởi động hoặc mất kết nối mạng. Vui lòng thử lại sau vài giây (BUG-72/ROBUSTNESS).");

        if (status === 401) {
            console.warn("[API] 401 Unauthorized — Token hết hạn hoặc chưa đăng nhập");
            
            // Xóa state rác
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");

            // BUG-68: Chặn vòng lặp Redirect vô tận (Stress Test Protection)
            // Nếu request lỗi CHÍNH LÀ request login, hoặc đang ở trang login, KHÔNG ép redirect.
            const isLoginRequest = error.config?.url?.includes("/login") || error.config?.url?.includes("/auth");
            const isAtLoginPage = window.location.pathname.includes("/login");

            if (!isLoginRequest && !isAtLoginPage) {
                window.location.href = "/login?session=expired";
            }
        } else if (status === 403) {
            console.warn("[API] 403 Forbidden — Không có quyền truy cập endpoint này");
        } else if (!status) {
            // Network lỗi hoặc Cold start (BUG-72)
            console.warn("[API] Network error hoặc Render cold start (503).");
        }

        return Promise.reject({ 
            status, 
            message: message || error.message, 
            raw: error.response?.data,
            config: error.config 
        });
    }
);

export default client;
