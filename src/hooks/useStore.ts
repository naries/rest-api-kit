import { useReducer } from "react";
import { IOptions, StoreActionType, StoreHookReturnType, StoreStateType } from "../types";
import { deleteId } from "../helpers/misc";
import storeReducer from "../lib/reducers/store";
import initStoreState from "../lib/states/store";

/**
 * @name useStore
 * @description A hook that provides access to a store for saving and retrieving data.
 * @returns An object containing functions for saving and retrieving data from the store.
 * @returns { save }: A function that saves data to the store. Takes two parameters: id (string) and data (unknown). Returns void.
 * @returns { get }: A function that retrieves data from the store based on the provided id. Takes one parameter: id (string). Returns the data associated with the id.
 * @returns { clear }: A function that clears data from the store based on the provided id. Takes one parameter: id (string)
 */

export function useStore<R = any, T = any>(): StoreHookReturnType<R, T> {
    const [state, dispatch] = useReducer<(state: StoreStateType, action: { type: StoreActionType, payload: { id: string, data: unknown, options?: IOptions<R, T> } }) => any>(storeReducer, initStoreState);

    console.log("store state => ", state);

    return {
        save: (id: string, data: unknown, options: IOptions<R, T>) => dispatch({
            type: "store/save",
            payload: { id, data, options }
        }),
        get: (id: string) => {
            return state.store[id]?.result;
        },
        clear: (id: string) => dispatch({
            type: "store/clear",
            payload: { id, data: null }
        })
    }
}