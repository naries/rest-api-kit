import { useReducer } from "react";
import { IOptions, StoreActionType, StoreHookReturnType, StoreStateType } from "../types";
import { deleteId } from "../helpers/misc";

const initState: StoreStateType = {
    store: {}
}

function reducer(state: StoreStateType, { type, payload }: {
    type: StoreActionType;
    payload: {
        id: string, data: unknown, options?: IOptions
    };
}) {
    switch (type) {
        case "store/save":
            return { ...state, store: { ...state.store, [payload.id]: payload.data } };
        case "store/clear":
            let currentState = { ...state }
            return deleteId(currentState, payload.id);
        default:
            return "Unrecognized command";
    }
}

/**
 * @name useStore
 * @description A hook that provides access to a store for saving and retrieving data.
 * @returns An object containing functions for saving and retrieving data from the store.
 * @returns { save }: A function that saves data to the store. Takes two parameters: id (string) and data (unknown). Returns void.
 * @returns { get }: A function that retrieves data from the store based on the provided id. Takes one parameter: id (string). Returns the data associated with the id.
 * @returns { clear }: A function that clears data from the store based on the provided id. Takes one parameter: id (string)
 */

export function useStore(): StoreHookReturnType {
    const [state, dispatch] = useReducer<(state: StoreStateType, action: { type: StoreActionType, payload: { id: string, data: unknown, options?: IOptions } }) => any>(reducer, initState);

    return {
        save: (id: string, data: unknown, options: IOptions) => dispatch({
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