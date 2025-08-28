import React, { useCallback, useReducer, useRef, useMemo } from "react";
import { deleteId } from "../helpers/misc";
import initStoreState from "../lib/states/store";
import { IOptions, StoreActionType, StoreStateType } from "../types";

// Enhanced action types for better store management
export type EnhancedStoreAction = 
  | { type: "store/save"; payload: { id: string; data: unknown; options?: IOptions<any, any> } }
  | { type: "store/clear"; payload: { id: string } }
  | { type: "store/update"; payload: { id: string; data: Partial<unknown>; options?: IOptions<any, any> } }
  | { type: "store/clearAll"; payload?: {} }
  | { type: "store/batch"; payload: { operations: EnhancedStoreAction[] } };

// Store event types for enhanced listening
export type StoreEvent = {
  type: 'change' | 'save' | 'clear' | 'update' | 'batch';
  payload: {
    id?: string;
    data?: unknown;
    previousData?: unknown;
    timestamp: number;
  };
};

// Middleware function type
export type StoreMiddleware = (
  action: EnhancedStoreAction,
  state: StoreStateType,
  next: (action: EnhancedStoreAction) => void
) => void;

// Selector function type
export type StoreSelector<T = unknown> = (state: StoreStateType) => T;

// Subscription options
export interface SubscriptionOptions {
  immediate?: boolean;
  selector?: StoreSelector;
  equalityFn?: (a: any, b: any) => boolean;
}

