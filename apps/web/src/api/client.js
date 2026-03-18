/**
 * Axios client Ă¢â‚¬â€ kĂ¡ÂºÂ¿t nĂ¡Â»â€˜i Backend ASP.NET Core
 *
 * baseURL = VITE_API_URL + "/api"
 *   Ă¢â€ â€™ Ă„ÂĂ¡ÂºÂ£m bĂ¡ÂºÂ£o KHÄ‚â€NG bao giĂ¡Â»Â cÄ‚Â³ /api/api double-prefix
 *
 * Ă„ÂĂ¡Â»Æ’ dÄ‚Â¹ng local BE:
 *   TĂ¡ÂºÂ¡o .env.local vÄ‚Â  thÄ‚Âªm: VITE_API_URL=http://localhost:5000
 */
import axios from "axios";
import { navigate } from "@/utils/navigation";

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

/* Ă¢â€â‚¬Ă¢â€â‚¬ Response Interceptor: BÄ‚Â³c tÄ‚Â¡ch wrapper ApiResponse<T> Ă¢â€â‚¬Ă¢â€â‚¬ */
// BE luÄ‚Â´n trĂ¡ÂºÂ£ vĂ¡Â»Â: { success, message, data: T }
// Interceptor nÄ‚Â y trĂ¡ÂºÂ£ vĂ¡Â»Â response.data (ApiResponse object) Ă„â€˜Ă¡Â»Æ’ FE xĂ¡Â»Â­ lÄ‚Â½
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
                navigate("/login");
            }
        } else if (!status) {
            // Network error
        }

        return Promise.reject({ status, message, raw: error.response?.data });
    }
);

export default client;
