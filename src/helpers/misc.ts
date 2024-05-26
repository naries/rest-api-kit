import { StoreStateType } from "../types";

export const concatenateParamsWithUrl = (url: string, params?: Record<string, string | number>) => {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }
    const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    return `${url}?${queryString}`;
}

export const createUniqueId = (url: string, params?: Record<string, string | number>) => {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }
    const queryString = Object.entries(params)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join('&');

    return `${url}&${queryString}`;
}


export const clearMultipleIds = (arrayOfIds: string[] = [], callback: (id: string) => void) => {
    if (arrayOfIds.length === 0) {
        return;
    }
    arrayOfIds.map((cacheId: string) => {
        callback(cacheId);
        return null;
    })
}

// cache store function
export const deleteId = (state: StoreStateType, id: string) => {
    if (!Object(state.store).hasownProperty(id)) {
        return state;
    }
    delete state.store[id];
    return state;
}

export const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};


export const getBaseUrl = (url: string, baseUrl: string | undefined) => {
    if (!url && !baseUrl) {
        throw new Error("url not constructed properly")
    }

    if (!/^http(s)?:\/\//.test(url)) {
        if (baseUrl) {
            // check if url starts with a /
            if (/^\//.test(url)) {
                return baseUrl + url;
            } else {
                return `${baseUrl}/${url}`;
            }
        } else {
            throw new Error("url not constructed properly")
        }
    } else {
        return url;
    }
}