// Enhanced store reducer with better error handling and logging
function storeReducer(
  state: StoreStateType,
  action: EnhancedStoreAction
): StoreStateType {
  try {
    switch (action.type) {
      case "store/save":
        return {
          ...state,
          [action.payload.id]: action.payload.data,
        };
      
      case "store/clear":
        const currentState = { ...state };
        return deleteId(currentState, action.payload.id);
      
      case "store/update":
        const existingData = state[action.payload.id];
        if (existingData && typeof existingData === 'object' && typeof action.payload.data === 'object') {
          return {
            ...state,
            [action.payload.id]: { ...existingData, ...action.payload.data },
          };
        }
        // Fallback to replace if not mergeable
        return {
          ...state,
          [action.payload.id]: action.payload.data,
        };
      
      case "store/clearAll":
        return {};
      
      case "store/batch":
        return action.payload.operations.reduce(
          (currentState, operation) => storeReducer(currentState, operation),
          state
        );
      
      default:
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Unknown store action type: ${(action as any).type}`);
        }
        return state;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Store reducer error:', error, 'Action:', action);
    }
    return state; // Return current state on error
  }
}

// Enhanced store implementation with middleware, persistence, and debugging
const store = (() => {
  let state = initStoreState;
  let listeners: Array<{
    callback: (event: StoreEvent) => void;
    options?: SubscriptionOptions;
    lastValue?: any;
  }> = [];
  let middlewares: StoreMiddleware[] = [];
  let isDispatching = false;
  let actionHistory: Array<{ action: EnhancedStoreAction; timestamp: number; state: StoreStateType }> = [];
  const maxHistorySize = 50;

  // DevTools integration (if available)
  const devTools = typeof window !== 'undefined' && 
    (window as any).__REDUX_DEVTOOLS_EXTENSION__;

  const getState = (): StoreStateType => state;

  const getHistory = () => actionHistory;

  const dispatch = (action: EnhancedStoreAction) => {
    if (isDispatching) {
      throw new Error('Cannot dispatch action while reducing');
    }

    try {
      isDispatching = true;
      const previousState = state;
      
      // Apply middlewares
      let currentIndex = 0;
      const next = (actionToDispatch: EnhancedStoreAction) => {
        if (currentIndex < middlewares.length) {
          const middleware = middlewares[currentIndex++];
          middleware(actionToDispatch, state, next);
        } else {
          // Final reducer call
          state = storeReducer(state, actionToDispatch);
          
          // Add to history
          actionHistory.push({
            action: actionToDispatch,
            timestamp: Date.now(),
            state: { ...state }
          });
          
          // Maintain history size
          if (actionHistory.length > maxHistorySize) {
            actionHistory.shift();
          }

          // DevTools integration
          if (devTools) {
            devTools.send(actionToDispatch, state);
          }

          // Create store event with proper type checking
          const getEventPayload = (action: EnhancedStoreAction) => {
            const basePayload = {
              timestamp: Date.now(),
            };

            switch (action.type) {
              case 'store/save':
              case 'store/update':
                return {
                  ...basePayload,
                  id: action.payload.id,
                  data: action.payload.data,
                  previousData: previousState[action.payload.id],
                };
              case 'store/clear':
                return {
                  ...basePayload,
                  id: action.payload.id,
                  previousData: previousState[action.payload.id],
                };
              case 'store/clearAll':
                return {
                  ...basePayload,
                  previousData: previousState,
                };
              case 'store/batch':
                return {
                  ...basePayload,
                  data: action.payload.operations,
                };
              default:
                return basePayload;
            }
          };

          const storeEvent: StoreEvent = {
            type: actionToDispatch.type.split('/')[1] as StoreEvent['type'],
            payload: getEventPayload(actionToDispatch)
          };

          // Notify listeners with optimized updates
          listeners.forEach(({ callback, options, lastValue }, index) => {
            try {
              if (options?.selector) {
                const newValue = options.selector(state);
                const hasChanged = options.equalityFn 
                  ? !options.equalityFn(lastValue, newValue)
                  : lastValue !== newValue;
                
                if (hasChanged || options.immediate) {
                  listeners[index].lastValue = newValue;
                  callback(storeEvent);
                }
              } else {
                callback(storeEvent);
              }
            } catch (error) {
              if (process.env.NODE_ENV !== 'production') {
                console.error('Listener error:', error);
              }
            }
          });
        }
      };

      next(action);
    } finally {
      isDispatching = false;
    }
  };

  const subscribe = (
    listener: (event: StoreEvent) => void, 
    options?: SubscriptionOptions
  ) => {
    const listenerObject = {
      callback: listener,
      options,
      lastValue: options?.selector ? options.selector(state) : undefined
    };
    
    listeners.push(listenerObject);

    // Call immediately if requested
    if (options?.immediate) {
      try {
        listener({
          type: 'change',
          payload: {
            timestamp: Date.now(),
          }
        });
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Initial listener call error:', error);
        }
      }
    }

    // Return unsubscribe function
    return () => {
      listeners = listeners.filter((l) => l !== listenerObject);
    };
  };

  const addMiddleware = (middleware: StoreMiddleware) => {
    middlewares.push(middleware);
  };

  const removeMiddleware = (middleware: StoreMiddleware) => {
    middlewares = middlewares.filter(m => m !== middleware);
  };

  const clearHistory = () => {
    actionHistory = [];
  };

  // Persistence helpers
  const saveToStorage = (key: string = 'rest-api-kit-store') => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(state));
        return true;
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to save store to localStorage:', error);
      }
    }
    return false;
  };

  const loadFromStorage = (key: string = 'rest-api-kit-store') => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const stored = localStorage.getItem(key);
        if (stored) {
          state = JSON.parse(stored);
          return true;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to load store from localStorage:', error);
      }
    }
    return false;
  };

  // Initialize DevTools
  if (devTools) {
    devTools.init(state);
  }

  return {
    getState,
    getHistory,
    dispatch,
    subscribe,
    addMiddleware,
    removeMiddleware,
    clearHistory,
    saveToStorage,
    loadFromStorage,
  };
})();

// Enhanced store methods for direct usage
export const storeMethods = {
  save: (id: string, data: unknown, options?: IOptions<any, any>) =>
    store.dispatch({
      type: "store/save",
      payload: { id, data, options },
    }),
  
  update: (id: string, data: Partial<unknown>, options?: IOptions<any, any>) =>
    store.dispatch({
      type: "store/update",
      payload: { id, data, options },
    }),
  
  get: (id: string) => store.getState()[id],
  
  getAll: () => store.getState(),
  
  clear: (id: string) =>
    store.dispatch({
      type: "store/clear",
      payload: { id },
    }),
  
  clearAll: () =>
    store.dispatch({
      type: "store/clearAll",
      payload: {},
    }),
  
  batch: (operations: EnhancedStoreAction[]) =>
    store.dispatch({
      type: "store/batch",
      payload: { operations },
    }),
  
  // Advanced operations
  select: <T>(selector: StoreSelector<T>) => selector(store.getState()),
  
  subscribe: (listener: (event: StoreEvent) => void, options?: SubscriptionOptions) =>
    store.subscribe(listener, options),
  
  addMiddleware: store.addMiddleware,
  removeMiddleware: store.removeMiddleware,
  
  // Persistence
  saveToStorage: store.saveToStorage,
  loadFromStorage: store.loadFromStorage,
  
  // Debugging
  getHistory: store.getHistory,
  clearHistory: store.clearHistory,
};

// Enhanced useStore hook with comprehensive functionality
export function useStore<R = any, T = any>() {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const subscriptionRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  // Subscribe to the store and trigger re-render only when necessary
  React.useEffect(() => {
    isMountedRef.current = true;
    
    const unsubscribe = store.subscribe((event: StoreEvent) => {
      // Only update if component is still mounted
      if (isMountedRef.current) {
        forceUpdate();
      }
    });
    
    subscriptionRef.current = unsubscribe;
    
    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current();
        subscriptionRef.current = null;
      }
    };
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const save = useCallback(
    (id: string, data: unknown, options?: IOptions<any, any>) => {
      store.dispatch({
        type: "store/save",
        payload: { id, data, options },
      });
    },
    []
  );

  const update = useCallback(
    (id: string, data: Partial<unknown>, options?: IOptions<any, any>) => {
      store.dispatch({
        type: "store/update",
        payload: { id, data, options },
      });
    },
    []
  );

  const get = useCallback((id: string) => {
    return store.getState()[id];
  }, []);

  const clear = useCallback((id: string) => {
    store.dispatch({
      type: "store/clear",
      payload: { id },
    });
  }, []);

  const clearAll = useCallback(() => {
    store.dispatch({
      type: "store/clearAll",
      payload: {},
    });
  }, []);

  const batch = useCallback((operations: EnhancedStoreAction[]) => {
    store.dispatch({
      type: "store/batch",
      payload: { operations },
    });
  }, []);

  // Advanced selector with memoization
  const select = useCallback(<TSelected>(
    selector: StoreSelector<TSelected>,
    equalityFn?: (a: TSelected, b: TSelected) => boolean
  ): TSelected => {
    return selector(store.getState());
  }, []);

  // Selective subscription
  const subscribe = useCallback((
    listener: (event: StoreEvent) => void,
    options?: SubscriptionOptions
  ) => {
    return store.subscribe(listener, options);
  }, []);

  // Persistence methods
  const saveToStorage = useCallback((key?: string) => {
    return store.saveToStorage(key);
  }, []);

  const loadFromStorage = useCallback((key?: string) => {
    return store.loadFromStorage(key);
  }, []);

  return useMemo(
    () => ({
      // Basic operations
      save,
      update,
      get,
      clear,
      clearAll,
      batch,
      getAll: store.getState,
      
      // Advanced operations
      select,
      subscribe,
      
      // Persistence
      saveToStorage,
      loadFromStorage,
      
      // Middleware
      addMiddleware: store.addMiddleware,
      removeMiddleware: store.removeMiddleware,
      
      // Debugging and dev tools
      getHistory: store.getHistory,
      clearHistory: store.clearHistory,
      
      // Store state helpers
      isEmpty: () => Object.keys(store.getState()).length === 0,
      size: () => Object.keys(store.getState()).length,
      has: (id: string) => id in store.getState(),
      keys: () => Object.keys(store.getState()),
      values: () => Object.values(store.getState()),
      entries: () => Object.entries(store.getState()),
    }),
    [save, update, get, clear, clearAll, batch, select, subscribe, saveToStorage, loadFromStorage]
  );
}

// Utility hook for selective store updates
export function useStoreSelector<T>(
  selector: StoreSelector<T>,
  equalityFn?: (a: T, b: T) => boolean
): T {
  const [selectedState, setSelectedState] = React.useState(() => selector(store.getState()));
  const isMountedRef = useRef(true);

  React.useEffect(() => {
    isMountedRef.current = true;
    
    const unsubscribe = store.subscribe(
      () => {
        if (isMountedRef.current) {
          const newState = selector(store.getState());
          setSelectedState(prevState => {
            const hasChanged = equalityFn ? !equalityFn(prevState, newState) : prevState !== newState;
            return hasChanged ? newState : prevState;
          });
        }
      },
      { selector, equalityFn }
    );

    return () => {
      isMountedRef.current = false;
      unsubscribe();
    };
  }, [selector, equalityFn]);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return selectedState;
}

// Hook for store events
export function useStoreEvents(
  listener: (event: StoreEvent) => void,
  options?: SubscriptionOptions
) {
  React.useEffect(() => {
    const unsubscribe = store.subscribe(listener, options);
    return unsubscribe;
  }, [listener, options]);
}
