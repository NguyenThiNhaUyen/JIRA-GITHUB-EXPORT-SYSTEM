/**
 * unwrap.js — Helper bóc tách ApiResponse<T> wrapper từ ASP.NET BE
 *
 * BE luôn trả về: { success: bool, message: string|null, data: T, errors: string[]|null }
 * ASP.NET mặc định serialize camelCase nếu dùng System.Text.Json với CamelCaseNamingPolicy.
 * Nhưng tuỳ config, đôi khi có thể PascalCase. Hàm này handle cả hai.
 *
 * Phân tầng:
 *   client.js interceptor → trả về response.data  (= toàn bộ ApiResponse object)
 *   unwrap()              → trả về response.data.data (= T, payload thực sự)
 */

/**
 * Bóc tách payload T từ ApiResponse<T>
 * @template T
 * @param {object} apiResponse - Kết quả từ client.js (đã là response.data của axios)
 * @returns {T} - Payload thực sự, hoặc null nếu không parse được
 */
export function unwrap(apiResponse) {
    if (!apiResponse) return null;

    // camelCase (System.Text.Json mặc định)
    if (apiResponse.data !== undefined) return apiResponse.data;

    // PascalCase (nếu BE không configure CamelCase policy)
    if (apiResponse.Data !== undefined) return apiResponse.Data;

    // Nếu interceptor đã bóc rồi, trả về nguyên
    return apiResponse;
}

/**
 * Lấy message lỗi từ ApiResponse (Bóc tách mảng BUG-61)
 * @param {object} apiResponse
 * @returns {string}
 */
export function unwrapError(apiResponse) {
    if (!apiResponse) return "Đã xảy ra lỗi kết nối";

    // 1. Check message (Priority)
    const msg = (apiResponse.message ?? apiResponse.Message);
    if (msg) return msg;

    // 2. Check errors array (FluentValidation / Identity style)
    const errors = (apiResponse.errors ?? apiResponse.Errors);
    if (Array.isArray(errors) && errors.length > 0) {
        return errors.join(" | ");
    }
    
    // 3. Fallback
    return "Đã xảy ra lỗi không xác định";
}

/**
 * Kiểm tra request có thành công không (DURABILITY BUG-62)
 * @param {object} apiResponse
 * @returns {boolean}
 */
export function isSuccess(apiResponse) {
    if (!apiResponse) return false;
    // Thành công nếu explicit success=true HOẶC không có lỗi (204 No Content style)
    return (
        apiResponse.success === true || 
        apiResponse.Success === true || 
        (apiResponse.success === undefined && apiResponse.Success === undefined && !apiResponse.errors && !apiResponse.Errors)
    );
}
