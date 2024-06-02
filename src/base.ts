import { capitalizeFirstLetter } from "./helpers/misc";
import { useRest } from "./hooks"
import { BuildCallBackType, EndpointBuilder, EndpointFix, EndpointType, QueryHookReturnType, RestBaseReturnType, RestOptionsType } from "./types";

export const createRestBase = (restBaseOptions: Partial<RestOptionsType> = {}): RestBaseReturnType => {
    let endpoints: { [x: string]: EndpointType<any, any> } = {};

    function build<U, V>(endpoint: EndpointType<U, V>): EndpointType<U, V> {
        // here's where we can specify other parameters that we need to specify for an endpoint
        // more like an engine set to work on the endpoint and returns an object

        return endpoint;
    };

    function createCustomHooks<T extends EndpointFix>(endpoints: T): Record<`use${string & Capitalize<keyof T extends string ? keyof T : never>}`, () => QueryHookReturnType> {
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

    const createEndpoints = <T extends EndpointFix>(callback: (builder: EndpointBuilder) => T): Record<`use${string & Capitalize<keyof T extends string ? keyof T : never>}`, () => QueryHookReturnType> => {
        const builtEndpoints = callback(build); // to use callback, it takes a function build
        setEndpoints(builtEndpoints);

        return { ...createCustomHooks(builtEndpoints) };
    };

    return {
        createEndpoints,
        endpoints
    };
};

/*
const api = createRestBase({ baseUrl: "" });


const injector = api.createEndpoints(
    function (builder) {
        return {
            login: builder<{
                completed: boolean;
                userId: string;
                id: number;
                title: string;
            }, void>({
                url: "",
                params: {
                    method: "GET",
                    preferCacheValue: true,
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
        }
    } // this is the callback which takes the build arguement
);

const { useLogin, useLoginPath } = injector
*/