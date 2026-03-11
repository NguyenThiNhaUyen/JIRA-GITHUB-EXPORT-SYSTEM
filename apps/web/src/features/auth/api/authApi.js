/**
 * authApi.js — Authentication API calls
 *
 * BE Contract (POST /api/sessions):
 *   Request:  { Email: string, Password: string }
 *   Response: ApiResponse<LoginResponse>
 *     → LoginResponse: {
 *         accessToken: string,
 *         tokenType:   "Bearer",
 *         expiresIn:   number,   // seconds
 *         user: {
 *           id:           number,
 *           email:        string,
 *           fullName:     string,
 *           roles:        string[],  // ["ADMIN"] | ["LECTURER"] | ["STUDENT"]
 *           studentCode:  string | null,
 *           lecturerCode: string | null,
 *         }
 *       }
 *
 * NOTE: client.js interceptor bóc ApiResponse wrapper,
 *       nên hàm này nhận thẳng LoginResponse object.
 */
import client from "../../../api/client.js";

/**
 * Login bằng email + password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<LoginResponse>}
 */
export async function loginWithCredentials(email, password) {
    // Thử gửi PascalCase { Email, Password } đề phòng Backend C# bị lỗi Null Reference và trả ra 500
    // do không Bind được biến camelCase
    return client.post("/sessions", { Email: email, Password: password });
}

/**
 * Login bằng Google ID Token
 * @param {string} idToken - Google OAuth2 id_token
 * @returns {Promise<LoginResponse>}
 */
export async function loginWithGoogle(idToken) {
    return client.post("/sessions/google", { idToken });
}
