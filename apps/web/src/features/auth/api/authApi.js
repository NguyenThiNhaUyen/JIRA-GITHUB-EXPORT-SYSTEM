/**
 * authApi.js â€” Authentication API calls
 */
import client from "../../../api/client.js";

/**
 * Login báº±ng email + password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<LoginResponse>}
 */
export async function loginWithCredentials(email, password) {
    // Send both camelCase and PascalCase to ensure compatibility with C# backend bindings
    return client.post("/sessions", { 
        email, 
        password,
        Email: email, 
        Password: password 
    });
}

/**
 * Login báº±ng Google ID Token
 * @param {string} idToken - Google OAuth2 id_token
 * @returns {Promise<LoginResponse>}
 */
export async function loginWithGoogle(idToken) {
    return client.post("/sessions/google", { idToken, IdToken: idToken });
}

