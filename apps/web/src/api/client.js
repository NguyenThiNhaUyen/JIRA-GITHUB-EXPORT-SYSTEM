/**
 * Axios client â€” káº¿t ná»‘i Backend ASP.NET Core
 *
 * baseURL = VITE_API_URL + "/api"
 *   â†’ Äáº£m báº£o KHĂ”NG bao giá» cĂ³ /api/api double-prefix
 *
 * Äá»ƒ dĂ¹ng local BE:
 *   Táº¡o .env.local vĂ  thĂªm: VITE_API_URL=http://localhost:5000
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "https://jira-github-export-system.onrender.com";

const client = axios.create({
    baseURL: `${BASE_URL}/api`,
    timeout: 60_000,
    withCredentials: true, // Required for HttpOnly cookies
});

client.interceptors.request.use(
    (config) => {
        // Primary access token check (sessionStorage for better security)
        const token = sessionStorage.getItem("accessToken") || 
                      localStorage.getItem("accessToken") || 
                      localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* â”€â”€ Response Interceptor: BĂ³c tĂ¡ch wrapper ApiResponse<T> â”€â”€ */
// BE luĂ´n tráº£ vá»: { success, message, data: T }
// Interceptor nĂ y tráº£ vá» response.data (ApiResponse object) Ä‘á»ƒ FE xá»­ lĂ½
client.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data?.message ?? error.message;

        if (status === 401 || status === 403) {
            // Clear all auth related storage
            sessionStorage.removeItem("accessToken");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        } else if (!status) {
            // Network error
        }

        return Promise.reject({ status, message, raw: error.response?.data });
    }
);

export default client;

