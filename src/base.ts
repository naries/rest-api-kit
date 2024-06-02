import { capitalizeFirstLetter } from "./helpers/misc";
import { useRest } from "./hooks"
import { CompleteEndpointFix, CompleteEndpointType, EndpointBuilder, EndpointFix, EndpointType, IOptions, QueryHookReturnType, RestBaseReturnType, RestOptionsType } from "./types";


// default options that useRest takes by default.
export const defaultOptions: IOptions<any, any> = {
    preferCacheValue: false,
    updates: [],
    method: 'GET',
    saveToCache: false,
    endpointName: "",
    transformResponse: (data) => data,
    successCondition: () => true,
    headers: {
        "Content-Type": "application/json"
    }
}


export const createRestBase = (restBaseOptions: Partial<RestOptionsType> = {}): RestBaseReturnType => {
    let endpoints: { [x: string]: CompleteEndpointType<any, any> } = {};

    function build<U, V>(endpoint: EndpointType<U, V>): CompleteEndpointType<U, V> {
        // here's where we can specify other parameters that we need to specify for an endpoint
        // more like an engine set to work on the endpoint and returns an object
        const params: IOptions<U, V> = { ...defaultOptions, ...endpoint.params }
        return { ...endpoint, params };
    };

    function createCustomHooks<T extends CompleteEndpointFix>(endpoints: T): Record<`use${string & Capitalize<keyof T extends string ? keyof T : never>}`, () => QueryHookReturnType> {
        const customHooks: Record<string, () => QueryHookReturnType> = {};

        for (const [endpointName, { url, params }] of Object.entries(endpoints)) {
            customHooks[`use${capitalizeFirstLetter(endpointName)}`] = () =>
                useRest(url, { ...params, endpointName: endpointName.toLowerCase() }, restBaseOptions);
        }

        return customHooks;
    };

    const setEndpoints = (x: Record<string, CompleteEndpointType<any, any>>) => {
        endpoints = x;
    };

    const createEndpoints = <T extends CompleteEndpointFix>(callback: (builder: EndpointBuilder) => T): Record<`use${string & Capitalize<keyof T extends string ? keyof T : never>}`, () => QueryHookReturnType> => {
        const builtEndpoints = callback(build); // to use callback, it takes a function build
        setEndpoints(builtEndpoints);

        return { ...createCustomHooks(builtEndpoints) };
    };

    return {
        createEndpoints,
        endpoints
    };
};

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