import { capitalizeFirstLetter } from "./helpers/misc";
import { useRest } from "./hooks"
import { BuildFunction, EndpointType, QueryHookReturnType, RestBaseReturnType, RestOptionsType } from "./types";

export const createRestBase = (restBaseOptions: Partial<RestOptionsType> = {}): RestBaseReturnType => {
    let endpoints: { [key: string]: EndpointType } = {};

    const build: BuildFunction = (endpoint) => {
        return endpoint as EndpointType;
    }

    const createCustomHooks = () => {
        const customHooks: { [key: string]: () => QueryHookReturnType } = {};
        for (const endpointName in endpoints) {
            const { url, params } = endpoints[endpointName];
            customHooks[`use${capitalizeFirstLetter(endpointName)}`] = () => useRest(url, params, restBaseOptions);
        }
        return customHooks;
    };

    const setEndpoints = (x: { [key: string]: EndpointType }) => {
        endpoints = x;
    }

    const createEndpoints = (callback: (build: BuildFunction) => { [key: string]: EndpointType }) => {
        const builtEndpoints = callback(build);
        setEndpoints(builtEndpoints);

        return { ...createCustomHooks() };
    }

    return {
        createEndpoints,
        endpoints
    }
}

// const api = createRestBase({ baseUrl: "" });

// const injector = api.createEndpoints((builder) => ({
//     login: builder({
//         url: "",
//         params: {
//             method: "GET",
//             preferCachevalue: true,
//             saveToCache: true,
//         }
//     }),
//     loginPath: builder({
//         url: "",
//         params: {
//             login: "login",
//         }
//     }),
// }));