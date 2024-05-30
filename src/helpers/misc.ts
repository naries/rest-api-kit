import { ActionTypes, IOptions, RestOptionsType, StoreStateType } from "../types";

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


export const clearMultipleIds = (arrayOfIds: string[] = [], baseUrl: string, callback: (id: string) => void) => {
    if (arrayOfIds.length === 0) {
        return;
    }

    arrayOfIds.map((endpointName: string) => {
        callback(`${baseUrl}&${endpointName}`);
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


export const getBaseUrl = (url: string, baseUrl?: string) => {
    // check if url and baseurl exists
    // if not throw an error;
    if (!url && !baseUrl) {
        throw new Error("url not constructed properly")
    }

    // check if url has a http or https value. 
    // In this case ignore baseurl
    // if not, merge the base url with the url.
    // further optimization will be to remove extra slashes
    // in an event where the base urt is provided with an ending
    // slash and the url is provided with a preceeding slash
    // or both arent.
    if (!/^http(s)?\:\/\//.test(url)) {
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

export const applyChecks = (params: IOptions, response: unknown) => {
    // check if there is a success condition
    if (!params.successCondition(response)) {
        return { type: "error", response };
    }

    // check if user is transforming the response
    return {
        type: 'success', response: params.transformResponse(response)
    };
}

export const load = (dispatch: React.Dispatch<{
    type: ActionTypes;
    payload?: unknown;
}>, url: string, params: Partial<IOptions & RestOptionsType>, body: Record<string, string>) => {
    // load extras into reducer state
    // extra contains the url, baseurl, body, 
    const paramForHere = { ...params };
    // delete function properties, we don't wnat
    // having access to functions in a state
    delete paramForHere.successCondition;
    delete paramForHere.transformResponse;

    dispatch({
        type: 'extra/save', payload: {
            url,
            body,
            isFired: true,
            ...params
        }
    })
}