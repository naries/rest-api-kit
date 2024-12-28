import React, { useCallback, useReducer } from "react";
import { deleteId } from "../helpers/misc";
import initStoreState from "../lib/states/store";
import { IOptions, StoreActionType, StoreStateType } from "../types";

function storeReducer(
  state: StoreStateType,
  action: {
    type: StoreActionType;
    payload: { id: string; data: unknown; options?: IOptions<any, any> };
  }
): StoreStateType {
  switch (action.type) {
    case "store/save":
      return {
        ...state,
        [action.payload.id]: action.payload.data,
      };
    case "store/clear":
      let currentState = { ...state };
      return deleteId(currentState, action.payload.id);
    default:
      return state;
  }
}

const store = (() => {
  let state = initStoreState;
  let listeners: Function[] = [];

  const getState = (): StoreStateType => state;

  const dispatch = (action: {
    type: StoreActionType;
    payload: { id: string; data: unknown; options?: IOptions<any, any> };
  }) => {
    state = storeReducer(state, action);
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: Function) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };

  return {
    getState,
    dispatch,
    subscribe,
  };
})();

// export const storeMethods = {
//   save: (id: string, data: unknown, options: IOptions<any, any>) =>
//     store.dispatch({
//       type: "store/save",
//       payload: { id, data, options },
//     }),
//   get: (id: string) => {
//     return store.getState()[id]?.result;
//   },
//   getAll: () => store.getState(),
//   clear: (id: string) =>
//     store.dispatch({
//       type: "store/clear",
//       payload: { id, data: null },
//     }),
// };

// export function useStore<R = any, T = any>(): StoreHookReturnType<R, T> {
//   const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

//   React.useEffect(() => {
//     const unsubscribe = store.subscribe(() => {
//       forceUpdate();
//     });
//     return () => unsubscribe();
//   }, []);

//   return {
//     save: storeMethods.save,
//     get: storeMethods.get,
//     getAll: storeMethods.getAll,
//     clear: storeMethods.clear,
//   };
// }

export function useStore<R = any, T = any>() {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Subscribe to the store and trigger re-render only when necessary
  React.useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      forceUpdate();
    });
    return () => unsubscribe();
  }, []);

  const save = useCallback(
    (id: string, data: unknown, options: IOptions<any, any>) => {
      store.dispatch({
        type: "store/save",
        payload: { id, data, options },
      });
    },
    []
  );

  const get = useCallback((id: string) => {
    return store.getState()[id]?.result;
  }, []);

  const clear = useCallback((id: string) => {
    store.dispatch({
      type: "store/clear",
      payload: { id, data: null },
    });
  }, []);

  return React.useMemo(
    () => ({
      save,
      get,
      getAll: store.getState,
      clear,
    }),
    [save, get, clear]
  );
}
