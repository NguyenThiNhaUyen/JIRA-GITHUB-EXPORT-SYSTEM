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

const BASE_URL = import.meta.env.VITE_API_URL ?? "https://jira-github-export-system.onrender.com";

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
        const message = error.response?.data?.message ?? error.message;

        if (status === 401) {
            console.warn("[API] 401 Unauthorized — Token hết hạn hoặc chưa đăng nhập");
            // TODO: Clear token + redirect /login khi tích hợp Auth hoàn chỉnh
        } else if (status === 403) {
            console.warn("[API] 403 Forbidden — Không có quyền truy cập endpoint này");
        } else if (!status) {
            // Network lỗi hoặc Render đang ngủ (503)
            console.warn("[API] Network error hoặc Render cold start (503). Thử lại sau ~30s.");
        }

        return Promise.reject({ status, message, raw: error.response?.data });
    }
);

export default client;
