/**
 * unwrap.js â€” Helper bĂ³c tĂ¡ch ApiResponse<T> wrapper tá»« ASP.NET BE
 *
 * BE luĂ´n tráº£ vá»: { success: bool, message: string|null, data: T, errors: string[]|null }
 * ASP.NET máº·c Ä‘á»‹nh serialize camelCase náº¿u dĂ¹ng System.Text.Json vá»›i CamelCaseNamingPolicy.
 * NhÆ°ng tuá»³ config, Ä‘Ă´i khi cĂ³ thá»ƒ PascalCase. HĂ m nĂ y handle cáº£ hai.
 *
 * PhĂ¢n táº§ng:
 *   client.js interceptor â†’ tráº£ vá» response.data  (= toĂ n bá»™ ApiResponse object)
 *   unwrap()              â†’ tráº£ vá» response.data.data (= T, payload thá»±c sá»±)
 */

/**
 * BĂ³c tĂ¡ch payload T tá»« ApiResponse<T>
 * @template T
 * @param {object} apiResponse - Káº¿t quáº£ tá»« client.js (Ä‘Ă£ lĂ  response.data cá»§a axios)
 * @returns {T} - Payload thá»±c sá»±, hoáº·c null náº¿u khĂ´ng parse Ä‘Æ°á»£c
 */
export function unwrap(apiResponse) {
    if (!apiResponse) return null;

    // camelCase (System.Text.Json máº·c Ä‘á»‹nh)
    if (apiResponse.data !== undefined) return apiResponse.data;

    // PascalCase (náº¿u BE khĂ´ng configure CamelCase policy)
    if (apiResponse.Data !== undefined) return apiResponse.Data;

    // Náº¿u interceptor Ä‘Ă£ bĂ³c rá»“i, tráº£ vá» nguyĂªn
    return apiResponse;
}

/**
 * Láº¥y message lá»—i tá»« ApiResponse
 * @param {object} apiResponse
 * @returns {string}
 */
export function unwrapError(apiResponse) {
    return (
        apiResponse?.message ??
        apiResponse?.Message ??
        "ÄĂ£ xáº£y ra lá»—i"
    );
}

/**
 * Kiá»ƒm tra request cĂ³ thĂ nh cĂ´ng khĂ´ng
 * @param {object} apiResponse
 * @returns {boolean}
 */
export function isSuccess(apiResponse) {
    return apiResponse?.success === true || apiResponse?.Success === true;
}

