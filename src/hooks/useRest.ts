import React, { useReducer } from "react";
import {
  ActionTypes,
  QueryHookReturnType,
  RequestStateType,
  MethodType,
  RestOptionsType,
  IOptions,
} from "../types";
import { makeRequest } from "../apifunctions";
import {
  applyChecks,
  clearMultipleIds,
  concatenateParamsWithUrl,
  createUniqueId,
  getBaseUrl,
  load,
} from "../helpers/misc";

import restReducer from "../lib/reducers/rest";
import initRestState from "../lib/states/rest";
import { useStore } from "./storeListener";

/**
 * @name useRest
 * @description A hook that takes charge of making requests, saving the state where necessary.
 * and showing errors accordingly.
 * @returns An array containing a trigger functions which takes an argument of an object which serves as a body to the api request and a state object.
 * @returns { trigger }: A function that saves data to the store. Takes two parameters: id (string) and data (unknown). Returns void.
 * @returns { state }: An object that includes the state of the api request.
 *
 * @format
 */

export function useRest<R = any, T = any>(
  url: string,
  paramsFromBase: IOptions<any, any>,
  options: Partial<RestOptionsType> = {}
): QueryHookReturnType {
  const [state, dispatch] = useReducer<
    (
      state: RequestStateType,
      action: { type: ActionTypes; payload?: unknown }
    ) => any
  >(restReducer, initRestState);

  // store
  const {
    save: saveToStore,
    get: getFromStore,
    clear: clearFromStore,
  } = useStore<R, T>();

  const trigger = async (body: string | Record<string, string> = {}) => {
    try {
      const params = { ...paramsFromBase };
      url = getBaseUrl(url, options?.baseUrl); // redefine url

      const formattedUrl =
        params.method === "GET"
          ? concatenateParamsWithUrl(url, body.toString())
          : url;

      load(dispatch, formattedUrl, params, body);
      let storeIdentifier = `${options.baseUrl || ""}&${params.endpointName}`;

      // Check if preferCacheValue is set to true,
      // prevent making the actual api request.
      // Check for entry in store for that request
      // Make the request if there's none.
      if (params.preferCacheValue) {
        let cachedResult = getFromStore(storeIdentifier);
        if (cachedResult) {
          const { type: checkType, response: payload } = applyChecks(
            params,
            cachedResult
          );
          if (checkType === "error") {
            dispatch({
              type: "data/error",
              payload,
            });
            return;
          }
          dispatch({
            type: "data/success",
            payload,
          });
        }
      }

      // prepare
      dispatch({ type: "data/reset" });
      dispatch({ type: "error/reset" });
      dispatch({ type: "loading/start" });

      // configure headers
      let headers = new Headers({ ...paramsFromBase?.headers });
      if (options?.prepareHeaders) {
        headers = options?.prepareHeaders(headers);
      }

      // make the request
      const response = await makeRequest(
        params.method === "GET"
          ? formattedUrl
          : {
              url: formattedUrl,
              body: body as Record<string, unknown>,
              headers,
              method: params.method,
            }
      );

      // if saveToCache option is set to true
      // save response to cache
      if (params.saveToCache) {
        saveToStore(storeIdentifier, response, { ...params });
      }

      // apply checks on response
      const { type: checkType, response: payload } = applyChecks(
        params,
        response
      );

      // if error, send error to state
      if (checkType === "error") {
        dispatch({
          type: "data/error",
          payload,
        });
        return;
      }

      // send the response to state
      dispatch({
        type: "response/save",
        payload: response,
      });

      // send the success to state
      dispatch({
        type: "data/success",
        payload,
      });

      if (params.updates.length > 0) {
        clearMultipleIds(params.updates, options.baseUrl || "", (id: string) =>
          clearFromStore(id)
        );
      }
    } catch (error) {
      dispatch({ type: "data/error", payload: error });
    } finally {
      dispatch({ type: "loading/stop" });
    }
  };

  return [trigger, state];
}
