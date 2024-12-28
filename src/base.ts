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

  function build<U, V>(
    endpoint: EndpointType<U, V>
  ): CompleteEndpointType<U, V> {
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
        useRest(
          url,
          { ...params, endpointName: endpointName.toLowerCase() },
          restBaseOptions
        );
    }

    return customHooks;
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
    const builtEndpoints = callback(build);
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
