import React, { useReducer } from 'react';
import { ActionTypes, QueryHookReturnType, RequestStateType } from '../types';
import { makeRequest } from '../apifunctions';
import { concatenateParamsWithUrl } from '../helpers/misc';

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

export function useQuery(url: string, params: Record<string, string>): QueryHookReturnType {
    const [state, dispatch] = useReducer<(state: RequestStateType, action: { type: ActionTypes, payload?: unknown }) => any>(reducer, initState);

    const trigger = async () => {
        try {
            dispatch({ type: 'reset-data' });
            dispatch({ type: 'reset-error' });
            dispatch({ type: 'loading-start' });
            const response = await makeRequest(concatenateParamsWithUrl(url, params));
            dispatch({ type: 'update-data', payload: response })
        }
        catch (error) {
            dispatch({ type: 'update-error', payload: error })
        } finally {
            dispatch({ type: 'loading-stop' })
        }
    }

    return [trigger, {
        data: state.data,
        isLoading: state.isLoading,
        error: state.error,
        isSuccess: state.isSuccess,
    }];
}