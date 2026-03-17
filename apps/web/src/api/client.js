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

// Tự động nhận diện môi trường dựa trên URL hiện tại
// Tự động nhận diện môi trường để hỗ trợ cả Local và Render
const currentOrigin = window.location.origin;
const isLocal = currentOrigin.includes("localhost") || currentOrigin.includes("127.0.0.1");

const BASE_URL = isLocal 
    ? (import.meta.env.VITE_API_URL ?? "http://localhost:5032")
    : "https://jira-github-export-system.onrender.com";

const client = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 60_000,
    // Axios tự detect Content-Type: JSON -> application/json, FormData -> multipart/form-data
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
// Interceptor này trả về response.data (ApiResponse object) để FE xử lý
client.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message ?? error.message;

        if (status === 401 || status === 403) {
            console.warn(`[API] ${status} — Redirection to Login due to Auth failure`);

            // Clear all auth related storage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        } else if (!status) {
            console.warn("[API] Network error hoặc Render cold start (503).");
        }

        return Promise.reject({ status, message, raw: error.response?.data });
    }
);

export default client;
