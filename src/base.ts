import { capitalizeFirstLetter } from "./helpers/misc";
import { useRest } from "./hooks"
import { BuildCallBackType, EndpointBuilder, EndpointType, QueryHookReturnType, RestBaseReturnType, RestOptionsType } from "./types";

export const createRestBase = (restBaseOptions: Partial<RestOptionsType> = {}): RestBaseReturnType => {
    let endpoints: Record<string, EndpointType<any, any>> = {};

    const build = <U, V>(endpoint: EndpointType<U, V>): EndpointType<U, V> => {
        return endpoint;
    };

    const createCustomHooks = () => {
        const customHooks: Record<string, () => QueryHookReturnType> = {};

        for (const [endpointName, { url, params }] of Object.entries(endpoints)) {
            customHooks[`use${capitalizeFirstLetter(endpointName)}`] = () =>
                useRest(url, { ...params, endpointName: endpointName.toLowerCase() }, restBaseOptions);
        }

        return customHooks;
    };

    const setEndpoints = (x: Record<string, EndpointType<any, any>>) => {
        endpoints = x;
    };

    const createEndpoints = (callback: BuildCallBackType) => {
        const builtEndpoints = callback(build);
        setEndpoints(builtEndpoints);

        return { ...createCustomHooks() };
    };

    return {
        createEndpoints,
        endpoints
    };
};

/*
const api = createRestBase({ baseUrl: "" });

const injector = api.createEndpoints((builder) => ({
    login: builder<{
        completed: boolean;
        userId: string;
        id: number;
        title: string;
    }, void>({
        url: "",
        params: {
            method: "GET",
            preferCachevalue: true,
            saveToCache: true,
            transformResponse: (data) => {
                return data;
            }
        }
    }),
    loginPath: builder({
        url: "",
        params: {}
    }),
}));
*/