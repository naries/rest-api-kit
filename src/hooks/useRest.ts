import React, { useReducer } from 'react';
import { ActionTypes, QueryHookReturnType, RequestStateType, MethodType, RestOptionsType, IOptions, } from '../types';
import { makeRequest } from '../apifunctions';
import { applyChecks, clearMultipleIds, concatenateParamsWithUrl, createUniqueId, getBaseUrl, load } from '../helpers/misc';
import { useStore } from './useStore';
import restReducer from '../lib/reducers/rest';
import initRestState from '../lib/states/rest';

/**
 * @name useRest
 * @description A hook that takes charge of making requests, saving the state where necessary.
 * and showing errors accordingly.
 * @returns An array containing a trigger functions which takes an argument of an object which serves as a body to the api request and a state object.
 * @returns { trigger }: A function that saves data to the store. Takes two parameters: id (string) and data (unknown). Returns void.
 * @returns { state }: An object that includes the state of the api request.
 */

export function useRest<R = any, T = any>(url: string, paramsFromBase: IOptions<any, any>, options: Partial<RestOptionsType> = {}): QueryHookReturnType {
    const [state, dispatch] = useReducer<(state: RequestStateType, action: { type: ActionTypes, payload?: unknown }) => any>(restReducer, initRestState);

    // store
    const { save: saveToStore, get: getFromStore, clear: clearFromStore } = useStore<R, T>();

    const trigger = async (body: Record<string, string> = {}) => {
        try {
            const params = { ...paramsFromBase }
            url = getBaseUrl(url, options?.baseUrl); // redefine url
            load(dispatch, url, params, body);
            let storeIdentifier = `${options.baseUrl || ""}&${params.endpointName}`;

            // if preferCacheValue is set and set to true, we want to prevent
            // making the actual api request so as to increase speed.
            // we check first if there is actually a entry in the store in
            // for that request and if there isn't, we make the request irrespective of
            // whether or not the preferCacheValue option is set and set to true.
            if (params.preferCacheValue) {
                let cachedResult = getFromStore(storeIdentifier);
                if (cachedResult) {
                    const { type: checkType, response: payload } = applyChecks(params, cachedResult);
                    if (checkType === "error") {
                        dispatch({
                            type: 'data/error', payload
                        })
                        return;
                    }
                    dispatch({
                        type: 'data/success', payload
                    })
                }
            }
            dispatch({ type: 'data/reset' });
            dispatch({ type: 'error/reset' });
            dispatch({ type: 'loading/start' });
            const response = await makeRequest(concatenateParamsWithUrl(url, body));
            // save response to cache if saveToCache option is set and is set to true;
            if (params.saveToCache) {
                saveToStore(storeIdentifier, response, { ...params });
            }
            // apply checks on response before sending to state
            const { type: checkType, response: payload } = applyChecks(params, response);
            // if error, send error to state
            if (checkType === "error") {
                dispatch({
                    type: 'data/error', payload
                })
                return;
            }
            //send the response into the state as response
            dispatch({
                type: 'response/save', payload: response
            })

            // send the success to the state
            dispatch({
                type: 'data/success', payload
            })


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