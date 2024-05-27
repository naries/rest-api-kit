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
        case "loading/start":
            return { ...state, isLoading: true };
        case "loading/stop":
            return { ...state, isLoading: false };
        case "data/success":
            return { ...state, data: payload, isSuccess: true };
        case "data/error":
            return { ...state, error: payload, isSuccess: false };
        case "data/reset":
            return { ...state, data: undefined };
        case "error/reset":
            return { ...state, error: undefined };
        default:
            return "Unrecognized command";
    }
}

const defaultOptions: IOptions = {
    preferCachevalue: false,
    updates: [],
    method: 'GET',
    saveToCache: false,
    endpointName: "",
    transformResponse: (data) => data,
    successCondition: (data) => true,
}

const defaultRestOptions: RestOptionsType = {
    baseUrl: "",
    headers: {
        "Content-Type": 'application/json'
    }
}

const applyChecks = (params: IOptions, dispatch: React.Dispatch<{
    type: ActionTypes;
    payload?: unknown;
}>, response: unknown) => {
    // check if there is a success condition
    if (params.successCondition(response)) {
        dispatch({ type: 'data/error', payload: response })
    }

    // check if user is transforming the resposne
    return params.transformResponse(response);
}

export function useRest(url: string, params: Partial<IOptions> = {}, options: Partial<RestOptionsType> = {}): QueryHookReturnType {
    const [state, dispatch] = useReducer<(state: RequestStateType, action: { type: ActionTypes, payload?: unknown }) => any>(reducer, initState);

    // store
    const { save: saveToStore, get: getFromStore, clear: clearFromStore } = useStore();

    const trigger = async (body: Record<string, string> = {}) => {
        try {
            const allParams = { ...defaultOptions, params }
            url = getBaseUrl(url, options?.baseUrl); // redefine url
            let storeIdentifier = `${options.baseUrl || ""}&${params.endpointName}`;

            if (Object(params).hasOwnProperty("preferCachevalue")) {
                let cachedResult = getFromStore(storeIdentifier);
                if (cachedResult) {
                    applyChecks(allParams, dispatch, cachedResult);
                    return;
                }
            }

            dispatch({ type: 'data/reset' });
            dispatch({ type: 'error/reset' });
            dispatch({ type: 'loading/start' });
            const response = await makeRequest(concatenateParamsWithUrl(url, body));

            dispatch({ type: 'data/success', payload: applyChecks(allParams, dispatch, response) })

            if (params?.saveToCache) {
                saveToStore(storeIdentifier, response, { ...defaultOptions, ...params });
            }
            if (Object(params).hasOwnProperty('updates')) {
                clearMultipleIds(params.updates, options.baseUrl || "", (id: string) => clearFromStore(id));
            }
        } catch (error) {
            dispatch({ type: 'data/error', payload: error })
        } finally {
            dispatch({ type: 'loading/stop' })
        }
    }

    return [trigger, state];
}