import React, { useReducer } from 'react';
import { ActionTypes, QueryHookReturnType, RequestStateType, MethodType, RestOptionsType, IOptions, } from '../types';
import { makeRequest } from '../apifunctions';
import { applyChecks, clearMultipleIds, concatenateParamsWithUrl, createUniqueId, getBaseUrl, load } from '../helpers/misc';
import { useStore } from './useStore';
import restReducer from '../lib/reducers/rest';
import initRestState from '../lib/states/rest';

// default options that useRest takes by default.
const defaultOptions: IOptions = {
    preferCachevalue: false,
    updates: [],
    method: 'GET',
    saveToCache: false,
    endpointName: "",
    transformResponse: (data) => data,
    successCondition: (data) => true,
}

/**
 * @name useRest
 * @description A hook that takes charge of making requests, saving the state where necessary.
 * and showing errors accordingly.
 * @returns An array containing a trigger functions which takes an argument of an object which serves as a body to the api request and a state object.
 * @returns { trigger }: A function that saves data to the store. Takes two parameters: id (string) and data (unknown). Returns void.
 * @returns { state }: An object that includes the state of the api request.
 */

export function useRest(url: string, paramsFromBase: Partial<IOptions> = {}, options: Partial<RestOptionsType> = {}): QueryHookReturnType {
    const [state, dispatch] = useReducer<(state: RequestStateType, action: { type: ActionTypes, payload?: unknown }) => any>(restReducer, initRestState);

    // store
    const { save: saveToStore, get: getFromStore, clear: clearFromStore } = useStore();

    const trigger = async (body: Record<string, string> = {}) => {
        try {
            const params = { ...defaultOptions, ...paramsFromBase }
            url = getBaseUrl(url, options?.baseUrl); // redefine url
            load(dispatch, url, params, body);
            let storeIdentifier = `${options.baseUrl || ""}&${params.endpointName}`;

            if (params.preferCachevalue) {
                let cachedResult = getFromStore(storeIdentifier);
                if (cachedResult) {
                    applyChecks(params, dispatch, cachedResult);
                    return;
                }
            }

            dispatch({ type: 'data/reset' });
            dispatch({ type: 'error/reset' });
            dispatch({ type: 'loading/start' });
            const response = await makeRequest(concatenateParamsWithUrl(url, body));

            dispatch({ type: 'data/success', payload: applyChecks(params, dispatch, response) })

            if (params?.saveToCache) {
                saveToStore(storeIdentifier, response, { ...defaultOptions, ...params });
            }
            if (params.updates.length > 0) {
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