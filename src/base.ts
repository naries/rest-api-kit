import { defaultOptions } from './defaullts';
import { capitalizeFirstLetter } from './helpers/misc';
import { useRest } from './hooks';
import {
  CompleteEndpointFix,
  CompleteEndpointType,
  EndpointBuilder,
  EndpointType,
  IOptions,
  QueryHookReturnType,
  RestBaseReturnType,
  RestOptionsType,
} from './types';

export const createRestBase = (
  restBaseOptions: Partial<RestOptionsType> = {}
): RestBaseReturnType => {
  // Each createRestBase instance has its own state
  let allEndpoints: { [x: string]: CompleteEndpointType<any, any> } = {};
  let allHooks: Record<string, () => QueryHookReturnType> = {};

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
      const memoizedConfig = {
        url,
        params: { ...params, endpointName: endpointName.toLowerCase() },
        restBaseOptions,
      };

      // Return the hook function directly
      customHooks[hookName] = () =>
        useRest(
          memoizedConfig.url,
          memoizedConfig.params,
          memoizedConfig.restBaseOptions
        );
    }

    return customHooks;
  }

  const createEndpoints = <T extends CompleteEndpointFix>(
    callback: (builder: EndpointBuilder) => T
  ): RestBaseReturnType<T> => {
    // Build the new endpoints
    const builtEndpoints = callback(build);

    // Check for duplicate endpoint names
    const newEndpointNames = Object.keys(builtEndpoints);
    const existingEndpointNames = Object.keys(allEndpoints);
    const duplicates = newEndpointNames.filter(name =>
      existingEndpointNames.includes(name)
    );

    if (duplicates.length > 0) {
      console.warn(
        `rest-api-kit: Duplicate endpoint names detected: ${duplicates.join(', ')}. ` +
          'The new endpoints will override the previous ones.'
      );
    }

    // Merge new endpoints with existing ones
    allEndpoints = { ...allEndpoints, ...builtEndpoints };

    // Create hooks for the new endpoints and merge with existing hooks
    const newHooks = createCustomHooks(builtEndpoints);
    allHooks = { ...allHooks, ...newHooks };

    // Return a new object with all accumulated hooks
    const apiWithHooks = {
      createEndpoints,
      endpoints: allEndpoints,
      ...allHooks,
    } as RestBaseReturnType<T>;

    return apiWithHooks;
  };

  return {
    createEndpoints,
    endpoints: allEndpoints,
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
