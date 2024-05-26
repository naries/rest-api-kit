import React, { useReducer } from 'react';
import { ActionTypes, QueryHookReturnType, RequestStateType, MethodType, RestOptionsType, IOptions, } from '../types';
import { makeRequest } from '../apifunctions';
import { clearMultipleIds, concatenateParamsWithUrl, createUniqueId, getBaseUrl } from '../helpers/misc';
import { useStore } from './useStore';

const initState: RequestStateType = {
    isLoading: false,
    data: undefined,
    error: undefined,
    isSuccess: false,
}

function reducer(state: RequestStateType, { type, payload }: {
    type: ActionTypes;
    payload?: unknown;
}) {
    switch (type) {
        case "loading-start":
            return { ...state, isLoading: true };
        case "loading-stop":
            return { ...state, isLoading: false };
        case "update-data":
            return { ...state, data: payload };
        case "update-error":
            return { ...state, error: payload };
        case "reset-data":
            return { ...state, data: undefined };
        case "reset-error":
            return { ...state, error: undefined };
        default:
            return "Unrecognized command";
    }
}

const defaultOptions: IOptions = {
    preferCachevalue: false,
    updates: [],
    method: 'GET',
    saveToCache: false
}

const defaultRestOptions: RestOptionsType = {
    baseUrl: "",
    headers: {
        "Content-Type": 'application/json'
    }
}

export function useRest(url: string, params: Partial<IOptions> = {}, options: Partial<RestOptionsType> = {}): QueryHookReturnType {
    const [state, dispatch] = useReducer<(state: RequestStateType, action: { type: ActionTypes, payload?: unknown }) => any>(reducer, initState);

    // store
    const { save: saveToStore, get: getFromStore, clear: clearFromStore } = useStore();

    const trigger = async (body: Record<string, string> = {}) => {
        try {
            url = getBaseUrl(url, options?.baseUrl); // redefine url
            let storeIdentifier = url;

            if (Object(params).hasOwnProperty("preferCachevalue") && params?.preferCachevalue) {
                let cachedResult = getFromStore(storeIdentifier);
                if (cachedResult) {
                    dispatch({ type: 'update-data', payload: cachedResult })
                    return;
                }
            }

            dispatch({ type: 'reset-data' });
            dispatch({ type: 'reset-error' });
            dispatch({ type: 'loading-start' });
            const response = await makeRequest(concatenateParamsWithUrl(url, body));
            dispatch({ type: 'update-data', payload: response })
            if (params?.saveToCache) {
                saveToStore(url, response, { ...defaultOptions, ...params });
            }
            if (Object(params).hasOwnProperty('updates')) {
                clearMultipleIds(params.updates, (id: string) => clearFromStore(id));
            }
        }
        catch (error) {
            dispatch({ type: 'update-error', payload: error })
        } finally {
            dispatch({ type: 'loading-stop' })
        }
    }

    return [trigger, state];
}