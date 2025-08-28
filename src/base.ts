import { defaultOptions } from "./defaullts";
import { capitalizeFirstLetter } from "./helpers/misc";
import { useRest } from "./hooks";
import {
  CompleteEndpointFix,
  CompleteEndpointType,
  EndpointBuilder,
  EndpointType,
  IOptions,
  QueryHookReturnType,
  RestBaseReturnType,
  RestOptionsType,
} from "./types";

export const createRestBase = (
  restBaseOptions: Partial<RestOptionsType> = {}
): RestBaseReturnType => {
  let endpoints: { [x: string]: CompleteEndpointType<any, any> } = {};
  let hooks: Record<string, () => QueryHookReturnType> = {};
  let isInitialized = false;

  function build<U, V>(
    endpoint: EndpointType<U, V>
  ): CompleteEndpointType<U, V> {
    const params: IOptions<U, V> = { ...defaultOptions, ...endpoint.params };
    return { ...endpoint, params };
  }

  function createCustomHooks<T extends CompleteEndpointFix>(
    endpoints: T
  ): Record<string, () => QueryHookReturnType> {
    const customHooks: Record<string, () => QueryHookReturnType> = {};

    for (const [
      endpointName,
      { url, params = defaultOptions },
    ] of Object.entries(endpoints)) {
      const hookName = `use${capitalizeFirstLetter(endpointName)}`;
      
      // Create a closure that captures the endpoint configuration
      customHooks[hookName] = (() => {
        // Memoize the useRest call configuration
        const memoizedConfig = {
          url,
          params: { ...params, endpointName: endpointName.toLowerCase() },
          restBaseOptions
        };
        
        return () => useRest(
          memoizedConfig.url,
          memoizedConfig.params,
          memoizedConfig.restBaseOptions
        );
      })();
    }

    return customHooks;
  }

  const setEndpoints = (x: Record<string, CompleteEndpointType<any, any>>) => {
    endpoints = x;
  };

  const createEndpoints = <T extends CompleteEndpointFix>(
    callback: (builder: EndpointBuilder) => T
  ): RestBaseReturnType<T> => {
    // Only initialize once per app lifecycle
    if (!isInitialized) {
      const builtEndpoints = callback(build);
      setEndpoints(builtEndpoints);
      hooks = createCustomHooks(builtEndpoints);
      isInitialized = true;
    } else {
      console.warn(
        'rest-api-kit: createEndpoints called multiple times. ' +
        'Endpoints should be created once at app initialization. ' +
        'Using previously initialized endpoints.'
      );
    }

    // Create a new API instance with the hooks attached
    const apiWithHooks = {
      createEndpoints,
      endpoints,
      ...hooks,
    } as RestBaseReturnType<T>;

    return apiWithHooks;
  };

  return {
    createEndpoints,
    endpoints,
  } as RestBaseReturnType;
};

// Usage examples - Initialize ONCE at app startup:
// const token = `abcdefghijklmnopqrstuvwxyz`;

// // ⚠️ IMPORTANT: Create this ONCE at the top level of your app
// // DO NOT call createEndpoints inside components or other functions
// const api = createRestBase({
//   baseUrl: "https://jsonplaceholder.typicode.com",
//   prepareHeaders: (headers) => {
//     if (token) {
//       headers.set("Authorization", `Bearer ${token}`);
//     }
//     return headers;
//   },
// }).createEndpoints((builder) => ({
//   login: builder<
//     // ✅ Response type - this types the 'data' property in hook state
//     {
//       completed: boolean;
//       userId: string;
//       id: number;
//       title: string;
//     },
//     // ✅ Request body type - this types the parameter for trigger function
//     { username: string; password: string }
//   >({
//     url: "/login",
//     params: {
//       method: "POST",
//       preferCacheValue: false,
//       saveToCache: true,
//       transformResponse: (data) => {
//         return data;
//       },
//     },
//   }),
//   getTodos: builder<
//     // ✅ Response type - data will be typed as this array
//     Array<{ id: number; title: string; completed: boolean }>,
//     // ✅ Request type - void means no parameters needed for trigger()
//     void
//   >({
//     url: "/todos",
//     params: {
//       method: "GET",
//       preferCacheValue: true,
//       saveToCache: true,
//       updates: [], // Clear cache for other endpoints when this succeeds
//     },
//   }),
//   createTodo: builder<
//     // ✅ Response type - data will be typed as this object
//     { id: number; title: string; completed: boolean },
//     // ✅ Request type - trigger() will expect this shape
//     { title: string; completed?: boolean }
//   >({
//     url: "/todos",
//     params: {
//       method: "POST",
//       preferCacheValue: false,
//       saveToCache: false,
//       updates: ["getTodos"], // Clear todos cache when creating new todo
//       transformResponse: (data, body) => {
//         return { ...data, locallyCreated: true };
//       },
//     },
//   }),
// }));

// // Export for use throughout your app
// export { api };

// Now you can use hooks anywhere in your components with full type safety:
// const [loginTrigger, loginState] = api.useLogin();
// // ✅ loginState.data is typed as { completed: boolean; userId: string; id: number; title: string } | undefined
// // ✅ loginTrigger expects { username: string; password: string }

// const [getTodosTrigger, todosState] = api.useGetTodos();
// // ✅ todosState.data is typed as Array<{ id: number; title: string; completed: boolean }> | undefined
// // ✅ getTodosTrigger expects no parameters (void)

// const [createTodoTrigger, createState] = api.useCreateTodo();
// // ✅ createState.data is typed as { id: number; title: string; completed: boolean } | undefined
// // ✅ createTodoTrigger expects { title: string; completed?: boolean }
