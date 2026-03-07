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
 * Lấy message lỗi từ ApiResponse
 * @param {object} apiResponse
 * @returns {string}
 */
export function unwrapError(apiResponse) {
    return (
        apiResponse?.message ??
        apiResponse?.Message ??
        "Đã xảy ra lỗi"
    );
}

/**
 * Kiểm tra request có thành công không
 * @param {object} apiResponse
 * @returns {boolean}
 */
export function isSuccess(apiResponse) {
    return apiResponse?.success === true || apiResponse?.Success === true;
}
