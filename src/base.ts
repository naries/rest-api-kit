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

// default options that useRest takes by default.
export const defaultOptions: IOptions<any, any> = {
  preferCacheValue: false,
  updates: [],
  method: "GET",
  saveToCache: false,
  endpointName: "",
  transformResponse: (data) => data,
  successCondition: () => true,
  bodyAsQueryParams: false,
  headers: {},
};

export const createRestBase = (
  restBaseOptions: Partial<RestOptionsType> = {}
): RestBaseReturnType => {
  let endpoints: { [x: string]: CompleteEndpointType<any, any> } = {};

  function build<U, V>(
    endpoint: EndpointType<U, V>
  ): CompleteEndpointType<U, V> {
    // here's where we can specify other parameters that we need to specify for an endpoint
    // more like an engine set to work on the endpoint and returns an object
    const params: IOptions<U, V> = { ...defaultOptions, ...endpoint.params };
    return { ...endpoint, params };
  }

  function createCustomHooks<T extends CompleteEndpointFix>(
    endpoints: T
  ): Record<
    `use${string & Capitalize<keyof T extends string ? keyof T : never>}`,
    () => QueryHookReturnType
  > {
    const customHooks: Record<string, () => QueryHookReturnType> = {};

    for (const [
      endpointName,
      { url, params = defaultOptions },
    ] of Object.entries(endpoints)) {
      customHooks[`use${capitalizeFirstLetter(endpointName)}`] = () =>
        // design flaw here. It makes the items preloaded. prevents rebuilding the headers.
        useRest(
          url,
          { ...params, endpointName: endpointName.toLowerCase() },
          restBaseOptions
        );
    }

    return customHooks; // for names basically
  }

  const setEndpoints = (x: Record<string, CompleteEndpointType<any, any>>) => {
    endpoints = x;
  };

  const createEndpoints = <T extends CompleteEndpointFix>(
    callback: (builder: EndpointBuilder) => T
  ): Record<
    `use${string & Capitalize<keyof T extends string ? keyof T : never>}`,
    () => QueryHookReturnType
  > => {
    const builtEndpoints = callback(build); // to use callback, it takes a function build
    setEndpoints(builtEndpoints);

    return { ...createCustomHooks(builtEndpoints) };
  };

  return {
    createEndpoints,
    endpoints,
  };
};

// usage examples.
// const token = `abcdefghijklmnopqrstuvwxyz`;

// const api = createRestBase({
//   baseUrl: "",
//   prepareHeaders: (headers) => {
//     if (token) {
//       headers.set("Authorization", `Bearer ${token}`);
//     }
//     return headers;
//   },
// });

// const injector = api.createEndpoints(
//   function (builder) {
//     return {
//       login: builder<
//         // this line contains what you need it.
//         {
//           completed: boolean;
//           userId: string;
//           id: number;
//           title: string;
//         },
//         void
//       >({
//         url: "",
//         params: {
//           method: "GET",
//           preferCacheValue: true,
//           saveToCache: true,
//           transformResponse: (data) => {
//             return data;
//           },
//         },
//       }),
//       loginPath: builder({
//         url: "",
//         params: {},
//       }),
//     };
//   } // this is the callback which takes the build arguement
// );

// const { useLogin, useLoginPath } = injector;
