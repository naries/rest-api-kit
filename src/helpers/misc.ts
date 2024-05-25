export const concatenateParamsWithUrl = (url: string, params?: Record<string, string | number>) => {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }
    const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    return `${url}?${queryString}`;
}